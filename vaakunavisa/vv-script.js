let currentMunicipality;
let score = 0;
let attempts = 0;
let municipalitiesLoaded = false;

// DOM elements
const coatOfArms = document.getElementById('coatOfArms');
const guessInput = document.getElementById('guess');
const submitBtn = document.getElementById('submitGuess');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const attemptsDisplay = document.getElementById('attempts');
const newGameBtn = document.getElementById('newGame');
const correctMunicipalityDisplay = document.getElementById('correctMunicipality');

// Initialize game
function initGame() {
    if (!municipalitiesLoaded) {
        feedback.textContent = 'Ladataan kuntakohtia...';
        return;
    }
    
    score = 0;
    attempts = 0;
    scoreDisplay.textContent = score;
    attemptsDisplay.textContent = attempts;
    newGameBtn.classList.add('hidden');
    showNewMunicipality();
}

// Show a new random municipality
function showNewMunicipality() {
    if (!municipalitiesLoaded) {
        feedback.textContent = 'Odotetaan kuntakohtien lataamista...';
        return;
    }
    
    currentMunicipality = municipalities[Math.floor(Math.random() * municipalities.length)];
    coatOfArms.src = currentMunicipality.coatOfArms;
    coatOfArms.alt = currentMunicipality.name;
    
    // Show province info
    feedback.textContent = `Kunta on ${currentMunicipality.province} maakunnassa`;
    
    guessInput.value = '';
    correctMunicipalityDisplay.textContent = '';
    guessInput.focus();
}

// Check guess
function checkGuess() {
    const guess = guessInput.value.trim().toLowerCase();
    const correctAnswer = currentMunicipality.name.toLowerCase();
    attempts++;
    attemptsDisplay.textContent = attempts;

    if (guess === correctAnswer) {
        score++;
        scoreDisplay.textContent = score;
        feedback.textContent = `Oikein! ${currentMunicipality.name} on ${currentMunicipality.province} maakunnassa.`;
        feedback.classList.add('correct');
        feedback.classList.remove('incorrect');
        correctMunicipalityDisplay.textContent = currentMunicipality.name;
        setTimeout(showNewMunicipality, 1500);
    } else {
        feedback.textContent = `Väärin! Yritä uudelleen. Kunta on ${currentMunicipality.province} maakunnassa.`;
        feedback.classList.add('incorrect');
        feedback.classList.remove('correct');
    }
}

// Event listeners
submitBtn.addEventListener('click', checkGuess);
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkGuess();
    }
});
newGameBtn.addEventListener('click', initGame);
startGameBtn.addEventListener('click', initGame);

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        initGame();
    }
});

// Wait for municipalities to be loaded before initializing the game
window.addEventListener('load', () => {
    if (municipalities && municipalities.length > 0) {
        municipalitiesLoaded = true;
        // Show the start modal instead of starting the game immediately
        toggleModal();
    }
});