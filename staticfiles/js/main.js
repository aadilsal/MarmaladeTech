// Main JavaScript for MDCAT Expert

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navbar scroll effect
    initializeNavbarScroll();

    // Initialize animations
    initializeScrollAnimations();

    // Initialize newsletter forms
    initializeNewsletterForms();

    // Add loading animation
    addLoadingAnimation();
});

// Navbar Scroll Effect
function initializeNavbarScroll() {
    const navbar = document.getElementById('mainNavbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe all elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Newsletter Form Handling
function initializeNewsletterForms() {
    const forms = document.querySelectorAll('.newsletter-form, .newsletter-form-footer');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            const feedback = form.querySelector('#newsletterFeedback') || form.querySelector('.form-text');

            if (validateEmail(emailInput.value)) {
                // Simulate API call
                emailInput.disabled = true;
                form.querySelector('button').disabled = true;
                form.querySelector('button').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subscribing...';

                setTimeout(() => {
                    if (feedback) {
                        feedback.textContent = 'Thank you for subscribing!';
                        feedback.className = 'form-text text-success';
                    }
                    emailInput.disabled = false;
                    form.querySelector('button').disabled = false;
                    form.querySelector('button').innerHTML = 'Subscribe';
                    emailInput.value = '';
                }, 2000);
            } else {
                if (feedback) {
                    feedback.textContent = 'Please enter a valid email address.';
                    feedback.className = 'form-text text-danger';
                }
            }
        });
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Loading Animation
function addLoadingAnimation() {
    const elements = document.querySelectorAll('.hero-section, .features-section, .cta-section, .newsletter-section');

    elements.forEach((el, index) => {
        el.classList.add('loading');
        el.style.animationDelay = `${index * 0.1}s`;
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Performance optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// Error handling for missing elements
function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (e) {
        console.warn(`Element not found: ${selector}`);
        return null;
    }
}