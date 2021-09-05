import * as THREE from 'three';


const canvas = document.querySelector('.main-canvas');


export class Controls extends THREE.EventDispatcher {
    STATE = { NONE: - 1, PAN: 0 };
    state = this.STATE.NONE;
    eventTypes = {click: 'click', mouseMove: 'mouseMove'};
    scene;
    scroll = 1;

    panStart = new THREE.Vector2(0, 0);
    panEnd = new THREE.Vector2(0, 0);
    panDelta = new THREE.Vector2(0, 0);

    constructor(scene) {
        super();
        this.scene = scene;

        //const e = THREE.EventDispatcher({type: 'click', });

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
        const position = new THREE.Vector2(
            event.clientX - canvas.clientWidth / 2,
           -event.clientY + canvas.clientHeight / 2);

        this.dispatchEvent( { 
            type: this.eventTypes.click, 
            position} );

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

        const position = new THREE.Vector2(
            event.clientX - canvas.clientWidth / 2 - 200,
           -event.clientY - canvas.clientHeight / 2);

        this.dispatchEvent( { 
            type: this.eventTypes.click, 
            position} );
    }

    onMouseUp(event) {
        this.state = this.STATE.NONE;
    }

    pan(vector) {
        this.scene.position.add(new THREE.Vector3(vector.x, vector.y, 0));
    }
}