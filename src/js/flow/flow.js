import * as THREE from 'three';
import {Node} from './node'
import {Raycaster} from './raycaster'
import {Controls} from '../controls'


const Eps = 0.001;


export class Flow
{
    nodeList;
    nodeMeshMap;
    group;
    scaleGroup;
    raycaster;
    lastHoverTarget;
    lastRaycastTarget;
    isGrabbing = false;

    isPositioning = false;
    currentPosition = new THREE.Vector2(0, 0);
    targetPosition = new THREE.Vector2(0, 0);

    isScaling = false;
    currentScale = 1;
    targetScale = 1;

    constructor({controls, flowGroup})
    {
        this.nodeList = new Array();
        this.nodeMeshMap = new Map();
        this.raycaster = new Raycaster();

        this.scaleGroup = flowGroup;
        this.group = new THREE.Group();
        this.scaleGroup.add(this.group)

        controls.addEventListener(Controls.eventTypes.wheel, e => {this.wheel(e)});
        controls.addEventListener(Controls.eventTypes.mousemove, e => {this.mouseMove(e)});
        controls.addEventListener(Controls.eventTypes.mousedown, e => {this.mouseDown(e)});
        controls.addEventListener(Controls.eventTypes.mouseup, e => {this.mouseUp(e)});
        
        this.createNodes(200);
        requestAnimationFrame( () => {this.update()} );
    }

    createNodes(num) {
        const position = new THREE.Vector2();

        for (let i = 0; i < num; i++) {
            position.set((Math.random() - 0.5) * 18000, (Math.random() - 0.5) * 6000);
            const node = new Node({position});
            this.nodeList.push(node);
            this.nodeMeshMap.set(node.mesh.id, node);
            this.group.add(node.group);
            
        }
    }

    wheel(event) {
        this.isScaling = true;
        this.targetScale = event.scale; // TODO scale to cursor point
    }

    mouseDown(point) {
        const intersect = this.raycaster.raycast(point.position);
        const target = intersect && Raycaster.objectMap.get(intersect.object.id);

        if (target && target.isMovable) {
            this.lastRaycastTarget = target;
            this.isGrabbing = true;
        }
    }

    mouseUp() {
        this.isGrabbing = false;
    }

    mouseMove(point) {        
        if (point.pressed) {
            if (this.isGrabbing) {
                this.lastRaycastTarget.move(point.delta.multiplyScalar(1 / this.currentScale));                
            }
            else {
                this.targetPosition.add(point.delta.multiplyScalar(1 / this.currentScale));
                this.isPositioning = true;
            }
        }
        else {
            const intersect = this.raycaster.raycast(point.position);
            this.checkHover(intersect);
        }
    }

    checkHover(intersect) {
        if (intersect) {
            const target = Raycaster.objectMap.get(intersect.object.id);
            
            if (this.lastRaycastTarget && this.lastRaycastTarget != target) {
                this.lastRaycastTarget.hover(false);
            }

            this.lastRaycastTarget = target;
            this.lastRaycastTarget.hover(true);
        }
        else {
            if (this.lastRaycastTarget) {
                this.lastRaycastTarget.hover(false);
                this.lastRaycastTarget = null;
            }
        }
    }

    update() {
        this.updatePosition();
        this.updateScale();

        requestAnimationFrame( () => {this.update()} );
    }

    updatePosition() {
        if (this.isPositioning) {
            const sub = new THREE.Vector2()
                .subVectors(this.targetPosition, this.currentPosition)
                .multiplyScalar(0.5);
            this.currentPosition.add(sub);
            this.group.position.set(this.currentPosition.x, this.currentPosition.y, this.group.position.z);

            if (this.currentPosition.distanceTo(this.targetPosition) < Eps) {
                this.isPositioning = false;
            }
        }
    }

    updateScale() {
        if (this.isScaling) {
            this.currentScale -= (this.currentScale - this.targetScale) * 0.1;
            this.scaleGroup.scale.setScalar(this.currentScale);

            if (Math.abs(this.currentScale - this.targetScale) < Eps) {
                this.isScaling = false;
            }
        }
    }
}