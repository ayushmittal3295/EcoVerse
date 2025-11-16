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
let userAchievements = [];
let allAchievements = [];

// Check authentication state
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    
    currentUserId = user.uid;
    await initializeAchievementsPage(user);
});

// Initialize achievements page
async function initializeAchievementsPage(user) {
    try {
        // Load user data from dashboard system
        const userData = await loadUserData(user.uid);
        populateUserData(user, userData);
        
        // Load achievements
        await loadAchievements(user.uid);
        
        // Initialize functionality
        initializeAchievementsFunctionality(user.uid);
        
    } catch (error) {
        console.error("Error initializing achievements page:", error);
        // Load default data as fallback
        const userData = getDefaultUserData();
        populateUserData(user, userData);
        loadDefaultAchievements();
    }
}

// Load user data - Integrated with Dashboard Point System
async function loadUserData(userId) {
    try {
        // Try to get user data from the same API endpoint as dashboard
        const response = await fetch(`/api/user/data?uid=${userId}`);
        if (response.ok) {
            const userData = await response.json();
            return userData;
        } else {
            // If API fails, try to get from localStorage (dashboard might have stored it)
            const localData = localStorage.getItem(`ecolearn_user_${userId}`);
            if (localData) {
                return JSON.parse(localData);
            }
            throw new Error('Failed to fetch user data');
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        return getDefaultUserData();
    }
}

// Get default user data aligned with dashboard
function getDefaultUserData() {
    return {
        points: 1250,
        level: 3,
        streak: 7,
        completedChallenges: 12,
        badges: 2, // This matches your 2/12 unlocked achievements
        treesPlanted: 8,
        learningTime: 15,
        weeklyProgress: [25, 40, 15, 60, 30, 45, 20],
        monthlyProgress: [120, 180, 95, 210],
        yearlyProgress: [1500, 1200, 1350, 1100, 1250, 1400, 1300, 1450, 1200, 1350, 1250, 1400]
    };
}

// Populate user data in UI - Perfectly aligned with dashboard
function populateUserData(user, userData) {
    // Set user info (same as dashboard)
    document.getElementById('user-name').textContent = user.displayName || user.email.split('@')[0];
    
    // Calculate level and title (same logic as dashboard)
    const userLevel = calculateUserLevel(userData.points);
    const levelTitle = getLevelTitle(userLevel);
    document.getElementById('user-level').textContent = `Level ${userLevel} ${levelTitle}`;
    
    // Set points (synchronized with dashboard)
    document.getElementById('user-points').textContent = userData.points;
    document.getElementById('nav-points').textContent = userData.points;
    document.getElementById('nav-points-desktop').textContent = userData.points;
    document.getElementById('mobile-points').textContent = userData.points;
    
    // Set badges earned (from dashboard data)
    document.getElementById('total-badges-earned').textContent = userData.badges || 0;
    
    // Update user avatar if available
    if (user.photoURL) {
        document.getElementById('user-avatar').innerHTML = `<img src="${user.photoURL}" alt="User Avatar" style="width: 100%; height: 100%; border-radius: 50%;">`;
    }
}

// Calculate user level based on points (same as dashboard)
function calculateUserLevel(points) {
    if (points < 100) return 1;
    if (points < 250) return 2;
    if (points < 500) return 3;
    if (points < 1000) return 4;
    if (points < 2000) return 5;
    return 6;
}

// Get level title (same as dashboard)
function getLevelTitle(level) {
    const titles = ['Eco Learner', 'Eco Explorer', 'Eco Enthusiast', 'Eco Warrior', 'Eco Champion', 'Eco Master'];
    return titles[level - 1] || 'Eco Legend';
}

// Load achievements from server or use default
async function loadAchievements(userId) {
    try {
        const response = await fetch(`/api/achievements?uid=${userId}`);
        if (response.ok) {
            const data = await response.json();
            userAchievements = data.userAchievements || [];
            allAchievements = data.allAchievements || getDefaultAchievements();
        } else {
            allAchievements = getDefaultAchievements();
        }
        
        updateAchievementStats();
        renderAchievements();
        
    } catch (error) {
        console.error("Error loading achievements:", error);
        allAchievements = getDefaultAchievements();
        updateAchievementStats();
        renderAchievements();
    }
}

// Get default achievements aligned with your 2/12 design
function getDefaultAchievements() {
    return [
        // Learning Achievements
        {
            id: 'learn-1',
            name: 'First Steps',
            description: 'Complete your first learning module',
            category: 'learning',
            points: 25,
            icon: 'fa-graduation-cap',
            rarity: 'common',
            progress: 1,
            total: 1,
            unlocked: true,
            unlockedAt: new Date('2024-01-15')
        },
        {
            id: 'learn-2',
            name: 'Knowledge Seeker',
            description: 'Complete 10 learning modules',
            category: 'learning',
            points: 100,
            icon: 'fa-book',
            rarity: 'rare',
            progress: 7,
            total: 10,
            unlocked: false,
            unlockedAt: null
        },
        {
            id: 'learn-3',
            name: 'Eco Scholar',
            description: 'Complete 50 learning modules',
            category: 'learning',
            points: 500,
            icon: 'fa-user-graduate',
            rarity: 'epic',
            progress: 23,
            total: 50,
            unlocked: false,
            unlockedAt: null
        },

        // Challenge Achievements
        {
            id: 'challenge-1',
            name: 'Challenge Starter',
            description: 'Complete your first challenge',
            category: 'challenges',
            points: 50,
            icon: 'fa-flag',
            rarity: 'common',
            progress: 1,
            total: 1,
            unlocked: true,
            unlockedAt: new Date('2024-01-20')
        },
        {
            id: 'challenge-2',
            name: 'Challenge Master',
            description: 'Complete 25 challenges',
            category: 'challenges',
            points: 250,
            icon: 'fa-trophy',
            rarity: 'rare',
            progress: 12,
            total: 25,
            unlocked: false,
            unlockedAt: null
        },
        {
            id: 'challenge-3',
            name: 'Ultimate Challenger',
            description: 'Complete 100 challenges',
            category: 'challenges',
            points: 1000,
            icon: 'fa-crown',
            rarity: 'legendary',
            progress: 12,
            total: 100,
            unlocked: false,
            unlockedAt: null
        },

        // Streak Achievements
        {
            id: 'streak-1',
            name: 'Consistent Learner',
            description: 'Maintain a 7-day streak',
            category: 'streak',
            points: 75,
            icon: 'fa-fire',
            rarity: 'common',
            progress: 3,
            total: 7,
            unlocked: false,
            unlockedAt: null
        },
        {
            id: 'streak-2',
            name: 'Dedicated Eco Warrior',
            description: 'Maintain a 30-day streak',
            category: 'streak',
            points: 300,
            icon: 'fa-bolt',
            rarity: 'rare',
            progress: 3,
            total: 30,
            unlocked: false,
            unlockedAt: null
        },
        {
            id: 'streak-3',
            name: 'Unstoppable Force',
            description: 'Maintain a 100-day streak',
            category: 'streak',
            points: 1000,
            icon: 'fa-infinity',
            rarity: 'legendary',
            progress: 3,
            total: 100,
            unlocked: false,
            unlockedAt: null
        },

        // Special Achievements
        {
            id: 'special-1',
            name: 'Early Bird',
            description: 'Join EcoLearn during the launch period',
            category: 'special',
            points: 150,
            icon: 'fa-feather',
            rarity: 'rare',
            progress: 1,
            total: 1,
            unlocked: false,
            unlockedAt: null
        },
        {
            id: 'special-2',
            name: 'Point Collector',
            description: 'Earn 1000 total points',
            category: 'special',
            points: 200,
            icon: 'fa-star',
            rarity: 'epic',
            progress: 1250,
            total: 1000,
            unlocked: true,
            unlockedAt: new Date('2024-02-01')
        },
        {
            id: 'special-3',
            name: 'Eco Legend',
            description: 'Reach the maximum level',
            category: 'special',
            points: 500,
            icon: 'fa-medal',
            rarity: 'legendary',
            progress: 3,
            total: 6,
            unlocked: false,
            unlockedAt: null
        }
    ];
}

// Update achievement statistics
function updateAchievementStats() {
    const totalAchievements = allAchievements.length;
    const unlockedAchievements = allAchievements.filter(a => a.unlocked).length;
    const completionRate = totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0;
    const rareAchievements = allAchievements.filter(a => a.unlocked && 
        (a.rarity === 'rare' || a.rarity === 'epic' || a.rarity === 'legendary')).length;

    // Update stats (aligned with your 12 total, 2 unlocked, 17% rate design)
    document.getElementById('total-achievements').textContent = totalAchievements;
    document.getElementById('achievement-rate').textContent = `${completionRate}%`;
    document.getElementById('rare-badges').textContent = rareAchievements;
    document.getElementById('unlocked-count').textContent = unlockedAchievements;
    document.getElementById('total-achievements-count').textContent = totalAchievements;
    
    // Update streak from user data
    const userData = JSON.parse(localStorage.getItem(`ecolearn_user_${currentUserId}`) || '{}');
    document.getElementById('current-streak').textContent = userData.streak || 0;
}

// Render achievements based on current filter
function renderAchievements() {
    const achievementsGrid = document.getElementById('achievements-grid');
    const recentUnlocksCarousel = document.getElementById('recent-unlocks-carousel');
    const currentFilter = document.querySelector('.filter-btn.active').dataset.category;
    
    // Clear existing content
    achievementsGrid.innerHTML = '';
    recentUnlocksCarousel.innerHTML = '';
    
    // Filter achievements
    const filteredAchievements = currentFilter === 'all' 
        ? allAchievements 
        : allAchievements.filter(achievement => achievement.category === currentFilter);
    
    // Render achievements grid
    if (filteredAchievements.length === 0) {
        achievementsGrid.innerHTML = `
            <div class="no-achievements">
                <i class="fas fa-trophy"></i>
                <h3>No Achievements Found</h3>
                <p>No achievements available in this category.</p>
            </div>
        `;
    } else {
        filteredAchievements.forEach(achievement => {
            achievementsGrid.appendChild(createAchievementCard(achievement));
        });
    }
    
    // Render recent unlocks (last 3 unlocked achievements)
    const recentUnlocks = allAchievements
        .filter(a => a.unlocked && a.unlockedAt)
        .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
        .slice(0, 3);
    
    if (recentUnlocks.length === 0) {
        recentUnlocksCarousel.innerHTML = `
            <div class="no-achievements">
                <p>No recent unlocks. Complete activities to earn achievements!</p>
            </div>
        `;
    } else {
        recentUnlocks.forEach(achievement => {
            recentUnlocksCarousel.appendChild(createRecentAchievementItem(achievement));
        });
    }
}

// Create achievement card element
function createAchievementCard(achievement) {
    const card = document.createElement('div');
    card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
    
    const progressPercent = achievement.unlocked ? 100 : (achievement.progress / achievement.total) * 100;
    const badgeClass = achievement.unlocked ? 'unlocked' : 'locked';
    const rarityClass = achievement.rarity;
    
    card.innerHTML = `
        <div class="achievement-badge ${badgeClass} ${rarityClass}">
            <i class="fas ${achievement.icon}"></i>
            <span class="achievement-rarity rarity-${achievement.rarity}">
                <i class="fas ${getRarityIcon(achievement.rarity)}"></i>
            </span>
        </div>
        
        <div class="achievement-info">
            <span class="achievement-level">${achievement.rarity.toUpperCase()}</span>
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
            
            ${!achievement.unlocked ? `
                <div class="achievement-progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="achievement-meta">
                    <span>Progress: ${achievement.progress}/${achievement.total}</span>
                    <span class="achievement-points">+${achievement.points}</span>
                </div>
            ` : `
                <div class="achievement-meta">
                    <span class="achievement-date">Unlocked: ${formatDate(achievement.unlockedAt)}</span>
                    <span class="achievement-points">+${achievement.points}</span>
                </div>
            `}
        </div>
    `;
    
    return card;
}

// Create recent achievement item for carousel
function createRecentAchievementItem(achievement) {
    const item = document.createElement('div');
    item.className = 'recent-achievement';
    
    item.innerHTML = `
        <div class="recent-badge">
            <i class="fas ${achievement.icon}"></i>
        </div>
        <h4>${achievement.name}</h4>
        <span class="achievement-date">${formatDate(achievement.unlockedAt)}</span>
    `;
    
    return item;
}

// Get rarity icon
function getRarityIcon(rarity) {
    const icons = {
        'common': 'fa-circle',
        'rare': 'fa-gem',
        'epic': 'fa-crown',
        'legendary': 'fa-star'
    };
    return icons[rarity] || 'fa-circle';
}

// Format date for display
function formatDate(date) {
    if (!date) return 'Not unlocked';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Initialize achievements functionality
function initializeAchievementsFunctionality(userId) {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderAchievements();
        });
    });
    
    // Achievement unlock modal
    document.getElementById('continueFromAchievement').addEventListener('click', function() {
        document.getElementById('achievementUnlockModal').style.display = 'none';
    });
    
    // Sidebar functionality
    initializeSidebar();
    
    // Simulate achievement progress (for demo)
    setupDemoProgress();
}

// Setup demo progress simulation
function setupDemoProgress() {
    // Simulate progress updates every 10 seconds
    setInterval(() => {
        simulateProgressUpdate();
    }, 10000);
}

// Simulate progress update
function simulateProgressUpdate() {
    const lockedAchievements = allAchievements.filter(a => !a.unlocked);
    
    lockedAchievements.forEach(achievement => {
        if (Math.random() > 0.7) { // 30% chance to update progress
            const increment = Math.floor(Math.random() * 3) + 1; // 1-3 progress
            achievement.progress = Math.min(achievement.progress + increment, achievement.total);
            
            // Check if achievement should be unlocked
            if (achievement.progress >= achievement.total && !achievement.unlocked) {
                unlockAchievement(achievement);
            }
        }
    });
    
    updateAchievementStats();
    renderAchievements();
}

// Unlock an achievement
async function unlockAchievement(achievement) {
    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    
    // Update user points in the system
    await updateUserPoints(achievement.points, achievement.name);
    
    // Show unlock modal
    showAchievementUnlockModal(achievement);
    
    // Update UI
    updateAchievementStats();
    renderAchievements();
}

// Update user points - Synchronized with Dashboard
async function updateUserPoints(points, achievementName) {
    try {
        // Update points via the same API as dashboard
        const response = await fetch('/api/user/update-points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: currentUserId,
                points: points,
                activity: {
                    type: 'achievement',
                    title: achievementName,
                    description: `Unlocked achievement and earned ${points} points`,
                    time: new Date().toLocaleDateString()
                }
            })
        });
        
        if (response.ok) {
            // Update local storage and UI
            const userData = await loadUserData(currentUserId);
            populateUserData(auth.currentUser, userData);
            
            // Also update badges count
            userData.badges = (userData.badges || 0) + 1;
            localStorage.setItem(`ecolearn_user_${currentUserId}`, JSON.stringify(userData));
            
        } else {
            throw new Error('Failed to update points');
        }
        
    } catch (error) {
        console.error("Error updating points:", error);
        // Fallback: update locally
        const currentPoints = parseInt(document.getElementById('user-points').textContent);
        const newPoints = currentPoints + points;
        
        document.getElementById('user-points').textContent = newPoints;
        document.getElementById('nav-points').textContent = newPoints;
        document.getElementById('nav-points-desktop').textContent = newPoints;
        document.getElementById('mobile-points').textContent = newPoints;
        
        // Update badges count locally
        const currentBadges = parseInt(document.getElementById('total-badges-earned').textContent);
        document.getElementById('total-badges-earned').textContent = currentBadges + 1;
    }
}

// Show achievement unlock modal
function showAchievementUnlockModal(achievement) {
    document.getElementById('unlocked-badge-icon').className = `fas ${achievement.icon}`;
    document.getElementById('unlocked-achievement-name').textContent = achievement.name;
    document.getElementById('unlocked-achievement-desc').textContent = achievement.description;
    document.getElementById('achievement-points-earned').textContent = achievement.points;
    document.getElementById('achievementUnlockModal').style.display = 'flex';
}

// Initialize sidebar functionality (same as dashboard)
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
        });
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = "login.html";
            }).catch((error) => {
                console.error("Logout error:", error);
            });
        });
    }
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

// Load default achievements (fallback)
function loadDefaultAchievements() {
    allAchievements = getDefaultAchievements();
    updateAchievementStats();
    renderAchievements();
}