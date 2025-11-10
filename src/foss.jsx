import React, { useEffect, useState, useRef, useCallback } from "react";
import "./Foss2.css";
import "aos/dist/aos.css";
import AOS from "aos";
import "font-awesome/css/font-awesome.min.css";
import VanillaTilt from "vanilla-tilt";
import AuthModal from "./components/AuthModal";
import AuthButton from "./components/AuthButton";
import DashboardModal from "./components/DashboardModal";

const FossApp = () => {
  // State management
  const [countdown1, setCountdown1] = useState("");
  const [countdown2, setCountdown2] = useState("");
  const [typedText, setTypedText] = useState("");
  const [restart, setRestart] = useState(false);
  const [isNavActive, setIsNavActive] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [touchStart, setTouchStart] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorDotPosition, setCursorDotPosition] = useState({ x: 0, y: 0 });
  const [cursorSize, setCursorSize] = useState(30);
  const [isHovering, setIsHovering] = useState(false);
  const [currentContactSlide, setCurrentContactSlide] = useState(0);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Refs
  const navbarRef = useRef(null);
  const carouselRef = useRef(null);
  const autoplayRef = useRef(null);
  const testimonialIntervalRef = useRef(null);
  const teamMarqueeRef = useRef(null);
  const cursorRef = useRef(null);

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, offset: 100, once: true });
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (navbarRef.current) {
        if (window.scrollY > 100) {
          navbarRef.current.style.background = 'rgba(26, 26, 46, 0.95)';
          navbarRef.current.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
          navbarRef.current.style.background = 'rgba(26, 26, 46, 0.7)';
          navbarRef.current.style.boxShadow = 'none';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile menu toggle
  const toggleNav = () => {
    setIsNavActive(prev => !prev);
  };

  // Smooth scrolling
  const smoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsNavActive(false);
    }
  };

  // Form submission handling
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(e.target.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        alert('Thank you for your message! We will get back to you soon.');
        e.target.reset();
      } else {
        alert('Oops! There was a problem submitting your form.');
      }
    } catch (error) {
      alert('Oops! There was a problem submitting your form.');
    }
  };

  // Newsletter subscription
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
    e.target.reset();
  };

  // Typing effect
  useEffect(() => {
    const text = "Where Innovation Meets Open Source";
    let index = 0;

    const typeWriter = () => {
      if (index < text.length) {
        setTypedText(prev => prev + text.charAt(index));
        index++;
        setTimeout(typeWriter, 50);
      } else {
        setTimeout(() => {
          setTypedText("");
          setRestart(prev => !prev);
        }, 5000);
      }
    };

    typeWriter();
  }, [restart]);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const events = [
        { id: "countdown1", date: new Date("2025-01-29T00:00:00").getTime() },
        { id: "countdown2", date: new Date("2025-01-30T00:00:00").getTime() }
      ];

      const calculateTimeLeft = (eventDate) => {
        const distance = eventDate - now;
        if (distance <= 0) return "Event Ended";
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      };

      setCountdown1(calculateTimeLeft(events[0].date));
      setCountdown2(calculateTimeLeft(events[1].date));
    };

    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Particles.js initialization
  useEffect(() => {
    const loadParticles = async () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js';
        script.async = true;
        script.onload = () => {
          if (window.particlesJS) {
            window.particlesJS("particles-js", {
              particles: {
                number: { value: 40 },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 6, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
              }
            });
          }
        };
        document.body.appendChild(script);
      } catch (error) {
        console.warn("Failed to load particles.js:", error);
      }
    };

    loadParticles();
  }, []);

  // Carousel functionality
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startCarouselAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setCurrentSlide(prev => 
        prev >= (isMobile ? 2 : 0) ? 0 : prev + 1
      );
    }, 5000);
  }, [isMobile]);

  useEffect(() => {
    startCarouselAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [startCarouselAutoplay]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50 && currentSlide < 2) {
      setCurrentSlide(prev => prev + 1);
    } else if (diff < -50 && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }

    setTouchStart(null);
  };

  // VanillaTilt initialization
  useEffect(() => {
    const elements = document.querySelectorAll(".about-card");
    elements.forEach(element => {
      VanillaTilt.init(element, {
        max: 25,
        speed: 400,
        glare: true,
        "max-glare": 0.5
      });
    });
  }, []);

  // Team members data
  const teamMembers = [
    { 
      name: "Shashanky", 
      role: "President",
      roleIcon: "fas fa-crown",
      photo: "/images/photo.png",
      social: {
        instagram: "Shashank_y_4.5",
        github: "shashank-y",
        linkedin: "shashanky"
      }
    },
    { 
      name: "Harish Praveen", 
      role: "Vice President",
      roleIcon: "fas fa-star",
      photo: "/images/photo.png",
      social: {
        instagram: "janesmith",
        github: "janesmith",
        linkedin: "jane-smith"
      }
    },
    { 
      name: "Pravin Dharsaun", 
      role: "Coordinator",
      roleIcon: "fas fa-tasks",
      photo: "/images/photo.png",
      social: {
        instagram: "boii__loather",
        github: "pravin",
        linkedin: "pravin-dharsaun"
      }
    },
    { 
      name: "Karthikeyan", 
      role: "Technical Lead",
      roleIcon: "fas fa-code",
      photo: "/images/photo.png",
      social: {
        instagram: "alexj_tech",
        github: "alexj",
        linkedin: "alex-johnson"
      }
    },
    { 
      name: "Padmaja", 
      role: "Design Head",
      roleIcon: "fas fa-palette",
      photo: "/images/photo.png",
      social: {
        instagram: "sarah_designs",
        github: "sarahw",
        linkedin: "sarah-wilson"
      }
    }
  ];

  // Auto-sliding functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teamMembers.length);
    }, 3000);

    return () => clearInterval(slideInterval);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % teamMembers.length);
  };

  const handleContactSlide = (direction) => {
    if (direction === 'next') {
      setCurrentContactSlide(prev => (prev + 1) % 3);
    } else {
      setCurrentContactSlide(prev => (prev - 1 + 3) % 3);
    }
  };

  // Mouse movement effect for custom cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      
      // Update cursor position immediately
      setCursorPosition({ x: clientX, y: clientY });
      
      // Update dot position with a slight delay for smooth effect
      setTimeout(() => {
        setCursorDotPosition({ x: clientX, y: clientY });
      }, 100);

      // Check if hovering over interactive elements
      const target = e.target;
      const isInteractive = target.closest('a, button, .team-card, .project-card, .about-card, input, textarea');
      setIsHovering(!!isInteractive);
      setCursorSize(isInteractive ? 50 : 30);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div>
      {/* Custom Cursor */}
      <div 
        className={`custom-cursor ${isHovering ? 'hover' : ''}`}
        style={{
          transform: `translate(${cursorPosition.x}px, ${cursorPosition.y}px)`,
          width: `${cursorSize}px`,
          height: `${cursorSize}px`
        }}
      />
      <div 
        className="cursor-dot"
        style={{
          transform: `translate(${cursorDotPosition.x}px, ${cursorDotPosition.y}px)`
        }}
      />

      <nav id="navbar" className={`navbar ${isNavActive ? 'active' : ''}`} ref={navbarRef}>
        <div className="nav-content">
          <div className="logo">
            <img src="/images/amc-foss-logo.png" alt="FOSS" className="nav-logo" />
            <span>FOSS Club</span>
          </div>
          <div 
            id="navToggle" 
            className={`nav-toggle ${isNavActive ? 'active' : ''}`}
            onClick={toggleNav}
            aria-expanded={isNavActive}
            aria-controls="nav-links"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          <ul className={`nav-links ${isNavActive ? 'active' : ''}`}>
            <li><a href="#home" onClick={(e) => smoothScroll(e, '#home')} className="active">Home</a></li>
            <li><a href="#about" onClick={(e) => smoothScroll(e, '#about')}>About</a></li>
            <li><a href="#events" onClick={(e) => smoothScroll(e, '#events')}>Events</a></li>
            <li><a href="#projects" onClick={(e) => smoothScroll(e, '#projects')}>Projects</a></li>
            <li><a href="#team" onClick={(e) => smoothScroll(e, '#team')}>Team</a></li>
            <li><a href="#contact" onClick={(e) => smoothScroll(e, '#contact')}>Contact</a></li>
            <li>
              <AuthButton
                onAuthModalOpen={() => setIsAuthModalOpen(true)}
                onDashboardOpen={() => setIsDashboardOpen(true)}
              />
            </li>
          </ul>
        </div>
      </nav>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Dashboard Modal */}
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />

      <section id="home" className="section hero">
        <div className="hero-content" data-aos="fade-up">
          <h1 className="glitch" data-text="#BuildWithFOSS">#BuildWithFOSS</h1>
          <h2 className="typewriter">{typedText}</h2>
          <p className="hero-description">
            Join us in building the future of technology through collaboration and
            open-source development
          </p>
          <div className="hero-buttons">
            <a href="#" className="btn primary-btn">Get Started</a>
            <a href="#" className="btn secondary-btn">Learn More</a>
          </div>
        </div>
        <div className="hero-overlay"></div>
        <div id="particles-js" className="hero-particles"></div>
        <div className="scroll-indicator">
          <span className="mouse">
            <span className="wheel"></span>
          </span>
          <p>Scroll Down</p>
        </div>
      </section>

      <section id="about" className="section about">
        <div className="section-content">
          <h2 className="section-title" data-aos="fade-up">About Our Club</h2>
          <div className="about-grid">
            <div className="about-card" data-aos="fade-right">
              <i className="fas fa-code"></i>
              <h3>Open Source Development</h3>
              <p>Learn and contribute to real-world open source projects</p>
            </div>
            <div className="about-card" data-aos="fade-up">
              <i className="fas fa-users"></i>
              <h3>Community</h3>
              <p>Join a vibrant community of developers and enthusiasts</p>
            </div>
            <div className="about-card" data-aos="fade-left">
              <i className="fas fa-laptop-code"></i>
              <h3>Workshops</h3>
              <p>Regular workshops on latest technologies and tools</p>
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="section events">
        <div className="section-content">
          <h2 className="section-title" data-aos="fade-up">Upcoming Events</h2>
          <div className="events-grid">
            <div className="event-card" data-aos="fade-up">
              <div className="event-date">
                <span className="day">29</span>
                <span className="month">JAN</span>
              </div>
              <div className="event-details">
                <h3>FOSS Hackathon 2024</h3>
                <p>48-hour coding challenge</p>
                <div className="countdown">{countdown1}</div>
                <button className="primary-btn">Register Now</button>
              </div>
            </div>
            <div className="event-card" data-aos="fade-up">
              <div className="event-date">
                <span className="day">30</span>
                <span className="month">JAN</span>
              </div>
              <div className="event-details">
                <h3>Open Source Fiesta</h3>
                <p>A celebration of open-source technologies and communities</p>
                <div className="countdown">{countdown2}</div>
                <button className="primary-btn">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="section projects">
        <div className="section-content">
          <h2 className="section-title" data-aos="fade-up">Our Projects</h2>
          <div className="projects-grid">
            <div className="project-card featured" data-aos="fade-up">
              <img
                src="https://mars-images.imgix.net/seobot/osssoftware.org/65a1c64780fd6a912cffdb41-28202c73b8cd98f80c118a2059313b9b.png?auto=compress"
                alt="Featured Project"
                loading="lazy"
              />
              <div className="project-info">
                <h3>Featured: Open Source Collaboration Platform</h3>
                <p>
                  A cutting-edge platform designed to streamline open source
                  contributions and foster community collaboration.
                </p>
                <div className="project-tech">
                  <span>React</span>
                  <span>Node.js</span>
                  <span>GraphQL</span>
                </div>
                <div className="project-links">
                  <a href="#" className="github-link">View on GitHub</a>
                  <a href="#" className="demo-link">Live Demo</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
       {/* Scroll Progress Bar */}
       <div className="scroll-progress" style={{ transform: `scaleX(${window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)})` }} />

{/* Team Section */}
<section id="team" className="section team">
  <div className="section-content">
    <h2 className="section-title" data-aos="fade-up">Meet Our Team</h2>
    <p className="section-subtitle" data-aos="fade-up">The amazing people behind FOSS Club</p>
    <div className="team-slider-container">
      <div className="team-slider">
        {teamMembers.map((member, index) => {
          let position = '';
          if (index === currentSlide) {
            position = 'active';
          } else if (index === (currentSlide - 1 + teamMembers.length) % teamMembers.length) {
            position = 'prev';
          } else if (index === (currentSlide + 1) % teamMembers.length) {
            position = 'next';
          }
          
          return (
            <div 
              key={index} 
              className={`team-card ${position}`}
              style={{
                transform: position === 'active' 
                  ? 'translate(-50%, -50%) scale(1)' 
                  : position === 'prev'
                  ? 'translate(-150%, -50%) scale(0.8)'
                  : position === 'next'
                  ? 'translate(50%, -50%) scale(0.8)'
                  : 'translate(-50%, -50%) scale(0.8)',
                opacity: position ? (position === 'active' ? 1 : 0.6) : 0,
                pointerEvents: position ? 'auto' : 'none'
              }}
            >
              <div className="member-image-wrapper">
                <img src={member.photo} alt={member.name} className="shine-effect" />
                <div className="member-overlay">
                  <div className="social-links">
                    <a href={`https://github.com/${member.social.github}`} target="_blank" rel="noopener noreferrer" className="magnetic">
                      <i className="fab fa-github"></i>
                    </a>
                    <a href={`https://linkedin.com/in/${member.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="magnetic">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href={`https://instagram.com/${member.social.instagram}`} target="_blank" rel="noopener noreferrer" className="magnetic">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>
              <div className="member-info">
                <div className="member-role-badge">
                  <i className={member.roleIcon}></i>
                  <span>{member.role}</span>
                </div>
                <h3 className="interactive-text" data-text={member.name}>{member.name}</h3>
              </div>
            </div>
          );
        })}
      </div>
      <div className="slider-controls">
        <button className="slider-arrow prev magnetic" onClick={handlePrevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <div className="slider-dots">
          {teamMembers.map((_, index) => (
            <span
              key={index}
              className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        <button className="slider-arrow next magnetic" onClick={handleNextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</section>

      <section id="contact" className="section contact">
        <div className="section-content">
          <h2 className="section-title" data-aos="fade-up">Get In Touch</h2>
          <div className="contact-container">
            <div className="contact-slider" style={{ transform: `translateX(-${currentContactSlide * 320}px)` }}>
              <div className="contact-info" data-aos="fade-right">
                <div className="contact-profile">
                  <img src="/images/amc-foss-logo.png" alt="FOSS Club" />
                </div>
                <h3 className="contact-title">FOSS Club</h3>
                <p className="contact-subtitle">Join our community of open source enthusiasts</p>
                <div className="info-item">
                  <i className="fas fa-envelope"></i>
                  <p>amcfoss@gmail.com</p>
                </div>
                <div className="info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <p>Amrita Vishwa Vidyapeetham, Chennai Campus</p>
                </div>
                <div className="social-links">
                  <a href="#"><i className="fab fa-facebook"></i></a>
                  <a href="https://discord.gg/4vsg5Fpw"><i className="fab fa-discord"></i></a>
                  <a href="https://instagram.com/amcfoss"><i className="fab fa-instagram"></i></a>
                  <a href="https://linkedin.com/company/amcfoss"><i className="fab fa-linkedin"></i></a>
                </div>
              </div>

              <form
                className="contact-form"
                action="https://formspree.io/f/mbllgedv"
                method="POST"
                onSubmit={handleContactSubmit}
                data-aos="fade-left"
              >
                <input type="text" name="name" placeholder="Your Name" required />
                <input type="email" name="email" placeholder="Your Email" required />
                <textarea name="Message" placeholder="Your Message" required></textarea>
                <button type="submit" className="primary-btn">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>FOSS Club</h3>
            <p>Building the future with open source</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#events">Events</a></li>
              <li><a href="#projects">Projects</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Newsletter</h3>
            <form 
              className="newsletter-form" 
              action="https://formspree.io/f/mbllgedv"
              onSubmit={handleNewsletterSubmit}
            >
              <input type="email" placeholder="Your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FOSS Club. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default FossApp;