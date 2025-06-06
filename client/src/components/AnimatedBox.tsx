import React, { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, BoxProps } from '@mui/material';

interface AnimatedBoxProps extends BoxProps {
  children: ReactNode;
  delay?: number;
  animation?: 'fadeIn' | 'slideUp' | 'scaleUp' | 'slideIn' | 'slideDown';
  duration?: number;
}

const AnimatedBox: React.FC<AnimatedBoxProps> = ({ 
  children, 
  delay = 0,
  animation = 'fadeIn',
  duration = 0.5,
  ...props 
}) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getAnimationVariants = () => {
    switch (animation) {
      case 'fadeIn':
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1, 
            transition: { 
              duration, 
              delay,
              when: "beforeChildren"
            } 
          }
        };
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
              type: 'spring', 
              stiffness: 100, 
              damping: 15, 
              delay,
              when: "beforeChildren"
            } 
          }
        };
      case 'slideDown':
        return {
          hidden: { opacity: 0, y: -50 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
              type: 'spring', 
              stiffness: 100, 
              damping: 15, 
              delay,
              when: "beforeChildren"
            } 
          }
        };
      case 'scaleUp':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { 
              type: 'spring', 
              stiffness: 100, 
              delay,
              when: "beforeChildren"
            } 
          }
        };
      case 'slideIn':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { 
            opacity: 1, 
            x: 0, 
            transition: { 
              type: 'spring', 
              stiffness: 100, 
              damping: 15, 
              delay,
              when: "beforeChildren"
            } 
          }
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1, 
            transition: { 
              duration, 
              delay,
              when: "beforeChildren"
            } 
          }
        };
    }
  };

  // Use a unique key to force a re-render with animations
  const uniqueKey = `animated-box-${animation}-${delay}`;

  // Only render animation on client-side to prevent hydration issues
  if (!isClient) {
    return (
      <Box {...props} style={{ opacity: 0 }}>
        {children}
      </Box>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Box
        component={motion.div}
        key={uniqueKey}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={getAnimationVariants()}
        {...props}
      >
        {children}
      </Box>
    </AnimatePresence>
  );
};

export default AnimatedBox; 