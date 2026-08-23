import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE__renderInvalidation_js_14124a91__ from "../renderInvalidation.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
var MouseTipHelper_rslib_entry_MouseTipId = /*#__PURE__*/ function(MouseTipId) {
    MouseTipId["Draw"] = "DrawMouseTipId";
    MouseTipId["Edit"] = "EditMouseTipId";
    return MouseTipId;
}({});
class MouseTipHelper {
    constructor(i18nService, renderInvalidator = __WEBPACK_EXTERNAL_MODULE__renderInvalidation_js_14124a91__.NOOP_CAD_RENDER_INVALIDATOR){
        this.i18nService = i18nService;
        this.renderInvalidator = renderInvalidator;
        this.container = document.createElement('div');
        this.idToTipMap = new Map();
        this._unsubscribeI18n = null;
        this.lastTransform = '';
        this.container.classList.add('mouse-tip-container');
        Object.assign(this.container.style, {
            position: 'absolute',
            left: '0',
            top: '0',
            pointerEvents: 'none',
            display: 'inline-flex',
            alignItems: 'center'
        });
        this._unsubscribeI18n = this.i18nService.subscribe(()=>this.refreshTips());
    }
    mount(parent) {
        if (this.container.parentElement !== parent) {
            parent.appendChild(this.container);
            this.renderInvalidator.invalidate('cad.mouseTip.mounted');
        }
    }
    unmount() {
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
            this.renderInvalidator.invalidate('cad.mouseTip.unmounted');
        }
    }
    dispose() {
        if (this._unsubscribeI18n) {
            this._unsubscribeI18n();
            this._unsubscribeI18n = null;
        }
        if (this.idToTipMap.size > 0) {
            this.container.innerHTML = '';
            this.idToTipMap.clear();
            this.renderInvalidator.invalidate('cad.mouseTip.disposed');
        }
    }
    addTip(id, key, params) {
        if (this.idToTipMap.has(id)) {
            this.updateTip(id, key, params);
            return;
        }
        const el = this.createTipElement(this.translate(key, params));
        this.container.appendChild(el);
        this.idToTipMap.set(id, {
            type: 'text',
            element: el,
            key,
            params
        });
        this.renderInvalidator.invalidate('cad.mouseTip.added');
    }
    updateTip(id, key, params) {
        if (!key) return;
        const tipData = this.idToTipMap.get(id);
        if (!tipData) return;
        if ('text' !== tipData.type) {
            const nextElement = this.createTipElement(this.translate(key, params));
            this.replaceTipElement(tipData.element, nextElement);
            this.idToTipMap.set(id, {
                type: 'text',
                element: nextElement,
                key,
                params
            });
            this.renderInvalidator.invalidate('cad.mouseTip.updated');
            return;
        }
        const nextText = this.translate(key, params);
        if (tipData.element.textContent === nextText && tipData.key === key && tipData.params === params) return;
        tipData.key = key;
        tipData.params = params;
        tipData.element.textContent = nextText;
        this.renderInvalidator.invalidate('cad.mouseTip.updated');
    }
    removeTip(id) {
        const tipData = this.idToTipMap.get(id);
        if (tipData) {
            this.container.removeChild(tipData.element);
            this.idToTipMap.delete(id);
            this.renderInvalidator.invalidate('cad.mouseTip.removed');
        }
    }
    getTip(id) {
        return this.idToTipMap.get(id)?.element;
    }
    addCustomTip(id, render) {
        if (this.idToTipMap.has(id)) {
            this.updateCustomTip(id, render);
            return;
        }
        const element = render(this.translate.bind(this));
        this.container.appendChild(element);
        this.idToTipMap.set(id, {
            type: 'custom',
            element,
            render
        });
        this.renderInvalidator.invalidate('cad.mouseTip.added');
    }
    addIconTip(id, icon) {
        if (this.idToTipMap.has(id)) {
            this.updateIconTip(id, icon);
            return;
        }
        const element = this.createIconTipElement(icon);
        this.container.appendChild(element);
        this.idToTipMap.set(id, {
            type: 'icon',
            element,
            icon
        });
        this.renderInvalidator.invalidate('cad.mouseTip.added');
    }
    updateCustomTip(id, render) {
        const tipData = this.idToTipMap.get(id);
        if (tipData) {
            const element = render(this.translate.bind(this));
            this.replaceTipElement(tipData.element, element);
            this.idToTipMap.set(id, {
                type: 'custom',
                element,
                render
            });
            this.renderInvalidator.invalidate('cad.mouseTip.updated');
        }
    }
    updateIconTip(id, icon) {
        const tipData = this.idToTipMap.get(id);
        if (!tipData) return;
        if ('icon' === tipData.type && tipData.icon === icon) return;
        const element = this.createIconTipElement(icon);
        this.replaceTipElement(tipData.element, element);
        this.idToTipMap.set(id, {
            type: 'icon',
            element,
            icon
        });
        this.renderInvalidator.invalidate('cad.mouseTip.updated');
    }
    updateTransform(options) {
        const { position } = options;
        const offset = 10;
        let x = position.x + offset;
        let y = position.y + offset;
        const parent = this.container.parentElement;
        if (parent) {
            const maxX = Math.max(0, parent.clientWidth - this.container.offsetWidth - offset);
            const maxY = Math.max(0, parent.clientHeight - this.container.offsetHeight - offset);
            x = Math.min(x, maxX);
            y = Math.min(y, maxY);
        }
        const transform = `translate(${x}px,${y}px)`;
        if (transform === this.lastTransform) return;
        this.lastTransform = transform;
        this.container.style.transform = transform;
        this.renderInvalidator.invalidate('cad.mouseTip.transform');
    }
    refreshTips() {
        this.idToTipMap.forEach((tipData)=>{
            if ('text' === tipData.type) {
                tipData.element.textContent = this.translate(tipData.key, tipData.params);
                this.renderInvalidator.invalidate('cad.mouseTip.updated');
                return;
            }
            if ('icon' === tipData.type) return;
            const nextElement = tipData.render(this.translate.bind(this));
            this.replaceTipElement(tipData.element, nextElement);
            tipData.element = nextElement;
            this.renderInvalidator.invalidate('cad.mouseTip.updated');
        });
    }
    replaceTipElement(currentElement, nextElement) {
        if (currentElement === nextElement) return;
        if (currentElement.parentElement === this.container) {
            this.container.replaceChild(nextElement, currentElement);
            return;
        }
        this.container.appendChild(nextElement);
    }
    translate(key, params) {
        return this.i18nService.translate(key, params);
    }
    createTipElement(tip) {
        const el = document.createElement('span');
        el.textContent = tip;
        el.className = 'mouse-tip-item';
        el.style.cssText = 'background-color: #fff; color: black; padding: 4px; font-size: 12px;';
        return el;
    }
    createIconTipElement(icon) {
        const el = document.createElement('span');
        el.className = `mouse-tip-icon mouse-tip-icon-${icon}`;
        Object.assign(el.style, {
            width: '16px',
            height: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            borderRadius: '50%',
            position: 'absolute',
            left: '0',
            top: '0',
            transform: 'translate(-18px, -30px)',
            boxSizing: 'border-box'
        });
        if ('disabled' === icon) {
            const circle = document.createElement('span');
            Object.assign(circle.style, {
                width: '12px',
                height: '12px',
                border: '1.5px solid #111',
                borderRadius: '50%',
                display: 'block',
                boxSizing: 'border-box'
            });
            const slash = document.createElement('span');
            Object.assign(slash.style, {
                width: '12px',
                height: '1.5px',
                backgroundColor: '#111',
                position: 'absolute',
                transform: 'rotate(-45deg)',
                transformOrigin: 'center'
            });
            el.appendChild(circle);
            el.appendChild(slash);
        }
        if ('x' === icon) {
            Object.assign(el.style, {
                backgroundColor: 'transparent',
                borderRadius: '0',
                width: '14px',
                height: '14px'
            });
            const lineStyles = {
                width: '11px',
                height: '2px',
                backgroundColor: '#ff4d4f',
                position: 'absolute',
                borderRadius: '1px',
                transformOrigin: 'center'
            };
            const line1 = document.createElement('span');
            Object.assign(line1.style, {
                ...lineStyles,
                transform: 'rotate(45deg)'
            });
            const line2 = document.createElement('span');
            Object.assign(line2.style, {
                ...lineStyles,
                transform: 'rotate(-45deg)'
            });
            el.appendChild(line1);
            el.appendChild(line2);
        }
        return el;
    }
}
MouseTipHelper = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)(),
    _ts_param(0, (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CadI18nService)),
    _ts_param(1, (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.RenderInvalidator)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        "undefined" == typeof CadI18nService ? Object : CadI18nService,
        "undefined" == typeof CadRenderInvalidator ? Object : CadRenderInvalidator
    ])
], MouseTipHelper);
export { MouseTipHelper, MouseTipHelper_rslib_entry_MouseTipId as MouseTipId };
