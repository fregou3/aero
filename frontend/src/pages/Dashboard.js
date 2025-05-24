import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Flight as FlightIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Inventory as InventoryIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div" color="text.secondary">
          {title}
        </Typography>
        <Box sx={{ 
          backgroundColor: `${color}.light`, 
          borderRadius: '50%', 
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const AlertItem = ({ primary, secondary, severity, date }) => (
  <ListItem divider>
    <ListItemIcon>
      {severity === 'critical' ? (
        <WarningIcon color="error" />
      ) : severity === 'warning' ? (
        <WarningIcon color="warning" />
      ) : (
        <CheckCircleIcon color="success" />
      )}
    </ListItemIcon>
    <ListItemText 
      primary={primary}
      secondary={
        <React.Fragment>
          <Typography component="span" variant="body2" color="text.primary">
            {secondary}
          </Typography>
          {` — ${date}`}
        </React.Fragment>
      }
    />
    <Chip 
      label={severity} 
      color={
        severity === 'critical' ? 'error' : 
        severity === 'warning' ? 'warning' : 'success'
      }
      size="small"
    />
  </ListItem>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Welcome back, {currentUser?.firstName || 'User'}!
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Aircraft" 
            value="12" 
            icon={<FlightIcon sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Maintenance Tasks" 
            value="28" 
            icon={<BuildIcon sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Inventory Items" 
            value="1,254" 
            icon={<InventoryIcon sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Documents" 
            value="342" 
            icon={<DocumentIcon sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Alerts & Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Alerts & Notifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ width: '100%' }}>
              <AlertItem 
                primary="Aircraft A320-214 requires immediate maintenance"
                secondary="Engine inspection due"
                severity="critical"
                date="Today, 09:15 AM"
              />
              <AlertItem 
                primary="Part #A320-123 is below minimum stock"
                secondary="Current stock: 2, Minimum: 5"
                severity="warning"
                date="Yesterday, 4:30 PM"
              />
              <AlertItem 
                primary="Maintenance task #MT-2025-042 completed"
                secondary="Landing gear inspection"
                severity="info"
                date="May 10, 2025"
              />
              <AlertItem 
                primary="New technical document uploaded"
                secondary="Service Bulletin SB-A320-71-1076"
                severity="info"
                date="May 9, 2025"
              />
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button size="small" onClick={() => navigate('/notifications')}>
                View All
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Maintenance Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Maintenance Tasks
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ width: '100%' }}>
              <ListItem divider>
                <ListItemText 
                  primary="Engine Inspection - A320-214"
                  secondary="Scheduled: May 15, 2025"
                />
                <Chip label="Pending" color="warning" size="small" />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="Avionics System Check - A330-301"
                  secondary="Scheduled: May 14, 2025"
                />
                <Chip label="In Progress" color="info" size="small" />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="Landing Gear Maintenance - A320-214"
                  secondary="Completed: May 10, 2025"
                />
                <Chip label="Completed" color="success" size="small" />
              </ListItem>
              <ListItem divider>
                <ListItemText 
                  primary="Hydraulic System Repair - A350-941"
                  secondary="Completed: May 8, 2025"
                />
                <Chip label="Completed" color="success" size="small" />
              </ListItem>
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button size="small" onClick={() => navigate('/maintenance')}>
                View All
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                    <FlightIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Add Aircraft
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" fullWidth onClick={() => navigate('/aircraft/new')}>
                      Add New
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                    <BuildIcon color="warning" sx={{ fontSize: 40 }} />
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Create Task
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" fullWidth onClick={() => navigate('/maintenance/new')}>
                      Create
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                    <InventoryIcon color="success" sx={{ fontSize: 40 }} />
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Add Inventory
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" fullWidth onClick={() => navigate('/inventory/new')}>
                      Add Item
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                    <DocumentIcon color="info" sx={{ fontSize: 40 }} />
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Upload Document
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" fullWidth onClick={() => navigate('/documents/new')}>
                      Upload
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
