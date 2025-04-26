const fs = require('fs');
const Player = require('./player');
const saveFile = 'savegame.json';

function saveGame(currentLocation, player) {
    const gameData = {
        currentLocation,
        inventory: player.getInventory(),  // Correct method call
        playerClass: player.playerClass,
        stats: player.stats,
        quests: player.quests, 
        xp: player.xp,
        level: player.level,
        health: player.health,
        stamina: player.stamina,
        mana: player.mana,
        objectives: player.quests.map(quest => quest.objectives), // Save objectives
        encounterChance: player.encounterChance // Add quests data here
    };
    fs.writeFileSync(saveFile, JSON.stringify(gameData, null, 2));
    console.log('Game saved.');
}

function loadGame() {
    if (fs.existsSync(saveFile)) {
        const data = fs.readFileSync(saveFile);
        const saveData = JSON.parse(data);
        
        // Log to check the loaded data
        console.log('Loaded save data:', saveData);

        if (!saveData.playerClass) {
            console.error('Error: playerClass is missing in save data');
            return null;  // or you can create a default player here
        }
        
        const player = new Player(saveData.playerClass); 
        player.setInventory(saveData.inventory || []);
        player.stats = saveData.stats || {};
        player.quests = saveData.quests || [];
        player.xp = saveData.xp || 0;
        player.level = saveData.level || 1;
        player.health = saveData.health || 100; // Default health
        player.stamina = saveData.stamina || 100; // Default stamina
        player.mana = saveData.mana || 100; // Default mana
        player.encounterChance = saveData.encounterChance || 0.02; // Default encounter chance
        player.objectives = saveData.objectives || []; // Load objectives
        
        return {
            currentLocation: saveData.currentLocation || 'start',
            player: player
        };
    } else {
        return null;
    }
}


function hasSaveFile() {
    return fs.existsSync(saveFile);
}

module.exports = { saveGame, loadGame, hasSaveFile };
