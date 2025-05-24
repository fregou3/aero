import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Flight as FlightIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Sample data for demonstration
const sampleDocument = {
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
  description: 'Complete maintenance manual for Airbus A320 aircraft. Includes all systems and components.',
  sections: [
    {
      id: 'sec1',
      title: 'Introduction',
      pageNumbers: '1-15'
    },
    {
      id: 'sec2',
      title: 'Airframe',
      pageNumbers: '16-120'
    },
    {
      id: 'sec3',
      title: 'Landing Gear',
      pageNumbers: '121-180'
    },
    {
      id: 'sec4',
      title: 'Hydraulic Systems',
      pageNumbers: '181-250'
    },
    {
      id: 'sec5',
      title: 'Electrical Systems',
      pageNumbers: '251-320'
    },
    {
      id: 'sec6',
      title: 'Avionics',
      pageNumbers: '321-400'
    },
    {
      id: 'sec7',
      title: 'Engines',
      pageNumbers: '401-520'
    },
    {
      id: 'sec8',
      title: 'Fuel System',
      pageNumbers: '521-580'
    },
    {
      id: 'sec9',
      title: 'Environmental Control System',
      pageNumbers: '581-640'
    },
    {
      id: 'sec10',
      title: 'Appendices',
      pageNumbers: '641-700'
    }
  ],
  relatedDocuments: [
    {
      id: 'doc2',
      title: 'A320 Wiring Diagram - Main Electrical System',
      documentNumber: 'WD-A320-ELEC-001'
    },
    {
      id: 'doc5',
      title: 'A320 Engine Maintenance Procedure',
      documentNumber: 'PROC-A320-ENG-001'
    }
  ],
  revisionHistory: [
    {
      revision: 'Rev 12',
      date: '2025-01-15',
      author: 'Michael Johnson',
      changes: 'Updated engine maintenance procedures to reflect new manufacturer recommendations.'
    },
    {
      revision: 'Rev 11',
      date: '2024-11-20',
      author: 'Sarah Williams',
      changes: 'Updated electrical system diagrams and troubleshooting procedures.'
    },
    {
      revision: 'Rev 10',
      date: '2024-08-05',
      author: 'John Smith',
      changes: 'Annual review and update of all sections.'
    }
  ],
  relatedAircraft: [
    {
      id: '1',
      registrationNumber: 'F-WXYZ',
      model: 'A320-214'
    },
    {
      id: '2',
      registrationNumber: 'D-ABCD',
      model: 'A320-232'
    }
  ]
};

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // For now, we'll simulate a loading delay and use sample data
    const timer = setTimeout(() => {
      setDocument(sampleDocument);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleBack = () => {
    navigate('/documents');
  };

  const handleEdit = () => {
    navigate(`/documents/${id}/edit`);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = () => {
    // In a real application, this would call an API
    handleCloseDeleteDialog();
    navigate('/documents');
  };

  const handleDownload = () => {
    // In a real application, this would trigger a download
    console.log(`Downloading document ${id}`);
  };

  const handlePrint = () => {
    // In a real application, this would trigger printing
    console.log(`Printing document ${id}`);
  };

  const handleOpenShareDialog = () => {
    setOpenShareDialog(true);
  };

  const handleCloseShareDialog = () => {
    setOpenShareDialog(false);
  };

  const handleShare = () => {
    // In a real application, this would call an API to share the document
    console.log(`Sharing document ${id} with ${shareEmail}`);
    handleCloseShareDialog();
    setShareEmail('');
    setShareMessage('');
  };

  const handleViewRelatedDocument = (docId) => {
    navigate(`/documents/${docId}`);
  };

  const handleViewAircraft = (aircraftId) => {
    navigate(`/aircraft/${aircraftId}`);
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

  const formatCategoryName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Loading document details...</Typography>
      </Box>
    );
  }

  if (!document) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Document not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {document.title}
        </Typography>
        <Box>
          <Tooltip title="View Document">
            <IconButton
              color="primary"
              sx={{ mr: 1 }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton
              color="primary"
              onClick={handleDownload}
              sx={{ mr: 1 }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton
              color="primary"
              onClick={handlePrint}
              sx={{ mr: 1 }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton
              color="primary"
              onClick={handleOpenShareDialog}
              sx={{ mr: 1 }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              onClick={handleEdit}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={handleOpenDeleteDialog}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getFileIcon(document.fileType)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                Document Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Document Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {document.documentNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatCategoryName(document.category)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Aircraft Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {document.aircraft}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Current Revision
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {document.revision} ({new Date(document.revisionDate).toLocaleDateString()})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  File Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {document.fileType.toUpperCase()} ({document.fileSize})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Upload Information
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(document.uploadDate).toLocaleDateString()} by {document.uploadedBy}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {document.description}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {document.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Sections
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Section</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Pages</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {document.sections.map((section, index) => (
                    <TableRow key={section.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{section.title}</TableCell>
                      <TableCell>{section.pageNumbers}</TableCell>
                      <TableCell>
                        <Tooltip title="View Section">
                          <IconButton size="small" color="primary">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revision History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {document.revisionHistory.map((revision, index) => (
              <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < document.revisionHistory.length - 1 ? '1px dashed #ccc' : 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {revision.revision}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(revision.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Author: {revision.author}
                </Typography>
                <Typography variant="body2">
                  {revision.changes}
                </Typography>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Related Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {document.relatedDocuments.length > 0 ? (
              <List>
                {document.relatedDocuments.map((relatedDoc) => (
                  <ListItem key={relatedDoc.id} disablePadding>
                    <ListItemIcon>
                      <DescriptionIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={relatedDoc.title}
                      secondary={relatedDoc.documentNumber}
                    />
                    <Button
                      size="small"
                      onClick={() => handleViewRelatedDocument(relatedDoc.id)}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No related documents found
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Related Aircraft
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {document.relatedAircraft.length > 0 ? (
              <List>
                {document.relatedAircraft.map((aircraft) => (
                  <ListItem key={aircraft.id} disablePadding>
                    <ListItemIcon>
                      <FlightIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={aircraft.registrationNumber}
                      secondary={aircraft.model}
                    />
                    <Button
                      size="small"
                      onClick={() => handleViewAircraft(aircraft.id)}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No related aircraft found
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Documents
        </Button>
        <Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ mr: 2 }}
          >
            Download
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Document
          </Button>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Share Document Dialog */}
      <Dialog
        open={openShareDialog}
        onClose={handleCloseShareDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the email address of the person you want to share this document with.
          </DialogContentText>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            margin="dense"
          />
          <TextField
            label="Message (Optional)"
            multiline
            rows={3}
            fullWidth
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog}>Cancel</Button>
          <Button onClick={handleShare} color="primary" variant="contained">
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentDetail;
