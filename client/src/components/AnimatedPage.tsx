import React, { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

interface AnimatedPageProps {
  children: ReactNode;
  delay?: number;
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ 
  children, 
  delay = 0 
}) => {
  // Use state to track if component is mounted to prevent flash of content
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small timeout to ensure content doesn't flash
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const pageVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      exit="exit"
      variants={pageVariants}
      style={{ width: '100%' }}
    >
      {children}
    </Box>
  );
};

export default AnimatedPage; 