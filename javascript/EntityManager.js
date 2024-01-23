class EntityManager{
    constructor(){
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

    }

    playerInit(board, player, x=0,y=0){
        this.entities.player = {
            x:x,
            y:y,
            symbol:"☺",
            id: "player"
        };
        this.swordInit("player", board, player);
    }
    

    entityInit(symbol, behavior, x=0,y=0,hitDice=1){
        let id = this.entityCounter;
        let entity = {
            x : x,
            y: y,
            symbol: symbol,
            behavior: behavior,
            id:id,
            stunned:0,
            mortal:0,
            threshold:this.rollN(hitDice,1,8),
            damage:4
        }
        this.entityCounter++;
        this.entities[id] = entity;
        //console.log(entity);
    
        return id;
    }

    swordInit(owner, board, player, rotation = 3){
        let id = this.entityInit('*', 'sword');
        let sword = this.getEntity(id);

        sword.owner = owner;
        sword.rotation = rotation;

        this.setEntity(id, sword);

        this.setProperty(owner,'sword', id);
        
        this.switchWeapon('stick');
        this.placeSword(id, board, player);
    
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

    placeSword(id, board, player){
        let sword = this.getEntity(id);
        let ownerId = sword.owner;
        let owner = this.getEntity(ownerId);

        let rotation = sword.rotation;
        this.setProperty(id, 'symbol', this.getSwordSymbol(rotation));
        
        let translation = this.translations[rotation];
        let x = owner.x + translation.x;
        let y = owner.y + translation.y;
        this.setPosition(id,x,y);
    
    
        if(board.isOccupiedSpace(x,y)){
            let knockedId = board.itemAt(x,y).id;
            if(knockedId != id){
                this.knock(knockedId, id, board);
                if (ownerId == 'player'){
                    player.changeStamina(sword.weight * -1);
                }
            }
        }
        
        return player;
    }

    knock(id, swordId, board){
        let entity = this.getEntity(id);
        let sword = this.getEntity(swordId)
        let direction = this.roll(0,7);
        let x = entity.x + this.translations[direction].x;
        let y = entity.y + this.translations[direction].y;
    
        let tries = 0;
        while(!board.isOpenSpace(x,y) && tries < 8){
            direction = (direction+1) % 8;
            x = entity.x + this.translations[direction].x;
            y = entity.y + this.translations[direction].y;
            tries++;
        }
    
        if(tries < 8){
            this.setPosition(id,x,y)
            let stunTime = this.roll(1,sword.stunTime);
            let mortality = this.roll(0,sword.damage);
            this.addStunTime(id,stunTime);
            this.addMortality(id, mortality);
            //console.log('Enemy is knocked!');
        }else{
            console.log('SPLATTERED');
        }
    }

    moveEntity(id, x, y, board){
        let entity = this.getEntity(id);
        x += entity.x;
        y += entity.y;
    
        if(board.isSpace(x,y) && (board.isOpenSpace(x,y) || board.itemAt(x,y).owner == id)){
            this.setPosition(id,x,y)
            this.board.boardArray[y][x] = entity;
        }
    }

    rotateSword(id, direction){
        let rotation = this.getProperty(id, 'rotation');
        rotation += 8 + direction;
        rotation %= 8;
    
        this.setProperty(id, 'rotation', rotation);
    }

    chase(id, player, board){
        let entity = this.getEntity(id);
        let playerEntity = this.getEntity('player');
        let x = 0;
        let y = 0;
        if(entity.x > playerEntity.x){
            x = -1;
        }else if (entity.x < playerEntity.x){
            x = 1;
        }else if(entity.y > playerEntity.y){
            y = -1;
        }else if (entity.y < playerEntity.y){
            y = 1;
        }

        let targetX = entity.x+x;
        let targetY = entity.y+y;
    
        if(playerEntity.x == targetX && playerEntity.y == targetY){
            console.log('You are attacked!');
            player.changeHealth(this.roll(1,entity.damage) * -1);
        }

        moveEntity(id, x, y, board);
        
    }

    chaseNatural(id, player){
        let entity = this.getEntity(id);
        let playerEntity = this.getEntity('player');
        let x = 0;
        let y = 0;
        let random = this.roll(1,10);
        if(random == 1){
            x = -1;
        }else if (random == 2){
            x = 1;
        }else if (random == 3){
            //do nothing
        }else if(entity.x > playerEntity.x){
            x = -1;
        }else if (entity.x < playerEntity.x){
            x = 1;
        }
        
        random = this.roll(1,10);
        if(random == 1){
            y = -1;
        }else if (random == 2){
            y = 1;
        }else if (random == 3){
            //do nothing
        }else if(entity.y > playerEntity.y){
            y = -1;
        }else if (entity.y < playerEntity.y){
            y = 1;
        }
    
        let targetX = entity.x+x;
        let targetY = entity.y+y
    
        if(playerEntity.x == targetX && playerEntity.y == targetY){
            console.log('You are attacked!');
            player.changeHealth(this.roll(1,entity.damage) * -1);
        }
    
        this.moveEntity(id, 0, y, this.board);
        this.moveEntity(id, x, 0, this.board);
    }

    triggerBehaviors(board, player){
        this.board = board;
        for (const [k,entity] of Object.entries(this.entities)){
            //console.log(entity);
            if (!entity.stunned){
                switch(entity.behavior){
                    case "chase":
                        this.chaseNatural(k, player);
                        break;
                    case "sword":
                        //player = this.placeSword(k,board, player);
                        break;
                    case "dead":
                        entity.symbol = 'x';
                        break;
                    default:
                }
            }else if (entity.behavior != 'dead'){
                //console.log('enemy is stunned');
                entity.stunned--;
                if(entity.stunned > 0){
                    entity.symbol = 0;
                }else{
                    entity.symbol = 'O';
                }
            }else{
                entity.symbol = 'x';
            }
        }

        return player;
    }

    reapWounded(player){
        for (const [k,entity] of Object.entries(this.entities)){
            if (entity.stunned+entity.mortal > entity.threshold){
                //console.log('enemy is dead!');
                this.setProperty(k,'behavior', 'dead');
                this.setProperty(k,'symbol', 'x');
                this.setProperty(k,'stunned', 0);
            }
        }
        //console.log(player.health);
        if(player.health <= 0){
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

    setProperty(id, Property, value){
        this.entities[id][Property] = value;
    }

    setPosition(id,x,y){
        this.setProperty(id, 'x', x);
        this.setProperty(id, 'y', y);
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

    addStunTime(id, stunTime){
        console.log(stunTime);
        stunTime +=this.getProperty(id, 'stunned');
        this.setProperty(id, 'stunned', stunTime);
    }

    addMortality(id, mortal){
        mortal += Math.max(this.getProperty(id, 'mortal'),0);
        this.setProperty(id, 'mortal', mortal);
    }

}