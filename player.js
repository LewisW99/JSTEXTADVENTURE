// player.js
const Quest = require('./quest');
const Objective = require('./objective');

class Player {
    constructor(playerClass) {
        this.playerClass = playerClass;
        this.inventory = [];
        this.stats = this.initializeStats(playerClass);
        this.quests = []; // Array to hold quests
        this.encounterChance = 0.02;
        this.health = this.stats.strength * 10; // Default health
        this.stamina = this.stats.agility * 10;
        this.mana = this.stats.intelligence * 10;
        this.xp = 0;
        this.level = 1;
    }


    gainXP(amount) {
        this.xp += amount;
        console.log(`You gained ${amount} XP!`);

        // Check if the player levels up
        this.checkLevelUp();
    }

    checkLevelUp() {
        const xpThreshold = Math.floor(100 * Math.pow(1.1, this.level - 1));  // Leveling needs 100 XP per level for simplicity
        if (this.xp >= xpThreshold) {
            this.level++;
            this.xp -= xpThreshold;  // Reset XP to start next level
            console.log(`You leveled up! You are now level ${this.level}.`);
            this.increaseStats();  // Boost player's stats (e.g. health, damage)
        }
    }

    increaseStats() {
        this.health += 10;  // Add health per level
        console.log(`Your health has increased to ${this.health}.`);
    }

    // Method to view the player's current level and XP
    viewStats() {
        console.log(`Level: ${this.level} | XP: ${this.xp}`);
    }


    initializeStats(playerClass) {
        switch (playerClass) {
            case 'fighter':
                return { strength: 10, agility: 5, intelligence: 3 };
            case 'thief':
                return { strength: 5, agility: 10, intelligence: 5 };
            case 'mage':
                return { strength: 3, agility: 6, intelligence: 10 };
            default:
                return { strength: 5, agility: 5, intelligence: 5 };
        }
    }

    hasCompletedObjective(objectiveName) {
        for (const quest of this.quests) {
            const objective = quest.objectives.find(obj => obj.name === objectiveName);
            if (objective) {
                console.log(`Objective "${objectiveName}" found. Completed: ${objective.completed}`); // Debug log
                if (objective.completed) {
                    return true;
                }
            }
        }
        console.log(`Objective "${objectiveName}" not completed or not found.`);
        return false;
    }

    viewQuestLog() {
        if (this.quests.length === 0) {
            console.log('You have no active quests.');
        } else {
            console.log('Active Quests:');
            this.quests.forEach((quest, index) => {
                console.log(`${index + 1}. ${quest.name} - ${quest.completed ? 'Completed' : 'In Progress'}`);
                quest.objectives.forEach((objective, i) => {
                    console.log(`    ${i + 1}. ${objective.name}: ${objective.completed ? 'Completed' : 'Incomplete'}`);
                });
            });
        }
    }

    addItem(itemName) {
        if (!this.inventory.includes(itemName)) {
            this.inventory.push(itemName);
            console.log(`You picked up the ${itemName}.`);
        } else {
            console.log('You already have that item.');
        }
    }

    viewInventory() {
        if (this.inventory.length === 0) {
            console.log('Your inventory is empty.');
        } else {
            console.log('Inventory:');
            this.inventory.forEach(item => console.log(`- ${item}`));
        }
    }

    getInventory() {
        return this.inventory;
    }

    setInventory(newInventory) {
        this.inventory = newInventory;
    }

    startQuest(quest) {
        this.questLog = quest.objectives;
        this.quests.push(quest);
        console.log(`Quest started: ${quest.name}`);
    }

    completeObjective(objectiveName) {
        for (const quest of this.quests) {
            const objective = quest.objectives.find(obj => obj.name === objectiveName); // Use name here
            if (objective) {
                objective.completed = true;
                console.log(`Objective "${objectiveName}" marked as completed.`);
                console.log('Updated objectives:', quest.objectives); // Debug log
                return;
            }
        }
        console.log(`Objective "${objectiveName}" not found.`);
    }

    showQuests() {
        if (this.quests.length === 0) {
            console.log('No active quests.');
        } else {
            console.log('Active Quests:');
            this.quests.forEach(quest => {
                console.log(`${quest.name}: ${quest.completed ? 'Completed' : 'In Progress'}`);
                quest.objectives.forEach(obj => {
                    console.log(`  - ${obj.name}: ${obj.completed ? 'Completed' : 'Incomplete'}`);
                });
            });
        }
    }


}

module.exports = Player;
