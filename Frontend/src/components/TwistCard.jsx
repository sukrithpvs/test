import React, { useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const TwistCard = ({ children, className = "" }) => {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useSpring(0, { stiffness: 150, damping: 20 });
    const y = useSpring(0, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(y, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(x, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative transition-all duration-200 ease-out ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default TwistCard;
