import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Flight as FlightIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Badge as BadgeIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Sample data for demonstration
const sampleUser = {
  id: 'user1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@aeromaintenance.com',
  phone: '+33 6 12 34 56 78',
  role: 'engineer',
  department: 'Maintenance Engineering',
  employeeId: 'EMP-2025-001',
  avatar: null, // In a real app, this would be a URL to the user's avatar
  certifications: [
    {
      id: 'cert1',
      name: 'A320 Type Rating',
      issueDate: '2023-05-10',
      expiryDate: '2025-05-10',
      issuingAuthority: 'EASA',
      status: 'active'
    },
    {
      id: 'cert2',
      name: 'Engine Maintenance Specialist',
      issueDate: '2024-01-15',
      expiryDate: '2026-01-15',
      issuingAuthority: 'Airbus Training Center',
      status: 'active'
    }
  ],
  recentActivity: [
    {
      id: 'act1',
      type: 'maintenance',
      description: 'Completed Engine Performance Check on A320 (F-WXYZ)',
      date: '2025-05-12T13:30:00',
      relatedId: 'wo1'
    },
    {
      id: 'act2',
      type: 'document',
      description: 'Uploaded A320 Engine Maintenance Procedure',
      date: '2025-05-10T10:15:00',
      relatedId: 'doc5'
    },
    {
      id: 'act3',
      type: 'inventory',
      description: 'Updated inventory for Engine Fan Blades',
      date: '2025-05-08T14:45:00',
      relatedId: 'inv1'
    }
  ],
  preferences: {
    notifications: {
      email: true,
      browser: true,
      maintenance: true,
      inventory: true,
      documents: false
    },
    display: {
      darkMode: false,
      highContrast: false,
      fontSize: 'medium'
    }
  }
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // For now, we'll simulate a loading delay and use sample data
    const timer = setTimeout(() => {
      setProfile(sampleUser);
      setFormData({
        firstName: sampleUser.firstName,
        lastName: sampleUser.lastName,
        email: sampleUser.email,
        phone: sampleUser.phone,
        department: sampleUser.department
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleEditMode = () => {
    if (editMode) {
      // If we're exiting edit mode, reset the form data
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        department: profile.department
      });
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = () => {
    // In a real application, this would call an API
    setProfile(prev => ({
      ...prev,
      ...formData
    }));
    setEditMode(false);
    setSnackbar({
      open: true,
      message: 'Profile updated successfully',
      severity: 'success'
    });
  };

  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = () => {
    // In a real application, this would call an API
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }
    
    // Simulate successful password change
    handleClosePasswordDialog();
    setSnackbar({
      open: true,
      message: 'Password changed successfully',
      severity: 'success'
    });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [name]: checked
        }
      }
    }));
  };

  const handleDisplayChange = (e) => {
    const { name, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        display: {
          ...prev.preferences.display,
          [name]: checked
        }
      }
    }));
  };

  const handleLogout = () => {
    // In a real application, this would call the logout function from the auth context
    logout();
    navigate('/login');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'maintenance':
        return <BuildIcon />;
      case 'document':
        return <DescriptionIcon />;
      case 'inventory':
        return <FlightIcon />;
      default:
        return <HistoryIcon />;
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Loading profile...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">User profile not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto 16px',
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
              ) : (
                getInitials(profile.firstName, profile.lastName)
              )}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {profile.firstName} {profile.lastName}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {profile.department}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BadgeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  Employee ID: {profile.employeeId}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  {profile.email}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  {profile.phone}
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={handleOpenPasswordDialog}
              sx={{ mt: 2 }}
              fullWidth
            >
              Change Password
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
              sx={{ mt: 1 }}
              fullWidth
            >
              Logout
            </Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Certifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {profile.certifications.length > 0 ? (
              <List disablePadding>
                {profile.certifications.map((cert) => (
                  <ListItem key={cert.id} disablePadding sx={{ mb: 2 }}>
                    <ListItemIcon>
                      <WorkIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={cert.name}
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" color="text.primary">
                            {cert.issuingAuthority}
                          </Typography>
                          <br />
                          Valid: {new Date(cert.issueDate).toLocaleDateString()} to {new Date(cert.expiryDate).toLocaleDateString()}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No certifications found
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                <Tab label="Personal Information" />
                <Tab label="Activity" />
                <Tab label="Preferences" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Personal Information
                </Typography>
                <Button
                  variant={editMode ? "outlined" : "contained"}
                  startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                  onClick={editMode ? handleSaveProfile : handleToggleEditMode}
                >
                  {editMode ? "Save Changes" : "Edit Profile"}
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
              
              {editMode && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleToggleEditMode}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {profile.recentActivity.length > 0 ? (
                <List>
                  {profile.recentActivity.map((activity) => (
                    <ListItem key={activity.id} disablePadding sx={{ mb: 2 }}>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={new Date(activity.date).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent activity found
                </Typography>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile.preferences.notifications.email}
                        onChange={handleNotificationChange}
                        name="email"
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile.preferences.notifications.browser}
                        onChange={handleNotificationChange}
                        name="browser"
                      />
                    }
                    label="Browser Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile.preferences.notifications.maintenance}
                        onChange={handleNotificationChange}
                        name="maintenance"
                      />
                    }
                    label="Maintenance Updates"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile.preferences.notifications.inventory}
                        onChange={handleNotificationChange}
                        name="inventory"
                      />
                    }
                    label="Inventory Alerts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile.preferences.notifications.documents}
                        onChange={handleNotificationChange}
                        name="documents"
                      />
                    }
                    label="Document Updates"
                  />
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Display Preferences
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile.preferences.display.darkMode}
                        onChange={handleDisplayChange}
                        name="darkMode"
                      />
                    }
                    label="Dark Mode"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile.preferences.display.highContrast}
                        onChange={handleDisplayChange}
                        name="highContrast"
                      />
                    }
                    label="High Contrast"
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={handleClosePasswordDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            To change your password, please enter your current password and then your new password.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="currentPassword"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.currentPassword}
            onChange={handlePasswordInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.newPassword}
            onChange={handlePasswordInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.confirmPassword}
            onChange={handlePasswordInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;
