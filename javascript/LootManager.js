class LootManager{
    constructor(){
        this.weaponMaterials = {
            wood:{
                name:'wooden',
                flimsy:true,
                stunTime: -1,
                edged:{
                    damage:-2
                },
                blunt:{
                    damage:-1
                },
                value:.25
            },
            bone:{
                name:'bone',
                flimsy:true,
                stunTime:-1,
                edged:{
                    damage:-1
                },
                value:.15
            },
            stone:{
                name:'stone',
                flimsy:true,
                weight:2,
                stunTime:3,
                blunt:{
                    damage:4
                },
                edged:{
                    damage:2
                },
                value:.2
            },
            lead:{
                name:'lead',
                weight:1,
                stunTime:2,
                blunt:{
                    damage:5
                },
                edged:{
                    damage:3
                },
                value:.75
            },
            steel:{
                name:'steel',
                edged:{
                    damage:2
                },
                value:1
            },
            ironwood:{
                name:'ironwood',
                stunTime:2,
                blunt:{
                    damage:2
                },
                value:1.4
            },
            lightsteel:{
                name:'lightsteel',
                weight:-1,
                stunTime:-2,
                blunt:{
                    damage:-2
                },
                edged:{
                    damage:2
                },
                value:1.7
            },
            silver:{
                name:'silver',
                edged:{
                    damage:-1
                },
                value:2
            },
            gold:{
                name:'gold',
                weight:1,
                stunTime:2,
                flimsy:true,
                edged:{
                    damage:-2
                },
                blunt:{
                    damage:2
                },
                value:3
            },
            Adamantine:{
                name:'adamantine',
                weight:-1,
                edged:{
                    damage:2
                },
                value:5
            }
        }

        this.treasureMaterials = {
            paper:{
                name:"tattered paper",
                value:.05
            },
            bone:{
                name:"bone",
                value:0.2
            },
            wood:{
                name:'wooden',
                value:0.3
            },
            stone:{
                name:'stone',
                value:0.4
            },
            iron:{
                name:'iron',
                value:.7
            },
            steel:{
                name:'steel',
                value:1.2
            },
            lead:{
                name:'lead',
                value:1.4
            },
            sterling:{
                name:'sterling silver',
                value:2
            },
            silver:{
                name:'silver',
                value:3.5
            },
            gold:{
                name:'gold',
                value:6
            },
            platinum:{
                name:'platinum',
                value:10
            }
        }

        this.weaponModifiers = {
            worn:{
                name:'worn',
                flimsy:true,
                edged:{
                    damage:-3
                },
                blunt:{
                    damage:-1
                },
                value:.7
            },
            craftTiers:{
                poor:{
                    name:'poor',
                    flimsy:true,
                    variance:{
                        positive:0,
                        negative:50
                    },
                    value:.4
                },
                rustic:{
                    name:'rustic',
                    variance:{
                        positive:20,
                        negative:50
                    },
                    value:.7
                },
                artisan:{
                    name:'artisan',
                    variance:{
                        positive:30,
                        negative:30
                    },
                    value:1.2
                },
                masterwork:{
                    name:'masterwork',
                    variance:{
                        positive:50,
                        negative:10
                    },
                    value:5
                }
            }
        }
    }

    giveMonsterLoot(entity){
        if(!entity.loot){
            return false;
        }
        if(!entity.inventory){
            entity.inventory = [];
        }
        let weaponLoot = entity.loot.weapon;
        if(weaponLoot){
            if(this.roll(1,99) < weaponLoot.chance){
                entity.inventory.push(this.getWeaponLoot(weaponLoot.tier));
            }
        }

        let treasureLoot = entity.loot.treasure;
        if(treasureLoot){
            if(this.roll(1,99) < treasureLoot.chance){
                entity.inventory.push(this.getTreasureLoot(treasureLoot.tier));
            }
        }
    }

    getTreasureLoot(tier){
        let nRolls = tier-3;
        let greater = (nRolls > 0);
        nRolls = Math.abs(nRolls);

        let treasure = this.getTreasure();
        let treasureMaterial = this.getTreasureMaterial();
        this.applyModifier(treasure, treasureMaterial);

        for(let i = 0; i < nRolls; i++){
            let newTreasure = this.getTreasure();
            treasureMaterial = this.getTreasureMaterial();
            this.applyModifier(newTreasure, treasureMaterial);
            if((greater && newTreasure.value > treasure.value) || (!greater && newTreasure.value < treasure.value)){
                treasure = newTreasure;
            }
        }

        return treasure;
    }

    getWeaponLoot(tier){
        let weapon = this.getWeapon();
        let weaponMaterial = this.getWeaponMaterial(tier);
        this.applyModifier(weapon, weaponMaterial);
        this.getIsWorn(weapon, tier);

        return weapon;
    }

    getWeaponMaterial(tier){
        let materials = Object.keys(this.weaponMaterials);
        let nMaterials = materials.length;
        let nRolls = tier-3;
        let maxMinFunc = (nRolls > 0) ? Math.max : Math.min;
        nRolls = Math.abs(nRolls);
        let materialIndex = this.roll(0,nMaterials-1);
        for(let i = 0; i < nRolls; i++){
            let newIndex = this.roll(0,nMaterials-1);
            materialIndex = maxMinFunc(materialIndex,newIndex);
        }
        let key = materials[materialIndex];
        let material = this.weaponMaterials[key];

        return material;
    }

    getTreasureMaterial(){
        let materials = Object.keys(this.treasureMaterials);
        let nMaterials = materials.length;
        let materialIndex = this.roll(0,nMaterials-1);
        let key = materials[materialIndex];
        let material = this.treasureMaterials[key];

        return material;
    }

    getIsWorn(weapon, tier){
        let nonWornChance = 20 * tier;
        if(this.roll(0,99) >= nonWornChance){
            this.applyModifier(weapon,this.weaponModifiers.worn);
        }
    }

    getWeapon(){
        let weapons = Object.keys(itemVars.weapons);
        let nWeapons = weapons.length;
        let weaponIndex = this.roll(0,nWeapons-1);
        
        let key = weapons[weaponIndex];
        let weapon = itemVars.weapons[key];

        console.log(weapon);

        return JSON.parse(JSON.stringify(weapon));
    }

    getTreasure(){
        let treasures = Object.keys(itemVars.treasure);
        let nTreasures = treasures.length;
        let treasureIndex = this.roll(0,nTreasures-1);
        
        let key = treasures[treasureIndex];
        let treasure = itemVars.treasure[key];

        console.log(treasure);

        return JSON.parse(JSON.stringify(treasure));
    }

    applyModifier(item, modifier, recursion = false){
        for (const [key, value] of Object.entries(modifier)){
            switch(key){
                case 'name':
                    item[key] = value + ' ' + item[key];
                    break;
                case 'damage':
                case 'stunTime':
                case 'weight':
                    if(item[key]){
                        item[key] += value;
                        item[key] = Math.max(1,item[key]);
                    }
                    break;
                case 'flimsy':
                    item[key] = true;
                    break;
                case 'blunt':
                case 'edged':
                    if(item.type[key] || (item.type['sword'] && key == 'edged')){
                        this.applyModifier(item, value,true);
                    }
                    break;
                case 'value':
                    if(item[key]){
                        item[key] *= value;
                        item[key] += .5;
                        item[key] = Math.floor(item[key]);
                    }
            }
        }
        let lootManager = this;
        //apply modifier to special strikes
        ['jab','swing','strafe'].forEach(function(val){
            //only do this once!
            if(item[val] && !recursion){
                lootManager.applyModifier(item[val], modifier);
            }
        })
    }

    roll(min,max){
        return Math.floor(Math.random()*(max-min+1))+min;
    }
}