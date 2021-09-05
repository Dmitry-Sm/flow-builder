import * as THREE from 'three';
import {rectGeometry} from './rectGeometry'
import {PortList} from './portList'


const color = {
    default: 0x880000,
    hovered: 0x886000
}

const size = {
    width: 100,
    height: 200
}

const portOffset = {top: 80, bottom: 30};

export class Node {
    geometry;
    material;
    mesh;
    group;
    position;
    inputPortList;
    outputPortList;

    static States = {default: 0, hovered: 1, highlight: 2};
    state;

    constructor({position} = {}) {
        this.state = Node.States.default;
        this.position = position ? position : new THREE.Vector2(0, 0);
        this.geometry = rectGeometry;
        this.material = new THREE.MeshBasicMaterial( {color: color.default} );
        this.group = new THREE.Group();

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.scale.set(size.width, size.height, 1);
        this.group.position.set(this.position.x, this.position.y, Math.floor(Math.random() * 500));
        this.group.add(this.mesh);

        this.initPorts();
    }

    initPorts() {
        const leftTop = new THREE.Vector2(-size.width, size.height - portOffset.top);
        this.inputPortList = new PortList({
            type: PortList.Type.Input,
            position: leftTop
        });
        this.group.add(this.inputPortList.group);
        
        const rightBottom = new THREE.Vector2(size.width, -size.height + portOffset.bottom);
        this.outputPortList = new PortList({
            type: PortList.Type.Output,
            position: rightBottom
        });
        this.group.add(this.outputPortList.group);
    }

    hover(isHovered) {
        this.state = isHovered ? Node.States.hovered : Node.States.default;
        this.update();
    }

    update() {
        switch (this.state) {
            case Node.States.default:
                
                this.mesh.material.color.set( color.default );
                break;

            case Node.States.hovered:
                
                this.mesh.material.color.set( color.hovered );
                break;
        
            default:
                break;
        }
    }
}

