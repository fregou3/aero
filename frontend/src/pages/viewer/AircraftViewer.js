import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  CameraAlt as CameraIcon,
  ViewInAr as ViewInArIcon,
  Flight as FlightIcon,
  Build as BuildIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// Sample data for demonstration
const sampleAircraft = {
  id: '1',
  registrationNumber: 'F-WXYZ',
  model: 'A320-214',
  manufacturer: 'Airbus',
  serialNumber: '10042',
  yearOfManufacture: 2018,
  totalFlightHours: 12580,
  totalCycles: 4230,
  status: 'active',
  baseAirport: 'CDG',
  lastMaintenanceDate: '2025-04-15',
  nextMaintenanceDate: '2025-06-15',
  components: [
    {
      id: 'comp1',
      name: 'Fuselage',
      category: 'structure',
      visible: true,
      status: 'good',
      lastInspection: '2025-03-15'
    },
    {
      id: 'comp2',
      name: 'Wings',
      category: 'structure',
      visible: true,
      status: 'good',
      lastInspection: '2025-03-20'
    },
    {
      id: 'comp3',
      name: 'Engines',
      category: 'propulsion',
      visible: true,
      status: 'attention',
      lastInspection: '2025-02-10'
    },
    {
      id: 'comp4',
      name: 'Landing Gear',
      category: 'landing',
      visible: true,
      status: 'warning',
      lastInspection: '2025-01-25'
    },
    {
      id: 'comp5',
      name: 'Avionics',
      category: 'electronics',
      visible: true,
      status: 'good',
      lastInspection: '2025-04-05'
    },
    {
      id: 'comp6',
      name: 'Hydraulic Systems',
      category: 'systems',
      visible: true,
      status: 'good',
      lastInspection: '2025-03-30'
    },
    {
      id: 'comp7',
      name: 'Electrical Systems',
      category: 'systems',
      visible: true,
      status: 'good',
      lastInspection: '2025-04-10'
    },
    {
      id: 'comp8',
      name: 'Interior',
      category: 'cabin',
      visible: false,
      status: 'good',
      lastInspection: '2025-03-25'
    }
  ],
  maintenanceAlerts: [
    {
      id: 'alert1',
      componentId: 'comp3',
      component: 'Engines',
      description: 'Due for inspection in 120 flight hours',
      severity: 'medium',
      location: { x: 0.3, y: 0.5, z: 0.2 }
    },
    {
      id: 'alert2',
      componentId: 'comp4',
      component: 'Landing Gear',
      description: 'Hydraulic pressure below optimal range',
      severity: 'high',
      location: { x: 0.7, y: 0.2, z: 0.1 }
    }
  ]
};

const AircraftViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [aircraft, setAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('3d');
  const [zoom, setZoom] = useState(50);
  const [showLabels, setShowLabels] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [viewAngle, setViewAngle] = useState('exterior');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // For now, we'll simulate a loading delay and use sample data
    const timer = setTimeout(() => {
      setAircraft(sampleAircraft);
      setLoading(false);
      initCanvas();
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  const initCanvas = () => {
    // In a real application, this would initialize a 3D viewer like Three.js
    // For this demo, we'll just draw a simple placeholder
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set canvas dimensions
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      
      // Apply zoom factor
      const zoomFactor = zoom / 50;
      
      // Calculate center position
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Save the current state
      ctx.save();
      
      // Apply transformations based on view angle
      ctx.translate(centerX, centerY);
      ctx.scale(zoomFactor, zoomFactor);
      
      if (viewAngle === 'cockpit') {
        ctx.rotate(Math.PI);
      } else if (viewAngle === 'underside') {
        ctx.scale(1, -1);
      } else if (viewAngle === 'rear') {
        ctx.rotate(Math.PI / 2);
      }
      
      // Translate back to draw from center
      ctx.translate(-centerX, -centerY);
      
      // Draw components based on visibility settings
      if (aircraft) {
        // Draw visible components
        aircraft.components.forEach(component => {
          if (!component.visible) return;
          
          const drawComponent = () => {
            switch(component.id) {
              case 'comp1': // Fuselage
                ctx.beginPath();
                ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 3, canvas.height / 10, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                break;
              case 'comp2': // Wings
                // Left wing
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 50, canvas.height / 2);
                ctx.lineTo(canvas.width / 2 - 150, canvas.height / 2 + 20);
                ctx.lineTo(canvas.width / 2 - 150, canvas.height / 2 + 30);
                ctx.lineTo(canvas.width / 2 - 50, canvas.height / 2 + 10);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Right wing
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 + 50, canvas.height / 2);
                ctx.lineTo(canvas.width / 2 + 150, canvas.height / 2 + 20);
                ctx.lineTo(canvas.width / 2 + 150, canvas.height / 2 + 30);
                ctx.lineTo(canvas.width / 2 + 50, canvas.height / 2 + 10);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
              case 'comp3': // Engines
                // Left engine
                ctx.beginPath();
                ctx.arc(canvas.width / 2 - 100, canvas.height / 2 + 15, 15, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                
                // Right engine
                ctx.beginPath();
                ctx.arc(canvas.width / 2 + 100, canvas.height / 2 + 15, 15, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                break;
              case 'comp4': // Landing Gear
                // Left gear
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 70, canvas.height / 2 + 10);
                ctx.lineTo(canvas.width / 2 - 70, canvas.height / 2 + 40);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(canvas.width / 2 - 70, canvas.height / 2 + 45, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                
                // Right gear
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 + 70, canvas.height / 2 + 10);
                ctx.lineTo(canvas.width / 2 + 70, canvas.height / 2 + 40);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(canvas.width / 2 + 70, canvas.height / 2 + 45, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                break;
              case 'comp7': // Tail
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 + 100, canvas.height / 2);
                ctx.lineTo(canvas.width / 2 + 120, canvas.height / 2 - 40);
                ctx.lineTo(canvas.width / 2 + 130, canvas.height / 2 - 40);
                ctx.lineTo(canvas.width / 2 + 110, canvas.height / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
              default:
                // Other components not visually represented
                break;
            }
          };
          
          // Set styles based on if component is selected
          if (selectedComponent === component.id) {
            ctx.fillStyle = '#b3e5fc'; // Highlight color
            ctx.strokeStyle = '#0288d1';
            ctx.lineWidth = 3;
          } else {
            ctx.fillStyle = viewMode === 'wireframe' ? 'transparent' : '#f0f0f0';
            ctx.strokeStyle = '#333';
            ctx.lineWidth = viewMode === 'wireframe' ? 1 : 2;
          }
          
          // Apply X-ray effect if in X-ray mode
          if (viewMode === 'xray') {
            ctx.globalAlpha = 0.6;
          }
          
          drawComponent();
          
          // Reset alpha
          ctx.globalAlpha = 1.0;
        });
      } else {
        // Fallback if no aircraft data
        ctx.fillStyle = '#f0f0f0';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Fuselage
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 3, canvas.height / 10, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Wings
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 50, canvas.height / 2);
        ctx.lineTo(canvas.width / 2 - 150, canvas.height / 2 + 20);
        ctx.lineTo(canvas.width / 2 - 150, canvas.height / 2 + 30);
        ctx.lineTo(canvas.width / 2 - 50, canvas.height / 2 + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 50, canvas.height / 2);
        ctx.lineTo(canvas.width / 2 + 150, canvas.height / 2 + 20);
        ctx.lineTo(canvas.width / 2 + 150, canvas.height / 2 + 30);
        ctx.lineTo(canvas.width / 2 + 50, canvas.height / 2 + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Tail
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 100, canvas.height / 2);
        ctx.lineTo(canvas.width / 2 + 120, canvas.height / 2 - 40);
        ctx.lineTo(canvas.width / 2 + 130, canvas.height / 2 - 40);
        ctx.lineTo(canvas.width / 2 + 110, canvas.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      
      // Restore the context to remove transformations
      ctx.restore();
      
      // Draw maintenance alerts if enabled
      if (showAlerts && aircraft && aircraft.maintenanceAlerts) {
        // Save current context for alerts
        ctx.save();
        
        aircraft.maintenanceAlerts.forEach(alert => {
          // Only show alerts for visible components
          const relatedComponent = aircraft.components.find(c => c.id === alert.componentId);
          if (!relatedComponent || !relatedComponent.visible) return;
          
          // Position alerts based on component locations
          let x, y;
          
          switch(alert.componentId) {
            case 'comp3': // Engines
              x = canvas.width / 2 - 100; // Left engine position
              y = canvas.height / 2 + 15;
              break;
            case 'comp4': // Landing Gear
              x = canvas.width / 2 + 70; // Right landing gear position
              y = canvas.height / 2 + 45;
              break;
            default:
              // Fallback to the location property if component-specific position not defined
              x = alert.location.x * canvas.width;
              y = alert.location.y * canvas.height;
          }
          
          // Draw alert indicator
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = alert.severity === 'high' ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 165, 0, 0.8)';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#fff';
          ctx.stroke();
          
          // Add exclamation mark in the circle
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', x, y);
          
          // Draw label if enabled
          if (showLabels) {
            ctx.fillStyle = alert.severity === 'high' ? '#d32f2f' : '#ed6c02';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(alert.component, x + 15, y);
            
            // Draw description in smaller font
            ctx.font = '10px Arial';
            ctx.fillStyle = '#333';
            ctx.fillText(alert.description, x + 15, y + 15);
          }
        });
        
        // Restore context
        ctx.restore();
      }
      
      // Draw component labels if enabled
      if (showLabels) {
        ctx.save();
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        // Only show labels for visible components
        aircraft.components.forEach(component => {
          if (!component.visible) return;
          
          let x, y;
          switch(component.id) {
            case 'comp1': // Fuselage
              x = canvas.width / 2;
              y = canvas.height / 2 - 20;
              break;
            case 'comp2': // Wings
              x = canvas.width / 2 - 100;
              y = canvas.height / 2 + 40;
              break;
            case 'comp3': // Engines
              x = canvas.width / 2 - 20;
              y = canvas.height / 2 + 30;
              break;
            case 'comp4': // Landing Gear
              x = canvas.width / 2;
              y = canvas.height / 2 + 60;
              break;
            case 'comp7': // Electrical Systems (Tail)
              x = canvas.width / 2 + 120;
              y = canvas.height / 2 - 50;
              break;
            default:
              // Don't show labels for other components
              return;
          }
          
          ctx.fillText(component.name, x, y);
        });
        
        ctx.restore();
      }
    }
  };

  useEffect(() => {
    // Redraw canvas when these settings change
    if (!loading && aircraft) {
      initCanvas();
    }
  }, [zoom, showLabels, showAlerts, viewAngle, selectedComponent, loading, aircraft]);

  const handleBack = () => {
    navigate(`/aircraft/${id}`);
  };

  const handleZoomChange = (event, newValue) => {
    setZoom(newValue);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 100));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 10));
  };

  const handleReset = () => {
    setZoom(50);
    setViewAngle('exterior');
    setSelectedComponent(null);
  };

  const handleToggleFullscreen = () => {
    // In a real application, this would toggle fullscreen mode
    setIsFullscreen(!isFullscreen);
  };

  const handleTakeScreenshot = () => {
    // In a real application, this would save the canvas as an image
    console.log('Taking screenshot');
  };

  const handleViewModeChange = (event) => {
    setViewMode(event.target.value);
  };

  const handleViewAngleChange = (event) => {
    setViewAngle(event.target.value);
  };

  const handleComponentClick = (componentId) => {
    setSelectedComponent(componentId === selectedComponent ? null : componentId);
  };

  const handleToggleComponentVisibility = (componentId) => {
    setAircraft(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === componentId ? { ...comp, visible: !comp.visible } : comp
      )
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading 3D model...
        </Typography>
      </Box>
    );
  }

  if (!aircraft) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography variant="h6">
          Aircraft not found or 3D model unavailable
        </Typography>
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
          {aircraft.model} ({aircraft.registrationNumber}) - 3D Viewer
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Paper 
            sx={{ 
              p: 1, 
              mb: 3, 
              height: isFullscreen ? 'calc(100vh - 120px)' : '600px',
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
              <Tooltip title="Zoom In">
                <IconButton onClick={handleZoomIn} size="small" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <IconButton onClick={handleZoomOut} size="small" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset View">
                <IconButton onClick={handleReset} size="small" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Toggle Fullscreen">
                <IconButton onClick={handleToggleFullscreen} size="small" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Take Screenshot">
                <IconButton onClick={handleTakeScreenshot} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <CameraIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <canvas 
              ref={canvasRef} 
              style={{ 
                width: '100%', 
                height: '100%', 
                backgroundColor: '#e0e0e0',
                cursor: 'move'
              }}
            />
            
            {selectedComponent && (
              <Paper 
                sx={{ 
                  position: 'absolute', 
                  bottom: 20, 
                  left: 20, 
                  p: 2, 
                  maxWidth: 300,
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {aircraft.components.find(c => c.id === selectedComponent)?.name}
                </Typography>
                <Typography variant="body2">
                  Category: {aircraft.components.find(c => c.id === selectedComponent)?.category}
                </Typography>
                <Typography variant="body2">
                  Status: Good condition
                </Typography>
                <Typography variant="body2">
                  Last inspection: 2025-04-10
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => navigate(`/maintenance?component=${selectedComponent}`)}
                >
                  View Maintenance History
                </Button>
              </Paper>
            )}
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="view-mode-label">View Mode</InputLabel>
                  <Select
                    labelId="view-mode-label"
                    id="view-mode"
                    value={viewMode}
                    label="View Mode"
                    onChange={handleViewModeChange}
                  >
                    <MenuItem value="3d">3D Model</MenuItem>
                    <MenuItem value="xray">X-Ray View</MenuItem>
                    <MenuItem value="wireframe">Wireframe</MenuItem>
                    <MenuItem value="exploded">Exploded View</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="view-angle-label">View Angle</InputLabel>
                  <Select
                    labelId="view-angle-label"
                    id="view-angle"
                    value={viewAngle}
                    label="View Angle"
                    onChange={handleViewAngleChange}
                  >
                    <MenuItem value="exterior">Exterior</MenuItem>
                    <MenuItem value="cockpit">Cockpit</MenuItem>
                    <MenuItem value="cabin">Cabin</MenuItem>
                    <MenuItem value="underside">Underside</MenuItem>
                    <MenuItem value="rear">Rear</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={showLabels} 
                        onChange={(e) => setShowLabels(e.target.checked)} 
                        size="small"
                      />
                    }
                    label="Labels"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={showAlerts} 
                        onChange={(e) => setShowAlerts(e.target.checked)} 
                        size="small"
                      />
                    }
                    label="Alerts"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography id="zoom-slider" gutterBottom>
                  Zoom: {zoom}%
                </Typography>
                <Slider
                  value={zoom}
                  onChange={handleZoomChange}
                  aria-labelledby="zoom-slider"
                  valueLabelDisplay="auto"
                  min={10}
                  max={100}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Aircraft Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Registration:</strong> {aircraft.registrationNumber}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Model:</strong> {aircraft.model}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Manufacturer:</strong> {aircraft.manufacturer}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Serial Number:</strong> {aircraft.serialNumber}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Year:</strong> {aircraft.yearOfManufacture}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Flight Hours:</strong> {aircraft.totalFlightHours}
            </Typography>
            <Typography variant="body2">
              <strong>Cycles:</strong> {aircraft.totalCycles}
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<InfoIcon />}
              onClick={() => navigate(`/aircraft/${id}`)}
              sx={{ mt: 2 }}
              fullWidth
            >
              Full Aircraft Details
            </Button>
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Components
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List dense disablePadding>
              {aircraft.components.map((component) => (
                <ListItem 
                  key={component.id}
                  disablePadding
                  sx={{ 
                    mb: 0.5, 
                    bgcolor: selectedComponent === component.id ? 'action.selected' : 'transparent',
                    borderRadius: 1
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {component.category === 'structure' ? <ViewInArIcon /> :
                     component.category === 'propulsion' ? <FlightIcon /> :
                     component.category === 'systems' ? <BuildIcon /> :
                     <SettingsIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={component.name}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { opacity: component.visible ? 1 : 0.5 }
                    }}
                    onClick={() => handleComponentClick(component.id)}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Tooltip title={component.visible ? "Hide Component" : "Show Component"}>
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => handleToggleComponentVisibility(component.id)}
                    >
                      {component.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Maintenance Alerts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {aircraft.maintenanceAlerts.length > 0 ? (
              <List dense disablePadding>
                {aircraft.maintenanceAlerts.map((alert) => (
                  <ListItem 
                    key={alert.id}
                    disablePadding
                    sx={{ 
                      mb: 0.5, 
                      bgcolor: alert.severity === 'high' ? 'error.light' : 'warning.light',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    <ListItemText 
                      primary={alert.component}
                      secondary={alert.description}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No maintenance alerts found
              </Typography>
            )}
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<BuildIcon />}
              onClick={() => navigate(`/maintenance?aircraft=${id}`)}
              sx={{ mt: 2 }}
              fullWidth
            >
              View Maintenance Tasks
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AircraftViewer;
