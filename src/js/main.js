import * as THREE from 'three';
import {Flow} from './flow/flow'
import {ThreeManager} from './threeManager'
import {Controls} from './controls'

const threeManager = new ThreeManager();
const flowGroup = new THREE.Group();
threeManager.scene.add(flowGroup);

const controls = new Controls(flowGroup);
const flow = new Flow({controls, flowGroup});


function animate() {

    requestAnimationFrame( animate );

    threeManager.render();

}

animate()