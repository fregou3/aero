import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  BarChart as ChartIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Le tableau de documents sera rempli uniquement après l'analyse des PDF

// Composant pour le graphique en camembert des statistiques de documents
const PieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = 0;

  return (
    <svg width="400" height="300" viewBox="0 0 140 100">
      {/* Titre de la légende */}
      <text x="110" y="15" fontSize="5" fontWeight="bold" textAnchor="middle">
        Légende
      </text>
      <line x1="95" y1="18" x2="125" y2="18" stroke="#ccc" strokeWidth="0.5" />
      
      {/* Graphique en camembert */}
      <g transform="translate(45, 50)">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const endAngle = startAngle + angle;
          
          // Calcul des coordonnées pour le chemin d'arc
          const x1 = Math.cos((startAngle * Math.PI) / 180) * 40;
          const y1 = Math.sin((startAngle * Math.PI) / 180) * 40;
          const x2 = Math.cos((endAngle * Math.PI) / 180) * 40;
          const y2 = Math.sin((endAngle * Math.PI) / 180) * 40;
          
          // Déterminer si l'arc est grand (plus de 180 degrés)
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          // Créer le chemin d'arc
          const path = [
            `M ${x1} ${y1}`, // Déplacer au point de départ
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arc
            'L 0 0', // Ligne vers le centre
            'Z' // Fermer le chemin
          ].join(' ');
          
          // Calculer la position du texte de légende
          const labelAngle = startAngle + angle / 2;
          const labelX = Math.cos((labelAngle * Math.PI) / 180) * 20;
          const labelY = Math.sin((labelAngle * Math.PI) / 180) * 20;
          
          // Mettre à jour l'angle de départ pour le prochain segment
          const currentStartAngle = startAngle;
          startAngle = endAngle;
          
          return (
            <g key={index}>
              <path d={path} fill={item.color} stroke="#fff" strokeWidth="0.5" />
              {percentage > 5 && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="4"
                  fontWeight="bold"
                >
                  {Math.round(percentage)}%
                </text>
              )}
            </g>
          );
        })}
      </g>
      
      {/* Légende à droite */}
      <g transform="translate(95, 25)">
        {data.map((item, index) => (
          <g key={index} transform={`translate(0, ${index * 12})`}>
            <rect x="0" y="-4" width="8" height="8" fill={item.color} stroke="#ccc" strokeWidth="0.2" />
            <text x="12" y="0" fontSize="5" dominantBaseline="middle">
              {item.name} ({item.value})
            </text>
          </g>
        ))}
      </g>
      
      {/* Cadre autour de la légende */}
      <rect x="90" y="10" width="45" height={10 + data.length * 12} fill="none" stroke="#eee" strokeWidth="0.5" rx="2" />
    </svg>
  );
};

// Composant pour le graphique à barres des tendances
const BarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const barWidth = 80 / data.length;
  
  return (
    <svg width="300" height="300" viewBox="0 0 100 100">
      {/* Axe Y */}
      <line x1="10" y1="10" x2="10" y2="80" stroke="#333" strokeWidth="0.5" />
      {/* Axe X */}
      <line x1="10" y1="80" x2="90" y2="80" stroke="#333" strokeWidth="0.5" />
      
      {/* Graduations axe Y */}
      {[0, 25, 50, 75, 100].map((tick, index) => (
        <g key={index}>
          <line 
            x1="8" 
            y1={80 - (tick / 100) * 70} 
            x2="10" 
            y2={80 - (tick / 100) * 70} 
            stroke="#333" 
            strokeWidth="0.5" 
          />
          <text 
            x="6" 
            y={80 - (tick / 100) * 70} 
            fontSize="3" 
            textAnchor="end" 
            dominantBaseline="middle"
          >
            {tick}%
          </text>
        </g>
      ))}
      
      {/* Barres */}
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * 70;
        const x = 15 + index * barWidth;
        
        return (
          <g key={index}>
            <rect 
              x={x} 
              y={80 - barHeight} 
              width={barWidth - 5} 
              height={barHeight} 
              fill={item.color} 
            />
            <text 
              x={x + (barWidth - 5) / 2} 
              y={85} 
              fontSize="3" 
              textAnchor="middle"
              transform={`rotate(45, ${x + (barWidth - 5) / 2}, 85)`}
            >
              {item.name}
            </text>
            <text 
              x={x + (barWidth - 5) / 2} 
              y={80 - barHeight - 2} 
              fontSize="3" 
              textAnchor="middle"
            >
              {item.value}%
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Définition des mots-clés importants par catégorie de document
const keywordsByCategory = {
  'Technical': [
    'maintenance', 'inspection', 'réparation', 'structure', 'fuselage', 'aile', 'composant',
    'système', 'électrique', 'hydraulique', 'avionique', 'certification', 'conformité', 'test'
  ],
  'Procedure': [
    'procédure', 'étape', 'instruction', 'méthode', 'processus', 'protocole', 'vérification',
    'validation', 'inspection', 'maintenance', 'réparation', 'démontage', 'montage', 'test'
  ],
  'Report': [
    'rapport', 'analyse', 'résultat', 'conclusion', 'recommandation', 'observation', 'incident',
    'défaillance', 'usure', 'performance', 'évaluation', 'mesure', 'test', 'données'
  ],
  'Guide': [
    'guide', 'manuel', 'instruction', 'référence', 'utilisation', 'opération', 'formation',
    'apprentissage', 'tutoriel', 'conseil', 'recommandation', 'méthode', 'pratique'
  ],
  'Certification': [
    'certification', 'norme', 'standard', 'règlement', 'conformité', 'autorisation', 'validation',
    'approbation', 'qualité', 'sécurité', 'navigabilité', 'airworthiness', 'EASA', 'FAA'
  ]
};

// Fonction pour calculer la pertinence d'un document en fonction de ses mots-clés
const calculateKeywordRelevance = (doc) => {
  if (!doc.keywords || !doc.type || !keywordsByCategory[doc.type]) {
    return 0;
  }
  
  const categoryKeywords = keywordsByCategory[doc.type];
  let matchCount = 0;
  let totalWeight = 0;
  
  // Parcourir les mots-clés du document
  doc.keywords.forEach(keyword => {
    // Vérifier si le mot-clé est important pour cette catégorie
    if (categoryKeywords.includes(keyword.toLowerCase())) {
      matchCount++;
      totalWeight += 2; // Les mots-clés importants ont un poids plus élevé
    } else {
      totalWeight += 1; // Les autres mots-clés ont un poids standard
    }
  });
  
  // Calculer la pertinence en fonction du nombre de correspondances et du poids total
  if (totalWeight === 0) return 0;
  
  // Formule de pertinence: (matchCount * 2 + (doc.keywords.length - matchCount)) / (categoryKeywords.length * 2) * 100
  // Cette formule donne plus d'importance aux mots-clés importants pour la catégorie
  const relevance = Math.min(100, Math.round((matchCount * 2 + (doc.keywords.length - matchCount)) / (categoryKeywords.length) * 100));
  
  return relevance;
};

const AnalysisPage = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [documentData, setDocumentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState('all');
  const [analysisType, setAnalysisType] = useState('relevance');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState('');

  useEffect(() => {
    // Charger les analyses existantes au chargement de la page
    loadExistingAnalyses();
  }, []);
  
  // Fonction pour charger les analyses existantes depuis la base de données
  const loadExistingAnalyses = () => {
    setLoading(true);
    console.log('Chargement des analyses existantes...');
    
    // Appel à l'API backend pour récupérer les analyses existantes
    fetch('http://localhost:5042/api/ai/document-analyses', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        console.log('Réponse reçue de l\'API');
        return response.json();
      })
      .then(data => {
        console.log('Données reçues:', data);
        if (data.success && data.analyses && data.analyses.length > 0) {
          console.log(`${data.analyses.length} analyses trouvées`);
          // Formater les données pour correspondre à la structure attendue par le tableau
          const formattedData = data.analyses.map(analysis => {
            // S'assurer que les mots-clés sont correctement parsés
            let keywords = [];
            try {
              keywords = typeof analysis.keywords === 'string' 
                ? JSON.parse(analysis.keywords) 
                : (Array.isArray(analysis.keywords) ? analysis.keywords : []);
            } catch (e) {
              console.error('Erreur lors du parsing des mots-clés:', e);
              keywords = [];
            }
            
            return {
              id: analysis.id,
              title: analysis.title || analysis.fileName || `Document ${analysis.id}`,
              type: analysis.type || 'Non spécifié',
              riskLevel: analysis.riskLevel || 'inconnue',
              lastUpdate: analysis.lastAnalyzed ? new Date(analysis.lastAnalyzed).toLocaleDateString() : 'Inconnue',
              relevance: analysis.relevance || 0,
              keywords: keywords
            };
          });
          console.log('Données formatées:', formattedData);
          setDocumentData(formattedData);
        } else {
          console.log('Aucune analyse trouvée ou format de données incorrect');
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement des analyses:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearch = () => {
    // Logique de recherche
    console.log('Recherche:', searchTerm);
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleRiskLevelFilterChange = (event) => {
    setFilterRiskLevel(event.target.value);
  };

  const handleAnalysisTypeChange = (event) => {
    setAnalysisType(event.target.value);
  };

  const handleRefresh = () => {
    // Charger les analyses existantes depuis la base de données
    loadExistingAnalyses();
  };

  const handleDownloadReport = () => {
    console.log('Téléchargement du rapport d\'analyse');
  };

  // Fonction pour analyser les documents avec l'IA
  const handleAnalyzeDocuments = () => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStatus('Initialisation de l\'analyse...');
    
    // Appel à l'API backend pour analyser les documents PDF
    fetch('http://localhost:5042/api/ai/analyze-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        setAnalysisProgress(50);
        setAnalysisStatus('Traitement des résultats...');
        return response.json();
      })
      .then(data => {
        if (data.success && data.documents) {
          setDocumentData(data.documents);
          setAnalysisProgress(100);
          setAnalysisStatus('Analyse terminée avec succès');
        } else {
          throw new Error(data.message || 'Erreur lors de l\'analyse');
        }
      })
      .catch(error => {
        console.error('Erreur lors de l\'analyse des documents:', error);
        setAnalysisStatus(`Erreur: ${error.message}`);
        setAnalysisProgress(0);
      })
      .finally(() => {
        setTimeout(() => setAnalyzing(false), 1000);
      });
    
    // Fallback en cas d'erreur avec l'API
    const totalSteps = 5;
    const simulateAnalysis = (step) => {
      if (step > totalSteps) {
        // Analyse terminée - générer des données de démo
        const demoDocuments = [
          { 
            id: 1, 
            title: 'Manuel de maintenance A320', 
            type: 'Technical', 
            riskLevel: 'faible',
            lastUpdate: '2025-04-10',
            relevance: Math.floor(Math.random() * 30) + 70,
            keywords: ['maintenance', 'A320', 'procédure', 'inspection', ...generateRandomKeywords()]
          },
          { 
            id: 2, 
            title: 'Procédure d\'inspection moteur CFM56', 
            type: 'Procedure', 
            riskLevel: 'normale',
            lastUpdate: '2025-04-25',
            relevance: Math.floor(Math.random() * 30) + 70,
            keywords: ['inspection', 'CFM56', 'moteur', 'maintenance', ...generateRandomKeywords()]
          },
          { 
            id: 3, 
            title: 'Rapport d\'usure train d\'atterrissage A320', 
            type: 'Report', 
            riskLevel: 'élevée',
            lastUpdate: '2025-04-20',
            relevance: Math.floor(Math.random() * 30) + 70,
            keywords: ['usure', 'train d\'atterrissage', 'A320', 'maintenance', ...generateRandomKeywords()]
          }
        ];
        
        setDocumentData(demoDocuments);
        setAnalysisStatus('Analyse terminée avec succès!');
        setTimeout(() => {
          setAnalyzing(false);
          setAnalysisStatus('');
        }, 2000);
        return;
      }
      
      // Mettre à jour la progression et le statut
      const progress = Math.floor((step / totalSteps) * 100);
      setAnalysisProgress(progress);
      
      switch(step) {
        case 1:
          setAnalysisStatus('Extraction du contenu des documents...');
          break;
        case 2:
          setAnalysisStatus('Analyse sémantique du texte...');
          break;
        case 3:
          setAnalysisStatus('Identification des mots-clés...');
          break;
        case 4:
          setAnalysisStatus('Calcul des scores de pertinence...');
          break;
        case 5:
          setAnalysisStatus('Finalisation des résultats...');
          break;
        default:
          setAnalysisStatus('Traitement en cours...');
      }
      
      // Simuler le temps de traitement
      setTimeout(() => simulateAnalysis(step + 1), 1000);
    };
    
    // Démarrer la simulation
    setTimeout(() => simulateAnalysis(1), 500);
  };
  
  // Générer des mots-clés aléatoires pour la démo
  const generateRandomKeywords = () => {
    const allKeywords = [
      'airbus', 'boeing', 'maintenance', 'réparation', 'inspection', 
      'certification', 'conformité', 'aéronautique', 'structure', 
      'fuselage', 'avionique', 'hydraulique', 'moteur', 'turbine',
      'carburant', 'aérodynamique', 'composite', 'alliage', 'résistance'
    ];
    
    // Sélectionner 2-4 mots-clés aléatoires
    const count = Math.floor(Math.random() * 3) + 2;
    const keywords = [];
    
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * allKeywords.length);
      if (!keywords.includes(allKeywords[index])) {
        keywords.push(allKeywords[index]);
      }
    }
    
    return keywords;
  };

  // Filtrer les documents selon les critères
  const filteredDocuments = documentData.filter(doc => {
    // Filtrer par type
    if (filterType !== 'all' && doc.type !== filterType) {
      return false;
    }
    
    // Filtrer par niveau de risque
    if (filterRiskLevel !== 'all' && doc.riskLevel !== filterRiskLevel) {
      return false;
    }
    
    // Filtrer par terme de recherche
    if (searchTerm && !doc.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Trier les documents selon le type d'analyse
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (analysisType === 'relevance') {
      return b.relevance - a.relevance;
    } else if (analysisType === 'date') {
      return new Date(b.lastUpdate) - new Date(a.lastUpdate);
    }
    return 0;
  });

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analyse de Documents
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Analysez et explorez les documents techniques pour identifier les tendances et les relations.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Rechercher des documents"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton size="small" onClick={handleSearch}>
                        <SearchIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type de document</InputLabel>
                  <Select
                    value={filterType}
                    label="Type de document"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">Tous les types</MenuItem>
                    <MenuItem value="Technical">Technique</MenuItem>
                    <MenuItem value="Procedure">Procédure</MenuItem>
                    <MenuItem value="Certification">Certification</MenuItem>
                    <MenuItem value="Report">Rapport</MenuItem>
                    <MenuItem value="Guide">Guide</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Évaluation risque</InputLabel>
                  <Select
                    value={filterRiskLevel}
                    label="Évaluation risque"
                    onChange={handleRiskLevelFilterChange}
                  >
                    <MenuItem value="all">Tous les niveaux</MenuItem>
                    <MenuItem value="inconnue">Inconnue</MenuItem>
                    <MenuItem value="faible">Faible</MenuItem>
                    <MenuItem value="normale">Normale</MenuItem>
                    <MenuItem value="élevée">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type d'analyse</InputLabel>
                  <Select
                    value={analysisType}
                    label="Type d'analyse"
                    onChange={handleAnalysisTypeChange}
                  >
                    <MenuItem value="relevance">Pertinence</MenuItem>
                    <MenuItem value="date">Date de mise à jour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={analyzing ? <CircularProgress size={20} color="inherit" /> : <ChartIcon />}
                  onClick={handleAnalyzeDocuments}
                  disabled={analyzing}
                  size="small"
                >
                  Analyser
                </Button>
                <Tooltip title="Actualiser">
                  <IconButton onClick={handleRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Télécharger le rapport">
                  <IconButton onClick={handleDownloadReport}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {analyzing && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CircularProgress variant="determinate" value={analysisProgress} size={40} sx={{ mr: 2 }} />
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {analysisStatus}
                    </Typography>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress variant="determinate" value={analysisProgress} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {analysisProgress}% terminé
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* Ajout d'une ligne de statistiques des niveaux de risque */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Statistiques des niveaux de risque :
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip 
                  icon={<WarningIcon />}
                  label={`Urgent: ${documentData.filter(doc => doc.riskLevel === 'élevée' || doc.riskLevel === 'Urgent' || doc.riskLevel === 'urgent' || doc.riskLevel === 'URGENT').length}`} 
                  color="error"
                  variant="outlined"
                />
                <Chip 
                  label={`Normal: ${documentData.filter(doc => doc.riskLevel === 'normale' || doc.riskLevel === 'Normal' || doc.riskLevel === 'normal' || doc.riskLevel === 'NORMAL').length}`} 
                  color="warning"
                  variant="outlined"
                />
                <Chip 
                  label={`Faible: ${documentData.filter(doc => doc.riskLevel === 'faible').length}`} 
                  color="success"
                  variant="outlined"
                />
                <Chip 
                  label={`Inconnu: ${documentData.filter(doc => doc.riskLevel === 'inconnue').length}`} 
                  color="default"
                  variant="outlined"
                />


                <Chip 
                  label={`Total: ${documentData.length}`} 
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                  Chargement des données d'analyse...
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="tableau d'analyse de documents">
                  <TableHead>
                    <TableRow>
                      <TableCell>Titre du document</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Évaluation risque</TableCell>
                      <TableCell>Dernière mise à jour</TableCell>
                      <TableCell>Pertinence (%)</TableCell>
                      <TableCell>Mots-clés</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedDocuments.map((doc) => (
                      <TableRow
                        key={doc.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {doc.type === 'Technical' && <DocIcon color="primary" sx={{ mr: 1 }} />}
                            {doc.type === 'Procedure' && <PdfIcon color="secondary" sx={{ mr: 1 }} />}
                            {doc.type === 'Certification' && <PdfIcon color="success" sx={{ mr: 1 }} />}
                            {doc.type === 'Report' && <ChartIcon color="info" sx={{ mr: 1 }} />}
                            {doc.type === 'Guide' && <DocIcon color="warning" sx={{ mr: 1 }} />}
                            {doc.title}
                          </Box>
                        </TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>
                          {doc.riskLevel === 'élevée' || doc.riskLevel === 'Urgent' || doc.riskLevel === 'urgent' || doc.riskLevel === 'URGENT' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <WarningIcon color="error" />
                              <Chip 
                                label="URGENT" 
                                color="error"
                                size="small"
                                sx={{ borderRadius: '16px' }}
                              />
                            </Box>
                          ) : (
                            <Chip 
                              label={doc.riskLevel || 'inconnue'} 
                              color={
                                doc.riskLevel === 'faible' ? 'success' : 
                                doc.riskLevel === 'normale' || doc.riskLevel === 'Normal' || doc.riskLevel === 'normal' || doc.riskLevel === 'NORMAL' ? 'warning' :
                                'default'  // pour 'inconnue'
                              } 
                              size="small" 
                            />
                          )}
                        </TableCell>
                        <TableCell>{doc.lastUpdate}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 100,
                                mr: 1,
                                bgcolor: 'grey.300',
                                borderRadius: 1,
                                height: 8
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${calculateKeywordRelevance(doc)}%`,
                                  bgcolor: calculateKeywordRelevance(doc) > 80 ? 'success.main' : calculateKeywordRelevance(doc) > 60 ? 'warning.main' : 'error.main',
                                  height: 8,
                                  borderRadius: 1
                                }}
                              />
                            </Box>
                            {calculateKeywordRelevance(doc)}%
                          </Box>
                        </TableCell>
                        <TableCell>
                          {doc.keywords.map((keyword, index) => (
                            <Chip 
                              key={index} 
                              label={keyword} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques des documents
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Répartition des documents par niveau de risque
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <PieChart 
                  data={[
                    { 
                      name: 'Urgent', 
                      value: documentData.filter(doc => doc.riskLevel === 'élevée' || doc.riskLevel === 'Urgent' || doc.riskLevel === 'urgent' || doc.riskLevel === 'URGENT').length, 
                      color: '#f44336' 
                    },
                    { 
                      name: 'Normal', 
                      value: documentData.filter(doc => doc.riskLevel === 'normale' || doc.riskLevel === 'Normal' || doc.riskLevel === 'normal' || doc.riskLevel === 'NORMAL').length, 
                      color: '#ff9800' 
                    },
                    { 
                      name: 'Faible', 
                      value: documentData.filter(doc => doc.riskLevel === 'faible').length, 
                      color: '#4caf50' 
                    },
                    { 
                      name: 'Inconnu', 
                      value: documentData.filter(doc => doc.riskLevel === 'inconnue').length, 
                      color: '#9e9e9e' 
                    }
                  ]}
                />
              </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analyse des tendances
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Pertinence des documents par type (basée sur les mots-clés)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <BarChart 
                  data={[
                    { 
                      name: 'Technical', 
                      value: Math.round(documentData.filter(doc => doc.type === 'Technical').reduce((sum, doc) => {
                        // Calculer la pertinence basée sur les mots-clés pour chaque document
                        const keywordRelevance = calculateKeywordRelevance(doc);
                        return sum + keywordRelevance;
                      }, 0) / (documentData.filter(doc => doc.type === 'Technical').length || 1)), 
                      color: '#2196f3' 
                    },
                    { 
                      name: 'Procedure', 
                      value: Math.round(documentData.filter(doc => doc.type === 'Procedure').reduce((sum, doc) => {
                        const keywordRelevance = calculateKeywordRelevance(doc);
                        return sum + keywordRelevance;
                      }, 0) / (documentData.filter(doc => doc.type === 'Procedure').length || 1)), 
                      color: '#9c27b0' 
                    },

                    { 
                      name: 'Guide', 
                      value: Math.round(documentData.filter(doc => doc.type === 'Guide').reduce((sum, doc) => {
                        const keywordRelevance = calculateKeywordRelevance(doc);
                        return sum + keywordRelevance;
                      }, 0) / (documentData.filter(doc => doc.type === 'Guide').length || 1)), 
                      color: '#009688' 
                    },
                    { 
                      name: 'Certification', 
                      value: Math.round(documentData.filter(doc => doc.type === 'Certification').reduce((sum, doc) => {
                        const keywordRelevance = calculateKeywordRelevance(doc);
                        return sum + keywordRelevance;
                      }, 0) / (documentData.filter(doc => doc.type === 'Certification').length || 1)), 
                      color: '#673ab7' 
                    }
                  ]}
                />
              </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisPage;
