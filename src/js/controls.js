import * as THREE from 'three';


export class Controls {
    STATE = { NONE: - 1, PAN: 0 };
    state = this.STATE.NONE;
    scene;
    scroll = 1;

    panStart = new THREE.Vector2(0, 0);
    panEnd = new THREE.Vector2(0, 0);
    panDelta = new THREE.Vector2(0, 0);

    constructor(scene) {
        this.scene = scene;

        const canvas = document.querySelector('.main-canvas');

        canvas.addEventListener('wheel', event => this.onMouseWheel(event), false)
        canvas.addEventListener('mousedown', event => this.onMouseDown(event), false)
        canvas.addEventListener('mouseup', event => this.onMouseUp(event), false)
        canvas.addEventListener('mousemove', event => this.onMouseMove(event), false)
    }

    onMouseWheel(event) {
		event.preventDefault();
		event.stopPropagation();

        this.scroll -= event.deltaY * 0.001;
        this.scroll = Math.min(Math.max(0.15, this.scroll), 2);
        this.scene.scale.setScalar(this.scroll);
    }

    onMouseMove(event) {
        //this.panDelta.multiplyScalar(0);

        switch (this.state) {
            case this.STATE.PAN:
                
		        this.panEnd.set( event.clientX, -event.clientY );
                this.panDelta.subVectors( this.panEnd, this.panStart );
                this.pan(this.panDelta);
                this.panStart.copy( this.panEnd );
                
                break;
        
            default:
                break;
        }
    }

    onMouseDown(event) {
        this.state = this.STATE.PAN;
        this.panStart.set( event.clientX, -event.clientY );
    }

    onMouseUp(event) {
        this.state = this.STATE.NONE;
    }

    pan(vector) {
        this.scene.position.add(new THREE.Vector3(vector.x, vector.y, 0));
    }
}