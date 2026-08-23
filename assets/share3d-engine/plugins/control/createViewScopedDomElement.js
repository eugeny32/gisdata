function toDomRect(source, viewRect) {
    const sourceRect = source.getBoundingClientRect();
    const left = sourceRect.left + viewRect.x;
    const top = sourceRect.top + viewRect.y;
    const width = viewRect.width;
    const height = viewRect.height;
    return {
        x: left,
        y: top,
        left,
        top,
        right: left + width,
        bottom: top + height,
        width,
        height,
        toJSON: ()=>({})
    };
}
function createViewScopedDomElement(source, getViewRect) {
    const proxy = {
        ownerDocument: source.ownerDocument,
        style: source.style,
        addEventListener: source.addEventListener.bind(source),
        removeEventListener: source.removeEventListener.bind(source),
        dispatchEvent: source.dispatchEvent.bind(source),
        focus: source.focus.bind(source),
        blur: source.blur.bind(source),
        click: source.click.bind(source),
        getRootNode: source.getRootNode.bind(source),
        getBoundingClientRect: ()=>toDomRect(source, getViewRect()),
        setPointerCapture: 'function' == typeof source.setPointerCapture ? source.setPointerCapture.bind(source) : void 0,
        releasePointerCapture: 'function' == typeof source.releasePointerCapture ? source.releasePointerCapture.bind(source) : void 0,
        hasPointerCapture: 'function' == typeof source.hasPointerCapture ? source.hasPointerCapture.bind(source) : void 0,
        hasAttribute: source.hasAttribute.bind(source),
        setAttribute: source.setAttribute.bind(source),
        removeAttribute: source.removeAttribute.bind(source),
        contains: source.contains.bind(source)
    };
    Object.defineProperties(proxy, {
        clientWidth: {
            get: ()=>getViewRect().width
        },
        clientHeight: {
            get: ()=>getViewRect().height
        },
        offsetWidth: {
            get: ()=>getViewRect().width
        },
        offsetHeight: {
            get: ()=>getViewRect().height
        },
        offsetLeft: {
            get: ()=>source.offsetLeft + getViewRect().x
        },
        offsetTop: {
            get: ()=>source.offsetTop + getViewRect().y
        },
        tabIndex: {
            get: ()=>source.tabIndex,
            set: (value)=>{
                source.tabIndex = value;
            }
        }
    });
    return proxy;
}
export { createViewScopedDomElement };
