class Save{
    constructor(){
        this.maps = {};
        this.player = new Player;
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

}