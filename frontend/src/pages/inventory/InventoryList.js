import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  History as HistoryIcon
} from '@mui/icons-material';

// Sample data for demonstration
const sampleInventoryItems = [
  {
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
    serialNumbers: ['SN-12345', 'SN-12346', 'SN-12347', 'SN-12348', 'SN-12349', 'SN-12350', 'SN-12351', 'SN-12352', 'SN-12353', 'SN-12354', 'SN-12355', 'SN-12356']
  },
  {
    id: 'inv2',
    partNumber: 'A320-HYD-PUMP-01',
    name: 'Hydraulic Pump Assembly',
    category: 'hydraulic',
    subcategory: 'pump',
    manufacturer: 'Parker Aerospace',
    condition: 'new',
    quantity: 3,
    minimumQuantity: 2,
    location: 'Warehouse A - Shelf 5C',
    unitCost: 4200.00,
    totalValue: 12600.00,
    lastRestockDate: '2025-04-22',
    certifications: ['FAA-APPROVED', 'EASA-APPROVED'],
    serialNumbers: ['SN-45678', 'SN-45679', 'SN-45680']
  },
  {
    id: 'inv3',
    partNumber: 'A320-AVIONICS-DISPLAY',
    name: 'Cockpit Display Unit',
    category: 'avionics',
    subcategory: 'display',
    manufacturer: 'Honeywell',
    condition: 'new',
    quantity: 2,
    minimumQuantity: 1,
    location: 'Warehouse B - Secure Cabinet 2',
    unitCost: 15000.00,
    totalValue: 30000.00,
    lastRestockDate: '2025-05-01',
    certifications: ['FAA-APPROVED', 'EASA-APPROVED'],
    serialNumbers: ['SN-78901', 'SN-78902']
  },
  {
    id: 'inv4',
    partNumber: 'A320-LANDING-STRUT',
    name: 'Main Landing Gear Strut',
    category: 'landing_gear',
    subcategory: 'strut',
    manufacturer: 'Messier-Bugatti-Dowty',
    condition: 'refurbished',
    quantity: 1,
    minimumQuantity: 1,
    location: 'Warehouse A - Heavy Section 1',
    unitCost: 35000.00,
    totalValue: 35000.00,
    lastRestockDate: '2025-03-10',
    certifications: ['FAA-APPROVED', 'EASA-APPROVED'],
    serialNumbers: ['SN-24680']
  },
  {
    id: 'inv5',
    partNumber: 'GENERIC-FASTENER-M6',
    name: 'M6 Titanium Fasteners',
    category: 'hardware',
    subcategory: 'fastener',
    manufacturer: 'Aerospace Fasteners Inc.',
    condition: 'new',
    quantity: 500,
    minimumQuantity: 100,
    location: 'Warehouse A - Small Parts Section 2D',
    unitCost: 5.50,
    totalValue: 2750.00,
    lastRestockDate: '2025-05-05',
    certifications: ['FAA-APPROVED'],
    serialNumbers: []
  },
  {
    id: 'inv6',
    partNumber: 'A320-SEAT-ECONOMY',
    name: 'Economy Class Passenger Seat',
    category: 'interior',
    subcategory: 'seating',
    manufacturer: 'Recaro Aircraft Seating',
    condition: 'new',
    quantity: 30,
    minimumQuantity: 10,
    location: 'Warehouse C - Interior Section',
    unitCost: 1200.00,
    totalValue: 36000.00,
    lastRestockDate: '2025-04-28',
    certifications: ['FAA-APPROVED', 'EASA-APPROVED'],
    serialNumbers: []
  },
  {
    id: 'inv7',
    partNumber: 'A320-OXYGEN-MASK',
    name: 'Passenger Oxygen Mask Assembly',
    category: 'safety',
    subcategory: 'oxygen',
    manufacturer: 'Adams Rite Aerospace',
    condition: 'new',
    quantity: 150,
    minimumQuantity: 50,
    location: 'Warehouse B - Safety Equipment Section',
    unitCost: 85.00,
    totalValue: 12750.00,
    lastRestockDate: '2025-05-08',
    certifications: ['FAA-APPROVED', 'EASA-APPROVED'],
    serialNumbers: []
  },
  {
    id: 'inv8',
    partNumber: 'A320-BRAKE-ASSY',
    name: 'Main Wheel Brake Assembly',
    category: 'landing_gear',
    subcategory: 'brake',
    manufacturer: 'Meggitt Aircraft Braking Systems',
    condition: 'new',
    quantity: 4,
    minimumQuantity: 2,
    location: 'Warehouse A - Shelf 4D',
    unitCost: 8500.00,
    totalValue: 34000.00,
    lastRestockDate: '2025-04-18',
    certifications: ['FAA-APPROVED', 'EASA-APPROVED'],
    serialNumbers: ['SN-13579', 'SN-24680', 'SN-35791', 'SN-46802']
  }
];

const InventoryList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [inventory, setInventory] = useState(sampleInventoryItems);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleConditionFilterChange = (event) => {
    setConditionFilter(event.target.value);
  };

  const handleStockFilterChange = (event) => {
    setStockFilter(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleAddItem = () => {
    navigate('/inventory/new');
  };

  const handleViewItem = (id) => {
    navigate(`/inventory/${id}`);
  };

  const handleEditItem = (id) => {
    navigate(`/inventory/${id}/edit`);
  };

  const handleDeleteItem = (id) => {
    // In a real application, this would call an API
    setInventory(inventory.filter(item => item.id !== id));
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

  const filteredInventory = inventory.filter(item => {
    const stockStatus = getStockStatus(item);
    
    const matchesSearch = 
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;
    const matchesStock = stockFilter === 'all' || stockStatus === stockFilter;
    
    return matchesSearch && matchesCategory && matchesCondition && matchesStock;
  });

  // Apply pagination for table view
  const paginatedInventory = filteredInventory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
        >
          Add Inventory Item
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by part number, name, manufacturer, or location..."
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
                <MenuItem value="engine">Engine</MenuItem>
                <MenuItem value="hydraulic">Hydraulic</MenuItem>
                <MenuItem value="avionics">Avionics</MenuItem>
                <MenuItem value="landing_gear">Landing Gear</MenuItem>
                <MenuItem value="hardware">Hardware</MenuItem>
                <MenuItem value="interior">Interior</MenuItem>
                <MenuItem value="safety">Safety</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel id="condition-filter-label">Condition</InputLabel>
              <Select
                labelId="condition-filter-label"
                id="condition-filter"
                value={conditionFilter}
                label="Condition"
                onChange={handleConditionFilterChange}
              >
                <MenuItem value="all">All Conditions</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="refurbished">Refurbished</MenuItem>
                <MenuItem value="used">Used</MenuItem>
                <MenuItem value="repaired">Repaired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel id="stock-filter-label">Stock Status</InputLabel>
              <Select
                labelId="stock-filter-label"
                id="stock-filter"
                value={stockFilter}
                label="Stock Status"
                onChange={handleStockFilterChange}
              >
                <MenuItem value="all">All Stock Status</MenuItem>
                <MenuItem value="in_stock">In Stock</MenuItem>
                <MenuItem value="low_stock">Low Stock</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleViewModeChange('table')}
            sx={{ mr: 1 }}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleViewModeChange('cards')}
          >
            Card View
          </Button>
        </Box>
      </Paper>

      {viewMode === 'table' ? (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader aria-label="inventory table">
              <TableHead>
                <TableRow>
                  <TableCell>Part Number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Manufacturer</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Stock Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Unit Cost</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <TableRow hover key={item.id}>
                      <TableCell>{item.partNumber}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('_', ' ')}</TableCell>
                      <TableCell>{item.manufacturer}</TableCell>
                      <TableCell>{item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStockStatusLabel(stockStatus)}
                          color={getStockStatusColor(stockStatus)}
                          size="small"
                          icon={getStockStatusIcon(stockStatus)}
                        />
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewItem(item.id)}
                            color="primary"
                          >
                            <InventoryIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditItem(item.id)}
                            color="info"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteItem(item.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredInventory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item);
            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {item.name}
                      </Typography>
                      <Chip
                        label={getStockStatusLabel(stockStatus)}
                        color={getStockStatusColor(stockStatus)}
                        size="small"
                        icon={getStockStatusIcon(stockStatus)}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Part #: {item.partNumber}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ShippingIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {item.manufacturer}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                      Category: {item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('_', ' ')}
                      {item.subcategory && ` / ${item.subcategory.charAt(0).toUpperCase() + item.subcategory.slice(1)}`}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Condition: {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {item.quantity} {item.quantity < item.minimumQuantity && "(Below minimum)"}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Location: {item.location}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Unit Cost:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${item.unitCost.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <HistoryIcon color="action" sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                        Last Restocked: {new Date(item.lastRestockDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      size="small"
                      onClick={() => handleViewItem(item.id)}
                    >
                      View Details
                    </Button>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditItem(item.id)}
                          color="info"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {filteredInventory.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No inventory items found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search filters or add a new inventory item.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{ mt: 2 }}
          >
            Add Inventory Item
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default InventoryList;
