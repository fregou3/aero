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
  CircularProgress
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  FileDownload as ExportIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import WorkflowGraph from './WorkflowGraph';

// Données d'exemple pour le graphe de workflow
const sampleWorkflowData = {
  nodes: [
    // Documents - Niveau 1 (Haut) - Alignés horizontalement
    { id: 'doc1', type: 'documentNode', data: { label: 'Manuel de maintenance', category: 'Technical', status: 'approved' }, position: { x: 400, y: 80 } },
    { id: 'doc2', type: 'documentNode', data: { label: 'Procédure d\'inspection', category: 'Procedure', status: 'pending' }, position: { x: 100, y: 80 } },
    { id: 'doc3', type: 'documentNode', data: { label: 'Certificat de conformité', category: 'Certification', status: 'approved' }, position: { x: 700, y: 80 } },
    
    // Étapes de livraison - Niveau 2 - Alignés horizontalement
    { id: 'delivery1', type: 'deliveryNode', data: { label: 'Livraison initiale', date: '2025-04-10', responsible: 'Jean Dupont', status: 'approved' }, position: { x: 400, y: 250 } },
    { id: 'delivery2', type: 'deliveryNode', data: { label: 'Mise à jour documentation', date: '2025-04-25', responsible: 'Marie Laurent', status: 'pending' }, position: { x: 100, y: 250 } },
    
    // Étapes de validation - Niveau 3 - Alignés horizontalement
    { id: 'validation1', type: 'validationNode', data: { label: 'Validation technique', status: 'completed', validator: 'Pierre Martin' }, position: { x: 550, y: 420 } },
    { id: 'validation2', type: 'validationNode', data: { label: 'Approbation finale', status: 'pending', validator: 'Sophie Bernard' }, position: { x: 100, y: 420 } },
    
    // Pièces - Niveau 4 (Bas) - Alignés horizontalement
    { id: 'part1', type: 'partNode', data: { label: 'Moteur CFM56', partNumber: 'CFM56-5B', serialNumber: 'SN12345', status: 'pending' }, position: { x: 100, y: 590 } },
    { id: 'part2', type: 'partNode', data: { label: 'Support moteur', partNumber: 'SM-A320-001', serialNumber: 'SN54321', status: 'approved' }, position: { x: 700, y: 590 } }
  ],
  edges: [
    // Relations entre documents et étapes de livraison
    { id: 'e1-2', source: 'doc1', target: 'delivery1', animated: true, label: 'Livré le 10/04/2025', type: 'smoothstep' },
    { id: 'e2-5', source: 'doc2', target: 'delivery2', animated: true, label: 'Pour validation', type: 'smoothstep' },
    { id: 'e3-1', source: 'doc3', target: 'delivery1', animated: true, label: 'Livré le 10/04/2025', type: 'smoothstep' },
    
    // Relations entre étapes de livraison et validation
    { id: 'e4-6', source: 'delivery1', target: 'validation1', animated: true, label: 'Livré le 25/04/2025', type: 'smoothstep' },
    { id: 'e5-7', source: 'delivery2', target: 'validation2', animated: true, label: '', type: 'smoothstep' },
    
    // Relations entre validations et pièces
    { id: 'e6-8', source: 'validation1', target: 'part2', label: 'Certification pour', type: 'smoothstep' },
    { id: 'e7-8', source: 'validation2', target: 'part1', label: 'Documentation associée', type: 'smoothstep' },
    
    // Relations entre pièces
    { id: 'e8-9', source: 'part1', target: 'part2', label: 'Dépendance fonctionnelle', type: 'smoothstep' }
  ]
};

const WorkflowPage = () => {
  const [loading, setLoading] = useState(false);
  const [workflowData, setWorkflowData] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const graphContainerRef = React.useRef(null);
  
  // Gestionnaire d'événements pour le zoom avec la molette de la souris
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) { // Zoom uniquement si Ctrl ou Cmd est enfoncé
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newZoom = Math.max(0.5, Math.min(zoom + delta, 2)); // Limiter le zoom entre 0.5 et 2
        setZoom(newZoom);
      }
    };
    
    const container = graphContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [zoom]);
  
  const [selectedWorkflow, setSelectedWorkflow] = useState('maintenance');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Dans une application réelle, nous chargerions les données depuis une API
    // Pour cette démo, nous utilisons des données d'exemple
    const timer = setTimeout(() => {
      setWorkflowData(sampleWorkflowData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedWorkflow]);

  const handleWorkflowChange = (event) => {
    setSelectedWorkflow(event.target.value);
    setLoading(true);
  };

  const handleSearch = () => {
    // Logique de recherche à implémenter
    console.log('Recherche pour:', searchTerm);
  };

  const handleFilterChange = (event) => {
    setFilterCategory(event.target.value);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
  };

  const handleExport = () => {
    // Logique d'export à implémenter
    console.log('Export du workflow');
  };

  const handleSave = () => {
    // Logique de sauvegarde à implémenter
    console.log('Sauvegarde du workflow');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Workflow de Documentation et Pièces
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Visualisez et gérez les relations entre documents, étapes de livraison, validations et pièces.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="workflow-select-label">Type de workflow</InputLabel>
                  <Select
                    labelId="workflow-select-label"
                    id="workflow-select"
                    value={selectedWorkflow}
                    label="Type de workflow"
                    onChange={handleWorkflowChange}
                  >
                    <MenuItem value="maintenance">Workflow de maintenance</MenuItem>
                    <MenuItem value="certification">Workflow de certification</MenuItem>
                    <MenuItem value="inspection">Workflow d'inspection</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="filter-select-label">Filtrer par catégorie</InputLabel>
                  <Select
                    labelId="filter-select-label"
                    id="filter-select"
                    value={filterCategory}
                    label="Filtrer par catégorie"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">Toutes les catégories</MenuItem>
                    <MenuItem value="document">Documents</MenuItem>
                    <MenuItem value="delivery">Livraisons</MenuItem>
                    <MenuItem value="validation">Validations</MenuItem>
                    <MenuItem value="part">Pièces</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Rechercher"
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
              <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="Exporter">
                  <IconButton onClick={handleExport}>
                    <ExportIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sauvegarder">
                  <IconButton onClick={handleSave}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper 
            ref={graphContainerRef}
            sx={{ p: 1, height: 700, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
              <Tooltip title="Zoom avant">
                <IconButton onClick={handleZoomIn} size="small" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom arrière">
                <IconButton onClick={handleZoomOut} size="small" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Réinitialiser la vue">
                <IconButton onClick={handleResetView} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                  Chargement du workflow...
                </Typography>
              </Box>
            ) : (
              <WorkflowGraph 
                data={workflowData} 
                zoom={zoom}
                filter={filterCategory}
                search={searchTerm}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Légende
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#e3f2fd', borderRadius: '4px', mr: 1, border: '1px solid #90caf9' }} />
                <Typography variant="body2">Document</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#f1f8e9', borderRadius: '4px', mr: 1, border: '1px solid #aed581' }} />
                <Typography variant="body2">Étape de livraison</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#fff3e0', borderRadius: '4px', mr: 1, border: '1px solid #ffb74d' }} />
                <Typography variant="body2">Étape de validation</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#e8eaf6', borderRadius: '4px', mr: 1, border: '1px solid #9fa8da' }} />
                <Typography variant="body2">Pièce</Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              États des documents
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: 'success.main', borderRadius: '50%', mr: 1 }} />
                <Typography variant="body2">Approuvé</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: 'warning.main', borderRadius: '50%', mr: 1 }} />
                <Typography variant="body2">En attente</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 10, height: 10, bgcolor: 'error.main', borderRadius: '50%', mr: 1 }} />
                <Typography variant="body2">Rejeté</Typography>
              </Box>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Détails du workflow
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Type:</strong> {selectedWorkflow === 'maintenance' ? 'Workflow de maintenance' : 
                                     selectedWorkflow === 'certification' ? 'Workflow de certification' : 'Workflow d\'inspection'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Nombre de documents:</strong> {workflowData?.nodes.filter(n => n.type === 'documentNode').length || 0}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Nombre d'étapes:</strong> {(workflowData?.nodes.filter(n => n.type === 'deliveryNode').length || 0) + 
                                               (workflowData?.nodes.filter(n => n.type === 'validationNode').length || 0)}
            </Typography>
            <Typography variant="body2">
              <strong>Nombre de pièces:</strong> {workflowData?.nodes.filter(n => n.type === 'partNode').length || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkflowPage;
