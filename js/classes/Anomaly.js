class Anomaly {
    constructor({ id, name, form, dangerLevel, description, protocol }) {
        this.id = id;
        this.name = name;
        this.form = form;
        this.description = description;

        // The containment protocol is the core puzzle.
        // `requirements` are the modules needed.
        // `revealed` tracks which ones the player knows.
        this.protocol = {
            requirements: protocol,
            revealed: [] // Starts empty; research will fill this.\
            
        };
        this.researchComplete = false;
        this.dangerLevel = dangerLevel || 'Euclid'; // Defaults to Euclid if not Present

    }

    // A helper method to get the protocol text for the UI
    
}