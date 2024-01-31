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

        board.placeEntities();
        entityManager.saveSnapshot();

        board.calculateLosArray(entityManager.getEntity('player'));

        display.showDungeonScreen();
        display.printBoard();

        $(document).off().on("keydown", function(e){
            gm.resolvePlayerInput(e); 
        });
    }

    resolvePlayerInput(e){
        let dungeonId = this.dungeonId;
        if(e && $(':focus').attr('id') != 'board'){
            return;
        }
        e.preventDefault;

        let swordId = this.entityManager.getProperty('player','sword')
        this.entityManager.removeEntity(swordId);
        this.entityManager.skipBehaviors = false;

        if(e){
            this.playerAction(e.originalEvent.key, swordId);
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
        }
        this.display.printBoard(board.boardArray);
        this.display.DisplayDungeonInventory();

        this.display.fillBars(this.player);
        this.entityManager.saveSnapshot();
        if(!this.entityManager.skipBehaviors){
            this.log.turnCounter++;
        }else{
            this.log.rewind();
        }
        this.log.printLog();
    }

    playerAction(key, swordId){
        switch(key){
            case "6":
                this.entityManager.moveEntity("player", 1, 0);
                break;
            case "4":
                this.entityManager.moveEntity("player", -1, 0);
                break;
            case "8":
                this.entityManager.moveEntity("player", 0, -1);
                break;
            case "2":
                this.entityManager.moveEntity("player", 0, 1);
                break;
            case "7":
                this.entityManager.moveEntity("player", -1, -1);
                break;
            case "9":
                this.entityManager.moveEntity("player", 1, -1);
                break;
            case "1":
                this.entityManager.moveEntity("player", -1, 1);
                break;
            case "3":
                this.entityManager.moveEntity("player", 1, 1);
                break; 
            case "q":
                this.entityManager.rotateSword(swordId,-1);
                break;
            case "w":
                this.entityManager.rotateSword(swordId,1);
                break;
            case "Backspace":
                if(this.entityManager.canRewind()){
                    console.log('rewind');
                    this.entityManager.rewind();
                    this.entityManager.skipBehaviors = true;
                    this.log.turnCounter--;
                    this.log.messages[log.turnCounter] = false;
                    console.log(this.entityManager.entities);
                }
                break;
            case "5":
                this.player.changeStamina(2);
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