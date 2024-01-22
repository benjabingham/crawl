class Board{
    constructor(width = 20,height = 20){
        this.width = width;
        this.height = height;

        this.boardArray = [];
    }

    boardInit(){
        for(let i=0;i<this.height;i++){
            this.boardArray[i] = [];
            for(let j=0;j<this.width;j++){
                this.boardArray[i][j] = false;
            }
        }
    }

    placeEntities(entities){
        this.boardInit();
        for (const [k,entity] of Object.entries(entities)){
            let x = entity.x;
            let y = entity.y;
            if(this.isSpace(x,y) && !this.boardArray[y][x]){
                this.boardArray[y][x] = entity;
            }else{
                console.log("ENTITY OVERWRITE");
            }    
        };
    }

    isOpenSpace(x,y){
        return (this.isSpace(x,y) && !this.boardArray[y][x]);
    }

    isOccupiedSpace(x,y){
        return (this.isSpace(x,y) && this.boardArray[y][x]);
    }

    isSpace(x,y){
        return (y >= 0 && x >= 0 && y < this.height && x < this.width);
    }

    itemAt(x,y){
        if(this.isSpace(x,y)){
            return this.boardArray[y][x];
        }else{
            return false;
        }
    }


    
}