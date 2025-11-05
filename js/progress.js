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

// Global variables for progress data
let currentUserId = null;
let userProgressData = {
    weekly: [],
    monthly: [],
    yearly: []
};

// Check authentication state
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // User is not logged in, redirect to login page
        window.location.href = "login.html";
        return;
    }
    
    currentUserId = user.uid;
    
    // User is logged in, load their data
    try {
        // Get user data from server
        const response = await fetch(`/api/user/data?uid=${user.uid}`);
        const userData = await response.json();
        
        if (response.ok) {
            // Store progress data globally
            userProgressData.weekly = userData.weeklyProgress || [0, 0, 0, 0, 0, 0, 0];
            userProgressData.monthly = userData.monthlyProgress || [0, 0, 0, 0];
            userProgressData.yearly = userData.yearlyProgress || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            
            // Populate progress page with user data
            populateProgressPage(user, userData);
            initializeProgressFunctionality(user.uid);
        } else {
            console.error("Failed to fetch user data:", userData.error);
            // Create a new user record if it doesn't exist
            await createUserRecord(user);
            // Load default data
            populateProgressPage(user, getDefaultUserData());
            initializeProgressFunctionality(user.uid);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        // Load default data as fallback
        populateProgressPage(user, getDefaultUserData());
        initializeProgressFunctionality(user.uid);
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
        gamesCompleted: 0,
        averageScore: 0,
        gamePoints: 0,
        challengesCompleted: 0,
        challengeSuccess: 0,
        challengePoints: 0,
        lessonsCompleted: 0,
        articlesRead: 0,
        learningPoints: 0,
        co2Reduced: 0,
        waterSaved: 0,
        wasteDiverted: 0,
        activities: [],
        badges: [],
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
        monthlyProgress: [0, 0, 0, 0],
        yearlyProgress: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
}

// Populate progress page with user data
function populateProgressPage(user, userData) {
    // Set user info
    document.getElementById('user-name').textContent = user.displayName || user.email;
    document.getElementById('user-avatar').innerHTML = user.photoURL ? 
        `<img src="${user.photoURL}" alt="User Avatar" style="width: 100%; height: 100%; border-radius: 50%;">` : 
        `<i class="fas fa-user"></i>`;
    
    // Set user points
    document.getElementById('user-points').textContent = userData.points;
    document.getElementById('nav-points').textContent = userData.points;
    document.getElementById('total-points').textContent = userData.points;
    
    // Set user level based on points
    const userLevel = calculateUserLevel(userData.points);
    document.getElementById('user-level').textContent = `Level ${userLevel} ${getLevelTitle(userLevel)}`;
    
    // Set stats
    document.getElementById('streak-count').textContent = userData.streak;
    document.getElementById('completed-challenges').textContent = userData.completedChallenges;
    document.getElementById('badges-earned').textContent = userData.badges;
    document.getElementById('trees-planted').textContent = userData.treesPlanted;
    document.getElementById('learning-time').textContent = `${userData.learningTime}h`;
    
    // Set detailed progress
    document.getElementById('games-completed').textContent = userData.gamesCompleted || 0;
    document.getElementById('average-score').textContent = `${userData.averageScore || 0}%`;
    document.getElementById('game-points').textContent = userData.gamePoints || 0;
    document.getElementById('challenges-completed').textContent = userData.challengesCompleted || 0;
    document.getElementById('challenge-success').textContent = `${userData.challengeSuccess || 0}%`;
    document.getElementById('challenge-points').textContent = userData.challengePoints || 0;
    document.getElementById('lessons-completed').textContent = userData.lessonsCompleted || 0;
    document.getElementById('articles-read').textContent = userData.articlesRead || 0;
    document.getElementById('learning-points').textContent = userData.learningPoints || 0;
    document.getElementById('co2-reduced').textContent = userData.co2Reduced || 0;
    document.getElementById('water-saved').textContent = userData.waterSaved || 0;
    document.getElementById('waste-diverted').textContent = userData.wasteDiverted || 0;
    
    // Load badges
    loadBadges(userData.badges);
    
    // Initialize charts with weekly data by default
    initializeProgressCharts(userData.weeklyProgress, 'week');
    
    // Update level progression
    updateLevelProgression(userData.points, userLevel);
    
    console.log('Progress page populated with data:', userData);
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

// Load badges
function loadBadges(badges) {
    const badgesGrid = document.getElementById('badges-grid');
    badgesGrid.innerHTML = '';
    
    if (badges.length === 0) {
        badgesGrid.innerHTML = '<p>No badges yet. Earn points to unlock badges!</p>';
        return;
    }
    
    // Add badges to the grid
    badges.forEach(badge => {
        const badgeCard = document.createElement('div');
        badgeCard.className = 'badge-card';
        badgeCard.innerHTML = `
            <div class="badge-icon">
                <i class="fas ${badge.icon || 'fa-medal'}"></i>
            </div>
            <h4>${badge.name}</h4>
            <p>${badge.description || 'Eco achievement'}</p>
        `;
        badgesGrid.appendChild(badgeCard);
    });
}

// Initialize progress charts
function initializeProgressCharts(data, timeRange) {
    // Ensure data is valid
    if (!Array.isArray(data)) {
        data = [];
    }
    
    // Initialize points chart
    initializePointsChart(data, timeRange);
    
    // Initialize activity pie chart
    initializeActivityPieChart();
}

// Initialize points chart
function initializePointsChart(data, timeRange) {
    const ctx = document.getElementById('pointsChart').getContext('2d');
    
    let labels, chartData, yAxisStep, maxDataValue;
    
    switch(timeRange) {
        case 'week':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            chartData = data.length === 7 ? data : [0, 0, 0, 0, 0, 0, 0];
            maxDataValue = Math.max(...chartData, 1);
            yAxisStep = Math.ceil(maxDataValue / 5);
            break;
            
        case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            chartData = data.length === 4 ? data : [0, 0, 0, 0];
            maxDataValue = Math.max(...chartData, 1);
            yAxisStep = Math.ceil(maxDataValue / 5);
            break;
            
        case 'year':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            chartData = data.length === 12 ? data : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            maxDataValue = Math.max(...chartData, 1);
            yAxisStep = Math.ceil(maxDataValue / 5);
            break;
            
        default:
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            chartData = [0, 0, 0, 0, 0, 0, 0];
            yAxisStep = 20;
    }
    
    // Destroy existing chart if it exists
    if (window.pointsChartInstance) {
        window.pointsChartInstance.destroy();
    }
    
    window.pointsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Points Earned',
                data: chartData,
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 2,
                borderRadius: 5,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: yAxisStep,
                        callback: function(value) {
                            return value + ' pts';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(76, 175, 80, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    callbacks: {
                        label: function(context) {
                            return `Points: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize activity pie chart
function initializeActivityPieChart() {
    const ctx = document.getElementById('activityPieChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.activityPieChartInstance) {
        window.activityPieChartInstance.destroy();
    }
    
    window.activityPieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Games', 'Challenges', 'Learning', 'Community'],
            datasets: [{
                data: [40, 25, 20, 15],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(156, 39, 176, 0.8)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(255, 152, 0, 1)',
                    'rgba(33, 150, 243, 1)',
                    'rgba(156, 39, 176, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
}

// Update level progression
function updateLevelProgression(points, currentLevel) {
    const levelProgress = document.getElementById('level-progress');
    const currentLevelText = document.getElementById('current-level-text');
    const pointsToNext = document.getElementById('points-to-next');
    
    // Define level thresholds
    const levelThresholds = [0, 100, 250, 500, 1000, 2000];
    
    // Calculate progress to next level
    const currentThreshold = levelThresholds[currentLevel - 1] || 0;
    const nextThreshold = levelThresholds[currentLevel] || 3000;
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    // Update progress bar
    levelProgress.style.width = `${Math.min(progress, 100)}%`;
    
    // Update level text
    currentLevelText.textContent = `Level ${currentLevel}: ${getLevelTitle(currentLevel)}`;
    
    // Update points to next level
    const pointsNeeded = nextThreshold - points;
    pointsToNext.textContent = `${pointsNeeded} points to next level`;
    
    // Update level indicators
    document.querySelectorAll('.level').forEach(level => {
        const levelNum = parseInt(level.getAttribute('data-level'));
        if (levelNum === currentLevel) {
            level.classList.add('current-level');
        } else {
            level.classList.remove('current-level');
        }
    });
}

// Setup time range selector
function setupTimeRangeSelector(userId) {
    const timeRangeSelect = document.getElementById('time-range');
    
    timeRangeSelect.addEventListener('change', async function() {
        const selectedRange = this.value;
        
        try {
            const response = await fetch(`/api/user/data?uid=${userId}`);
            const userData = await response.json();
            
            if (response.ok) {
                // Store the updated progress data globally
                userProgressData.weekly = userData.weeklyProgress || [0, 0, 0, 0, 0, 0, 0];
                userProgressData.monthly = userData.monthlyProgress || [0, 0, 0, 0];
                userProgressData.yearly = userData.yearlyProgress || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                
                console.log(`Switching to ${selectedRange} view:`, userProgressData[selectedRange + 'ly']);
                
                switch(selectedRange) {
                    case 'week':
                        initializePointsChart(userData.weeklyProgress, 'week');
                        break;
                    case 'month':
                        initializePointsChart(userData.monthlyProgress, 'month');
                        break;
                    case 'year':
                        initializePointsChart(userData.yearlyProgress, 'year');
                        break;
                }
            } else {
                console.error('Failed to fetch user data for time range change');
            }
        } catch (error) {
            console.error('Error changing time range:', error);
        }
    });
}

// Refresh all progress data
async function refreshProgressData(userId) {
    try {
        const response = await fetch(`/api/user/data?uid=${userId}`);
        const userData = await response.json();
        
        if (response.ok) {
            // Update global progress data
            userProgressData.weekly = userData.weeklyProgress || [0, 0, 0, 0, 0, 0, 0];
            userProgressData.monthly = userData.monthlyProgress || [0, 0, 0, 0];
            userProgressData.yearly = userData.yearlyProgress || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            
            // Refresh chart with current time range
            const timeRange = document.getElementById('time-range').value;
            console.log(`Refreshing ${timeRange} view with data:`, userProgressData[timeRange + 'ly']);
            
            switch(timeRange) {
                case 'week':
                    initializePointsChart(userData.weeklyProgress, 'week');
                    break;
                case 'month':
                    initializePointsChart(userData.monthlyProgress, 'month');
                    break;
                case 'year':
                    initializePointsChart(userData.yearlyProgress, 'year');
                    break;
            }
            
            console.log('Progress data refreshed:', userData);
        } else {
            console.error('Failed to refresh progress data');
        }
    } catch (error) {
        console.error('Error refreshing progress data:', error);
    }
}

// Initialize progress page functionality
function initializeProgressFunctionality(userId) {
    // Setup time range selector
    setupTimeRangeSelector(userId);
    
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
    
    // Auto-refresh progress data every 30 seconds
    setInterval(() => {
        refreshProgressData(userId);
    }, 30000);
}