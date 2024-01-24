class Player {
    constructor(){
        this.staminaMax = 10;
        this.stamina = this.staminaMax;

        this.healthMax = 10;
        this.health = this.healthMax;
    }

    get staminaPercent(){
        return Math.floor((this.stamina/this.staminaMax)*100);
    }

    get healthPercent(){
        return Math.floor((this.health/this.healthMax)*100);
    }

    changeStamina(n){
        this.stamina = this.stamina+n;
        this.stamina = Math.min(this.staminaMax,this.stamina);
        this.stamina = Math.max(0,this.stamina)
    }

    changeHealth(n){
        this.health = this.health+n;
        this.health = Math.min(this.healthMax,this.health);
        this.health = Math.max(0,this.health)
    }


    setPlayerInfo(playerInfo){
        for (const [key, value] of Object.entries(playerInfo)) {
            this[key] = value;
          }
    }

}