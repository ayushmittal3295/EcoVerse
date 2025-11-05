// Set current date in the terms and conditions
document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Create table of contents
const sections = document.querySelectorAll('.terms-section');
const tocList = document.getElementById('table-of-contents');

sections.forEach(section => {
    const id = section.id;
    const title = section.querySelector('h2').textContent;
    
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = title;
    
    listItem.appendChild(link);
    tocList.appendChild(listItem);
});

// Highlight active section in TOC
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const tocLink = document.querySelector(`#table-of-contents a[href="#${id}"]`);
        
        if (entry.isIntersecting) {
            tocLink.classList.add('active');
        } else {
            tocLink.classList.remove('active');
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Smooth scrolling for table of contents links
document.querySelectorAll('#table-of-contents a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetSection.offsetTop - 100,
            behavior: 'smooth'
        });
        
        // Update URL hash without jumping
        history.pushState(null, null, targetId);
    });
});

// Terms acceptance functionality
const acceptButton = document.getElementById('accept-terms');
const declineButton = document.getElementById('decline-terms');
const acceptanceStatus = document.getElementById('acceptance-status');
const agreeCheckbox = document.getElementById('agree-terms');
const ageCheckbox = document.getElementById('age-verification');
const submitButton = document.getElementById('submit-agreement');

acceptButton.addEventListener('click', () => {
    acceptanceStatus.textContent = 'You have accepted our Terms and Conditions.';
    acceptanceStatus.className = 'acceptance-status accepted';
    localStorage.setItem('eco-terms-accepted', 'true');
    localStorage.setItem('eco-terms-accepted-date', new Date().toISOString());
});

declineButton.addEventListener('click', () => {
    acceptanceStatus.textContent = 'You have declined our Terms and Conditions. You may not be able to use all features.';
    acceptanceStatus.className = 'acceptance-status declined';
    localStorage.setItem('eco-terms-accepted', 'false');
});

// Enable submit button when both checkboxes are checked
function checkAgreement() {
    if (agreeCheckbox.checked && ageCheckbox.checked) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

agreeCheckbox.addEventListener('change', checkAgreement);
ageCheckbox.addEventListener('change', checkAgreement);

// Submit agreement
submitButton.addEventListener('click', () => {
    localStorage.setItem('eco-terms-agreed', 'true');
    localStorage.setItem('eco-terms-agreed-date', new Date().toISOString());
    showMessage('Your agreement has been recorded. Thank you!', 'success');
    
    // Reset form
    agreeCheckbox.checked = false;
    ageCheckbox.checked = false;
    submitButton.disabled = true;
});

// Check if user has already accepted terms
function checkPreviousAcceptance() {
    const termsAccepted = localStorage.getItem('eco-terms-accepted');
    const termsAcceptedDate = localStorage.getItem('eco-terms-accepted-date');
    
    if (termsAccepted === 'true') {
        acceptanceStatus.textContent = `You accepted our Terms and Conditions on ${new Date(termsAcceptedDate).toLocaleDateString()}.`;
        acceptanceStatus.className = 'acceptance-status accepted';
    }
}

// Show message function
function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message element
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast message-${type}`;
    messageEl.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    messageEl.style.position = 'fixed';
    messageEl.style.bottom = '20px';
    messageEl.style.right = '20px';
    messageEl.style.padding = '12px 20px';
    messageEl.style.borderRadius = '8px';
    messageEl.style.color = 'white';
    messageEl.style.display = 'flex';
    messageEl.style.alignItems = 'center';
    messageEl.style.gap = '10px';
    messageEl.style.zIndex = '1000';
    messageEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    messageEl.style.animation = 'slideIn 0.3s ease-out';
    
    if (type === 'success') {
        messageEl.style.backgroundColor = 'var(--success)';
    } else {
        messageEl.style.backgroundColor = 'var(--error)';
    }
    
    document.body.appendChild(messageEl);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageEl.style.animation = 'fadeOut 0.5s ease-in';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 500);
    }, 3000);
}

// Add keyframe animations for message
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Check for previous acceptance when page loads
document.addEventListener('DOMContentLoaded', checkPreviousAcceptance);