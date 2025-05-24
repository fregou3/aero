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
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Flight as FlightIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  ViewInAr as ViewInArIcon
} from '@mui/icons-material';

// Sample data for demonstration
const sampleAircraft = [
  {
    id: '1',
    registrationNumber: 'F-WXYZ',
    model: 'A320-214',
    manufacturer: 'Airbus',
    status: 'active',
    totalFlightHours: 12500,
    lastMaintenanceDate: '2025-04-15',
    nextMaintenanceDate: '2025-06-15'
  },
  {
    id: '2',
    registrationNumber: 'D-ABCD',
    model: 'A330-301',
    manufacturer: 'Airbus',
    status: 'maintenance',
    totalFlightHours: 25300,
    lastMaintenanceDate: '2025-05-01',
    nextMaintenanceDate: '2025-05-20'
  },
  {
    id: '3',
    registrationNumber: 'G-EFGH',
    model: 'A350-941',
    manufacturer: 'Airbus',
    status: 'active',
    totalFlightHours: 8700,
    lastMaintenanceDate: '2025-03-10',
    nextMaintenanceDate: '2025-07-10'
  },
  {
    id: '4',
    registrationNumber: 'N-IJKL',
    model: 'A380-841',
    manufacturer: 'Airbus',
    status: 'grounded',
    totalFlightHours: 32100,
    lastMaintenanceDate: '2025-04-25',
    nextMaintenanceDate: '2025-05-25'
  }
];

const AircraftList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [aircraft, setAircraft] = useState(sampleAircraft);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredAircraft = aircraft.filter(
    (item) =>
      item.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'grounded':
        return 'error';
      case 'retired':
        return 'default';
      default:
        return 'primary';
    }
  };

  const handleAddAircraft = () => {
    navigate('/aircraft/new');
  };

  const handleViewAircraft = (id) => {
    navigate(`/aircraft/${id}`);
  };

  const handleEditAircraft = (id) => {
    navigate(`/aircraft/${id}/edit`);
  };

  const handleDeleteAircraft = (id) => {
    // In a real application, this would call an API
    setAircraft(aircraft.filter(item => item.id !== id));
  };

  const handleViewMaintenance = (id) => {
    navigate(`/aircraft/${id}/maintenance`);
  };

  const handle3DView = (id) => {
    navigate(`/viewer/${id}`);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Aircraft
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAircraft}
        >
          Add Aircraft
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by registration number or model..."
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
      </Paper>

      <Grid container spacing={3}>
        {filteredAircraft.map((aircraft) => (
          <Grid item xs={12} sm={6} md={4} key={aircraft.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {aircraft.registrationNumber}
                  </Typography>
                  <Chip
                    label={aircraft.status}
                    color={getStatusColor(aircraft.status)}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FlightIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {aircraft.model}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Manufacturer: {aircraft.manufacturer}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Flight Hours: {aircraft.totalFlightHours}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Maintenance: {new Date(aircraft.lastMaintenanceDate).toLocaleDateString()}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Next Maintenance: {new Date(aircraft.nextMaintenanceDate).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  size="small"
                  onClick={() => handleViewAircraft(aircraft.id)}
                >
                  View Details
                </Button>
                <Box>
                  <Tooltip title="View in 3D">
                    <IconButton
                      size="small"
                      onClick={() => handle3DView(aircraft.id)}
                      color="primary"
                    >
                      <ViewInArIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Maintenance">
                    <IconButton
                      size="small"
                      onClick={() => handleViewMaintenance(aircraft.id)}
                      color="warning"
                    >
                      <BuildIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditAircraft(aircraft.id)}
                      color="info"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAircraft(aircraft.id)}
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
      
      {filteredAircraft.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No aircraft found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or add a new aircraft.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAircraft}
            sx={{ mt: 2 }}
          >
            Add Aircraft
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default AircraftList;
