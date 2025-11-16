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

// Global variables
let currentUserId = null;
let userChallenges = [];
let allChallenges = [];

// Check authentication state
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    
    currentUserId = user.uid;
    await initializeChallengesPage(user);
});

// Initialize challenges page
async function initializeChallengesPage(user) {
    try {
        // Load user data
        const userData = await loadUserData(user.uid);
        populateUserData(user, userData);
        
        // Load challenges
        await loadChallenges(user.uid);
        
        // Initialize functionality
        initializeChallengesFunctionality(user.uid);
        
        // Start daily timer
        startDailyTimer();
        
    } catch (error) {
        console.error("Error initializing challenges page:", error);
    }
}

// Load user data
async function loadUserData(userId) {
    try {
        const response = await fetch(`/api/user/data?uid=${userId}`);
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to fetch user data');
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        return getDefaultUserData();
    }
}

// Get default user data
function getDefaultUserData() {
    return {
        points: 0,
        level: 1,
        streak: 0,
        completedChallenges: 0,
        badges: 0,
        treesPlanted: 0,
        learningTime: 0
    };
}

// Populate user data in UI
function populateUserData(user, userData) {
    // Set user info
    document.getElementById('user-name').textContent = user.displayName || user.email;
    document.getElementById('user-level').textContent = `Level ${userData.level} ${getLevelTitle(userData.level)}`;
    document.getElementById('user-points').textContent = userData.points;
    document.getElementById('nav-points').textContent = userData.points;
    document.getElementById('nav-points-desktop').textContent = userData.points;
    document.getElementById('mobile-points').textContent = userData.points;
    document.getElementById('completed-challenges-count').textContent = userData.completedChallenges || 0;
}

// Get level title
function getLevelTitle(level) {
    const titles = ['Eco Learner', 'Eco Explorer', 'Eco Enthusiast', 'Eco Warrior', 'Eco Champion', 'Eco Master'];
    return titles[level - 1] || 'Eco Legend';
}

// Load challenges from server or use default
async function loadChallenges(userId) {
    try {
        const response = await fetch(`/api/challenges?uid=${userId}`);
        if (response.ok) {
            const data = await response.json();
            userChallenges = data.userChallenges || [];
            allChallenges = data.allChallenges || getDefaultChallenges();
        } else {
            allChallenges = getDefaultChallenges();
        }
        
        renderChallenges();
        
    } catch (error) {
        console.error("Error loading challenges:", error);
        allChallenges = getDefaultChallenges();
        renderChallenges();
    }
}

// Get default challenges
function getDefaultChallenges() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return {
        daily: [
            {
                id: 'daily-1',
                title: 'Recycling Master',
                description: 'Correctly sort 10 different waste items into recycling categories',
                points: 25,
                category: 'daily',
                difficulty: 'easy',
                progress: 0,
                total: 10,
                expiresAt: tomorrow,
                isActive: true
            },
            {
                id: 'daily-2',
                title: 'Energy Saver',
                description: 'Complete the energy conservation quiz with 100% accuracy',
                points: 30,
                category: 'daily',
                difficulty: 'medium',
                progress: 0,
                total: 1,
                expiresAt: tomorrow,
                isActive: true
            },
            {
                id: 'daily-3',
                title: 'Eco Warrior',
                description: 'Learn about 5 different environmental topics',
                points: 20,
                category: 'daily',
                difficulty: 'easy',
                progress: 0,
                total: 5,
                expiresAt: tomorrow,
                isActive: true
            }
        ],
        weekly: [
            {
                id: 'weekly-1',
                title: 'Carbon Footprint Calculator',
                description: 'Calculate and analyze your carbon footprint for the week',
                points: 75,
                category: 'weekly',
                difficulty: 'medium',
                progress: 0,
                total: 1,
                expiresAt: nextWeek,
                isActive: true
            },
            {
                id: 'weekly-2',
                title: 'Sustainable Lifestyle',
                description: 'Complete 7 daily eco-friendly actions throughout the week',
                points: 100,
                category: 'weekly',
                difficulty: 'hard',
                progress: 0,
                total: 7,
                expiresAt: nextWeek,
                isActive: true
            }
        ],
        monthly: [
            {
                id: 'monthly-1',
                title: 'Eco Expert',
                description: 'Complete all daily challenges for 30 consecutive days',
                points: 500,
                category: 'monthly',
                difficulty: 'hard',
                progress: 0,
                total: 30,
                expiresAt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                isActive: true
            }
        ],
        special: [
            {
                id: 'special-1',
                title: 'Earth Day Special',
                description: 'Participate in Earth Day activities and learn about conservation',
                points: 150,
                category: 'special',
                difficulty: 'medium',
                progress: 0,
                total: 3,
                expiresAt: new Date(now.getFullYear(), 3, 30), // April 30th
                isActive: true,
                isNew: true
            }
        ]
    };
}

// Render challenges based on current filter
function renderChallenges() {
    const activeGrid = document.getElementById('active-challenges-grid');
    const upcomingGrid = document.getElementById('upcoming-challenges-grid');
    const completedList = document.getElementById('completed-challenges-list');
    const currentFilter = document.querySelector('.filter-btn.active').dataset.category;
    
    // Clear existing content
    activeGrid.innerHTML = '';
    upcomingGrid.innerHTML = '';
    completedList.innerHTML = '';
    
    let activeChallenges = [];
    let upcomingChallenges = [];
    let completedChallenges = [];
    
    // Filter and categorize challenges
    Object.values(allChallenges).flat().forEach(challenge => {
        if (currentFilter !== 'all' && challenge.category !== currentFilter) {
            return;
        }
        
        if (challenge.progress >= challenge.total) {
            completedChallenges.push(challenge);
        } else if (challenge.isActive) {
            if (isChallengeUpcoming(challenge)) {
                upcomingChallenges.push(challenge);
            } else {
                activeChallenges.push(challenge);
            }
        }
    });
    
    // Render active challenges
    if (activeChallenges.length === 0) {
        activeGrid.innerHTML = '<div class="no-challenges">No active challenges available. Check back later!</div>';
    } else {
        activeChallenges.forEach(challenge => {
            activeGrid.appendChild(createChallengeCard(challenge));
        });
    }
    
    // Render upcoming challenges
    if (upcomingChallenges.length === 0) {
        upcomingGrid.innerHTML = '<div class="no-challenges">No upcoming challenges at the moment.</div>';
    } else {
        upcomingChallenges.forEach(challenge => {
            upcomingGrid.appendChild(createChallengeCard(challenge));
        });
    }
    
    // Render completed challenges
    if (completedChallenges.length === 0) {
        completedList.innerHTML = '<div class="no-challenges">You haven\'t completed any challenges yet. Start with the active challenges above!</div>';
    } else {
        completedChallenges.slice(0, 5).forEach(challenge => {
            completedList.appendChild(createCompletedChallengeItem(challenge));
        });
    }
}

// Create challenge card element
function createChallengeCard(challenge) {
    const card = document.createElement('div');
    card.className = `challenge-card ${challenge.progress >= challenge.total ? 'challenge-completed' : ''} ${!challenge.isActive ? 'challenge-locked' : ''}`;
    
    const progressPercent = (challenge.progress / challenge.total) * 100;
    const timeLeft = getTimeLeft(challenge.expiresAt);
    
    card.innerHTML = `
        ${challenge.isNew ? '<span class="challenge-badge">New</span>' : ''}
        <div class="challenge-header">
            <h3 class="challenge-title">${challenge.title}</h3>
            <span class="challenge-points">+${challenge.points}</span>
        </div>
        <span class="challenge-category">${challenge.category}</span>
        <p class="challenge-description">${challenge.description}</p>
        
        <div class="challenge-progress">
            <div class="progress-info">
                <span>Progress</span>
                <span>${challenge.progress}/${challenge.total}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
        </div>
        
        <div class="challenge-meta">
            <span class="challenge-difficulty difficulty-${challenge.difficulty}">${challenge.difficulty}</span>
            <span class="challenge-time">${timeLeft}</span>
        </div>
        
        <div class="challenge-actions">
            ${challenge.progress >= challenge.total ? 
                '<button class="btn btn-success" disabled>Completed</button>' :
                challenge.isActive ?
                `<button class="btn btn-primary start-challenge" data-challenge-id="${challenge.id}">Start Challenge</button>` :
                '<button class="btn btn-disabled" disabled>Locked</button>'
            }
            <button class="btn btn-outline view-details" data-challenge-id="${challenge.id}">Details</button>
        </div>
    `;
    
    return card;
}

// Create completed challenge item
function createCompletedChallengeItem(challenge) {
    const item = document.createElement('div');
    item.className = 'completed-challenge-item';
    
    item.innerHTML = `
        <div class="completed-challenge-info">
            <h4>${challenge.title}</h4>
            <p>${challenge.description}</p>
            <span class="completed-challenge-date">Completed on ${new Date().toLocaleDateString()}</span>
        </div>
        <div class="completed-challenge-points">+${challenge.points}</div>
    `;
    
    return item;
}

// Check if challenge is upcoming
function isChallengeUpcoming(challenge) {
    return challenge.expiresAt > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // More than 7 days away
}

// Get time left for challenge
function getTimeLeft(expiresAt) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
}

// Start daily timer
function startDailyTimer() {
    function updateTimer() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('daily-reset-timer').textContent = `Resets in: ${hours}h ${minutes}m`;
    }
    
    updateTimer();
    setInterval(updateTimer, 60000); // Update every minute
}

// Initialize challenges functionality
function initializeChallengesFunctionality(userId) {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderChallenges();
        });
    });
    
    // Start challenge buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('start-challenge')) {
            const challengeId = e.target.dataset.challengeId;
            startChallenge(challengeId, userId);
        }
        
        if (e.target.classList.contains('view-details')) {
            const challengeId = e.target.dataset.challengeId;
            viewChallengeDetails(challengeId);
        }
    });
    
    // Challenge completion modal
    document.getElementById('continueFromChallenge').addEventListener('click', function() {
        document.getElementById('challengeCompletionModal').style.display = 'none';
    });
    
    // Sidebar functionality
    initializeSidebar();
}

// Start a challenge
async function startChallenge(challengeId, userId) {
    const challenge = findChallengeById(challengeId);
    if (!challenge || !challenge.isActive) return;
    
    try {
        // Simulate challenge completion (in real app, this would be game logic)
        const pointsEarned = await completeChallenge(challenge, userId);
        
        // Show completion modal
        showChallengeCompletion(challenge, pointsEarned);
        
        // Update UI
        await updateChallengesUI(userId);
        
    } catch (error) {
        console.error("Error starting challenge:", error);
        alert("There was an error starting the challenge. Please try again.");
    }
}

// Find challenge by ID
function findChallengeById(challengeId) {
    for (const category in allChallenges) {
        const challenge = allChallenges[category].find(c => c.id === challengeId);
        if (challenge) return challenge;
    }
    return null;
}

// Complete challenge (simulated)
async function completeChallenge(challenge, userId) {
    return new Promise((resolve) => {
        // Simulate challenge processing
        setTimeout(() => {
            const pointsEarned = challenge.points;
            
            // Update challenge progress
            challenge.progress = challenge.total;
            
            // Update user points (in real app, this would be API call)
            updateUserPoints(userId, pointsEarned, challenge.title);
            
            resolve(pointsEarned);
        }, 2000);
    });
}

// Update user points
async function updateUserPoints(userId, points, challengeTitle) {
    try {
        const response = await fetch('/api/user/update-points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: userId,
                points: points,
                activity: {
                    type: 'challenge',
                    title: challengeTitle,
                    description: `Completed challenge and earned ${points} points`,
                    time: new Date().toLocaleDateString()
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update points');
        }
    } catch (error) {
        console.error("Error updating points:", error);
    }
}

// Show challenge completion modal
function showChallengeCompletion(challenge, pointsEarned) {
    document.getElementById('completed-challenge-name').textContent = challenge.title;
    document.getElementById('challenge-points-earned').textContent = pointsEarned;
    document.getElementById('challengeCompletionModal').style.display = 'flex';
}

// Update challenges UI
async function updateChallengesUI(userId) {
    const userData = await loadUserData(userId);
    populateUserData(auth.currentUser, userData);
    renderChallenges();
}

// View challenge details
function viewChallengeDetails(challengeId) {
    const challenge = findChallengeById(challengeId);
    if (!challenge) return;
    
    alert(`Challenge Details:\n\n${challenge.title}\n\n${challenge.description}\n\nPoints: ${challenge.points}\nDifficulty: ${challenge.difficulty}\nProgress: ${challenge.progress}/${challenge.total}`);
}

// Initialize sidebar functionality
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });
    
    sidebarClose.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
    
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = "login.html";
        });
    });
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});