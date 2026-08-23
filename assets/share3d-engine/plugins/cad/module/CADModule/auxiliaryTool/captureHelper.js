import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__ from "../model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_utils_js_15eda51d__ from "../../common/utils.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_view_js_fb21ae28__ from "../../common/view.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_CaptureMarker_js_f997e5b0__ from "../../core/auxiliaryTool/CaptureMarker.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__ from "../../core/auxiliaryTool/Capturer.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class CaptureHelper extends __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.Capturer {
    get captureMarker() {
        if (!this._captureMarker) {
            this._captureMarker = new __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_CaptureMarker_js_f997e5b0__.CaptureMarker();
            this.addCaptureMarkerToGroup();
        }
        return this._captureMarker;
    }
    capture(mousePoint, worldPoint, entities, extraData) {
        const result = this.handleCapture(mousePoint, worldPoint, entities, extraData);
        if (result) this.config.showMarker && this.updateCaptureMarkerByResult(result);
        else this.clearCaptureMarker();
        this.lastCaptureResult = result;
        return result;
    }
    handleCapture(mousePoint, worldPoint, entities, extraData) {
        if (!this.config.enabled) return null;
        const entitiesToCapture = entities || this.getCaptureEntities(mousePoint);
        if (extraData?.entities) entitiesToCapture.push(...extraData.entities);
        const shouldSearchCenterPoints = !entities && this.isCaptureTypeEnabled(__WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Center);
        if (0 === entitiesToCapture.length && !extraData && !shouldSearchCenterPoints) return null;
        let candidatePoint;
        const lines = [];
        let minPointDistance = this.getCaptureDistance();
        const handlePoint = (point, type, entity)=>{
            const distance = this.calculateDistance(point, worldPoint);
            if (distance <= minPointDistance) {
                minPointDistance = distance;
                candidatePoint = {
                    point: {
                        ...point
                    },
                    entity,
                    distance,
                    type
                };
            }
        };
        const handleCaptureSourceData = (captureData, entity)=>{
            lines.push(...captureData.lines || []);
            if (this.isCaptureTypeEnabled(__WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Endpoint)) for (const point of captureData.endPoints || [])handlePoint(point, __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Endpoint, entity);
            if (this.isCaptureTypeEnabled(__WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Midpoint)) for (const point of captureData.midPoints || [])handlePoint(point, __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Midpoint, entity);
            if (this.isCaptureTypeEnabled(__WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Node)) for (const point of captureData.nodePoints || [])handlePoint(point, __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Node, entity);
            if (this.isCaptureTypeEnabled(__WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Center)) for (const point of captureData.centerPoints || [])handlePoint(point, __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Center, entity);
        };
        for (const entity of entitiesToCapture){
            const captureData = entity.getCaptureData();
            handleCaptureSourceData(captureData, entity);
        }
        if (extraData) handleCaptureSourceData(extraData);
        if (!candidatePoint && shouldSearchCenterPoints) {
            const handledEntityIds = new Set(entitiesToCapture.map((entity)=>entity.id));
            for (const entity of this.getCenterCaptureEntities(handledEntityIds)){
                const captureData = entity.getCaptureData();
                for (const point of captureData.centerPoints || [])handlePoint(point, __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Center, entity);
            }
        }
        let result = candidatePoint || null;
        if (result) return result;
        if (this.isCaptureTypeEnabled(__WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Nearest)) for (const line of lines){
            const nearestPoint = this.findNearestPointOnLine(worldPoint, line);
            handlePoint(nearestPoint, __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.Nearest);
        }
        result = candidatePoint || null;
        return result;
    }
    getCaptureDistance() {
        const radius = this.config.captureRadius;
        const camera = this.ctx.getService('ViewportCamera').getActiveCamera();
        return (0, __WEBPACK_EXTERNAL_MODULE__common_utils_js_15eda51d__.getPixelSizeInWorld)(camera, (0, __WEBPACK_EXTERNAL_MODULE__common_view_js_fb21ae28__.getActiveViewSize)(this.ctx), radius);
    }
    getCaptureEntities(mousePoint) {
        const entities = this.entityDetector.handleDetect(mousePoint);
        return entities;
    }
    getCenterCaptureEntities(excludedEntityIds) {
        return this.viewManager.dataManager.entities.filter((entity)=>!excludedEntityIds.has(entity.id) && this.centerCaptureEntityTypes.has(entity.type));
    }
    injectTool(tool) {
        super.injectTool(tool);
        tool.inject(this.entityDetector);
    }
    ejectTool() {
        this.clear();
        this.tool?.eject(this.entityDetector);
        super.ejectTool();
    }
    updateCaptureMarkerByResult(result) {
        this.captureMarker.update(result.point, result.type);
        this.addCaptureMarkerToGroup();
    }
    clearCaptureMarker() {
        this.captureMarker.update({
            x: 0,
            y: 0
        }, __WEBPACK_EXTERNAL_MODULE__core_auxiliaryTool_Capturer_js_6ceff616__.CaptureType.None);
    }
    clear() {
        this.clearCaptureMarker();
    }
    addCaptureMarkerToGroup() {
        const marker = this._captureMarker;
        const group = this.viewManager.tempGroup;
        if (marker && !marker.isAddedToGroup() && group) marker.addToGroup(group);
    }
    dispose() {
        this._captureMarker?.dispose();
        this._captureMarker = null;
    }
    constructor(...args){
        super(...args), this._captureMarker = null, this.centerCaptureEntityTypes = new Set([
            __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Circle,
            __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc,
            __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ellipse
        ]);
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntityDetector),
    _ts_metadata("design:type", "undefined" == typeof EntityDetector ? Object : EntityDetector)
], CaptureHelper.prototype, "entityDetector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EngineContext),
    _ts_metadata("design:type", "undefined" == typeof EngineContext ? Object : EngineContext)
], CaptureHelper.prototype, "ctx", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], CaptureHelper.prototype, "viewManager", void 0);
CaptureHelper = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], CaptureHelper);
export { CaptureHelper };
