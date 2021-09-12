import * as THREE from 'three';
import {Node} from './node'
import {Raycaster} from './raycaster'
import {Controls} from '../controls'
import { ObjectType } from './enums';

const Eps = 0.001;
const Abc = 'abcdefghijklmnopqrstuvwxyz';

export class Flow
{
    nodeList;
    nodeMeshMap;
    group;
    scaleGroup;
    raycaster;
    hoverTarget;
    clickTarget;
    grabTarget;
    nodeCounter = 0;

    isPositioning = false;
    currentPosition = new THREE.Vector2(0, 0);
    targetPosition = new THREE.Vector2(0, 0);

    isScaling = false;
    currentScale = 1;
    targetScale = 1;

    constructor({controls, flowGroup, threeManager})
    {
        this.nodeList = new Array();
        this.nodeMeshMap = new Map();
        this.raycaster = new Raycaster(threeManager.camera);

        this.scaleGroup = flowGroup;
        this.group = new THREE.Group();
        this.scaleGroup.add(this.group)

        controls.addEventListener(Controls.eventTypes.wheel, e => {this.wheel(e)});
        controls.addEventListener(Controls.eventTypes.mousemove, e => {this.mouseMove(e)});
        controls.addEventListener(Controls.eventTypes.mousedown, e => {this.mouseDown(e)});
        controls.addEventListener(Controls.eventTypes.mouseup, e => {this.mouseUp(e)});
        
        this.createTestNodes(6);
        this.update();
    }

    createTestNodes(num) {
        const position = new THREE.Vector2();

        for (let i = 0; i < num; i++) {
            position.set((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 1000);
            this.createNode(position);
        }
    }

    createNode(position) {
        const node = new Node({position, name: this.getNodeName(this.nodeCounter++)});
        this.nodeList.push(node);
        this.nodeMeshMap.set(node.mesh.id, node);
        this.group.add(node.group);

        return node;
    }

    getNodeName(num) {
        let s = '';
        const length = Abc.length;

        while (num > 0 || s === '') {
            const pos = num % length;
            num = Math.floor(num / length);
            s = Abc.charAt(pos) + s;
        }

        return s;
    }

    wheel(event) {
        this.isScaling = true;
        this.targetScale = event.scale; // TODO scale to cursor point
    }

    mouseDown(point) {
        const intersects = this.raycaster.raycast(point.position);
        const intersect = intersects[0];
        let target = intersect && Raycaster.objectMap.get(intersect.object.id);

        if (target) {
            if (target.type === ObjectType.Label && intersects.length > 1) {
                target = Raycaster.objectMap.get(intersects[1].object.id);            
            }

            if (target.isDraggable) {
                this.grabTarget = target;
            }
            
            if (target.type === ObjectType.Node || target.type === ObjectType.Line) {
                if (this.clickTarget && this.clickTarget != target) {
                    this.clickTarget.mouseDown(false);
                }
    
                this.clickTarget = target;
                this.clickTarget.mouseDown(true);
            }
            else {
                if (this.clickTarget) {
                    this.clickTarget.mouseDown(false);
                    this.clickTarget = null;
                }

                target.mouseDown();                
            }
        }
        else {
            if (this.clickTarget) {
                this.clickTarget.mouseDown(false);
                this.clickTarget = null;
            }
        }
    }

    mouseUp(point) {
        if (this.grabTarget && this.grabTarget.type === ObjectType.Port) {
            const intersect = this.raycaster.raycast(point.position)[0];
            const target = intersect && Raycaster.objectMap.get(intersect.object.id);

            this.grabTarget.mouseUp(target);
        }

        this.grabTarget = null;
    }

    mouseMove(point) {        
        if (point.pressed) {
            if (this.grabTarget) {
                this.grabTarget.drag(point.delta.multiplyScalar(1 / this.currentScale));                
            }
            else {
                this.targetPosition.add(point.delta.multiplyScalar(1 / this.currentScale));
                this.isPositioning = true;
            }
        }
        else {
            const intersect = this.raycaster.raycast(point.position)[0];
            this.checkHover(intersect);
        }
    }

    checkHover(intersect) {
        if (intersect) {
            const target = Raycaster.objectMap.get(intersect.object.id);

            if (target.type === ObjectType.Line) {
                return;
            }
            
            if (this.hoverTarget && this.hoverTarget != target) {
                this.hoverTarget.hover(false);
            }

            this.hoverTarget = target;
            this.hoverTarget.hover(true);
        }
        else {
            if (this.hoverTarget) {
                this.hoverTarget.hover(false);
                this.hoverTarget = null;
            }
        }
    }

    update() {
        this.updatePosition();
        this.updateScale();
        this.updateNodes();

        requestAnimationFrame( () => {this.update()} );
    }

    updateNodes() {
        this.nodeList.forEach(node => {
            node.update();
        });
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
            this.scaleGroup.scale.set(this.currentScale, this.currentScale, 1);

            if (Math.abs(this.currentScale - this.targetScale) < Eps) {
                this.isScaling = false;
            }
        }
    }
}