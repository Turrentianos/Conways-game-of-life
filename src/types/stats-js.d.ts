declare module "stats-js" {
    // https://threejs.org/docs/#examples/en/controls/OrbitControls
    import { Object3D, Vector3 } from "three";
  
    export default class Stats {
      dom: HTMLElement;
  
      begin(): void;
      end(): void;
  
      showPanel(panel: number): void;
    }
  }