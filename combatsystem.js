export class CombatSystem {
    constructor(player, enemyName, enemyHealth, enemyAttackPower, onComplete, print) {
        this.player = player;
        this.enemyName = enemyName;
        this.enemyHealth = enemyHealth;
        this.enemyAttackPower = enemyAttackPower;
        this.onComplete = onComplete;
        this.print = print;
        this.awaitingInput = false;
        this.initCombatUI();
    }

    initCombatUI() {
        const inputArea = document.getElementById('input-area');
        inputArea.innerHTML = `
            <button id="attack-btn">Attack</button>
            <button id="defend-btn">Defend</button>
            <button id="flee-btn">Flee</button>
        `;
        document.getElementById('attack-btn').onclick = () => this.combatTurn('attack');
        document.getElementById('defend-btn').onclick = () => this.combatTurn('defend');
        document.getElementById('flee-btn').onclick = () => this.combatTurn('flee');
    }

    start() {
        this.print(`A wild ${this.enemyName} appears!`);
        this.showStats();
    }

    showStats() {
        this.print(`\nYour Health: ${this.player.health}`);
        this.print(`${this.enemyName} Health: ${this.enemyHealth}`);
    }

    combatTurn(action) {
        if (this.awaitingInput) return;
        this.awaitingInput = true;

        if (action === 'attack') {
            const playerDamage = Math.floor(Math.random() * 10) + 5;
            this.print(`You attack and deal ${playerDamage} damage!`);
            this.enemyHealth -= playerDamage;
        } else if (action === 'defend') {
            this.print('You defend and reduce incoming damage.');
        } else if (action === 'flee') {
            this.print('You attempt to flee...');
            if (Math.random() < 0.5) {
                this.print('You successfully fled!');
                this.endCombat();
                return;
            } else {
                this.print('Failed to flee!');
            }
        }

        if (this.enemyHealth <= 0) {
            this.print(`You defeated the ${this.enemyName}!`);
            this.player.gainXP(20, this.print);
            this.endCombat();
            return;
        }

        // Enemy attacks
        let enemyDamage = Math.floor(Math.random() * this.enemyAttackPower) + 1;
        if (action === 'defend') enemyDamage = Math.floor(enemyDamage / 2);

        this.print(`The ${this.enemyName} attacks and deals ${enemyDamage} damage!`);
        this.player.health -= enemyDamage;

        if (this.player.health <= 0) {
            this.print('You have been defeated...');
            // You can handle game over here if you want
        } else {
            this.showStats();
            this.awaitingInput = false;
        }
    }

    endCombat() {
        document.getElementById('input-area').innerHTML = `
            <input type="text" id="command-input" placeholder="Enter your command...">
            <button id="submit-button">Submit</button>
        `;
        this.onComplete();
    }
}
