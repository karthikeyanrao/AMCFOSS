import React, { useEffect, useState } from "react";

export default function CircleCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const hideCursor = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", updateCursor);
    document.addEventListener("mouseleave", hideCursor);
    document.addEventListener("mouseenter", () => setIsVisible(true));

    return () => {
      window.removeEventListener("mousemove", updateCursor);
      document.removeEventListener("mouseleave", hideCursor);
      document.removeEventListener("mouseenter", () => setIsVisible(true));
    };
  }, []);

  return (
    <div
      className="circle-cursor"
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: "none",
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    >
      <div className="cursor-outer"></div>
      <div className="cursor-inner"></div>
    </div>
  );
}

