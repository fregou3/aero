import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Link,
  Typography,
  CircularProgress
} from '@mui/material';
// axios will be used when implementing the actual API call
import AlertMessage from '../../components/common/AlertMessage';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [emailSent, setEmailSent] = useState(false);

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // In a real application, this would call an API endpoint
        // For now, we'll just simulate a successful response
        // await axios.post('/api/auth/forgot-password', { email: values.email });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAlertMessage('Password reset instructions have been sent to your email.');
        setAlertSeverity('success');
        setAlertOpen(true);
        setEmailSent(true);
      } catch (error) {
        setAlertMessage(error.response?.data?.message || 'Failed to process your request. Please try again.');
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Reset Password
      </Typography>
      
      {!emailSent ? (
        <>
          <Typography variant="body2" sx={{ mb: 3 }} align="center">
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>
          
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to Sign In
              </Link>
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
          </Typography>
          
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Return to Sign In
          </Button>
        </Box>
      )}
      
      <AlertMessage
        open={alertOpen}
        handleClose={handleCloseAlert}
        severity={alertSeverity}
        message={alertMessage}
      />
    </Box>
  );
};

export default ForgotPassword;
