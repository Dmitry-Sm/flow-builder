import * as THREE from 'three';
import {rectGeometry} from './rectGeometry'
import {PortList} from './portList'
import {Port} from './port'
import {Raycaster} from './raycaster'
import {Font} from './font'
import {ObjectType} from './enums'
import ThreeMeshUI from 'three-mesh-ui'


const color = {
    default: 0x880000,
    hovered: 0x886000
}

const size = {
    width: 200,
    height: 400
}

const headerProperty = {
    height: 30,
    padding: 5,
    font: {
        size: 26,
        color: new THREE.Color( 0x333333 )
    }
}

const Eps = 1;
const portOffset = {top: 40, bottom: 10};

export class Node {
    type = ObjectType.Node;
    geometry;
    material;
    mesh;
    group;
    inputPortList;
    outputPortList;
    text;
    isDraggable = true;

    isPositioning = false;
    currentPosition = new THREE.Vector2(0, 0);
    targetPosition = new THREE.Vector2(0, 0);
    zpos;

    static States = {default: 0, hovered: 1, highlight: 2};
    state;

    constructor({position} = {}) {
        this.state = Node.States.default;
        this.currentPosition.copy(position);
        this.targetPosition.copy(position);
        this.geometry = rectGeometry;
        this.material = new THREE.MeshBasicMaterial( {color: color.default} );
        this.group = new THREE.Group();

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.scale.set(size.width / 2, size.height / 2, 1);
        this.zpos = Math.floor(Math.random() * 500);
        this.group.position.set(position.x, position.y, this.zpos);
        this.group.add(this.mesh);
        Raycaster.addObject(this);

        this.initPorts();
        this.addHeader();
        this.update();
    }

    addHeader() {
        const container = new ThreeMeshUI.Block({
            width: size.width,
            height: 0.00001, // the number is set small to avoid overlapping the text with the container, but not zero to pass the check
            padding: headerProperty.padding,
            justifyContent: 'center',
            alignContent: 'left',
            backgroundOpacity: 0.2
        });
    
        container.position.set( 0, (size.height + headerProperty.height) / 2, 0 );

        this.group.add( container );
    
        this.text = new ThreeMeshUI.Text({
            content: "Node header",
            fontColor: headerProperty.font.color,
            fontSize: headerProperty.font.size,
            fontFamily: Font.Data,
            fontTexture: Font.Image,
        });
        // this.text.position.set(0, 0, 0);
        container.add(this.text);    
    }

    initPorts() {
        const leftTop = new THREE.Vector2(-size.width / 2 + 1, size.height / 2 - portOffset.top);
        this.inputPortList = new PortList({
            dataType: Port.DataType.Input,
            position: leftTop
        });
        this.group.add(this.inputPortList.group);
        
        const rightCenter = new THREE.Vector2(size.width / 2 - 1, -portOffset.bottom);
        this.outputPortList = new PortList({
            dataType: Port.DataType.Output,
            position: rightCenter
        });
        this.group.add(this.outputPortList.group);
    }

    // #region Events

    mouseDown() {

    }

    hover(isHovered) {
        this.state = isHovered ? Node.States.hovered : Node.States.default;
        this.updateHover();
    }

    drag(delta) {
        this.isPositioning = true;
        this.targetPosition.add(delta);
    }

    // #endregion
    // #region Updates

    update() {
        this.updatePosition();
        requestAnimationFrame( () => {this.update()} );
    }

    updatePorts() {
        this.inputPortList.ports.forEach(port => {
            port.updateLinePositions();
        });
        this.outputPortList.ports.forEach(port => {
            port.updateLinePositions();
        });
    }

    updateHover() {
        switch (this.state) {
            case Node.States.default:
                
                this.mesh.material.color.set( color.default );
                break;

            case Node.States.hovered:
                
                this.mesh.material.color.set( color.hovered );
                break;
        
            default:
                break;
        }
    }

    updatePosition() {
        if (this.isPositioning) {
            const sub = new THREE.Vector2().subVectors(this.targetPosition, this.currentPosition).multiplyScalar(0.5);
            this.currentPosition.add(sub);
            this.group.position.set(this.currentPosition.x, this.currentPosition.y, this.group.position.z);
            this.updatePorts();

            if (this.currentPosition.distanceTo(this.targetPosition) < Eps) {
                this.isPositioning = false;
            }
        }
    }
    // #endregion
}