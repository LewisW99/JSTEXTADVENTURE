// encounter.js
class Encounter {
    constructor(player, type, description, successCriteria, rl) {
        this.player = player;
        this.type = type;  // Type of the encounter (e.g., goblins, trap, etc.)
        this.description = description;  // Description of the encounter
        this.successCriteria = successCriteria;  // Criteria for success (e.g., agility for sneaking)
        this.rl = rl;  // Store the readline interface
        this.nextLocation = nextLocation;  // <- New! Where the player goes after encounter
        this.onComplete = onComplete;
    }

    start() {
        console.log(this.description);  // Describe the encounter

        this.rl.question('Choose an action: "sneak", "fight", or "talk": ', (action) => {
            if (action.toLowerCase() === 'sneak') {
                this.sneakAttempt();
            } else if (action.toLowerCase() === 'fight') {
                this.fight();
            } else if (action.toLowerCase() === 'talk') {
                this.talk();
            } else {
                console.log('Invalid action. Try again.');
                this.start();  // Loop back if invalid action
            }
        });
    }

    sneakAttempt() {
        const sneakChance = this.player.stats.agility / this.successCriteria.sneakDivisor;
        const successThreshold = Math.random();

        console.log(`Your chance of sneaking is ${Math.floor(sneakChance * 100)}%`);

        if (successThreshold < sneakChance) {
            console.log("You successfully sneak past the obstacle!");
            this.handleSuccess();
        } else {
            console.log("You fail to sneak past! You are caught.");
            this.handleFailure();
        }
    }

    fight() {
        console.log("You decide to fight!");

        // Simple combat mechanic based on player's strength and enemy's strength
        const fightOutcome = Math.random() * this.player.stats.strength;
        const enemyStrength = Math.random() * 50;

        if (fightOutcome > enemyStrength) {
            console.log("You defeat your opponent!");
            this.handleSuccess();
        } else {
            console.log("You are overpowered and defeated.");
            this.handleFailure();
        }
    }

    talk() {
        console.log("You attempt to talk to the enemy.");

        // Example of success criteria for a 'talk' action, could be based on a stat like charisma or intelligence
        const talkChance = this.player.stats.intelligence / this.successCriteria.talkDivisor;
        const successThreshold = Math.random();

        console.log(`Your chance of successfully persuading is ${Math.floor(talkChance * 100)}%`);

        if (successThreshold < talkChance) {
            console.log("The enemy listens to your words and lets you pass.");
            this.handleSuccess();
        } else {
            console.log("Your words fall on deaf ears. The enemy becomes hostile.");
            this.handleFailure();
        }
    }

    handleSuccess() {
        console.log("You successfully navigate the encounter.");
        this.onComplete(this.nextLocation);
        // Additional logic on success (e.g., gain items, advance to new area)
    }

    handleFailure() {
        console.log("The encounter ends badly. Prepare for consequences.");
        this.onComplete(this.nextLocation);
        // Additional logic on failure (e.g., combat starts, health loss)
    }
}

module.exports = Encounter;
