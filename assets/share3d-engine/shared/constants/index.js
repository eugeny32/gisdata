import * as __WEBPACK_EXTERNAL_MODULE__KeyCodes_js_9a9a53e4__ from "./KeyCodes.js";
var constants_rslib_entry_ClipTask = /*#__PURE__*/ function(ClipTask) {
    ClipTask[ClipTask["NONE"] = 0] = "NONE";
    ClipTask[ClipTask["HIGHLIGHT"] = 1] = "HIGHLIGHT";
    ClipTask[ClipTask["SHOW_INSIDE"] = 2] = "SHOW_INSIDE";
    ClipTask[ClipTask["SHOW_OUTSIDE"] = 3] = "SHOW_OUTSIDE";
    return ClipTask;
}({});
var constants_rslib_entry_ClipMethod = /*#__PURE__*/ function(ClipMethod) {
    ClipMethod[ClipMethod["INSIDE_ANY"] = 0] = "INSIDE_ANY";
    ClipMethod[ClipMethod["INSIDE_ALL"] = 1] = "INSIDE_ALL";
    return ClipMethod;
}({});
var constants_rslib_entry_PointSizeType = /*#__PURE__*/ function(PointSizeType) {
    PointSizeType[PointSizeType["FIXED"] = 0] = "FIXED";
    PointSizeType[PointSizeType["ATTENUATED"] = 1] = "ATTENUATED";
    PointSizeType[PointSizeType["ADAPTIVE"] = 2] = "ADAPTIVE";
    return PointSizeType;
}({});
var constants_rslib_entry_PointShape = /*#__PURE__*/ function(PointShape) {
    PointShape[PointShape["SQUARE"] = 0] = "SQUARE";
    PointShape[PointShape["CIRCLE"] = 1] = "CIRCLE";
    PointShape[PointShape["PARABOLOID"] = 2] = "PARABOLOID";
    return PointShape;
}({});
const ElevationGradientRepeat = {
    CLAMP: 0,
    REPEAT: 1,
    MIRRORED_REPEAT: 2
};
const TreeType = {
    OCTREE: 0,
    KDTREE: 1
};
const DEFAULT_POINT_BUDGET = 2000000;
const DEFAULT_MAX_NODES_LOADING = 4;
const DEFAULT_MIN_NODE_SIZE = 30;
const ClipPolygonMaxVerticeCount = 100;
const DEFAULT_MAX_CONCURRENT_LOADS = 4;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_MAX_PICK_RESULTS = 100;
const DEFAULT_PICK_BUFFER_SIZE = 512;
const DEFAULT_PICK_ALPHA_CLIP = 0.3;
const DEFAULT_PICK_THRESHOLD = 1.0;
const DEFAULT_CENTERS_PICK_POINT_SIZE = 2.0;
const DEFAULT_RECT_PICK_MAX_RESULTS = 10000;
const DEFAULT_PICK_WINDOW_SIZE = 65;
const CAMERA_MIN_DISTANCE = 0.001;
const CAMERA_NEAR_TARGET_RATIO = 0.01;
const CAMERA_NEAR_BOUNDS_RATIO = 0.5;
const CAMERA_FAR_PADDING_RATIO = 0.25;
const CAMERA_DEFAULT_NEAR = 0.1;
const CAMERA_DEFAULT_FAR = 10000;
const ORTHOGRAPHIC_EQUIVALENT_FOV_USER_DATA_KEY = 'share3dEquivalentPerspectiveFov';
const CAMERA_FIT_PADDING = 1.2;
const CONTROL_DAMPING_FACTOR = 0.1;
const FIRST_PERSON_MOVEMENT_SPEED = 10;
const FIRST_PERSON_LOOK_SPEED = 0.005;
const GSPLAT_SORT_POSITION_THRESHOLD = 0.01;
const GSPLAT_SORT_DIRECTION_THRESHOLD = 0.0001;
const GSPLAT_SH_DIRECTION_THRESHOLD = 1e-3;
const GSPLAT_DEFAULT_BIN_COUNT = 256;
const GSPLAT_LOG_SCALE_DIVISOR = 1000000;
const EPSILON = 1e-6;
const EPSILON_HIGH = 1e-10;
const EPSILON_ULTRA = 1e-12;
const DEFAULT_UNPROJECT_Z = 0.5;
var __webpack_exports__KeyCodes = __WEBPACK_EXTERNAL_MODULE__KeyCodes_js_9a9a53e4__.KeyCodes;
export { CAMERA_DEFAULT_FAR, CAMERA_DEFAULT_NEAR, CAMERA_FAR_PADDING_RATIO, CAMERA_FIT_PADDING, CAMERA_MIN_DISTANCE, CAMERA_NEAR_BOUNDS_RATIO, CAMERA_NEAR_TARGET_RATIO, CONTROL_DAMPING_FACTOR, constants_rslib_entry_ClipMethod as ClipMethod, ClipPolygonMaxVerticeCount, constants_rslib_entry_ClipTask as ClipTask, DEFAULT_CENTERS_PICK_POINT_SIZE, DEFAULT_MAX_CONCURRENT_LOADS, DEFAULT_MAX_NODES_LOADING, DEFAULT_MAX_PICK_RESULTS, DEFAULT_MAX_RETRIES, DEFAULT_MIN_NODE_SIZE, DEFAULT_PICK_ALPHA_CLIP, DEFAULT_PICK_BUFFER_SIZE, DEFAULT_PICK_THRESHOLD, DEFAULT_PICK_WINDOW_SIZE, DEFAULT_POINT_BUDGET, DEFAULT_RECT_PICK_MAX_RESULTS, DEFAULT_UNPROJECT_Z, EPSILON, EPSILON_HIGH, EPSILON_ULTRA, ElevationGradientRepeat, FIRST_PERSON_LOOK_SPEED, FIRST_PERSON_MOVEMENT_SPEED, GSPLAT_DEFAULT_BIN_COUNT, GSPLAT_LOG_SCALE_DIVISOR, GSPLAT_SH_DIRECTION_THRESHOLD, GSPLAT_SORT_DIRECTION_THRESHOLD, GSPLAT_SORT_POSITION_THRESHOLD, ORTHOGRAPHIC_EQUIVALENT_FOV_USER_DATA_KEY, constants_rslib_entry_PointShape as PointShape, constants_rslib_entry_PointSizeType as PointSizeType, TreeType, __webpack_exports__KeyCodes as KeyCodes };
