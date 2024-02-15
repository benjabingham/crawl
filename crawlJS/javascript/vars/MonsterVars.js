let monsterVars = {
    goblin:{
        name:"goblin",
        symbol:"Go",
        behavior:"chase",
        behaviorInfo:{
            focus:15,
            enrage:20,
            daze:30
        },
        hitDice:1,
        damage:4,
        inventorySlots: 1,
        loot:{
            weapon:{
                chance:5,
                tier:1
            },
            treasure:{
                chance:5,
                tier:1
            }
        }
    },
    ogre:{
        name:"ogre",
        symbol:"Og",
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
                chance:20,
                tier:1
            },
            treasure:{
                chance:30,
                tier:2
            }
        }
    },
    rat:{
        name:"rat",
        symbol:"Ra",
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
        symbol:"Dr",
        behavior:"chase",
        behaviorInfo:{
            focus:20,
            enrage:30,
            daze:30
        },
        hitDice:1,
        damage:4,
        inventorySlots: 0,
        inventory:[{
            name:"dire rat pelt",
            value:1
        }]
    },
    wolf:{
        name:"wolf",
        symbol:"Wo",
        behavior:"chase",
        behaviorInfo:{
            focus:25,
            enrage:40,
            daze:30
        },
        hitDice:1,
        damage:5,
        inventorySlots: 0,
        inventory:[{
            name:"wolf pelt",
            value:2
        }]
    },
    direWolf:{
        name:"dire wolf",
        symbol:"Dw",
        behavior:"chase",
        behaviorInfo:{
            focus:25,
            enrage:75,
            daze:15
        },
        hitDice:3,
        damage:8,
        inventorySlots: 0,
        inventory:[{
            name:"dire wolf pelt",
            value:4
        }]
    },
    dummy:{
        name:"dummy",
        symbol:"Du",
        behavior:"",
        hitDice:100,
        damage:8,
        inventorySlots: 0,
    },
    chest:{
        name:"chest",
        symbol:"Ch",
        behavior:"",
        hitDice:0,
        damage:4,
        inventorySlots: 10,
        container: true,
        loot:{
            weapon:{
                chance:50,
                tier:1
            },
            treasure:{
                chance:100,
                tier:2
            }
        }
    },

}