import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
const MLEADER_ARROWHEAD_SIZE = 0;
const MLEADER_PROPERTY_OVERRIDE_FLAGS = 345216;
const PROXY_GRAPHIC_HEADER_SIZE = 8;
const PROXY_GRAPHIC_VERSION = 24;
const PROXY_GRAPHIC_CHUNK_SIZE = 127;
const PROXY_GRAPHIC_DEFAULT_COLOR = -1073741824;
const PROXY_GRAPHIC_DEFAULT_TRUE_COLOR = 32767;
const PROXY_GRAPHIC_TYPE = {
    Polyline: 6,
    UnicodeText2: 38,
    SetLinetype: 16,
    SetTrueColor: 18,
    SetLineWeight: 19,
    SetLineCap: 20,
    SetColor: 22,
    SetSelectionMarker: 23,
    SetPlotStyle: 51
};
class ProxyGraphicWriter {
    writeUInt32(value) {
        const normalized = value >>> 0;
        this.bytes.push(0xff & normalized, normalized >>> 8 & 0xff, normalized >>> 16 & 0xff, normalized >>> 24 & 0xff);
    }
    writeInt32(value) {
        const buffer = new ArrayBuffer(4);
        new DataView(buffer).setInt32(0, value, true);
        this.writeBytes(new Uint8Array(buffer));
    }
    writeFloat64(value) {
        const buffer = new ArrayBuffer(8);
        new DataView(buffer).setFloat64(0, value, true);
        this.writeBytes(new Uint8Array(buffer));
    }
    writeVertex(point) {
        this.writeFloat64(point.x);
        this.writeFloat64(point.y);
        this.writeFloat64(point.z ?? 0);
    }
    writePaddedUnicodeString(value) {
        for(let index = 0; index < value.length; index += 1){
            const code = value.charCodeAt(index);
            this.bytes.push(0xff & code, code >>> 8 & 0xff);
        }
        this.bytes.push(0, 0);
        this.align(4);
    }
    writeBytes(values) {
        this.bytes.push(...values);
    }
    align(size) {
        const remainder = this.bytes.length % size;
        if (0 === remainder) return;
        this.bytes.push(...new Array(size - remainder).fill(0));
    }
    toBytes() {
        return new Uint8Array(this.bytes);
    }
    constructor(){
        this.bytes = [];
    }
}
class MLeader extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(textPosition, textHeight, contents, landingGap, hasLanding, branches, styleHandle, textStyleHandle, lineTypeHandle){
        super('AcDbEntity'), this.textPosition = textPosition, this.textHeight = textHeight, this.contents = contents, this.landingGap = landingGap, this.hasLanding = hasLanding, this.branches = branches, this.styleHandle = styleHandle, this.textStyleHandle = textStyleHandle, this.lineTypeHandle = lineTypeHandle, this.dxfEntityName = 'MULTILEADER', this.lineType = 'ByLayer', this.lineWidth = -1;
    }
    tags(manager) {
        manager.push(0, 'MULTILEADER');
        super.tags(manager);
        manager.push(8, this.layer.name);
        manager.push(6, this.lineType);
        manager.push(62, 256);
        manager.push(370, this.lineWidth);
        if (void 0 !== this.trueColor) manager.push(420, this.trueColor);
        this.writeProxyGraphic(manager);
        const doglegLength = this.getDefaultDoglegLength();
        const textBasePoint = this.getTextBasePoint();
        const textLocation = this.getTextLocation();
        const contentBasePoint = this.getContentBasePoint();
        manager.push(100, 'AcDbMLeader');
        manager.push(270, 2);
        manager.push(300, 'CONTEXT_DATA{');
        manager.push(40, 1.0);
        manager.point(textBasePoint.x, textBasePoint.y);
        manager.push(41, this.textHeight);
        manager.push(140, MLEADER_ARROWHEAD_SIZE);
        manager.push(145, this.landingGap);
        manager.push(174, 1);
        manager.push(175, 1);
        manager.push(176, 0);
        manager.push(177, 0);
        manager.push(290, this.hasLanding ? 1 : 0);
        manager.push(304, this.contents.replace(/\r?\n/g, '\\P'));
        manager.push(11, 0.0);
        manager.push(21, 0.0);
        manager.push(31, 1.0);
        manager.push(340, this.textStyleHandle);
        manager.push(12, textLocation.x);
        manager.push(22, textLocation.y);
        manager.push(32, 0.0);
        manager.push(13, 1.0);
        manager.push(23, 0.0);
        manager.push(33, 0.0);
        manager.push(42, 0.0);
        manager.push(43, 0.0);
        manager.push(44, 0.0);
        manager.push(45, 1.0);
        manager.push(170, 1);
        manager.push(90, -1073741824);
        manager.push(171, 1);
        manager.push(172, 5);
        manager.push(91, -1073741824);
        manager.push(141, 0.0);
        manager.push(92, 0);
        manager.push(291, 0);
        manager.push(292, 0);
        manager.push(173, 0);
        manager.push(293, 0);
        manager.push(142, 0.0);
        manager.push(143, 0.0);
        manager.push(294, 0);
        manager.push(295, 0);
        manager.push(296, 0);
        manager.push(110, contentBasePoint.x);
        manager.push(120, contentBasePoint.y);
        manager.push(130, 0.0);
        manager.push(111, 1.0);
        manager.push(121, 0.0);
        manager.push(131, 0.0);
        manager.push(112, 0.0);
        manager.push(122, 1.0);
        manager.push(132, 0.0);
        manager.push(297, 0);
        this.branches.forEach((branch)=>this.writeLeader(manager, branch));
        manager.push(272, 9);
        manager.push(273, 9);
        manager.push(301, '}');
        manager.push(340, this.styleHandle);
        manager.push(90, MLEADER_PROPERTY_OVERRIDE_FLAGS);
        manager.push(170, 1);
        manager.push(91, -1056964608);
        if (this.lineTypeHandle) manager.push(341, this.lineTypeHandle);
        manager.push(171, this.lineWidth);
        manager.push(290, this.hasLanding ? 1 : 0);
        manager.push(291, this.hasLanding ? 1 : 0);
        manager.push(41, doglegLength);
        manager.push(42, MLEADER_ARROWHEAD_SIZE);
        manager.push(172, 2);
        manager.push(343, this.textStyleHandle);
        manager.push(173, 1);
        manager.push(95, 1);
        manager.push(174, 1);
        manager.push(175, 0);
        manager.push(92, -1056964608);
        manager.push(292, 0);
        manager.push(93, -1056964608);
        manager.push(10, 1.0);
        manager.push(20, 1.0);
        manager.push(30, 1.0);
        manager.push(43, 0.0);
        manager.push(176, 0);
        manager.push(293, 0);
        manager.push(294, 0);
        manager.push(178, 0);
        manager.push(179, 1);
        manager.push(45, 1.0);
        manager.push(271, 0);
        manager.push(272, 9);
        manager.push(273, 9);
    }
    writeLeader(manager, branch) {
        manager.push(302, 'LEADER{');
        manager.push(290, 1);
        manager.push(291, 1);
        manager.point(branch.lastLeaderLinePoint.x, branch.lastLeaderLinePoint.y);
        manager.push(11, branch.doglegVector.x);
        manager.push(21, branch.doglegVector.y);
        manager.push(31, 0.0);
        manager.push(90, 0);
        manager.push(40, branch.doglegLength);
        manager.push(304, 'LEADER_LINE{');
        for (const point of branch.points)manager.point(point.x, point.y);
        manager.push(91, 0);
        manager.push(305, '}');
        manager.push(271, 0);
        manager.push(303, '}');
    }
    writeProxyGraphic(manager) {
        const proxyGraphic = this.buildProxyGraphic();
        if (proxyGraphic.length <= PROXY_GRAPHIC_HEADER_SIZE) return;
        manager.push(160, proxyGraphic.length);
        for(let index = 0; index < proxyGraphic.length; index += PROXY_GRAPHIC_CHUNK_SIZE)manager.push(310, bytesToHex(proxyGraphic.slice(index, index + PROXY_GRAPHIC_CHUNK_SIZE)));
    }
    buildProxyGraphic() {
        const chunks = [];
        const lineChunks = [];
        for (const branch of this.branches){
            const points = this.getProxyBranchPoints(branch);
            for(let index = 0; index < points.length - 1; index += 1){
                const startPoint = points[index];
                const endPoint = points[index + 1];
                lineChunks.push(createProxyPolylineChunk([
                    startPoint,
                    endPoint
                ]));
            }
        }
        if (this.contents.trim()) {
            chunks.push(...createProxyTextStateChunks());
            chunks.push(createProxyChunk(PROXY_GRAPHIC_TYPE.UnicodeText2, (writer)=>{
                writer.writeVertex(this.getProxyTextPosition());
                writer.writeVertex({
                    x: 0,
                    y: 0,
                    z: 1
                });
                writer.writeVertex({
                    x: 1,
                    y: 0,
                    z: 0
                });
                writer.writePaddedUnicodeString(this.contents.replace(/\r?\n/g, ' '));
                writer.writeUInt32(this.contents.length);
                writer.writeUInt32(1);
                writer.writeFloat64(this.textHeight);
                writer.writeFloat64(1);
                writer.writeFloat64(0);
                writer.writeFloat64(1);
                writer.writeUInt32(0);
                writer.writeUInt32(0);
                writer.writeUInt32(0);
                writer.writeUInt32(0);
                writer.writeUInt32(0);
                writer.writeUInt32(0);
                writer.writeUInt32(0);
                writer.writeUInt32(1);
                writer.writeUInt32(34);
                writer.writePaddedUnicodeString('Arial');
                writer.writePaddedUnicodeString('');
                writer.writePaddedUnicodeString('');
            }));
        }
        if (lineChunks.length > 0) {
            chunks.push(...createProxyLineStateChunks());
            lineChunks.forEach((lineChunk, index)=>{
                chunks.push(createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetLineWeight, 0 === index ? 5001 : 10001));
                chunks.push(lineChunk);
            });
            chunks.push(...createProxyEndStateChunks());
        }
        const proxyGraphic = new ProxyGraphicWriter();
        proxyGraphic.writeUInt32(0);
        proxyGraphic.writeUInt32(PROXY_GRAPHIC_VERSION);
        chunks.forEach((chunk)=>proxyGraphic.writeBytes(chunk));
        const bytes = proxyGraphic.toBytes();
        writeUInt32(bytes, 0, bytes.length);
        return bytes;
    }
    getProxyBranchPoints(branch) {
        const points = branch.points.map(clonePoint);
        points.push(clonePoint(branch.lastLeaderLinePoint));
        if (branch.doglegLength > 1e-6) points.push({
            x: branch.lastLeaderLinePoint.x + branch.doglegVector.x * branch.doglegLength,
            y: branch.lastLeaderLinePoint.y + branch.doglegVector.y * branch.doglegLength
        });
        return removeDuplicateAdjacentPoints(points);
    }
    getProxyTextPosition() {
        return {
            x: this.textPosition.x,
            y: this.textPosition.y - 0.5 * this.textHeight
        };
    }
    getDefaultDoglegLength() {
        const branch = this.branches[0];
        return Math.max(Math.abs(branch?.doglegLength ?? this.landingGap), 1e-6);
    }
    getContentBasePoint() {
        const branch = this.branches[0];
        return branch?.points[0] ?? branch?.lastLeaderLinePoint ?? this.textPosition;
    }
    getTextLocation() {
        return {
            x: this.textPosition.x,
            y: this.textPosition.y + this.textHeight / 2
        };
    }
    getTextBasePoint() {
        const landingVector = this.getPrimaryLandingVector();
        return {
            x: this.textPosition.x - landingVector.x * this.landingGap,
            y: this.textPosition.y - landingVector.y * this.landingGap
        };
    }
    getPrimaryLandingVector() {
        const branch = this.branches[0];
        return branch?.doglegVector ?? {
            x: 1,
            y: 0
        };
    }
}
function createProxyPolylineChunk(points) {
    return createProxyChunk(PROXY_GRAPHIC_TYPE.Polyline, (writer)=>{
        writer.writeUInt32(points.length);
        points.forEach((point)=>writer.writeVertex(point));
    });
}
function createProxyTextStateChunks() {
    return [
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetColor, PROXY_GRAPHIC_DEFAULT_COLOR),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetPlotStyle, 0),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetLineWeight, 15001)
    ];
}
function createProxyLineStateChunks() {
    return [
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetPlotStyle, 0),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetLinetype, 0),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetColor, PROXY_GRAPHIC_DEFAULT_COLOR),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetTrueColor, PROXY_GRAPHIC_DEFAULT_TRUE_COLOR),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetLineWeight, 1),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetLineCap, 1)
    ];
}
function createProxyEndStateChunks() {
    return [
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetColor, PROXY_GRAPHIC_DEFAULT_COLOR),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetTrueColor, PROXY_GRAPHIC_DEFAULT_TRUE_COLOR),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetSelectionMarker, 0),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetLineWeight, 15002),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetColor, PROXY_GRAPHIC_DEFAULT_COLOR),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetTrueColor, PROXY_GRAPHIC_DEFAULT_TRUE_COLOR),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetSelectionMarker, -1),
        createProxyIntChunk(PROXY_GRAPHIC_TYPE.SetPlotStyle, 0)
    ];
}
function createProxyIntChunk(type, value) {
    return createProxyChunk(type, (writer)=>{
        writer.writeInt32(value);
    });
}
function createProxyChunk(type, writeData) {
    const data = new ProxyGraphicWriter();
    writeData(data);
    const dataBytes = data.toBytes();
    const chunk = new ProxyGraphicWriter();
    chunk.writeUInt32(dataBytes.length + 8);
    chunk.writeUInt32(type);
    chunk.writeBytes(dataBytes);
    return chunk.toBytes();
}
function bytesToHex(bytes) {
    return Array.from(bytes).map((byte)=>byte.toString(16).padStart(2, '0').toUpperCase()).join('');
}
function writeUInt32(bytes, offset, value) {
    new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).setUint32(offset, value >>> 0, true);
}
function clonePoint(point) {
    return {
        x: point.x,
        y: point.y
    };
}
function removeDuplicateAdjacentPoints(points) {
    const result = [];
    for (const point of points){
        const previous = result[result.length - 1];
        if (!previous || Math.hypot(previous.x - point.x, previous.y - point.y) > 1e-9) result.push(point);
    }
    return result;
}
export { MLeader as default };
