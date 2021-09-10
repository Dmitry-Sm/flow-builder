import * as THREE from 'three';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { Port } from './port';


export class Line {
    _startPoint;
    get startPoint() {
        if (!this.portStart) {
            return this.mousePoint;
        }
        
        if (!this._startPoint) {
            this._startPoint = new THREE.Vector2(0, 0);
        }

        return this._startPoint.copy(this.group.worldToLocal(this.portStart.lineWorldPoint));
    }

    _endPoint;
    get endPoint() {
        if (!this.portEnd) {
            return this.mousePoint;
        }
        
        if (!this._endPoint) {
            this._endPoint = new THREE.Vector2(0, 0);
        }

        return this._endPoint.copy(this.group.worldToLocal(this.portEnd.lineWorldPoint));
    }

    get connectedPort() {
        if (this.portStart) {
            return this.portStart;
        }
        else if (this.portEnd) {
            return this.portEnd;
        }

        return null;
    }

    geometry;
    mesh;
    group;
    portStart;
    portEnd;
    mousePoint = new THREE.Vector2(0, 0);
    
    constructor(port) {
        this.group = new THREE.Group();
        this.geometry = new LineGeometry();
        this.geometry.setPositions([0, 0, 0, 0, 0, 0]);
    
        const material = new LineMaterial({
            color: 0xf0f050,
            linewidth: 0.003, // in pixels
            dashed: false,
        });

        this.mesh = new Line2(this.geometry, material);
        this.group.add(this.mesh);
        this.group.position.set(0, 0, 1);
    }

    drag(delta) {
        this.mousePoint.add(delta);
        this.update();
    }

    canConnectTo(targetPort) {
        if (!this.connectedPort) {
            return false;
        }

        const differentTypes = this.connectedPort.dataType != targetPort.dataType;
        const lineNumCheck = this.connectedPort.dataType === Port.DataType.Input &&
                             this.connectedPort.lines.length === 0 ||
                             targetPort.lines.length === 0;
        let alreadyConnected = false;
        
        this.connectedPort.lines.forEach(line => {
            if (targetPort.lines.includes(line)) {
                alreadyConnected = true;
            }
        });

        if (!differentTypes) {
            console.log('Port connection failed: similar port type "' + targetPort.dataType + '"');
        }

        if (!lineNumCheck) {
            console.log('Port connection failed: only one incoming connection allowed');
        }

        if (alreadyConnected) {
            console.log('Port connection failed: this ports already connected');
        }

        return differentTypes && lineNumCheck && !alreadyConnected;
    }

    connect(port) {
        if (port.dataType === Port.DataType.Output) {
            this.portStart = port;
        }
        else {
            this.portEnd = port;
        }

        this.update();
    }

    disconnect(port) {
        if (port === this.portStart) {
            this.mousePoint.set(this.startPoint.x, this.startPoint.y);
            this.portStart = null;
        }
        
        if (port === this.portEnd) {
            this.mousePoint.set(this.endPoint.x, this.endPoint.y);
            this.portEnd = null;
        }
    }

    remove() {
        if (this.portStart) {
            this.portStart.disconnectLine(this);
            this.portStart = null;
        }
        
        if (this.portEnd) {
            this.portEnd.disconnectLine(this);
            this.portStart = null;
        }

        this.geometry.dispose();
        this.group.remove(this.mesh);
    }

    update() {
        this.geometry.setPositions( GetCurvePoints( this.startPoint, this.endPoint ) );
        this.mesh.geometry = this.geometry;
    }
}

    
const GetCurvePoints = (p1, p2) => {
    const sx = p1.x, sy = p1.y, 
          ex = p2.x, ey = p2.y;

    const p = [sx, sy, 0]
    const dx = Math.max(Math.abs(ex - sx), 0.1)
    const a = [sx + dx * 0.5, sy]
    const b = [ex - dx * 0.5, ey]

    const step = 1 / 50
    
    for (let t = 0; t < 1; t += step) {
        const x1 = interpolate(sx, a[0], t);
        const y1 = interpolate(sy, a[1], t);
        const x2 = interpolate(a[0], b[0], t);
        const y2 = interpolate(a[1], b[1], t);
        const x3 = interpolate(b[0], ex, t);
        const y3 = interpolate(b[1], ey, t);

        const x4 = interpolate(x1, x2, t);
        const y4 = interpolate(y1, y2, t);
        const x5 = interpolate(x2, x3, t);
        const y5 = interpolate(y2, y3, t);

        const x6 = interpolate(x4, x5, t);
        const y6 = interpolate(y4, y5, t);

        p.push(x6, y6, 0)
    }

    function interpolate(a, b, t) {
        return a + (b - a) * t;
    }

    p.push(ex, ey, 0)
    return p;
}