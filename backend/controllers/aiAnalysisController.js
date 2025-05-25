const path = require('path');
const aiAnalysisService = require('../services/aiAnalysisService');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'ai-analysis-controller' },
  transports: [
    new winston.transports.File({ filename: 'logs/ai-analysis-controller-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/ai-analysis-controller.log' })
  ]
});

/**
 * Analyse tous les documents PDF du répertoire docs avec OpenAI
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const analyzeDocumentsWithAI = async (req, res) => {
  try {
    // Vérifier si la clé API OpenAI est définie
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({
        success: false,
        message: "La clé API OpenAI n'est pas configurée. Veuillez la définir dans le fichier .env"
      });
    }

    const docsDirectory = path.join(__dirname, '..', '..', 'docs');
    logger.info(`Analyse des documents avec OpenAI du répertoire: ${docsDirectory}`);
    
    // Analyser tous les PDF du répertoire
    const results = await aiAnalysisService.analyzeAllDocumentsWithAI(docsDirectory);
    
    return res.status(200).json({
      success: true,
      documents: results
    });
  } catch (error) {
    logger.error('Erreur lors de l\'analyse des documents avec OpenAI:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Récupère toutes les analyses AI
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const getAllAIAnalyses = async (req, res) => {
  try {
    const analyses = await aiAnalysisService.getAllAIAnalyses();
    
    return res.status(200).json({
      success: true,
      analyses
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des analyses AI:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Récupère une analyse AI par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const getAIAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "L'ID de l'analyse est requis"
      });
    }
    
    const analysis = await aiAnalysisService.getAIAnalysisById(id);
    
    return res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'analyse AI:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Vide la table des analyses AI
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const clearAIAnalyses = async (req, res) => {
  try {
    await aiAnalysisService.clearAIAnalyses();
    
    return res.status(200).json({
      success: true,
      message: "Table des analyses AI vidée avec succès"
    });
  } catch (error) {
    logger.error('Erreur lors du vidage de la table des analyses AI:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  analyzeDocumentsWithAI,
  getAllAIAnalyses,
  getAIAnalysisById,
  clearAIAnalyses
};
