// // Firebase configuration (same as in dashboard.js)
// const firebaseConfig = {
//     apiKey: "YOUR_API_KEY",
//     authDomain: "your-project.firebaseapp.com",
//     projectId: "your-project",
//     storageBucket: "your-project.appspot.com",
//     messagingSenderId: "YOUR_SENDER_ID",
//     appId: "YOUR_APP_ID"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.firestore();

// // DOM Elements
// const tabBtns = document.querySelectorAll('.tab-btn');
// const tabContents = document.querySelectorAll('.tab-content');
// const postsContainer = document.getElementById('posts-container');
// const leaderboardContainer = document.getElementById('leaderboard-container');
// const postSubmitBtn = document.getElementById('post-submit');
// const postTextInput = document.getElementById('post-text');
// const currentUserAvatar = document.getElementById('current-user-avatar');
// const userNameElement = document.getElementById('user-name');
// const userLevelElement = document.getElementById('user-level');
// const userPointsElement = document.getElementById('user-points');
// const navPointsElement = document.getElementById('nav-points');
// const logoutBtn = document.getElementById('logout-btn');

// // Current user data
// let currentUser = null;

// // Check authentication state
// auth.onAuthStateChanged(user => {
//     if (user) {
//         currentUser = user;
//         loadUserData();
//         loadCommunityData();
//     } else {
//         window.location.href = 'index.html';
//     }
// });

// // Load user data from Firestore
// function loadUserData() {
//     db.collection('users').doc(currentUser.uid).get()
//         .then(doc => {
//             if (doc.exists) {
//                 const userData = doc.data();
//                 userNameElement.textContent = userData.name || 'Eco Learner';
//                 userLevelElement.textContent = `Level ${userData.level || 1} Eco Learner`;
//                 userPointsElement.textContent = userData.points || 0;
//                 navPointsElement.textContent = userData.points || 0;
                
//                 // Set user avatar if available
//                 if (userData.avatar) {
//                     currentUserAvatar.className = '';
//                     currentUserAvatar.style.backgroundImage = `url(${userData.avatar})`;
//                     currentUserAvatar.style.backgroundSize = 'cover';
//                 }
//             }
//         })
//         .catch(error => {
//             console.error('Error loading user data:', error);
//         });
// }

// // Load community data
// function loadCommunityData() {
//     loadPosts();
//     loadLeaderboard();
//     // Additional loading functions for discussions and events can be added here
// }

// // Tab switching functionality
// tabBtns.forEach(btn => {
//     btn.addEventListener('click', () => {
//         const tabId = btn.getAttribute('data-tab');
        
//         // Update active tab button
//         tabBtns.forEach(btn => btn.classList.remove('active'));
//         btn.classList.add('active');
        
//         // Show corresponding tab content
//         tabContents.forEach(content => {
//             content.classList.remove('active');
//             if (content.id === `${tabId}-tab`) {
//                 content.classList.add('active');
//             }
//         });
        
//         // Load data for the selected tab if needed
//         if (tabId === 'leaderboard') {
//             loadLeaderboard();
//         } else if (tabId === 'discussions') {
//             loadDiscussions();
//         } else if (tabId === 'events') {
//             loadEvents();
//         }
//     });
// });

// // Load and display posts
// function loadPosts() {
//     postsContainer.innerHTML = '<div class="loading">Loading posts...</div>';
    
//     db.collection('posts')
//         .orderBy('timestamp', 'desc')
//         .limit(10)
//         .get()
//         .then(snapshot => {
//             postsContainer.innerHTML = '';
            
//             if (snapshot.empty) {
//                 postsContainer.innerHTML = '<div class="no-posts">No posts yet. Be the first to share!</div>';
//                 return;
//             }
            
//             snapshot.forEach(doc => {
//                 const post = doc.data();
//                 displayPost(doc.id, post);
//             });
//         })
//         .catch(error => {
//             console.error('Error loading posts:', error);
//             postsContainer.innerHTML = '<div class="error">Error loading posts. Please try again.</div>';
//         });
// }

// // Display a single post
// function displayPost(id, post) {
//     const postElement = document.createElement('div');
//     postElement.className = 'post-card';
    
//     // Format the timestamp
//     const postDate = post.timestamp.toDate();
//     const timeAgo = getTimeAgo(postDate);
    
//     postElement.innerHTML = `
//         <div class="post-header">
//             <div class="post-user">
//                 <div class="post-user-img">
//                     <i class="fas fa-user"></i>
//                 </div>
//                 <div class="post-user-info">
//                     <h3>${post.userName}</h3>
//                     <span class="post-time">${timeAgo}</span>
//                 </div>
//             </div>
//         </div>
//         <div class="post-content">
//             <p>${post.content}</p>
//         </div>
//         <div class="post-stats">
//             <div class="post-stat">
//                 <i class="fas fa-heart"></i>
//                 <span>${post.likes || 0}</span>
//             </div>
//             <div class="post-stat">
//                 <i class="fas fa-comment"></i>
//                 <span>${post.comments || 0}</span>
//             </div>
//             <div class="post-stat">
//                 <i class="fas fa-share"></i>
//                 <span>${post.shares || 0}</span>
//             </div>
//         </div>
//         <div class="post-actions-bottom">
//             <button class="post-action-btn like-btn" data-post-id="${id}">
//                 <i class="fas fa-heart"></i>
//                 <span>Like</span>
//             </button>
//             <button class="post-action-btn comment-btn" data-post-id="${id}">
//                 <i class="fas fa-comment"></i>
//                 <span>Comment</span>
//             </button>
//             <button class="post-action-btn share-btn" data-post-id="${id}">
//                 <i class="fas fa-share"></i>
//                 <span>Share</span>
//             </button>
//         </div>
//     `;
    
//     postsContainer.appendChild(postElement);
// }

// // Create a new post
// postSubmitBtn.addEventListener('click', () => {
//     const content = postTextInput.value.trim();
    
//     if (!content) {
//         alert('Please write something to post!');
//         return;
//     }
    
//     const postData = {
//         content: content,
//         userId: currentUser.uid,
//         userName: userNameElement.textContent,
//         timestamp: firebase.firestore.FieldValue.serverTimestamp(),
//         likes: 0,
//         comments: 0,
//         shares: 0
//     };
    
//     db.collection('posts').add(postData)
//         .then(() => {
//             postTextInput.value = '';
//             loadPosts();
            
//             // Award points for community engagement
//             awardPoints(5, "Community engagement");
//         })
//         .catch(error => {
//             console.error('Error creating post:', error);
//             alert('Error creating post. Please try again.');
//         });
// });

// // Load and display leaderboard
// function loadLeaderboard() {
//     leaderboardContainer.innerHTML = '<div class="loading">Loading leaderboard...</div>';
    
//     const timeRange = document.getElementById('leaderboard-time').value;
    
//     // In a real app, you would filter by time range
//     db.collection('users')
//         .orderBy('points', 'desc')
//         .limit(10)
//         .get()
//         .then(snapshot => {
//             leaderboardContainer.innerHTML = '';
            
//             if (snapshot.empty) {
//                 leaderboardContainer.innerHTML = '<div class="no-data">No leaderboard data available.</div>';
//                 return;
//             }
            
//             let rank = 1;
//             snapshot.forEach(doc => {
//                 const user = doc.data();
//                 displayLeaderboardUser(rank, user);
//                 rank++;
//             });
//         })
//         .catch(error => {
//             console.error('Error loading leaderboard:', error);
//             leaderboardContainer.innerHTML = '<div class="error">Error loading leaderboard. Please try again.</div>';
//         });
// }

// // Display a user on the leaderboard
// function displayLeaderboardUser(rank, user) {
//     const userElement = document.createElement('div');
//     userElement.className = 'leaderboard-item';
    
//     userElement.innerHTML = `
//         <div class="leaderboard-rank">${rank}</div>
//         <div class="leaderboard-user">
//             <div class="leaderboard-user-img">
//                 <i class="fas fa-user"></i>
//             </div>
//             <div class="leaderboard-user-info">
//                 <h3>${user.name || 'Eco Learner'}</h3>
//                 <p>Level ${user.level || 1}</p>
//             </div>
//         </div>
//         <div class="leaderboard-points">${user.points || 0} pts</div>
//     `;
    
//     leaderboardContainer.appendChild(userElement);
// }

// // Load discussions (placeholder - would be implemented similarly to posts)
// function loadDiscussions() {
//     console.log('Loading discussions...');
//     // Implementation would be similar to loadPosts()
// }

// // Load events (placeholder - would be implemented similarly to posts)
// function loadEvents() {
//     console.log('Loading events...');
//     // Implementation would be similar to loadPosts()
// }

// // Helper function to get time ago string
// function getTimeAgo(date) {
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - date) / 1000);
    
//     if (diffInSeconds < 60) {
//         return 'just now';
//     } else if (diffInSeconds < 3600) {
//         const minutes = Math.floor(diffInSeconds / 60);
//         return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
//     } else if (diffInSeconds < 86400) {
//         const hours = Math.floor(diffInSeconds / 3600);
//         return `${hours} hour${hours > 1 ? 's' : ''} ago`;
//     } else if (diffInSeconds < 604800) {
//         const days = Math.floor(diffInSeconds / 86400);
//         return `${days} day${days > 1 ? 's' : ''} ago`;
//     } else {
//         return date.toLocaleDateString();
//     }
// }

// // Award points to user
// function awardPoints(points, reason) {
//     const userRef = db.collection('users').doc(currentUser.uid);
    
//     db.runTransaction(transaction => {
//         return transaction.get(userRef).then(doc => {
//             if (!doc.exists) {
//                 throw new Error('Document does not exist!');
//             }
            
//             const newPoints = (doc.data().points || 0) + points;
//             transaction.update(userRef, { points: newPoints });
            
//             // Add to activity log
//             const activityRef = db.collection('activities').doc();
//             transaction.set(activityRef, {
//                 userId: currentUser.uid,
//                 type: 'points_earned',
//                 points: points,
//                 reason: reason,
//                 timestamp: firebase.firestore.FieldValue.serverTimestamp()
//             });
            
//             return newPoints;
//         });
//     }).then(newPoints => {
//         userPointsElement.textContent = newPoints;
//         navPointsElement.textContent = newPoints;
//     }).catch(error => {
//         console.error('Error awarding points:', error);
//     });
// }

// // Logout functionality
// logoutBtn.addEventListener('click', () => {
//     auth.signOut().then(() => {
//         window.location.href = 'index.html';
//     }).catch(error => {
//         console.error('Error signing out:', error);
//     });
// });

// // Initialize time filter for leaderboard
// document.getElementById('leaderboard-time').addEventListener('change', loadLeaderboard);