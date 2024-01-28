$(document).ready(function(){
    let gameMaster = new GameMaster();
    let display = gameMaster.display;
    display.populateMapSelectDropdown(gameMaster);
    /*
    fetch('./rooms/ratnest.json')
        .then((response) => response.json())
        .then((json) => {
            entityManager.loadRoom(json)
            startGame();
        })*/
    
});


