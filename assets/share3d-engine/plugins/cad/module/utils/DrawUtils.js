import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineGeometry_js_2cfe464b__ from "three/examples/jsm/lines/LineGeometry.js";
import * as __WEBPACK_EXTERNAL_MODULE_troika_three_text_1c19a3ab__ from "troika-three-text";
class DrawUtils {
    static getBufferGeometryByPoints(points) {
        const vertices = [];
        points.forEach((point)=>{
            vertices.push(point.x, point.y, point.z ?? 0);
        });
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute(vertices, 3));
        return geometry;
    }
    static getBufferGeometryByLines(lines) {
        const points = DrawUtils.getPointsByLines(lines);
        return DrawUtils.getBufferGeometryByPoints(points);
    }
    static getVerticesByPoints(points) {
        const vertices = [];
        points.forEach((point)=>{
            vertices.push(point.x, point.y, point.z || 0);
        });
        return vertices;
    }
    static getPointsByLines(lines) {
        const points = [];
        lines.forEach((line)=>{
            const { startPoint, endPoint } = line;
            points.push(startPoint, endPoint);
        });
        return points;
    }
    static getLineGeometryByPoints(points) {
        const vertices = DrawUtils.getVerticesByPoints(points);
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineGeometry_js_2cfe464b__.LineGeometry();
        geometry.setPositions(new Float32Array(vertices));
        return geometry;
    }
    static getLineGeometryByLines(lines) {
        const points = DrawUtils.getPointsByLines(lines);
        return DrawUtils.getLineGeometryByPoints(points);
    }
    static getLineSegmentsGeometryByLines(lines) {
        const points = DrawUtils.getPointsByLines(lines);
        const vertices = DrawUtils.getVerticesByPoints(points);
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.LineSegmentsGeometry();
        geometry.setPositions(new Float32Array(vertices));
        return geometry;
    }
    static drawLine(point1, point2, materialOption, parent) {
        const geometry = DrawUtils.getBufferGeometryByPoints([
            point1,
            point2
        ]);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial(materialOption);
        const object = new __WEBPACK_EXTERNAL_MODULE_three__.Line(geometry, material);
        parent?.add(object);
        return object;
    }
    static drawPolyline(points, materialOption, parent, closed = false) {
        if (points.length < 2) throw new Error('至少需要2个点来绘制多段线');
        const polylinePoints = closed ? [
            ...points,
            points[0]
        ] : points;
        const geometry = DrawUtils.getBufferGeometryByPoints(polylinePoints);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial(materialOption);
        const object = new __WEBPACK_EXTERNAL_MODULE_three__.Line(geometry, material);
        parent?.add(object);
        return object;
    }
    static drawPolyline2(points, materialOption, parent, closed = false) {
        if (points.length < 2) throw new Error('至少需要2个点来绘制多段线');
        const polylinePoints = closed ? [
            ...points,
            points[0]
        ] : points;
        const geometry = DrawUtils.getLineGeometryByPoints(polylinePoints);
        const material = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.LineMaterial(materialOption);
        material.resolution.set(window.innerWidth, window.innerHeight);
        const object = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, material);
        parent?.add(object);
        return object;
    }
    static drawLineSegments(lines, materialOption, parent) {
        const geometry = DrawUtils.getBufferGeometryByLines(lines);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial(materialOption);
        const object = new __WEBPACK_EXTERNAL_MODULE_three__.LineSegments(geometry, material);
        parent?.add(object);
        return object;
    }
    static drawDashedLine(point1, point2, materialOption, parent) {
        const geometry = DrawUtils.getBufferGeometryByPoints([
            point1,
            point2
        ]);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.LineDashedMaterial(materialOption);
        const object = new __WEBPACK_EXTERNAL_MODULE_three__.Line(geometry, material);
        object.computeLineDistances();
        parent?.add(object);
        return object;
    }
    static drawDashedLine2(point1, point2, materialOption, parent) {
        const geometry = DrawUtils.getLineGeometryByPoints([
            point1,
            point2
        ]);
        const material = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.LineMaterial(materialOption);
        const object = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, material);
        object.computeLineDistances();
        parent?.add(object);
        return object;
    }
    static drawDashedPolyline(points, materialOption, parent, closed = false) {
        if (points.length < 2) throw new Error('至少需要2个点来绘制多段线');
        const polylinePoints = closed ? [
            ...points,
            points[0]
        ] : points;
        const geometry = DrawUtils.getBufferGeometryByPoints(polylinePoints);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.LineDashedMaterial(materialOption);
        const object = new __WEBPACK_EXTERNAL_MODULE_three__.Line(geometry, material);
        object.computeLineDistances();
        parent?.add(object);
        return object;
    }
    static drawDashedLineSegments(lines, materialOption, parent) {
        const geometry = DrawUtils.getBufferGeometryByLines(lines);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.LineDashedMaterial(materialOption);
        const object = new __WEBPACK_EXTERNAL_MODULE_three__.LineSegments(geometry, material);
        object.computeLineDistances();
        parent?.add(object);
        return object;
    }
    static getEllipsePoints(options) {
        const { center, radiusX, radiusY, startAngle = 0, endAngle = 2 * Math.PI, clockwise = false, rotation = 0, segmentsNum = 32 } = options;
        const ellipseCurve = new __WEBPACK_EXTERNAL_MODULE_three__.EllipseCurve(center.x, center.y, radiusX, radiusY, startAngle, endAngle, clockwise, rotation);
        const points2D = ellipseCurve.getPoints(segmentsNum);
        const points = points2D.map((p)=>({
                x: p.x,
                y: p.y
            }));
        return points;
    }
    static getArcPoints(options) {
        const { center, radius, startAngle = 0, endAngle = 2 * Math.PI, clockwise = false, segmentsNum = 20 } = options;
        const arcCurve = new __WEBPACK_EXTERNAL_MODULE_three__.ArcCurve(center.x, center.y, radius, startAngle, endAngle, clockwise);
        const points2D = arcCurve.getPoints(segmentsNum);
        const points = points2D.map((p)=>({
                x: p.x,
                y: p.y
            }));
        return points;
    }
    static getArcGeometry(options) {
        const points = DrawUtils.getArcPoints(options);
        const geometry = DrawUtils.getBufferGeometryByPoints(points);
        return geometry;
    }
    static drawArc(options) {
        const { materialOption, parent } = options;
        const geometry = DrawUtils.getArcGeometry(options);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial(materialOption);
        const object = new __WEBPACK_EXTERNAL_MODULE_three__.Line(geometry, material);
        parent?.add(object);
        return object;
    }
    static drawDashedArc(options) {
        const { materialOption, parent } = options;
        const geometry = DrawUtils.getArcGeometry(options);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.LineDashedMaterial(materialOption);
        const object = new __WEBPACK_EXTERNAL_MODULE_three__.Line(geometry, material);
        object.computeLineDistances();
        parent?.add(object);
        return object;
    }
    static drawDashedArc2(options) {
        const { materialOption, parent } = options;
        const points = DrawUtils.getArcPoints(options);
        const geometry = DrawUtils.getLineGeometryByPoints(points);
        const material = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.LineMaterial(materialOption);
        const object = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, material);
        object.computeLineDistances();
        parent?.add(object);
        return object;
    }
    static createArrowShape(length, width) {
        const shape = new __WEBPACK_EXTERNAL_MODULE_three__.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(-length, width / 2);
        shape.lineTo(-length, -width / 2);
        shape.lineTo(0, 0);
        return new __WEBPACK_EXTERNAL_MODULE_three__.ShapeGeometry(shape);
    }
    static disposeObject(object) {
        if (!object) return;
        object.traverse((child)=>{
            if (child.geometry && 'function' == typeof child.geometry.dispose) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach((m)=>m && 'function' == typeof m.dispose && m.dispose());
                else if ('function' == typeof child.material.dispose) child.material.dispose();
            }
            if (child instanceof __WEBPACK_EXTERNAL_MODULE_troika_three_text_1c19a3ab__.Text) child.dispose();
        });
        if (object.parent) object.parent.remove(object);
    }
    static updateLineByPoints(line, points) {
        if (line.geometry.attributes.position.count !== points.length) {
            const geometry = DrawUtils.getBufferGeometryByPoints(points);
            line.geometry.dispose();
            line.geometry = geometry;
            return;
        }
        const pointVectors = points.map((p)=>new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p.x, p.y, p.z || 0));
        line.geometry.setFromPoints(pointVectors);
        line.geometry.attributes.position.needsUpdate = true;
    }
    static updateLine2ByPoints(line, points) {
        const vertices = points.flatMap((p)=>[
                p.x,
                p.y,
                p.z || 0
            ]);
        line.geometry.setPositions(vertices);
        line.geometry.attributes.position.needsUpdate = true;
    }
}
export { DrawUtils };
