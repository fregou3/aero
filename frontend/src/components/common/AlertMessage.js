import React from 'react';
import { Alert, Snackbar, Slide } from '@mui/material';

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

const AlertMessage = ({ open, handleClose, severity, message }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity || 'info'} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertMessage;
