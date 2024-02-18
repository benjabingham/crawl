class Display{
    constructor(entityManager, board){
        this.entityManager = entityManager;
        this.board = board;

        this.customControls = {};
        this.setCustomControls();
    }

    showDungeonScreen(){
        console.log('showDungeonScreen');
        this.hideAllScreens();
        $('#dungeon-screen').show();
        this.boardDisplayInit();
        this.displayInventory(true);
    }

    showHomeScreen(gameMaster){
        this.hideAllScreens();
        $('#home-screen').show();
        this.populateLocations(gameMaster);
        this.giveSaveButtonsBehavior(gameMaster);
    }

    showTownScreen(gameMaster){
        this.hideAllScreens();
        $('#hud-div').show();
        $('#town-screen').show();
        $('#day-div').text('day '+gameMaster.save.day);
        $('#town-inventory-wrapper').show();

        this.populateLocations(gameMaster);
        this.displayInventory(false);
        this.displayShop();
        this.restButton();
        this.fillBars(gameMaster.player);
        this.nourishmentDiv(gameMaster.player);
    }

    hideAllScreens(){
        $('#town-screen').hide();
        $('#town-inventory-wrapper').hide();
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
        boardDiv.css('width',17*1.8+"rem");
        let gameWindow = $("#game-window");
        //gameWindow.css('height',17*2+"rem");
        $('#log').css('height',17*2-2.5+"rem");
    }
    
    printBoard(){
        let boardArray = this.board.boardArray;
        let player = this.entityManager.player;
        let playerPos = this.entityManager.getEntity('player');
        let boardString = "";
        
        for(let displayY=0; displayY<17; displayY++){
            //boardString += '|'
            for(let displayX=0; displayX<17; displayX++){
                let symbol = false;
                let x = (displayX-8) + playerPos.x;
                let y = (displayY-8) + playerPos.y;
                if( x < 0 || y < 0 || y >= boardArray.length || x >= boardArray[y].length){
                    boardString += '▓▓';
                }else if(this.board.hasPlayerLos({x:x, y:y})){
                    if(boardArray[y][x]){
                        symbol = boardArray[y][x].tempSymbol ? boardArray[y][x].tempSymbol : boardArray[y][x].symbol;
                        boardString += symbol;
                    }else{
                        boardString += '.';
                    }
                    if(!symbol || symbol.length < 2){
                        boardString += ' ';  
                    }
                }else{
                    boardString += '▓▓';
                }

                
                          
            }
            boardString += "\n";
        }
        //console.log(boardString);
        $("#board").text(boardString);
    }

    nourishmentDiv(player){
        let nourishmentLevels = {0:'starving',1:'hungry',2:'sated',3:'well fed'}
        let display = this;
        $('#nourishment-level-div').text('you are '+nourishmentLevels[player.nourishmentLevel]);

        let meals = [
            {name:'meager meal',cost:3,nourishment:3},
            {name:'proper meal',cost:4,nourishment:5},
            {name:'exquisite meal',cost:6,nourishment:8},
        ]

        $('#meals-div').html('');

        meals.forEach((meal)=>{
            $('#meals-div').append(
                $('<button>').text('buy '+meal.name+' - '+meal.cost).on('click',()=>{
                    if(player.gold >= meal.cost){
                        player.changeNourishment(meal.nourishment);
                        player.gold-= meal.cost;
                        display.nourishmentDiv(player);
                        display.displayGold();
                    }
                })
            )
        })
    }
    
    fillBars(player){
        let staminaPercent = player.staminaPercent;
        $('#stamina-level').css('width',staminaPercent*1.5+"px");
        $('#stamina-level').text(player.stamina+"/"+player.staminaMax);

        let healthPercent = player.healthPercent;
        $('#health-level').css('width',healthPercent*1.5+"px");
        $('#health-level').text(player.health+"/"+player.healthMax);


        let luckPercent = player.luckPercent;
        $('#luck-level').css('width',luckPercent*1.5+"px");
        $('#luck-level').text(player.luck+"/"+player.luckMax);


    }
    
    populateLocations(gameMaster){
        $('#travel-locations-div').html('');
        let maps = ['cave','trainingHall','trainingHallNoOgre','andyDungeon']
        maps.forEach((element) =>{
            $('#travel-locations-div').append(
                $("<div>").addClass('location-divs').append(
                    $("<button>").text(element).on('click',function(){
                        console.log(element);
                        gameMaster.getRoom(element+".json")
                    })
                )
            )
        })
    }

    restButton(){
        let gameMaster = this.entityManager.gameMaster;
        $('#rest-button').off().on('click',()=>{
            gameMaster.loadTown();
        })
    }

    displayInventory(dungeonMode=true){
        let inventoryId = (dungeonMode) ? "dungeon-inventory" : "town-inventory";
        //$('#inventory-wrapper').show();
        $('#'+inventoryId+'-list').html('');
        let inventory = this.entityManager.player.inventory;
        inventory.forEach((item) =>{
            this.addInventoryItem(item, dungeonMode, inventoryId);
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

    addInventoryItem(item, dungeonMode, inventory){
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
            $('<div>').addClass('inventory-slot fresh-'+item.fresh).attr('id',inventory+'-slot-'+slot).append(
                (inventory != 'shop') ? $('<div>').text(slot+1).addClass('item-slot-number') : ''
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
        }else if (inventory != 'shop'){
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

        if(item.flimsy){
            $('#'+inventory+'-description').append(
                $('<div>').addClass('item-break-chance').text('Degrade chance: '+item.flimsy+'%')
            )
        }

        if(itemValue){
            $('#'+inventory+'-description').append(
                $('<div>').addClass('item-value').append(
                    $('<div>').text('Sell Value:').append(itemValue)
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

    setCustomControls(){
        let customControls = this.customControls;
        let keys = ['upleft','up','upright','left','wait','right','downleft','down','downright'];
        keys.forEach((key)=>{
            $('#'+key+'-input').on('change',()=>{
                customControls[key] = $('#'+key+'-input').val()+'_0';
                console.log(customControls);
            })
        })
    }
    
}