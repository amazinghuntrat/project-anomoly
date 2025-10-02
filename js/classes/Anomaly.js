class Anomaly {
    constructor({ id, name, form, dangerLevel, description, protocol, behaviors, researchComplete, sanityBonusAwarded, revealed }) {
        this.id = id;
        this.name = name;
        this.form = form;
        this.description = description;
        this.dangerLevel = dangerLevel || 'Euclid';
        this.behaviors = behaviors || [];
        this.researchComplete = researchComplete || false;
        this.sanityBonusAwarded = sanityBonusAwarded || false;

        
        if (Array.isArray(protocol)) {
            // If 'protocol' is an array (from ANOMALY_DATABASE), create the object
            this.protocol = {
                requirements: protocol,
                revealed: revealed || []
            };
        } else {
            // If 'protocol' is already an object (from a save file), use it directly
            this.protocol = protocol;
        }
    }
}