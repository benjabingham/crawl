class EntityManager{
    constructor(player, log, gameMaster){
        this.entities = {};
        this.entityCounter = 0;
        this.translations = [
            {x:0,y:-1},
            {x:1,y:-1},
            {x:1,y:0},
            {x:1,y:1},
            {x:0,y:1},
            {x:-1,y:1},
            {x:-1,y:0},
            {x:-1,y:-1}
        ];
        this.board = new Board(this);
        this.player = player;
        this.log = log;
        this.history = [];
        this.historyLimit = 10;

        this.gameMaster = gameMaster;

        this.lootManager = new LootManager();

        this.currentMap;
    }

    wipeEntities(){
        this.entities = {};
        this.entityCounter = 0;
        this.history = [];
        this.historyLimit = 10;
    }

    playerInit(x=0,y=0){
        this.entities.player = {
            x:x,
            y:y,
            symbol:"☺",
            id: "player"
        };
        this.swordInit("player");
    }
    

    entityInit(symbol, behavior, x=0,y=0, hitDice=1, damage=0, behaviorInfo = {}, name = "", inventorySlots = 10){
        let threshold = Math.max(this.rollN(hitDice,1,8),1);
        let id = this.entityCounter;
        if (!name){
            name = id;
        }
        let entity = {
            x : x,
            y: y,
            symbol: symbol,
            behavior: behavior,
            behaviorInfo: behaviorInfo,
            id:id,
            stunned:0,
            mortal:0,
            threshold:threshold,
            damage:damage,
            name:name,
            inventorySlots:inventorySlots
        }
        this.entityCounter++;
        this.entities[id] = entity;
        //console.log(entity);
    
        return this.entities[id];
    }

    swordInit(owner, rotation = 3){
        let sword = this.entityInit('*', 'sword', -1,-1);
        let id = sword.id;
        sword.owner = owner;
        sword.equipped = this.player.equipped;
        sword.rotation = rotation;

        this.setEntity(id, sword);

        this.setProperty(owner,'sword', id);

        if(sword.equipped){
            //this.equipWeapon(this.player.equipped);
        }
        
        //this.switchWeapon('stick');
        this.placeSword(id, this.player);
    
        return id;
    }

    getSwordSymbol(rotation){
        let symbol = '|'
        if (rotation % 4 == 1){
            symbol = '/';
        }else if (rotation % 4 == 2){
            symbol = '-';
        }else if (rotation % 4 == 3){
            symbol = '\\';
        }
    
        return symbol;
    }

    placeSword(id){
        let sword = this.getEntity(id);
        console.log(sword);
        if(!sword.equipped){
            return;
        }
        let ownerId = sword.owner;
        let owner = this.getEntity(ownerId);
        let swordPosition = {x:sword.x, y:sword.y};

        let rotation = sword.rotation;
        this.setProperty(id, 'symbol', this.getSwordSymbol(rotation));
        
        let translation = this.translations[rotation];
        let x = owner.x + translation.x;
        let y = owner.y + translation.y;
    
        if(this.board.isOccupiedSpace(x,y)){
            let target = this.board.itemAt(x,y);
            if(target.id != id && target.behavior != 'wall'){
                this.attack(sword,target);
                if (ownerId == 'player'){
                    
                    let strikeType = this.getStrikeType(sword);
                    let weight;
                    if(sword[strikeType]){
                        weight = sword[strikeType].weight;
                        console.log("..."+weight);

                    }else{
                        weight = sword.weight;
                        console.log(weight);

                    }
                    console.log(weight);
                    this.player.changeStamina(weight * -1);
                    
                }
            }
        }
        //if sword hasn't been placed somewhere else as result of attack...
        if(rotation == sword.rotation && sword.x == swordPosition.x && sword.y == swordPosition.y && sword.equipped){
            this.setPosition(id,x,y);
        }
        if (this.player.stamina < 0){
            this.cancelAction();
            console.log('ACTION CANCELLED');
        }
    }

    degradeItem(item, modifier = 0, multiplier = 1){
        let degradeChance = (item.flimsy) + modifier;
        let random = (Math.random()*100) * (1/multiplier);
        if(random < degradeChance){
            if(!item.worn){
                this.lootManager.applyModifier(this.player.equipped,this.lootManager.weaponModifiers.worn);
                this.lootManager.applyModifier(item,this.lootManager.weaponModifiers.worn);

                this.transmitMessage(item.name + ' is showing wear!', 'urgent');
            }else{
                this.lootManager.breakWeapon(this.player.equipped);
                this.player.unequipWeapon(this.gameMaster);
                this.transmitMessage(item.name + ' has broken!', 'urgent');
                this.removeEntity(item.id);
            }
        }
    }

    getStrikeType(sword){
        let owner = sword.owner;
        let ownerPos = this.getEntity(owner);
        let lastSwordPos = this.history[this.history.length-1].entities[sword.id];
        let lastOwnerPos = this.history[this.history.length-1].entities[owner];
        if(lastSwordPos.rotation != sword.rotation){
            return "swing";
        }
        if((lastSwordPos.x == ownerPos.x || lastSwordPos.y == ownerPos.y) || (lastOwnerPos.x == ownerPos.x && lastOwnerPos.y == ownerPos.y)){
            return "jab";
        }

        return "strafe";
    }

    moveEntity(id, x, y){
        let entity = this.getEntity(id);
        x += entity.x;
        y += entity.y;
    
        if(this.board.isSpace(x,y) && this.board.isOpenSpace(x,y)){
            this.setPosition(id,x,y);
            return true;
        }else if(this.board.itemAt(x,y) && this.board.itemAt(x,y).container){
            this.lootContainer(entity,this.board.itemAt(x,y));
        }else if(!this.board.isSpace(x,y) && id == "player"){
            this.gameMaster.travel(x,y);
        }

        return false;
    }

    rotateSword(id, direction){
        let rotation = this.getProperty(id, 'rotation');
        rotation += 8 + direction;
        rotation %= 8;
    
        this.setProperty(id, 'rotation', rotation);
    }

    chaseNatural(id, behaviorInfo){
        let entity = this.getEntity(id);
        let playerEntity = this.getEntity('player');
        //creature is less focused the further they are
        let focus = behaviorInfo.focus;
        focus -= this.getDistance(entity, playerEntity);
        if(!this.hasPlayerLos(entity)){
            focus -= 20;
        }
        focus =  Math.max(focus, 4);
        let x = 0;
        let y = 0;

        //the higher focus is, the less likely the creature is to move randomly
        let random = this.roll(1,focus);
        if(random == 1){
            x = -1;
        }else if (random == 2){
            x = 1;
        }else if (random == 3 || random == 4){
            //do nothing
        }else if(entity.x > playerEntity.x){
            x = -1;
        }else if (entity.x < playerEntity.x){
            x = 1;
        }
        
        random = this.roll(1,focus);
        if(random == 1){
            y = -1;
        }else if (random == 2){
            y = 1;
        }else if (random == 3 || random == 4){
            //do nothing
        }else if(entity.y > playerEntity.y){
            y = -1;
        }else if (entity.y < playerEntity.y){
            y = 1;
        }
    
        let targetX = entity.x+x;
        let targetY = entity.y+y
        let targetItem = this.board.itemAt(targetX, targetY);

        if(targetItem.id == "player" || targetItem.behavior == "dead" || targetItem.behavior == "wall"){
            this.attack(entity,targetItem);
        }

        if(targetItem.behavior == "sword" && !this.board.wallAt(targetX, targetY)){
            this.beat(entity,targetItem);
        }
    
        if(!this.moveEntity(id, x, y, this.board)){
            this.moveEntity(id, 0, y, this.board);
            this.moveEntity(id, x, 0, this.board);
        }
        
    }

    attack(attacker,target){
        let damage = attacker.damage;
        let stunTime = attacker.stunTime;
        if(attacker.behavior == 'sword'){
            let strikeType = this.getStrikeType(attacker);
            if(attacker[strikeType]){
                damage = attacker[strikeType].damage;
                stunTime = attacker[strikeType].stunTime;
            }
        }
        let damageDice = 1;
        if(target.stunned){
            damageDice=2;
        }
        let stunAdded = 0;
        if (stunTime){
            stunAdded = this.roll(1,stunTime);
        }
        let mortality = this.rollN(damageDice,0,damage);

        if (target.id == 'player'){
            this.transmitMessage(attacker.name+" attacks you!");
            this.player.changeHealth(mortality * -1);
        }else if(target.behavior == 'wall'){
            this.addMortality(target.id, mortality);
        }else{
            if(!target.dead){
                this.transmitMessage(target.name+" is struck!");
            }
            this.addStunTime(target.id,stunAdded);
            this.addMortality(target.id, mortality);
            this.knock(target.id, attacker.id);
            this.enrageAndDaze(target);   
            this.sturdy(attacker,target);
            console.log(target);
        }

        if(attacker.owner == 'player'){
            this.degradeItem(attacker,0,0.25);
        }
        
    }

    knock(knockedId, knockerId){
        let knocked = this.getEntity(knockedId);
        let knocker = this.getEntity(knockerId);
        let knockerPos;
        knockerPos = this.history[this.history.length-1].entities[knockerId];
        

        let direction = this.roll(0,7);
        let x = knockedId.x + this.translations[direction].x;
        let y = knockedId.y + this.translations[direction].y;
    
        let tries = 0;
        //space must be open AND further from attacker's last position
        let furtherSpace = (this.getOrthoDistance(knockerPos, knocked) < this.getOrthoDistance(knockerPos,{x:x, y:y}))
        let backupSpace = false;
        while((!this.board.isOpenSpace(x,y) || !furtherSpace ) && tries <= 8){
            if(this.board.isOpenSpace(x,y) && !backupSpace){
                backupSpace = {x:x, y:y};
            }

            direction = (direction+1) % 8;
            x = knocked.x + this.translations[direction].x;
            y = knocked.y + this.translations[direction].y;

            furtherSpace = (this.getOrthoDistance(knockerPos, knocked) < this.getOrthoDistance(knockerPos,{x:x, y:y}))
            tries++;
        }

        if(tries < 8){
            this.setPosition(knockedId,x,y)
        }else if (backupSpace){
            this.setPosition(knockedId,backupSpace.x,backupSpace.y);
        }else{
            this.transmitMessage(knocked.name + " is cornered!", 'pos');
            if(knocker.behavior == 'sword'){
                this.setToLastPosition(knocker.owner);
                this.setToLastPosition(knockerId);
                this.placeSword(knockerId)
                //this.knockSword(knockerId);
            }
        }
    }

    knockSword(swordId){
        let sword = this.getEntity(swordId);
        let owner = this.getEntity(sword.owner);
        //direction is either 1 or -1
        let direction = (this.roll(0,1) * 2) - 1;
        let rotation = (sword.rotation + 8 + direction) % 8;
        let translation = this.translations[rotation];
        let x = owner.x + translation.x;
        let y = owner.y + translation.y;
        let counter = 1;
        while((this.board.itemAt(x,y).behavior != 'wall' && this.board.itemAt(x,y)) && counter < 3){
            rotation = (sword.rotation + 8 + direction) % 8;
            translation = this.translations[rotation];
            x = owner.x + translation.x;
            y = owner.y + translation.y;
        
            counter++;
        }

        if(this.board.itemAt(x,y).behavior == 'wall' || !this.board.itemAt(x,y)){
            this.transmitMessage('sword knocked!', 'danger');
            sword.rotation = rotation;
            this.placeSword(sword.id);
            
        }else{
            console.log('sword knock failed');
        }


    }

    findSwordMiddle(sword,pos1,pos2){
        let owner = this.getEntity(sword.owner);
        //direction is either 1 or -1
        let direction = (this.roll(0,1) * 2) - 1;
        let rotation = (sword.rotation + 8 + direction) % 8;
        let translation = this.translations[rotation];
        let x = owner.x + translation.x;
        let y = owner.y + translation.y;

        let bestPos = {x:x, y:y};
        let bestRotation = rotation;
        let bestDistance = this.getOrthoDistance({x:x,y:y},pos1)+this.getOrthoDistance({x:x,y:y},pos2)

        for(let i = 0; i < 8; i++){
            let distance = this.getOrthoDistance({x:x,y:y},pos1)+this.getOrthoDistance({x:x,y:y},pos2);

            let validSpace = (this.board.itemAt(x,y).behavior == 'wall' || !this.board.itemAt(x,y))
            if(validSpace){
                if (distance < bestDistance){
                    bestDistance = distance;
                    bestPos = {x:x, y:y};
                    bestRotation = rotation;
                }
            }
            rotation = (rotation + 8 + direction) % 8;
            translation = this.translations[rotation];
            x = owner.x + translation.x;
            y = owner.y + translation.y;
        }

        sword.rotation = bestRotation;
        this.placeSword(sword.id);
    }

    enrageAndDaze(entity){
        if(!entity.behaviorInfo || entity.dead){
            return;
        }
        let enrageChance = entity.behaviorInfo.enrage;
        let dazeChance = entity.behaviorInfo.daze;

        let random = this.roll(1,100);
        if(random <= enrageChance){
            this.transmitMessage(entity.name+" is enraged!", 'danger');
            entity.behaviorInfo.focus += 5;
            entity.behaviorInfo.slow -= 3;
            if(!entity.behaviorInfo.beat){
                entity.behaviorInfo.beat = 0;
            }
            entity.behaviorInfo.beat += 5;
            if(!entity.behaviorInfo.sturdy){
                entity.behaviorInfo.sturdy = 0;
            }
            entity.sturdy += 5;
            entity.stunned -= Math.max(this.roll(0,entity.stunned),0);
        }
        random = this.roll(1,100);
        if(random <= dazeChance){
            this.transmitMessage(entity.name+" is dazed!", 'pos');
            entity.behaviorInfo.focus -= 7;
            if(!entity.behaviorInfo.slow){
                entity.behaviorInfo.slow = 0;
            }
            entity.behaviorInfo.slow += 7;
            entity.sturdy -= 7;
            entity.beat -=7;
            entity.stunned ++;
        }
    }

    //has beat% chance to beat sword out of way.
    //also beats sword out of way if damage exceeds player stamina.
    beat(entity, sword){
        console.log(entity);
        if(sword.owner == 'player'){
            this.transmitMessage(entity.name+" attacks your weapon...");
            let damage = this.roll(0,entity.damage);
            this.player.changeStamina(damage * -1);
            if(damage < 1){
                this.degradeItem(sword, damage*0.25, 1);
            }
        }
        let beatChance = 0;
        if(entity.behaviorInfor){
            beatChance = entity.behaviorInfo.beat;
        }

        let random = this.roll(1,100);
        console.log(this.player.stamina < 0);
        if(random <= beatChance || this.player.stamina < 0){
            this.player.changeStamina(0);
            this.transmitMessage(entity.name+" knocks your weapon out of the way!", 'danger');
            this.knockSword(sword.id);
        }else if(this.player.equipped){
            this.transmitMessage("You hold steady!");

        }
        
    }

    sturdy(attacker,target){
        if(!target.behaviorInfor){
            return;
        }
        let sturdyChance = target.behaviorInfo.sturdy;

        let random = this.roll(1,100);
        if (random <= sturdyChance){
            /*
            this.setToLastPosition(attacker.owner);
            this.setToLastPosition(attacker.id);
            this.setToLastPosition(target.id);
            this.placeSword(attacker.id);
            */
            this.removeEntity(attacker.id);
            this.setToLastPosition(target.id);
            let lastSwordPos = this.history[this.history.length-1].entities[attacker.id];
            this.findSwordMiddle(attacker,target,lastSwordPos);
            if(!target.dead){
                this.transmitMessage(target.name+" holds its footing!", 'danger');
            }
        }
    }

    triggerBehaviors(){
        //console.log(board);
        for (const [k,entity] of Object.entries(this.entities)){
            //console.log(entity);
            let random = this.roll(1,100);
            let skip = entity.stunned
            if(entity.behaviorInfo){
                skip += (random <= entity.behaviorInfo.slow);
            }
            
            if (!skip){
                switch(entity.behavior){
                    case "chase":
                        this.chaseNatural(k, entity.behaviorInfo);
                        break;
                    case "sword":
                        //player = this.placeSword(k,board, player);
                        break;
                    case "dead":
                        //entity.tempSymbol = 'x';
                        break;
                    default:
                }
            }
            if (entity.behavior != 'dead'){
                //console.log('enemy is stunned');
                if(entity.stunned > 0){
                    entity.stunned--;
                }
                if(entity.stunned > 0){
                    entity.tempSymbol = entity.symbol.toLowerCase();
                }else{
                    entity.tempSymbol = false;
                }
            }else{
                //entity.tempSymbol = 'x';
            }



            if((entity.mortal - entity.threshold) >= entity.threshold/2 && !entity.obliterated){
                //console.log('obliterated');
                this.dropItems(entity);
                entity.obliterated = true;
                this.setPosition(entity.id,-1,-1);

            }
        }
    }

    reapWounded(){
        for (const [k,entity] of Object.entries(this.entities)){
            if (entity.mortal > entity.threshold && entity.behavior != 'dead'){
                this.kill(entity);
            }
        }
        //console.log(player.health);
        if(this.player.health <= 0){
            this.setProperty('player','symbol', 'x');
            this.setProperty('player','behavior', 'dead');
            this.transmitMessage('you are dead.', 'urgent');
        }
        //console.log('Stamina: ' +player.stamina);
        //console.log('Health: ' + player.health);
    }

    kill(entity){
        this.transmitMessage(entity.name+" is slain!", 'win');
        entity.name += " corpse";
        entity.behavior = 'dead';
        entity.dead = true;
        entity.tempSymbol = 'x';
        entity.stunned = 0;
        entity.container = true;
        if(entity.tiny){
            entity.item = true;
            entity.walkable = true;
            entity.tempSymbol = '*';
        }
        let roster = this.currentMap.roster;
        roster[entity.index].alive = false;
    };

    equipWeapon(weapon){
        let id = this.getProperty("player", "sword");
        let sword = this.getEntity(id);

        let x = sword.x;
        let y = sword.y;
        let rotation = sword.rotation;
        let owner = sword.owner;
        let symbol = sword.symbol;
        let behavior = sword.behavior;

        console.log(owner);

        this.entities[id] = JSON.parse(JSON.stringify(weapon));
        sword = this.getEntity(id);
        sword.x = x;
        sword.y = y;
        sword.rotation = rotation;
        sword.owner = owner;
        sword.symbol = symbol;
        sword.id = id;
        sword.behavior = behavior;
        sword.equipped = true;
        console.log(sword);
        
        this.transmitMessage('equipped weapon: '+weapon.name);
    }

    unequipWeapon(){
        let sword = this.getEntity(this.entities.player.sword);
        sword.equipped = false;
    }

    monsterInit(monsterName,x,y){
        let id = this.entityCounter;
        this.entityCounter++;
        let monster = JSON.parse(JSON.stringify(monsterVars[monsterName]));

        let threshold = Math.max(this.rollN(monster.hitDice,1,8),1);

        monster.x = x;
        monster.y = y;
        monster.id = id;
        monster.threshold = threshold;
        monster.stunned = 0;
        monster.mortal = 0;

        this.entities[id] = monster;

        return this.entities[id];
    }

    dropItem(item,x,y){
        if(!item){
            return false;
        }
        item.x = x;
        item.y = y;
        item.item = true;
        item.walkable = true;
        item.id = this.entityCounter;
        item.dropTurn = this.log.turnCounter;
        if (!item.symbol){
            item.symbol = '*';
        }
        this.entities[this.entityCounter] = item;
        this.entityCounter++;
        console.log(item);
    }

    dropItems(entity){
        let inventory = entity.inventory
        if(!inventory){
            return false;
        }

        inventory.forEach((item) =>{
            this.dropItem(item, entity.x, entity.y);
        })
    }

    lootContainer(looter,container){
        if(!container.inventory){
            return false;
        }
        if(looter.id == 'player'){
            looter = this.player;
        }
        if(!looter.inventory){
            looter.inventory = [];
        }
        container.inventory.forEach((item,i) =>{
            if(item && (looter.inventory.length < looter.inventorySlots)){
                let obj = item;
                let obliterated = {id:obj.id, obliterated:true, x:-1, y:-1};
                this.entities[obj.id] = obliterated;
                console.log(obj);
                obj.walkable = false;
                obj.inventory = false;
                obj.item = false;
                looter.inventory.push(obj);
                container.inventory[i] = false;
            }
        })
    }

    pickUpItem(entity,item){
        if(!entity || entity.behavior == 'sword' || (item.dropTurn >= this.log.turnCounter && !entity.item) || this.skipBehaviors){
            return false;
        }
        if(entity.id == 'player'){
            entity = this.player;
        }
        //console.log('pickup');
        //console.log(JSON.parse(JSON.stringify(item)));
        let items = [];
        if(item.inventory){
            item.inventory.forEach((obj) =>{
                if(!obj.obliterated){
                    items.push(obj);
                }
            })
        }

        items.push(item);
        
        if(!entity.inventory){
            entity.inventory = [];
        }
        items.forEach((obj)=>{
            if(entity.inventory.length < entity.inventorySlots || entity.item){
                let obliterated = {id:obj.id, obliterated:true, x:-1, y:-1};
                this.entities[obj.id] = obliterated;
                obj.walkable = false;
                obj.inventory = false;
                obj.item = false;
                entity.inventory.push(obj);
            }
        })
        console.log(entity);
    }

    saveSnapshot(){
        let entities = JSON.parse(JSON.stringify(this.entities));
        let playerJson = JSON.parse(JSON.stringify(this.player));
        this.history.push({
            entities:entities,
            player:playerJson
        });
        if(this.history.length > this.historyLimit){
            this.history.shift();
        }
    }

    canRewind(){
        return this.history.length > 1 && this.player.luck > 0;
    }

    rewind(){
        let luck = this.player.luck-1;
        this.history.pop();
        let snapshot = this.history.pop();
        this.entities = snapshot.entities;
        this.board.placeEntities(this.log);
        
        //console.log(snapshot.player);

        this.player.setPlayerInfo(snapshot.player);
        if(this.player.equipped){
            this.player.equipped = this.player.inventory[this.player.equipped.slot];
        }
        this.player.luck = Math.max(0,luck);
    }

    cancelAction(){
        this.log.addNotice('Action Halted');
        if(this.player.stamina < 0){
            this.log.addNotice('Out Of Stamina')
        }
        let snapshot = this.history.pop();
        this.entities = snapshot.entities;
        this.board.placeEntities(this.log);
        //console.log(snapshot.player);

        this.player.setPlayerInfo(snapshot.player);  
        this.skipBehaviors = true; 

        let swordId = this.getEntity('player').sword;
        this.board.calculateLosArray(this.getEntity('player'));
        this.placeSword(swordId);
    }

    setToLastPosition(id){
        let lastPosition = this.history[this.history.length-1].entities[id];
        let entity = this.getEntity(id);
        if (entity.behavior == "sword"){
            entity.rotation = lastPosition.rotation;
        }else{
            this.setPosition(id,lastPosition.x,lastPosition.y)
        }
    }

    roll(min,max){
        return Math.floor(Math.random()*(max-min+1))+min;
    }
    
    rollN(n, min,max){
        let sum = 0;
        for(let i = 0; i < n; i++){
            sum += this.roll(min,max);
        }
        return sum;
    }

    loadRoom(json){
        console.log(json);
        this.gameMaster.save.catchUpMap(json.name);
        this.board.setDimensions(json.width,json.height)
        this.board.boardInit();
        console.log(json.destinations);
        this.board.destinations = json.destinations;
        json.roster.forEach((entity)=>{
            //console.log(entity);
            let value = entity.value;
            let entityObj;
            let x = entity.x;
            let y = entity.y;
            let random = this.roll(0,99);
            let spawn = (random < entity.spawnChance || !entity.spawnChance);
            if(value == "player"){
                this.playerInit(x, y)
            }else if(value.monster){
                if(entity.alive && spawn){
                    entityObj = this.monsterInit(value.monster,x,y);
                }
            }else{
                if(entity.alive && spawn){
                    entityObj = this.entityInit(value.symbol, value.behavior, x, y, value.hitDice,value.damage, value.behaviorInfo, value.name);
                }
            }
            if(entityObj){
                entityObj.index = entity.index;
                if(entityObj.behavior != 'wall'){
                    console.log(entity);
                    if(!entity.inventory || entity.inventory.length == 0){
                        console.log('give inventory');
                        this.lootManager.giveMonsterLoot(entityObj);
                        entity.inventory = entityObj.inventory;
                    }
                    console.log('take inventory');
                    entityObj.inventory = entity.inventory;
                    
                }
            }
        })

        this.currentMap = json;
        
    }

    updateSavedInventories(){
        for (const [key, entity] of Object.entries(this.entities)) { 
            if(entity.index){
                let entitySave = this.currentMap.roster[entity.index];
                entitySave.inventory = entity.inventory;
            }
        }
    }

    setProperty(id, Property, value){
        this.entities[id][Property] = value;
    }

    setPosition(id,x,y){
        let entity = this.getEntity(id);
        this.board.clearSpace(entity.x,entity.y)
        this.setProperty(id, 'x', x);
        this.setProperty(id, 'y', y);
        this.board.placeEntity(this.getEntity(id),x,y)
        //console.log(this.entities);
    }

    getPosition(id){
        let x = this.getProperty(id, 'x');
        let y = this.getProperty(id, 'y');

        return{
            x:x,
            y:y,
            positionString:x + ', '+y
        }
    }

    getProperty(id, Property){
        return this.entities[id][Property];
    }

    getEntity(id){
        return this.entities[id];
    }

    setEntity(id, entity){
        this.entities[id] = entity;
    }

    removeEntity(id){
        let entity = this.getEntity(id);
        let x = entity.x;
        let y = entity.y;
        this.board.clearSpace(x, y);
        this.setPosition(id,-1,-1);
        this.board.updateSpace(x,y);
    }

    addStunTime(id, stunTime){
        stunTime +=this.getProperty(id, 'stunned');
        this.setProperty(id, 'stunned', stunTime);
    }

    addMortality(id, mortal){
        mortal += Math.max(this.getProperty(id, 'mortal'),0);
        this.setProperty(id, 'mortal', mortal);
    }

    getDistance(point1, point2){
        let xdif = Math.abs(point1.x - point2.x);
        let ydif = Math.abs(point1.y - point2.y);

        return Math.max(xdif, ydif);
    }

    getOrthoDistance(point1, point2){
        let xdif = Math.abs(point1.x - point2.x);
        let ydif = Math.abs(point1.y - point2.y);

        return xdif + ydif;
    }

    transmitMessage(message, messageClass = false, offset = 0){
        this.log.addMessage(message, messageClass, offset);
        console.log(message);
    }

    hasPlayerLos(entity){
        return this.board.getLineOfSight(entity.x,entity.y);
    }

}