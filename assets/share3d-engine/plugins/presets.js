import * as __WEBPACK_EXTERNAL_MODULE__animation_AnimationPlugin_js_6cb38a25__ from "./animation/AnimationPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__cad_CadPlugin_js_9d5f0b31__ from "./cad/CadPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__camera_CameraPlugin_js_9b61ab70__ from "./camera/CameraPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__corePlugins_js_372fba78__ from "./corePlugins.js";
import * as __WEBPACK_EXTERNAL_MODULE__gsplat_GSplatPlugin_js_830ccb25__ from "./gsplat/GSplatPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__picking_PickingPlugin_js_d115ef84__ from "./picking/PickingPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__pointCloud_BoundingBoxOverlayPlugin_js_b98b6fa6__ from "./pointCloud/BoundingBoxOverlayPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__pointCloud_PointCloudPlugin_js_990ab56b__ from "./pointCloud/PointCloudPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__render_RenderPlugin_js_b068f66a__ from "./render/RenderPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_annotation_AnnotationPlugin_js_7c8c4870__ from "./tools/annotation/AnnotationPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_clip_ClipOverlayPlugin_js_c68a2dce__ from "./tools/clip/ClipOverlayPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_clip_ClipPlugin_js_c6a8da13__ from "./tools/clip/ClipPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_measure_MeasureOverlayPlugin_js_761c285c__ from "./tools/measure/MeasureOverlayPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_measure_MeasurePlugin_js_99feaee5__ from "./tools/measure/MeasurePlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_profile_ProfileOverlayPlugin_js_1ce78c38__ from "./tools/profile/ProfileOverlayPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_profile_ProfilePlugin_js_972839dc__ from "./tools/profile/ProfilePlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_screenBoxSelect_ScreenBoxSelectOverlayPlugin_js_b1f6517b__ from "./tools/screenBoxSelect/ScreenBoxSelectOverlayPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_screenBoxSelect_ScreenBoxSelectPlugin_js_3fa32db5__ from "./tools/screenBoxSelect/ScreenBoxSelectPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_transform_TransformPlugin_js_fffe8c96__ from "./tools/transform/TransformPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_volume_VolumeOverlayPlugin_js_d6af6693__ from "./tools/volume/VolumeOverlayPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_volume_VolumePlugin_js_c3a4f3cf__ from "./tools/volume/VolumePlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__videoRender_VideoRenderPlugin_js_5d51ec98__ from "./videoRender/VideoRenderPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__view_ViewPlugin_js_1d7c8f7c__ from "./view/ViewPlugin.js";
function full(options = {}) {
    return [
        ...(0, __WEBPACK_EXTERNAL_MODULE__corePlugins_js_372fba78__.corePlugins)(options),
        new __WEBPACK_EXTERNAL_MODULE__pointCloud_PointCloudPlugin_js_990ab56b__.PointCloudPlugin({
            withCredentials: options.withCredentials
        }),
        new __WEBPACK_EXTERNAL_MODULE__gsplat_GSplatPlugin_js_830ccb25__.GaussianSplatPlugin({
            withCredentials: options.withCredentials
        }),
        new __WEBPACK_EXTERNAL_MODULE__cad_CadPlugin_js_9d5f0b31__.CadPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_measure_MeasurePlugin_js_99feaee5__.MeasurePlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_clip_ClipPlugin_js_c6a8da13__.ClipPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_profile_ProfilePlugin_js_972839dc__.ProfilePlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_volume_VolumePlugin_js_c3a4f3cf__.VolumePlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_transform_TransformPlugin_js_fffe8c96__.TransformPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_annotation_AnnotationPlugin_js_7c8c4870__.AnnotationPlugin()
    ];
}
function pointCloudOnly(options = {}) {
    return [
        ...(0, __WEBPACK_EXTERNAL_MODULE__corePlugins_js_372fba78__.corePlugins)(options),
        new __WEBPACK_EXTERNAL_MODULE__pointCloud_PointCloudPlugin_js_990ab56b__.PointCloudPlugin({
            withCredentials: options.withCredentials
        })
    ];
}
function pointCloudAndGSplat(options = {}) {
    return [
        ...pointCloudOnly(options),
        new __WEBPACK_EXTERNAL_MODULE__gsplat_GSplatPlugin_js_830ccb25__.GaussianSplatPlugin({
            withCredentials: options.withCredentials
        })
    ];
}
function fullWithOverlays(options = {}) {
    return [
        ...full(options),
        new __WEBPACK_EXTERNAL_MODULE__tools_screenBoxSelect_ScreenBoxSelectPlugin_js_3fa32db5__.ScreenBoxSelectPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_measure_MeasureOverlayPlugin_js_761c285c__.MeasureOverlayPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_clip_ClipOverlayPlugin_js_c68a2dce__.ClipOverlayPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_volume_VolumeOverlayPlugin_js_d6af6693__.VolumeOverlayPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_profile_ProfileOverlayPlugin_js_1ce78c38__.ProfileOverlayPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__tools_screenBoxSelect_ScreenBoxSelectOverlayPlugin_js_b1f6517b__.ScreenBoxSelectOverlayPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__pointCloud_BoundingBoxOverlayPlugin_js_b98b6fa6__.BoundingBoxOverlayPlugin()
    ];
}
function cadOnly(options = {}) {
    return [
        ...(0, __WEBPACK_EXTERNAL_MODULE__corePlugins_js_372fba78__.corePlugins)(options),
        new __WEBPACK_EXTERNAL_MODULE__pointCloud_PointCloudPlugin_js_990ab56b__.PointCloudPlugin({
            withCredentials: options.withCredentials
        }),
        new __WEBPACK_EXTERNAL_MODULE__cad_CadPlugin_js_9d5f0b31__.CadPlugin()
    ];
}
function videoRender(options = {}) {
    return [
        new __WEBPACK_EXTERNAL_MODULE__view_ViewPlugin_js_1d7c8f7c__.ViewPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__camera_CameraPlugin_js_9b61ab70__.CameraPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__render_RenderPlugin_js_b068f66a__.RenderPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__animation_AnimationPlugin_js_6cb38a25__.AnimationPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__picking_PickingPlugin_js_d115ef84__.PickingPlugin(),
        new __WEBPACK_EXTERNAL_MODULE__gsplat_GSplatPlugin_js_830ccb25__.GaussianSplatPlugin({
            withCredentials: options.withCredentials
        }),
        new __WEBPACK_EXTERNAL_MODULE__videoRender_VideoRenderPlugin_js_5d51ec98__.VideoRenderPlugin(),
        ...options.additionalPlugins ?? []
    ];
}
export { cadOnly, full, fullWithOverlays, pointCloudAndGSplat, pointCloudOnly, videoRender };
