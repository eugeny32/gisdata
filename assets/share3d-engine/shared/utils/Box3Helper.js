import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
class Box3Helper extends __WEBPACK_EXTERNAL_MODULE_three__.LineSegments {
    constructor(box, color = 0xffff00){
        if (void 0 === color) color = 0xffff00;
        const indices = new Uint16Array([
            0,
            1,
            1,
            2,
            2,
            3,
            3,
            0,
            4,
            5,
            5,
            6,
            6,
            7,
            7,
            4,
            0,
            4,
            1,
            5,
            2,
            6,
            3,
            7
        ]);
        const positions = new Float32Array([
            box.min.x,
            box.min.y,
            box.min.z,
            box.max.x,
            box.min.y,
            box.min.z,
            box.max.x,
            box.min.y,
            box.max.z,
            box.min.x,
            box.min.y,
            box.max.z,
            box.min.x,
            box.max.y,
            box.min.z,
            box.max.x,
            box.max.y,
            box.min.z,
            box.max.x,
            box.max.y,
            box.max.z,
            box.min.x,
            box.max.y,
            box.max.z
        ]);
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        geometry.setIndex(new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(indices, 1));
        geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(positions, 3));
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial({
            color: color
        });
        super(geometry, material);
    }
}
export { Box3Helper };
