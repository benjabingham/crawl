class GameMaster{
    constructor(){
        this.player = new Player();
        this.log = new Log();
        this.entityManager = new EntityManager(this.player,this.log);
        this.board = this.entityManager.board;
        this.display = new Display(this.entityManager, this.board);
    }

    startGame(){
        let player = this.player;
        let log = this.log;
        let entityManager = this.entityManager;
        let board = this.board;
        let display = this.display;
        let gm = this;

        board.placeEntities();
        board.placeEntities();
        entityManager.saveSnapshot();

        board.calculateLosArray(entityManager.getEntity('player'));

        display.displayInit();
        display.printBoard();

        $(document).on("keydown", function(e){
            gm.resolvePlayerInput(e); 
        });
    }

    resolvePlayerInput(e){
        if($(':focus').attr('id') != 'board'){
            return;
        }
        e.preventDefault;

        let swordId = this.entityManager.getProperty('player','sword')
        this.entityManager.removeEntity(swordId);
        this.entityManager.skipBehaviors = false;
        this.playerAction(e.originalEvent.key, swordId);

        this.board.calculateLosArray(this.entityManager.getEntity('player'));
            this.entityManager.placeSword(swordId);
            if(!this.entityManager.skipBehaviors){
                this.entityManager.reapWounded();
                this.entityManager.triggerBehaviors();
                this.entityManager.reapWounded();
            }
            this.display.printBoard(board.boardArray);
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
    
}