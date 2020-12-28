export abstract class AbstractConway {
    rows : number;
    columns : number;
    scale: number;


    constructor(scale : number, width :number, height :number) {
        this.rows = Math.floor(width/scale); 
        this.columns = Math.floor(height/scale);
        this.scale = scale;
        
        return this;
    }
    
    abstract tick() : void;
}