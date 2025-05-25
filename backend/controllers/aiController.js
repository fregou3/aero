const path = require('path');
const fs = require('fs');
const pdfService = require('../services/pdfService');
const vectorService = require('../services/vectorService');
const winston = require('winston');
const db = require('../models');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'ai-controller' },
  transports: [
    new winston.transports.File({ filename: 'logs/ai-controller-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/ai-controller.log' })
  ]
});

/**
 * Analyse tous les documents PDF du répertoire docs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const analyzeDocuments = async (req, res) => {
  try {
    // Vérifier si la clé API OpenAI est définie
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({
        success: false,
        message: "La clé API OpenAI n'est pas configurée. Veuillez la définir dans le fichier .env"
      });
    }

    const docsDirectory = path.join(__dirname, '..', '..', 'docs');
    logger.info(`Analyse des documents du répertoire: ${docsDirectory}`);
    
    // Vider la table d'analyse avant de l'alimenter avec les nouveaux résultats
    logger.info('Vidage de la table d\'analyse avant nouvelle analyse');
    await pdfService.clearAnalysisCache();
    
    // Analyser tous les PDF du répertoire
    const results = await pdfService.analyzeAllPDFs(docsDirectory);
    
    return res.status(200).json({
      success: true,
      documents: results
    });
  } catch (error) {
    logger.error('Erreur lors de l\'analyse des documents:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Indexe tous les documents PDF du répertoire docs directement dans la base vectorielle
 * sans dépendre de la base PostgreSQL
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const indexDocuments = async (req, res) => {
  try {
    console.log('Début de la fonction indexDocuments');
    
    // Vérifier si la clé API OpenAI est définie
    if (!process.env.OPENAI_API_KEY) {
      console.log('Clé API OpenAI non configurée');
      return res.status(400).json({
        success: false,
        message: "La clé API OpenAI n'est pas configurée. Veuillez la définir dans le fichier .env"
      });
    }

    // Utiliser un chemin relatif pour le répertoire docs (au même niveau que backend)
    const docsDirectory = path.resolve(path.join(__dirname, '..', '..', 'docs'));
    console.log(`Indexation des documents du répertoire: ${docsDirectory}`);
    logger.info(`Indexation des documents du répertoire: ${docsDirectory}`);
    
    // Vérifier si le répertoire existe
    if (!fs.existsSync(docsDirectory)) {
      console.log(`Le répertoire ${docsDirectory} n'existe pas`);
      return res.status(400).json({
        success: false,
        message: `Le répertoire des documents ${docsDirectory} n'existe pas`
      });
    }
    
    // Trouver tous les fichiers PDF dans le répertoire
    console.log('Recherche des fichiers PDF dans le répertoire');
    const pdfFiles = await pdfService.findPDFFiles(docsDirectory);
    
    if (!pdfFiles || pdfFiles.length === 0) {
      console.log('Aucun fichier PDF trouvé dans le répertoire');
      return res.status(400).json({
        success: false,
        message: "Aucun fichier PDF n'a été trouvé dans le répertoire des documents"
      });
    }
    
    console.log(`${pdfFiles.length} fichiers PDF trouvés dans le répertoire`);
    
    // Indexer directement les documents dans la base vectorielle sans passer par PostgreSQL
    console.log('Tentative d\'indexation des documents dans la base vectorielle');
    const result = await vectorService.indexDocuments(docsDirectory);
    console.log('Résultat de l\'indexation:', result);
    
    return res.status(200).json({
      success: true,
      documentCount: result.documentCount || pdfFiles.length,
      isInitialized: result.isInitialized,
      message: `${result.documentCount || pdfFiles.length} documents ont été indexés avec succès dans la base vectorielle`
    });
  } catch (error) {
    console.error('Erreur générale lors de l\'indexation des documents:', error);
    logger.error('Erreur lors de l\'indexation des documents:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Obtient le statut de la base vectorielle
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const getVectorDbStatus = async (req, res) => {
  try {
    console.log('Requête de statut de la base vectorielle reçue');
    const status = await vectorService.getVectorDbStatus();
    console.log('Statut récupéré:', status);
    return res.status(200).json(status);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut de la base vectorielle:', error);
    logger.error('Erreur lors de la récupération du statut de la base vectorielle:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Recherche des documents similaires à une requête
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const searchDocuments = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "La requête de recherche est requise"
      });
    }
    
    const results = await vectorService.searchSimilarDocuments(query);
    
    return res.status(200).json({
      success: true,
      documents: results
    });
  } catch (error) {
    logger.error('Erreur lors de la recherche de documents:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Génère une réponse à une question en utilisant les documents pertinents
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const generateAnswer = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "La question est requise"
      });
    }
    
    const result = await vectorService.generateAnswer(question);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Erreur lors de la génération de la réponse:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Récupère le contenu de la table documentAnalysis
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const getDocumentAnalyses = async (req, res) => {
  try {
    const analyses = await db.documentAnalysis.findAll({
      attributes: ['id', 'fileName', 'title', 'type', 'riskLevel', 'relevance', 'keywords', 'lastAnalyzed', 'fileHash']
    });
    
    return res.status(200).json({
      success: true,
      count: analyses.length,
      analyses: analyses
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des analyses:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Vide la base vectorielle
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const clearVectorDb = async (req, res) => {
  try {
    console.log('Requête de vidage de la base vectorielle reçue');
    const result = await vectorService.clearVectorDb();
    console.log('Résultat du vidage:', result);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Base vectorielle vidée avec succès',
        isInitialized: false,
        documentCount: 0
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message || 'Erreur lors du vidage de la base vectorielle'
      });
    }
  } catch (error) {
    console.error('Erreur lors du vidage de la base vectorielle:', error);
    logger.error('Erreur lors du vidage de la base vectorielle:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  analyzeDocuments,
  indexDocuments,
  getVectorDbStatus,
  searchDocuments,
  generateAnswer,
  getDocumentAnalyses,
  clearVectorDb
};
