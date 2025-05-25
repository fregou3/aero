const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const winston = require('winston');
const db = require('../models');
const pdfService = require('./pdfService');

const AIAnalysis = db.aiAnalysis;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'ai-analysis-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/ai-analysis-service-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/ai-analysis-service.log' })
  ]
});

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Analyse un document PDF avec OpenAI pour extraire les risques
 * @param {string} filePath - Chemin vers le fichier PDF
 * @returns {Promise<Object>} - Résultat de l'analyse
 */
async function analyzeDocumentWithAI(filePath) {
  try {
    logger.info(`Analyse du document avec OpenAI: ${filePath}`);
    
    // Vérifier si le document a déjà été analysé
    const existingAnalysis = await AIAnalysis.findOne({
      where: { filePath }
    });
    
    if (existingAnalysis) {
      logger.info(`Document déjà analysé: ${filePath}`);
      return existingAnalysis;
    }
    
    // Extraire le texte du PDF
    const text = await pdfService.extractTextFromPDF(filePath);
    
    // Limiter le texte à 4000 tokens pour éviter de dépasser les limites d'OpenAI
    const truncatedText = text.substring(0, 12000);
    
    // Analyser le contenu avec OpenAI
    const fileName = path.basename(filePath);
    const title = path.basename(fileName, path.extname(fileName));
    
    // Créer une entrée dans la base de données avec le statut "pending"
    const analysisEntry = await AIAnalysis.create({
      filePath,
      fileName,
      title,
      status: 'pending'
    });
    
    try {
      // 1. Générer un résumé du document
      const summaryCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en aéronautique. Votre tâche est de résumer le document fourni en 10 lignes maximum, en capturant les points essentiels."
          },
          {
            role: "user",
            content: `Résumez ce document technique aéronautique en 10 lignes maximum: ${truncatedText}`
          }
        ],
        temperature: 0,
        max_tokens: 500
      });
      
      const documentSummary = summaryCompletion.choices[0].message.content;
      
      // 2. Analyser les risques avec notation
      const riskAnalysisCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en aéronautique spécialisé dans l'analyse de risques. Votre tâche est d'identifier et de lister tous les risques mentionnés dans le document fourni. Pour chaque risque, attribuez une note de gravité sur 100 (100 étant le plus grave). Présentez votre analyse sous forme de liste à puces (bullet points) détaillée et bien structurée, avec la note entre parenthèses à la fin de chaque point. Calculez également une note globale sur 100 pour l'ensemble du document."
          },
          {
            role: "user",
            content: `Analysez ce document technique aéronautique, identifiez tous les risques mentionnés, et attribuez une note de gravité sur 100 à chaque risque ainsi qu'une note globale pour le document: ${truncatedText}`
          }
        ],
        temperature: 0,
        max_tokens: 1000
      });
      
      // Extraire la réponse
      const riskAnalysis = riskAnalysisCompletion.choices[0].message.content;
      
      // 3. Extraire les données structurées des risques
      const structuredDataCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en aéronautique spécialisé dans l'analyse de risques. Votre tâche est d'extraire les risques mentionnés dans l'analyse fournie et de les structurer au format JSON. Chaque risque doit avoir un titre, une description et une note sur 100. Calculez également une note globale sur 100 pour l'ensemble du document."
          },
          {
            role: "user",
            content: `Convertissez cette analyse de risques en format JSON structuré avec un tableau 'risks' contenant des objets avec les propriétés 'title', 'description' et 'score', ainsi qu'une propriété 'globalScore' pour la note globale: ${riskAnalysis}`
          }
        ],
        temperature: 0,
        max_tokens: 1000
      });
      
      // Extraire et parser les données JSON
      let risksData = [];
      let globalRiskScore = 0;
      
      try {
        // Extraire le JSON de la réponse (peut être entouré de ```json ```)
        const jsonContent = structuredDataCompletion.choices[0].message.content;
        const jsonMatch = jsonContent.match(/```json\n([\s\S]*?)\n```/) || jsonContent.match(/```\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : jsonContent;
        
        const parsedData = JSON.parse(jsonString);
        risksData = parsedData.risks || [];
        globalRiskScore = parsedData.globalScore || 0;
      } catch (error) {
        logger.error(`Erreur lors du parsing des données JSON: ${error.message}`);
        // En cas d'erreur, on continue avec des valeurs par défaut
        risksData = [];
        globalRiskScore = 0;
      }
      
      // Mettre à jour l'entrée dans la base de données
      await analysisEntry.update({
        documentSummary,
        riskAnalysis,
        risksData,
        globalRiskScore,
        status: 'completed',
        analysisDate: new Date()
      });
      
      logger.info(`Analyse OpenAI réussie pour: ${filePath}`);
      return analysisEntry;
    } catch (error) {
      // En cas d'erreur, mettre à jour l'entrée avec le statut "failed"
      await analysisEntry.update({
        status: 'failed',
        error: error.message
      });
      
      logger.error(`Erreur lors de l'analyse OpenAI pour ${filePath}:`, error);
      throw error;
    }
  } catch (error) {
    logger.error(`Erreur lors de l'analyse du document ${filePath}:`, error);
    throw new Error(`Impossible d'analyser le document: ${error.message}`);
  }
}

/**
 * Analyse tous les PDF d'un répertoire avec OpenAI
 * @param {string} directory - Chemin du répertoire contenant les PDF
 * @returns {Promise<Array<Object>>} - Résultats de l'analyse
 */
async function analyzeAllDocumentsWithAI(directory) {
  try {
    // Trouver tous les fichiers PDF dans le répertoire
    const pdfFiles = await pdfService.findPDFFiles(directory);
    logger.info(`${pdfFiles.length} fichiers PDF trouvés dans ${directory}`);
    
    const results = [];
    
    // Analyser chaque fichier séquentiellement pour éviter de surcharger l'API OpenAI
    for (const filePath of pdfFiles) {
      try {
        const result = await analyzeDocumentWithAI(filePath);
        results.push(result);
      } catch (error) {
        logger.error(`Erreur lors de l'analyse de ${filePath}:`, error);
        // Continuer avec le fichier suivant même en cas d'erreur
      }
    }
    
    return results;
  } catch (error) {
    logger.error(`Erreur lors de l'analyse des documents du répertoire ${directory}:`, error);
    throw new Error(`Impossible d'analyser les documents: ${error.message}`);
  }
}

/**
 * Récupère toutes les analyses AI stockées dans la base de données
 * @returns {Promise<Array<Object>>} - Liste des analyses
 */
async function getAllAIAnalyses() {
  try {
    const analyses = await AIAnalysis.findAll({
      order: [['analysisDate', 'DESC']]
    });
    
    return analyses;
  } catch (error) {
    logger.error('Erreur lors de la récupération des analyses AI:', error);
    throw new Error(`Impossible de récupérer les analyses: ${error.message}`);
  }
}

/**
 * Récupère une analyse AI par son ID
 * @param {number} id - ID de l'analyse
 * @returns {Promise<Object>} - Analyse
 */
async function getAIAnalysisById(id) {
  try {
    const analysis = await AIAnalysis.findByPk(id);
    
    if (!analysis) {
      throw new Error(`Analyse avec l'ID ${id} non trouvée`);
    }
    
    return analysis;
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'analyse AI ${id}:`, error);
    throw new Error(`Impossible de récupérer l'analyse: ${error.message}`);
  }
}

/**
 * Vide la table des analyses AI
 * @returns {Promise<void>}
 */
async function clearAIAnalyses() {
  try {
    await AIAnalysis.destroy({
      where: {},
      truncate: true
    });
    
    logger.info('Table des analyses AI vidée avec succès');
  } catch (error) {
    logger.error('Erreur lors du vidage de la table des analyses AI:', error);
    throw new Error(`Impossible de vider la table des analyses: ${error.message}`);
  }
}

module.exports = {
  analyzeDocumentWithAI,
  analyzeAllDocumentsWithAI,
  getAllAIAnalyses,
  getAIAnalysisById,
  clearAIAnalyses
};
