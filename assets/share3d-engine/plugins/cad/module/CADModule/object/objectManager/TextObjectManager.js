import * as __WEBPACK_EXTERNAL_MODULE_troika_three_text_1c19a3ab__ from "troika-three-text";
import * as __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__ from "../material/MaterialUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__ from "../../../../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__ from "./BaseObjectManager.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__.getLoggerManager)().getLogger('cad:diagnostics');
const TEXT_DIAGNOSTIC_INTERVAL_MS = 15000;
const LONG_TEXT_LENGTH = 1000;
let createdTextObjects = 0;
let disposedTextObjects = 0;
let outlineTextObjects = 0;
let textSyncCalls = 0;
let lastTextDiagnosticAt = 0;
function getTextLength(entity) {
    return 'string' == typeof entity.contents ? entity.contents.length : 0;
}
function logTextDiagnostic(reason, entity, force = false) {
    const now = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__.getLoggerManager)().now();
    const textLength = getTextLength(entity);
    const shouldLog = force || textLength >= LONG_TEXT_LENGTH || createdTextObjects % 100 === 0 || now - lastTextDiagnosticAt >= TEXT_DIAGNOSTIC_INTERVAL_MS;
    if (!shouldLog) return;
    lastTextDiagnosticAt = now;
    log.info(`[CADText] ${reason}, entityId=${entity.id}, textLength=${textLength}, fontSize=${entity.textHeight}, maxWidth=${entity.rectWidth}, created=${createdTextObjects}, disposed=${disposedTextObjects}, outlines=${outlineTextObjects}, syncCalls=${textSyncCalls}`);
}
class TextObjectManager extends __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.BaseObjectManager {
    createObject(entity) {
        const object = new __WEBPACK_EXTERNAL_MODULE_troika_three_text_1c19a3ab__.Text();
        object.whiteSpace = 'normal';
        object.overflowWrap = 'break-word';
        object.maxWidth = entity.rectWidth;
        object.text = entity.contents;
        object.fontSize = entity.textHeight;
        object.color = `#${entity.color.toString(16).padStart(6, '0')}`;
        object.position.set(entity.position.x, entity.position.y, 0);
        object.rotation.z = entity.rotation;
        object.anchorX = 'left';
        object.anchorY = 'top';
        const materialOption = __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.getMaterialOptionByEntity(entity);
        object.material.depthTest = materialOption.depthTest ?? true;
        object.material.depthWrite = materialOption.depthWrite ?? true;
        object.sync();
        createdTextObjects += 1;
        textSyncCalls += 1;
        logTextDiagnostic('createObject sync', entity);
        return object;
    }
    onUpdateGeometry(entity) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        object.maxWidth = entity.rectWidth;
        object.text = entity.contents;
        object.fontSize = entity.textHeight;
        object.position.set(entity.position.x, entity.position.y, 0);
        object.rotation.z = entity.rotation;
        object.sync();
        textSyncCalls += 1;
        logTextDiagnostic('updateGeometry sync', entity);
        this.onUpdateOutlineGeometry(entity);
    }
    onUpdateMaterial(entity) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        object.color = `#${entity.color.toString(16).padStart(6, '0')}`;
        object.fontSize = entity.textHeight;
        object.sync();
        textSyncCalls += 1;
        logTextDiagnostic('updateMaterial sync', entity);
        this.onUpdateOutlineGeometry(entity);
    }
    disposeObject(object) {
        object.dispose();
        disposedTextObjects += 1;
        if (object.userData.entity) {
            const entity = object.userData.entity;
            const outlineObject = this.outlineObjectMap.get(entity.id);
            outlineObject?.parent?.remove(outlineObject);
            if (outlineObject) {
                outlineObject.dispose();
                disposedTextObjects += 1;
            }
            this.outlineObjectMap.delete(entity.id);
            logTextDiagnostic('disposeObject', entity);
        }
    }
    handleEntityHighlight(entity, mode) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        if (mode === __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.HighlightMode.None) {
            const outlineObject = this.outlineObjectMap.get(entity.id);
            if (outlineObject) outlineObject.visible = false;
        } else {
            const color = mode === __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.HighlightMode.Hover ? this.hoverMaterialOption.color : this.selectMaterialOption.color;
            const colorString = `#${color.toString(16).padStart(6, '0')}`;
            const outlineObject = this.outlineObjectMap.get(entity.id);
            if (outlineObject) {
                outlineObject.color = colorString;
                outlineObject.visible = true;
            } else {
                const outlineObject = this.createObject(entity);
                outlineObject.color = colorString;
                outlineObject.material.depthTest = false;
                outlineObject.fillOpacity = this.hoverMaterialOption.opacity;
                this.group.add(outlineObject);
                this.outlineObjectMap.set(entity.id, outlineObject);
                outlineTextObjects += 1;
                logTextDiagnostic('createOutline sync', entity, true);
            }
        }
    }
    onUpdateOutlineGeometry(entity) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        const outlineObject = this.outlineObjectMap.get(entity.id);
        if (!outlineObject) return;
        outlineObject.text = entity.contents;
        outlineObject.fontSize = entity.textHeight;
        outlineObject.position.set(entity.position.x, entity.position.y, 0);
        outlineObject.sync();
        textSyncCalls += 1;
        logTextDiagnostic('updateOutline sync', entity);
    }
    constructor(...args){
        super(...args), this.outlineObjectMap = new Map();
    }
}
export { TextObjectManager };
