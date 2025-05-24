import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Sample data for demonstration
const sampleDocuments = [
  {
    id: 'doc1',
    title: 'A320 Maintenance Manual',
    documentNumber: 'MAN-A320-001',
    category: 'maintenance_manual',
    aircraft: 'A320',
    revision: 'Rev 12',
    revisionDate: '2025-01-15',
    fileType: 'pdf',
    fileSize: '24.5 MB',
    uploadDate: '2025-02-10',
    uploadedBy: 'John Smith',
    tags: ['maintenance', 'manual', 'a320'],
    description: 'Complete maintenance manual for Airbus A320 aircraft. Includes all systems and components.'
  },
  {
    id: 'doc2',
    title: 'A320 Wiring Diagram - Main Electrical System',
    documentNumber: 'WD-A320-ELEC-001',
    category: 'wiring_diagram',
    aircraft: 'A320',
    revision: 'Rev 5',
    revisionDate: '2024-11-20',
    fileType: 'pdf',
    fileSize: '8.2 MB',
    uploadDate: '2025-01-05',
    uploadedBy: 'Sarah Williams',
    tags: ['wiring', 'electrical', 'diagram', 'a320'],
    description: 'Detailed wiring diagram for the main electrical system of the A320 aircraft.'
  },
  {
    id: 'doc3',
    title: 'A350 Component Location Diagram',
    documentNumber: 'CL-A350-001',
    category: 'component_location',
    aircraft: 'A350',
    revision: 'Rev 3',
    revisionDate: '2025-02-28',
    fileType: 'pdf',
    fileSize: '15.7 MB',
    uploadDate: '2025-03-10',
    uploadedBy: 'Michael Johnson',
    tags: ['component', 'location', 'diagram', 'a350'],
    description: 'Diagram showing the location of all major components in the A350 aircraft.'
  },
  {
    id: 'doc4',
    title: 'Service Bulletin - A320 Landing Gear Inspection',
    documentNumber: 'SB-A320-LG-042',
    category: 'service_bulletin',
    aircraft: 'A320',
    revision: 'Rev 1',
    revisionDate: '2025-04-05',
    fileType: 'pdf',
    fileSize: '3.4 MB',
    uploadDate: '2025-04-10',
    uploadedBy: 'John Smith',
    tags: ['service bulletin', 'landing gear', 'inspection', 'a320'],
    description: 'Service bulletin detailing required inspections for A320 landing gear components.'
  },
  {
    id: 'doc5',
    title: 'A320 Engine Maintenance Procedure',
    documentNumber: 'PROC-A320-ENG-001',
    category: 'procedure',
    aircraft: 'A320',
    revision: 'Rev 7',
    revisionDate: '2025-03-12',
    fileType: 'pdf',
    fileSize: '5.8 MB',
    uploadDate: '2025-03-15',
    uploadedBy: 'Michael Johnson',
    tags: ['procedure', 'engine', 'maintenance', 'a320'],
    description: 'Step-by-step procedure for performing routine maintenance on A320 engines.'
  },
  {
    id: 'doc6',
    title: 'A330 Illustrated Parts Catalog',
    documentNumber: 'IPC-A330-001',
    category: 'parts_catalog',
    aircraft: 'A330',
    revision: 'Rev 9',
    revisionDate: '2025-01-30',
    fileType: 'pdf',
    fileSize: '42.1 MB',
    uploadDate: '2025-02-15',
    uploadedBy: 'Sarah Williams',
    tags: ['parts', 'catalog', 'illustrated', 'a330'],
    description: 'Comprehensive illustrated parts catalog for the A330 aircraft.'
  },
  {
    id: 'doc7',
    title: 'A380 Hydraulic System Schematic',
    documentNumber: 'SCH-A380-HYD-001',
    category: 'schematic',
    aircraft: 'A380',
    revision: 'Rev 4',
    revisionDate: '2024-12-10',
    fileType: 'pdf',
    fileSize: '7.3 MB',
    uploadDate: '2025-01-20',
    uploadedBy: 'John Smith',
    tags: ['schematic', 'hydraulic', 'system', 'a380'],
    description: 'Detailed schematic of the A380 hydraulic system including all components and connections.'
  },
  {
    id: 'doc8',
    title: 'Aircraft Maintenance Log Template',
    documentNumber: 'TEMP-LOG-001',
    category: 'template',
    aircraft: 'All',
    revision: 'Rev 2',
    revisionDate: '2025-02-05',
    fileType: 'docx',
    fileSize: '0.8 MB',
    uploadDate: '2025-02-10',
    uploadedBy: 'Sarah Williams',
    tags: ['template', 'log', 'maintenance'],
    description: 'Standard template for recording aircraft maintenance activities.'
  }
];

const DocumentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearchTerm = queryParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [aircraftFilter, setAircraftFilter] = useState('all');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [documents, setDocuments] = useState(sampleDocuments);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleAircraftFilterChange = (event) => {
    setAircraftFilter(event.target.value);
  };

  const handleFileTypeFilterChange = (event) => {
    setFileTypeFilter(event.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleAddDocument = () => {
    navigate('/documents/new');
  };

  const handleViewDocument = (id) => {
    navigate(`/documents/${id}`);
  };

  const handleEditDocument = (id) => {
    navigate(`/documents/${id}/edit`);
  };

  const handleDeleteDocument = (id) => {
    // In a real application, this would call an API
    setDocuments(documents.filter(document => document.id !== id));
  };

  const handleDownloadDocument = (id) => {
    // In a real application, this would trigger a download
    console.log(`Downloading document ${id}`);
  };

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <PdfIcon color="error" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon color="primary" />;
      case 'docx':
      case 'doc':
        return <DescriptionIcon color="info" />;
      default:
        return <FileIcon />;
    }
  };

  // Function removed as it was unused

  const formatCategoryName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = 
      document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || document.category === categoryFilter;
    const matchesAircraft = aircraftFilter === 'all' || document.aircraft === aircraftFilter || (aircraftFilter === 'other' && !['A320', 'A330', 'A350', 'A380'].includes(document.aircraft));
    const matchesFileType = fileTypeFilter === 'all' || document.fileType === fileTypeFilter;
    
    return matchesSearch && matchesCategory && matchesAircraft && matchesFileType;
  });

  // Get unique aircraft types for filter
  const aircraftTypes = ['A320', 'A330', 'A350', 'A380', 'All', 'Other'];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Technical Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDocument}
        >
          Upload Document
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by title, document number, or keywords..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={categoryFilter}
                label="Category"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="maintenance_manual">Maintenance Manual</MenuItem>
                <MenuItem value="wiring_diagram">Wiring Diagram</MenuItem>
                <MenuItem value="component_location">Component Location</MenuItem>
                <MenuItem value="service_bulletin">Service Bulletin</MenuItem>
                <MenuItem value="procedure">Procedure</MenuItem>
                <MenuItem value="parts_catalog">Parts Catalog</MenuItem>
                <MenuItem value="schematic">Schematic</MenuItem>
                <MenuItem value="template">Template</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel id="aircraft-filter-label">Aircraft</InputLabel>
              <Select
                labelId="aircraft-filter-label"
                id="aircraft-filter"
                value={aircraftFilter}
                label="Aircraft"
                onChange={handleAircraftFilterChange}
              >
                <MenuItem value="all">All Aircraft</MenuItem>
                {aircraftTypes.map((type) => (
                  type !== 'All' && <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel id="file-type-filter-label">File Type</InputLabel>
              <Select
                labelId="file-type-filter-label"
                id="file-type-filter"
                value={fileTypeFilter}
                label="File Type"
                onChange={handleFileTypeFilterChange}
              >
                <MenuItem value="all">All File Types</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="docx">Word Document</MenuItem>
                <MenuItem value="jpg">Image</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleViewModeChange('list')}
            sx={{ mr: 1 }}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleViewModeChange('grid')}
          >
            Grid View
          </Button>
        </Box>
      </Paper>

      {viewMode === 'list' ? (
        <Paper>
          <List>
            {filteredDocuments.map((document) => (
              <React.Fragment key={document.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Tooltip title="View">
                        <IconButton
                          edge="end"
                          aria-label="view"
                          onClick={() => handleViewDocument(document.id)}
                          sx={{ mr: 1 }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          edge="end"
                          aria-label="download"
                          onClick={() => handleDownloadDocument(document.id)}
                          sx={{ mr: 1 }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleEditDocument(document.id)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteDocument(document.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  disablePadding
                >
                  <ListItemButton onClick={() => handleViewDocument(document.id)}>
                    <ListItemIcon>
                      {getFileIcon(document.fileType)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" component="span">
                            {document.title}
                          </Typography>
                          <Chip
                            label={document.aircraft}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 2 }}
                          />
                          <Chip
                            label={formatCategoryName(document.category)}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" color="text.primary">
                            {document.documentNumber}
                          </Typography>
                          {' — '}
                          {document.description.substring(0, 100)}
                          {document.description.length > 100 ? '...' : ''}
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                              {document.revision} ({new Date(document.revisionDate).toLocaleDateString()})
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                              {document.fileType.toUpperCase()} • {document.fileSize}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </React.Fragment>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredDocuments.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getFileIcon(document.fileType)}
                    <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                      {document.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Document #: {document.documentNumber}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    <Chip label={document.aircraft} size="small" color="primary" variant="outlined" />
                    <Chip label={formatCategoryName(document.category)} size="small" color="secondary" variant="outlined" />
                    <Chip label={document.fileType.toUpperCase()} size="small" />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {document.description.substring(0, 100)}
                    {document.description.length > 100 ? '...' : ''}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Revision: {document.revision}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Size: {document.fileSize}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Updated: {new Date(document.revisionDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    size="small"
                    onClick={() => handleViewDocument(document.id)}
                    startIcon={<VisibilityIcon />}
                  >
                    View
                  </Button>
                  <Box>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadDocument(document.id)}
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditDocument(document.id)}
                        color="info"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDocument(document.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {filteredDocuments.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No documents found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search filters or upload a new document.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddDocument}
            sx={{ mt: 2 }}
          >
            Upload Document
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default DocumentList;
