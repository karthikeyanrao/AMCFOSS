import React, { useEffect, useState } from "react";
import "./Foss2.css";
import "aos/dist/aos.css";
import AOS from "aos";
import "font-awesome/css/font-awesome.min.css";
import "vanilla-tilt";
import Navbar from "./navbar";

const TypingEffect = () => {
  const [typedText, setTypedText] = useState(""); // State for current typed text
  const [restart, setRestart] = useState(false); // State to trigger restart
useEffect(() => {
  const text = "Where Innovation Meets Open Source";
  let index = 0;

  const typeWriter = () => {
    if (index < text.length) {
      setTypedText((prev) => prev + text.charAt(index));
      index++;
      setTimeout(typeWriter, 50); // Typing speed
    } else {
      setTimeout(() => {
        setTypedText(""); // Clear text after 5 seconds
        setRestart((prev) => !prev); // Trigger restart
      }, 5000); // 5-second gap
    }
  };

  typeWriter(); // Start typing effect
}, [restart]); // Re-run effect when `restart` changes

return <h2 className="typewriter">{typedText}</h2>;
};

// Main FossApp Component
const FossApp = () => {
  const [countdown1, setCountdown1] = useState("");
  const [countdown2, setCountdown2] = useState("");

  // Initialize AOS on mount
  useEffect(() => {
    AOS.init({ duration: 800, offset: 100, once: true });
  }, []);

  // Countdown timer for events
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const events = [
        { id: "countdown1", date: new Date("2024-12-15T00:00:00").getTime() },
        { id: "countdown2", date: new Date("2024-12-25T00:00:00").getTime() },
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

  return (
    <div>
      <Navbar />
      <section id="home" className="section hero">
        <div className="hero-content" data-aos="fade-up">
          <h1 className="glitch" data-text="#BuildWithFOSS">#BuildWithFOSS</h1>
          <h2 className="typewriter">Where Innovation Meets Open Source</h2>
          <p className="hero-description">Join us in building the future of technology through collaboration and open-source development</p>
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
                <span className="day">15</span>
                <span className="month">DEC</span>
              </div>
              <div className="event-details">
                <h3>FOSS Hackathon 2024</h3>
                <p>48-hour coding challenge</p>
                <div id="countdown-1" className="countdown"></div>
                <button className="primary-btn">Register Now</button>
              </div>
            </div>
            <div className="event-card" data-aos="fade-up">
              <div className="event-date">
                <span className="day">25</span>
                <span className="month">DEC</span>
              </div>
              <div className="event-details">
                <h3>Open Source Fiesta</h3>
                <p>A celebration of open-source technologies and communities</p>
                <div id="countdown-2" className="countdown"></div>
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
                <p>A cutting-edge platform designed to streamline open source contributions and foster community collaboration.</p>
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
            {/* More project cards can go here */}
          </div>
        </div>
      </section>

      <section id="team" className="section team">
        <div className="section-content">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-carousel">
            <div className="team-member active">
              <img src="/api/placeholder/150/150" alt="Shashanky" className="member-photo" />
              <h3>Shashanky</h3>
              <p>President</p>
              <a href="https://instagram.com/Shashank_y_4.5" className="instagram-link" target="_blank">@Shashank_y_4.5</a>
            </div>
            <div className="team-member">
              <img src="/api/placeholder/150/150" alt="Jane Smith" className="member-photo" />
              <h3>Jane Smith</h3>
              <p>Vice President</p>
              <a href="https://instagram.com/janesmith" className="instagram-link" target="_blank">@janesmith</a>
            </div>
            <div className="team-member">
              <img src="/api/placeholder/150/150" alt="Pravin Dharsaun" className="member-photo" />
              <h3>Pravin Dharsaun</h3>
              <p>Coordinator</p>
              <a href="https://instagram.com/boii__loather" className="instagram-link" target="_blank">@boii__loather</a>
            </div>
          </div>
          <div className="carousel-nav-dots"></div>
        </div>
      </section>

      <section id="contact" className="section contact">
        <div className="section-content">
          <h2 className="section-title" data-aos="fade-up">Get In Touch</h2>
          <div className="contact-container">
            <div className="contact-info" data-aos="fade-right">
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
            <form className="contact-form" data-aos="fade-left">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <textarea placeholder="Your Message" required></textarea>
              <button type="submit" className="primary-btn">Send Message</button>
            </form>
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
            <form className="newsletter-form">
              <input type="email" placeholder="Your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 FOSS Club. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FossApp;