// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD6O3gAyio0njhmr7Qz4aDf8Hz0qY2AC3U",
    authDomain: "ecolearn-4a23f.firebaseapp.com",
    projectId: "ecolearn-4a23f",
    storageBucket: "ecolearn-4a23f.firebasestorage.app",
    messagingSenderId: "626294301194",
    appId: "1:626294301194:web:dd8882b2e4e7c3da44f5f3",
    measurementId: "G-S3TNCFCN60"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Check authentication state
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // User is not logged in, redirect to login page
        window.location.href = "login.html";
        return;
    }
    
    // User is logged in, load their data
    try {
        // Get user data from server
        const response = await fetch(`/api/user/data?uid=${user.uid}`);
        const userData = await response.json();
        
        if (response.ok) {
            // Set user points
            document.getElementById('nav-points').textContent = userData.points;
            
            // Load user achievements
            loadUserAchievements(user.uid, userData.achievements || []);
        } else {
            console.error("Failed to fetch user data:", userData.error);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
    
    // Initialize achievements functionality
    initializeAchievementsFunctionality(user.uid);
});

// Load user achievements
function loadUserAchievements(userId, achievements) {
    // This would be populated from the server data
    // For demo purposes, we'll use static data
    
    // Update achievement stats
    const totalAchievements = 12;
    const completedAchievements = achievements.filter(a => a.status === 'completed').length;
    const inProgressAchievements = achievements.filter(a => a.status === 'in-progress').length;
    const lockedAchievements = totalAchievements - completedAchievements - inProgressAchievements;
    
    document.getElementById('total-achievements').textContent = totalAchievements;
    document.getElementById('completed-achievements').textContent = completedAchievements;
    document.getElementById('inprogress-achievements').textContent = inProgressAchievements;
    document.getElementById('locked-achievements').textContent = lockedAchievements;
}

// Initialize achievements functionality
function initializeAchievementsFunctionality(userId) {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter achievements by category
            const category = this.getAttribute('data-category');
            filterAchievements(category);
        });
    });
    
    // Achievement detail modal
    const achievementModal = document.getElementById('achievementDetailModal');
    const achievementModalTitle = document.getElementById('achievementModalTitle');
    const achievementModalDescription = document.getElementById('achievementModalDescription');
    const modalIcon = document.getElementById('modalIcon');
    const progressCurrent = document.getElementById('progressCurrent');
    const progressTotal = document.getElementById('progressTotal');
    const modalProgressFill = document.getElementById('modalProgressFill');
    const achievementTipsList = document.getElementById('achievementTipsList');
    const trackAchievementBtn = document.getElementById('trackAchievementBtn');
    const closeAchievementModal = document.getElementById('closeAchievementModal');
    
    let selectedAchievement = null;
    
    // Achievement cards
    const achievementCards = document.querySelectorAll('.achievement-card');
    achievementCards.forEach(card => {
        card.addEventListener('click', function() {
            const achievementTitle = this.querySelector('h3').textContent;
            const achievementDesc = this.querySelector('p').textContent;
            const achievementStatus = this.classList.contains('completed') ? 'completed' : 
                                    this.classList.contains('in-progress') ? 'in-progress' : 'locked';
            
            // Set achievement details
            selectedAchievement = {
                title: achievementTitle,
                description: achievementDesc,
                status: achievementStatus,
                progress: this.querySelector('.achievement-progress span').textContent,
                points: this.querySelector('.reward-points') ? 
                    this.querySelector('.reward-points').textContent : '+0',
                icon: this.querySelector('.achievement-icon i').className
            };
            
            // Populate modal
            achievementModalTitle.textContent = selectedAchievement.title;
            achievementModalDescription.textContent = selectedAchievement.description;
            modalIcon.innerHTML = `<i class="${selectedAchievement.icon}"></i>`;
            
            // Set progress
            const progressMatch = selectedAchievement.progress.match(/(\d+)\/(\d+)/);
            if (progressMatch) {
                const current = parseInt(progressMatch[1]);
                const total = parseInt(progressMatch[2]);
                const percentage = (current / total) * 100;
                
                progressCurrent.textContent = current;
                progressTotal.textContent = `/ ${total}`;
                modalProgressFill.style.width = `${percentage}%`;
            }
            
            // Set tips based on achievement
            achievementTipsList.innerHTML = '';
            const tips = getAchievementTips(selectedAchievement.title);
            tips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                achievementTipsList.appendChild(li);
            });
            
            // Set button text based on status
            if (selectedAchievement.status === 'completed') {
                trackAchievementBtn.textContent = 'View Details';
                trackAchievementBtn.disabled = true;
            } else if (selectedAchievement.status === 'locked') {
                trackAchievementBtn.textContent = 'Locked';
                trackAchievementBtn.disabled = true;
            } else {
                trackAchievementBtn.textContent = 'Track Achievement';
                trackAchievementBtn.disabled = false;
            }
            
            // Show modal
            achievementModal.style.display = 'flex';
        });
    });
    
    // Track achievement button
    trackAchievementBtn.addEventListener('click', function() {
        if (selectedAchievement && selectedAchievement.status === 'in-progress') {
            // Navigate to relevant page to track progress
            if (selectedAchievement.title.includes('Commuter')) {
                window.location.href = 'challenges.html';
            } else if (selectedAchievement.title.includes('Water')) {
                window.location.href = 'challenges.html';
            } else if (selectedAchievement.title.includes('Energy')) {
                window.location.href = 'challenges.html';
            }
        }
    });
    
    // Close modal button
    closeAchievementModal.addEventListener('click', function() {
        achievementModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === achievementModal) {
            achievementModal.style.display = 'none';
        }
    });
    
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        
        auth.signOut().then(() => {
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Logout error:", error);
        });
    });
}

// Filter achievements by category
function filterAchievements(category) {
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    achievementCards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'flex';
        } else {
            // This would filter based on achievement category
            // For demo, we'll just show a random selection
            const shouldShow = Math.random() > 0.3;
            card.style.display = shouldShow ? 'flex' : 'none';
        }
    });
}

// Get achievement tips
function getAchievementTips(achievementTitle) {
    const tips = {
        'Eco Commuter': [
            'Plan your routes in advance to use public transportation',
            'Consider biking or walking for short distances',
            'Carpool with colleagues or friends when possible'
        ],
        'Water Guardian': [
            'Take shorter showers to reduce water usage',
            'Fix any leaking taps or toilets promptly',
            'Collect rainwater for watering plants'
        ],
        'Energy Saver': [
            'Turn off lights when leaving a room',
            'Unplug electronics when not in use',
            'Use energy-efficient LED bulbs'
        ],
        'Recycling Expert': [
            'Learn what materials are accepted in your local recycling program',
            'Rinse containers before recycling them',
            'Break down cardboard boxes to save space'
        ],
        'default': [
            'Check back daily for new activities',
            'Complete related challenges to progress faster',
            'Share your progress with friends for accountability'
        ]
    };
    
    for (const [key, value] of Object.entries(tips)) {
        if (achievementTitle.includes(key)) {
            return value;
        }
    }
    
    return tips.default;
}