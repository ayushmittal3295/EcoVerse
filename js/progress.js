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
const db = firebase.firestore();

// Chart instances
let activityChart;
let categoryChart;

// Check authentication state
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // User is not logged in, redirect to login page
        window.location.href = "login.html";
        return;
    }
    
    // User is logged in, load their data
    try {
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            populateUserData(user, userData);
            loadProgressData(user.uid);
        } else {
            console.error("No user data found");
            // Create a new user record if it doesn't exist
            await createUserRecord(user);
            // Load default data
            populateUserData(user, getDefaultUserData());
            loadProgressData(user.uid);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        // Load default data as fallback
        populateUserData(user, getDefaultUserData());
        loadProgressData(user.uid);
    }
});

// Function to create a new user record
async function createUserRecord(user) {
    try {
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null,
            points: 0,
            level: 1,
            streak: 0,
            completedChallenges: 0,
            badges: 0,
            treesPlanted: 0,
            learningTime: 0,
            joinDate: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error creating user record:", error);
    }
}

// Function to get default user data
function getDefaultUserData() {
    return {
        points: 0,
        level: 1,
        streak: 0,
        completedChallenges: 0,
        badges: 0,
        treesPlanted: 0,
        learningTime: 0,
        joinDate: new Date().toLocaleDateString()
    };
}

// Populate user data in the UI
function populateUserData(user, userData) {
    // Set user info
    document.getElementById('user-name').textContent = user.displayName || user.email;
    document.getElementById('user-avatar').innerHTML = user.photoURL ? 
        `<img src="${user.photoURL}" alt="User Avatar" style="width: 100%; height: 100%; border-radius: 50%;">` : 
        `<i class="fas fa-user"></i>`;
    
    // Set user points
    document.getElementById('user-points').textContent = userData.points;
    document.getElementById('nav-points').textContent = userData.points;
    
    // Set user level based on points
    const userLevel = calculateUserLevel(userData.points);
    document.getElementById('user-level').textContent = `Level ${userLevel} ${getLevelTitle(userLevel)}`;
}

// Calculate user level based on points
function calculateUserLevel(points) {
    if (points < 100) return 1;
    if (points < 250) return 2;
    if (points < 500) return 3;
    if (points < 1000) return 4;
    if (points < 2000) return 5;
    return 6;
}

// Get level title based on level
function getLevelTitle(level) {
    const titles = [
        'Eco Learner',
        'Eco Explorer',
        'Eco Enthusiast',
        'Eco Warrior',
        'Eco Champion',
        'Eco Master'
    ];
    return titles[level - 1] || 'Eco Legend';
}

// Load progress data
async function loadProgressData(userId) {
    try {
        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            updateProgressUI(userData);
        }
        
        // Load recent activities
        const activitiesSnapshot = await db.collection('userActivities')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        
        loadRecentActivities(activitiesSnapshot);
        
        // Load badges
        const badgesSnapshot = await db.collection('userBadges')
            .where('userId', '==', userId)
            .get();
        
        loadBadges(badgesSnapshot);
        
        // Initialize charts
        initializeCharts();
        
    } catch (error) {
        console.error("Error loading progress data:", error);
    }
}

// Update progress UI
function updateProgressUI(userData) {
    const points = userData.points || 0;
    const currentLevel = calculateUserLevel(points);
    const nextLevel = currentLevel + 1;
    
    // Level thresholds
    const levelThresholds = [0, 100, 250, 500, 1000, 2000];
    const currentThreshold = levelThresholds[currentLevel - 1] || 0;
    const nextThreshold = levelThresholds[currentLevel] || 2500;
    
    // Calculate progress percentage
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    const progressPercentage = Math.min(100, Math.max(0, Math.round(progress)));
    
    // Update level progress
    document.getElementById('level-percent').textContent = `${progressPercentage}%`;
    document.getElementById('next-level').textContent = nextLevel;
    document.getElementById('current-points').textContent = points;
    document.getElementById('next-level-points').textContent = nextThreshold;
    document.getElementById('points-needed').textContent = nextThreshold - points;
    document.getElementById('target-level').textContent = nextLevel;
    
    // Update progress circle
    const progressCircle = document.getElementById('level-circle');
    const rotation = (progressPercentage / 100) * 360;
    progressCircle.style.transform = `rotate(${rotation}deg)`;
    
    // Update stats
    document.getElementById('streak-days').textContent = userData.streak || 0;
    document.getElementById('completed-challenges').textContent = userData.completedChallenges || 0;
    document.getElementById('badges-earned').textContent = userData.badges || 0;
}

// Load recent activities
function loadRecentActivities(activitiesSnapshot) {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    if (activitiesSnapshot.empty) {
        activityList.innerHTML = '<div class="activity-item"><p>No activities yet. Complete some challenges to get started!</p></div>';
        return;
    }
    
    activitiesSnapshot.forEach(doc => {
        const activity = doc.data();
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const activityDate = activity.timestamp ? activity.timestamp.toDate() : new Date();
        const timeAgo = getTimeAgo(activityDate);
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${activity.icon || 'fa-gamepad'}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${timeAgo}</span>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

// Load badges
function loadBadges(badgesSnapshot) {
    const badgesGrid = document.getElementById('badges-grid');
    badgesGrid.innerHTML = '';
    
    // Define all possible badges
    const allBadges = [
        { id: 1, name: "Recycling Master", icon: "fa-recycle", description: "Complete 10 recycling challenges" },
        { id: 2, name: "Green Thumb", icon: "fa-seedling", description: "Plant your first tree" },
        { id: 3, name: "Energy Saver", icon: "fa-bolt", description: "Complete energy conservation course" },
        { id: 4, name: "Quiz Champion", icon: "fa-trophy", description: "Score 100% on any quiz" },
        { id: 5, name: "Water Guardian", icon: "fa-tint", description: "Complete water conservation challenges" },
        { id: 6, name: "Eco Explorer", icon: "fa-globe", description: "Reach level 3" }
    ];
    
    const earnedBadges = [];
    badgesSnapshot.forEach(doc => {
        earnedBadges.push(doc.data().badgeId);
    });
    
    if (earnedBadges.length === 0) {
        // Show locked badges
        allBadges.slice(0, 4).forEach(badge => {
            const badgeItem = document.createElement('div');
            badgeItem.className = 'badge-item';
            badgeItem.innerHTML = `
                <div class="badge-icon locked">
                    <i class="fas ${badge.icon}"></i>
                </div>
                <div class="badge-info">
                    <h4>${badge.name}</h4>
                    <p>Locked</p>
                </div>
            `;
            badgesGrid.appendChild(badgeItem);
        });
        return;
    }
    
    // Show earned badges first, then locked ones
    allBadges.forEach(badge => {
        const isEarned = earnedBadges.includes(badge.id);
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-item';
        
        if (isEarned) {
            badgeItem.innerHTML = `
                <div class="badge-icon">
                    <i class="fas ${badge.icon}"></i>
                </div>
                <div class="badge-info">
                    <h4>${badge.name}</h4>
                    <p>Earned</p>
                </div>
            `;
        } else {
            badgeItem.innerHTML = `
                <div class="badge-icon locked">
                    <i class="fas ${badge.icon}"></i>
                </div>
                <div class="badge-info">
                    <h4>${badge.name}</h4>
                    <p>Locked</p>
                </div>
            `;
        }
        
        badgesGrid.appendChild(badgeItem);
    });
}

// Initialize charts
function initializeCharts() {
    // Activity Chart
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    activityChart = new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Points Earned',
                data: [25, 40, 30, 35, 50, 45, 60],
                backgroundColor: 'rgba(46, 125, 50, 0.5)',
                borderColor: 'rgba(46, 125, 50, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
    
    // Category Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Recycling', 'Energy', 'Water', 'Biodiversity'],
            datasets: [{
                data: [35, 25, 20, 20],
                backgroundColor: [
                    'rgba(46, 125, 50, 0.8)',
                    'rgba(2, 136, 209, 0.8)',
                    'rgba(0, 188, 212, 0.8)',
                    'rgba(139, 195, 74, 0.8)'
                ],
                borderColor: [
                    'rgba(46, 125, 50, 1)',
                    'rgba(2, 136, 209, 1)',
                    'rgba(0, 188, 212, 1)',
                    'rgba(139, 195, 74, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Time range filter
    document.getElementById('time-range').addEventListener('change', function() {
        // In a real app, you would fetch new data based on the selected time range
        alert(`Data would update for ${this.value} in a real implementation`);
    });
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    }
    
    return date.toLocaleDateString();
}

// Initialize progress functionality
function initializeProgressFunctionality() {
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-menu') && !event.target.closest('.hamburger')) {
            navMenu.classList.remove('active');
        }
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeProgressFunctionality();
});