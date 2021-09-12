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
        size: {
            width: 16,
            height: 16
        },
        color: {
            default: 0xffffff,
            hovered: 0xaaaaaa,
            clicked: 0x888888,
        },
    },
    size: {
        width: 60,
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
    isClicked;
    lines = new Array();
    unattachedLine;
    isDraggable = true;

    _linePointOffset;
    _lineWorldPoint = new THREE.Vector3();
    get lineWorldPoint() {
        if (!this._linePointOffset) {
            const direction = this.dataType === Port.DataType.Input ? -1 : 1;

            this._linePointOffset = new THREE.Vector3(2 * properties.icon.size.width * direction, 0, 0);
        }

        this.group.updateMatrixWorld();
        this.group.getWorldPosition(this._lineWorldPoint).add(this._linePointOffset);

        return this._lineWorldPoint;
    }

    static DataType = {Input: 'Input', Output: 'Output'}
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
            map: properties.icon.texture
        } );

        this.iconMesh = new THREE.Mesh( this.geometry, this.material );
        const dir = this.dataType === Port.DataType.Input ? -1 : 1;
        const x = this.position.x + dir * properties.icon.size.width;
        this.iconMesh.position.set( x, 0, 0 );
        const width = -properties.icon.size.width * dir;
        this.iconMesh.scale.set( width, properties.icon.size.height, 0.01 );
        this.group.add( this.iconMesh );
        Raycaster.addObject( this, this.iconMesh);
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

    addLine(line) {
        if (!this.lines.includes(line)) {
            this.lines.push(line);
        }
        
        this.update();
    }

    disconnectLine(line) {
        if (this.lines.includes(line)) {
            const index = this.lines.indexOf(line);
            this.lines.splice(index, 1);
        }

        this.update();
    }

    removeLine(line) {
        if (line === this.unattachedLine) {
            this.unattachedLine = null;
        }

        this.disconnectLine(line);
        line.remove();

        this.update();
    }

    // #region Events

    mouseDown() {
        const lineNumCheck = this.dataType != Port.DataType.Input || 
                             this.lines.length === 0;

        if (lineNumCheck) {
            this.unattachedLine = this.createLine(this);
            this.unattachedLine.connect(this);
        }
        else {
            this.unattachedLine = this.lines.pop();
            this.unattachedLine.disconnect(this);
        }

        this.update();
    }

    hover(isHovered) {
    }

    setClicked(isClicked) {
        const needsUpdate = this.isClicked != isClicked;

        if (needsUpdate) {
            this.isClicked = isClicked;

            this.material.color.set( isClicked ? 
                properties.icon.color.clicked :
                properties.icon.color.default );
        }
    }

    drag(delta) {
        if (this.unattachedLine) {
            this.unattachedLine.drag(delta);
        }
    }

    mouseUp(secondPort) {
        if (!this.unattachedLine) {
            return; // connection was canceled
        }

        if (secondPort && this.unattachedLine.canConnectTo(secondPort)) {
            this.unattachedLine.connect(secondPort);
            this.unattachedLine.portStart.addLine(this.unattachedLine);
            this.unattachedLine.portEnd.addLine(this.unattachedLine);
        }
        else {
            this.unattachedLine.remove();
        }

        this.unattachedLine = null;

        this.update();
        if (secondPort) {
            secondPort.update();
        }
    }

    // #endregion
    // #region Updates

    update() {
        this.text.set({content: 'Port num: ' + this.lines.length});
    }

    updateLinePositions() {
        this.lines.forEach(line => {
            line.update();
        });
    }

    // #endregion
}