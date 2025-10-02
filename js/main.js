// This is the main entry point for our game's logic.



// A global object to hold the game's state
// --- GLOBAL GAME STATE ---
const GameState = {
    resources: { redTape: 0, budget: 25000, sanity: 100, ectoplasm: 0 }, // updated starting budget
    staff: [],
    lastUpdate: Date.now(),
    cellIdCounter: 0,
    selectedCellId: null,
    selectedWingId: null,
    staffIdCounter: 0,
    monthDuration: 60,
    monthTimer: 60,
    uncontainedAnomalies: ['AM-001', 'AM-002', 'AM-003', 'AM-004', 'AM-005', 'AM-006', 'AM-007', 'AM-008', 'AM-009', 'AM-010'],
    facilityStatus: 'NOMINAL',
    activeBreaches: 0,
    eventInterval: 90,
    eventTimer: 90,
    unlockedTechs: ['t1_security'],
    unlockedStaff: ['Researcher'],
    unlockedModules: ['Soundproofed Walls', 'Remote Viewing Only', 'Constant Illumination', 'Reinforced Walls'],
    wings: [{
        id: 0, type: 'Containment',
        cells: [],
        subBuildings: [],
    }],
    wingIdCounter: 1,
    animationFrameId: null
};

const Debug = {
    money: (amount) => {
        GameState.resources.budget += amount;
        console.log(`Budget is now: $${GameState.resources.budget}`);
    },
    ecto: (amount) => {
        GameState.resources.ectoplasm += amount;
        console.log(`Ectoplasm is now: ${GameState.resources.ectoplasm}`);
    },
    sanity: (value) => {
        GameState.resources.sanity = value;
        console.log(`Sanity is now: ${GameState.resources.sanity}`);
    },
    help: () => {
        console.log(`Available Commands:
Debug.money(amount)
Debug.ecto(amount)
Debug.sanity(value)`);
    }
};

const ANOMALY_DATABASE = {
    'AM-001': {
        id: 'AM-001',
        name: 'The Giggling Marionette',
        form: 'Object',
        dangerLevel: 'Safe',
        description: 'A small, porcelain puppet that emits a faint, childlike giggle when not directly observed. Causes feelings of unease and paranoia in nearby staff.',
        protocol: ['Soundproofed Walls', 'Remote Viewing Only', 'Constant Illumination'],
        behaviors: ['sanity_drain']
    },
    'AM-002': {
        id: 'AM-002',
        name: 'The Weeping Clock',
        form: 'Object',
        dangerLevel: 'Euclid',
        description: 'A grandfather clock that perpetually drips a viscous, saltwater-like substance. Time in its vicinity appears to slow, and staff report feelings of profound, inexplicable sadness.',
        protocol: ['Humidity Regulators', 'Lead-Lined Walls'],
        behaviors: ['sanity_drain']
    },
    'AM-003': {
        id: 'AM-003',
        name: 'The Static Radio',
        form: 'Object',
        dangerLevel: 'Safe',
        description: 'A vintage radio that broadcasts what sounds like conversations from alternate realities. Prolonged exposure can cause personnel to adopt false memories.',
        protocol: ['Mnemonic Dampener', 'Lead-Lined Walls', 'Faraday Cage'],
        behaviors: ['sanity_drain', 'research_hazard']
    },
    'AM-004': {
        id: 'AM-004',
        name: 'The Looping Man',
        form: 'Humanoid',
        dangerLevel: 'Keter',
        description: 'A man who appears to be trapped in the last 4.7 seconds of his life, resetting with a silent scream. The temporal distortion is highly contagious.',
        protocol: ['Scranton Reality Anchor', 'Mnemonic Dampener'],
        behaviors: ['volatile', 'sanity_drain']
    },
    'AM-005': {
        id: 'AM-005',
        name: 'The Voracious Spore',
        form: 'Biological',
        dangerLevel: 'Euclid',
        description: 'A fungal growth that rapidly consumes any organic material it touches. It communicates through a complex release of airborne spores.',
        protocol: ['Automated Sterilization System', 'Vacuum Pump', 'Cryo Unit'],
        behaviors: ['volatile']
    },
    'AM-006': {
        id: 'AM-006',
        name: 'The inverse flame',
        form: 'Phenomenon',
        dangerLevel: "Safe",
        description: 'A flame that burns a dark purple and emits cold instead of heat. It feeds on warmth and can cause localized frost pockets that are structurally dangerous.',
        protocol: ['Thermal Generators', 'Vacuum Pump'],
        behaviors: ['power_consumer']
    },
    'AM-007': {
        id: 'AM-007',
        name: 'The Painting of the Path',
        form: 'Object',
        dangerLevel: 'Euclid',
        description: 'A landscape painting where the path depicted slowly changes. If the path ever reaches the edge of the frame, the painted scenery manifests in the real world.',
        protocol: ['Olfactory Emitter', 'Sensory Deprivation Chamber'],
        behaviors: ['volatile']
    },
    'AM-008': {
        id: 'AM-008',
        name: 'The Silent Choir',
        form: 'Auditory',
        dangerLevel: 'Safe',
        description: 'An auditory phenomenon with no discernible source that sounds like a choir singing. Though it cannot be recorded, it imposes a vow of silence on all who hear it.',
        protocol: ['White Noise Generator', 'Soundproofed Walls', 'Mnemonic Dampener'],
        behaviors: ['research_hazard']
    },
    'AM-009': {
        id: 'AM-009',
        name: 'The Glitched Apparition',
        form: 'Digital/Ethereal',
        dangerLevel: 'Euclid',
        description: 'An entity that exists partially in our reality and partially as corrupted data. It causes severe technological malfunctions and visual distortions.',
        protocol: ['Faraday Cage', 'Scranton Reality Anchor'],
        behaviors: ['power_consumer', 'research_hazard']
    },
    'AM-010': {
        id: 'AM-010',
        name: 'The Bottomless Box',
        form: 'Extradimensional',
        dangerLevel: 'Euclid',
        description: 'A shoebox that appears to have no bottom. Objects dropped inside are never heard from again, but occasionally, something... else... is thrown back out.',
        protocol: ['Reinforced Walls', 'Remote Viewing Only', 'Scranton Reality Anchor'],
        behaviors: [] // This one is deceptively simple... for now.
    }
};

const BEHAVIOR_DATABASE = {
    'sanity_drain': { icon: '🧠', description: 'This anomaly passively drains facility-wide Sanity.' },
    'research_hazard': { icon: '🔬', description: 'Causes random research incidents, draining Sanity.' },
    'volatile': { icon: '💥', description: 'Generates Threat at a significantly faster rate.' },
    'power_consumer': { icon: '⚡', description: 'Increases monthly operational costs due to high energy needs.' }
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

const EVENT_DATABASE = [
    { name: "Unexpected Grant", description: "The finance department approved a surprise grant. Budget +$10,000.", effect: () => { GameState.resources.budget += 10000; } },
    {
        name: "Power Fluctuation", description: "A power surge destabilizes a random cell. Threat +25.", effect: () => {
            // CORRECTED: Find all cells from all wings first
            const allCells = GameState.wings.flatMap(wing => wing.cells);
            if (allCells.length > 0) {
                const randomCell = allCells[Math.floor(Math.random() * allCells.length)];
                randomCell.threatLevel += 25;
                showNotification("Power Surge", `An energy spike has increased threat in Cell #${randomCell.id}.`);
            }
        }
    },
    { name: "Whispers in the Walls", description: "A wave of paranoia sweeps the facility. Sanity -15.", effect: () => { GameState.resources.sanity -= 15; } },
];

const TECH_TREE_DATABASE = {
    "Personnel Management": {
        't1_bureaucracy': { name: 'Bureaucratic Efficiency', description: 'Unlocks the Clerk staff role.', cost: 20, prerequisites: [], effect: () => { GameState.unlockedStaff.push('Clerk'); } },
        't1_psych': { name: 'Advanced Psychiatry', description: 'Unlocks the Therapist staff role.', cost: 25, prerequisites: [], effect: () => { GameState.unlockedStaff.push('Therapist'); } },
        't1_security': { name: 'Site Security Protocols', description: 'Unlocks the Security Guard role.', cost: 40, prerequisites: [], effect: () => { GameState.unlockedStaff.push('Security Guard'); } },
    },
    "Containment Solutions": {
        't1_materials': { name: 'Advanced Materials', description: 'Unlocks Lead-Lined Walls for construction.', cost: 20, prerequisites: [], effect: () => { GameState.unlockedModules.push('Lead-Lined Walls'); } },
        't1_hvac': { name: 'HVAC Engineering', description: 'Unlocks Humidity Regulators and Vacuum Pumps.', cost: 25, prerequisites: [], effect: () => { GameState.unlockedModules.push('Humidity Regulators', 'Vacuum Pump'); } },
        't2_logistics': { name: 'Automated Systems', description: 'Unlocks the Automated Sterilization System.', cost: 40, prerequisites: ['t1_bureaucracy'], effect: () => { GameState.unlockedModules.push('Automated Sterilization System'); } },
        't2_cryonics': { name: 'Cryo-Containment', description: 'Unlocks the Cryo Unit and Thermal Generators.', cost: 50, prerequisites: ['t1_hvac'], effect: () => { GameState.unlockedModules.push('Cryo Unit', 'Thermal Generators'); } },
    },
    "Advanced & Esoteric Research": {
        't1_memetics': { name: 'Applied Memetics', description: 'Unlocks the Mnemonic Dampener module.', cost: 30, prerequisites: [], effect: () => { GameState.unlockedModules.push('Mnemonic Dampener'); } },
        't2_temporal': { name: 'Temporal Mechanics', description: 'Unlocks the Scranton Reality Anchor.', cost: 100, prerequisites: ['t1_memetics'], effect: () => { GameState.unlockedModules.push('Scranton Reality Anchor'); } },
        't3_em_shielding': { name: 'EM Shielding', description: 'Unlocks the Faraday Cage.', cost: 80, prerequisites: ['t2_logistics'], effect: () => { GameState.unlockedModules.push('Faraday Cage'); } },
        't3_sensory': { name: 'Sensory Synthesis', description: 'Unlocks advanced sensory modules.', cost: 75, prerequisites: ['t2_cryonics'], effect: () => { GameState.unlockedModules.push('Olfactory Emitter', 'White Noise Generator', 'Sensory Deprivation Chamber'); } },
    }
};

const WING_DATABASE = {
    'Containment': { name: 'Containment Wing', subBuildingType: null },
    'Medical': { name: 'Medical Wing', subBuildingType: 'Office', capacityPerBuilding: 2, staffType: 'Therapist' },
    'Security': { name: 'Security Wing', subBuildingType: 'Locker', capacityPerBuilding: 5, staffType: 'Security Guard' },
    'Administration': { name: 'Admin Wing', subBuildingType: 'Desk', capacityPerBuilding: 5, staffType: 'Clerk' }
};

// The main game loop function
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - GameState.lastUpdate) / 1000; // Time since last frame in seconds

    update(deltaTime);
    render();

    GameState.lastUpdate = now;
    GameState.animationFrameId = requestAnimationFrame(gameLoop); // Game loop operation
}

function endOfMonthCycle() {
    console.log("--- End of Month ---");

    // 1. Calculate and pay staff salaries
    let totalSalaries = 0;
    for (const staff of GameState.staff) {
        totalSalaries += staff.salary || 0;
    }
    GameState.resources.budget -= totalSalaries;
    console.log(`Paid staff salaries: $${totalSalaries}`);

    // 2. Receive the monthly stipend
    const baseStipend = 20000; // This can get more complex later, Adjusted for balance
    GameState.resources.budget += baseStipend;
    console.log(`Received monthly stipend: $${baseStipend}`);

    // 3. Reset the timer for the next month
    GameState.monthTimer = GameState.monthDuration;
}

// Tech Tree
function openTechTree() {
    renderTechTree(); // Refresh the content every time it's opened
    document.getElementById('tech-tree-panel').classList.remove('hidden');
}

function closeTechTree() {
    document.getElementById('tech-tree-panel').classList.add('hidden');
}

function renderTechTree() {
    const grid = document.getElementById('tech-tree-grid');
    grid.innerHTML = ''; // Clear the old content

    // Loop through each CATEGORY in the database
    for (const categoryName in TECH_TREE_DATABASE) {
        const categoryHeader = document.createElement('h3');
        categoryHeader.classList.add('tech-category-header');
        categoryHeader.textContent = categoryName;
        grid.appendChild(categoryHeader);

        const categoryTechs = TECH_TREE_DATABASE[categoryName];
        // Loop through each TECH inside the category
        for (const techId in categoryTechs) {
            const tech = categoryTechs[techId];
            const techElement = document.createElement('div');
            techElement.classList.add('tech-node');

            const isResearched = GameState.unlockedTechs.includes(techId);
            const canResearch = tech.prerequisites.every(p => GameState.unlockedTechs.includes(p));

            let buttonHTML = '';
            if (isResearched) {
                techElement.classList.add('researched');
                buttonHTML = '<p class="status-installed">[RESEARCHED]</p>';
            } else if (canResearch) {
                buttonHTML = `<button class="purchase-tech-btn" data-tech-id="${techId}">Research (${tech.cost} 👻)</button>`;
            } else {
                techElement.classList.add('locked');
                const prereqNames = tech.prerequisites.map(pId => {
                    // Find the tech name from its ID for a more readable message
                    for (const cat in TECH_TREE_DATABASE) {
                        if (TECH_TREE_DATABASE[cat][pId]) return TECH_TREE_DATABASE[cat][pId].name;
                    }
                }).join(', ');
                buttonHTML = `<p>Requires: ${prereqNames}</p>`;
            }

            techElement.innerHTML = `
                <h4>${tech.name}</h4>
                <p>${tech.description}</p>
                ${buttonHTML}
            `;
            grid.appendChild(techElement);
        }
    }
}
function findTechById(techId) {
    for (const category in TECH_TREE_DATABASE) {
        if (TECH_TREE_DATABASE[category][techId]) {
            return TECH_TREE_DATABASE[category][techId];
        }
    }
    return null;
}
function purchaseTech(techId) {
    const tech = findTechById(techId); // <-- CORRECTED: Use the new helper function
    if (!tech) {
        console.error(`Could not find tech with ID: ${techId}`);
        return;
    }

    if (GameState.resources.ectoplasm >= tech.cost) {
        GameState.resources.ectoplasm -= tech.cost;
        GameState.unlockedTechs.push(techId);
        tech.effect();

        console.log(`Researched: ${tech.name}`);
        renderTechTree();
        closeTechTree();
    } else {
        showNotification("Insufficient Ectoplasm", "Cannot research this technology yet.");
        closeTechTree();
    }
}

// Module Functions

function buildModule(moduleName) {
    const selectedId = GameState.selectedCellId;
    if (selectedId === null) return;

    const cell = findCellById(selectedId);
    const moduleData = MODULE_DATABASE[moduleName];

    if (!cell || !moduleData) return;

    // 1. Check if player can afford it and if it's not already built
    if (GameState.resources.budget >= moduleData.cost && !cell.modules[moduleName]) {
        // 2. Deduct cost and add the module
        GameState.resources.budget -= moduleData.cost;
        cell.modules[moduleName] = true;

        console.log(`Installed '${moduleName}' in Cell #${cell.id}.`);


        // --- SANITY BONUS CHECK ---
        // Check if containment is now satisfied, and if we haven't already awarded a bonus for this anomaly
        if (cell.isContainmentSatisfied() && !cell.anomaly.sanityBonusAwarded) {
            const sanityBonus = 10;
            GameState.resources.sanity += sanityBonus;
            cell.anomaly.sanityBonusAwarded = true; // Flag that bonus has been given
            showNotification("Containment Secured!", `Gained +${sanityBonus} Sanity for securing ${cell.anomaly.name}.`);
        }
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
    const staffPool = document.getElementById('staff-pool');
    const availableStaff = GameState.staff.filter(s => !s.isAssigned);
    staffPool.innerHTML = `Available Staff: ${availableStaff.length}`;
}

function assignResearcher() {
    const selectedId = GameState.selectedCellId;
    if (selectedId === null) return;

    const cell = findCellById(selectedId);
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

    const cell = findCellById(selectedId);

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

function openStaffPanel() {
    renderStaffPanel();
    document.getElementById('staff-panel').classList.remove('hidden');
}

function closeStaffPanel() {
    document.getElementById('staff-panel').classList.add('hidden');
}

function renderStaffPanel() {
    const staffList = document.getElementById('staff-list');
    staffList.innerHTML = '';
    for (const role of GameState.unlockedStaff) {
        const staffCount = GameState.staff.filter(s => s.role === role).length;
        const roleElement = document.createElement('div');
        roleElement.classList.add('staff-role');
        let capacityInfo = '';
        let hireButton = `<button class="hire-staff-btn" data-role="${role}">Hire ($1000)</button>`;

        const wingSpec = Object.values(WING_DATABASE).find(w => w.staffType === role);
        if (wingSpec) {
            const capacity = GameState.wings
                .filter(w => w.type === wingSpec.name.split(' ')[0])
                .reduce((total, wing) => total + (wing.subBuildings.length * wingSpec.capacityPerBuilding), 0);

            capacityInfo = ` | Capacity: ${staffCount}/${capacity}`;
            if (staffCount >= capacity) hireButton = `<button disabled>Requires More ${wingSpec.subBuildingType}s</button>`;
        }
        roleElement.innerHTML = `<div><h4>${role}</h4><p>Count: ${staffCount}${capacityInfo} | Salary: $200/month</p></div>${hireButton}`;
        staffList.appendChild(roleElement);
    }
}

function hireStaff(role) {
    const staffCost = 1000;
    if (GameState.resources.budget >= staffCost) {
        GameState.resources.budget -= staffCost;
        const newId = GameState.staffIdCounter++;
        const newStaffMember = new Staff(newId, role);
        GameState.staff.push(newStaffMember);
        renderStaffPanel(); // Re-render the panel to update the count
        renderStaffPool(); // Update the staff pool as well
        showNotification("Staff Hired", `Successfully hired a new ${role}.`);
        closeStaffPanel();
    } else {
        showNotification("Insufficient Funds", `Cannot afford to hire a new ${role}.`);
        closeStaffPanel();
    }
}

function assignStaffToCell(cell, role) {
    const staffMember = GameState.staff.find(s => s.role === role && !s.isAssigned);
    if (!staffMember) {
        showNotification("Assignment Failed", `No available ${role} to assign.`);
        return;
    }
    staffMember.isAssigned = true;
    staffMember.assignment = `Cell ${cell.id}`;
    cell.assignedStaff.push(staffMember);
    console.log(`Assigned ${role} #${staffMember.id} to Cell #${cell.id}`);
    renderStaffPool();
    renderSelectionPanel();
}
function unassignStaffFromCell(cell, role) {
    const staffIndex = cell.assignedStaff.findIndex(s => s.role === role);
    if (staffIndex > -1) {
        const [staffMember] = cell.assignedStaff.splice(staffIndex, 1);
        staffMember.isAssigned = false;
        staffMember.assignment = null;
        console.log(`Unassigned ${role} #${staffMember.id} from Cell #${cell.id}`);
        renderStaffPool();
        renderSelectionPanel();
    }
}
// Anomaly Functions
/* function containAnomaly() {
    const selectedId = GameState.selectedCellId;
    if (selectedId === null) {
        console.warn("No cell selected to contain the anomaly.");
        return; // Exit if no cell is selected
    }

    const cell = findCellById(selectedId);

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

} */

function containAnomaly() {
    const selectedId = GameState.selectedCellId;
    if (selectedId === null) { console.warn("No cell selected."); return; }
    const cell = findCellById(selectedId);
    if (cell.isOccupied()) { console.warn("Cell is already occupied."); return; }
    if (GameState.uncontainedAnomalies.length === 0) {
        showNotification("Acquisition Report", "No new anomalies detected.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * GameState.uncontainedAnomalies.length);
    const anomalyIdToContain = GameState.uncontainedAnomalies[randomIndex];
    GameState.uncontainedAnomalies.splice(randomIndex, 1);

    const anomalyData = ANOMALY_DATABASE[anomalyIdToContain];
    const newAnomaly = new Anomaly(anomalyData);

    if (cell.contain(newAnomaly)) {
        renderCellState(cell);
        renderSelectionPanel();
    }
}

// Cell Functions
function findCellById(cellId) {
    for (const wing of GameState.wings) {
        const foundCell = wing.cells.find(c => c.id === cellId);
        if (foundCell) {
            return foundCell;
        }
    }
    return null; // Return null if not found in any wing
}

function buyNewCell() {
    const wing = GameState.wings.find(w => w.id === GameState.selectedWingId);
    if (!wing || wing.type !== 'Containment') {
        showNotification("Construction Blocked", "Select a Containment Wing to build a new cell.");
        return;
    }
    const cellCost = 5000;
    if (GameState.resources.budget >= cellCost) {
        GameState.resources.budget -= cellCost;
        const newCell = new Cell(GameState.cellIdCounter++);
        wing.cells.push(newCell);
        renderNewCell(newCell, wing);
    } else {
        showNotification("Insufficient Funds", "Cannot afford a new cell.");
    }
}
function renderNewCell(cell, wing) {
    const facilityView = document.getElementById('facility-view');
    const wingCellsContainer = document.querySelector(`#wing-${wing.id} .wing-cells`);

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
    //facilityView.appendChild(cellWrapper); // old wrapper
    wingCellsContainer.appendChild(cellWrapper);
}

// --- Build Menu Functions ---
function openBuildMenu() {
    renderBuildMenu(); // FIX: This line was missing. It draws the buttons.
    document.getElementById('build-menu-panel').classList.remove('hidden');
}

function closeBuildMenu() {
    document.getElementById('build-menu-panel').classList.add('hidden');
}

function renderBuildMenu() {
    const buildList = document.getElementById('build-menu-list');
    buildList.innerHTML = ''; // Clear old content

    for (const type in WING_DATABASE) {
        const wingData = WING_DATABASE[type];
        const wingElement = document.createElement('div');
        wingElement.classList.add('staff-role'); // Reuse staff-role style

        wingElement.innerHTML = `
            <div>
                <h4>${wingData.name}</h4>
                <p>Constructs a new, specialized facility wing.</p>
            </div>
            <button class="build-wing-btn" data-type="${type}">Build ($20000)</button>
        `;
        buildList.appendChild(wingElement);
    }
}

// Wing Functions
function buildWing(wingType) {
    const wingCost = 20000;
    const wingData = WING_DATABASE[wingType];
    if (GameState.resources.budget >= wingCost) {
        GameState.resources.budget -= wingCost;
        const newWing = {
            id: GameState.wingIdCounter++,
            type: wingType,
            cells: [],
            subBuildings: [],
            staff: []
        };
        GameState.wings.push(newWing);
        renderWing(newWing);
        closeBuildMenu();
    } else {
        showNotification("Insufficient Funds", "Cannot afford to build a new wing.");
        closeBuildMenu()
    }
}

function renderWing(wing) {
    const facilityView = document.getElementById('facility-view');
    const wingData = WING_DATABASE[wing.type];
    let wingElement = document.getElementById(`wing-${wing.id}`);
    if (!wingElement) {
        wingElement = document.createElement('div');
        wingElement.classList.add('facility-wing');
        wingElement.id = `wing-${wing.id}`;
        facilityView.appendChild(wingElement);
    }

    let controlsHTML = '';
    if (wing.type === 'Containment' && wing.id !== 0) {
        controlsHTML += `<button class="specialize-wing-btn" data-wing-id="${wing.id}" data-type="Medical">Specialize: Medical</button>`;
        controlsHTML += `<button class="specialize-wing-btn" data-wing-id="${wing.id}" data-type="Security">Specialize: Security</button>`;
        controlsHTML += `<button class="specialize-wing-btn" data-wing-id="${wing.id}" data-type="Administration">Specialize: Admin</button>`;
    }

    wingElement.innerHTML = `
        <div class="wing-header" data-wing-id="${wing.id}">
            <h3>${wingData.name} #${wing.id}</h3>
            <div class="wing-controls">${controlsHTML}</div>
        </div>
        <div class="wing-cells"></div>`;

    // Re-render any existing cells and sub-buildings
    wing.cells.forEach(c => renderNewCell(c, wing));
    wing.subBuildings.forEach(sb => renderSubBuilding(wing, sb.type));
}


function specializeWing(wingId, newType) {
    const wing = GameState.wings.find(w => w.id === wingId);
    const specializationCost = 20000;

    if (wing && GameState.resources.budget >= specializationCost) {
        GameState.resources.budget -= specializationCost;
        wing.type = newType;
        showNotification("Wing Specialized", `Wing #${wing.id} is now a ${WING_DATABASE[newType].name}.`);

        // Re-render the entire facility to update headers and controls
        document.getElementById('facility-view').innerHTML = '';
        GameState.wings.forEach(w => {
            renderWing(w);
            w.cells.forEach(c => renderNewCell(c, w));
        });
    }
}

function buildSubBuilding() {
    const wing = GameState.wings.find(w => w.id === GameState.selectedWingId);
    const wingData = WING_DATABASE[wing.type];
    const cost = 2500;
    if (wing && GameState.resources.budget >= cost) {
        GameState.resources.budget -= cost;
        wing.subBuildings.push({ type: wingData.subBuildingType });
        renderSubBuilding(wing, wingData.subBuildingType);
        renderStaffPanel(); // Update capacity display
    }
}

function renderSubBuilding(wing, type) {
    const container = document.querySelector(`#wing-${wing.id} .wing-cells`);
    const subBuildingEl = document.createElement('div');
    subBuildingEl.classList.add('sub-building', type.toLowerCase());
    subBuildingEl.textContent = type.charAt(0);
    container.appendChild(subBuildingEl);
}
function assignSecurityToWing(wingId) {
    const wing = GameState.wings.find(w => w.id === wingId);
    const guard = GameState.staff.find(s => s.role === 'Security Guard' && !s.isAssigned);

    if (wing && guard) {
        guard.isAssigned = true;
        guard.assignment = `Wing ${wingId}`; // Note where they are assigned
        wing.staff.push(guard);
        console.log(`Assigned Guard #${guard.id} to Wing #${wingId}`);
        renderStaffPool(); // Update the main pool counts
    } else {
        showNotification("Assignment Failed", "No available Security Guards to assign.");
    }
}

// Anomaly / Selection Cell Check
function renderCellState(cell) {
    const cellTextElement = cell.element.querySelector('span');
    cell.element.classList.remove('occupied', 'contained', 'breached');

    if (cell.isOccupied()) {
        const anomaly = cell.anomaly;
        let iconsHTML = '<div class="cell-behavior-icons">';
        if (anomaly.behaviors) {
            for (const behaviorId of anomaly.behaviors) {
                const behavior = BEHAVIOR_DATABASE[behaviorId];
                if (behavior) {
                    iconsHTML += `<span title="${behavior.description}">${behavior.icon}</span>`;
                }
            }
        }
        iconsHTML += '</div>';

        // Use innerHTML to render the icons
        cellTextElement.innerHTML = `${anomaly.id}${iconsHTML}`;

        if (cell.isBreached) {
            cell.element.classList.add('breached');
            cellTextElement.innerHTML = `!!BREACH!!${iconsHTML}`; // Still show icons on breach
        } else if (cell.isContainmentSatisfied()) {
            cell.element.classList.add('contained');
        } else {
            cell.element.classList.add('occupied');
        }
    } else {
        cellTextElement.textContent = `Cell #${cell.id}`;
    }
}

function handleWingSelection(wingId) {
    GameState.selectedWingId = wingId;
    GameState.selectedCellId = null; // Deselect any cell
    console.log(`Selected Wing #${wingId}`);
    renderSelectionPanel();
    updateSelectedVisuals();
}

function handleCellSelection(cellId) { // It correctly takes an ID now
    GameState.selectedCellId = cellId;
    GameState.selectedWingId = null; // Deselect any wing
    console.log(`Selected Cell #${cellId}`);

    renderSelectionPanel();
    updateSelectedVisuals();
}

function renderSelectionPanel() {
    const contentDiv = document.getElementById('selection-content');

    // --- Check for a selected WING first ---
    if (GameState.selectedWingId !== null) {
        const wing = GameState.wings.find(w => w.id === GameState.selectedWingId);
        if (!wing) return;

        const wingData = WING_DATABASE[wing.type];
        let buildButtonHTML = '';

        if (wing.type === 'Containment') {
            buildButtonHTML = '<button id="build-cell-btn">Build Containment Cell ($5000)</button>';
        } else if (wingData.subBuildingType) {
            buildButtonHTML = `<button id="build-sub-btn">Build ${wingData.subBuildingType} ($2500)</button>`;
        }

        contentDiv.innerHTML = `
            <h4>${wingData.name} #${wing.id}</h4>
            <p>Contains: ${wing.cells.length} cells, ${wing.subBuildings.length} facilities.</p>
            <div class="panel-section">
                ${buildButtonHTML}
            </div>`;
        return; // Exit function after rendering wing panel
    }

    // --- If no wing is selected, check for a CELL ---
    if (GameState.selectedCellId !== null) {
        const cell = findCellById(GameState.selectedCellId);
        if (!cell) return;

        let html = `<h4>Cell #${cell.id}</h4>`;

        if (cell.isBreached) {
            html += `
                <p>Status: <span style="color: red; font-weight: bold;">BREACH</span></p>
                <hr>
                <h4 style="color: red;">!!CONTAINMENT BREACH!!</h4>
                <p>Anomaly: ${cell.anomaly.name}</p>
                <p>The cell is in lockdown. Immediate action is required.</p>
                <button id="recontain-btn">Re-contain ($${5000})</button>
            `;
        } else if (cell.isOccupied()) {
            const anomaly = cell.anomaly;
            const statusText = cell.isContainmentSatisfied() ? 'Contained' : 'Occupied';
            const statusColor = cell.isContainmentSatisfied() ? '#27ae60' : 'orange';

            html += `
                <p>Status: <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
                <p><strong>Object Class:</strong> <span class="danger-${anomaly.dangerLevel.toLowerCase()}">${anomaly.dangerLevel}</span></p>
                <p><strong>Description:</strong> ${anomaly.description}</p>
            `;

            if (anomaly.behaviors && anomaly.behaviors.length > 0) {
                html += `<div class="panel-section"><h4>Triage - Active Effects</h4><ul class="behavior-list">`;
                for (const behaviorId of anomaly.behaviors) {
                    const behavior = BEHAVIOR_DATABASE[behaviorId];
                    if (behavior) {
                        html += `<li class="behavior-item" title="${behavior.description}">${behavior.icon} ${behaviorId.replace('_', ' ')}</li>`;
                    }
                }
                html += `</ul></div>`;
            }

            let staffHTML = '<div class="panel-section"><h4>Staff Assignment</h4>';
            const researchersInCell = cell.assignedStaff.filter(s => s.role === 'Researcher').length;
            const guardsInCell = cell.assignedStaff.filter(s => s.role === 'Security Guard').length;
            staffHTML += `<div class="staff-assignment"><span>Researchers: ${researchersInCell}</span><div class="button-group"><button id="assign-researcher-btn">Assign</button><button id="unassign-researcher-btn">Unassign</button></div></div>`;
            if (GameState.unlockedStaff.includes('Security Guard')) {
                staffHTML += `<div class="staff-assignment"><span>Security Guards: ${guardsInCell}</span><div class="button-group"><button id="assign-security-btn">Assign</button><button id="unassign-security-btn">Unassign</button></div></div>`;
            }
            staffHTML += '</div>';
            html += staffHTML;

            let researchDisplayHTML = '';
            if (anomaly.researchComplete) {
                researchDisplayHTML = '<div class="research-complete-notice">All Research Completed</div>';
            } else {
                researchDisplayHTML = `<p><strong>Research Progress:</strong></p><div class="research-progress-bar"><div class="research-progress-fill" id="research-fill-${cell.id}"></div></div>`;
            }
            let modulesHTML = "<h4>Containment Modules</h4><ul class='module-list'>";
            for (const requirement of anomaly.protocol.requirements) {
                const isRevealed = anomaly.protocol.revealed.includes(requirement) || anomaly.protocol.requirements.indexOf(requirement) === 0;
                if (isRevealed) {
                    const moduleData = MODULE_DATABASE[requirement];
                    if (cell.modules[requirement]) {
                        modulesHTML += `<li class="module-item installed">✓ ${requirement} [INSTALLED]</li>`;
                    } else if (GameState.unlockedModules.includes(requirement)) {
                        modulesHTML += `<li class="module-item"><button class="build-module-btn" data-module="${requirement}">${requirement} ($${moduleData.cost})</button></li>`;
                    } else {
                        modulesHTML += `<li class="module-item locked">-- ${requirement} <button disabled>[Requires R&D]</button></li>`;
                    }
                } else {
                    modulesHTML += `<li class="module-item locked">-- [REDACTED] --</li>`;
                }
            }
            modulesHTML += "</ul>";
            html += `<div class="panel-section">${researchDisplayHTML}${modulesHTML}</div>`;
        } else {
            html += `<p>Status: <span style="color: green; font-weight: bold;">Nominal</span></p><p>This cell is empty and ready for a new occupant.</p>`;
        }
        contentDiv.innerHTML = html;
        return; // Exit function after rendering cell panel
    }

    // --- If nothing is selected ---
    contentDiv.innerHTML = '<p>Select a Wing or Cell...</p>';
}

// BREACH
function triggerContainmentBreach(cell) {
    // Prevent the breach from triggering multiple times
    if (cell.isBreached) return;
    GameState.activeBreaches++;
    updateFacilityStatus();

    console.error(`CONTAINMENT BREACH IN CELL #${cell.id}! Anomaly: ${cell.anomaly.name}`);
    cell.isBreached = true;

    // 1. Immediate Sanity Loss
    const sanityLoss = 10; // Updated for balance!
    GameState.resources.sanity -= sanityLoss;

    // 2. Stop all research in the cell (if any was happening)
    cell.researchProgress = 0;

    // 3. Update the cell's visuals to show the breach
    renderCellState(cell);

}

function recontainAnomaly() {
    const selectedId = GameState.selectedCellId;
    if (selectedId === null) return;
    const cell = findCellById(selectedId);

    const recontainCost = 5000; // Cost to dispatch the response team
    if (cell && cell.isBreached && GameState.resources.budget >= recontainCost) {
        GameState.resources.budget -= recontainCost;

        cell.isBreached = false;
        cell.threatLevel = 50; // Reset threat to a manageable, but not zero, level
        cell.element.classList.remove('breached');
        console.log(`Cell #${cell.id} has been re-contained.`);
        GameState.activeBreaches--; // DECREMENT
        updateFacilityStatus(); // Update the global status
        renderCellState(cell);
        renderSelectionPanel();
    } else {
        console.log("Could not re-contain. Check budget or if a breach has occurred.");
    }
}

function checkGameOver() {
    let gameOverMessage = null;
    if (GameState.resources.sanity <= -10) {
        gameOverMessage = "Catastrophic psychological collapse. The facility has been overrun by hysteria. Your tenure as Director is over.";
    }
    if (GameState.resources.budget < -15000) {
        gameOverMessage = "Funding Revoked. The agency has lost faith in your financial management. The project is terminated.";
    }

    if (gameOverMessage) {
        // Stop the game loop immediately
        cancelAnimationFrame(GameState.animationFrameId);

        const panel = document.getElementById('game-over-panel');
        const reasonText = document.getElementById('game-over-reason');

        //  Populate and display panel
        reasonText.textContent = gameOverMessage;
        panel.classList.remove('hidden');
    }
}

// alert system 
function updateFacilityStatus() {
    if (GameState.activeBreaches >= 3) {
        GameState.facilityStatus = 'LOCKDOWN';
    } else if (GameState.activeBreaches > 0) {
        GameState.facilityStatus = 'ALERT';
    } else {
        GameState.facilityStatus = 'NOMINAL';
    }
    console.log(`Facility status updated to: ${GameState.facilityStatus}`);
}

function updateSelectedVisuals() {
    document.querySelectorAll('.containment-cell, .wing-header').forEach(el => el.classList.remove('selected'));
    if (GameState.selectedCellId !== null) {
        const cell = findCellById(GameState.selectedCellId);
        if (cell) cell.element.classList.add('selected');
    }
    if (GameState.selectedWingId !== null) {
        document.querySelector(`#wing-${GameState.selectedWingId} .wing-header`).classList.add('selected');
    }
}
// RNG Event logic
function triggerRandomEvent() {
    const event = EVENT_DATABASE[Math.floor(Math.random() * EVENT_DATABASE.length)];
    console.log(`EVENT: ${event.name} - ${event.description}`);
    event.effect();
    showNotification(event.name, event.description);
}

function showNotification(title, text) {
    const notification = document.getElementById('notification');
    notification.innerHTML = `<h4>${title}</h4><p>${text}</p>`;
    notification.classList.remove('hidden');

    // Hide the notification after 5 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// Update game logic
function update(deltaTime) {
    // Determine multipliers based on facility status
    let researchSpeedModifier = 1;
    let sanityDrainModifier = 1;
    if (GameState.facilityStatus === 'ALERT') {
        researchSpeedModifier = 0.5;
        sanityDrainModifier = 1.1;
    } else if (GameState.facilityStatus === 'LOCKDOWN') {
        researchSpeedModifier = 0;
        sanityDrainModifier = 1.5;
    }

    // --- TIMERS ---
    if (GameState.facilityStatus !== 'LOCKDOWN') {
        GameState.monthTimer -= deltaTime;
        if (GameState.monthTimer <= 0) {
            endOfMonthCycle();
        }
    }
    GameState.eventTimer -= deltaTime;
    if (GameState.eventTimer <= 0) {
        triggerRandomEvent();
        GameState.eventTimer = GameState.eventInterval;
    }

    // --- PASSIVE RESOURCE & STAFF EFFECTS ---
    const clerkCount = GameState.staff.filter(s => s.role === 'Clerk').length;
    GameState.resources.redTape += (clerkCount * 0.5) * deltaTime;
    const therapistCount = GameState.staff.filter(s => s.role === 'Therapist').length;
    GameState.resources.sanity += (therapistCount * 0.2) * deltaTime;
    GameState.resources.sanity -= (0.1 * sanityDrainModifier) * deltaTime;
    if (GameState.resources.sanity > 100) {
        GameState.resources.sanity = 100; // Cap sanity at 100
    }
    // --- PER-CELL LOGIC ---
    const researchSpeed = 10 * researchSpeedModifier;
    GameState.wings.forEach(wing => {
        const guardsInWing = (wing.staff || []).filter(s => s.role === 'Security Guard').length;
        const threatReduction = 1 - (guardsInWing * 0.1); // 10% reduction per guard

        wing.cells.forEach(cell => {
            if (cell.isOccupied()) {
                const anomaly = cell.anomaly;
                const behaviors = anomaly.behaviors || [];

                // Anomaly Behavior Effects
                if (behaviors.includes('sanity_drain')) {
                    const drainRate = { 'Safe': 0.03, 'Euclid': 0.07, 'Keter': 0.15 };
                    GameState.resources.sanity -= drainRate[anomaly.dangerLevel] * deltaTime;
                }
                if (behaviors.includes('research_hazard') && cell.assignedStaff.length > 0 && !anomaly.researchComplete) {
                    const mishapChance = 0.01 * cell.assignedStaff.length;
                    if (Math.random() < mishapChance * deltaTime) {
                        GameState.resources.sanity -= 5;
                        showNotification("Research Incident!", `A mishap studying ${anomaly.name} caused a sanity loss.`);
                    }
                }

                // Threat Calculation
                if (!cell.isContainmentSatisfied() && !cell.isBreached) {
                    const dangerMultipliers = { 'Safe': 0.5, 'Euclid': 1, 'Keter': 3 };
                    const baseThreat = 1;
                    const unsatisfiedProtocols = anomaly.protocol.requirements.filter(req => !cell.modules[req]).length;
                    const threatMultiplier = behaviors.includes('volatile') ? 2 : 1;

                    // FIXED: Changed 'const' to 'let' to allow modification
                    let threatPerSecond = baseThreat * unsatisfiedProtocols * dangerMultipliers[anomaly.dangerLevel] * threatMultiplier;

                    threatPerSecond *= threatReduction; // Apply security guard reduction

                    cell.threatLevel += threatPerSecond * deltaTime;

                    if (cell.threatLevel >= 100) {
                        cell.threatLevel = 100;
                        triggerContainmentBreach(cell);
                    }
                } else {
                    cell.threatLevel -= 2 * deltaTime;
                    if (cell.threatLevel < 0) cell.threatLevel = 0;
                }

                // Research & Ectoplasm
                if (cell.assignedStaff.length > 0 && !anomaly.researchComplete) {
                    cell.researchProgress += (researchSpeed * cell.assignedStaff.length) * deltaTime;

                    const ectoMultipliers = { 'Safe': 0.1, 'Euclid': 0.25, 'Keter': 0.5 };
                    const ectoPerSecond = cell.assignedStaff.length * ectoMultipliers[anomaly.dangerLevel];
                    GameState.resources.ectoplasm += ectoPerSecond * deltaTime;

                    if (cell.researchProgress >= 100) {
                        cell.researchProgress = 0;
                        makeDiscovery(cell);
                    }
                }
            }
        });
    });
    checkGameOver();
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
        const cell = findCellById(GameState.selectedCellId);
        // Find the fill element, but only if a cell is actually selected and occupied
        const fillElement = document.getElementById(`research-fill-${GameState.selectedCellId}`);
        if (cell && cell.isOccupied() && fillElement) {
            const progressPercent = (cell.researchProgress / 100) * 100;
            fillElement.style.width = `${progressPercent}%`;
        }
    }
    // --- Facility Status Banner Update ---
    const statusBanner = document.getElementById('facility-status-banner');
    if (statusBanner) {
        statusBanner.textContent = `STATUS: ${GameState.facilityStatus}`;
        if (GameState.facilityStatus === 'NOMINAL') {
            statusBanner.style.backgroundColor = '#27ae60'; // Green
            statusBanner.style.color = 'white';
        } else if (GameState.facilityStatus === 'ALERT') {
            statusBanner.style.backgroundColor = '#f39c12'; // Yellow
            statusBanner.style.color = 'black';
        } else if (GameState.facilityStatus === 'LOCKDOWN') {
            statusBanner.style.backgroundColor = '#e74c3c'; // Red
            statusBanner.style.color = 'white';
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
    GameState.wings.forEach(wing => {
        wing.cells.forEach(cell => {
            const threatFill = document.getElementById(`threat-fill-${cell.id}`);
            if (threatFill) {
                threatFill.style.width = `${cell.threatLevel}%`;
            }
        });
    });
}


// --- Initialization function ---
function init() {
    console.log("Initializing Department of Otherworldly Affairs...");

    // Render the initial facility state
    GameState.wings.forEach(wing => {
        renderWing(wing);
        wing.cells.forEach(c => renderNewCell(c, wing));
    });
    renderStaffPool();

    // --- EVENT LISTENERS ---

    // 1. Main control buttons that open panels
    document.getElementById('open-build-menu-btn').addEventListener('click', openBuildMenu);
    document.getElementById('open-staff-panel-btn').addEventListener('click', openStaffPanel);
    document.getElementById('open-tech-tree-btn').addEventListener('click', openTechTree);
    document.getElementById('contain-anomaly-btn').addEventListener('click', containAnomaly);

    // 2. Delegated listener for the Build Menu pop-up
    const buildMenuPanel = document.getElementById('build-menu-panel');
    buildMenuPanel.addEventListener('click', (event) => {
        if (event.target.classList.contains('build-wing-btn')) {
            buildWing(event.target.dataset.type);
        } else if (event.target.id === 'close-build-menu-btn') {
            closeBuildMenu();
        }
    });

    // 3. Delegated listener for the side panel's contextual buttons
    const uiPanel = document.getElementById('ui-panel');
    uiPanel.addEventListener('click', (event) => {
        const target = event.target;
        const selectedCell = findCellById(GameState.selectedCellId);

        if (target.id === 'build-cell-btn') buyNewCell();
        if (target.id === 'build-sub-btn') buildSubBuilding();
        if (target.id === 'assign-researcher-btn') assignStaffToCell(selectedCell, 'Researcher');
        if (target.id === 'unassign-researcher-btn') unassignStaffFromCell(selectedCell, 'Researcher');
        if (target.id === 'assign-security-btn') assignStaffToCell(selectedCell, 'Security Guard');
        if (target.id === 'unassign-security-btn') unassignStaffFromCell(selectedCell, 'Security Guard');
        if (target.classList.contains('build-module-btn')) buildModule(target.dataset.module);
        if (target.id === 'recontain-btn') recontainAnomaly();
    });

    // 4. Delegated listener for the main facility view (selecting wings/cells)
    const facilityView = document.getElementById('facility-view');
    facilityView.addEventListener('click', (event) => {
        const wingHeader = event.target.closest('.wing-header');
        const cellElement = event.target.closest('.containment-cell');

        if (wingHeader) {
            handleWingSelection(parseInt(wingHeader.dataset.wingId));
        } else if (cellElement) {
            handleCellSelection(parseInt(cellElement.dataset.cellId));
        }
    });

    // 5. Delegated listener for the Staff pop-up
    const staffPanel = document.getElementById('staff-panel');
    staffPanel.addEventListener('click', (event) => {
        if (event.target.id === 'close-staff-panel-btn') closeStaffPanel();
        else if (event.target.classList.contains('hire-staff-btn')) hireStaff(event.target.dataset.role);
    });

    // 6. Delegated listener for the Tech Tree pop-up
    const techPanel = document.getElementById('tech-tree-panel');
    techPanel.addEventListener('click', (event) => {
        if (event.target.id === 'close-tech-tree-btn') closeTechTree();
        else if (event.target.classList.contains('purchase-tech-btn')) purchaseTech(event.target.dataset.techId);
    });

    // Start the game loop
    requestAnimationFrame(gameLoop);
}

window.addEventListener('DOMContentLoaded', init);