// Initialize AOS (Animate on Scroll)
AOS.init({
    duration: 800,
    offset: 100,
    once: true
});

// Navbar functionality
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(26, 26, 46, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(26, 26, 46, 0.7)';
        navbar.style.boxShadow = 'none';
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
const newsletterForm = document.querySelector('.newsletter-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Add your form submission logic here
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
});

newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Add your newsletter subscription logic here
    alert('Thank you for subscribing to our newsletter!');
    newsletterForm.reset();
});

// Countdown timer for events
function updateCountdown() {
    // Define dates for each event
    const eventDates = [
        { id: "countdown-1", date: new Date("2024-12-15T00:00:00").getTime() },
        { id: "countdown-2", date: new Date("2024-12-25T00:00:00").getTime() }
    ];

    // Current time
    const now = new Date().getTime();

    eventDates.forEach(event => {
        const distance = event.date - now;

        // Calculate remaining time
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update the respective countdown element
        const countdownElement = document.getElementById(event.id);
        if (countdownElement) {
            countdownElement.innerHTML = distance > 0
                ? `${days}d ${hours}h ${minutes}m ${seconds}s`
                : "Event Ended"; // Show "Event Ended" if the time has passed
        }
    });
}

// Call the function every second
setInterval(updateCountdown, 1000);


// Particle.js configuration for hero section
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle", stroke: { width: 0, color: "#000000" }, polygon: { nb_sides: 5 }, },
        opacity: { value: 0.5, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
        size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
        line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
        move: { enable: true, speed: 6, direction: "none", random: false, straight: false, out_mode: "out", bounce: false, attract: { enable: false, rotateX: 600, rotateY: 1200 } }
    },
    interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
        modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
    },
    retina_detect: true
});

// Typing effect for hero subtitle
const heroSubtitle = document.querySelector('.hero h2');
const text = heroSubtitle.textContent;
heroSubtitle.textContent = '';

function typeWriter(element, text, speed = 50) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Call the typewriter function when the page loads
window.addEventListener('load', () => {
    const subtitle = document.querySelector('.hero h2');
    const text = subtitle.textContent;
    subtitle.textContent = '';
    typeWriter(subtitle, text);
});

// Project cards hover effect with tilt
VanillaTilt.init(document.querySelectorAll(".project-card"), {
    max: 25,
    speed: 400,
    glare: true,   
    "max-glare": 0.5,
});

// Smooth reveal for project cards
const revealProjects = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            observer.unobserve(entry.target);
        }
    });
};

const projectObserver = new IntersectionObserver(revealProjects, {
    root: null,
    threshold: 0.15,
});

document.querySelectorAll('.project-card').forEach(card => {
    projectObserver.observe(card);
});

// Lazy loading for images
document.addEventListener("DOMContentLoaded", function() {
    var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove("lazy");
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        let active = false;

        const lazyLoad = function() {
            if (active === false) {
                active = true;

                setTimeout(function() {
                    lazyImages.forEach(function(lazyImage) {
                        if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
                            lazyImage.src = lazyImage.dataset.src;
                            lazyImage.classList.remove("lazy");

                            lazyImages = lazyImages.filter(function(image) {
                                return image !== lazyImage;
                            });

                            if (lazyImages.length === 0) {
                                document.removeEventListener("scroll", lazyLoad);
                                window.removeEventListener("resize", lazyLoad);
                                window.removeEventListener("orientationchange", lazyLoad);
                            }
                        }
                    });

                    active = false;
                }, 200);
            }
        };

        document.addEventListener("scroll", lazyLoad);
        window.addEventListener("resize", lazyLoad);
        window.addEventListener("orientationchange", lazyLoad);
    }
});

// Animated counter for statistics
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate statistics when they come into view
const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const endValue = parseInt(target.getAttribute('data-target'));
            animateValue(target, 0, endValue, 2000);
            observer.unobserve(target);
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-value').forEach(stat => {
    observer.observe(stat);
});

// Dynamic year for copyright in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Smooth reveal animation for sections
const revealSection = (entries, observer) => {
    const [entry] = entries;
    if (!entry.isIntersecting) return;
    entry.target.classList.remove('section-hidden');
    observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.15,
});

document.querySelectorAll('.section').forEach(section => {
    sectionObserver.observe(section);
    section.classList.add('section-hidden');
});

// Testimonial slider
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial');
const totalTestimonials = testimonials.length;

function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
        testimonial.style.transform = `translateX(${100 * (i - index)}%)`;
    });
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
    showTestimonial(currentTestimonial);
}

function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
    showTestimonial(currentTestimonial);
}

document.querySelector('.testimonial-next').addEventListener('click', nextTestimonial);
document.querySelector('.testimonial-prev').addEventListener('click', prevTestimonial);

// Initialize testimonial slider
showTestimonial(currentTestimonial);

// Auto-switch testimonials every 5 seconds
setInterval(nextTestimonial, 5000);

//carousel
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.team-carousel');
    const members = carousel.querySelectorAll('.team-member');
    const dotsContainer = document.querySelector('.carousel-nav-dots');
    let currentIndex = 0;
  
    // Create navigation dots
    members.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.classList.add('nav-dot');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  
    const dots = dotsContainer.querySelectorAll('.nav-dot');
  
    function goToSlide(index) {
      members[currentIndex].classList.remove('active');
      dots[currentIndex].classList.remove('active');
      currentIndex = index;
      members[currentIndex].classList.add('active');
      dots[currentIndex].classList.add('active');
    }
  
    function nextSlide() {
      goToSlide((currentIndex + 1) % members.length);
    }
  
    // Initialize
    goToSlide(0);
  
    // Auto-advance every 5 seconds
    setInterval(nextSlide, 5000);
  });

  