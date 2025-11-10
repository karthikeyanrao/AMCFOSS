// Car Cursor Component for AMC FOSS Club
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';

const CarCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [cursorSize, setCursorSize] = useState(40);
  const [showCursor, setShowCursor] = useState(false);

  const {
    cursorPosition,
    cursorRotation,
    isKeyboardActive,
    updateCursorPosition
  } = useKeyboardNavigation();

  // Mouse movement effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;

      // Update cursor position
      updateCursorPosition(clientX - 20, clientY - 20); // Center the car cursor

      // Check if hovering over interactive elements
      const target = e.target;
      const isInteractive = target.closest('a, button, .team-card, .project-card, .about-card, input, textarea, [role="button"]');

      setIsHovering(!!isInteractive);
      setCursorSize(isInteractive ? 50 : 40);
    };

    const handleMouseEnter = () => setShowCursor(true);
    const handleMouseLeave = () => setShowCursor(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [updateCursorPosition]);

  // Don't show cursor on touch devices
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  if (isTouchDevice() || !showCursor) {
    return null;
  }

  return (
    <>
      {/* Main Car Cursor */}
      <motion.div
        className={`car-cursor ${isHovering ? 'hovering' : ''} ${isKeyboardActive ? 'keyboard-active' : ''}`}
        style={{
          position: 'fixed',
          left: cursorPosition.x,
          top: cursorPosition.y,
          width: cursorSize,
          height: cursorSize,
          zIndex: 9999,
          pointerEvents: 'none',
          transform: `rotate(${cursorRotation}deg)`,
        }}
        animate={{
          scale: isHovering ? 1.2 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
        }}
      >
        {/* Car Body */}
        <div className="car-body">
          {/* Car Emoji or SVG */}
          <span className="car-emoji" style={{ fontSize: cursorSize * 0.8 }}>
            🚗
          </span>

          {/* Keyboard Active Indicator */}
          {isKeyboardActive && (
            <motion.div
              className="keyboard-indicator"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full"
            >
              <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
            </motion.div>
          )}
        </div>

        {/* Hover Effect Ring */}
        <motion.div
          className="hover-ring"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isHovering ? 1.5 : 0,
            opacity: isHovering ? 0.3 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: cursorSize * 2,
            height: cursorSize * 2,
            border: '2px solid rgba(147, 51, 234, 0.5)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* Trail Effect */}
      {isKeyboardActive && (
        <div className="car-trail">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="trail-particle"
              style={{
                position: 'fixed',
                left: cursorPosition.x - i * 10,
                top: cursorPosition.y + 15,
                width: 8 - i * 2,
                height: 8 - i * 2,
                backgroundColor: `rgba(147, 51, 234, ${0.3 - i * 0.1})`,
                borderRadius: '50%',
                zIndex: 9998 - i,
                pointerEvents: 'none',
              }}
              animate={{
                scale: [1, 0.5, 0],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}

      {/* Keyboard Controls Help */}
      {isKeyboardActive && (
        <motion.div
          className="keyboard-help"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 10000,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="font-semibold mb-2">🎮 Keyboard Controls</div>
          <div className="space-y-1 text-xs">
            <div>↑↓←→ Move car cursor</div>
            <div>Enter/Space Click at cursor</div>
            <div>Escape Return to mouse</div>
          </div>
        </motion.div>
      )}

      {/* CSS for cursor styles */}
      <style jsx>{`
        .car-cursor {
          transition: transform 0.1s ease-out;
        }

        .car-cursor.hovering {
          filter: drop-shadow(0 0 10px rgba(147, 51, 234, 0.6));
        }

        .car-cursor.keyboard-active {
          filter: drop-shadow(0 0 15px rgba(34, 197, 94, 0.8));
        }

        .car-body {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .car-emoji {
          display: block;
          user-select: none;
          transform: scaleX(-1); /* Face right by default */
        }

        .car-cursor.keyboard-active .car-emoji {
          animation: bounce 0.5s ease-in-out infinite alternate;
        }

        @keyframes bounce {
          from {
            transform: scaleX(-1) translateY(0);
          }
          to {
            transform: scaleX(-1) translateY(-3px);
          }
        }

        .keyboard-indicator {
          position: absolute !important;
        }

        /* Hide default cursor */
        body {
          cursor: none !important;
        }

        /* Show default cursor on input fields */
        input, textarea, [contenteditable] {
          cursor: text !important;
        }

        /* Show default cursor on links and buttons when hovering */
        a:hover, button:hover, [role="button"]:hover {
          cursor: pointer !important;
        }

        /* Mobile devices - hide custom cursor */
        @media (max-width: 768px) {
          .car-cursor,
          .keyboard-help,
          .car-trail {
            display: none !important;
          }

          body {
            cursor: auto !important;
          }
        }
      `}</style>
    </>
  );
};

export default CarCursor;