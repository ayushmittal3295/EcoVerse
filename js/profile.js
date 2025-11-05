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

// Global variables
let currentUserId = null;
let userData = null;

// Check authentication state
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    
    currentUserId = user.uid;
    
    try {
        const response = await fetch(`/api/user/data?uid=${user.uid}`);
        const userData = await response.json();
        
        if (response.ok) {
            initializeProfile(user, userData);
        } else {
            await createUserRecord(user);
            initializeProfile(user, getDefaultUserData());
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        initializeProfile(user, getDefaultUserData());
    }
});

// Initialize profile page
function initializeProfile(user, userData) {
    populateProfileData(user, userData);
    setupTabNavigation();
    setupEventListeners();
    loadRecentBadges(userData.badges);
    loadAchievements(userData.achievements);
    loadActivityTimeline(userData.activities);
}

// Populate profile data
function populateProfileData(user, data) {
    // User info
    document.getElementById('user-name').textContent = user.displayName || user.email.split('@')[0];
    document.getElementById('profile-name').textContent = user.displayName || user.email.split('@')[0];
    document.getElementById('user-level').textContent = `Level ${data.level || 1} ${getLevelTitle(data.level || 1)}`;
    document.getElementById('profile-title').textContent = getLevelTitle(data.level || 1);
    
    // Points and stats
    document.getElementById('user-points').textContent = data.points || 0;
    document.getElementById('nav-points').textContent = data.points || 0;
    document.getElementById('total-points').textContent = data.points || 0;
    document.getElementById('streak-count').textContent = data.streak || 0;
    document.getElementById('rank-position').textContent = data.rank ? `#${data.rank}` : '#-';
    
    // Progress stats
    document.getElementById('games-completed').textContent = data.gamesCompleted || 0;
    document.getElementById('challenges-completed').textContent = data.completedChallenges || 0;
    document.getElementById('total-learning-time').textContent = `${data.learningTime || 0}h`;
    
    // Environmental impact
    document.getElementById('trees-planted').textContent = data.treesPlanted || 0;
    document.getElementById('co2-reduced').textContent = `${data.co2Reduced || 0}kg`;
    document.getElementById('water-saved').textContent = `${data.waterSaved || 0}L`;
    document.getElementById('waste-recycled').textContent = `${data.wasteRecycled || 0}kg`;
    
    // Level progress
    updateLevelProgress(data.points || 0, data.level || 1);
    
    // Account info
    document.getElementById('email').value = user.email;
    document.getElementById('display-name').value = user.displayName || user.email.split('@')[0];
    document.getElementById('bio').value = data.bio || '';
    document.getElementById('join-date').textContent = new Date(user.metadata.creationTime).getFullYear();
    document.getElementById('account-created').textContent = new Date(user.metadata.creationTime).toLocaleDateString();
    document.getElementById('last-login').textContent = new Date(user.metadata.lastSignInTime).toLocaleDateString();
    
    // Achievements stats
    document.getElementById('total-badges').textContent = data.badges ? data.badges.length : 0;
    document.getElementById('rare-badges').textContent = data.rareBadges || 0;
    document.getElementById('completion-rate').textContent = `${data.completionRate || 0}%`;
}

// Update level progress
function updateLevelProgress(points, level) {
    const levelThresholds = [0, 100, 250, 500, 1000, 2000];
    const currentThreshold = levelThresholds[level - 1] || 0;
    const nextThreshold = levelThresholds[level] || 3000;
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    const progressBar = document.getElementById('level-progress-bar');
    const progressText = document.getElementById('level-progress-text');
    
    progressBar.style.width = `${Math.min(progress, 100)}%`;
    progressText.textContent = `${Math.round(progress)}%`;
}

// Get level title
function getLevelTitle(level) {
    const titles = ['Eco Learner', 'Eco Explorer', 'Eco Enthusiast', 'Eco Warrior', 'Eco Champion', 'Eco Master'];
    return titles[level - 1] || 'Eco Legend';
}

// Setup tab navigation
function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current button and content
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Load recent badges
function loadRecentBadges(badges) {
    const badgesGrid = document.getElementById('recent-badges');
    badgesGrid.innerHTML = '';
    
    const defaultBadges = [
        { icon: 'fa-recycle', name: 'Recycling Expert', description: 'Mastered recycling' },
        { icon: 'fa-tree', name: 'Tree Guardian', description: 'Planted 10 trees' },
        { icon: 'fa-medal', name: 'Eco Warrior', description: 'Level 3 achieved' }
    ];
    
    const badgesToShow = badges && badges.length > 0 ? badges.slice(0, 3) : defaultBadges;
    
    badgesToShow.forEach(badge => {
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-item';
        badgeItem.innerHTML = `
            <div class="badge-icon">
                <i class="fas ${badge.icon}"></i>
            </div>
            <h4>${badge.name}</h4>
            <p>${badge.description}</p>
        `;
        badgesGrid.appendChild(badgeItem);
    });
}

// Load achievements
function loadAchievements(achievements) {
    const achievementsGrid = document.getElementById('achievements-grid');
    achievementsGrid.innerHTML = '';
    
    const defaultAchievements = [
        { icon: 'fa-recycle', name: 'Recycling Master', description: 'Complete all recycling challenges', points: 100, unlocked: true },
        { icon: 'fa-bolt', name: 'Energy Saver', description: 'Save 1000 kWh of energy', points: 150, unlocked: true },
        { icon: 'fa-tint', name: 'Water Guardian', description: 'Save 5000 liters of water', points: 200, unlocked: false },
        { icon: 'fa-seedling', name: 'Green Thumb', description: 'Plant 50 virtual trees', points: 250, unlocked: false },
        { icon: 'fa-users', name: 'Eco Influencer', description: 'Refer 5 friends to EcoLearn', points: 300, unlocked: false },
        { icon: 'fa-trophy', name: 'Eco Champion', description: 'Reach level 5', points: 500, unlocked: false }
    ];
    
    const achievementsToShow = achievements && achievements.length > 0 ? achievements : defaultAchievements;
    
    achievementsToShow.forEach(achievement => {
        const achievementCard = document.createElement('div');
        achievementCard.className = `achievement-card ${achievement.unlocked ? '' : 'locked'}`;
        achievementCard.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
            <div class="achievement-points">+${achievement.points}</div>
        `;
        achievementsGrid.appendChild(achievementCard);
    });
}

// Load activity timeline
function loadActivityTimeline(activities) {
    const timeline = document.getElementById('activity-timeline');
    timeline.innerHTML = '';
    
    const defaultActivities = [
        { icon: 'fa-gamepad', title: 'Completed Recycling Game', description: 'Scored 95% and earned 25 points', time: '2 hours ago', points: 25 },
        { icon: 'fa-trophy', title: 'Earned New Badge', description: 'Unlocked Recycling Expert badge', time: '1 day ago', points: 50 },
        { icon: 'fa-tree', title: 'Planted Virtual Tree', description: 'Contributed to reforestation efforts', time: '2 days ago', points: 10 },
        { icon: 'fa-chart-line', title: 'Level Up!', description: 'Reached Level 3 Eco Enthusiast', time: '3 days ago', points: 100 },
        { icon: 'fa-users', title: 'Joined Community Challenge', description: 'Participated in weekly eco-challenge', time: '1 week ago', points: 30 }
    ];
    
    const activitiesToShow = activities && activities.length > 0 ? activities.slice(0, 5) : defaultActivities;
    
    activitiesToShow.forEach(activity => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <div class="timeline-icon">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="timeline-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="timeline-time">${activity.time}</span>
            </div>
            <div class="timeline-points">+${activity.points}</div>
        `;
        timeline.appendChild(timelineItem);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Edit avatar button
    document.getElementById('edit-avatar-btn').addEventListener('click', openAvatarModal);
    
    // Avatar modal
    document.querySelector('.close-modal').addEventListener('click', closeAvatarModal);
    document.getElementById('cancel-avatar').addEventListener('click', closeAvatarModal);
    document.getElementById('save-avatar').addEventListener('click', saveAvatar);
    
    // Avatar options
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Profile form
    document.getElementById('profile-form').addEventListener('submit', saveProfileSettings);
    
    // Account actions
    document.getElementById('change-password-btn').addEventListener('click', changePassword);
    document.getElementById('privacy-settings-btn').addEventListener('click', openPrivacySettings);
    document.getElementById('delete-account-btn').addEventListener('click', deleteAccount);
    
    // Activity filter
    document.getElementById('activity-filter').addEventListener('change', filterActivities);
    
    // Hamburger menu
    document.querySelector('.hamburger').addEventListener('click', toggleMobileMenu);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('avatar-modal')) {
            closeAvatarModal();
        }
    });
}

// Avatar modal functions
function openAvatarModal() {
    document.getElementById('avatar-modal').style.display = 'flex';
}

function closeAvatarModal() {
    document.getElementById('avatar-modal').style.display = 'none';
}

function saveAvatar() {
    const selectedOption = document.querySelector('.avatar-option.selected');
    const icon = selectedOption.querySelector('i').className;
    
    // Update avatar in UI
    document.getElementById('profile-avatar').innerHTML = `<i class="${icon}"></i>`;
    document.getElementById('user-avatar').innerHTML = `<i class="${icon}"></i>`;
    
    // Here you would save to the server
    console.log('Avatar saved:', icon);
    
    closeAvatarModal();
    showNotification('Profile picture updated successfully!', 'success');
}

// Save profile settings
async function saveProfileSettings(e) {
    e.preventDefault();
    
    const formData = {
        displayName: document.getElementById('display-name').value,
        bio: document.getElementById('bio').value
    };
    
    try {
        // Update user profile
        await auth.currentUser.updateProfile({
            displayName: formData.displayName
        });
        
        // Save to server
        const response = await fetch('/api/user/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: currentUserId,
                ...formData
            })
        });
        
        if (response.ok) {
            // Update UI
            document.getElementById('user-name').textContent = formData.displayName;
            document.getElementById('profile-name').textContent = formData.displayName;
            showNotification('Profile updated successfully!', 'success');
        } else {
            throw new Error('Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile. Please try again.', 'error');
    }
}

// Change password
function changePassword() {
    const newPassword = prompt('Enter your new password:');
    if (newPassword) {
        auth.currentUser.updatePassword(newPassword).then(() => {
            showNotification('Password updated successfully!', 'success');
        }).catch(error => {
            console.error('Error updating password:', error);
            showNotification('Error updating password. Please try again.', 'error');
        });
    }
}

// Open privacy settings
function openPrivacySettings() {
    alert('Privacy settings would open here. This feature is coming soon!');
}

// Delete account
function deleteAccount() {
    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmDelete) {
        auth.currentUser.delete().then(() => {
            window.location.href = 'index.html';
        }).catch(error => {
            console.error('Error deleting account:', error);
            showNotification('Error deleting account. Please try again.', 'error');
        });
    }
}

// Filter activities
function filterActivities() {
    const filter = document.getElementById('activity-filter').value;
    const activities = document.querySelectorAll('.timeline-item');
    
    activities.forEach(activity => {
        if (filter === 'all') {
            activity.style.display = 'flex';
        } else {
            // This would be implemented based on actual activity data
            activity.style.display = 'flex'; // Placeholder
        }
    });
}

// Toggle mobile menu
function toggleMobileMenu() {
    document.querySelector('.nav-menu').classList.toggle('active');
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    auth.signOut().then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Logout error:", error);
    });
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <h4>${type === 'success' ? 'Success!' : 'Error!'}</h4>
            <p>${message}</p>
        </div>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Default user data
function getDefaultUserData() {
    return {
        points: 0,
        level: 1,
        streak: 0,
        completedChallenges: 0,
        gamesCompleted: 0,
        learningTime: 0,
        treesPlanted: 0,
        co2Reduced: 0,
        waterSaved: 0,
        wasteRecycled: 0,
        badges: [],
        achievements: [],
        activities: [],
        bio: '',
        rank: null,
        rareBadges: 0,
        completionRate: 0
    };
}

// Create user record
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
        return await response.json();
    } catch (error) {
        console.error("Error creating user record:", error);
    }
}