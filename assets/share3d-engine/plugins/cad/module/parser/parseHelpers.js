import * as __WEBPACK_EXTERNAL_MODULE__autoCadColorIndex_js_661ea378__ from "./autoCadColorIndex.js";
function getAcadColor(index) {
    return __WEBPACK_EXTERNAL_MODULE__autoCadColorIndex_js_661ea378__.AUTO_CAD_COLOR_INDEX[index];
}
function parsePoint(scanner) {
    const point = {};
    scanner.rewind();
    let curr = scanner.next();
    let code = curr.code;
    point.x = curr.value;
    code += 10;
    curr = scanner.next();
    if (curr.code !== code) throw new Error(`Expected code for point value to be ${code} but got ${curr.code}.`);
    point.y = curr.value;
    code += 10;
    curr = scanner.next();
    if (curr.code !== code) {
        scanner.rewind();
        return point;
    }
    point.z = curr.value;
    return point;
}
function checkCommonEntityProperties(entity, curr, scanner) {
    switch(curr.code){
        case 0:
            entity.type = curr.value;
            break;
        case 5:
            entity.handle = curr.value;
            break;
        case 6:
            entity.lineType = curr.value;
            break;
        case 8:
            entity.layer = curr.value;
            break;
        case 48:
            entity.lineTypeScale = curr.value;
            break;
        case 60:
            entity.visible = 0 === curr.value;
            break;
        case 62:
            {
                const colorIndex = curr.value;
                entity.colorIndex = colorIndex;
                entity.color = getAcadColor(Math.abs(colorIndex));
                break;
            }
        case 67:
            entity.inPaperSpace = 0 !== curr.value;
            break;
        case 100:
            break;
        case 101:
            while(0 !== curr.code)curr = scanner.next();
            scanner.rewind();
            break;
        case 330:
            entity.ownerHandle = curr.value;
            break;
        case 347:
            entity.materialObjectHandle = curr.value;
            break;
        case 370:
            entity.lineweight = curr.value;
            break;
        case 420:
            entity.color = curr.value;
            break;
        case 1000:
            entity.extendedData ||= {};
            entity.extendedData.customStrings ||= [];
            entity.extendedData.customStrings.push(curr.value);
            break;
        case 1001:
            entity.extendedData ||= {};
            entity.extendedData.applicationName = curr.value;
            break;
        default:
            return false;
    }
    return true;
}
export { checkCommonEntityProperties, getAcadColor, parsePoint };
