import React, { useEffect, useRef, useState } from "react";

const carSvg = `
<svg width="36" height="20" viewBox="0 0 64 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 26C8 20.477 12.477 16 18 16H44C49.523 16 54 20.477 54 26V30C54 31.105 53.105 32 52 32H50C50 34.209 48.209 36 46 36C43.791 36 42 34.209 42 32H22C22 34.209 20.209 36 18 36C15.791 36 14 34.209 14 32H12C10.895 32 10 31.105 10 30V26H8Z" fill="#2563eb"/>
<path d="M16 12L22 4H42L48 12H16Z" fill="#1e40af"/>
<circle cx="18" cy="32" r="3" fill="#0f172a"/>
<circle cx="46" cy="32" r="3" fill="#0f172a"/>
<rect x="24" y="6" width="16" height="4" rx="1" fill="#93c5fd"/>
</svg>
`;

export default function CarCursor({ mode = "car", isMobile = false }) {
  const [pos, setPos] = useState({ x: typeof window !== "undefined" ? window.innerWidth / 2 : 0, y: typeof window !== "undefined" ? window.innerHeight / 2 : 0 });
  const ref = useRef(null);
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const hoverRef = useRef(null);

  useEffect(() => {
    if (mode !== "car" || isMobile) return;
    const onMouseMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [mode, isMobile]);

  useEffect(() => {
    if (mode !== "car" || isMobile) return;
    const step = () => {
      setPos((p) => {
        const nx = Math.max(0, Math.min(window.innerWidth, p.x + velocityRef.current.vx));
        const ny = Math.max(0, Math.min(window.innerHeight, p.y + velocityRef.current.vy));
        return { x: nx, y: ny };
      });
      requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mode, isMobile]);

  useEffect(() => {
    if (mode !== "car" || isMobile) {
      document.body.classList.remove("hide-system-cursor");
      return;
    }
    const speed = 6;
    const onKeyDown = (e) => {
      if (e.key === "ArrowUp") velocityRef.current.vy = -speed;
      if (e.key === "ArrowDown") velocityRef.current.vy = speed;
      if (e.key === "ArrowLeft") velocityRef.current.vx = -speed;
      if (e.key === "ArrowRight") velocityRef.current.vx = speed;
      if (e.key === "Enter" || e.key === " ") {
        const el = document.elementFromPoint(pos.x, pos.y);
        if (el) {
          el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: pos.x, clientY: pos.y }));
        }
      }
    };
    const onKeyUp = (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") velocityRef.current.vy = 0;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") velocityRef.current.vx = 0;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.body.classList.add("hide-system-cursor");
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.body.classList.remove("hide-system-cursor");
    };
  }, [mode, isMobile, pos.x, pos.y]);

  useEffect(() => {
    if (mode !== "car" || isMobile) {
      if (hoverRef.current) {
        hoverRef.current.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true, clientX: pos.x, clientY: pos.y }));
        hoverRef.current = null;
      }
      return;
    }
    const el = document.elementFromPoint(pos.x, pos.y);
    if (el !== hoverRef.current) {
      if (hoverRef.current) {
        hoverRef.current.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true, clientX: pos.x, clientY: pos.y }));
      }
      if (el) {
        el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true, clientX: pos.x, clientY: pos.y }));
      }
      hoverRef.current = el || null;
    }
    if (el) {
      el.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: pos.x, clientY: pos.y }));
    }
    return () => {
      if (hoverRef.current) {
        hoverRef.current.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true, clientX: pos.x, clientY: pos.y }));
        hoverRef.current = null;
      }
    };
  }, [mode, isMobile, pos.x, pos.y]);
  if (mode !== "car" || isMobile) return null;
  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        zIndex: 9999,
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
      dangerouslySetInnerHTML={{ __html: carSvg }}
    />
  );
}


