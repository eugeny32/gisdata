import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE__tipKeys_js_1244e6bf__ from "./tipKeys.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const interpolate = (template, params)=>{
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, token)=>{
        const value = params[token];
        return null == value ? match : String(value);
    });
};
const defaultCadTranslator = (key, params)=>{
    const template = __WEBPACK_EXTERNAL_MODULE__tipKeys_js_1244e6bf__.defaultCadMessages[key];
    return interpolate(template ?? key, params);
};
class CadI18nService {
    setTranslator(translator) {
        this.translator = translator ?? defaultCadTranslator;
        this.listeners.forEach((listener)=>listener());
    }
    translate(key, params) {
        return this.translator(key, params);
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return ()=>{
            this.listeners.delete(listener);
        };
    }
    constructor(){
        this.translator = defaultCadTranslator;
        this.listeners = new Set();
    }
}
CadI18nService = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], CadI18nService);
export { CadI18nService };
