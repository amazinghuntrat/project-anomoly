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
    selectedCellId: null,
    staffIdCounter: 0,
    monthDuration: 60,
    monthTimer: 60,
    uncontainedAnomalies: ['AM-001', 'AM-002', 'AM-003', 'AM-004', 'AM-005', 'AM-006', 'AM-007', 'AM-008', 'AM-009', 'AM-010'],
};

const ANOMALY_DATABASE = {
    'AM-001': {
        id: 'AM-001',
        name: 'The Giggling Marionette',
        form: 'Object',
        dangerLevel: 'Safe',
        description: 'A small, porcelain puppet that emits a faint, childlike giggle when not directly observed. Causes feelings of unease and paranoia in nearby staff.',
        protocol: ['Soundproofed Walls', 'Remote Viewing Only', 'Constant Illumination']
    },
    'AM-002': {
        id: 'AM-002',
        name: 'The Weeping Clock',
        form: 'Object',
        dangerLevel: 'Euclid',
        description: 'A grandfather clock that perpetually drips a viscous, saltwater-like substance. Time in its vicinity appears to slow, and staff report feelings of profound, inexplicable sadness.',
        protocol: ['Humidity Regulators', 'Lead-Lined Walls']
    },
    'AM-003': {
        id: 'AM-003',
        name: 'The Static Radio',
        form: 'Object',
        dangerLevel: 'Safe',
        description: 'A vintage radio that broadcasts what sounds like conversations from alternate realities. Prolonged exposure can cause personnel to adopt false memories.',
        protocol: ['Mnemonic Dampener', 'Lead-Lined Walls', 'Faraday Cage']
    },
    'AM-004': {
        id: 'AM-004',
        name: 'The Looping Man',
        form: 'Humanoid',
        dangerLevel: 'Keter',
        description: 'A man who appears to be trapped in the last 4.7 seconds of his life, resetting with a silent scream. The temporal distortion is highly contagious.',
        protocol: ['Scranton Reality Anchor', 'Mnemonic Dampener']
    },
    'AM-005': {
        id: 'AM-005',
        name: 'The Voracious Spore',
        form: 'Biological',
        dangerLevel: 'Euclid',
        description: 'A fungal growth that rapidly consumes any organic material it touches. It communicates through a complex release of airborne spores.',
        protocol: ['Automated Sterilization System', 'Vacuum Pump', 'Cryo Unit']
    },
    'AM-006': {
        id: 'AM-006',
        name: 'The inverse flame',
        form: 'Phenomenon',
        dangerLevel: "Safe",
        description: 'A flame that burns a dark purple and emits cold instead of heat. It feeds on warmth and can cause localized frost pockets that are structurally dangerous.',
        protocol: ['Thermal Generators', 'Vacuum Pump']
    },
    'AM-007': {
        id: 'AM-007',
        name: 'The Painting of the Path',
        form: 'Object',
        dangerLevel: 'Euclid',
        description: 'A landscape painting where the path depicted slowly changes. If the path ever reaches the edge of the frame, the painted scenery manifests in the real world.',
        protocol: ['Olfactory Emitter', 'Sensory Deprivation Chamber']
    },
    'AM-008': {
        id: 'AM-008',
        name: 'The Silent Choir',
        form: 'Auditory',
        dangerLevel: 'Safe',
        description: 'An auditory phenomenon with no discernible source that sounds like a choir singing. Though it cannot be recorded, it imposes a vow of silence on all who hear it.',
        protocol: ['White Noise Generator', 'Soundproofed Walls', 'Mnemonic Dampener']
    },
    'AM-009': {
        id: 'AM-009',
        name: 'The Glitched Apparition',
        form: 'Digital/Ethereal',
        dangerLevel: 'Euclid',
        description: 'An entity that exists partially in our reality and partially as corrupted data. It causes severe technological malfunctions and visual distortions.',
        protocol: ['Faraday Cage', 'Scranton Reality Anchor']
    },
    'AM-010': {
        id: 'AM-010',
        name: 'The Bottomless Box',
        form: 'Extradimensional',
        dangerLevel: 'Euclid',
        description: 'A shoebox that appears to have no bottom. Objects dropped inside are never heard from again, but occasionally, something... else... is thrown back out.',
        protocol: ['Reinforced Walls', 'Remote Viewing Only', 'Scranton Reality Anchor']
    }
};

const MODULE_DATABASE = {
    'Soundproofed Walls': { cost: 2500, description: 'Reinforced walls with acoustic dampeners.' },
    'Remote Viewing Only': { cost: 3000, description: 'Replaces direct viewports with a secure camera feed.' },
    'Constant Illumination': { cost: 1500, description: 'Installs high-intensity, redundant lighting arrays.' },
    'Humidity Regulators': { cost: 4000, description: 'Controls the moisture level within a containment cell.' },
    'Lead-Lined Walls': { cost: 6000, description: 'Blocks psychic and temporal emanations.' },
    'Mnemonic Dampener': { cost: 7500, description: 'Emits a low-frequency psychic field, preventing the formation or influence of memories.' },
    'Faraday Cage': { cost: 5000, description: 'An enclosure of conductive mesh that blocks all electromagnetic fields, both incoming and outgoing.' },
    'Scranton Reality Anchor': { cost: 20000, description: 'A high-energy device that reinforces local reality, preventing temporal or dimensional shifts.' },
    'Automated Sterilization System': { cost: 4500, description: 'Periodically flushes the cell with a potent antimicrobial and antifungal agent.' },
    'Cryo Unit': { cost: 3500, description: 'Lowers the cell temperature to sub-zero levels to inhibit biological activity or thermal phenomena.' },
    'Thermal Generators': { cost: 3000, description: 'Actively generates heat to counteract entities that thrive in or create cold.' },
    'Olfactory Emitter': { cost: 2000, description: 'Dispenses specific, calming scents into the cell to appease sensory-based anomalies.' },
    'Sensory Deprivation Chamber': { cost: 8000, description: 'A cell with no light, no sound, and a perfectly stable atmosphere to starve perceptual entities.' },
    'White Noise Generator': { cost: 2200, description: 'Produces a constant stream of multi-frequency sound to mask or disrupt auditory phenomena.' },
    'Reinforced Walls': { cost: 4000, description: 'Thick, steel-plated walls designed to withstand significant kinetic force.' },
    'Vacuum Pump': { cost: 3800, description: 'Evacuates all atmosphere from the cell, creating a vacuum.' }
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

function endOfMonthCycle() {
    console.log("--- End of Month ---");

    // 1. Calculate and pay staff salaries
    let totalSalaries = 0;
    for (const staff of GameState.staff) {
        totalSalaries += staff.salary;
    }
    GameState.resources.budget -= totalSalaries;
    console.log(`Paid staff salaries: $${totalSalaries}`);

    // 2. Receive the monthly stipend
    const baseStipend = 10000; // This can get more complex later
    GameState.resources.budget += baseStipend;
    console.log(`Received monthly stipend: $${baseStipend}`);

    // 3. Reset the timer for the next month
    GameState.monthTimer = GameState.monthDuration;
}

// Module Functions

function buildModule(moduleName) {
    const selectedId = GameState.selectedCellId;
    if (selectedId === null) return;

    const cell = GameState.cells.find(c => c.id === selectedId);
    const moduleData = MODULE_DATABASE[moduleName];

    if (!cell || !moduleData) return;

    // 1. Check if player can afford it and if it's not already built
    if (GameState.resources.budget >= moduleData.cost && !cell.modules[moduleName]) {
        // 2. Deduct cost and add the module
        GameState.resources.budget -= moduleData.cost;
        cell.modules[moduleName] = true;

        console.log(`Installed '${moduleName}' in Cell #${cell.id}.`);

        // 3. Re-render the panel to show the change
        renderSelectionPanel();
        renderCellState(cell); // Update the cell's main visual state
    } else {
        console.log(`Cannot build module. Either already installed or not enough budget.`);
    }
}


// Researcher Functions
function hireResearcher() {
    const researcherCost = 1000;
    if (GameState.resources.budget >= researcherCost) {
        GameState.resources.budget -= researcherCost;

        const newId = GameState.staffIdCounter++;
        const newResearcher = new Staff(newId, 'Researcher');
        GameState.staff.push(newResearcher);

        console.log(`Hired Researcher #${newId}.`);
        renderStaffPool();
    } else {
        console.log("Not enough budget to hire a researcher.");
    }
}

function renderStaffPool() {
    const staffPoolDiv = document.getElementById('staff-pool');
    const availableResearchers = GameState.staff.filter(s => s.role === 'Researcher' && !s.isAssigned);

    staffPoolDiv.innerHTML = `Available Researchers: ${availableResearchers.length}`;
}

function assignResearcher() {
    const selectedId = GameState.selectedCellId;
    if (selectedId === null) return;

    const cell = GameState.cells.find(c => c.id === selectedId);
    if (!cell || !cell.isOccupied()) {
        console.log("Can only assign researchers to occupied cells.");
        return;
    }

    // Find the first available researcher
    const researcher = GameState.staff.find(s => s.role === 'Researcher' && !s.isAssigned);

    if (researcher) {
        researcher.isAssigned = true;
        cell.assignedStaff.push(researcher);

        console.log(`Assigned Researcher #${researcher.id} to Cell #${cell.id}`);

        // Update the UI
        renderStaffPool();
        renderSelectionPanel();
    } else {
        console.log("No available researchers to assign.");
    }
}

function unassignResearcher() {
    const selectedId = GameState.selectedCellId;
    if (selectedId === null) return;

    const cell = GameState.cells.find(c => c.id === selectedId);

    // Check if there's actually anyone to unassign
    if (cell && cell.assignedStaff.length > 0) {
        // Remove the last researcher from the cell's staff list
        const researcher = cell.assignedStaff.pop();

        // Set their status back to available
        researcher.isAssigned = false;

        console.log(`Unassigned Researcher #${researcher.id} from Cell #${cell.id}`);

        // Update the UI
        renderStaffPool();
        renderSelectionPanel();
    } else {
        console.log("No researchers to unassign from this cell.");
    }
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

    if (GameState.uncontainedAnomalies.length === 0) {
        console.log("No uncontained anomalies available.");
        return;
    }

    // Pull the next anomaly from the front of the line
    const anomalyIdToContain = GameState.uncontainedAnomalies.shift(); // .shift() removes and returns the first item
    const anomalyData = ANOMALY_DATABASE[anomalyIdToContain];
    const newAnomaly = new Anomaly(anomalyData);

    if (cell.contain(newAnomaly)) {
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

    // Create the main container for the cell and its bar
    const cellWrapper = document.createElement('div');
    cellWrapper.classList.add('cell-wrapper');

    // Create the cell element itself
    const cellElement = document.createElement('div');
    cellElement.classList.add('containment-cell');
    cellElement.dataset.cellId = cell.id;

    const cellText = document.createElement('span');
    cellText.textContent = `Cell #${cell.id}`;
    cellElement.appendChild(cellText);

    // Create the threat bar structure
    const threatBar = document.createElement('div');
    threatBar.classList.add('threat-bar');

    const threatFill = document.createElement('div');
    threatFill.classList.add('threat-fill');
    threatFill.id = `threat-fill-${cell.id}`; // Unique ID to target it later
    threatBar.appendChild(threatFill);

    // Assemble the parts
    cellWrapper.appendChild(cellElement);
    cellWrapper.appendChild(threatBar);

    // Store the main element reference in our object
    cell.element = cellElement; // We still reference the clickable part

    cellElement.addEventListener('click', handleCellSelection);
    facilityView.appendChild(cellWrapper);
}

function makeDiscovery(cell) {
    const anomaly = cell.anomaly;

    // Find a requirement that is NOT yet revealed
    const unrevealedReq = anomaly.protocol.requirements.find(
        req => !anomaly.protocol.revealed.includes(req)
    );

    if (unrevealedReq) {
        // Add it to the revealed list
        anomaly.protocol.revealed.push(unrevealedReq);
        console.log(`DISCOVERY in Cell #${cell.id}! New protocol revealed: ${unrevealedReq}`);

        // If the current cell is selected, refresh the panel to show the new info
        if (cell.id === GameState.selectedCellId) {
            renderSelectionPanel();
        }
    } else {
        console.log(`All protocols for ${anomaly.name} have been discovered.`);
        anomaly.researchComplete = true; // <-- ADD THIS LINE
        // Refresh the panel to show the "completed" state
        if (cell.id === GameState.selectedCellId) {
            renderSelectionPanel();
        }
    }
}

// Anomaly Cell Check
function renderCellState(cell) {
    const cellTextElement = cell.element.querySelector('span');
    cell.element.classList.remove('occupied', 'contained');

    if (cell.isOccupied()) {
        if (cell.isBreached) {
            cell.element.classList.add('breached');
            cellTextElement.textContent = "!!BREACH!!";
        }
        else if (cell.isContainmentSatisfied()) {
            cell.element.classList.add('contained');
        } else {
            cell.element.classList.add('occupied');
        }
        cellTextElement.textContent = cell.anomaly.id;
    } else {
        cellTextElement.textContent = `Cell #${cell.id}`;
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
            if (cell.isBreached) {
                occupantInfo = `
                    <hr>
                    <h4 style="color: red;">!!CONTAINMENT BREACH!!</h4>
                    <p>Anomaly: ${cell.anomaly.name}</p>
                    <p>The cell is in lockdown. All research has ceased. Immediate action is required.</p>
                    <button id="recontain-btn">Re-contain ($${5000})</button>
                `;
            } else if (cell.isOccupied()) {
                const anomaly = cell.anomaly;
                const buttonGroup = `
                    <div class="button-group">
                        <button id="assign-researcher-btn">Assign</button>
                        <button id="unassign-researcher-btn">Unassign</button>
                    </div>
                `;
                // --- PROTOCOL DISPLAY LOGIC ---
                let protocolHTML = "<ul>";
                for (const requirement of anomaly.protocol.requirements) {
                    const isRevealed = anomaly.protocol.revealed.includes(requirement) || anomaly.protocol.requirements.indexOf(requirement) === 0;

                    if (isRevealed) {
                        // Check if the module is already installed in this cell
                        if (cell.modules[requirement]) {
                            protocolHTML += `<li>- ${requirement} <span class="status-installed">[INSTALLED]</span></li>`;
                        } else {
                            // Check if the module exists in our database before creating a button
                            const moduleData = MODULE_DATABASE[requirement];
                            if (moduleData) {
                                protocolHTML += `<li>- ${requirement} <button class="build-module-btn" data-module="${requirement}">Build ($${moduleData.cost})</button></li>`;
                            } else {
                                // If we haven't defined the module yet, show a placeholder
                                protocolHTML += `<li>- ${requirement} [MODULE NOT AVAILABLE]</li>`;
                            }
                        }
                    } else {
                        protocolHTML += `<li>- [REDACTED]</li>`;
                    }
                }
                protocolHTML += "</ul>";


                let researchDisplayHTML = '';
                // Check if research is complete
                if (anomaly.researchComplete) {
                    researchDisplayHTML = '<div class="research-complete-notice">All Research Completed</div>';
                } else {
                    // If not complete, show the progress bar
                    researchDisplayHTML = `
                        <div class="research-progress-bar">
                            <div class="research-progress-fill" id="research-fill-${cell.id}"></div>
                        </div>
                    `;
                }

                occupantInfo = `
                    <hr>
                    <h4>Occupant: ${anomaly.name} (${anomaly.id})</h4>
                    <p><strong>Object Class:</strong> <span class="danger-${anomaly.dangerLevel.toLowerCase()}">${anomaly.dangerLevel}</span></p>
                    <p><strong>Assigned Researchers:</strong> ${cell.assignedStaff.length}</p>
                    ${buttonGroup}
                    <p><strong>Research Progress:</strong></p>
                    ${researchDisplayHTML} 
                    <p><strong>Description:</strong> ${anomaly.description}</p>
                    <p><strong>Containment Protocol:</strong></p>
                   
                    ${protocolHTML}
                `;



            }
            // --- STATUS DISPLAY LOGIC ---
            let statusText = '<span style="color: green;">Nominal</span>';
            let statusColor = 'green';
            if (cell.isOccupied()) {
                if (cell.isContainmentSatisfied()) {
                    statusText = 'Contained';
                    statusColor = '#27ae60'; // A secure, dark green
                } else {
                    statusText = 'Occupied';
                    statusColor = 'orange';
                }
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

// BREACH
function triggerContainmentBreach(cell) {
    // Prevent the breach from triggering multiple times
    if (cell.isBreached) return;

    console.error(`CONTAINMENT BREACH IN CELL #${cell.id}! Anomaly: ${cell.anomaly.name}`);
    cell.isBreached = true;

    // 1. Immediate Sanity Loss
    const sanityLoss = 30; // A significant hit
    GameState.resources.sanity -= sanityLoss;

    // 2. Stop all research in the cell (if any was happening)
    cell.researchProgress = 0;

    // 3. Update the cell's visuals to show the breach
    renderCellState(cell);
}

function recontainAnomaly() {
    const selectedId = GameState.selectedCellId;
    if (selectedId === null) return;
    const cell = GameState.cells.find(c => c.id === selectedId);

    const recontainCost = 5000; // Cost to dispatch the response team
    if (cell && cell.isBreached && GameState.resources.budget >= recontainCost) {
        GameState.resources.budget -= recontainCost;

        cell.isBreached = false;
        cell.threatLevel = 50; // Reset threat to a manageable, but not zero, level
        cell.element.classList.remove('breached');
        console.log(`Cell #${cell.id} has been re-contained.`);

        renderCellState(cell);
        renderSelectionPanel();
    } else {
        console.log("Could not re-contain. Check budget or if a breach has occurred.");
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

    // --- MONTHLY CYCLE TIMER ---
    GameState.monthTimer -= deltaTime;
    if (GameState.monthTimer <= 0) {
        endOfMonthCycle();
    }
    // Research Logic
    const researchSpeed = 10; // Progress points per second, per researcher

    for (const cell of GameState.cells) {

        if (cell.isOccupied()) {
            // -- Threat Calculation --
            if (!cell.isContainmentSatisfied() && !cell.isBreached) {
                let threatPerSecond = 0;
                const dangerMultipliers = { 'Safe': 0.5, 'Euclid': 1, 'Keter': 3 };
                const baseThreat = 1; // 1 point of threat per second, per unsatisfied protocol

                const unsatisfiedProtocols = cell.anomaly.protocol.requirements.filter(req => !cell.modules[req]).length;
                threatPerSecond = baseThreat * unsatisfiedProtocols * dangerMultipliers[cell.anomaly.dangerLevel];

                cell.threatLevel += threatPerSecond * deltaTime;

                if (cell.threatLevel >= 100) {
                    cell.threatLevel = 100;
                    // We'll trigger the breach event here later!
                    console.error(`CONTAINMENT BREACH IN CELL #${cell.id}!`);
                    triggerContainmentBreach(cell);
                }
            } else {
                // If containment is satisfied, threat slowly decreases
                cell.threatLevel -= 2 * deltaTime;
                if (cell.threatLevel < 0) cell.threatLevel = 0;
            }


            // Research Updates
            if (cell.isOccupied() && cell.assignedStaff.length > 0 && !cell.anomaly.researchComplete) {
                // Increase research progress
                cell.researchProgress += (researchSpeed * cell.assignedStaff.length) * deltaTime;

                // Check if we hit the discovery threshold (e.g., 100 points)
                if (cell.researchProgress >= 100) {
                    cell.researchProgress = 0; // Reset progress
                    makeDiscovery(cell);
                }
            }
        }
    }
}

// Render game state to the screen
function render() {
    // This is where we'll update the HTML to show the current game state.
    // For now, let's just display the red tape.
    document.getElementById('res-budget').textContent = `💵 Budget: $${Math.floor(GameState.resources.budget)}`;
    document.getElementById('res-tape').textContent = `📄 Red Tape: ${Math.floor(GameState.resources.redTape)}`;
    document.getElementById('res-sanity').textContent = `🧠 Sanity: ${Math.floor(GameState.resources.sanity)}`;
    document.getElementById('res-ecto').textContent = `👻 Ectoplasm: ${Math.floor(GameState.resources.ectoplasm)}`;

    // --- Progress Bar Update ---
    if (GameState.selectedCellId !== null) {
        const cell = GameState.cells.find(c => c.id === GameState.selectedCellId);
        // Find the fill element, but only if a cell is actually selected and occupied
        const fillElement = document.getElementById(`research-fill-${GameState.selectedCellId}`);
        if (cell && cell.isOccupied() && fillElement) {
            const progressPercent = (cell.researchProgress / 100) * 100;
            fillElement.style.width = `${progressPercent}%`;
        }
    }

    // --- Timer Display Update ---
    const timerDisplay = document.getElementById('month-timer-display');
    if (timerDisplay) {
        // Math.ceil ensures we get a clean countdown from 60 to 1
        const secondsLeft = Math.ceil(GameState.monthTimer);
        timerDisplay.textContent = `Time until Stipend: ${secondsLeft}s`;
    }

    // --- THREAT BAR AND PROGRESS BAR UPDATES ---
    for (const cell of GameState.cells) {
        // Update threat bar for every cell
        const threatFill = document.getElementById(`threat-fill-${cell.id}`);
        if (threatFill) {
            threatFill.style.width = `${cell.threatLevel}%`;
        }
    }
}

// Initialization function that runs when the page loads
function init() {
    console.log("Initializing Department of Otherworldly Affairs...");

    const buildCellButton = document.getElementById('build-cell-btn');
    buildCellButton.addEventListener('click', buyNewCell);

    const containAnomalyButton = document.getElementById('contain-anomaly-btn');
    containAnomalyButton.addEventListener('click', containAnomaly);

    const hireResearcherButton = document.getElementById('hire-researcher-btn');
    hireResearcherButton.addEventListener('click', hireResearcher);

    const uiPanel = document.getElementById('ui-panel');
    uiPanel.addEventListener('click', (event) => {
        if (event.target.id === 'assign-researcher-btn') {
            assignResearcher();
        } else if (event.target.id === 'unassign-researcher-btn') {
            unassignResearcher();
        }
        // ADD THIS 'ELSE IF' BLOCK
        else if (event.target.classList.contains('build-module-btn')) {
            const moduleName = event.target.dataset.module;
            buildModule(moduleName);
        } else if (event.target.id === 'recontain-btn') {
            recontainAnomaly();
        }
    });


    renderStaffPool(); // Call it once at the start to show initial state

    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Wait for the DOM to be fully loaded before starting the game
window.addEventListener('DOMContentLoaded', init);

