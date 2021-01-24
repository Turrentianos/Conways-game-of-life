import { OrthographicCamera, Scene, WebGLRenderer } from "three";
import ConwaysMesh from "./ConwaysMesh";
import Stats from "stats-js";
import * as dat from "dat.gui";
import "./style.css";

const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Camera setup 2D
const width  = window.innerWidth
const height = window.innerHeight
const camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 1000);


const scene = new Scene();

const palette = {
  "Alive cells": [86, 0, 140],
  "Background": [0, 0, 0],
  "Cube size": 0
};

const mesh = new ConwaysMesh(palette["Alive cells"], 3, width, height, scene);



const gui = new dat.GUI();

const cellColor = gui.addColor(palette, "Alive cells");
cellColor.onFinishChange((val) => mesh.set_color(val));

const backgroundColor = gui.addColor(palette, "Background");
backgroundColor.onFinishChange((val) => mesh.set_background(val));

const cubeSize = gui.add(palette, "Cube size");
cubeSize.onFinishChange((val) => mesh.init_cube_world(val));


gui.open();


const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);
  stats.begin();
  // Take a step in Conway's game of life
  mesh.tick();

  // Render the scene
  renderer.render(scene, camera);
  stats.end();
}

requestAnimationFrame(animate);
