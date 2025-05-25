const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const winston = require('winston');
const pdfService = require('./pdfService');
const db = require('../models');
const chromaService = require('./chromaService');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'vector-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/vector-service-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/vector-service.log' })
  ]
});

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Utilisation de Chroma DB pour stocker les embeddings

// Initialisation du statut depuis la base de données
async function initializeFromDatabase() {
  try {
    console.log('Initialisation du statut depuis la base de données');
    const status = await db.vectorDbStatus.findOne({ order: [['id', 'DESC']] });
    
    if (status) {
      console.log('Statut trouvé dans la base de données:', status.dataValues);
      
      // Initialiser Chroma DB
      await chromaService.initializeChromaCollection();
      
      // Vérifier la cohérence entre le statut PostgreSQL et Chroma
      const documentCount = await chromaService.getDocumentCount();
      console.log(`Nombre de documents dans Chroma: ${documentCount}, dans PostgreSQL: ${status.documentCount}`);
      
      // Mettre à jour le statut si nécessaire
      if (documentCount > 0 && documentCount !== status.documentCount) {
        console.log('Mise à jour du statut dans PostgreSQL pour correspondre à Chroma');
        await db.vectorDbStatus.create({
          isInitialized: true,
          documentCount: documentCount,
          lastUpdated: new Date()
        });
      }
    } else {
      console.log('Aucun statut trouvé dans la base de données, création d\'un statut initial');
      
      // Initialiser Chroma DB
      await chromaService.initializeChromaCollection();
      
      // Vérifier si Chroma contient des documents
      const documentCount = await chromaService.getDocumentCount();
      
      await db.vectorDbStatus.create({
        isInitialized: documentCount > 0,
        documentCount: documentCount,
        lastUpdated: new Date()
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation depuis la base de données:', error);
  }
}

// Appel de l'initialisation au démarrage
initializeFromDatabase();

/**
 * Génère un embedding pour un texte donné
 * @param {string} text - Texte à transformer en embedding
 * @returns {Promise<Array<number>>} - Vecteur d'embedding
 */
async function generateEmbedding(text) {
  try {
    // Limiter la taille du texte pour éviter de dépasser les limites de l'API
    const truncatedText = text.slice(0, 8000);
    
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: truncatedText
    });
    
    return response.data[0].embedding;
  } catch (error) {
    logger.error(`Erreur lors de la génération de l'embedding:`, error);
    throw new Error(`Impossible de générer l'embedding: ${error.message}`);
  }
}

/**
 * Calcule la similarité cosinus entre deux vecteurs
 * @param {Array<number>} vecA - Premier vecteur
 * @param {Array<number>} vecB - Second vecteur
 * @returns {number} - Score de similarité (entre 0 et 1)
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

/**
 * Indexe tous les documents PDF d'un répertoire
 * @param {string} directory - Chemin du répertoire contenant les PDF
 * @param {Array<Object>} [analysisResults] - Résultats d'analyse des documents (optionnel)
 * @returns {Promise<Object>} - Résultat de l'indexation
 */
async function indexDocuments(directory, analysisResults = null) {
  try {
    console.log('Début de la fonction indexDocuments dans vectorService');
    console.log('Paramètres reçus:', { directory, hasAnalysisResults: !!analysisResults });
    
    // Réinitialiser les embeddings
    documentEmbeddings = [];
    console.log('Embeddings réinitialisés');
    
    // Trouver tous les fichiers PDF
    console.log('Recherche des fichiers PDF dans le répertoire:', directory);
    const pdfFiles = pdfService.findPDFFiles(directory);
    console.log(`${pdfFiles.length} fichiers PDF trouvés:`, pdfFiles);
    logger.info(`${pdfFiles.length} fichiers PDF trouvés dans ${directory}`);
    
    let processedCount = 0;
    
    // Si nous avons déjà les résultats d'analyse, utilisons-les pour accélérer le processus
    if (analysisResults && Array.isArray(analysisResults) && analysisResults.length > 0) {
      console.log(`Utilisation des ${analysisResults.length} résultats d'analyse existants`);
      logger.info(`Utilisation des ${analysisResults.length} résultats d'analyse existants`);
      
      for (const analysis of analysisResults) {
        try {
          // Vérifier que le fichier existe toujours
          console.log(`Vérification de l'existence du fichier: ${analysis.filePath}`);
          if (!fs.existsSync(analysis.filePath)) {
            console.log(`Le fichier ${analysis.filePath} n'existe plus, ignorant...`);
            logger.warn(`Le fichier ${analysis.filePath} n'existe plus, ignorant...`);
            continue;
          }
          console.log(`Le fichier ${analysis.filePath} existe, poursuite du traitement`);
          
          const fileName = path.basename(analysis.filePath);
          logger.info(`Indexation du fichier ${fileName} depuis les résultats d'analyse`);
          
          // Extraire le texte du PDF pour générer l'embedding
          console.log(`Extraction du texte du PDF: ${analysis.filePath}`);
          const text = await pdfService.extractTextFromPDF(analysis.filePath);
          console.log(`Texte extrait avec succès, longueur: ${text.length} caractères`);
          
          // Générer l'embedding
          console.log(`Génération de l'embedding pour: ${analysis.filePath}`);
          const embedding = await generateEmbedding(text);
          console.log(`Embedding généré avec succès, dimension: ${embedding.length}`);
          
          // Stocker l'embedding avec les métadonnées déjà analysées
          console.log(`Stockage de l'embedding pour: ${analysis.filePath}`);
          const documentData = {
            id: documentEmbeddings.length + 1,
            title: analysis.title || fileName.replace('.pdf', ''),
            filePath: analysis.filePath,
            type: analysis.type || analysis.category,
            riskLevel: analysis.riskLevel || 'inconnue',
            lastUpdate: new Date().toISOString().split('T')[0],
            relevance: analysis.relevance || 50,
            keywords: analysis.keywords || [],
            embedding: embedding
          };
          console.log(`Métadonnées du document:`, {
            id: documentData.id,
            title: documentData.title,
            type: documentData.type,
            riskLevel: documentData.riskLevel,
            relevance: documentData.relevance
          });
          documentEmbeddings.push(documentData);
          
          processedCount++;
          console.log(`Document ${processedCount} traité avec succès`);
        } catch (error) {
          console.error(`Erreur lors de l'indexation du fichier ${analysis.filePath}:`, error);
          logger.error(`Erreur lors de l'indexation du fichier ${analysis.filePath}:`, error);
        }
      }
    } else {
      // Sinon, analyser chaque document individuellement
      console.log('Aucun résultat d\'analyse fourni, analyse individuelle des documents');
      logger.info('Aucun résultat d\'analyse fourni, analyse individuelle des documents');
      
      // Indexer les documents
      for (const filePath of pdfFiles) {
        try {
          // Le chemin est déjà complet, pas besoin de le joindre avec le répertoire
          console.log(`Traitement du fichier: ${filePath}`);
          
          // Extraire le texte du PDF
          const pdfText = await pdfService.extractTextFromPDF(filePath);
          console.log(`Texte extrait du PDF (${pdfText.length} caractères)`);
          
          if (pdfText && pdfText.length > 0) {
            // Générer l'embedding
            const embedding = await generateEmbedding(pdfText);
            console.log(`Embedding généré avec succès (${embedding.length} dimensions)`);
            
            // Obtenir le nom du fichier à partir du chemin complet
            const fileName = path.basename(filePath);
            
            // Analyser le contenu pour obtenir les métadonnées
            console.log(`Analyse du contenu pour obtenir les métadonnées: ${fileName}`);
            const analysis = await pdfService.analyzePDFContent(pdfText, fileName);
            console.log(`Analyse terminée, résultats:`, {
              category: analysis.category,
              riskLevel: analysis.riskLevel,
              relevance: analysis.relevance,
              keywordsCount: analysis.keywords.length
            });
            
            // Préparer les métadonnées
            const metadata = {
              fileName: fileName,
              path: filePath,
              riskLevel: analysis.riskLevel,
              documentType: analysis.category,
              relevance: analysis.relevance
            };
            
            // Stocker l'embedding dans Chroma DB
            const documentId = fileName;
            await chromaService.addDocument(documentId, embedding, metadata, pdfText);
            
            processedCount++;
            console.log(`Document ${fileName} indexé avec succès dans Chroma DB`);
          } else {
            console.log(`Le fichier ${filePath} ne contient pas de texte extractible`);
          }
        } catch (error) {
          console.error(`Erreur lors de l'indexation du fichier ${filePath}:`, error);
          logger.error(`Erreur lors de l'indexation du fichier ${filePath}:`, error);
        }
      }
    }
    
    // Vérifier le nombre de documents dans Chroma
    const documentCount = await chromaService.getDocumentCount();
    const isInitialized = documentCount > 0;
    
    console.log(`Statut d'initialisation de la base vectorielle: ${isInitialized}`);
    console.log(`Nombre total de documents dans Chroma DB: ${documentCount}`);
    
    // Persister le statut dans la base de données
    try {
      console.log('Persistance du statut dans la base de données');
      await db.vectorDbStatus.create({
        isInitialized: isInitialized,
        documentCount: documentCount,
        lastUpdated: new Date()
      });
      console.log('Statut persisté avec succès');
    } catch (error) {
      console.error('Erreur lors de la persistance du statut:', error);
    }
    
    logger.info(`Indexation terminée avec succès: ${processedCount} documents indexés`);
    
    const result = {
      success: true,
      documentCount: processedCount,
      isInitialized
    };
    console.log(`Résultat de l'indexation:`, result);
    return result;
  } catch (error) {
    console.error(`Erreur lors de l'indexation des documents:`, error);
    logger.error(`Erreur lors de l'indexation des documents:`, error);
    throw error;
  }
}

/**
 * Recherche les documents les plus pertinents pour une requête
 * @param {string} query - Requête de recherche
 * @param {number} limit - Nombre maximum de résultats à retourner
 * @returns {Promise<Array<Object>>} - Documents pertinents
 */
async function searchSimilarDocuments(query, limit = 5) {
  try {
    logger.info(`Recherche de documents similaires pour la requête: "${query}"`);
    
    // Vérifier si Chroma contient des documents
    const documentCount = await chromaService.getDocumentCount();
    if (documentCount === 0) {
      logger.warn('La base vectorielle Chroma est vide');
      return [];
    }
    
    // Générer l'embedding de la requête
    const queryEmbedding = await generateEmbedding(query);
    
    // Rechercher dans Chroma DB avec la nouvelle recherche hybride
    // Passer la requête originale en texte pour permettre la recherche par mots-clés
    const results = await chromaService.querySimilarDocuments(queryEmbedding, limit, query);
    
    // Formater les résultats pour maintenir la compatibilité avec le reste de l'application
    const formattedResults = results.map(result => ({
      id: result.id,
      content: result.content,
      metadata: result.metadata,
      similarity: result.score, // Utiliser directement le score combiné
      vectorScore: result.vectorScore,
      keywordScore: result.keywordScore,
      metadataScore: result.metadataScore
    }));
    
    logger.info(`${formattedResults.length} documents similaires trouvés`);
    console.log('Résultats de recherche formatés:', formattedResults.map(r => ({
      id: r.id,
      fileName: r.metadata.fileName,
      score: r.similarity.toFixed(4),
      scores: `V:${r.vectorScore.toFixed(2)}, K:${r.keywordScore.toFixed(2)}, M:${r.metadataScore.toFixed(2)}`
    })));
    
    return formattedResults;
  } catch (error) {
    logger.error('Erreur lors de la recherche de documents similaires:', error);
    console.error('Erreur lors de la recherche de documents similaires:', error);
    return [];
  }
}

/**
 * Génère une réponse à une question en utilisant les documents pertinents
 * @param {string} question - Question posée
 * @returns {Promise<Object>} - Réponse générée et documents pertinents
 */
async function generateAnswer(question) {
  try {
    // Vérifier si la base vectorielle est initialisée
    const status = await getVectorDbStatus();
    
    if (!status.isInitialized || status.documentCount === 0) {
      return {
        answer: "Je ne peux pas répondre à votre question car la base de connaissances n'a pas encore été initialisée. Veuillez d'abord indexer les documents.",
        documents: []
      };
    }
    
    // Analyser la question pour déterminer le nombre optimal de documents à récupérer
    // Pour les questions spécifiques comme celles sur les inspections visuelles, augmenter le nombre
    const isSpecificQuery = /inspection|visuelle|capteur|analyse|examen|détérioration|défaut/i.test(question);
    const numDocs = isSpecificQuery ? 5 : 3;
    
    logger.info(`Question détectée comme ${isSpecificQuery ? 'spécifique' : 'générale'}, récupération de ${numDocs} documents`);
    
    // Rechercher les documents pertinents avec notre système de recherche amélioré
    const relevantDocs = await searchSimilarDocuments(question, numDocs);
    
    if (relevantDocs.length === 0) {
      return {
        answer: "Je n'ai pas trouvé d'informations pertinentes dans la base de connaissances pour répondre à votre question.",
        documents: []
      };
    }
    
    // Filtrer les documents avec un score trop faible (seuil de pertinence)
    const threshold = 0.3; // Seuil minimal de pertinence
    const filteredDocs = relevantDocs.filter(doc => doc.similarity >= threshold);
    
    if (filteredDocs.length === 0) {
      logger.info(`Aucun document ne dépasse le seuil de pertinence (${threshold})`);
      return {
        answer: "Je n'ai pas trouvé d'informations suffisamment pertinentes pour répondre à votre question avec précision. Pourriez-vous reformuler ou préciser votre demande?",
        documents: []
      };
    }
    
    // Construire le contexte à partir des documents pertinents
    let context = "Contexte extrait des documents pertinents:\n\n";
    
    // Trier les documents par pertinence décroissante
    filteredDocs.sort((a, b) => b.similarity - a.similarity);
    
    for (const doc of filteredDocs) {
      // Extraire le nom du fichier pour l'inclure dans le contexte
      const fileName = doc.metadata.fileName || doc.id;
      
      // Utiliser directement le contenu du document déjà extrait
      // Limiter la taille du texte pour éviter de dépasser les limites de l'API
      // Extraire un segment plus pertinent du document (premiers 1000 caractères)
      const truncatedText = doc.content.slice(0, 1500);
      
      // Ajouter des informations sur la pertinence du document
      context += `Document: ${fileName} (Pertinence: ${(doc.similarity * 100).toFixed(1)}%)\n${truncatedText}\n\n`;
    }
    
    // Générer une réponse avec OpenAI
    const prompt = `
    En te basant uniquement sur le contexte fourni, réponds à la question suivante de manière précise et concise.
    Cite les documents spécifiques d'où proviennent les informations dans ta réponse.
    Si tu ne trouves pas l'information dans le contexte, indique-le clairement.
    
    ${context}
    
    Question: ${question}
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Tu es un assistant spécialisé en aéronautique qui répond aux questions en te basant uniquement sur les documents fournis. Cite toujours les sources spécifiques (noms des documents) d'où proviennent tes informations." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    const answer = response.choices[0].message.content;
    
    // Formater les documents pertinents pour l'affichage
    const formattedDocs = relevantDocs.map(doc => ({
      title: doc.id || 'Document sans titre',
      content: doc.content ? doc.content.substring(0, 200) + '...' : '',
      relevance: Math.round(doc.score * 100),
      riskLevel: doc.metadata?.riskLevel || 'Inconnu',
      documentType: doc.metadata?.documentType || 'Inconnu'
    }));
    
    return {
      answer,
      documents: formattedDocs
    };
  } catch (error) {
    logger.error(`Erreur lors de la génération de la réponse:`, error);
    return {
      answer: `Je suis désolé, mais une erreur s'est produite lors de la génération de la réponse: ${error.message}`,
      documents: []
    };
  }
}

/**
 * Vérifie si la base vectorielle est initialisée
 * @returns {Promise<Object>} - État d'initialisation
 */
async function getVectorDbStatus() {
  try {
    // Récupérer le statut depuis la base de données
    const status = await db.vectorDbStatus.findOne({ order: [['id', 'DESC']] });
    
    // Vérifier le nombre de documents dans Chroma
    const documentCount = await chromaService.getDocumentCount();
    console.log(`Nombre de documents dans Chroma: ${documentCount}`);
    
    if (status) {
      console.log('Statut récupéré depuis la base de données:', status.dataValues);
      
      // Vérifier si le statut dans PostgreSQL correspond à Chroma
      if (status.documentCount !== documentCount) {
        console.log('Mise à jour du statut dans PostgreSQL pour correspondre à Chroma');
        await db.vectorDbStatus.create({
          isInitialized: documentCount > 0,
          documentCount: documentCount,
          lastUpdated: new Date()
        });
        
        return {
          isInitialized: documentCount > 0,
          documentCount: documentCount
        };
      }
      
      return {
        isInitialized: status.isInitialized,
        documentCount: status.documentCount
      };
    }
    
    // Créer un statut initial basé sur Chroma
    const newStatus = {
      isInitialized: documentCount > 0,
      documentCount: documentCount
    };
    
    await db.vectorDbStatus.create({
      ...newStatus,
      lastUpdated: new Date()
    });
    
    return newStatus;
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    
    // Essayer de récupérer le nombre de documents dans Chroma en cas d'erreur
    try {
      const documentCount = await chromaService.getDocumentCount();
      return {
        isInitialized: documentCount > 0,
        documentCount: documentCount
      };
    } catch (chromaError) {
      console.error('Erreur lors de la récupération du nombre de documents dans Chroma:', chromaError);
      return {
        isInitialized: false,
        documentCount: 0
      };
    }
  }
}

/**
 * Vide la base vectorielle et met à jour le statut
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function clearVectorDb() {
  try {
    logger.info('Vidage de la base vectorielle');
    console.log('Vidage de la base vectorielle');
    
    // Supprimer tous les documents de Chroma
    const success = await chromaService.deleteAllDocuments();
    
    if (!success) {
      throw new Error('Erreur lors de la suppression des documents dans Chroma');
    }
    
    // Mettre à jour le statut dans la base de données
    await db.vectorDbStatus.create({
      isInitialized: false,
      documentCount: 0,
      lastUpdated: new Date()
    });
    
    logger.info('Base vectorielle vidée avec succès');
    console.log('Base vectorielle vidée avec succès');
    
    return {
      success: true,
      isInitialized: false,
      documentCount: 0
    };
  } catch (error) {
    logger.error('Erreur lors du vidage de la base vectorielle:', error);
    console.error('Erreur lors du vidage de la base vectorielle:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

module.exports = {
  indexDocuments,
  searchSimilarDocuments,
  generateAnswer,
  getVectorDbStatus,
  clearVectorDb
};
