import * as THREE from 'three';
import {rectGeometry} from './rectGeometry'
import {Raycaster} from './raycaster'
import {Font} from './font'
import {Line} from './line'
import {ObjectType} from './enums'
import portIcon from '../../images/port.png'

const properties = {
    icon: {
        texture: new THREE.TextureLoader().load(portIcon),
    },
    color: {
        default: 0x280000,
        hovered: 0x286000
    },
    size: {
        width: 16,
        height: 16
    },
    label: {
        width: 180,
        height: 0.000001,
        padding: 15,
        font: {
            size: 22,
            color: new THREE.Color( 0xeeeeee )
        }
    }
}


export class Port {
    type = ObjectType.Port;
    geometry;
    material;
    mesh;
    position;
    size;
    group;
    portList;
    text;
    lines = new Array();
    unattachedLine;
    isDraggable = true;

    _linePointOffset;
    _lineWorldPoint = new THREE.Vector3();
    get lineWorldPoint() {
        if (!this._linePointOffset) {
            const direction = this.dataType === Port.DataType.Input ? -1 : 1;

            this._linePointOffset = new THREE.Vector3(2 * this.size.width * direction, 0, 0);
        }

        this.group.updateMatrixWorld();
        this.group.getWorldPosition(this._lineWorldPoint).add(this._linePointOffset);

        return this._lineWorldPoint;
    }

    static DataType = {Input: -1, Output: 1}
    dataType;

    constructor({position, dataType, portList} = {}) {
        this.dataType = dataType;
        this.portList = portList;
        this.position = position ? position : new THREE.Vector2(0, 0);

        this.group = new THREE.Group();
        this.group.position.set(this.position.x, this.position.y, 0.5);
        this.size = properties.size;

        this.initIcon();
        this.initLabel();
    }

    initIcon() {
        this.geometry = rectGeometry;
        this.material = new THREE.MeshBasicMaterial( {
            // color: properties.color.default,
            map: properties.icon.texture
        } );

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        let x = this.dataType === Port.DataType.Input ? -1 : 1;
        x = this.position.x + x * this.size.width;
        this.mesh.position.set( x, 0, 0 );
        this.mesh.scale.set( this.size.width, this.size.height, 0.01 );
        this.group.add( this.mesh );
        Raycaster.addObject( this );
    }

    initLabel() {
        const leftSide = this.dataType === Port.DataType.Input;
        const container = new ThreeMeshUI.Block({
            width: properties.label.width,
            height: properties.label.height,
            padding: properties.label.padding,
            justifyContent: 'center',
            alignContent: leftSide ? 'left' : 'right',
        });
    
        let x = properties.label.width / 2 * (leftSide ? 1 : -1);
        container.position.set( x, 0, 2 );
        this.group.add( container );
    
        this.text = new ThreeMeshUI.Text({
            content: "Port label",
            fontColor: properties.label.font.color,
            fontSize: properties.label.font.size,
            fontFamily: Font.Data,
            fontTexture: Font.Image
        });
        container.add(this.text);
    }

    createLine() {
        const line = new Line(this);
        this.group.add(line.group);
        return line;
    }

    connectLine(line) {
        this.lines.push(line);
        line.connect(this);
    }

    removeLine(line) {
        if (line === this.unattachedLine) {
            line.remove();
            this.unattachedLine = null;
        }
        else if (this.lines.includes(line)) {
            const index = this.lines.indexOf(line);
            this.lines.splice(index);
        }
    }

    mouseDown() {
        this.unattachedLine = this.createLine(this);
        this.unattachedLine.connect(this);
    }

    drag(delta) {
        this.unattachedLine.drag(delta);
    }

    mouseUp(secondPort) {
        if (secondPort && this.dataType != secondPort.dataType && this.unattachedLine) {
            this.lines.push(this.unattachedLine);
            this.unattachedLine.connect(secondPort, this.dataType);
            secondPort.connectLine(this.unattachedLine);
        }
        else {
            this.unattachedLine.remove();
        }

        this.unattachedLine = null;
    }

    hover(isHovered) {        
        const newColor = isHovered ? properties.color.hovered : properties.color.default;
        // this.mesh.material.color.set( newColor );
    }

    updateLinePositions() {
        this.lines.forEach(line => {
            line.update();
        });
    }
}