// Game data - scenarios with options and feedback
const scenarios = [
    {
        text: "You're about to leave your dorm for class. It's a 15-minute walk, but you're running slightly late. What do you do?",
        image: "images/scenario1.png",
        options: [
            {
                text: "Walk quickly - the exercise is good and it's zero emissions",
                points: 10,
                feedback: "Great choice! Walking produces no emissions and provides healthy exercise. You arrived feeling energized.",
                image: "images/sc1op1.png"
            },
            {
                text: "Take the campus shuttle bus - it's running anyway",
                points: 7,
                feedback: "Good option! Shared transportation reduces per-person emissions compared to individual vehicles.",
                image: "images/sc1op2.png"
            },
            {
                text: "Call a rideshare - it's faster and more convenient",
                points: 2,
                feedback: "This creates unnecessary emissions for a short distance. Consider more sustainable options next time.",
                image: "images/sc1op3.png"
            },
            {
                text: "Drive your own car - it's parked right outside",
                points: 0,
                feedback: "Driving alone for short distances has high emissions per person. This is the least sustainable choice.",
                image: "images/sc1op4.png"
            }
        ]
    },
    {
        text: "You're thirsty after class and want a drink. You stop by the campus store. What do you choose?",
        image: "images/scenario2.png",
        options: [
            {
                text: "Buy a bottled water - it's quick and convenient",
                points: 1,
                feedback: "Plastic bottles create significant waste. Over 60 million plastic bottles end up in landfills daily in the US alone.",
                image: "images/sc2op1.png"
            },
            {
                text: "Purchase a soda in an aluminum can",
                points: 4,
                feedback: "Aluminum cans are highly recyclable, but production still has environmental costs. Better than plastic, but not ideal.",
                image: "images/sc2op2.png"
            },
            {
                text: "Use the water fountain to fill your reusable bottle",
                points: 10,
                feedback: "Excellent! Using a reusable bottle significantly reduces waste and resource consumption. This is the most sustainable choice.",
                image: "images/sc2op3.png"
            },
            {
                text: "Get a coffee in a disposable cup",
                points: 2,
                feedback: "Disposable cups create waste, even if paper-based (they're often lined with plastic). Bringing your own mug would be better.",
                image: "images/sc2op4.png"
            }
        ]
    },
    {
        text: "You're studying in the library and need to print a 50-page document for your research. How do you approach this?",
        image: "images/scenario3.png",
        options: [
            {
                text: "Print single-sided to make reading and note-taking easier",
                points: 1,
                feedback: "Printing single-sided uses twice as much paper as necessary. This creates unnecessary waste and deforestation impacts.",
                image: "images/sc3op1.png"
            },
            {
                text: "Print double-sided to save paper",
                points: 7,
                feedback: "Good choice! Double-sided printing reduces paper use by nearly half, saving trees and reducing waste.",
                image: "images/sc3op2.png"
            },
            {
                text: "Read it digitally instead of printing",
                points: 10,
                feedback: "Excellent! Avoiding printing altogether saves paper, energy, and resources. Digital documents are easily searchable too.",
                image: "images/sc3op3.png"
            },
            {
                text: "Print but use the recycled paper option",
                points: 5,
                feedback: "Using recycled paper helps, but still consumes energy and resources for printing and transportation. Better than virgin paper, but digital is best.",
                image: "images/sc3op4.png"
            }
        ]
    }
];

// Game state variables
let currentScenario = 0;
let totalPoints = 0;
const maxPoints = scenarios.length * 10;
let previousPoints = 0; // Store points from the last selected option

// DOM elements
const scenarioImageElement = document.getElementById('scenario-image');
const scenarioTextElement = document.getElementById('scenario-text');
const optionsContainerElement = document.getElementById('options-container');
const feedbackContainerElement = document.getElementById('feedback-container');
const feedbackTextElement = document.getElementById('feedback-text');
const nextButton = document.getElementById('next-btn');
const pointsElement = document.getElementById('points');
const currentScenarioElement = document.getElementById('current-scenario');
const progressElement = document.getElementById('progress');
const gameEndElement = document.getElementById('game-end');
const finalScoreElement = document.getElementById('final-score');
const endMessageElement = document.getElementById('end-message');
const restartButton = document.getElementById('restart-btn');

// Initialize the game
function initGame() {
    currentScenario = 0;
    totalPoints = 0;
    previousPoints = 0;
    pointsElement.textContent = totalPoints;
    currentScenarioElement.textContent = currentScenario + 1;
    progressElement.style.width = '0%';
    loadScenario();
}

// Load the current scenario
function loadScenario() {
    const scenario = scenarios[currentScenario];
    scenarioTextElement.textContent = scenario.text;
    
    // Set scenario image with fade effect
    scenarioImageElement.style.opacity = 0;
    setTimeout(() => {
        scenarioImageElement.src = scenario.image;
        scenarioImageElement.alt = "Scenario image";
        scenarioImageElement.style.opacity = 1;
    }, 300);
    
    // Clear previous options
    optionsContainerElement.innerHTML = '';
    
    // Create new option buttons
    scenario.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        
        // Add icon based on environmental impact
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('option-icon');
        
        if (option.points >= 8) {
            iconSpan.textContent = '🌿'; // Best choice
        } else if (option.points >= 5) {
            iconSpan.textContent = '👍'; // Good choice
        } else if (option.points >= 3) {
            iconSpan.textContent = '🤔'; // Mediocre choice
        } else {
            iconSpan.textContent = '👎'; // Poor choice
        }
        
        button.appendChild(iconSpan);
        button.appendChild(document.createTextNode(option.text));
        button.addEventListener('click', () => selectOption(index));
        optionsContainerElement.appendChild(button);
    });
    
    // Hide feedback and next button
    feedbackContainerElement.style.display = 'none';
    nextButton.style.display = 'none';

    // Reset previous points for the new scenario
    previousPoints = 0; 
}

// Handle option selection
function selectOption(optionIndex) {
    const selectedOption = scenarios[currentScenario].options[optionIndex];
    
    // Subtract the previous points before adding the new ones
    totalPoints = totalPoints - previousPoints + selectedOption.points;
    previousPoints = selectedOption.points; // Update the previous points for the next click
    pointsElement.textContent = totalPoints;
    
    // Show feedback
    feedbackTextElement.textContent = selectedOption.feedback;
    feedbackContainerElement.style.display = 'block';
    
    // Change image to reflect the choice
    scenarioImageElement.style.opacity = 0;
    setTimeout(() => {
        scenarioImageElement.src = selectedOption.image;
        scenarioImageElement.alt = "Choice result image";
        scenarioImageElement.style.opacity = 1;
    }, 300);
    
    // Highlight the selected button and un-highlight others
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((button, index) => {
        if (index === optionIndex) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });

    // Show next button if not the last scenario
    if (currentScenario < scenarios.length - 1) {
        nextButton.style.display = 'block';
    } else {
        // If last scenario, show end game after a delay
        setTimeout(endGame, 2000);
    }
}

// Move to the next scenario
nextButton.addEventListener('click', () => {
    currentScenario++;
    currentScenarioElement.textContent = currentScenario + 1;
    
    // Update progress bar
    const progressPercentage = (currentScenario / scenarios.length) * 100;
    progressElement.style.width = `${progressPercentage}%`;
    
    loadScenario();
});

// End the game and show results
function endGame() {
    document.getElementById('scenario-container').style.display = 'none';
    gameEndElement.style.display = 'block';
    finalScoreElement.textContent = totalPoints;
    
    // Calculate percentage
    const percentage = (totalPoints / maxPoints) * 100;
    
    // Provide feedback based on score
    if (percentage >= 80) {
        endMessageElement.textContent = "You're an environmental champion! Your choices show great awareness and commitment to sustainability. Keep inspiring others with your eco-friendly decisions!";
    } else if (percentage >= 60) {
        endMessageElement.textContent = "You're making good environmental choices! With a bit more effort, you can become even more sustainable. Every small change makes a difference!";
    } else if (percentage >= 40) {
        endMessageElement.textContent = "You have some environmental awareness, but there's significant room for improvement in your daily choices. Try to be more mindful of your environmental impact.";
    } else {
        endMessageElement.textContent = "Your environmental impact is higher than ideal. Consider learning more about sustainable practices. Remember, small changes can lead to big differences!";
    }
    
    // Complete progress bar
    progressElement.style.width = '100%';
}

// Restart the game
restartButton.addEventListener('click', () => {
    document.getElementById('scenario-container').style.display = 'block';
    gameEndElement.style.display = 'none';
    initGame();
});

// Initialize the game when the page loads
window.addEventListener('load', initGame);