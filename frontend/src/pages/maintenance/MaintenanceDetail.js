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
  Tooltip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Flight as FlightIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Build as BuildIcon
} from '@mui/icons-material';

// Sample data for demonstration
const sampleTask = {
  id: 'mt2',
  taskNumber: 'MT-2025-038',
  title: 'Engine Performance Check',
  description: 'Comprehensive performance testing of both engines including thrust measurement, fuel consumption analysis, and vibration testing. All parameters must be within manufacturer specifications.',
  category: 'inspection',
  priority: 'critical',
  status: 'in_progress',
  estimatedDuration: 12,
  actualDuration: null,
  scheduledStartDate: '2025-05-12',
  scheduledEndDate: '2025-05-12',
  actualStartDate: '2025-05-12',
  actualEndDate: null,
  aircraft: {
    id: '1',
    registrationNumber: 'F-WXYZ',
    model: 'A320-214'
  },
  assignedTo: {
    id: 'user2',
    name: 'Michael Johnson',
    role: 'engineer',
    specialization: 'Propulsion Systems'
  },
  relatedPartIds: ['p3', 'p4'],
  requiredCertifications: ['Engine Type Rating A', 'Performance Testing Certification'],
  requiredTools: ['Thrust Measurement Equipment', 'Vibration Analyzer', 'Fuel Flow Meter'],
  requiredParts: {},
  documentReferences: ['SB-A320-71-1076', 'AMM-71-00-00'],
  notes: 'Previous engine performance check showed slight vibration in engine #1. Special attention required to verify if issue persists.'
};

const sampleWorkOrders = [
  {
    id: 'wo1',
    workOrderNumber: 'WO-2025-112',
    title: 'Engine #1 Performance Testing',
    status: 'completed',
    assignedTo: 'Michael Johnson',
    startDate: '2025-05-12T09:00:00',
    endDate: '2025-05-12T13:30:00',
    notes: 'All parameters within normal range. Previous vibration issue not detected.'
  },
  {
    id: 'wo2',
    workOrderNumber: 'WO-2025-113',
    title: 'Engine #2 Performance Testing',
    status: 'in_progress',
    assignedTo: 'Michael Johnson',
    startDate: '2025-05-12T14:00:00',
    endDate: null,
    notes: 'Testing in progress. Initial readings normal.'
  }
];

const sampleParts = [
  {
    id: 'p3',
    partNumber: 'A320-ENG-01',
    name: 'Engine - Left',
    category: 'engine',
    status: 'installed'
  },
  {
    id: 'p4',
    partNumber: 'A320-ENG-02',
    name: 'Engine - Right',
    category: 'engine',
    status: 'installed'
  }
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
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

const MaintenanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [task, setTask] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // For now, we'll simulate a loading delay and use sample data
    const timer = setTimeout(() => {
      setTask(sampleTask);
      setWorkOrders(sampleWorkOrders);
      setParts(sampleParts);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/maintenance');
  };

  const handleEdit = () => {
    navigate(`/maintenance/${id}/edit`);
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
    navigate('/maintenance');
  };

  const handleOpenCompleteDialog = () => {
    setOpenCompleteDialog(true);
  };

  const handleCloseCompleteDialog = () => {
    setOpenCompleteDialog(false);
  };

  const handleCompleteTask = () => {
    // In a real application, this would call an API
    setTask({
      ...task,
      status: 'completed',
      actualEndDate: new Date().toISOString().split('T')[0],
      notes: task.notes + '\n\nCompletion notes: ' + completionNotes
    });
    handleCloseCompleteDialog();
  };

  const handleCreateWorkOrder = () => {
    navigate(`/maintenance/${id}/workorders/new`);
  };

  const handleViewWorkOrder = (workOrderId) => {
    navigate(`/workorders/${workOrderId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'deferred':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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
        return <ScheduleIcon color="info" />;
      case 'pending':
        return <ScheduleIcon color="warning" />;
      case 'deferred':
        return <WarningIcon color="default" />;
      case 'cancelled':
        return <WarningIcon color="error" />;
      default:
        return <AssignmentIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Loading maintenance task details...</Typography>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Maintenance task not found</Typography>
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
          {task.title}
        </Typography>
        <Box>
          {task.status !== 'completed' && task.status !== 'cancelled' && (
            <Button
              variant="contained"
              color="success"
              onClick={handleOpenCompleteDialog}
              sx={{ mr: 2 }}
            >
              Complete Task
            </Button>
          )}
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
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="maintenance task tabs">
            <Tab label="Overview" />
            <Tab label="Work Orders" />
            <Tab label="Related Parts" />
            <Tab label="Documents" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Task Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Task Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {task.taskNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                      icon={getStatusIcon(task.status)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Priority
                    </Typography>
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {task.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Aircraft Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FlightIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body1">
                      {task.aircraft.registrationNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.aircraft.model}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/aircraft/${task.aircraft.id}`)}
                >
                  View Aircraft Details
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Schedule Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Scheduled Start
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(task.scheduledStartDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Scheduled End
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(task.scheduledEndDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Actual Start
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {task.actualStartDate ? new Date(task.actualStartDate).toLocaleDateString() : 'Not started'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Actual End
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {task.actualEndDate ? new Date(task.actualEndDate).toLocaleDateString() : 'Not completed'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estimated Duration
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {task.estimatedDuration} hours
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Actual Duration
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {task.actualDuration ? `${task.actualDuration} hours` : 'Not completed'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Assignment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {task.assignedTo ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body1">
                        {task.assignedTo.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.assignedTo.role.charAt(0).toUpperCase() + task.assignedTo.role.slice(1)}
                        {task.assignedTo.specialization && ` - ${task.assignedTo.specialization}`}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Not assigned
                  </Typography>
                )}
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Required Certifications
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {task.requiredCertifications.map((cert, index) => (
                    <Chip key={index} label={cert} size="small" />
                  ))}
                </Box>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Required Tools
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {task.requiredTools.map((tool, index) => (
                    <Chip key={index} label={tool} size="small" />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {task.notes}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Work Orders
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateWorkOrder}
            >
              Create Work Order
            </Button>
          </Box>

          {workOrders.length > 0 ? (
            <List>
              {workOrders.map((workOrder) => (
                <Paper key={workOrder.id} sx={{ mb: 2 }}>
                  <ListItem
                    secondaryAction={
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewWorkOrder(workOrder.id)}
                      >
                        View Details
                      </Button>
                    }
                  >
                    <ListItemIcon>
                      {getStatusIcon(workOrder.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {workOrder.title}
                          </Typography>
                          <Chip
                            label={workOrder.status}
                            color={getStatusColor(workOrder.status)}
                            size="small"
                            sx={{ ml: 2 }}
                          />
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" color="text.primary">
                            {workOrder.workOrderNumber}
                          </Typography>
                          {' — '}
                          {workOrder.assignedTo && `Assigned to: ${workOrder.assignedTo}`}
                          {' — '}
                          {new Date(workOrder.startDate).toLocaleString()}
                          {workOrder.endDate && ` to ${new Date(workOrder.endDate).toLocaleString()}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No work orders created for this task
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateWorkOrder}
                sx={{ mt: 2 }}
              >
                Create Work Order
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Related Parts
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {parts.length > 0 ? (
            <List>
              {parts.map((part) => (
                <Paper key={part.id} sx={{ mb: 2 }}>
                  <ListItem
                    secondaryAction={
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/aircraft/${task.aircraft.id}/parts/${part.id}`)}
                      >
                        View Part
                      </Button>
                    }
                  >
                    <ListItemIcon>
                      <BuildIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {part.name}
                          </Typography>
                          <Chip
                            label={part.status}
                            color={getStatusColor(part.status)}
                            size="small"
                            sx={{ ml: 2 }}
                          />
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" color="text.primary">
                            {part.partNumber}
                          </Typography>
                          {' — '}
                          {part.category.charAt(0).toUpperCase() + part.category.slice(1).replace('_', ' ')}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No parts associated with this task
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(`/aircraft/${task.aircraft.id}/parts`)}
                sx={{ mt: 2 }}
              >
                View Aircraft Parts
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Technical Documents
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {task.documentReferences.length > 0 ? (
            <List>
              {task.documentReferences.map((doc, index) => (
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
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc}
                      secondary={
                        doc.startsWith('SB') ? 'Service Bulletin' : 
                        doc.startsWith('AMM') ? 'Aircraft Maintenance Manual' : 
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
                No documents referenced for this task
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
          Back to Maintenance Tasks
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit Task
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Maintenance Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this maintenance task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Complete Task Dialog */}
      <Dialog
        open={openCompleteDialog}
        onClose={handleCloseCompleteDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Complete Maintenance Task</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Mark this task as completed and provide any final notes.
          </DialogContentText>
          <TextField
            autoFocus
            label="Completion Notes"
            multiline
            rows={4}
            fullWidth
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog}>Cancel</Button>
          <Button onClick={handleCompleteTask} color="success">Complete Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceDetail;
