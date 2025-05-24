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
  MenuItem
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
const sampleTasks = [
  {
    id: 'mt1',
    taskNumber: 'MT-2025-042',
    title: 'Landing Gear Inspection',
    description: 'Complete inspection of landing gear components and systems',
    category: 'inspection',
    priority: 'high',
    status: 'completed',
    estimatedDuration: 8,
    actualDuration: 7.5,
    scheduledStartDate: '2025-05-05',
    scheduledEndDate: '2025-05-05',
    actualStartDate: '2025-05-05',
    actualEndDate: '2025-05-05',
    aircraft: {
      id: '1',
      registrationNumber: 'F-WXYZ',
      model: 'A320-214'
    },
    assignedTo: 'John Smith'
  },
  {
    id: 'mt2',
    taskNumber: 'MT-2025-038',
    title: 'Engine Performance Check',
    description: 'Comprehensive performance testing of both engines',
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
    assignedTo: 'Michael Johnson'
  },
  {
    id: 'mt3',
    taskNumber: 'MT-2025-035',
    title: 'Cabin Pressurization System Test',
    description: 'Testing of cabin pressurization system and components',
    category: 'inspection',
    priority: 'medium',
    status: 'pending',
    estimatedDuration: 6,
    actualDuration: null,
    scheduledStartDate: '2025-05-20',
    scheduledEndDate: '2025-05-20',
    actualStartDate: null,
    actualEndDate: null,
    aircraft: {
      id: '1',
      registrationNumber: 'F-WXYZ',
      model: 'A320-214'
    },
    assignedTo: null
  },
  {
    id: 'mt4',
    taskNumber: 'MT-2025-032',
    title: 'Hydraulic System Repair',
    description: 'Repair of hydraulic leak in main system',
    category: 'repair',
    priority: 'high',
    status: 'completed',
    estimatedDuration: 10,
    actualDuration: 12,
    scheduledStartDate: '2025-05-08',
    scheduledEndDate: '2025-05-08',
    actualStartDate: '2025-05-08',
    actualEndDate: '2025-05-08',
    aircraft: {
      id: '3',
      registrationNumber: 'G-EFGH',
      model: 'A350-941'
    },
    assignedTo: 'Sarah Williams'
  },
  {
    id: 'mt5',
    taskNumber: 'MT-2025-030',
    title: 'Avionics Software Update',
    description: 'Installation of latest avionics software package',
    category: 'modification',
    priority: 'medium',
    status: 'pending',
    estimatedDuration: 4,
    actualDuration: null,
    scheduledStartDate: '2025-05-25',
    scheduledEndDate: '2025-05-25',
    actualStartDate: null,
    actualEndDate: null,
    aircraft: {
      id: '2',
      registrationNumber: 'D-ABCD',
      model: 'A330-301'
    },
    assignedTo: null
  },
  {
    id: 'mt6',
    taskNumber: 'MT-2025-028',
    title: 'Routine Airframe Inspection',
    description: 'Regular scheduled airframe inspection',
    category: 'scheduled',
    priority: 'medium',
    status: 'pending',
    estimatedDuration: 16,
    actualDuration: null,
    scheduledStartDate: '2025-05-30',
    scheduledEndDate: '2025-05-31',
    actualStartDate: null,
    actualEndDate: null,
    aircraft: {
      id: '4',
      registrationNumber: 'N-IJKL',
      model: 'A380-841'
    },
    assignedTo: null
  }
];

const MaintenanceTasks = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tasks, setTasks] = useState(sampleTasks);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handlePriorityFilterChange = (event) => {
    setPriorityFilter(event.target.value);
  };

  const handleAddTask = () => {
    navigate('/maintenance/new');
  };

  const handleViewTask = (id) => {
    navigate(`/maintenance/${id}`);
  };

  const handleEditTask = (id) => {
    navigate(`/maintenance/${id}/edit`);
  };

  const handleDeleteTask = (id) => {
    // In a real application, this would call an API
    setTasks(tasks.filter(task => task.id !== id));
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.taskNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.aircraft?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Maintenance Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTask}
        >
          Create Task
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by task number, title, or aircraft..."
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
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={categoryFilter}
                label="Category"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="unscheduled">Unscheduled</MenuItem>
                <MenuItem value="inspection">Inspection</MenuItem>
                <MenuItem value="repair">Repair</MenuItem>
                <MenuItem value="modification">Modification</MenuItem>
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
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {task.title}
                  </Typography>
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                    icon={getStatusIcon(task.status)}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Task #: {task.taskNumber}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FlightIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    {task.aircraft.registrationNumber} ({task.aircraft.model})
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                  Category: {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Priority:
                  </Typography>
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {task.status === 'completed' ? (
                    `Completed on: ${new Date(task.actualEndDate).toLocaleDateString()}`
                  ) : (
                    `Scheduled for: ${new Date(task.scheduledStartDate).toLocaleDateString()}`
                  )}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Estimated Duration: {task.estimatedDuration} hours
                </Typography>
                
                {task.assignedTo && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Assigned to: {task.assignedTo}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  size="small"
                  onClick={() => handleViewTask(task.id)}
                >
                  View Details
                </Button>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditTask(task.id)}
                      color="info"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTask(task.id)}
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
      
      {filteredTasks.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No maintenance tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search filters or create a new task.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
            sx={{ mt: 2 }}
          >
            Create Task
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default MaintenanceTasks;
