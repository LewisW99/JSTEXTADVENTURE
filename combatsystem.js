// combatSystem.js
class CombatSystem {
    constructor(player, enemyName, enemyHealth, enemyAttackPower, rl, onComplete) {
        this.player = player;
        this.enemyName = enemyName;
        this.enemyHealth = enemyHealth;
        this.enemyAttackPower = enemyAttackPower;
        this.rl = rl;
        this.onComplete = onComplete;
    }

    start() {
        console.log(`A wild ${this.enemyName} appears!`);
        this.combatTurn();
    }

    combatTurn() {
        console.log(`\nYour Health: ${this.player.health}`);
        console.log(`${this.enemyName} Health: ${this.enemyHealth}`);

        this.rl.question('Choose an action (attack / defend / flee): ', (action) => {
            action = action.toLowerCase();

            if (action === 'attack') {
                const playerDamage = Math.floor(Math.random() * 10) + 5;
                console.log(`You attack and deal ${playerDamage} damage!`);
                this.enemyHealth -= playerDamage;
            } else if (action === 'defend') {
                console.log('You defend and reduce incoming damage.');
            } else if (action === 'flee') {
                console.log('You attempt to flee...');
                if (Math.random() < 0.5) {
                    console.log('You successfully fled!');
                    this.onComplete();
                    return;
                } else {
                    console.log('Failed to flee!');
                }
            } else {
                console.log('Invalid action.');
            }

            // Check if enemy defeated
            if (this.enemyHealth <= 0) {
                console.log(`You defeated the ${this.enemyName}!`);
                const xpReward = 20;  // Example XP reward
                this.player.gainXP(xpReward); // Give XP
                this.onComplete();
                
                return;
            }

            // Enemy attacks
            let enemyDamage = Math.floor(Math.random() * this.enemyAttackPower) + 1;
            if (action === 'defend') {
                enemyDamage = Math.floor(enemyDamage / 2);
            }

            console.log(`The ${this.enemyName} attacks and deals ${enemyDamage} damage!`);
            this.player.health -= enemyDamage;

            // Check if player defeated
            if (this.player.health <= 0) {
                console.log('You have been defeated...');
                this.rl.close();
                return;
            }


            // Next turn
            this.combatTurn();
        });
    }
}

module.exports = CombatSystem;
