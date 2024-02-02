class GameMaster{
    constructor(save){
        this.player = save.player;
        this.log = new Log();
        this.save = save;
        this.entityManager = new EntityManager(this.player,this.log, this);
        this.board = this.entityManager.board;
        this.display = new Display(this.entityManager, this.board);
        this.dungeonId = 0;
    }

    reset(){
        this.log.wipeLog();
        this.entityManager.wipeEntities();
    }

    startGame(){
        console.log(this.save);
        let player = this.player;
        let log = this.log;
        let entityManager = this.entityManager;
        let board = this.board;
        let display = this.display;
        let gm = this;

        board.placeEntities(log);
        entityManager.saveSnapshot();

        board.calculateLosArray(entityManager.getEntity('player'));

        display.showDungeonScreen();
        display.printBoard();

        $(document).off().on("keydown", function(e){
            gm.resolvePlayerInput(e); 
        });
    }

    resolvePlayerInput(e){
        //console.log(e);
        let dungeonId = this.dungeonId;
        if($(':focus').is('input')){
            return;
        }
        e.preventDefault;

        let swordId = this.entityManager.getProperty('player','sword')
        this.entityManager.removeEntity(swordId);
        this.entityManager.skipBehaviors = false;

        if(e){
            this.playerAction(e.originalEvent, swordId);
        }
        //if dungeon left
        if(dungeonId != this.dungeonId){
            return false;
        }

        this.board.calculateLosArray(this.entityManager.getEntity('player'));
        this.entityManager.placeSword(swordId);
        if(!this.entityManager.skipBehaviors){
            this.entityManager.reapWounded();
            this.entityManager.triggerBehaviors();
            this.entityManager.reapWounded();
            this.player.lightDown(this.log);
        }
        this.board.placeEntities(this.log);
        this.display.printBoard(board.boardArray);
        this.player.inventoryCleanup();
        this.display.DisplayDungeonInventory();

        this.display.fillBars(this.player);
        this.entityManager.saveSnapshot();
        if(!this.entityManager.skipBehaviors){
            this.log.turnCounter++;
        }else{
            this.log.rewind();
        }
        console.log(this.log.turnCounter);
        this.log.printLog();  
    }

    playerAction(e, swordId){
        let key = e.key +"_"+e.location;
        console.log(key);
        console.log(e);
        switch(key){
            case "6_3":
                this.entityManager.moveEntity("player", 1, 0);
                break;
            case "4_3":
                this.entityManager.moveEntity("player", -1, 0);
                break;
            case "8_3":
                this.entityManager.moveEntity("player", 0, -1);
                break;
            case "2_3":
                this.entityManager.moveEntity("player", 0, 1);
                break;
            case "7_3":
                this.entityManager.moveEntity("player", -1, -1);
                break;
            case "9_3":
                this.entityManager.moveEntity("player", 1, -1);
                break;
            case "1_3":
                this.entityManager.moveEntity("player", -1, 1);
                break;
            case "3_3":
                this.entityManager.moveEntity("player", 1, 1);
                break; 
            case "/_3":
            case "q_0":
                this.entityManager.rotateSword(swordId,-1);
                break;
            case "*_3":
            case "w_0":
                this.entityManager.rotateSword(swordId,1);
                break;
            case "Backspace_0":
                if(this.entityManager.canRewind()){
                    console.log('rewind');
                    this.entityManager.rewind();
                    this.entityManager.skipBehaviors = true;
                    this.log.turnCounter--;
                    this.log.messages[log.turnCounter] = false;
                    console.log(this.entityManager.entities);
                }
                break;
            case "5_3":
                this.player.changeStamina(2);
                break;
            case "0_0":
            case "1_0":
            case "2_0":
            case "3_0":
            case "4_0":
            case "5_0":
            case "6_0":
            case "7_0":
            case "8_0":
            case "9_0":
                let slot = parseInt(e.key)-1;
                if(this.dropMode){
                    if(!this.player.dropItem(slot,this)){
                        //this.entityManager.skipBehaviors = true;
                        this.dropMode = false;
                    }
                }else if(!this.player.useItem(this.player.inventory[slot], this)){
                    //skip behaviors if invalid item
                    this.entityManager.skipBehaviors = true;
                }
                break;
            case "d_0":
                if(!this.dropMode){
                    this.dropMode = true;
                }else{
                    this.dropMode = false;
                }
                this.entityManager.skipBehaviors = true;
                break;
            default:
                this.entityManager.skipBehaviors = true;
        }
    }

    getRoom(roomString){
        if(this.save.maps[roomString]){
            console.log('room cached')
            this.entityManager.loadRoom(this.save.maps[roomString]);
            this.startGame();
        }else{
            console.log('loading room '+roomString);
            fetch('./rooms/'+roomString)
            .then((response) => response.json())
            .then((json) => {
                console.log('loaded');
                this.save.maps[roomString] = json;
                console.log(this.save);
                this.entityManager.loadRoom(json)
                this.startGame();
            })
        }
    }

    travel(x,y){
        let direction = false;
        if (x < 0){
            direction = "left"
        }else if (x >= this.board.width){
            direction = "right"
        }else if (y < 0){
            direction = "up";
        }else if (y >= this.board.height){
            direction = "down"
        }
        let destination = this.board.destinations[direction]
        if(!destination){
            return false;
        }
        this.dungeonId++;
        console.log('travel');
        this.reset();

        if(destination.type == "town"){
            this.display.showTownScreen(this);
        }else if(destination.type == "dungeon"){
            this.getRoom(destination.name);
        }
    }
    
}