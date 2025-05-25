const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const aiAnalysisController = require('../controllers/aiAnalysisController');

/**
 * @swagger
 * /api/ai/analyze-documents:
 *   post:
 *     summary: Analyse tous les documents PDF du répertoire docs
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Documents analysés avec succès
 *       400:
 *         description: Erreur de requête
 *       500:
 *         description: Erreur serveur
 */
router.post('/analyze-documents', aiController.analyzeDocuments);

/**
 * @swagger
 * /api/ai/index-documents:
 *   post:
 *     summary: Indexe tous les documents PDF du répertoire docs dans la base vectorielle
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Documents indexés avec succès
 *       400:
 *         description: Erreur de requête
 *       500:
 *         description: Erreur serveur
 */
router.post('/index-documents', aiController.indexDocuments);

/**
 * @swagger
 * /api/ai/vector-db-status:
 *   get:
 *     summary: Obtient le statut de la base vectorielle
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Statut récupéré avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/vector-db-status', aiController.getVectorDbStatus);

/**
 * @swagger
 * /api/ai/clear-vector-db:
 *   post:
 *     summary: Vide la base vectorielle
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Base vectorielle vidée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/clear-vector-db', aiController.clearVectorDb);

/**
 * @swagger
 * /api/ai/analyze-with-ai:
 *   post:
 *     summary: Analyse tous les documents PDF du répertoire docs avec OpenAI
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Documents analysés avec succès
 *       400:
 *         description: Erreur de requête
 *       500:
 *         description: Erreur serveur
 */
router.post('/analyze-with-ai', aiAnalysisController.analyzeDocumentsWithAI);

/**
 * @swagger
 * /api/ai/ai-analyses:
 *   get:
 *     summary: Récupère toutes les analyses AI
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Analyses récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/ai-analyses', aiAnalysisController.getAllAIAnalyses);

/**
 * @swagger
 * /api/ai/ai-analyses/{id}:
 *   get:
 *     summary: Récupère une analyse AI par son ID
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'analyse
 *     responses:
 *       200:
 *         description: Analyse récupérée avec succès
 *       400:
 *         description: ID manquant
 *       500:
 *         description: Erreur serveur
 */
router.get('/ai-analyses/:id', aiAnalysisController.getAIAnalysisById);

/**
 * @swagger
 * /api/ai/clear-ai-analyses:
 *   post:
 *     summary: Vide la table des analyses AI
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Table vidée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/clear-ai-analyses', aiAnalysisController.clearAIAnalyses);

/**
 * @swagger
 * /api/ai/search-documents:
 *   post:
 *     summary: Recherche des documents similaires à une requête
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documents trouvés avec succès
 *       400:
 *         description: Erreur de requête
 *       500:
 *         description: Erreur serveur
 */
router.post('/search-documents', aiController.searchDocuments);

/**
 * @swagger
 * /api/ai/generate-answer:
 *   post:
 *     summary: Génère une réponse à une question en utilisant les documents pertinents
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *     responses:
 *       200:
 *         description: Réponse générée avec succès
 *       400:
 *         description: Erreur de requête
 *       500:
 *         description: Erreur serveur
 */
router.post('/generate-answer', aiController.generateAnswer);

/**
 * @swagger
 * /api/ai/document-analyses:
 *   get:
 *     summary: Récupère le contenu de la table documentAnalysis
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Analyses récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/document-analyses', aiController.getDocumentAnalyses);

module.exports = router;
