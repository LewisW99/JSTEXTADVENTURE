export class Quest {
    constructor(name, description, objectives) {
        this.name = name;
        this.description = description;
        this.objectives = objectives;
        this.completed = false;
    }

    checkCompletion(print) {
        if (this.objectives.every(obj => obj.completed)) {
            this.completed = true;
            print(`${this.name} completed!`);
        }
    }
}
