import { Theme } from '@mui/material/styles';

export const getCardStyle = (theme: Theme) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)' 
    : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  boxShadow: theme.shadows[4],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: theme.palette.primary.main,
  },
  padding: {
    xs: theme.spacing(2),
    sm: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.shape.borderRadius,
  },
});

export const getPageContainerStyle = (theme: Theme) => ({
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    maxWidth: '100%',
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: '95%',
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: '90%',
  },
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
  boxSizing: 'border-box',
});

export const getSectionHeadingStyle = (theme: Theme) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: 600,
  position: 'relative',
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: '60px',
    height: '4px',
    background: theme.palette.primary.main,
    borderRadius: '2px',
  },
});

export const getFormFieldStyle = (theme: Theme) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
});

export const getButtonStyle = (theme: Theme) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(0.75, 2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1, 3),
  },
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  whiteSpace: 'nowrap',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(0.5),
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(1),
    },
  },
});

export const getTableStyle = (theme: Theme) => ({
  '& .MuiTable-root': {
    minWidth: 650,
  },
  '& .MuiTableHead-root': {
    '& .MuiTableCell-root': {
      fontWeight: 600,
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    },
  },
  '& .MuiTableRow-root': {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
});

export const getMetricCardStyle = (theme: Theme) => ({
  ...getCardStyle(theme),
  padding: theme.spacing(2),
  textAlign: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '2.5rem',
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  '& h3': {
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: theme.spacing(1, 0),
  },
  '& p': {
    color: theme.palette.text.secondary,
    margin: 0,
  },
});
