import * as THREE from 'three';


const raycaster = new THREE.Raycaster();
const raycastDirection = new THREE.Vector3(0, 0, -1);


export class Raycaster {
    static meshMap;
    static objectMap;
    lastTarget;

    constructor() {
        Raycaster.meshMap = new Map();
        Raycaster.objectMap = new Map();
    }

    static addObject(object) {
        Raycaster.meshMap.set(object.mesh.id, object.mesh);
        Raycaster.objectMap.set(object.mesh.id, object)
    }

    static addObjects(objects) {
        objects.forEach(object => {
            Raycaster.addObject(object);
        });
    }

    static removeObject(object) {
        Raycaster.meshMap.delete(object.mesh.id, object.mesh);
        Raycaster.objectMap.delete(object.mesh.id, object)
    }

    static removeObjects(objects) {
        objects.forEach(object => {
            Raycaster.removeObject(object);
        });
    }
    
    raycast(position) {
        const origin = new THREE.Vector3(position.x, position.y, 1000);
        raycaster.set(origin, raycastDirection);

        const a = Array.from(Raycaster.meshMap.values());
        const intersect = raycaster.intersectObjects( a )[0];

        return intersect;
    }
}
