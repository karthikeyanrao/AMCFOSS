import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if mobile on mount
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Don't set up cursor on mobile
        if (isMobile) return;

        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => setIsHovering(false);

        window.addEventListener('mousemove', updateMousePosition);

        // Add hover effect for clickable elements
        const clickables = document.querySelectorAll('a, button, .cursor-pointer, input, textarea, select');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            clickables.forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, [isMobile]);

    if (isMobile) {
        return null;
    }

    return (
        <>
            {/* Inner dot - green - instant response */}
            <div
                className="fixed w-2 h-2 bg-[#00ff88] rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-75 ease-linear"
                style={{
                    left: `${mousePosition.x - 4}px`,
                    top: `${mousePosition.y - 4}px`,
                    filter: 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.9))',
                    transform: `scale(${isHovering ? .8 : 1})`,
                }}
            />
            {/* Outer ring - black/dark with green border - smooth follow */}
            <div
                className="fixed w-8 h-8 border-2 border-[#00ff88] rounded-full pointer-events-none z-[9998] transition-all duration-150 ease-out"
                style={{
                    left: `${mousePosition.x - 16}px`,
                    top: `${mousePosition.y - 16}px`,
                    backgroundColor: 'rgba(26, 26, 46, 0.5)',
                    backdropFilter: 'blur(4px)',
                    filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.6))',
                    transform: `scale(${isHovering ? .8 : 1})`,
                }}
            />
        </>
    );
};

export default CustomCursor;