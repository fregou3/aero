import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  Brush as BrushIcon
} from '@mui/icons-material';

const AIGlobalVisionPage = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Fonction pour charger le contenu HTML et CSS
  const loadContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Charger le fichier HTML amélioré
      const htmlResponse = await fetch('/global_vision/rapport_synthese_risques_ameliore.html');
      
      if (!htmlResponse.ok) {
        throw new Error(`Erreur HTTP lors du chargement du HTML: ${htmlResponse.status}`);
      }
      
      const htmlText = await htmlResponse.text();
      setHtmlContent(htmlText);
      
      // Charger le fichier CSS
      const cssResponse = await fetch('/global_vision/styles.css');
      
      if (!cssResponse.ok) {
        throw new Error(`Erreur HTTP lors du chargement du CSS: ${cssResponse.status}`);
      }
      
      const cssText = await cssResponse.text();
      setCssContent(cssText);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      setError(`Impossible de charger le rapport: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Charger le contenu HTML et CSS au chargement de la page
  useEffect(() => {
    loadContent();
  }, []);

  // Extraire uniquement le contenu du body du HTML
  const extractBodyContent = (html) => {
    if (!html) return '';
    
    // Utiliser une expression régulière pour extraire le contenu entre <body> et </body>
    const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/i);
    
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1];
    }
    
    // Si nous ne pouvons pas extraire le body, retourner le HTML complet
    return html;
  };

  // Extraire les styles du HTML
  const extractStyles = (html) => {
    if (!html) return '';
    
    // Utiliser une expression régulière pour extraire le contenu entre <style> et </style>
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
    
    if (styleMatch && styleMatch[1]) {
      return styleMatch[1];
    }
    
    return '';
  };

  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3, maxWidth: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Vision Globale des Risques
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Synthèse complète des risques identifiés à partir de l'analyse des documents techniques
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Bouton de rafraîchissement */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={loadContent}
          disabled={loading}
        >
          Rafraîchir le rapport
        </Button>

        {/* Onglets pour basculer entre les vues */}
        {!loading && !error && htmlContent && (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="options de visualisation"
          >
            <Tab 
              icon={<DescriptionIcon />} 
              label="Rapport" 
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab 
              icon={<BrushIcon />} 
              label="Source" 
              id="tab-1"
              aria-controls="tabpanel-1"
            />
          </Tabs>
        )}
      </Box>

      {/* Indicateur de chargement */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Message d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Contenu du rapport */}
      {!loading && !error && htmlContent && (
        <div role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          {tabValue === 0 && (
            <Paper sx={{ p: 3, width: '100%' }}>
              {/* Injecter le CSS externe avec modifications pour utiliser toute la largeur */}
              <style>
                {`
                ${cssContent}
                /* Modifications pour utiliser toute la largeur disponible */
                body {
                  max-width: 100% !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                .visual-container {
                  width: 100% !important;
                  max-width: 100% !important;
                  box-sizing: border-box;
                }
                .risk-matrix, .risk-table {
                  width: 100% !important;
                  table-layout: fixed;
                }
                .risk-matrix th, .risk-matrix td,
                .risk-table th, .risk-table td {
                  padding: 12px !important;
                }
                .evolution-chart {
                  width: 100% !important;
                  max-width: 100% !important;
                  height: 400px !important;
                  position: relative;
                }
                .chart-area {
                  width: 80% !important;
                  height: 300px !important;
                }
                .lifecycle-diagram {
                  width: 100% !important;
                  max-width: 100% !important;
                  overflow-x: auto;
                }
                .recommendations {
                  width: 100% !important;
                  box-sizing: border-box;
                }
                h1, h2, h3, h4 {
                  width: 100% !important;
                  box-sizing: border-box;
                }
                `}
              </style>
              
              {/* Injecter le contenu HTML */}
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: extractBodyContent(htmlContent) 
                }} 
                style={{ width: '100%' }}
              />
            </Paper>
          )}
        </div>
      )}

      {/* Affichage du code source */}
      {!loading && !error && htmlContent && (
        <div role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" aria-labelledby="tab-1">
          {tabValue === 1 && (
            <Box>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>HTML Source</Typography>
                <Box 
                  sx={{ 
                    maxHeight: '400px', 
                    overflow: 'auto', 
                    bgcolor: '#f5f5f5', 
                    p: 2, 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {htmlContent}
                </Box>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>CSS Source</Typography>
                <Box 
                  sx={{ 
                    maxHeight: '400px', 
                    overflow: 'auto', 
                    bgcolor: '#f5f5f5', 
                    p: 2, 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {cssContent}
                </Box>
              </Paper>
            </Box>
          )}
        </div>
      )}
    </Box>
  );
};

export default AIGlobalVisionPage;
