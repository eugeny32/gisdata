import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__ from "nanoid/non-secure";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__ from "three/examples/jsm/lines/Line2.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__ from "../../utils/DrawUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__ from "../command/DrawEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__ from "../object/material/MaterialUtils.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const mLeaderMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{},
        entryInput: ()=>{},
        entryFinished: ()=>{},
        entryCancelled: ()=>{}
    }
}).createMachine({
    id: 'drawMLeaderTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: 'draw.point1'
            }
        },
        draw: {
            initial: 'point1',
            states: {
                point1: {
                    entry: {
                        type: 'showMouseTip',
                        params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.mLeader.leaderPoint
                    },
                    on: {
                        NEXT: 'point2'
                    }
                },
                point2: {
                    entry: {
                        type: 'showMouseTip',
                        params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.mLeader.textPoint
                    },
                    on: {
                        NEXT: 'input'
                    }
                },
                input: {
                    entry: 'entryInput',
                    on: {
                        INPUT_SUBMIT: '#drawMLeaderTool.finished',
                        INPUT_CANCEL: '#drawMLeaderTool.cancelled'
                    }
                }
            }
        },
        finished: {
            entry: 'entryFinished',
            type: 'final'
        },
        cancelled: {
            entry: 'entryCancelled',
            type: 'final'
        }
    }
});
class DrawMLeaderTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize(entityData) {
        this.viewManager.attachTempObject(this.group);
        this.entitySelector.clearSelection();
        this.inject(this.auxiliaryMouseHelper);
        this.entity = this.createEntity(entityData);
        this.historyManager.startCommand(new __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__.DrawEntityCommand(this.entity, this.viewManager, void 0, this.isCanCommit.bind(this)));
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.historyManager.commitCommand();
        this.previewLineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.previewLineObject);
        this.removeInputBox();
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.points = [];
        this.tempPoint = null;
        this.previewLineObject = null;
        this.entity = null;
        this.cancelled = false;
    }
    onMouseDown(params) {
        if (0 === params.event.button) {
            if (this.checkState('draw.input')) return;
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
            return;
        }
        if (2 === params.event.button && this.checkState('draw.input')) {
            params.event.preventDefault();
            this.send({
                type: 'INPUT_SUBMIT'
            });
        }
    }
    onMouseMove(params) {
        if (this.checkState('draw.input')) return;
        this.tempPoint = {
            x: params.worldPos.x,
            y: params.worldPos.y
        };
        this.mouseCapture(params);
        this.updateCanvas();
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) {
            if (this.checkState('draw.input')) {
                params.event.preventDefault();
                this.send({
                    type: 'INPUT_CANCEL'
                });
                return;
            }
            this.exit();
            return;
        }
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ENTER && this.checkState('draw.input')) {
            params.event.preventDefault();
            this.send({
                type: 'INPUT_SUBMIT'
            });
        }
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
    entryInput() {
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.tempPoint = null;
        this.updateCanvas();
        const textPosition = this.getTextPosition();
        if (!textPosition) return;
        this.inputElement = this.createInputBox(textPosition, this.getDefaultContents());
    }
    entryFinished() {
        this.cancelled = false;
        this.updateEntity();
        this.exit();
    }
    entryCancelled() {
        this.cancelled = true;
        this.exit();
    }
    createInputBox(position, defaultContents) {
        const screenPoint = this.controller.getScreenPosition(position);
        const inputElement = document.createElement('textarea');
        Object.assign(inputElement.style, {
            position: 'absolute',
            left: `${screenPoint.x}px`,
            top: `${screenPoint.y}px`,
            minWidth: '160px',
            minHeight: '48px',
            padding: '6px 8px',
            outline: 'none',
            resize: 'none',
            border: '1px solid #d0d0d0',
            backgroundColor: '#fff',
            color: '#000',
            transform: 'translate(0, -50%)'
        });
        inputElement.value = defaultContents;
        this.controller.domElement?.parentElement?.appendChild(inputElement);
        inputElement.addEventListener('keydown', (event)=>{
            event.stopPropagation();
            if (event.keyCode !== __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ENTER || event.shiftKey) {
                if (event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) {
                    event.preventDefault();
                    this.send({
                        type: 'INPUT_CANCEL'
                    });
                }
            } else {
                event.preventDefault();
                this.send({
                    type: 'INPUT_SUBMIT'
                });
            }
        });
        inputElement.addEventListener('mousedown', (event)=>{
            event.stopPropagation();
            if (2 === event.button) {
                event.preventDefault();
                this.send({
                    type: 'INPUT_SUBMIT'
                });
            }
        });
        inputElement.addEventListener('contextmenu', (event)=>{
            event.preventDefault();
        });
        inputElement.focus();
        inputElement.select();
        return inputElement;
    }
    updateInputBoxPosition() {
        if (!this.inputElement) return;
        const textPosition = this.getTextPosition();
        if (!textPosition) return;
        const screenPoint = this.controller.getScreenPosition(textPosition);
        Object.assign(this.inputElement.style, {
            left: `${screenPoint.x}px`,
            top: `${screenPoint.y}px`
        });
    }
    removeInputBox() {
        if (!this.inputElement) return;
        this.inputElement.remove();
        this.inputElement = null;
    }
    updateCanvas() {
        this.updatePreviewObjects();
        this.updateInputBoxPosition();
    }
    updatePreviewObjects() {
        const points = [
            ...this.points
        ];
        if (this.tempPoint) points.push(this.tempPoint);
        if (points.length < 2 || !this.entity) {
            this.previewLineObject && (this.previewLineObject.visible = false);
            return;
        }
        const { arrowPoint, elbowPoint, landingEnd } = this.getBranchGeometry(points[0], points[1]);
        this.updatePreviewLine([
            arrowPoint,
            elbowPoint,
            landingEnd
        ]);
    }
    updatePreviewLine(points) {
        if (!this.previewLineObject && this.entity) {
            this.previewLineObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__.Line2(__WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getLineGeometryByPoints(points), __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity)));
            this.previewLineObject.computeLineDistances();
            this.group.add(this.previewLineObject);
            return;
        }
        if (!this.previewLineObject) return;
        __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.updateLine2ByPoints(this.previewLineObject, points);
        this.previewLineObject.computeLineDistances();
        this.previewLineObject.visible = true;
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.MLeaderEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__.nanoid)()
        });
        if (entityData?.textHeight) entity.textHeight = entityData.textHeight;
        entity.landingGap = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getDefaultMLeaderLandingDistance)(entity.textHeight, entityData?.landingGap ?? entity.landingGap);
        entity.hasLanding = entityData?.hasLanding ?? true;
        return entity;
    }
    updateEntity() {
        if (!this.entity || this.points.length < 2) return;
        const { arrowPoint, elbowPoint, landingEnd, textPosition } = this.getBranchGeometry(this.points[0], this.points[1]);
        const contents = (this.inputElement?.value ?? this.getDefaultContents()).trim();
        Object.assign(this.entity, {
            contentType: 'mtext',
            branches: [
                {
                    arrowPoint,
                    vertices: [
                        elbowPoint,
                        landingEnd
                    ]
                }
            ],
            textPosition,
            contents,
            hasLanding: true,
            isTextPositionEdited: false
        });
    }
    isCanCommit() {
        if (this.cancelled || !this.entity) return false;
        return this.entity.branches.length > 0 && !!this.entity.contents.trim();
    }
    getTextPosition() {
        if (this.points.length < 2) return null;
        return this.getBranchGeometry(this.points[0], this.points[1]).textPosition;
    }
    getDefaultContents() {
        if (0 === this.points.length) return '';
        const point = this.points[0];
        return `X=${point.x.toFixed(2)}, Y=${point.y.toFixed(2)}`;
    }
    getBranchGeometry(startPoint, elbowSourcePoint) {
        const arrowPoint = {
            x: startPoint.x,
            y: startPoint.y
        };
        const elbowPoint = {
            x: elbowSourcePoint.x,
            y: elbowSourcePoint.y
        };
        const landingDirection = elbowPoint.x >= arrowPoint.x ? 1 : -1;
        const landingEnd = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.buildMLeaderLandingEnd)(elbowPoint, {
            direction: landingDirection,
            landingDistance: (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getDefaultMLeaderLandingDistance)(this.entity?.textHeight, this.entity?.landingGap)
        });
        const textGap = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderTextGap)(this.entity?.textHeight, this.entity?.landingGap);
        const textPosition = {
            x: landingEnd.x + landingDirection * textGap,
            y: landingEnd.y
        };
        return {
            arrowPoint,
            elbowPoint,
            landingEnd,
            textPosition
        };
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawMLeaderTool, this.machine = mLeaderMachine.provide({
            actions: {
                showMouseTip: (_context, tip)=>{
                    this.showMouseTip(tip);
                },
                entryInput: ()=>this.entryInput(),
                entryFinished: ()=>this.entryFinished(),
                entryCancelled: ()=>this.entryCancelled()
            }
        }), this.points = [], this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.previewLineObject = null, this.entity = null, this.inputElement = null, this.cancelled = false;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawMLeaderTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawMLeaderTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawMLeaderTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawMLeaderTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawMLeaderTool.prototype, "auxiliaryMouseHelper", void 0);
DrawMLeaderTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawMLeaderTool);
export { DrawMLeaderTool };
