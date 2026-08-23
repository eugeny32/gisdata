import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
const BULGE_EPSILON = 1e-10;
const ARC_SAMPLE_STEP = Math.PI / 16;
class PolylineEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Polyline), this.vertices = [], this.isClosed = false, this.serializeKeys = [
            'vertices',
            'isClosed'
        ];
        Object.assign(this, data);
    }
    getCaptureData() {
        const endPoints = [];
        const midPoints = [];
        const nodePoints = [];
        const lines = [];
        for(let i = 0; i < this.vertices.length; i++){
            const v = this.vertices[i];
            if (this.isClosed || 0 !== i && i !== this.vertices.length - 1) nodePoints.push({
                x: v.x,
                y: v.y
            });
            else endPoints.push({
                x: v.x,
                y: v.y
            });
        }
        const segmentCount = this.isClosed && this.vertices.length > 1 ? this.vertices.length : Math.max(0, this.vertices.length - 1);
        for(let i = 0; i < segmentCount; i++){
            const v1 = this.vertices[i];
            const v2 = this.vertices[(i + 1) % this.vertices.length];
            this.addSegmentCaptureData(v1, v2, midPoints, lines);
        }
        return {
            endPoints,
            midPoints,
            nodePoints,
            lines
        };
    }
    addSegmentCaptureData(v1, v2, midPoints, lines) {
        const startPoint = {
            x: v1.x,
            y: v1.y
        };
        const endPoint = {
            x: v2.x,
            y: v2.y
        };
        const bulge = v1.bulge || 0;
        const arcData = this.getBulgeArcData(startPoint, endPoint, bulge);
        if (!arcData) {
            lines.push({
                startPoint,
                endPoint
            });
            midPoints.push({
                x: (v1.x + v2.x) / 2,
                y: (v1.y + v2.y) / 2
            });
            return;
        }
        midPoints.push(this.getArcPointAt(arcData, 0.5));
        const segments = Math.max(2, Math.ceil(Math.abs(arcData.sweepAngle) / ARC_SAMPLE_STEP));
        let previous = startPoint;
        for(let index = 1; index <= segments; index++){
            const point = index === segments ? endPoint : this.getArcPointAt(arcData, index / segments);
            lines.push({
                startPoint: previous,
                endPoint: point
            });
            previous = point;
        }
    }
    getBulgeArcData(startPoint, endPoint, bulge) {
        if (Math.abs(bulge) < BULGE_EPSILON) return null;
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const chordLength = Math.hypot(dx, dy);
        if (chordLength < BULGE_EPSILON) return null;
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        const normalX = -dy / chordLength;
        const normalY = dx / chordLength;
        const offset = chordLength / 2 * (1 - bulge * bulge) / (2 * bulge);
        const center = {
            x: midX + normalX * offset,
            y: midY + normalY * offset
        };
        const radius = Math.hypot(startPoint.x - center.x, startPoint.y - center.y);
        if (radius < BULGE_EPSILON) return null;
        return {
            center,
            radius,
            startAngle: Math.atan2(startPoint.y - center.y, startPoint.x - center.x),
            sweepAngle: 4 * Math.atan(bulge)
        };
    }
    getArcPointAt(arcData, t) {
        const angle = arcData.startAngle + arcData.sweepAngle * t;
        return {
            x: arcData.center.x + arcData.radius * Math.cos(angle),
            y: arcData.center.y + arcData.radius * Math.sin(angle)
        };
    }
}
export { PolylineEntity };
