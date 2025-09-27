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
    cellIdCounter: 0,
    selectedCellID: null
};

const ANOMALY_DATABASE = {
    'AM-001': {
        id: 'AM-001',
        name: 'The Giggling Marionette',
        form: 'Object',
        description: 'A small, porcelain puppet that emits a faint, childlike giggle when not directly observed. Causes feelings of unease and paranoia in nearby staff.',
        protocol: ['Soundproofed Walls', 'Remote Viewing Only', 'Constant Illumination']
    }
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

// Anomaly Functions
function containAnomaly() {
    const selectedId = GameState.selectedCellId;
    if (selectedId === null) {
        console.warn("No cell selected to contain the anomaly.");
        return; // Exit if no cell is selected
    }

    const cell = GameState.cells.find(c => c.id === selectedId);

    if (cell.isOccupied()) {
        console.warn(`Cell #${cell.id} is already occupied.`);
        return; // Exit if cell is full
    }
    
    // Create our first anomaly from the database
    const anomalyData = ANOMALY_DATABASE['AM-001'];
    const newAnomaly = new Anomaly(anomalyData);

    // Use our new cell method to contain it
    if (cell.contain(newAnomaly)) {
        // Update visuals
        renderCellState(cell);
        renderSelectionPanel();
    }
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

    cellElement.addEventListener('click', handleCellSelection);

    facilityView.appendChild(cellElement);
}

// Anomaly Cell Check
function renderCellState(cell) {
    if (cell.isOccupied()) {
        cell.element.classList.add('occupied');
        cell.element.textContent = cell.anomaly.id; // Show the anomaly ID
    } else {
        cell.element.classList.remove('occupied');
        cell.element.textContent = `Cell #${cell.id}`;
    }
}

function handleCellSelection(event) {
    const clickedCellId = parseInt(event.currentTarget.dataset.cellId);
    
    // Update the game state with the new selection
    GameState.selectedCellId = clickedCellId;

    console.log(`Selected Cell #${GameState.selectedCellId}`);

    // Update the UI to show the new selection
    renderSelectionPanel();
    updateSelectedCellVisuals();
}

function renderSelectionPanel() {
    const contentDiv = document.getElementById('selection-content');
    const selectedId = GameState.selectedCellId;

    // If a cell is selected...
    if (selectedId !== null) {
        const cell = GameState.cells.find(c => c.id === selectedId);
        
        if (cell) {
            let occupantInfo = '';
            if (cell.isOccupied()) {
                const anomaly = cell.anomaly;
                occupantInfo = `
                    <hr>
                    <h4>Occupant: ${anomaly.name} (${anomaly.id})</h4>
                    <p><strong>Form:</strong> ${anomaly.form}</p>
                    <p><strong>Description:</strong> ${anomaly.description}</p>
                    <p><strong>Containment Protocol:</strong></p>
                    ${anomaly.getProtocolForDisplay()}
                `;
            }

            let html = `
                <h4>Cell #${cell.id}</h4>
                <p>Status: <span style="color: ${cell.isOccupied() ? 'orange' : 'green'};">${cell.isOccupied() ? 'Occupied' : 'Nominal'}</span></p>
                <p>Modules: None</p>
                ${occupantInfo}
            `;
            contentDiv.innerHTML = html;
        }
    } else {
        contentDiv.innerHTML = '<p>Select an object in the facility...</p>';
    }
}

function updateSelectedCellVisuals() {
    // Loop through all cell objects
    for (const cell of GameState.cells) {
        if (cell.id === GameState.selectedCellId) {
            // Add 'selected' class to the correct element
            cell.element.classList.add('selected');
        } else {
            // Remove 'selected' class from all other elements
            cell.element.classList.remove('selected');
        }
    }
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
        resourceBar.textContent = `Red Tape: ${Math.floor(GameState.resources.redTape)} ---- Budget: $${Math.floor(GameState.resources.budget)}  ---- Sanity: ${Math.floor(GameState.resources.sanity)} ---- Ectoplasm: ${Math.floor(GameState.resources.ectoplasm)}`;
    }
}

// Initialization function that runs when the page loads
function init() {
    console.log("Initializing Department of Otherworldly Affairs...");

    const buildCellButton = document.getElementById('build-cell-btn');
    buildCellButton.addEventListener('click', buyNewCell); 

    const containAnomalyButton = document.getElementById('contain-anomaly-btn');
    containAnomalyButton.addEventListener('click', containAnomaly);

    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Wait for the DOM to be fully loaded before starting the game
window.addEventListener('DOMContentLoaded', init);