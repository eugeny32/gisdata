import * as __WEBPACK_EXTERNAL_MODULE__camera_CameraPlugin_js_9b61ab70__ from "./camera/CameraPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__character_CharacterPlugin_js_f825bc3d__ from "./character/CharacterPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__control_ControlPlugin_js_29acb7f0__ from "./control/ControlPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__input_InputPlugin_js_0c055de3__ from "./input/InputPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__picking_PickingPlugin_js_d115ef84__ from "./picking/PickingPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__render_RenderPlugin_js_b068f66a__ from "./render/RenderPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__selection_SelectionPlugin_js_98a98cd9__ from "./selection/SelectionPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__sharedOcclusionDepth_SharedOcclusionDepthPlugin_js_841e81dd__ from "./sharedOcclusionDepth/SharedOcclusionDepthPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__spatial_SpatialQueryPlugin_js_8d53f2e1__ from "./spatial/SpatialQueryPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__view_ViewPlugin_js_1d7c8f7c__ from "./view/ViewPlugin.js";
function corePlugins(options = {}) {
    return [
        new __WEBPACK_EXTERNAL_MODULE__view_ViewPlugin_js_1d7c8f7c__.ViewPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__camera_CameraPlugin_js_9b61ab70__.CameraPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__input_InputPlugin_js_0c055de3__.InputPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__control_ControlPlugin_js_29acb7f0__.ControlPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__picking_PickingPlugin_js_d115ef84__.PickingPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__sharedOcclusionDepth_SharedOcclusionDepthPlugin_js_841e81dd__.SharedOcclusionDepthPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__spatial_SpatialQueryPlugin_js_8d53f2e1__.SpatialQueryPlugin({
            withCredentials: options.withCredentials
        }),
        new __WEBPACK_EXTERNAL_MODULE__character_CharacterPlugin_js_f825bc3d__.CharacterPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__selection_SelectionPlugin_js_98a98cd9__.SelectionPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__render_RenderPlugin_js_b068f66a__.RenderPlugin()
    ];
}
export { corePlugins };
