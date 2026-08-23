import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_TextStyle_js_0e9055c8__ from "dxf-writer/src/TextStyle.js";
import * as __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__ from "../../CADModule/model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__LineType_js_0e28b229__ from "./LineType.js";
const DXFLineTypes = [
    {
        name: 'CONTINUOUS',
        description: '______',
        elements: []
    },
    {
        name: 'DASHED',
        description: '_ _ _ ',
        elements: [
            1.0,
            -0.5
        ]
    },
    {
        name: 'DASHDOT',
        description: '_ . _ . _',
        elements: [
            1.0,
            -0.25,
            0.0,
            -0.25
        ]
    }
];
const LineTypeMapping = {
    [__WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.LineType.Solid]: 'CONTINUOUS',
    [__WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.LineType.Dash]: 'DASHED',
    [__WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.LineType.DashDot]: 'DASHDOT',
    [__WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.LineType.DoubleDash]: 'DOUBLEDASH',
    default: 'CONTINUOUS'
};
const DimStyleName = 'Standard';
const CADStandardLineWidth = new Set([
    0.0,
    0.05,
    0.09,
    0.13,
    0.15,
    0.18,
    0.2,
    0.25,
    0.3,
    0.35,
    0.4,
    0.5,
    0.53,
    0.6,
    0.7,
    0.8,
    0.9,
    1.0,
    1.06,
    1.2,
    1.4,
    1.58,
    2.0,
    2.11
]);
var constant_rslib_entry_DXFLineWidth = /*#__PURE__*/ function(DXFLineWidth) {
    DXFLineWidth[DXFLineWidth["ByLayer"] = -1] = "ByLayer";
    DXFLineWidth[DXFLineWidth["ByBlock"] = -2] = "ByBlock";
    DXFLineWidth[DXFLineWidth["Default"] = -3] = "Default";
    return DXFLineWidth;
}({});
function getShapeStyle() {
    const shapeStyle = new __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_TextStyle_js_0e9055c8__["default"]('ShapeStyle');
    shapeStyle.fontFileName = 'ltypeshp';
    return shapeStyle;
}
function getComplexLineType(styleHandle) {
    return new __WEBPACK_EXTERNAL_MODULE__LineType_js_0e28b229__["default"]('DOUBLEDASH', '-_-_', [
        {
            length: 0.5,
            tags: (manager)=>{
                manager.push(74, 2);
                manager.push(75, 0);
                manager.push(340, styleHandle);
                manager.push(46, 0.75);
                manager.push(50, 0.0);
                manager.push(44, 0.0);
                manager.push(45, -0.52);
                manager.push(9, '-');
            }
        },
        {
            length: -0.5,
            tags: (manager)=>{
                manager.push(74, 0);
            }
        }
    ]);
}
export { CADStandardLineWidth, DXFLineTypes, constant_rslib_entry_DXFLineWidth as DXFLineWidth, DimStyleName, LineTypeMapping, getComplexLineType, getShapeStyle };
