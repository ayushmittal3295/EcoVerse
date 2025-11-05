// Mobile Navigation Toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }));
}

// Form Validation and Submission
const forgotPasswordForm = document.getElementById('forgot-password-form');

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('email').value;
        
        // Simple validation
        if (!email) {
            showMessage('Please enter your email address', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // In a real application, you would send this data to your server
        simulatePasswordReset(email);
    });
}

// Email validation function
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Simulate password reset (to be replaced with actual API call)
function simulatePasswordReset(email) {
    // Show loading state
    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // For demo purposes, assume email was sent successfully
        showMessage('Password reset instructions have been sent to your email', 'success');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Clear form
        document.getElementById('email').value = '';
    }, 2000);
}

// Show message function
function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.forgot-password-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `forgot-password-message ${type}`;
    messageEl.textContent = message;
    
    // Style based on type
    if (type === 'error') {
        messageEl.style.backgroundColor = '#ffebee';
        messageEl.style.color = '#c62828';
        messageEl.style.border = '1px solid #ef9a9a';
    } else {
        messageEl.style.backgroundColor = '#e8f5e9';
        messageEl.style.color = '#2e7d32';
        messageEl.style.border = '1px solid #a5d6a7';
    }
    
    // Apply common styles
    messageEl.style.padding = '12px 16px';
    messageEl.style.borderRadius = '8px';
    messageEl.style.marginBottom = '1.5rem';
    messageEl.style.fontSize = '0.9rem';
    
    // Insert after forgot password header
    const forgotPasswordHeader = document.querySelector('.forgot-password-header');
    forgotPasswordHeader.parentNode.insertBefore(messageEl, forgotPasswordHeader.nextSibling);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 500);
        }
    }, 5000);
}