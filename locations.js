const locations = {
    start: {
        description: 'You are standing at the village square. There is fire and death everywhere.',
        options: { north: 'forest', east: 'cave' }
    },
    forest: {
        description: 'You are in a dark forest. A torch lies on the ground.',
        options: { south: 'start', east: 'deepforest' },
        item: 'torch'
    },
    deepforest: {
        description: 'You are deep in the forest. It is dark and eerie.',
        options: { south: 'clearing', west: 'forest' }
    },
    clearing: {
        description: 'You are in a clearing. There is a strange stone here.',
        options: { north: 'deepforest', east: 'campsite' },
        item: 'mysterious stone'
    },
    campsite: {
        description: 'You are at a campsite. There are signs of a struggle.',
        options: { west: 'clearing' },
        item: 'sword'
    },
    cave: {
        description: 'You are at the mouth of a dark cave. It looks dangerous.',
        options: { west: 'start' }
    }
};

export function getLocation(name) {
    return locations[name];
}
