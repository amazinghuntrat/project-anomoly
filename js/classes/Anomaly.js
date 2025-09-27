class Anomaly {
    constructor({ id, name, form, description, protocol }) {
        this.id = id;
        this.name = name;
        this.form = form;
        this.description = description;

        // The containment protocol is the core puzzle.
        // `requirements` are the modules needed.
        // `revealed` tracks which ones the player knows.
        this.protocol = {
            requirements: protocol,
            revealed: [] // Starts empty; research will fill this.
        };
    }

    // A helper method to get the protocol text for the UI
    getProtocolForDisplay() {
        let displayText = "<ul>";
        for (const req of this.protocol.requirements) {
            // For now, we'll just reveal the first requirement by default
            const isRevealed = this.protocol.revealed.includes(req) || this.protocol.requirements.indexOf(req) === 0;
            
            if (isRevealed) {
                displayText += `<li>- ${req}</li>`;
            } else {
                displayText += `<li>- [REDACTED]</li>`;
            }
        }
        displayText += "</ul>";
        return displayText;
    }
}