import * as THREE from 'three';
import {rectGeometry} from './rectGeometry'
import {PortList} from './portList'
import {Raycaster} from './raycaster'

const color = {
    default: 0x880000,
    hovered: 0x886000
}

const size = {
    width: 100,
    height: 200
}

const Eps = 1;
const portOffset = {top: 80, bottom: 30};

export class Node {
    geometry;
    material;
    mesh;
    group;
    inputPortList;
    outputPortList;
    isMovable = true;

    isPositioning = false;
    currentPosition = new THREE.Vector2(0, 0);
    targetPosition = new THREE.Vector2(0, 0);

    static States = {default: 0, hovered: 1, highlight: 2};
    state;

    constructor({position} = {}) {
        this.state = Node.States.default;
        this.currentPosition.copy(position);
        this.targetPosition.copy(this.currentPosition);
        this.geometry = rectGeometry;
        this.material = new THREE.MeshBasicMaterial( {color: color.default} );
        this.group = new THREE.Group();

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.scale.set(size.width, size.height, 1);
        this.group.position.set(this.currentPosition.x, this.currentPosition.y, Math.floor(Math.random() * 500));
        this.group.add(this.mesh);
        Raycaster.addObject(this);

        this.initPorts();
        this.update();
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
        this.updateHover();
    }

    move(delta) {
        this.isPositioning = true;
        this.targetPosition.add(delta);
    }

    update() {
        this.updatePosition();
        
        requestAnimationFrame( () => {this.update()} );
    }

    updateHover() {
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

    updatePosition() {
        if (this.isPositioning) {
            const sub = new THREE.Vector2().subVectors(this.targetPosition, this.currentPosition).multiplyScalar(0.5);
            this.currentPosition.add(sub);
            this.group.position.set(this.currentPosition.x, this.currentPosition.y, this.group.position.z);

            if (this.currentPosition.distanceTo(this.targetPosition) < Eps) {
                this.isPositioning = false;
            }
        }
    }
}

