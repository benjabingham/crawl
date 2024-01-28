class Display{
    constructor(entityManager, board){
        this.entityManager = entityManager;
        this.board = board;
    }

    showDungeonScreen(){
        $('#dungeon-screen').show();
        this.populateWeaponSelectDropdown();
        this.giveReminderTextBehavior();
        this.enemyControlInit();
        this.boardDisplayInit();
    }

    showHomeScreen(gameMaster){
        $('#home-screen').show();
        $('#map-select-div').hide();
        this.populateMapSelectDropdown(gameMaster);
        this.giveSaveButtonsBehavior(gameMaster.save);
    }

    giveSaveButtonsBehavior(save){
        $('#new-save-button').off().on('click',function(){
            save.newSave();
            $('#save-manage-div').hide();
            $('#map-select-div').show();
        })

        $('#load-file-input').off().change(function(){
            save.loadSave($('#load-file-input').prop('files')[0])
        })

        $('#new-save-button').off().change(function(){
            save.newSave();
            //$('#save-manage-div').hide();
            //$('#map-select-div').show();
        })

        $('#download-save-button').off().on('click',function(){
            save.downloadSave();
        })
    }

    boardDisplayInit(){
        let boardDiv = $("#board");
        boardDiv.css('width',this.board.width*1.8+"rem");
        let gameWindow = $("#game-window");
        gameWindow.css('height',this.board.height*2+"rem");
        $('#log').css('height',this.board.height*2-1.5+"rem");
    }
    
    printBoard(){
        this.board.placeEntities();
        let boardArray = this.board.boardArray;
        let boardString = "";
        let symbol;
        for(let i=0; i<boardArray.length; i++){
            //boardString += '|'
            for(let j=0; j<boardArray[i].length; j++){
                if(this.board.getLineOfSight(j,i)){
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
    
    
    fillBars(player){
        let staminaPercent = player.staminaPercent;
        $('#stamina-level').css('width',staminaPercent+"px");
        let healthPercent = player.healthPercent;
        //console.log(healthPercent);
        $('#health-level').css('width',healthPercent+"px");
    }
    
    populateWeaponSelectDropdown(){
        let weapons = ['stick','shortsword','longsword','rapier','greatsword','club','maul']
        let entityManager = this.entityManager;
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
    
    populateMapSelectDropdown(gameMaster){
        let maps = ['ratnest','trainingHall','trainingHallNoOgre']
        maps.forEach((element =>{
            $('#map-select').append(
                $("<option />").val(element+".json").text(element)
            )
        }))

        $('#map-select').off().on('change',function(){
            console.log(this.value);
            gameMaster.getRoom(this.value)
        })
    }
    
    populateEnemySelectDropdown(){
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

            this.entityManager.monsterInit(name,x,y);
            this.board.placeEntities(this.entityManager.entities);
            printBoard();
        });
    
       
    }
    
    populateCustomEnemySelectDropdown(){
        $('#custom-enemy-spawn-button').on('click',function(){
            let x = parseInt($('#custom-enemy-x-input').val());
            let y = parseInt($('#custom-enemy-y-input').val());
            let hp = parseInt($('#enemy-hp-input').val());
            let damage = parseInt($('#enemy-damage-input').val());
            if(!this.board.isSpace(x,y)){
                return;
            }
    
            let id = this.entityManager.entityInit('O','chase',x,y,hp,damage);
            board.placeEntities(this.entityManager.entities);
            this.printBoard();
        })
    }
    
    enemyControlInit(){
        $('#enemy-control-div').show();
        this.populateCustomEnemySelectDropdown();
        this.populateEnemySelectDropdown();
    }
    
    giveReminderTextBehavior(){
        $('#focus-reminder').show()
    
        $('#board').on('focus',function(){
            $('#focus-reminder').hide()
        }).on('focusout',function(){
            $('#focus-reminder').show()
        })
    }
}