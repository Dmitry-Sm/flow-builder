import * as THREE from 'three';
import {rectGeometry} from './rectGeometry'


const color = {
    default: 0x280000,
    hovered: 0x284000
}


export class Port {
    geometry;
    material;
    mesh;
    position;
    size;

    constructor({position, size} = {}) {
        this.position = position ? position : new THREE.Vector2(0, 0);
        this.size = size;
        this.geometry = rectGeometry;
        this.material = new THREE.MeshBasicMaterial( {color: color.default} );

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.set(this.position.x, this.position.y, 0);
        this.mesh.scale.set(this.size.width, this.size.height, 1);
    }

    hover(isHovered) {        
        const newColor = isHovered ? color.hovered : color.default;
        this.mesh.material.color.set( newColor );
    }
}

