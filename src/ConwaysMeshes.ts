import { 
    Scene,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Color,
} from "three";
import { AbstractConway } from "./AbstractConway";

const diffs = [
    [ 0,  1],
    [ 0, -1],
    [ 1,  0],
    [ 1,  1],
    [ 1, -1],
    [-1,  0],
    [-1,  1],
    [-1, -1],
  ];
  
export default class ConwaysMeshes extends AbstractConway{
    planes : Array<Array<Mesh>>

    constructor(color: Color, scale : number, width :number, height :number, scene : Scene) {
        super(scale, width, height);
        const geometry = new PlaneGeometry(scale, scale);

        const material = new MeshBasicMaterial({color: color, side: DoubleSide});


        this.planes = []

        for (let i = 0; i < this.rows; i++) {
            this.planes.push([]);
            for (let j = 0; j < this.columns; j++) {
                const mesh = new Mesh(geometry, material);
                this.planes[i].push(mesh);
                
                this.planes[i][j].position.x = i * scale + scale / 2
                this.planes[i][j].position.y = j * scale + scale / 2
                this.planes[i][j].visible = j >= 0 && j < 10 && i >= 0 && i < 10
                scene.add(this.planes[i][j]);
            }
        }
        return this;
    }


    isAlive(mesh: Mesh) : boolean {
        return mesh.visible;
    }
    
    tick(){
        for (let row = 0; row < this.planes.length; row++) {
            for (let column = 0 ; column < this.planes[row].length ; column++ ) {
                this.planes[row][column].visible = this.toLiveOrToDie(row, column);
            }
        }
    }


    toLiveOrToDie(row: number, column :number) :boolean {
        let count = 0;
        let new_x, new_y;
        for (let neigh = 0; neigh < 8 ; neigh ++){
            new_x = column + diffs[neigh][0];
            new_y = row + diffs[neigh][1];
            if (new_x >= 0 && new_y >= 0 && new_x < this.columns && new_y < this.rows)
                count += +this.planes[new_y][new_x].visible;
        }
        const alive = this.isAlive(this.planes[row][column]);
        return (alive && (count == 2 || count == 3)) || (!alive && count == 3);
    }
}