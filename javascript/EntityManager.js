class EntityManager{
    constructor(player){
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
        this.board = new Board();
        this.player = player;
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
    

    entityInit(symbol, behavior, x=0,y=0, hitDice=1, damage=0, behaviorInfo = {}, name = ""){
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
            name:name
        }
        this.entityCounter++;
        this.entities[id] = entity;
        //console.log(entity);
    
        return id;
    }

    swordInit(owner, rotation = 3){
        let id = this.entityInit('*', 'sword');
        let sword = this.getEntity(id);

        sword.owner = owner;
        sword.rotation = rotation;

        this.setEntity(id, sword);

        this.setProperty(owner,'sword', id);
        
        this.switchWeapon('stick');
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
                    this.player.changeStamina(sword.weight * -1);
                }
            }
        }
        //if sword hasn't been placed somewhere else as result of attack...
        if(rotation == sword.rotation && sword.x == swordPosition.x && sword.y == swordPosition.y){
            this.setPosition(id,x,y);
        }
    }

    moveEntity(id, x, y){
        let entity = this.getEntity(id);
        x += entity.x;
        y += entity.y;
    
        if(this.board.isSpace(x,y) && this.board.isOpenSpace(x,y)){
            this.setPosition(id,x,y);
            return true;
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
        if(!this.hasPlayerLos){
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
    
        if(!this.moveEntity(id, x, y, this.board)){
            this.moveEntity(id, 0, y, this.board);
            this.moveEntity(id, x, 0, this.board);
        }
        
    }

    attack(attacker,target){
        let stunTime = 0;
        if (attacker.stunTime){
            stunTime = this.roll(1,attacker.stunTime);
        }
        let mortality = this.roll(0,attacker.damage);

        if (target.id == 'player'){
            this.transmitMessage(attacker.name+" attacks you!");
            this.player.changeHealth(mortality * -1);
            //this.knockSword(target.sword);
        }else if(target.behavior == 'wall'){
            this.addMortality(mortality);
        }else{
            this.addStunTime(target.id,stunTime);
            this.addMortality(target.id, mortality);
            this.knock(target.id, attacker.id);
            this.enrageAndDaze(target);   
        }

        if(attacker.id == 'player' || attacker.owner == 'player'){
            this.transmitMessage(target.name+" is struck!");
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
        while((!this.board.isOpenSpace(x,y) || !furtherSpace ) && tries < 8){
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
            this.transmitMessage(knocked.name + "is cornered!");
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
            console.log(counter);
        
            counter++;
        }

        if(this.board.itemAt(x,y).behavior == 'wall' || !this.board.itemAt(x,y)){
            this.transmitMessage('sword knocked!');
            sword.rotation = rotation;
            this.placeSword(sword.id);
            
        }else{
            console.log('sword knock failed');
        }


    }

    enrageAndDaze(entity){
        let enrageChance = entity.behaviorInfo.enrage;
        let dazeChance = entity.behaviorInfo.daze;

        let random = this.roll(1,100);
        if(random <= enrageChance){
            this.transmitMessage(entity.name+" is enraged!");
            entity.behaviorInfo.focus += 5;
            entity.behaviorInfo.slow -= 3;
            entity.stunned -= Math.max(this.roll(0,entity.stunned),0);
        }
        random = this.roll(1,100);
        if(random <= dazeChance){
            this.transmitMessage(entity.name+" is dazed!");
            entity.behaviorInfo.focus -= 5;
            entity.behaviorInfo.slow += 5;
            entity.stunned ++;
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
                        this.chaseNatural(k, this.player, entity.behaviorInfo);
                        break;
                    case "sword":
                        //player = this.placeSword(k,board, player);
                        break;
                    case "dead":
                        entity.tempSymbol = 'x';
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
                entity.tempSymbol = 'x';
            }



            if((entity.mortal - entity.threshold) >= entity.threshold && !entity.obliterated){
                //console.log('obliterated');
                entity.obliterated = true;
                this.setPosition(entity.id,-1,-1);

            }
        }
    }

    reapWounded(){
        for (const [k,entity] of Object.entries(this.entities)){
            if (entity.stunned+entity.mortal > entity.threshold && entity.behavior != 'dead'){
                this.transmitMessage(entity.name+" is slain!");
                this.setProperty(k,'behavior', 'dead');
                this.setProperty(k,'tempSymbol', 'x');
                this.setProperty(k,'stunned', 0);
            }
        }
        //console.log(player.health);
        if(this.player.health <= 0){
            this.setProperty('player','symbol', 'x');
            this.setProperty('player','behavior', 'dead');
        }
        //console.log('Stamina: ' +player.stamina);
        //console.log('Health: ' + player.health);
    }

    switchWeapon(weaponName){
        let id = this.getProperty("player", "sword");
        let sword = this.getEntity(id);
        switch(weaponName){
            case "stick":
                sword.damage = 1;
                sword.stunTime = 1;
                sword.weight = 1;
                break;
            case "shortsword":
                sword.damage = 3;
                sword.stunTime = 2;
                sword.weight = 1;
                break;
            case "longsword":
                sword.damage = 4;
                sword.stunTime = 3;
                sword.weight = 2;
                break;
            case "rapier":
                sword.damage = 5;
                sword.stunTime = 2;
                sword.weight = 0;
                break;
            case "greatsword":
                sword.damage = 4;
                sword.stunTime = 6;
                sword.weight = 3;
                break;
            case "club":
                sword.damage = 1;
                sword.stunTime = 6;
                sword.weight = 2;
                break;
            case "maul":
                sword.damage = 3;
                sword.stunTime = 8;
                sword.weight = 3;
                break;
        }
        
        this.setEntity(id, sword);
        console.log("weapon: "+weaponName);
    }

    monsterInit(monsterName,x,y){
        let behavior = "chase";
        let symbol;
        let hitDice;
        let behaviorInfo;
        let damage;
        let name;
        switch(monsterName){
            case "goblin":
                symbol = "G";
                hitDice = 1;
                damage = 3;
                name = 'goblin';
                behaviorInfo = {
                    focus:15,
                    enrage:20,
                    daze:30
                }
                break;
            case "ogre":
                symbol = "O";
                hitDice = 3;
                damage = 8;
                name = 'ogre';
                behaviorInfo = {
                    focus:7,
                    enrage:75,
                    slow: 30
                }
                break;
            case "rat":
                symbol = "R";
                hitDice = 0;
                damage = 1;
                name = "rat";
                behaviorInfo = {
                    focus:15,   
                }
                break;
            case "dire wolf":
                symbol = "D";
                hitDice = 2;
                damage = 8;
                name = "dire wolf";
                behaviorInfo = {
                    focus:25,
                    enrage:75,
                    daze:15
                }
                break;
            case "dire rat":
                symbol = "D";
                hitDice = 1;
                damage = 4;
                name = "dire rat";
                behaviorInfo = {
                    focus:20,
                    enrage:30,
                    daze:30
                }
                break;
        }

        let id = this.entityInit(symbol, behavior,x, y, hitDice, damage, behaviorInfo, name)
    }

    saveSnapshot(){
        let entities = JSON.parse(JSON.stringify(this.entities));
        let playerJson = JSON.parse(JSON.stringify(this.player));
        console.log(playerJson);
        this.history.push({
            entities:entities,
            player:playerJson
        });
        if(this.history.length > this.historyLimit){
            this.history.shift();
        }
    }

    canRewind(){
        //console.log(this.history);
        return this.history.length > 1;
    }

    rewind(){
        this.history.pop();
        let snapshot = this.history.pop();
        this.entities = snapshot.entities;
        this.board.placeEntities(this.entities);
        //console.log(snapshot.player);

        this.player.setPlayerInfo(snapshot.player);
    }

    cancelAction(){

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
        return Math.floor(Math.random()*(max+1))+min;
    }
    
    rollN(n, min,max){
        let sum = 0;
        for(let i = 0; i < n; i++){
            sum += this.roll(min,max);
        }
        return sum;
    }

    loadRoom(json){
        this.board.setDimensions(json.width,json.height)
        this.board.boardInit;
        for(let y=0;y<this.board.height;y++){
            for(let x=0;x<this.board.width;x++){
                let entityCode = json.board[y][x];
                if(entityCode){
                    let entity = json.values[entityCode];
                    if(entity == "player"){
                        this.playerInit(x, y)
                    }else if(entity.monster){
                        this.monsterInit(entity.monster,x,y);
                    }else{
                        this.entityInit(entity.symbol, entity.behavior, x, y, entity.hitDice,entity.damage, entity.behaviorInfo, entity.name);
                    }

                }
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
        this.board.clearSpace(entity.x, entity.y);
        this.setPosition(id,-1,-1);
        this.board.placeEntities(this.entities);
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

    transmitMessage(message){
        console.log(message);
    }

    hasPlayerLos(entity){
        return this.board.getLineOfSight(entity.x,entity.y);
    }

}