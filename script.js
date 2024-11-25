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
    
    // Function to fetch and display form submissions
    async function loadFormSubmissions() {
        try {
            const response = await fetch('get_messages.php');
            const data = await response.json();
            
            const formaContainer = document.querySelector('.FORMA');
            if (!formaContainer) return;
            
            // Clear existing content
            formaContainer.innerHTML = '';
            
            // Create table
            const table = document.createElement('table');
            table.className = 'submissions-table';
            
            // Add table header
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            
            // Add submissions to table
            const tbody = table.querySelector('tbody');
            data.forEach(submission => {
                const date = new Date(submission.timestamp.$date);
                const formattedDate = date.toLocaleDateString('hr-HR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${submission.name}</td>
                    <td>${submission.email}</td>
                    <td>${submission.message}</td>
                `;
                tbody.appendChild(row);
            });
            
            formaContainer.appendChild(table);
            
        } catch (error) {
            console.error('Error loading submissions:', error);
        }
    }
    
    // Call the function when page loads
    document.addEventListener('DOMContentLoaded', loadFormSubmissions);
});}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeContactForm);