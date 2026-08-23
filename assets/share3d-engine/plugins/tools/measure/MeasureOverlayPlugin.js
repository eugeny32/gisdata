import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__ from "three/examples/jsm/lines/Line2.js";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineGeometry_js_2cfe464b__ from "three/examples/jsm/lines/LineGeometry.js";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineMaterial_js_154029c0__ from "three/examples/jsm/lines/LineMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_TextSprite_js_0db73ebd__ from "../shared/TextSprite.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__ from "../shared/ToolMaterials.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__ from "../../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__MeasureData_js_9578c8f4__ from "./MeasureData.js";
const CIRCLE_SEGMENTS = 64;
const ARC_SEGMENTS = 32;
const COORDINATE_LABEL_SCREEN_PX = 70;
const COORDINATE_LABEL_OFFSET_PX = 8;
const POINT_LABEL_OFFSET_PX = -34;
const POINT_LABEL_SCREEN_PX = 84;
const MEASURE_LINE_COLOR = 0xff0000;
const MEASURE_LINE_WIDTH_PX = 1.5;
const MEASURE_LINE_DASH_PX = 12;
const MEASURE_LINE_GAP_PX = 12;
const MEASURE_AREA_FILL_COLOR = 0xff0000;
const MEASURE_AREA_FILL_OPACITY = 0.35;
const POINT_MARKER_SIZE = 8;
const HOVER_HIGHLIGHT_SCREEN_PX = 24;
const MEASURE_LOCAL_ORIGIN_THRESHOLD = 10000;
const MEASURE_LABEL_OPTIONS = {
    fontFace: 'Arial',
    fontSize: 24,
    fontWeight: 900,
    textColor: '#ffffff',
    backgroundColor: '#00000099',
    padding: 10,
    borderRadius: 6,
    borderThickness: 1,
    borderColor: '#ffffff59',
    textStrokeWidth: 0.75,
    textStrokeColor: '#00000080'
};
const POINT_LABEL_OPTIONS = {
    fontFace: 'Arial',
    fontSize: 20,
    fontWeight: 700,
    textColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    padding: 10,
    borderRadius: 0,
    borderThickness: 0,
    borderColor: 'rgba(0, 0, 0, 0)',
    textStrokeWidth: 1,
    textStrokeColor: '#ff0000'
};
const COORDINATE_LABEL_OPTIONS = {
    ...MEASURE_LABEL_OPTIONS,
    fontSize: 22,
    fontWeight: 'bold',
    placement: 'below',
    textAlign: 'left'
};
function formatDistance(meters) {
    return `${meters.toFixed(2)}m`;
}
function formatArea(sqMeters) {
    return `${sqMeters.toFixed(2)}m²`;
}
function formatAngle(degrees) {
    return `${degrees.toFixed(1)}°`;
}
function formatCoordinateValue(value) {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    });
}
function formatCoordinateLabel(position) {
    return [
        `X/E ${formatCoordinateValue(position.x)}`,
        `Y/N ${formatCoordinateValue(position.y)}`,
        `Z/U ${formatCoordinateValue(position.z)}`
    ].join('\n');
}
function midpoint(a, b) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().addVectors(a, b).multiplyScalar(0.5);
}
function resolveMeasureVisualOrigin(points) {
    if (0 === points.length) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    let maxAbs = 0;
    const origin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    for (const point of points){
        const { position } = point;
        maxAbs = Math.max(maxAbs, Math.abs(position.x), Math.abs(position.y), Math.abs(position.z));
        origin.add(position);
    }
    if (maxAbs < MEASURE_LOCAL_ORIGIN_THRESHOLD) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    return origin.divideScalar(points.length);
}
function toLocalPosition(position, origin) {
    return position.clone().sub(origin);
}
function createLocalMeasureResult(result, origin) {
    if (0 === origin.lengthSq()) return result;
    return {
        ...result,
        points: result.points.map((point)=>({
                position: toLocalPosition(point.position, origin)
            })),
        ...result.circle && {
            circle: {
                ...result.circle,
                center: toLocalPosition(result.circle.center, origin)
            }
        }
    };
}
function createMeasureLabel(text) {
    return (0, __WEBPACK_EXTERNAL_MODULE__shared_TextSprite_js_0db73ebd__.createTextSprite)(text, MEASURE_LABEL_OPTIONS);
}
function createAnchoredLabel(text, anchor, options, offsetYPx, targetPx) {
    const label = (0, __WEBPACK_EXTERNAL_MODULE__shared_TextSprite_js_0db73ebd__.createTextSprite)(text, options);
    const userData = label.userData;
    userData._labelAnchor = anchor.clone();
    userData._labelOffsetYPx = offsetYPx;
    userData._labelTargetPx = targetPx;
    label.position.copy(anchor);
    return label;
}
function createPointLabel(index, position) {
    const label = createAnchoredLabel(`Pt${index + 1}`, position, POINT_LABEL_OPTIONS, POINT_LABEL_OFFSET_PX, POINT_LABEL_SCREEN_PX);
    label.userData._measureDecoration = 'point-label';
    return label;
}
function createHoverHighlightSprite(anchor) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 4;
        ctx.strokeRect(16, 16, 32, 32);
    }
    const texture = new __WEBPACK_EXTERNAL_MODULE_three__.CanvasTexture(canvas);
    texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter;
    texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    const material = new __WEBPACK_EXTERNAL_MODULE_three__.SpriteMaterial({
        map: texture,
        depthTest: false,
        depthWrite: false,
        transparent: true
    });
    const sprite = new __WEBPACK_EXTERNAL_MODULE_three__.Sprite(material);
    sprite.name = 'measure-hover-highlight';
    sprite.position.copy(anchor);
    const userData = sprite.userData;
    userData._labelAnchor = anchor.clone();
    userData._labelOffsetYPx = 0;
    userData._labelTargetPx = HOVER_HIGHLIGHT_SCREEN_PX;
    userData._measureDecoration = 'point-marker';
    userData._textCanvas = canvas;
    userData._textTexture = texture;
    userData._textMaterial = material;
    userData._textBaseScale = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 1, 1);
    return sprite;
}
function createPointMarkerAlphaTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(new Uint8Array([
            255,
            255,
            255,
            255
        ]), 1, 1);
        texture.needsUpdate = true;
        return texture;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 0.48 * canvas.width, 0, 2 * Math.PI);
    ctx.fill();
    const texture = new __WEBPACK_EXTERNAL_MODULE_three__.CanvasTexture(canvas);
    texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter;
    texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
}
function disposeGroup(group) {
    group.traverse((obj)=>{
        if (obj instanceof __WEBPACK_EXTERNAL_MODULE_three__.Sprite) {
            (0, __WEBPACK_EXTERNAL_MODULE__shared_TextSprite_js_0db73ebd__.disposeTextSprite)(obj);
            return;
        }
        const meshLike = obj;
        meshLike.geometry?.dispose();
        if (meshLike.material) {
            const materials = Array.isArray(meshLike.material) ? meshLike.material : [
                meshLike.material
            ];
            for (const material of materials)material.dispose();
        }
    });
    while(group.children.length > 0)group.remove(group.children[0]);
}
function createLineGeometry(points) {
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineGeometry_js_2cfe464b__.LineGeometry();
    geometry.setPositions(points.flatMap((point)=>[
            point.x,
            point.y,
            point.z
        ]));
    return geometry;
}
function averagePoint(points) {
    const center = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    for (const point of points)center.add(point);
    return points.length > 0 ? center.divideScalar(points.length) : center;
}
function createDashedLine(points) {
    const material = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineMaterial_js_154029c0__.LineMaterial({
        color: MEASURE_LINE_COLOR,
        linewidth: MEASURE_LINE_WIDTH_PX,
        dashed: true,
        dashSize: MEASURE_LINE_DASH_PX,
        gapSize: MEASURE_LINE_GAP_PX,
        worldUnits: false,
        depthTest: false,
        depthWrite: false,
        transparent: true
    });
    const line = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__.Line2(createLineGeometry(points), material);
    line.userData._measureDashReference = averagePoint(points);
    line.computeLineDistances();
    return line;
}
function createPointMarkers(positions, alphaTexture, color = MEASURE_LINE_COLOR, size = 6) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.userData._measureDecoration = 'point-marker';
    if (0 === positions.length) return group;
    const outerGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    outerGeometry.setFromPoints(positions);
    const outerMaterial = (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createPointMaterial)(color, size);
    outerMaterial.alphaMap = alphaTexture;
    outerMaterial.transparent = true;
    outerMaterial.alphaTest = 0.5;
    group.add(new __WEBPACK_EXTERNAL_MODULE_three__.Points(outerGeometry, outerMaterial));
    const innerGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    innerGeometry.setFromPoints(positions);
    const innerMaterial = (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createPointMaterial)(0xffffff, Math.max(0.42 * size, 2.5));
    innerMaterial.alphaMap = alphaTexture;
    innerMaterial.transparent = true;
    innerMaterial.alphaTest = 0.5;
    group.add(new __WEBPACK_EXTERNAL_MODULE_three__.Points(innerGeometry, innerMaterial));
    return group;
}
function addPointMarkersAndLabels(group, positions, alphaTexture) {
    if (0 === positions.length) return;
    group.add(createPointMarkers(positions, alphaTexture, MEASURE_LINE_COLOR, POINT_MARKER_SIZE));
    for(let i = 0; i < positions.length; i += 1)group.add(createPointLabel(i, positions[i]));
}
function addAngleFillAndLabel(group, vertex, firstPoint, secondPoint, angleDegrees) {
    const d1 = firstPoint.distanceTo(vertex);
    const d2 = secondPoint.distanceTo(vertex);
    const fillRadius = 0.5 * Math.min(d1, d2);
    const v1 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(firstPoint, vertex);
    const v2 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(secondPoint, vertex);
    if (v1.lengthSq() > 1e-10 && v2.lengthSq() > 1e-10 && fillRadius > 0) {
        v1.normalize();
        v2.normalize();
        const normal = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(v1, v2);
        if (normal.lengthSq() > 1e-10) {
            normal.normalize();
            const tangent = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(normal, v1).normalize();
            const angle = Math.acos(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(v1.dot(v2), -1, 1));
            const segments = Math.max(8, Math.ceil(angle / (Math.PI / 32)));
            const fillPositions = [];
            for(let i = 0; i < segments; i += 1){
                const t0 = i / segments * angle;
                const t1 = (i + 1) / segments * angle;
                const arcPoint0 = vertex.clone().add(v1.clone().multiplyScalar(Math.cos(t0) * fillRadius).add(tangent.clone().multiplyScalar(Math.sin(t0) * fillRadius)));
                const arcPoint1 = vertex.clone().add(v1.clone().multiplyScalar(Math.cos(t1) * fillRadius).add(tangent.clone().multiplyScalar(Math.sin(t1) * fillRadius)));
                fillPositions.push(vertex.x, vertex.y, vertex.z, arcPoint0.x, arcPoint0.y, arcPoint0.z, arcPoint1.x, arcPoint1.y, arcPoint1.z);
            }
            const fillGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
            fillGeometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute(fillPositions, 3));
            fillGeometry.computeVertexNormals();
            group.add(new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(fillGeometry, (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createFillMaterial)(MEASURE_LINE_COLOR)));
        }
    }
    const labelDirection = midpoint(firstPoint, secondPoint).sub(vertex);
    const label = createMeasureLabel(formatAngle(angleDegrees));
    if (labelDirection.lengthSq() > 1e-10 && fillRadius > 0) label.position.copy(vertex).addScaledVector(labelDirection.normalize(), 0.5 * fillRadius);
    else if (v1.lengthSq() > 1e-10) label.position.copy(vertex).addScaledVector(v1.normalize(), Math.max(0.25 * d1, 0.2));
    else if (v2.lengthSq() > 1e-10) label.position.copy(vertex).addScaledVector(v2.normalize(), Math.max(0.25 * d2, 0.2));
    else label.position.copy(vertex);
    group.add(label);
}
function stripPointDecorations(group) {
    const removable = group.children.filter((child)=>{
        const decoration = child.userData._measureDecoration;
        return 'point-marker' === decoration || 'point-label' === decoration;
    });
    for (const child of removable){
        group.remove(child);
        disposeGroup(child);
    }
}
function createPreviewMeasureVisual(points, measureType, alphaTexture) {
    if (0 === points.length) return null;
    const visual = createResultVisual((0, __WEBPACK_EXTERNAL_MODULE__MeasureData_js_9578c8f4__.buildMeasureResult)(points, measureType), alphaTexture);
    stripPointDecorations(visual);
    if (0 === visual.children.length) {
        disposeGroup(visual);
        return null;
    }
    return visual;
}
function buildCoordinateVisual(result, alphaTexture, displayResult = result) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.name = `measure-coordinate-${result.id}`;
    const position = result.points[0]?.position;
    const displayPosition = displayResult.points[0]?.position;
    if (!position || !displayPosition) return group;
    addPointMarkersAndLabels(group, [
        position
    ], alphaTexture);
    const label = createAnchoredLabel(formatCoordinateLabel(displayPosition), position, COORDINATE_LABEL_OPTIONS, COORDINATE_LABEL_OFFSET_PX, COORDINATE_LABEL_SCREEN_PX);
    group.add(label);
    return group;
}
function buildDistanceVisual(result, alphaTexture) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.name = `measure-distance-${result.id}`;
    const positions = result.points.map((point)=>point.position);
    if (positions.length < 2) return group;
    group.add(createDashedLine(positions));
    addPointMarkersAndLabels(group, positions, alphaTexture);
    for(let i = 0; i < result.segmentDistances.length; i++){
        const label = createMeasureLabel(formatDistance(result.segmentDistances[i]));
        label.position.copy(midpoint(positions[i], positions[i + 1]));
        group.add(label);
    }
    return group;
}
function buildHeightVisual(result, alphaTexture) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.name = `measure-height-${result.id}`;
    const positions = result.points.map((point)=>point.position);
    if (positions.length < 2 || !result.height) return group;
    const p0 = positions[0];
    const p1 = positions[positions.length - 1];
    const lowPoint = p0.z <= p1.z ? p0 : p1;
    const highPoint = lowPoint === p0 ? p1 : p0;
    const bottomCorner = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(highPoint.x, highPoint.y, lowPoint.z);
    group.add(createDashedLine([
        p0,
        p1
    ]));
    group.add(createDashedLine([
        lowPoint,
        bottomCorner
    ]));
    group.add(createDashedLine([
        bottomCorner,
        highPoint
    ]));
    addPointMarkersAndLabels(group, [
        p0,
        p1
    ], alphaTexture);
    const verticalLabel = createMeasureLabel(formatDistance(result.height.vertical));
    verticalLabel.position.copy(midpoint(bottomCorner, highPoint));
    group.add(verticalLabel);
    const horizontalLabel = createMeasureLabel(formatDistance(result.height.horizontal));
    horizontalLabel.position.copy(midpoint(lowPoint, bottomCorner));
    group.add(horizontalLabel);
    const directLabel = createMeasureLabel(formatDistance(result.distance));
    const directLabelOffset = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p1.y - p0.y, -(p1.x - p0.x), 0);
    if (directLabelOffset.lengthSq() <= 1e-8) directLabelOffset.set(1, 0, 0);
    directLabel.position.copy(midpoint(p0, p1)).addScaledVector(directLabelOffset.normalize(), 0.2);
    group.add(directLabel);
    addAngleFillAndLabel(group, lowPoint, bottomCorner, highPoint, result.height.slopeAngle);
    return group;
}
function buildCircleVisual(result, alphaTexture) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.name = `measure-circle-${result.id}`;
    if (!result.circle) return group;
    const { center, radius } = result.circle;
    const positions = result.points.map((point)=>point.position);
    const normal = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    if (positions.length >= 3) {
        const ab = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(positions[1], positions[0]);
        const ac = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(positions[2], positions[0]);
        normal.crossVectors(ab, ac).normalize();
    }
    if (normal.lengthSq() < 1e-6) normal.set(0, 1, 0);
    const up = normal.clone();
    const right = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    if (Math.abs(up.dot(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0))) > 0.99) right.crossVectors(up, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0)).normalize();
    else right.crossVectors(up, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0)).normalize();
    const forward = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(right, up).normalize();
    const circlePoints = [];
    for(let i = 0; i <= CIRCLE_SEGMENTS; i++){
        const theta = 2 * Math.PI * i / CIRCLE_SEGMENTS;
        circlePoints.push(center.clone().addScaledVector(right, Math.cos(theta) * radius).addScaledVector(forward, Math.sin(theta) * radius));
    }
    group.add(createDashedLine(circlePoints));
    const centerMarker = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(new __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry(0.03 * radius, 8, 8), new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
        color: MEASURE_LINE_COLOR,
        depthTest: false,
        depthWrite: false
    }));
    centerMarker.position.copy(center);
    group.add(centerMarker);
    addPointMarkersAndLabels(group, positions, alphaTexture);
    const radiusLabel = createMeasureLabel(formatDistance(radius));
    radiusLabel.position.copy(midpoint(center, positions[0]));
    group.add(radiusLabel);
    return group;
}
function buildAzimuthVisual(result, alphaTexture) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.name = `measure-azimuth-${result.id}`;
    const positions = result.points.map((point)=>point.position);
    if (positions.length < 2 || void 0 === result.azimuth) return group;
    const p0 = positions[0];
    const p1 = positions[1];
    const distance = p0.distanceTo(p1);
    group.add(createDashedLine([
        p0,
        p1
    ]));
    const northEnd = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p0.x, p0.y + 0.5 * distance, p0.z);
    group.add(createDashedLine([
        p0,
        northEnd
    ]));
    const arcRadius = 0.3 * distance;
    const arcPoints = [];
    for(let i = 0; i <= ARC_SEGMENTS; i++){
        const t = result.azimuth * (i / ARC_SEGMENTS);
        arcPoints.push(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p0.x + Math.sin(t) * arcRadius, p0.y + Math.cos(t) * arcRadius, p0.z));
    }
    group.add(createDashedLine(arcPoints));
    addPointMarkersAndLabels(group, positions, alphaTexture);
    const angleDeg = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.radToDeg(result.azimuth);
    const normalizedDeg = (angleDeg % 360 + 360) % 360;
    const label = createMeasureLabel(formatAngle(normalizedDeg));
    const midAngle = 0.5 * result.azimuth;
    label.position.set(p0.x + Math.sin(midAngle) * arcRadius * 1.3, p0.y + Math.cos(midAngle) * arcRadius * 1.3, p0.z);
    group.add(label);
    return group;
}
function buildAngleVisual(result, alphaTexture) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.name = `measure-angle-${result.id}`;
    const positions = result.points.map((point)=>point.position);
    if (3 !== positions.length || null === result.angle) return group;
    const [p0, p1, p2] = positions;
    group.add(createDashedLine([
        p0,
        p1
    ]));
    group.add(createDashedLine([
        p2,
        p1
    ]));
    addPointMarkersAndLabels(group, positions, alphaTexture);
    addAngleFillAndLabel(group, p1, p0, p2, result.angle);
    return group;
}
function buildAreaVisual(result, alphaTexture) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.name = `measure-area-${result.id}`;
    const positions = result.points.map((point)=>point.position);
    if (positions.length < 3 || null === result.area) return group;
    const closedPoints = [
        ...positions,
        positions[0]
    ];
    group.add(createDashedLine(closedPoints));
    const normal = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    const ab = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(positions[1], positions[0]);
    const ac = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(positions[2], positions[0]);
    normal.crossVectors(ab, ac).normalize();
    if (normal.lengthSq() < 1e-6) normal.set(0, 1, 0);
    const right = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    if (Math.abs(normal.dot(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0))) > 0.99) right.crossVectors(normal, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0)).normalize();
    else right.crossVectors(normal, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0)).normalize();
    const forward = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(right, normal).normalize();
    const projected = positions.map((point)=>{
        const delta = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(point, positions[0]);
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(delta.dot(right), delta.dot(forward));
    });
    const triangles = __WEBPACK_EXTERNAL_MODULE_three__.ShapeUtils.triangulateShape(projected, []);
    const fillGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    const vertices = new Float32Array(3 * positions.length);
    for(let i = 0; i < positions.length; i++){
        vertices[3 * i] = positions[i].x;
        vertices[3 * i + 1] = positions[i].y;
        vertices[3 * i + 2] = positions[i].z;
    }
    fillGeometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(vertices, 3));
    const indices = [];
    for (const triangle of triangles)indices.push(triangle[0], triangle[1], triangle[2]);
    fillGeometry.setIndex(indices);
    group.add(new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(fillGeometry, (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createFillMaterial)(MEASURE_AREA_FILL_COLOR, MEASURE_AREA_FILL_OPACITY)));
    addPointMarkersAndLabels(group, positions, alphaTexture);
    const centroid = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    for (const point of positions)centroid.add(point);
    centroid.divideScalar(positions.length);
    const label = createMeasureLabel(formatArea(result.area));
    label.position.copy(centroid);
    group.add(label);
    return group;
}
function createResultVisual(result, alphaTexture) {
    const origin = resolveMeasureVisualOrigin(result.points);
    const localResult = createLocalMeasureResult(result, origin);
    const visual = (()=>{
        switch(localResult.measureType){
            case 'coordinate':
                return buildCoordinateVisual(localResult, alphaTexture, result);
            case 'distance':
                return buildDistanceVisual(localResult, alphaTexture);
            case 'height':
                return buildHeightVisual(localResult, alphaTexture);
            case 'circle':
                return buildCircleVisual(localResult, alphaTexture);
            case 'azimuth':
                return buildAzimuthVisual(localResult, alphaTexture);
            case 'angle':
                return buildAngleVisual(localResult, alphaTexture);
            case 'area':
                return buildAreaVisual(localResult, alphaTexture);
            default:
                return buildDistanceVisual(localResult, alphaTexture);
        }
    })();
    visual.position.copy(origin);
    return visual;
}
class MeasureOverlayPlugin {
    constructor(){
        this.name = 'measure-overlay';
        this.priority = 55;
        this.dependencies = [
            'MeasureService',
            'RenderPipeline'
        ];
        this.kind = 'measure-overlay';
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__.RenderPhase.Overlay3D
        ];
        this.renderPriority = 0;
        this.viewRegistry = null;
        this.root = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.overlayScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.visualCache = new Map();
        this.previewGroup = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.cameraDirection = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.cameraDepthOffset = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.pointMarkerAlphaTexture = createPointMarkerAlphaTexture();
        this.root.name = 'measureOverlayRoot';
        this.previewGroup.name = 'measurePreview';
        this.root.add(this.previewGroup);
    }
    onInit(context) {
        this.context = context;
    }
    onStart() {
        this.measureService = this.context.getService('MeasureService');
        this.pipeline = this.context.getService('RenderPipeline');
        this.viewRegistry = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getOptionalViewRegistry)(this.context);
        this.pipeline.addRenderContributor(this);
        this.resolveToolsRoot((0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry)).add(this.root);
    }
    onDestroy() {
        this.pipeline.removeRenderContributor(this);
        for (const [, group] of this.visualCache)disposeGroup(group);
        this.visualCache.clear();
        disposeGroup(this.previewGroup);
        this.pointMarkerAlphaTexture.dispose();
        if (this.root.parent) this.root.parent.remove(this.root);
        this.viewRegistry = null;
    }
    render(frame, _phase, ctx) {
        const toolsRoot = this.resolveToolsRoot(ctx.viewId);
        if (this.root.parent !== toolsRoot) {
            this.root.parent?.remove(this.root);
            toolsRoot.add(this.root);
        }
        this.syncResultVisuals(ctx.viewId);
        this.syncPreview(ctx.viewId);
        const hasFinishedResults = Array.from(this.visualCache.values()).some((group)=>group.visible);
        const hasPreview = this.previewGroup.children.length > 0;
        if (!hasFinishedResults && !hasPreview) return;
        if (null !== ctx.outputTarget) return;
        this.root.updateMatrixWorld(true);
        this.updateOverlayObjects(frame.camera, frame.viewport.width, frame.viewport.height, ctx.viewport.width, ctx.viewport.height);
        if (this.root.parent) this.root.parent.remove(this.root);
        this.overlayScene.add(this.root);
        const { renderer } = ctx;
        const savedTarget = renderer.getRenderTarget();
        const savedCameraLayerMask = frame.camera.layers.mask;
        const savedViewport = renderer.getViewport(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4());
        const savedScissor = renderer.getScissor(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4());
        const savedScissorTest = renderer.getScissorTest();
        try {
            renderer.setRenderTarget(ctx.outputTarget);
            renderer.resetState();
            frame.camera.layers.mask = 0xffffffff;
            renderer.setViewport(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
            renderer.setScissor(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
            renderer.setScissorTest(true);
            renderer.render(this.overlayScene, frame.camera);
        } finally{
            frame.camera.layers.mask = savedCameraLayerMask;
            renderer.setRenderTarget(savedTarget);
            renderer.setViewport(savedViewport.x, savedViewport.y, savedViewport.z, savedViewport.w);
            renderer.setScissor(savedScissor.x, savedScissor.y, savedScissor.z, savedScissor.w);
            renderer.setScissorTest(savedScissorTest);
            this.overlayScene.remove(this.root);
            toolsRoot.add(this.root);
        }
    }
    resolveToolsRoot(viewId) {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getViewToolsRoot)(this.context, this.viewRegistry, viewId);
    }
    syncResultVisuals(viewId) {
        const results = this.measureService.getResults();
        const currentIds = new Set();
        for (const result of results){
            currentIds.add(result.id);
            if (!this.visualCache.has(result.id)) {
                const visual = createResultVisual(result, this.pointMarkerAlphaTexture);
                this.visualCache.set(result.id, visual);
                this.root.add(visual);
            }
            const visible = this.measureService.getResultVisible?.(result.id) ?? true;
            const group = this.visualCache.get(result.id);
            if (group) group.visible = visible && this.shouldRenderResultInView(result, viewId);
        }
        for (const [id, group] of this.visualCache)if (!currentIds.has(id)) {
            disposeGroup(group);
            this.root.remove(group);
            this.visualCache.delete(id);
        }
    }
    shouldRenderResultInView(result, viewId) {
        return null == result.viewId || result.viewId === viewId;
    }
    updateOverlayObjects(camera, labelViewportWidth, labelViewportHeight, lineViewportWidth, lineViewportHeight) {
        this.root.traverse((obj)=>{
            if (obj instanceof __WEBPACK_EXTERNAL_MODULE_three__.Sprite && labelViewportWidth > 0 && labelViewportHeight > 0) {
                const anchor = obj.userData._labelAnchor;
                if (anchor) {
                    const offsetYPx = obj.userData._labelOffsetYPx ?? 0;
                    this.positionLabelWithScreenOffset(obj, anchor, camera, labelViewportWidth, labelViewportHeight, offsetYPx);
                }
                const targetPx = obj.userData._labelTargetPx ?? COORDINATE_LABEL_SCREEN_PX;
                (0, __WEBPACK_EXTERNAL_MODULE__shared_TextSprite_js_0db73ebd__.updateTextSpriteScaleForCamera)(obj, camera, labelViewportHeight, targetPx);
            }
            const material = this.getLineMaterial(obj);
            if (!material) return;
            material.resolution.set(lineViewportWidth, lineViewportHeight);
            const reference = obj.userData._measureDashReference;
            if (!reference) return;
            const referenceWorld = reference.clone().applyMatrix4(obj.matrixWorld);
            const pixelsPerWorld = this.computePixelsPerWorld(referenceWorld, camera, lineViewportHeight);
            if (pixelsPerWorld > 0) material.dashScale = pixelsPerWorld;
        });
    }
    positionLabelWithScreenOffset(label, anchor, camera, viewportWidth, viewportHeight, offsetYPx) {
        const anchorWorld = anchor.clone();
        if (label.parent) anchorWorld.applyMatrix4(label.parent.matrixWorld);
        const screenPos = anchorWorld.clone().project(camera);
        screenPos.x = (screenPos.x + 1) * viewportWidth / 2;
        screenPos.y = (-screenPos.y + 1) * viewportHeight / 2;
        screenPos.z = 0;
        screenPos.y += offsetYPx;
        const labelPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(screenPos.x / viewportWidth * 2 - 1, 2 * -(screenPos.y / viewportHeight) + 1, 0.5).unproject(camera);
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
            const distance = camera.position.distanceTo(anchorWorld);
            const direction = labelPos.sub(camera.position).normalize();
            const labelWorldPosition = camera.position.clone().addScaledVector(direction, distance);
            label.position.copy(label.parent ? label.parent.worldToLocal(labelWorldPosition) : labelWorldPosition);
            return;
        }
        label.position.copy(label.parent ? label.parent.worldToLocal(labelPos) : labelPos);
    }
    getLineMaterial(obj) {
        if (!('material' in obj)) return null;
        const material = obj.material;
        return material instanceof __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineMaterial_js_154029c0__.LineMaterial ? material : null;
    }
    computePixelsPerWorld(position, camera, viewportHeight) {
        if (viewportHeight <= 0) return 1;
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
            camera.getWorldDirection(this.cameraDirection);
            const distance = this.cameraDepthOffset.subVectors(position, camera.position).dot(this.cameraDirection);
            if (distance <= 0) return 1;
            const fovRad = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(camera.fov);
            const worldPerPixel = 2 * distance * Math.tan(fovRad / 2) / viewportHeight;
            return worldPerPixel > 0 ? 1 / worldPerPixel : 1;
        }
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
            const frustumHeight = (camera.top - camera.bottom) / Math.max(camera.zoom, 1e-6);
            const worldPerPixel = frustumHeight / viewportHeight;
            return worldPerPixel > 0 ? 1 / worldPerPixel : 1;
        }
        return 1;
    }
    syncPreview(viewId) {
        disposeGroup(this.previewGroup);
        const previewService = this.measureService;
        const draftViewId = previewService.getDraftViewId?.() ?? null;
        const previewViewId = previewService.getPreviewViewId?.() ?? null;
        const effectiveViewId = draftViewId ?? previewViewId;
        if (effectiveViewId && effectiveViewId !== viewId) {
            this.previewGroup.position.set(0, 0, 0);
            return;
        }
        const currentPoints = this.measureService.getCurrentPoints();
        const previewPoint = previewService.getPreviewPoint?.() ?? null;
        const lastCurrentPoint = currentPoints[currentPoints.length - 1]?.position;
        const effectivePreviewPoint = !previewPoint || lastCurrentPoint && lastCurrentPoint.equals(previewPoint.position) ? null : previewPoint;
        const previewPositions = currentPoints.map((point)=>point.position.clone());
        if (effectivePreviewPoint) previewPositions.push(effectivePreviewPoint.position.clone());
        const previewMeasurePoints = previewPositions.map((position)=>({
                position
            }));
        const measureType = this.measureService.getMeasureType();
        if (0 === previewMeasurePoints.length) {
            this.previewGroup.position.set(0, 0, 0);
            return;
        }
        const previewOrigin = resolveMeasureVisualOrigin(previewMeasurePoints);
        const localCurrentPoints = currentPoints.map((point)=>({
                position: toLocalPosition(point.position, previewOrigin)
            }));
        const localEffectivePreviewPoint = effectivePreviewPoint ? {
            position: toLocalPosition(effectivePreviewPoint.position, previewOrigin)
        } : null;
        const localPreviewPositions = previewPositions.map((position)=>toLocalPosition(position, previewOrigin));
        const localPreviewMeasurePoints = localPreviewPositions.map((position)=>({
                position
            }));
        this.previewGroup.position.copy(previewOrigin);
        if (currentPoints.length > 0) addPointMarkersAndLabels(this.previewGroup, localCurrentPoints.map((point)=>point.position.clone()), this.pointMarkerAlphaTexture);
        if (localEffectivePreviewPoint) {
            const hoverPosition = localEffectivePreviewPoint.position.clone();
            const hoverSnap = this.measureService.getHoverSnap?.();
            if (hoverSnap) this.previewGroup.add(createHoverHighlightSprite(hoverPosition));
            if (0 === currentPoints.length) this.previewGroup.add(createPointMarkers([
                hoverPosition
            ], this.pointMarkerAlphaTexture, MEASURE_LINE_COLOR, POINT_MARKER_SIZE));
            this.previewGroup.add(createPointLabel(currentPoints.length, hoverPosition));
        }
        const previewVisual = createPreviewMeasureVisual(localPreviewMeasurePoints, measureType, this.pointMarkerAlphaTexture);
        if (previewVisual) {
            this.previewGroup.add(previewVisual);
            return;
        }
        if (localPreviewPositions.length >= 2) this.previewGroup.add(createDashedLine(localPreviewPositions));
    }
}
const MeasureOverlayPlugin_rslib_entry_ = MeasureOverlayPlugin;
export { MeasureOverlayPlugin, MeasureOverlayPlugin_rslib_entry_ as default };
