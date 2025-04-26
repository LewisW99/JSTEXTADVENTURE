class Quest {
    constructor(name, description, objectives) {
        this.name = name;
        this.description = description;
        this.objectives = objectives; // Array of objectives
        this.completed = false;
    }

    checkCompletion() {
        // Check if all objectives are completed
        if (this.objectives.every(obj => obj.completed)) {
            this.completed = true;
            console.log(`${this.name} completed!`);
        }
    }

    updateObjective(name) {
        const objective = this.objectives.find(obj => obj.name === name);
        if (objective) {
            objective.completed = true;
            console.log(`Objective "${name}" completed.`);
            this.checkCompletion();
        }
    }
}

module.exports = Quest;
