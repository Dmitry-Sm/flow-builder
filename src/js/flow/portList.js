import * as THREE from 'three';
import {Port} from './port'


const portSize = {
    width: 20,
    height: 20
}

const portYOffset = 50;


export class PortList {
    position;
    group;

    static Type = {Input: -1, Output: 1}
    type;

    constructor({position, size, type} = {}) {
        this.group = new THREE.Group();
        this.type = type;
        this.position = position ? position : new THREE.Vector2(0, 0);
        this.group.position.set(this.position.x, this.position.y, 0.5)

        this.initPorts(3);
    }

    initPorts(num) {
        const dir = this.type === PortList.Type.Input ? -1 : 1;
        const position = new THREE.Vector2(portSize.width * dir, 0);

        for (let i = 0; i < num; i++) {
            const port = new Port({position, size: portSize});
            position.y += portYOffset * dir;
            this.group.add(port.mesh);                
        }
        
    }
}

