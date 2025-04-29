import { Player } from './player.js';
import { getLocation } from './locations.js';
import { saveGame, loadGame, hasSaveFile } from './saveLoad.js';
import { Quest } from './quest.js';
import { Objective } from './objective.js';
import { Encounter } from './encounter.js';
import { CombatSystem } from './combatsystem.js';

const output = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const submitButton = document.getElementById('submit-button');

let player = null;
let currentLocation = 'start';
let currentQuest = null;
let currentMoney = 10;

const moneyAmountElement = document.getElementById("money-amount");
const coinImage = document.getElementById("coin-image");

function clearOutput() {
    output.innerHTML = '';
}

function updateMoney(amount) {
    const previousMoney = currentMoney;
  
    // Check if money has increased or decreased
    if (amount !== 0) {
      // Apply animation before updating the money value
      if (amount > 0) {
        // Money gained, apply green flash
        moneyAmountElement.classList.add('money-gained');
        coinImage.classList.add('rotate-coin');
      } else if (amount < 0) {
        // Money lost, apply red flash
        moneyAmountElement.classList.add('money-lost');
      }
  
      // Wait for animation to complete before changing the money value
      setTimeout(() => {
        currentMoney += amount;
        moneyAmountElement.textContent = currentMoney;
        
        // Remove the animation class after the animation completes (1 second)
        moneyAmountElement.classList.remove('money-gained', 'money-lost');
        coinImage.classList.remove('rotate-coin');
      }, 1000); // Delay of 1000ms (same as animation duration)
    }
  }
  

function typeLine(text, element, delay = 20) {
    return new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text[i++];
            } else {
                clearInterval(interval);
                resolve();
            }
        }, delay);
    });
}

async function printLine(text, className = 'output-system') {
    const line = document.createElement('div');
    line.className = `output-line ${className}`;
    output.appendChild(line);
    await typeLine(text, line);
    output.scrollTop = output.scrollHeight;
}

function showInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    const inventory = player.getInventory();
    if (inventory.length === 0) {
        list.innerHTML = '<li><em>Empty</em></li>';
        return;
    }
    inventory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
    });
}

async function showLocation() {
    const location = getLocation(currentLocation);
    await printLine(`\n${location.description}`);
    if (location.item && !player.getInventory().includes(location.item)) {
        await printLine(`You see a ${location.item} here.`);
    }
    await printLine('Available paths:');
    for (const direction in location.options) {
        await printLine(`- ${direction}`);
    }
}

async function handleInput(input) {
    const [command, ...rest] = input.trim().toLowerCase().split(' ');
    const target = rest.join(' ');

    switch (command) {
        case 'move':
            await movePlayer(target);
            break;
        case 'take':
            await takeItem(target);
            break;
        case 'inventory':
            await player.viewInventory(printLine);
            break;
        case 'questlog':
            await player.viewQuestLog(printLine);
            break;
        case 'save':
            saveGame(currentLocation, player);
            await printLine('Game saved.');
            break;
        case 'help':
            await showHelp();
            break;
        default:
            await printLine('Invalid command.');
    }
}

async function movePlayer(direction) {
    const location = getLocation(currentLocation);

    if (location.options[direction]) {
        const nextLocation = location.options[direction];
        await printLine(`You move ${direction}.`);
        currentLocation = nextLocation;

        if (nextLocation === 'forest') {
            await printLine("You've reached the forest. You have successfully escaped the village.");
            await player.completeObjective('Escape The Village', printLine);
            currentQuest.objectives.push(new Objective('Find Help', 'Find help for your village.'));
            player.gainXP(200, printLine);
            updateMoney(10);
            await printLine('You found 10 gold coins!');
        }

        if (nextLocation === 'deepforest' && Math.random() < 0.05) {
            const combat = new CombatSystem(player, 'Goblin', 30, 5, showLocation, printLine);
            combat.start();
        } else {
            await showLocation();
        }
    } else {
        await printLine('You cannot go that way.');
    }
}

async function takeItem(itemName) {
    const location = getLocation(currentLocation);
    if (location.item && location.item === itemName && !player.getInventory().includes(itemName)) {
        await player.addItem(itemName, printLine);
        showInventory();
        if (itemName === 'mysterious stone') {
            await mysteriousStoneFound();
        }
    } else {
        await printLine('There is no such item here.');
    }
}

async function showHelp() {
    await printLine('\nAvailable commands:');
    await printLine('- move [direction]');
    await printLine('- take [item]');
    await printLine('- inventory');
    await printLine('- save');
    await printLine('- help');
    await printLine('- questlog');
}

async function mysteriousStoneFound() {
    await printLine('As you pick up the mysterious stone, you feel a strange energy pulse through you...');
    const mysteriousStoneQuest = new Quest(
        'Mysterious Stone',
        'Discover the origins of the mysterious stone you found.',
        [new Objective('Investigate the Stone', 'Find someone who knows about the stone.')]
    );
    await player.startQuest(mysteriousStoneQuest, printLine);
    await player.gainXP(10, printLine);
}

async function startNewGame() {
    clearOutput();
    await printLine('Choose your class (fighter, thief, mage):');
    submitButton.onclick = async () => {
        const classChoice = commandInput.value.trim().toLowerCase();
        if (!['fighter', 'thief', 'mage'].includes(classChoice)) {
            await printLine('Invalid class. Choose fighter, thief, or mage.');
            return;
        }
        player = new Player(classChoice);
        await printLine(`You have chosen the ${classChoice}!`);
        currentQuest = new Quest('Find Help For Your Village', 'Escape the village to find help!', [
            new Objective('Escape The Village', 'Move north to find safety.')
        ]);
        await player.startQuest(currentQuest, printLine);
        showInventory();
        await showLocation();
        setInputHandler();
    };
}

function setInputHandler() {
    submitButton.onclick = async () => {

        const input = commandInput.value.trim();
        if (input) {
            await handleInput(input);
            commandInput.value = '';
        }
    };
}

async function startGame() {
    clearOutput();
    if (hasSaveFile()) {
        await printLine('Load previous game? (yes/no)');
        submitButton.onclick = async () => {
            const input = commandInput.value.trim().toLowerCase();
            if (input === 'yes') {
                const saveData = loadGame();
                player = saveData.player;
                currentLocation = saveData.currentLocation;
                await printLine('Game loaded.');
                showInventory();
                await showLocation();
                setInputHandler();
            } else {
                await startNewGame();
            }
        };
    } else {
        await startNewGame();
    }
}

// Function to update the health bar in the UI
function updateHealthBar() {
    const healthValueElement = document.getElementById("health-value");
    const healthFillElement = document.getElementById("health-fill");

    // Update the text and width of the health bar based on player health
    healthValueElement.textContent = player.health;
    healthFillElement.style.width = player.health + "%";

    // If health reaches 0, you could trigger a game over or similar response
    if (player.health <= 0) {
        alert("You have died! Game Over.");
        // Handle game over logic
    }
}

startGame();
