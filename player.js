import { Quest } from './quest.js';
import { Objective } from './objective.js';

export class Player {
    constructor(playerClass) {
        this.playerClass = playerClass;
        this.inventory = [];
        this.stats = this.initializeStats(playerClass);
        this.quests = [];
        this.encounterChance = 0.02;
        this.health = this.stats.strength * 10;
        this.stamina = this.stats.agility * 10;
        this.mana = this.stats.intelligence * 10;
        this.xp = 0;
        this.level = 1;
    }

    initializeStats(playerClass) {
        switch (playerClass) {
            case 'fighter': return { strength: 10, agility: 5, intelligence: 3 };
            case 'thief': return { strength: 5, agility: 10, intelligence: 5 };
            case 'mage': return { strength: 3, agility: 6, intelligence: 10 };
            default: return { strength: 5, agility: 5, intelligence: 5 };
        }
    }

    gainXP(amount, print) {
        this.xp += amount;
        print(`You gained ${amount} XP!`);
        this.checkLevelUp(print);
    }

    checkLevelUp(print) {
        const xpThreshold = Math.floor(100 * Math.pow(1.1, this.level - 1));
        if (this.xp >= xpThreshold) {
            this.level++;
            this.xp -= xpThreshold;
            print(`You leveled up! You are now level ${this.level}.`);
            this.increaseStats(print);
        }
    }

    increaseStats(print) {
        this.health += 10;
        print(`Your health has increased to ${this.health}.`);
    }

    addItem(itemName, print) {
        if (!this.inventory.includes(itemName)) {
            this.inventory.push(itemName);
            print(`You picked up the ${itemName}.`);
        } else {
            print('You already have that item.');
        }
    }

    viewInventory(print) {
        if (this.inventory.length === 0) {
            print('Your inventory is empty.');
        } else {
            print('Inventory:');
            this.inventory.forEach(item => print(`- ${item}`));
        }
    }

    getInventory() {
        return this.inventory;
    }

    setInventory(newInventory) {
        this.inventory = newInventory;
    }

    startQuest(quest, print) {
        this.quests.push(quest);
        print(`Quest started: ${quest.name}`);
    }

    completeObjective(objectiveName, print) {
        for (const quest of this.quests) {
            const objective = quest.objectives.find(obj => obj.name === objectiveName);
            if (objective) {
                objective.completed = true;
                print(`Objective "${objectiveName}" completed.`);
                quest.checkCompletion(print);
                return;
            }
        }
        print(`Objective "${objectiveName}" not found.`);
    }

    hasCompletedObjective(objectiveName) {
        for (const quest of this.quests) {
            const objective = quest.objectives.find(obj => obj.name === objectiveName);
            if (objective && objective.completed) {
                return true;
            }
        }
        return false;
    }

    viewQuestLog(print) {
        if (this.quests.length === 0) {
            print('You have no active quests.');
        } else {
            print('Active Quests:');
            this.quests.forEach((quest, index) => {
                print(`${index + 1}. ${quest.name} - ${quest.completed ? 'Completed' : 'In Progress'}`);
                quest.objectives.forEach((objective, i) => {
                    print(`    ${i + 1}. ${objective.name}: ${objective.completed ? 'Completed' : 'Incomplete'}`);
                });
            });
        }
    }
}
