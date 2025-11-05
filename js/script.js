// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Quiz Modal Functionality
const quizModal = document.getElementById('quiz-modal');
const closeModal = document.querySelector('.close-modal');
const quizCards = document.querySelectorAll('.quiz-card');

// Open modal when clicking on a quiz card
quizCards.forEach(card => {
    card.addEventListener('click', () => {
        quizModal.style.display = 'flex';
    });
});

// Close modal when clicking on X
closeModal.addEventListener('click', () => {
    quizModal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === quizModal) {
        quizModal.style.display = 'none';
    }
});

// Simple quiz functionality
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const currentQuestion = document.getElementById('current-question');
const progress = document.querySelector('.progress');
let questionIndex = 1;

nextBtn.addEventListener('click', () => {
    if (questionIndex < 5) {
        questionIndex++;
        currentQuestion.textContent = questionIndex;
        progress.style.width = `${questionIndex * 20}%`;
    } else {
        // Quiz completed
        alert('Quiz completed! Thanks for participating.');
        quizModal.style.display = 'none';
    }
});

prevBtn.addEventListener('click', () => {
    if (questionIndex > 1) {
        questionIndex--;
        currentQuestion.textContent = questionIndex;
        progress.style.width = `${questionIndex * 20}%`;
    }
});

// Animate stats on scroll
const animateStats = () => {
    const stats = document.querySelectorAll('[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const target = parseInt(stat.getAttribute('data-count'));
                let current = 0;
                
                const increment = target / 100;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        clearInterval(timer);
                        current = target;
                    }
                    stat.textContent = Math.floor(current).toLocaleString();
                }, 20);
                
                observer.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => {
        observer.observe(stat);
    });
};

// Smooth scrolling for navigation links
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    animateStats();
    
    // Add click handlers for quiz options
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('active');
            });
            // Add active class to clicked option
            this.classList.add('active');
        });
    });
    
    // Add click handler for CTA button
    document.querySelector('.cta .btn-primary').addEventListener('click', () => {
        window.location.href = 'login.html';
    });
});