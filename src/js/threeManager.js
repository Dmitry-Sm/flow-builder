import * as THREE from 'three';

export class ThreeManager {
    scene;
    camera;
    renderer;

    constructor() {
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xcccccc)

        const width = window.innerWidth, height = window.innerHeight;
        this.camera = new THREE.OrthographicCamera( -width / 2, width / 2, height / 2, 
                                                    -height / 2, 1, 1000 );

        this.scene.add( this.camera );
        this.camera.position.set( 0, 0, 1000 );
        this.camera.lookAt( 0, 0, 0 );
        const canvas = document.querySelector('.main-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });
        
        this.renderer.setPixelRatio( window.devicePixelRatio );

        window.addEventListener('resize', () => {this.onWindowResize()} );
        this.onWindowResize();
    }

    onWindowResize() {
        const width = window.innerWidth, height = window.innerHeight;

        this.camera.left =  -width / 2;
        this.camera.right =  width / 2;
        this.camera.top =  height / 2;
        this.camera.bottom =  -height / 2;

        this.camera.updateProjectionMatrix();
        this.renderer.setSize( width, height );
    };

    render() {
        this.renderer.render( this.scene, this.camera );
    }
}