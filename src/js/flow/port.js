import * as THREE from 'three';
import {rectGeometry} from './rectGeometry'
import {Raycaster} from './raycaster'
import {Font} from './font'
import {Line} from './line'
import {ObjectType} from './enums'
import portIcon from '../../images/port.png'
import { PortLabel } from './portLabel';
import { Flow } from './flow';

const properties = {
    icon: {
        texture: new THREE.TextureLoader().load(portIcon),
        size: {
            width: 13,
            height: 13
        },
        color: {
            hovered: 0xaaaaaa,
            clicked: 0xf02050,
        },
    },
    name: {
        size: {
            width: 24,
            height: 24
        },
        text: {
            padding: 7,
            size: 17,
            color: {
                default: new THREE.Color( 0xffffff )
            }
        }
    },
    label: {
        size: {
            width: 60,
            height: 20
        }
    }
}


export class Port {
    type = ObjectType.Port;
    flow;
    geometry;
    material;
    mesh;
    position;
    size;
    group;
    portList;
    label;
    color;
    name;
    isClicked;
    lines = new Array();
    labelCollider;
    unattachedLine;
    isDraggable = true;

    _linePointOffset = new THREE.Vector3(0, 0, 0);
    _lineWorldPoint = new THREE.Vector3(0, 0, 0);
    
    get lineWorldPoint() {
        const direction = this.dataType === Port.DataType.Input ? -1 : 1;

            this._linePointOffset.setX(2 
                * properties.icon.size.width 
                * direction 
                * this.flow.currentScale);

        this.group.updateMatrixWorld();
        this.group.getWorldPosition(this._lineWorldPoint).add(this._linePointOffset);

        return this._lineWorldPoint;
    }
    
    get linePoint() {
        const direction = this.dataType === Port.DataType.Input ? -1 : 1;

            this._linePointOffset.setX(2 
                * properties.icon.size.width 
                * direction 
                * this.flow.currentScale);

        return this._linePointOffset;
    }

    static DataType = {Input: 'Input', Output: 'Output'}
    dataType;

    constructor({flow, position, dataType, portList, name, color} = {}) {
        this.flow = flow;
        this.dataType = dataType;
        this.portList = portList;
        this.name = name;
        this.color = color;
        this.position = position ? position : new THREE.Vector2(0, 0);

        this.group = new THREE.Group();
        this.group.position.set(this.position.x, this.position.y, 0.5);
        this.size = properties.size;

        this.label = new PortLabel({port: this, size: properties.label.size, text: 'port text'});
        this.group.add(this.label.group);

        this.initIcon();
        this.initPortName(name);
    }

    initIcon() {
        this.geometry = rectGeometry;
        this.material = new THREE.MeshBasicMaterial( {
            map: properties.icon.texture,
            transparent: true,
            color: this.color
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

    initPortName(name) {        
        const leftSide = this.dataType === Port.DataType.Input;
        const container = new ThreeMeshUI.Block({
            width: properties.name.size.width,
            height: properties.name.size.height,
            justifyContent: 'center',
            lineBreak: null,
            backgroundColor: this.color,
            alignContent: 'center',
            borderRadius: 4
        });
        const x = (properties.name.size.width / 2 + properties.name.text.padding) * (leftSide ? 1 : -1);
        container.position.set( x, 0, 2 );
        this.group.add( container );
        
        this.textMesh = new ThreeMeshUI.Text({
            content: name,
            fontColor: properties.name.text.color.default,
            fontSize: properties.name.text.size,
            fontFamily: Font.Data,
            fontTexture: Font.Image
        });
        container.add(this.textMesh);
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
                this.color );
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
    }

    updateLinePositions() {
        this.lines.forEach(line => {
            line.update();
        });
    }

    // #endregion
}