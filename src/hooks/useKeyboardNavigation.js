// Keyboard Navigation Hook for AMC FOSS Club
import { useEffect, useState, useRef, useCallback } from 'react';

const useKeyboardNavigation = (isEnabled = true) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorRotation, setCursorRotation] = useState(0);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const lastDirection = useRef('right');
  const moveSpeed = 10;
  const rotationSpeed = 15;

  // Initialize cursor position to center of screen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCursorPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e) => {
      // Prevent default behavior for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
      }

      setIsKeyboardActive(true);

      const newPosition = { ...cursorPosition };
      let directionChanged = false;
      let newDirection = lastDirection.current;

      switch (e.key) {
        case 'ArrowUp':
          newPosition.y = Math.max(0, cursorPosition.y - moveSpeed);
          if (lastDirection.current !== 'up') {
            newDirection = 'up';
            directionChanged = true;
          }
          break;

        case 'ArrowDown':
          newPosition.y = Math.min(window.innerHeight - 50, cursorPosition.y + moveSpeed);
          if (lastDirection.current !== 'down') {
            newDirection = 'down';
            directionChanged = true;
          }
          break;

        case 'ArrowLeft':
          newPosition.x = Math.max(0, cursorPosition.x - moveSpeed);
          if (lastDirection.current !== 'left') {
            newDirection = 'left';
            directionChanged = true;
          }
          break;

        case 'ArrowRight':
          newPosition.x = Math.min(window.innerWidth - 50, cursorPosition.x + moveSpeed);
          if (lastDirection.current !== 'right') {
            newDirection = 'right';
            directionChanged = true;
          }
          break;

        case 'Enter':
        case ' ':
          // Simulate click at cursor position
          handleClickAtCursor();
          return;

        case 'Escape':
          // Close modals or return to mouse control
          setIsKeyboardActive(false);
          handleEscapeKey();
          return;

        default:
          return;
      }

      // Update cursor position
      setCursorPosition(newPosition);

      // Update rotation if direction changed
      if (directionChanged) {
        const rotations = {
          'up': -90,
          'down': 90,
          'left': -180,
          'right': 0
        };
        setCursorRotation(rotations[newDirection]);
        lastDirection.current = newDirection;
      }
    };

    const handleMouseMove = () => {
      // When mouse moves, deactivate keyboard control
      setIsKeyboardActive(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [cursorPosition, isEnabled]);

  // Simulate click at cursor position
  const handleClickAtCursor = useCallback(() => {
    const elementAtCursor = document.elementFromPoint(
      cursorPosition.x + 25, // Center of cursor
      cursorPosition.y + 25
    );

    if (elementAtCursor) {
      // Find the closest clickable element
      const clickableElement = elementAtCursor.closest('a, button, input, textarea, [onclick], [role="button"]');

      if (clickableElement) {
        // Add visual feedback
        clickableElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
          clickableElement.style.transform = '';
        }, 100);

        // Trigger click
        clickableElement.click();
      }
    }
  }, [cursorPosition]);

  // Handle escape key
  const handleEscapeKey = useCallback(() => {
    // Find and close any open modals
    const modals = document.querySelectorAll('[role="dialog"], .modal');
    modals.forEach(modal => {
      const closeButton = modal.querySelector('button[aria-label*="Close"], button[onclick*="close"]');
      if (closeButton) {
        closeButton.click();
      }
    });
  }, []);

  // Update cursor position from mouse (when keyboard control is inactive)
  const updateCursorPosition = useCallback((x, y) => {
    if (!isKeyboardActive) {
      setCursorPosition({ x, y });
      setCursorRotation(0); // Reset rotation when using mouse
    }
  }, [isKeyboardActive]);

  return {
    cursorPosition,
    cursorRotation,
    isKeyboardActive,
    updateCursorPosition,
    setIsKeyboardActive
  };
};

export default useKeyboardNavigation;