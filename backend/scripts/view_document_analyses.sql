-- Script pour afficher le contenu de la table documentAnalyses
-- Exécutez ce script avec la commande suivante :
-- psql -U postgres -d aeromaintenance -p 5441 -f view_document_analyses.sql

-- Afficher toutes les tables de la base de données
\dt

-- Afficher la structure de la table documentAnalyses
\d "documentAnalyses"

-- Afficher le contenu de la table documentAnalyses
SELECT 
    id, 
    "fileName", 
    title, 
    type, 
    "riskLevel", 
    relevance, 
    "lastAnalyzed", 
    substring("fileHash", 1, 10) as "fileHashPrefix"
FROM 
    "documentAnalyses"
ORDER BY 
    id;

-- Afficher les statistiques de la table
SELECT 
    count(*) as "Total d'analyses",
    count(CASE WHEN "riskLevel" = 'faible' THEN 1 END) as "Risque faible",
    count(CASE WHEN "riskLevel" = 'normale' THEN 1 END) as "Risque normal",
    count(CASE WHEN "riskLevel" = 'élevée' THEN 1 END) as "Risque élevé",
    count(CASE WHEN "riskLevel" = 'inconnue' THEN 1 END) as "Risque inconnu"
FROM 
    "documentAnalyses";
