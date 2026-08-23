import * as __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__ from "../../CADModule/model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_index_js_bc899ffe__ from "../../CADModule/model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__parser_DxfParser_js_92923b91__ from "../../parser/DxfParser.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_ArcUtils_js_0b275f38__ from "../../utils/ArcUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__ from "../../../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__AlignDimension_js_875fd65b__ from "./AlignDimension.js";
import * as __WEBPACK_EXTERNAL_MODULE__Arc_js_31994825__ from "./Arc.js";
import * as __WEBPACK_EXTERNAL_MODULE__angularDimension_js_8df2b6e2__ from "./angularDimension.js";
import * as __WEBPACK_EXTERNAL_MODULE__Block_js_15b06899__ from "./Block.js";
import * as __WEBPACK_EXTERNAL_MODULE__Circle_js_4458d411__ from "./Circle.js";
import * as __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__ from "./constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__DimStyle_js_4a302358__ from "./DimStyle.js";
import * as __WEBPACK_EXTERNAL_MODULE__Drawing_js_84d6af75__ from "./Drawing.js";
import * as __WEBPACK_EXTERNAL_MODULE__DxfImageRegistry_js_ebc92595__ from "./DxfImageRegistry.js";
import * as __WEBPACK_EXTERNAL_MODULE__dimensionUtils_js_8d50462f__ from "./dimensionUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__dxfFrameBuilder_js_3a881268__ from "./dxfFrameBuilder.js";
import * as __WEBPACK_EXTERNAL_MODULE__ellipse_js_e1a15dfc__ from "./ellipse.js";
import * as __WEBPACK_EXTERNAL_MODULE__Line_js_e7993b05__ from "./Line.js";
import * as __WEBPACK_EXTERNAL_MODULE__MText_js_95bd5493__ from "./MText.js";
import * as __WEBPACK_EXTERNAL_MODULE__mLeader_js_ec649f2a__ from "./mLeader.js";
import * as __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__ from "./Polyline.js";
import * as __WEBPACK_EXTERNAL_MODULE__ray_js_05b8ff27__ from "./ray.js";
import * as __WEBPACK_EXTERNAL_MODULE__Spline_js_6878f8a3__ from "./Spline.js";
import * as __WEBPACK_EXTERNAL_MODULE__solid_js_1bfe2d86__ from "./solid.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__.getLoggerManager)().getLogger('cad');
class DxfExporter {
    static export(data, units = 'Meters', scale = 1) {
        const { drawing, entities } = DxfExporter.buildDrawing(data, units, scale);
        DxfExporter.setViewport(drawing, entities, scale);
        return drawing.toDxfString();
    }
    static exportWithFrame(data, frameOptions, units = 'Millimeters', scale = 1000) {
        const { drawing, entities } = DxfExporter.buildDrawing(data, units, scale);
        const bounds = DxfExporter.calculateBounds(entities, scale);
        const [pw, ph] = __WEBPACK_EXTERNAL_MODULE__dxfFrameBuilder_js_3a881268__.FRAME_PAPER_SIZES[frameOptions.paperSize] ?? [
            420,
            297
        ];
        const W = pw * frameOptions.scale;
        const H = ph * frameOptions.scale;
        const s = frameOptions.scale;
        const ml = 25 * s;
        const m = 5 * s;
        const tbWidth = 50 * s;
        const drawableCenterX = (ml + (W - m - tbWidth)) / 2;
        const drawableCenterY = H / 2;
        let frameOriginX = -drawableCenterX;
        let frameOriginY = -drawableCenterY;
        if (bounds) {
            const entityCenterX = (bounds.min.x + bounds.max.x) / 2;
            const entityCenterY = (bounds.min.y + bounds.max.y) / 2;
            frameOriginX = entityCenterX - drawableCenterX;
            frameOriginY = entityCenterY - drawableCenterY;
        }
        const imageArtifacts = __WEBPACK_EXTERNAL_MODULE__dxfFrameBuilder_js_3a881268__.DxfFrameBuilder.generate(drawing, frameOptions, {
            x: frameOriginX,
            y: frameOriginY
        });
        (0, __WEBPACK_EXTERNAL_MODULE__DxfImageRegistry_js_ebc92595__.registerFrameImage)(drawing, imageArtifacts);
        const underlayArtifacts = __WEBPACK_EXTERNAL_MODULE__dxfFrameBuilder_js_3a881268__.DxfFrameBuilder.buildUnderlayImageArtifacts(frameOptions, scale);
        (0, __WEBPACK_EXTERNAL_MODULE__DxfImageRegistry_js_ebc92595__.registerFrameImage)(drawing, underlayArtifacts);
        const frameBounds = {
            min: {
                x: frameOriginX,
                y: frameOriginY
            },
            max: {
                x: frameOriginX + W,
                y: frameOriginY + H
            }
        };
        DxfExporter.setViewport(drawing, entities, scale, frameBounds);
        return drawing.toDxfString();
    }
    static buildDrawing(data, units, scale = 1) {
        const drawing = new __WEBPACK_EXTERNAL_MODULE__Drawing_js_84d6af75__["default"]();
        drawing.setUnits(units);
        drawing.header('ACADVER', [
            [
                1,
                'AC1024'
            ]
        ]);
        drawing.header('PROXYGRAPHICS', [
            [
                70,
                1
            ]
        ]);
        const textStyle = drawing.tables['STYLE'].elements[0];
        drawing.tables?.['DIMSTYLE']?.add(new __WEBPACK_EXTERNAL_MODULE__DimStyle_js_4a302358__["default"](__WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__.DimStyleName, textStyle.handle));
        drawing.lineTypes['DOUBLEDASH'] = (0, __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__.getComplexLineType)(textStyle.handle);
        const { layers = [], entities = [] } = data || {};
        const layerMap = new Map();
        for (const layer of layers)if (!__WEBPACK_EXTERNAL_MODULE__parser_DxfParser_js_92923b91__.IgnoreLayerSet.has(layer.name)) {
            layerMap.set(layer.id, layer);
            drawing.addLayer(layer.name, DxfExporter.colorToACI(layer.color), DxfExporter.getLineTypeName(layer.lineType));
            drawing.layers[layer.name].setTrueColor(layer.color);
        }
        for (const entity of entities){
            const layer = layerMap.get(entity.layerId);
            const layerName = layer?.name ?? '0';
            drawing.setActiveLayer(layerName);
            const shape = DxfExporter.exportEntity(drawing, entity, scale);
            DxfExporter.setShapeBaseData(shape, entity);
        }
        return {
            drawing,
            entities
        };
    }
    static exportEntity(drawing, entity, scale = 1) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Polyline:
                return DxfExporter.exportPolyline(drawing, entity, scale);
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Arc:
                return DxfExporter.exportArc(drawing, entity, scale);
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Circle:
                return DxfExporter.exportCircle(drawing, entity, scale);
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Spline:
                return DxfExporter.exportSpline(drawing, entity, scale);
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Ellipse:
                return DxfExporter.exportEllipse(drawing, entity, scale);
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Ray:
                return DxfExporter.exportRay(drawing, entity, scale);
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.MText:
                return DxfExporter.exportMText(drawing, entity, scale);
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.AlignDimension:
                return DxfExporter.exportAlignDimension(drawing, entity, scale);
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.MLeader:
                return DxfExporter.exportMLeader(drawing, entity, scale);
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.AngularDimension:
                return DxfExporter.exportAngularDimension(drawing, entity, scale);
            default:
                log.warn(`[DxfExporter] Unsupported entity type: ${entity.type}`);
        }
    }
    static exportPolyline(drawing, entity, scale = 1) {
        if (!entity.vertices || 0 === entity.vertices.length) return;
        const shape = new __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__["default"](entity.vertices.map((v)=>[
                v.x * scale,
                v.y * scale,
                v.bulge || 0
            ]), entity.isClosed);
        drawing.activeLayer?.addShape(shape);
        return shape;
    }
    static exportArc(drawing, entity, scale = 1) {
        let startAngleDeg = 180 * entity.startAngle / Math.PI;
        let endAngleDeg = 180 * entity.endAngle / Math.PI;
        if (entity.clockwise) [startAngleDeg, endAngleDeg] = [
            endAngleDeg,
            startAngleDeg
        ];
        const shape = new __WEBPACK_EXTERNAL_MODULE__Arc_js_31994825__["default"](entity.center.x * scale, entity.center.y * scale, entity.radius * scale, startAngleDeg, endAngleDeg);
        drawing.activeLayer?.addShape(shape);
        return shape;
    }
    static exportCircle(drawing, entity, scale = 1) {
        const shape = new __WEBPACK_EXTERNAL_MODULE__Circle_js_4458d411__["default"](entity.center.x * scale, entity.center.y * scale, entity.radius * scale);
        drawing.activeLayer?.addShape(shape);
        return shape;
    }
    static exportSpline(drawing, entity, scale = 1) {
        const shape = new __WEBPACK_EXTERNAL_MODULE__Spline_js_6878f8a3__["default"](entity.controlPoints.map((p)=>[
                p.x * scale,
                p.y * scale
            ]), entity.degree, entity.knots, entity.weights, entity.fitPoints?.map((p)=>[
                p.x * scale,
                p.y * scale
            ]));
        drawing.activeLayer?.addShape(shape);
        return shape;
    }
    static exportEllipse(drawing, entity, scale = 1) {
        const shape = new __WEBPACK_EXTERNAL_MODULE__ellipse_js_e1a15dfc__["default"](entity.center.x * scale, entity.center.y * scale, entity.majorAxisEndPoint.x * scale, entity.majorAxisEndPoint.y * scale, entity.axisRatio, entity.startAngle, entity.endAngle);
        drawing.activeLayer?.addShape(shape);
        return shape;
    }
    static exportRay(drawing, entity, scale = 1) {
        const shape = new __WEBPACK_EXTERNAL_MODULE__ray_js_05b8ff27__["default"]({
            x: entity.startPoint.x * scale,
            y: entity.startPoint.y * scale
        }, {
            x: entity.unitVector.x,
            y: entity.unitVector.y
        });
        drawing.activeLayer?.addShape(shape);
        return shape;
    }
    static exportMText(drawing, entity, scale = 1) {
        const { x, y } = entity.position;
        const rotationDeg = 180 * entity.rotation / Math.PI;
        const shape = new __WEBPACK_EXTERNAL_MODULE__MText_js_95bd5493__["default"](x * scale, y * scale, entity.textHeight * scale, rotationDeg, entity.contents, void 0 !== entity.rectWidth ? entity.rectWidth * scale : entity.rectWidth, entity.attachment);
        drawing.activeLayer?.addShape(shape);
        return shape;
    }
    static exportAlignDimension(drawing, entity, scale = 1) {
        const renderData = __WEBPACK_EXTERNAL_MODULE__dimensionUtils_js_8d50462f__["default"].getAlignedDimensionRenderData(entity, scale);
        const lineType = DxfExporter.getLineTypeName(entity.lineType);
        const lineTypeHandle = drawing.lineTypes[lineType]?.handle;
        const blockName = DxfExporter.createBlockForDimension(drawing, entity, renderData);
        const shape = new __WEBPACK_EXTERNAL_MODULE__AlignDimension_js_875fd65b__["default"](renderData.p1, renderData.p2, renderData.offsetPoint, renderData.textMidPoint, renderData.dimensionText, renderData.textHeight, renderData.textGap, renderData.arrowSize, renderData.hasUserDefinedTextPosition, lineTypeHandle, blockName);
        drawing.activeLayer?.addShape(shape);
        return shape;
    }
    static exportMLeader(drawing, entity, scale = 1) {
        drawing.registerMLeaderEntity();
        const toScaledPoint = (point)=>({
                x: point.x * scale,
                y: point.y * scale
            });
        const branches = entity.branches.map((branch)=>DxfExporter.getMLeaderBranchExportData((0, __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_index_js_bc899ffe__.getMLeaderBranchPoints)(branch).map(toScaledPoint), entity.hasLanding));
        const textStyle = drawing.tables['STYLE'].elements[0];
        const lineTypeName = DxfExporter.getLineTypeName(entity.lineType);
        const textPosition = entity.isTextPositionEdited ? entity.textPosition : DxfExporter.getMLeaderExportTextPosition(entity);
        const textLandingGap = DxfExporter.getMLeaderExportLandingGap(entity, scale);
        const shape = new __WEBPACK_EXTERNAL_MODULE__mLeader_js_ec649f2a__["default"](toScaledPoint(textPosition), entity.textHeight * scale, entity.contents, textLandingGap, entity.hasLanding, branches, drawing.getMLeaderStyleHandle(), textStyle.handle, drawing.lineTypes[lineTypeName]?.handle);
        drawing.activeLayer?.addShape(shape);
        return shape;
    }
    static getMLeaderBranchExportData(points, hasLanding) {
        const fallbackPoint = points[0] ?? {
            x: 0,
            y: 0
        };
        const landingEnd = hasLanding && points.length > 2 ? points[points.length - 1] : void 0;
        const lastLeaderLinePoint = landingEnd ? points[points.length - 2] ?? fallbackPoint : points[points.length - 1] ?? fallbackPoint;
        const leaderLinePoints = landingEnd ? points.slice(0, -2) : points.slice(0, -1);
        const safeLeaderLinePoints = leaderLinePoints.length > 0 ? leaderLinePoints : [
            fallbackPoint
        ];
        const doglegEndPoint = landingEnd ?? lastLeaderLinePoint;
        const dx = doglegEndPoint.x - lastLeaderLinePoint.x;
        const dy = doglegEndPoint.y - lastLeaderLinePoint.y;
        const doglegLength = Math.hypot(dx, dy);
        const doglegVector = doglegLength > 1e-6 ? {
            x: dx / doglegLength,
            y: dy / doglegLength
        } : DxfExporter.getFallbackMLeaderDoglegVector([
            ...safeLeaderLinePoints,
            lastLeaderLinePoint
        ]);
        return {
            points: safeLeaderLinePoints,
            lastLeaderLinePoint,
            doglegVector,
            doglegLength: hasLanding ? Math.max(doglegLength, 1e-6) : 0
        };
    }
    static getFallbackMLeaderDoglegVector(points) {
        const lastPoint = points[points.length - 1];
        const previousPoint = points[points.length - 2];
        if (lastPoint && previousPoint && lastPoint.x < previousPoint.x) return {
            x: -1,
            y: 0
        };
        return {
            x: 1,
            y: 0
        };
    }
    static getMLeaderExportTextPosition(entity) {
        const branch = entity.branches[0];
        const landingEnd = (0, __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_index_js_bc899ffe__.getMLeaderLandingEnd)(branch);
        if (!branch || !landingEnd) return entity.textPosition;
        const landingVector = (0, __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_index_js_bc899ffe__.getMLeaderLandingVector)(branch);
        const textGap = Math.abs(entity.landingGap ?? 0);
        return {
            x: landingEnd.x + landingVector.x * textGap,
            y: landingEnd.y + landingVector.y * textGap
        };
    }
    static getMLeaderExportLandingGap(entity, scale) {
        return Math.abs(entity.landingGap ?? 0) * scale;
    }
    static exportAngularDimension(drawing, entity, scale = 1) {
        const dimensionData = (0, __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_index_js_bc899ffe__.getAngularDimensionData)(entity.line1, entity.line2, entity.arcPoint, entity.textPosition);
        if (!dimensionData) return;
        const blockName = DxfExporter.createBlockForAngularDimension(drawing, entity, dimensionData, scale);
        const toScaledPoint = (point)=>({
                x: point.x * scale,
                y: point.y * scale
            });
        const shape = new __WEBPACK_EXTERNAL_MODULE__angularDimension_js_8df2b6e2__["default"](toScaledPoint(entity.line1.startPoint), toScaledPoint(entity.line1.endPoint), toScaledPoint(entity.line2.startPoint), toScaledPoint(entity.line2.endPoint), toScaledPoint(entity.arcPoint), toScaledPoint(entity.textPosition), entity.dimensionText, entity.isTextPositionEdited, blockName);
        drawing.activeLayer?.addShape(shape);
        return shape;
    }
    static createBlockForAngularDimension(drawing, entity, dimensionData, scale = 1) {
        const blockName = drawing.getAnonDimBlockName();
        const block = new __WEBPACK_EXTERNAL_MODULE__Block_js_15b06899__["default"](blockName, 1);
        drawing.blocks[blockName] = block;
        const layer = drawing.activeLayer;
        const lineType = DxfExporter.getLineTypeName(entity.lineType);
        const lineWidth = DxfExporter.lineWidthToACI(entity.lineWidth);
        const trueColor = entity.colorMethod === __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.ColorMethod.RGB ? entity.color : void 0;
        const applyBaseStyle = (shape)=>{
            shape.layer = layer;
            shape.lineType = lineType;
            shape.lineWidth = lineWidth;
            if (void 0 !== trueColor) shape.trueColor = trueColor;
        };
        const startAngleDeg = 180 * dimensionData.startAngle / Math.PI;
        const endAngleDeg = 180 * dimensionData.endAngle / Math.PI;
        const toScaledPoint = (point)=>({
                x: point.x * scale,
                y: point.y * scale
            });
        const addLegLine = (startPoint, endPoint)=>{
            const line = new __WEBPACK_EXTERNAL_MODULE__Line_js_e7993b05__["default"](startPoint, endPoint);
            applyBaseStyle(line);
            block.addShape(line);
        };
        const legLines = (0, __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_index_js_bc899ffe__.getAngularDimensionLegLines)(entity, dimensionData);
        for (const line of legLines)addLegLine(toScaledPoint(line.startPoint), toScaledPoint(line.endPoint));
        const arc = new __WEBPACK_EXTERNAL_MODULE__Arc_js_31994825__["default"](dimensionData.intersection.x * scale, dimensionData.intersection.y * scale, dimensionData.radius * scale, startAngleDeg, endAngleDeg);
        applyBaseStyle(arc);
        block.addShape(arc);
        const textHeight = (entity.textHeight ?? 2.5) * scale;
        const displayText = entity.dimensionText || `${dimensionData.angleDegrees.toFixed(2)}°`;
        const text = new __WEBPACK_EXTERNAL_MODULE__MText_js_95bd5493__["default"](entity.textPosition.x * scale, entity.textPosition.y * scale, textHeight, 0, displayText, Math.max(2 * textHeight, displayText.length * textHeight), 5);
        applyBaseStyle(text);
        block.addShape(text);
        return blockName;
    }
    static createBlockForDimension(drawing, entity, renderData) {
        const blockName = drawing.getAnonDimBlockName();
        const block = new __WEBPACK_EXTERNAL_MODULE__Block_js_15b06899__["default"](blockName, 1);
        drawing.blocks[blockName] = block;
        const { d1, d2, e1_start, e1_end, e2_start, e2_end, ux, uy, displayText, textHeight, textMidPoint, textRotationDeg, arrowSize } = renderData;
        const layer = drawing.activeLayer;
        const addSeg = (a, b)=>{
            const seg = new __WEBPACK_EXTERNAL_MODULE__Line_js_e7993b05__["default"](a, b);
            seg.layer = layer;
            DxfExporter.setShapeBaseData(seg, entity);
            block.addShape(seg);
        };
        const addSolid = (sp1, sp2, sp3)=>{
            const solid = new __WEBPACK_EXTERNAL_MODULE__solid_js_1bfe2d86__["default"](sp1, sp2, sp3);
            solid.layer = layer;
            DxfExporter.setShapeBaseData(solid, entity);
            block.addShape(solid);
        };
        addSeg(e1_start, e1_end);
        addSeg(e2_start, e2_end);
        addSeg(d1, d2);
        const arrowHalfWidth = arrowSize / 6;
        const addArrow = (tip, dirX, dirY)=>{
            const tailCenterX = tip.x + dirX * arrowSize;
            const tailCenterY = tip.y + dirY * arrowSize;
            const perpX = -dirY;
            const perpY = dirX;
            addSolid(tip, {
                x: tailCenterX + perpX * arrowHalfWidth,
                y: tailCenterY + perpY * arrowHalfWidth
            }, {
                x: tailCenterX - perpX * arrowHalfWidth,
                y: tailCenterY - perpY * arrowHalfWidth
            });
        };
        addArrow(d1, ux, uy);
        addArrow(d2, -ux, -uy);
        const text = new __WEBPACK_EXTERNAL_MODULE__MText_js_95bd5493__["default"](textMidPoint.x, textMidPoint.y, textHeight, textRotationDeg, displayText, Math.max(2 * textHeight, displayText.length * textHeight), 5);
        text.layer = layer;
        DxfExporter.setShapeBaseData(text, entity);
        block.addShape(text);
        return blockName;
    }
    static colorToACI(color) {
        const aci = __WEBPACK_EXTERNAL_MODULE__Drawing_js_84d6af75__["default"].ACI ?? {
            RED: 1,
            YELLOW: 2,
            GREEN: 3,
            CYAN: 4,
            BLUE: 5,
            MAGENTA: 6,
            WHITE: 7
        };
        const map = {
            16711680: aci.RED,
            65280: aci.GREEN,
            255: aci.BLUE,
            65535: aci.CYAN,
            16711935: aci.MAGENTA,
            16776960: aci.YELLOW,
            16777215: aci.WHITE
        };
        return map[color] ?? aci.WHITE;
    }
    static getLineTypeName(lineType) {
        return __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__.LineTypeMapping[lineType] || __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__.LineTypeMapping["default"];
    }
    static lineWidthToACI(lineWidth) {
        return __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__.CADStandardLineWidth.has(lineWidth) ? 100 * lineWidth : __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__.DXFLineWidth.ByLayer;
    }
    static setShapeBaseData(shape, entity) {
        if (!shape) return;
        shape.lineType = DxfExporter.getLineTypeName(entity.lineType);
        shape.lineWidth = DxfExporter.lineWidthToACI(entity.lineWidth);
        if (entity.colorMethod === __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.ColorMethod.RGB) shape.trueColor = entity.color;
    }
    static calculateBounds(entities, scale = 1) {
        if (!entities || 0 === entities.length) return null;
        let minX = 1 / 0;
        let minY = 1 / 0;
        let maxX = -1 / 0;
        let maxY = -1 / 0;
        const updateBounds = (x, y)=>{
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        };
        for (const entity of entities)switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Polyline:
                {
                    const polyline = entity;
                    polyline.vertices?.forEach((v)=>updateBounds(v.x, v.y));
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Arc:
                DxfExporter.updateArcBounds(entity, updateBounds);
                break;
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Circle:
                {
                    const { center, radius } = entity;
                    updateBounds(center.x - radius, center.y - radius);
                    updateBounds(center.x + radius, center.y + radius);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Spline:
                {
                    const spline = entity;
                    spline.controlPoints?.forEach((p)=>updateBounds(p.x, p.y));
                    spline.fitPoints?.forEach((p)=>updateBounds(p.x, p.y));
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Ellipse:
                {
                    const ellipse = entity;
                    const rotation = ellipse.rotation;
                    const radiusX = ellipse.radiusX;
                    const radiusY = ellipse.radiusY;
                    const halfWidth = Math.sqrt((radiusX * Math.cos(rotation)) ** 2 + (radiusY * Math.sin(rotation)) ** 2);
                    const halfHeight = Math.sqrt((radiusX * Math.sin(rotation)) ** 2 + (radiusY * Math.cos(rotation)) ** 2);
                    updateBounds(ellipse.center.x - halfWidth, ellipse.center.y - halfHeight);
                    updateBounds(ellipse.center.x + halfWidth, ellipse.center.y + halfHeight);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.Ray:
                {
                    const ray = entity;
                    updateBounds(ray.startPoint.x, ray.startPoint.y);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.MText:
                {
                    const mtext = entity;
                    updateBounds(mtext.position.x, mtext.position.y);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.MLeader:
                {
                    const leader = entity;
                    updateBounds(leader.textPosition.x, leader.textPosition.y);
                    leader.branches.forEach((branch)=>{
                        updateBounds(branch.arrowPoint.x, branch.arrowPoint.y);
                        branch.vertices.forEach((vertex)=>updateBounds(vertex.x, vertex.y));
                    });
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.AlignDimension:
                {
                    const dim = entity;
                    updateBounds(dim.p1.x, dim.p1.y);
                    updateBounds(dim.p2.x, dim.p2.y);
                    updateBounds(dim.offsetPoint.x, dim.offsetPoint.y);
                    updateBounds(dim.textPosition.x, dim.textPosition.y);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__CADModule_model_common_constant_js_f6813cb4__.EntityType.AngularDimension:
                {
                    const dim = entity;
                    const dimensionData = (0, __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_index_js_bc899ffe__.getAngularDimensionData)(dim.line1, dim.line2, dim.arcPoint, dim.textPosition);
                    if (!dimensionData) break;
                    const legLines = (0, __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_index_js_bc899ffe__.getAngularDimensionLegLines)(dim, dimensionData);
                    updateBounds(dimensionData.intersection.x, dimensionData.intersection.y);
                    updateBounds(dimensionData.arcStart.x, dimensionData.arcStart.y);
                    updateBounds(dimensionData.arcEnd.x, dimensionData.arcEnd.y);
                    legLines.forEach((line)=>{
                        updateBounds(line.startPoint.x, line.startPoint.y);
                        updateBounds(line.endPoint.x, line.endPoint.y);
                    });
                    updateBounds(dim.arcPoint.x, dim.arcPoint.y);
                    updateBounds(dim.textPosition.x, dim.textPosition.y);
                    break;
                }
        }
        if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) return null;
        const finalScale = scale <= 0 ? 1 : scale;
        return {
            min: {
                x: minX * finalScale,
                y: minY * finalScale
            },
            max: {
                x: maxX * finalScale,
                y: maxY * finalScale
            }
        };
    }
    static updateArcBounds(arc, updateBounds) {
        const { center, radius, startAngle, endAngle } = arc;
        if (!Number.isFinite(center.x) || !Number.isFinite(center.y) || !Number.isFinite(radius) || radius < 0) return;
        const updatePointAtAngle = (angle)=>{
            updateBounds(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));
        };
        updatePointAtAngle(startAngle);
        updatePointAtAngle(endAngle);
        const cardinalAngles = [
            0,
            Math.PI / 2,
            Math.PI,
            3 * Math.PI / 2
        ];
        for (const angle of cardinalAngles)if (DxfExporter.isAngleOnArc(angle, arc)) updatePointAtAngle(angle);
    }
    static isAngleOnArc(angle, arc) {
        const sweepAngle = __WEBPACK_EXTERNAL_MODULE__utils_ArcUtils_js_0b275f38__.ArcUtils.getSweepAngle(arc.startAngle, arc.endAngle, arc.clockwise);
        if (sweepAngle >= 2 * Math.PI - Number.EPSILON) return true;
        const distanceFromStart = arc.clockwise ? DxfExporter.normalizePositiveAngle(arc.startAngle - angle) : DxfExporter.normalizePositiveAngle(angle - arc.startAngle);
        return distanceFromStart <= sweepAngle + Number.EPSILON;
    }
    static normalizePositiveAngle(angle) {
        const tau = 2 * Math.PI;
        const normalized = angle % tau;
        return normalized < 0 ? normalized + tau : normalized;
    }
    static setViewport(drawing, entities, scale = 1, overrideBounds) {
        const activeVport = drawing.tables?.['VPORT']?.elements?.find((ele)=>'*ACTIVE' === ele.name);
        if (!activeVport) return;
        const bounds = overrideBounds ?? DxfExporter.calculateBounds(entities, scale);
        if (!bounds) return;
        const aspectRatio = 16 / 9;
        const deltaX = bounds.max.x - bounds.min.x;
        const deltaY = bounds.max.y - bounds.min.y;
        activeVport.height = 1.2 * Math.max(deltaX / aspectRatio, deltaY);
        const originalTags = activeVport.tags.bind(activeVport);
        activeVport.tags = (manager)=>{
            originalTags(manager);
            manager.point(0, 0);
            manager.push(11, 1);
            manager.push(21, 1);
            manager.push(12, (bounds.max.x + bounds.min.x) / 2);
            manager.push(22, (bounds.max.y + bounds.min.y) / 2);
            manager.push(41, aspectRatio);
            manager.push(45, activeVport.height);
        };
    }
    static downloadDxf(filename, content) {
        const blob = new Blob([
            content
        ], {
            type: 'application/dxf'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.endsWith('.dxf') ? filename : `${filename}.dxf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
export { DxfExporter };
