const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const winston = require('winston');
const db = require('../models');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'pdf-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/pdf-service-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/pdf-service.log' })
  ]
});

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Extrait le texte d'un fichier PDF
 * @param {string} filePath - Chemin vers le fichier PDF
 * @returns {Promise<string>} - Texte extrait du PDF
 */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    logger.error(`Erreur lors de l'extraction du texte du PDF ${filePath}:`, error);
    throw new Error(`Impossible d'extraire le texte du PDF: ${error.message}`);
  }
}

/**
 * Analyse le contenu d'un PDF avec OpenAI pour extraire des mots-clés et calculer la pertinence
 * @param {string} text - Texte extrait du PDF
 * @param {string} filename - Nom du fichier PDF
 * @returns {Promise<Object>} - Résultat de l'analyse
 */
async function analyzePDFContent(text, filename) {
  try {
    // Rechercher directement les mentions de niveau d'urgence dans le texte
    let detectedRiskLevel = null;
    
    // Recherche de patterns comme "niveau d'urgence pour changement: Faible"
    const riskLevelPattern = /niveau\s+d['']urgence\s+pour\s+changement\s*:\s*(faible|normale|\u00e9lev\u00e9e)/i;
    const match = text.match(riskLevelPattern);
    
    if (match && match[1]) {
      // Normaliser la casse pour la cohérence
      const level = match[1].toLowerCase();
      if (level === 'faible') detectedRiskLevel = 'faible';
      else if (level === 'élevée' || level === 'elevee') detectedRiskLevel = 'élevée';
      else detectedRiskLevel = 'normale';
      
      logger.debug(`Niveau d'urgence détecté directement dans le document: ${detectedRiskLevel}`);
    }
    
    // Limiter la taille du texte pour éviter de dépasser les limites de l'API
    const truncatedText = text.slice(0, 4000);
    
    const prompt = `
    Analyse le contenu suivant extrait du document "${filename}" et réponds au format JSON avec:
    1. Une liste de mots-clés pertinents (maximum 10)
    2. Un score de pertinence entre 0 et 100 basé sur la richesse et la précision des informations techniques
    3. Une catégorisation du document (Technical, Procedure, Certification, Report, Guide)
    4. Une évaluation du niveau d'urgence pour changement ou maintenance basée sur le contenu
    
    IMPORTANT: 
    - Si tu trouves une mention explicite de "niveau d'urgence pour changement" suivi d'une valeur, utilise exactement cette valeur (faible, normale, élevée).
    - Si tu ne trouves pas de mention explicite, utilise la valeur "inconnue".
    
    Contenu du document:
    ${truncatedText}
    
    Format de réponse JSON:
    {
      "keywords": ["mot1", "mot2", ...],
      "relevance": 85,
      "category": "Technical",
      "riskLevel": "inconnue"
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es un assistant spécialisé dans l'analyse de documents techniques aéronautiques." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    
    // Extraire le JSON de la réponse
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      
      // Si nous avons détecté un niveau de risque directement dans le texte, l'utiliser
      if (detectedRiskLevel) {
        // Ignorer la casse lors de la comparaison
        if (result.riskLevel && result.riskLevel.toLowerCase() === detectedRiskLevel.toLowerCase()) {
          // Les valeurs sont identiques en ignorant la casse, utiliser la valeur normalisée
          result.riskLevel = detectedRiskLevel;
        } else {
          // Les valeurs sont différentes, remplacer et logger
          logger.debug(`Remplacement du niveau de risque '${result.riskLevel}' par la valeur détectée '${detectedRiskLevel}'`);
          result.riskLevel = detectedRiskLevel;
        }
      }
      
      return result;
    } else {
      throw new Error("Format de réponse invalide");
    }
  } catch (error) {
    logger.error(`Erreur lors de l'analyse du contenu avec OpenAI:`, error);
    // Tenter de détecter le niveau de risque même en cas d'erreur
    let fallbackRiskLevel = "inconnue";
    
    try {
      // Recherche de patterns comme "niveau d'urgence pour changement: Faible"
      const riskLevelPattern = /niveau\s+d['']urgence\s+pour\s+changement\s*:\s*(faible|normale|\u00e9lev\u00e9e)/i;
      const match = text.match(riskLevelPattern);
      
      if (match && match[1]) {
        // Normaliser la casse pour la cohérence
        const level = match[1].toLowerCase();
        if (level === 'faible') fallbackRiskLevel = 'faible';
        else if (level === 'élevée' || level === 'elevee') fallbackRiskLevel = 'élevée';
        
        logger.debug(`Niveau d'urgence détecté dans le fallback: ${fallbackRiskLevel}`);
      }
    } catch (innerError) {
      logger.error("Erreur lors de la détection de secours du niveau de risque:", innerError);
    }
    
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      keywords: ["erreur", "analyse", "document"],
      relevance: 50,
      category: "Unknown",
      riskLevel: fallbackRiskLevel
    };
  }
}

/**
 * Parcourt un répertoire pour trouver tous les fichiers PDF
 * @param {string} directory - Chemin du répertoire à parcourir
 * @returns {Array<string>} - Liste des chemins vers les fichiers PDF
 */
function findPDFFiles(directory) {
  try {
    const files = fs.readdirSync(directory);
    const pdfFiles = [];
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Récursion pour les sous-répertoires
        const subDirPdfFiles = findPDFFiles(filePath);
        pdfFiles.push(...subDirPdfFiles);
      } else if (path.extname(file).toLowerCase() === '.pdf') {
        pdfFiles.push(filePath);
      }
    });
    
    return pdfFiles;
  } catch (error) {
    logger.error(`Erreur lors de la recherche des fichiers PDF:`, error);
    throw new Error(`Impossible de parcourir le répertoire: ${error.message}`);
  }
}

/**
 * Analyse tous les PDF d'un répertoire
 * @param {string} directory - Chemin du répertoire contenant les PDF
 * @returns {Promise<Array<Object>>} - Résultats de l'analyse
 */
async function analyzeAllPDFs(directory) {
  try {
    const pdfFiles = findPDFFiles(directory);
    logger.info(`${pdfFiles.length} fichiers PDF trouvés dans ${directory}`);
    
    const results = [];
    let cacheHits = 0;
    let cacheUpdates = 0;
    
    for (const filePath of pdfFiles) {
      try {
        const fileName = path.basename(filePath);
        logger.info(`Traitement du fichier ${fileName}`);
        
        // Vérifier si le document est déjà en cache
        const cachedAnalysis = await checkAnalysisCache(filePath);
        
        if (cachedAnalysis) {
          // Utiliser l'analyse en cache
          logger.info(`Utilisation de l'analyse en cache pour ${fileName}`);
          results.push(cachedAnalysis);
          cacheHits++;
        } else {
          // Effectuer une nouvelle analyse
          logger.info(`Nouvelle analyse pour ${fileName}`);
          const text = await extractTextFromPDF(filePath);
          const analysis = await analyzePDFContent(text, fileName);
          
          // Sauvegarder l'analyse dans le cache
          await saveAnalysisToCache(filePath, text, analysis);
          cacheUpdates++;
          
          results.push({
            id: results.length + 1,
            title: fileName.replace('.pdf', ''),
            filePath: filePath,
            type: analysis.category,
            riskLevel: analysis.riskLevel,
            lastUpdate: new Date().toISOString().split('T')[0],
            relevance: analysis.relevance,
            keywords: analysis.keywords
          });
        }
      } catch (error) {
        logger.error(`Erreur lors de l'analyse du fichier ${filePath}:`, error);
      }
    }
    
    logger.info(`Analyse terminée: ${cacheHits} fichiers en cache, ${cacheUpdates} fichiers analysés`);
    return results;
  } catch (error) {
    logger.error(`Erreur lors de l'analyse des PDF:`, error);
    throw new Error(`Impossible d'analyser les PDF: ${error.message}`);
  }
}

/**
 * Calcule le hash MD5 d'un fichier
 * @param {string} filePath - Chemin vers le fichier
 * @returns {Promise<string>} - Hash MD5 du fichier
 */
async function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => {
        hash.update(data);
      });
      
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Vérifie si un document a déjà été analysé et si son contenu a changé
 * @param {string} filePath - Chemin vers le fichier PDF
 * @returns {Promise<Object|null>} - Résultat d'analyse en cache ou null
 */
async function checkAnalysisCache(filePath) {
  try {
    // Calculer le hash du fichier actuel
    const currentHash = await calculateFileHash(filePath);
    
    // Rechercher dans la base de données
    const cachedAnalysis = await db.documentAnalysis.findOne({
      where: { filePath: filePath }
    });
    
    if (cachedAnalysis) {
      logger.info(`Analyse en cache trouvée pour ${filePath}`);
      
      // Vérifier si le fichier a changé
      if (cachedAnalysis.fileHash === currentHash) {
        logger.info(`Le fichier ${filePath} n'a pas changé, utilisation du cache`);
        return {
          id: cachedAnalysis.id,
          title: cachedAnalysis.title,
          filePath: cachedAnalysis.filePath,
          type: cachedAnalysis.type,
          riskLevel: cachedAnalysis.riskLevel,
          lastUpdate: cachedAnalysis.lastAnalyzed.toISOString().split('T')[0],
          relevance: cachedAnalysis.relevance,
          keywords: cachedAnalysis.keywords
        };
      } else {
        logger.info(`Le fichier ${filePath} a changé, nouvelle analyse nécessaire`);
      }
    } else {
      logger.info(`Aucune analyse en cache pour ${filePath}`);
    }
    
    return null;
  } catch (error) {
    logger.error(`Erreur lors de la vérification du cache pour ${filePath}:`, error);
    return null;
  }
}

/**
 * Sauvegarde le résultat d'analyse dans la base de données
 * @param {string} filePath - Chemin vers le fichier PDF
 * @param {string} text - Texte extrait du PDF
 * @param {Object} analysis - Résultat de l'analyse
 * @returns {Promise<Object>} - Document sauvegardé
 */
async function saveAnalysisToCache(filePath, text, analysis) {
  try {
    const fileName = path.basename(filePath);
    const fileHash = await calculateFileHash(filePath);
    
    // Tronquer le texte pour éviter de dépasser la taille maximale de la colonne TEXT
    const truncatedText = text.slice(0, 10000);
    
    // Rechercher une analyse existante pour ce fichier
    const existingAnalysis = await db.documentAnalysis.findOne({
      where: { filePath: filePath }
    });
    
    if (existingAnalysis) {
      // Mettre à jour l'analyse existante
      await existingAnalysis.update({
        fileName: fileName,
        title: fileName.replace('.pdf', ''),
        type: analysis.category,
        riskLevel: analysis.riskLevel,
        relevance: analysis.relevance,
        keywords: analysis.keywords,
        content: truncatedText,
        lastAnalyzed: new Date(),
        fileHash: fileHash
      });
      
      logger.info(`Analyse mise à jour dans le cache pour ${filePath}`);
      return existingAnalysis;
    } else {
      // Créer une nouvelle analyse
      const newAnalysis = await db.documentAnalysis.create({
        filePath: filePath,
        fileName: fileName,
        title: fileName.replace('.pdf', ''),
        type: analysis.category,
        riskLevel: analysis.riskLevel,
        relevance: analysis.relevance,
        keywords: analysis.keywords,
        content: truncatedText,
        lastAnalyzed: new Date(),
        fileHash: fileHash
      });
      
      logger.info(`Nouvelle analyse sauvegardée dans le cache pour ${filePath}`);
      return newAnalysis;
    }
  } catch (error) {
    logger.error(`Erreur lors de la sauvegarde de l'analyse pour ${filePath}:`, error);
    throw error;
  }
}

/**
 * Vide la table des analyses de documents
 * @returns {Promise<void>}
 */
async function clearAnalysisCache() {
  try {
    await db.documentAnalysis.destroy({
      where: {},
      truncate: true
    });
    logger.info('Table d\'analyse vidée avec succès');
  } catch (error) {
    logger.error('Erreur lors de la suppression des analyses:', error);
    throw error;
  }
}

module.exports = {
  extractTextFromPDF,
  analyzePDFContent,
  findPDFFiles,
  analyzeAllPDFs,
  checkAnalysisCache,
  saveAnalysisToCache,
  clearAnalysisCache
};
