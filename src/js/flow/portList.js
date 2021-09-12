import * as THREE from 'three';
import {Port} from './port'
import { colorsCollection } from './color';


const portYOffset = 50;


export class PortList {
    position;
    group;
    node;
    size;
    ports = new Array();
    portCounter = 1;

    dataType;

    constructor({position, dataType, node} = {}) {
        this.group = new THREE.Group();
        this.dataType = dataType;
        this.node = node;
        this.position = position ? position : new THREE.Vector2(0, 0);
        this.group.position.set(this.position.x, this.position.y, 0.5)

        this.initPorts(Math.floor(Math.random() * 4) + 1);

        this.size = {
            width: node.size.width,
            height: this.ports.length * portYOffset
        }
    }

    initPorts(num) {
        const dir = this.dataType === Port.DataType.Input ? -1 : 1;
        const position = new THREE.Vector2(dir, 0);

        for (let i = 0; i < num; i++) {
            this.createPort(position);
            position.y -= portYOffset;
        }
    }

    createPort(position) {
        const port = new Port({
            position, 
            dataType: this.dataType, 
            portList: this,
            name: this.getPortName(this.portCounter),
            color: this.getPortColor(Math.floor(Math.random() * 100))
        });
        this.ports.push(port);
        this.group.add(port.group);
        this.portCounter++;
    }

    getPortName(num) {
        return this.dataType === Port.DataType.Input ?
            this.node.name + num :
            num + this.node.name;
    }

    getPortColor(num) {
        const colorName = colorsCollection[num % colorsCollection.length];
        return new THREE.Color(colorName);
    }
}

