// Inline scripts extracted from index.html for better performance

// Newsletter subscription function
function subscribeNewsletter(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    // Simple validation
    if (email && email.includes('@')) {
        alert('Thank you for subscribing to our newsletter!');
        event.target.reset();
    } else {
        alert('Please enter a valid email address.');
    }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animate stats on scroll with performance optimization
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-item h3');
                statNumbers.forEach(stat => {
                    const finalNumber = stat.textContent;
                    const numericValue = parseInt(finalNumber.replace(/[^\d]/g, ''));
                    if (numericValue) {
                        animateNumber(stat, 0, numericValue, finalNumber);
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        observer.observe(statsSection);
    }

    function animateNumber(element, start, end, suffix) {
        const duration = 2000;
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            
            element.textContent = Math.floor(current) + suffix.replace(/[\d]/g, '');
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        requestAnimationFrame(updateNumber);
    }

    // Touch gesture support for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            // Swipe gesture handling can be added here if needed
        }
    }

    // Prevent zoom on double tap for buttons
    document.querySelectorAll('button, .btn-primary, .btn-secondary, .cta-button').forEach(element => {
        element.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.click();
        });
    });

    // Optimize for mobile performance
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            // Service worker registration would go here for PWA functionality
        });
    }

    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            // Recalculate layout after orientation change
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });
});
