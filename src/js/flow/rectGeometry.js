import * as THREE from 'three';


export const rectGeometry = new THREE.BufferGeometry();

const vertices = new Float32Array( [
	-1.0, -1.0,  1.0,
	 1.0, -1.0,  1.0,
	 1.0,  1.0,  1.0,

	 1.0,  1.0,  1.0,
	-1.0,  1.0,  1.0,
	-1.0, -1.0,  1.0
] );

rectGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );