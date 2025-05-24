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
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Build as BuildIcon,
  ViewInAr as ViewInArIcon,
  Flight as FlightIcon,
  Speed as SpeedIcon,
  Today as TodayIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Sample data for demonstration
const sampleAircraft = {
  id: '1',
  registrationNumber: 'F-WXYZ',
  serialNumber: 'MSN12345',
  model: 'A320-214',
  manufacturer: 'Airbus',
  yearOfManufacture: 2018,
  status: 'active',
  totalFlightHours: 12500,
  totalCycles: 4320,
  lastMaintenanceDate: '2025-04-15',
  nextMaintenanceDate: '2025-06-15',
  configuration: {
    engines: 'CFM56-5B4/P',
    cabinLayout: 'Single Class, 180 seats',
    maxTakeoffWeight: '78000 kg'
  },
  notes: 'Aircraft in excellent condition. Regular maintenance performed as scheduled.'
};

const sampleMaintenanceTasks = [
  {
    id: 'mt1',
    taskNumber: 'MT-2025-042',
    title: 'Landing Gear Inspection',
    status: 'completed',
    completionDate: '2025-05-10',
    priority: 'high'
  },
  {
    id: 'mt2',
    taskNumber: 'MT-2025-038',
    title: 'Engine Performance Check',
    status: 'in_progress',
    scheduledDate: '2025-05-12',
    priority: 'critical'
  },
  {
    id: 'mt3',
    taskNumber: 'MT-2025-035',
    title: 'Cabin Pressurization System Test',
    status: 'pending',
    scheduledDate: '2025-05-20',
    priority: 'medium'
  }
];

const sampleAlerts = [
  {
    id: 'alert1',
    title: 'Maintenance Due Soon',
    description: 'Scheduled maintenance in 30 days',
    severity: 'warning',
    date: '2025-05-12'
  },
  {
    id: 'alert2',
    title: 'Engine Hours Threshold',
    description: 'Engine #1 approaching service interval',
    severity: 'info',
    date: '2025-05-10'
  }
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`aircraft-tabpanel-${index}`}
      aria-labelledby={`aircraft-tab-${index}`}
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

const AircraftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [aircraft, setAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // For now, we'll simulate a loading delay and use sample data
    const timer = setTimeout(() => {
      setAircraft(sampleAircraft);
      setMaintenanceTasks(sampleMaintenanceTasks);
      setAlerts(sampleAlerts);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/aircraft');
  };

  const handleEdit = () => {
    navigate(`/aircraft/${id}/edit`);
  };

  const handleViewMaintenance = () => {
    navigate(`/aircraft/${id}/maintenance`);
  };

  // Used in the parts tab button
  const handleViewParts = () => {
    navigate(`/aircraft/${id}/parts`);
  };

  const handle3DView = () => {
    navigate(`/viewer/${id}`);
  };

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'in_progress':
        return <BuildIcon color="info" />;
      case 'pending':
        return <TodayIcon color="warning" />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <WarningIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Loading aircraft details...</Typography>
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
          {aircraft.registrationNumber}
        </Typography>
        <Box>
          <Tooltip title="View in 3D">
            <IconButton
              color="primary"
              onClick={handle3DView}
              sx={{ mr: 1 }}
            >
              <ViewInArIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              onClick={handleEdit}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="aircraft tabs">
            <Tab label="Overview" />
            <Tab label="Maintenance" />
            <Tab label="Alerts" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Aircraft Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Registration Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aircraft.registrationNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Serial Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aircraft.serialNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Model
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aircraft.model}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Manufacturer
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aircraft.manufacturer}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Year of Manufacture
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aircraft.yearOfManufacture}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={aircraft.status}
                      color={getStatusColor(aircraft.status)}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Engines
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aircraft.configuration.engines}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Cabin Layout
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aircraft.configuration.cabinLayout}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Max Takeoff Weight
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aircraft.configuration.maxTakeoffWeight}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Operational Data
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SpeedIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Flight Hours
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {aircraft.totalFlightHours}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FlightIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Cycles
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {aircraft.totalCycles}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TodayIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Last Maintenance
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {new Date(aircraft.lastMaintenanceDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TodayIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Next Maintenance
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {new Date(aircraft.nextMaintenanceDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">
                  {aircraft.notes}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<ViewInArIcon />}
                  onClick={handle3DView}
                  sx={{ mr: 2 }}
                >
                  View in 3D
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BuildIcon />}
                  onClick={handleViewMaintenance}
                >
                  Maintenance
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Maintenance Tasks
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/maintenance/new?aircraftId=${id}`)}
            >
              Create Task
            </Button>
          </Box>

          <List>
            {maintenanceTasks.map((task) => (
              <Paper key={task.id} sx={{ mb: 2 }}>
                <ListItem
                  secondaryAction={
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  }
                >
                  <ListItemIcon>
                    {getStatusIcon(task.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span" color="text.primary">
                          {task.taskNumber}
                        </Typography>
                        {' — '}
                        {task.status === 'completed' ? (
                          `Completed on ${new Date(task.completionDate).toLocaleDateString()}`
                        ) : (
                          `Scheduled for ${new Date(task.scheduledDate).toLocaleDateString()}`
                        )}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleViewMaintenance}
            >
              View All Maintenance Tasks
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Alerts & Notifications
          </Typography>

          <List>
            {alerts.map((alert) => (
              <Paper key={alert.id} sx={{ mb: 2 }}>
                <ListItem>
                  <ListItemIcon>
                    {getSeverityIcon(alert.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {alert.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span">
                          {alert.description}
                        </Typography>
                        {' — '}
                        {new Date(alert.date).toLocaleDateString()}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>

          {alerts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No alerts for this aircraft
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
          Back to Aircraft List
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit Aircraft
        </Button>
      </Box>
    </Box>
  );
};

export default AircraftDetail;
