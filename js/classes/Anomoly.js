class Anomaly {
    constructor(name, form, traits) {
        this.name = name;
        this.form = form;
        this.traits = traits; // An array of "Problem Tags"
        this.containmentProtocol = {}; // Will be generated based on traits
        this.isContained = false;
    }

    // A sample method
    displayInfo() {
        console.log(`Anomaly Profile: ${this.name} (${this.form})`);
        console.log(`Known Traits: ${this.traits.join(', ')}`);
    }
}