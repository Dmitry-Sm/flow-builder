import * as THREE from 'three';
import {rectGeometry} from './rectGeometry'
import {PortList} from './portList'
import {Port} from './port'
import {Raycaster} from './raycaster'
import {Font} from './font'
import {ObjectType} from './enums'
import ThreeMeshUI from 'three-mesh-ui'

import frag from './shaders/slice_frag.glsl'
import vert from './shaders/vert.glsl'
import bgTexture from '../../images/node_mask.png'


const properties = {
    size: {
        width: 200,
        height: 400
    },
    material: {
        texture: new THREE.TextureLoader().load(bgTexture),
        border: {
            defaultColor: new THREE.Vector3(0, 0, 0),
            clickedColor: new THREE.Vector3(1, 1, 1)
        },
        background: {
            defaultColor: new THREE.Vector3(0.24, 0.28, 0.32) 
        }
    },
    ports: {
        topPadding: 40,
        bottomPadding: 10
    },
    header: {
        height: 34,
        padding: 8,
        font: {
            size: 26,
            color: new THREE.Color( 0xffffff )
        }
    }
}


const Eps = 1;

export class Node {
    type = ObjectType.Node;
    flow;
    geometry;
    material;
    mesh;
    group;
    inputPortList;
    outputPortList;
    textContainer;
    text;
    size;
    isDraggable = true;
    uniforms;
    name;

    isClicked = false;
    isPositioning = false;
    currentPosition = new THREE.Vector2(0, 0);
    targetPosition = new THREE.Vector2(0, 0);
    zpos;

    get left() {
        return -this.size.width / 2;
    }

    get right() {
        return this.size.width / 2;
    }

    get top() {
        return this.size.height / 2;
    }

    constructor({flow, position, name} = {}) {
        this.flow = flow;
        this.currentPosition.copy(position);
        this.targetPosition.copy(position);
        this.geometry = rectGeometry;
        this.size = Object.assign({}, properties.size);
        this.name = name;

        this.uniforms = {
            u_texture: { 
                value: properties.material.texture
            },
            u_headerColor: {
                value: new THREE.Vector3(Math.random(), Math.random(), Math.random()) 
            },
            u_borderColor: {
                value: properties.material.border.defaultColor
            },
            u_backgroundColor: {
                value: properties.material.background.defaultColor
            },
            u_size: { 
                value: new THREE.Vector2(this.size.width, this.size.height) 
            }
        }

        this.material = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: vert,
            fragmentShader: frag
        } );
        this.group = new THREE.Group();

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.scale.set(this.size.width / 2, this.size.height / 2, 1);
        this.zpos = Math.floor(Math.random() * 500);
        this.group.position.set(position.x, position.y, this.zpos);
        this.group.add(this.mesh);
        Raycaster.addObject(this, this.mesh);

        this.initPorts();
        this.addHeader();

        this.updateSize();
    }

    addHeader() {
        this.textContainer = new ThreeMeshUI.Block({
            width: this.size.width,
            height: 0.00001, // the number is set small to avoid overlapping the text with the container, but not zero to pass the check
            padding: properties.header.padding,
            justifyContent: 'center',
            alignContent: 'left',
            backgroundOpacity: 0.2
        });
    
        this.textContainer.position.set( 0, (this.size.height + properties.header.height) / 2, 0 );
        this.group.add( this.textContainer );
    
        this.text = new ThreeMeshUI.Text({
            content: 'Node ' + this.name,
            fontColor: properties.header.font.color,
            fontSize: properties.header.font.size,
            fontFamily: Font.Data,
            fontTexture: Font.Image,
        });
        
        this.textContainer.add(this.text);    
    }

    initPorts() {
        const leftTop = new THREE.Vector2(this.left, this.top - properties.ports.topPadding);
        this.inputPortList = new PortList({
            flow: this.flow,
            dataType: Port.DataType.Input,
            position: leftTop,
            node: this
        });
        this.group.add(this.inputPortList.group);
        
        const rightCenter = new THREE.Vector2(this.right, -properties.ports.bottomPadding);
        this.outputPortList = new PortList({
            flow: this.flow,
            dataType: Port.DataType.Output,
            position: rightCenter,
            node: this
        });
        this.group.add(this.outputPortList.group);
    }

    // #region Events

    mouseDown(isClicked) {
        const needUpdate = this.isClicked != isClicked;

        if (needUpdate) {
            this.isClicked = isClicked;
            this.updateBorder();
        }
    }

    hover(isHovered) {
    }

    drag(delta) {
        this.isPositioning = true;
        this.targetPosition.add(delta);
    }

    // #endregion
    // #region Updates

    update() {
        this.updatePosition();
    }

    updatePorts() {
        this.inputPortList.ports.forEach(port => {
            port.updateLinePositions();
        });
        this.outputPortList.ports.forEach(port => {
            port.updateLinePositions();
        });
    }

    updateBorder() {
        this.uniforms.u_borderColor.value = this.isClicked ? 
            properties.material.border.clickedColor : 
            properties.material.border.defaultColor;
    }

    updatePosition() {
        if (this.isPositioning) {
            const sub = new THREE.Vector2().subVectors(this.targetPosition, this.currentPosition).multiplyScalar(0.25);
            this.currentPosition.add(sub);
            this.group.position.set(this.currentPosition.x, this.currentPosition.y, this.group.position.z);
            this.updatePorts();

            if (this.currentPosition.distanceTo(this.targetPosition) < Eps) {
                this.isPositioning = false;
            }
        }
    }

    updateSize() {
        const h = this.inputPortList.size.height + 
            this.outputPortList.size.height + 
            properties.ports.topPadding + 
            properties.ports.bottomPadding;
        this.size.height = h;
        this.mesh.scale.set(this.size.width / 2, this.size.height / 2, 1);
        this.uniforms.u_size.value.set(this.size.width, this.size.height);

        this.textContainer.position.y = this.top + properties.header.height / 2;

        this.inputPortList.group.position.y = this.top - properties.ports.topPadding;
        this.outputPortList.group.position.y = this.top - this.inputPortList.size.height -
            properties.ports.topPadding - 
            properties.ports.bottomPadding;
    }
    // #endregion
}