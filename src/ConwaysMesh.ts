import {DataTexture, DoubleSide, FloatType, Mesh, NearestFilter, PlaneBufferGeometry, RedFormat, Scene, ShaderMaterial, UniformsUtils, Uniform, Vector2} from "three";
import ndarray from "ndarray";

import { AbstractConway } from "./AbstractConway";
import copy from "./util";

const shader = {
    uniforms: {
    u_data: { value: null },
    size: { value: new Uniform( new Vector2() ) },
    color: { value: null }
    },
};

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

const fragmentShader = `
precision mediump float;
precision mediump sampler2D;

uniform sampler2D u_data;
uniform sampler2D color;
uniform vec2 size;

void main() {
    vec2 uv = gl_FragCoord.xy/size.xy;
    
    float a = texture(u_data, uv.xy).r;

    vec3 col = vec3(
        texture(color, vec2(0.0, 0.0)).r,
        texture(color, vec2(0.0, 0.5)).r,
        texture(color, vec2(0.0, 1.0)).r
    );
    
    vec3 background = vec3(
        texture(color, vec2(1.0, 0.0)).r,
        texture(color, vec2(1.0, 0.5)).r,
        texture(color, vec2(1.0, 1.0)).r
    );

    gl_FragColor = vec4(a*col + (1.-a)*background, 1.0);
}`;

export default class ConwaysMesh extends AbstractConway {
    plane: Mesh;
    world: ndarray;
    world0: ndarray;
    densityTexture: DataTexture;
    color: ndarray;
    colorTexture: DataTexture;

    constructor(color: Array<number>, scale: number, width: number, height: number, scene: Scene){
        super(scale, width, height);
        this.world = ndarray(new Float32Array(this.rows * this.columns),  [this.columns, this.rows]);

        const texture = new DataTexture(this.world.data as Float32Array, this.rows, this.columns);
        texture.format = RedFormat;
        texture.type = FloatType;
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.unpackAlignment = 1;
        
        this.color = ndarray(new Float32Array(3*2), [3, 2]);
        color.forEach((v, i) => this.color.set(i, 0, v/255));
        color.forEach((_, i) => this.color.set(i, 1, 0));

        const colorTexture = new DataTexture(this.color.data as Float32Array, 2, 3);
        colorTexture.format = RedFormat;
        colorTexture.type = FloatType;
        colorTexture.minFilter = NearestFilter;
        colorTexture.magFilter = NearestFilter;
        colorTexture.unpackAlignment = 1;

        const uniforms = UniformsUtils.clone(shader.uniforms);
        uniforms["color"].value = colorTexture;
        uniforms["size"].value = new Vector2(...this.size);
        uniforms["u_data"].value = texture;
        
        const material = new ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: fragmentShader,
            side: DoubleSide,
        });
        
        const geometry = new PlaneBufferGeometry(width, height);
        
        
        this.world0 = ndarray(new Float32Array(this.rows * this.columns),  [this.columns, this.rows]);
        
        this.densityTexture = texture;
        this.colorTexture = colorTexture;

        this.plane = new Mesh(geometry, material);
        
        scene.add(this.plane);

        return this;
    }

    isAlive(mesh: number) :boolean {
        return mesh > 0;
    }

    tick() : void {
        copy(this.world0, this.world);
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0 ; x < this.columns ; x++ ) {
                this.world.set(x, y, +this.toLiveOrToDie(x, y));
            }
        }
        this.densNeedsUpdate = true;
    }

    toLiveOrToDie(x :number, y: number) :boolean {
        let count = 0;
        let new_x: number, new_y : number;
        for (let neigh = 0; neigh < 8 ; neigh ++){
            new_x = (x + diffs[neigh][0]) % this.columns;
            new_y = (y + diffs[neigh][1]) % this.rows;
            count += this.world0.get(new_x, new_y);
        }
        const alive = this.isAlive(this.world.get(x, y));
        return (alive && (count == 2 || count == 3)) || (!alive && count == 3);
    }

    init_cube_world(offset : number) : void {
        const pred = (x: number, y: number) => x >= this.columns/2 - offset && x < this.columns/2 + offset && y >= this.rows/2 - offset && y < this.rows/2 + offset;
        this.init_world(pred);
    }

    init_world(pred: (x: number, y: number) => boolean) : void {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                this.world.set(x, y, +pred(x, y));
            }
        }
    }

    set densNeedsUpdate(update: boolean) {
        this.densityTexture.needsUpdate = update;
    }

    set colNeedsUpdate(update: boolean) {
        this.colorTexture.needsUpdate = update;
    }

    set_color(color: number[]) : void{
        color.forEach((v, i) => this.color.set(i, 0, v/255));
        
        this.colNeedsUpdate = true;
    }
    
    set_background(color: number[]) : void{
        color.forEach((v, i) => this.color.set(i, 1, v/255));
        
        this.colNeedsUpdate = true;
    }


}