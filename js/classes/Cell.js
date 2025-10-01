class Cell {
    constructor(id) {
        this.id = id; // A unique number for this cell
        this.cost = 5000; // The initial cost to build a cell
        
        this.element = null; // This will hold the div element for this cell
        this.anomaly = null; // Will hold an Anomaly object when one is contained
        this.modules = {}; // Installed modules, e.g., { leadLining: true }
        this.assignedStaff = []; // Self Explanatory
        this.researchProgress = 0; 
        this.threatLevel = 0;
        this.isBreached = false;
    }

    // A method to check if the cell is occupied
    isOccupied() {
        return this.anomaly !== null;
    }
    
    contain(anomaly) {
        if (!this.isOccupied()) {
            this.anomaly = anomaly;
            console.log(`${anomaly.name} has been contained in Cell #${this.id}.`);
            return true;
        }
        console.warn(`Attempted to contain anomaly in occupied Cell #${this.id}.`);
        return false;
    }

    isContainmentSatisfied() {
    if (!this.isOccupied()) {
        return false;
    }

    const requirements = this.anomaly.protocol.requirements;
  
    // Here, we check if every required module is present in this.modules.
    return requirements.every(req => this.modules[req]);
}
}