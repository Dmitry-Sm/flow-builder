import * as THREE from 'three';
import {Flow} from './flow/flow'
import {ThreeManager} from './threeManager'
import {Controls} from './controls'
import ThreeMeshUI from 'three-mesh-ui'
import frag from './flow/shaders/tile_frag.glsl'
import vert from './flow/shaders/vert.glsl'
import bgTexture from '../images/scene_background.png'

const threeManager = new ThreeManager();
const flowGroup = new THREE.Group();
threeManager.scene.add(flowGroup);

const controls = new Controls(flowGroup);
const flow = new Flow({controls, flowGroup, threeManager});

const geometry = new THREE.PlaneGeometry(20000, 20000);
const material = new THREE.ShaderMaterial( {
	uniforms: {
		u_texture: { 
			value: new THREE.TextureLoader().load(bgTexture)
		},
		u_scale: { value: 200 }
	},
	vertexShader: vert,
	fragmentShader: frag
} );

const background = new THREE.Mesh( geometry, material );
flow.group.add( background );
threeManager.scene.add(flowGroup);


function animate() {
    requestAnimationFrame( animate );

    ThreeMeshUI.update();
    threeManager.render();
}

animate();