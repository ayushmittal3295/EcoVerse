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
let currentUserData = null;
let communityData = {
    posts: [],
    events: [],
    groups: [],
    leaderboard: [],
    onlineUsers: []
};

// Check authentication state
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    
    currentUserId = user.uid;
    await initializeCommunityPage(user);
});

// Initialize community page
async function initializeCommunityPage(user) {
    try {
        // Load user data
        currentUserData = await loadUserData(user.uid);
        populateUserData(user, currentUserData);
        
        // Load community data
        await loadCommunityData();
        
        // Initialize functionality
        initializeCommunityFunctionality();
        
    } catch (error) {
        console.error("Error initializing community page:", error);
        loadDefaultCommunityData();
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
        points: 1250,
        level: 3,
        streak: 7,
        completedChallenges: 12,
        badges: 5,
        treesPlanted: 8,
        learningTime: 15,
        posts: 8,
        comments: 23,
        likes: 45
    };
}

// Populate user data in UI
function populateUserData(user, userData) {
    // Set user info
    document.getElementById('user-name').textContent = user.displayName || user.email.split('@')[0];
    document.getElementById('user-rank').textContent = getLevelTitle(userData.level);
    document.getElementById('user-points').textContent = userData.points;
    document.getElementById('nav-points').textContent = userData.points;
    document.getElementById('nav-points-desktop').textContent = userData.points;
    document.getElementById('current-user-avatar').className = `fas fa-user`;
    
    // Set user stats
    document.getElementById('user-posts').textContent = userData.posts || 0;
    document.getElementById('user-comments').textContent = userData.comments || 0;
    document.getElementById('user-likes').textContent = userData.likes || 0;
}

// Get level title
function getLevelTitle(level) {
    const titles = ['Eco Learner', 'Eco Explorer', 'Eco Enthusiast', 'Eco Warrior', 'Eco Champion', 'Eco Master'];
    return titles[level - 1] || 'Eco Legend';
}

// Load community data
async function loadCommunityData() {
    try {
        const response = await fetch('/api/community/data');
        if (response.ok) {
            const data = await response.json();
            communityData = data;
        } else {
            throw new Error('Failed to fetch community data');
        }
        
        renderCommunityContent();
        
    } catch (error) {
        console.error("Error loading community data:", error);
        loadDefaultCommunityData();
    }
}

// Load default community data (fallback)
function loadDefaultCommunityData() {
    communityData = {
        posts: [
            {
                id: 'post-1',
                author: 'EcoWarrior42',
                authorLevel: 4,
                title: 'My Zero-Waste Journey: 6 Months In!',
                content: 'Just wanted to share my progress after 6 months of going zero-waste. I\'ve reduced my household waste by 85%! The biggest challenge was finding alternatives for packaging, but local bulk stores have been a lifesaver.',
                type: 'achievement',
                likes: 42,
                comments: 15,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                liked: true
            },
            {
                id: 'post-2',
                author: 'GreenThumb99',
                authorLevel: 3,
                title: 'Best Indoor Plants for Air Purification?',
                content: 'I\'m looking to improve my indoor air quality with some plants. Which ones are the most effective for removing toxins? I have moderate sunlight in my apartment.',
                type: 'question',
                likes: 18,
                comments: 23,
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
                liked: false
            },
            {
                id: 'post-3',
                author: 'SustainableSam',
                authorLevel: 5,
                title: 'DIY Natural Cleaning Products',
                content: 'Here\'s my favorite recipe for all-purpose cleaner: 1 cup white vinegar, 1 cup water, 10 drops tea tree oil, and 10 drops lemon essential oil. Works great and no harsh chemicals!',
                type: 'tip',
                likes: 67,
                comments: 8,
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                liked: true
            }
        ],
        events: [
            {
                id: 'event-1',
                title: 'Community Beach Cleanup',
                description: 'Join us for a beach cleanup at Sunset Beach. We\'ll provide gloves and bags!',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                location: 'Sunset Beach',
                participants: 24,
                maxParticipants: 50,
                joined: true
            },
            {
                id: 'event-2',
                title: 'Urban Gardening Workshop',
                description: 'Learn how to grow your own food in small spaces. Perfect for apartment dwellers!',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                location: 'Community Center',
                participants: 18,
                maxParticipants: 30,
                joined: false
            },
            {
                id: 'event-3',
                title: 'Climate Action Webinar',
                description: 'Expert panel discussion on practical climate actions we can take today.',
                date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
                location: 'Online',
                participants: 156,
                maxParticipants: 500,
                joined: false
            }
        ],
        groups: [
            {
                id: 'group-1',
                name: 'Urban Gardeners',
                description: 'Share tips and experiences about urban gardening and sustainable food production.',
                members: 342,
                posts: 128,
                joined: true
            },
            {
                id: 'group-2',
                name: 'Zero Waste Warriors',
                description: 'Support each other in reducing waste and living more sustainably.',
                members: 567,
                posts: 289,
                joined: false
            },
            {
                id: 'group-3',
                name: 'Renewable Energy Enthusiasts',
                description: 'Discuss solar, wind, and other renewable energy solutions for homes.',
                members: 189,
                posts: 76,
                joined: false
            },
            {
                id: 'group-4',
                name: 'Eco-Friendly Parents',
                description: 'Raising the next generation with environmental consciousness.',
                members: 234,
                posts: 145,
                joined: true
            }
        ],
        leaderboard: [
            { rank: 1, name: 'EcoMaster', points: 5420, level: 6 },
            { rank: 2, name: 'GreenGuru', points: 4875, level: 5 },
            { rank: 3, name: 'SustainableSara', points: 4320, level: 5 },
            { rank: 4, name: 'EcoWarrior42', points: 3890, level: 4 },
            { rank: 5, name: 'PlanetProtector', points: 3560, level: 4 },
            { rank: 6, name: 'GreenThumb99', points: 3210, level: 3 },
            { rank: 7, name: 'EcoExplorer', points: 2980, level: 3 },
            { rank: 8, name: 'SustainableSam', points: 2650, level: 3 },
            { rank: 9, name: 'NatureLover', points: 2340, level: 3 },
            { rank: 10, name: 'EcoLearner', points: 2100, level: 2 }
        ],
        onlineUsers: [
            { name: 'EcoWarrior42', level: 4, status: 'active' },
            { name: 'GreenThumb99', level: 3, status: 'active' },
            { name: 'SustainableSam', level: 5, status: 'active' },
            { name: 'PlanetProtector', level: 4, status: 'active' },
            { name: 'EcoExplorer', level: 3, status: 'active' },
            { name: 'NatureLover', level: 3, status: 'active' }
        ]
    };
    
    renderCommunityContent();
}

// Render community content
function renderCommunityContent() {
    renderPosts();
    renderEvents();
    renderGroups();
    renderLeaderboard();
    renderOnlineUsers();
}

// Render posts
function renderPosts() {
    const postsFeed = document.getElementById('posts-feed');
    postsFeed.innerHTML = '';
    
    if (communityData.posts.length === 0) {
        postsFeed.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-comments"></i>
                <h3>No Posts Yet</h3>
                <p>Be the first to share your eco-thoughts!</p>
            </div>
        `;
        return;
    }
    
    communityData.posts.forEach(post => {
        postsFeed.appendChild(createPostCard(post));
    });
}

// Create post card
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    const timeAgo = getTimeAgo(post.timestamp);
    const typeClass = `post-type ${post.type}`;
    
    card.innerHTML = `
        <div class="post-header">
            <div class="post-author-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="post-author-info">
                <h4>${post.author}</h4>
                <div class="post-meta">
                    ${timeAgo}
                    <span class="${typeClass}">${post.type}</span>
                </div>
            </div>
        </div>
        <div class="post-content">
            <h3>${post.title}</h3>
            <p>${post.content}</p>
        </div>
        <div class="post-stats">
            <div class="post-stat ${post.liked ? 'liked' : ''}" data-post-id="${post.id}">
                <i class="fas fa-heart"></i>
                <span>${post.likes}</span>
            </div>
            <div class="post-stat">
                <i class="fas fa-comment"></i>
                <span>${post.comments}</span>
            </div>
            <div class="post-stat">
                <i class="fas fa-share"></i>
                <span>Share</span>
            </div>
        </div>
    `;
    
    return card;
}

// Render events
function renderEvents() {
    const eventsGrid = document.getElementById('events-grid');
    eventsGrid.innerHTML = '';
    
    communityData.events.forEach(event => {
        eventsGrid.appendChild(createEventCard(event));
    });
}

// Create event card
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const eventDate = new Date(event.date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
    const joinedClass = event.joined ? 'joined' : '';
    const buttonText = event.joined ? 'Joined' : 'Join';
    
    card.innerHTML = `
        <div class="event-date">
            <span class="day">${day}</span>
            <span class="month">${month}</span>
        </div>
        <div class="event-content">
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <div class="event-meta">
                <div class="event-participants">
                    <i class="fas fa-users"></i>
                    <span>${event.participants}/${event.maxParticipants}</span>
                </div>
                <span>${event.location}</span>
            </div>
        </div>
        <button class="join-btn ${joinedClass}" data-event-id="${event.id}">
            ${buttonText}
        </button>
    `;
    
    return card;
}

// Render groups
function renderGroups() {
    const groupsGrid = document.getElementById('groups-grid');
    groupsGrid.innerHTML = '';
    
    communityData.groups.forEach(group => {
        groupsGrid.appendChild(createGroupCard(group));
    });
}

// Create group card
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    
    const joinedClass = group.joined ? 'joined' : '';
    const buttonText = group.joined ? 'Joined' : 'Join Group';
    
    card.innerHTML = `
        <div class="group-icon">
            <i class="fas fa-users"></i>
        </div>
        <div class="group-content">
            <h3>${group.name}</h3>
            <p>${group.description}</p>
            <div class="group-meta">
                <span><i class="fas fa-users"></i> ${group.members} members</span>
                <span><i class="fas fa-comments"></i> ${group.posts} posts</span>
            </div>
            <button class="join-group-btn ${joinedClass}" data-group-id="${group.id}">
                ${buttonText}
            </button>
        </div>
    `;
    
    return card;
}

// Render leaderboard
function renderLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';
    
    communityData.leaderboard.forEach(user => {
        leaderboardList.appendChild(createLeaderboardItem(user));
    });
}

// Create leaderboard item
function createLeaderboardItem(user) {
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    
    const rankClass = user.rank <= 3 ? 'top-3' : '';
    
    item.innerHTML = `
        <div class="leaderboard-rank ${rankClass}">${user.rank}</div>
        <div class="leaderboard-user">
            <div class="leaderboard-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="leaderboard-user-info">
                <h4>${user.name}</h4>
                <p>Level ${user.level}</p>
            </div>
        </div>
        <div class="leaderboard-points">${user.points}</div>
    `;
    
    return item;
}

// Render online users
function renderOnlineUsers() {
    const onlineMembers = document.getElementById('online-members');
    onlineMembers.innerHTML = '';
    
    communityData.onlineUsers.forEach(user => {
        onlineMembers.appendChild(createOnlineUserItem(user));
    });
}

// Create online user item
function createOnlineUserItem(user) {
    const item = document.createElement('div');
    item.className = 'member-item';
    
    item.innerHTML = `
        <div class="member-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="member-info">
            <h4>${user.name}</h4>
            <p>Level ${user.level}</p>
        </div>
        <div class="online-status"></div>
    `;
    
    return item;
}

// Get time ago string
function getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

// Initialize community functionality
function initializeCommunityFunctionality() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Create post modal
    const createPostBtn = document.getElementById('create-post-btn');
    const createPostModal = document.getElementById('createPostModal');
    const cancelPostBtn = document.getElementById('cancel-post');
    const postForm = document.getElementById('post-form');
    
    createPostBtn.addEventListener('click', function() {
        createPostModal.style.display = 'flex';
    });
    
    cancelPostBtn.addEventListener('click', function() {
        createPostModal.style.display = 'none';
    });
    
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createNewPost();
    });
    
    // Quick action buttons
    const newPostBtn = document.querySelector('.new-post-btn');
    const joinEventBtn = document.querySelector('.join-event-btn');
    const createGroupBtn = document.querySelector('.create-group-btn');
    
    newPostBtn.addEventListener('click', function() {
        createPostModal.style.display = 'flex';
    });
    
    joinEventBtn.addEventListener('click', function() {
        // Switch to events tab
        document.querySelector('[data-tab="events"]').click();
    });
    
    createGroupBtn.addEventListener('click', function() {
        alert('Group creation feature coming soon!');
    });
    
    // Like functionality
    document.addEventListener('click', function(e) {
        if (e.target.closest('.post-stat')) {
            const stat = e.target.closest('.post-stat');
            const postId = stat.dataset.postId;
            toggleLike(postId, stat);
        }
    });
    
    // Event join functionality
    document.addEventListener('click', function(e) {
        if (e.target.closest('.join-btn')) {
            const btn = e.target.closest('.join-btn');
            const eventId = btn.dataset.eventId;
            toggleEventJoin(eventId, btn);
        }
    });
    
    // Group join functionality
    document.addEventListener('click', function(e) {
        if (e.target.closest('.join-group-btn')) {
            const btn = e.target.closest('.join-group-btn');
            const groupId = btn.dataset.groupId;
            toggleGroupJoin(groupId, btn);
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === createPostModal) {
            createPostModal.style.display = 'none';
        }
    });
    
    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = "login.html";
            });
        });
    }
}

// Create new post
function createNewPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const type = document.getElementById('post-type').value;
    
    const newPost = {
        id: 'post-' + Date.now(),
        author: currentUserData.name || 'You',
        authorLevel: currentUserData.level,
        title: title,
        content: content,
        type: type,
        likes: 0,
        comments: 0,
        timestamp: new Date(),
        liked: false
    };
    
    // Add to beginning of posts array
    communityData.posts.unshift(newPost);
    
    // Update user stats
    currentUserData.posts = (currentUserData.posts || 0) + 1;
    document.getElementById('user-posts').textContent = currentUserData.posts;
    
    // Re-render posts
    renderPosts();
    
    // Close modal and reset form
    document.getElementById('createPostModal').style.display = 'none';
    document.getElementById('post-form').reset();
    
    // Show success message
    showNotification('Post created successfully!', 'success');
}

// Toggle like on post
function toggleLike(postId, statElement) {
    const post = communityData.posts.find(p => p.id === postId);
    if (!post) return;
    
    const heartIcon = statElement.querySelector('i');
    const likesCount = statElement.querySelector('span');
    
    if (post.liked) {
        // Unlike
        post.likes--;
        post.liked = false;
        statElement.classList.remove('liked');
        heartIcon.className = 'fas fa-heart';
    } else {
        // Like
        post.likes++;
        post.liked = true;
        statElement.classList.add('liked');
        heartIcon.className = 'fas fa-heart';
        
        // Update user likes given
        currentUserData.likes = (currentUserData.likes || 0) + 1;
        document.getElementById('user-likes').textContent = currentUserData.likes;
    }
    
    likesCount.textContent = post.likes;
}

// Toggle event join
function toggleEventJoin(eventId, button) {
    const event = communityData.events.find(e => e.id === eventId);
    if (!event) return;
    
    if (event.joined) {
        // Leave event
        event.participants--;
        event.joined = false;
        button.textContent = 'Join';
        button.classList.remove('joined');
        showNotification(`You left "${event.title}"`, 'info');
    } else {
        // Join event
        if (event.participants >= event.maxParticipants) {
            showNotification('This event is full!', 'error');
            return;
        }
        event.participants++;
        event.joined = true;
        button.textContent = 'Joined';
        button.classList.add('joined');
        showNotification(`You joined "${event.title}"!`, 'success');
    }
}

// Toggle group join
function toggleGroupJoin(groupId, button) {
    const group = communityData.groups.find(g => g.id === groupId);
    if (!group) return;
    
    if (group.joined) {
        // Leave group
        group.members--;
        group.joined = false;
        button.textContent = 'Join Group';
        button.classList.remove('joined');
        showNotification(`You left "${group.name}"`, 'info');
    } else {
        // Join group
        group.members++;
        group.joined = true;
        button.textContent = 'Joined';
        button.classList.add('joined');
        showNotification(`You joined "${group.name}"!`, 'success');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'info': 'info-circle',
        'warning': 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

// Add some CSS for notifications
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--surface);
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    border-left: 4px solid var(--primary);
    animation: slideIn 0.3s ease;
}

.notification.success {
    border-left-color: var(--success);
}

.notification.error {
    border-left-color: var(--error);
}

.notification.info {
    border-left-color: var(--accent);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.notification-content i {
    font-size: 1.2rem;
}

.notification.success .notification-content i {
    color: var(--success);
}

.notification.error .notification-content i {
    color: var(--error);
}

.notification.info .notification-content i {
    color: var(--accent);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Add notification styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);