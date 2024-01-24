turnCounter = 0;
let entityManager = new EntityManager();
let player = new Player();

$(document).ready(function(){
    fetch('./rooms/room1.json')
        .then((response) => response.json())
        .then((json) => {
            entityManager.loadRoom(json, player)
            startGame();
        })
    
});

function startGame(){
    entityManager.board.placeEntities(entityManager.entities);
    let swordId = entityManager.getProperty('player','sword')
    /*
    entityManager.entityInit('O','chase',5,5);
    entityManager.entityInit('O','chase',6,5);
    entityManager.entityInit('O','chase',6,6);
    entityManager.entityInit('O','chase',7,6);
    entityManager.entityInit('O','chase',6,7);
    
    entityManager.entityInit('O','chase',0,0);


    entityManager.entityInit('M','wall',1,0);
    entityManager.entityInit('M','wall',1,1);
    entityManager.entityInit('M','wall',1,2);
    entityManager.entityInit('M','wall',1,3);
    entityManager.entityInit('M','wall',2,3);
    entityManager.entityInit('M','wall',1,4);
    entityManager.entityInit('M','wall',1,5);
    entityManager.entityInit('M','wall',1,6);
    entityManager.entityInit('M','wall',10,10);
    entityManager.entityInit('M','wall',11,10);
    entityManager.entityInit('M','wall',10,11);
    */
    //switchWeapon('longsword');
    populateWeaponSelectDropdown();
    enemyControlInit();
    entityManager.board.placeEntities(entityManager.entities);
    entityManager.saveSnapshot(player);
    printBoard(entityManager.board.boardArray);
    $(document).on("keydown", function(e){
        if($(':focus').attr('id') != 'board'){
            return;
        }
        //console.log(e);
        e.preventDefault;
        entityManager.removeEntity(swordId);
        let key = e.originalEvent.key;
        let skipBehaviors = false;
        if(player.stamina <= 0 ){
            player.changeStamina(2);
        }else{
            //console.log(key);
            switch(key){
                case "6":
                    entityManager.moveEntity("player", 1, 0);
                    break;
                case "4":
                    entityManager.moveEntity("player", -1, 0);
                    break;
                case "8":
                    entityManager.moveEntity("player", 0, -1);
                    break;
                case "2":
                    entityManager.moveEntity("player", 0, 1);
                    break;
                case "7":
                    entityManager.moveEntity("player", -1, -1);
                    break;
                case "9":
                    entityManager.moveEntity("player", 1, -1);
                    break;
                case "1":
                    entityManager.moveEntity("player", -1, 1);
                    break;
                case "3":
                    entityManager.moveEntity("player", 1, 1);
                    break; 
                case "q":
                    entityManager.rotateSword(swordId,-1);
                    break;
                case "w":
                    entityManager.rotateSword(swordId,1);
                    break;
                case "Backspace":
                    if(entityManager.canRewind()){
                        console.log('rewind');
                        playerInfo = entityManager.rewind();
                        player.setPlayerInfo(playerInfo);
                        skipBehaviors = true;
                    }
                    break;
                default:
                    player.changeStamina(2);
            }
        }
        entityManager.placeSword(swordId, player);
        if(!skipBehaviors){
            entityManager.reapWounded(player);
            player = entityManager.triggerBehaviors(player);
            entityManager.reapWounded(player);
        }
        //entityManager.board.placeEntities(entityManager.entities);
        printBoard(entityManager.board.boardArray);
        fillBars();
        entityManager.saveSnapshot(player);
        turnCounter++;
    });
}

function printBoard(boardArray){
    entityManager.board.calculateLosArray(entityManager.getEntity('player'));
    let boardString = "";
    for(let i=0; i<boardArray.length; i++){
        //boardString += '|'
        for(let j=0; j<boardArray[i].length; j++){
            if(entityManager.board.getLineOfSight(j,i)){
                if(boardArray[i][j]){
                    boardString += boardArray[i][j].symbol;
                }else{
                    boardString += '.';
                }
            }else{
                boardString += '?';
            }
            boardString += ' ';            
        }
        boardString += "\n";
    }
    //console.log(boardString);
    $("#board").text(boardString);
}


function fillBars(){
    let staminaPercent = player.staminaPercent;
    $('#stamina-level').css('width',staminaPercent+"px");
    let healthPercent = player.healthPercent;
    //console.log(healthPercent);
    $('#health-level').css('width',healthPercent+"px");
}

function populateWeaponSelectDropdown(){
    let weapons = ['stick','shortsword','longsword','rapier','greatsword','club','maul']
    weapons.forEach((element =>{
        $('#weapon-select').append(
            $("<option />").val(element).text(element)
        )
    }))

    $('#weapon-select').on('change',function(){
        entityManager.switchWeapon(this.value);
    })
}

function enemyControlInit(){
    $('#enemy-spawn-button').on('click',function(){
        let x = parseInt($('#enemy-x-input').val());
        let y = parseInt($('#enemy-y-input').val());
        let hp = parseInt($('#enemy-hp-input').val());
        if(!entityManager.board.isSpace(x,y)){
            return;
        }

        let id = entityManager.entityInit('O','chase',x,y,hp);
        console.log(entityManager.getEntity(id));
        printBoard(entityManager.board.boardArray);

    })
}

