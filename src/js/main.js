import * as THREE from 'three';
import {Flow} from './flow/flow'
import {ThreeManager} from './threeManager'
import {Controls} from './controls'

const threeManager = new ThreeManager();
const flow = new Flow();
const nodeGroup = new THREE.Group();
threeManager.scene.add(nodeGroup);
nodeGroup.scale.multiplyScalar(0.5);
nodeGroup.scale.setScalar


const CreatePlane = () => {
    const geometry = new THREE.PlaneGeometry( 50, 50 );
    const material = new THREE.MeshBasicMaterial( {color: 0x555500, opacity: 0.2} );
    const plane = new THREE.Mesh( geometry, material );
    nodeGroup.add( plane );
    return plane;
}

const plane1 = CreatePlane();
const plane2 = CreatePlane();
const plane3 = CreatePlane();

const v3 = new THREE.Vector3(0, 0, 0);

plane1.position.set(0, 100, 0);
plane2.position.set(60, -60, 0);
plane3.position.set(-60, -60, 0);

const controls = new Controls(nodeGroup);


function animate() {

    requestAnimationFrame( animate );

    threeManager.render();

}

animate()