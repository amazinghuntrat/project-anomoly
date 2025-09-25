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
    lastUpdate: Date.now(),
    cellIdCounter: 0
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

// Cell Functions
function buyNewCell() {
    const cellCost = 5000; // We can make this dynamic later
    
    // 1. Check if the player can afford it
    if (GameState.resources.budget >= cellCost) {
        // 2. Deduct the cost
        GameState.resources.budget -= cellCost;

        // 3. Create a new cell instance and add it to our game state
        const newId = GameState.cellIdCounter++;
        const newCell = new Cell(newId);
        GameState.cells.push(newCell);

        // 4. Create the visual element for the cell on the screen
        renderNewCell(newCell);

        console.log(`Built Cell #${newId}. Remaining Budget: ${GameState.resources.budget}`);
    } else {
        console.log("Not enough budget to build a new cell.");
        // We can add a visual notification for the player here later
    }
}

function renderNewCell(cell) {
    const facilityView = document.getElementById('facility-view');
    const cellElement = document.createElement('div');
    cellElement.classList.add('containment-cell');
    cellElement.dataset.cellId = cell.id; // Link the element to our object's ID
    cellElement.textContent = `Cell #${cell.id}`;

    // Store the element reference in our object
    cell.element = cellElement;

    facilityView.appendChild(cellElement);
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
    
    const buildCellButton = document.getElementById('build-cell-btn');
    buildCellButton.addEventListener('click', buyNewCell); 
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Wait for the DOM to be fully loaded before starting the game
window.addEventListener('DOMContentLoaded', init);