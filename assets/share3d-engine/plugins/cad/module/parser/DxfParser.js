import * as __WEBPACK_EXTERNAL_MODULE_dxf_parser_c7a58088__ from "dxf-parser";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__ from "../CADModule/model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_index_js_5347706f__ from "../CADModule/model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__CADModule_model_layer_Layer_js_40382540__ from "../CADModule/model/layer/Layer.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_19e54b99__ from "../../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__entities_mLeader_js_cf272c9d__ from "./entities/mLeader.js";
import * as __WEBPACK_EXTERNAL_MODULE__entities_ray_js_07d4c1c6__ from "./entities/ray.js";
import * as __WEBPACK_EXTERNAL_MODULE__entities_spline_js_b684ed63__ from "./entities/spline.js";
function stripMTextFormatting(text) {
    return text.replace(/\{\\f[^;]*;([^}]*)}/g, '$1').replace(/\{\\[A-Za-z][^;]*;([^}]*)}/g, '$1').replace(/\\[LOKlok]/g, '').replace(/\\[Cc]\d+;/g, '').replace(/\\[Hh][\d.]+x?;/g, '').replace(/\\[Ww][\d.]+;/g, '').replace(/\\[Qq][\d.]+;/g, '').replace(/\\[Tt][\d.]+;/g, '').replace(/\\[Aa]\d;/g, '').replace(/\\P/gi, '\n').replace(/[{}]/g, '').replace(/\\\\/g, '\\').trim();
}
const EntityTypeMapping = {
    LINE: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Polyline,
    POLYLINE: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Polyline,
    LWPOLYLINE: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Polyline,
    ARC: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Arc,
    CIRCLE: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Circle,
    SPLINE: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Spline,
    ELLIPSE: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Ellipse,
    RAY: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Ray,
    TEXT: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.MText,
    MTEXT: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.MText,
    MLEADER: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.MLeader,
    MULTILEADER: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.MLeader
};
const DXF_LINE_TYPE_MAPPING = {
    CONTINUOUS: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.LineType.Solid,
    DASHED: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.LineType.Dash,
    DASHDOT: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.LineType.DashDot,
    DOUBLEDASH: __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.LineType.DoubleDash
};
function parseLineType(lineType) {
    if (!lineType) return;
    const normalized = lineType.toUpperCase();
    if ('BYLAYER' === normalized || 'BYBLOCK' === normalized) return;
    return DXF_LINE_TYPE_MAPPING[normalized] ?? __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.LineType.Solid;
}
function parseLineWidth(lineweight) {
    if (void 0 === lineweight || lineweight < 0) return;
    return lineweight / 100;
}
function normalizeVector(point) {
    if (!point) return null;
    const length = Math.hypot(point.x || 0, point.y || 0);
    if (length < 1e-12) return null;
    return {
        x: (point.x || 0) / length,
        y: (point.y || 0) / length
    };
}
function getDimensionBaseType(dimensionType = 0) {
    return 0x0f & dimensionType;
}
const IgnoreLayerSet = new Set([
    'Defpoints'
]);
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_19e54b99__.getLoggerManager)().getLogger('cad');
class DxfParser {
    static parse(data) {
        const parser = new __WEBPACK_EXTERNAL_MODULE_dxf_parser_c7a58088__["default"]();
        parser.registerEntityHandler(__WEBPACK_EXTERNAL_MODULE__entities_spline_js_b684ed63__["default"]);
        parser.registerEntityHandler(__WEBPACK_EXTERNAL_MODULE__entities_ray_js_07d4c1c6__["default"]);
        parser.registerEntityHandler(__WEBPACK_EXTERNAL_MODULE__entities_mLeader_js_cf272c9d__["default"]);
        parser.registerEntityHandler(__WEBPACK_EXTERNAL_MODULE__entities_mLeader_js_cf272c9d__.MultiLeaderEntityParser);
        const dxf = parser.parse(data);
        return dxf ? DxfParser.parseDxf(dxf) : null;
    }
    static parseDxf(dxf) {
        const result = {
            layers: [],
            entities: []
        };
        const dxfLayers = dxf.tables.layer.layers;
        const layerMap = new Map();
        for(const layerName in dxfLayers){
            const layer = DxfParser.parseLayer(dxfLayers[layerName]);
            layerMap.set(layer.name, layer);
        }
        const defaultLayer = layerMap.entries().next().value?.[1];
        for (const dxfEntity of dxf.entities || []){
            const entity = DxfParser.parseEntity(dxfEntity, dxf);
            if (!entity) continue;
            const layer = layerMap.get(dxfEntity.layer) || defaultLayer;
            Object.assign(entity, DxfParser.getEntityBaseData(dxfEntity, layer));
            result.entities.push(entity);
        }
        result.layers = Array.from(layerMap.values());
        return result;
    }
    static parseLayer(dxfLayer) {
        return new __WEBPACK_EXTERNAL_MODULE__CADModule_model_layer_Layer_js_40382540__.Layer({
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            name: dxfLayer.name,
            color: dxfLayer.color,
            visible: dxfLayer.visible
        });
    }
    static parseEntity(dxfEntity, dxf) {
        let entityType = EntityTypeMapping[dxfEntity.type];
        if ('DIMENSION' === dxfEntity.type) entityType = DxfParser.getDimensionEntityType(dxfEntity);
        let entityData;
        switch(entityType){
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Polyline:
                {
                    const { vertices, shape = false } = dxfEntity;
                    const data = {
                        vertices: vertices?.map((vertex)=>({
                                x: vertex.x,
                                y: vertex.y,
                                bulge: vertex.bulge || 0
                            })) || [],
                        isClosed: !!shape
                    };
                    if (data.vertices && data.vertices.length >= 2) entityData = data;
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Arc:
                {
                    const { center, radius, startAngle, endAngle } = dxfEntity;
                    entityData = {
                        center: {
                            x: center.x,
                            y: center.y
                        },
                        radius,
                        startAngle,
                        endAngle,
                        clockwise: false
                    };
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Circle:
                {
                    const { center, radius } = dxfEntity;
                    entityData = {
                        center: {
                            x: center.x,
                            y: center.y
                        },
                        radius
                    };
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Spline:
                {
                    const splineEntity = dxfEntity;
                    const data = {
                        controlPoints: splineEntity.controlPoints?.map((point)=>({
                                x: point.x,
                                y: point.y
                            })) || [],
                        fitPoints: splineEntity.fitPoints?.map((point)=>({
                                x: point.x,
                                y: point.y
                            })),
                        knots: splineEntity.knotValues,
                        weights: splineEntity.weights,
                        isClosed: splineEntity.closed,
                        degree: splineEntity.degreeOfSplineCurve,
                        method: splineEntity.fitPoints?.length ? 'FIT' : 'CV',
                        startTangent: splineEntity.startTangent ? {
                            x: splineEntity.startTangent.x,
                            y: splineEntity.startTangent.y
                        } : void 0,
                        endTangent: splineEntity.endTangent ? {
                            x: splineEntity.endTangent.x,
                            y: splineEntity.endTangent.y
                        } : void 0
                    };
                    if (data.controlPoints && data.controlPoints.length >= 2) entityData = data;
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Ellipse:
                {
                    const { center, majorAxisEndPoint, axisRatio, startAngle, endAngle } = dxfEntity;
                    entityData = {
                        center: {
                            x: center.x,
                            y: center.y
                        },
                        majorAxisEndPoint: {
                            x: majorAxisEndPoint.x,
                            y: majorAxisEndPoint.y
                        },
                        axisRatio,
                        startAngle,
                        endAngle,
                        clockwise: false
                    };
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.Ray:
                {
                    const { startPoint, unitVector } = dxfEntity;
                    const direction = normalizeVector(unitVector);
                    if (!startPoint || !direction) break;
                    entityData = {
                        startPoint: {
                            x: startPoint.x,
                            y: startPoint.y
                        },
                        unitVector: direction
                    };
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.MText:
                if ('TEXT' === dxfEntity.type) {
                    const { startPoint, text, textHeight, rotation } = dxfEntity;
                    const contents = stripMTextFormatting(text);
                    if (contents) entityData = {
                        position: {
                            x: startPoint.x,
                            y: startPoint.y
                        },
                        contents,
                        textHeight,
                        rotation: rotation ? rotation * Math.PI / 180 : 0
                    };
                } else {
                    const { position, text, height, width, rotation, attachmentPoint } = dxfEntity;
                    const contents = stripMTextFormatting(text);
                    if (contents) entityData = {
                        position: {
                            x: position.x,
                            y: position.y
                        },
                        contents,
                        textHeight: height,
                        rectWidth: width,
                        rectHeight: height,
                        rotation: rotation ? rotation * Math.PI / 180 : 0,
                        attachment: attachmentPoint || 1
                    };
                }
                break;
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.AlignDimension:
                {
                    const { linearOrAngularPoint1, linearOrAngularPoint2, anchorPoint, middleOfText, text } = dxfEntity;
                    const dimTextHeight = DxfParser.getDimTextHeight(dxfEntity.block, dxf.blocks);
                    entityData = {
                        p1: {
                            x: linearOrAngularPoint1.x,
                            y: linearOrAngularPoint1.y
                        },
                        p2: {
                            x: linearOrAngularPoint2.x,
                            y: linearOrAngularPoint2.y
                        },
                        offsetPoint: {
                            x: anchorPoint.x,
                            y: anchorPoint.y
                        },
                        textPosition: {
                            x: middleOfText.x,
                            y: middleOfText.y
                        },
                        dimensionText: text ? stripMTextFormatting(text) : '',
                        isTextPositionEdited: !!middleOfText,
                        ...void 0 !== dimTextHeight && {
                            textHeight: dimTextHeight
                        }
                    };
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.AngularDimension:
                entityData = DxfParser.parseAngularDimension(dxfEntity, dxf);
                break;
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.MLeader:
                entityData = DxfParser.parseMLeader(dxfEntity);
                break;
            default:
                log.warn(`Unsupported DXF entity type: ${dxfEntity.type}`);
        }
        if (!entityData || !entityType) return null;
        return __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_index_js_5347706f__.EntityFactory.createEntity({
            ...entityData,
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            type: entityType
        });
    }
    static parseAngularDimension(dxfEntity, dxf) {
        const baseType = getDimensionBaseType(dxfEntity.dimensionType);
        const dimTextHeight = DxfParser.getDimTextHeight(dxfEntity.block, dxf.blocks);
        const dimensionText = dxfEntity.text ? stripMTextFormatting(dxfEntity.text) : '';
        if (5 === baseType) {
            const intersection = dxfEntity.diameterOrRadiusPoint;
            const p1 = dxfEntity.linearOrAngularPoint1;
            const p2 = dxfEntity.linearOrAngularPoint2;
            const arcPoint = dxfEntity.anchorPoint;
            if (!intersection || !p1 || !p2 || !arcPoint) return;
            return {
                line1: {
                    startPoint: {
                        x: intersection.x,
                        y: intersection.y
                    },
                    endPoint: {
                        x: p1.x,
                        y: p1.y
                    }
                },
                line2: {
                    startPoint: {
                        x: intersection.x,
                        y: intersection.y
                    },
                    endPoint: {
                        x: p2.x,
                        y: p2.y
                    }
                },
                arcPoint: {
                    x: arcPoint.x,
                    y: arcPoint.y
                },
                textPosition: dxfEntity.middleOfText ? {
                    x: dxfEntity.middleOfText.x,
                    y: dxfEntity.middleOfText.y
                } : {
                    x: arcPoint.x,
                    y: arcPoint.y
                },
                dimensionText,
                isTextPositionEdited: !!dxfEntity.middleOfText,
                ...void 0 !== dimTextHeight && {
                    textHeight: dimTextHeight
                }
            };
        }
        const line1Start = dxfEntity.linearOrAngularPoint1;
        const line1End = dxfEntity.linearOrAngularPoint2;
        const line2Start = dxfEntity.anchorPoint;
        const line2End = dxfEntity.diameterOrRadiusPoint;
        const arcPoint = dxfEntity.arcPoint || dxfEntity.anchorPoint;
        if (!line1Start || !line1End || !line2Start || !line2End || !arcPoint) return;
        return {
            line1: {
                startPoint: {
                    x: line1Start.x,
                    y: line1Start.y
                },
                endPoint: {
                    x: line1End.x,
                    y: line1End.y
                }
            },
            line2: {
                startPoint: {
                    x: line2Start.x,
                    y: line2Start.y
                },
                endPoint: {
                    x: line2End.x,
                    y: line2End.y
                }
            },
            arcPoint: {
                x: arcPoint.x,
                y: arcPoint.y
            },
            textPosition: dxfEntity.middleOfText ? {
                x: dxfEntity.middleOfText.x,
                y: dxfEntity.middleOfText.y
            } : {
                x: arcPoint.x,
                y: arcPoint.y
            },
            dimensionText,
            isTextPositionEdited: !!dxfEntity.middleOfText,
            ...void 0 !== dimTextHeight && {
                textHeight: dimTextHeight
            }
        };
    }
    static parseMLeader(dxfEntity) {
        const contents = stripMTextFormatting(dxfEntity.contents || '');
        const branches = (dxfEntity.branches || []).filter((branch)=>branch.arrowPoint && (branch.vertices?.length || branch.elbowPoint)).map((branch)=>{
            const vertices = branch.vertices?.length ? branch.vertices : [
                branch.elbowPoint,
                ...branch.landingEndPoint ? [
                    branch.landingEndPoint
                ] : []
            ];
            return {
                arrowPoint: {
                    x: branch.arrowPoint.x,
                    y: branch.arrowPoint.y
                },
                vertices: vertices.map((vertex)=>({
                        x: vertex.x,
                        y: vertex.y
                    }))
            };
        });
        if (0 === branches.length || !contents) return;
        const primaryBranch = branches[0];
        const fallbackTextPosition = primaryBranch.vertices[primaryBranch.vertices.length - 1] || primaryBranch.arrowPoint;
        return {
            branches,
            textPosition: dxfEntity.textPosition ? {
                x: dxfEntity.textPosition.x,
                y: dxfEntity.textPosition.y
            } : {
                x: fallbackTextPosition.x,
                y: fallbackTextPosition.y
            },
            contents,
            textHeight: dxfEntity.textHeight ?? 2.5,
            landingGap: dxfEntity.landingGap ?? 2.5,
            hasLanding: dxfEntity.hasLanding ?? true,
            isTextPositionEdited: !!dxfEntity.textPosition
        };
    }
    static getDimensionEntityType(dxfEntity) {
        const baseType = getDimensionBaseType(dxfEntity.dimensionType);
        if (2 === baseType || 5 === baseType) return __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.AngularDimension;
        return __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.EntityType.AlignDimension;
    }
    static getEntityBaseData(dxfEntity, layer) {
        const lineType = parseLineType(dxfEntity.lineType) ?? layer?.lineType ?? __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.LineType.Solid;
        const lineWidth = parseLineWidth(dxfEntity.lineweight) ?? layer?.lineWidth ?? 0.25;
        let colorMethod = __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.ColorMethod.BY_LAYER;
        let color = layer?.color ?? dxfEntity.color ?? 0xffffff;
        if (0 === dxfEntity.colorIndex) {
            colorMethod = __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.ColorMethod.BY_BLOCK;
            color = dxfEntity.color ?? color;
        } else if (256 !== dxfEntity.colorIndex && void 0 !== dxfEntity.color) {
            colorMethod = __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_a1c9f1e7__.ColorMethod.RGB;
            color = dxfEntity.color;
        }
        return {
            layerId: layer?.id || '',
            colorMethod,
            color,
            lineType,
            lineWidth
        };
    }
    static getDimTextHeight(blockName, blocks) {
        if (!blockName) return;
        const block = blocks[blockName];
        if (!block) return;
        const mtext = block.entities.find((entity)=>'MTEXT' === entity.type);
        return mtext?.height;
    }
}
export { DxfParser, IgnoreLayerSet };
