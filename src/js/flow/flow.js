import * as THREE from 'three';
import {Node} from './node'
import {Raycaster} from './raycaster'


export class Flow
{
    nodeList;
    nodeMeshMap;
    group;
    raycaster;

    constructor({controls, flowGroup})
    {
        this.nodeList = new Array();
        this.nodeMeshMap = new Map();
        this.raycaster = new Raycaster();
        this.group = flowGroup;
        controls.addEventListener(controls.eventTypes.click, e => {this.clickEvent(e)});
        
        this.createNodes(200);
    }

    createNodes(num) {
        const position = new THREE.Vector2();

        for (let i = 0; i < num; i++) {
            position.set((Math.random() - 0.5) * 18000, (Math.random() - 0.5) * 6000);
            const node = new Node({position});
            this.nodeList.push(node);
            this.nodeMeshMap.set(node.mesh.id, node);
            this.group.add(node.group);
            this.raycaster.addObject(node);
        }
    }

    clickEvent(point) {
        this.raycaster.raycast(point);      
    }
}