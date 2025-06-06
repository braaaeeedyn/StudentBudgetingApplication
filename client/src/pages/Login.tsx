import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid as MuiGrid,
  Link,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  alpha,
  useTheme
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useThemeContext } from '../contexts/ThemeContext';

// Create custom Grid component to work around TypeScript errors
const Grid = MuiGrid as any;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

// Animation for floating dollar signs
const FloatingDollarSigns = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dollarSignsRef = useRef<any[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const numDollarSigns = 37; // Increased by ~50% from 25
    const dollarSignColor = '#90EE90'; 

    const createDollarSign = () => {
      const size = Math.random() * 8 + 12; // 12px - 20px
      const speedFactor = Math.random() * (1.2 - 0.5) + 0.5; // Slower: Approx 0.5 to 1.2
      
      let x, y;
      if (Math.random() > 0.5) {
        x = Math.random() * canvas.width;
        y = canvas.height + size;
      } else {
        x = -size;
        y = Math.random() * canvas.height;
      }

      return {
        x,
        y,
        size,
        opacity: Math.random() * 0.2 + 0.7, 
        vx: speedFactor, 
        vy: -speedFactor, 
        character: '$'
      };
    };

    if (dollarSignsRef.current.length === 0) {
        for (let i = 0; i < numDollarSigns; i++) {
            dollarSignsRef.current.push(createDollarSign());
        }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dollarSignsRef.current.forEach((ds, index) => {
        ds.x += ds.vx;
        ds.y += ds.vy;

        ctx.font = `${ds.size}px Arial`;
        ctx.fillStyle = `rgba(${parseInt(dollarSignColor.slice(1,3), 16)}, ${parseInt(dollarSignColor.slice(3,5), 16)}, ${parseInt(dollarSignColor.slice(5,7), 16)}, ${ds.opacity})`;
        ctx.fillText(ds.character, ds.x, ds.y);

        if (ds.x > canvas.width + ds.size || ds.y < -ds.size) {
          dollarSignsRef.current[index] = createDollarSign();
           if (Math.random() > 0.5) {
            dollarSignsRef.current[index].x = Math.random() * canvas.width;
            dollarSignsRef.current[index].y = canvas.height + dollarSignsRef.current[index].size;
          } else {
            dollarSignsRef.current[index].x = -dollarSignsRef.current[index].size;
            dollarSignsRef.current[index].y = Math.random() * canvas.height;
          }
        }
      });

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

const loginSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password should be of minimum 6 characters')
    .required('Password is required'),
});

const Login: React.FC = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { darkMode } = useThemeContext();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      
      try {
        await login({
          email: values.email,
          password: values.password,
        });
        navigate('/');
      } catch (err) {
        setError(authError || 'Login failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <>
      <FloatingDollarSigns />
      <Container component="main" maxWidth="xs">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <motion.div variants={itemVariants}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  width: '100%',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: darkMode 
                    ? alpha(theme.palette.background.paper, 0.9)
                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.95))',
                  backdropFilter: 'blur(12px)',
                  boxShadow: darkMode
                    ? '0 10px 35px rgba(0, 0, 0, 0.35)'
                    : '0 10px 35px rgba(31, 38, 135, 0.2)',
                  transition: 'transform 0.4s ease-in-out, box-shadow 0.4s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: darkMode
                      ? '0 16px 45px rgba(0, 0, 0, 0.45)' 
                      : '0 16px 45px rgba(31, 38, 135, 0.3)',
                  }
                }}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2
                  }}
                >
                  <Avatar 
                    sx={{ 
                      m: 1, 
                      mb: 2, 
                      bgcolor: 'primary.main',
                      width: 60, 
                      height: 60,
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <LockOutlinedIcon fontSize="large" />
                  </Avatar>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography 
                    component="h1" 
                    variant="h5" 
                    sx={{ 
                      mb: 3,
                      fontWeight: 700,
                      background: darkMode 
                        ? 'linear-gradient(45deg, #64b5f6, #90caf9)' 
                        : 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Student Budget App
                  </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography 
                    component="h2" 
                    variant="h6"
                    sx={{ fontWeight: 500, mb: 2 }}
                  >
                    Sign In
                  </Typography>
                </motion.div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
                
                <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                  <motion.div variants={itemVariants}>
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
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: darkMode ? alpha(theme.palette.common.white, 0.7) : theme.palette.text.secondary,
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          transition: 'all 0.3s ease-in-out',
                          '& fieldset': {
                            borderColor: darkMode ? alpha(theme.palette.common.white, 0.23) : alpha(theme.palette.common.black, 0.23),
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.25)}`,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: theme.palette.primary.main,
                        }
                      }}
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: darkMode ? alpha(theme.palette.common.white, 0.7) : theme.palette.text.secondary,
                        },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            transition: 'all 0.3s ease-in-out',
                            '& fieldset': {
                                borderColor: darkMode ? alpha(theme.palette.common.white, 0.23) : alpha(theme.palette.common.black, 0.23),
                            },
                            '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.25)}`,
                            },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: theme.palette.primary.main,
                        }
                      }}
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{ 
                        mt: 3, 
                        mb: 2, 
                        py: 1.5,
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        background: darkMode 
                            ? 'linear-gradient(45deg, #42a5f5, #64b5f6)' 
                            : 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 7px 18px rgba(0, 0, 0, 0.2)',
                          filter: 'brightness(1.1)'
                        },
                        '&:active': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <CircularProgress 
                          size={24} 
                          sx={{
                            color: darkMode ? theme.palette.text.secondary : theme.palette.common.white
                          }}
                        />
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Grid container justifyContent="center">
                      <Grid item>
                        <Link 
                          component={RouterLink} 
                          to="/register" 
                          variant="body2"
                          sx={{
                            position: 'relative',
                            display: 'inline-block',
                            textDecoration: 'none',
                            color: theme.palette.primary.main,
                            fontWeight: 700,
                            transition: 'color 0.3s ease, transform 0.3s ease',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              width: '0%',
                              height: '2px',
                              bottom: '-4px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              backgroundColor: theme.palette.primary.dark,
                              transition: 'width 0.3s ease',
                            },
                            '&:hover': {
                              color: theme.palette.primary.dark,
                              transform: 'scale(1.05)',
                              '&::after': {
                                width: '100%',
                              },
                            },
                          }}
                        >
                          {"Don't have an account? Sign Up"}
                        </Link>
                      </Grid>
                    </Grid>
                  </motion.div>
                </Box>
              </Paper>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </>
  );
};

export default Login; 