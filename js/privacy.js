// Set current date in the privacy policy
document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Create table of contents
const sections = document.querySelectorAll('.policy-section');
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

// Save privacy preferences
document.getElementById('save-preferences').addEventListener('click', function() {
    const analyticsConsent = document.getElementById('analytics-consent').checked;
    const marketingConsent = document.getElementById('marketing-consent').checked;
    
    // Save to localStorage
    localStorage.setItem('eco-analytics-consent', analyticsConsent);
    localStorage.setItem('eco-marketing-consent', marketingConsent);
    
    // Show confirmation message
    showMessage('Your preferences have been saved successfully!', 'success');
});

// Load saved preferences
function loadSavedPreferences() {
    const analyticsConsent = localStorage.getItem('eco-analytics-consent');
    const marketingConsent = localStorage.getItem('eco-marketing-consent');
    
    if (analyticsConsent !== null) {
        document.getElementById('analytics-consent').checked = analyticsConsent === 'true';
    }
    
    if (marketingConsent !== null) {
        document.getElementById('marketing-consent').checked = marketingConsent === 'true';
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

// Load saved preferences when page loads
document.addEventListener('DOMContentLoaded', loadSavedPreferences);