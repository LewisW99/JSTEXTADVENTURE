export function saveGame(currentLocation, player) {
    const gameData = {
        currentLocation,
        inventory: player.getInventory(),
        playerClass: player.playerClass,
        stats: player.stats,
        quests: player.quests,
        xp: player.xp,
        level: player.level,
        health: player.health,
        stamina: player.stamina,
        mana: player.mana,
        encounterChance: player.encounterChance
    };
    localStorage.setItem('textAdventureSave', JSON.stringify(gameData));
}

export function loadGame() {
    const data = localStorage.getItem('textAdventureSave');
    if (data) {
        const saveData = JSON.parse(data);
        return {
            currentLocation: saveData.currentLocation,
            player: Object.assign(new Player(saveData.playerClass), saveData)
        };
    }
    return null;
}

export function hasSaveFile() {
    return localStorage.getItem('textAdventureSave') !== null;
}
