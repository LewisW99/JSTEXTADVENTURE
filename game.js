// game.js
const readline = require('readline');
const Player = require('./player');
const { getLocation } = require('./locations');
const { saveGame, loadGame, hasSaveFile } = require('./saveLoad');
const Quest = require('./quest');
const Objective = require('./objective');
const Encounter = require('./encounter');
const CombatSystem = require('./combatsystem');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let player = null;
let currentLocation = 'start'; // Start location
let currentQuest = null; // The current quest

//#region Main Game Functions
function showLocation() {
    const location = getLocation(currentLocation);
    console.log(`\n${location.description}`);
    if (location.item && !player.getInventory().includes(location.item)) {
        console.log(`You see a ${location.item} here.`);
    }
    console.log('Available paths:');
    for (const direction in location.options) {
        console.log(`- ${direction}`);
    }
    rl.question('What do you want to do? (move [direction] / take [item] / inventory / save / quit / help , questlog) ', handleInput);
}

function handleInput(input) {
    const [command, ...rest] = input.trim().toLowerCase().split(' ');
    const target = rest.join(' ');

    if (command === 'move') {
        movePlayer(target);
    } else if (command === 'take') {
        takeItem(target);
    } else if (command === 'inventory') {
        player.viewInventory();
        showLocation();
    }
    else if (command === 'questlog') { // New command to view the quest log
        player.viewQuestLog();
        showLocation();
    }
     else if (command === 'save') {
        saveGame(currentLocation, player);
        showLocation();
    } else if (command === 'quit') {
        confirmQuit();
    } else if (command === 'help') {
        showHelp();
    } else {
        console.log('Invalid command.');
        showLocation();
    }
}

function movePlayer(direction) {
    const location = getLocation(currentLocation);
    if (location.options[direction]) {
        const nextLocation = location.options[direction];
        console.log(`You move ${direction}.`);

        if (nextLocation === 'forest') {
            console.log("You've reached the forest. You have successfully escaped the village.");
            player.completeObjective('Escape The Village');
            currentQuest.objectives.push(new Objective('Find Help', 'Find help for your village.', false));
            currentQuest.checkCompletion();
        }

        if (nextLocation === 'deepforest' && Math.random() < 0.05) {
            const combat = new CombatSystem(player, 'Goblin', 30, 5, rl, () => {
                console.log('Combat finished.');
                showLocation(); // Go back to map view after fighting
            });
            combat.start();

        }


        const encounterChance = player.encounterChance || 0.02;

        if (player.hasCompletedObjective('Escape The Village') && Math.random() < encounterChance) {
            console.log('You encounter something unexpected...');
            randomEncounter(player, nextLocation);  // Pass where they were moving to
        } else {
            currentLocation = nextLocation;  // Move player normally
            console.log('Random encounter not triggered. Objective not completed.');
            showLocation();
        }

        
    } else {
        console.log('You cannot go that way.');
        showLocation();
    }
}

function takeItem(itemName) {
    const location = getLocation(currentLocation);
    if (location.item && location.item === itemName && !player.getInventory().includes(itemName)) {
        player.addItem(itemName);
    }
    if(location.item === 'mysterious stone')
    {
        mysteriousStoneFound(); 
    }
     else {
        console.log('There is no such item here.');
    }
    showLocation();
}

//#endregion

function showHelp() {
    console.log('\nAvailable commands:');
    console.log('- move [direction]   (Example: move north)');
    console.log('- take [item]        (Example: take torch)');
    console.log('- inventory          (View your inventory)');
    console.log('- save               (Save your game)');
    console.log('- quit               (Save and exit the game)');
    console.log('- help               (Show this help menu)');
    console.log('- questlog           (View your active quests)');
    showLocation();
}

function confirmQuit() {
    rl.question('Are you sure you want to quit? (yes/no) ', (answer) => {
        if (answer.trim().toLowerCase() === 'yes') {
            saveGame(currentLocation, player);
            console.log('Game saved. Goodbye!');
            rl.close();
        } else if (answer.trim().toLowerCase() === 'no') {
            console.log('Quit cancelled.');
            showLocation();
        } else {
            console.log('Please type "yes" or "no".');
            showLocation();
        }
    });
}

function startGame() {
    if (hasSaveFile()) {
        rl.question('Save file found. Load previous game? (yes/no) ', (answer) => {
            if (answer.trim().toLowerCase() === 'yes') {
                const saveData = loadGame();
                if (saveData) {
                    currentLocation = saveData.currentLocation || 'start';
                    player = new Player(saveData.playerClass); // Create player with saved class
                    player.setInventory(saveData.inventory || []);
                    currentQuest = new Quest(saveData.questData); // Set quest data if available
                    console.log('Game loaded.');
                    showLocation();
                } else {
                    console.log('Failed to load save. Starting new game.');
                    startNewGame(); // This method can handle the class selection, intro, etc.
                }
            } else {
                console.log('Starting a new game.');
                startNewGame(); // Start new game logic
            }
        });
    } else {
        console.log('No save file found. Starting a new game.');
        startNewGame(); // Start new game logic
    }
}

function randomEncounter(player) {
    const encounterTypes = ['goblin', 'trap', 'puzzle', 'bandit', 'talk'];
    const randomType = encounterTypes[Math.floor(Math.random() * encounterTypes.length)];
    const onComplete = (finalLocation) => {
        currentLocation = finalLocation;  // After encounter, move to intended location
        showLocation();
    };
    switch (randomType) {
        case 'goblin':
            const goblinEncounter = new Encounter(player, 'goblins', 'A goblin steps in your way...', {
                sneakDivisor: 10,
                talkDivisor: 15
            }, rl, nextLocation, onComplete); // Pass rl here
            goblinEncounter.start();
            break;
        case 'trap':
            const trapEncounter = new Encounter(player, 'trap', 'You notice a hidden trap ahead...', {
                sneakDivisor: 5,
                talkDivisor: 20
            }, rl, nextLocation, onComplete); // Pass rl here
            trapEncounter.start();
            break;
        case 'puzzle':
            const puzzleEncounter = new Encounter(player, 'puzzle', 'You find a locked chest with a strange symbol...', {
                sneakDivisor: 0,
                talkDivisor: 10
            }, rl, nextLocation, onComplete); // Pass rl here
            puzzleEncounter.start();
            break;
        // Add more case types as needed
    }
}

function startNewGame() {
    console.log('A clamoring is occuring outside your home...');

    rl.question('Choose your class (fighter, thief, bard): ', (classChoice) => {
        player = new Player(classChoice); // Create player with chosen class
        console.log(`You have chosen the ${classChoice}!`);

        console.log('\nYou realise you need to escape the village before it is too late...');

        // Start the quest
        currentQuest = new Quest('Find Help For Your Village', 'Escaspe the Village To Go And Find Help!', [
            new Objective('Escape The Village', 'Move North To Try And Find Safety', false)
        ]);

        player.startQuest(currentQuest); // Start the quest for the player

        showLocation(); // Proceed with the main game
    });
}
//#region: Quest Start Triggers
function mysteriousStoneFound() {
    console.log('As you pick up the mysterious stone, you feel a strange energy pulse through you...');
    const mysteriousStoneQuest = new Quest(
        'Mysterious Stone',
        'Discover the origins of the mysterious stone you found.',
        [
            new Objective('Investigate the Stone', 'Find someone who knows about the stone.', false)
        ]
    );
    player.startQuest(mysteriousStoneQuest);
    player.gainXP(10); // Example XP reward for finding the stone
}


//#endregion

startGame();
