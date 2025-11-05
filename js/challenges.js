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

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const challengeCards = document.querySelectorAll('.challenge-card');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filter = button.getAttribute('data-tab');
            
            // Filter challenge cards
            challengeCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else if (filter === 'completed') {
                    if (card.classList.contains('completed')) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                } else {
                    if (card.getAttribute('data-type') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });

    // Challenge modal functionality
    const challengeButtons = document.querySelectorAll('.start-challenge, .continue-challenge');
    const modal = document.getElementById('challengeModal');
    const closeModal = document.querySelector('.close-modal');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');

    challengeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.challenge-card');
            const title = card.querySelector('h3').textContent;
            const description = card.querySelector('p').textContent;
            const badge = card.querySelector('.challenge-badge').cloneNode(true);
            
            // Update modal content
            const modalHeader = modal.querySelector('.modal-header');
            modalHeader.innerHTML = '';
            modalHeader.appendChild(badge);
            modalHeader.innerHTML += `<h2>${title}</h2><p>${description}</p>`;
            
            // Show modal
            modal.style.display = 'flex';
        });
    });

    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            // Get challenge title from modal
            const challengeTitle = modal.querySelector('h2').textContent;
            
            // Mark challenge as completed (in a real app, this would update the backend)
            challengeCards.forEach(card => {
                if (card.querySelector('h3').textContent === challengeTitle) {
                    card.classList.add('completed');
                    card.querySelector('.progress').style.width = '100%';
                    card.querySelector('.progress-text').textContent = 'Completed!';
                    
                    const button = card.querySelector('button');
                    button.className = 'btn btn-success';
                    button.innerHTML = '<i class="fas fa-check"></i> Completed';
                    button.disabled = true;
                    
                    // Update user points
                    const pointsElem = document.querySelector('.points-badge');
                    const currentPoints = parseInt(pointsElem.textContent);
                    const pointsToAdd = parseInt(card.querySelector('.challenge-points').textContent.match(/\d+/)[0]);
                    pointsElem.textContent = currentPoints + pointsToAdd;
                    
                    // Update completed challenges count
                    const completedCountElem = document.querySelector('.user-stats .stat-card:nth-child(2) .stat-value');
                    completedCountElem.textContent = parseInt(completedCountElem.textContent) + 1;
                }
            });
            
            // Show success notification
            showNotification(`Congratulations! You completed the "${challengeTitle}" challenge and earned points!`, 'success');
            
            // Close modal
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Category card click functionality
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            
            // Filter challenges by category (in a real app, this would filter from backend)
            challengeCards.forEach(challenge => {
                // This is a simplified example - real implementation would need proper category data
                if (challenge.querySelector('.challenge-icon i').classList.contains(`fa-${category}`)) {
                    challenge.style.display = 'block';
                } else {
                    challenge.style.display = 'none';
                }
            });
            
            // Update active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector('.tab-btn[data-tab="all"]').classList.add('active');
            
            // Scroll to challenges section
            document.querySelector('.challenges-content').scrollIntoView({ behavior: 'smooth' });
        });
    });

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
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100px); opacity: 0; }
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

    // Simulate progress updates for demo purposes
    setInterval(() => {
        const inProgressChallenges = document.querySelectorAll('.challenge-card:not(.completed)');
        
        inProgressChallenges.forEach(challenge => {
            // Only update some challenges randomly
            if (Math.random() > 0.7) {
                const progressBar = challenge.querySelector('.progress');
                const progressText = challenge.querySelector('.progress-text');
                
                if (progressBar && progressText) {
                    const currentWidth = parseInt(progressBar.style.width);
                    if (currentWidth < 100) {
                        const newWidth = Math.min(currentWidth + Math.floor(Math.random() * 15), 100);
                        progressBar.style.width = `${newWidth}%`;
                        
                        // Update progress text based on challenge type
                        const challengeType = challenge.getAttribute('data-type');
                        if (challengeType === 'daily') {
                            progressText.textContent = `${newWidth}% complete`;
                        } else if (challengeType === 'weekly') {
                            const days = Math.floor(newWidth / 100 * 7);
                            progressText.textContent = `${days}/7 days`;
                        } else {
                            progressText.textContent = `${newWidth}% complete`;
                        }
                    }
                }
            }
        });
    }, 5000);
});