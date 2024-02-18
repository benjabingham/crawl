class Player {
    constructor(){
        this.staminaMax = 10;
        this.stamina = this.staminaMax;

        this.healthMax = 10;
        this.health = this.healthMax;

        this.luckMax = 10;
        this.luck = this.luckMax;

        this.nourishmentMax = 10;
        this.nourishment = this.nourishmentMax;

        this.light = 0;
        this.lightMax = 8;
        this.lightTime = 0;
        
        this.inventorySlots = 10;
        this.inventory = [
            {
                usable:true,
                name: "oil flask",
                fuel:true,
                light:2,
                uses:3
            }
        ];
        this.inventoryCleanup();
        this.gold = 15;
        this.equipped = false;
        console.log('new player');
    }

    get staminaPercent(){
        return Math.floor((this.stamina/this.staminaMax)*100);
    }

    get healthPercent(){
        return Math.floor((this.health/this.healthMax)*100);
    }

    get luckPercent(){
        return Math.floor((this.luck/this.luckMax)*100);

    }

    get nourishmentLevel(){
        let level;
        let nourishment = this.nourishment;
        if(nourishment == 0){
            level = 0;
        }else if(nourishment < 4){
            level = 1;
        }else if (nourishment == 10){
            level = 3;
        }else{
            level = 2;
        }

        return level;
    }

    rest(){
        let health = this.nourishmentLevel-1;
        this.changeHealth(health);

        let luck = Math.floor(Math.random()*2)
        this.changeLuck(luck);

        this.changeNourishment(-5);

        console.log(this.nourishment);
        console.log(this.nourishmentLevel);
    }


    gainStamina(){
        let stamina;
        if(this.nourishment < 4){
            stamina = 1;
        }else{
            stamina = 2;
        }
        let random = Math.random()*100;
        if(this.nourishment == 0 && random < 50){
            stamina--;
        }
        if(this.nourishment ==10 && random < 50){
            stamina++;
        }

        this.changeStamina(stamina);
    }

    changeStamina(n){
        this.stamina = Math.max(0,this.stamina)
        this.stamina = this.stamina+n;
        this.stamina = Math.min(this.staminaMax,this.stamina);
    }

    changeHealth(n){
        this.health = this.health+n;
        this.health = Math.min(this.healthMax,this.health);
        this.health = Math.max(0,this.health)
    }

    changeLuck(n){
        this.luck = this.luck+n;
        this.luck = Math.min(this.luckMax,this.luck);
        this.luck = Math.max(0,this.luck)
    }

    changeNourishment(n){
        this.nourishment = this.nourishment+n;
        if(this.nourishment > this.nourishmentMax){
            this.changeLuck(1);
        }
        this.nourishment = Math.min(this.nourishmentMax,this.nourishment);
        this.nourishment = Math.max(0,this.nourishment)
    }


    setPlayerInfo(playerInfo){
        for (const [key, value] of Object.entries(playerInfo)) {
            this[key] = value;
          }
    }

    reset(){
        this.staminaMax = 10;
        this.stamina = this.staminaMax;

        this.healthMax = 10;
        this.health = this.healthMax;
    }

    useItem(item,gameMaster){
        if(!item){
            return false;
        }
        if(item.fuel){
            this.addFuel(item,gameMaster);
            return true;
        }else if(item.weapon && this.equipped.slot == item.slot){
           this.unequipWeapon(gameMaster);
           return true;
        }else if(item.weapon && !this.equipped){
            this.equipWeapon(item,gameMaster);
            return true;
        }

        return false;
    }

    equipWeapon(weapon,gameMaster){
        if(this.equipped){
            return;
        }
        this.equipped = weapon
        gameMaster.entityManager.equipWeapon(weapon);
    }

    unequipWeapon(gameMaster){
        if (!this.equipped){
            return;
        }
        this.equipped = false;
        gameMaster.entityManager.unequipWeapon();
    }

    addFuel(fuel,gameMaster){
        let slot = fuel.slot;
        this.light += fuel.light;
        this.light = Math.min(this.lightMax, this.light);
        this.lightTime = 0;

        this.consume(slot);
    }

    consume(slot){
        let item = this.inventory[slot];
        if(item.uses > 1){
            item.uses--;
        }else{
            this.inventory[slot] = false;
        }
    }

    lightDown(log){
        if(this.light < 1){
            return false;
        }
        this.lightTime += this.light;
        let random = Math.random()*1500;
        if (random < this.lightTime-150){
            this.light--;
            this.lightTime = 0;
            log.addMessage('Your light dims...');
        }
    }

    inventoryCleanup(){
        let newInventory = [];
        let slot = 0;
        this.inventory.forEach((item) =>{
            if(item){
                newInventory.push(item);
                item.slot = slot;
                slot++;
            }
        })
        this.inventory = newInventory;
    }

    dropItem(slot, gameMaster){
        let entityManager = gameMaster.entityManager;
        if(!this.inventory[slot]){
            return false;
        }
        if(this.equipped.slot == slot){
            this.unequipWeapon(gameMaster);
        }
        let playerEntity = entityManager.getEntity('player');
        entityManager.dropItem(this.inventory[slot],playerEntity.x,playerEntity.y);
        this.inventory[slot] = false;
    }

}