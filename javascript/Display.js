class Display{
    constructor(entityManager, board){
        this.entityManager = entityManager;
        this.board = board;
    }

    showDungeonScreen(){
        console.log('showDungeonScreen');
        this.hideAllScreens();
        $('#dungeon-screen').show();
        this.populateWeaponSelectDropdown();
        this.giveReminderTextBehavior();
        this.enemyControlInit();
        this.boardDisplayInit();
        this.displayInventory(true);
    }

    showHomeScreen(gameMaster){
        this.hideAllScreens();
        $('#home-screen').show();
        this.populateMapSelectDropdown(gameMaster);
        this.giveSaveButtonsBehavior(gameMaster);
    }

    showTownScreen(gameMaster){
        this.hideAllScreens();
        $('#town-screen').show();
        this.populateMapSelectDropdown(gameMaster);
        this.displayInventory(false);
        this.displayShop();
    }

    hideAllScreens(){
        $('#town-screen').hide();
        $('#home-screen').hide();
        $('#dungeon-screen').hide();
        $('#inventory-wrapper').hide();
    }

    giveSaveButtonsBehavior(gameMaster){
        let save = gameMaster.save
        let display = this;
        $('#new-save-button').off().on('click',function(){
            save.newSave();
            display.showTownScreen(gameMaster);
        })

        $('#load-file-input').off().change(function(){
            save.loadSave($('#load-file-input').prop('files')[0])
            display.showTownScreen(gameMaster);
        })

        $('#download-save-button').off().on('click',function(){
            save.downloadSave(gameMaster);
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
        let boardArray = this.board.boardArray;
        let player = this.entityManager.player;
        let boardString = "";
        let symbol;
        for(let i=0; i<boardArray.length; i++){
            //boardString += '|'
            for(let j=0; j<boardArray[i].length; j++){
                if(this.board.hasPlayerLos({x:j, y:i})){
                    if(boardArray[i][j]){
                        symbol = boardArray[i][j].tempSymbol ? boardArray[i][j].tempSymbol : boardArray[i][j].symbol;
                        boardString += symbol;
                    }else{
                        boardString += '.';
                    }
                    boardString += ' ';  
                }else{
                    boardString += '▓▓';
                }
                          
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
        $('#map-select').html('');
        let maps = ['choose a map','ratnest','bigcave','trainingHall','trainingHallNoOgre']
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

    displayInventory(dungeonMode=true){
        $('#inventory-wrapper').show();
        $('#inventory-list').html('');
        let inventory = this.entityManager.player.inventory;
        inventory.forEach((item) =>{
            this.addInventoryItem(item, dungeonMode, 'inventory');
        })
        this.displayGold();
    }

    displayShop(){
        let shop = this.entityManager.gameMaster.shop;
        console.log(shop);
        $('#shop-wrapper').show();
        $('#shop-list').html('');
        let inventory = shop.getInventory();
        inventory.forEach((item) =>{
            this.addInventoryItem(item, false, 'shop');
        })
        this.displayGold();
    }

    displayGold(){
        let player = this.entityManager.player;
        $('.gold-div').text(player.gold+" gold");
    }

    addInventoryItem(item, dungeonMode, inventory="inventory"){
        let slot = item.slot;
        let display = this;
        let player = this.entityManager.player;
        let gameMaster = this.entityManager.gameMaster;
        let shop = gameMaster.shop;
        let itemValue = item.value;
        if(!itemValue){
            itemValue = '0';
        }
        
        $('#'+inventory+'-list').append(
            $('<div>').addClass('inventory-slot').attr('id',inventory+'-slot-'+slot).append(
                (inventory == 'inventory') ? $('<div>').text(slot+1).addClass('item-slot-number') : ''
            ).append(
                $('<div>').attr('id',inventory+'-item-name-'+slot).addClass('item-name').text(item.name)
            ).on('click',function(){
                display.displayItemInfo(item, inventory);
            }).append(
                $('<div>').addClass('item-buttons').attr('id',inventory+'-item-buttons-'+slot)
            )
        )

        if(item.uses){
            $('#'+inventory+'-item-name-'+slot).append("("+item.uses+")")
        }

        if(dungeonMode){
            if(item.weapon && !player.equipped){
                $('#'+inventory+'-item-buttons-'+slot).append(
                    $('<button>').addClass('item-button').text('equip').on('click',function(){
                        //spoof button press...
                        gameMaster.resolvePlayerInput({originalEvent:{key:slot+1,location:0}});
                    })
                )
            }
            if(item.weapon && player.equipped && player.equipped.slot == slot){
                $('#'+inventory+'-item-buttons-'+slot).append(
                    $('<button>').addClass('item-button').text('unequip').on('click',function(){
                        gameMaster.resolvePlayerInput({originalEvent:{key:slot+1,location:0}});
                    })
                )
            }
            if(item.usable){
                $('#'+inventory+'-item-buttons-'+slot).append(
                    $('<button>').addClass('item-button').text('use').on('click',function(){
                        gameMaster.resolvePlayerInput({originalEvent:{key:slot+1,location:0}});
                    })
                )
            }
        }else if (inventory == 'inventory'){
            $('#'+inventory+'-item-buttons-'+slot).append(
                $('<button>').addClass('item-button').text('sell - '+itemValue).on('click',function(){
                    shop.sellItem(slot);
                    display.displayShop();
                    display.displayInventory(false);
                })
            )
        }else if(inventory == 'shop'){
            $('#'+inventory+'-item-buttons-'+slot).append(
                $('<button>').addClass('item-button').text('buy - '+item.price).on('click',function(){
                    shop.buyItem(slot);
                    display.displayShop();
                    display.displayInventory(false);
                })
            )
        }
        
    }

    displayItemInfo(item, inventory){
        console.log({
            item:item,
            inventory:inventory
        })
        let itemValue = item.value;
        if(!itemValue){
            itemValue = '0';
        }
        $('#'+inventory+'-description').html('').append(
            $('<div>').addClass('item-name').attr('id',inventory+'-description-title').addClass('inventory-description-title').text(item.name)
        ).append(
            $('<div>').attr('id',inventory+'-description-body').addClass('inventory-description-body')
        )

        if(itemValue){
            $('#'+inventory+'-description').append(
                $('<div>').addClass('item-value').append(
                    $('<div>').addClass('item-title').text('Value:').append(itemValue)
                )
            )
        }

        if(item.weapon){
            $('#'+inventory+'-description-body').append(
                $('<div>').addClass('item-stats-normal').append(
                    $('<div>').addClass('item-title').text('Normal:')
                ).append(
                    $('<div>').addClass('item-damage').attr('id',inventory+'-item-damage-'+item.slot).text('Damage: '+item.damage)
                ).append(
                    $('<div>').addClass('item-stun').attr('id',inventory+'-item-stun-'+item.slot).text('stun: '+item.stunTime)
                ).append(
                    $('<div>').addClass('item-weight').attr('id',inventory+'-item-weight-'+item.slot).text('weight: '+item.weight)
                )
            )            
        }

        ['jab','swing','strafe'].forEach(function(val){
            console.log(val);
            if(item[val]){
                let special = item[val];
                $('#'+inventory+'-description-body').append(
                    $('<div>').addClass('item-stats-normal').append(
                        $('<div>').addClass('item-title').text(val+":")
                    ).append(
                        $('<div>').addClass('item-damage').text('Damage: '+special.damage)
                    ).append(
                        $('<div>').addClass('item-stun').text('stun: '+special.stunTime)
                    ).append(
                        $('<div>').addClass('item-weight').text('weight: '+special.weight)
                    )
                )
            }
        })
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