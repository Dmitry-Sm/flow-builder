import * as THREE from 'three';


const canvas = document.querySelector('.main-canvas');


export class Controls extends THREE.EventDispatcher {
    scene;
    // STATE = { NONE: - 1, PAN: 0 };
    // state = this.STATE.NONE;
    scroll = 1;
    pressed = false;

    moveStart = new THREE.Vector2(0, 0);
    moveEnd = new THREE.Vector2(0, 0);
    deltaMove = new THREE.Vector2(0, 0);

    static eventTypes = {mousedown: 'mousedown', mouseup: 'mouseup', mousemove: 'mousemove', wheel: 'wheel'};

    constructor(scene) {
        super();
        this.scene = scene;

        //const e = THREE.EventDispatcher({type: 'click', });

        canvas.addEventListener('wheel', event => this.onMouseWheel(event), false)
        canvas.addEventListener('pointerdown', event => this.onMouseDown(event), false)
        canvas.addEventListener('pointerup', event => this.onMouseUp(event), false)
        canvas.addEventListener('pointermove', event => this.onMouseMove(event), false)
        canvas.addEventListener('mouseleave', event => this.onMouseLeave(event), false)
    }

    onMouseLeave() {
        this.pressed = false;

    }

    onMouseWheel(event) {
		event.preventDefault();
		event.stopPropagation();

        this.scroll -= event.deltaY * 0.0005;
        this.scroll = Math.min(Math.max(0.15, this.scroll), 8);

        this.dispatchEvent( { 
            type: Controls.eventTypes.wheel, 
            scale: this.scroll} );
    }

    onMouseMove(event) {
        const position = new THREE.Vector2(
            event.clientX - canvas.clientWidth / 2,
           -event.clientY + canvas.clientHeight / 2);

        this.moveEnd.set( event.clientX, -event.clientY );
        this.deltaMove.subVectors( this.moveEnd, this.moveStart );
        this.moveStart.copy( this.moveEnd );
        
        this.dispatchEvent( { 
            type: Controls.eventTypes.mousemove, 
            delta: this.deltaMove,
            pressed: this.pressed,
            position} );
    }

    onMouseDown(event) {
        this.pressed = true;
        this.moveStart.set( event.clientX, -event.clientY );

        const position = new THREE.Vector2(
            event.clientX - canvas.clientWidth / 2,
           -event.clientY + canvas.clientHeight / 2);

        this.dispatchEvent( { 
            type: Controls.eventTypes.mousedown, 
            position} );
    }

    onMouseUp(event) {
        this.pressed = false;

        const position = new THREE.Vector2(
            event.clientX - canvas.clientWidth / 2,
           -event.clientY + canvas.clientHeight / 2);

        this.dispatchEvent( { 
            type: Controls.eventTypes.mouseup, 
            position} );
    }
}