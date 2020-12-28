import { Color, OrthographicCamera, Scene, WebGLRenderer } from "three";
import ConwaysMesh from "./ConwaysMesh";
import ConwaysMeshes from "./ConwaysMeshes";
import Stats from "stats-js";

const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Camera setup 2D
const width  = window.innerWidth
const height = window.innerHeight
const camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 1000);


const scene = new Scene();

let mesh = new ConwaysMesh(new Color('azure'), 8, width, height, scene);

if (mesh instanceof ConwaysMeshes) {
  camera.position.set(width/2, height/2, 0);
}

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

window.addEventListener(
  "resize",
  () => {
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);