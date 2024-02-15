class Save{
    constructor(){
        this.maps = {};
        this.player = new Player;
        this.day = 0;
    }

    newSave(){
        this.player.reset();
    }

    loadSave(file){
        if (file) {
            let save = this;
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                let fileString = evt.target.result;
                let fileJson = JSON.parse(fileString);
                save.maps = fileJson.maps;
                for (const [key, value] of Object.entries(fileJson.player)) {
                    save.player[key] = value;
                    console.log({
                        k:key,
                        v:value
                    })
                }
                console.log(save.player);
            }
            reader.onerror = function (evt) {
                $('#load-file-input').append("error reading file");
            }
        }
    }

    downloadSave(){
        let file = new File([JSON.stringify(this)], 'crawlJS-save.txt', {
            type: 'text/plain',
        })
        
        const link = document.createElement('a')
        const url = URL.createObjectURL(file)
        
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        console.log(this);
    }

    mapInit(json){
        let roomString = json.name;
        let board = json.board;
        let values = json.values;
        json.roster = [];
        let roster = json.roster;
        let counter = 0;
        let x = 0;
        let y = 0;
        //get roster
        board.forEach((row)=>{
            row.forEach((item)=>{
                if(item){
                    roster.push({
                        code:item,
                        value:values[item],
                        index:counter,
                        alive:true,
                        x:x,
                        y:y
                    })
                    counter++;
                }
                x++;
            })
            y++;
            x=0;
        })
        this.maps[roomString] = json;
        console.log('loaded');
    }

    catchUpMap(mapString){
        let day = this.day;
        let map = this.maps[mapString];
        for(let i = map.lastDay; i < day; i++){
            console.log(i);
            this.mapRespawn(mapString);
        }
        map.lastDay = day;
    }

    mapRespawn(mapString){
        let map = this.maps[mapString];
        map.roster.forEach((entity)=>{
            if(!entity.alive && entity.value.respawnChance){
                let random = this.roll(0,99);
                if(random < entity.value.respawnChance){
                    entity.alive = true;
                }
            }
        })
    }

    roll(min,max){
        return Math.floor(Math.random()*(max-min+1))+min;
    }

}