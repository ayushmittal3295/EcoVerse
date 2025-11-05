document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.getElementById('game-container');
    const player = document.getElementById('player');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const levelDisplay = document.getElementById('level-display');
    const timeDisplay = document.getElementById('time-display');
    const scoreDisplay = document.getElementById('score-display');
    const environmentFill = document.getElementById('environment-fill');
    const finalScore = document.getElementById('final-score');
    const gameOutcome = document.getElementById('game-outcome');
    const gameMessage = document.getElementById('game-message');
    
    let gameActive = false;
    let playerX = 100;
    let playerSpeed = 5;
    let score = 0;
    let lives = 3;
    let environmentHealth = 50;
    let level = 1;
    let timeLeft = 60;
    let gameTimer;
    let obstacleTimer;
    let obstacles = [];
    let plantSpots = [];
    let plants = [];
    let keys = {};
    
    // Game initialization
    function initGame() {
        gameActive = true;
        score = 0;
        lives = 3;
        environmentHealth = 50;
        level = 1;
        timeLeft = 60;
        playerX = 100;
        obstacles = [];
        plantSpots = [];
        plants = [];
        
        // Clear any existing obstacles and plants
        document.querySelectorAll('.obstacle, .plant, .plant-spot').forEach(el => el.remove());
        
        updateDisplays();
        generatePlantSpots();
        startGameTimer();
        startObstacleTimer();
        
        // Update lives display
        const livesContainer = document.getElementById('lives-container');
        livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const life = document.createElement('div');
            life.className = 'life';
            livesContainer.appendChild(life);
        }
        
        // Add bounce animation to player
        player.classList.add('bounce');
    }
    
    // Generate plant spots on the ground
    function generatePlantSpots() {
        // Clear existing plant spots
        document.querySelectorAll('.plant-spot').forEach(spot => spot.remove());
        plantSpots = [];
        
        const spotCount = 5 + level * 2;
        for (let i = 0; i < spotCount; i++) {
            const spot = document.createElement('div');
            spot.className = 'plant-spot';
            
            // Random position along the ground
            const x = Math.random() * (gameContainer.offsetWidth - 100) + 50;
            
            spot.style.left = x + 'px';
            spot.style.bottom = '100px';
            
            gameContainer.appendChild(spot);
            plantSpots.push({ element: spot, x: x, planted: false });
        }
    }
    
    // Generate environmental obstacles (falling from top)
    function generateObstacle() {
        if (!gameActive) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        // Randomly choose between different pollutants
        const types = ['no2', 'so2', 'no', 'co'];
        const type = types[Math.floor(Math.random() * types.length)];
        obstacle.classList.add(type);
        
        // Set the chemical symbol
        let symbol = '';
        switch(type) {
            case 'no2': symbol = 'NO₂'; break;
            case 'so2': symbol = 'SO₂'; break;
            case 'no': symbol = 'NO'; break;
            case 'co': symbol = 'CO'; break;
        }
        obstacle.innerHTML = symbol;
        
        // Random horizontal position
        const x = Math.random() * (gameContainer.offsetWidth - 100) + 50;
        
        obstacle.style.left = x + 'px';
        obstacle.style.top = '-70px';
        
        gameContainer.appendChild(obstacle);
        
        // Animate the obstacle falling
        const fallSpeed = 2 + level * 0.5; // Increase speed with level
        let obstacleY = -70;
        
        const fallInterval = setInterval(() => {
            if (!gameActive) {
                clearInterval(fallInterval);
                return;
            }
            
            obstacleY += fallSpeed;
            obstacle.style.top = obstacleY + 'px';
            
            // Check if obstacle reached the bottom
            if (obstacleY > gameContainer.offsetHeight - 170) {
                clearInterval(fallInterval);
                obstacle.remove();
            }
            
            // Check for collision with player
            const obstacleRect = obstacle.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            if (isColliding(obstacleRect, playerRect)) {
                clearInterval(fallInterval);
                handleCollision(obstacle);
            }
        }, 20);
        
        obstacles.push({ element: obstacle, y: obstacleY, interval: fallInterval });
    }
    
    // Start the obstacle timer
    function startObstacleTimer() {
        clearInterval(obstacleTimer);
        // Generate obstacles more frequently as level increases
        const interval = 2000 - (level * 150);
        obstacleTimer = setInterval(() => {
            generateObstacle();
        }, Math.max(500, interval)); // Don't go below 500ms
    }
    
    // Start the game timer
    function startGameTimer() {
        clearInterval(gameTimer);
        gameTimer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = `Time: ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                endGame(false);
            }
        }, 1000);
    }
    
    // Update all displays
    function updateDisplays() {
        levelDisplay.textContent = `Level: ${level}`;
        timeDisplay.textContent = `Time: ${timeLeft}s`;
        scoreDisplay.textContent = `Score: ${score}`;
        environmentFill.style.width = `${environmentHealth}%`;
        
        // Change environment color based on health
        if (environmentHealth > 70) {
            environmentFill.style.background = 'linear-gradient(to right, #4CAF50, #8BC34A)';
        } else if (environmentHealth > 30) {
            environmentFill.style.background = 'linear-gradient(to right, #CDDC39, #FFEB3B)';
        } else {
            environmentFill.style.background = 'linear-gradient(to right, #FF9800, #F44336)';
        }
    }
    
    // Handle collision with obstacle
    function handleCollision(obstacle) {
        // Remove obstacle
        obstacle.remove();
        
        // Decrease environment health and score
        environmentHealth -= 8;
        score = Math.max(0, score - 15);
        
        // Visual feedback
        player.style.transform = 'scale(1.2)';
        setTimeout(() => {
            player.style.transform = 'scale(1)';
        }, 300);
        
        if (environmentHealth <= 0) {
            lives--;
            environmentHealth = 50;
            
            // Update lives display
            const livesContainer = document.getElementById('lives-container');
            if (livesContainer.children.length > 0) {
                livesContainer.removeChild(livesContainer.lastChild);
            }
            
            if (lives <= 0) {
                endGame(false);
            }
        }
        
        updateDisplays();
    }
    
    // Check if two elements are colliding
    function isColliding(rect1, rect2) {
        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    }
    
    // Plant vegetation at current position if on a spot
    function plantVegetation() {
        let planted = false;
        
        plantSpots.forEach(spot => {
            if (spot.planted) return;
            
            const spotRect = spot.element.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            if (isColliding(spotRect, playerRect)) {
                spot.planted = true;
                spot.element.style.display = 'none';
                
                // Create plant
                const plant = document.createElement('div');
                
                // Randomly choose between tree and flower
                if (Math.random() > 0.5) {
                    plant.className = 'plant tree';
                } else {
                    plant.className = 'plant flower';
                }
                
                plant.style.left = (spot.x - 10) + 'px';
                plant.style.bottom = '100px';
                
                gameContainer.appendChild(plant);
                plants.push(plant);
                
                // Increase score and environment health
                score += 25;
                environmentHealth += 8;
                if (environmentHealth > 100) environmentHealth = 100;
                
                updateDisplays();
                planted = true;
                
                // Check if all spots are planted
                checkLevelCompletion();
            }
        });
        
        return planted;
    }
    
    // Check if all planting spots have been used
    function checkLevelCompletion() {
        const allPlanted = plantSpots.every(spot => spot.planted);
        
        if (allPlanted) {
            // Level complete!
            score += timeLeft * 5; // Bonus points for remaining time
            level++;
            
            // Increase difficulty
            timeLeft = 60 - (level * 5);
            if (timeLeft < 20) timeLeft = 20;
            
            generatePlantSpots();
            startObstacleTimer(); // Update obstacle frequency
            updateDisplays();
        }
    }
    
    // End the game
    function endGame(victory) {
        gameActive = false;
        clearInterval(gameTimer);
        clearInterval(obstacleTimer);
        
        // Stop all obstacle animations
        obstacles.forEach(obs => {
            clearInterval(obs.interval);
        });
        
        player.classList.remove('bounce');
        
        gameOverScreen.style.display = 'flex';
        finalScore.textContent = `Your score: ${score}`;
        
        if (victory) {
            gameOutcome.textContent = 'You Win!';
            gameMessage.textContent = 'You successfully restored the environment!';
        } else {
            gameOutcome.textContent = 'Game Over';
            gameMessage.textContent = 'The environment needs more help!';
        }
    }
    
    // Game loop
    function gameLoop() {
        if (!gameActive) return;
        
        // Move player based on key presses
        if (keys['ArrowLeft'] && playerX > 10) {
            playerX -= playerSpeed;
        }
        if (keys['ArrowRight'] && playerX < gameContainer.offsetWidth - 60) {
            playerX += playerSpeed;
        }
        
        // Update player position
        player.style.left = playerX + 'px';
        
        // Check for collisions with plant spots
        plantSpots.forEach(spot => {
            if (spot.planted) return;
            
            const spotRect = spot.element.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            if (isColliding(spotRect, playerRect)) {
                // Show that player can plant here
                spot.element.style.boxShadow = '0 0 15px 5px yellow';
            } else {
                spot.element.style.boxShadow = 'none';
            }
        });
        
        requestAnimationFrame(gameLoop);
    }
    
    // Event listeners
    document.addEventListener('keydown', function(e) {
        keys[e.key] = true;
        
        // Space bar to plant
        if (e.key === ' ' && gameActive) {
            if (plantVegetation()) {
                // Play planting sound (pseudo-code)
                // playSound('plant');
            }
        }
    });
    
    document.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
    
    startButton.addEventListener('click', function() {
        startScreen.style.display = 'none';
        initGame();
        gameLoop();
    });
    
    restartButton.addEventListener('click', function() {
        gameOverScreen.style.display = 'none';
        initGame();
        gameLoop();
    });
    
    // Initial setup
    player.style.left = playerX + 'px';
});