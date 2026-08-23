import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__Capturer_js_2e228e2f__ from "./Capturer.js";
const captureTypeToMarkerType = {
    [__WEBPACK_EXTERNAL_MODULE__Capturer_js_2e228e2f__.CaptureType.Endpoint]: "square",
    [__WEBPACK_EXTERNAL_MODULE__Capturer_js_2e228e2f__.CaptureType.Node]: "square",
    [__WEBPACK_EXTERNAL_MODULE__Capturer_js_2e228e2f__.CaptureType.Midpoint]: "triangle",
    [__WEBPACK_EXTERNAL_MODULE__Capturer_js_2e228e2f__.CaptureType.Center]: "circle",
    [__WEBPACK_EXTERNAL_MODULE__Capturer_js_2e228e2f__.CaptureType.Nearest]: "cross",
    [__WEBPACK_EXTERNAL_MODULE__Capturer_js_2e228e2f__.CaptureType.None]: "square"
};
class CaptureMarker {
    constructor(){
        this.geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        this.geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Float32Array(3), 3));
        this.material = new __WEBPACK_EXTERNAL_MODULE_three__.PointsMaterial({
            size: 24,
            sizeAttenuation: false,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            map: null
        });
        this.mesh = new __WEBPACK_EXTERNAL_MODULE_three__.Points(this.geometry, this.material);
        this.mesh.visible = false;
        this.mesh.renderOrder = 9999;
        this.mesh.frustumCulled = false;
    }
    addToGroup(group) {
        group.add(this.mesh);
    }
    isAddedToGroup() {
        return !!this.mesh.parent;
    }
    dispose() {
        this.mesh.parent?.remove(this.mesh);
        this.geometry.dispose();
        this.material.dispose();
    }
    update(point, type) {
        if (type === __WEBPACK_EXTERNAL_MODULE__Capturer_js_2e228e2f__.CaptureType.None) {
            this.mesh.visible = false;
            return;
        }
        const posAttr = this.geometry.attributes.position;
        posAttr.setXYZ(0, point.x, point.y, 0);
        posAttr.needsUpdate = true;
        const markerType = captureTypeToMarkerType[type];
        if (!this.material.map || this.material.map.name !== `captureMarker_${markerType}`) {
            this.material.map?.dispose();
            this.material.map = this.createGlyphTexture(markerType);
        }
        this.mesh.visible = true;
    }
    createGlyphTexture(markerType) {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 4;
        const center = size / 2;
        const offset = size / 4;
        ctx.clearRect(0, 0, size, size);
        ctx.beginPath();
        switch(markerType){
            case "square":
                ctx.strokeRect(center - offset, center - offset, 2 * offset, 2 * offset);
                break;
            case "triangle":
                ctx.moveTo(center, center - offset);
                ctx.lineTo(center - offset, center + offset);
                ctx.lineTo(center + offset, center + offset);
                ctx.closePath();
                ctx.stroke();
                break;
            case "circle":
                ctx.arc(center, center, offset, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            case "cross":
                ctx.moveTo(center - offset, center - offset);
                ctx.lineTo(center + offset, center + offset);
                ctx.moveTo(center + offset, center - offset);
                ctx.lineTo(center - offset, center + offset);
                ctx.stroke();
                break;
        }
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.name = `captureMarker_${markerType}`;
        return texture;
    }
}
export { CaptureMarker };
