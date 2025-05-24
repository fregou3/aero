import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Sample data for demonstration
const sampleAircraft = {
  id: '1',
  registrationNumber: 'F-WXYZ',
  model: 'A320-214',
  manufacturer: 'Airbus',
  status: 'active'
};

const sampleParts = [
  {
    id: 'p1',
    partNumber: 'A320-WING-01',
    name: 'Wing Assembly - Left',
    category: 'wing_left',
    status: 'installed',
    installationDate: '2023-06-15',
    lifeLimitHours: 25000,
    currentHours: 12500,
    manufacturer: 'Airbus',
    serialNumber: 'WL-123456'
  },
  {
    id: 'p2',
    partNumber: 'A320-WING-02',
    name: 'Wing Assembly - Right',
    category: 'wing_right',
    status: 'installed',
    installationDate: '2023-06-15',
    lifeLimitHours: 25000,
    currentHours: 12500,
    manufacturer: 'Airbus',
    serialNumber: 'WR-123457'
  },
  {
    id: 'p3',
    partNumber: 'A320-ENG-01',
    name: 'Engine - Left',
    category: 'engine',
    status: 'installed',
    installationDate: '2024-01-10',
    lifeLimitHours: 15000,
    currentHours: 2500,
    manufacturer: 'CFM International',
    serialNumber: 'CFM56-5B4-12345'
  },
  {
    id: 'p4',
    partNumber: 'A320-ENG-02',
    name: 'Engine - Right',
    category: 'engine',
    status: 'installed',
    installationDate: '2024-01-10',
    lifeLimitHours: 15000,
    currentHours: 2500,
    manufacturer: 'CFM International',
    serialNumber: 'CFM56-5B4-12346'
  },
  {
    id: 'p5',
    partNumber: 'A320-LG-01',
    name: 'Landing Gear - Nose',
    category: 'landing_gear',
    status: 'installed',
    installationDate: '2023-08-22',
    lifeLimitHours: 20000,
    currentHours: 12500,
    manufacturer: 'Messier-Bugatti-Dowty',
    serialNumber: 'LGN-98765'
  },
  {
    id: 'p6',
    partNumber: 'A320-AVIONICS-01',
    name: 'Flight Control Computer',
    category: 'avionics',
    status: 'installed',
    installationDate: '2023-11-05',
    lifeLimitHours: 30000,
    currentHours: 12500,
    manufacturer: 'Thales',
    serialNumber: 'FCC-TH-54321'
  }
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`parts-tabpanel-${index}`}
      aria-labelledby={`parts-tab-${index}`}
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

const AircraftParts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aircraft, setAircraft] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // For now, we'll simulate a loading delay and use sample data
    const timer = setTimeout(() => {
      setAircraft(sampleAircraft);
      setParts(sampleParts);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleBack = () => {
    navigate(`/aircraft/${id}`);
  };

  const handleAddPart = () => {
    navigate(`/aircraft/${id}/parts/new`);
  };

  const handleViewPart = (partId) => {
    navigate(`/aircraft/${id}/parts/${partId}`);
  };

  const handleEditPart = (partId) => {
    navigate(`/aircraft/${id}/parts/${partId}/edit`);
  };

  const handleDeletePart = (partId) => {
    // In a real application, this would call an API
    setParts(parts.filter(part => part.id !== partId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'installed':
        return 'success';
      case 'removed':
        return 'warning';
      case 'in_repair':
        return 'info';
      case 'scrapped':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'installed':
        return <CheckCircleIcon color="success" />;
      case 'removed':
        return <WarningIcon color="warning" />;
      case 'in_repair':
        return <BuildIcon color="info" />;
      case 'scrapped':
        return <WarningIcon color="error" />;
      default:
        return <SettingsIcon />;
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'fuselage_front':
        return 'Fuselage - Front';
      case 'fuselage_center':
        return 'Fuselage - Center';
      case 'fuselage_rear':
        return 'Fuselage - Rear';
      case 'wing_left':
        return 'Wing - Left';
      case 'wing_right':
        return 'Wing - Right';
      case 'empennage':
        return 'Empennage';
      case 'landing_gear':
        return 'Landing Gear';
      case 'engine':
        return 'Engine';
      case 'avionics':
        return 'Avionics';
      case 'hydraulics':
        return 'Hydraulics';
      case 'electrical':
        return 'Electrical';
      default:
        return category;
    }
  };

  const filteredParts = parts.filter(part => {
    const matchesSearch = 
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Loading aircraft parts...</Typography>
      </Box>
    );
  }

  if (!aircraft) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Aircraft not found</Typography>
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
          Aircraft Parts: {aircraft.registrationNumber}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPart}
        >
          Add Part
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="parts tabs">
            <Tab label="All Parts" />
            <Tab label="By Category" />
            <Tab label="Critical Parts" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by part number, name, or serial number..."
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
              sx={{ mr: 2 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={categoryFilter}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="fuselage_front">Fuselage - Front</MenuItem>
                <MenuItem value="fuselage_center">Fuselage - Center</MenuItem>
                <MenuItem value="fuselage_rear">Fuselage - Rear</MenuItem>
                <MenuItem value="wing_left">Wing - Left</MenuItem>
                <MenuItem value="wing_right">Wing - Right</MenuItem>
                <MenuItem value="empennage">Empennage</MenuItem>
                <MenuItem value="landing_gear">Landing Gear</MenuItem>
                <MenuItem value="engine">Engine</MenuItem>
                <MenuItem value="avionics">Avionics</MenuItem>
                <MenuItem value="hydraulics">Hydraulics</MenuItem>
                <MenuItem value="electrical">Electrical</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={3}>
            {filteredParts.map((part) => (
              <Grid item xs={12} sm={6} md={4} key={part.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {part.name}
                      </Typography>
                      <Chip
                        label={part.status}
                        color={getStatusColor(part.status)}
                        size="small"
                        icon={getStatusIcon(part.status)}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Part Number: {part.partNumber}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Serial Number: {part.serialNumber}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Category: {getCategoryName(part.category)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Manufacturer: {part.manufacturer}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Installation Date: {new Date(part.installationDate).toLocaleDateString()}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Life Limit: {part.lifeLimitHours} hours
                          </Typography>
                          <Box
                            sx={{
                              width: '100%',
                              backgroundColor: 'grey.300',
                              borderRadius: 1,
                              mt: 0.5
                            }}
                          >
                            <Box
                              sx={{
                                width: `${(part.currentHours / part.lifeLimitHours) * 100}%`,
                                backgroundColor: part.currentHours / part.lifeLimitHours > 0.8 ? 'warning.main' : 'success.main',
                                height: 8,
                                borderRadius: 1
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Current: {part.currentHours} hours ({Math.round((part.currentHours / part.lifeLimitHours) * 100)}%)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      size="small"
                      onClick={() => handleViewPart(part.id)}
                    >
                      View Details
                    </Button>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPart(part.id)}
                          color="info"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePart(part.id)}
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
          
          {filteredParts.length === 0 && (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No parts found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search or add a new part.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPart}
                sx={{ mt: 2 }}
              >
                Add Part
              </Button>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Parts by Category
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {['fuselage_front', 'fuselage_center', 'fuselage_rear', 'wing_left', 'wing_right', 'empennage', 'landing_gear', 'engine', 'avionics', 'hydraulics', 'electrical'].map(category => {
            const categoryParts = parts.filter(part => part.category === category);
            
            if (categoryParts.length === 0) {
              return null;
            }
            
            return (
              <Box key={category} sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {getCategoryName(category)} ({categoryParts.length})
                </Typography>
                <List>
                  {categoryParts.map(part => (
                    <ListItem
                      key={part.id}
                      secondaryAction={
                        <Chip
                          label={part.status}
                          color={getStatusColor(part.status)}
                          size="small"
                        />
                      }
                      sx={{ 
                        bgcolor: 'background.paper', 
                        mb: 1, 
                        borderRadius: 1,
                        boxShadow: 1
                      }}
                    >
                      <ListItemIcon>
                        {getStatusIcon(part.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={part.name}
                        secondary={`${part.partNumber} | S/N: ${part.serialNumber}`}
                      />
                      <Button
                        size="small"
                        onClick={() => handleViewPart(part.id)}
                      >
                        View
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            );
          })}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Critical Parts (Life Limit &gt; 80%)
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {parts.filter(part => (part.currentHours / part.lifeLimitHours) > 0.8).length > 0 ? (
            <List>
              {parts.filter(part => (part.currentHours / part.lifeLimitHours) > 0.8)
                .sort((a, b) => (b.currentHours / b.lifeLimitHours) - (a.currentHours / a.lifeLimitHours))
                .map(part => (
                  <ListItem
                    key={part.id}
                    secondaryAction={
                      <Button
                        size="small"
                        onClick={() => handleViewPart(part.id)}
                      >
                        View
                      </Button>
                    }
                    sx={{ 
                      bgcolor: 'background.paper', 
                      mb: 1, 
                      borderRadius: 1,
                      boxShadow: 1
                    }}
                  >
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={part.name}
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" color="text.primary">
                            {Math.round((part.currentHours / part.lifeLimitHours) * 100)}% of life limit used
                          </Typography>
                          {` — ${part.currentHours}/${part.lifeLimitHours} hours`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))
              }
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No critical parts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All parts are within safe operating limits.
              </Typography>
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
          Back to Aircraft Details
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPart}
        >
          Add Part
        </Button>
      </Box>
    </Box>
  );
};

export default AircraftParts;
