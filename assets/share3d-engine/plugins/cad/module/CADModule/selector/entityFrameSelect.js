import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_selector_FrameSelect_js_c1731d80__ from "../../core/selector/FrameSelect.js";
class EntityFrameSelect extends __WEBPACK_EXTERNAL_MODULE__core_selector_FrameSelect_js_c1731d80__.FrameSelect {
    constructor(viewManager, detector, selector){
        super({
            onSelect: (items)=>{
                this.onSelect(items);
            },
            onHoverAdded: (items)=>{
                this.onHoverAdded(items);
            },
            onHoverRemoved: (items)=>{
                this.onHoverRemoved(items);
            }
        }), this.viewManager = viewManager, this.detector = detector, this.selector = selector, this.camera = null, this.domElement = null, this.worldToScreen = null, this.boxScratch = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(), this.boxPoints = Array.from({
            length: 8
        }, ()=>new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()), this.screenPointScratch = {
            x: 0,
            y: 0
        }, this.pointScratch = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.segmentStartScratch = {
            x: 0,
            y: 0
        }, this.segmentEndScratch = {
            x: 0,
            y: 0
        };
    }
    setContext(camera, domElement, worldToScreen) {
        this.camera = camera;
        this.domElement = domElement;
        this.worldToScreen = worldToScreen ?? null;
    }
    onSelect(items) {
        this.selector.select(items);
    }
    onHoverAdded(items) {
        if (this.detector.getEnableHighlight()) this.viewManager.hoverEntity(items);
    }
    onHoverRemoved(items) {
        if (this.detector.getEnableHighlight()) this.viewManager.cancelHoverEntity(items);
    }
    getItemsInRect(rect, mode) {
        if (!this.camera || !this.domElement) return [];
        const entities = this.viewManager.dataManager.entities;
        const selected = [];
        for (const entity of entities){
            const object = this.viewManager.getEntityObject(entity);
            if (!object || false === object.visible) continue;
            object.updateWorldMatrix(true, false);
            const box = this.boxScratch.setFromObject(object);
            if (box.isEmpty()) continue;
            const screenRect = this.getScreenRectFromBox(box);
            if (!screenRect) continue;
            const hit = this.isHit(rect, screenRect, mode, object);
            if (hit) selected.push(entity);
        }
        return selected;
    }
    getScreenRectFromBox(box) {
        if (!this.camera || !this.domElement) return null;
        const min = box.min;
        const max = box.max;
        const points = this.boxPoints;
        points[0].set(min.x, min.y, min.z);
        points[1].set(min.x, min.y, max.z);
        points[2].set(min.x, max.y, min.z);
        points[3].set(min.x, max.y, max.z);
        points[4].set(max.x, min.y, min.z);
        points[5].set(max.x, min.y, max.z);
        points[6].set(max.x, max.y, min.z);
        points[7].set(max.x, max.y, max.z);
        let left = 1 / 0;
        let right = -1 / 0;
        let top = 1 / 0;
        let bottom = -1 / 0;
        for (const point of points){
            if (!this.projectWorldPointToScreen(point, this.screenPointScratch)) continue;
            const { x: sx, y: sy } = this.screenPointScratch;
            left = Math.min(left, sx);
            right = Math.max(right, sx);
            top = Math.min(top, sy);
            bottom = Math.max(bottom, sy);
        }
        if (!Number.isFinite(left) || !Number.isFinite(right) || !Number.isFinite(top) || !Number.isFinite(bottom)) return null;
        return {
            left,
            right,
            top,
            bottom
        };
    }
    isHit(a, b, mode, object) {
        if (mode === __WEBPACK_EXTERNAL_MODULE__core_selector_FrameSelect_js_c1731d80__.FrameSelectMode.L2R) return a.left <= b.left && a.right >= b.right && a.top <= b.top && a.bottom >= b.bottom;
        if (a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom) return false;
        return this.isObjectIntersectRect(object, a);
    }
    isObjectIntersectRect(object, rect) {
        if (!this.camera || !this.domElement) return false;
        let hasScreenSegment = false;
        let hit = false;
        object.traverse((child)=>{
            if (hit || !this.isObjectVisible(child)) return;
            const geometry = child.geometry;
            if (!geometry) return;
            const instanceStart = geometry.getAttribute('instanceStart');
            const instanceEnd = geometry.getAttribute('instanceEnd');
            if (instanceStart && instanceEnd) {
                for(let i = 0; i < Math.min(instanceStart.count, instanceEnd.count); i++){
                    const result = this.isScreenSegmentIntersectRect(child, instanceStart, instanceEnd, i, i, rect);
                    hasScreenSegment ||= result.hasScreenSegment;
                    if (result.hit) {
                        hit = true;
                        break;
                    }
                }
                return;
            }
            const position = geometry.getAttribute('position');
            if (!position || position.count < 2) return;
            const step = child instanceof __WEBPACK_EXTERNAL_MODULE_three__.LineSegments ? 2 : 1;
            for(let i = 0; i + 1 < position.count; i += step){
                const result = this.isScreenSegmentIntersectRect(child, position, position, i, i + 1, rect);
                hasScreenSegment ||= result.hasScreenSegment;
                if (result.hit) {
                    hit = true;
                    return;
                }
            }
        });
        return !hasScreenSegment || hit;
    }
    isScreenSegmentIntersectRect(object, startAttr, endAttr, startIndex, endIndex, rect) {
        const hasStart = this.projectLocalPointToScreen(object, startAttr, startIndex, this.segmentStartScratch);
        const hasEnd = this.projectLocalPointToScreen(object, endAttr, endIndex, this.segmentEndScratch);
        if (!hasStart || !hasEnd) return {
            hasScreenSegment: false,
            hit: false
        };
        return {
            hasScreenSegment: true,
            hit: this.isSegmentIntersectRect(this.segmentStartScratch, this.segmentEndScratch, rect)
        };
    }
    projectLocalPointToScreen(object, attr, index, target) {
        if (!this.camera || !this.domElement) return false;
        const point = this.pointScratch.set(attr.getX(index), attr.getY(index), attr.getZ(index));
        point.applyMatrix4(object.matrixWorld);
        return this.projectWorldPointToScreen(point, target);
    }
    projectWorldPointToScreen(point, target) {
        if (!this.camera || !this.domElement) return false;
        const screenPoint = this.worldToScreen ? this.worldToScreen(point) : {
            x: (0.5 * point.project(this.camera).x + 0.5) * this.domElement.clientWidth,
            y: (0.5 * -point.y + 0.5) * this.domElement.clientHeight
        };
        if (!Number.isFinite(screenPoint.x) || !Number.isFinite(screenPoint.y)) return false;
        target.x = screenPoint.x;
        target.y = screenPoint.y;
        return true;
    }
    isSegmentIntersectRect(start, end, rect) {
        if (this.isPointInRect(start, rect) || this.isPointInRect(end, rect)) return true;
        const topLeft = {
            x: rect.left,
            y: rect.top
        };
        const topRight = {
            x: rect.right,
            y: rect.top
        };
        const bottomRight = {
            x: rect.right,
            y: rect.bottom
        };
        const bottomLeft = {
            x: rect.left,
            y: rect.bottom
        };
        return this.isSegmentIntersectSegment(start, end, topLeft, topRight) || this.isSegmentIntersectSegment(start, end, topRight, bottomRight) || this.isSegmentIntersectSegment(start, end, bottomRight, bottomLeft) || this.isSegmentIntersectSegment(start, end, bottomLeft, topLeft);
    }
    isPointInRect(point, rect) {
        return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
    }
    isSegmentIntersectSegment(a, b, c, d) {
        const ab = this.getOrientation(a, b, c);
        const cd = this.getOrientation(a, b, d);
        const ca = this.getOrientation(c, d, a);
        const cb = this.getOrientation(c, d, b);
        if (0 === ab && this.isPointOnSegment(c, a, b)) return true;
        if (0 === cd && this.isPointOnSegment(d, a, b)) return true;
        if (0 === ca && this.isPointOnSegment(a, c, d)) return true;
        if (0 === cb && this.isPointOnSegment(b, c, d)) return true;
        return ab !== cd && ca !== cb;
    }
    getOrientation(a, b, c) {
        const value = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
        if (Math.abs(value) < 1e-9) return 0;
        return value > 0 ? 1 : -1;
    }
    isPointOnSegment(point, start, end) {
        return point.x <= Math.max(start.x, end.x) && point.x >= Math.min(start.x, end.x) && point.y <= Math.max(start.y, end.y) && point.y >= Math.min(start.y, end.y);
    }
    isObjectVisible(object) {
        let current = object;
        while(current){
            if (!current.visible) return false;
            current = current.parent;
        }
        return true;
    }
}
export { EntityFrameSelect };
