class Player {
    constructor(){
        this.staminaMax = 10;
        this.stamina = this.staminaMax;

        this.healthMax = 10;
        this.health = this.healthMax;

        this.light = 8;

        this.inventory = ["one","two","three","four","five","six"];
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

}