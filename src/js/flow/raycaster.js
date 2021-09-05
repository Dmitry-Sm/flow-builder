import * as THREE from 'three';


const raycaster = new THREE.Raycaster();
const raycastDirection = new THREE.Vector3(0, 0, -1);


export class Raycaster {
    meshMap;
    objectMap;
    lastTarget;

    constructor() {
        this.meshMap = new Map();
        this.objectMap = new Map();
    }

    addObject(object) {
        this.meshMap.set(object.mesh.id, object.mesh);
        this.objectMap.set(object.mesh.id, object)
    }

    removeObject(object) {
        this.meshMap.delete(object.mesh.id, object.mesh);
        this.objectMap.delete(object.mesh.id, object)
    }
    
    raycast(point) {
        const origin = new THREE.Vector3(point.position.x, point.position.y, 1000);
        raycaster.set(origin, raycastDirection);

        const a = Array.from(this.meshMap.values());
        const intersect = raycaster.intersectObjects( a )[0];

        // this.objectMap.values().forEach(object => {
        //     object.hover(object.mesh.id === intersect.object.id);
        // });

        if (intersect) {
            const target = this.objectMap.get(intersect.object.id);
            
            if (this.lastTarget && this.lastTarget != target) {
                this.lastTarget.hover(false);
            }

            this.lastTarget = target;
            this.lastTarget.hover(true);
        }
        else {
            if (this.lastTarget) {
                this.lastTarget.hover(false);
                this.lastTarget = null;
            }
        }
    }
}
