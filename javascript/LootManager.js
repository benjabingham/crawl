class LootManager{
    constructor(){
        this.weaponMaterials = {
            wood:{
                name:'wooden',
                flimsy:true,
                stunTime: -1,
                edged:{
                    damage:-5
                },
                blunt:{
                    damage:-2
                }
            },
            stone:{
                name:'stone',
                flimsy:true,
                damage:2,
                weight:2,
                stunTime:3
            },
            lead:{
                name:'lead',
                weight:1,
                stunTime:2,
                blunt:{
                    damage:5
                }
            },
            steel:{
                name:'steel',
                edged:{
                    damage:2
                }
            },
            ironwood:{
                name:'ironwood',
                stunTime:2,
                blunt:{
                    damage:6
                },
                edged:{
                    damage:2
                }
            },
            lightsteel:{
                name:'lightsteel',
                weight:-1,
                stunTime:-1,
                blunt:{
                    damage:-2
                },
                edged:{
                    damage:2
                }
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
                }
            },
            Adamantine:{
                name:'adamantine',
                weight:-1,
                edged:{
                    damage:2
                }
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
                }
            },
            craftTiers:{
                poor:{
                    name:'poor',
                    flimsy:true,
                    variance:{
                        positive:0,
                        negative:50
                    }
                },
                rustic:{
                    name:'rustic',
                    variance:{
                        positive:20,
                        negative:50
                    }
                },
                artisan:{
                    name:'artisan',
                    variance:{
                        positive:30,
                        negative:30
                    }
                },
                materwork:{
                    name:'masterwork',
                    variance:{
                        positive:50,
                        negative:10
                    }
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
    }

    getTreasureLoot(tier){

    }

    getWeaponLoot(tier){
        let weapon = this.getWeapon();
        let weaponMaterial = this.getWeaponMaterial(tier);
        this.applyWeaponModifier(weapon, weaponMaterial);
        this.getIsWorn(weapon, tier);

        return weapon;
    }

    getWeaponMaterial(tier){
        let materials = Object.keys(this.weaponMaterials);
        console.log(materials);
        let nMaterials = materials.length;
        let nRolls = tier-3;
        console.log(nRolls);
        let maxMinFunc = (nRolls > 0) ? Math.max : Math.min;
        console.log(maxMinFunc);
        nRolls = Math.abs(nRolls);
        let materialIndex = this.roll(0,nMaterials-1);
        console.log(materialIndex);
        for(let i = 0; i < nRolls; i++){
            let newIndex = this.roll(0,nMaterials-1);
            console.log(newIndex);
            materialIndex = maxMinFunc(materialIndex,newIndex);
            console.log(materialIndex);
        }
        let key = materials[materialIndex];
        let material = this.weaponMaterials[key];

        return material;
    }

    getIsWorn(weapon, tier){
        let nonWornChance = 20 * tier;
        if(this.roll(0,99) >= nonWornChance){
            this.applyWeaponModifier(weapon,this.weaponModifiers.worn);
        }
    }

    getWeapon(){
        let weapons = Object.keys(itemVars.weapons);
        let nWeapons = weapons.length;
        let weaponIndex = this.roll(0,nWeapons-1);
        
        let key = weapons[weaponIndex];
        let weapon = itemVars.weapons[key];

        return JSON.parse(JSON.stringify(weapon));
    }

    applyWeaponModifier(weapon, modifier){
        console.log(modifier);
        for (const [key, value] of Object.entries(modifier)){
            switch(key){
                case 'name':
                    weapon[key] = value + ' ' + weapon[key];
                    break;
                case 'damage':
                case 'stunTime':
                case 'weight':
                    weapon[key] += value;
                    weapon[key] = Math.max(1,weapon[key]);
                    break;
                case 'flimsy':
                    weapon[key] = true;
                    break;
                case 'blunt':
                case 'edged':
                    if(weapon.type[key] == true){
                        this.applyWeaponModifier(weapon, value);
                    }
                    break;
            }
        }
    }

    roll(min,max){
        return Math.floor(Math.random()*(max+1))+min;
    }
}