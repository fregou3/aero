import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Tabs,
  Tab,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon
} from '@mui/icons-material';

// Sample data for demonstration
const sampleItem = {
  id: 'inv1',
  partNumber: 'A320-ENG-01-BLADE',
  name: 'Engine Fan Blade',
  category: 'engine',
  subcategory: 'fan',
  manufacturer: 'Airbus',
  condition: 'new',
  quantity: 12,
  minimumQuantity: 5,
  location: 'Warehouse A - Shelf 3B',
  unitCost: 2500.00,
  totalValue: 30000.00,
  lastRestockDate: '2025-04-15',
  certifications: ['FAA-APPROVED', 'EASA-APPROVED'],
  serialNumbers: ['SN-12345', 'SN-12346', 'SN-12347', 'SN-12348', 'SN-12349', 'SN-12350', 'SN-12351', 'SN-12352', 'SN-12353', 'SN-12354', 'SN-12355', 'SN-12356'],
  description: 'High-performance titanium fan blade for A320 engines. Manufactured to meet strict aerospace standards and certified for use in commercial aircraft. Each blade undergoes rigorous testing for balance, structural integrity, and aerodynamic performance.',
  specifications: {
    material: 'Titanium Alloy Ti-6Al-4V',
    weight: '4.8 kg',
    dimensions: '580mm x 220mm x 45mm',
    lifespan: '25,000 flight hours',
    inspectionInterval: '5,000 flight hours'
  },
  compatibleAircraft: ['A320-214', 'A320-232', 'A320-271N'],
  documents: ['MAN-A320-ENG-01-BLADE', 'CERT-A320-ENG-01-BLADE', 'TEST-A320-ENG-01-BLADE'],
  transactionHistory: [
    {
      id: 'trx1',
      date: '2025-04-15',
      type: 'restock',
      quantity: 12,
      user: 'John Smith',
      notes: 'Initial stock'
    },
    {
      id: 'trx2',
      date: '2025-04-22',
      type: 'allocation',
      quantity: 2,
      aircraft: 'F-WXYZ',
      workOrder: 'WO-2025-112',
      user: 'Michael Johnson',
      notes: 'Allocated for engine maintenance'
    },
    {
      id: 'trx3',
      date: '2025-04-22',
      type: 'return',
      quantity: 1,
      aircraft: 'F-WXYZ',
      workOrder: 'WO-2025-112',
      user: 'Michael Johnson',
      notes: 'Returned - not needed'
    }
  ]
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRestockDialog, setOpenRestockDialog] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [restockNotes, setRestockNotes] = useState('');

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // For now, we'll simulate a loading delay and use sample data
    const timer = setTimeout(() => {
      setItem(sampleItem);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/inventory');
  };

  const handleEdit = () => {
    navigate(`/inventory/${id}/edit`);
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
    navigate('/inventory');
  };

  const handleOpenRestockDialog = () => {
    setOpenRestockDialog(true);
  };

  const handleCloseRestockDialog = () => {
    setOpenRestockDialog(false);
  };

  const handleRestock = () => {
    // In a real application, this would call an API
    const newQuantity = item.quantity + parseInt(restockQuantity, 10);
    
    // Add to transaction history
    const newTransaction = {
      id: `trx${item.transactionHistory.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      type: 'restock',
      quantity: parseInt(restockQuantity, 10),
      user: 'Current User', // In a real app, this would be the logged-in user
      notes: restockNotes
    };
    
    setItem({
      ...item,
      quantity: newQuantity,
      lastRestockDate: new Date().toISOString().split('T')[0],
      transactionHistory: [newTransaction, ...item.transactionHistory]
    });
    
    handleCloseRestockDialog();
    setRestockQuantity(1);
    setRestockNotes('');
  };

  const getStockStatus = (item) => {
    if (item.quantity <= 0) {
      return 'out_of_stock';
    } else if (item.quantity < item.minimumQuantity) {
      return 'low_stock';
    } else {
      return 'in_stock';
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'in_stock':
        return 'success';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStockStatusLabel = (status) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  const getStockStatusIcon = (status) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircleIcon />;
      case 'low_stock':
        return <WarningIcon />;
      case 'out_of_stock':
        return <WarningIcon />;
      default:
        return <InventoryIcon />;
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'restock':
        return 'success';
      case 'allocation':
        return 'info';
      case 'return':
        return 'warning';
      case 'disposal':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Loading inventory item details...</Typography>
      </Box>
    );
  }

  if (!item) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Inventory item not found</Typography>
      </Box>
    );
  }

  const stockStatus = getStockStatus(item);

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
          {item.name}
        </Typography>
        <Box>
          <Tooltip title="Generate QR Code">
            <IconButton
              color="primary"
              sx={{ mr: 1 }}
            >
              <QrCodeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Label">
            <IconButton
              color="primary"
              sx={{ mr: 1 }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenRestockDialog}
            sx={{ mr: 2 }}
          >
            Restock
          </Button>
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

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="inventory item tabs">
            <Tab label="Overview" />
            <Tab label="Specifications" />
            <Tab label="Serial Numbers" />
            <Tab label="Transaction History" />
            <Tab label="Documents" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Part Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {item.partNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Stock Status
                    </Typography>
                    <Chip
                      label={getStockStatusLabel(stockStatus)}
                      color={getStockStatusColor(stockStatus)}
                      size="small"
                      icon={getStockStatusIcon(stockStatus)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('_', ' ')}
                      {item.subcategory && ` / ${item.subcategory.charAt(0).toUpperCase() + item.subcategory.slice(1)}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Condition
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {item.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Inventory Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Quantity
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {item.quantity} {item.quantity < item.minimumQuantity && 
                        <Chip label="Below Minimum" color="warning" size="small" sx={{ ml: 1 }} />
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Minimum Quantity
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {item.minimumQuantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {item.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Restocked
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(item.lastRestockDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Supplier Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Manufacturer
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {item.manufacturer}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Unit Cost
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      ${item.unitCost.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Value
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      ${item.totalValue.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Certifications
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {item.certifications.map((cert, index) => (
                    <Chip key={index} label={cert} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Compatible Aircraft
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {item.compatibleAircraft.map((aircraft, index) => (
                    <Chip key={index} label={aircraft} color="info" variant="outlined" />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Technical Specifications
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableBody>
                    {Object.entries(item.specifications).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Maintenance Information
                </Typography>
                <Typography variant="body2" paragraph>
                  This part requires inspection every {item.specifications.inspectionInterval} and has an expected lifespan of {item.specifications.lifespan}.
                </Typography>
                <Typography variant="body2" paragraph>
                  When installing, ensure proper torque settings according to the maintenance manual. All fasteners should be replaced with new ones during installation.
                </Typography>
                <Typography variant="body2">
                  After installation, a balance check must be performed to ensure proper engine operation.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Serial Numbers ({item.serialNumbers.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={item.serialNumbers.length === 0}
            >
              Add Serial Number
            </Button>
          </Box>
          
          {item.serialNumbers.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Aircraft</TableCell>
                    <TableCell>Installation Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {item.serialNumbers.map((serialNumber, index) => (
                    <TableRow key={serialNumber}>
                      <TableCell>{serialNumber}</TableCell>
                      <TableCell>
                        <Chip 
                          label={index < 2 ? "Installed" : "In Stock"} 
                          color={index < 2 ? "info" : "success"} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {index < 2 ? (index === 0 ? "F-WXYZ (A320-214)" : "G-EFGH (A350-941)") : "-"}
                      </TableCell>
                      <TableCell>
                        {index < 2 ? (index === 0 ? "2025-03-15" : "2025-04-02") : "-"}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <InventoryIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Label">
                          <IconButton size="small" color="primary">
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No serial numbers available for this item
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This item is tracked by quantity only
              </Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Transaction History
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Aircraft</TableCell>
                  <TableCell>Work Order</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {item.transactionHistory.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} 
                        color={getTransactionTypeColor(transaction.type)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>{transaction.aircraft || "-"}</TableCell>
                    <TableCell>{transaction.workOrder || "-"}</TableCell>
                    <TableCell>{transaction.user}</TableCell>
                    <TableCell>{transaction.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Technical Documents
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {item.documents.length > 0 ? (
            <List>
              {item.documents.map((doc, index) => (
                <Paper key={index} sx={{ mb: 2 }}>
                  <ListItem
                    secondaryAction={
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/documents?search=${doc}`)}
                      >
                        View Document
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={doc}
                      secondary={
                        doc.startsWith('MAN') ? 'Maintenance Manual' : 
                        doc.startsWith('CERT') ? 'Certification Document' : 
                        doc.startsWith('TEST') ? 'Test Report' : 
                        'Technical Document'
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No documents available for this item
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/documents')}
                sx={{ mt: 2 }}
              >
                Browse Documents
              </Button>
            </Box>
          )}
        </TabPanel>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Inventory
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit Item
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Inventory Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this inventory item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog
        open={openRestockDialog}
        onClose={handleCloseRestockDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Restock Inventory Item</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Add inventory to the current stock level of {item.quantity} units.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Quantity to Add"
                type="number"
                fullWidth
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                value={restockNotes}
                onChange={(e) => setRestockNotes(e.target.value)}
                placeholder="Enter any additional information about this restock"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRestockDialog}>Cancel</Button>
          <Button onClick={handleRestock} color="primary" variant="contained">
            Restock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryDetail;
