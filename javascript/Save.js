class Save{
    constructor(){
        this.maps = [];
        this.player;
    }

    newSave(){
        this.player = new Player;
        this.maps = [];
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