// MDCAT Expert - Animation & Interaction Enhancements

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations
    initScrollAnimations();
    initCounterAnimations();
    initSmoothScroll();
    initNavbarScroll();
    initTooltips();
});

/* -------------------------------------------------------------------------- */
/*                          Scroll Animations                                 */
/* -------------------------------------------------------------------------- */

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll(
        '.fade-in-up, .fade-in-down, .scale-in, .slide-in-left, .slide-in-right'
    );
    
    animatedElements.forEach(el => observer.observe(el));
}

/* -------------------------------------------------------------------------- */
/*                          Counter Animations                                */
/* -------------------------------------------------------------------------- */

function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number, .counter');
    
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target') || counter.textContent.replace(/[^0-9]/g, ''));
                
                if (target && !counter.classList.contains('counted')) {
                    animateCounter(counter, target);
                    counter.classList.add('counted');
                    observer.unobserve(counter);
                }
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        // Store original value as data attribute
        const value = counter.textContent.replace(/[^0-9]/g, '');
        if (value) {
            counter.setAttribute('data-target', value);
            counter.textContent = '0';
        }
        observer.observe(counter);
    });
}

function animateCounter(element, target) {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const suffix = element.textContent.replace(/[0-9]/g, '');

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, duration / steps);
}

/* -------------------------------------------------------------------------- */
/*                            Smooth Scroll                                   */
/* -------------------------------------------------------------------------- */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#main-content') {
                e.preventDefault();
                const target = document.querySelector(href === '#' ? 'body' : href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                          Navbar Scroll Effect                              */
/* -------------------------------------------------------------------------- */

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/* -------------------------------------------------------------------------- */
/*                              Tooltips                                      */
/* -------------------------------------------------------------------------- */

function initTooltips() {
    // Initialize Bootstrap tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

/* -------------------------------------------------------------------------- */
/*                          Toast Notifications                               */
/* -------------------------------------------------------------------------- */

function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

/* -------------------------------------------------------------------------- */
/*                          Quiz Timer Warning                                */
/* -------------------------------------------------------------------------- */

function initQuizTimer() {
    const timerDisplay = document.querySelector('.timer-display');
    if (!timerDisplay) return;

    // Add warning class when time is low (example: less than 5 minutes)
    const checkTimer = () => {
        const timeText = timerDisplay.textContent;
        const minutes = parseInt(timeText.split(':')[0]);
        
        if (minutes < 5) {
            timerDisplay.classList.add('warning');
        }
    };

    setInterval(checkTimer, 1000);
}

/* -------------------------------------------------------------------------- */
/*                          Form Validation Enhancement                       */
/* -------------------------------------------------------------------------- */

function enhanceFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });

        // Real-time validation feedback
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value) {
                    this.classList.add('was-validated');
                }
            });
        });
    });
}

/* -------------------------------------------------------------------------- */
/*                          Loading States                                    */
/* -------------------------------------------------------------------------- */

function showLoading(element) {
    const originalContent = element.innerHTML;
    element.setAttribute('data-original-content', originalContent);
    element.disabled = true;
    element.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Loading...
    `;
}

function hideLoading(element) {
    const originalContent = element.getAttribute('data-original-content');
    if (originalContent) {
        element.innerHTML = originalContent;
        element.disabled = false;
        element.removeAttribute('data-original-content');
    }
}

/* -------------------------------------------------------------------------- */
/*                          Export Functions                                  */
/* -------------------------------------------------------------------------- */

// Make functions available globally
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
