import { Float32BufferAttribute } from "three";

export abstract class AbstractConway {
    rows : number;
    columns : number;
    size : number[];
    scale: number;
    sizeAttribute: Float32BufferAttribute;


    constructor(scale : number, width :number, height :number) {
        this.rows = Math.floor(width/scale); 
        this.columns = Math.floor(height/scale);
        this.scale = scale;
        this.size = [width, height];
        const sizeAttribute = new Float32BufferAttribute(this.size, 2);
        this.sizeAttribute = sizeAttribute;



        return this;
    }
    
    abstract tick() : void;
}