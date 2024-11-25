document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const learnMoreBtn = document.querySelector('.learn-more-btn');
    const inputs = document.querySelectorAll('.form-input');
    
    // Toggle menu function
    const toggleMenu = () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    };
    
    // Close menu function
    const closeMenu = () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    };
    
    // Menu toggle click handler
    menuToggle.addEventListener('click', toggleMenu);
    
    // Add click handlers to all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) { // Only on mobile
                closeMenu();
            }
            
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const aboutSection = document.querySelector('#about');
            
            if (aboutSection) {
                aboutSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    inputs.forEach(input => {
        // Handle input focus
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        // Handle input blur
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Handle input validation
        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });
});

// Form submission handler
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            
            try {
                const formData = {
                    name: contactForm.querySelector('[name="name"]').value.trim(),
                    email: contactForm.querySelector('[name="email"]').value.trim(),
                    message: contactForm.querySelector('[name="message"]').value.trim()
                };

                const response = await fetch('http://localhost:3000/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    contactForm.reset();
                } else {
                    throw new Error(result.message);
                }

            } catch (error) {
                console.error('Error:', error);
                alert('Error sending message: ' + error.message);
            } finally {
                submitButton.disabled = false;
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeContactForm);