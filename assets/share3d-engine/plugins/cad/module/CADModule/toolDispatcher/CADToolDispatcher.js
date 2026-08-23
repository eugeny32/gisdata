import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_common_interface_js_0bce964b__ from "../../core/common/interface.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__ from "../../../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__ from "./interface.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__.getLoggerManager)().getLogger('cad');
class CADToolDispatcher {
    constructor(container){
        this.container = container;
    }
    getDrawTool(toolType) {
        const symbolMap = {
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Polyline]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawPolylineTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Arc]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawArcTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Circle]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawCircleTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Rect]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawRectTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Spline]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawSplineTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Text]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawTextTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Dimension]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawDimensionTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Polygon]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawPolygonTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Ellipse]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawEllipseTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Ray]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawRayTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.Hatch]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawHatchTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.MLeader]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawMLeaderTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.DrawToolType.AngularDimension]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawAngularDimensionTool
        };
        const sym = symbolMap[toolType];
        if (!sym) {
            log.warn(`不支持的绘制工具类型: "${toolType}"`);
            return null;
        }
        return this.container.get(sym);
    }
    draw(params) {
        const { toolType, entityData, controller = this.container.get(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADController) } = params;
        const drawTool = this.getDrawTool(toolType);
        drawTool?.start(controller, __WEBPACK_EXTERNAL_MODULE__core_common_interface_js_0bce964b__.StartMode.alone, entityData, params.mode);
    }
    exitDraw(toolType) {
        const drawTool = this.getDrawTool(toolType);
        drawTool?.exit();
    }
    getEditTool(toolType) {
        const symbolMap = {
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.EditToolType.Join]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.JoinEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.EditToolType.Copy]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CopyEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.EditToolType.Move]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MoveEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.EditToolType.Close]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CloseEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.EditToolType.Rotate]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.RotateEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.EditToolType.Offset]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.OffsetEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.EditToolType.Break]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.BreakEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.EditToolType.Trim]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.TrimEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__interface_js_4f92a3bb__.EditToolType.Extend]: __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.ExtendEntityTool
        };
        const sym = symbolMap[toolType];
        if (!sym) {
            log.warn(`不支持的编辑工具类型: "${toolType}"`);
            return null;
        }
        return this.container.get(sym);
    }
    edit(params) {
        const { toolType, controller = this.container.get(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADController) } = params;
        const editTool = this.getEditTool(toolType);
        editTool?.start(controller, __WEBPACK_EXTERNAL_MODULE__core_common_interface_js_0bce964b__.StartMode.alone);
    }
    exitEdit(toolType) {
        const editTool = this.getEditTool(toolType);
        editTool?.exit();
    }
    setOrthogonalEnabled(enabled) {
        const orthogonalHelper = this.container.get(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.OrthogonalHelper);
        orthogonalHelper.setEnabled(enabled);
    }
    isOrthogonalEnabled() {
        const orthogonalHelper = this.container.get(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.OrthogonalHelper);
        return orthogonalHelper.isEnabled();
    }
    setCaptureEnabled(enabled) {
        const captureHelper = this.container.get(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CaptureHelper);
        captureHelper.setEnabled(enabled);
    }
    isCaptureEnabled() {
        const captureHelper = this.container.get(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CaptureHelper);
        return captureHelper.isEnabled();
    }
    setCaptureType(type, enabled) {
        const captureHelper = this.container.get(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CaptureHelper);
        captureHelper.setCaptureType(type, enabled);
    }
    setCaptureConfig(config) {
        const captureHelper = this.container.get(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CaptureHelper);
        captureHelper.setConfig(config);
    }
}
export { CADToolDispatcher };
