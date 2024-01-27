class Board{
    constructor(width = 20,height = 20){
        this.width = width;
        this.height = height;

        this.boardArray = [];
        this.losArray = [];
        this.boardInit();
    }

    

    boardInit(){
        this.boardArray = [];
        //this.LosInit();
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
            if(this.itemAt(x,y).id != entity.id){
                if(this.isSpace(x,y) && (!this.isOccupiedSpace(x,y))){
                    this.placeEntity(entity, x, y);
                }else{
                    //console.log("ENTITY OVERWRITE");
                    //console.log(entity);
                    //console.log(this.itemAt(x,y));
                }   
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

    placeEntity(entity, x, y){
        if (this.isSpace(x,y)){
            if(entity && this.isOccupiedSpace(x,y)){
                //console.log('ENTITY OVERWRITE');
                //console.log(entity);
                //console.log(this.itemAt(x,y));
            }
            this.boardArray[y][x] = entity;
        }
    }

    clearSpace(x, y){
        this.placeEntity(false, x, y);
    }

    drawLos(playerx,playery,x,y){
        //console.log('NEW SPACE');

        let lineOfSight = true;

        let fromPoint = {x:playerx, y:playery};
        let targetPoint = {x:x, y:y};

        let line = this.getLine(fromPoint,targetPoint);
        
        line.forEach((point) =>{
            //console.log(point);
            if(lineOfSight){
                this.setLineOfSight(point.x, point.y, lineOfSight);
            }
            
            if(this.itemAt(point.x,point.y).behavior == 'wall'){
                lineOfSight = false;
            }

        })

        if(lineOfSight){
            this.setLineOfSight(targetPoint.x, targetPoint.y, lineOfSight);
        }

        return lineOfSight;
    }

    pointCompare(point1, point2){
        return (point1.x == point2.x && point1.y == point2.y);
    }

    LosInit(){
        for(let i=0;i<this.height;i++){
            this.losArray[i] = [];
            for(let j=0;j<this.width;j++){
                this.losArray[i][j] = false;
            }
        }
    }

    calculateLosArray(player){
        this.LosInit();
        for(let y=0;y<this.height;y++){
            for(let x=0;x<this.width;x++){
                if(x == 0 || y == 0 || x == this.width-1 || y == this.height-1){
                    this.drawLos(player.x, player.y, x, y);
                }
            }
        }
    }

    getLine(point1,point2){
        let xdif = point2.x - point1.x;
        let ydif = point2.y - point1.y;
        
        let steps = Math.max(
            Math.abs(xdif),
            Math.abs(ydif)
        )

        let line = [point1];

        let xIncrement = xdif/steps;
        let yIncrement = ydif/steps;
        
        let x = point1.x;
        let y = point1.y;

        for(let i = 0; i < steps; i++){
            x += xIncrement;
            y += yIncrement;

            line.push({
                x:Math.floor(x), y:Math.floor(y)
            });
        }

        return line;

    }

    setLineOfSight(x,y, los){
        if(this.isSpace(x,y)){
            this.losArray[y][x] = los;
        }
    }

    getLineOfSight(x,y){
        return this.losArray[y][x];
    }

    setDimensions(width,height){
        this.width = width;
        this.height = height;
    }
    
}