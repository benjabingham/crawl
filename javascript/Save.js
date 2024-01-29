class Save{
    constructor(){
        this.maps = {};
        this.player;
    }

    newSave(){
        this.player = new Player;
        this.maps = {};
    }

    loadSave(file){
        if (file) {
            let save = this;
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                let fileString = evt.target.result;
                let fileJson = JSON.parse(fileString);
                for (const [key, value] of Object.entries(fileJson)) {
                    save[key] = value;
                }
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
    }

}