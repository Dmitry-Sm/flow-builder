import * as THREE from 'three';


const raycaster = new THREE.Raycaster();
const raycastDirection = new THREE.Vector3(0, 0, -1);


export class Raycaster {
    static meshMap;
    static objectMap;
    lastTarget;
    camera;

    constructor(camera) {
        this.camera = camera;
        Raycaster.meshMap = new Map();
        Raycaster.objectMap = new Map();
    }

    static addObject(object, mesh) {
        Raycaster.meshMap.set(mesh.id, mesh);
        Raycaster.objectMap.set(mesh.id, object)
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
        raycaster.setFromCamera(position, this.camera);

        const raycastingObjects = Array.from(Raycaster.meshMap.values());
        const intersects = raycaster.intersectObjects( raycastingObjects, false );        

        return intersects;
    }
}
