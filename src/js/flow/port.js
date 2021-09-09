import * as THREE from 'three';
import {rectGeometry} from './rectGeometry'
import {Raycaster} from './raycaster'
import {Font} from './font'
import {Line} from './line'
import {ObjectType} from './enums'

const color = {
    default: 0x280000,
    hovered: 0x286000
}

const size = {
    width: 16,
    height: 16
}

const labelProperty = {
    width: 180,
    height: 0.000001,
    padding: 5,
    font: {
        size: 22,
        color: new THREE.Color( 0xcccccc )
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
        this.size = size;

        this.initIcon();
        this.initLabel();

        this.update();
    }

    initIcon() {
        this.geometry = rectGeometry;
        this.material = new THREE.MeshBasicMaterial( {color: color.default} );

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
            width: labelProperty.width,
            height: labelProperty.height,
            padding: labelProperty.padding,
            justifyContent: 'center',
            alignContent: leftSide ? 'left' : 'right',
        });
    
        let x = labelProperty.width / 2 * (leftSide ? 1 : -1);
        container.position.set( x, 0, 2 );
        this.group.add( container );
    
        this.text = new ThreeMeshUI.Text({
            content: "Port label",
            fontColor: labelProperty.font.color,
            fontSize: labelProperty.font.size,
            fontFamily: Font.Data,
            fontTexture: Font.Image,
            backgroundOpacity: 0
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
        this.unattachedLine = this.createLine();
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
        const newColor = isHovered ? color.hovered : color.default;
        this.mesh.material.color.set( newColor );
    }

    updateLinePositions() {
        this.lines.forEach(line => {
            line.update();
        });
    }

    
    update() {
        let s = 'Lines num: ' + this.lines.length;

        this.text.set({
            content: s})
        
        requestAnimationFrame( () => {this.update()} );
    }
}