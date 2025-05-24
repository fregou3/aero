-- Requête pour afficher le contenu de la table documentAnalyses de manière plus lisible
\pset format wrapped
\pset columns 120
\pset border 2

SELECT 
    id, 
    "fileName" as "Nom du fichier", 
    title as "Titre", 
    type as "Type", 
    "riskLevel" as "Niveau de risque", 
    relevance as "Pertinence", 
    "lastAnalyzed" as "Date d'analyse"
FROM 
    "documentAnalyses" 
ORDER BY 
    id;

-- Statistiques des niveaux de risque
SELECT 
    count(*) as "Total d'analyses",
    count(CASE WHEN "riskLevel" = 'faible' THEN 1 END) as "Risque faible",
    count(CASE WHEN "riskLevel" = 'normale' THEN 1 END) as "Risque normal",
    count(CASE WHEN "riskLevel" = 'élevée' THEN 1 END) as "Risque élevé",
    count(CASE WHEN "riskLevel" = 'inconnue' THEN 1 END) as "Risque inconnu"
FROM 
    "documentAnalyses";
