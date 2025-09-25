class Cell {
    constructor(id) {
        this.id = id; // A unique number for this cell
        this.cost = 5000; // The initial cost to build a cell
        
        this.element = null; // This will hold the div element for this cell
        this.anomaly = null; // Will hold an Anomaly object when one is contained
        this.modules = {}; // An object to store installed modules, e.g., { leadLining: true }
    }

    // A method to check if the cell is occupied
    isOccupied() {
        return this.anomaly !== null;
    }
}