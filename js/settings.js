// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    // Close mobile menu when clicking on a nav link
    document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }));

    // Avatar selection
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            avatarOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            this.classList.add('active');
        });
    });

    // Daily limit slider
    const dailyLimit = document.getElementById('dailyLimit');
    const limitValue = document.getElementById('limitValue');
    
    if (dailyLimit && limitValue) {
        dailyLimit.addEventListener('input', function() {
            limitValue.textContent = `${this.value} minutes`;
        });
    }

    // Save buttons
    const saveButtons = document.querySelectorAll('.btn-primary');
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.settings-card');
            const cardHeader = card.querySelector('.settings-card-header h2');
            showNotification(`Settings for "${cardHeader.textContent}" have been saved!`);
        });
    });

    // Delete account button
    const deleteAccountBtn = document.getElementById('deleteAccount');
    const modal = document.getElementById('confirmationModal');
    const closeModal = document.querySelector('.close-modal');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');
    const modalMessage = document.getElementById('modalMessage');

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            modalMessage.textContent = "Are you sure you want to delete your account? This action cannot be undone.";
            modal.style.display = 'flex';
        });
    }

    // Modal functionality
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener('click', function() {
            modal.style.display = 'none';
            showNotification('Your account has been scheduled for deletion.', 'error');
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Theme selector
    const themeSelector = document.getElementById('theme');
    if (themeSelector) {
        themeSelector.addEventListener('change', function() {
            // In a real app, this would change the CSS variables
            showNotification(`Theme changed to ${this.options[this.selectedIndex].text}`);
        });
    }

    // Font size selector
    const fontSizeSelector = document.getElementById('fontSize');
    if (fontSizeSelector) {
        fontSizeSelector.addEventListener('change', function() {
            // In a real app, this would change the base font size
            showNotification(`Font size changed to ${this.options[this.selectedIndex].text}`);
        });
    }

    // Notification function
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            background: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1000;
            max-width: 350px;
            animation: slideIn 0.3s ease;
        `;
        
        // Add close button style
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: 15px;
        `;
        
        // Add keyframes for animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Add to body
        document.body.appendChild(notification);
        
        // Close button functionality
        closeBtn.addEventListener('click', function() {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Load saved settings (simulated)
    function loadSavedSettings() {
        // In a real app, this would load from local storage or a server
        console.log('Loading saved settings...');
        
        // Simulate loading with a slight delay
        setTimeout(() => {
            showNotification('Your settings have been loaded successfully.');
        }, 1000);
    }

    // Initialize the page
    loadSavedSettings();
});