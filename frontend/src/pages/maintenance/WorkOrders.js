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
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Flight as FlightIcon
} from '@mui/icons-material';

// Sample data for demonstration
const sampleWorkOrders = [
  {
    id: 'wo1',
    workOrderNumber: 'WO-2025-112',
    title: 'Engine #1 Performance Testing',
    description: 'Perform comprehensive testing of Engine #1 including thrust measurement, fuel consumption analysis, and vibration testing.',
    status: 'completed',
    priority: 'high',
    assignedTo: {
      id: 'user2',
      name: 'Michael Johnson',
      role: 'engineer'
    },
    startDate: '2025-05-12T09:00:00',
    endDate: '2025-05-12T13:30:00',
    estimatedDuration: 5,
    actualDuration: 4.5,
    relatedTaskId: 'mt2',
    relatedTaskNumber: 'MT-2025-038',
    aircraft: {
      id: '1',
      registrationNumber: 'F-WXYZ',
      model: 'A320-214'
    },
    notes: 'All parameters within normal range. Previous vibration issue not detected.'
  },
  {
    id: 'wo2',
    workOrderNumber: 'WO-2025-113',
    title: 'Engine #2 Performance Testing',
    description: 'Perform comprehensive testing of Engine #2 including thrust measurement, fuel consumption analysis, and vibration testing.',
    status: 'in_progress',
    priority: 'high',
    assignedTo: {
      id: 'user2',
      name: 'Michael Johnson',
      role: 'engineer'
    },
    startDate: '2025-05-12T14:00:00',
    endDate: null,
    estimatedDuration: 5,
    actualDuration: null,
    relatedTaskId: 'mt2',
    relatedTaskNumber: 'MT-2025-038',
    aircraft: {
      id: '1',
      registrationNumber: 'F-WXYZ',
      model: 'A320-214'
    },
    notes: 'Testing in progress. Initial readings normal.'
  },
  {
    id: 'wo3',
    workOrderNumber: 'WO-2025-110',
    title: 'Landing Gear Inspection',
    description: 'Perform detailed inspection of all landing gear components including struts, actuators, and braking systems.',
    status: 'completed',
    priority: 'medium',
    assignedTo: {
      id: 'user3',
      name: 'Sarah Williams',
      role: 'technician'
    },
    startDate: '2025-05-05T08:00:00',
    endDate: '2025-05-05T15:30:00',
    estimatedDuration: 8,
    actualDuration: 7.5,
    relatedTaskId: 'mt1',
    relatedTaskNumber: 'MT-2025-042',
    aircraft: {
      id: '1',
      registrationNumber: 'F-WXYZ',
      model: 'A320-214'
    },
    notes: 'All components inspected and found to be within acceptable wear limits. Brake pads on main landing gear showing 60% remaining life.'
  },
  {
    id: 'wo4',
    workOrderNumber: 'WO-2025-108',
    title: 'Hydraulic System Repair',
    description: 'Repair hydraulic leak in main system and replace affected components.',
    status: 'completed',
    priority: 'critical',
    assignedTo: {
      id: 'user3',
      name: 'Sarah Williams',
      role: 'technician'
    },
    startDate: '2025-05-08T09:00:00',
    endDate: '2025-05-08T21:00:00',
    estimatedDuration: 10,
    actualDuration: 12,
    relatedTaskId: 'mt4',
    relatedTaskNumber: 'MT-2025-032',
    aircraft: {
      id: '3',
      registrationNumber: 'G-EFGH',
      model: 'A350-941'
    },
    notes: 'Leak located in hydraulic line near APU. Line replaced and system pressure tested. All systems functioning normally.'
  },
  {
    id: 'wo5',
    workOrderNumber: 'WO-2025-115',
    title: 'Cabin Pressurization System Test',
    description: 'Perform testing of cabin pressurization system and components.',
    status: 'pending',
    priority: 'medium',
    assignedTo: null,
    startDate: '2025-05-20T09:00:00',
    endDate: null,
    estimatedDuration: 6,
    actualDuration: null,
    relatedTaskId: 'mt3',
    relatedTaskNumber: 'MT-2025-035',
    aircraft: {
      id: '1',
      registrationNumber: 'F-WXYZ',
      model: 'A320-214'
    },
    notes: 'Scheduled for May 20th. Requires special test equipment.'
  },
  {
    id: 'wo6',
    workOrderNumber: 'WO-2025-117',
    title: 'Avionics Software Update',
    description: 'Install latest avionics software package on all flight systems.',
    status: 'pending',
    priority: 'medium',
    assignedTo: null,
    startDate: '2025-05-25T09:00:00',
    endDate: null,
    estimatedDuration: 4,
    actualDuration: null,
    relatedTaskId: 'mt5',
    relatedTaskNumber: 'MT-2025-030',
    aircraft: {
      id: '2',
      registrationNumber: 'D-ABCD',
      model: 'A330-301'
    },
    notes: 'Software package v2.5.8 to be installed. Requires verification of all systems post-update.'
  }
];

const WorkOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [workOrders, setWorkOrders] = useState(sampleWorkOrders);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handlePriorityFilterChange = (event) => {
    setPriorityFilter(event.target.value);
  };

  const handleAssignmentFilterChange = (event) => {
    setAssignmentFilter(event.target.value);
  };

  const handleAddWorkOrder = () => {
    navigate('/workorders/new');
  };

  const handleViewWorkOrder = (id) => {
    navigate(`/workorders/${id}`);
  };

  const handleEditWorkOrder = (id) => {
    navigate(`/workorders/${id}/edit`);
  };

  const handleDeleteWorkOrder = (id) => {
    // In a real application, this would call an API
    setWorkOrders(workOrders.filter(workOrder => workOrder.id !== id));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in_progress':
        return <ScheduleIcon />;
      case 'pending':
        return <ScheduleIcon />;
      case 'deferred':
        return <WarningIcon />;
      case 'cancelled':
        return <WarningIcon />;
      default:
        return <AssignmentIcon />;
    }
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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const filteredWorkOrders = workOrders.filter(workOrder => {
    const matchesSearch = 
      workOrder.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workOrder.aircraft?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (workOrder.relatedTaskNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || workOrder.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || workOrder.priority === priorityFilter;
    
    let matchesAssignment = true;
    if (assignmentFilter === 'assigned') {
      matchesAssignment = workOrder.assignedTo !== null;
    } else if (assignmentFilter === 'unassigned') {
      matchesAssignment = workOrder.assignedTo === null;
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignment;
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Work Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddWorkOrder}
        >
          Create Work Order
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by work order number, title, aircraft, or task..."
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
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="deferred">Deferred</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel id="priority-filter-label">Priority</InputLabel>
              <Select
                labelId="priority-filter-label"
                id="priority-filter"
                value={priorityFilter}
                label="Priority"
                onChange={handlePriorityFilterChange}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel id="assignment-filter-label">Assignment</InputLabel>
              <Select
                labelId="assignment-filter-label"
                id="assignment-filter"
                value={assignmentFilter}
                label="Assignment"
                onChange={handleAssignmentFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {filteredWorkOrders.map((workOrder) => (
          <Grid item xs={12} sm={6} md={4} key={workOrder.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {workOrder.title}
                  </Typography>
                  <Chip
                    label={workOrder.status}
                    color={getStatusColor(workOrder.status)}
                    size="small"
                    icon={getStatusIcon(workOrder.status)}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  WO #: {workOrder.workOrderNumber}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FlightIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    {workOrder.aircraft.registrationNumber} ({workOrder.aircraft.model})
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                  Related Task: {workOrder.relatedTaskNumber}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Priority:
                  </Typography>
                  <Chip
                    label={workOrder.priority}
                    color={getPriorityColor(workOrder.priority)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {workOrder.status === 'completed' ? (
                    `Completed on: ${new Date(workOrder.endDate).toLocaleDateString()}`
                  ) : (
                    `Scheduled for: ${new Date(workOrder.startDate).toLocaleDateString()}`
                  )}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Estimated Duration: {workOrder.estimatedDuration} hours
                </Typography>
                
                {workOrder.assignedTo ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                      {getInitials(workOrder.assignedTo.name)}
                    </Avatar>
                    <Typography variant="body2">
                      {workOrder.assignedTo.name} ({workOrder.assignedTo.role})
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Not assigned
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  size="small"
                  onClick={() => handleViewWorkOrder(workOrder.id)}
                >
                  View Details
                </Button>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditWorkOrder(workOrder.id)}
                      color="info"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteWorkOrder(workOrder.id)}
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
      
      {filteredWorkOrders.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No work orders found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search filters or create a new work order.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddWorkOrder}
            sx={{ mt: 2 }}
          >
            Create Work Order
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default WorkOrders;
