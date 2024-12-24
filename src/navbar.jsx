import React, { useState, useEffect } from "react";
import "./Foss2.css";
import Logo from "./LOGO.jpg";
const Navbar = () => {
  const [navbarStyle, setNavbarStyle] = useState({
    background: "rgba(26, 26, 46, 0.7)",
    boxShadow: "none",
  });
  const [isNavActive, setNavActive] = useState(false);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setNavbarStyle({
          background: "rgba(26, 26, 46, 0.95)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        });
      } else {
        setNavbarStyle({
          background: "rgba(26, 26, 46, 0.7)",
          boxShadow: "none",
        });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav id="navbar" className="navbar" style={navbarStyle}>
      <div className="nav-content">
        <div className="logo">
        <img src={Logo} alt="FOSS Logo" className="nav-logo" />
          <span>FOSS Club</span>
        </div>
        <div
          id="navToggle"
          className={`nav-toggle ${isNavActive ? "active" : ""}`}
          onClick={() => setNavActive(!isNavActive)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        <ul className={`nav-links ${isNavActive ? "active" : ""}`}>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#events">Events</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#team">Team</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><button className="join-btn">Join Us</button></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
