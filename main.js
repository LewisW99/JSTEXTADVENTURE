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

function print(message) {
    output.innerHTML += `<p>${message}</p>`;
    output.scrollTop = output.scrollHeight;
}

function clearOutput() {
    output.innerHTML = '';
}

function showLocation() {
    const location = getLocation(currentLocation);
    print(`\n${location.description}`);
    if (location.item && !player.getInventory().includes(location.item)) {
        print(`You see a ${location.item} here.`);
    }
    print('Available paths:');
    for (const direction in location.options) {
        print(`- ${direction}`);
    }
}

function handleInput(input) {
    const [command, ...rest] = input.trim().toLowerCase().split(' ');
    const target = rest.join(' ');

    switch (command) {
        case 'move':
            movePlayer(target);
            break;
        case 'take':
            takeItem(target);
            break;
        case 'inventory':
            player.viewInventory(print);
            break;
        case 'questlog':
            player.viewQuestLog(print);
            break;
        case 'save':
            saveGame(currentLocation, player);
            print('Game saved.');
            break;
        case 'help':
            showHelp();
            break;
        default:
            print('Invalid command.');
    }
}

function movePlayer(direction) {
    const location = getLocation(currentLocation);
    if (location.options[direction]) {
        const nextLocation = location.options[direction];
        print(`You move ${direction}.`);
        currentLocation = nextLocation;

        if (nextLocation === 'forest') {
            print("You've reached the forest. You have successfully escaped the village.");
            player.completeObjective('Escape The Village', print);
            currentQuest.objectives.push(new Objective('Find Help', 'Find help for your village.'));
        }

        if (nextLocation === 'deepforest' && Math.random() < 0.05) {
            const combat = new CombatSystem(player, 'Goblin', 30, 5, showLocation, print);
            combat.start();
        } else {
            showLocation();
        }
    } else {
        print('You cannot go that way.');
    }
}

function takeItem(itemName) {
    const location = getLocation(currentLocation);
    if (location.item && location.item === itemName && !player.getInventory().includes(itemName)) {
        player.addItem(itemName, print);
        if (itemName === 'mysterious stone') {
            mysteriousStoneFound();
        }
    } else {
        print('There is no such item here.');
    }
}

function showHelp() {
    print('\nAvailable commands:');
    print('- move [direction]');
    print('- take [item]');
    print('- inventory');
    print('- save');
    print('- help');
    print('- questlog');
}

function mysteriousStoneFound() {
    print('As you pick up the mysterious stone, you feel a strange energy pulse through you...');
    const mysteriousStoneQuest = new Quest(
        'Mysterious Stone',
        'Discover the origins of the mysterious stone you found.',
        [new Objective('Investigate the Stone', 'Find someone who knows about the stone.')]
    );
    player.startQuest(mysteriousStoneQuest, print);
    player.gainXP(10, print);
}

function startNewGame() {
    clearOutput();
    print('Choose your class (fighter, thief, mage):');
    submitButton.onclick = () => {
        const classChoice = commandInput.value.trim().toLowerCase();
        if (!['fighter', 'thief', 'mage'].includes(classChoice)) {
            print('Invalid class. Choose fighter, thief, or mage.');
            return;
        }
        player = new Player(classChoice);
        print(`You have chosen the ${classChoice}!`);
        currentQuest = new Quest('Find Help For Your Village', 'Escape the village to find help!', [
            new Objective('Escape The Village', 'Move north to find safety.')
        ]);
        player.startQuest(currentQuest, print);
        showLocation();
        setInputHandler();
    };
}

function setInputHandler() {
    submitButton.onclick = () => {
        const input = commandInput.value.trim();
        if (input) {
            handleInput(input);
            commandInput.value = '';
        }
    };
}

function startGame() {
    clearOutput();
    if (hasSaveFile()) {
        print('Load previous game? (yes/no)');
        submitButton.onclick = () => {
            const input = commandInput.value.trim().toLowerCase();
            if (input === 'yes') {
                const saveData = loadGame();
                player = saveData.player;
                currentLocation = saveData.currentLocation;
                print('Game loaded.');
                showLocation();
                setInputHandler();
            } else {
                startNewGame();
            }
        };
    } else {
        startNewGame();
    }
}

startGame();
