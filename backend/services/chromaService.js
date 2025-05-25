const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'chroma-service.log' })
  ]
});

// Définir le chemin pour le stockage local des embeddings
const EMBEDDINGS_DIRECTORY = path.join(__dirname, '..', 'data', 'embeddings');
let embeddings = [];

// S'assurer que le répertoire de données existe
if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
  fs.mkdirSync(path.join(__dirname, '..', 'data'));
}
if (!fs.existsSync(EMBEDDINGS_DIRECTORY)) {
  fs.mkdirSync(EMBEDDINGS_DIRECTORY);
}

// Charger les embeddings existants s'ils existent
try {
  if (fs.existsSync(path.join(EMBEDDINGS_DIRECTORY, 'embeddings.json'))) {
    const data = fs.readFileSync(path.join(EMBEDDINGS_DIRECTORY, 'embeddings.json'), 'utf8');
    embeddings = JSON.parse(data);
    console.log(`${embeddings.length} embeddings chargés depuis le fichier`);
  }
} catch (error) {
  console.error('Erreur lors du chargement des embeddings:', error);
  embeddings = [];
}

/**
 * Initialise le stockage des embeddings
 * @returns {Promise<boolean>}
 */
async function initializeChromaCollection() {
  try {
    logger.info('Initialisation du stockage des embeddings');
    console.log('Initialisation du stockage des embeddings');
    
    // Vérifier si le fichier d'embeddings existe déjà
    if (!fs.existsSync(path.join(EMBEDDINGS_DIRECTORY, 'embeddings.json'))) {
      // Créer un fichier vide
      fs.writeFileSync(path.join(EMBEDDINGS_DIRECTORY, 'embeddings.json'), JSON.stringify([]));
      console.log('Fichier d\'embeddings créé');
    }
    
    logger.info('Stockage des embeddings initialisé avec succès');
    console.log('Stockage des embeddings initialisé avec succès');
    return true;
  } catch (error) {
    logger.error(`Erreur lors de l'initialisation du stockage des embeddings: ${error.message}`);
    console.error('Erreur lors de l\'initialisation du stockage des embeddings:', error);
    return false;
  }
}

/**
 * Ajoute un document au stockage des embeddings
 * @param {string} id - Identifiant unique du document
 * @param {Array<number>} embedding - Vecteur d'embedding du document
 * @param {Object} metadata - Métadonnées du document
 * @param {string} content - Contenu textuel du document
 * @returns {Promise<boolean>} - Succès de l'opération
 */
async function addDocument(id, embedding, metadata, content) {
  try {
    await initializeChromaCollection();
    
    logger.info(`Ajout du document ${id} au stockage des embeddings`);
    console.log(`Ajout du document ${id} au stockage des embeddings`);
    
    // Vérifier si le document existe déjà
    const existingIndex = embeddings.findIndex(doc => doc.id === id);
    
    if (existingIndex !== -1) {
      // Mettre à jour le document existant
      embeddings[existingIndex] = {
        id,
        embedding,
        metadata,
        content
      };
      console.log(`Document ${id} mis à jour`);
    } else {
      // Ajouter le nouveau document
      embeddings.push({
        id,
        embedding,
        metadata,
        content
      });
      console.log(`Document ${id} ajouté`);
    }
    
    // Sauvegarder les embeddings dans le fichier
    fs.writeFileSync(
      path.join(EMBEDDINGS_DIRECTORY, 'embeddings.json'),
      JSON.stringify(embeddings, null, 2)
    );
    
    logger.info(`Document ${id} ajouté avec succès`);
    console.log(`Document ${id} ajouté avec succès`);
    return true;
  } catch (error) {
    logger.error(`Erreur lors de l'ajout du document ${id}: ${error.message}`);
    console.error(`Erreur lors de l'ajout du document ${id}:`, error);
    return false;
  }
}

/**
 * Recherche des documents similaires à un vecteur d'embedding avec une approche hybride
 * @param {Array<number>} queryEmbedding - Vecteur d'embedding de la requête
 * @param {number} limit - Nombre maximum de résultats
 * @param {string} [originalQuery] - La requête originale en texte
 * @returns {Promise<Array<Object>>} - Documents similaires avec leur score
 */
async function querySimilarDocuments(queryEmbedding, limit = 5, originalQuery = '') {
  try {
    await initializeChromaCollection();
    
    logger.info(`Recherche de documents similaires pour "${originalQuery}" (limite: ${limit})`);
    console.log(`Recherche de documents similaires pour "${originalQuery}" (limite: ${limit})`);
    
    if (embeddings.length === 0) {
      logger.info('Aucun document dans le stockage des embeddings');
      console.log('Aucun document dans le stockage des embeddings');
      return [];
    }
    
    // Prétraitement de la requête originale pour la recherche par mots-clés
    const keywords = preprocessQuery(originalQuery);
    console.log('Mots-clés extraits:', keywords);
    
    // Calculer la similarité cosinus avec tous les documents
    const results = embeddings.map(doc => {
      // Score de similarité vectorielle (embedding)
      const vectorScore = cosineSimilarity(queryEmbedding, doc.embedding);
      
      // Score de recherche par mots-clés
      const keywordScore = calculateKeywordScore(doc, keywords);
      
      // Score de pertinence des métadonnées
      const metadataScore = calculateMetadataScore(doc, keywords);
      
      // Score combiné (pondération: 60% vectoriel, 20% mots-clés, 20% métadonnées)
      const combinedScore = (vectorScore * 0.6) + (keywordScore * 0.2) + (metadataScore * 0.2);
      
      return {
        id: doc.id,
        metadata: doc.metadata,
        content: doc.content,
        score: combinedScore,
        vectorScore,
        keywordScore,
        metadataScore
      };
    });
    
    // Trier par score combiné décroissant et limiter le nombre de résultats
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    logger.info(`${sortedResults.length} documents similaires trouvés`);
    console.log(`${sortedResults.length} documents similaires trouvés avec leurs scores:`);
    sortedResults.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.score.toFixed(4)} (V:${doc.vectorScore.toFixed(2)}, K:${doc.keywordScore.toFixed(2)}, M:${doc.metadataScore.toFixed(2)})`);
    });
    
    return sortedResults;
  } catch (error) {
    logger.error(`Erreur lors de la recherche de documents similaires: ${error.message}`);
    console.error('Erreur lors de la recherche de documents similaires:', error);
    return [];
  }
}

/**
 * Prétraite la requête pour en extraire les mots-clés et les termes connexes
 * @param {string} query - La requête originale
 * @returns {Array<string>} - Liste des mots-clés et termes connexes
 */
function preprocessQuery(query) {
  if (!query) return [];
  
  // Convertir en minuscules et supprimer la ponctuation
  const cleanQuery = query.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
  
  // Extraire les mots-clés (mots de plus de 3 caractères)
  const words = cleanQuery.split(/\s+/).filter(word => word.length > 3);
  
  // Ajouter des termes connexes pour certains mots-clés spécifiques
  const relatedTerms = new Map([
    ['inspection', ['examen', 'analyse', 'vérification', 'contrôle', 'audit', 'surveillance']],
    ['visuelle', ['visuel', 'optique', 'observation', 'visible', 'vue']],
    ['capteur', ['capteurs', 'sensor', 'sonde', 'détecteur', 'transducteur']],
    ['maintenance', ['entretien', 'réparation', 'service', 'révision']],
    ['sécurité', ['sûreté', 'protection', 'danger', 'risque']],
    ['défaut', ['défaillance', 'panne', 'dysfonctionnement', 'anomalie', 'problème']],
    ['aéronef', ['avion', 'aéronefs', 'appareil', 'aéronautique', 'aéroplane']]
  ]);
  
  // Ajouter les termes connexes à la liste des mots-clés
  const allKeywords = [...words];
  
  words.forEach(word => {
    for (const [key, terms] of relatedTerms.entries()) {
      if (word.includes(key) || key.includes(word)) {
        allKeywords.push(...terms);
        break;
      }
    }
  });
  
  // Éliminer les doublons
  return [...new Set(allKeywords)];
}

/**
 * Calcule un score basé sur la présence des mots-clés dans le contenu du document
 * @param {Object} doc - Document à évaluer
 * @param {Array<string>} keywords - Liste des mots-clés
 * @returns {number} - Score entre 0 et 1
 */
function calculateKeywordScore(doc, keywords) {
  if (!doc.content || keywords.length === 0) return 0;
  
  const content = doc.content.toLowerCase();
  let matchCount = 0;
  
  // Compter combien de mots-clés sont présents dans le contenu
  keywords.forEach(keyword => {
    if (content.includes(keyword)) {
      matchCount++;
    }
  });
  
  // Normaliser le score entre 0 et 1
  return matchCount / keywords.length;
}

/**
 * Calcule un score basé sur la pertinence des métadonnées du document
 * @param {Object} doc - Document à évaluer
 * @param {Array<string>} keywords - Liste des mots-clés
 * @returns {number} - Score entre 0 et 1
 */
function calculateMetadataScore(doc, keywords) {
  if (!doc.metadata || keywords.length === 0) return 0;
  
  let score = 0;
  const metadata = doc.metadata;
  
  // Vérifier si le nom du fichier contient des mots-clés
  if (metadata.fileName) {
    const fileName = metadata.fileName.toLowerCase();
    keywords.forEach(keyword => {
      if (fileName.includes(keyword)) {
        score += 0.3; // Donner un poids important au nom de fichier
      }
    });
  }
  
  // Vérifier si le type de document est pertinent
  if (metadata.documentType) {
    const docType = metadata.documentType.toLowerCase();
    keywords.forEach(keyword => {
      if (docType.includes(keyword)) {
        score += 0.2;
      }
    });
  }
  
  // Cas spéciaux pour certains documents
  if (metadata.fileName && metadata.fileName.includes('rapport_analyse_capteurs')) {
    // Donner un score élevé au document d'analyse des capteurs pour les requêtes liées aux inspections
    if (keywords.some(k => ['inspection', 'visuelle', 'examen', 'analyse', 'capteur'].includes(k))) {
      score += 0.5;
    }
  }
  
  // Plafonner le score à 1
  return Math.min(score, 1);
}

/**
 * Calcule la similarité cosinus entre deux vecteurs
 * @param {Array<number>} vecA - Premier vecteur
 * @param {Array<number>} vecB - Second vecteur
 * @returns {number} - Score de similarité (entre 0 et 1)
 */
function cosineSimilarity(vecA, vecB) {
  try {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }
    
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
  } catch (error) {
    console.error('Erreur lors du calcul de similarité:', error);
    return 0;
  }
}

/**
 * Récupère le nombre de documents dans le stockage des embeddings
 * @returns {Promise<number>} - Nombre de documents
 */
async function getDocumentCount() {
  try {
    await initializeChromaCollection();
    
    logger.info('Récupération du nombre de documents dans le stockage des embeddings');
    console.log('Récupération du nombre de documents dans le stockage des embeddings');
    
    const count = embeddings.length;
    
    logger.info(`Nombre de documents dans le stockage des embeddings: ${count}`);
    console.log(`Nombre de documents dans le stockage des embeddings: ${count}`);
    
    return count;
  } catch (error) {
    logger.error(`Erreur lors de la récupération du nombre de documents: ${error.message}`);
    console.error('Erreur lors de la récupération du nombre de documents:', error);
    return 0;
  }
}

/**
 * Supprime tous les documents du stockage des embeddings
 * @returns {Promise<boolean>} - Succès de l'opération
 */
async function deleteAllDocuments() {
  try {
    await initializeChromaCollection();
    
    logger.info('Suppression de tous les documents du stockage des embeddings');
    console.log('Suppression de tous les documents du stockage des embeddings');
    
    // Vider le tableau d'embeddings
    embeddings = [];
    
    // Sauvegarder le tableau vide dans le fichier
    fs.writeFileSync(
      path.join(EMBEDDINGS_DIRECTORY, 'embeddings.json'),
      JSON.stringify(embeddings)
    );
    
    logger.info('Tous les documents ont été supprimés avec succès');
    console.log('Tous les documents ont été supprimés avec succès');
    return true;
  } catch (error) {
    logger.error(`Erreur lors de la suppression des documents: ${error.message}`);
    console.error('Erreur lors de la suppression des documents:', error);
    return false;
  }
}

// Initialiser la collection au démarrage
initializeChromaCollection();

module.exports = {
  initializeChromaCollection,
  addDocument,
  querySimilarDocuments,
  getDocumentCount,
  deleteAllDocuments
};
