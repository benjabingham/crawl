let height = 20;
let width = 20;
let entityCounter = 0;
turnCounter = 0;
let entities = {};
let board = [];
let staminaMax = 10;
let stamina = staminaMax;
let healthMax = 10;
let health = healthMax;

$(document).ready(function(){
    characterInit();
    entityInit('O','chase',5,5);
    entityInit('O','chase',6,5);
    entityInit('O','chase',6,6);
    entityInit('O','chase',7,6);
    entityInit('O','chase',6,7);
    //switchWeapon('longsword');
    populateWeaponSelectDropdown();
    enemyControlInit();
    printBoard(board);
    //console.log(entities);
    $(document).on("keydown", function(e){
        if($(':focus').attr('id') != 'board'){
            return;
        }
        //console.log(e);
        e.preventDefault;
        let key = e.originalEvent.key;
        if(stamina < 0 ){
            stamina = Math.min(20,stamina + 2);
        }else{
            console.log(key);
            switch(key){
                case "6":
                    moveEntity("player",1,0);
                    break;
                case "4":
                    moveEntity("player",-1,0);
                    break;
                case "8":
                    moveEntity("player",0,-1);
                    break;
                case "2":
                    moveEntity("player",0,1);
                    break;
                case "7":
                    moveEntity("player",-1,-1);
                    break;
                case "9":
                    moveEntity("player",1,-1);
                    break;
                case "1":
                    moveEntity("player",-1,1);
                    break;
                case "3":
                    moveEntity("player",1,1);
                    break; 
                case "q":
                    rotateSword(entities.player.sword,-1);
                    break;
                case "w":
                    rotateSword(entities.player.sword,1);
                    break;
                default:
                    stamina = Math.min(staminaMax,stamina + 2);
            }
        }
        placeEntities();
        placeSword(entities.player.sword);
        reapWounded();
        placeEntities();
        triggerBehaviors();
        printBoard();
        fillBars();
        turnCounter++;
    });
});



function boardInit(height=10,width=10){
    for(let i=0;i<height;i++){
        board[i] = [];
        for(let j=0;j<width;j++){
            board[i][j] = false;
        }
    }

    return board;
}

function printBoard(){
    placeEntities();
    let boardString = "";
    for(let i=0; i<board.length; i++){
        for(let j=0; j<board[i].length; j++){
            if(board[i][j]){
                boardString += board[i][j].symbol;
            }else{
                boardString += '.';
            }
            boardString += '.';            
        }
        boardString += "\n";
    }
    //console.log(boardString);
    $("#board").text(boardString);
}

function placeEntities(){
    board = boardInit(height, width);
    for (const [k,entity] of Object.entries(entities)){
        let x = entity.x;
        let y = entity.y;
        if(isSpace(x,y) && !board[y][x]){
            board[y][x] = entity;
        }else{
            //console.log("ENTITY OVERWRITE");
        }
        
    };
}

function characterInit(x=0,y=0){
    entities.player = {
        x:x,
        y:y,
        symbol:"☺",
        id: "player"
    };
    let swordID = swordInit("player");
    entities.player.sword = swordID;
}

function entityInit(symbol, behavior, x=0,y=0,hp=1){
    let id = entityCounter;
    entity = {
        x : x,
        y: y,
        symbol: symbol,
        behavior: behavior,
        id:id,
        stunned:0,
        mortal:0,
        threshold:rollN(hp,1,8)
    }
    entityCounter++;
    entities[id] = entity;

    return id;
}

function swordInit(owner, rotation = 3){
    let symbol = getSwordSymbol(rotation);
    let id = entityInit(symbol, 'sword');
    entities[id].owner = owner;
    entities[id].rotation = rotation;
    entities[id].damage = 1;
    entities[id].stunTime = 1;
    entities[id].weight = 1;
    entities[owner].sword = id;
    placeSword(id);

    return id;
}

function getSwordSymbol(rotation){
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

function placeSword(id){
    let owner = entities[id].owner;
    let rotation = entities[id].rotation;
    entities[id].symbol = getSwordSymbol(entities[id].rotation);
    let translations = [
        {x:0,y:-1},
        {x:1,y:-1},
        {x:1,y:0},
        {x:1,y:1},
        {x:0,y:1},
        {x:-1,y:1},
        {x:-1,y:0},
        {x:-1,y:-1}
    ];
    let translation = translations[rotation];
    let x = entities[owner].x + translation.x;
    let y = entities[owner].y + translation.y;
    entities[id].x = x
    entities[id].y = y


    if(isSpace(x,y) && board[y][x]){
        knockID = board[y][x].id;
        if(knockID != id){
            knock(knockID, id);
        }
    }

}

function knock(id, swordID){
    let direction = roll(0,7);
    let translations = [
        {x:0,y:-1},
        {x:1,y:-1},
        {x:1,y:0},
        {x:1,y:1},
        {x:0,y:1},
        {x:-1,y:1},
        {x:-1,y:0},
        {x:-1,y:-1}
    ];
    let x = entities[id].x + translations[direction].x;
    let y = entities[id].y + translations[direction].y;

    let tries = 0;
    while(!isOpenSpace(x,y) && tries < 8){
        direction = (direction+1) % 8;
        x = entities[id].x + translations[direction].x;
        y = entities[id].y + translations[direction].y;
        tries++;
    }

    if(tries < 8){
        entities[id].x = x;
        entities[id].y = y;
        let stunTime = roll(1,entities[swordID].stunTime);
        let mortality = roll(0,entities[swordID].damage);
        entities[id].stunned += stunTime;
        entities[id].mortal += mortality;
        //console.log('Enemy is knocked!');
    }else{
        console.log('SPLATTERED');
    }

    if(swordID == entities.player.sword){
        stamina-= entities[swordID].weight;
    }

}

function rotateSword(id, direction){
    let rotation = entities[id].rotation;
    rotation += 8 + direction;
    rotation %= 8;

    entities[id].rotation = rotation;
}

function moveEntity(id, x, y){
    x += entities[id].x;
    y += entities[id].y;

    if(board[y] && (isOpenSpace(x,y) || (board[y][x] && board[y][x].owner == id))){
        entities[id].x = x;
        entities[id].y = y;
    }
      
}

function chase(id){
    let x = 0;
    let y = 0;
    if(entities[id].x > entities.player.x){
        x = -1;
    }else if (entities[id].x < entities.player.x){
        x = 1;
    }else if(entities[id].y > entities.player.y){
        y = -1;
    }else if (entities[id].y < entities.player.y){
        y = 1;
    }

    if(board[entities[id].y+y][entities[id].x+x].id == 'player'){
        console.log('You are attacked!');
        health -= roll(1,4);
    }
    moveEntity(id, x, y);
    
}

function chaseNatural(id){
    let x = 0;
    let y = 0;
    let random = roll(1,10);
    if(random == 1){
        x = -1;
    }else if (random == 10){
        x +=1;
    }else if(entities[id].x > entities.player.x){
        x = -1;
    }else if (entities[id].x < entities.player.x){
        x = 1;
    }
    
    random = roll(1,10);
    if(random == 1){
        y = -1;
    }else if (random == 10){
        y +=1;
    }else if(entities[id].y > entities.player.y){
        y = -1;
    }else if (entities[id].y < entities.player.y){
        y = 1;
    }

    let targetX = entities[id].x+x;
    let targetY = entities[id].y+y

    if(isSpace(targetX,targetY) && board[targetY][targetX].id == 'player'){
        console.log('You are attacked!');
        health -= roll(1,4);
    }

    moveEntity(id, 0, y);
    moveEntity(id, x, 0);
}

function triggerBehaviors(){
    for (const [k,entity] of Object.entries(entities)){
        if (!entity.stunned){
            switch(entity.behavior){
                case "chase":
                    chaseNatural(k);
                    break;
                case "sword":
                    placeSword(k);
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
        placeEntities();
    }
}

function isOpenSpace(x,y){
    return (isSpace(x,y) && !board[y][x]);
}

function isSpace(x,y){
    return (y >= 0 && x >= 0 && y < board.length && x < board[0].length);
}

function reapWounded(){
    for (const [k,entity] of Object.entries(entities)){
        if (entity.stunned+entity.mortal > entity.threshold){
            console.log('enemy is dead!');
            entities[k].behavior = 'dead';
            entities[k].symbol = 'x';
            entities[k].stun = 0;
        }
    }

    if(stamina < 0){
        health--;
    }
    if(health <= 0){
        entities['player'].symbol = 'x';
    }
    console.log('Stamina: ' +stamina);
    console.log('Health: ' + health);
}

function roll(min,max){
    return Math.floor(Math.random()*(max+1))+min;
}

function rollN(n, min,max){
    let sum = 0;
    for(let i = 0; i < n; i++){
        sum += Math.floor(Math.random()*(max+1))+min;
    }
    return sum;
}

function switchWeapon(weaponName){
    id = entities[entities.player.sword].id;
    switch(weaponName){
        case "stick":
            entities[id].damage = 1;
            entities[id].stunTime = 1;
            entities[id].weight = 1;
            break;
        case "shortsword":
            entities[id].damage = 3;
            entities[id].stunTime = 2;
            entities[id].weight = 1;
            break;
        case "longsword":
            entities[id].damage = 4;
            entities[id].stunTime = 3;
            entities[id].weight = 2;
            break;
        case "rapier":
            entities[id].damage = 5;
            entities[id].stunTime = 2;
            entities[id].weight = 0;
            break;
        case "greatsword":
            entities[id].damage = 4;
            entities[id].stunTime = 6;
            entities[id].weight = 3;
            break;
        case "club":
            entities[id].damage = 1;
            entities[id].stunTime = 6;
            entities[id].weight = 2;
            break;
        case "maul":
            entities[id].damage = 3;
            entities[id].stunTime = 8;
            entities[id].weight = 3;
            break;
    }

    console.log("weapon: "+weaponName);
}

function fillBars(){
    let staminaPercent = Math.floor((stamina/staminaMax)*100);
    $('#stamina-level').css('width',staminaPercent+"px");
    let healthPercent = Math.floor((health/healthMax)*100);
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
        switchWeapon(this.value);
    })
}

function enemyControlInit(){
    $('#enemy-spawn-button').on('click',function(){
        let x = parseInt($('#enemy-x-input').val());
        let y = parseInt($('#enemy-y-input').val());
        let hp = parseInt($('#enemy-hp-input').val());
        if(!isSpace(x,y)){
            return;
        }

        let id = entityInit('O','chase',x,y,hp);
        console.log(entities[id]);
        printBoard(board);

    })
}

