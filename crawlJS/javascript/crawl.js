let player = new Player();
let log = new Log();
let entityManager = new EntityManager(player, log);

$(document).ready(function(){
    
    populateMapSelectDropdown();
    /*
    fetch('./rooms/ratnest.json')
        .then((response) => response.json())
        .then((json) => {
            entityManager.loadRoom(json)
            startGame();
        })*/
    
});

function startGame(){
    $('#log-window').show();
    $('#resources').show();
    populateWeaponSelectDropdown();
    giveReminderTextBehavior();

    entityManager.board.placeEntities(entityManager.entities);
    let swordId = entityManager.getProperty('player','sword')

    
    enemyControlInit();
    boardDisplayInit();
    entityManager.board.placeEntities(entityManager.entities);
    entityManager.saveSnapshot();
    entityManager.board.calculateLosArray(entityManager.getEntity('player'));
    printBoard(entityManager.board.boardArray);
    $(document).on("keydown", function(e){
        if($(':focus').attr('id') != 'board'){
            return;
        }
        //console.log(e);
        e.preventDefault;
        entityManager.removeEntity(swordId);
        let key = e.originalEvent.key;
        entityManager.skipBehaviors = false;
        
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
                    entityManager.rewind();
                    entityManager.skipBehaviors = true;
                    log.turnCounter--;
                    log.messages[log.turnCounter] = false;
                    console.log(entityManager.entities);
                }
                break;
            case "5":
                player.changeStamina(2);
                break;
            default:
                entityManager.skipBehaviors = true;
                
        
        }
        entityManager.board.calculateLosArray(entityManager.getEntity('player'));
        entityManager.placeSword(swordId);
        if(!entityManager.skipBehaviors){
            entityManager.reapWounded();
            entityManager.triggerBehaviors();
            entityManager.reapWounded();
        }
        //entityManager.board.placeEntities(entityManager.entities);
        printBoard(entityManager.board.boardArray);
        fillBars();
        entityManager.saveSnapshot();
        //entityManager.transmitMessage("-_-_-_-_-_-_-_-")
        if(!entityManager.skipBehaviors){
            log.turnCounter++;
        }else{
            console.log(log.messages);
            console.log(log.turnCounter);
            log.rewind();
        }
        log.printLog();
        

    });
}

function boardDisplayInit(){
    let boardDiv = $("#board");
    boardDiv.css('width',entityManager.board.width*1.8+"rem");
    let gameWindow = $("#game-window");
    gameWindow.css('height',entityManager.board.height*2+"rem");
    $('#log').css('height',entityManager.board.height*2-1.5+"rem");
}

function printBoard(boardArray){
    entityManager.board.placeEntities(entityManager.entities);
    let boardString = "";
    let symbol;
    for(let i=0; i<boardArray.length; i++){
        //boardString += '|'
        for(let j=0; j<boardArray[i].length; j++){
            if(entityManager.board.getLineOfSight(j,i)){
                if(boardArray[i][j]){
                    symbol = boardArray[i][j].tempSymbol ? boardArray[i][j].tempSymbol : boardArray[i][j].symbol;
                    boardString += symbol;
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

    $('#weapon-select-div').show();
}

function populateMapSelectDropdown(){
    //let maps = ['ratnest','trainingHall','room1','room2']
    let maps = ['ratnest','trainingHall','trainingHallNoOgre']
    maps.forEach((element =>{
        $('#map-select').append(
            $("<option />").val(element+".json").text(element)
        )
    }))

    $('#map-select').on('change',function(){
        fetch('./rooms/'+this.value)
        .then((response) => response.json())
        .then((json) => {
            $('#map-select-div').hide();
            entityManager.loadRoom(json)
            startGame();
        })
    })

    
}

function populateEnemySelectDropdown(){
    $('#enemy-spawn').show();
    let enemies = ['goblin','ogre','rat','dire wolf','dire rat','dummy']
    enemies.forEach((element =>{
        $('#enemy-select').append(
            $("<option />").val(element).text(element)
        )
    }))

    $('#enemy-spawn-button').on('click',function(){
        let x = parseInt($('#enemy-x-input').val());
        let y = parseInt($('#enemy-y-input').val());
        let name  = $('#enemy-select').val();
        console.log(name);

        entityManager.monsterInit(name,x,y);
        entityManager.board.placeEntities(entityManager.entities);
        printBoard(entityManager.board.boardArray);
    });

   
}

function populateCustomEnemySelectDropdown(){
    $('#custom-enemy-spawn-button').on('click',function(){
        let x = parseInt($('#custom-enemy-x-input').val());
        let y = parseInt($('#custom-enemy-y-input').val());
        let hp = parseInt($('#enemy-hp-input').val());
        let damage = parseInt($('#enemy-damage-input').val());
        if(!entityManager.board.isSpace(x,y)){
            return;
        }

        let id = entityManager.entityInit('O','chase',x,y,hp,damage);
        console.log(entityManager.getEntity(id));
        entityManager.board.placeEntities(entityManager.entities);
        printBoard(entityManager.board.boardArray);

    })
}

function enemyControlInit(){
    $('#enemy-control-div').show();
    populateCustomEnemySelectDropdown();
    populateEnemySelectDropdown();
}

function giveReminderTextBehavior(){
    $('#focus-reminder').show()

    $('#board').on('focus',function(){
        $('#focus-reminder').hide()
    }).on('focusout',function(){
        $('#focus-reminder').show()
    })
}

