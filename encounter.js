export class Encounter {
    constructor(player, type, description, successCriteria, onComplete, print) {
        this.player = player;
        this.type = type;
        this.description = description;
        this.successCriteria = successCriteria;
        this.onComplete = onComplete;
        this.print = print;
    }

    start() {
        this.print(this.description);
        const inputArea = document.getElementById('input-area');
        inputArea.innerHTML = `
            <button id="sneak-btn">Sneak</button>
            <button id="fight-btn">Fight</button>
            <button id="talk-btn">Talk</button>
        `;
        document.getElementById('sneak-btn').onclick = () => this.sneakAttempt();
        document.getElementById('fight-btn').onclick = () => this.fight();
        document.getElementById('talk-btn').onclick = () => this.talk();
    }

    sneakAttempt() {
        const sneakChance = this.player.stats.agility / this.successCriteria.sneakDivisor;
        const successThreshold = Math.random();
        this.print(`Your chance of sneaking is ${Math.floor(sneakChance * 100)}%`);

        if (successThreshold < sneakChance) {
            this.print('You successfully sneak past!');
            this.endEncounter();
        } else {
            this.print('You fail to sneak past! You are caught.');
            this.endEncounter();
        }
    }

    fight() {
        this.print('You decide to fight!');
        const fightOutcome = Math.random() * this.player.stats.strength;
        const enemyStrength = Math.random() * 50;

        if (fightOutcome > enemyStrength) {
            this.print('You defeat your opponent!');
            this.endEncounter();
        } else {
            this.print('You are overpowered and defeated.');
            this.endEncounter();
        }
    }

    talk() {
        this.print('You attempt to talk to the enemy.');
        const talkChance = this.player.stats.intelligence / this.successCriteria.talkDivisor;
        const successThreshold = Math.random();
        this.print(`Your chance of success is ${Math.floor(talkChance * 100)}%`);

        if (successThreshold < talkChance) {
            this.print('The enemy listens and lets you pass.');
            this.endEncounter();
        } else {
            this.print('Your words fail. The enemy becomes hostile.');
            this.endEncounter();
        }
    }

    endEncounter() {
        document.getElementById('input-area').innerHTML = `
            <input type="text" id="command-input" placeholder="Enter your command...">
            <button id="submit-button">Submit</button>
        `;
        this.onComplete();
    }
}
