import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const ScrollReveal = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const variants = {
    up: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    },
    down: {
      hidden: { opacity: 0, y: -50 },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants[direction]}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;

