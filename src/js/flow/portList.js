import * as THREE from 'three';
import {Port} from './port'



const portYOffset = 50;


export class PortList {
    position;
    group;
    node;
    ports = new Array();

    dataType;

    constructor({position, size, dataType, node} = {}) {
        this.group = new THREE.Group();
        this.dataType = dataType;
        this.node = node;
        this.position = position ? position : new THREE.Vector2(0, 0);
        this.group.position.set(this.position.x, this.position.y, 0.5)

        this.initPorts(3);
    }

    initPorts(num) {
        const dir = this.dataType === Port.DataType.Input ? -1 : 1;
        const position = new THREE.Vector2(dir, 0);

        for (let i = 0; i < num; i++) {
            const port = new Port({position, dataType: this.dataType, portList: this});
            this.ports.push(port);

            position.y -= portYOffset;
            this.group.add(port.group);
        }
    }
}

