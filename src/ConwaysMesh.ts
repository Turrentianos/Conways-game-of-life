import {Color, DataTexture, DoubleSide, FloatType, GLSL3, LinearFilter, Mesh, NearestFilter, PlaneBufferGeometry, PlaneGeometry, RedFormat, Scene, ShaderMaterial, UniformsUtils, Vector2} from "three";
import ndarray from "ndarray";

import { AbstractConway } from "./AbstractConway";
// @ts-ignore
import vertexShader from "./shaders/vertex.vert.glsl";
// @ts-ignore
import fragmentShader from "./shaders/fragment.frag.glsl";
import fill from "./util";

const shader = {
    uniforms: {
    u_size: { value: new Vector2(100, 100) },
    u_data: { value: null }
    },
    vertexShader,
    fragmentShader
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
        
        // Material
        // Inspired by https://threejs.org/examples/?q=texture3d#webgl2_materials_texture3d
        const uniforms = UniformsUtils.clone(shader.uniforms);
        uniforms["u_size"].value = new Vector2(width, height);
        uniforms["u_data"].value = texture;
        
        const material = new ShaderMaterial({
            uniforms: uniforms,
            //vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: DoubleSide, // The volume shader uses the backface as its "reference point"
            // glslVersion: GLSL3
        });
        // const geometry = new PlaneGeometry(1.9, 1.9);
        const geometry = new PlaneBufferGeometry(width, height);
        const offset = 40;
        this.world = world;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                // this.world.set(i, j, (i+j)/(this.columns+this.rows));
                this.world.set(x, y, +(x >= this.columns/2 - offset && x < this.columns/2 + offset && y >= this.rows/2 - offset && y < this.rows/2 + offset));
            }
        }
        this.world0 = ndarray(new Float32Array(this.rows * this.columns),  [this.columns, this.rows]);
        
        this.densityTexture = texture;

        this.plane = new Mesh(geometry, material);
        scene.add(this.plane);
        console.log(uniforms["u_size"].value);
    }

    isAlive(mesh: number) :boolean {
        return mesh > 0;
    }

    tick() : void {
        fill(this.world0, this.world);
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