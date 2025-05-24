const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const winston = require('winston');
const pdfService = require('./pdfService');

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

// Stockage en mémoire des embeddings (dans une application réelle, on utiliserait une base de données vectorielle)
let documentEmbeddings = [];
let isInitialized = false;

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
 * @returns {Promise<Object>} - Résultat de l'indexation
 */
async function indexDocuments(directory) {
  try {
    // Réinitialiser les embeddings
    documentEmbeddings = [];
    
    // Trouver tous les fichiers PDF
    const pdfFiles = pdfService.findPDFFiles(directory);
    logger.info(`${pdfFiles.length} fichiers PDF trouvés dans ${directory}`);
    
    let processedCount = 0;
    
    for (const filePath of pdfFiles) {
      try {
        const fileName = path.basename(filePath);
        logger.info(`Indexation du fichier ${fileName}`);
        
        // Extraire le texte du PDF
        const text = await pdfService.extractTextFromPDF(filePath);
        
        // Générer l'embedding
        const embedding = await generateEmbedding(text);
        
        // Analyser le contenu pour obtenir les métadonnées
        const analysis = await pdfService.analyzePDFContent(text, fileName);
        
        // Stocker l'embedding avec les métadonnées
        documentEmbeddings.push({
          id: documentEmbeddings.length + 1,
          title: fileName.replace('.pdf', ''),
          filePath: filePath,
          type: analysis.category,
          riskLevel: analysis.riskLevel,
          lastUpdate: new Date().toISOString().split('T')[0],
          relevance: analysis.relevance,
          keywords: analysis.keywords,
          embedding: embedding
        });
        
        processedCount++;
      } catch (error) {
        logger.error(`Erreur lors de l'indexation du fichier ${filePath}:`, error);
      }
    }
    
    isInitialized = processedCount > 0;
    
    return {
      success: true,
      documentCount: processedCount,
      isInitialized
    };
  } catch (error) {
    logger.error(`Erreur lors de l'indexation des documents:`, error);
    return {
      success: false,
      error: error.message,
      isInitialized: false
    };
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
    if (!isInitialized || documentEmbeddings.length === 0) {
      throw new Error("La base vectorielle n'est pas initialisée");
    }
    
    // Générer l'embedding de la requête
    const queryEmbedding = await generateEmbedding(query);
    
    // Calculer la similarité avec tous les documents
    const similarities = documentEmbeddings.map(doc => {
      const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
      return {
        ...doc,
        similarity
      };
    });
    
    // Trier par similarité décroissante et limiter le nombre de résultats
    const results = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(doc => {
        // Ne pas renvoyer l'embedding dans la réponse
        const { embedding, ...docWithoutEmbedding } = doc;
        return {
          ...docWithoutEmbedding,
          relevance: Math.round(doc.similarity * 100) // Convertir la similarité en pourcentage
        };
      });
    
    return results;
  } catch (error) {
    logger.error(`Erreur lors de la recherche de documents similaires:`, error);
    throw new Error(`Impossible de rechercher des documents: ${error.message}`);
  }
}

/**
 * Génère une réponse à une question en utilisant les documents pertinents
 * @param {string} question - Question posée
 * @returns {Promise<Object>} - Réponse générée et documents pertinents
 */
async function generateAnswer(question) {
  try {
    if (!isInitialized || documentEmbeddings.length === 0) {
      return {
        answer: "Je ne peux pas répondre à votre question car la base de connaissances n'a pas encore été initialisée. Veuillez d'abord indexer les documents.",
        relevantDocs: []
      };
    }
    
    // Rechercher les documents pertinents
    const relevantDocs = await searchSimilarDocuments(question, 3);
    
    if (relevantDocs.length === 0) {
      return {
        answer: "Je n'ai pas trouvé d'informations pertinentes dans la base de connaissances pour répondre à votre question.",
        relevantDocs: []
      };
    }
    
    // Construire le contexte à partir des documents pertinents
    let context = "Contexte extrait des documents pertinents:\n\n";
    for (const doc of relevantDocs) {
      try {
        const text = await pdfService.extractTextFromPDF(doc.filePath);
        // Limiter la taille du texte pour éviter de dépasser les limites de l'API
        const truncatedText = text.slice(0, 1000);
        context += `Document: ${doc.title}\n${truncatedText}\n\n`;
      } catch (error) {
        logger.error(`Erreur lors de l'extraction du texte pour le contexte:`, error);
      }
    }
    
    // Générer une réponse avec OpenAI
    const prompt = `
    En te basant sur le contexte fourni, réponds à la question suivante de manière précise et concise.
    Si tu ne trouves pas l'information dans le contexte, indique-le clairement.
    
    ${context}
    
    Question: ${question}
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es un assistant spécialisé en aéronautique qui répond aux questions en te basant uniquement sur les documents fournis." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    const answer = response.choices[0].message.content;
    
    // Préparer les documents pertinents pour la réponse (sans les embeddings)
    const relevantDocsForResponse = relevantDocs.map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      relevance: doc.relevance
    }));
    
    return {
      answer,
      relevantDocs: relevantDocsForResponse
    };
  } catch (error) {
    logger.error(`Erreur lors de la génération de la réponse:`, error);
    return {
      answer: `Je suis désolé, mais une erreur s'est produite lors de la génération de la réponse: ${error.message}`,
      relevantDocs: []
    };
  }
}

/**
 * Vérifie si la base vectorielle est initialisée
 * @returns {boolean} - État d'initialisation
 */
function getVectorDbStatus() {
  return {
    isInitialized,
    documentCount: documentEmbeddings.length
  };
}

module.exports = {
  indexDocuments,
  searchSimilarDocuments,
  generateAnswer,
  getVectorDbStatus
};
