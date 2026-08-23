import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
import * as __WEBPACK_EXTERNAL_MODULE__Block_js_15b06899__ from "./Block.js";
import * as __WEBPACK_EXTERNAL_MODULE__MText_js_95bd5493__ from "./MText.js";
import * as __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__ from "./Polyline.js";
function toMTextUnicode(str) {
    if (!str) return '';
    return Array.from(str, (char)=>{
        const codePoint = char.charCodeAt(0);
        return codePoint <= 0x7f ? char : `\\U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
    }).join('');
}
function wrapMText(text, maxWidth, charHeight) {
    if (!text) return text;
    const getCharWidth = (ch)=>ch.charCodeAt(0) > 0x7f ? charHeight : 0.9 * charHeight;
    const lines = [];
    let line = '';
    let lineWidth = 0;
    for (const ch of text){
        const cw = getCharWidth(ch);
        if (lineWidth + cw > maxWidth && line.length > 0) {
            lines.push(line);
            line = ch;
            lineWidth = cw;
        } else {
            line += ch;
            lineWidth += cw;
        }
    }
    if (line) lines.push(line);
    return lines.join('\n');
}
const FRAME_PAPER_SIZES = {
    A1: [
        840,
        594
    ],
    A2: [
        594,
        420
    ],
    A3: [
        420,
        297
    ],
    A4: [
        297,
        210
    ]
};
class Insert extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(blockName, x, y, xScale = 1, yScale = 1, rotation = 0){
        super([
            'AcDbEntity',
            'AcDbBlockReference'
        ]), this.blockName = blockName, this.x = x, this.y = y, this.xScale = xScale, this.yScale = yScale, this.rotation = rotation;
    }
    tags(manager) {
        manager.push(0, 'INSERT');
        super.tags(manager);
        manager.push(8, this.layer.name);
        manager.push(2, this.blockName);
        manager.push(10, this.x);
        manager.push(20, this.y);
        manager.push(30, 0);
        manager.push(41, this.xScale);
        manager.push(42, this.yScale);
        manager.push(43, 1);
        manager.push(50, this.rotation);
    }
}
class BlockRecord extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(name){
        super([
            'AcDbSymbolTableRecord',
            'AcDbBlockTableRecord'
        ]), this.name = name;
    }
    tags(manager) {
        manager.push(0, 'BLOCK_RECORD');
        super.tags(manager);
        manager.push(2, this.name);
        manager.push(340, 0);
        manager.push(310, '');
        manager.push(310, '');
    }
}
class DxfFrameBuilder {
    static generate(drawing, options, frameOrigin) {
        const { paperSize, scale, productName, projectName, drawingUnit, drawingName, drawingNumber, date, logoPath = './SHARE3DCAM_logo.png', logoPixelWidth = 1080, logoPixelHeight = 1080 } = options;
        const [pw, ph] = FRAME_PAPER_SIZES[paperSize] ?? [
            420,
            297
        ];
        const W = pw * scale;
        const H = ph * scale;
        const FRAME_LAYER = '图框';
        const TITLE_LAYER = '标题栏';
        if (!drawing.layers[FRAME_LAYER]) drawing.addLayer(FRAME_LAYER, 4, 'CONTINUOUS');
        if (!drawing.layers[TITLE_LAYER]) drawing.addLayer(TITLE_LAYER, 7, 'CONTINUOUS');
        const frameLayer = drawing.layers[FRAME_LAYER];
        const titleLayer = drawing.layers[TITLE_LAYER];
        const block = new __WEBPACK_EXTERNAL_MODULE__Block_js_15b06899__["default"]('FRAME', 0);
        drawing.blocks['FRAME'] = block;
        drawing.tables?.['BLOCK_RECORD']?.add(new BlockRecord('FRAME'));
        const add = (layer, shape)=>{
            shape.layer = layer;
            block.addShape(shape);
        };
        const outer = new __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__["default"]([
            [
                0,
                0
            ],
            [
                W,
                0
            ],
            [
                W,
                H
            ],
            [
                0,
                H
            ]
        ], true);
        outer.lineWidth = 50;
        add(frameLayer, outer);
        const ml = 25 * scale;
        const m = 5 * scale;
        const ix1 = ml, iy1 = m, ix2 = W - m, iy2 = H - m;
        const inner = new __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__["default"]([
            [
                ix1,
                iy1
            ],
            [
                ix2,
                iy1
            ],
            [
                ix2,
                iy2
            ],
            [
                ix1,
                iy2
            ]
        ], true, 100, 100);
        inner.lineWidth = 50;
        add(frameLayer, inner);
        const tbWidth = 50 * scale;
        const logoRowH = 50 * scale;
        const companyRowH = 10 * scale;
        const labelRows = [
            '项目名称：',
            '制图单位：',
            '图名：',
            '图号：',
            '图纸比例：',
            '图纸大小：',
            '日期：'
        ];
        const valueRows = [
            projectName,
            drawingUnit,
            drawingName,
            drawingNumber,
            `1:${scale}`,
            paperSize,
            date
        ];
        const numRows = labelRows.length;
        const baseInfoRowHeights = [
            20,
            20,
            10,
            10,
            10,
            10,
            10
        ].map((mm)=>mm * scale);
        const baseInfoHeight = baseInfoRowHeights.reduce((sum, h)=>sum + h, 0);
        const tbX1 = ix2 - tbWidth;
        const tbX2 = ix2;
        const tbY1 = iy1;
        const tbY2 = iy2;
        const innerHeight = tbY2 - tbY1;
        const availableInfoHeight = Math.max(0, innerHeight - logoRowH - companyRowH);
        const infoScale = availableInfoHeight < baseInfoHeight && baseInfoHeight > 0 ? availableInfoHeight / baseInfoHeight : 1;
        const infoRowHeights = baseInfoRowHeights.map((h)=>h * infoScale);
        const infoHeight = infoRowHeights.reduce((sum, h)=>sum + h, 0);
        const middleBlankH = Math.max(0, innerHeight - logoRowH - companyRowH - infoHeight);
        const logoBottomY = tbY2 - logoRowH;
        const companyBottomY = logoBottomY - companyRowH;
        const infoTopY = companyBottomY - middleBlankH;
        const tbBorder = new __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__["default"]([
            [
                tbX1,
                tbY1
            ],
            [
                tbX2,
                tbY1
            ],
            [
                tbX2,
                tbY2
            ],
            [
                tbX1,
                tbY2
            ]
        ], true);
        tbBorder.lineWidth = 35;
        add(frameLayer, tbBorder);
        const vSep = new __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__["default"]([
            [
                tbX1,
                iy1
            ],
            [
                tbX1,
                iy2
            ]
        ], false);
        vSep.lineWidth = 35;
        add(frameLayer, vSep);
        const logoSep = new __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__["default"]([
            [
                tbX1,
                logoBottomY
            ],
            [
                tbX2,
                logoBottomY
            ]
        ], false);
        logoSep.lineWidth = 25;
        add(frameLayer, logoSep);
        const companySep = new __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__["default"]([
            [
                tbX1,
                companyBottomY
            ],
            [
                tbX2,
                companyBottomY
            ]
        ], false);
        companySep.lineWidth = 15;
        add(frameLayer, companySep);
        const infoTopSep = new __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__["default"]([
            [
                tbX1,
                infoTopY
            ],
            [
                tbX2,
                infoTopY
            ]
        ], false);
        infoTopSep.lineWidth = 15;
        add(frameLayer, infoTopSep);
        const colX = tbX1 + 0.4 * tbWidth;
        const colSep = new __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__["default"]([
            [
                colX,
                tbY1
            ],
            [
                colX,
                infoTopY
            ]
        ], false);
        colSep.lineWidth = 15;
        add(frameLayer, colSep);
        const companyTextH = 4.5 * scale;
        const companyTextY = (logoBottomY + companyBottomY) / 2;
        const companyText = new __WEBPACK_EXTERNAL_MODULE__MText_js_95bd5493__["default"]((tbX1 + tbX2) / 2, companyTextY, companyTextH, 0, toMTextUnicode(productName), tbWidth, 5);
        add(titleLayer, companyText);
        const textH = 3 * scale;
        const labelColWidth = colX - tbX1;
        const valueColWidth = tbX2 - colX;
        let rowTop = infoTopY;
        for(let i = 0; i < numRows; i++){
            const rowHeight = infoRowHeights[i] ?? infoRowHeights[infoRowHeights.length - 1] ?? 10 * scale;
            const rowBottom = rowTop - rowHeight;
            const rowMidY = (rowTop + rowBottom) / 2;
            if (i < numRows - 1) {
                const rowLine = new __WEBPACK_EXTERNAL_MODULE__Polyline_js_6065a71a__["default"]([
                    [
                        tbX1,
                        rowBottom
                    ],
                    [
                        tbX2,
                        rowBottom
                    ]
                ], false);
                rowLine.lineWidth = 15;
                add(frameLayer, rowLine);
            }
            const labelPadding = scale;
            const labelX = tbX1 + labelPadding;
            const labelTxt = new __WEBPACK_EXTERNAL_MODULE__MText_js_95bd5493__["default"](labelX, rowMidY, textH, 0, toMTextUnicode(labelRows[i]), labelColWidth - labelPadding, 4);
            add(titleLayer, labelTxt);
            const valuePadding = scale;
            const maxValueWidth = valueColWidth - valuePadding;
            const wrappedValue = wrapMText(valueRows[i], maxValueWidth, textH);
            const valueTxt = new __WEBPACK_EXTERNAL_MODULE__MText_js_95bd5493__["default"](colX + valuePadding, rowMidY, textH, 0, toMTextUnicode(wrappedValue), maxValueWidth, 4);
            add(titleLayer, valueTxt);
            rowTop = rowBottom;
        }
        drawing.setActiveLayer(FRAME_LAYER);
        const insert = new Insert('FRAME', frameOrigin.x, frameOrigin.y);
        drawing.activeLayer?.addShape(insert);
        if (!logoPath) return null;
        return {
            x: tbX1,
            y: logoBottomY,
            width: tbWidth,
            height: logoRowH,
            logoPath,
            pixelWidth: logoPixelWidth,
            pixelHeight: logoPixelHeight,
            frameLayerName: FRAME_LAYER,
            frameBlockName: 'FRAME'
        };
    }
    static buildUnderlayImageArtifacts(options, modelScale) {
        const underlayImage = options.underlayImage;
        const bbox = underlayImage?.pointCloudBBox;
        if (!underlayImage?.path || !bbox) return null;
        const width = (bbox.maxX - bbox.minX) * modelScale;
        const height = (bbox.maxY - bbox.minY) * modelScale;
        if (width <= 0 || height <= 0) return null;
        return {
            x: bbox.minX * modelScale,
            y: bbox.minY * modelScale,
            width,
            height,
            logoPath: underlayImage.path,
            pixelWidth: underlayImage.width,
            pixelHeight: underlayImage.height,
            frameLayerName: '点云附底',
            insertToModelSpace: true,
            insertAtStart: true,
            options: {
                fadeInValue: 50
            }
        };
    }
}
export { DxfFrameBuilder, FRAME_PAPER_SIZES };
