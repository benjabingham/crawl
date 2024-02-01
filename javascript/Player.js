class Player {
    constructor(){
        this.staminaMax = 10;
        this.stamina = this.staminaMax;

        this.healthMax = 10;
        this.health = this.healthMax;

        this.light = 0;
        this.lightMax = 8;

        this.inventory = [{
            weapon:true,
            name:"stick",
            damage:1,
            stunTime:1,
            weight:1
        },
        {
            weapon:true,
            name:"shortSword",
            damage:3,
            stunTime:2,
            weight:1
        },
        {
            usable:true,
            name: "oil flask",
            fuel:true,
            light:2,
            uses:3
        }];
        this.equipped = false;
        console.log('new player');
    }

    get staminaPercent(){
        return Math.floor((this.stamina/this.staminaMax)*100);
    }

    get healthPercent(){
        return Math.floor((this.health/this.healthMax)*100);
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

        console.log(this);
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

    use(item,slot, gameMaster){
        if(!item.usable){
            console.log("ITEM NOT USABLE");
            return;
        }
        if(item.fuel){
            this.addFuel(item,slot, gameMaster);
            this.ent
        }
    }

    addFuel(fuel,slot,gameMaster){
        this.light += fuel.light;
        this.light = Math.min(this.lightMax, this.light);

        this.consume(slot);
        gameMaster.resolvePlayerInput(false);
    }

    consume(slot){
        let item = this.inventory[slot];
        if(item.uses > 1){
            item.uses--;
        }else{
            this.inventory[slot] = false;
        }
    }

}