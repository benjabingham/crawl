let monsterVars = {
    goblin:{
        name:"goblin",
        symbol:"G",
        behavior:"chase",
        behaviorInfo:{
            focus:15,
            enrage:20,
            daze:30
        },
        hitDice:1,
        damage:4,
        inventorySlots: 10,
        loot:{
            weapon:{
                chance:10,
                tier:1
            }
        }
    },
    ogre:{
        name:"ogre",
        symbol:"O",
        behavior:"chase",
        behaviorInfo:{
            focus:7,
            enrage:75,
            slow:40,
            beat:30,
            sturdy:30
        },
        hitDice:5,
        damage:8,
        inventorySlots: 10,
        loot:{
            weapon:{
                chance:80,
                tier:2
            }
        }
    },
    rat:{
        name:"rat",
        symbol:"R",
        behavior:"chase",
        behaviorInfo:{
            focus:15,
        },
        hitDice:0,
        damage:1,
        inventorySlots: 0,
        tiny:true
    },
    direRat:{
        name:"dire rat",
        symbol:"D",
        behavior:"chase",
        behaviorInfo:{
            focus:20,
            enrage:30,
            daze:30
        },
        hitDice:1,
        damage:4,
        inventorySlots: 0,
    },
    wolf:{
        name:"dire wolf",
        symbol:"D",
        behavior:"chase",
        behaviorInfo:{
            focus:25,
            enrage:40,
            daze:30
        },
        hitDice:1,
        damage:5,
        inventorySlots: 0,
    },
    direWolf:{
        name:"dire wolf",
        symbol:"D",
        behavior:"chase",
        behaviorInfo:{
            focus:25,
            enrage:75,
            daze:15
        },
        hitDice:3,
        damage:8,
        inventorySlots: 0,
    },
    dummy:{
        name:"dummy",
        symbol:"D",
        behavior:"",
        hitDice:100,
        damage:8,
        inventorySlots: 0,
    },
    chest:{
        name:"chest",
        symbol:"C",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        container: true,
        loot:{
            weapon:{
                chance:100,
                tier:2
            }
        }
    },

}