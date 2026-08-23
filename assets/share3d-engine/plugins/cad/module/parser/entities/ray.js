import * as __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__ from "../parseHelpers.js";
class RayEntityParser {
    parseEntity(scanner, curr) {
        const entity = {
            type: curr.value
        };
        curr = scanner.next();
        while(!scanner.isEOF()){
            if (0 === curr.code) break;
            switch(curr.code){
                case 10:
                    entity.startPoint = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    break;
                case 11:
                    entity.unitVector = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    break;
                default:
                    __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
    constructor(){
        this.ForEntityName = 'RAY';
    }
}
export { RayEntityParser as default };
