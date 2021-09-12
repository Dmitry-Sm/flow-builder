import * as THREE from 'three';
import {ObjectType} from './enums'
import { Port } from './port';
import {Font} from './font'
import {Raycaster} from './raycaster'
import {rectGeometry} from './rectGeometry'

const properties = {
    collider: {
        material: new THREE.MeshBasicMaterial( {
            opacity: 0,
            transparent: true
        } )
    },
    padding: 40,
    text: {
        size: 22,
        color: {
            default: new THREE.Color( 0xeeeeee ),
            hovered: new THREE.Color( 0xee4455 )
        }
    }
}


export class PortLabel {
    type = ObjectType.Label;
    group;
    port;
    size;
    text;
    textMesh;
    collider;
    isHovered = false;


    constructor({port, size, text}) {
        this.port = port;
        this.size = size;
        this.text = text;

        this.group = new THREE.Group();
       
        this.initText();
        this.initCollider();
    }

    initCollider() {
        const leftSide = this.port.dataType === Port.DataType.Input;
        this.collider = new THREE.Mesh( rectGeometry, properties.collider.material );

        const dir = leftSide ? -1 : 1;
        const cx = -dir * (this.size.width + properties.padding);
        this.collider.position.set( cx, 0, 0 );
        this.collider.scale.set( this.size.width, this.size.height / 2, 0.01 );
        this.group.add( this.collider );
        Raycaster.addObject( this, this.collider);
    }

    initText() {
        const leftSide = this.port.dataType === Port.DataType.Input;
        const container = new ThreeMeshUI.Block({
            width: this.size.width * 2,
            height: 0.0001,
            justifyContent: 'center',
            alignContent: leftSide ? 'left' : 'right',
        });
        let x = (this.size.width + properties.padding) * (leftSide ? 1 : -1);
        container.position.set( x, 0, 2 );
        this.group.add( container );
        
        this.textMesh = new ThreeMeshUI.Text({
            content: "Port label",
            fontColor: properties.text.color.default,
            fontSize: properties.text.size,
            fontFamily: Font.Data,
            fontTexture: Font.Image
        });
        container.add(this.textMesh);
    }

    mouseDown() {

    }

    hover(isHovered) {
        const needsUpdate = this.isHovered != isHovered;

        if (needsUpdate) {
            this.isHovered = isHovered;

            const fontColor = isHovered ? 
                properties.text.color.hovered :
                properties.text.color.default;
            this.textMesh.set( { fontColor });
        }
    }
}