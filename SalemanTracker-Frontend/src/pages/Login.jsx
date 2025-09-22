import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HomeIcon from '@mui/icons-material/Home';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const RoleButton = ({ label, icon: Icon, gradient, onClick, delay }) => (
  <MotionBox
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    textAlign="center"
  >
    <Button
      variant="contained"
      onClick={onClick}
      aria-label={`Login as ${label}`}
      sx={{
        width: { xs: 90, sm: 120, md: 150 },
        height: { xs: 90, sm: 120, md: 150 },
        borderRadius: '50%',
        background: gradient,
        color: 'white',
        boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.1)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon sx={{ fontSize: { xs: 50, sm: 64, md: 84 } }} />
    </Button>
    <Typography
      variant="h6"
      fontWeight="600"
      sx={{
        mt: 1.5,
        color: '#4a2f1a',
        fontSize: { xs: 14, sm: 16, md: 17 },
      }}
    >
      {label}
    </Typography>
  </MotionBox>
);

const Login = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("https://res.cloudinary.com/dsrrvz65s/image/upload/v1758534434/login_mha0yb.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 5, md: 6 },
            borderRadius: 4,
            textAlign: 'center',
            width: '100%',
            maxWidth: 380,
            bgcolor: 'rgba(255, 244, 229, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          }}
        >
          <Typography
            variant="h5"
            fontWeight="750"
            fontSize={{ xs: 20, sm: 24, md: 28 }}
            sx={{ mb: 4, color: '#4a2f1a' }}
          >
            Choose Your Role
          </Typography>

          {/* Home Button */}
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              mb: 4,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: '600',
              px: 3,
              py: 1,
            }}
          >
            Home
          </Button>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: { xs: 3, sm: 4, md: 5 },
            }}
          >
            <RoleButton
              label="Salesman"
              icon={PersonIcon}
              gradient="linear-gradient(145deg, #4facfe, #00f2fe)"
              onClick={() => navigate('/salesman-login')}
              delay={0.2}
            />

            <RoleButton
              label="Admin"
              icon={AdminPanelSettingsIcon}
              gradient="linear-gradient(145deg, #ff9966, #ff5e62)"
              onClick={() => navigate('/admin-login')}
              delay={0.5}
            />
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Login;
