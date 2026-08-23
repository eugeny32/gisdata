import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__ from "nanoid/non-secure";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__ from "../command/DrawEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__ from "../../utils/DrawUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const textMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{},
        entryMTextInput: ()=>{},
        entryFinished: ()=>{}
    }
}).createMachine({
    id: 'drawTextTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: 'draw'
            }
        },
        draw: {
            initial: 'mText',
            states: {
                mText: {
                    initial: 'point1',
                    states: {
                        point1: {
                            on: {
                                NEXT: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.text.bounds
                            }
                        },
                        point2: {
                            on: {
                                NEXT: 'input'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.text.bounds
                            }
                        },
                        input: {
                            on: {
                                MOUSE_RIGHT_DOWN: '#drawTextTool.finished',
                                KEY_DOWN_ENTER: '#drawTextTool.finished'
                            },
                            entry: 'entryMTextInput'
                        }
                    }
                }
            }
        },
        finished: {
            entry: 'entryFinished',
            type: 'final'
        }
    }
});
class DrawTextTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize(entityData) {
        this.viewManager.attachTempObject(this.group);
        this.entitySelector.clearSelection();
        this.inject(this.auxiliaryMouseHelper);
        this.entity = this.createEntity(entityData);
        this.currentCommand = new __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__.DrawEntityCommand(this.entity, this.viewManager, void 0, this.isCanCommit.bind(this));
        this.historyManager.startCommand(this.currentCommand);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.historyManager.commitCommand();
        this.previewLineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.previewLineObject);
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.points = [];
        this.tempPoint = null;
        this.previewLineObject = null;
        this.entity = null;
        this.currentCommand = null;
        this.rectData = null;
        if (this.inputElement) {
            this.inputElement.remove();
            this.inputElement = null;
        }
    }
    onMouseDown(params) {
        if (0 === params.event.button) {
            if (this.tempPoint && this.points.length < 2) {
                this.points.push({
                    x: this.tempPoint.x,
                    y: this.tempPoint.y
                });
                this.tempPoint = null;
                this.updateCanvas();
                this.send({
                    type: 'NEXT'
                });
            }
        } else if (2 === params.event.button) this.send({
            type: 'MOUSE_RIGHT_DOWN'
        });
    }
    onMouseMove(params) {
        if (this.points.length >= 2) return;
        this.tempPoint = {
            x: params.worldPos.x,
            y: params.worldPos.y
        };
        this.mouseCapture(params);
        this.updateCanvas();
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
        else if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ENTER) this.send({
            type: 'KEY_DOWN_ENTER'
        });
    }
    onViewerUpdate() {
        this.updateInputBoxPosition();
    }
    mouseCapture(params) {
        if (!this.tempPoint) return;
        const startPoint = this.points.length > 0 ? this.points[this.points.length - 1] : void 0;
        const finalPoint = this.auxiliaryMouseHelper.mouseCapture(params, {
            startPoint
        });
        this.tempPoint = {
            x: finalPoint.x,
            y: finalPoint.y
        };
    }
    showMouseTip(tip) {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw, tip);
    }
    entryMTextInput() {
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.clearObject();
        this.rectData = this.getRectData(this.points[0], this.points[1]);
        this.inputElement = this.createInputBox(this.rectData);
    }
    entryFinished() {
        this.updateEntity();
        this.exit();
    }
    createInputBox(rect) {
        const screenPoint = this.controller.getScreenPosition({
            x: rect.point.x,
            y: rect.point.y,
            z: 0
        });
        const screenBRPoint = this.controller.getScreenPosition({
            x: rect.point.x + rect.width,
            y: rect.point.y + rect.height,
            z: 0
        });
        const screenWidth = Math.abs(screenBRPoint.x - screenPoint.x);
        const screenHeight = Math.abs(screenBRPoint.y - screenPoint.y);
        const inputElement = document.createElement('textarea');
        Object.assign(inputElement.style, {
            position: 'absolute',
            left: `${screenPoint.x}px`,
            top: `${screenPoint.y}px`,
            minWidth: `${screenWidth}px`,
            maxWidth: '-webkit-fill-available',
            minHeight: `${screenHeight}px`,
            outline: 'none',
            backgroundColor: '#fff',
            color: '#000'
        });
        this.controller.domElement.parentElement?.appendChild(inputElement);
        inputElement.addEventListener('mousedown', (event)=>{
            if (2 === event.button) this.send({
                type: 'MOUSE_RIGHT_DOWN'
            });
        });
        inputElement.focus();
        return inputElement;
    }
    updateInputBoxPosition() {
        if (!this.inputElement || !this.rectData) return;
        const screenPoint = this.controller.getScreenPosition({
            x: this.rectData.point.x,
            y: this.rectData.point.y,
            z: 0
        });
        Object.assign(this.inputElement.style, {
            left: `${screenPoint.x}px`,
            top: `${screenPoint.y}px`
        });
    }
    updateCanvas() {
        this.updateObject();
    }
    clearObject() {
        this.previewLineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.previewLineObject);
        this.previewLineObject = null;
    }
    updateObject() {
        const points = [
            ...this.points
        ];
        if (this.tempPoint) points.push(this.tempPoint);
        if (points.length < 2) return;
        const [p1, p2] = points;
        this.updatePreviewLine(p1, p2);
    }
    updatePreviewLine(p1, p2) {
        const points = this.getRectPointsByTwoCorners(p1, p2);
        if (!this.previewLineObject) {
            const dashSize = this.controller.getPixelSizeInWorld(20);
            const materialOption = {
                color: 0xffffff,
                dashSize,
                gapSize: dashSize / 2,
                depthTest: false,
                depthWrite: false
            };
            this.previewLineObject = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.drawDashedPolyline(points, materialOption, this.group, true);
            return;
        }
        const positions = points.concat([
            points[0]
        ]).flatMap((p)=>[
                p.x,
                p.y,
                0
            ]);
        const { geometry } = this.previewLineObject;
        geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute(positions, 3));
        geometry.attributes.position.needsUpdate = true;
        this.previewLineObject.computeLineDistances();
    }
    getRectPointsByTwoCorners(p1, p2) {
        const pt1 = {
            x: p1.x,
            y: p1.y
        };
        const pt2 = {
            x: p2.x,
            y: p1.y
        };
        const pt3 = {
            x: p2.x,
            y: p2.y
        };
        const pt4 = {
            x: p1.x,
            y: p2.y
        };
        return [
            pt1,
            pt2,
            pt3,
            pt4
        ];
    }
    getRectData(p1, p2) {
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);
        return {
            point: {
                x: minX,
                y: maxY
            },
            width: maxX - minX,
            height: maxY - minY
        };
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.MTextEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__.nanoid)()
        });
        if (entityData?.textHeight) entity.textHeight = entityData.textHeight;
        return entity;
    }
    updateEntity() {
        if (!this.entity || !this.inputElement || !this.rectData) return;
        Object.assign(this.entity, {
            position: this.rectData.point,
            rectWidth: this.rectData.width,
            rectHeight: this.rectData.height,
            contents: this.inputElement.value
        });
    }
    isCanCommit() {
        return !!this.entity?.contents;
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawTextTool, this.machine = textMachine.provide({
            actions: {
                showMouseTip: (_v, tip)=>{
                    this.showMouseTip(tip);
                },
                entryMTextInput: ()=>this.entryMTextInput(),
                entryFinished: ()=>this.entryFinished()
            }
        }), this.points = [], this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.previewLineObject = null, this.entity = null, this.currentCommand = null, this.rectData = null, this.inputElement = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawTextTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawTextTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawTextTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawTextTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawTextTool.prototype, "auxiliaryMouseHelper", void 0);
DrawTextTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawTextTool);
export { DrawTextTool };
