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
            
            // Populate dashboard with user data
            populateDashboard(user, userData);
            initializeDashboardFunctionality(user.uid);
        } else {
            console.error("Failed to fetch user data:", userData.error);
            // Create a new user record if it doesn't exist
            await createUserRecord(user);
            // Load default data
            populateDashboard(user, getDefaultUserData());
            initializeDashboardFunctionality(user.uid);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        // Load default data as fallback
        populateDashboard(user, getDefaultUserData());
        initializeDashboardFunctionality(user.uid);
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
        badges: [],
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
        monthlyProgress: [0, 0, 0, 0],
        yearlyProgress: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
}

// Populate dashboard with user data
function populateDashboard(user, userData) {
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
    
    // Set welcome message
    const userName = user.displayName || user.email.split('@')[0];
    document.getElementById('welcome-message').textContent = `Welcome back, ${userName}!`;
    
    // Set stats
    document.getElementById('streak-count').textContent = `${userData.streak} Day Streak`;
    document.getElementById('completed-challenges').textContent = userData.completedChallenges;
    document.getElementById('badges-earned').textContent = userData.badges;
    document.getElementById('trees-planted').textContent = userData.treesPlanted;
    document.getElementById('learning-time').textContent = `${userData.learningTime}h`;
    
    // Load activities
    loadRecentActivities(userData.activities);
    
    // Load badges
    loadBadges(userData.badges);
    
    // Initialize chart with weekly data by default
    initializeProgressChart(userData.weeklyProgress, 'week');
    
    console.log('Dashboard populated with data:', userData);
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

// Load recent activities
function loadRecentActivities(activities) {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    if (activities.length === 0) {
        activityList.innerHTML = '<div class="activity-item"><p>No activities yet. Complete some challenges to get started!</p></div>';
        return;
    }
    
    // Add activities to the list
    activities.slice(0, 3).forEach(activity => {
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
function loadBadges(badges) {
    const badgesList = document.getElementById('badges-list');
    badgesList.innerHTML = '';
    
    if (badges.length === 0) {
        badgesList.innerHTML = '<p>No badges yet. Earn points to unlock badges!</p>';
        return;
    }
    
    // Add badges to the list
    badges.slice(0, 3).forEach(badge => {
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-item';
        badgeItem.innerHTML = `
            <div class="badge-icon">
                <i class="fas ${badge.icon || 'fa-medal'}"></i>
            </div>
            <div class="badge-info">
                <h4>${badge.name}</h4>
                <p>Earned ${badge.date}</p>
            </div>
        `;
        badgesList.appendChild(badgeItem);
    });
}

// Initialize progress chart with different time ranges
function initializeProgressChart(data, timeRange) {
    const ctx = document.getElementById('activityChart').getContext('2d');
    
    let labels, chartData, yAxisStep, maxDataValue;
    
    // Ensure data is valid
    if (!Array.isArray(data)) {
        data = [];
    }
    
    switch(timeRange) {
        case 'week':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            chartData = data.length === 7 ? data : [0, 0, 0, 0, 0, 0, 0];
            maxDataValue = Math.max(...chartData, 1); // Ensure at least 1 to avoid division by zero
            yAxisStep = Math.ceil(maxDataValue / 5); // Dynamic step size
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
    if (window.activityChartInstance) {
        window.activityChartInstance.destroy();
    }
    
    window.activityChartInstance = new Chart(ctx, {
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
    
    console.log(`Chart initialized for ${timeRange} with data:`, chartData);
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
                        initializeProgressChart(userData.weeklyProgress, 'week');
                        break;
                    case 'month':
                        initializeProgressChart(userData.monthlyProgress, 'month');
                        break;
                    case 'year':
                        initializeProgressChart(userData.yearlyProgress, 'year');
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
                    initializeProgressChart(userData.weeklyProgress, 'week');
                    break;
                case 'month':
                    initializeProgressChart(userData.monthlyProgress, 'month');
                    break;
                case 'year':
                    initializeProgressChart(userData.yearlyProgress, 'year');
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

// Initialize dashboard functionality
function initializeDashboardFunctionality(userId) {
    // Setup time range selector
    setupTimeRangeSelector(userId);
    
    // Game launcher functionality
    const gameButtons = document.querySelectorAll('.btn-primary[data-game]');
    const gameLauncherModal = document.getElementById('gameLauncherModal');
    const gameModalTitle = document.getElementById('gameModalTitle');
    const gameModalDescription = document.getElementById('gameModalDescription');
    const gameProgress = document.getElementById('gameProgress');
    const progressText = document.getElementById('progressText');
    const startGameBtn = document.getElementById('startGame');
    const cancelLaunchBtn = document.getElementById('cancelLaunch');
    const gameCompletionModal = document.getElementById('gameCompletionModal');
    const continueBtn = document.getElementById('continueBtn');
    const pointsEarnedDisplay = document.getElementById('pointsEarned');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const totalScoreDisplay = document.getElementById('totalScoreDisplay');
    
    // Game iframe elements
    const gameIframeContainer = document.getElementById('gameIframeContainer');
    const gameIframe = document.getElementById('gameIframe');
    const gameIframeTitle = document.getElementById('gameIframeTitle');
    const closeGameBtn = document.getElementById('closeGameBtn');
    
    let currentGame = null;
    let progressInterval = null;
    
    // Game data
    const games = {
        recycling: {
            title: 'Advanced Recycling Challenge',
            description: 'Test your knowledge of advanced recycling techniques',
            points: 50,
            loadingTime: 3000,
            url: 'recycling-game.html'
        },
        'eco-city': {
            title: 'EcoCity Builder',
            description: 'Build your own sustainable city',
            points: 50,
            loadingTime: 3000,
            url: 'EcoCity_Builder.html'
        },
        quiz: {
            title: 'Climate Change Quiz',
            description: 'How much do you know about climate change?',
            points: 75,
            loadingTime: 4000,
            url: 'quiz-game.html'
        }
    };
    
    // Open game launcher modal
    gameButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gameType = this.getAttribute('data-game');
            currentGame = games[gameType];
            
            if (currentGame) {
                // Show the loading modal
                gameModalTitle.textContent = currentGame.title;
                gameModalDescription.textContent = currentGame.description;
                
                gameLauncherModal.style.display = 'flex';
                
                // Reset progress
                gameProgress.style.width = '0%';
                progressText.textContent = '0%';
                startGameBtn.disabled = true;
                
                // Simulate loading progress
                let progress = 0;
                const increment = 100 / (currentGame.loadingTime / 50);
                
                progressInterval = setInterval(() => {
                    progress += increment;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(progressInterval);
                        startGameBtn.disabled = false;
                    }
                    
                    gameProgress.style.width = progress + '%';
                    progressText.textContent = Math.round(progress) + '%';
                }, 50);
            }
        });
    });
    
    // Function to open game in iframe
    function openGameInIframe(game) {
        gameIframeTitle.textContent = game.title;
        gameIframe.src = game.url;
        gameIframeContainer.style.display = 'block';
        
        // Add message listener to handle game completion
        window.addEventListener('message', handleGameMessage);
    }
    
    // Handle messages from the game iframe
    function handleGameMessage(event) {
        const data = event.data;
        
        if (data.type === 'GAME_COMPLETE') {
            // Update user points based on game performance
            updateUserPoints(userId, data.points, currentGame.title);
            
            // Show completion modal
            scoreDisplay.textContent = data.score;
            totalScoreDisplay.textContent = data.total;
            pointsEarnedDisplay.textContent = data.points;
            gameCompletionModal.style.display = 'flex';
            
            // Close the game iframe
            closeGameIframe();
        } else if (data.type === 'CLOSE_GAME') {
            // Close the game iframe
            closeGameIframe();
        }
    }
    
    // Function to close the game iframe
    function closeGameIframe() {
        gameIframeContainer.style.display = 'none';
        gameIframe.src = 'about:blank';
        window.removeEventListener('message', handleGameMessage);
    }
    
    // Close game button event
    closeGameBtn.addEventListener('click', closeGameIframe);
    
    // Start game button
    startGameBtn.addEventListener('click', function() {
        gameLauncherModal.style.display = 'none';
        
        if (currentGame.url) {
            openGameInIframe(currentGame);
        } else {
            // Create game simulation for games without URLs
            simulateGame(currentGame, userId);
        }
    });
    
    // Game simulation function
    async function simulateGame(game, userId) {
        // After game completion (simulated with a timeout)
        setTimeout(async () => {
            const earnedPoints = Math.floor(game.points * 0.8); // Simulate score
            
            try {
                // Update user points on server
                const response = await fetch('/api/user/update-points', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uid: userId,
                        points: earnedPoints,
                        activity: {
                            type: 'game',
                            title: game.title,
                            description: `Earned ${earnedPoints} points`,
                            time: new Date().toLocaleDateString()
                        }
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Update UI
                    updateUIAfterGame(earnedPoints, game, userId);
                } else {
                    console.error("Failed to update points:", data.error);
                }
            } catch (error) {
                console.error("Error updating points:", error);
            }
        }, 2000);
    }
    
    // Function to update user points
    async function updateUserPoints(userId, points, gameTitle) {
        try {
            // Update user points on server
            const response = await fetch('/api/user/update-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: userId,
                    points: points,
                    activity: {
                        type: 'game',
                        title: gameTitle,
                        description: `Earned ${points} points`,
                        time: new Date().toLocaleDateString()
                    }
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                updateUIAfterGame(points, currentGame, userId);
            } else {
                console.error("Failed to update points:", data.error);
            }
        } catch (error) {
            console.error("Error updating points:", error);
        }
    }
    
    // Update UI after game completion
    function updateUIAfterGame(points, game, userId) {
        // Update points display
        const currentPoints = parseInt(document.getElementById('user-points').textContent);
        const newPoints = currentPoints + points;
        
        document.getElementById('user-points').textContent = newPoints;
        document.getElementById('nav-points').textContent = newPoints;
        
        // Update user level if needed
        const newLevel = calculateUserLevel(newPoints);
        document.getElementById('user-level').textContent = `Level ${newLevel} ${getLevelTitle(newLevel)}`;
        
        // Show completion modal
        scoreDisplay.textContent = points;
        totalScoreDisplay.textContent = game.points;
        pointsEarnedDisplay.textContent = points;
        gameCompletionModal.style.display = 'flex';
        
        // Add to recent activity
        addToActivity(game.title, points);
        
        // Refresh progress data after a short delay
        setTimeout(() => {
            refreshProgressData(userId);
        }, 1000);
    }
    
    // Cancel launch button
    cancelLaunchBtn.addEventListener('click', function() {
        clearInterval(progressInterval);
        gameLauncherModal.style.display = 'none';
    });
    
    // Continue button
    continueBtn.addEventListener('click', function() {
        gameCompletionModal.style.display = 'none';
    });
    
    // Add to recent activity
    function addToActivity(gameName, points) {
        const activityList = document.getElementById('activity-list');
        const now = new Date();
        const timeString = now.toLocaleDateString();
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-gamepad"></i>
            </div>
            <div class="activity-content">
                <h4>Completed ${gameName}</h4>
                <p>You earned ${points} points</p>
                <span class="activity-time">${timeString}</span>
            </div>
        `;
        
        // Add to top of list
        if (activityList.firstChild) {
            activityList.insertBefore(activityItem, activityList.firstChild);
        } else {
            activityList.appendChild(activityItem);
        }
    }
    
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === gameLauncherModal) {
            clearInterval(progressInterval);
            gameLauncherModal.style.display = 'none';
        }
        if (event.target === gameCompletionModal) {
            gameCompletionModal.style.display = 'none';
        }
        if (event.target === gameIframeContainer) {
            closeGameIframe();
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