(async ()=>{
    class br {
        addEventListener(t, e) {
            this._listeners === void 0 && (this._listeners = {});
            const r = this._listeners;
            r[t] === void 0 && (r[t] = []), r[t].indexOf(e) === -1 && r[t].push(e);
        }
        hasEventListener(t, e) {
            const r = this._listeners;
            return r === void 0 ? !1 : r[t] !== void 0 && r[t].indexOf(e) !== -1;
        }
        removeEventListener(t, e) {
            const r = this._listeners;
            if (r === void 0) return;
            const n = r[t];
            if (n !== void 0) {
                const i = n.indexOf(e);
                i !== -1 && n.splice(i, 1);
            }
        }
        dispatchEvent(t) {
            const e = this._listeners;
            if (e === void 0) return;
            const r = e[t.type];
            if (r !== void 0) {
                t.target = this;
                const n = r.slice(0);
                for(let i = 0, l = n.length; i < l; i++)n[i].call(this, t);
                t.target = null;
            }
        }
    }
    const ut = [
        "00",
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "0a",
        "0b",
        "0c",
        "0d",
        "0e",
        "0f",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "1a",
        "1b",
        "1c",
        "1d",
        "1e",
        "1f",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "2a",
        "2b",
        "2c",
        "2d",
        "2e",
        "2f",
        "30",
        "31",
        "32",
        "33",
        "34",
        "35",
        "36",
        "37",
        "38",
        "39",
        "3a",
        "3b",
        "3c",
        "3d",
        "3e",
        "3f",
        "40",
        "41",
        "42",
        "43",
        "44",
        "45",
        "46",
        "47",
        "48",
        "49",
        "4a",
        "4b",
        "4c",
        "4d",
        "4e",
        "4f",
        "50",
        "51",
        "52",
        "53",
        "54",
        "55",
        "56",
        "57",
        "58",
        "59",
        "5a",
        "5b",
        "5c",
        "5d",
        "5e",
        "5f",
        "60",
        "61",
        "62",
        "63",
        "64",
        "65",
        "66",
        "67",
        "68",
        "69",
        "6a",
        "6b",
        "6c",
        "6d",
        "6e",
        "6f",
        "70",
        "71",
        "72",
        "73",
        "74",
        "75",
        "76",
        "77",
        "78",
        "79",
        "7a",
        "7b",
        "7c",
        "7d",
        "7e",
        "7f",
        "80",
        "81",
        "82",
        "83",
        "84",
        "85",
        "86",
        "87",
        "88",
        "89",
        "8a",
        "8b",
        "8c",
        "8d",
        "8e",
        "8f",
        "90",
        "91",
        "92",
        "93",
        "94",
        "95",
        "96",
        "97",
        "98",
        "99",
        "9a",
        "9b",
        "9c",
        "9d",
        "9e",
        "9f",
        "a0",
        "a1",
        "a2",
        "a3",
        "a4",
        "a5",
        "a6",
        "a7",
        "a8",
        "a9",
        "aa",
        "ab",
        "ac",
        "ad",
        "ae",
        "af",
        "b0",
        "b1",
        "b2",
        "b3",
        "b4",
        "b5",
        "b6",
        "b7",
        "b8",
        "b9",
        "ba",
        "bb",
        "bc",
        "bd",
        "be",
        "bf",
        "c0",
        "c1",
        "c2",
        "c3",
        "c4",
        "c5",
        "c6",
        "c7",
        "c8",
        "c9",
        "ca",
        "cb",
        "cc",
        "cd",
        "ce",
        "cf",
        "d0",
        "d1",
        "d2",
        "d3",
        "d4",
        "d5",
        "d6",
        "d7",
        "d8",
        "d9",
        "da",
        "db",
        "dc",
        "dd",
        "de",
        "df",
        "e0",
        "e1",
        "e2",
        "e3",
        "e4",
        "e5",
        "e6",
        "e7",
        "e8",
        "e9",
        "ea",
        "eb",
        "ec",
        "ed",
        "ee",
        "ef",
        "f0",
        "f1",
        "f2",
        "f3",
        "f4",
        "f5",
        "f6",
        "f7",
        "f8",
        "f9",
        "fa",
        "fb",
        "fc",
        "fd",
        "fe",
        "ff"
    ];
    function Be() {
        const x = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, r = Math.random() * 4294967295 | 0;
        return (ut[x & 255] + ut[x >> 8 & 255] + ut[x >> 16 & 255] + ut[x >> 24 & 255] + "-" + ut[t & 255] + ut[t >> 8 & 255] + "-" + ut[t >> 16 & 15 | 64] + ut[t >> 24 & 255] + "-" + ut[e & 63 | 128] + ut[e >> 8 & 255] + "-" + ut[e >> 16 & 255] + ut[e >> 24 & 255] + ut[r & 255] + ut[r >> 8 & 255] + ut[r >> 16 & 255] + ut[r >> 24 & 255]).toLowerCase();
    }
    function et(x, t, e) {
        return Math.max(t, Math.min(e, x));
    }
    function me(x, t) {
        switch(t.constructor){
            case Float32Array:
                return x;
            case Uint32Array:
                return x / 4294967295;
            case Uint16Array:
                return x / 65535;
            case Uint8Array:
                return x / 255;
            case Int32Array:
                return Math.max(x / 2147483647, -1);
            case Int16Array:
                return Math.max(x / 32767, -1);
            case Int8Array:
                return Math.max(x / 127, -1);
            default:
                throw new Error("Invalid component type.");
        }
    }
    function dt(x, t) {
        switch(t.constructor){
            case Float32Array:
                return x;
            case Uint32Array:
                return Math.round(x * 4294967295);
            case Uint16Array:
                return Math.round(x * 65535);
            case Uint8Array:
                return Math.round(x * 255);
            case Int32Array:
                return Math.round(x * 2147483647);
            case Int16Array:
                return Math.round(x * 32767);
            case Int8Array:
                return Math.round(x * 127);
            default:
                throw new Error("Invalid component type.");
        }
    }
    class Pt {
        constructor(t = 0, e = 0){
            Pt.prototype.isVector2 = !0, this.x = t, this.y = e;
        }
        get width() {
            return this.x;
        }
        set width(t) {
            this.x = t;
        }
        get height() {
            return this.y;
        }
        set height(t) {
            this.y = t;
        }
        set(t, e) {
            return this.x = t, this.y = e, this;
        }
        setScalar(t) {
            return this.x = t, this.y = t, this;
        }
        setX(t) {
            return this.x = t, this;
        }
        setY(t) {
            return this.y = t, this;
        }
        setComponent(t, e) {
            switch(t){
                case 0:
                    this.x = e;
                    break;
                case 1:
                    this.y = e;
                    break;
                default:
                    throw new Error("index is out of range: " + t);
            }
            return this;
        }
        getComponent(t) {
            switch(t){
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                default:
                    throw new Error("index is out of range: " + t);
            }
        }
        clone() {
            return new this.constructor(this.x, this.y);
        }
        copy(t) {
            return this.x = t.x, this.y = t.y, this;
        }
        add(t) {
            return this.x += t.x, this.y += t.y, this;
        }
        addScalar(t) {
            return this.x += t, this.y += t, this;
        }
        addVectors(t, e) {
            return this.x = t.x + e.x, this.y = t.y + e.y, this;
        }
        addScaledVector(t, e) {
            return this.x += t.x * e, this.y += t.y * e, this;
        }
        sub(t) {
            return this.x -= t.x, this.y -= t.y, this;
        }
        subScalar(t) {
            return this.x -= t, this.y -= t, this;
        }
        subVectors(t, e) {
            return this.x = t.x - e.x, this.y = t.y - e.y, this;
        }
        multiply(t) {
            return this.x *= t.x, this.y *= t.y, this;
        }
        multiplyScalar(t) {
            return this.x *= t, this.y *= t, this;
        }
        divide(t) {
            return this.x /= t.x, this.y /= t.y, this;
        }
        divideScalar(t) {
            return this.multiplyScalar(1 / t);
        }
        applyMatrix3(t) {
            const e = this.x, r = this.y, n = t.elements;
            return this.x = n[0] * e + n[3] * r + n[6], this.y = n[1] * e + n[4] * r + n[7], this;
        }
        min(t) {
            return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this;
        }
        max(t) {
            return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this;
        }
        clamp(t, e) {
            return this.x = et(this.x, t.x, e.x), this.y = et(this.y, t.y, e.y), this;
        }
        clampScalar(t, e) {
            return this.x = et(this.x, t, e), this.y = et(this.y, t, e), this;
        }
        clampLength(t, e) {
            const r = this.length();
            return this.divideScalar(r || 1).multiplyScalar(et(r, t, e));
        }
        floor() {
            return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
        }
        ceil() {
            return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
        }
        round() {
            return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
        }
        roundToZero() {
            return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
        }
        negate() {
            return this.x = -this.x, this.y = -this.y, this;
        }
        dot(t) {
            return this.x * t.x + this.y * t.y;
        }
        cross(t) {
            return this.x * t.y - this.y * t.x;
        }
        lengthSq() {
            return this.x * this.x + this.y * this.y;
        }
        length() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        manhattanLength() {
            return Math.abs(this.x) + Math.abs(this.y);
        }
        normalize() {
            return this.divideScalar(this.length() || 1);
        }
        angle() {
            return Math.atan2(-this.y, -this.x) + Math.PI;
        }
        angleTo(t) {
            const e = Math.sqrt(this.lengthSq() * t.lengthSq());
            if (e === 0) return Math.PI / 2;
            const r = this.dot(t) / e;
            return Math.acos(et(r, -1, 1));
        }
        distanceTo(t) {
            return Math.sqrt(this.distanceToSquared(t));
        }
        distanceToSquared(t) {
            const e = this.x - t.x, r = this.y - t.y;
            return e * e + r * r;
        }
        manhattanDistanceTo(t) {
            return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
        }
        setLength(t) {
            return this.normalize().multiplyScalar(t);
        }
        lerp(t, e) {
            return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this;
        }
        lerpVectors(t, e, r) {
            return this.x = t.x + (e.x - t.x) * r, this.y = t.y + (e.y - t.y) * r, this;
        }
        equals(t) {
            return t.x === this.x && t.y === this.y;
        }
        fromArray(t, e = 0) {
            return this.x = t[e], this.y = t[e + 1], this;
        }
        toArray(t = [], e = 0) {
            return t[e] = this.x, t[e + 1] = this.y, t;
        }
        fromBufferAttribute(t, e) {
            return this.x = t.getX(e), this.y = t.getY(e), this;
        }
        rotateAround(t, e) {
            const r = Math.cos(e), n = Math.sin(e), i = this.x - t.x, l = this.y - t.y;
            return this.x = i * r - l * n + t.x, this.y = i * n + l * r + t.y, this;
        }
        random() {
            return this.x = Math.random(), this.y = Math.random(), this;
        }
        *[Symbol.iterator]() {
            yield this.x, yield this.y;
        }
    }
    class se {
        constructor(t, e, r, n, i, l, h, o, c){
            se.prototype.isMatrix3 = !0, this.elements = [
                1,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                1
            ], t !== void 0 && this.set(t, e, r, n, i, l, h, o, c);
        }
        set(t, e, r, n, i, l, h, o, c) {
            const d = this.elements;
            return d[0] = t, d[1] = n, d[2] = h, d[3] = e, d[4] = i, d[5] = o, d[6] = r, d[7] = l, d[8] = c, this;
        }
        identity() {
            return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
        }
        copy(t) {
            const e = this.elements, r = t.elements;
            return e[0] = r[0], e[1] = r[1], e[2] = r[2], e[3] = r[3], e[4] = r[4], e[5] = r[5], e[6] = r[6], e[7] = r[7], e[8] = r[8], this;
        }
        extractBasis(t, e, r) {
            return t.setFromMatrix3Column(this, 0), e.setFromMatrix3Column(this, 1), r.setFromMatrix3Column(this, 2), this;
        }
        setFromMatrix4(t) {
            const e = t.elements;
            return this.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]), this;
        }
        multiply(t) {
            return this.multiplyMatrices(this, t);
        }
        premultiply(t) {
            return this.multiplyMatrices(t, this);
        }
        multiplyMatrices(t, e) {
            const r = t.elements, n = e.elements, i = this.elements, l = r[0], h = r[3], o = r[6], c = r[1], d = r[4], f = r[7], m = r[2], y = r[5], g = r[8], b = n[0], C = n[3], E = n[6], U = n[1], N = n[4], $ = n[7], k = n[2], B = n[5], I = n[8];
            return i[0] = l * b + h * U + o * k, i[3] = l * C + h * N + o * B, i[6] = l * E + h * $ + o * I, i[1] = c * b + d * U + f * k, i[4] = c * C + d * N + f * B, i[7] = c * E + d * $ + f * I, i[2] = m * b + y * U + g * k, i[5] = m * C + y * N + g * B, i[8] = m * E + y * $ + g * I, this;
        }
        multiplyScalar(t) {
            const e = this.elements;
            return e[0] *= t, e[3] *= t, e[6] *= t, e[1] *= t, e[4] *= t, e[7] *= t, e[2] *= t, e[5] *= t, e[8] *= t, this;
        }
        determinant() {
            const t = this.elements, e = t[0], r = t[1], n = t[2], i = t[3], l = t[4], h = t[5], o = t[6], c = t[7], d = t[8];
            return e * l * d - e * h * c - r * i * d + r * h * o + n * i * c - n * l * o;
        }
        invert() {
            const t = this.elements, e = t[0], r = t[1], n = t[2], i = t[3], l = t[4], h = t[5], o = t[6], c = t[7], d = t[8], f = d * l - h * c, m = h * o - d * i, y = c * i - l * o, g = e * f + r * m + n * y;
            if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
            const b = 1 / g;
            return t[0] = f * b, t[1] = (n * c - d * r) * b, t[2] = (h * r - n * l) * b, t[3] = m * b, t[4] = (d * e - n * o) * b, t[5] = (n * i - h * e) * b, t[6] = y * b, t[7] = (r * o - c * e) * b, t[8] = (l * e - r * i) * b, this;
        }
        transpose() {
            let t;
            const e = this.elements;
            return t = e[1], e[1] = e[3], e[3] = t, t = e[2], e[2] = e[6], e[6] = t, t = e[5], e[5] = e[7], e[7] = t, this;
        }
        getNormalMatrix(t) {
            return this.setFromMatrix4(t).invert().transpose();
        }
        transposeIntoArray(t) {
            const e = this.elements;
            return t[0] = e[0], t[1] = e[3], t[2] = e[6], t[3] = e[1], t[4] = e[4], t[5] = e[7], t[6] = e[2], t[7] = e[5], t[8] = e[8], this;
        }
        setUvTransform(t, e, r, n, i, l, h) {
            const o = Math.cos(i), c = Math.sin(i);
            return this.set(r * o, r * c, -r * (o * l + c * h) + l + t, -n * c, n * o, -n * (-c * l + o * h) + h + e, 0, 0, 1), this;
        }
        scale(t, e) {
            return this.premultiply(ar.makeScale(t, e)), this;
        }
        rotate(t) {
            return this.premultiply(ar.makeRotation(-t)), this;
        }
        translate(t, e) {
            return this.premultiply(ar.makeTranslation(t, e)), this;
        }
        makeTranslation(t, e) {
            return t.isVector2 ? this.set(1, 0, t.x, 0, 1, t.y, 0, 0, 1) : this.set(1, 0, t, 0, 1, e, 0, 0, 1), this;
        }
        makeRotation(t) {
            const e = Math.cos(t), r = Math.sin(t);
            return this.set(e, -r, 0, r, e, 0, 0, 0, 1), this;
        }
        makeScale(t, e) {
            return this.set(t, 0, 0, 0, e, 0, 0, 0, 1), this;
        }
        equals(t) {
            const e = this.elements, r = t.elements;
            for(let n = 0; n < 9; n++)if (e[n] !== r[n]) return !1;
            return !0;
        }
        fromArray(t, e = 0) {
            for(let r = 0; r < 9; r++)this.elements[r] = t[r + e];
            return this;
        }
        toArray(t = [], e = 0) {
            const r = this.elements;
            return t[e] = r[0], t[e + 1] = r[1], t[e + 2] = r[2], t[e + 3] = r[3], t[e + 4] = r[4], t[e + 5] = r[5], t[e + 6] = r[6], t[e + 7] = r[7], t[e + 8] = r[8], t;
        }
        clone() {
            return new this.constructor().fromArray(this.elements);
        }
    }
    const ar = new se;
    function ss(x) {
        for(let t = x.length - 1; t >= 0; --t)if (x[t] >= 65535) return !0;
        return !1;
    }
    function Qr(x) {
        return document.createElementNS("http://www.w3.org/1999/xhtml", x);
    }
    function or(x) {
        return x < .04045 ? x * .0773993808 : Math.pow(x * .9478672986 + .0521327014, 2.4);
    }
    let Jt;
    class as {
        static getDataURL(t) {
            if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u") return t.src;
            let e;
            if (t instanceof HTMLCanvasElement) e = t;
            else {
                Jt === void 0 && (Jt = Qr("canvas")), Jt.width = t.width, Jt.height = t.height;
                const r = Jt.getContext("2d");
                t instanceof ImageData ? r.putImageData(t, 0, 0) : r.drawImage(t, 0, 0, t.width, t.height), e = Jt;
            }
            return e.toDataURL("image/png");
        }
        static sRGBToLinear(t) {
            if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
                const e = Qr("canvas");
                e.width = t.width, e.height = t.height;
                const r = e.getContext("2d");
                r.drawImage(t, 0, 0, t.width, t.height);
                const n = r.getImageData(0, 0, t.width, t.height), i = n.data;
                for(let l = 0; l < i.length; l++)i[l] = or(i[l] / 255) * 255;
                return r.putImageData(n, 0, 0), e;
            } else if (t.data) {
                const e = t.data.slice(0);
                for(let r = 0; r < e.length; r++)e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[r] = Math.floor(or(e[r] / 255) * 255) : e[r] = or(e[r]);
                return {
                    data: e,
                    width: t.width,
                    height: t.height
                };
            } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
        }
    }
    let os = 0;
    class hs {
        constructor(t = null){
            this.isSource = !0, Object.defineProperty(this, "id", {
                value: os++
            }), this.uuid = Be(), this.data = t, this.dataReady = !0, this.version = 0;
        }
        set needsUpdate(t) {
            t === !0 && this.version++;
        }
        toJSON(t) {
            const e = t === void 0 || typeof t == "string";
            if (!e && t.images[this.uuid] !== void 0) return t.images[this.uuid];
            const r = {
                uuid: this.uuid,
                url: ""
            }, n = this.data;
            if (n !== null) {
                let i;
                if (Array.isArray(n)) {
                    i = [];
                    for(let l = 0, h = n.length; l < h; l++)n[l].isDataTexture ? i.push(hr(n[l].image)) : i.push(hr(n[l]));
                } else i = hr(n);
                r.url = i;
            }
            return e || (t.images[this.uuid] = r), r;
        }
    }
    function hr(x) {
        return typeof HTMLImageElement < "u" && x instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && x instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && x instanceof ImageBitmap ? as.getDataURL(x) : x.data ? {
            data: Array.from(x.data),
            width: x.width,
            height: x.height,
            type: x.data.constructor.name
        } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
    }
    let ls = 0;
    class Ht extends br {
        constructor(t = Ht.DEFAULT_IMAGE, e = Ht.DEFAULT_MAPPING, r = 1001, n = 1001, i = 1006, l = 1008, h = 1023, o = 1009, c = Ht.DEFAULT_ANISOTROPY, d = ""){
            super(), this.isTexture = !0, Object.defineProperty(this, "id", {
                value: ls++
            }), this.uuid = Be(), this.name = "", this.source = new hs(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = r, this.wrapT = n, this.magFilter = i, this.minFilter = l, this.anisotropy = c, this.format = h, this.internalFormat = null, this.type = o, this.offset = new Pt(0, 0), this.repeat = new Pt(1, 1), this.center = new Pt(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new se, this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = d, this.userData = {}, this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
        }
        get image() {
            return this.source.data;
        }
        set image(t = null) {
            this.source.data = t;
        }
        updateMatrix() {
            this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
        }
        clone() {
            return new this.constructor().copy(this);
        }
        copy(t) {
            return this.name = t.name, this.source = t.source, this.mipmaps = t.mipmaps.slice(0), this.mapping = t.mapping, this.channel = t.channel, this.wrapS = t.wrapS, this.wrapT = t.wrapT, this.magFilter = t.magFilter, this.minFilter = t.minFilter, this.anisotropy = t.anisotropy, this.format = t.format, this.internalFormat = t.internalFormat, this.type = t.type, this.offset.copy(t.offset), this.repeat.copy(t.repeat), this.center.copy(t.center), this.rotation = t.rotation, this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrix.copy(t.matrix), this.generateMipmaps = t.generateMipmaps, this.premultiplyAlpha = t.premultiplyAlpha, this.flipY = t.flipY, this.unpackAlignment = t.unpackAlignment, this.colorSpace = t.colorSpace, this.renderTarget = t.renderTarget, this.isRenderTargetTexture = t.isRenderTargetTexture, this.userData = JSON.parse(JSON.stringify(t.userData)), this.needsUpdate = !0, this;
        }
        toJSON(t) {
            const e = t === void 0 || typeof t == "string";
            if (!e && t.textures[this.uuid] !== void 0) return t.textures[this.uuid];
            const r = {
                metadata: {
                    version: 4.6,
                    type: "Texture",
                    generator: "Texture.toJSON"
                },
                uuid: this.uuid,
                name: this.name,
                image: this.source.toJSON(t).uuid,
                mapping: this.mapping,
                channel: this.channel,
                repeat: [
                    this.repeat.x,
                    this.repeat.y
                ],
                offset: [
                    this.offset.x,
                    this.offset.y
                ],
                center: [
                    this.center.x,
                    this.center.y
                ],
                rotation: this.rotation,
                wrap: [
                    this.wrapS,
                    this.wrapT
                ],
                format: this.format,
                internalFormat: this.internalFormat,
                type: this.type,
                colorSpace: this.colorSpace,
                minFilter: this.minFilter,
                magFilter: this.magFilter,
                anisotropy: this.anisotropy,
                flipY: this.flipY,
                generateMipmaps: this.generateMipmaps,
                premultiplyAlpha: this.premultiplyAlpha,
                unpackAlignment: this.unpackAlignment
            };
            return Object.keys(this.userData).length > 0 && (r.userData = this.userData), e || (t.textures[this.uuid] = r), r;
        }
        dispose() {
            this.dispatchEvent({
                type: "dispose"
            });
        }
        transformUv(t) {
            if (this.mapping !== 300) return t;
            if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1) switch(this.wrapS){
                case 1e3:
                    t.x = t.x - Math.floor(t.x);
                    break;
                case 1001:
                    t.x = t.x < 0 ? 0 : 1;
                    break;
                case 1002:
                    Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
                    break;
            }
            if (t.y < 0 || t.y > 1) switch(this.wrapT){
                case 1e3:
                    t.y = t.y - Math.floor(t.y);
                    break;
                case 1001:
                    t.y = t.y < 0 ? 0 : 1;
                    break;
                case 1002:
                    Math.abs(Math.floor(t.y) % 2) === 1 ? t.y = Math.ceil(t.y) - t.y : t.y = t.y - Math.floor(t.y);
                    break;
            }
            return this.flipY && (t.y = 1 - t.y), t;
        }
        set needsUpdate(t) {
            t === !0 && (this.version++, this.source.needsUpdate = !0);
        }
        set needsPMREMUpdate(t) {
            t === !0 && this.pmremVersion++;
        }
    }
    Ht.DEFAULT_IMAGE = null;
    Ht.DEFAULT_MAPPING = 300;
    Ht.DEFAULT_ANISOTROPY = 1;
    class be {
        constructor(t = 0, e = 0, r = 0, n = 1){
            this.isQuaternion = !0, this._x = t, this._y = e, this._z = r, this._w = n;
        }
        static slerpFlat(t, e, r, n, i, l, h) {
            let o = r[n + 0], c = r[n + 1], d = r[n + 2], f = r[n + 3];
            const m = i[l + 0], y = i[l + 1], g = i[l + 2], b = i[l + 3];
            if (h === 0) {
                t[e + 0] = o, t[e + 1] = c, t[e + 2] = d, t[e + 3] = f;
                return;
            }
            if (h === 1) {
                t[e + 0] = m, t[e + 1] = y, t[e + 2] = g, t[e + 3] = b;
                return;
            }
            if (f !== b || o !== m || c !== y || d !== g) {
                let C = 1 - h;
                const E = o * m + c * y + d * g + f * b, U = E >= 0 ? 1 : -1, N = 1 - E * E;
                if (N > Number.EPSILON) {
                    const k = Math.sqrt(N), B = Math.atan2(k, E * U);
                    C = Math.sin(C * B) / k, h = Math.sin(h * B) / k;
                }
                const $ = h * U;
                if (o = o * C + m * $, c = c * C + y * $, d = d * C + g * $, f = f * C + b * $, C === 1 - h) {
                    const k = 1 / Math.sqrt(o * o + c * c + d * d + f * f);
                    o *= k, c *= k, d *= k, f *= k;
                }
            }
            t[e] = o, t[e + 1] = c, t[e + 2] = d, t[e + 3] = f;
        }
        static multiplyQuaternionsFlat(t, e, r, n, i, l) {
            const h = r[n], o = r[n + 1], c = r[n + 2], d = r[n + 3], f = i[l], m = i[l + 1], y = i[l + 2], g = i[l + 3];
            return t[e] = h * g + d * f + o * y - c * m, t[e + 1] = o * g + d * m + c * f - h * y, t[e + 2] = c * g + d * y + h * m - o * f, t[e + 3] = d * g - h * f - o * m - c * y, t;
        }
        get x() {
            return this._x;
        }
        set x(t) {
            this._x = t, this._onChangeCallback();
        }
        get y() {
            return this._y;
        }
        set y(t) {
            this._y = t, this._onChangeCallback();
        }
        get z() {
            return this._z;
        }
        set z(t) {
            this._z = t, this._onChangeCallback();
        }
        get w() {
            return this._w;
        }
        set w(t) {
            this._w = t, this._onChangeCallback();
        }
        set(t, e, r, n) {
            return this._x = t, this._y = e, this._z = r, this._w = n, this._onChangeCallback(), this;
        }
        clone() {
            return new this.constructor(this._x, this._y, this._z, this._w);
        }
        copy(t) {
            return this._x = t.x, this._y = t.y, this._z = t.z, this._w = t.w, this._onChangeCallback(), this;
        }
        setFromEuler(t, e = !0) {
            const r = t._x, n = t._y, i = t._z, l = t._order, h = Math.cos, o = Math.sin, c = h(r / 2), d = h(n / 2), f = h(i / 2), m = o(r / 2), y = o(n / 2), g = o(i / 2);
            switch(l){
                case "XYZ":
                    this._x = m * d * f + c * y * g, this._y = c * y * f - m * d * g, this._z = c * d * g + m * y * f, this._w = c * d * f - m * y * g;
                    break;
                case "YXZ":
                    this._x = m * d * f + c * y * g, this._y = c * y * f - m * d * g, this._z = c * d * g - m * y * f, this._w = c * d * f + m * y * g;
                    break;
                case "ZXY":
                    this._x = m * d * f - c * y * g, this._y = c * y * f + m * d * g, this._z = c * d * g + m * y * f, this._w = c * d * f - m * y * g;
                    break;
                case "ZYX":
                    this._x = m * d * f - c * y * g, this._y = c * y * f + m * d * g, this._z = c * d * g - m * y * f, this._w = c * d * f + m * y * g;
                    break;
                case "YZX":
                    this._x = m * d * f + c * y * g, this._y = c * y * f + m * d * g, this._z = c * d * g - m * y * f, this._w = c * d * f - m * y * g;
                    break;
                case "XZY":
                    this._x = m * d * f - c * y * g, this._y = c * y * f - m * d * g, this._z = c * d * g + m * y * f, this._w = c * d * f + m * y * g;
                    break;
                default:
                    console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + l);
            }
            return e === !0 && this._onChangeCallback(), this;
        }
        setFromAxisAngle(t, e) {
            const r = e / 2, n = Math.sin(r);
            return this._x = t.x * n, this._y = t.y * n, this._z = t.z * n, this._w = Math.cos(r), this._onChangeCallback(), this;
        }
        setFromRotationMatrix(t) {
            const e = t.elements, r = e[0], n = e[4], i = e[8], l = e[1], h = e[5], o = e[9], c = e[2], d = e[6], f = e[10], m = r + h + f;
            if (m > 0) {
                const y = .5 / Math.sqrt(m + 1);
                this._w = .25 / y, this._x = (d - o) * y, this._y = (i - c) * y, this._z = (l - n) * y;
            } else if (r > h && r > f) {
                const y = 2 * Math.sqrt(1 + r - h - f);
                this._w = (d - o) / y, this._x = .25 * y, this._y = (n + l) / y, this._z = (i + c) / y;
            } else if (h > f) {
                const y = 2 * Math.sqrt(1 + h - r - f);
                this._w = (i - c) / y, this._x = (n + l) / y, this._y = .25 * y, this._z = (o + d) / y;
            } else {
                const y = 2 * Math.sqrt(1 + f - r - h);
                this._w = (l - n) / y, this._x = (i + c) / y, this._y = (o + d) / y, this._z = .25 * y;
            }
            return this._onChangeCallback(), this;
        }
        setFromUnitVectors(t, e) {
            let r = t.dot(e) + 1;
            return r < Number.EPSILON ? (r = 0, Math.abs(t.x) > Math.abs(t.z) ? (this._x = -t.y, this._y = t.x, this._z = 0, this._w = r) : (this._x = 0, this._y = -t.z, this._z = t.y, this._w = r)) : (this._x = t.y * e.z - t.z * e.y, this._y = t.z * e.x - t.x * e.z, this._z = t.x * e.y - t.y * e.x, this._w = r), this.normalize();
        }
        angleTo(t) {
            return 2 * Math.acos(Math.abs(et(this.dot(t), -1, 1)));
        }
        rotateTowards(t, e) {
            const r = this.angleTo(t);
            if (r === 0) return this;
            const n = Math.min(1, e / r);
            return this.slerp(t, n), this;
        }
        identity() {
            return this.set(0, 0, 0, 1);
        }
        invert() {
            return this.conjugate();
        }
        conjugate() {
            return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
        }
        dot(t) {
            return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w;
        }
        lengthSq() {
            return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
        }
        length() {
            return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
        }
        normalize() {
            let t = this.length();
            return t === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (t = 1 / t, this._x = this._x * t, this._y = this._y * t, this._z = this._z * t, this._w = this._w * t), this._onChangeCallback(), this;
        }
        multiply(t) {
            return this.multiplyQuaternions(this, t);
        }
        premultiply(t) {
            return this.multiplyQuaternions(t, this);
        }
        multiplyQuaternions(t, e) {
            const r = t._x, n = t._y, i = t._z, l = t._w, h = e._x, o = e._y, c = e._z, d = e._w;
            return this._x = r * d + l * h + n * c - i * o, this._y = n * d + l * o + i * h - r * c, this._z = i * d + l * c + r * o - n * h, this._w = l * d - r * h - n * o - i * c, this._onChangeCallback(), this;
        }
        slerp(t, e) {
            if (e === 0) return this;
            if (e === 1) return this.copy(t);
            const r = this._x, n = this._y, i = this._z, l = this._w;
            let h = l * t._w + r * t._x + n * t._y + i * t._z;
            if (h < 0 ? (this._w = -t._w, this._x = -t._x, this._y = -t._y, this._z = -t._z, h = -h) : this.copy(t), h >= 1) return this._w = l, this._x = r, this._y = n, this._z = i, this;
            const o = 1 - h * h;
            if (o <= Number.EPSILON) {
                const y = 1 - e;
                return this._w = y * l + e * this._w, this._x = y * r + e * this._x, this._y = y * n + e * this._y, this._z = y * i + e * this._z, this.normalize(), this;
            }
            const c = Math.sqrt(o), d = Math.atan2(c, h), f = Math.sin((1 - e) * d) / c, m = Math.sin(e * d) / c;
            return this._w = l * f + this._w * m, this._x = r * f + this._x * m, this._y = n * f + this._y * m, this._z = i * f + this._z * m, this._onChangeCallback(), this;
        }
        slerpQuaternions(t, e, r) {
            return this.copy(t).slerp(e, r);
        }
        random() {
            const t = 2 * Math.PI * Math.random(), e = 2 * Math.PI * Math.random(), r = Math.random(), n = Math.sqrt(1 - r), i = Math.sqrt(r);
            return this.set(n * Math.sin(t), n * Math.cos(t), i * Math.sin(e), i * Math.cos(e));
        }
        equals(t) {
            return t._x === this._x && t._y === this._y && t._z === this._z && t._w === this._w;
        }
        fromArray(t, e = 0) {
            return this._x = t[e], this._y = t[e + 1], this._z = t[e + 2], this._w = t[e + 3], this._onChangeCallback(), this;
        }
        toArray(t = [], e = 0) {
            return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._w, t;
        }
        fromBufferAttribute(t, e) {
            return this._x = t.getX(e), this._y = t.getY(e), this._z = t.getZ(e), this._w = t.getW(e), this._onChangeCallback(), this;
        }
        toJSON() {
            return this.toArray();
        }
        _onChange(t) {
            return this._onChangeCallback = t, this;
        }
        _onChangeCallback() {}
        *[Symbol.iterator]() {
            yield this._x, yield this._y, yield this._z, yield this._w;
        }
    }
    class z {
        constructor(t = 0, e = 0, r = 0){
            z.prototype.isVector3 = !0, this.x = t, this.y = e, this.z = r;
        }
        set(t, e, r) {
            return r === void 0 && (r = this.z), this.x = t, this.y = e, this.z = r, this;
        }
        setScalar(t) {
            return this.x = t, this.y = t, this.z = t, this;
        }
        setX(t) {
            return this.x = t, this;
        }
        setY(t) {
            return this.y = t, this;
        }
        setZ(t) {
            return this.z = t, this;
        }
        setComponent(t, e) {
            switch(t){
                case 0:
                    this.x = e;
                    break;
                case 1:
                    this.y = e;
                    break;
                case 2:
                    this.z = e;
                    break;
                default:
                    throw new Error("index is out of range: " + t);
            }
            return this;
        }
        getComponent(t) {
            switch(t){
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                case 2:
                    return this.z;
                default:
                    throw new Error("index is out of range: " + t);
            }
        }
        clone() {
            return new this.constructor(this.x, this.y, this.z);
        }
        copy(t) {
            return this.x = t.x, this.y = t.y, this.z = t.z, this;
        }
        add(t) {
            return this.x += t.x, this.y += t.y, this.z += t.z, this;
        }
        addScalar(t) {
            return this.x += t, this.y += t, this.z += t, this;
        }
        addVectors(t, e) {
            return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this;
        }
        addScaledVector(t, e) {
            return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this;
        }
        sub(t) {
            return this.x -= t.x, this.y -= t.y, this.z -= t.z, this;
        }
        subScalar(t) {
            return this.x -= t, this.y -= t, this.z -= t, this;
        }
        subVectors(t, e) {
            return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this;
        }
        multiply(t) {
            return this.x *= t.x, this.y *= t.y, this.z *= t.z, this;
        }
        multiplyScalar(t) {
            return this.x *= t, this.y *= t, this.z *= t, this;
        }
        multiplyVectors(t, e) {
            return this.x = t.x * e.x, this.y = t.y * e.y, this.z = t.z * e.z, this;
        }
        applyEuler(t) {
            return this.applyQuaternion(Kr.setFromEuler(t));
        }
        applyAxisAngle(t, e) {
            return this.applyQuaternion(Kr.setFromAxisAngle(t, e));
        }
        applyMatrix3(t) {
            const e = this.x, r = this.y, n = this.z, i = t.elements;
            return this.x = i[0] * e + i[3] * r + i[6] * n, this.y = i[1] * e + i[4] * r + i[7] * n, this.z = i[2] * e + i[5] * r + i[8] * n, this;
        }
        applyNormalMatrix(t) {
            return this.applyMatrix3(t).normalize();
        }
        applyMatrix4(t) {
            const e = this.x, r = this.y, n = this.z, i = t.elements, l = 1 / (i[3] * e + i[7] * r + i[11] * n + i[15]);
            return this.x = (i[0] * e + i[4] * r + i[8] * n + i[12]) * l, this.y = (i[1] * e + i[5] * r + i[9] * n + i[13]) * l, this.z = (i[2] * e + i[6] * r + i[10] * n + i[14]) * l, this;
        }
        applyQuaternion(t) {
            const e = this.x, r = this.y, n = this.z, i = t.x, l = t.y, h = t.z, o = t.w, c = 2 * (l * n - h * r), d = 2 * (h * e - i * n), f = 2 * (i * r - l * e);
            return this.x = e + o * c + l * f - h * d, this.y = r + o * d + h * c - i * f, this.z = n + o * f + i * d - l * c, this;
        }
        project(t) {
            return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix);
        }
        unproject(t) {
            return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld);
        }
        transformDirection(t) {
            const e = this.x, r = this.y, n = this.z, i = t.elements;
            return this.x = i[0] * e + i[4] * r + i[8] * n, this.y = i[1] * e + i[5] * r + i[9] * n, this.z = i[2] * e + i[6] * r + i[10] * n, this.normalize();
        }
        divide(t) {
            return this.x /= t.x, this.y /= t.y, this.z /= t.z, this;
        }
        divideScalar(t) {
            return this.multiplyScalar(1 / t);
        }
        min(t) {
            return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this;
        }
        max(t) {
            return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this;
        }
        clamp(t, e) {
            return this.x = et(this.x, t.x, e.x), this.y = et(this.y, t.y, e.y), this.z = et(this.z, t.z, e.z), this;
        }
        clampScalar(t, e) {
            return this.x = et(this.x, t, e), this.y = et(this.y, t, e), this.z = et(this.z, t, e), this;
        }
        clampLength(t, e) {
            const r = this.length();
            return this.divideScalar(r || 1).multiplyScalar(et(r, t, e));
        }
        floor() {
            return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
        }
        ceil() {
            return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
        }
        round() {
            return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
        }
        roundToZero() {
            return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
        }
        negate() {
            return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
        }
        dot(t) {
            return this.x * t.x + this.y * t.y + this.z * t.z;
        }
        lengthSq() {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        }
        length() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
        manhattanLength() {
            return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
        }
        normalize() {
            return this.divideScalar(this.length() || 1);
        }
        setLength(t) {
            return this.normalize().multiplyScalar(t);
        }
        lerp(t, e) {
            return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this;
        }
        lerpVectors(t, e, r) {
            return this.x = t.x + (e.x - t.x) * r, this.y = t.y + (e.y - t.y) * r, this.z = t.z + (e.z - t.z) * r, this;
        }
        cross(t) {
            return this.crossVectors(this, t);
        }
        crossVectors(t, e) {
            const r = t.x, n = t.y, i = t.z, l = e.x, h = e.y, o = e.z;
            return this.x = n * o - i * h, this.y = i * l - r * o, this.z = r * h - n * l, this;
        }
        projectOnVector(t) {
            const e = t.lengthSq();
            if (e === 0) return this.set(0, 0, 0);
            const r = t.dot(this) / e;
            return this.copy(t).multiplyScalar(r);
        }
        projectOnPlane(t) {
            return lr.copy(this).projectOnVector(t), this.sub(lr);
        }
        reflect(t) {
            return this.sub(lr.copy(t).multiplyScalar(2 * this.dot(t)));
        }
        angleTo(t) {
            const e = Math.sqrt(this.lengthSq() * t.lengthSq());
            if (e === 0) return Math.PI / 2;
            const r = this.dot(t) / e;
            return Math.acos(et(r, -1, 1));
        }
        distanceTo(t) {
            return Math.sqrt(this.distanceToSquared(t));
        }
        distanceToSquared(t) {
            const e = this.x - t.x, r = this.y - t.y, n = this.z - t.z;
            return e * e + r * r + n * n;
        }
        manhattanDistanceTo(t) {
            return Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z);
        }
        setFromSpherical(t) {
            return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
        }
        setFromSphericalCoords(t, e, r) {
            const n = Math.sin(e) * t;
            return this.x = n * Math.sin(r), this.y = Math.cos(e) * t, this.z = n * Math.cos(r), this;
        }
        setFromCylindrical(t) {
            return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
        }
        setFromCylindricalCoords(t, e, r) {
            return this.x = t * Math.sin(e), this.y = r, this.z = t * Math.cos(e), this;
        }
        setFromMatrixPosition(t) {
            const e = t.elements;
            return this.x = e[12], this.y = e[13], this.z = e[14], this;
        }
        setFromMatrixScale(t) {
            const e = this.setFromMatrixColumn(t, 0).length(), r = this.setFromMatrixColumn(t, 1).length(), n = this.setFromMatrixColumn(t, 2).length();
            return this.x = e, this.y = r, this.z = n, this;
        }
        setFromMatrixColumn(t, e) {
            return this.fromArray(t.elements, e * 4);
        }
        setFromMatrix3Column(t, e) {
            return this.fromArray(t.elements, e * 3);
        }
        setFromEuler(t) {
            return this.x = t._x, this.y = t._y, this.z = t._z, this;
        }
        setFromColor(t) {
            return this.x = t.r, this.y = t.g, this.z = t.b, this;
        }
        equals(t) {
            return t.x === this.x && t.y === this.y && t.z === this.z;
        }
        fromArray(t, e = 0) {
            return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this;
        }
        toArray(t = [], e = 0) {
            return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t;
        }
        fromBufferAttribute(t, e) {
            return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this;
        }
        random() {
            return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
        }
        randomDirection() {
            const t = Math.random() * Math.PI * 2, e = Math.random() * 2 - 1, r = Math.sqrt(1 - e * e);
            return this.x = r * Math.cos(t), this.y = e, this.z = r * Math.sin(t), this;
        }
        *[Symbol.iterator]() {
            yield this.x, yield this.y, yield this.z;
        }
    }
    const lr = new z, Kr = new be;
    class we {
        constructor(t = new z(1 / 0, 1 / 0, 1 / 0), e = new z(-1 / 0, -1 / 0, -1 / 0)){
            this.isBox3 = !0, this.min = t, this.max = e;
        }
        set(t, e) {
            return this.min.copy(t), this.max.copy(e), this;
        }
        setFromArray(t) {
            this.makeEmpty();
            for(let e = 0, r = t.length; e < r; e += 3)this.expandByPoint(bt.fromArray(t, e));
            return this;
        }
        setFromBufferAttribute(t) {
            this.makeEmpty();
            for(let e = 0, r = t.count; e < r; e++)this.expandByPoint(bt.fromBufferAttribute(t, e));
            return this;
        }
        setFromPoints(t) {
            this.makeEmpty();
            for(let e = 0, r = t.length; e < r; e++)this.expandByPoint(t[e]);
            return this;
        }
        setFromCenterAndSize(t, e) {
            const r = bt.copy(e).multiplyScalar(.5);
            return this.min.copy(t).sub(r), this.max.copy(t).add(r), this;
        }
        setFromObject(t, e = !1) {
            return this.makeEmpty(), this.expandByObject(t, e);
        }
        clone() {
            return new this.constructor().copy(this);
        }
        copy(t) {
            return this.min.copy(t.min), this.max.copy(t.max), this;
        }
        makeEmpty() {
            return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
        }
        isEmpty() {
            return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
        }
        getCenter(t) {
            return this.isEmpty() ? t.set(0, 0, 0) : t.addVectors(this.min, this.max).multiplyScalar(.5);
        }
        getSize(t) {
            return this.isEmpty() ? t.set(0, 0, 0) : t.subVectors(this.max, this.min);
        }
        expandByPoint(t) {
            return this.min.min(t), this.max.max(t), this;
        }
        expandByVector(t) {
            return this.min.sub(t), this.max.add(t), this;
        }
        expandByScalar(t) {
            return this.min.addScalar(-t), this.max.addScalar(t), this;
        }
        expandByObject(t, e = !1) {
            t.updateWorldMatrix(!1, !1);
            const r = t.geometry;
            if (r !== void 0) {
                const i = r.getAttribute("position");
                if (e === !0 && i !== void 0 && t.isInstancedMesh !== !0) for(let l = 0, h = i.count; l < h; l++)t.isMesh === !0 ? t.getVertexPosition(l, bt) : bt.fromBufferAttribute(i, l), bt.applyMatrix4(t.matrixWorld), this.expandByPoint(bt);
                else t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), Pe.copy(t.boundingBox)) : (r.boundingBox === null && r.computeBoundingBox(), Pe.copy(r.boundingBox)), Pe.applyMatrix4(t.matrixWorld), this.union(Pe);
            }
            const n = t.children;
            for(let i = 0, l = n.length; i < l; i++)this.expandByObject(n[i], e);
            return this;
        }
        containsPoint(t) {
            return t.x >= this.min.x && t.x <= this.max.x && t.y >= this.min.y && t.y <= this.max.y && t.z >= this.min.z && t.z <= this.max.z;
        }
        containsBox(t) {
            return this.min.x <= t.min.x && t.max.x <= this.max.x && this.min.y <= t.min.y && t.max.y <= this.max.y && this.min.z <= t.min.z && t.max.z <= this.max.z;
        }
        getParameter(t, e) {
            return e.set((t.x - this.min.x) / (this.max.x - this.min.x), (t.y - this.min.y) / (this.max.y - this.min.y), (t.z - this.min.z) / (this.max.z - this.min.z));
        }
        intersectsBox(t) {
            return t.max.x >= this.min.x && t.min.x <= this.max.x && t.max.y >= this.min.y && t.min.y <= this.max.y && t.max.z >= this.min.z && t.min.z <= this.max.z;
        }
        intersectsSphere(t) {
            return this.clampPoint(t.center, bt), bt.distanceToSquared(t.center) <= t.radius * t.radius;
        }
        intersectsPlane(t) {
            let e, r;
            return t.normal.x > 0 ? (e = t.normal.x * this.min.x, r = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, r = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, r += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, r += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, r += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, r += t.normal.z * this.min.z), e <= -t.constant && r >= -t.constant;
        }
        intersectsTriangle(t) {
            if (this.isEmpty()) return !1;
            this.getCenter(pe), ke.subVectors(this.max, pe), Qt.subVectors(t.a, pe), Kt.subVectors(t.b, pe), te.subVectors(t.c, pe), Rt.subVectors(Kt, Qt), Ut.subVectors(te, Kt), Vt.subVectors(Qt, te);
            let e = [
                0,
                -Rt.z,
                Rt.y,
                0,
                -Ut.z,
                Ut.y,
                0,
                -Vt.z,
                Vt.y,
                Rt.z,
                0,
                -Rt.x,
                Ut.z,
                0,
                -Ut.x,
                Vt.z,
                0,
                -Vt.x,
                -Rt.y,
                Rt.x,
                0,
                -Ut.y,
                Ut.x,
                0,
                -Vt.y,
                Vt.x,
                0
            ];
            return !ur(e, Qt, Kt, te, ke) || (e = [
                1,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                1
            ], !ur(e, Qt, Kt, te, ke)) ? !1 : (Ie.crossVectors(Rt, Ut), e = [
                Ie.x,
                Ie.y,
                Ie.z
            ], ur(e, Qt, Kt, te, ke));
        }
        clampPoint(t, e) {
            return e.copy(t).clamp(this.min, this.max);
        }
        distanceToPoint(t) {
            return this.clampPoint(t, bt).distanceTo(t);
        }
        getBoundingSphere(t) {
            return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(bt).length() * .5), t;
        }
        intersect(t) {
            return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), this;
        }
        union(t) {
            return this.min.min(t.min), this.max.max(t.max), this;
        }
        applyMatrix4(t) {
            return this.isEmpty() ? this : (zt[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), zt[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), zt[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), zt[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), zt[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), zt[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), zt[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), zt[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(zt), this);
        }
        translate(t) {
            return this.min.add(t), this.max.add(t), this;
        }
        equals(t) {
            return t.min.equals(this.min) && t.max.equals(this.max);
        }
    }
    const zt = [
        new z,
        new z,
        new z,
        new z,
        new z,
        new z,
        new z,
        new z
    ], bt = new z, Pe = new we, Qt = new z, Kt = new z, te = new z, Rt = new z, Ut = new z, Vt = new z, pe = new z, ke = new z, Ie = new z, Yt = new z;
    function ur(x, t, e, r, n) {
        for(let i = 0, l = x.length - 3; i <= l; i += 3){
            Yt.fromArray(x, i);
            const h = n.x * Math.abs(Yt.x) + n.y * Math.abs(Yt.y) + n.z * Math.abs(Yt.z), o = t.dot(Yt), c = e.dot(Yt), d = r.dot(Yt);
            if (Math.max(-Math.max(o, c, d), Math.min(o, c, d)) > h) return !1;
        }
        return !0;
    }
    const us = new we, ye = new z, cr = new z;
    class cs {
        constructor(t = new z, e = -1){
            this.isSphere = !0, this.center = t, this.radius = e;
        }
        set(t, e) {
            return this.center.copy(t), this.radius = e, this;
        }
        setFromPoints(t, e) {
            const r = this.center;
            e !== void 0 ? r.copy(e) : us.setFromPoints(t).getCenter(r);
            let n = 0;
            for(let i = 0, l = t.length; i < l; i++)n = Math.max(n, r.distanceToSquared(t[i]));
            return this.radius = Math.sqrt(n), this;
        }
        copy(t) {
            return this.center.copy(t.center), this.radius = t.radius, this;
        }
        isEmpty() {
            return this.radius < 0;
        }
        makeEmpty() {
            return this.center.set(0, 0, 0), this.radius = -1, this;
        }
        containsPoint(t) {
            return t.distanceToSquared(this.center) <= this.radius * this.radius;
        }
        distanceToPoint(t) {
            return t.distanceTo(this.center) - this.radius;
        }
        intersectsSphere(t) {
            const e = this.radius + t.radius;
            return t.center.distanceToSquared(this.center) <= e * e;
        }
        intersectsBox(t) {
            return t.intersectsSphere(this);
        }
        intersectsPlane(t) {
            return Math.abs(t.distanceToPoint(this.center)) <= this.radius;
        }
        clampPoint(t, e) {
            const r = this.center.distanceToSquared(t);
            return e.copy(t), r > this.radius * this.radius && (e.sub(this.center).normalize(), e.multiplyScalar(this.radius).add(this.center)), e;
        }
        getBoundingBox(t) {
            return this.isEmpty() ? (t.makeEmpty(), t) : (t.set(this.center, this.center), t.expandByScalar(this.radius), t);
        }
        applyMatrix4(t) {
            return this.center.applyMatrix4(t), this.radius = this.radius * t.getMaxScaleOnAxis(), this;
        }
        translate(t) {
            return this.center.add(t), this;
        }
        expandByPoint(t) {
            if (this.isEmpty()) return this.center.copy(t), this.radius = 0, this;
            ye.subVectors(t, this.center);
            const e = ye.lengthSq();
            if (e > this.radius * this.radius) {
                const r = Math.sqrt(e), n = (r - this.radius) * .5;
                this.center.addScaledVector(ye, n / r), this.radius += n;
            }
            return this;
        }
        union(t) {
            return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === !0 ? this.radius = Math.max(this.radius, t.radius) : (cr.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(ye.copy(t.center).add(cr)), this.expandByPoint(ye.copy(t.center).sub(cr))), this);
        }
        equals(t) {
            return t.center.equals(this.center) && t.radius === this.radius;
        }
        clone() {
            return new this.constructor().copy(this);
        }
    }
    class Tt {
        constructor(t, e, r, n, i, l, h, o, c, d, f, m, y, g, b, C){
            Tt.prototype.isMatrix4 = !0, this.elements = [
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1
            ], t !== void 0 && this.set(t, e, r, n, i, l, h, o, c, d, f, m, y, g, b, C);
        }
        set(t, e, r, n, i, l, h, o, c, d, f, m, y, g, b, C) {
            const E = this.elements;
            return E[0] = t, E[4] = e, E[8] = r, E[12] = n, E[1] = i, E[5] = l, E[9] = h, E[13] = o, E[2] = c, E[6] = d, E[10] = f, E[14] = m, E[3] = y, E[7] = g, E[11] = b, E[15] = C, this;
        }
        identity() {
            return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
        }
        clone() {
            return new Tt().fromArray(this.elements);
        }
        copy(t) {
            const e = this.elements, r = t.elements;
            return e[0] = r[0], e[1] = r[1], e[2] = r[2], e[3] = r[3], e[4] = r[4], e[5] = r[5], e[6] = r[6], e[7] = r[7], e[8] = r[8], e[9] = r[9], e[10] = r[10], e[11] = r[11], e[12] = r[12], e[13] = r[13], e[14] = r[14], e[15] = r[15], this;
        }
        copyPosition(t) {
            const e = this.elements, r = t.elements;
            return e[12] = r[12], e[13] = r[13], e[14] = r[14], this;
        }
        setFromMatrix3(t) {
            const e = t.elements;
            return this.set(e[0], e[3], e[6], 0, e[1], e[4], e[7], 0, e[2], e[5], e[8], 0, 0, 0, 0, 1), this;
        }
        extractBasis(t, e, r) {
            return t.setFromMatrixColumn(this, 0), e.setFromMatrixColumn(this, 1), r.setFromMatrixColumn(this, 2), this;
        }
        makeBasis(t, e, r) {
            return this.set(t.x, e.x, r.x, 0, t.y, e.y, r.y, 0, t.z, e.z, r.z, 0, 0, 0, 0, 1), this;
        }
        extractRotation(t) {
            const e = this.elements, r = t.elements, n = 1 / ee.setFromMatrixColumn(t, 0).length(), i = 1 / ee.setFromMatrixColumn(t, 1).length(), l = 1 / ee.setFromMatrixColumn(t, 2).length();
            return e[0] = r[0] * n, e[1] = r[1] * n, e[2] = r[2] * n, e[3] = 0, e[4] = r[4] * i, e[5] = r[5] * i, e[6] = r[6] * i, e[7] = 0, e[8] = r[8] * l, e[9] = r[9] * l, e[10] = r[10] * l, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
        }
        makeRotationFromEuler(t) {
            const e = this.elements, r = t.x, n = t.y, i = t.z, l = Math.cos(r), h = Math.sin(r), o = Math.cos(n), c = Math.sin(n), d = Math.cos(i), f = Math.sin(i);
            if (t.order === "XYZ") {
                const m = l * d, y = l * f, g = h * d, b = h * f;
                e[0] = o * d, e[4] = -o * f, e[8] = c, e[1] = y + g * c, e[5] = m - b * c, e[9] = -h * o, e[2] = b - m * c, e[6] = g + y * c, e[10] = l * o;
            } else if (t.order === "YXZ") {
                const m = o * d, y = o * f, g = c * d, b = c * f;
                e[0] = m + b * h, e[4] = g * h - y, e[8] = l * c, e[1] = l * f, e[5] = l * d, e[9] = -h, e[2] = y * h - g, e[6] = b + m * h, e[10] = l * o;
            } else if (t.order === "ZXY") {
                const m = o * d, y = o * f, g = c * d, b = c * f;
                e[0] = m - b * h, e[4] = -l * f, e[8] = g + y * h, e[1] = y + g * h, e[5] = l * d, e[9] = b - m * h, e[2] = -l * c, e[6] = h, e[10] = l * o;
            } else if (t.order === "ZYX") {
                const m = l * d, y = l * f, g = h * d, b = h * f;
                e[0] = o * d, e[4] = g * c - y, e[8] = m * c + b, e[1] = o * f, e[5] = b * c + m, e[9] = y * c - g, e[2] = -c, e[6] = h * o, e[10] = l * o;
            } else if (t.order === "YZX") {
                const m = l * o, y = l * c, g = h * o, b = h * c;
                e[0] = o * d, e[4] = b - m * f, e[8] = g * f + y, e[1] = f, e[5] = l * d, e[9] = -h * d, e[2] = -c * d, e[6] = y * f + g, e[10] = m - b * f;
            } else if (t.order === "XZY") {
                const m = l * o, y = l * c, g = h * o, b = h * c;
                e[0] = o * d, e[4] = -f, e[8] = c * d, e[1] = m * f + b, e[5] = l * d, e[9] = y * f - g, e[2] = g * f - y, e[6] = h * d, e[10] = b * f + m;
            }
            return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
        }
        makeRotationFromQuaternion(t) {
            return this.compose(ds, t, fs);
        }
        lookAt(t, e, r) {
            const n = this.elements;
            return mt.subVectors(t, e), mt.lengthSq() === 0 && (mt.z = 1), mt.normalize(), Ot.crossVectors(r, mt), Ot.lengthSq() === 0 && (Math.abs(r.z) === 1 ? mt.x += 1e-4 : mt.z += 1e-4, mt.normalize(), Ot.crossVectors(r, mt)), Ot.normalize(), Re.crossVectors(mt, Ot), n[0] = Ot.x, n[4] = Re.x, n[8] = mt.x, n[1] = Ot.y, n[5] = Re.y, n[9] = mt.y, n[2] = Ot.z, n[6] = Re.z, n[10] = mt.z, this;
        }
        multiply(t) {
            return this.multiplyMatrices(this, t);
        }
        premultiply(t) {
            return this.multiplyMatrices(t, this);
        }
        multiplyMatrices(t, e) {
            const r = t.elements, n = e.elements, i = this.elements, l = r[0], h = r[4], o = r[8], c = r[12], d = r[1], f = r[5], m = r[9], y = r[13], g = r[2], b = r[6], C = r[10], E = r[14], U = r[3], N = r[7], $ = r[11], k = r[15], B = n[0], I = n[4], A = n[8], X = n[12], R = n[1], W = n[5], Z = n[9], j = n[13], K = n[2], Q = n[6], J = n[10], G = n[14], V = n[3], st = n[7], q = n[11], Y = n[15];
            return i[0] = l * B + h * R + o * K + c * V, i[4] = l * I + h * W + o * Q + c * st, i[8] = l * A + h * Z + o * J + c * q, i[12] = l * X + h * j + o * G + c * Y, i[1] = d * B + f * R + m * K + y * V, i[5] = d * I + f * W + m * Q + y * st, i[9] = d * A + f * Z + m * J + y * q, i[13] = d * X + f * j + m * G + y * Y, i[2] = g * B + b * R + C * K + E * V, i[6] = g * I + b * W + C * Q + E * st, i[10] = g * A + b * Z + C * J + E * q, i[14] = g * X + b * j + C * G + E * Y, i[3] = U * B + N * R + $ * K + k * V, i[7] = U * I + N * W + $ * Q + k * st, i[11] = U * A + N * Z + $ * J + k * q, i[15] = U * X + N * j + $ * G + k * Y, this;
        }
        multiplyScalar(t) {
            const e = this.elements;
            return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this;
        }
        determinant() {
            const t = this.elements, e = t[0], r = t[4], n = t[8], i = t[12], l = t[1], h = t[5], o = t[9], c = t[13], d = t[2], f = t[6], m = t[10], y = t[14], g = t[3], b = t[7], C = t[11], E = t[15];
            return g * (+i * o * f - n * c * f - i * h * m + r * c * m + n * h * y - r * o * y) + b * (+e * o * y - e * c * m + i * l * m - n * l * y + n * c * d - i * o * d) + C * (+e * c * f - e * h * y - i * l * f + r * l * y + i * h * d - r * c * d) + E * (-n * h * d - e * o * f + e * h * m + n * l * f - r * l * m + r * o * d);
        }
        transpose() {
            const t = this.elements;
            let e;
            return e = t[1], t[1] = t[4], t[4] = e, e = t[2], t[2] = t[8], t[8] = e, e = t[6], t[6] = t[9], t[9] = e, e = t[3], t[3] = t[12], t[12] = e, e = t[7], t[7] = t[13], t[13] = e, e = t[11], t[11] = t[14], t[14] = e, this;
        }
        setPosition(t, e, r) {
            const n = this.elements;
            return t.isVector3 ? (n[12] = t.x, n[13] = t.y, n[14] = t.z) : (n[12] = t, n[13] = e, n[14] = r), this;
        }
        invert() {
            const t = this.elements, e = t[0], r = t[1], n = t[2], i = t[3], l = t[4], h = t[5], o = t[6], c = t[7], d = t[8], f = t[9], m = t[10], y = t[11], g = t[12], b = t[13], C = t[14], E = t[15], U = f * C * c - b * m * c + b * o * y - h * C * y - f * o * E + h * m * E, N = g * m * c - d * C * c - g * o * y + l * C * y + d * o * E - l * m * E, $ = d * b * c - g * f * c + g * h * y - l * b * y - d * h * E + l * f * E, k = g * f * o - d * b * o - g * h * m + l * b * m + d * h * C - l * f * C, B = e * U + r * N + n * $ + i * k;
            if (B === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            const I = 1 / B;
            return t[0] = U * I, t[1] = (b * m * i - f * C * i - b * n * y + r * C * y + f * n * E - r * m * E) * I, t[2] = (h * C * i - b * o * i + b * n * c - r * C * c - h * n * E + r * o * E) * I, t[3] = (f * o * i - h * m * i - f * n * c + r * m * c + h * n * y - r * o * y) * I, t[4] = N * I, t[5] = (d * C * i - g * m * i + g * n * y - e * C * y - d * n * E + e * m * E) * I, t[6] = (g * o * i - l * C * i - g * n * c + e * C * c + l * n * E - e * o * E) * I, t[7] = (l * m * i - d * o * i + d * n * c - e * m * c - l * n * y + e * o * y) * I, t[8] = $ * I, t[9] = (g * f * i - d * b * i - g * r * y + e * b * y + d * r * E - e * f * E) * I, t[10] = (l * b * i - g * h * i + g * r * c - e * b * c - l * r * E + e * h * E) * I, t[11] = (d * h * i - l * f * i - d * r * c + e * f * c + l * r * y - e * h * y) * I, t[12] = k * I, t[13] = (d * b * n - g * f * n + g * r * m - e * b * m - d * r * C + e * f * C) * I, t[14] = (g * h * n - l * b * n - g * r * o + e * b * o + l * r * C - e * h * C) * I, t[15] = (l * f * n - d * h * n + d * r * o - e * f * o - l * r * m + e * h * m) * I, this;
        }
        scale(t) {
            const e = this.elements, r = t.x, n = t.y, i = t.z;
            return e[0] *= r, e[4] *= n, e[8] *= i, e[1] *= r, e[5] *= n, e[9] *= i, e[2] *= r, e[6] *= n, e[10] *= i, e[3] *= r, e[7] *= n, e[11] *= i, this;
        }
        getMaxScaleOnAxis() {
            const t = this.elements, e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2], r = t[4] * t[4] + t[5] * t[5] + t[6] * t[6], n = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
            return Math.sqrt(Math.max(e, r, n));
        }
        makeTranslation(t, e, r) {
            return t.isVector3 ? this.set(1, 0, 0, t.x, 0, 1, 0, t.y, 0, 0, 1, t.z, 0, 0, 0, 1) : this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, r, 0, 0, 0, 1), this;
        }
        makeRotationX(t) {
            const e = Math.cos(t), r = Math.sin(t);
            return this.set(1, 0, 0, 0, 0, e, -r, 0, 0, r, e, 0, 0, 0, 0, 1), this;
        }
        makeRotationY(t) {
            const e = Math.cos(t), r = Math.sin(t);
            return this.set(e, 0, r, 0, 0, 1, 0, 0, -r, 0, e, 0, 0, 0, 0, 1), this;
        }
        makeRotationZ(t) {
            const e = Math.cos(t), r = Math.sin(t);
            return this.set(e, -r, 0, 0, r, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
        }
        makeRotationAxis(t, e) {
            const r = Math.cos(e), n = Math.sin(e), i = 1 - r, l = t.x, h = t.y, o = t.z, c = i * l, d = i * h;
            return this.set(c * l + r, c * h - n * o, c * o + n * h, 0, c * h + n * o, d * h + r, d * o - n * l, 0, c * o - n * h, d * o + n * l, i * o * o + r, 0, 0, 0, 0, 1), this;
        }
        makeScale(t, e, r) {
            return this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, r, 0, 0, 0, 0, 1), this;
        }
        makeShear(t, e, r, n, i, l) {
            return this.set(1, r, i, 0, t, 1, l, 0, e, n, 1, 0, 0, 0, 0, 1), this;
        }
        compose(t, e, r) {
            const n = this.elements, i = e._x, l = e._y, h = e._z, o = e._w, c = i + i, d = l + l, f = h + h, m = i * c, y = i * d, g = i * f, b = l * d, C = l * f, E = h * f, U = o * c, N = o * d, $ = o * f, k = r.x, B = r.y, I = r.z;
            return n[0] = (1 - (b + E)) * k, n[1] = (y + $) * k, n[2] = (g - N) * k, n[3] = 0, n[4] = (y - $) * B, n[5] = (1 - (m + E)) * B, n[6] = (C + U) * B, n[7] = 0, n[8] = (g + N) * I, n[9] = (C - U) * I, n[10] = (1 - (m + b)) * I, n[11] = 0, n[12] = t.x, n[13] = t.y, n[14] = t.z, n[15] = 1, this;
        }
        decompose(t, e, r) {
            const n = this.elements;
            let i = ee.set(n[0], n[1], n[2]).length();
            const l = ee.set(n[4], n[5], n[6]).length(), h = ee.set(n[8], n[9], n[10]).length();
            this.determinant() < 0 && (i = -i), t.x = n[12], t.y = n[13], t.z = n[14], wt.copy(this);
            const c = 1 / i, d = 1 / l, f = 1 / h;
            return wt.elements[0] *= c, wt.elements[1] *= c, wt.elements[2] *= c, wt.elements[4] *= d, wt.elements[5] *= d, wt.elements[6] *= d, wt.elements[8] *= f, wt.elements[9] *= f, wt.elements[10] *= f, e.setFromRotationMatrix(wt), r.x = i, r.y = l, r.z = h, this;
        }
        makePerspective(t, e, r, n, i, l, h = 2e3) {
            const o = this.elements, c = 2 * i / (e - t), d = 2 * i / (r - n), f = (e + t) / (e - t), m = (r + n) / (r - n);
            let y, g;
            if (h === 2e3) y = -(l + i) / (l - i), g = -2 * l * i / (l - i);
            else if (h === 2001) y = -l / (l - i), g = -l * i / (l - i);
            else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + h);
            return o[0] = c, o[4] = 0, o[8] = f, o[12] = 0, o[1] = 0, o[5] = d, o[9] = m, o[13] = 0, o[2] = 0, o[6] = 0, o[10] = y, o[14] = g, o[3] = 0, o[7] = 0, o[11] = -1, o[15] = 0, this;
        }
        makeOrthographic(t, e, r, n, i, l, h = 2e3) {
            const o = this.elements, c = 1 / (e - t), d = 1 / (r - n), f = 1 / (l - i), m = (e + t) * c, y = (r + n) * d;
            let g, b;
            if (h === 2e3) g = (l + i) * f, b = -2 * f;
            else if (h === 2001) g = i * f, b = -1 * f;
            else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + h);
            return o[0] = 2 * c, o[4] = 0, o[8] = 0, o[12] = -m, o[1] = 0, o[5] = 2 * d, o[9] = 0, o[13] = -y, o[2] = 0, o[6] = 0, o[10] = b, o[14] = -g, o[3] = 0, o[7] = 0, o[11] = 0, o[15] = 1, this;
        }
        equals(t) {
            const e = this.elements, r = t.elements;
            for(let n = 0; n < 16; n++)if (e[n] !== r[n]) return !1;
            return !0;
        }
        fromArray(t, e = 0) {
            for(let r = 0; r < 16; r++)this.elements[r] = t[r + e];
            return this;
        }
        toArray(t = [], e = 0) {
            const r = this.elements;
            return t[e] = r[0], t[e + 1] = r[1], t[e + 2] = r[2], t[e + 3] = r[3], t[e + 4] = r[4], t[e + 5] = r[5], t[e + 6] = r[6], t[e + 7] = r[7], t[e + 8] = r[8], t[e + 9] = r[9], t[e + 10] = r[10], t[e + 11] = r[11], t[e + 12] = r[12], t[e + 13] = r[13], t[e + 14] = r[14], t[e + 15] = r[15], t;
        }
    }
    const ee = new z, wt = new Tt, ds = new z(0, 0, 0), fs = new z(1, 1, 1), Ot = new z, Re = new z, mt = new z, ti = new Tt, ei = new be;
    class We {
        constructor(t = 0, e = 0, r = 0, n = We.DEFAULT_ORDER){
            this.isEuler = !0, this._x = t, this._y = e, this._z = r, this._order = n;
        }
        get x() {
            return this._x;
        }
        set x(t) {
            this._x = t, this._onChangeCallback();
        }
        get y() {
            return this._y;
        }
        set y(t) {
            this._y = t, this._onChangeCallback();
        }
        get z() {
            return this._z;
        }
        set z(t) {
            this._z = t, this._onChangeCallback();
        }
        get order() {
            return this._order;
        }
        set order(t) {
            this._order = t, this._onChangeCallback();
        }
        set(t, e, r, n = this._order) {
            return this._x = t, this._y = e, this._z = r, this._order = n, this._onChangeCallback(), this;
        }
        clone() {
            return new this.constructor(this._x, this._y, this._z, this._order);
        }
        copy(t) {
            return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this._onChangeCallback(), this;
        }
        setFromRotationMatrix(t, e = this._order, r = !0) {
            const n = t.elements, i = n[0], l = n[4], h = n[8], o = n[1], c = n[5], d = n[9], f = n[2], m = n[6], y = n[10];
            switch(e){
                case "XYZ":
                    this._y = Math.asin(et(h, -1, 1)), Math.abs(h) < .9999999 ? (this._x = Math.atan2(-d, y), this._z = Math.atan2(-l, i)) : (this._x = Math.atan2(m, c), this._z = 0);
                    break;
                case "YXZ":
                    this._x = Math.asin(-et(d, -1, 1)), Math.abs(d) < .9999999 ? (this._y = Math.atan2(h, y), this._z = Math.atan2(o, c)) : (this._y = Math.atan2(-f, i), this._z = 0);
                    break;
                case "ZXY":
                    this._x = Math.asin(et(m, -1, 1)), Math.abs(m) < .9999999 ? (this._y = Math.atan2(-f, y), this._z = Math.atan2(-l, c)) : (this._y = 0, this._z = Math.atan2(o, i));
                    break;
                case "ZYX":
                    this._y = Math.asin(-et(f, -1, 1)), Math.abs(f) < .9999999 ? (this._x = Math.atan2(m, y), this._z = Math.atan2(o, i)) : (this._x = 0, this._z = Math.atan2(-l, c));
                    break;
                case "YZX":
                    this._z = Math.asin(et(o, -1, 1)), Math.abs(o) < .9999999 ? (this._x = Math.atan2(-d, c), this._y = Math.atan2(-f, i)) : (this._x = 0, this._y = Math.atan2(h, y));
                    break;
                case "XZY":
                    this._z = Math.asin(-et(l, -1, 1)), Math.abs(l) < .9999999 ? (this._x = Math.atan2(m, c), this._y = Math.atan2(h, i)) : (this._x = Math.atan2(-d, y), this._y = 0);
                    break;
                default:
                    console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + e);
            }
            return this._order = e, r === !0 && this._onChangeCallback(), this;
        }
        setFromQuaternion(t, e, r) {
            return ti.makeRotationFromQuaternion(t), this.setFromRotationMatrix(ti, e, r);
        }
        setFromVector3(t, e = this._order) {
            return this.set(t.x, t.y, t.z, e);
        }
        reorder(t) {
            return ei.setFromEuler(this), this.setFromQuaternion(ei, t);
        }
        equals(t) {
            return t._x === this._x && t._y === this._y && t._z === this._z && t._order === this._order;
        }
        fromArray(t) {
            return this._x = t[0], this._y = t[1], this._z = t[2], t[3] !== void 0 && (this._order = t[3]), this._onChangeCallback(), this;
        }
        toArray(t = [], e = 0) {
            return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._order, t;
        }
        _onChange(t) {
            return this._onChangeCallback = t, this;
        }
        _onChangeCallback() {}
        *[Symbol.iterator]() {
            yield this._x, yield this._y, yield this._z, yield this._order;
        }
    }
    We.DEFAULT_ORDER = "XYZ";
    class ms {
        constructor(){
            this.mask = 1;
        }
        set(t) {
            this.mask = (1 << t | 0) >>> 0;
        }
        enable(t) {
            this.mask |= 1 << t | 0;
        }
        enableAll() {
            this.mask = -1;
        }
        toggle(t) {
            this.mask ^= 1 << t | 0;
        }
        disable(t) {
            this.mask &= ~(1 << t | 0);
        }
        disableAll() {
            this.mask = 0;
        }
        test(t) {
            return (this.mask & t.mask) !== 0;
        }
        isEnabled(t) {
            return (this.mask & (1 << t | 0)) !== 0;
        }
    }
    let ps = 0;
    const ri = new z, re = new be, Ft = new Tt, Ue = new z, ge = new z, ys = new z, gs = new be, ii = new z(1, 0, 0), ni = new z(0, 1, 0), si = new z(0, 0, 1), ai = {
        type: "added"
    }, _s = {
        type: "removed"
    }, ie = {
        type: "childadded",
        child: null
    }, dr = {
        type: "childremoved",
        child: null
    };
    class Lt extends br {
        constructor(){
            super(), this.isObject3D = !0, Object.defineProperty(this, "id", {
                value: ps++
            }), this.uuid = Be(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = Lt.DEFAULT_UP.clone();
            const t = new z, e = new We, r = new be, n = new z(1, 1, 1);
            function i() {
                r.setFromEuler(e, !1);
            }
            function l() {
                e.setFromQuaternion(r, void 0, !1);
            }
            e._onChange(i), r._onChange(l), Object.defineProperties(this, {
                position: {
                    configurable: !0,
                    enumerable: !0,
                    value: t
                },
                rotation: {
                    configurable: !0,
                    enumerable: !0,
                    value: e
                },
                quaternion: {
                    configurable: !0,
                    enumerable: !0,
                    value: r
                },
                scale: {
                    configurable: !0,
                    enumerable: !0,
                    value: n
                },
                modelViewMatrix: {
                    value: new Tt
                },
                normalMatrix: {
                    value: new se
                }
            }), this.matrix = new Tt, this.matrixWorld = new Tt, this.matrixAutoUpdate = Lt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = Lt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new ms, this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
        }
        onBeforeShadow() {}
        onAfterShadow() {}
        onBeforeRender() {}
        onAfterRender() {}
        applyMatrix4(t) {
            this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(t), this.matrix.decompose(this.position, this.quaternion, this.scale);
        }
        applyQuaternion(t) {
            return this.quaternion.premultiply(t), this;
        }
        setRotationFromAxisAngle(t, e) {
            this.quaternion.setFromAxisAngle(t, e);
        }
        setRotationFromEuler(t) {
            this.quaternion.setFromEuler(t, !0);
        }
        setRotationFromMatrix(t) {
            this.quaternion.setFromRotationMatrix(t);
        }
        setRotationFromQuaternion(t) {
            this.quaternion.copy(t);
        }
        rotateOnAxis(t, e) {
            return re.setFromAxisAngle(t, e), this.quaternion.multiply(re), this;
        }
        rotateOnWorldAxis(t, e) {
            return re.setFromAxisAngle(t, e), this.quaternion.premultiply(re), this;
        }
        rotateX(t) {
            return this.rotateOnAxis(ii, t);
        }
        rotateY(t) {
            return this.rotateOnAxis(ni, t);
        }
        rotateZ(t) {
            return this.rotateOnAxis(si, t);
        }
        translateOnAxis(t, e) {
            return ri.copy(t).applyQuaternion(this.quaternion), this.position.add(ri.multiplyScalar(e)), this;
        }
        translateX(t) {
            return this.translateOnAxis(ii, t);
        }
        translateY(t) {
            return this.translateOnAxis(ni, t);
        }
        translateZ(t) {
            return this.translateOnAxis(si, t);
        }
        localToWorld(t) {
            return this.updateWorldMatrix(!0, !1), t.applyMatrix4(this.matrixWorld);
        }
        worldToLocal(t) {
            return this.updateWorldMatrix(!0, !1), t.applyMatrix4(Ft.copy(this.matrixWorld).invert());
        }
        lookAt(t, e, r) {
            t.isVector3 ? Ue.copy(t) : Ue.set(t, e, r);
            const n = this.parent;
            this.updateWorldMatrix(!0, !1), ge.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Ft.lookAt(ge, Ue, this.up) : Ft.lookAt(Ue, ge, this.up), this.quaternion.setFromRotationMatrix(Ft), n && (Ft.extractRotation(n.matrixWorld), re.setFromRotationMatrix(Ft), this.quaternion.premultiply(re.invert()));
        }
        add(t) {
            if (arguments.length > 1) {
                for(let e = 0; e < arguments.length; e++)this.add(arguments[e]);
                return this;
            }
            return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(ai), ie.child = t, this.dispatchEvent(ie), ie.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
        }
        remove(t) {
            if (arguments.length > 1) {
                for(let r = 0; r < arguments.length; r++)this.remove(arguments[r]);
                return this;
            }
            const e = this.children.indexOf(t);
            return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(_s), dr.child = t, this.dispatchEvent(dr), dr.child = null), this;
        }
        removeFromParent() {
            const t = this.parent;
            return t !== null && t.remove(this), this;
        }
        clear() {
            return this.remove(...this.children);
        }
        attach(t) {
            return this.updateWorldMatrix(!0, !1), Ft.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(!0, !1), Ft.multiply(t.parent.matrixWorld)), t.applyMatrix4(Ft), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(!1, !0), t.dispatchEvent(ai), ie.child = t, this.dispatchEvent(ie), ie.child = null, this;
        }
        getObjectById(t) {
            return this.getObjectByProperty("id", t);
        }
        getObjectByName(t) {
            return this.getObjectByProperty("name", t);
        }
        getObjectByProperty(t, e) {
            if (this[t] === e) return this;
            for(let r = 0, n = this.children.length; r < n; r++){
                const l = this.children[r].getObjectByProperty(t, e);
                if (l !== void 0) return l;
            }
        }
        getObjectsByProperty(t, e, r = []) {
            this[t] === e && r.push(this);
            const n = this.children;
            for(let i = 0, l = n.length; i < l; i++)n[i].getObjectsByProperty(t, e, r);
            return r;
        }
        getWorldPosition(t) {
            return this.updateWorldMatrix(!0, !1), t.setFromMatrixPosition(this.matrixWorld);
        }
        getWorldQuaternion(t) {
            return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ge, t, ys), t;
        }
        getWorldScale(t) {
            return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ge, gs, t), t;
        }
        getWorldDirection(t) {
            this.updateWorldMatrix(!0, !1);
            const e = this.matrixWorld.elements;
            return t.set(e[8], e[9], e[10]).normalize();
        }
        raycast() {}
        traverse(t) {
            t(this);
            const e = this.children;
            for(let r = 0, n = e.length; r < n; r++)e[r].traverse(t);
        }
        traverseVisible(t) {
            if (this.visible === !1) return;
            t(this);
            const e = this.children;
            for(let r = 0, n = e.length; r < n; r++)e[r].traverseVisible(t);
        }
        traverseAncestors(t) {
            const e = this.parent;
            e !== null && (t(e), e.traverseAncestors(t));
        }
        updateMatrix() {
            this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
        }
        updateMatrixWorld(t) {
            this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || t) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, t = !0);
            const e = this.children;
            for(let r = 0, n = e.length; r < n; r++)e[r].updateMatrixWorld(t);
        }
        updateWorldMatrix(t, e) {
            const r = this.parent;
            if (t === !0 && r !== null && r.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), e === !0) {
                const n = this.children;
                for(let i = 0, l = n.length; i < l; i++)n[i].updateWorldMatrix(!1, !0);
            }
        }
        toJSON(t) {
            const e = t === void 0 || typeof t == "string", r = {};
            e && (t = {
                geometries: {},
                materials: {},
                textures: {},
                images: {},
                shapes: {},
                skeletons: {},
                animations: {},
                nodes: {}
            }, r.metadata = {
                version: 4.6,
                type: "Object",
                generator: "Object3D.toJSON"
            });
            const n = {};
            n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.castShadow === !0 && (n.castShadow = !0), this.receiveShadow === !0 && (n.receiveShadow = !0), this.visible === !1 && (n.visible = !1), this.frustumCulled === !1 && (n.frustumCulled = !1), this.renderOrder !== 0 && (n.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (n.userData = this.userData), n.layers = this.layers.mask, n.matrix = this.matrix.toArray(), n.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (n.matrixAutoUpdate = !1), this.isInstancedMesh && (n.type = "InstancedMesh", n.count = this.count, n.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (n.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (n.type = "BatchedMesh", n.perObjectFrustumCulled = this.perObjectFrustumCulled, n.sortObjects = this.sortObjects, n.drawRanges = this._drawRanges, n.reservedRanges = this._reservedRanges, n.visibility = this._visibility, n.active = this._active, n.bounds = this._bounds.map((h)=>({
                    boxInitialized: h.boxInitialized,
                    boxMin: h.box.min.toArray(),
                    boxMax: h.box.max.toArray(),
                    sphereInitialized: h.sphereInitialized,
                    sphereRadius: h.sphere.radius,
                    sphereCenter: h.sphere.center.toArray()
                })), n.maxInstanceCount = this._maxInstanceCount, n.maxVertexCount = this._maxVertexCount, n.maxIndexCount = this._maxIndexCount, n.geometryInitialized = this._geometryInitialized, n.geometryCount = this._geometryCount, n.matricesTexture = this._matricesTexture.toJSON(t), this._colorsTexture !== null && (n.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (n.boundingSphere = {
                center: n.boundingSphere.center.toArray(),
                radius: n.boundingSphere.radius
            }), this.boundingBox !== null && (n.boundingBox = {
                min: n.boundingBox.min.toArray(),
                max: n.boundingBox.max.toArray()
            }));
            function i(h, o) {
                return h[o.uuid] === void 0 && (h[o.uuid] = o.toJSON(t)), o.uuid;
            }
            if (this.isScene) this.background && (this.background.isColor ? n.background = this.background.toJSON() : this.background.isTexture && (n.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (n.environment = this.environment.toJSON(t).uuid);
            else if (this.isMesh || this.isLine || this.isPoints) {
                n.geometry = i(t.geometries, this.geometry);
                const h = this.geometry.parameters;
                if (h !== void 0 && h.shapes !== void 0) {
                    const o = h.shapes;
                    if (Array.isArray(o)) for(let c = 0, d = o.length; c < d; c++){
                        const f = o[c];
                        i(t.shapes, f);
                    }
                    else i(t.shapes, o);
                }
            }
            if (this.isSkinnedMesh && (n.bindMode = this.bindMode, n.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (i(t.skeletons, this.skeleton), n.skeleton = this.skeleton.uuid)), this.material !== void 0) if (Array.isArray(this.material)) {
                const h = [];
                for(let o = 0, c = this.material.length; o < c; o++)h.push(i(t.materials, this.material[o]));
                n.material = h;
            } else n.material = i(t.materials, this.material);
            if (this.children.length > 0) {
                n.children = [];
                for(let h = 0; h < this.children.length; h++)n.children.push(this.children[h].toJSON(t).object);
            }
            if (this.animations.length > 0) {
                n.animations = [];
                for(let h = 0; h < this.animations.length; h++){
                    const o = this.animations[h];
                    n.animations.push(i(t.animations, o));
                }
            }
            if (e) {
                const h = l(t.geometries), o = l(t.materials), c = l(t.textures), d = l(t.images), f = l(t.shapes), m = l(t.skeletons), y = l(t.animations), g = l(t.nodes);
                h.length > 0 && (r.geometries = h), o.length > 0 && (r.materials = o), c.length > 0 && (r.textures = c), d.length > 0 && (r.images = d), f.length > 0 && (r.shapes = f), m.length > 0 && (r.skeletons = m), y.length > 0 && (r.animations = y), g.length > 0 && (r.nodes = g);
            }
            return r.object = n, r;
            function l(h) {
                const o = [];
                for(const c in h){
                    const d = h[c];
                    delete d.metadata, o.push(d);
                }
                return o;
            }
        }
        clone(t) {
            return new this.constructor().copy(this, t);
        }
        copy(t, e = !0) {
            if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, this.animations = t.animations.slice(), this.userData = JSON.parse(JSON.stringify(t.userData)), e === !0) for(let r = 0; r < t.children.length; r++){
                const n = t.children[r];
                this.add(n.clone());
            }
            return this;
        }
    }
    Lt.DEFAULT_UP = new z(0, 1, 0);
    Lt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
    Lt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
    const rt = new z, Oe = new Pt;
    let xs = 0;
    class Dt {
        constructor(t, e, r = !1){
            if (Array.isArray(t)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
            this.isBufferAttribute = !0, Object.defineProperty(this, "id", {
                value: xs++
            }), this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = r, this.usage = 35044, this.updateRanges = [], this.gpuType = 1015, this.version = 0;
        }
        onUploadCallback() {}
        set needsUpdate(t) {
            t === !0 && this.version++;
        }
        setUsage(t) {
            return this.usage = t, this;
        }
        addUpdateRange(t, e) {
            this.updateRanges.push({
                start: t,
                count: e
            });
        }
        clearUpdateRanges() {
            this.updateRanges.length = 0;
        }
        copy(t) {
            return this.name = t.name, this.array = new t.array.constructor(t.array), this.itemSize = t.itemSize, this.count = t.count, this.normalized = t.normalized, this.usage = t.usage, this.gpuType = t.gpuType, this;
        }
        copyAt(t, e, r) {
            t *= this.itemSize, r *= e.itemSize;
            for(let n = 0, i = this.itemSize; n < i; n++)this.array[t + n] = e.array[r + n];
            return this;
        }
        copyArray(t) {
            return this.array.set(t), this;
        }
        applyMatrix3(t) {
            if (this.itemSize === 2) for(let e = 0, r = this.count; e < r; e++)Oe.fromBufferAttribute(this, e), Oe.applyMatrix3(t), this.setXY(e, Oe.x, Oe.y);
            else if (this.itemSize === 3) for(let e = 0, r = this.count; e < r; e++)rt.fromBufferAttribute(this, e), rt.applyMatrix3(t), this.setXYZ(e, rt.x, rt.y, rt.z);
            return this;
        }
        applyMatrix4(t) {
            for(let e = 0, r = this.count; e < r; e++)rt.fromBufferAttribute(this, e), rt.applyMatrix4(t), this.setXYZ(e, rt.x, rt.y, rt.z);
            return this;
        }
        applyNormalMatrix(t) {
            for(let e = 0, r = this.count; e < r; e++)rt.fromBufferAttribute(this, e), rt.applyNormalMatrix(t), this.setXYZ(e, rt.x, rt.y, rt.z);
            return this;
        }
        transformDirection(t) {
            for(let e = 0, r = this.count; e < r; e++)rt.fromBufferAttribute(this, e), rt.transformDirection(t), this.setXYZ(e, rt.x, rt.y, rt.z);
            return this;
        }
        set(t, e = 0) {
            return this.array.set(t, e), this;
        }
        getComponent(t, e) {
            let r = this.array[t * this.itemSize + e];
            return this.normalized && (r = me(r, this.array)), r;
        }
        setComponent(t, e, r) {
            return this.normalized && (r = dt(r, this.array)), this.array[t * this.itemSize + e] = r, this;
        }
        getX(t) {
            let e = this.array[t * this.itemSize];
            return this.normalized && (e = me(e, this.array)), e;
        }
        setX(t, e) {
            return this.normalized && (e = dt(e, this.array)), this.array[t * this.itemSize] = e, this;
        }
        getY(t) {
            let e = this.array[t * this.itemSize + 1];
            return this.normalized && (e = me(e, this.array)), e;
        }
        setY(t, e) {
            return this.normalized && (e = dt(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
        }
        getZ(t) {
            let e = this.array[t * this.itemSize + 2];
            return this.normalized && (e = me(e, this.array)), e;
        }
        setZ(t, e) {
            return this.normalized && (e = dt(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
        }
        getW(t) {
            let e = this.array[t * this.itemSize + 3];
            return this.normalized && (e = me(e, this.array)), e;
        }
        setW(t, e) {
            return this.normalized && (e = dt(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
        }
        setXY(t, e, r) {
            return t *= this.itemSize, this.normalized && (e = dt(e, this.array), r = dt(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = r, this;
        }
        setXYZ(t, e, r, n) {
            return t *= this.itemSize, this.normalized && (e = dt(e, this.array), r = dt(r, this.array), n = dt(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = r, this.array[t + 2] = n, this;
        }
        setXYZW(t, e, r, n, i) {
            return t *= this.itemSize, this.normalized && (e = dt(e, this.array), r = dt(r, this.array), n = dt(n, this.array), i = dt(i, this.array)), this.array[t + 0] = e, this.array[t + 1] = r, this.array[t + 2] = n, this.array[t + 3] = i, this;
        }
        onUpload(t) {
            return this.onUploadCallback = t, this;
        }
        clone() {
            return new this.constructor(this.array, this.itemSize).copy(this);
        }
        toJSON() {
            const t = {
                itemSize: this.itemSize,
                type: this.array.constructor.name,
                array: Array.from(this.array),
                normalized: this.normalized
            };
            return this.name !== "" && (t.name = this.name), this.usage !== 35044 && (t.usage = this.usage), t;
        }
    }
    class bs extends Dt {
        constructor(t, e, r){
            super(new Uint16Array(t), e, r);
        }
    }
    class ws extends Dt {
        constructor(t, e, r){
            super(new Uint32Array(t), e, r);
        }
    }
    class vs extends Dt {
        constructor(t, e, r){
            super(new Float32Array(t), e, r);
        }
    }
    let Ms = 0;
    const _t = new Tt, fr = new Lt, ne = new z, pt = new we, _e = new we, nt = new z;
    class wr extends br {
        constructor(){
            super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", {
                value: Ms++
            }), this.uuid = Be(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
                start: 0,
                count: 1 / 0
            }, this.userData = {};
        }
        getIndex() {
            return this.index;
        }
        setIndex(t) {
            return Array.isArray(t) ? this.index = new (ss(t) ? ws : bs)(t, 1) : this.index = t, this;
        }
        setIndirect(t) {
            return this.indirect = t, this;
        }
        getIndirect() {
            return this.indirect;
        }
        getAttribute(t) {
            return this.attributes[t];
        }
        setAttribute(t, e) {
            return this.attributes[t] = e, this;
        }
        deleteAttribute(t) {
            return delete this.attributes[t], this;
        }
        hasAttribute(t) {
            return this.attributes[t] !== void 0;
        }
        addGroup(t, e, r = 0) {
            this.groups.push({
                start: t,
                count: e,
                materialIndex: r
            });
        }
        clearGroups() {
            this.groups = [];
        }
        setDrawRange(t, e) {
            this.drawRange.start = t, this.drawRange.count = e;
        }
        applyMatrix4(t) {
            const e = this.attributes.position;
            e !== void 0 && (e.applyMatrix4(t), e.needsUpdate = !0);
            const r = this.attributes.normal;
            if (r !== void 0) {
                const i = new se().getNormalMatrix(t);
                r.applyNormalMatrix(i), r.needsUpdate = !0;
            }
            const n = this.attributes.tangent;
            return n !== void 0 && (n.transformDirection(t), n.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
        }
        applyQuaternion(t) {
            return _t.makeRotationFromQuaternion(t), this.applyMatrix4(_t), this;
        }
        rotateX(t) {
            return _t.makeRotationX(t), this.applyMatrix4(_t), this;
        }
        rotateY(t) {
            return _t.makeRotationY(t), this.applyMatrix4(_t), this;
        }
        rotateZ(t) {
            return _t.makeRotationZ(t), this.applyMatrix4(_t), this;
        }
        translate(t, e, r) {
            return _t.makeTranslation(t, e, r), this.applyMatrix4(_t), this;
        }
        scale(t, e, r) {
            return _t.makeScale(t, e, r), this.applyMatrix4(_t), this;
        }
        lookAt(t) {
            return fr.lookAt(t), fr.updateMatrix(), this.applyMatrix4(fr.matrix), this;
        }
        center() {
            return this.computeBoundingBox(), this.boundingBox.getCenter(ne).negate(), this.translate(ne.x, ne.y, ne.z), this;
        }
        setFromPoints(t) {
            const e = this.getAttribute("position");
            if (e === void 0) {
                const r = [];
                for(let n = 0, i = t.length; n < i; n++){
                    const l = t[n];
                    r.push(l.x, l.y, l.z || 0);
                }
                this.setAttribute("position", new vs(r, 3));
            } else {
                const r = Math.min(t.length, e.count);
                for(let n = 0; n < r; n++){
                    const i = t[n];
                    e.setXYZ(n, i.x, i.y, i.z || 0);
                }
                t.length > e.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), e.needsUpdate = !0;
            }
            return this;
        }
        computeBoundingBox() {
            this.boundingBox === null && (this.boundingBox = new we);
            const t = this.attributes.position, e = this.morphAttributes.position;
            if (t && t.isGLBufferAttribute) {
                console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new z(-1 / 0, -1 / 0, -1 / 0), new z(1 / 0, 1 / 0, 1 / 0));
                return;
            }
            if (t !== void 0) {
                if (this.boundingBox.setFromBufferAttribute(t), e) for(let r = 0, n = e.length; r < n; r++){
                    const i = e[r];
                    pt.setFromBufferAttribute(i), this.morphTargetsRelative ? (nt.addVectors(this.boundingBox.min, pt.min), this.boundingBox.expandByPoint(nt), nt.addVectors(this.boundingBox.max, pt.max), this.boundingBox.expandByPoint(nt)) : (this.boundingBox.expandByPoint(pt.min), this.boundingBox.expandByPoint(pt.max));
                }
            } else this.boundingBox.makeEmpty();
            (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
        }
        computeBoundingSphere() {
            this.boundingSphere === null && (this.boundingSphere = new cs);
            const t = this.attributes.position, e = this.morphAttributes.position;
            if (t && t.isGLBufferAttribute) {
                console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new z, 1 / 0);
                return;
            }
            if (t) {
                const r = this.boundingSphere.center;
                if (pt.setFromBufferAttribute(t), e) for(let i = 0, l = e.length; i < l; i++){
                    const h = e[i];
                    _e.setFromBufferAttribute(h), this.morphTargetsRelative ? (nt.addVectors(pt.min, _e.min), pt.expandByPoint(nt), nt.addVectors(pt.max, _e.max), pt.expandByPoint(nt)) : (pt.expandByPoint(_e.min), pt.expandByPoint(_e.max));
                }
                pt.getCenter(r);
                let n = 0;
                for(let i = 0, l = t.count; i < l; i++)nt.fromBufferAttribute(t, i), n = Math.max(n, r.distanceToSquared(nt));
                if (e) for(let i = 0, l = e.length; i < l; i++){
                    const h = e[i], o = this.morphTargetsRelative;
                    for(let c = 0, d = h.count; c < d; c++)nt.fromBufferAttribute(h, c), o && (ne.fromBufferAttribute(t, c), nt.add(ne)), n = Math.max(n, r.distanceToSquared(nt));
                }
                this.boundingSphere.radius = Math.sqrt(n), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
            }
        }
        computeTangents() {
            const t = this.index, e = this.attributes;
            if (t === null || e.position === void 0 || e.normal === void 0 || e.uv === void 0) {
                console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
                return;
            }
            const r = e.position, n = e.normal, i = e.uv;
            this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new Dt(new Float32Array(4 * r.count), 4));
            const l = this.getAttribute("tangent"), h = [], o = [];
            for(let A = 0; A < r.count; A++)h[A] = new z, o[A] = new z;
            const c = new z, d = new z, f = new z, m = new Pt, y = new Pt, g = new Pt, b = new z, C = new z;
            function E(A, X, R) {
                c.fromBufferAttribute(r, A), d.fromBufferAttribute(r, X), f.fromBufferAttribute(r, R), m.fromBufferAttribute(i, A), y.fromBufferAttribute(i, X), g.fromBufferAttribute(i, R), d.sub(c), f.sub(c), y.sub(m), g.sub(m);
                const W = 1 / (y.x * g.y - g.x * y.y);
                isFinite(W) && (b.copy(d).multiplyScalar(g.y).addScaledVector(f, -y.y).multiplyScalar(W), C.copy(f).multiplyScalar(y.x).addScaledVector(d, -g.x).multiplyScalar(W), h[A].add(b), h[X].add(b), h[R].add(b), o[A].add(C), o[X].add(C), o[R].add(C));
            }
            let U = this.groups;
            U.length === 0 && (U = [
                {
                    start: 0,
                    count: t.count
                }
            ]);
            for(let A = 0, X = U.length; A < X; ++A){
                const R = U[A], W = R.start, Z = R.count;
                for(let j = W, K = W + Z; j < K; j += 3)E(t.getX(j + 0), t.getX(j + 1), t.getX(j + 2));
            }
            const N = new z, $ = new z, k = new z, B = new z;
            function I(A) {
                k.fromBufferAttribute(n, A), B.copy(k);
                const X = h[A];
                N.copy(X), N.sub(k.multiplyScalar(k.dot(X))).normalize(), $.crossVectors(B, X);
                const W = $.dot(o[A]) < 0 ? -1 : 1;
                l.setXYZW(A, N.x, N.y, N.z, W);
            }
            for(let A = 0, X = U.length; A < X; ++A){
                const R = U[A], W = R.start, Z = R.count;
                for(let j = W, K = W + Z; j < K; j += 3)I(t.getX(j + 0)), I(t.getX(j + 1)), I(t.getX(j + 2));
            }
        }
        computeVertexNormals() {
            const t = this.index, e = this.getAttribute("position");
            if (e !== void 0) {
                let r = this.getAttribute("normal");
                if (r === void 0) r = new Dt(new Float32Array(e.count * 3), 3), this.setAttribute("normal", r);
                else for(let m = 0, y = r.count; m < y; m++)r.setXYZ(m, 0, 0, 0);
                const n = new z, i = new z, l = new z, h = new z, o = new z, c = new z, d = new z, f = new z;
                if (t) for(let m = 0, y = t.count; m < y; m += 3){
                    const g = t.getX(m + 0), b = t.getX(m + 1), C = t.getX(m + 2);
                    n.fromBufferAttribute(e, g), i.fromBufferAttribute(e, b), l.fromBufferAttribute(e, C), d.subVectors(l, i), f.subVectors(n, i), d.cross(f), h.fromBufferAttribute(r, g), o.fromBufferAttribute(r, b), c.fromBufferAttribute(r, C), h.add(d), o.add(d), c.add(d), r.setXYZ(g, h.x, h.y, h.z), r.setXYZ(b, o.x, o.y, o.z), r.setXYZ(C, c.x, c.y, c.z);
                }
                else for(let m = 0, y = e.count; m < y; m += 3)n.fromBufferAttribute(e, m + 0), i.fromBufferAttribute(e, m + 1), l.fromBufferAttribute(e, m + 2), d.subVectors(l, i), f.subVectors(n, i), d.cross(f), r.setXYZ(m + 0, d.x, d.y, d.z), r.setXYZ(m + 1, d.x, d.y, d.z), r.setXYZ(m + 2, d.x, d.y, d.z);
                this.normalizeNormals(), r.needsUpdate = !0;
            }
        }
        normalizeNormals() {
            const t = this.attributes.normal;
            for(let e = 0, r = t.count; e < r; e++)nt.fromBufferAttribute(t, e), nt.normalize(), t.setXYZ(e, nt.x, nt.y, nt.z);
        }
        toNonIndexed() {
            function t(h, o) {
                const c = h.array, d = h.itemSize, f = h.normalized, m = new c.constructor(o.length * d);
                let y = 0, g = 0;
                for(let b = 0, C = o.length; b < C; b++){
                    h.isInterleavedBufferAttribute ? y = o[b] * h.data.stride + h.offset : y = o[b] * d;
                    for(let E = 0; E < d; E++)m[g++] = c[y++];
                }
                return new Dt(m, d, f);
            }
            if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
            const e = new wr, r = this.index.array, n = this.attributes;
            for(const h in n){
                const o = n[h], c = t(o, r);
                e.setAttribute(h, c);
            }
            const i = this.morphAttributes;
            for(const h in i){
                const o = [], c = i[h];
                for(let d = 0, f = c.length; d < f; d++){
                    const m = c[d], y = t(m, r);
                    o.push(y);
                }
                e.morphAttributes[h] = o;
            }
            e.morphTargetsRelative = this.morphTargetsRelative;
            const l = this.groups;
            for(let h = 0, o = l.length; h < o; h++){
                const c = l[h];
                e.addGroup(c.start, c.count, c.materialIndex);
            }
            return e;
        }
        toJSON() {
            const t = {
                metadata: {
                    version: 4.6,
                    type: "BufferGeometry",
                    generator: "BufferGeometry.toJSON"
                }
            };
            if (t.uuid = this.uuid, t.type = this.type, this.name !== "" && (t.name = this.name), Object.keys(this.userData).length > 0 && (t.userData = this.userData), this.parameters !== void 0) {
                const o = this.parameters;
                for(const c in o)o[c] !== void 0 && (t[c] = o[c]);
                return t;
            }
            t.data = {
                attributes: {}
            };
            const e = this.index;
            e !== null && (t.data.index = {
                type: e.array.constructor.name,
                array: Array.prototype.slice.call(e.array)
            });
            const r = this.attributes;
            for(const o in r){
                const c = r[o];
                t.data.attributes[o] = c.toJSON(t.data);
            }
            const n = {};
            let i = !1;
            for(const o in this.morphAttributes){
                const c = this.morphAttributes[o], d = [];
                for(let f = 0, m = c.length; f < m; f++){
                    const y = c[f];
                    d.push(y.toJSON(t.data));
                }
                d.length > 0 && (n[o] = d, i = !0);
            }
            i && (t.data.morphAttributes = n, t.data.morphTargetsRelative = this.morphTargetsRelative);
            const l = this.groups;
            l.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(l)));
            const h = this.boundingSphere;
            return h !== null && (t.data.boundingSphere = {
                center: h.center.toArray(),
                radius: h.radius
            }), t;
        }
        clone() {
            return new this.constructor().copy(this);
        }
        copy(t) {
            this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
            const e = {};
            this.name = t.name;
            const r = t.index;
            r !== null && this.setIndex(r.clone(e));
            const n = t.attributes;
            for(const c in n){
                const d = n[c];
                this.setAttribute(c, d.clone(e));
            }
            const i = t.morphAttributes;
            for(const c in i){
                const d = [], f = i[c];
                for(let m = 0, y = f.length; m < y; m++)d.push(f[m].clone(e));
                this.morphAttributes[c] = d;
            }
            this.morphTargetsRelative = t.morphTargetsRelative;
            const l = t.groups;
            for(let c = 0, d = l.length; c < d; c++){
                const f = l[c];
                this.addGroup(f.start, f.count, f.materialIndex);
            }
            const h = t.boundingBox;
            h !== null && (this.boundingBox = h.clone());
            const o = t.boundingSphere;
            return o !== null && (this.boundingSphere = o.clone()), this.drawRange.start = t.drawRange.start, this.drawRange.count = t.drawRange.count, this.userData = t.userData, this;
        }
        dispose() {
            this.dispatchEvent({
                type: "dispose"
            });
        }
    }
    typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", {
        detail: {
            revision: "174"
        }
    }));
    typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = "174");
    function ci(x, t) {
        const e = x.split(/\r?\n/), r = [], n = [];
        for(let f = 0; f < e.length; f++){
            const m = e[f];
            (f & 262143) === 0 && t && t(f / e.length);
            const y = m.trim();
            if (!y || y[0] === "#" || y[0] === "/") continue;
            const g = y.split(/[\s,;]+/);
            if (g.length < 3) continue;
            const b = +g[0], C = +g[1], E = +g[2];
            if (!(!isFinite(b) || !isFinite(C) || !isFinite(E))) if (r.push(b, E, -C), g.length >= 6 && isFinite(+g[g.length - 3])) {
                let U = +g[g.length - 3], N = +g[g.length - 2], $ = +g[g.length - 1];
                (U > 1 || N > 1 || $ > 1) && (U /= 255, N /= 255, $ /= 255), n.push(U, N, $);
            } else if (g.length >= 4 && isFinite(+g[3])) {
                const U = Math.min(1, +g[3] / (+g[3] > 1 ? 255 : 1));
                n.push(U, U, U);
            } else n.push(.7, .68, .65);
        }
        const i = r.length / 3;
        if (i < 10) return null;
        let l = 1 / 0, h = 1 / 0, o = 1 / 0;
        for(let f = 0; f < r.length; f += 3)r[f] < l && (l = r[f]), r[f + 1] < h && (h = r[f + 1]), r[f + 2] < o && (o = r[f + 2]);
        for(let f = 0; f < r.length; f += 3)r[f] -= l, r[f + 1] -= h, r[f + 2] -= o;
        const c = Float32Array.from(r), d = Ne(c);
        return {
            positions: c,
            colors: Float32Array.from(n),
            count: i,
            origin: {
                x: l + d.cx,
                y: h + d.cy,
                z: o + d.cz
            }
        };
    }
    function Ne(x) {
        let t = 1 / 0, e = -1 / 0, r = 1 / 0, n = 1 / 0, i = -1 / 0;
        for(let o = 0; o < x.length; o += 3)t = Math.min(t, x[o]), e = Math.max(e, x[o]), r = Math.min(r, x[o + 1]), n = Math.min(n, x[o + 2]), i = Math.max(i, x[o + 2]);
        const l = (t + e) / 2, h = (n + i) / 2;
        for(let o = 0; o < x.length; o += 3)x[o] -= l, x[o + 1] -= r, x[o + 2] -= h;
        return {
            cx: l,
            cy: r,
            cz: h
        };
    }
    function gr(x, t, e, r = Math.random) {
        for(let n = e - 1; n > 0; n--){
            const i = r() * (n + 1) | 0;
            for(let l = 0; l < 3; l++){
                const h = n * 3 + l, o = i * 3 + l;
                let c = x[h];
                x[h] = x[o], x[o] = c, c = t[h], t[h] = t[o], t[o] = c;
            }
        }
    }
    function As(x) {
        return ()=>{
            let t = x += 1831565813;
            return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    const oi = .32, Le = 260, Ss = 150, mr = 3.5, De = 5, xe = 7, _r = 11;
    function xr(x, t) {
        return 3.1 * Math.sin(x / 41) + 2.2 * Math.cos(t / 33) + 1.3 * Math.sin((x + t) / 17.5) + .55 * Math.sin((x - 2 * t) / 9.3) + 6;
    }
    function Ts(x) {
        return 6.4 + 2.7 * Math.sin(x / 57) + .9 * Math.sin(x / 23 + 1.1);
    }
    function Cs(x, t, e, r, n) {
        const i = Math.abs(t), l = xr(e, r);
        if (i > xe + _r) return n.y = l, n.kind = 0, n;
        const h = Ts(x);
        if (i <= mr) return n.y = h - .025 * i, n.kind = 1, n;
        if (i <= De) return n.y = h - .088 - .05 * (i - mr), n.kind = 2, n;
        const o = h - .088 - .05 * (De - mr);
        if (i <= xe) {
            const f = (i - De) / (xe - De), m = o - .85;
            return n.y = f <= .5 ? o + (m - o) * (f / .5) : m + (o - .12 - m) * ((f - .5) / .5), n.kind = 3, n;
        }
        const c = (i - xe) / _r, d = c * c * (3 - 2 * c);
        return n.y = o * (1 - d) + l * d, n.kind = d > .75 ? 0 : 4, n;
    }
    function Es(x = 42e4) {
        const t = As(20260803), e = ()=>t() + t() + t() - 1.5, r = new Float32Array(x * 3), n = new Float32Array(x * 3);
        let i = 0;
        const l = (R, W, Z, j, K, Q)=>{
            r[i * 3] = R, r[i * 3 + 1] = W, r[i * 3 + 2] = Z, n[i * 3] = j, n[i * 3 + 1] = K, n[i * 3 + 2] = Q, i++;
        }, h = Math.cos(oi), o = Math.sin(oi), c = {
            y: 0,
            kind: 0
        }, d = (R, W)=>{
            const Z = h * R - o * W, j = o * R + h * W;
            Cs(R, W, Z, j, c);
            const K = c.y + e() * .018;
            let Q, J, G;
            if (c.kind === 1) {
                const V = .2 + t() * .05, st = Math.abs(Math.abs(W) - 3.2) < .06 || Math.abs(W) < .08 && R % 9 < 5;
                Q = st ? .85 : V, J = st ? .84 : V + .005, G = st ? .8 : V + .02;
            } else if (c.kind === 2) {
                const V = .42 + t() * .08;
                Q = V, J = V - .03, G = V - .09;
            } else if (c.kind === 3) {
                const V = .3 + t() * .07;
                Q = V, J = V + .05, G = V - .06;
            } else if (c.kind === 4) {
                const V = .34 + t() * .07;
                Q = V + .04, J = V + .02, G = V - .08;
            } else {
                const V = Math.min(1, Math.max(0, (c.y - 4) / 6));
                Q = .22 + V * .26 + t() * .05, J = .36 + V * .18 + t() * .06, G = .16 + V * .12 + t() * .04;
            }
            l(Z, K, j, Q, J, G);
        }, f = Math.floor(x * .5), m = Math.floor(x * .32), y = Math.floor(x * .13);
        for(let R = 0; R < f; R++)d((t() - .5) * Le, (t() - .5) * 2 * (xe + _r));
        for(let R = 0; R < m; R++)d((t() - .5) * Le, (t() - .5) * Ss);
        const g = 22, b = i + y;
        for(; i < b;){
            const R = Math.floor(t() * g), W = R * 71.3 % Le - Le / 2, Z = (R % 2 ? 1 : -1) * (24 + R * 13.7 % 46), j = h * W - o * Z, K = o * W + h * Z, Q = xr(j, K), J = 1.9 + R % 4 * .55, G = t() * Math.PI * 2, V = Math.acos(2 * t() - 1), st = J * Math.cbrt(t());
            l(j + st * Math.sin(V) * Math.cos(G), Q + 2.6 + J * .9 + st * Math.cos(V), K + st * Math.sin(V) * Math.sin(G), .13 + t() * .07, .27 + t() * .13, .11 + t() * .05);
        }
        const C = -58, E = 34, U = h * C - o * E, N = o * C + h * E, $ = xr(U, N), k = 14, B = 9, I = 6.5;
        for(; i < x;){
            const R = Math.floor(t() * 4), W = t(), Z = R < 2 ? (W - .5) * k : (R === 2 ? -.5 : .5) * k, j = R < 2 ? (R === 0 ? -.5 : .5) * B : (W - .5) * B, K = $ + t() * I, Q = .55 + e() * .06 - (K - $) * .02;
            l(U + h * Z - o * j + e() * .03, K, N + o * Z + h * j + e() * .03, Q, Q - .03, Q - .08);
        }
        gr(r, n, x, t);
        const A = new wr;
        A.setAttribute("position", new Dt(r, 3)), A.setAttribute("aColor", new Dt(n, 3)), A.computeBoundingSphere();
        const X = A.boundingSphere;
        return {
            geometry: A,
            positions: r,
            count: x,
            center: X.center.clone(),
            radius: X.radius
        };
    }
    var vt = {}, pr = {
        exports: {}
    }, hi;
    function zs() {
        return hi || (hi = 1, (function(x, t) {
            var e = (()=>{
                var r = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0;
                return (function(n) {
                    n = n || {};
                    var i = typeof n < "u" ? n : {}, l, h;
                    i.ready = new Promise(function(s, a) {
                        l = s, h = a;
                    }), [
                        "_main",
                        "___getTypeName",
                        "__embind_initialize_bindings",
                        "_fflush",
                        "onRuntimeInitialized"
                    ].forEach((s)=>{
                        Object.getOwnPropertyDescriptor(i.ready, s) || Object.defineProperty(i.ready, s, {
                            get: ()=>ct("You are getting " + s + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),
                            set: ()=>ct("You are setting " + s + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")
                        });
                    });
                    var o = Object.assign({}, i), c = "./this.program", d = !0;
                    if (i.ENVIRONMENT) throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
                    var f = "";
                    function m(s) {
                        return i.locateFile ? i.locateFile(s, f) : f + s;
                    }
                    var y;
                    if (typeof document < "u" && document.currentScript && (f = document.currentScript.src), r && (f = r), f.indexOf("blob:") !== 0 ? f = f.substr(0, f.replace(/[?#].*/, "").lastIndexOf("/") + 1) : f = "", !(typeof window == "object" || typeof importScripts == "function")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
                    var g = i.print || console.log.bind(console), b = i.printErr || console.warn.bind(console);
                    Object.assign(i, o), o = null, Kn(), i.arguments && i.arguments, C("arguments", "arguments_"), i.thisProgram && (c = i.thisProgram), C("thisProgram", "thisProgram"), i.quit && i.quit, C("quit", "quit_"), A(typeof i.memoryInitializerPrefixURL > "u", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"), A(typeof i.pthreadMainPrefixURL > "u", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"), A(typeof i.cdInitializerPrefixURL > "u", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"), A(typeof i.filePackagePrefixURL > "u", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead"), A(typeof i.read > "u", "Module.read option was removed (modify read_ in JS)"), A(typeof i.readAsync > "u", "Module.readAsync option was removed (modify readAsync in JS)"), A(typeof i.readBinary > "u", "Module.readBinary option was removed (modify readBinary in JS)"), A(typeof i.setWindowTitle > "u", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)"), A(typeof i.TOTAL_MEMORY > "u", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"), C("read", "read_"), C("readAsync", "readAsync"), C("readBinary", "readBinary"), C("setWindowTitle", "setWindowTitle"), A(!0, "worker environment detected but not enabled at build time.  Add 'worker' to `-sENVIRONMENT` to enable."), A(!0, "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable."), A(!0, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");
                    function C(s, a) {
                        Object.getOwnPropertyDescriptor(i, s) || Object.defineProperty(i, s, {
                            configurable: !0,
                            get: function() {
                                ct("Module." + s + " has been replaced with plain " + a + " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
                            }
                        });
                    }
                    function E(s) {
                        Object.getOwnPropertyDescriptor(i, s) && ct("`Module." + s + "` was supplied but `" + s + "` not included in INCOMING_MODULE_JS_API");
                    }
                    function U(s) {
                        return s === "FS_createPath" || s === "FS_createDataFile" || s === "FS_createPreloadedFile" || s === "FS_unlink" || s === "addRunDependency" || s === "FS_createLazyFile" || s === "FS_createDevice" || s === "removeRunDependency";
                    }
                    function N(s) {
                        typeof globalThis < "u" && !Object.getOwnPropertyDescriptor(globalThis, s) && Object.defineProperty(globalThis, s, {
                            configurable: !0,
                            get: function() {
                                var a = "`" + s + "` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line";
                                U(s) && (a += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"), Nt(a);
                            }
                        });
                    }
                    function $(s) {
                        Object.getOwnPropertyDescriptor(i, s) || Object.defineProperty(i, s, {
                            configurable: !0,
                            get: function() {
                                var a = "'" + s + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
                                U(s) && (a += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"), ct(a);
                            }
                        });
                    }
                    var k;
                    i.wasmBinary && (k = i.wasmBinary), C("wasmBinary", "wasmBinary"), i.noExitRuntime, C("noExitRuntime", "noExitRuntime"), typeof WebAssembly != "object" && ct("no native wasm support detected");
                    var B, I = !1;
                    function A(s, a) {
                        s || ct("Assertion failed" + (a ? ": " + a : ""));
                    }
                    var X = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0;
                    function R(s, a, u) {
                        for(var p = a + u, _ = a; s[_] && !(_ >= p);)++_;
                        if (_ - a > 16 && s.buffer && X) return X.decode(s.subarray(a, _));
                        for(var v = ""; a < _;){
                            var M = s[a++];
                            if (!(M & 128)) {
                                v += String.fromCharCode(M);
                                continue;
                            }
                            var w = s[a++] & 63;
                            if ((M & 224) == 192) {
                                v += String.fromCharCode((M & 31) << 6 | w);
                                continue;
                            }
                            var T = s[a++] & 63;
                            if ((M & 240) == 224 ? M = (M & 15) << 12 | w << 6 | T : ((M & 248) != 240 && Nt("Invalid UTF-8 leading byte 0x" + M.toString(16) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), M = (M & 7) << 18 | w << 12 | T << 6 | s[a++] & 63), M < 65536) v += String.fromCharCode(M);
                            else {
                                var F = M - 65536;
                                v += String.fromCharCode(55296 | F >> 10, 56320 | F & 1023);
                            }
                        }
                        return v;
                    }
                    function W(s, a) {
                        return s ? R(G, s, a) : "";
                    }
                    function Z(s, a, u, p) {
                        if (!(p > 0)) return 0;
                        for(var _ = u, v = u + p - 1, M = 0; M < s.length; ++M){
                            var w = s.charCodeAt(M);
                            if (w >= 55296 && w <= 57343) {
                                var T = s.charCodeAt(++M);
                                w = 65536 + ((w & 1023) << 10) | T & 1023;
                            }
                            if (w <= 127) {
                                if (u >= v) break;
                                a[u++] = w;
                            } else if (w <= 2047) {
                                if (u + 1 >= v) break;
                                a[u++] = 192 | w >> 6, a[u++] = 128 | w & 63;
                            } else if (w <= 65535) {
                                if (u + 2 >= v) break;
                                a[u++] = 224 | w >> 12, a[u++] = 128 | w >> 6 & 63, a[u++] = 128 | w & 63;
                            } else {
                                if (u + 3 >= v) break;
                                w > 1114111 && Nt("Invalid Unicode code point 0x" + w.toString(16) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF)."), a[u++] = 240 | w >> 18, a[u++] = 128 | w >> 12 & 63, a[u++] = 128 | w >> 6 & 63, a[u++] = 128 | w & 63;
                            }
                        }
                        return a[u] = 0, u - _;
                    }
                    function j(s, a, u) {
                        return A(typeof u == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), Z(s, G, a, u);
                    }
                    function K(s) {
                        for(var a = 0, u = 0; u < s.length; ++u){
                            var p = s.charCodeAt(u);
                            p <= 127 ? a++ : p <= 2047 ? a += 2 : p >= 55296 && p <= 57343 ? (a += 4, ++u) : a += 3;
                        }
                        return a;
                    }
                    var Q, J, G, V, st, q, Y, Sr, Tr;
                    function Cr(s) {
                        Q = s, i.HEAP8 = J = new Int8Array(s), i.HEAP16 = V = new Int16Array(s), i.HEAP32 = q = new Int32Array(s), i.HEAPU8 = G = new Uint8Array(s), i.HEAPU16 = st = new Uint16Array(s), i.HEAPU32 = Y = new Uint32Array(s), i.HEAPF32 = Sr = new Float32Array(s), i.HEAPF64 = Tr = new Float64Array(s);
                    }
                    var $e = 65536;
                    i.TOTAL_STACK && A($e === i.TOTAL_STACK, "the stack size can no longer be determined at runtime");
                    var Ve = i.INITIAL_MEMORY || 262144;
                    C("INITIAL_MEMORY", "INITIAL_MEMORY"), A(Ve >= $e, "INITIAL_MEMORY should be larger than TOTAL_STACK, was " + Ve + "! (TOTAL_STACK=" + $e + ")"), A(typeof Int32Array < "u" && typeof Float64Array < "u" && Int32Array.prototype.subarray != null && Int32Array.prototype.set != null, "JS engine does not provide full typed array support"), A(!i.wasmMemory, "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally"), A(Ve == 262144, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
                    var ve;
                    function mi() {
                        var s = sr();
                        A((s & 3) == 0), Y[s >> 2] = 34821223, Y[s + 4 >> 2] = 2310721022, Y[0] = 1668509029;
                    }
                    function Ye() {
                        if (!I) {
                            var s = sr(), a = Y[s >> 2], u = Y[s + 4 >> 2];
                            (a != 34821223 || u != 2310721022) && ct("Stack overflow! Stack cookie has been overwritten at 0x" + s.toString(16) + ", expected hex dwords 0x89BACDFE and 0x2135467, but received 0x" + u.toString(16) + " 0x" + a.toString(16)), Y[0] !== 1668509029 && ct("Runtime error: The application has corrupted its heap memory area (address zero)!");
                        }
                    }
                    (function() {
                        var s = new Int16Array(1), a = new Int8Array(s.buffer);
                        if (s[0] = 25459, a[0] !== 115 || a[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
                    })();
                    var Er = [], zr = [], Fr = [], He = !1;
                    function pi() {
                        if (i.preRun) for(typeof i.preRun == "function" && (i.preRun = [
                            i.preRun
                        ]); i.preRun.length;)_i(i.preRun.shift());
                        je(Er);
                    }
                    function yi() {
                        A(!He), He = !0, Ye(), je(zr);
                    }
                    function gi() {
                        if (Ye(), i.postRun) for(typeof i.postRun == "function" && (i.postRun = [
                            i.postRun
                        ]); i.postRun.length;)bi(i.postRun.shift());
                        je(Fr);
                    }
                    function _i(s) {
                        Er.unshift(s);
                    }
                    function xi(s) {
                        zr.unshift(s);
                    }
                    function bi(s) {
                        Fr.unshift(s);
                    }
                    A(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), A(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), A(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), A(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
                    var Bt = 0, Wt = null, ae = null, oe = {};
                    function wi(s) {
                        Bt++, i.monitorRunDependencies && i.monitorRunDependencies(Bt), A(!oe[s]), oe[s] = 1, Wt === null && typeof setInterval < "u" && (Wt = setInterval(function() {
                            if (I) {
                                clearInterval(Wt), Wt = null;
                                return;
                            }
                            var a = !1;
                            for(var u in oe)a || (a = !0, b("still waiting on run dependencies:")), b("dependency: " + u);
                            a && b("(end of list)");
                        }, 1e4));
                    }
                    function vi(s) {
                        if (Bt--, i.monitorRunDependencies && i.monitorRunDependencies(Bt), A(oe[s]), delete oe[s], Bt == 0 && (Wt !== null && (clearInterval(Wt), Wt = null), ae)) {
                            var a = ae;
                            ae = null, a();
                        }
                    }
                    function ct(s) {
                        i.onAbort && i.onAbort(s), s = "Aborted(" + s + ")", b(s), I = !0;
                        var a = new WebAssembly.RuntimeError(s);
                        throw h(a), a;
                    }
                    var yt = {
                        error: function() {
                            ct("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM");
                        },
                        init: function() {
                            yt.error();
                        },
                        createDataFile: function() {
                            yt.error();
                        },
                        createPreloadedFile: function() {
                            yt.error();
                        },
                        createLazyFile: function() {
                            yt.error();
                        },
                        open: function() {
                            yt.error();
                        },
                        mkdev: function() {
                            yt.error();
                        },
                        registerDevice: function() {
                            yt.error();
                        },
                        analyzePath: function() {
                            yt.error();
                        },
                        loadFilesFromDB: function() {
                            yt.error();
                        },
                        ErrnoError: function() {
                            yt.error();
                        }
                    };
                    i.FS_createDataFile = yt.createDataFile, i.FS_createPreloadedFile = yt.createPreloadedFile;
                    var Mi = "data:application/octet-stream;base64,";
                    function Pr(s) {
                        return s.startsWith(Mi);
                    }
                    function Ai(s) {
                        return s.startsWith("file://");
                    }
                    function at(s, a) {
                        return function() {
                            var u = s, p = a;
                            return p = i.asm, A(He, "native function `" + u + "` called before runtime initialization"), p[s] || A(p[s], "exported native function `" + u + "` not found"), p[s].apply(null, arguments);
                        };
                    }
                    var ft;
                    ft = "laz-perf.wasm", Pr(ft) || (ft = m(ft));
                    function kr(s) {
                        try {
                            if (s == ft && k) return new Uint8Array(k);
                            throw "both async and sync fetching of the wasm failed";
                        } catch (a) {
                            ct(a);
                        }
                    }
                    function Si() {
                        return !k && d && typeof fetch == "function" ? fetch(ft, {
                            credentials: "same-origin"
                        }).then(function(s) {
                            if (!s.ok) throw "failed to load wasm binary file at '" + ft + "'";
                            return s.arrayBuffer();
                        }).catch(function() {
                            return kr(ft);
                        }) : Promise.resolve().then(function() {
                            return kr(ft);
                        });
                    }
                    function Ti() {
                        var s = {
                            env: Xr,
                            wasi_snapshot_preview1: Xr
                        };
                        function a(w, T) {
                            var F = w.exports;
                            i.asm = F, B = i.asm.memory, A(B, "memory not found in wasm exports"), Cr(B.buffer), ve = i.asm.__indirect_function_table, A(ve, "table not found in wasm exports"), xi(i.asm.__wasm_call_ctors), vi("wasm-instantiate");
                        }
                        wi("wasm-instantiate");
                        var u = i;
                        function p(w) {
                            A(i === u, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"), u = null, a(w.instance);
                        }
                        function _(w) {
                            return Si().then(function(T) {
                                return WebAssembly.instantiate(T, s);
                            }).then(function(T) {
                                return T;
                            }).then(w, function(T) {
                                b("failed to asynchronously prepare wasm: " + T), Ai(ft) && b("warning: Loading from a file URI (" + ft + ") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing"), ct(T);
                            });
                        }
                        function v() {
                            return !k && typeof WebAssembly.instantiateStreaming == "function" && !Pr(ft) && typeof fetch == "function" ? fetch(ft, {
                                credentials: "same-origin"
                            }).then(function(w) {
                                var T = WebAssembly.instantiateStreaming(w, s);
                                return T.then(p, function(F) {
                                    return b("wasm streaming compile failed: " + F), b("falling back to ArrayBuffer instantiation"), _(p);
                                });
                            }) : _(p);
                        }
                        if (i.instantiateWasm) try {
                            var M = i.instantiateWasm(s, a);
                            return M;
                        } catch (w) {
                            return b("Module.instantiateWasm callback failed with error: " + w), !1;
                        }
                        return v().catch(h), {};
                    }
                    function je(s) {
                        for(; s.length > 0;)s.shift()(i);
                    }
                    function Nt(s) {
                        Nt.shown || (Nt.shown = {}), Nt.shown[s] || (Nt.shown[s] = 1, b(s));
                    }
                    function Ci(s, a) {
                        A(s.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)"), J.set(s, a);
                    }
                    function Ei(s) {
                        return nr(s + 24) + 24;
                    }
                    function zi(s) {
                        this.excPtr = s, this.ptr = s - 24, this.set_type = function(a) {
                            Y[this.ptr + 4 >> 2] = a;
                        }, this.get_type = function() {
                            return Y[this.ptr + 4 >> 2];
                        }, this.set_destructor = function(a) {
                            Y[this.ptr + 8 >> 2] = a;
                        }, this.get_destructor = function() {
                            return Y[this.ptr + 8 >> 2];
                        }, this.set_refcount = function(a) {
                            q[this.ptr >> 2] = a;
                        }, this.set_caught = function(a) {
                            a = a ? 1 : 0, J[this.ptr + 12 >> 0] = a;
                        }, this.get_caught = function() {
                            return J[this.ptr + 12 >> 0] != 0;
                        }, this.set_rethrown = function(a) {
                            a = a ? 1 : 0, J[this.ptr + 13 >> 0] = a;
                        }, this.get_rethrown = function() {
                            return J[this.ptr + 13 >> 0] != 0;
                        }, this.init = function(a, u) {
                            this.set_adjusted_ptr(0), this.set_type(a), this.set_destructor(u), this.set_refcount(0), this.set_caught(!1), this.set_rethrown(!1);
                        }, this.add_ref = function() {
                            var a = q[this.ptr >> 2];
                            q[this.ptr >> 2] = a + 1;
                        }, this.release_ref = function() {
                            var a = q[this.ptr >> 2];
                            return q[this.ptr >> 2] = a - 1, A(a > 0), a === 1;
                        }, this.set_adjusted_ptr = function(a) {
                            Y[this.ptr + 16 >> 2] = a;
                        }, this.get_adjusted_ptr = function() {
                            return Y[this.ptr + 16 >> 2];
                        }, this.get_exception_ptr = function() {
                            var a = es(this.get_type());
                            if (a) return Y[this.excPtr >> 2];
                            var u = this.get_adjusted_ptr();
                            return u !== 0 ? u : this.excPtr;
                        };
                    }
                    function Fi(s, a, u) {
                        var p = new zi(s);
                        throw p.init(a, u), s + " - Exception catching is disabled, this exception cannot be caught. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.";
                    }
                    function Pi(s, a, u, p, _) {}
                    function Ge(s) {
                        switch(s){
                            case 1:
                                return 0;
                            case 2:
                                return 1;
                            case 4:
                                return 2;
                            case 8:
                                return 3;
                            default:
                                throw new TypeError("Unknown type size: " + s);
                        }
                    }
                    function ki() {
                        for(var s = new Array(256), a = 0; a < 256; ++a)s[a] = String.fromCharCode(a);
                        Ir = s;
                    }
                    var Ir = void 0;
                    function gt(s) {
                        for(var a = "", u = s; G[u];)a += Ir[G[u++]];
                        return a;
                    }
                    var jt = {}, Gt = {}, Me = {}, Ii = 48, Ri = 57;
                    function Rr(s) {
                        if (s === void 0) return "_unknown";
                        s = s.replace(/[^a-zA-Z0-9_]/g, "$");
                        var a = s.charCodeAt(0);
                        return a >= Ii && a <= Ri ? "_" + s : s;
                    }
                    function Ur(s, a) {
                        return s = Rr(s), function() {
                            return a.apply(this, arguments);
                        };
                    }
                    function qe(s, a) {
                        var u = Ur(a, function(p) {
                            this.name = a, this.message = p;
                            var _ = new Error(p).stack;
                            _ !== void 0 && (this.stack = this.toString() + `
` + _.replace(/^Error(:[^\n]*)?\n/, ""));
                        });
                        return u.prototype = Object.create(s.prototype), u.prototype.constructor = u, u.prototype.toString = function() {
                            return this.message === void 0 ? this.name : this.name + ": " + this.message;
                        }, u;
                    }
                    var qt = void 0;
                    function H(s) {
                        throw new qt(s);
                    }
                    var Or = void 0;
                    function Ae(s) {
                        throw new Or(s);
                    }
                    function he(s, a, u) {
                        s.forEach(function(w) {
                            Me[w] = a;
                        });
                        function p(w) {
                            var T = u(w);
                            T.length !== s.length && Ae("Mismatched type converter count");
                            for(var F = 0; F < s.length; ++F)Ct(s[F], T[F]);
                        }
                        var _ = new Array(a.length), v = [], M = 0;
                        a.forEach((w, T)=>{
                            Gt.hasOwnProperty(w) ? _[T] = Gt[w] : (v.push(w), jt.hasOwnProperty(w) || (jt[w] = []), jt[w].push(()=>{
                                _[T] = Gt[w], ++M, M === v.length && p(_);
                            }));
                        }), v.length === 0 && p(_);
                    }
                    function Ct(s, a, u = {}) {
                        if (!("argPackAdvance" in a)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
                        var p = a.name;
                        if (s || H('type "' + p + '" must have a positive integer typeid pointer'), Gt.hasOwnProperty(s)) {
                            if (u.ignoreDuplicateRegistrations) return;
                            H("Cannot register type '" + p + "' twice");
                        }
                        if (Gt[s] = a, delete Me[s], jt.hasOwnProperty(s)) {
                            var _ = jt[s];
                            delete jt[s], _.forEach((v)=>v());
                        }
                    }
                    function Ui(s, a, u, p, _) {
                        var v = Ge(u);
                        a = gt(a), Ct(s, {
                            name: a,
                            fromWireType: function(M) {
                                return !!M;
                            },
                            toWireType: function(M, w) {
                                return w ? p : _;
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: function(M) {
                                var w;
                                if (u === 1) w = J;
                                else if (u === 2) w = V;
                                else if (u === 4) w = q;
                                else throw new TypeError("Unknown boolean type size: " + a);
                                return this.fromWireType(w[M >> v]);
                            },
                            destructorFunction: null
                        });
                    }
                    function Oi(s) {
                        if (!(this instanceof kt) || !(s instanceof kt)) return !1;
                        for(var a = this.$$.ptrType.registeredClass, u = this.$$.ptr, p = s.$$.ptrType.registeredClass, _ = s.$$.ptr; a.baseClass;)u = a.upcast(u), a = a.baseClass;
                        for(; p.baseClass;)_ = p.upcast(_), p = p.baseClass;
                        return a === p && u === _;
                    }
                    function Li(s) {
                        return {
                            count: s.count,
                            deleteScheduled: s.deleteScheduled,
                            preservePointerOnDelete: s.preservePointerOnDelete,
                            ptr: s.ptr,
                            ptrType: s.ptrType,
                            smartPtr: s.smartPtr,
                            smartPtrType: s.smartPtrType
                        };
                    }
                    function Xe(s) {
                        function a(u) {
                            return u.$$.ptrType.registeredClass.name;
                        }
                        H(a(s) + " instance already deleted");
                    }
                    var Ze = !1;
                    function Lr(s) {}
                    function Di(s) {
                        s.smartPtr ? s.smartPtrType.rawDestructor(s.smartPtr) : s.ptrType.registeredClass.rawDestructor(s.ptr);
                    }
                    function Dr(s) {
                        s.count.value -= 1;
                        var a = s.count.value === 0;
                        a && Di(s);
                    }
                    function Br(s, a, u) {
                        if (a === u) return s;
                        if (u.baseClass === void 0) return null;
                        var p = Br(s, a, u.baseClass);
                        return p === null ? null : u.downcast(p);
                    }
                    var Wr = {};
                    function Bi() {
                        return Object.keys(ce).length;
                    }
                    function Wi() {
                        var s = [];
                        for(var a in ce)ce.hasOwnProperty(a) && s.push(ce[a]);
                        return s;
                    }
                    var le = [];
                    function Je() {
                        for(; le.length;){
                            var s = le.pop();
                            s.$$.deleteScheduled = !1, s.delete();
                        }
                    }
                    var ue = void 0;
                    function Ni(s) {
                        ue = s, le.length && ue && ue(Je);
                    }
                    function $i() {
                        i.getInheritedInstanceCount = Bi, i.getLiveInheritedInstances = Wi, i.flushPendingDeletes = Je, i.setDelayFunction = Ni;
                    }
                    var ce = {};
                    function Vi(s, a) {
                        for(a === void 0 && H("ptr should not be undefined"); s.baseClass;)a = s.upcast(a), s = s.baseClass;
                        return a;
                    }
                    function Yi(s, a) {
                        return a = Vi(s, a), ce[a];
                    }
                    function Se(s, a) {
                        (!a.ptrType || !a.ptr) && Ae("makeClassHandle requires ptr and ptrType");
                        var u = !!a.smartPtrType, p = !!a.smartPtr;
                        return u !== p && Ae("Both smartPtrType and smartPtr must be specified"), a.count = {
                            value: 1
                        }, de(Object.create(s, {
                            $$: {
                                value: a
                            }
                        }));
                    }
                    function Nr(s) {
                        var a = this.getPointee(s);
                        if (!a) return this.destructor(s), null;
                        var u = Yi(this.registeredClass, a);
                        if (u !== void 0) {
                            if (u.$$.count.value === 0) return u.$$.ptr = a, u.$$.smartPtr = s, u.clone();
                            var p = u.clone();
                            return this.destructor(s), p;
                        }
                        function _() {
                            return this.isSmartPointer ? Se(this.registeredClass.instancePrototype, {
                                ptrType: this.pointeeType,
                                ptr: a,
                                smartPtrType: this,
                                smartPtr: s
                            }) : Se(this.registeredClass.instancePrototype, {
                                ptrType: this,
                                ptr: s
                            });
                        }
                        var v = this.registeredClass.getActualType(a), M = Wr[v];
                        if (!M) return _.call(this);
                        var w;
                        this.isConst ? w = M.constPointerType : w = M.pointerType;
                        var T = Br(a, this.registeredClass, w.registeredClass);
                        return T === null ? _.call(this) : this.isSmartPointer ? Se(w.registeredClass.instancePrototype, {
                            ptrType: w,
                            ptr: T,
                            smartPtrType: this,
                            smartPtr: s
                        }) : Se(w.registeredClass.instancePrototype, {
                            ptrType: w,
                            ptr: T
                        });
                    }
                    function de(s) {
                        return typeof FinalizationRegistry > "u" ? (de = (a)=>a, s) : (Ze = new FinalizationRegistry((a)=>{
                            console.warn(a.leakWarning.stack.replace(/^Error: /, "")), Dr(a.$$);
                        }), de = (a)=>{
                            var u = a.$$, p = !!u.smartPtr;
                            if (p) {
                                var _ = {
                                    $$: u
                                }, v = u.ptrType.registeredClass;
                                _.leakWarning = new Error("Embind found a leaked C++ instance " + v.name + " <0x" + u.ptr.toString(16) + `>.
We'll free it automatically in this case, but this functionality is not reliable across various environments.
Make sure to invoke .delete() manually once you're done with the instance instead.
Originally allocated`), "captureStackTrace" in Error && Error.captureStackTrace(_.leakWarning, Nr), Ze.register(a, _, a);
                            }
                            return a;
                        }, Lr = (a)=>Ze.unregister(a), de(s));
                    }
                    function Hi() {
                        if (this.$$.ptr || Xe(this), this.$$.preservePointerOnDelete) return this.$$.count.value += 1, this;
                        var s = de(Object.create(Object.getPrototypeOf(this), {
                            $$: {
                                value: Li(this.$$)
                            }
                        }));
                        return s.$$.count.value += 1, s.$$.deleteScheduled = !1, s;
                    }
                    function ji() {
                        this.$$.ptr || Xe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && H("Object already scheduled for deletion"), Lr(this), Dr(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
                    }
                    function Gi() {
                        return !this.$$.ptr;
                    }
                    function qi() {
                        return this.$$.ptr || Xe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && H("Object already scheduled for deletion"), le.push(this), le.length === 1 && ue && ue(Je), this.$$.deleteScheduled = !0, this;
                    }
                    function Xi() {
                        kt.prototype.isAliasOf = Oi, kt.prototype.clone = Hi, kt.prototype.delete = ji, kt.prototype.isDeleted = Gi, kt.prototype.deleteLater = qi;
                    }
                    function kt() {}
                    function $r(s, a, u) {
                        if (s[a].overloadTable === void 0) {
                            var p = s[a];
                            s[a] = function() {
                                return s[a].overloadTable.hasOwnProperty(arguments.length) || H("Function '" + u + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + s[a].overloadTable + ")!"), s[a].overloadTable[arguments.length].apply(this, arguments);
                            }, s[a].overloadTable = [], s[a].overloadTable[p.argCount] = p;
                        }
                    }
                    function Zi(s, a, u) {
                        i.hasOwnProperty(s) ? (H("Cannot register public name '" + s + "' twice"), $r(i, s, s), i.hasOwnProperty(u) && H("Cannot register multiple overloads of a function with the same number of arguments (" + u + ")!"), i[s].overloadTable[u] = a) : i[s] = a;
                    }
                    function Ji(s, a, u, p, _, v, M, w) {
                        this.name = s, this.constructor = a, this.instancePrototype = u, this.rawDestructor = p, this.baseClass = _, this.getActualType = v, this.upcast = M, this.downcast = w, this.pureVirtualFunctions = [];
                    }
                    function Qe(s, a, u) {
                        for(; a !== u;)a.upcast || H("Expected null or instance of " + u.name + ", got an instance of " + a.name), s = a.upcast(s), a = a.baseClass;
                        return s;
                    }
                    function Qi(s, a) {
                        if (a === null) return this.isReference && H("null is not a valid " + this.name), 0;
                        a.$$ || H('Cannot pass "' + Zt(a) + '" as a ' + this.name), a.$$.ptr || H("Cannot pass deleted object as a pointer of type " + this.name);
                        var u = a.$$.ptrType.registeredClass, p = Qe(a.$$.ptr, u, this.registeredClass);
                        return p;
                    }
                    function Ki(s, a) {
                        var u;
                        if (a === null) return this.isReference && H("null is not a valid " + this.name), this.isSmartPointer ? (u = this.rawConstructor(), s !== null && s.push(this.rawDestructor, u), u) : 0;
                        a.$$ || H('Cannot pass "' + Zt(a) + '" as a ' + this.name), a.$$.ptr || H("Cannot pass deleted object as a pointer of type " + this.name), !this.isConst && a.$$.ptrType.isConst && H("Cannot convert argument of type " + (a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name) + " to parameter type " + this.name);
                        var p = a.$$.ptrType.registeredClass;
                        if (u = Qe(a.$$.ptr, p, this.registeredClass), this.isSmartPointer) switch(a.$$.smartPtr === void 0 && H("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy){
                            case 0:
                                a.$$.smartPtrType === this ? u = a.$$.smartPtr : H("Cannot convert argument of type " + (a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name) + " to parameter type " + this.name);
                                break;
                            case 1:
                                u = a.$$.smartPtr;
                                break;
                            case 2:
                                if (a.$$.smartPtrType === this) u = a.$$.smartPtr;
                                else {
                                    var _ = a.clone();
                                    u = this.rawShare(u, rr.toHandle(function() {
                                        _.delete();
                                    })), s !== null && s.push(this.rawDestructor, u);
                                }
                                break;
                            default:
                                H("Unsupporting sharing policy");
                        }
                        return u;
                    }
                    function tn(s, a) {
                        if (a === null) return this.isReference && H("null is not a valid " + this.name), 0;
                        a.$$ || H('Cannot pass "' + Zt(a) + '" as a ' + this.name), a.$$.ptr || H("Cannot pass deleted object as a pointer of type " + this.name), a.$$.ptrType.isConst && H("Cannot convert argument of type " + a.$$.ptrType.name + " to parameter type " + this.name);
                        var u = a.$$.ptrType.registeredClass, p = Qe(a.$$.ptr, u, this.registeredClass);
                        return p;
                    }
                    function Te(s) {
                        return this.fromWireType(q[s >> 2]);
                    }
                    function en(s) {
                        return this.rawGetPointee && (s = this.rawGetPointee(s)), s;
                    }
                    function rn(s) {
                        this.rawDestructor && this.rawDestructor(s);
                    }
                    function nn(s) {
                        s !== null && s.delete();
                    }
                    function sn() {
                        Et.prototype.getPointee = en, Et.prototype.destructor = rn, Et.prototype.argPackAdvance = 8, Et.prototype.readValueFromPointer = Te, Et.prototype.deleteObject = nn, Et.prototype.fromWireType = Nr;
                    }
                    function Et(s, a, u, p, _, v, M, w, T, F, L) {
                        this.name = s, this.registeredClass = a, this.isReference = u, this.isConst = p, this.isSmartPointer = _, this.pointeeType = v, this.sharingPolicy = M, this.rawGetPointee = w, this.rawConstructor = T, this.rawShare = F, this.rawDestructor = L, !_ && a.baseClass === void 0 ? p ? (this.toWireType = Qi, this.destructorFunction = null) : (this.toWireType = tn, this.destructorFunction = null) : this.toWireType = Ki;
                    }
                    function an(s, a, u) {
                        i.hasOwnProperty(s) || Ae("Replacing nonexistant public symbol"), i[s].overloadTable !== void 0 && u !== void 0 || (i[s] = a, i[s].argCount = u);
                    }
                    function on(s, a, u) {
                        A("dynCall_" + s in i, "bad function pointer type - no table for sig '" + s + "'"), u && u.length ? A(u.length === s.substring(1).replace(/j/g, "--").length) : A(s.length == 1);
                        var p = i["dynCall_" + s];
                        return u && u.length ? p.apply(null, [
                            a
                        ].concat(u)) : p.call(null, a);
                    }
                    var Ce = [];
                    function Ke(s) {
                        var a = Ce[s];
                        return a || (s >= Ce.length && (Ce.length = s + 1), Ce[s] = a = ve.get(s)), A(ve.get(s) == a, "JavaScript-side Wasm function table mirror is out of date!"), a;
                    }
                    function hn(s, a, u) {
                        if (s.includes("j")) return on(s, a, u);
                        A(Ke(a), "missing table entry in dynCall: " + a);
                        var p = Ke(a).apply(null, u);
                        return p;
                    }
                    function ln(s, a) {
                        A(s.includes("j") || s.includes("p"), "getDynCaller should only be called with i64 sigs");
                        var u = [];
                        return function() {
                            return u.length = 0, Object.assign(u, arguments), hn(s, a, u);
                        };
                    }
                    function Xt(s, a) {
                        s = gt(s);
                        function u() {
                            return s.includes("j") ? ln(s, a) : Ke(a);
                        }
                        var p = u();
                        return typeof p != "function" && H("unknown function pointer with signature " + s + ": " + a), p;
                    }
                    var Vr = void 0;
                    function un(s) {
                        var a = ts(s), u = gt(a);
                        return It(a), u;
                    }
                    function tr(s, a) {
                        var u = [], p = {};
                        function _(v) {
                            if (!p[v] && !Gt[v]) {
                                if (Me[v]) {
                                    Me[v].forEach(_);
                                    return;
                                }
                                u.push(v), p[v] = !0;
                            }
                        }
                        throw a.forEach(_), new Vr(s + ": " + u.map(un).join([
                            ", "
                        ]));
                    }
                    function cn(s, a, u, p, _, v, M, w, T, F, L, D, O) {
                        L = gt(L), v = Xt(_, v), w && (w = Xt(M, w)), F && (F = Xt(T, F)), O = Xt(D, O);
                        var tt = Rr(L);
                        Zi(tt, function() {
                            tr("Cannot construct " + L + " due to unbound types", [
                                p
                            ]);
                        }), he([
                            s,
                            a,
                            u
                        ], p ? [
                            p
                        ] : [], function(ht) {
                            ht = ht[0];
                            var it, xt;
                            p ? (it = ht.registeredClass, xt = it.instancePrototype) : xt = kt.prototype;
                            var At = Ur(tt, function() {
                                if (Object.getPrototypeOf(this) !== S) throw new qt("Use 'new' to construct " + L);
                                if (P.constructor_body === void 0) throw new qt(L + " has no accessible constructor");
                                var Fe = P.constructor_body[arguments.length];
                                if (Fe === void 0) throw new qt("Tried to invoke ctor of " + L + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(P.constructor_body).toString() + ") parameters instead!");
                                return Fe.apply(this, arguments);
                            }), S = Object.create(xt, {
                                constructor: {
                                    value: At
                                }
                            });
                            At.prototype = S;
                            var P = new Ji(L, At, S, O, it, v, w, F), lt = new Et(L, P, !0, !1, !1), ot = new Et(L + "*", P, !1, !1, !1), $t = new Et(L + " const*", P, !1, !0, !1);
                            return Wr[s] = {
                                pointerType: ot,
                                constPointerType: $t
                            }, an(tt, At), [
                                lt,
                                ot,
                                $t
                            ];
                        });
                    }
                    function Yr(s, a) {
                        for(var u = [], p = 0; p < s; p++)u.push(Y[a + p * 4 >> 2]);
                        return u;
                    }
                    function dn(s) {
                        for(; s.length;){
                            var a = s.pop(), u = s.pop();
                            u(a);
                        }
                    }
                    function Hr(s, a, u, p, _) {
                        var v = a.length;
                        v < 2 && H("argTypes array size mismatch! Must at least get return value and 'this' types!");
                        for(var M = a[1] !== null && u !== null, w = !1, T = 1; T < a.length; ++T)if (a[T] !== null && a[T].destructorFunction === void 0) {
                            w = !0;
                            break;
                        }
                        var F = a[0].name !== "void", L = v - 2, D = new Array(L), O = [], tt = [];
                        return function() {
                            arguments.length !== L && H("function " + s + " called with " + arguments.length + " arguments, expected " + L + " args!"), tt.length = 0;
                            var ht;
                            O.length = M ? 2 : 1, O[0] = _, M && (ht = a[1].toWireType(tt, this), O[1] = ht);
                            for(var it = 0; it < L; ++it)D[it] = a[it + 2].toWireType(tt, arguments[it]), O.push(D[it]);
                            var xt = p.apply(null, O);
                            function At(S) {
                                if (w) dn(tt);
                                else for(var P = M ? 1 : 2; P < a.length; P++){
                                    var lt = P === 1 ? ht : D[P - 2];
                                    a[P].destructorFunction !== null && a[P].destructorFunction(lt);
                                }
                                if (F) return a[0].fromWireType(S);
                            }
                            return At(xt);
                        };
                    }
                    function fn(s, a, u, p, _, v) {
                        A(a > 0);
                        var M = Yr(a, u);
                        _ = Xt(p, _), he([], [
                            s
                        ], function(w) {
                            w = w[0];
                            var T = "constructor " + w.name;
                            if (w.registeredClass.constructor_body === void 0 && (w.registeredClass.constructor_body = []), w.registeredClass.constructor_body[a - 1] !== void 0) throw new qt("Cannot register multiple constructors with identical number of parameters (" + (a - 1) + ") for class '" + w.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
                            return w.registeredClass.constructor_body[a - 1] = ()=>{
                                tr("Cannot construct " + w.name + " due to unbound types", M);
                            }, he([], M, function(F) {
                                return F.splice(1, 0, null), w.registeredClass.constructor_body[a - 1] = Hr(T, F, null, _, v), [];
                            }), [];
                        });
                    }
                    function mn(s, a, u, p, _, v, M, w) {
                        var T = Yr(u, p);
                        a = gt(a), v = Xt(_, v), he([], [
                            s
                        ], function(F) {
                            F = F[0];
                            var L = F.name + "." + a;
                            a.startsWith("@@") && (a = Symbol[a.substring(2)]), w && F.registeredClass.pureVirtualFunctions.push(a);
                            function D() {
                                tr("Cannot call " + L + " due to unbound types", T);
                            }
                            var O = F.registeredClass.instancePrototype, tt = O[a];
                            return tt === void 0 || tt.overloadTable === void 0 && tt.className !== F.name && tt.argCount === u - 2 ? (D.argCount = u - 2, D.className = F.name, O[a] = D) : ($r(O, a, L), O[a].overloadTable[u - 2] = D), he([], T, function(ht) {
                                var it = Hr(L, ht, F, v, M);
                                return O[a].overloadTable === void 0 ? (it.argCount = u - 2, O[a] = it) : O[a].overloadTable[u - 2] = it, [];
                            }), [];
                        });
                    }
                    var er = [], Mt = [
                        {},
                        {
                            value: void 0
                        },
                        {
                            value: null
                        },
                        {
                            value: !0
                        },
                        {
                            value: !1
                        }
                    ];
                    function pn(s) {
                        s > 4 && --Mt[s].refcount === 0 && (Mt[s] = void 0, er.push(s));
                    }
                    function yn() {
                        for(var s = 0, a = 5; a < Mt.length; ++a)Mt[a] !== void 0 && ++s;
                        return s;
                    }
                    function gn() {
                        for(var s = 5; s < Mt.length; ++s)if (Mt[s] !== void 0) return Mt[s];
                        return null;
                    }
                    function _n() {
                        i.count_emval_handles = yn, i.get_first_emval = gn;
                    }
                    var rr = {
                        toValue: (s)=>(s || H("Cannot use deleted val. handle = " + s), Mt[s].value),
                        toHandle: (s)=>{
                            switch(s){
                                case void 0:
                                    return 1;
                                case null:
                                    return 2;
                                case !0:
                                    return 3;
                                case !1:
                                    return 4;
                                default:
                                    {
                                        var a = er.length ? er.pop() : Mt.length;
                                        return Mt[a] = {
                                            refcount: 1,
                                            value: s
                                        }, a;
                                    }
                            }
                        }
                    };
                    function xn(s, a) {
                        a = gt(a), Ct(s, {
                            name: a,
                            fromWireType: function(u) {
                                var p = rr.toValue(u);
                                return pn(u), p;
                            },
                            toWireType: function(u, p) {
                                return rr.toHandle(p);
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: Te,
                            destructorFunction: null
                        });
                    }
                    function Zt(s) {
                        if (s === null) return "null";
                        var a = typeof s;
                        return a === "object" || a === "array" || a === "function" ? s.toString() : "" + s;
                    }
                    function bn(s, a) {
                        switch(a){
                            case 2:
                                return function(u) {
                                    return this.fromWireType(Sr[u >> 2]);
                                };
                            case 3:
                                return function(u) {
                                    return this.fromWireType(Tr[u >> 3]);
                                };
                            default:
                                throw new TypeError("Unknown float type: " + s);
                        }
                    }
                    function wn(s, a, u) {
                        var p = Ge(u);
                        a = gt(a), Ct(s, {
                            name: a,
                            fromWireType: function(_) {
                                return _;
                            },
                            toWireType: function(_, v) {
                                if (typeof v != "number" && typeof v != "boolean") throw new TypeError('Cannot convert "' + Zt(v) + '" to ' + this.name);
                                return v;
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: bn(a, p),
                            destructorFunction: null
                        });
                    }
                    function vn(s, a, u) {
                        switch(a){
                            case 0:
                                return u ? function(_) {
                                    return J[_];
                                } : function(_) {
                                    return G[_];
                                };
                            case 1:
                                return u ? function(_) {
                                    return V[_ >> 1];
                                } : function(_) {
                                    return st[_ >> 1];
                                };
                            case 2:
                                return u ? function(_) {
                                    return q[_ >> 2];
                                } : function(_) {
                                    return Y[_ >> 2];
                                };
                            default:
                                throw new TypeError("Unknown integer type: " + s);
                        }
                    }
                    function Mn(s, a, u, p, _) {
                        a = gt(a), _ === -1 && (_ = 4294967295);
                        var v = Ge(u), M = (D)=>D;
                        if (p === 0) {
                            var w = 32 - 8 * u;
                            M = (D)=>D << w >>> w;
                        }
                        var T = a.includes("unsigned"), F = (D, O)=>{
                            if (typeof D != "number" && typeof D != "boolean") throw new TypeError('Cannot convert "' + Zt(D) + '" to ' + O);
                            if (D < p || D > _) throw new TypeError('Passing a number "' + Zt(D) + '" from JS side to C/C++ side to an argument of type "' + a + '", which is outside the valid range [' + p + ", " + _ + "]!");
                        }, L;
                        T ? L = function(D, O) {
                            return F(O, this.name), O >>> 0;
                        } : L = function(D, O) {
                            return F(O, this.name), O;
                        }, Ct(s, {
                            name: a,
                            fromWireType: M,
                            toWireType: L,
                            argPackAdvance: 8,
                            readValueFromPointer: vn(a, v, p !== 0),
                            destructorFunction: null
                        });
                    }
                    function An(s, a, u) {
                        var p = [
                            Int8Array,
                            Uint8Array,
                            Int16Array,
                            Uint16Array,
                            Int32Array,
                            Uint32Array,
                            Float32Array,
                            Float64Array
                        ], _ = p[a];
                        function v(M) {
                            M = M >> 2;
                            var w = Y, T = w[M], F = w[M + 1];
                            return new _(Q, F, T);
                        }
                        u = gt(u), Ct(s, {
                            name: u,
                            fromWireType: v,
                            argPackAdvance: 8,
                            readValueFromPointer: v
                        }, {
                            ignoreDuplicateRegistrations: !0
                        });
                    }
                    function Sn(s, a) {
                        a = gt(a);
                        var u = a === "std::string";
                        Ct(s, {
                            name: a,
                            fromWireType: function(p) {
                                var _ = Y[p >> 2], v = p + 4, M;
                                if (u) for(var w = v, T = 0; T <= _; ++T){
                                    var F = v + T;
                                    if (T == _ || G[F] == 0) {
                                        var L = F - w, D = W(w, L);
                                        M === void 0 ? M = D : (M += "\0", M += D), w = F + 1;
                                    }
                                }
                                else {
                                    for(var O = new Array(_), T = 0; T < _; ++T)O[T] = String.fromCharCode(G[v + T]);
                                    M = O.join("");
                                }
                                return It(p), M;
                            },
                            toWireType: function(p, _) {
                                _ instanceof ArrayBuffer && (_ = new Uint8Array(_));
                                var v, M = typeof _ == "string";
                                M || _ instanceof Uint8Array || _ instanceof Uint8ClampedArray || _ instanceof Int8Array || H("Cannot pass non-string to std::string"), u && M ? v = K(_) : v = _.length;
                                var w = nr(4 + v + 1), T = w + 4;
                                if (Y[w >> 2] = v, u && M) j(_, T, v + 1);
                                else if (M) for(var F = 0; F < v; ++F){
                                    var L = _.charCodeAt(F);
                                    L > 255 && (It(T), H("String has UTF-16 code units that do not fit in 8 bits")), G[T + F] = L;
                                }
                                else for(var F = 0; F < v; ++F)G[T + F] = _[F];
                                return p !== null && p.push(It, w), w;
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: Te,
                            destructorFunction: function(p) {
                                It(p);
                            }
                        });
                    }
                    var jr = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0;
                    function Tn(s, a) {
                        A(s % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
                        for(var u = s, p = u >> 1, _ = p + a / 2; !(p >= _) && st[p];)++p;
                        if (u = p << 1, u - s > 32 && jr) return jr.decode(G.subarray(s, u));
                        for(var v = "", M = 0; !(M >= a / 2); ++M){
                            var w = V[s + M * 2 >> 1];
                            if (w == 0) break;
                            v += String.fromCharCode(w);
                        }
                        return v;
                    }
                    function Cn(s, a, u) {
                        if (A(a % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!"), A(typeof u == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), u === void 0 && (u = 2147483647), u < 2) return 0;
                        u -= 2;
                        for(var p = a, _ = u < s.length * 2 ? u / 2 : s.length, v = 0; v < _; ++v){
                            var M = s.charCodeAt(v);
                            V[a >> 1] = M, a += 2;
                        }
                        return V[a >> 1] = 0, a - p;
                    }
                    function En(s) {
                        return s.length * 2;
                    }
                    function zn(s, a) {
                        A(s % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
                        for(var u = 0, p = ""; !(u >= a / 4);){
                            var _ = q[s + u * 4 >> 2];
                            if (_ == 0) break;
                            if (++u, _ >= 65536) {
                                var v = _ - 65536;
                                p += String.fromCharCode(55296 | v >> 10, 56320 | v & 1023);
                            } else p += String.fromCharCode(_);
                        }
                        return p;
                    }
                    function Fn(s, a, u) {
                        if (A(a % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!"), A(typeof u == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), u === void 0 && (u = 2147483647), u < 4) return 0;
                        for(var p = a, _ = p + u - 4, v = 0; v < s.length; ++v){
                            var M = s.charCodeAt(v);
                            if (M >= 55296 && M <= 57343) {
                                var w = s.charCodeAt(++v);
                                M = 65536 + ((M & 1023) << 10) | w & 1023;
                            }
                            if (q[a >> 2] = M, a += 4, a + 4 > _) break;
                        }
                        return q[a >> 2] = 0, a - p;
                    }
                    function Pn(s) {
                        for(var a = 0, u = 0; u < s.length; ++u){
                            var p = s.charCodeAt(u);
                            p >= 55296 && p <= 57343 && ++u, a += 4;
                        }
                        return a;
                    }
                    function kn(s, a, u) {
                        u = gt(u);
                        var p, _, v, M, w;
                        a === 2 ? (p = Tn, _ = Cn, M = En, v = ()=>st, w = 1) : a === 4 && (p = zn, _ = Fn, M = Pn, v = ()=>Y, w = 2), Ct(s, {
                            name: u,
                            fromWireType: function(T) {
                                for(var F = Y[T >> 2], L = v(), D, O = T + 4, tt = 0; tt <= F; ++tt){
                                    var ht = T + 4 + tt * a;
                                    if (tt == F || L[ht >> w] == 0) {
                                        var it = ht - O, xt = p(O, it);
                                        D === void 0 ? D = xt : (D += "\0", D += xt), O = ht + a;
                                    }
                                }
                                return It(T), D;
                            },
                            toWireType: function(T, F) {
                                typeof F != "string" && H("Cannot pass non-string to C++ string type " + u);
                                var L = M(F), D = nr(4 + L + a);
                                return Y[D >> 2] = L >> w, _(F, D + 4, L + a), T !== null && T.push(It, D), D;
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: Te,
                            destructorFunction: function(T) {
                                It(T);
                            }
                        });
                    }
                    function In(s, a) {
                        a = gt(a), Ct(s, {
                            isVoid: !0,
                            name: a,
                            argPackAdvance: 0,
                            fromWireType: function() {},
                            toWireType: function(u, p) {}
                        });
                    }
                    function Rn() {
                        ct("native code called abort()");
                    }
                    function Un(s, a, u) {
                        G.copyWithin(s, a, a + u);
                    }
                    function On() {
                        return 2147483648;
                    }
                    function Ln(s) {
                        try {
                            return B.grow(s - Q.byteLength + 65535 >>> 16), Cr(B.buffer), 1;
                        } catch (a) {
                            b("emscripten_realloc_buffer: Attempted to grow heap from " + Q.byteLength + " bytes to " + s + " bytes, but got error: " + a);
                        }
                    }
                    function Dn(s) {
                        var a = G.length;
                        s = s >>> 0, A(s > a);
                        var u = On();
                        if (s > u) return b("Cannot enlarge memory, asked to go up to " + s + " bytes, but the limit is " + u + " bytes!"), !1;
                        let p = (T, F)=>T + (F - T % F) % F;
                        for(var _ = 1; _ <= 4; _ *= 2){
                            var v = a * (1 + .2 / _);
                            v = Math.min(v, s + 100663296);
                            var M = Math.min(u, p(Math.max(s, v), 65536)), w = Ln(M);
                            if (w) return !0;
                        }
                        return b("Failed to grow the heap from " + a + " bytes to " + M + " bytes, not enough memory!"), !1;
                    }
                    var ir = {};
                    function Bn() {
                        return c || "./this.program";
                    }
                    function fe() {
                        if (!fe.strings) {
                            var s = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", a = {
                                USER: "web_user",
                                LOGNAME: "web_user",
                                PATH: "/",
                                PWD: "/",
                                HOME: "/home/web_user",
                                LANG: s,
                                _: Bn()
                            };
                            for(var u in ir)ir[u] === void 0 ? delete a[u] : a[u] = ir[u];
                            var p = [];
                            for(var u in a)p.push(u + "=" + a[u]);
                            fe.strings = p;
                        }
                        return fe.strings;
                    }
                    function Wn(s, a, u) {
                        for(var p = 0; p < s.length; ++p)A(s.charCodeAt(p) === (s.charCodeAt(p) & 255)), J[a++ >> 0] = s.charCodeAt(p);
                        J[a >> 0] = 0;
                    }
                    function Nn(s, a) {
                        var u = 0;
                        return fe().forEach(function(p, _) {
                            var v = a + u;
                            Y[s + _ * 4 >> 2] = v, Wn(p, v), u += p.length + 1;
                        }), 0;
                    }
                    function $n(s, a) {
                        var u = fe();
                        Y[s >> 2] = u.length;
                        var p = 0;
                        return u.forEach(function(_) {
                            p += _.length + 1;
                        }), Y[a >> 2] = p, 0;
                    }
                    function Vn(s) {
                        ct("fd_close called without SYSCALLS_REQUIRE_FILESYSTEM");
                    }
                    function Yn(s, a, u, p, _) {
                        return 70;
                    }
                    var Hn = [
                        null,
                        [],
                        []
                    ];
                    function jn(s, a) {
                        var u = Hn[s];
                        A(u), a === 0 || a === 10 ? ((s === 1 ? g : b)(R(u, 0)), u.length = 0) : u.push(a);
                    }
                    function Gn(s, a, u, p) {
                        for(var _ = 0, v = 0; v < u; v++){
                            var M = Y[a >> 2], w = Y[a + 4 >> 2];
                            a += 8;
                            for(var T = 0; T < w; T++)jn(s, G[M + T]);
                            _ += w;
                        }
                        return Y[p >> 2] = _, 0;
                    }
                    function Ee(s) {
                        return s % 4 === 0 && (s % 100 !== 0 || s % 400 === 0);
                    }
                    function qn(s, a) {
                        for(var u = 0, p = 0; p <= a; u += s[p++]);
                        return u;
                    }
                    var Gr = [
                        31,
                        29,
                        31,
                        30,
                        31,
                        30,
                        31,
                        31,
                        30,
                        31,
                        30,
                        31
                    ], qr = [
                        31,
                        28,
                        31,
                        30,
                        31,
                        30,
                        31,
                        31,
                        30,
                        31,
                        30,
                        31
                    ];
                    function Xn(s, a) {
                        for(var u = new Date(s.getTime()); a > 0;){
                            var p = Ee(u.getFullYear()), _ = u.getMonth(), v = (p ? Gr : qr)[_];
                            if (a > v - u.getDate()) a -= v - u.getDate() + 1, u.setDate(1), _ < 11 ? u.setMonth(_ + 1) : (u.setMonth(0), u.setFullYear(u.getFullYear() + 1));
                            else return u.setDate(u.getDate() + a), u;
                        }
                        return u;
                    }
                    function Zn(s, a, u) {
                        var p = K(s) + 1, _ = new Array(p);
                        return Z(s, _, 0, _.length), _;
                    }
                    function Jn(s, a, u, p) {
                        var _ = q[p + 40 >> 2], v = {
                            tm_sec: q[p >> 2],
                            tm_min: q[p + 4 >> 2],
                            tm_hour: q[p + 8 >> 2],
                            tm_mday: q[p + 12 >> 2],
                            tm_mon: q[p + 16 >> 2],
                            tm_year: q[p + 20 >> 2],
                            tm_wday: q[p + 24 >> 2],
                            tm_yday: q[p + 28 >> 2],
                            tm_isdst: q[p + 32 >> 2],
                            tm_gmtoff: q[p + 36 >> 2],
                            tm_zone: _ ? W(_) : ""
                        }, M = W(u), w = {
                            "%c": "%a %b %d %H:%M:%S %Y",
                            "%D": "%m/%d/%y",
                            "%F": "%Y-%m-%d",
                            "%h": "%b",
                            "%r": "%I:%M:%S %p",
                            "%R": "%H:%M",
                            "%T": "%H:%M:%S",
                            "%x": "%m/%d/%y",
                            "%X": "%H:%M:%S",
                            "%Ec": "%c",
                            "%EC": "%C",
                            "%Ex": "%m/%d/%y",
                            "%EX": "%H:%M:%S",
                            "%Ey": "%y",
                            "%EY": "%Y",
                            "%Od": "%d",
                            "%Oe": "%e",
                            "%OH": "%H",
                            "%OI": "%I",
                            "%Om": "%m",
                            "%OM": "%M",
                            "%OS": "%S",
                            "%Ou": "%u",
                            "%OU": "%U",
                            "%OV": "%V",
                            "%Ow": "%w",
                            "%OW": "%W",
                            "%Oy": "%y"
                        };
                        for(var T in w)M = M.replace(new RegExp(T, "g"), w[T]);
                        var F = [
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday"
                        ], L = [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December"
                        ];
                        function D(S, P, lt) {
                            for(var ot = typeof S == "number" ? S.toString() : S || ""; ot.length < P;)ot = lt[0] + ot;
                            return ot;
                        }
                        function O(S, P) {
                            return D(S, P, "0");
                        }
                        function tt(S, P) {
                            function lt($t) {
                                return $t < 0 ? -1 : $t > 0 ? 1 : 0;
                            }
                            var ot;
                            return (ot = lt(S.getFullYear() - P.getFullYear())) === 0 && (ot = lt(S.getMonth() - P.getMonth())) === 0 && (ot = lt(S.getDate() - P.getDate())), ot;
                        }
                        function ht(S) {
                            switch(S.getDay()){
                                case 0:
                                    return new Date(S.getFullYear() - 1, 11, 29);
                                case 1:
                                    return S;
                                case 2:
                                    return new Date(S.getFullYear(), 0, 3);
                                case 3:
                                    return new Date(S.getFullYear(), 0, 2);
                                case 4:
                                    return new Date(S.getFullYear(), 0, 1);
                                case 5:
                                    return new Date(S.getFullYear() - 1, 11, 31);
                                case 6:
                                    return new Date(S.getFullYear() - 1, 11, 30);
                            }
                        }
                        function it(S) {
                            var P = Xn(new Date(S.tm_year + 1900, 0, 1), S.tm_yday), lt = new Date(P.getFullYear(), 0, 4), ot = new Date(P.getFullYear() + 1, 0, 4), $t = ht(lt), Fe = ht(ot);
                            return tt($t, P) <= 0 ? tt(Fe, P) <= 0 ? P.getFullYear() + 1 : P.getFullYear() : P.getFullYear() - 1;
                        }
                        var xt = {
                            "%a": function(S) {
                                return F[S.tm_wday].substring(0, 3);
                            },
                            "%A": function(S) {
                                return F[S.tm_wday];
                            },
                            "%b": function(S) {
                                return L[S.tm_mon].substring(0, 3);
                            },
                            "%B": function(S) {
                                return L[S.tm_mon];
                            },
                            "%C": function(S) {
                                var P = S.tm_year + 1900;
                                return O(P / 100 | 0, 2);
                            },
                            "%d": function(S) {
                                return O(S.tm_mday, 2);
                            },
                            "%e": function(S) {
                                return D(S.tm_mday, 2, " ");
                            },
                            "%g": function(S) {
                                return it(S).toString().substring(2);
                            },
                            "%G": function(S) {
                                return it(S);
                            },
                            "%H": function(S) {
                                return O(S.tm_hour, 2);
                            },
                            "%I": function(S) {
                                var P = S.tm_hour;
                                return P == 0 ? P = 12 : P > 12 && (P -= 12), O(P, 2);
                            },
                            "%j": function(S) {
                                return O(S.tm_mday + qn(Ee(S.tm_year + 1900) ? Gr : qr, S.tm_mon - 1), 3);
                            },
                            "%m": function(S) {
                                return O(S.tm_mon + 1, 2);
                            },
                            "%M": function(S) {
                                return O(S.tm_min, 2);
                            },
                            "%n": function() {
                                return `
`;
                            },
                            "%p": function(S) {
                                return S.tm_hour >= 0 && S.tm_hour < 12 ? "AM" : "PM";
                            },
                            "%S": function(S) {
                                return O(S.tm_sec, 2);
                            },
                            "%t": function() {
                                return "	";
                            },
                            "%u": function(S) {
                                return S.tm_wday || 7;
                            },
                            "%U": function(S) {
                                var P = S.tm_yday + 7 - S.tm_wday;
                                return O(Math.floor(P / 7), 2);
                            },
                            "%V": function(S) {
                                var P = Math.floor((S.tm_yday + 7 - (S.tm_wday + 6) % 7) / 7);
                                if ((S.tm_wday + 371 - S.tm_yday - 2) % 7 <= 2 && P++, P) {
                                    if (P == 53) {
                                        var ot = (S.tm_wday + 371 - S.tm_yday) % 7;
                                        ot != 4 && (ot != 3 || !Ee(S.tm_year)) && (P = 1);
                                    }
                                } else {
                                    P = 52;
                                    var lt = (S.tm_wday + 7 - S.tm_yday - 1) % 7;
                                    (lt == 4 || lt == 5 && Ee(S.tm_year % 400 - 1)) && P++;
                                }
                                return O(P, 2);
                            },
                            "%w": function(S) {
                                return S.tm_wday;
                            },
                            "%W": function(S) {
                                var P = S.tm_yday + 7 - (S.tm_wday + 6) % 7;
                                return O(Math.floor(P / 7), 2);
                            },
                            "%y": function(S) {
                                return (S.tm_year + 1900).toString().substring(2);
                            },
                            "%Y": function(S) {
                                return S.tm_year + 1900;
                            },
                            "%z": function(S) {
                                var P = S.tm_gmtoff, lt = P >= 0;
                                return P = Math.abs(P) / 60, P = P / 60 * 100 + P % 60, (lt ? "+" : "-") + ("0000" + P).slice(-4);
                            },
                            "%Z": function(S) {
                                return S.tm_zone;
                            },
                            "%%": function() {
                                return "%";
                            }
                        };
                        M = M.replace(/%%/g, "\0\0");
                        for(var T in xt)M.includes(T) && (M = M.replace(new RegExp(T, "g"), xt[T](v)));
                        M = M.replace(/\0\0/g, "%");
                        var At = Zn(M);
                        return At.length > a ? 0 : (Ci(At, s), At.length - 1);
                    }
                    function Qn(s, a, u, p) {
                        return Jn(s, a, u, p);
                    }
                    ki(), qt = i.BindingError = qe(Error, "BindingError"), Or = i.InternalError = qe(Error, "InternalError"), Xi(), $i(), sn(), Vr = i.UnboundTypeError = qe(Error, "UnboundTypeError"), _n();
                    function Kn() {
                        E("fetchSettings");
                    }
                    var Xr = {
                        __cxa_allocate_exception: Ei,
                        __cxa_throw: Fi,
                        _embind_register_bigint: Pi,
                        _embind_register_bool: Ui,
                        _embind_register_class: cn,
                        _embind_register_class_constructor: fn,
                        _embind_register_class_function: mn,
                        _embind_register_emval: xn,
                        _embind_register_float: wn,
                        _embind_register_integer: Mn,
                        _embind_register_memory_view: An,
                        _embind_register_std_string: Sn,
                        _embind_register_std_wstring: kn,
                        _embind_register_void: In,
                        abort: Rn,
                        emscripten_memcpy_big: Un,
                        emscripten_resize_heap: Dn,
                        environ_get: Nn,
                        environ_sizes_get: $n,
                        fd_close: Vn,
                        fd_seek: Yn,
                        fd_write: Gn,
                        strftime_l: Qn
                    };
                    Ti(), i.___wasm_call_ctors = at("__wasm_call_ctors");
                    var nr = i._malloc = at("malloc"), It = i._free = at("free"), ts = i.___getTypeName = at("__getTypeName");
                    i.__embind_initialize_bindings = at("_embind_initialize_bindings"), i.___errno_location = at("__errno_location"), i._fflush = at("fflush");
                    var Zr = i._emscripten_stack_init = function() {
                        return (Zr = i._emscripten_stack_init = i.asm.emscripten_stack_init).apply(null, arguments);
                    };
                    i._emscripten_stack_get_free = function() {
                        return (i._emscripten_stack_get_free = i.asm.emscripten_stack_get_free).apply(null, arguments);
                    }, i._emscripten_stack_get_base = function() {
                        return (i._emscripten_stack_get_base = i.asm.emscripten_stack_get_base).apply(null, arguments);
                    };
                    var sr = i._emscripten_stack_get_end = function() {
                        return (sr = i._emscripten_stack_get_end = i.asm.emscripten_stack_get_end).apply(null, arguments);
                    };
                    i.stackSave = at("stackSave"), i.stackRestore = at("stackRestore"), i.stackAlloc = at("stackAlloc");
                    var es = i.___cxa_is_pointer_type = at("__cxa_is_pointer_type");
                    i.dynCall_viijii = at("dynCall_viijii"), i.dynCall_ji = at("dynCall_ji"), i.dynCall_jiji = at("dynCall_jiji"), i.dynCall_iiiiij = at("dynCall_iiiiij"), i.dynCall_iiiiijj = at("dynCall_iiiiijj"), i.dynCall_iiiiiijj = at("dynCall_iiiiiijj");
                    var rs = [
                        "run",
                        "UTF8ArrayToString",
                        "UTF8ToString",
                        "stringToUTF8Array",
                        "stringToUTF8",
                        "lengthBytesUTF8",
                        "addOnPreRun",
                        "addOnInit",
                        "addOnPreMain",
                        "addOnExit",
                        "addOnPostRun",
                        "addRunDependency",
                        "removeRunDependency",
                        "FS_createFolder",
                        "FS_createPath",
                        "FS_createDataFile",
                        "FS_createPreloadedFile",
                        "FS_createLazyFile",
                        "FS_createLink",
                        "FS_createDevice",
                        "FS_unlink",
                        "getLEB",
                        "getFunctionTables",
                        "alignFunctionTables",
                        "registerFunctions",
                        "prettyPrint",
                        "getCompilerSetting",
                        "print",
                        "printErr",
                        "callMain",
                        "abort",
                        "keepRuntimeAlive",
                        "wasmMemory",
                        "stackAlloc",
                        "stackSave",
                        "stackRestore",
                        "getTempRet0",
                        "setTempRet0",
                        "writeStackCookie",
                        "checkStackCookie",
                        "ptrToString",
                        "zeroMemory",
                        "stringToNewUTF8",
                        "exitJS",
                        "getHeapMax",
                        "emscripten_realloc_buffer",
                        "ENV",
                        "ERRNO_CODES",
                        "ERRNO_MESSAGES",
                        "setErrNo",
                        "inetPton4",
                        "inetNtop4",
                        "inetPton6",
                        "inetNtop6",
                        "readSockaddr",
                        "writeSockaddr",
                        "DNS",
                        "getHostByName",
                        "Protocols",
                        "Sockets",
                        "getRandomDevice",
                        "warnOnce",
                        "traverseStack",
                        "UNWIND_CACHE",
                        "convertPCtoSourceLocation",
                        "readAsmConstArgsArray",
                        "readAsmConstArgs",
                        "mainThreadEM_ASM",
                        "jstoi_q",
                        "jstoi_s",
                        "getExecutableName",
                        "listenOnce",
                        "autoResumeAudioContext",
                        "dynCallLegacy",
                        "getDynCaller",
                        "dynCall",
                        "handleException",
                        "runtimeKeepalivePush",
                        "runtimeKeepalivePop",
                        "callUserCallback",
                        "maybeExit",
                        "safeSetTimeout",
                        "asmjsMangle",
                        "asyncLoad",
                        "alignMemory",
                        "mmapAlloc",
                        "writeI53ToI64",
                        "writeI53ToI64Clamped",
                        "writeI53ToI64Signaling",
                        "writeI53ToU64Clamped",
                        "writeI53ToU64Signaling",
                        "readI53FromI64",
                        "readI53FromU64",
                        "convertI32PairToI53",
                        "convertI32PairToI53Checked",
                        "convertU32PairToI53",
                        "getCFunc",
                        "ccall",
                        "cwrap",
                        "uleb128Encode",
                        "sigToWasmTypes",
                        "convertJsFunctionToWasm",
                        "freeTableIndexes",
                        "functionsInTableMap",
                        "getEmptyTableSlot",
                        "updateTableMap",
                        "addFunction",
                        "removeFunction",
                        "reallyNegative",
                        "unSign",
                        "strLen",
                        "reSign",
                        "formatString",
                        "setValue",
                        "getValue",
                        "PATH",
                        "PATH_FS",
                        "intArrayFromString",
                        "intArrayToString",
                        "AsciiToString",
                        "stringToAscii",
                        "UTF16Decoder",
                        "UTF16ToString",
                        "stringToUTF16",
                        "lengthBytesUTF16",
                        "UTF32ToString",
                        "stringToUTF32",
                        "lengthBytesUTF32",
                        "allocateUTF8",
                        "allocateUTF8OnStack",
                        "writeStringToMemory",
                        "writeArrayToMemory",
                        "writeAsciiToMemory",
                        "SYSCALLS",
                        "getSocketFromFD",
                        "getSocketAddress",
                        "JSEvents",
                        "registerKeyEventCallback",
                        "specialHTMLTargets",
                        "maybeCStringToJsString",
                        "findEventTarget",
                        "findCanvasEventTarget",
                        "getBoundingClientRect",
                        "fillMouseEventData",
                        "registerMouseEventCallback",
                        "registerWheelEventCallback",
                        "registerUiEventCallback",
                        "registerFocusEventCallback",
                        "fillDeviceOrientationEventData",
                        "registerDeviceOrientationEventCallback",
                        "fillDeviceMotionEventData",
                        "registerDeviceMotionEventCallback",
                        "screenOrientation",
                        "fillOrientationChangeEventData",
                        "registerOrientationChangeEventCallback",
                        "fillFullscreenChangeEventData",
                        "registerFullscreenChangeEventCallback",
                        "JSEvents_requestFullscreen",
                        "JSEvents_resizeCanvasForFullscreen",
                        "registerRestoreOldStyle",
                        "hideEverythingExceptGivenElement",
                        "restoreHiddenElements",
                        "setLetterbox",
                        "currentFullscreenStrategy",
                        "restoreOldWindowedStyle",
                        "softFullscreenResizeWebGLRenderTarget",
                        "doRequestFullscreen",
                        "fillPointerlockChangeEventData",
                        "registerPointerlockChangeEventCallback",
                        "registerPointerlockErrorEventCallback",
                        "requestPointerLock",
                        "fillVisibilityChangeEventData",
                        "registerVisibilityChangeEventCallback",
                        "registerTouchEventCallback",
                        "fillGamepadEventData",
                        "registerGamepadEventCallback",
                        "registerBeforeUnloadEventCallback",
                        "fillBatteryEventData",
                        "battery",
                        "registerBatteryEventCallback",
                        "setCanvasElementSize",
                        "getCanvasElementSize",
                        "demangle",
                        "demangleAll",
                        "jsStackTrace",
                        "stackTrace",
                        "ExitStatus",
                        "getEnvStrings",
                        "checkWasiClock",
                        "flush_NO_FILESYSTEM",
                        "dlopenMissingError",
                        "setImmediateWrapped",
                        "clearImmediateWrapped",
                        "polyfillSetImmediate",
                        "uncaughtExceptionCount",
                        "exceptionLast",
                        "exceptionCaught",
                        "ExceptionInfo",
                        "exception_addRef",
                        "exception_decRef",
                        "Browser",
                        "setMainLoop",
                        "wget",
                        "FS",
                        "MEMFS",
                        "TTY",
                        "PIPEFS",
                        "SOCKFS",
                        "_setNetworkCallback",
                        "tempFixedLengthArray",
                        "miniTempWebGLFloatBuffers",
                        "heapObjectForWebGLType",
                        "heapAccessShiftForWebGLHeap",
                        "GL",
                        "emscriptenWebGLGet",
                        "computeUnpackAlignedImageSize",
                        "emscriptenWebGLGetTexPixelData",
                        "emscriptenWebGLGetUniform",
                        "webglGetUniformLocation",
                        "webglPrepareUniformLocationsBeforeFirstUse",
                        "webglGetLeftBracePos",
                        "emscriptenWebGLGetVertexAttrib",
                        "writeGLArray",
                        "AL",
                        "SDL_unicode",
                        "SDL_ttfContext",
                        "SDL_audio",
                        "SDL",
                        "SDL_gfx",
                        "GLUT",
                        "EGL",
                        "GLFW_Window",
                        "GLFW",
                        "GLEW",
                        "IDBStore",
                        "runAndAbortIfError",
                        "ALLOC_NORMAL",
                        "ALLOC_STACK",
                        "allocate",
                        "InternalError",
                        "BindingError",
                        "UnboundTypeError",
                        "PureVirtualError",
                        "init_embind",
                        "throwInternalError",
                        "throwBindingError",
                        "throwUnboundTypeError",
                        "ensureOverloadTable",
                        "exposePublicSymbol",
                        "replacePublicSymbol",
                        "extendError",
                        "createNamedFunction",
                        "embindRepr",
                        "registeredInstances",
                        "getBasestPointer",
                        "registerInheritedInstance",
                        "unregisterInheritedInstance",
                        "getInheritedInstance",
                        "getInheritedInstanceCount",
                        "getLiveInheritedInstances",
                        "registeredTypes",
                        "awaitingDependencies",
                        "typeDependencies",
                        "registeredPointers",
                        "registerType",
                        "whenDependentTypesAreResolved",
                        "embind_charCodes",
                        "embind_init_charCodes",
                        "readLatin1String",
                        "getTypeName",
                        "heap32VectorToArray",
                        "requireRegisteredType",
                        "getShiftFromSize",
                        "integerReadValueFromPointer",
                        "enumReadValueFromPointer",
                        "floatReadValueFromPointer",
                        "simpleReadValueFromPointer",
                        "runDestructors",
                        "new_",
                        "craftInvokerFunction",
                        "embind__requireFunction",
                        "tupleRegistrations",
                        "structRegistrations",
                        "genericPointerToWireType",
                        "constNoSmartPtrRawPointerToWireType",
                        "nonConstNoSmartPtrRawPointerToWireType",
                        "init_RegisteredPointer",
                        "RegisteredPointer",
                        "RegisteredPointer_getPointee",
                        "RegisteredPointer_destructor",
                        "RegisteredPointer_deleteObject",
                        "RegisteredPointer_fromWireType",
                        "runDestructor",
                        "releaseClassHandle",
                        "finalizationRegistry",
                        "detachFinalizer_deps",
                        "detachFinalizer",
                        "attachFinalizer",
                        "makeClassHandle",
                        "init_ClassHandle",
                        "ClassHandle",
                        "ClassHandle_isAliasOf",
                        "throwInstanceAlreadyDeleted",
                        "ClassHandle_clone",
                        "ClassHandle_delete",
                        "deletionQueue",
                        "ClassHandle_isDeleted",
                        "ClassHandle_deleteLater",
                        "flushPendingDeletes",
                        "delayFunction",
                        "setDelayFunction",
                        "RegisteredClass",
                        "shallowCopyInternalPointer",
                        "downcastPointer",
                        "upcastPointer",
                        "validateThis",
                        "char_0",
                        "char_9",
                        "makeLegalFunctionName",
                        "emval_handle_array",
                        "emval_free_list",
                        "emval_symbols",
                        "init_emval",
                        "count_emval_handles",
                        "get_first_emval",
                        "getStringOrSymbol",
                        "Emval",
                        "emval_newers",
                        "craftEmvalAllocator",
                        "emval_get_global",
                        "emval_lookupTypes",
                        "emval_allocateDestructors",
                        "emval_methodCallers",
                        "emval_addMethodCaller",
                        "emval_registeredMethods"
                    ];
                    rs.forEach($);
                    var is = [
                        "ptrToString",
                        "zeroMemory",
                        "stringToNewUTF8",
                        "exitJS",
                        "setErrNo",
                        "inetPton4",
                        "inetNtop4",
                        "inetPton6",
                        "inetNtop6",
                        "readSockaddr",
                        "writeSockaddr",
                        "getHostByName",
                        "getRandomDevice",
                        "traverseStack",
                        "convertPCtoSourceLocation",
                        "readAsmConstArgs",
                        "mainThreadEM_ASM",
                        "jstoi_q",
                        "jstoi_s",
                        "listenOnce",
                        "autoResumeAudioContext",
                        "runtimeKeepalivePush",
                        "runtimeKeepalivePop",
                        "callUserCallback",
                        "maybeExit",
                        "safeSetTimeout",
                        "asmjsMangle",
                        "asyncLoad",
                        "alignMemory",
                        "mmapAlloc",
                        "writeI53ToI64",
                        "writeI53ToI64Clamped",
                        "writeI53ToI64Signaling",
                        "writeI53ToU64Clamped",
                        "writeI53ToU64Signaling",
                        "readI53FromI64",
                        "readI53FromU64",
                        "convertI32PairToI53",
                        "convertU32PairToI53",
                        "reallyNegative",
                        "unSign",
                        "strLen",
                        "reSign",
                        "formatString",
                        "getSocketFromFD",
                        "getSocketAddress",
                        "registerKeyEventCallback",
                        "maybeCStringToJsString",
                        "findEventTarget",
                        "findCanvasEventTarget",
                        "getBoundingClientRect",
                        "fillMouseEventData",
                        "registerMouseEventCallback",
                        "registerWheelEventCallback",
                        "registerUiEventCallback",
                        "registerFocusEventCallback",
                        "fillDeviceOrientationEventData",
                        "registerDeviceOrientationEventCallback",
                        "fillDeviceMotionEventData",
                        "registerDeviceMotionEventCallback",
                        "screenOrientation",
                        "fillOrientationChangeEventData",
                        "registerOrientationChangeEventCallback",
                        "fillFullscreenChangeEventData",
                        "registerFullscreenChangeEventCallback",
                        "JSEvents_requestFullscreen",
                        "JSEvents_resizeCanvasForFullscreen",
                        "registerRestoreOldStyle",
                        "hideEverythingExceptGivenElement",
                        "restoreHiddenElements",
                        "setLetterbox",
                        "softFullscreenResizeWebGLRenderTarget",
                        "doRequestFullscreen",
                        "fillPointerlockChangeEventData",
                        "registerPointerlockChangeEventCallback",
                        "registerPointerlockErrorEventCallback",
                        "requestPointerLock",
                        "fillVisibilityChangeEventData",
                        "registerVisibilityChangeEventCallback",
                        "registerTouchEventCallback",
                        "fillGamepadEventData",
                        "registerGamepadEventCallback",
                        "registerBeforeUnloadEventCallback",
                        "fillBatteryEventData",
                        "battery",
                        "registerBatteryEventCallback",
                        "setCanvasElementSize",
                        "getCanvasElementSize",
                        "checkWasiClock",
                        "setImmediateWrapped",
                        "clearImmediateWrapped",
                        "polyfillSetImmediate",
                        "exception_addRef",
                        "exception_decRef",
                        "setMainLoop",
                        "_setNetworkCallback",
                        "heapObjectForWebGLType",
                        "heapAccessShiftForWebGLHeap",
                        "emscriptenWebGLGet",
                        "computeUnpackAlignedImageSize",
                        "emscriptenWebGLGetTexPixelData",
                        "emscriptenWebGLGetUniform",
                        "webglGetUniformLocation",
                        "webglPrepareUniformLocationsBeforeFirstUse",
                        "webglGetLeftBracePos",
                        "emscriptenWebGLGetVertexAttrib",
                        "writeGLArray",
                        "SDL_unicode",
                        "SDL_ttfContext",
                        "SDL_audio",
                        "GLFW_Window",
                        "runAndAbortIfError",
                        "registerInheritedInstance",
                        "unregisterInheritedInstance",
                        "requireRegisteredType",
                        "enumReadValueFromPointer",
                        "validateThis",
                        "getStringOrSymbol",
                        "craftEmvalAllocator",
                        "emval_get_global",
                        "emval_lookupTypes",
                        "emval_allocateDestructors",
                        "emval_addMethodCaller"
                    ];
                    is.forEach(N);
                    var ze;
                    ae = function s() {
                        ze || Jr(), ze || (ae = s);
                    };
                    function ns() {
                        Zr(), mi();
                    }
                    function Jr(s) {
                        if (Bt > 0 || (ns(), pi(), Bt > 0)) return;
                        function a() {
                            ze || (ze = !0, i.calledRun = !0, !I && (yi(), l(i), i.onRuntimeInitialized && i.onRuntimeInitialized(), A(!i._main, 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'), gi()));
                        }
                        i.setStatus ? (i.setStatus("Running..."), setTimeout(function() {
                            setTimeout(function() {
                                i.setStatus("");
                            }, 1), a();
                        }, 1)) : a(), Ye();
                    }
                    if (i.preInit) for(typeof i.preInit == "function" && (i.preInit = [
                        i.preInit
                    ]); i.preInit.length > 0;)i.preInit.pop()();
                    return Jr(), n.ready;
                });
            })();
            x.exports = e;
        })(pr)), pr.exports;
    }
    var li;
    function Fs() {
        if (li) return vt;
        li = 1;
        var x = vt && vt.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            };
        };
        Object.defineProperty(vt, "__esModule", {
            value: !0
        }), vt.LazPerf = vt.create = vt.createLazPerf = void 0;
        const t = x(zs());
        return vt.createLazPerf = t.default, vt.create = t.default, vt.LazPerf = {
            create: t.default
        }, vt;
    }
    var di = Fs(), fi = "" + new URL("laz-perf-CFJp03W6.wasm", import.meta.url).href;
    const vr = 4e6;
    function Mr(x) {
        const t = new DataView(x);
        if (String.fromCharCode(t.getUint8(0), t.getUint8(1), t.getUint8(2), t.getUint8(3)) !== "LASF") throw new Error("это не LAS/LAZ файл");
        const r = t.getUint32(96, !0), n = t.getUint8(104) & 63, i = t.getUint16(105, !0);
        let l = t.getUint32(107, !0);
        !l && t.getUint8(25) >= 4 && (l = Number(t.getBigUint64(247, !0)));
        const h = [
            t.getFloat64(131, !0),
            t.getFloat64(139, !0),
            t.getFloat64(147, !0)
        ], o = [
            t.getFloat64(187, !0),
            t.getFloat64(203, !0),
            t.getFloat64(219, !0)
        ], c = [
            t.getFloat64(155, !0),
            t.getFloat64(163, !0),
            t.getFloat64(171, !0)
        ];
        return {
            offset: r,
            format: n,
            recLen: i,
            count: l,
            scale: h,
            off: c,
            rgbAt: n === 2 ? 20 : n === 3 || n === 5 ? 28 : n === 7 || n === 8 ? 30 : -1,
            min: o
        };
    }
    function Ar(x, t, e, r, n, i) {
        const l = x.getInt32(t, !0) * e.scale[0] + e.off[0] - e.min[0], h = x.getInt32(t + 4, !0) * e.scale[1] + e.off[1] - e.min[1], o = x.getInt32(t + 8, !0) * e.scale[2] + e.off[2] - e.min[2];
        if (r[i * 3] = l, r[i * 3 + 1] = o, r[i * 3 + 2] = -h, e.rgbAt >= 0) {
            let c = x.getUint16(t + e.rgbAt, !0), d = x.getUint16(t + e.rgbAt + 2, !0), f = x.getUint16(t + e.rgbAt + 4, !0);
            const m = c > 255 || d > 255 || f > 255 ? 65535 : 255;
            n[i * 3] = c / m, n[i * 3 + 1] = d / m, n[i * 3 + 2] = f / m;
        } else n[i * 3] = .7, n[i * 3 + 1] = .68, n[i * 3 + 2] = .65;
    }
    async function Ps(x, t) {
        const e = Mr(x), r = await di.createLazPerf({
            locateFile: ()=>fi
        }), n = new r.LASZip, i = r._malloc(x.byteLength);
        r.HEAPU8.set(new Uint8Array(x), i);
        try {
            n.open(i, x.byteLength);
            const l = n.getCount(), h = n.getPointLength();
            e.recLen = h;
            const o = Math.max(1, Math.ceil(l / vr)), c = Math.ceil(l / o), d = new Float32Array(c * 3), f = new Float32Array(c * 3), m = r._malloc(h), y = new Uint8Array(r.HEAPU8.buffer, m, h), g = new DataView(r.HEAPU8.buffer, m, h);
            let b = 0;
            for(let U = 0; U < l; U++)n.getPoint(m), (U & 262143) === 0 && t && t(U / l), !(U % o !== 0 || b >= c) && (Ar(g, 0, e, d, f, b), b++);
            r._free(m);
            const C = d.subarray(0, b * 3), E = Ne(C);
            return {
                positions: C,
                colors: f.subarray(0, b * 3),
                count: b,
                origin: {
                    x: e.min[0] + E.cx,
                    y: e.min[2] + E.cy,
                    z: E.cz - e.min[1]
                }
            };
        } finally{
            n.delete(), r._free(i);
        }
    }
    async function ks(x, t) {
        const e = Mr(await x.slice(0, 512).arrayBuffer());
        if (!e.count) throw new Error("пустой LAS");
        const r = Math.max(1, Math.ceil(e.count / vr)), n = Math.ceil(e.count / r), i = new Float32Array(n * 3), l = new Float32Array(n * 3), h = Math.max(1, Math.floor((32 << 20) / e.recLen));
        let o = 0, c = 0;
        for(; c < e.count && o < n;){
            const m = c, y = Math.min(e.count - 1, m + h - 1), g = new DataView(await x.slice(e.offset + m * e.recLen, e.offset + (y + 1) * e.recLen).arrayBuffer());
            for(; c <= y && o < n;)Ar(g, (c - m) * e.recLen, e, i, l, o), o++, c += r;
            t && t(Math.min(1, c / e.count));
        }
        const d = i.subarray(0, o * 3), f = Ne(d);
        return {
            positions: d,
            colors: l.subarray(0, o * 3),
            count: o,
            origin: {
                x: e.min[0] + f.cx,
                y: e.min[2] + f.cy,
                z: f.cz - e.min[1]
            }
        };
    }
    function Is(x) {
        if (x.byteLength < 429) return !1;
        const t = new DataView(x);
        if (String.fromCharCode(t.getUint8(0), t.getUint8(1), t.getUint8(2), t.getUint8(3)) !== "LASF") return !1;
        let e = "";
        for(let r = 0; r < 16; r++){
            const n = t.getUint8(377 + r);
            n && (e += String.fromCharCode(n));
        }
        return e === "copc" && t.getUint16(393, !0) === 1;
    }
    async function Rs(x, t) {
        const e = await x.slice(0, 589).arrayBuffer(), r = Mr(e), n = new DataView(e), i = 429, l = Number(n.getBigUint64(i + 40, !0)), h = Number(n.getBigUint64(i + 48, !0)), o = [], c = async (k, B)=>{
            const I = new DataView(await x.slice(k, k + B).arrayBuffer());
            for(let A = 0; A + 32 <= B; A += 32){
                const X = I.getInt32(A, !0), R = Number(I.getBigUint64(A + 16, !0)), W = I.getInt32(A + 24, !0), Z = I.getInt32(A + 28, !0);
                Z === -1 ? await c(R, W) : Z > 0 && o.push({
                    level: X,
                    offset: R,
                    size: W,
                    count: Z
                });
            }
        };
        await c(l, h), o.sort((k, B)=>k.level - B.level);
        const d = [];
        let f = 0;
        for (const k of o){
            if (f >= vr) break;
            d.push(k), f += k.count;
        }
        const m = f, y = new Float32Array(m * 3), g = new Float32Array(m * 3), b = await di.createLazPerf({
            locateFile: ()=>fi
        }), C = b._malloc(r.recLen);
        let E = 0, U = 0;
        for (const k of d){
            const B = new Uint8Array(await x.slice(k.offset, k.offset + k.size).arrayBuffer()), I = b._malloc(B.byteLength);
            b.HEAPU8.set(B, I);
            const A = new b.ChunkDecoder;
            try {
                A.open(r.format, r.recLen, I);
                const X = new DataView(b.HEAPU8.buffer, C, r.recLen);
                for(let R = 0; R < k.count; R++)A.getPoint(C), Ar(X, 0, r, y, g, E), E++;
            } finally{
                A.delete(), b._free(I);
            }
            U += k.count, t && t(U / m);
        }
        b._free(C);
        const N = y.subarray(0, E * 3), $ = Ne(N);
        return {
            positions: N,
            colors: g.subarray(0, E * 3),
            count: E,
            origin: {
                x: r.min[0] + $.cx,
                y: r.min[2] + $.cy,
                z: $.cz - r.min[1]
            }
        };
    }
    async function Us(x) {
        const { convertE57: t } = await import("./e57-DDyz-5_6.js").then(async (m)=>{
            await m.__tla;
            return m;
        }), e = t(new Uint8Array(x), "xyz");
        return ci(e);
    }
    const St = self, ui = 18e8;
    async function yr(x, t) {
        const e = new Uint8Array(x.size), r = x.stream().getReader();
        let n = 0, i = -1;
        for(;;){
            const { done: l, value: h } = await r.read();
            if (l) break;
            e.set(h, n), n += h.length;
            const o = Math.floor(n / x.size * 100);
            o !== i && (i = o, St.postMessage({
                type: "progress",
                p: n / x.size,
                phase: `${t} ${o}%`
            }));
        }
        return e.buffer;
    }
    St.postMessage({
        type: "ready"
    });
    St.onmessage = async (x)=>{
        const { name: t, file: e, demo: r } = x.data, n = (i)=>St.postMessage({
                type: "progress",
                p: i,
                phase: `Обработка точек… ${Math.round(i * 100)}%`
            });
        try {
            if (r) {
                const h = Es(), o = h.geometry.getAttribute("aColor").array;
                gr(h.positions, o, h.count), St.postMessage({
                    type: "done",
                    positions: h.positions,
                    colors: o,
                    count: h.count,
                    origin: null
                }, [
                    h.positions.buffer,
                    o.buffer
                ]);
                return;
            }
            const i = (t.toLowerCase().split(".").pop() ?? "").trim();
            let l;
            if (i === "las") l = await ks(e, n);
            else if (i === "laz") if (Is(await e.slice(0, 512).arrayBuffer())) St.postMessage({
                type: "progress",
                p: 0,
                phase: "COPC: чтение октодерева…"
            }), l = await Rs(e, n);
            else {
                if (e.size > ui) throw new Error("LAZ слишком большой для распаковки целиком — конвертируйте в COPC или LAS");
                l = await Ps(await yr(e, "Чтение файла…"), n);
            }
            else if (i === "e57") {
                if (e.size > ui) throw new Error("E57 слишком большой — конвертируйте в LAS");
                const h = await yr(e, "Чтение файла…");
                St.postMessage({
                    type: "progress",
                    p: 0,
                    phase: "Конвертация E57…"
                }), l = await Us(h);
            } else {
                const h = await yr(e, "Чтение файла…");
                l = ci(new TextDecoder().decode(h), n);
            }
            if (!l) throw new Error("не удалось прочитать файл (LAS/LAZ/E57 или ASCII x y z [r g b])");
            St.postMessage({
                type: "progress",
                p: 1,
                phase: "Подготовка отображения…"
            }), gr(l.positions, l.colors, l.count), St.postMessage({
                type: "done",
                positions: l.positions,
                colors: l.colors,
                count: l.count,
                origin: l.origin ?? null
            }, [
                l.positions.buffer,
                l.colors.buffer
            ]);
        } catch (i) {
            St.postMessage({
                type: "error",
                message: i.message
            });
        }
    };
})();
