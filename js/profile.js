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
            // Populate profile with user data
            populateProfile(user, userData);
            initializeProfileFunctionality(user.uid);
        } else {
            console.error("Failed to fetch user data:", userData.error);
            // Create a new user record if it doesn't exist
            await createUserRecord(user);
            // Load default data
            populateProfile(user, getDefaultUserData());
            initializeProfileFunctionality(user.uid);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        // Load default data as fallback
        populateProfile(user, getDefaultUserData());
        initializeProfileFunctionality(user.uid);
    }
});

// Function to create a new user record
async function createUserRecord(user) {
    try {
        const response = await fetch('/api/user/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || null
            })
        });
        
        const data = await response.json();
        if (!response.ok) {
            console.error("Failed to create user record:", data.error);
        }
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
        activities: [],
        badgesEarned: [],
        joinDate: new Date().toLocaleDateString(),
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
    };
}

// Populate profile with user data
function populateProfile(user, userData) {
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
    
    // Set profile info
    document.getElementById('profile-name').textContent = user.displayName || user.email;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('member-since').textContent = `Member since ${userData.joinDate || new Date().toLocaleDateString()}`;
    document.getElementById('profile-level').textContent = `Level ${userLevel} ${getLevelTitle(userLevel)}`;
    
    // Set stats
    document.getElementById('profile-completed').textContent = userData.completedChallenges;
    document.getElementById('profile-badges').textContent = userData.badgesEarned ? userData.badgesEarned.length : 0;
    document.getElementById('profile-trees').textContent = userData.treesPlanted;
    document.getElementById('profile-time').textContent = `${userData.learningTime}h`;
    
    // Load level progress
    updateLevelProgress(userData.points, userLevel);
    
    // Load activities
    loadRecentActivities(userData.activities);
    
    // Load badges
    loadBadges(userData.badgesEarned);
    
    // Initialize chart
    initializeProgressChart(userData.weeklyProgress);
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

// Update level progress
function updateLevelProgress(points, currentLevel) {
    const levelThresholds = [0, 100, 250, 500, 1000, 2000];
    const currentThreshold = levelThresholds[currentLevel - 1] || 0;
    const nextThreshold = levelThresholds[currentLevel] || 2500;
    
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    const progressPercentage = Math.min(100, Math.max(0, Math.round(progress)));
    
    document.getElementById('level-progress').style.width = `${progressPercentage}%`;
    document.getElementById('level-text').textContent = `${progressPercentage}% to Level ${currentLevel + 1}`;
    document.getElementById('points-text').textContent = `${points - currentThreshold}/${nextThreshold - currentThreshold} points`;
}

// Load recent activities
function loadRecentActivities(activities) {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    if (!activities || activities.length === 0) {
        activityList.innerHTML = '<div class="activity-item"><p>No activities yet. Complete some challenges to get started!</p></div>';
        return;
    }
    
    // Add activities to the list
    activities.slice(0, 5).forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${activity.icon || 'fa-gamepad'}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

// Load badges
function loadBadges(badgesEarned) {
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
    
    if (!badgesEarned || badgesEarned.length === 0) {
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
        const isEarned = badgesEarned.some(earned => earned.id === badge.id);
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-item';
        
        if (isEarned) {
            const earnedBadge = badgesEarned.find(earned => earned.id === badge.id);
            badgeItem.innerHTML = `
                <div class="badge-icon">
                    <i class="fas ${badge.icon}"></i>
                </div>
                <div class="badge-info">
                    <h4>${badge.name}</h4>
                    <p>Earned ${earnedBadge.date}</p>
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

// Initialize progress chart
function initializeProgressChart(weeklyData) {
    const ctx = document.getElementById('activityChart').getContext('2d');
    
    // Use provided data or default data
    const data = weeklyData || [0, 0, 0, 0, 0, 0, 0];
    
    const activityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Points Earned',
                data: data,
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
}

// Initialize profile functionality
function initializeProfileFunctionality(userId) {
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