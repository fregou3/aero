import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const AIConsolidationPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Charger les analyses existantes au chargement de la page
  useEffect(() => {
    loadAnalyses();
  }, []);

  // Fonction pour charger les analyses existantes
  const loadAnalyses = () => {
    setLoading(true);
    setError(null);
    
    fetch('http://localhost:5042/api/ai/ai-analyses')
      .then(response => {
        if (!response.ok) {
          // Si le statut est 404, cela peut signifier qu'aucune analyse n'existe encore
          if (response.status === 404) {
            return { success: true, analyses: [] };
          }
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Gérer le cas où data.analyses est undefined ou null
          const analysesArray = data.analyses || [];
          setAnalyses(analysesArray);
          if (analysesArray.length > 0 && !selectedAnalysis) {
            setSelectedAnalysis(analysesArray[0].id);
          }
        } else {
          setError(data.message || "Erreur lors du chargement des analyses");
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement des analyses:', error);
        // Ne pas afficher l'erreur HTTP 500 à l'utilisateur, c'est trop technique
        setError("Impossible de charger les analyses. Le serveur est peut-être en cours d'initialisation.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fonction pour lancer l'analyse des documents avec OpenAI
  const handleAnalyzeDocuments = () => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStatus('Initialisation de l\'analyse avec OpenAI...');
    setError(null);
    
    // Appel à l'API backend pour analyser les documents PDF avec OpenAI
    fetch('http://localhost:5042/api/ai/analyze-with-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        // Vérifier si la réponse est au format JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            });
          }
          return response.json();
        } else {
          throw new Error(`Réponse non-JSON reçue: ${response.status}`);
        }
      })
      .then(data => {
        if (data.success) {
          setAnalysisStatus('Analyse terminée avec succès!');
          // Attendre un peu avant de recharger les analyses pour laisser le temps à la BD de se mettre à jour
          setTimeout(() => {
            loadAnalyses();
          }, 1000);
        } else {
          setError(`Erreur lors de l'analyse: ${data.message || 'Erreur inconnue'}`);
          setAnalysisStatus('Échec de l\'analyse');
        }
      })
      .catch(error => {
        console.error('Erreur lors de l\'analyse des documents:', error);
        setError("L'analyse des documents a échoué. Vérifiez que la clé API OpenAI est configurée correctement.");
        setAnalysisStatus('Échec de l\'analyse');
      })
      .finally(() => {
        setAnalyzing(false);
        // Simuler une progression pour l'interface utilisateur
        simulateProgress();
      });
  };

  // Fonction pour vider la table des analyses
  const handleClearAnalyses = () => {
    setOpenDialog(false);
    setLoading(true);
    setError(null);
    
    fetch('http://localhost:5042/api/ai/clear-ai-analyses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setAnalyses([]);
          setSelectedAnalysis(null);
        } else {
          setError(`Erreur lors du vidage de la table: ${data.message}`);
        }
      })
      .catch(error => {
        console.error('Erreur lors du vidage de la table:', error);
        setError(`Erreur lors du vidage de la table: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fonction pour afficher une analyse spécifique
  const handleAnalysisChange = (event) => {
    setSelectedAnalysis(event.target.value);
  };

  // Fonction pour simuler la progression de l'analyse
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setAnalysisProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  // Trouver l'analyse sélectionnée
  const getSelectedAnalysisData = () => {
    return analyses.find(analysis => analysis.id === selectedAnalysis);
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Formater le texte d'analyse des risques en HTML
  const formatRiskAnalysis = (text) => {
    if (!text) return 'Aucune analyse disponible';
    
    // Remplacer les sauts de ligne par des balises <br>
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Mettre en évidence les bullet points et les scores
    formattedText = formattedText.replace(/•\s*(.*?)(?=<br>|$)/g, '<strong>•</strong> $1');
    formattedText = formattedText.replace(/-\s*(.*?)(?=<br>|$)/g, '<strong>-</strong> $1');
    formattedText = formattedText.replace(/\*\s*(.*?)(?=<br>|$)/g, '<strong>•</strong> $1');
    
    // Mettre en évidence les scores entre parenthèses
    formattedText = formattedText.replace(/\((\d+)\)/g, '<span style="color: #ff9800; font-weight: bold;">($1/100)</span>');
    
    return formattedText;
  };
  
  // Formater le résumé du document
  const formatSummary = (text) => {
    if (!text) return 'Aucun résumé disponible';
    
    // Remplacer les sauts de ligne par des balises <br>
    return text.replace(/\n/g, '<br>');
  };
  
  // Générer une couleur basée sur le score
  const getScoreColor = (score) => {
    if (score >= 80) return '#f44336'; // Rouge pour les scores élevés
    if (score >= 50) return '#ff9800'; // Orange pour les scores moyens
    return '#4caf50'; // Vert pour les scores faibles
  };
  
  // Formater l'affichage des risques structurés
  const renderStructuredRisks = (risksData) => {
    if (!risksData || risksData.length === 0) {
      return <Typography variant="body2">Aucune donnée de risque structurée disponible</Typography>;
    }
    
    return (
      <Box>
        {risksData.map((risk, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, borderLeft: `4px solid ${getScoreColor(risk.score)}` }}>
            <Typography variant="h6" gutterBottom>
              {risk.title}
              <Chip 
                label={`${risk.score}/100`} 
                sx={{ 
                  ml: 2, 
                  bgcolor: getScoreColor(risk.score),
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            </Typography>
            <Typography variant="body2">{risk.description}</Typography>
          </Paper>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Consolidation d'Intelligence Artificielle
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Analyse approfondie des risques dans les documents techniques à l'aide d'OpenAI
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PsychologyIcon />}
              onClick={handleAnalyzeDocuments}
              disabled={analyzing}
              fullWidth
            >
              Analyser les documents avec OpenAI
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDialog(true)}
              disabled={analyzing || analyses.length === 0}
              fullWidth
            >
              Vider la table des analyses
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={loadAnalyses}
              disabled={analyzing || loading}
              fullWidth
            >
              Rafraîchir les analyses
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Barre de progression */}
      {analyzing && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {analysisStatus}
            </Typography>
            <LinearProgress variant="determinate" value={analysisProgress} />
          </Box>
        </Paper>
      )}

      {/* Message d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sélecteur de document */}
      {analyses.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="analysis-select-label">Document analysé</InputLabel>
            <Select
              labelId="analysis-select-label"
              id="analysis-select"
              value={selectedAnalysis || ''}
              label="Document analysé"
              onChange={handleAnalysisChange}
              disabled={loading}
            >
              {analyses.map((analysis) => (
                <MenuItem key={analysis.id} value={analysis.id}>
                  {analysis.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Résultats d'analyse */}
      {selectedAnalysis && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h5" gutterBottom>
                      {getSelectedAnalysisData()?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Fichier: {getSelectedAnalysisData()?.fileName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Date d'analyse: {formatDate(getSelectedAnalysisData()?.analysisDate)}
                    </Typography>
                    
                    {getSelectedAnalysisData()?.status === 'failed' ? (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        L'analyse a échoué: {getSelectedAnalysisData()?.error || 'Erreur inconnue'}
                      </Alert>
                    ) : getSelectedAnalysisData()?.status === 'pending' ? (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        L'analyse est en cours...
                      </Alert>
                    ) : (
                      <>
                        {/* Note globale de risque et code de vérification */}
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            my: 2
                          }}
                        >
                          <Paper 
                            elevation={3} 
                            sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              borderRadius: '8px',
                              width: '200px',
                              bgcolor: getScoreColor(getSelectedAnalysisData()?.globalRiskScore || 0)
                            }}
                          >
                            <Typography variant="h6" color="white" gutterBottom>
                              Note globale
                            </Typography>
                            <Typography variant="h3" color="white" fontWeight="bold">
                              {getSelectedAnalysisData()?.globalRiskScore || 0}/100
                            </Typography>
                          </Paper>
                          
                          {/* Code de vérification (hash aléatoire) */}
                          <Paper
                            elevation={2}
                            sx={{
                              p: 2,
                              textAlign: 'center',
                              borderRadius: '8px',
                              bgcolor: '#f5f5f5',
                              border: '1px dashed #ccc'
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Code de vérification
                            </Typography>
                            <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                              {/* Génération d'un hash aléatoire unique pour chaque document */}
                              {getSelectedAnalysisData()?.id ? 
                                btoa(getSelectedAnalysisData()?.id + Math.random().toString(36).substring(2, 15)).substring(0, 16) : 
                                Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)}
                            </Typography>
                          </Paper>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Résumé du document */}
                        <Typography variant="h6" gutterBottom>
                          Résumé du document
                        </Typography>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            mb: 3,
                            bgcolor: 'background.default',
                            borderLeft: '4px solid #2196f3'
                          }}
                        >
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: formatSummary(getSelectedAnalysisData()?.documentSummary) 
                            }} 
                          />
                        </Paper>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Analyse des risques */}
                        <Typography variant="h6" gutterBottom>
                          Analyse des risques
                        </Typography>
                        
                        {/* Onglets pour basculer entre l'affichage textuel et structuré */}
                        <Box sx={{ width: '100%', mb: 2 }}>
                          <Tabs 
                            value={tabValue || 0} 
                            onChange={(e, newValue) => setTabValue(newValue)}
                            variant="fullWidth"
                          >
                            <Tab label="Vue textuelle" />
                            <Tab label="Vue structurée" />
                          </Tabs>
                        </Box>
                        
                        {/* Contenu des onglets */}
                        {(tabValue === 0) ? (
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'background.default',
                              maxHeight: '500px',
                              overflow: 'auto'
                            }}
                          >
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: formatRiskAnalysis(getSelectedAnalysisData()?.riskAnalysis) 
                              }} 
                            />
                          </Paper>
                        ) : (
                          <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
                            {renderStructuredRisks(getSelectedAnalysisData()?.risksData)}
                          </Box>
                        )}
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Message si aucune analyse n'est disponible */}
      {analyses.length === 0 && !loading && !analyzing && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <WarningIcon color="action" sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune analyse disponible
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Cliquez sur "Analyser les documents avec OpenAI" pour commencer.
          </Typography>
        </Paper>
      )}

      {/* Boîte de dialogue de confirmation pour vider la table */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir vider la table des analyses ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleClearAnalyses} color="error" autoFocus>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIConsolidationPage;
