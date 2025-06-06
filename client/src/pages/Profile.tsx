import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const profileSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username should be of minimum 3 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password should be of minimum 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      try {
        const updateData: any = {
          username: values.username,
          email: values.email,
        };
        
        if (values.password) {
          updateData.password = values.password;
        }
        
        await updateProfile(updateData);
        setSuccess('Profile updated successfully!');
        formik.setFieldValue('password', '');
        formik.setFieldValue('confirmPassword', '');
      } catch (err) {
        console.error('Profile update error:', err);
        setError('Failed to update profile. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Account Information
          </Typography>
          
          <TextField
            fullWidth
            margin="normal"
            id="username"
            name="username"
            label="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
          
          <TextField
            fullWidth
            margin="normal"
            id="email"
            name="email"
            label="Email Address"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Change Password (optional)
          </Typography>
          
          <TextField
            fullWidth
            margin="normal"
            id="password"
            name="password"
            label="New Password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          
          <TextField
            fullWidth
            margin="normal"
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ py: 1.2, px: 4 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Update Profile'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 