import {Color, DataTexture, DoubleSide, FloatType, Mesh, NearestFilter, PlaneBufferGeometry, RedFormat, Scene, ShaderMaterial, UniformsUtils, Vector2} from "three";
import ndarray from "ndarray";

import { AbstractConway } from "./AbstractConway";
import copy from "./util";

const shader = {
    uniforms: {
    u_size: { value: new Vector2(100, 100) },
    u_data: { value: null }
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
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D u_data;
uniform vec2 u_size;

void main() {
    vec2 uv = gl_FragCoord.xy/u_size.xy;
    vec4 color = texture( u_data, uv );

    gl_FragColor = vec4(color.rrr, 1.0);
}`;

export default class ConwaysMesh extends AbstractConway {
    plane: Mesh;
    world: ndarray;
    world0: ndarray;
    densityTexture: DataTexture;

    constructor(color: Color, scale: number, width: number, height: number, scene: Scene){
        super(scale, width, height);
        const world = ndarray(new Float32Array(this.rows * this.columns),  [this.columns, this.rows]);

        const texture = new DataTexture(world.data as Float32Array, this.rows, this.columns);
        texture.format = RedFormat;
        texture.type = FloatType;
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.unpackAlignment = 1;
        
        const uniforms = UniformsUtils.clone(shader.uniforms);
        uniforms["u_size"].value = new Vector2(width, height);
        uniforms["u_data"].value = texture;
        
        const material = new ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: fragmentShader,
            side: DoubleSide, 
        });
        
        const geometry = new PlaneBufferGeometry(width, height);
        const offset = 40;
        
        this.world = world;
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                this.world.set(x, y, +(x >= this.columns/2 - offset && x < this.columns/2 + offset && y >= this.rows/2 - offset && y < this.rows/2 + offset));
            }
        }
        
        this.world0 = ndarray(new Float32Array(this.rows * this.columns),  [this.columns, this.rows]);
        
        this.densityTexture = texture;

        this.plane = new Mesh(geometry, material);
        scene.add(this.plane);
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
        this.needsUpdate = true;
    }

    toLiveOrToDie(x :number, y: number) :boolean {
        let count = 0;
        let new_x: number, new_y : number;
        for (let neigh = 0; neigh < 8 ; neigh ++){
            new_x = x + diffs[neigh][0];
            new_y = y + diffs[neigh][1];
            if (new_x >= 0 && new_y >= 0 && new_x < this.columns && new_y < this.rows)
                count += this.world0.get(new_x, new_y);
        }
        const alive = this.isAlive(this.world.get(x, y));
        return (alive && (count == 2 || count == 3)) || (!alive && count == 3);
    }

    set needsUpdate(update: boolean) {
        this.densityTexture.needsUpdate = update;
    }
}