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
        } else {
            console.error("Failed to fetch user data:", userData.error);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
    
    // Initialize games functionality
    initializeGamesFunctionality(user.uid);
});

// Initialize games functionality
function initializeGamesFunctionality(userId) {
    // Game filtering functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card');
    const searchInput = document.getElementById('gameSearch');
    
    // Filter games by category
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filter game cards
            gameCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        gameCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // Game launcher functionality
    const playButtons = document.querySelectorAll('.play-btn');
    const gameLauncherModal = document.getElementById('gameLauncherModal');
    const gameModalTitle = document.getElementById('gameModalTitle');
    const gameModalDescription = document.getElementById('gameModalDescription');
    const gameProgress = document.getElementById('gameProgress');
    const progressText = document.getElementById('progressText');
    const startGameBtn = document.getElementById('startGame');
    const cancelLaunchBtn = document.getElementById('cancelLaunch');
    
    let currentGame = null;
    let progressInterval = null;
    
    // Game data
    const games = {
        recycling: {
            title: 'Advanced Recycling Challenge',
            description: 'Test your knowledge of advanced recycling techniques',
            points: 50,
            loadingTime: 3000, // 3 seconds
            url: 'recycling-game.html'
        },
        carbon: {
            title: 'Carbon Footprint Quiz',
            description: 'Calculate and understand your environmental impact',
            points: 30,
            loadingTime: 2500, // 2.5 seconds
            url: 'carbon-quiz.html'
        },
        puzzle: {
            title: 'Ecosystem Puzzle',
            description: 'Assemble ecosystems and learn about nature balance',
            points: 75,
            loadingTime: 4000, // 4 seconds
            url: 'ecosystem-puzzle.html'
        },
        water: {
            title: 'Water Conservation Challenge',
            description: '7-day challenge to reduce your water usage',
            points: 100,
            loadingTime: 5000, // 5 seconds
            url: 'water-challenge.html'
        },
        energy: {
            title: 'Renewable Energy Simulator',
            description: 'Design and optimize renewable energy systems',
            points: 120,
            loadingTime: 6000, // 6 seconds
            url: 'energy-simulator.html'
        },
        biodiversity: {
            title: 'Biodiversity Trivia',
            description: 'Test your knowledge about Earth\'s diverse species',
            points: 40,
            loadingTime: 2000, // 2 seconds
            url: 'biodiversity-trivia.html'
        }
    };
    
    // Open game launcher modal
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gameType = this.getAttribute('data-game');
            currentGame = games[gameType];
            
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
        });
    });
    
    // Start game button
    startGameBtn.addEventListener('click', function() {
        gameLauncherModal.style.display = 'none';
        
        // Redirect to game page
        window.location.href = currentGame.url;
    });
    
    // Cancel launch button
    cancelLaunchBtn.addEventListener('click', function() {
        clearInterval(progressInterval);
        gameLauncherModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === gameLauncherModal) {
            clearInterval(progressInterval);
            gameLauncherModal.style.display = 'none';
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