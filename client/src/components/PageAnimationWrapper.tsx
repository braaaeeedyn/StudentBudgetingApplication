import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageAnimationWrapperProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: 20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const PageAnimationWrapper: React.FC<PageAnimationWrapperProps> = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`page-${Date.now()}`} // Ensure a new component gets created on re-renders
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageAnimationWrapper; 