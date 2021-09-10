import * as THREE from 'three';


export const rectGeometry = new THREE.BufferGeometry();


var quad_vertices =
[
-1.0,  1.0, 0.0,
1.0,  1.0, 0.0,
1.0, -1.0, 0.0,
-1.0, -1.0, 0.0
];

var quad_uvs =
[
	1.0, 1.0,
	0.0, 1.0,
	0.0, 0.0,
	1.0, 0.0,
];

var quad_indices =
[
0, 2, 1, 0, 3, 2
];

var geometry = new THREE.BufferGeometry();

var vertices = new Float32Array( quad_vertices );
// Each vertex has one uv coordinate for texture mapping
var uvs = new Float32Array( quad_uvs);
// Use the four vertices to draw the two triangles that make up the square.
var indices = new Uint32Array( quad_indices )

// itemSize = 3 because there are 3 values (components) per vertex
rectGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
rectGeometry.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
rectGeometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );