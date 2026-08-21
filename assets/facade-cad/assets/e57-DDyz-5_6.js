let L, R, q, G;
let __tla = (async ()=>{
    var W = "" + new URL("e57_bg-WOcLTKwX.wasm", import.meta.url).href, U = async (e = {}, t)=>{
        let n;
        if (t.startsWith("data:")) {
            const o = t.replace(/^data:.*?base64,/, "");
            let i;
            if (typeof Buffer == "function" && typeof Buffer.from == "function") i = Buffer.from(o, "base64");
            else if (typeof atob == "function") {
                const _ = atob(o);
                i = new Uint8Array(_.length);
                for(let r = 0; r < _.length; r++)i[r] = _.charCodeAt(r);
            } else throw new Error("Cannot decode base64-encoded data URL");
            n = await WebAssembly.instantiate(i, e);
        } else {
            const o = await fetch(t), i = o.headers.get("Content-Type") || "";
            if ("instantiateStreaming" in WebAssembly && i.startsWith("application/wasm")) n = await WebAssembly.instantiateStreaming(o, e);
            else {
                const _ = await o.arrayBuffer();
                n = await WebAssembly.instantiate(_, e);
            }
        }
        return n.instance.exports;
    };
    let a;
    L = function(e) {
        a = e;
    };
    const O = typeof TextDecoder > "u" ? (0, module.require)("util").TextDecoder : TextDecoder;
    let v = new O("utf-8", {
        ignoreBOM: !0,
        fatal: !0
    });
    v.decode();
    let w = null;
    function l() {
        return (w === null || w.byteLength === 0) && (w = new Uint8Array(a.memory.buffer)), w;
    }
    function p(e, t) {
        return e = e >>> 0, v.decode(l().subarray(e, e + t));
    }
    const d = new Array(128).fill(void 0);
    d.push(void 0, null, !0, !1);
    let u = d.length;
    function M(e) {
        u === d.length && d.push(d.length + 1);
        const t = u;
        return u = d[t], d[t] = e, t;
    }
    let b = 0;
    function S(e, t) {
        const n = t(e.length * 1, 1) >>> 0;
        return l().set(e, n / 1), b = e.length, n;
    }
    const j = typeof TextEncoder > "u" ? (0, module.require)("util").TextEncoder : TextEncoder;
    let h = new j("utf-8");
    const k = typeof h.encodeInto == "function" ? function(e, t) {
        return h.encodeInto(e, t);
    } : function(e, t) {
        const n = h.encode(e);
        return t.set(n), {
            read: e.length,
            written: n.length
        };
    };
    function C(e, t, n) {
        if (n === void 0) {
            const c = h.encode(e), s = t(c.length, 1) >>> 0;
            return l().subarray(s, s + c.length).set(c), b = c.length, s;
        }
        let o = e.length, i = t(o, 1) >>> 0;
        const _ = l();
        let r = 0;
        for(; r < o; r++){
            const c = e.charCodeAt(r);
            if (c > 127) break;
            _[i + r] = c;
        }
        if (r !== o) {
            r !== 0 && (e = e.slice(r)), i = n(i, o, o = r + e.length * 3, 1) >>> 0;
            const c = l().subarray(i + r, i + o), s = k(e, c);
            r += s.written, i = n(i, o, r, 1) >>> 0;
        }
        return b = r, i;
    }
    let g = null;
    function m() {
        return (g === null || g.byteLength === 0) && (g = new Int32Array(a.memory.buffer)), g;
    }
    function B(e) {
        return d[e];
    }
    function D(e) {
        e < 132 || (d[e] = u, u = e);
    }
    function I(e) {
        const t = B(e);
        return D(e), t;
    }
    G = function(e, t) {
        let n, o;
        try {
            const f = a.__wbindgen_add_to_stack_pointer(-16), T = S(e, a.__wbindgen_malloc), E = b, x = C(t, a.__wbindgen_malloc, a.__wbindgen_realloc), A = b;
            a.convertE57(f, T, E, x, A);
            var i = m()[f / 4 + 0], _ = m()[f / 4 + 1], r = m()[f / 4 + 2], c = m()[f / 4 + 3], s = i, y = _;
            if (c) throw s = 0, y = 0, I(r);
            return n = s, o = y, p(s, y);
        } finally{
            a.__wbindgen_add_to_stack_pointer(16), a.__wbindgen_free(n, o, 1);
        }
    };
    R = function(e, t) {
        const n = p(e, t);
        return M(n);
    };
    q = function(e, t) {
        throw new Error(p(e, t));
    };
    URL = globalThis.URL;
    const F = await U({
        "./e57_bg.js": {
            __wbindgen_string_new: R,
            __wbindgen_throw: q
        }
    }, W), { memory: $, convertE57: z, __wbindgen_add_to_stack_pointer: H, __wbindgen_malloc: K, __wbindgen_realloc: N, __wbindgen_free: V } = F;
    var X = Object.freeze({
        __proto__: null,
        __wbindgen_add_to_stack_pointer: H,
        __wbindgen_free: V,
        __wbindgen_malloc: K,
        __wbindgen_realloc: N,
        convertE57: z,
        memory: $
    });
    L(X);
})();
export { L as __wbg_set_wasm, R as __wbindgen_string_new, q as __wbindgen_throw, G as convertE57, __tla };
