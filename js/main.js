// This is the main entry point for our game's logic.

// A global object to hold the game's state
const GameState = {
    resources: {
        redTape: 0,
        budget: 10000,
        sanity: 100,
        ectoplasm: 0
    },
    anomalies: [],
    cells: [],
    staff: [],
    lastUpdate: Date.now()
};

// The main game loop function
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - GameState.lastUpdate) / 1000; // Time since last frame in seconds

    update(deltaTime);
    render();

    GameState.lastUpdate = now;
    requestAnimationFrame(gameLoop); // This keeps the loop going
}

// Update game logic
function update(deltaTime) {
    // This is where we'll calculate resource generation, check for events, etc.
    // For now, let's just increment red tape as a test.
    GameState.resources.redTape += 1 * deltaTime; // Generate 1 Red Tape per second
}

// Render game state to the screen
function render() {
    // This is where we'll update the HTML to show the current game state.
    // For now, let's just display the red tape.
    const resourceBar = document.getElementById('resource-bar');
    if (resourceBar) {
        resourceBar.textContent = `Red Tape: ${Math.floor(GameState.resources.redTape)}`;
    }
}

// Initialization function that runs when the page loads
function init() {
    console.log("Initializing Department of Otherworldly Affairs...");
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Wait for the DOM to be fully loaded before starting the game
window.addEventListener('DOMContentLoaded', init);