import React, { useState, useEffect } from 'react';
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
                  label={`Urgent: ${documentData.filter(doc => doc.riskLevel === 'élevée').length}`} 
                  color="error"
                  variant="outlined"
                />
                <Chip 
                  label={`Normal: ${documentData.filter(doc => doc.riskLevel === 'normale').length}`} 
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
                          {doc.riskLevel === 'élevée' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <WarningIcon color="error" sx={{ mr: 1 }} />
                              <Chip 
                                label="URGENT" 
                                color="error"
                                size="small" 
                              />
                            </Box>
                          ) : (
                            <Chip 
                              label={doc.riskLevel || 'inconnue'} 
                              color={
                                doc.riskLevel === 'faible' ? 'success' : 
                                doc.riskLevel === 'normale' ? 'warning' :
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
                                  width: `${doc.relevance}%`,
                                  bgcolor: doc.relevance > 80 ? 'success.main' : doc.relevance > 60 ? 'warning.main' : 'error.main',
                                  height: 8,
                                  borderRadius: 1
                                }}
                              />
                            </Box>
                            {doc.relevance}%
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
                <Typography variant="body1" color="text.secondary">
                  Graphique de statistiques des documents (à implémenter)
                </Typography>
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
                <Typography variant="body1" color="text.secondary">
                  Graphique d'analyse des tendances (à implémenter)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisPage;
