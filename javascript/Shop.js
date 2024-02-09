class Shop{
    constructor(gameMaster){
        this.lootManager = new LootManager();
        this.inventory = [];
        this.essentials = [];
        this.stockInventory();
        this.getEssentials();
        this.gameMaster = gameMaster;
    }

    getEssentials(){
        let oilFlask = JSON.parse(JSON.stringify(itemVars.fuel.oilFlask));
        this.essentials.push(oilFlask);
        this.essentials.forEach((item)=>{
            item.price = item.value * 3;
        })
    }

    getInventory(){
        let inventory = [];
        this.essentials.forEach((item)=>{
            if(item){
                inventory.push(item);
            }
        })
        this.inventory.forEach((item)=>{
            if(item){
                inventory.push(item);
            }
        })
        
        return inventory;
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

    stockInventory(){
        let tiers = [0,1,1,2,3];
        let slot = 0;
        tiers.forEach((tier)=>{
            let priceMultiplier = this.lootManager.roll(1,4) + tier;
            let item = this.lootManager.getWeaponLoot(tier);
            item.price = Math.max(item.value,1) * priceMultiplier;
            item.slot = slot;
            this.inventory.push(item);
            slot++;
        })
    }

    buyItem(slot){
        let player = this.gameMaster.player;
        let item = this.inventory[slot];
        if (item.price > this.gameMaster.player.gold){
            return false;
        }
        this.gameMaster.player.gold -= item.price;
        if(slot != -1){
            this.inventory[slot] = false;
        }
        player.inventory.push(item);
        player.inventoryCleanup();
        this.inventoryCleanup();
    }

    sellItem(slot){
        let player = this.gameMaster.player;
        let item = player.inventory[slot];
        player.inventory[slot] = false;
        player.gold += item.value;
        player.inventoryCleanup();
    }

}