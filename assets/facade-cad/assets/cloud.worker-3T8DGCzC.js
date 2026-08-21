(async ()=>{
    class Sn {
        addEventListener(t, e) {
            this._listeners === void 0 && (this._listeners = {});
            const n = this._listeners;
            n[t] === void 0 && (n[t] = []), n[t].indexOf(e) === -1 && n[t].push(e);
        }
        hasEventListener(t, e) {
            const n = this._listeners;
            return n === void 0 ? !1 : n[t] !== void 0 && n[t].indexOf(e) !== -1;
        }
        removeEventListener(t, e) {
            const n = this._listeners;
            if (n === void 0) return;
            const i = n[t];
            if (i !== void 0) {
                const r = i.indexOf(e);
                r !== -1 && i.splice(r, 1);
            }
        }
        dispatchEvent(t) {
            const e = this._listeners;
            if (e === void 0) return;
            const n = e[t.type];
            if (n !== void 0) {
                t.target = this;
                const i = n.slice(0);
                for(let r = 0, l = i.length; r < l; r++)i[r].call(this, t);
                t.target = null;
            }
        }
    }
    const ct = [
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
    function Ve() {
        const p = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
        return (ct[p & 255] + ct[p >> 8 & 255] + ct[p >> 16 & 255] + ct[p >> 24 & 255] + "-" + ct[t & 255] + ct[t >> 8 & 255] + "-" + ct[t >> 16 & 15 | 64] + ct[t >> 24 & 255] + "-" + ct[e & 63 | 128] + ct[e >> 8 & 255] + "-" + ct[e >> 16 & 255] + ct[e >> 24 & 255] + ct[n & 255] + ct[n >> 8 & 255] + ct[n >> 16 & 255] + ct[n >> 24 & 255]).toLowerCase();
    }
    function Q(p, t, e) {
        return Math.max(t, Math.min(e, p));
    }
    function ge(p, t) {
        switch(t.constructor){
            case Float32Array:
                return p;
            case Uint32Array:
                return p / 4294967295;
            case Uint16Array:
                return p / 65535;
            case Uint8Array:
                return p / 255;
            case Int32Array:
                return Math.max(p / 2147483647, -1);
            case Int16Array:
                return Math.max(p / 32767, -1);
            case Int8Array:
                return Math.max(p / 127, -1);
            default:
                throw new Error("Invalid component type.");
        }
    }
    function ft(p, t) {
        switch(t.constructor){
            case Float32Array:
                return p;
            case Uint32Array:
                return Math.round(p * 4294967295);
            case Uint16Array:
                return Math.round(p * 65535);
            case Uint8Array:
                return Math.round(p * 255);
            case Int32Array:
                return Math.round(p * 2147483647);
            case Int16Array:
                return Math.round(p * 32767);
            case Int8Array:
                return Math.round(p * 127);
            default:
                throw new Error("Invalid component type.");
        }
    }
    class It {
        constructor(t = 0, e = 0){
            It.prototype.isVector2 = !0, this.x = t, this.y = e;
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
            const e = this.x, n = this.y, i = t.elements;
            return this.x = i[0] * e + i[3] * n + i[6], this.y = i[1] * e + i[4] * n + i[7], this;
        }
        min(t) {
            return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this;
        }
        max(t) {
            return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this;
        }
        clamp(t, e) {
            return this.x = Q(this.x, t.x, e.x), this.y = Q(this.y, t.y, e.y), this;
        }
        clampScalar(t, e) {
            return this.x = Q(this.x, t, e), this.y = Q(this.y, t, e), this;
        }
        clampLength(t, e) {
            const n = this.length();
            return this.divideScalar(n || 1).multiplyScalar(Q(n, t, e));
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
            const n = this.dot(t) / e;
            return Math.acos(Q(n, -1, 1));
        }
        distanceTo(t) {
            return Math.sqrt(this.distanceToSquared(t));
        }
        distanceToSquared(t) {
            const e = this.x - t.x, n = this.y - t.y;
            return e * e + n * n;
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
        lerpVectors(t, e, n) {
            return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this;
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
            const n = Math.cos(e), i = Math.sin(e), r = this.x - t.x, l = this.y - t.y;
            return this.x = r * n - l * i + t.x, this.y = r * i + l * n + t.y, this;
        }
        random() {
            return this.x = Math.random(), this.y = Math.random(), this;
        }
        *[Symbol.iterator]() {
            yield this.x, yield this.y;
        }
    }
    class he {
        constructor(t, e, n, i, r, l, h, o, c){
            he.prototype.isMatrix3 = !0, this.elements = [
                1,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                1
            ], t !== void 0 && this.set(t, e, n, i, r, l, h, o, c);
        }
        set(t, e, n, i, r, l, h, o, c) {
            const d = this.elements;
            return d[0] = t, d[1] = i, d[2] = h, d[3] = e, d[4] = r, d[5] = o, d[6] = n, d[7] = l, d[8] = c, this;
        }
        identity() {
            return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
        }
        copy(t) {
            const e = this.elements, n = t.elements;
            return e[0] = n[0], e[1] = n[1], e[2] = n[2], e[3] = n[3], e[4] = n[4], e[5] = n[5], e[6] = n[6], e[7] = n[7], e[8] = n[8], this;
        }
        extractBasis(t, e, n) {
            return t.setFromMatrix3Column(this, 0), e.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
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
            const n = t.elements, i = e.elements, r = this.elements, l = n[0], h = n[3], o = n[6], c = n[1], d = n[4], f = n[7], y = n[2], m = n[5], x = n[8], b = i[0], A = i[3], M = i[6], F = i[1], k = i[4], L = i[7], R = i[2], B = i[5], E = i[8];
            return r[0] = l * b + h * F + o * R, r[3] = l * A + h * k + o * B, r[6] = l * M + h * L + o * E, r[1] = c * b + d * F + f * R, r[4] = c * A + d * k + f * B, r[7] = c * M + d * L + f * E, r[2] = y * b + m * F + x * R, r[5] = y * A + m * k + x * B, r[8] = y * M + m * L + x * E, this;
        }
        multiplyScalar(t) {
            const e = this.elements;
            return e[0] *= t, e[3] *= t, e[6] *= t, e[1] *= t, e[4] *= t, e[7] *= t, e[2] *= t, e[5] *= t, e[8] *= t, this;
        }
        determinant() {
            const t = this.elements, e = t[0], n = t[1], i = t[2], r = t[3], l = t[4], h = t[5], o = t[6], c = t[7], d = t[8];
            return e * l * d - e * h * c - n * r * d + n * h * o + i * r * c - i * l * o;
        }
        invert() {
            const t = this.elements, e = t[0], n = t[1], i = t[2], r = t[3], l = t[4], h = t[5], o = t[6], c = t[7], d = t[8], f = d * l - h * c, y = h * o - d * r, m = c * r - l * o, x = e * f + n * y + i * m;
            if (x === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
            const b = 1 / x;
            return t[0] = f * b, t[1] = (i * c - d * n) * b, t[2] = (h * n - i * l) * b, t[3] = y * b, t[4] = (d * e - i * o) * b, t[5] = (i * r - h * e) * b, t[6] = m * b, t[7] = (n * o - c * e) * b, t[8] = (l * e - n * r) * b, this;
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
        setUvTransform(t, e, n, i, r, l, h) {
            const o = Math.cos(r), c = Math.sin(r);
            return this.set(n * o, n * c, -n * (o * l + c * h) + l + t, -i * c, i * o, -i * (-c * l + o * h) + h + e, 0, 0, 1), this;
        }
        scale(t, e) {
            return this.premultiply(fn.makeScale(t, e)), this;
        }
        rotate(t) {
            return this.premultiply(fn.makeRotation(-t)), this;
        }
        translate(t, e) {
            return this.premultiply(fn.makeTranslation(t, e)), this;
        }
        makeTranslation(t, e) {
            return t.isVector2 ? this.set(1, 0, t.x, 0, 1, t.y, 0, 0, 1) : this.set(1, 0, t, 0, 1, e, 0, 0, 1), this;
        }
        makeRotation(t) {
            const e = Math.cos(t), n = Math.sin(t);
            return this.set(e, -n, 0, n, e, 0, 0, 0, 1), this;
        }
        makeScale(t, e) {
            return this.set(t, 0, 0, 0, e, 0, 0, 0, 1), this;
        }
        equals(t) {
            const e = this.elements, n = t.elements;
            for(let i = 0; i < 9; i++)if (e[i] !== n[i]) return !1;
            return !0;
        }
        fromArray(t, e = 0) {
            for(let n = 0; n < 9; n++)this.elements[n] = t[n + e];
            return this;
        }
        toArray(t = [], e = 0) {
            const n = this.elements;
            return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t;
        }
        clone() {
            return new this.constructor().fromArray(this.elements);
        }
    }
    const fn = new he;
    function ps(p) {
        for(let t = p.length - 1; t >= 0; --t)if (p[t] >= 65535) return !0;
        return !1;
    }
    function nr(p) {
        return document.createElementNS("http://www.w3.org/1999/xhtml", p);
    }
    function mn(p) {
        return p < .04045 ? p * .0773993808 : Math.pow(p * .9478672986 + .0521327014, 2.4);
    }
    let Qt;
    class gs {
        static getDataURL(t) {
            if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u") return t.src;
            let e;
            if (t instanceof HTMLCanvasElement) e = t;
            else {
                Qt === void 0 && (Qt = nr("canvas")), Qt.width = t.width, Qt.height = t.height;
                const n = Qt.getContext("2d");
                t instanceof ImageData ? n.putImageData(t, 0, 0) : n.drawImage(t, 0, 0, t.width, t.height), e = Qt;
            }
            return e.toDataURL("image/png");
        }
        static sRGBToLinear(t) {
            if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
                const e = nr("canvas");
                e.width = t.width, e.height = t.height;
                const n = e.getContext("2d");
                n.drawImage(t, 0, 0, t.width, t.height);
                const i = n.getImageData(0, 0, t.width, t.height), r = i.data;
                for(let l = 0; l < r.length; l++)r[l] = mn(r[l] / 255) * 255;
                return n.putImageData(i, 0, 0), e;
            } else if (t.data) {
                const e = t.data.slice(0);
                for(let n = 0; n < e.length; n++)e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(mn(e[n] / 255) * 255) : e[n] = mn(e[n]);
                return {
                    data: e,
                    width: t.width,
                    height: t.height
                };
            } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
        }
    }
    let _s = 0;
    class xs {
        constructor(t = null){
            this.isSource = !0, Object.defineProperty(this, "id", {
                value: _s++
            }), this.uuid = Ve(), this.data = t, this.dataReady = !0, this.version = 0;
        }
        set needsUpdate(t) {
            t === !0 && this.version++;
        }
        toJSON(t) {
            const e = t === void 0 || typeof t == "string";
            if (!e && t.images[this.uuid] !== void 0) return t.images[this.uuid];
            const n = {
                uuid: this.uuid,
                url: ""
            }, i = this.data;
            if (i !== null) {
                let r;
                if (Array.isArray(i)) {
                    r = [];
                    for(let l = 0, h = i.length; l < h; l++)i[l].isDataTexture ? r.push(yn(i[l].image)) : r.push(yn(i[l]));
                } else r = yn(i);
                n.url = r;
            }
            return e || (t.images[this.uuid] = n), n;
        }
    }
    function yn(p) {
        return typeof HTMLImageElement < "u" && p instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && p instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && p instanceof ImageBitmap ? gs.getDataURL(p) : p.data ? {
            data: Array.from(p.data),
            width: p.width,
            height: p.height,
            type: p.data.constructor.name
        } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
    }
    let bs = 0;
    class qt extends Sn {
        constructor(t = qt.DEFAULT_IMAGE, e = qt.DEFAULT_MAPPING, n = 1001, i = 1001, r = 1006, l = 1008, h = 1023, o = 1009, c = qt.DEFAULT_ANISOTROPY, d = ""){
            super(), this.isTexture = !0, Object.defineProperty(this, "id", {
                value: bs++
            }), this.uuid = Ve(), this.name = "", this.source = new xs(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = i, this.magFilter = r, this.minFilter = l, this.anisotropy = c, this.format = h, this.internalFormat = null, this.type = o, this.offset = new It(0, 0), this.repeat = new It(1, 1), this.center = new It(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new he, this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = d, this.userData = {}, this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
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
            const n = {
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
            return Object.keys(this.userData).length > 0 && (n.userData = this.userData), e || (t.textures[this.uuid] = n), n;
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
    qt.DEFAULT_IMAGE = null;
    qt.DEFAULT_MAPPING = 300;
    qt.DEFAULT_ANISOTROPY = 1;
    class Te {
        constructor(t = 0, e = 0, n = 0, i = 1){
            this.isQuaternion = !0, this._x = t, this._y = e, this._z = n, this._w = i;
        }
        static slerpFlat(t, e, n, i, r, l, h) {
            let o = n[i + 0], c = n[i + 1], d = n[i + 2], f = n[i + 3];
            const y = r[l + 0], m = r[l + 1], x = r[l + 2], b = r[l + 3];
            if (h === 0) {
                t[e + 0] = o, t[e + 1] = c, t[e + 2] = d, t[e + 3] = f;
                return;
            }
            if (h === 1) {
                t[e + 0] = y, t[e + 1] = m, t[e + 2] = x, t[e + 3] = b;
                return;
            }
            if (f !== b || o !== y || c !== m || d !== x) {
                let A = 1 - h;
                const M = o * y + c * m + d * x + f * b, F = M >= 0 ? 1 : -1, k = 1 - M * M;
                if (k > Number.EPSILON) {
                    const R = Math.sqrt(k), B = Math.atan2(R, M * F);
                    A = Math.sin(A * B) / R, h = Math.sin(h * B) / R;
                }
                const L = h * F;
                if (o = o * A + y * L, c = c * A + m * L, d = d * A + x * L, f = f * A + b * L, A === 1 - h) {
                    const R = 1 / Math.sqrt(o * o + c * c + d * d + f * f);
                    o *= R, c *= R, d *= R, f *= R;
                }
            }
            t[e] = o, t[e + 1] = c, t[e + 2] = d, t[e + 3] = f;
        }
        static multiplyQuaternionsFlat(t, e, n, i, r, l) {
            const h = n[i], o = n[i + 1], c = n[i + 2], d = n[i + 3], f = r[l], y = r[l + 1], m = r[l + 2], x = r[l + 3];
            return t[e] = h * x + d * f + o * m - c * y, t[e + 1] = o * x + d * y + c * f - h * m, t[e + 2] = c * x + d * m + h * y - o * f, t[e + 3] = d * x - h * f - o * y - c * m, t;
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
        set(t, e, n, i) {
            return this._x = t, this._y = e, this._z = n, this._w = i, this._onChangeCallback(), this;
        }
        clone() {
            return new this.constructor(this._x, this._y, this._z, this._w);
        }
        copy(t) {
            return this._x = t.x, this._y = t.y, this._z = t.z, this._w = t.w, this._onChangeCallback(), this;
        }
        setFromEuler(t, e = !0) {
            const n = t._x, i = t._y, r = t._z, l = t._order, h = Math.cos, o = Math.sin, c = h(n / 2), d = h(i / 2), f = h(r / 2), y = o(n / 2), m = o(i / 2), x = o(r / 2);
            switch(l){
                case "XYZ":
                    this._x = y * d * f + c * m * x, this._y = c * m * f - y * d * x, this._z = c * d * x + y * m * f, this._w = c * d * f - y * m * x;
                    break;
                case "YXZ":
                    this._x = y * d * f + c * m * x, this._y = c * m * f - y * d * x, this._z = c * d * x - y * m * f, this._w = c * d * f + y * m * x;
                    break;
                case "ZXY":
                    this._x = y * d * f - c * m * x, this._y = c * m * f + y * d * x, this._z = c * d * x + y * m * f, this._w = c * d * f - y * m * x;
                    break;
                case "ZYX":
                    this._x = y * d * f - c * m * x, this._y = c * m * f + y * d * x, this._z = c * d * x - y * m * f, this._w = c * d * f + y * m * x;
                    break;
                case "YZX":
                    this._x = y * d * f + c * m * x, this._y = c * m * f + y * d * x, this._z = c * d * x - y * m * f, this._w = c * d * f - y * m * x;
                    break;
                case "XZY":
                    this._x = y * d * f - c * m * x, this._y = c * m * f - y * d * x, this._z = c * d * x + y * m * f, this._w = c * d * f + y * m * x;
                    break;
                default:
                    console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + l);
            }
            return e === !0 && this._onChangeCallback(), this;
        }
        setFromAxisAngle(t, e) {
            const n = e / 2, i = Math.sin(n);
            return this._x = t.x * i, this._y = t.y * i, this._z = t.z * i, this._w = Math.cos(n), this._onChangeCallback(), this;
        }
        setFromRotationMatrix(t) {
            const e = t.elements, n = e[0], i = e[4], r = e[8], l = e[1], h = e[5], o = e[9], c = e[2], d = e[6], f = e[10], y = n + h + f;
            if (y > 0) {
                const m = .5 / Math.sqrt(y + 1);
                this._w = .25 / m, this._x = (d - o) * m, this._y = (r - c) * m, this._z = (l - i) * m;
            } else if (n > h && n > f) {
                const m = 2 * Math.sqrt(1 + n - h - f);
                this._w = (d - o) / m, this._x = .25 * m, this._y = (i + l) / m, this._z = (r + c) / m;
            } else if (h > f) {
                const m = 2 * Math.sqrt(1 + h - n - f);
                this._w = (r - c) / m, this._x = (i + l) / m, this._y = .25 * m, this._z = (o + d) / m;
            } else {
                const m = 2 * Math.sqrt(1 + f - n - h);
                this._w = (l - i) / m, this._x = (r + c) / m, this._y = (o + d) / m, this._z = .25 * m;
            }
            return this._onChangeCallback(), this;
        }
        setFromUnitVectors(t, e) {
            let n = t.dot(e) + 1;
            return n < Number.EPSILON ? (n = 0, Math.abs(t.x) > Math.abs(t.z) ? (this._x = -t.y, this._y = t.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -t.z, this._z = t.y, this._w = n)) : (this._x = t.y * e.z - t.z * e.y, this._y = t.z * e.x - t.x * e.z, this._z = t.x * e.y - t.y * e.x, this._w = n), this.normalize();
        }
        angleTo(t) {
            return 2 * Math.acos(Math.abs(Q(this.dot(t), -1, 1)));
        }
        rotateTowards(t, e) {
            const n = this.angleTo(t);
            if (n === 0) return this;
            const i = Math.min(1, e / n);
            return this.slerp(t, i), this;
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
            const n = t._x, i = t._y, r = t._z, l = t._w, h = e._x, o = e._y, c = e._z, d = e._w;
            return this._x = n * d + l * h + i * c - r * o, this._y = i * d + l * o + r * h - n * c, this._z = r * d + l * c + n * o - i * h, this._w = l * d - n * h - i * o - r * c, this._onChangeCallback(), this;
        }
        slerp(t, e) {
            if (e === 0) return this;
            if (e === 1) return this.copy(t);
            const n = this._x, i = this._y, r = this._z, l = this._w;
            let h = l * t._w + n * t._x + i * t._y + r * t._z;
            if (h < 0 ? (this._w = -t._w, this._x = -t._x, this._y = -t._y, this._z = -t._z, h = -h) : this.copy(t), h >= 1) return this._w = l, this._x = n, this._y = i, this._z = r, this;
            const o = 1 - h * h;
            if (o <= Number.EPSILON) {
                const m = 1 - e;
                return this._w = m * l + e * this._w, this._x = m * n + e * this._x, this._y = m * i + e * this._y, this._z = m * r + e * this._z, this.normalize(), this;
            }
            const c = Math.sqrt(o), d = Math.atan2(c, h), f = Math.sin((1 - e) * d) / c, y = Math.sin(e * d) / c;
            return this._w = l * f + this._w * y, this._x = n * f + this._x * y, this._y = i * f + this._y * y, this._z = r * f + this._z * y, this._onChangeCallback(), this;
        }
        slerpQuaternions(t, e, n) {
            return this.copy(t).slerp(e, n);
        }
        random() {
            const t = 2 * Math.PI * Math.random(), e = 2 * Math.PI * Math.random(), n = Math.random(), i = Math.sqrt(1 - n), r = Math.sqrt(n);
            return this.set(i * Math.sin(t), i * Math.cos(t), r * Math.sin(e), r * Math.cos(e));
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
    class U {
        constructor(t = 0, e = 0, n = 0){
            U.prototype.isVector3 = !0, this.x = t, this.y = e, this.z = n;
        }
        set(t, e, n) {
            return n === void 0 && (n = this.z), this.x = t, this.y = e, this.z = n, this;
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
            return this.applyQuaternion(rr.setFromEuler(t));
        }
        applyAxisAngle(t, e) {
            return this.applyQuaternion(rr.setFromAxisAngle(t, e));
        }
        applyMatrix3(t) {
            const e = this.x, n = this.y, i = this.z, r = t.elements;
            return this.x = r[0] * e + r[3] * n + r[6] * i, this.y = r[1] * e + r[4] * n + r[7] * i, this.z = r[2] * e + r[5] * n + r[8] * i, this;
        }
        applyNormalMatrix(t) {
            return this.applyMatrix3(t).normalize();
        }
        applyMatrix4(t) {
            const e = this.x, n = this.y, i = this.z, r = t.elements, l = 1 / (r[3] * e + r[7] * n + r[11] * i + r[15]);
            return this.x = (r[0] * e + r[4] * n + r[8] * i + r[12]) * l, this.y = (r[1] * e + r[5] * n + r[9] * i + r[13]) * l, this.z = (r[2] * e + r[6] * n + r[10] * i + r[14]) * l, this;
        }
        applyQuaternion(t) {
            const e = this.x, n = this.y, i = this.z, r = t.x, l = t.y, h = t.z, o = t.w, c = 2 * (l * i - h * n), d = 2 * (h * e - r * i), f = 2 * (r * n - l * e);
            return this.x = e + o * c + l * f - h * d, this.y = n + o * d + h * c - r * f, this.z = i + o * f + r * d - l * c, this;
        }
        project(t) {
            return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix);
        }
        unproject(t) {
            return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld);
        }
        transformDirection(t) {
            const e = this.x, n = this.y, i = this.z, r = t.elements;
            return this.x = r[0] * e + r[4] * n + r[8] * i, this.y = r[1] * e + r[5] * n + r[9] * i, this.z = r[2] * e + r[6] * n + r[10] * i, this.normalize();
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
            return this.x = Q(this.x, t.x, e.x), this.y = Q(this.y, t.y, e.y), this.z = Q(this.z, t.z, e.z), this;
        }
        clampScalar(t, e) {
            return this.x = Q(this.x, t, e), this.y = Q(this.y, t, e), this.z = Q(this.z, t, e), this;
        }
        clampLength(t, e) {
            const n = this.length();
            return this.divideScalar(n || 1).multiplyScalar(Q(n, t, e));
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
        lerpVectors(t, e, n) {
            return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this.z = t.z + (e.z - t.z) * n, this;
        }
        cross(t) {
            return this.crossVectors(this, t);
        }
        crossVectors(t, e) {
            const n = t.x, i = t.y, r = t.z, l = e.x, h = e.y, o = e.z;
            return this.x = i * o - r * h, this.y = r * l - n * o, this.z = n * h - i * l, this;
        }
        projectOnVector(t) {
            const e = t.lengthSq();
            if (e === 0) return this.set(0, 0, 0);
            const n = t.dot(this) / e;
            return this.copy(t).multiplyScalar(n);
        }
        projectOnPlane(t) {
            return pn.copy(this).projectOnVector(t), this.sub(pn);
        }
        reflect(t) {
            return this.sub(pn.copy(t).multiplyScalar(2 * this.dot(t)));
        }
        angleTo(t) {
            const e = Math.sqrt(this.lengthSq() * t.lengthSq());
            if (e === 0) return Math.PI / 2;
            const n = this.dot(t) / e;
            return Math.acos(Q(n, -1, 1));
        }
        distanceTo(t) {
            return Math.sqrt(this.distanceToSquared(t));
        }
        distanceToSquared(t) {
            const e = this.x - t.x, n = this.y - t.y, i = this.z - t.z;
            return e * e + n * n + i * i;
        }
        manhattanDistanceTo(t) {
            return Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z);
        }
        setFromSpherical(t) {
            return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
        }
        setFromSphericalCoords(t, e, n) {
            const i = Math.sin(e) * t;
            return this.x = i * Math.sin(n), this.y = Math.cos(e) * t, this.z = i * Math.cos(n), this;
        }
        setFromCylindrical(t) {
            return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
        }
        setFromCylindricalCoords(t, e, n) {
            return this.x = t * Math.sin(e), this.y = n, this.z = t * Math.cos(e), this;
        }
        setFromMatrixPosition(t) {
            const e = t.elements;
            return this.x = e[12], this.y = e[13], this.z = e[14], this;
        }
        setFromMatrixScale(t) {
            const e = this.setFromMatrixColumn(t, 0).length(), n = this.setFromMatrixColumn(t, 1).length(), i = this.setFromMatrixColumn(t, 2).length();
            return this.x = e, this.y = n, this.z = i, this;
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
            const t = Math.random() * Math.PI * 2, e = Math.random() * 2 - 1, n = Math.sqrt(1 - e * e);
            return this.x = n * Math.cos(t), this.y = e, this.z = n * Math.sin(t), this;
        }
        *[Symbol.iterator]() {
            yield this.x, yield this.y, yield this.z;
        }
    }
    const pn = new U, rr = new Te;
    class Ce {
        constructor(t = new U(1 / 0, 1 / 0, 1 / 0), e = new U(-1 / 0, -1 / 0, -1 / 0)){
            this.isBox3 = !0, this.min = t, this.max = e;
        }
        set(t, e) {
            return this.min.copy(t), this.max.copy(e), this;
        }
        setFromArray(t) {
            this.makeEmpty();
            for(let e = 0, n = t.length; e < n; e += 3)this.expandByPoint(wt.fromArray(t, e));
            return this;
        }
        setFromBufferAttribute(t) {
            this.makeEmpty();
            for(let e = 0, n = t.count; e < n; e++)this.expandByPoint(wt.fromBufferAttribute(t, e));
            return this;
        }
        setFromPoints(t) {
            this.makeEmpty();
            for(let e = 0, n = t.length; e < n; e++)this.expandByPoint(t[e]);
            return this;
        }
        setFromCenterAndSize(t, e) {
            const n = wt.copy(e).multiplyScalar(.5);
            return this.min.copy(t).sub(n), this.max.copy(t).add(n), this;
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
            const n = t.geometry;
            if (n !== void 0) {
                const r = n.getAttribute("position");
                if (e === !0 && r !== void 0 && t.isInstancedMesh !== !0) for(let l = 0, h = r.count; l < h; l++)t.isMesh === !0 ? t.getVertexPosition(l, wt) : wt.fromBufferAttribute(r, l), wt.applyMatrix4(t.matrixWorld), this.expandByPoint(wt);
                else t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), De.copy(t.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), De.copy(n.boundingBox)), De.applyMatrix4(t.matrixWorld), this.union(De);
            }
            const i = t.children;
            for(let r = 0, l = i.length; r < l; r++)this.expandByObject(i[r], e);
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
            return this.clampPoint(t.center, wt), wt.distanceToSquared(t.center) <= t.radius * t.radius;
        }
        intersectsPlane(t) {
            let e, n;
            return t.normal.x > 0 ? (e = t.normal.x * this.min.x, n = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, n = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, n += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, n += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, n += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, n += t.normal.z * this.min.z), e <= -t.constant && n >= -t.constant;
        }
        intersectsTriangle(t) {
            if (this.isEmpty()) return !1;
            this.getCenter(_e), Be.subVectors(this.max, _e), Kt.subVectors(t.a, _e), te.subVectors(t.b, _e), ee.subVectors(t.c, _e), Ut.subVectors(te, Kt), Lt.subVectors(ee, te), Yt.subVectors(Kt, ee);
            let e = [
                0,
                -Ut.z,
                Ut.y,
                0,
                -Lt.z,
                Lt.y,
                0,
                -Yt.z,
                Yt.y,
                Ut.z,
                0,
                -Ut.x,
                Lt.z,
                0,
                -Lt.x,
                Yt.z,
                0,
                -Yt.x,
                -Ut.y,
                Ut.x,
                0,
                -Lt.y,
                Lt.x,
                0,
                -Yt.y,
                Yt.x,
                0
            ];
            return !gn(e, Kt, te, ee, Be) || (e = [
                1,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                1
            ], !gn(e, Kt, te, ee, Be)) ? !1 : (We.crossVectors(Ut, Lt), e = [
                We.x,
                We.y,
                We.z
            ], gn(e, Kt, te, ee, Be));
        }
        clampPoint(t, e) {
            return e.copy(t).clamp(this.min, this.max);
        }
        distanceToPoint(t) {
            return this.clampPoint(t, wt).distanceTo(t);
        }
        getBoundingSphere(t) {
            return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(wt).length() * .5), t;
        }
        intersect(t) {
            return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), this;
        }
        union(t) {
            return this.min.min(t.min), this.max.max(t.max), this;
        }
        applyMatrix4(t) {
            return this.isEmpty() ? this : (Ft[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), Ft[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), Ft[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), Ft[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), Ft[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), Ft[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), Ft[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), Ft[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(Ft), this);
        }
        translate(t) {
            return this.min.add(t), this.max.add(t), this;
        }
        equals(t) {
            return t.min.equals(this.min) && t.max.equals(this.max);
        }
    }
    const Ft = [
        new U,
        new U,
        new U,
        new U,
        new U,
        new U,
        new U,
        new U
    ], wt = new U, De = new Ce, Kt = new U, te = new U, ee = new U, Ut = new U, Lt = new U, Yt = new U, _e = new U, Be = new U, We = new U, Vt = new U;
    function gn(p, t, e, n, i) {
        for(let r = 0, l = p.length - 3; r <= l; r += 3){
            Vt.fromArray(p, r);
            const h = i.x * Math.abs(Vt.x) + i.y * Math.abs(Vt.y) + i.z * Math.abs(Vt.z), o = t.dot(Vt), c = e.dot(Vt), d = n.dot(Vt);
            if (Math.max(-Math.max(o, c, d), Math.min(o, c, d)) > h) return !1;
        }
        return !0;
    }
    const ws = new Ce, xe = new U, _n = new U;
    class vs {
        constructor(t = new U, e = -1){
            this.isSphere = !0, this.center = t, this.radius = e;
        }
        set(t, e) {
            return this.center.copy(t), this.radius = e, this;
        }
        setFromPoints(t, e) {
            const n = this.center;
            e !== void 0 ? n.copy(e) : ws.setFromPoints(t).getCenter(n);
            let i = 0;
            for(let r = 0, l = t.length; r < l; r++)i = Math.max(i, n.distanceToSquared(t[r]));
            return this.radius = Math.sqrt(i), this;
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
            const n = this.center.distanceToSquared(t);
            return e.copy(t), n > this.radius * this.radius && (e.sub(this.center).normalize(), e.multiplyScalar(this.radius).add(this.center)), e;
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
            xe.subVectors(t, this.center);
            const e = xe.lengthSq();
            if (e > this.radius * this.radius) {
                const n = Math.sqrt(e), i = (n - this.radius) * .5;
                this.center.addScaledVector(xe, i / n), this.radius += i;
            }
            return this;
        }
        union(t) {
            return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === !0 ? this.radius = Math.max(this.radius, t.radius) : (_n.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(xe.copy(t.center).add(_n)), this.expandByPoint(xe.copy(t.center).sub(_n))), this);
        }
        equals(t) {
            return t.center.equals(this.center) && t.radius === this.radius;
        }
        clone() {
            return new this.constructor().copy(this);
        }
    }
    class Ct {
        constructor(t, e, n, i, r, l, h, o, c, d, f, y, m, x, b, A){
            Ct.prototype.isMatrix4 = !0, this.elements = [
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
            ], t !== void 0 && this.set(t, e, n, i, r, l, h, o, c, d, f, y, m, x, b, A);
        }
        set(t, e, n, i, r, l, h, o, c, d, f, y, m, x, b, A) {
            const M = this.elements;
            return M[0] = t, M[4] = e, M[8] = n, M[12] = i, M[1] = r, M[5] = l, M[9] = h, M[13] = o, M[2] = c, M[6] = d, M[10] = f, M[14] = y, M[3] = m, M[7] = x, M[11] = b, M[15] = A, this;
        }
        identity() {
            return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
        }
        clone() {
            return new Ct().fromArray(this.elements);
        }
        copy(t) {
            const e = this.elements, n = t.elements;
            return e[0] = n[0], e[1] = n[1], e[2] = n[2], e[3] = n[3], e[4] = n[4], e[5] = n[5], e[6] = n[6], e[7] = n[7], e[8] = n[8], e[9] = n[9], e[10] = n[10], e[11] = n[11], e[12] = n[12], e[13] = n[13], e[14] = n[14], e[15] = n[15], this;
        }
        copyPosition(t) {
            const e = this.elements, n = t.elements;
            return e[12] = n[12], e[13] = n[13], e[14] = n[14], this;
        }
        setFromMatrix3(t) {
            const e = t.elements;
            return this.set(e[0], e[3], e[6], 0, e[1], e[4], e[7], 0, e[2], e[5], e[8], 0, 0, 0, 0, 1), this;
        }
        extractBasis(t, e, n) {
            return t.setFromMatrixColumn(this, 0), e.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this;
        }
        makeBasis(t, e, n) {
            return this.set(t.x, e.x, n.x, 0, t.y, e.y, n.y, 0, t.z, e.z, n.z, 0, 0, 0, 0, 1), this;
        }
        extractRotation(t) {
            const e = this.elements, n = t.elements, i = 1 / ne.setFromMatrixColumn(t, 0).length(), r = 1 / ne.setFromMatrixColumn(t, 1).length(), l = 1 / ne.setFromMatrixColumn(t, 2).length();
            return e[0] = n[0] * i, e[1] = n[1] * i, e[2] = n[2] * i, e[3] = 0, e[4] = n[4] * r, e[5] = n[5] * r, e[6] = n[6] * r, e[7] = 0, e[8] = n[8] * l, e[9] = n[9] * l, e[10] = n[10] * l, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
        }
        makeRotationFromEuler(t) {
            const e = this.elements, n = t.x, i = t.y, r = t.z, l = Math.cos(n), h = Math.sin(n), o = Math.cos(i), c = Math.sin(i), d = Math.cos(r), f = Math.sin(r);
            if (t.order === "XYZ") {
                const y = l * d, m = l * f, x = h * d, b = h * f;
                e[0] = o * d, e[4] = -o * f, e[8] = c, e[1] = m + x * c, e[5] = y - b * c, e[9] = -h * o, e[2] = b - y * c, e[6] = x + m * c, e[10] = l * o;
            } else if (t.order === "YXZ") {
                const y = o * d, m = o * f, x = c * d, b = c * f;
                e[0] = y + b * h, e[4] = x * h - m, e[8] = l * c, e[1] = l * f, e[5] = l * d, e[9] = -h, e[2] = m * h - x, e[6] = b + y * h, e[10] = l * o;
            } else if (t.order === "ZXY") {
                const y = o * d, m = o * f, x = c * d, b = c * f;
                e[0] = y - b * h, e[4] = -l * f, e[8] = x + m * h, e[1] = m + x * h, e[5] = l * d, e[9] = b - y * h, e[2] = -l * c, e[6] = h, e[10] = l * o;
            } else if (t.order === "ZYX") {
                const y = l * d, m = l * f, x = h * d, b = h * f;
                e[0] = o * d, e[4] = x * c - m, e[8] = y * c + b, e[1] = o * f, e[5] = b * c + y, e[9] = m * c - x, e[2] = -c, e[6] = h * o, e[10] = l * o;
            } else if (t.order === "YZX") {
                const y = l * o, m = l * c, x = h * o, b = h * c;
                e[0] = o * d, e[4] = b - y * f, e[8] = x * f + m, e[1] = f, e[5] = l * d, e[9] = -h * d, e[2] = -c * d, e[6] = m * f + x, e[10] = y - b * f;
            } else if (t.order === "XZY") {
                const y = l * o, m = l * c, x = h * o, b = h * c;
                e[0] = o * d, e[4] = -f, e[8] = c * d, e[1] = y * f + b, e[5] = l * d, e[9] = m * f - x, e[2] = x * f - m, e[6] = h * d, e[10] = b * f + y;
            }
            return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
        }
        makeRotationFromQuaternion(t) {
            return this.compose(Ms, t, As);
        }
        lookAt(t, e, n) {
            const i = this.elements;
            return yt.subVectors(t, e), yt.lengthSq() === 0 && (yt.z = 1), yt.normalize(), Ot.crossVectors(n, yt), Ot.lengthSq() === 0 && (Math.abs(n.z) === 1 ? yt.x += 1e-4 : yt.z += 1e-4, yt.normalize(), Ot.crossVectors(n, yt)), Ot.normalize(), Ne.crossVectors(yt, Ot), i[0] = Ot.x, i[4] = Ne.x, i[8] = yt.x, i[1] = Ot.y, i[5] = Ne.y, i[9] = yt.y, i[2] = Ot.z, i[6] = Ne.z, i[10] = yt.z, this;
        }
        multiply(t) {
            return this.multiplyMatrices(this, t);
        }
        premultiply(t) {
            return this.multiplyMatrices(t, this);
        }
        multiplyMatrices(t, e) {
            const n = t.elements, i = e.elements, r = this.elements, l = n[0], h = n[4], o = n[8], c = n[12], d = n[1], f = n[5], y = n[9], m = n[13], x = n[2], b = n[6], A = n[10], M = n[14], F = n[3], k = n[7], L = n[11], R = n[15], B = i[0], E = i[4], _ = i[8], z = i[12], I = i[1], D = i[5], N = i[9], V = i[13], Z = i[2], ut = i[6], it = i[10], X = i[14], tt = i[3], st = i[7], q = i[11], j = i[15];
            return r[0] = l * B + h * I + o * Z + c * tt, r[4] = l * E + h * D + o * ut + c * st, r[8] = l * _ + h * N + o * it + c * q, r[12] = l * z + h * V + o * X + c * j, r[1] = d * B + f * I + y * Z + m * tt, r[5] = d * E + f * D + y * ut + m * st, r[9] = d * _ + f * N + y * it + m * q, r[13] = d * z + f * V + y * X + m * j, r[2] = x * B + b * I + A * Z + M * tt, r[6] = x * E + b * D + A * ut + M * st, r[10] = x * _ + b * N + A * it + M * q, r[14] = x * z + b * V + A * X + M * j, r[3] = F * B + k * I + L * Z + R * tt, r[7] = F * E + k * D + L * ut + R * st, r[11] = F * _ + k * N + L * it + R * q, r[15] = F * z + k * V + L * X + R * j, this;
        }
        multiplyScalar(t) {
            const e = this.elements;
            return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this;
        }
        determinant() {
            const t = this.elements, e = t[0], n = t[4], i = t[8], r = t[12], l = t[1], h = t[5], o = t[9], c = t[13], d = t[2], f = t[6], y = t[10], m = t[14], x = t[3], b = t[7], A = t[11], M = t[15];
            return x * (+r * o * f - i * c * f - r * h * y + n * c * y + i * h * m - n * o * m) + b * (+e * o * m - e * c * y + r * l * y - i * l * m + i * c * d - r * o * d) + A * (+e * c * f - e * h * m - r * l * f + n * l * m + r * h * d - n * c * d) + M * (-i * h * d - e * o * f + e * h * y + i * l * f - n * l * y + n * o * d);
        }
        transpose() {
            const t = this.elements;
            let e;
            return e = t[1], t[1] = t[4], t[4] = e, e = t[2], t[2] = t[8], t[8] = e, e = t[6], t[6] = t[9], t[9] = e, e = t[3], t[3] = t[12], t[12] = e, e = t[7], t[7] = t[13], t[13] = e, e = t[11], t[11] = t[14], t[14] = e, this;
        }
        setPosition(t, e, n) {
            const i = this.elements;
            return t.isVector3 ? (i[12] = t.x, i[13] = t.y, i[14] = t.z) : (i[12] = t, i[13] = e, i[14] = n), this;
        }
        invert() {
            const t = this.elements, e = t[0], n = t[1], i = t[2], r = t[3], l = t[4], h = t[5], o = t[6], c = t[7], d = t[8], f = t[9], y = t[10], m = t[11], x = t[12], b = t[13], A = t[14], M = t[15], F = f * A * c - b * y * c + b * o * m - h * A * m - f * o * M + h * y * M, k = x * y * c - d * A * c - x * o * m + l * A * m + d * o * M - l * y * M, L = d * b * c - x * f * c + x * h * m - l * b * m - d * h * M + l * f * M, R = x * f * o - d * b * o - x * h * y + l * b * y + d * h * A - l * f * A, B = e * F + n * k + i * L + r * R;
            if (B === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            const E = 1 / B;
            return t[0] = F * E, t[1] = (b * y * r - f * A * r - b * i * m + n * A * m + f * i * M - n * y * M) * E, t[2] = (h * A * r - b * o * r + b * i * c - n * A * c - h * i * M + n * o * M) * E, t[3] = (f * o * r - h * y * r - f * i * c + n * y * c + h * i * m - n * o * m) * E, t[4] = k * E, t[5] = (d * A * r - x * y * r + x * i * m - e * A * m - d * i * M + e * y * M) * E, t[6] = (x * o * r - l * A * r - x * i * c + e * A * c + l * i * M - e * o * M) * E, t[7] = (l * y * r - d * o * r + d * i * c - e * y * c - l * i * m + e * o * m) * E, t[8] = L * E, t[9] = (x * f * r - d * b * r - x * n * m + e * b * m + d * n * M - e * f * M) * E, t[10] = (l * b * r - x * h * r + x * n * c - e * b * c - l * n * M + e * h * M) * E, t[11] = (d * h * r - l * f * r - d * n * c + e * f * c + l * n * m - e * h * m) * E, t[12] = R * E, t[13] = (d * b * i - x * f * i + x * n * y - e * b * y - d * n * A + e * f * A) * E, t[14] = (x * h * i - l * b * i - x * n * o + e * b * o + l * n * A - e * h * A) * E, t[15] = (l * f * i - d * h * i + d * n * o - e * f * o - l * n * y + e * h * y) * E, this;
        }
        scale(t) {
            const e = this.elements, n = t.x, i = t.y, r = t.z;
            return e[0] *= n, e[4] *= i, e[8] *= r, e[1] *= n, e[5] *= i, e[9] *= r, e[2] *= n, e[6] *= i, e[10] *= r, e[3] *= n, e[7] *= i, e[11] *= r, this;
        }
        getMaxScaleOnAxis() {
            const t = this.elements, e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2], n = t[4] * t[4] + t[5] * t[5] + t[6] * t[6], i = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
            return Math.sqrt(Math.max(e, n, i));
        }
        makeTranslation(t, e, n) {
            return t.isVector3 ? this.set(1, 0, 0, t.x, 0, 1, 0, t.y, 0, 0, 1, t.z, 0, 0, 0, 1) : this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, n, 0, 0, 0, 1), this;
        }
        makeRotationX(t) {
            const e = Math.cos(t), n = Math.sin(t);
            return this.set(1, 0, 0, 0, 0, e, -n, 0, 0, n, e, 0, 0, 0, 0, 1), this;
        }
        makeRotationY(t) {
            const e = Math.cos(t), n = Math.sin(t);
            return this.set(e, 0, n, 0, 0, 1, 0, 0, -n, 0, e, 0, 0, 0, 0, 1), this;
        }
        makeRotationZ(t) {
            const e = Math.cos(t), n = Math.sin(t);
            return this.set(e, -n, 0, 0, n, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
        }
        makeRotationAxis(t, e) {
            const n = Math.cos(e), i = Math.sin(e), r = 1 - n, l = t.x, h = t.y, o = t.z, c = r * l, d = r * h;
            return this.set(c * l + n, c * h - i * o, c * o + i * h, 0, c * h + i * o, d * h + n, d * o - i * l, 0, c * o - i * h, d * o + i * l, r * o * o + n, 0, 0, 0, 0, 1), this;
        }
        makeScale(t, e, n) {
            return this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this;
        }
        makeShear(t, e, n, i, r, l) {
            return this.set(1, n, r, 0, t, 1, l, 0, e, i, 1, 0, 0, 0, 0, 1), this;
        }
        compose(t, e, n) {
            const i = this.elements, r = e._x, l = e._y, h = e._z, o = e._w, c = r + r, d = l + l, f = h + h, y = r * c, m = r * d, x = r * f, b = l * d, A = l * f, M = h * f, F = o * c, k = o * d, L = o * f, R = n.x, B = n.y, E = n.z;
            return i[0] = (1 - (b + M)) * R, i[1] = (m + L) * R, i[2] = (x - k) * R, i[3] = 0, i[4] = (m - L) * B, i[5] = (1 - (y + M)) * B, i[6] = (A + F) * B, i[7] = 0, i[8] = (x + k) * E, i[9] = (A - F) * E, i[10] = (1 - (y + b)) * E, i[11] = 0, i[12] = t.x, i[13] = t.y, i[14] = t.z, i[15] = 1, this;
        }
        decompose(t, e, n) {
            const i = this.elements;
            let r = ne.set(i[0], i[1], i[2]).length();
            const l = ne.set(i[4], i[5], i[6]).length(), h = ne.set(i[8], i[9], i[10]).length();
            this.determinant() < 0 && (r = -r), t.x = i[12], t.y = i[13], t.z = i[14], vt.copy(this);
            const c = 1 / r, d = 1 / l, f = 1 / h;
            return vt.elements[0] *= c, vt.elements[1] *= c, vt.elements[2] *= c, vt.elements[4] *= d, vt.elements[5] *= d, vt.elements[6] *= d, vt.elements[8] *= f, vt.elements[9] *= f, vt.elements[10] *= f, e.setFromRotationMatrix(vt), n.x = r, n.y = l, n.z = h, this;
        }
        makePerspective(t, e, n, i, r, l, h = 2e3) {
            const o = this.elements, c = 2 * r / (e - t), d = 2 * r / (n - i), f = (e + t) / (e - t), y = (n + i) / (n - i);
            let m, x;
            if (h === 2e3) m = -(l + r) / (l - r), x = -2 * l * r / (l - r);
            else if (h === 2001) m = -l / (l - r), x = -l * r / (l - r);
            else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + h);
            return o[0] = c, o[4] = 0, o[8] = f, o[12] = 0, o[1] = 0, o[5] = d, o[9] = y, o[13] = 0, o[2] = 0, o[6] = 0, o[10] = m, o[14] = x, o[3] = 0, o[7] = 0, o[11] = -1, o[15] = 0, this;
        }
        makeOrthographic(t, e, n, i, r, l, h = 2e3) {
            const o = this.elements, c = 1 / (e - t), d = 1 / (n - i), f = 1 / (l - r), y = (e + t) * c, m = (n + i) * d;
            let x, b;
            if (h === 2e3) x = (l + r) * f, b = -2 * f;
            else if (h === 2001) x = r * f, b = -1 * f;
            else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + h);
            return o[0] = 2 * c, o[4] = 0, o[8] = 0, o[12] = -y, o[1] = 0, o[5] = 2 * d, o[9] = 0, o[13] = -m, o[2] = 0, o[6] = 0, o[10] = b, o[14] = -x, o[3] = 0, o[7] = 0, o[11] = 0, o[15] = 1, this;
        }
        equals(t) {
            const e = this.elements, n = t.elements;
            for(let i = 0; i < 16; i++)if (e[i] !== n[i]) return !1;
            return !0;
        }
        fromArray(t, e = 0) {
            for(let n = 0; n < 16; n++)this.elements[n] = t[n + e];
            return this;
        }
        toArray(t = [], e = 0) {
            const n = this.elements;
            return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t[e + 9] = n[9], t[e + 10] = n[10], t[e + 11] = n[11], t[e + 12] = n[12], t[e + 13] = n[13], t[e + 14] = n[14], t[e + 15] = n[15], t;
        }
    }
    const ne = new U, vt = new Ct, Ms = new U(0, 0, 0), As = new U(1, 1, 1), Ot = new U, Ne = new U, yt = new U, ir = new Ct, sr = new Te;
    class qe {
        constructor(t = 0, e = 0, n = 0, i = qe.DEFAULT_ORDER){
            this.isEuler = !0, this._x = t, this._y = e, this._z = n, this._order = i;
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
        set(t, e, n, i = this._order) {
            return this._x = t, this._y = e, this._z = n, this._order = i, this._onChangeCallback(), this;
        }
        clone() {
            return new this.constructor(this._x, this._y, this._z, this._order);
        }
        copy(t) {
            return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this._onChangeCallback(), this;
        }
        setFromRotationMatrix(t, e = this._order, n = !0) {
            const i = t.elements, r = i[0], l = i[4], h = i[8], o = i[1], c = i[5], d = i[9], f = i[2], y = i[6], m = i[10];
            switch(e){
                case "XYZ":
                    this._y = Math.asin(Q(h, -1, 1)), Math.abs(h) < .9999999 ? (this._x = Math.atan2(-d, m), this._z = Math.atan2(-l, r)) : (this._x = Math.atan2(y, c), this._z = 0);
                    break;
                case "YXZ":
                    this._x = Math.asin(-Q(d, -1, 1)), Math.abs(d) < .9999999 ? (this._y = Math.atan2(h, m), this._z = Math.atan2(o, c)) : (this._y = Math.atan2(-f, r), this._z = 0);
                    break;
                case "ZXY":
                    this._x = Math.asin(Q(y, -1, 1)), Math.abs(y) < .9999999 ? (this._y = Math.atan2(-f, m), this._z = Math.atan2(-l, c)) : (this._y = 0, this._z = Math.atan2(o, r));
                    break;
                case "ZYX":
                    this._y = Math.asin(-Q(f, -1, 1)), Math.abs(f) < .9999999 ? (this._x = Math.atan2(y, m), this._z = Math.atan2(o, r)) : (this._x = 0, this._z = Math.atan2(-l, c));
                    break;
                case "YZX":
                    this._z = Math.asin(Q(o, -1, 1)), Math.abs(o) < .9999999 ? (this._x = Math.atan2(-d, c), this._y = Math.atan2(-f, r)) : (this._x = 0, this._y = Math.atan2(h, m));
                    break;
                case "XZY":
                    this._z = Math.asin(-Q(l, -1, 1)), Math.abs(l) < .9999999 ? (this._x = Math.atan2(y, c), this._y = Math.atan2(h, r)) : (this._x = Math.atan2(-d, m), this._y = 0);
                    break;
                default:
                    console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + e);
            }
            return this._order = e, n === !0 && this._onChangeCallback(), this;
        }
        setFromQuaternion(t, e, n) {
            return ir.makeRotationFromQuaternion(t), this.setFromRotationMatrix(ir, e, n);
        }
        setFromVector3(t, e = this._order) {
            return this.set(t.x, t.y, t.z, e);
        }
        reorder(t) {
            return sr.setFromEuler(this), this.setFromQuaternion(sr, t);
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
    qe.DEFAULT_ORDER = "XYZ";
    class Ss {
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
    let Ts = 0;
    const ar = new U, re = new Te, Pt = new Ct, $e = new U, be = new U, Cs = new U, zs = new Te, or = new U(1, 0, 0), hr = new U(0, 1, 0), lr = new U(0, 0, 1), cr = {
        type: "added"
    }, Es = {
        type: "removed"
    }, ie = {
        type: "childadded",
        child: null
    }, xn = {
        type: "childremoved",
        child: null
    };
    class Dt extends Sn {
        constructor(){
            super(), this.isObject3D = !0, Object.defineProperty(this, "id", {
                value: Ts++
            }), this.uuid = Ve(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = Dt.DEFAULT_UP.clone();
            const t = new U, e = new qe, n = new Te, i = new U(1, 1, 1);
            function r() {
                n.setFromEuler(e, !1);
            }
            function l() {
                e.setFromQuaternion(n, void 0, !1);
            }
            e._onChange(r), n._onChange(l), Object.defineProperties(this, {
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
                    value: n
                },
                scale: {
                    configurable: !0,
                    enumerable: !0,
                    value: i
                },
                modelViewMatrix: {
                    value: new Ct
                },
                normalMatrix: {
                    value: new he
                }
            }), this.matrix = new Ct, this.matrixWorld = new Ct, this.matrixAutoUpdate = Dt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = Dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new Ss, this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
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
            return this.rotateOnAxis(or, t);
        }
        rotateY(t) {
            return this.rotateOnAxis(hr, t);
        }
        rotateZ(t) {
            return this.rotateOnAxis(lr, t);
        }
        translateOnAxis(t, e) {
            return ar.copy(t).applyQuaternion(this.quaternion), this.position.add(ar.multiplyScalar(e)), this;
        }
        translateX(t) {
            return this.translateOnAxis(or, t);
        }
        translateY(t) {
            return this.translateOnAxis(hr, t);
        }
        translateZ(t) {
            return this.translateOnAxis(lr, t);
        }
        localToWorld(t) {
            return this.updateWorldMatrix(!0, !1), t.applyMatrix4(this.matrixWorld);
        }
        worldToLocal(t) {
            return this.updateWorldMatrix(!0, !1), t.applyMatrix4(Pt.copy(this.matrixWorld).invert());
        }
        lookAt(t, e, n) {
            t.isVector3 ? $e.copy(t) : $e.set(t, e, n);
            const i = this.parent;
            this.updateWorldMatrix(!0, !1), be.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Pt.lookAt(be, $e, this.up) : Pt.lookAt($e, be, this.up), this.quaternion.setFromRotationMatrix(Pt), i && (Pt.extractRotation(i.matrixWorld), re.setFromRotationMatrix(Pt), this.quaternion.premultiply(re.invert()));
        }
        add(t) {
            if (arguments.length > 1) {
                for(let e = 0; e < arguments.length; e++)this.add(arguments[e]);
                return this;
            }
            return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(cr), ie.child = t, this.dispatchEvent(ie), ie.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
        }
        remove(t) {
            if (arguments.length > 1) {
                for(let n = 0; n < arguments.length; n++)this.remove(arguments[n]);
                return this;
            }
            const e = this.children.indexOf(t);
            return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(Es), xn.child = t, this.dispatchEvent(xn), xn.child = null), this;
        }
        removeFromParent() {
            const t = this.parent;
            return t !== null && t.remove(this), this;
        }
        clear() {
            return this.remove(...this.children);
        }
        attach(t) {
            return this.updateWorldMatrix(!0, !1), Pt.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(!0, !1), Pt.multiply(t.parent.matrixWorld)), t.applyMatrix4(Pt), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(!1, !0), t.dispatchEvent(cr), ie.child = t, this.dispatchEvent(ie), ie.child = null, this;
        }
        getObjectById(t) {
            return this.getObjectByProperty("id", t);
        }
        getObjectByName(t) {
            return this.getObjectByProperty("name", t);
        }
        getObjectByProperty(t, e) {
            if (this[t] === e) return this;
            for(let n = 0, i = this.children.length; n < i; n++){
                const l = this.children[n].getObjectByProperty(t, e);
                if (l !== void 0) return l;
            }
        }
        getObjectsByProperty(t, e, n = []) {
            this[t] === e && n.push(this);
            const i = this.children;
            for(let r = 0, l = i.length; r < l; r++)i[r].getObjectsByProperty(t, e, n);
            return n;
        }
        getWorldPosition(t) {
            return this.updateWorldMatrix(!0, !1), t.setFromMatrixPosition(this.matrixWorld);
        }
        getWorldQuaternion(t) {
            return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(be, t, Cs), t;
        }
        getWorldScale(t) {
            return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(be, zs, t), t;
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
            for(let n = 0, i = e.length; n < i; n++)e[n].traverse(t);
        }
        traverseVisible(t) {
            if (this.visible === !1) return;
            t(this);
            const e = this.children;
            for(let n = 0, i = e.length; n < i; n++)e[n].traverseVisible(t);
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
            for(let n = 0, i = e.length; n < i; n++)e[n].updateMatrixWorld(t);
        }
        updateWorldMatrix(t, e) {
            const n = this.parent;
            if (t === !0 && n !== null && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), e === !0) {
                const i = this.children;
                for(let r = 0, l = i.length; r < l; r++)i[r].updateWorldMatrix(!1, !0);
            }
        }
        toJSON(t) {
            const e = t === void 0 || typeof t == "string", n = {};
            e && (t = {
                geometries: {},
                materials: {},
                textures: {},
                images: {},
                shapes: {},
                skeletons: {},
                animations: {},
                nodes: {}
            }, n.metadata = {
                version: 4.6,
                type: "Object",
                generator: "Object3D.toJSON"
            });
            const i = {};
            i.uuid = this.uuid, i.type = this.type, this.name !== "" && (i.name = this.name), this.castShadow === !0 && (i.castShadow = !0), this.receiveShadow === !0 && (i.receiveShadow = !0), this.visible === !1 && (i.visible = !1), this.frustumCulled === !1 && (i.frustumCulled = !1), this.renderOrder !== 0 && (i.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (i.userData = this.userData), i.layers = this.layers.mask, i.matrix = this.matrix.toArray(), i.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (i.matrixAutoUpdate = !1), this.isInstancedMesh && (i.type = "InstancedMesh", i.count = this.count, i.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (i.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (i.type = "BatchedMesh", i.perObjectFrustumCulled = this.perObjectFrustumCulled, i.sortObjects = this.sortObjects, i.drawRanges = this._drawRanges, i.reservedRanges = this._reservedRanges, i.visibility = this._visibility, i.active = this._active, i.bounds = this._bounds.map((h)=>({
                    boxInitialized: h.boxInitialized,
                    boxMin: h.box.min.toArray(),
                    boxMax: h.box.max.toArray(),
                    sphereInitialized: h.sphereInitialized,
                    sphereRadius: h.sphere.radius,
                    sphereCenter: h.sphere.center.toArray()
                })), i.maxInstanceCount = this._maxInstanceCount, i.maxVertexCount = this._maxVertexCount, i.maxIndexCount = this._maxIndexCount, i.geometryInitialized = this._geometryInitialized, i.geometryCount = this._geometryCount, i.matricesTexture = this._matricesTexture.toJSON(t), this._colorsTexture !== null && (i.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (i.boundingSphere = {
                center: i.boundingSphere.center.toArray(),
                radius: i.boundingSphere.radius
            }), this.boundingBox !== null && (i.boundingBox = {
                min: i.boundingBox.min.toArray(),
                max: i.boundingBox.max.toArray()
            }));
            function r(h, o) {
                return h[o.uuid] === void 0 && (h[o.uuid] = o.toJSON(t)), o.uuid;
            }
            if (this.isScene) this.background && (this.background.isColor ? i.background = this.background.toJSON() : this.background.isTexture && (i.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (i.environment = this.environment.toJSON(t).uuid);
            else if (this.isMesh || this.isLine || this.isPoints) {
                i.geometry = r(t.geometries, this.geometry);
                const h = this.geometry.parameters;
                if (h !== void 0 && h.shapes !== void 0) {
                    const o = h.shapes;
                    if (Array.isArray(o)) for(let c = 0, d = o.length; c < d; c++){
                        const f = o[c];
                        r(t.shapes, f);
                    }
                    else r(t.shapes, o);
                }
            }
            if (this.isSkinnedMesh && (i.bindMode = this.bindMode, i.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(t.skeletons, this.skeleton), i.skeleton = this.skeleton.uuid)), this.material !== void 0) if (Array.isArray(this.material)) {
                const h = [];
                for(let o = 0, c = this.material.length; o < c; o++)h.push(r(t.materials, this.material[o]));
                i.material = h;
            } else i.material = r(t.materials, this.material);
            if (this.children.length > 0) {
                i.children = [];
                for(let h = 0; h < this.children.length; h++)i.children.push(this.children[h].toJSON(t).object);
            }
            if (this.animations.length > 0) {
                i.animations = [];
                for(let h = 0; h < this.animations.length; h++){
                    const o = this.animations[h];
                    i.animations.push(r(t.animations, o));
                }
            }
            if (e) {
                const h = l(t.geometries), o = l(t.materials), c = l(t.textures), d = l(t.images), f = l(t.shapes), y = l(t.skeletons), m = l(t.animations), x = l(t.nodes);
                h.length > 0 && (n.geometries = h), o.length > 0 && (n.materials = o), c.length > 0 && (n.textures = c), d.length > 0 && (n.images = d), f.length > 0 && (n.shapes = f), y.length > 0 && (n.skeletons = y), m.length > 0 && (n.animations = m), x.length > 0 && (n.nodes = x);
            }
            return n.object = i, n;
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
            if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, this.animations = t.animations.slice(), this.userData = JSON.parse(JSON.stringify(t.userData)), e === !0) for(let n = 0; n < t.children.length; n++){
                const i = t.children[n];
                this.add(i.clone());
            }
            return this;
        }
    }
    Dt.DEFAULT_UP = new U(0, 1, 0);
    Dt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
    Dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
    const K = new U, He = new It;
    let Fs = 0;
    class Bt {
        constructor(t, e, n = !1){
            if (Array.isArray(t)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
            this.isBufferAttribute = !0, Object.defineProperty(this, "id", {
                value: Fs++
            }), this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = 35044, this.updateRanges = [], this.gpuType = 1015, this.version = 0;
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
        copyAt(t, e, n) {
            t *= this.itemSize, n *= e.itemSize;
            for(let i = 0, r = this.itemSize; i < r; i++)this.array[t + i] = e.array[n + i];
            return this;
        }
        copyArray(t) {
            return this.array.set(t), this;
        }
        applyMatrix3(t) {
            if (this.itemSize === 2) for(let e = 0, n = this.count; e < n; e++)He.fromBufferAttribute(this, e), He.applyMatrix3(t), this.setXY(e, He.x, He.y);
            else if (this.itemSize === 3) for(let e = 0, n = this.count; e < n; e++)K.fromBufferAttribute(this, e), K.applyMatrix3(t), this.setXYZ(e, K.x, K.y, K.z);
            return this;
        }
        applyMatrix4(t) {
            for(let e = 0, n = this.count; e < n; e++)K.fromBufferAttribute(this, e), K.applyMatrix4(t), this.setXYZ(e, K.x, K.y, K.z);
            return this;
        }
        applyNormalMatrix(t) {
            for(let e = 0, n = this.count; e < n; e++)K.fromBufferAttribute(this, e), K.applyNormalMatrix(t), this.setXYZ(e, K.x, K.y, K.z);
            return this;
        }
        transformDirection(t) {
            for(let e = 0, n = this.count; e < n; e++)K.fromBufferAttribute(this, e), K.transformDirection(t), this.setXYZ(e, K.x, K.y, K.z);
            return this;
        }
        set(t, e = 0) {
            return this.array.set(t, e), this;
        }
        getComponent(t, e) {
            let n = this.array[t * this.itemSize + e];
            return this.normalized && (n = ge(n, this.array)), n;
        }
        setComponent(t, e, n) {
            return this.normalized && (n = ft(n, this.array)), this.array[t * this.itemSize + e] = n, this;
        }
        getX(t) {
            let e = this.array[t * this.itemSize];
            return this.normalized && (e = ge(e, this.array)), e;
        }
        setX(t, e) {
            return this.normalized && (e = ft(e, this.array)), this.array[t * this.itemSize] = e, this;
        }
        getY(t) {
            let e = this.array[t * this.itemSize + 1];
            return this.normalized && (e = ge(e, this.array)), e;
        }
        setY(t, e) {
            return this.normalized && (e = ft(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
        }
        getZ(t) {
            let e = this.array[t * this.itemSize + 2];
            return this.normalized && (e = ge(e, this.array)), e;
        }
        setZ(t, e) {
            return this.normalized && (e = ft(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
        }
        getW(t) {
            let e = this.array[t * this.itemSize + 3];
            return this.normalized && (e = ge(e, this.array)), e;
        }
        setW(t, e) {
            return this.normalized && (e = ft(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
        }
        setXY(t, e, n) {
            return t *= this.itemSize, this.normalized && (e = ft(e, this.array), n = ft(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this;
        }
        setXYZ(t, e, n, i) {
            return t *= this.itemSize, this.normalized && (e = ft(e, this.array), n = ft(n, this.array), i = ft(i, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = i, this;
        }
        setXYZW(t, e, n, i, r) {
            return t *= this.itemSize, this.normalized && (e = ft(e, this.array), n = ft(n, this.array), i = ft(i, this.array), r = ft(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = i, this.array[t + 3] = r, this;
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
    class Ps extends Bt {
        constructor(t, e, n){
            super(new Uint16Array(t), e, n);
        }
    }
    class Is extends Bt {
        constructor(t, e, n){
            super(new Uint32Array(t), e, n);
        }
    }
    class ks extends Bt {
        constructor(t, e, n){
            super(new Float32Array(t), e, n);
        }
    }
    let Rs = 0;
    const xt = new Ct, bn = new Dt, se = new U, pt = new Ce, we = new Ce, nt = new U;
    class Tn extends Sn {
        constructor(){
            super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", {
                value: Rs++
            }), this.uuid = Ve(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
                start: 0,
                count: 1 / 0
            }, this.userData = {};
        }
        getIndex() {
            return this.index;
        }
        setIndex(t) {
            return Array.isArray(t) ? this.index = new (ps(t) ? Is : Ps)(t, 1) : this.index = t, this;
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
        addGroup(t, e, n = 0) {
            this.groups.push({
                start: t,
                count: e,
                materialIndex: n
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
            const n = this.attributes.normal;
            if (n !== void 0) {
                const r = new he().getNormalMatrix(t);
                n.applyNormalMatrix(r), n.needsUpdate = !0;
            }
            const i = this.attributes.tangent;
            return i !== void 0 && (i.transformDirection(t), i.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
        }
        applyQuaternion(t) {
            return xt.makeRotationFromQuaternion(t), this.applyMatrix4(xt), this;
        }
        rotateX(t) {
            return xt.makeRotationX(t), this.applyMatrix4(xt), this;
        }
        rotateY(t) {
            return xt.makeRotationY(t), this.applyMatrix4(xt), this;
        }
        rotateZ(t) {
            return xt.makeRotationZ(t), this.applyMatrix4(xt), this;
        }
        translate(t, e, n) {
            return xt.makeTranslation(t, e, n), this.applyMatrix4(xt), this;
        }
        scale(t, e, n) {
            return xt.makeScale(t, e, n), this.applyMatrix4(xt), this;
        }
        lookAt(t) {
            return bn.lookAt(t), bn.updateMatrix(), this.applyMatrix4(bn.matrix), this;
        }
        center() {
            return this.computeBoundingBox(), this.boundingBox.getCenter(se).negate(), this.translate(se.x, se.y, se.z), this;
        }
        setFromPoints(t) {
            const e = this.getAttribute("position");
            if (e === void 0) {
                const n = [];
                for(let i = 0, r = t.length; i < r; i++){
                    const l = t[i];
                    n.push(l.x, l.y, l.z || 0);
                }
                this.setAttribute("position", new ks(n, 3));
            } else {
                const n = Math.min(t.length, e.count);
                for(let i = 0; i < n; i++){
                    const r = t[i];
                    e.setXYZ(i, r.x, r.y, r.z || 0);
                }
                t.length > e.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), e.needsUpdate = !0;
            }
            return this;
        }
        computeBoundingBox() {
            this.boundingBox === null && (this.boundingBox = new Ce);
            const t = this.attributes.position, e = this.morphAttributes.position;
            if (t && t.isGLBufferAttribute) {
                console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new U(-1 / 0, -1 / 0, -1 / 0), new U(1 / 0, 1 / 0, 1 / 0));
                return;
            }
            if (t !== void 0) {
                if (this.boundingBox.setFromBufferAttribute(t), e) for(let n = 0, i = e.length; n < i; n++){
                    const r = e[n];
                    pt.setFromBufferAttribute(r), this.morphTargetsRelative ? (nt.addVectors(this.boundingBox.min, pt.min), this.boundingBox.expandByPoint(nt), nt.addVectors(this.boundingBox.max, pt.max), this.boundingBox.expandByPoint(nt)) : (this.boundingBox.expandByPoint(pt.min), this.boundingBox.expandByPoint(pt.max));
                }
            } else this.boundingBox.makeEmpty();
            (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
        }
        computeBoundingSphere() {
            this.boundingSphere === null && (this.boundingSphere = new vs);
            const t = this.attributes.position, e = this.morphAttributes.position;
            if (t && t.isGLBufferAttribute) {
                console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new U, 1 / 0);
                return;
            }
            if (t) {
                const n = this.boundingSphere.center;
                if (pt.setFromBufferAttribute(t), e) for(let r = 0, l = e.length; r < l; r++){
                    const h = e[r];
                    we.setFromBufferAttribute(h), this.morphTargetsRelative ? (nt.addVectors(pt.min, we.min), pt.expandByPoint(nt), nt.addVectors(pt.max, we.max), pt.expandByPoint(nt)) : (pt.expandByPoint(we.min), pt.expandByPoint(we.max));
                }
                pt.getCenter(n);
                let i = 0;
                for(let r = 0, l = t.count; r < l; r++)nt.fromBufferAttribute(t, r), i = Math.max(i, n.distanceToSquared(nt));
                if (e) for(let r = 0, l = e.length; r < l; r++){
                    const h = e[r], o = this.morphTargetsRelative;
                    for(let c = 0, d = h.count; c < d; c++)nt.fromBufferAttribute(h, c), o && (se.fromBufferAttribute(t, c), nt.add(se)), i = Math.max(i, n.distanceToSquared(nt));
                }
                this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
            }
        }
        computeTangents() {
            const t = this.index, e = this.attributes;
            if (t === null || e.position === void 0 || e.normal === void 0 || e.uv === void 0) {
                console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
                return;
            }
            const n = e.position, i = e.normal, r = e.uv;
            this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new Bt(new Float32Array(4 * n.count), 4));
            const l = this.getAttribute("tangent"), h = [], o = [];
            for(let _ = 0; _ < n.count; _++)h[_] = new U, o[_] = new U;
            const c = new U, d = new U, f = new U, y = new It, m = new It, x = new It, b = new U, A = new U;
            function M(_, z, I) {
                c.fromBufferAttribute(n, _), d.fromBufferAttribute(n, z), f.fromBufferAttribute(n, I), y.fromBufferAttribute(r, _), m.fromBufferAttribute(r, z), x.fromBufferAttribute(r, I), d.sub(c), f.sub(c), m.sub(y), x.sub(y);
                const D = 1 / (m.x * x.y - x.x * m.y);
                isFinite(D) && (b.copy(d).multiplyScalar(x.y).addScaledVector(f, -m.y).multiplyScalar(D), A.copy(f).multiplyScalar(m.x).addScaledVector(d, -x.x).multiplyScalar(D), h[_].add(b), h[z].add(b), h[I].add(b), o[_].add(A), o[z].add(A), o[I].add(A));
            }
            let F = this.groups;
            F.length === 0 && (F = [
                {
                    start: 0,
                    count: t.count
                }
            ]);
            for(let _ = 0, z = F.length; _ < z; ++_){
                const I = F[_], D = I.start, N = I.count;
                for(let V = D, Z = D + N; V < Z; V += 3)M(t.getX(V + 0), t.getX(V + 1), t.getX(V + 2));
            }
            const k = new U, L = new U, R = new U, B = new U;
            function E(_) {
                R.fromBufferAttribute(i, _), B.copy(R);
                const z = h[_];
                k.copy(z), k.sub(R.multiplyScalar(R.dot(z))).normalize(), L.crossVectors(B, z);
                const D = L.dot(o[_]) < 0 ? -1 : 1;
                l.setXYZW(_, k.x, k.y, k.z, D);
            }
            for(let _ = 0, z = F.length; _ < z; ++_){
                const I = F[_], D = I.start, N = I.count;
                for(let V = D, Z = D + N; V < Z; V += 3)E(t.getX(V + 0)), E(t.getX(V + 1)), E(t.getX(V + 2));
            }
        }
        computeVertexNormals() {
            const t = this.index, e = this.getAttribute("position");
            if (e !== void 0) {
                let n = this.getAttribute("normal");
                if (n === void 0) n = new Bt(new Float32Array(e.count * 3), 3), this.setAttribute("normal", n);
                else for(let y = 0, m = n.count; y < m; y++)n.setXYZ(y, 0, 0, 0);
                const i = new U, r = new U, l = new U, h = new U, o = new U, c = new U, d = new U, f = new U;
                if (t) for(let y = 0, m = t.count; y < m; y += 3){
                    const x = t.getX(y + 0), b = t.getX(y + 1), A = t.getX(y + 2);
                    i.fromBufferAttribute(e, x), r.fromBufferAttribute(e, b), l.fromBufferAttribute(e, A), d.subVectors(l, r), f.subVectors(i, r), d.cross(f), h.fromBufferAttribute(n, x), o.fromBufferAttribute(n, b), c.fromBufferAttribute(n, A), h.add(d), o.add(d), c.add(d), n.setXYZ(x, h.x, h.y, h.z), n.setXYZ(b, o.x, o.y, o.z), n.setXYZ(A, c.x, c.y, c.z);
                }
                else for(let y = 0, m = e.count; y < m; y += 3)i.fromBufferAttribute(e, y + 0), r.fromBufferAttribute(e, y + 1), l.fromBufferAttribute(e, y + 2), d.subVectors(l, r), f.subVectors(i, r), d.cross(f), n.setXYZ(y + 0, d.x, d.y, d.z), n.setXYZ(y + 1, d.x, d.y, d.z), n.setXYZ(y + 2, d.x, d.y, d.z);
                this.normalizeNormals(), n.needsUpdate = !0;
            }
        }
        normalizeNormals() {
            const t = this.attributes.normal;
            for(let e = 0, n = t.count; e < n; e++)nt.fromBufferAttribute(t, e), nt.normalize(), t.setXYZ(e, nt.x, nt.y, nt.z);
        }
        toNonIndexed() {
            function t(h, o) {
                const c = h.array, d = h.itemSize, f = h.normalized, y = new c.constructor(o.length * d);
                let m = 0, x = 0;
                for(let b = 0, A = o.length; b < A; b++){
                    h.isInterleavedBufferAttribute ? m = o[b] * h.data.stride + h.offset : m = o[b] * d;
                    for(let M = 0; M < d; M++)y[x++] = c[m++];
                }
                return new Bt(y, d, f);
            }
            if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
            const e = new Tn, n = this.index.array, i = this.attributes;
            for(const h in i){
                const o = i[h], c = t(o, n);
                e.setAttribute(h, c);
            }
            const r = this.morphAttributes;
            for(const h in r){
                const o = [], c = r[h];
                for(let d = 0, f = c.length; d < f; d++){
                    const y = c[d], m = t(y, n);
                    o.push(m);
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
            const n = this.attributes;
            for(const o in n){
                const c = n[o];
                t.data.attributes[o] = c.toJSON(t.data);
            }
            const i = {};
            let r = !1;
            for(const o in this.morphAttributes){
                const c = this.morphAttributes[o], d = [];
                for(let f = 0, y = c.length; f < y; f++){
                    const m = c[f];
                    d.push(m.toJSON(t.data));
                }
                d.length > 0 && (i[o] = d, r = !0);
            }
            r && (t.data.morphAttributes = i, t.data.morphTargetsRelative = this.morphTargetsRelative);
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
            const n = t.index;
            n !== null && this.setIndex(n.clone(e));
            const i = t.attributes;
            for(const c in i){
                const d = i[c];
                this.setAttribute(c, d.clone(e));
            }
            const r = t.morphAttributes;
            for(const c in r){
                const d = [], f = r[c];
                for(let y = 0, m = f.length; y < m; y++)d.push(f[y].clone(e));
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
    function _r(p, t) {
        const e = p.split(/\r?\n/), n = [], i = [];
        for(let f = 0; f < e.length; f++){
            const y = e[f];
            (f & 262143) === 0 && t && t(f / e.length);
            const m = y.trim();
            if (!m || m[0] === "#" || m[0] === "/") continue;
            const x = m.split(/[\s,;]+/);
            if (x.length < 3) continue;
            const b = +x[0], A = +x[1], M = +x[2];
            if (!(!isFinite(b) || !isFinite(A) || !isFinite(M))) if (n.push(b, M, -A), x.length >= 6 && isFinite(+x[x.length - 3])) {
                let F = +x[x.length - 3], k = +x[x.length - 2], L = +x[x.length - 1];
                F <= 1 && k <= 1 && L <= 1 && (F *= 255, k *= 255, L *= 255), i.push(Math.min(255, F), Math.min(255, k), Math.min(255, L));
            } else if (x.length >= 4 && isFinite(+x[3])) {
                const F = Math.min(255, +x[3] > 1 ? +x[3] : +x[3] * 255);
                i.push(F, F, F);
            } else i.push(179, 173, 166);
        }
        const r = n.length / 3;
        if (r < 10) return null;
        let l = 1 / 0, h = 1 / 0, o = 1 / 0;
        for(let f = 0; f < n.length; f += 3)n[f] < l && (l = n[f]), n[f + 1] < h && (h = n[f + 1]), n[f + 2] < o && (o = n[f + 2]);
        for(let f = 0; f < n.length; f += 3)n[f] -= l, n[f + 1] -= h, n[f + 2] -= o;
        const c = Float32Array.from(n), d = ze(c);
        return {
            positions: c,
            colors: Uint8Array.from(i),
            count: r,
            origin: {
                x: l + d.cx,
                y: h + d.cy,
                z: o + d.cz
            }
        };
    }
    function ze(p) {
        let t = 1 / 0, e = -1 / 0, n = 1 / 0, i = 1 / 0, r = -1 / 0;
        for(let o = 0; o < p.length; o += 3)t = Math.min(t, p[o]), e = Math.max(e, p[o]), n = Math.min(n, p[o + 1]), i = Math.min(i, p[o + 2]), r = Math.max(r, p[o + 2]);
        const l = (t + e) / 2, h = (i + r) / 2;
        for(let o = 0; o < p.length; o += 3)p[o] -= l, p[o + 1] -= n, p[o + 2] -= h;
        return {
            cx: l,
            cy: n,
            cz: h
        };
    }
    function Mn(p, t, e, n = Math.random) {
        for(let i = e - 1; i > 0; i--){
            const r = n() * (i + 1) | 0;
            for(let l = 0; l < 3; l++){
                const h = i * 3 + l, o = r * 3 + l;
                let c = p[h];
                p[h] = p[o], p[o] = c, c = t[h], t[h] = t[o], t[o] = c;
            }
        }
    }
    function Us(p) {
        return ()=>{
            let t = p += 1831565813;
            return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    const ur = .42, ve = 14, dr = 9, Ls = 8;
    function Os(p = 42e4) {
        const t = Us(1337), e = ()=>t() + t() + t() - 1.5, n = new Float32Array(p * 3), i = new Uint8Array(p * 3);
        let r = 0;
        const l = (E, _, z, I, D, N)=>{
            n[r * 3] = E, n[r * 3 + 1] = _, n[r * 3 + 2] = z, i[r * 3] = Math.min(255, I * 255), i[r * 3 + 1] = Math.min(255, D * 255), i[r * 3 + 2] = Math.min(255, N * 255), r++;
        }, h = Math.cos(ur), o = Math.sin(ur), c = -o, d = h, f = -6, y = -3, m = (E, _)=>{
            if (E > 6.35 && E < 7.65 && _ < 2.3) return !0;
            for(let z = 0; z < 4; z++){
                const I = 1.7 + z * 3.1;
                if (!(E < I || E > I + 1.5)) for(let D = 0; D < 3; D++){
                    const N = 1.6 + D * 2.4;
                    if (_ >= N && _ <= N + 1.5) return !0;
                }
            }
            return !1;
        }, x = Math.floor(p * .62), b = Math.floor(p * .12), A = Math.floor(p * .18);
        for(let E = 0; E < x; E++){
            const _ = t() * ve, z = t() * dr;
            let I = e() * .05, D, N, V;
            if (m(_, z)) if (t() < .72) {
                I = -(.5 + t() * 2.4);
                const Z = .09 + t() * .08;
                D = Z, N = Z, V = Z + .03;
            } else I = -.28 + e() * .02, D = .16 + t() * .04, N = .17 + t() * .04, V = .2 + t() * .04;
            else {
                const Z = 1 - .06 * (Math.sin(z * 9) > .7 ? 1 : 0), ut = .7 + .3 * Math.min(1, z / 1.8);
                D = (.76 + e() * .05) * ut * Z, N = (.7 + e() * .05) * ut * Z, V = (.6 + e() * .05) * ut * Z;
            }
            l(f + h * _ + c * I, z + e() * .01, y + o * _ + d * I, D, N, V);
        }
        const M = f + h * ve, F = y + o * ve;
        for(let E = 0; E < b; E++){
            const _ = t() * Ls, z = t() * dr, I = e() * .05, D = .55 + .25 * Math.min(1, z / 1.8);
            l(M + c * _ + h * I, z + e() * .01, F + d * _ + o * I, (.62 + e() * .05) * D, (.6 + e() * .05) * D, (.58 + e() * .05) * D);
        }
        const k = f + h * (ve / 2), L = y + o * (ve / 2);
        for(let E = 0; E < A; E++){
            const _ = k + (t() - .5) * 46, z = L + (t() - .5) * 36, I = t() < .3 ? .05 : 0, D = .26 + t() * .07;
            l(_, e() * .04, z, D, D + I, D - .02);
        }
        for(; r < p;){
            const E = Math.floor(t() * 5), _ = k + c * (4 + E * 1.7) + h * ((E - 2) * 4.2), z = L + d * (4 + E * 1.7) + o * ((E - 2) * 4.2), I = .7 + E % 3 * .5, D = t() * Math.PI * 2, N = Math.acos(2 * t() - 1), V = I * Math.cbrt(t());
            l(_ + V * Math.sin(N) * Math.cos(D), Math.max(.05, I * .9 + V * Math.cos(N)), z + V * Math.sin(N) * Math.sin(D), .16 + t() * .08, .3 + t() * .12, .14 + t() * .06);
        }
        Mn(n, i, p, t);
        const R = new Tn;
        R.setAttribute("position", new Bt(n, 3)), R.setAttribute("aColor", new Bt(i, 3, !0)), R.computeBoundingSphere();
        const B = R.boundingSphere;
        return {
            geometry: R,
            positions: n,
            count: p,
            center: B.center.clone(),
            radius: B.radius
        };
    }
    var Mt = {}, wn = {
        exports: {}
    }, fr;
    function Ds() {
        return fr || (fr = 1, (function(p, t) {
            var e = (()=>{
                var n = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0;
                return (function(i) {
                    i = i || {};
                    var r = typeof i < "u" ? i : {}, l, h;
                    r.ready = new Promise(function(s, a) {
                        l = s, h = a;
                    }), [
                        "_main",
                        "___getTypeName",
                        "__embind_initialize_bindings",
                        "_fflush",
                        "onRuntimeInitialized"
                    ].forEach((s)=>{
                        Object.getOwnPropertyDescriptor(r.ready, s) || Object.defineProperty(r.ready, s, {
                            get: ()=>dt("You are getting " + s + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),
                            set: ()=>dt("You are setting " + s + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")
                        });
                    });
                    var o = Object.assign({}, r), c = "./this.program", d = !0;
                    if (r.ENVIRONMENT) throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
                    var f = "";
                    function y(s) {
                        return r.locateFile ? r.locateFile(s, f) : f + s;
                    }
                    var m;
                    if (typeof document < "u" && document.currentScript && (f = document.currentScript.src), n && (f = n), f.indexOf("blob:") !== 0 ? f = f.substr(0, f.replace(/[?#].*/, "").lastIndexOf("/") + 1) : f = "", !(typeof window == "object" || typeof importScripts == "function")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
                    var x = r.print || console.log.bind(console), b = r.printErr || console.warn.bind(console);
                    Object.assign(r, o), o = null, cs(), r.arguments && r.arguments, A("arguments", "arguments_"), r.thisProgram && (c = r.thisProgram), A("thisProgram", "thisProgram"), r.quit && r.quit, A("quit", "quit_"), _(typeof r.memoryInitializerPrefixURL > "u", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"), _(typeof r.pthreadMainPrefixURL > "u", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"), _(typeof r.cdInitializerPrefixURL > "u", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"), _(typeof r.filePackagePrefixURL > "u", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead"), _(typeof r.read > "u", "Module.read option was removed (modify read_ in JS)"), _(typeof r.readAsync > "u", "Module.readAsync option was removed (modify readAsync in JS)"), _(typeof r.readBinary > "u", "Module.readBinary option was removed (modify readBinary in JS)"), _(typeof r.setWindowTitle > "u", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)"), _(typeof r.TOTAL_MEMORY > "u", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"), A("read", "read_"), A("readAsync", "readAsync"), A("readBinary", "readBinary"), A("setWindowTitle", "setWindowTitle"), _(!0, "worker environment detected but not enabled at build time.  Add 'worker' to `-sENVIRONMENT` to enable."), _(!0, "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable."), _(!0, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");
                    function A(s, a) {
                        Object.getOwnPropertyDescriptor(r, s) || Object.defineProperty(r, s, {
                            configurable: !0,
                            get: function() {
                                dt("Module." + s + " has been replaced with plain " + a + " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
                            }
                        });
                    }
                    function M(s) {
                        Object.getOwnPropertyDescriptor(r, s) && dt("`Module." + s + "` was supplied but `" + s + "` not included in INCOMING_MODULE_JS_API");
                    }
                    function F(s) {
                        return s === "FS_createPath" || s === "FS_createDataFile" || s === "FS_createPreloadedFile" || s === "FS_unlink" || s === "addRunDependency" || s === "FS_createLazyFile" || s === "FS_createDevice" || s === "removeRunDependency";
                    }
                    function k(s) {
                        typeof globalThis < "u" && !Object.getOwnPropertyDescriptor(globalThis, s) && Object.defineProperty(globalThis, s, {
                            configurable: !0,
                            get: function() {
                                var a = "`" + s + "` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line";
                                F(s) && (a += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"), $t(a);
                            }
                        });
                    }
                    function L(s) {
                        Object.getOwnPropertyDescriptor(r, s) || Object.defineProperty(r, s, {
                            configurable: !0,
                            get: function() {
                                var a = "'" + s + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
                                F(s) && (a += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"), dt(a);
                            }
                        });
                    }
                    var R;
                    r.wasmBinary && (R = r.wasmBinary), A("wasmBinary", "wasmBinary"), r.noExitRuntime, A("noExitRuntime", "noExitRuntime"), typeof WebAssembly != "object" && dt("no native wasm support detected");
                    var B, E = !1;
                    function _(s, a) {
                        s || dt("Assertion failed" + (a ? ": " + a : ""));
                    }
                    var z = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0;
                    function I(s, a, u) {
                        for(var g = a + u, w = a; s[w] && !(w >= g);)++w;
                        if (w - a > 16 && s.buffer && z) return z.decode(s.subarray(a, w));
                        for(var S = ""; a < w;){
                            var T = s[a++];
                            if (!(T & 128)) {
                                S += String.fromCharCode(T);
                                continue;
                            }
                            var v = s[a++] & 63;
                            if ((T & 224) == 192) {
                                S += String.fromCharCode((T & 31) << 6 | v);
                                continue;
                            }
                            var P = s[a++] & 63;
                            if ((T & 240) == 224 ? T = (T & 15) << 12 | v << 6 | P : ((T & 248) != 240 && $t("Invalid UTF-8 leading byte 0x" + T.toString(16) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), T = (T & 7) << 18 | v << 12 | P << 6 | s[a++] & 63), T < 65536) S += String.fromCharCode(T);
                            else {
                                var O = T - 65536;
                                S += String.fromCharCode(55296 | O >> 10, 56320 | O & 1023);
                            }
                        }
                        return S;
                    }
                    function D(s, a) {
                        return s ? I(X, s, a) : "";
                    }
                    function N(s, a, u, g) {
                        if (!(g > 0)) return 0;
                        for(var w = u, S = u + g - 1, T = 0; T < s.length; ++T){
                            var v = s.charCodeAt(T);
                            if (v >= 55296 && v <= 57343) {
                                var P = s.charCodeAt(++T);
                                v = 65536 + ((v & 1023) << 10) | P & 1023;
                            }
                            if (v <= 127) {
                                if (u >= S) break;
                                a[u++] = v;
                            } else if (v <= 2047) {
                                if (u + 1 >= S) break;
                                a[u++] = 192 | v >> 6, a[u++] = 128 | v & 63;
                            } else if (v <= 65535) {
                                if (u + 2 >= S) break;
                                a[u++] = 224 | v >> 12, a[u++] = 128 | v >> 6 & 63, a[u++] = 128 | v & 63;
                            } else {
                                if (u + 3 >= S) break;
                                v > 1114111 && $t("Invalid Unicode code point 0x" + v.toString(16) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF)."), a[u++] = 240 | v >> 18, a[u++] = 128 | v >> 12 & 63, a[u++] = 128 | v >> 6 & 63, a[u++] = 128 | v & 63;
                            }
                        }
                        return a[u] = 0, u - w;
                    }
                    function V(s, a, u) {
                        return _(typeof u == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), N(s, X, a, u);
                    }
                    function Z(s) {
                        for(var a = 0, u = 0; u < s.length; ++u){
                            var g = s.charCodeAt(u);
                            g <= 127 ? a++ : g <= 2047 ? a += 2 : g >= 55296 && g <= 57343 ? (a += 4, ++u) : a += 3;
                        }
                        return a;
                    }
                    var ut, it, X, tt, st, q, j, En, Fn;
                    function Pn(s) {
                        ut = s, r.HEAP8 = it = new Int8Array(s), r.HEAP16 = tt = new Int16Array(s), r.HEAP32 = q = new Int32Array(s), r.HEAPU8 = X = new Uint8Array(s), r.HEAPU16 = st = new Uint16Array(s), r.HEAPU32 = j = new Uint32Array(s), r.HEAPF32 = En = new Float32Array(s), r.HEAPF64 = Fn = new Float64Array(s);
                    }
                    var Ge = 65536;
                    r.TOTAL_STACK && _(Ge === r.TOTAL_STACK, "the stack size can no longer be determined at runtime");
                    var Xe = r.INITIAL_MEMORY || 262144;
                    A("INITIAL_MEMORY", "INITIAL_MEMORY"), _(Xe >= Ge, "INITIAL_MEMORY should be larger than TOTAL_STACK, was " + Xe + "! (TOTAL_STACK=" + Ge + ")"), _(typeof Int32Array < "u" && typeof Float64Array < "u" && Int32Array.prototype.subarray != null && Int32Array.prototype.set != null, "JS engine does not provide full typed array support"), _(!r.wasmMemory, "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally"), _(Xe == 262144, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
                    var Ee;
                    function Tr() {
                        var s = dn();
                        _((s & 3) == 0), j[s >> 2] = 34821223, j[s + 4 >> 2] = 2310721022, j[0] = 1668509029;
                    }
                    function Ze() {
                        if (!E) {
                            var s = dn(), a = j[s >> 2], u = j[s + 4 >> 2];
                            (a != 34821223 || u != 2310721022) && dt("Stack overflow! Stack cookie has been overwritten at 0x" + s.toString(16) + ", expected hex dwords 0x89BACDFE and 0x2135467, but received 0x" + u.toString(16) + " 0x" + a.toString(16)), j[0] !== 1668509029 && dt("Runtime error: The application has corrupted its heap memory area (address zero)!");
                        }
                    }
                    (function() {
                        var s = new Int16Array(1), a = new Int8Array(s.buffer);
                        if (s[0] = 25459, a[0] !== 115 || a[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
                    })();
                    var In = [], kn = [], Rn = [], Je = !1;
                    function Cr() {
                        if (r.preRun) for(typeof r.preRun == "function" && (r.preRun = [
                            r.preRun
                        ]); r.preRun.length;)Fr(r.preRun.shift());
                        Qe(In);
                    }
                    function zr() {
                        _(!Je), Je = !0, Ze(), Qe(kn);
                    }
                    function Er() {
                        if (Ze(), r.postRun) for(typeof r.postRun == "function" && (r.postRun = [
                            r.postRun
                        ]); r.postRun.length;)Ir(r.postRun.shift());
                        Qe(Rn);
                    }
                    function Fr(s) {
                        In.unshift(s);
                    }
                    function Pr(s) {
                        kn.unshift(s);
                    }
                    function Ir(s) {
                        Rn.unshift(s);
                    }
                    _(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), _(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), _(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), _(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
                    var Wt = 0, Nt = null, le = null, ce = {};
                    function kr(s) {
                        Wt++, r.monitorRunDependencies && r.monitorRunDependencies(Wt), _(!ce[s]), ce[s] = 1, Nt === null && typeof setInterval < "u" && (Nt = setInterval(function() {
                            if (E) {
                                clearInterval(Nt), Nt = null;
                                return;
                            }
                            var a = !1;
                            for(var u in ce)a || (a = !0, b("still waiting on run dependencies:")), b("dependency: " + u);
                            a && b("(end of list)");
                        }, 1e4));
                    }
                    function Rr(s) {
                        if (Wt--, r.monitorRunDependencies && r.monitorRunDependencies(Wt), _(ce[s]), delete ce[s], Wt == 0 && (Nt !== null && (clearInterval(Nt), Nt = null), le)) {
                            var a = le;
                            le = null, a();
                        }
                    }
                    function dt(s) {
                        r.onAbort && r.onAbort(s), s = "Aborted(" + s + ")", b(s), E = !0;
                        var a = new WebAssembly.RuntimeError(s);
                        throw h(a), a;
                    }
                    var gt = {
                        error: function() {
                            dt("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM");
                        },
                        init: function() {
                            gt.error();
                        },
                        createDataFile: function() {
                            gt.error();
                        },
                        createPreloadedFile: function() {
                            gt.error();
                        },
                        createLazyFile: function() {
                            gt.error();
                        },
                        open: function() {
                            gt.error();
                        },
                        mkdev: function() {
                            gt.error();
                        },
                        registerDevice: function() {
                            gt.error();
                        },
                        analyzePath: function() {
                            gt.error();
                        },
                        loadFilesFromDB: function() {
                            gt.error();
                        },
                        ErrnoError: function() {
                            gt.error();
                        }
                    };
                    r.FS_createDataFile = gt.createDataFile, r.FS_createPreloadedFile = gt.createPreloadedFile;
                    var Ur = "data:application/octet-stream;base64,";
                    function Un(s) {
                        return s.startsWith(Ur);
                    }
                    function Lr(s) {
                        return s.startsWith("file://");
                    }
                    function at(s, a) {
                        return function() {
                            var u = s, g = a;
                            return g = r.asm, _(Je, "native function `" + u + "` called before runtime initialization"), g[s] || _(g[s], "exported native function `" + u + "` not found"), g[s].apply(null, arguments);
                        };
                    }
                    var mt;
                    mt = "laz-perf.wasm", Un(mt) || (mt = y(mt));
                    function Ln(s) {
                        try {
                            if (s == mt && R) return new Uint8Array(R);
                            throw "both async and sync fetching of the wasm failed";
                        } catch (a) {
                            dt(a);
                        }
                    }
                    function Or() {
                        return !R && d && typeof fetch == "function" ? fetch(mt, {
                            credentials: "same-origin"
                        }).then(function(s) {
                            if (!s.ok) throw "failed to load wasm binary file at '" + mt + "'";
                            return s.arrayBuffer();
                        }).catch(function() {
                            return Ln(mt);
                        }) : Promise.resolve().then(function() {
                            return Ln(mt);
                        });
                    }
                    function Dr() {
                        var s = {
                            env: Kn,
                            wasi_snapshot_preview1: Kn
                        };
                        function a(v, P) {
                            var O = v.exports;
                            r.asm = O, B = r.asm.memory, _(B, "memory not found in wasm exports"), Pn(B.buffer), Ee = r.asm.__indirect_function_table, _(Ee, "table not found in wasm exports"), Pr(r.asm.__wasm_call_ctors), Rr("wasm-instantiate");
                        }
                        kr("wasm-instantiate");
                        var u = r;
                        function g(v) {
                            _(r === u, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"), u = null, a(v.instance);
                        }
                        function w(v) {
                            return Or().then(function(P) {
                                return WebAssembly.instantiate(P, s);
                            }).then(function(P) {
                                return P;
                            }).then(v, function(P) {
                                b("failed to asynchronously prepare wasm: " + P), Lr(mt) && b("warning: Loading from a file URI (" + mt + ") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing"), dt(P);
                            });
                        }
                        function S() {
                            return !R && typeof WebAssembly.instantiateStreaming == "function" && !Un(mt) && typeof fetch == "function" ? fetch(mt, {
                                credentials: "same-origin"
                            }).then(function(v) {
                                var P = WebAssembly.instantiateStreaming(v, s);
                                return P.then(g, function(O) {
                                    return b("wasm streaming compile failed: " + O), b("falling back to ArrayBuffer instantiation"), w(g);
                                });
                            }) : w(g);
                        }
                        if (r.instantiateWasm) try {
                            var T = r.instantiateWasm(s, a);
                            return T;
                        } catch (v) {
                            return b("Module.instantiateWasm callback failed with error: " + v), !1;
                        }
                        return S().catch(h), {};
                    }
                    function Qe(s) {
                        for(; s.length > 0;)s.shift()(r);
                    }
                    function $t(s) {
                        $t.shown || ($t.shown = {}), $t.shown[s] || ($t.shown[s] = 1, b(s));
                    }
                    function Br(s, a) {
                        _(s.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)"), it.set(s, a);
                    }
                    function Wr(s) {
                        return un(s + 24) + 24;
                    }
                    function Nr(s) {
                        this.excPtr = s, this.ptr = s - 24, this.set_type = function(a) {
                            j[this.ptr + 4 >> 2] = a;
                        }, this.get_type = function() {
                            return j[this.ptr + 4 >> 2];
                        }, this.set_destructor = function(a) {
                            j[this.ptr + 8 >> 2] = a;
                        }, this.get_destructor = function() {
                            return j[this.ptr + 8 >> 2];
                        }, this.set_refcount = function(a) {
                            q[this.ptr >> 2] = a;
                        }, this.set_caught = function(a) {
                            a = a ? 1 : 0, it[this.ptr + 12 >> 0] = a;
                        }, this.get_caught = function() {
                            return it[this.ptr + 12 >> 0] != 0;
                        }, this.set_rethrown = function(a) {
                            a = a ? 1 : 0, it[this.ptr + 13 >> 0] = a;
                        }, this.get_rethrown = function() {
                            return it[this.ptr + 13 >> 0] != 0;
                        }, this.init = function(a, u) {
                            this.set_adjusted_ptr(0), this.set_type(a), this.set_destructor(u), this.set_refcount(0), this.set_caught(!1), this.set_rethrown(!1);
                        }, this.add_ref = function() {
                            var a = q[this.ptr >> 2];
                            q[this.ptr >> 2] = a + 1;
                        }, this.release_ref = function() {
                            var a = q[this.ptr >> 2];
                            return q[this.ptr >> 2] = a - 1, _(a > 0), a === 1;
                        }, this.set_adjusted_ptr = function(a) {
                            j[this.ptr + 16 >> 2] = a;
                        }, this.get_adjusted_ptr = function() {
                            return j[this.ptr + 16 >> 2];
                        }, this.get_exception_ptr = function() {
                            var a = ds(this.get_type());
                            if (a) return j[this.excPtr >> 2];
                            var u = this.get_adjusted_ptr();
                            return u !== 0 ? u : this.excPtr;
                        };
                    }
                    function $r(s, a, u) {
                        var g = new Nr(s);
                        throw g.init(a, u), s + " - Exception catching is disabled, this exception cannot be caught. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.";
                    }
                    function Hr(s, a, u, g, w) {}
                    function Ke(s) {
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
                    function Yr() {
                        for(var s = new Array(256), a = 0; a < 256; ++a)s[a] = String.fromCharCode(a);
                        On = s;
                    }
                    var On = void 0;
                    function _t(s) {
                        for(var a = "", u = s; X[u];)a += On[X[u++]];
                        return a;
                    }
                    var jt = {}, Gt = {}, Fe = {}, Vr = 48, qr = 57;
                    function Dn(s) {
                        if (s === void 0) return "_unknown";
                        s = s.replace(/[^a-zA-Z0-9_]/g, "$");
                        var a = s.charCodeAt(0);
                        return a >= Vr && a <= qr ? "_" + s : s;
                    }
                    function Bn(s, a) {
                        return s = Dn(s), function() {
                            return a.apply(this, arguments);
                        };
                    }
                    function tn(s, a) {
                        var u = Bn(a, function(g) {
                            this.name = a, this.message = g;
                            var w = new Error(g).stack;
                            w !== void 0 && (this.stack = this.toString() + `
` + w.replace(/^Error(:[^\n]*)?\n/, ""));
                        });
                        return u.prototype = Object.create(s.prototype), u.prototype.constructor = u, u.prototype.toString = function() {
                            return this.message === void 0 ? this.name : this.name + ": " + this.message;
                        }, u;
                    }
                    var Xt = void 0;
                    function G(s) {
                        throw new Xt(s);
                    }
                    var Wn = void 0;
                    function Pe(s) {
                        throw new Wn(s);
                    }
                    function ue(s, a, u) {
                        s.forEach(function(v) {
                            Fe[v] = a;
                        });
                        function g(v) {
                            var P = u(v);
                            P.length !== s.length && Pe("Mismatched type converter count");
                            for(var O = 0; O < s.length; ++O)zt(s[O], P[O]);
                        }
                        var w = new Array(a.length), S = [], T = 0;
                        a.forEach((v, P)=>{
                            Gt.hasOwnProperty(v) ? w[P] = Gt[v] : (S.push(v), jt.hasOwnProperty(v) || (jt[v] = []), jt[v].push(()=>{
                                w[P] = Gt[v], ++T, T === S.length && g(w);
                            }));
                        }), S.length === 0 && g(w);
                    }
                    function zt(s, a, u = {}) {
                        if (!("argPackAdvance" in a)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
                        var g = a.name;
                        if (s || G('type "' + g + '" must have a positive integer typeid pointer'), Gt.hasOwnProperty(s)) {
                            if (u.ignoreDuplicateRegistrations) return;
                            G("Cannot register type '" + g + "' twice");
                        }
                        if (Gt[s] = a, delete Fe[s], jt.hasOwnProperty(s)) {
                            var w = jt[s];
                            delete jt[s], w.forEach((S)=>S());
                        }
                    }
                    function jr(s, a, u, g, w) {
                        var S = Ke(u);
                        a = _t(a), zt(s, {
                            name: a,
                            fromWireType: function(T) {
                                return !!T;
                            },
                            toWireType: function(T, v) {
                                return v ? g : w;
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: function(T) {
                                var v;
                                if (u === 1) v = it;
                                else if (u === 2) v = tt;
                                else if (u === 4) v = q;
                                else throw new TypeError("Unknown boolean type size: " + a);
                                return this.fromWireType(v[T >> S]);
                            },
                            destructorFunction: null
                        });
                    }
                    function Gr(s) {
                        if (!(this instanceof kt) || !(s instanceof kt)) return !1;
                        for(var a = this.$$.ptrType.registeredClass, u = this.$$.ptr, g = s.$$.ptrType.registeredClass, w = s.$$.ptr; a.baseClass;)u = a.upcast(u), a = a.baseClass;
                        for(; g.baseClass;)w = g.upcast(w), g = g.baseClass;
                        return a === g && u === w;
                    }
                    function Xr(s) {
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
                    function en(s) {
                        function a(u) {
                            return u.$$.ptrType.registeredClass.name;
                        }
                        G(a(s) + " instance already deleted");
                    }
                    var nn = !1;
                    function Nn(s) {}
                    function Zr(s) {
                        s.smartPtr ? s.smartPtrType.rawDestructor(s.smartPtr) : s.ptrType.registeredClass.rawDestructor(s.ptr);
                    }
                    function $n(s) {
                        s.count.value -= 1;
                        var a = s.count.value === 0;
                        a && Zr(s);
                    }
                    function Hn(s, a, u) {
                        if (a === u) return s;
                        if (u.baseClass === void 0) return null;
                        var g = Hn(s, a, u.baseClass);
                        return g === null ? null : u.downcast(g);
                    }
                    var Yn = {};
                    function Jr() {
                        return Object.keys(me).length;
                    }
                    function Qr() {
                        var s = [];
                        for(var a in me)me.hasOwnProperty(a) && s.push(me[a]);
                        return s;
                    }
                    var de = [];
                    function rn() {
                        for(; de.length;){
                            var s = de.pop();
                            s.$$.deleteScheduled = !1, s.delete();
                        }
                    }
                    var fe = void 0;
                    function Kr(s) {
                        fe = s, de.length && fe && fe(rn);
                    }
                    function ti() {
                        r.getInheritedInstanceCount = Jr, r.getLiveInheritedInstances = Qr, r.flushPendingDeletes = rn, r.setDelayFunction = Kr;
                    }
                    var me = {};
                    function ei(s, a) {
                        for(a === void 0 && G("ptr should not be undefined"); s.baseClass;)a = s.upcast(a), s = s.baseClass;
                        return a;
                    }
                    function ni(s, a) {
                        return a = ei(s, a), me[a];
                    }
                    function Ie(s, a) {
                        (!a.ptrType || !a.ptr) && Pe("makeClassHandle requires ptr and ptrType");
                        var u = !!a.smartPtrType, g = !!a.smartPtr;
                        return u !== g && Pe("Both smartPtrType and smartPtr must be specified"), a.count = {
                            value: 1
                        }, ye(Object.create(s, {
                            $$: {
                                value: a
                            }
                        }));
                    }
                    function Vn(s) {
                        var a = this.getPointee(s);
                        if (!a) return this.destructor(s), null;
                        var u = ni(this.registeredClass, a);
                        if (u !== void 0) {
                            if (u.$$.count.value === 0) return u.$$.ptr = a, u.$$.smartPtr = s, u.clone();
                            var g = u.clone();
                            return this.destructor(s), g;
                        }
                        function w() {
                            return this.isSmartPointer ? Ie(this.registeredClass.instancePrototype, {
                                ptrType: this.pointeeType,
                                ptr: a,
                                smartPtrType: this,
                                smartPtr: s
                            }) : Ie(this.registeredClass.instancePrototype, {
                                ptrType: this,
                                ptr: s
                            });
                        }
                        var S = this.registeredClass.getActualType(a), T = Yn[S];
                        if (!T) return w.call(this);
                        var v;
                        this.isConst ? v = T.constPointerType : v = T.pointerType;
                        var P = Hn(a, this.registeredClass, v.registeredClass);
                        return P === null ? w.call(this) : this.isSmartPointer ? Ie(v.registeredClass.instancePrototype, {
                            ptrType: v,
                            ptr: P,
                            smartPtrType: this,
                            smartPtr: s
                        }) : Ie(v.registeredClass.instancePrototype, {
                            ptrType: v,
                            ptr: P
                        });
                    }
                    function ye(s) {
                        return typeof FinalizationRegistry > "u" ? (ye = (a)=>a, s) : (nn = new FinalizationRegistry((a)=>{
                            console.warn(a.leakWarning.stack.replace(/^Error: /, "")), $n(a.$$);
                        }), ye = (a)=>{
                            var u = a.$$, g = !!u.smartPtr;
                            if (g) {
                                var w = {
                                    $$: u
                                }, S = u.ptrType.registeredClass;
                                w.leakWarning = new Error("Embind found a leaked C++ instance " + S.name + " <0x" + u.ptr.toString(16) + `>.
We'll free it automatically in this case, but this functionality is not reliable across various environments.
Make sure to invoke .delete() manually once you're done with the instance instead.
Originally allocated`), "captureStackTrace" in Error && Error.captureStackTrace(w.leakWarning, Vn), nn.register(a, w, a);
                            }
                            return a;
                        }, Nn = (a)=>nn.unregister(a), ye(s));
                    }
                    function ri() {
                        if (this.$$.ptr || en(this), this.$$.preservePointerOnDelete) return this.$$.count.value += 1, this;
                        var s = ye(Object.create(Object.getPrototypeOf(this), {
                            $$: {
                                value: Xr(this.$$)
                            }
                        }));
                        return s.$$.count.value += 1, s.$$.deleteScheduled = !1, s;
                    }
                    function ii() {
                        this.$$.ptr || en(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && G("Object already scheduled for deletion"), Nn(this), $n(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
                    }
                    function si() {
                        return !this.$$.ptr;
                    }
                    function ai() {
                        return this.$$.ptr || en(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && G("Object already scheduled for deletion"), de.push(this), de.length === 1 && fe && fe(rn), this.$$.deleteScheduled = !0, this;
                    }
                    function oi() {
                        kt.prototype.isAliasOf = Gr, kt.prototype.clone = ri, kt.prototype.delete = ii, kt.prototype.isDeleted = si, kt.prototype.deleteLater = ai;
                    }
                    function kt() {}
                    function qn(s, a, u) {
                        if (s[a].overloadTable === void 0) {
                            var g = s[a];
                            s[a] = function() {
                                return s[a].overloadTable.hasOwnProperty(arguments.length) || G("Function '" + u + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + s[a].overloadTable + ")!"), s[a].overloadTable[arguments.length].apply(this, arguments);
                            }, s[a].overloadTable = [], s[a].overloadTable[g.argCount] = g;
                        }
                    }
                    function hi(s, a, u) {
                        r.hasOwnProperty(s) ? (G("Cannot register public name '" + s + "' twice"), qn(r, s, s), r.hasOwnProperty(u) && G("Cannot register multiple overloads of a function with the same number of arguments (" + u + ")!"), r[s].overloadTable[u] = a) : r[s] = a;
                    }
                    function li(s, a, u, g, w, S, T, v) {
                        this.name = s, this.constructor = a, this.instancePrototype = u, this.rawDestructor = g, this.baseClass = w, this.getActualType = S, this.upcast = T, this.downcast = v, this.pureVirtualFunctions = [];
                    }
                    function sn(s, a, u) {
                        for(; a !== u;)a.upcast || G("Expected null or instance of " + u.name + ", got an instance of " + a.name), s = a.upcast(s), a = a.baseClass;
                        return s;
                    }
                    function ci(s, a) {
                        if (a === null) return this.isReference && G("null is not a valid " + this.name), 0;
                        a.$$ || G('Cannot pass "' + Jt(a) + '" as a ' + this.name), a.$$.ptr || G("Cannot pass deleted object as a pointer of type " + this.name);
                        var u = a.$$.ptrType.registeredClass, g = sn(a.$$.ptr, u, this.registeredClass);
                        return g;
                    }
                    function ui(s, a) {
                        var u;
                        if (a === null) return this.isReference && G("null is not a valid " + this.name), this.isSmartPointer ? (u = this.rawConstructor(), s !== null && s.push(this.rawDestructor, u), u) : 0;
                        a.$$ || G('Cannot pass "' + Jt(a) + '" as a ' + this.name), a.$$.ptr || G("Cannot pass deleted object as a pointer of type " + this.name), !this.isConst && a.$$.ptrType.isConst && G("Cannot convert argument of type " + (a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name) + " to parameter type " + this.name);
                        var g = a.$$.ptrType.registeredClass;
                        if (u = sn(a.$$.ptr, g, this.registeredClass), this.isSmartPointer) switch(a.$$.smartPtr === void 0 && G("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy){
                            case 0:
                                a.$$.smartPtrType === this ? u = a.$$.smartPtr : G("Cannot convert argument of type " + (a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name) + " to parameter type " + this.name);
                                break;
                            case 1:
                                u = a.$$.smartPtr;
                                break;
                            case 2:
                                if (a.$$.smartPtrType === this) u = a.$$.smartPtr;
                                else {
                                    var w = a.clone();
                                    u = this.rawShare(u, ln.toHandle(function() {
                                        w.delete();
                                    })), s !== null && s.push(this.rawDestructor, u);
                                }
                                break;
                            default:
                                G("Unsupporting sharing policy");
                        }
                        return u;
                    }
                    function di(s, a) {
                        if (a === null) return this.isReference && G("null is not a valid " + this.name), 0;
                        a.$$ || G('Cannot pass "' + Jt(a) + '" as a ' + this.name), a.$$.ptr || G("Cannot pass deleted object as a pointer of type " + this.name), a.$$.ptrType.isConst && G("Cannot convert argument of type " + a.$$.ptrType.name + " to parameter type " + this.name);
                        var u = a.$$.ptrType.registeredClass, g = sn(a.$$.ptr, u, this.registeredClass);
                        return g;
                    }
                    function ke(s) {
                        return this.fromWireType(q[s >> 2]);
                    }
                    function fi(s) {
                        return this.rawGetPointee && (s = this.rawGetPointee(s)), s;
                    }
                    function mi(s) {
                        this.rawDestructor && this.rawDestructor(s);
                    }
                    function yi(s) {
                        s !== null && s.delete();
                    }
                    function pi() {
                        Et.prototype.getPointee = fi, Et.prototype.destructor = mi, Et.prototype.argPackAdvance = 8, Et.prototype.readValueFromPointer = ke, Et.prototype.deleteObject = yi, Et.prototype.fromWireType = Vn;
                    }
                    function Et(s, a, u, g, w, S, T, v, P, O, H) {
                        this.name = s, this.registeredClass = a, this.isReference = u, this.isConst = g, this.isSmartPointer = w, this.pointeeType = S, this.sharingPolicy = T, this.rawGetPointee = v, this.rawConstructor = P, this.rawShare = O, this.rawDestructor = H, !w && a.baseClass === void 0 ? g ? (this.toWireType = ci, this.destructorFunction = null) : (this.toWireType = di, this.destructorFunction = null) : this.toWireType = ui;
                    }
                    function gi(s, a, u) {
                        r.hasOwnProperty(s) || Pe("Replacing nonexistant public symbol"), r[s].overloadTable !== void 0 && u !== void 0 || (r[s] = a, r[s].argCount = u);
                    }
                    function _i(s, a, u) {
                        _("dynCall_" + s in r, "bad function pointer type - no table for sig '" + s + "'"), u && u.length ? _(u.length === s.substring(1).replace(/j/g, "--").length) : _(s.length == 1);
                        var g = r["dynCall_" + s];
                        return u && u.length ? g.apply(null, [
                            a
                        ].concat(u)) : g.call(null, a);
                    }
                    var Re = [];
                    function an(s) {
                        var a = Re[s];
                        return a || (s >= Re.length && (Re.length = s + 1), Re[s] = a = Ee.get(s)), _(Ee.get(s) == a, "JavaScript-side Wasm function table mirror is out of date!"), a;
                    }
                    function xi(s, a, u) {
                        if (s.includes("j")) return _i(s, a, u);
                        _(an(a), "missing table entry in dynCall: " + a);
                        var g = an(a).apply(null, u);
                        return g;
                    }
                    function bi(s, a) {
                        _(s.includes("j") || s.includes("p"), "getDynCaller should only be called with i64 sigs");
                        var u = [];
                        return function() {
                            return u.length = 0, Object.assign(u, arguments), xi(s, a, u);
                        };
                    }
                    function Zt(s, a) {
                        s = _t(s);
                        function u() {
                            return s.includes("j") ? bi(s, a) : an(a);
                        }
                        var g = u();
                        return typeof g != "function" && G("unknown function pointer with signature " + s + ": " + a), g;
                    }
                    var jn = void 0;
                    function wi(s) {
                        var a = us(s), u = _t(a);
                        return Rt(a), u;
                    }
                    function on(s, a) {
                        var u = [], g = {};
                        function w(S) {
                            if (!g[S] && !Gt[S]) {
                                if (Fe[S]) {
                                    Fe[S].forEach(w);
                                    return;
                                }
                                u.push(S), g[S] = !0;
                            }
                        }
                        throw a.forEach(w), new jn(s + ": " + u.map(wi).join([
                            ", "
                        ]));
                    }
                    function vi(s, a, u, g, w, S, T, v, P, O, H, Y, $) {
                        H = _t(H), S = Zt(w, S), v && (v = Zt(T, v)), O && (O = Zt(P, O)), $ = Zt(Y, $);
                        var J = Dn(H);
                        hi(J, function() {
                            on("Cannot construct " + H + " due to unbound types", [
                                g
                            ]);
                        }), ue([
                            s,
                            a,
                            u
                        ], g ? [
                            g
                        ] : [], function(ht) {
                            ht = ht[0];
                            var et, bt;
                            g ? (et = ht.registeredClass, bt = et.instancePrototype) : bt = kt.prototype;
                            var Tt = Bn(J, function() {
                                if (Object.getPrototypeOf(this) !== C) throw new Xt("Use 'new' to construct " + H);
                                if (W.constructor_body === void 0) throw new Xt(H + " has no accessible constructor");
                                var Oe = W.constructor_body[arguments.length];
                                if (Oe === void 0) throw new Xt("Tried to invoke ctor of " + H + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(W.constructor_body).toString() + ") parameters instead!");
                                return Oe.apply(this, arguments);
                            }), C = Object.create(bt, {
                                constructor: {
                                    value: Tt
                                }
                            });
                            Tt.prototype = C;
                            var W = new li(H, Tt, C, $, et, S, v, O), lt = new Et(H, W, !0, !1, !1), ot = new Et(H + "*", W, !1, !1, !1), Ht = new Et(H + " const*", W, !1, !0, !1);
                            return Yn[s] = {
                                pointerType: ot,
                                constPointerType: Ht
                            }, gi(J, Tt), [
                                lt,
                                ot,
                                Ht
                            ];
                        });
                    }
                    function Gn(s, a) {
                        for(var u = [], g = 0; g < s; g++)u.push(j[a + g * 4 >> 2]);
                        return u;
                    }
                    function Mi(s) {
                        for(; s.length;){
                            var a = s.pop(), u = s.pop();
                            u(a);
                        }
                    }
                    function Xn(s, a, u, g, w) {
                        var S = a.length;
                        S < 2 && G("argTypes array size mismatch! Must at least get return value and 'this' types!");
                        for(var T = a[1] !== null && u !== null, v = !1, P = 1; P < a.length; ++P)if (a[P] !== null && a[P].destructorFunction === void 0) {
                            v = !0;
                            break;
                        }
                        var O = a[0].name !== "void", H = S - 2, Y = new Array(H), $ = [], J = [];
                        return function() {
                            arguments.length !== H && G("function " + s + " called with " + arguments.length + " arguments, expected " + H + " args!"), J.length = 0;
                            var ht;
                            $.length = T ? 2 : 1, $[0] = w, T && (ht = a[1].toWireType(J, this), $[1] = ht);
                            for(var et = 0; et < H; ++et)Y[et] = a[et + 2].toWireType(J, arguments[et]), $.push(Y[et]);
                            var bt = g.apply(null, $);
                            function Tt(C) {
                                if (v) Mi(J);
                                else for(var W = T ? 1 : 2; W < a.length; W++){
                                    var lt = W === 1 ? ht : Y[W - 2];
                                    a[W].destructorFunction !== null && a[W].destructorFunction(lt);
                                }
                                if (O) return a[0].fromWireType(C);
                            }
                            return Tt(bt);
                        };
                    }
                    function Ai(s, a, u, g, w, S) {
                        _(a > 0);
                        var T = Gn(a, u);
                        w = Zt(g, w), ue([], [
                            s
                        ], function(v) {
                            v = v[0];
                            var P = "constructor " + v.name;
                            if (v.registeredClass.constructor_body === void 0 && (v.registeredClass.constructor_body = []), v.registeredClass.constructor_body[a - 1] !== void 0) throw new Xt("Cannot register multiple constructors with identical number of parameters (" + (a - 1) + ") for class '" + v.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
                            return v.registeredClass.constructor_body[a - 1] = ()=>{
                                on("Cannot construct " + v.name + " due to unbound types", T);
                            }, ue([], T, function(O) {
                                return O.splice(1, 0, null), v.registeredClass.constructor_body[a - 1] = Xn(P, O, null, w, S), [];
                            }), [];
                        });
                    }
                    function Si(s, a, u, g, w, S, T, v) {
                        var P = Gn(u, g);
                        a = _t(a), S = Zt(w, S), ue([], [
                            s
                        ], function(O) {
                            O = O[0];
                            var H = O.name + "." + a;
                            a.startsWith("@@") && (a = Symbol[a.substring(2)]), v && O.registeredClass.pureVirtualFunctions.push(a);
                            function Y() {
                                on("Cannot call " + H + " due to unbound types", P);
                            }
                            var $ = O.registeredClass.instancePrototype, J = $[a];
                            return J === void 0 || J.overloadTable === void 0 && J.className !== O.name && J.argCount === u - 2 ? (Y.argCount = u - 2, Y.className = O.name, $[a] = Y) : (qn($, a, H), $[a].overloadTable[u - 2] = Y), ue([], P, function(ht) {
                                var et = Xn(H, ht, O, S, T);
                                return $[a].overloadTable === void 0 ? (et.argCount = u - 2, $[a] = et) : $[a].overloadTable[u - 2] = et, [];
                            }), [];
                        });
                    }
                    var hn = [], St = [
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
                    function Ti(s) {
                        s > 4 && --St[s].refcount === 0 && (St[s] = void 0, hn.push(s));
                    }
                    function Ci() {
                        for(var s = 0, a = 5; a < St.length; ++a)St[a] !== void 0 && ++s;
                        return s;
                    }
                    function zi() {
                        for(var s = 5; s < St.length; ++s)if (St[s] !== void 0) return St[s];
                        return null;
                    }
                    function Ei() {
                        r.count_emval_handles = Ci, r.get_first_emval = zi;
                    }
                    var ln = {
                        toValue: (s)=>(s || G("Cannot use deleted val. handle = " + s), St[s].value),
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
                                        var a = hn.length ? hn.pop() : St.length;
                                        return St[a] = {
                                            refcount: 1,
                                            value: s
                                        }, a;
                                    }
                            }
                        }
                    };
                    function Fi(s, a) {
                        a = _t(a), zt(s, {
                            name: a,
                            fromWireType: function(u) {
                                var g = ln.toValue(u);
                                return Ti(u), g;
                            },
                            toWireType: function(u, g) {
                                return ln.toHandle(g);
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: ke,
                            destructorFunction: null
                        });
                    }
                    function Jt(s) {
                        if (s === null) return "null";
                        var a = typeof s;
                        return a === "object" || a === "array" || a === "function" ? s.toString() : "" + s;
                    }
                    function Pi(s, a) {
                        switch(a){
                            case 2:
                                return function(u) {
                                    return this.fromWireType(En[u >> 2]);
                                };
                            case 3:
                                return function(u) {
                                    return this.fromWireType(Fn[u >> 3]);
                                };
                            default:
                                throw new TypeError("Unknown float type: " + s);
                        }
                    }
                    function Ii(s, a, u) {
                        var g = Ke(u);
                        a = _t(a), zt(s, {
                            name: a,
                            fromWireType: function(w) {
                                return w;
                            },
                            toWireType: function(w, S) {
                                if (typeof S != "number" && typeof S != "boolean") throw new TypeError('Cannot convert "' + Jt(S) + '" to ' + this.name);
                                return S;
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: Pi(a, g),
                            destructorFunction: null
                        });
                    }
                    function ki(s, a, u) {
                        switch(a){
                            case 0:
                                return u ? function(w) {
                                    return it[w];
                                } : function(w) {
                                    return X[w];
                                };
                            case 1:
                                return u ? function(w) {
                                    return tt[w >> 1];
                                } : function(w) {
                                    return st[w >> 1];
                                };
                            case 2:
                                return u ? function(w) {
                                    return q[w >> 2];
                                } : function(w) {
                                    return j[w >> 2];
                                };
                            default:
                                throw new TypeError("Unknown integer type: " + s);
                        }
                    }
                    function Ri(s, a, u, g, w) {
                        a = _t(a), w === -1 && (w = 4294967295);
                        var S = Ke(u), T = (Y)=>Y;
                        if (g === 0) {
                            var v = 32 - 8 * u;
                            T = (Y)=>Y << v >>> v;
                        }
                        var P = a.includes("unsigned"), O = (Y, $)=>{
                            if (typeof Y != "number" && typeof Y != "boolean") throw new TypeError('Cannot convert "' + Jt(Y) + '" to ' + $);
                            if (Y < g || Y > w) throw new TypeError('Passing a number "' + Jt(Y) + '" from JS side to C/C++ side to an argument of type "' + a + '", which is outside the valid range [' + g + ", " + w + "]!");
                        }, H;
                        P ? H = function(Y, $) {
                            return O($, this.name), $ >>> 0;
                        } : H = function(Y, $) {
                            return O($, this.name), $;
                        }, zt(s, {
                            name: a,
                            fromWireType: T,
                            toWireType: H,
                            argPackAdvance: 8,
                            readValueFromPointer: ki(a, S, g !== 0),
                            destructorFunction: null
                        });
                    }
                    function Ui(s, a, u) {
                        var g = [
                            Int8Array,
                            Uint8Array,
                            Int16Array,
                            Uint16Array,
                            Int32Array,
                            Uint32Array,
                            Float32Array,
                            Float64Array
                        ], w = g[a];
                        function S(T) {
                            T = T >> 2;
                            var v = j, P = v[T], O = v[T + 1];
                            return new w(ut, O, P);
                        }
                        u = _t(u), zt(s, {
                            name: u,
                            fromWireType: S,
                            argPackAdvance: 8,
                            readValueFromPointer: S
                        }, {
                            ignoreDuplicateRegistrations: !0
                        });
                    }
                    function Li(s, a) {
                        a = _t(a);
                        var u = a === "std::string";
                        zt(s, {
                            name: a,
                            fromWireType: function(g) {
                                var w = j[g >> 2], S = g + 4, T;
                                if (u) for(var v = S, P = 0; P <= w; ++P){
                                    var O = S + P;
                                    if (P == w || X[O] == 0) {
                                        var H = O - v, Y = D(v, H);
                                        T === void 0 ? T = Y : (T += "\0", T += Y), v = O + 1;
                                    }
                                }
                                else {
                                    for(var $ = new Array(w), P = 0; P < w; ++P)$[P] = String.fromCharCode(X[S + P]);
                                    T = $.join("");
                                }
                                return Rt(g), T;
                            },
                            toWireType: function(g, w) {
                                w instanceof ArrayBuffer && (w = new Uint8Array(w));
                                var S, T = typeof w == "string";
                                T || w instanceof Uint8Array || w instanceof Uint8ClampedArray || w instanceof Int8Array || G("Cannot pass non-string to std::string"), u && T ? S = Z(w) : S = w.length;
                                var v = un(4 + S + 1), P = v + 4;
                                if (j[v >> 2] = S, u && T) V(w, P, S + 1);
                                else if (T) for(var O = 0; O < S; ++O){
                                    var H = w.charCodeAt(O);
                                    H > 255 && (Rt(P), G("String has UTF-16 code units that do not fit in 8 bits")), X[P + O] = H;
                                }
                                else for(var O = 0; O < S; ++O)X[P + O] = w[O];
                                return g !== null && g.push(Rt, v), v;
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: ke,
                            destructorFunction: function(g) {
                                Rt(g);
                            }
                        });
                    }
                    var Zn = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0;
                    function Oi(s, a) {
                        _(s % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
                        for(var u = s, g = u >> 1, w = g + a / 2; !(g >= w) && st[g];)++g;
                        if (u = g << 1, u - s > 32 && Zn) return Zn.decode(X.subarray(s, u));
                        for(var S = "", T = 0; !(T >= a / 2); ++T){
                            var v = tt[s + T * 2 >> 1];
                            if (v == 0) break;
                            S += String.fromCharCode(v);
                        }
                        return S;
                    }
                    function Di(s, a, u) {
                        if (_(a % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!"), _(typeof u == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), u === void 0 && (u = 2147483647), u < 2) return 0;
                        u -= 2;
                        for(var g = a, w = u < s.length * 2 ? u / 2 : s.length, S = 0; S < w; ++S){
                            var T = s.charCodeAt(S);
                            tt[a >> 1] = T, a += 2;
                        }
                        return tt[a >> 1] = 0, a - g;
                    }
                    function Bi(s) {
                        return s.length * 2;
                    }
                    function Wi(s, a) {
                        _(s % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
                        for(var u = 0, g = ""; !(u >= a / 4);){
                            var w = q[s + u * 4 >> 2];
                            if (w == 0) break;
                            if (++u, w >= 65536) {
                                var S = w - 65536;
                                g += String.fromCharCode(55296 | S >> 10, 56320 | S & 1023);
                            } else g += String.fromCharCode(w);
                        }
                        return g;
                    }
                    function Ni(s, a, u) {
                        if (_(a % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!"), _(typeof u == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), u === void 0 && (u = 2147483647), u < 4) return 0;
                        for(var g = a, w = g + u - 4, S = 0; S < s.length; ++S){
                            var T = s.charCodeAt(S);
                            if (T >= 55296 && T <= 57343) {
                                var v = s.charCodeAt(++S);
                                T = 65536 + ((T & 1023) << 10) | v & 1023;
                            }
                            if (q[a >> 2] = T, a += 4, a + 4 > w) break;
                        }
                        return q[a >> 2] = 0, a - g;
                    }
                    function $i(s) {
                        for(var a = 0, u = 0; u < s.length; ++u){
                            var g = s.charCodeAt(u);
                            g >= 55296 && g <= 57343 && ++u, a += 4;
                        }
                        return a;
                    }
                    function Hi(s, a, u) {
                        u = _t(u);
                        var g, w, S, T, v;
                        a === 2 ? (g = Oi, w = Di, T = Bi, S = ()=>st, v = 1) : a === 4 && (g = Wi, w = Ni, T = $i, S = ()=>j, v = 2), zt(s, {
                            name: u,
                            fromWireType: function(P) {
                                for(var O = j[P >> 2], H = S(), Y, $ = P + 4, J = 0; J <= O; ++J){
                                    var ht = P + 4 + J * a;
                                    if (J == O || H[ht >> v] == 0) {
                                        var et = ht - $, bt = g($, et);
                                        Y === void 0 ? Y = bt : (Y += "\0", Y += bt), $ = ht + a;
                                    }
                                }
                                return Rt(P), Y;
                            },
                            toWireType: function(P, O) {
                                typeof O != "string" && G("Cannot pass non-string to C++ string type " + u);
                                var H = T(O), Y = un(4 + H + a);
                                return j[Y >> 2] = H >> v, w(O, Y + 4, H + a), P !== null && P.push(Rt, Y), Y;
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: ke,
                            destructorFunction: function(P) {
                                Rt(P);
                            }
                        });
                    }
                    function Yi(s, a) {
                        a = _t(a), zt(s, {
                            isVoid: !0,
                            name: a,
                            argPackAdvance: 0,
                            fromWireType: function() {},
                            toWireType: function(u, g) {}
                        });
                    }
                    function Vi() {
                        dt("native code called abort()");
                    }
                    function qi(s, a, u) {
                        X.copyWithin(s, a, a + u);
                    }
                    function ji() {
                        return 2147483648;
                    }
                    function Gi(s) {
                        try {
                            return B.grow(s - ut.byteLength + 65535 >>> 16), Pn(B.buffer), 1;
                        } catch (a) {
                            b("emscripten_realloc_buffer: Attempted to grow heap from " + ut.byteLength + " bytes to " + s + " bytes, but got error: " + a);
                        }
                    }
                    function Xi(s) {
                        var a = X.length;
                        s = s >>> 0, _(s > a);
                        var u = ji();
                        if (s > u) return b("Cannot enlarge memory, asked to go up to " + s + " bytes, but the limit is " + u + " bytes!"), !1;
                        let g = (P, O)=>P + (O - P % O) % O;
                        for(var w = 1; w <= 4; w *= 2){
                            var S = a * (1 + .2 / w);
                            S = Math.min(S, s + 100663296);
                            var T = Math.min(u, g(Math.max(s, S), 65536)), v = Gi(T);
                            if (v) return !0;
                        }
                        return b("Failed to grow the heap from " + a + " bytes to " + T + " bytes, not enough memory!"), !1;
                    }
                    var cn = {};
                    function Zi() {
                        return c || "./this.program";
                    }
                    function pe() {
                        if (!pe.strings) {
                            var s = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", a = {
                                USER: "web_user",
                                LOGNAME: "web_user",
                                PATH: "/",
                                PWD: "/",
                                HOME: "/home/web_user",
                                LANG: s,
                                _: Zi()
                            };
                            for(var u in cn)cn[u] === void 0 ? delete a[u] : a[u] = cn[u];
                            var g = [];
                            for(var u in a)g.push(u + "=" + a[u]);
                            pe.strings = g;
                        }
                        return pe.strings;
                    }
                    function Ji(s, a, u) {
                        for(var g = 0; g < s.length; ++g)_(s.charCodeAt(g) === (s.charCodeAt(g) & 255)), it[a++ >> 0] = s.charCodeAt(g);
                        it[a >> 0] = 0;
                    }
                    function Qi(s, a) {
                        var u = 0;
                        return pe().forEach(function(g, w) {
                            var S = a + u;
                            j[s + w * 4 >> 2] = S, Ji(g, S), u += g.length + 1;
                        }), 0;
                    }
                    function Ki(s, a) {
                        var u = pe();
                        j[s >> 2] = u.length;
                        var g = 0;
                        return u.forEach(function(w) {
                            g += w.length + 1;
                        }), j[a >> 2] = g, 0;
                    }
                    function ts(s) {
                        dt("fd_close called without SYSCALLS_REQUIRE_FILESYSTEM");
                    }
                    function es(s, a, u, g, w) {
                        return 70;
                    }
                    var ns = [
                        null,
                        [],
                        []
                    ];
                    function rs(s, a) {
                        var u = ns[s];
                        _(u), a === 0 || a === 10 ? ((s === 1 ? x : b)(I(u, 0)), u.length = 0) : u.push(a);
                    }
                    function is(s, a, u, g) {
                        for(var w = 0, S = 0; S < u; S++){
                            var T = j[a >> 2], v = j[a + 4 >> 2];
                            a += 8;
                            for(var P = 0; P < v; P++)rs(s, X[T + P]);
                            w += v;
                        }
                        return j[g >> 2] = w, 0;
                    }
                    function Ue(s) {
                        return s % 4 === 0 && (s % 100 !== 0 || s % 400 === 0);
                    }
                    function ss(s, a) {
                        for(var u = 0, g = 0; g <= a; u += s[g++]);
                        return u;
                    }
                    var Jn = [
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
                    ], Qn = [
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
                    function as(s, a) {
                        for(var u = new Date(s.getTime()); a > 0;){
                            var g = Ue(u.getFullYear()), w = u.getMonth(), S = (g ? Jn : Qn)[w];
                            if (a > S - u.getDate()) a -= S - u.getDate() + 1, u.setDate(1), w < 11 ? u.setMonth(w + 1) : (u.setMonth(0), u.setFullYear(u.getFullYear() + 1));
                            else return u.setDate(u.getDate() + a), u;
                        }
                        return u;
                    }
                    function os(s, a, u) {
                        var g = Z(s) + 1, w = new Array(g);
                        return N(s, w, 0, w.length), w;
                    }
                    function hs(s, a, u, g) {
                        var w = q[g + 40 >> 2], S = {
                            tm_sec: q[g >> 2],
                            tm_min: q[g + 4 >> 2],
                            tm_hour: q[g + 8 >> 2],
                            tm_mday: q[g + 12 >> 2],
                            tm_mon: q[g + 16 >> 2],
                            tm_year: q[g + 20 >> 2],
                            tm_wday: q[g + 24 >> 2],
                            tm_yday: q[g + 28 >> 2],
                            tm_isdst: q[g + 32 >> 2],
                            tm_gmtoff: q[g + 36 >> 2],
                            tm_zone: w ? D(w) : ""
                        }, T = D(u), v = {
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
                        for(var P in v)T = T.replace(new RegExp(P, "g"), v[P]);
                        var O = [
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday"
                        ], H = [
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
                        function Y(C, W, lt) {
                            for(var ot = typeof C == "number" ? C.toString() : C || ""; ot.length < W;)ot = lt[0] + ot;
                            return ot;
                        }
                        function $(C, W) {
                            return Y(C, W, "0");
                        }
                        function J(C, W) {
                            function lt(Ht) {
                                return Ht < 0 ? -1 : Ht > 0 ? 1 : 0;
                            }
                            var ot;
                            return (ot = lt(C.getFullYear() - W.getFullYear())) === 0 && (ot = lt(C.getMonth() - W.getMonth())) === 0 && (ot = lt(C.getDate() - W.getDate())), ot;
                        }
                        function ht(C) {
                            switch(C.getDay()){
                                case 0:
                                    return new Date(C.getFullYear() - 1, 11, 29);
                                case 1:
                                    return C;
                                case 2:
                                    return new Date(C.getFullYear(), 0, 3);
                                case 3:
                                    return new Date(C.getFullYear(), 0, 2);
                                case 4:
                                    return new Date(C.getFullYear(), 0, 1);
                                case 5:
                                    return new Date(C.getFullYear() - 1, 11, 31);
                                case 6:
                                    return new Date(C.getFullYear() - 1, 11, 30);
                            }
                        }
                        function et(C) {
                            var W = as(new Date(C.tm_year + 1900, 0, 1), C.tm_yday), lt = new Date(W.getFullYear(), 0, 4), ot = new Date(W.getFullYear() + 1, 0, 4), Ht = ht(lt), Oe = ht(ot);
                            return J(Ht, W) <= 0 ? J(Oe, W) <= 0 ? W.getFullYear() + 1 : W.getFullYear() : W.getFullYear() - 1;
                        }
                        var bt = {
                            "%a": function(C) {
                                return O[C.tm_wday].substring(0, 3);
                            },
                            "%A": function(C) {
                                return O[C.tm_wday];
                            },
                            "%b": function(C) {
                                return H[C.tm_mon].substring(0, 3);
                            },
                            "%B": function(C) {
                                return H[C.tm_mon];
                            },
                            "%C": function(C) {
                                var W = C.tm_year + 1900;
                                return $(W / 100 | 0, 2);
                            },
                            "%d": function(C) {
                                return $(C.tm_mday, 2);
                            },
                            "%e": function(C) {
                                return Y(C.tm_mday, 2, " ");
                            },
                            "%g": function(C) {
                                return et(C).toString().substring(2);
                            },
                            "%G": function(C) {
                                return et(C);
                            },
                            "%H": function(C) {
                                return $(C.tm_hour, 2);
                            },
                            "%I": function(C) {
                                var W = C.tm_hour;
                                return W == 0 ? W = 12 : W > 12 && (W -= 12), $(W, 2);
                            },
                            "%j": function(C) {
                                return $(C.tm_mday + ss(Ue(C.tm_year + 1900) ? Jn : Qn, C.tm_mon - 1), 3);
                            },
                            "%m": function(C) {
                                return $(C.tm_mon + 1, 2);
                            },
                            "%M": function(C) {
                                return $(C.tm_min, 2);
                            },
                            "%n": function() {
                                return `
`;
                            },
                            "%p": function(C) {
                                return C.tm_hour >= 0 && C.tm_hour < 12 ? "AM" : "PM";
                            },
                            "%S": function(C) {
                                return $(C.tm_sec, 2);
                            },
                            "%t": function() {
                                return "	";
                            },
                            "%u": function(C) {
                                return C.tm_wday || 7;
                            },
                            "%U": function(C) {
                                var W = C.tm_yday + 7 - C.tm_wday;
                                return $(Math.floor(W / 7), 2);
                            },
                            "%V": function(C) {
                                var W = Math.floor((C.tm_yday + 7 - (C.tm_wday + 6) % 7) / 7);
                                if ((C.tm_wday + 371 - C.tm_yday - 2) % 7 <= 2 && W++, W) {
                                    if (W == 53) {
                                        var ot = (C.tm_wday + 371 - C.tm_yday) % 7;
                                        ot != 4 && (ot != 3 || !Ue(C.tm_year)) && (W = 1);
                                    }
                                } else {
                                    W = 52;
                                    var lt = (C.tm_wday + 7 - C.tm_yday - 1) % 7;
                                    (lt == 4 || lt == 5 && Ue(C.tm_year % 400 - 1)) && W++;
                                }
                                return $(W, 2);
                            },
                            "%w": function(C) {
                                return C.tm_wday;
                            },
                            "%W": function(C) {
                                var W = C.tm_yday + 7 - (C.tm_wday + 6) % 7;
                                return $(Math.floor(W / 7), 2);
                            },
                            "%y": function(C) {
                                return (C.tm_year + 1900).toString().substring(2);
                            },
                            "%Y": function(C) {
                                return C.tm_year + 1900;
                            },
                            "%z": function(C) {
                                var W = C.tm_gmtoff, lt = W >= 0;
                                return W = Math.abs(W) / 60, W = W / 60 * 100 + W % 60, (lt ? "+" : "-") + ("0000" + W).slice(-4);
                            },
                            "%Z": function(C) {
                                return C.tm_zone;
                            },
                            "%%": function() {
                                return "%";
                            }
                        };
                        T = T.replace(/%%/g, "\0\0");
                        for(var P in bt)T.includes(P) && (T = T.replace(new RegExp(P, "g"), bt[P](S)));
                        T = T.replace(/\0\0/g, "%");
                        var Tt = os(T);
                        return Tt.length > a ? 0 : (Br(Tt, s), Tt.length - 1);
                    }
                    function ls(s, a, u, g) {
                        return hs(s, a, u, g);
                    }
                    Yr(), Xt = r.BindingError = tn(Error, "BindingError"), Wn = r.InternalError = tn(Error, "InternalError"), oi(), ti(), pi(), jn = r.UnboundTypeError = tn(Error, "UnboundTypeError"), Ei();
                    function cs() {
                        M("fetchSettings");
                    }
                    var Kn = {
                        __cxa_allocate_exception: Wr,
                        __cxa_throw: $r,
                        _embind_register_bigint: Hr,
                        _embind_register_bool: jr,
                        _embind_register_class: vi,
                        _embind_register_class_constructor: Ai,
                        _embind_register_class_function: Si,
                        _embind_register_emval: Fi,
                        _embind_register_float: Ii,
                        _embind_register_integer: Ri,
                        _embind_register_memory_view: Ui,
                        _embind_register_std_string: Li,
                        _embind_register_std_wstring: Hi,
                        _embind_register_void: Yi,
                        abort: Vi,
                        emscripten_memcpy_big: qi,
                        emscripten_resize_heap: Xi,
                        environ_get: Qi,
                        environ_sizes_get: Ki,
                        fd_close: ts,
                        fd_seek: es,
                        fd_write: is,
                        strftime_l: ls
                    };
                    Dr(), r.___wasm_call_ctors = at("__wasm_call_ctors");
                    var un = r._malloc = at("malloc"), Rt = r._free = at("free"), us = r.___getTypeName = at("__getTypeName");
                    r.__embind_initialize_bindings = at("_embind_initialize_bindings"), r.___errno_location = at("__errno_location"), r._fflush = at("fflush");
                    var tr = r._emscripten_stack_init = function() {
                        return (tr = r._emscripten_stack_init = r.asm.emscripten_stack_init).apply(null, arguments);
                    };
                    r._emscripten_stack_get_free = function() {
                        return (r._emscripten_stack_get_free = r.asm.emscripten_stack_get_free).apply(null, arguments);
                    }, r._emscripten_stack_get_base = function() {
                        return (r._emscripten_stack_get_base = r.asm.emscripten_stack_get_base).apply(null, arguments);
                    };
                    var dn = r._emscripten_stack_get_end = function() {
                        return (dn = r._emscripten_stack_get_end = r.asm.emscripten_stack_get_end).apply(null, arguments);
                    };
                    r.stackSave = at("stackSave"), r.stackRestore = at("stackRestore"), r.stackAlloc = at("stackAlloc");
                    var ds = r.___cxa_is_pointer_type = at("__cxa_is_pointer_type");
                    r.dynCall_viijii = at("dynCall_viijii"), r.dynCall_ji = at("dynCall_ji"), r.dynCall_jiji = at("dynCall_jiji"), r.dynCall_iiiiij = at("dynCall_iiiiij"), r.dynCall_iiiiijj = at("dynCall_iiiiijj"), r.dynCall_iiiiiijj = at("dynCall_iiiiiijj");
                    var fs = [
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
                    fs.forEach(L);
                    var ms = [
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
                    ms.forEach(k);
                    var Le;
                    le = function s() {
                        Le || er(), Le || (le = s);
                    };
                    function ys() {
                        tr(), Tr();
                    }
                    function er(s) {
                        if (Wt > 0 || (ys(), Cr(), Wt > 0)) return;
                        function a() {
                            Le || (Le = !0, r.calledRun = !0, !E && (zr(), l(r), r.onRuntimeInitialized && r.onRuntimeInitialized(), _(!r._main, 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'), Er()));
                        }
                        r.setStatus ? (r.setStatus("Running..."), setTimeout(function() {
                            setTimeout(function() {
                                r.setStatus("");
                            }, 1), a();
                        }, 1)) : a(), Ze();
                    }
                    if (r.preInit) for(typeof r.preInit == "function" && (r.preInit = [
                        r.preInit
                    ]); r.preInit.length > 0;)r.preInit.pop()();
                    return er(), i.ready;
                });
            })();
            p.exports = e;
        })(wn)), wn.exports;
    }
    var mr;
    function Bs() {
        if (mr) return Mt;
        mr = 1;
        var p = Mt && Mt.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            };
        };
        Object.defineProperty(Mt, "__esModule", {
            value: !0
        }), Mt.LazPerf = Mt.create = Mt.createLazPerf = void 0;
        const t = p(Ds());
        return Mt.createLazPerf = t.default, Mt.create = t.default, Mt.LazPerf = {
            create: t.default
        }, Mt;
    }
    var xr = Bs(), br = "" + new URL("laz-perf-CFJp03W6.wasm", import.meta.url).href;
    const yr = navigator.deviceMemory ?? 4, je = yr >= 8 ? 12e7 : yr >= 4 ? 4e7 : 16e6;
    function Cn(p) {
        const t = new DataView(p);
        if (String.fromCharCode(t.getUint8(0), t.getUint8(1), t.getUint8(2), t.getUint8(3)) !== "LASF") throw new Error("это не LAS/LAZ файл");
        const n = t.getUint32(96, !0), i = t.getUint8(104) & 63, r = t.getUint16(105, !0);
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
            offset: n,
            format: i,
            recLen: r,
            count: l,
            scale: h,
            off: c,
            rgbAt: i === 2 ? 20 : i === 3 || i === 5 ? 28 : i === 7 || i === 8 ? 30 : -1,
            min: o
        };
    }
    function zn(p, t, e, n, i, r) {
        const l = p.getInt32(t, !0) * e.scale[0] + e.off[0] - e.min[0], h = p.getInt32(t + 4, !0) * e.scale[1] + e.off[1] - e.min[1], o = p.getInt32(t + 8, !0) * e.scale[2] + e.off[2] - e.min[2];
        if (n[r * 3] = l, n[r * 3 + 1] = o, n[r * 3 + 2] = -h, e.rgbAt >= 0) {
            const c = p.getUint16(t + e.rgbAt, !0), d = p.getUint16(t + e.rgbAt + 2, !0), f = p.getUint16(t + e.rgbAt + 4, !0), y = c > 255 || d > 255 || f > 255 ? 8 : 0;
            i[r * 3] = c >> y, i[r * 3 + 1] = d >> y, i[r * 3 + 2] = f >> y;
        } else i[r * 3] = 179, i[r * 3 + 1] = 173, i[r * 3 + 2] = 166;
    }
    async function Ws(p, t) {
        const e = Cn(p), n = await xr.createLazPerf({
            locateFile: ()=>br
        }), i = new n.LASZip, r = n._malloc(p.byteLength);
        n.HEAPU8.set(new Uint8Array(p), r);
        try {
            i.open(r, p.byteLength);
            const l = i.getCount(), h = i.getPointLength();
            e.recLen = h;
            const o = Math.max(1, Math.ceil(l / je)), c = Math.ceil(l / o), d = new Float32Array(c * 3), f = new Uint8Array(c * 3), y = n._malloc(h), m = new Uint8Array(n.HEAPU8.buffer, y, h), x = new DataView(n.HEAPU8.buffer, y, h);
            let b = 0;
            for(let F = 0; F < l; F++)i.getPoint(y), (F & 262143) === 0 && t && t(F / l), !(F % o !== 0 || b >= c) && (zn(x, 0, e, d, f, b), b++);
            n._free(y);
            const A = d.subarray(0, b * 3), M = ze(A);
            return {
                positions: A,
                colors: f.subarray(0, b * 3),
                count: b,
                origin: {
                    x: e.min[0] + M.cx,
                    y: e.min[2] + M.cy,
                    z: M.cz - e.min[1]
                }
            };
        } finally{
            i.delete(), n._free(r);
        }
    }
    async function Ns(p, t) {
        const e = Cn(await p.slice(0, 512).arrayBuffer());
        if (!e.count) throw new Error("пустой LAS");
        const n = Math.max(1, Math.ceil(e.count / je)), i = Math.ceil(e.count / n), r = new Float32Array(i * 3), l = new Uint8Array(i * 3), h = Math.max(1, Math.floor((32 << 20) / e.recLen));
        let o = 0, c = 0;
        for(; c < e.count && o < i;){
            const y = c, m = Math.min(e.count - 1, y + h - 1), x = new DataView(await p.slice(e.offset + y * e.recLen, e.offset + (m + 1) * e.recLen).arrayBuffer());
            for(; c <= m && o < i;)zn(x, (c - y) * e.recLen, e, r, l, o), o++, c += n;
            t && t(Math.min(1, c / e.count));
        }
        const d = r.subarray(0, o * 3), f = ze(d);
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
    function $s(p) {
        if (p.byteLength < 429) return !1;
        const t = new DataView(p);
        if (String.fromCharCode(t.getUint8(0), t.getUint8(1), t.getUint8(2), t.getUint8(3)) !== "LASF") return !1;
        let e = "";
        for(let n = 0; n < 16; n++){
            const i = t.getUint8(377 + n);
            i && (e += String.fromCharCode(i));
        }
        return e === "copc" && t.getUint16(393, !0) === 1;
    }
    async function Hs(p, t) {
        const e = await p.slice(0, 589).arrayBuffer(), n = Cn(e), i = new DataView(e), r = 429, l = Number(i.getBigUint64(r + 40, !0)), h = Number(i.getBigUint64(r + 48, !0)), o = [], c = async (R, B)=>{
            const E = new DataView(await p.slice(R, R + B).arrayBuffer());
            for(let _ = 0; _ + 32 <= B; _ += 32){
                const z = E.getInt32(_, !0), I = Number(E.getBigUint64(_ + 16, !0)), D = E.getInt32(_ + 24, !0), N = E.getInt32(_ + 28, !0);
                N === -1 ? await c(I, D) : N > 0 && o.push({
                    level: z,
                    offset: I,
                    size: D,
                    count: N
                });
            }
        };
        await c(l, h), o.sort((R, B)=>R.level - B.level);
        const d = [];
        let f = 0;
        for (const R of o){
            if (f >= je) break;
            d.push(R), f += R.count;
        }
        const y = f, m = new Float32Array(y * 3), x = new Uint8Array(y * 3), b = await xr.createLazPerf({
            locateFile: ()=>br
        }), A = b._malloc(n.recLen);
        let M = 0, F = 0;
        for (const R of d){
            const B = new Uint8Array(await p.slice(R.offset, R.offset + R.size).arrayBuffer()), E = b._malloc(B.byteLength);
            b.HEAPU8.set(B, E);
            const _ = new b.ChunkDecoder;
            try {
                _.open(n.format, n.recLen, E);
                const z = new DataView(b.HEAPU8.buffer, A, n.recLen);
                for(let I = 0; I < R.count; I++)_.getPoint(A), zn(z, 0, n, m, x, M), M++;
            } finally{
                _.delete(), b._free(E);
            }
            F += R.count, t && t(F / y);
        }
        b._free(A);
        const k = m.subarray(0, M * 3), L = ze(k);
        return {
            positions: k,
            colors: x.subarray(0, M * 3),
            count: M,
            origin: {
                x: n.min[0] + L.cx,
                y: n.min[2] + L.cy,
                z: L.cz - n.min[1]
            }
        };
    }
    async function Ys(p) {
        const { convertE57: t } = await import("./e57-DDyz-5_6.js").then(async (m)=>{
            await m.__tla;
            return m;
        }), e = t(new Uint8Array(p), "xyz");
        return _r(e);
    }
    const At = 8, Vs = 512e3, qs = 18;
    function An(p, t, e, n, i = Vs, r = 3) {
        if (!e) return new Float64Array(0);
        let l = 1 / 0, h = 1 / 0, o = 1 / 0, c = -1 / 0, d = -1 / 0, f = -1 / 0;
        for(let M = 0; M < e * 3; M += 3){
            const F = p[M], k = p[M + 1], L = p[M + 2];
            F < l && (l = F), F > c && (c = F), k < h && (h = k), k > d && (d = k), L < o && (o = L), L > f && (f = L);
        }
        const y = [], m = [
            {
                start: 0,
                end: e,
                depth: 0,
                box: [
                    l,
                    h,
                    o,
                    c,
                    d,
                    f
                ]
            }
        ];
        let x = 0;
        const b = (M, F)=>{
            for(let k = 0; k < 3; k++){
                const L = M * 3 + k, R = F * 3 + k, B = p[L];
                p[L] = p[R], p[R] = B;
            }
            for(let k = 0; k < r; k++){
                const L = M * r + k, R = F * r + k, B = t[L];
                t[L] = t[R], t[R] = B;
            }
        };
        for(; m.length;){
            const M = m.pop(), F = M.end - M.start;
            if (F <= i || M.depth >= qs) {
                y.push(M), x += F, n && n(x / e);
                continue;
            }
            const k = M.box, L = k[3] - k[0], R = k[4] - k[1], B = k[5] - k[2], E = L >= R && L >= B ? 0 : R >= B ? 1 : 2, _ = (k[E] + k[E + 3]) / 2;
            let z = M.start, I = M.end - 1;
            for(; z <= I;){
                for(; z <= I && p[z * 3 + E] < _;)z++;
                for(; z <= I && p[I * 3 + E] >= _;)I--;
                z < I && (b(z, I), z++, I--);
            }
            (z === M.start || z === M.end) && (z = M.start + (F >> 1));
            const D = k.slice(), N = k.slice();
            D[E + 3] = _, N[E] = _, m.push({
                start: M.start,
                end: z,
                depth: M.depth + 1,
                box: D
            }), m.push({
                start: z,
                end: M.end,
                depth: M.depth + 1,
                box: N
            });
        }
        y.sort((M, F)=>M.start - F.start);
        const A = new Float64Array(y.length * At);
        for(let M = 0; M < y.length; M++){
            const F = y[M];
            let k = 1 / 0, L = 1 / 0, R = 1 / 0, B = -1 / 0, E = -1 / 0, _ = -1 / 0;
            for(let I = F.start * 3; I < F.end * 3; I += 3){
                const D = p[I], N = p[I + 1], V = p[I + 2];
                D < k && (k = D), D > B && (B = D), N < L && (L = N), N > E && (E = N), V < R && (R = V), V > _ && (_ = V);
            }
            const z = M * At;
            A[z] = F.start, A[z + 1] = F.end - F.start, A[z + 2] = k, A[z + 3] = L, A[z + 4] = R, A[z + 5] = B, A[z + 6] = E, A[z + 7] = _;
        }
        return A;
    }
    function pr(p, t) {
        let e = 0;
        for(let i = 0; i + At <= t.length; i += At)e += t[i + 1];
        const n = new Uint16Array(e * 3);
        for(let i = 0; i + At <= t.length; i += At){
            const r = t[i], l = t[i + 1], h = t[i + 2], o = t[i + 3], c = t[i + 4], d = 65535 / Math.max(1e-9, t[i + 5] - h), f = 65535 / Math.max(1e-9, t[i + 6] - o), y = 65535 / Math.max(1e-9, t[i + 7] - c);
            for(let m = r * 3, x = (r + l) * 3; m < x; m += 3)n[m] = Math.min(65535, (p[m] - h) * d + .5), n[m + 1] = Math.min(65535, (p[m + 1] - o) * f + .5), n[m + 2] = Math.min(65535, (p[m + 2] - c) * y + .5);
        }
        return n;
    }
    function js(p, t, e, n, i) {
        let r = !1;
        for(let l = 0, h = i - 1; l < i; h = l++){
            const o = n[l], c = n[h];
            o > t != c > t && p < (e[h] - e[l]) * (t - o) / (c - o) + e[l] && (r = !r);
        }
        return r;
    }
    const Gs = "cloud-cache", Xs = 3, wr = 8;
    function Zs(p) {
        return p.map((t)=>`${t.name}|${t.size}|${t.lastModified}`).join("~");
    }
    function vr(p) {
        let t = 2166136261;
        for(let e = 0; e < p.length; e++)t ^= p.charCodeAt(e), t = Math.imul(t, 16777619);
        return (t >>> 0).toString(16).padStart(8, "0");
    }
    async function Mr() {
        return (await navigator.storage.getDirectory()).getDirectoryHandle(Gs, {
            create: !0
        });
    }
    async function ae(p, t) {
        let e;
        try {
            e = await p.getFileHandle(t);
        } catch  {
            return null;
        }
        const n = await e.createSyncAccessHandle();
        try {
            const i = new Uint8Array(n.getSize());
            return n.read(i, {
                at: 0
            }), i;
        } finally{
            n.close();
        }
    }
    async function oe(p, t, e) {
        const i = await (await p.getFileHandle(t, {
            create: !0
        })).createSyncAccessHandle();
        try {
            i.truncate(0), i.write(e, {
                at: 0
            }), i.flush();
        } finally{
            i.close();
        }
    }
    async function Ar(p) {
        const t = await ae(p, "index.json");
        if (!t) return [];
        try {
            return JSON.parse(new TextDecoder().decode(t));
        } catch  {
            return [];
        }
    }
    async function Sr(p, t) {
        await oe(p, "index.json", new TextEncoder().encode(JSON.stringify(t)));
    }
    async function Js(p) {
        try {
            const t = await Mr(), e = vr(p), n = await t.getDirectoryHandle(e).catch(()=>null);
            if (!n) return null;
            const i = await ae(n, "meta.bin");
            if (!i) return null;
            const r = new Float64Array(i.buffer, i.byteOffset, wr), l = await ae(n, "key.txt");
            if ((l ? new TextDecoder().decode(l) : "") !== p) return null;
            const [o, c, d, f, y, m, x, b] = r, A = await ae(n, "leaves.bin"), M = await ae(n, "qpos.bin"), F = await ae(n, "colors.bin");
            if (!A || !M || !F || A.byteLength !== m || M.byteLength !== x || F.byteLength !== b) return null;
            const k = new Float64Array(A.buffer, A.byteOffset, m / 8), L = new Uint16Array(M.buffer, M.byteOffset, x / 2), R = F, B = await Ar(t), E = B.find((_)=>_.hash === e);
            return E && (E.lastUsed = Date.now(), await Sr(t, B)), {
                qpos: L,
                colors: R,
                leaves: k,
                count: o,
                origin: c ? {
                    x: d,
                    y: f,
                    z: y
                } : null
            };
        } catch  {
            return null;
        }
    }
    async function Qs(p, t) {
        try {
            const e = await Mr(), n = vr(p), i = await e.getDirectoryHandle(n, {
                create: !0
            }), r = new Float64Array(wr);
            r[0] = t.count, r[1] = t.origin ? 1 : 0, r[2] = t.origin?.x ?? 0, r[3] = t.origin?.y ?? 0, r[4] = t.origin?.z ?? 0, r[5] = t.leaves.byteLength, r[6] = t.qpos.byteLength, r[7] = t.colors.byteLength, await oe(i, "meta.bin", new Uint8Array(r.buffer)), await oe(i, "key.txt", new TextEncoder().encode(p)), await oe(i, "leaves.bin", new Uint8Array(t.leaves.buffer, t.leaves.byteOffset, t.leaves.byteLength)), await oe(i, "qpos.bin", new Uint8Array(t.qpos.buffer, t.qpos.byteOffset, t.qpos.byteLength)), await oe(i, "colors.bin", t.colors);
            const h = (await Ar(e)).filter((c)=>c.hash !== n);
            h.push({
                hash: n,
                key: p,
                lastUsed: Date.now()
            }), h.sort((c, d)=>d.lastUsed - c.lastUsed);
            const o = h.splice(Xs);
            for (const c of o)await e.removeEntry(c.hash, {
                recursive: !0
            }).catch(()=>{});
            await Sr(e, h);
        } catch  {}
    }
    let Me = null, Ae = null, Se = 0;
    const Ye = 4e6, rt = self, gr = 18e8;
    async function vn(p, t) {
        const e = new Uint8Array(p.size), n = p.stream().getReader();
        let i = 0, r = -1;
        for(;;){
            const { done: l, value: h } = await n.read();
            if (l) break;
            e.set(h, i), i += h.length;
            const o = Math.floor(i / p.size * 100);
            o !== r && (r = o, rt.postMessage({
                type: "progress",
                p: i / p.size,
                phase: `${t} ${o}%`
            }));
        }
        return e.buffer;
    }
    async function Ks(p, t) {
        const e = (r)=>rt.postMessage({
                type: "progress",
                p: r,
                phase: `${t}Обработка точек… ${Math.round(r * 100)}%`
            }), n = (p.name.toLowerCase().split(".").pop() ?? "").trim();
        if (n === "las") return Ns(p, e);
        if (n === "laz") {
            if ($s(await p.slice(0, 512).arrayBuffer())) return rt.postMessage({
                type: "progress",
                p: 0,
                phase: `${t}COPC: чтение октодерева…`
            }), Hs(p, e);
            if (p.size > gr) throw new Error("LAZ слишком большой для распаковки целиком — конвертируйте в COPC или LAS");
            return Ws(await vn(p, `${t}Чтение файла…`), e);
        }
        if (n === "e57") {
            if (p.size > gr) throw new Error("E57 слишком большой — конвертируйте в LAS");
            const r = await vn(p, `${t}Чтение файла…`);
            return rt.postMessage({
                type: "progress",
                p: 0,
                phase: `${t}Конвертация E57…`
            }), Ys(r);
        }
        const i = await vn(p, `${t}Чтение файла…`);
        return _r(new TextDecoder().decode(i), (r)=>rt.postMessage({
                type: "progress",
                p: r,
                phase: `${t}Разбор текста… ${Math.round(r * 100)}%`
            }));
    }
    function ta(p) {
        const t = p[0].origin ?? {
            x: 0,
            y: 0,
            z: 0
        };
        let e = 0;
        for (const f of p)e += f.count;
        const n = Math.max(1, Math.ceil(e / je)), i = Math.ceil(e / n), r = new Float32Array(i * 3), l = new Uint8Array(i * 3);
        let h = 0, o = 0;
        for (const f of p){
            const y = f.origin ?? {
                x: 0,
                y: 0,
                z: 0
            }, m = y.x - t.x, x = y.y - t.y, b = y.z - t.z;
            for(let A = o; A < f.count && h < i; A += n)r[h * 3] = f.positions[A * 3] + m, r[h * 3 + 1] = f.positions[A * 3 + 1] + x, r[h * 3 + 2] = f.positions[A * 3 + 2] + b, l[h * 3] = f.colors[A * 3], l[h * 3 + 1] = f.colors[A * 3 + 1], l[h * 3 + 2] = f.colors[A * 3 + 2], h++;
            o = (o - f.count) % n, o < 0 && (o += n);
        }
        const c = r.subarray(0, h * 3), d = ze(c);
        return {
            positions: c,
            colors: l.subarray(0, h * 3),
            count: h,
            origin: {
                x: t.x + d.cx,
                y: t.y + d.cy,
                z: t.z + d.cz
            }
        };
    }
    function ea(p) {
        if (!Me || !Ae) {
            rt.postMessage({
                type: "lasso",
                seq: p.seq,
                kept: 0
            });
            return;
        }
        const { px: t, pz: e, n } = p, i = Me, r = Ae;
        let l = 1 / 0, h = -1 / 0, o = 1 / 0, c = -1 / 0;
        for(let _ = 0; _ < n; _++)t[_] < l && (l = t[_]), t[_] > h && (h = t[_]), e[_] < o && (o = e[_]), e[_] > c && (c = e[_]);
        const d = new Uint8Array(Se);
        let f = 0, y = 1 / 0, m = 1 / 0, x = 1 / 0, b = -1 / 0, A = -1 / 0, M = -1 / 0;
        for(let _ = 0; _ + At <= r.length; _ += At){
            if (r[_ + 5] < l || r[_ + 2] > h || r[_ + 7] < o || r[_ + 4] > c) continue;
            const z = r[_], I = z + r[_ + 1], D = r[_ + 2], N = r[_ + 3], V = r[_ + 4], Z = Math.max(1e-9, r[_ + 5] - D) / 65535, ut = Math.max(1e-9, r[_ + 6] - N) / 65535, it = Math.max(1e-9, r[_ + 7] - V) / 65535;
            for(let X = z; X < I; X++){
                const tt = D + i[X * 3] * Z, st = V + i[X * 3 + 2] * it;
                if (!(tt < l || tt > h || st < o || st > c) && js(tt, st, t, e, n)) {
                    d[X] = 1, f++;
                    const q = N + i[X * 3 + 1] * ut;
                    tt < y && (y = tt), tt > b && (b = tt), q < m && (m = q), q > A && (A = q), st < x && (x = st), st > M && (M = st);
                }
            }
        }
        if (!f) {
            rt.postMessage({
                type: "lasso",
                seq: p.seq,
                kept: 0
            });
            return;
        }
        let F = new Uint32Array(f);
        for(let _ = 0, z = 0; _ < Se; _++)d[_] && (F[z++] = _);
        if (f > Ye) {
            const _ = new Uint32Array(Ye), z = f / Ye;
            for(let I = 0; I < Ye; I++)_[I] = F[I * z | 0];
            F = _;
        }
        for(let _ = F.length - 1; _ > 0; _--){
            const z = Math.random() * (_ + 1) | 0, I = F[_];
            F[_] = F[z], F[z] = I;
        }
        const k = F.length, L = new Float32Array(k * 3);
        for(let _ = 0; _ < k; _++){
            const z = F[_];
            let I = 0, D = r.length / At - 1;
            for(; I < D;){
                const V = I + D + 1 >> 1;
                r[V * At] <= z ? I = V : D = V - 1;
            }
            const N = I * At;
            L[_ * 3] = r[N + 2] + i[z * 3] * (Math.max(1e-9, r[N + 5] - r[N + 2]) / 65535), L[_ * 3 + 1] = r[N + 3] + i[z * 3 + 1] * (Math.max(1e-9, r[N + 6] - r[N + 3]) / 65535), L[_ * 3 + 2] = r[N + 4] + i[z * 3 + 2] * (Math.max(1e-9, r[N + 7] - r[N + 4]) / 65535);
        }
        const R = An(L, new Uint8Array(F.buffer, F.byteOffset, k * 4), k, void 0, 64e3, 4);
        let B = null;
        if (p.ucsInverse) {
            const _ = p.ucsInverse;
            B = new Float32Array(k * 3);
            for(let z = 0; z < k; z++){
                const I = L[z * 3], D = L[z * 3 + 1], N = L[z * 3 + 2];
                B[z * 3] = _[0] * I + _[4] * D + _[8] * N + _[12], B[z * 3 + 1] = _[1] * I + _[5] * D + _[9] * N + _[13], B[z * 3 + 2] = _[2] * I + _[6] * D + _[10] * N + _[14];
            }
        }
        const E = [
            L.buffer,
            R.buffer,
            F.buffer
        ];
        B && E.push(B.buffer), rt.postMessage({
            type: "lasso",
            seq: p.seq,
            kept: f,
            srcP: L,
            wallLeaves: R,
            idx: F,
            localAll: B,
            bounds: [
                y,
                m,
                x,
                b,
                A,
                M
            ]
        }, E);
    }
    rt.postMessage({
        type: "ready"
    });
    rt.onmessage = async (p)=>{
        const { files: t, demo: e, lasso: n } = p.data;
        if (n) {
            try {
                ea(n);
            } catch (i) {
                rt.postMessage({
                    type: "error",
                    message: i.message
                });
            }
            return;
        }
        try {
            if (e) {
                const m = Os(), x = m.geometry.getAttribute("aColor").array;
                Mn(m.positions, x, m.count);
                const b = An(m.positions, x, m.count), A = pr(m.positions, b);
                Me = A.slice(), Ae = b.slice(), Se = m.count, rt.postMessage({
                    type: "done",
                    qpos: A,
                    colors: x,
                    count: m.count,
                    origin: null,
                    leaves: b
                }, [
                    A.buffer,
                    x.buffer,
                    b.buffer
                ]);
                return;
            }
            if (!t || !t.length) throw new Error("нет файлов для импорта");
            const i = Zs(t), r = await Js(i);
            if (r) {
                rt.postMessage({
                    type: "progress",
                    p: .5,
                    phase: "Кэш скана найден — секунды вместо разбора…"
                }), Me = r.qpos.slice(), Ae = r.leaves.slice(), Se = r.count, rt.postMessage({
                    type: "done",
                    qpos: r.qpos,
                    colors: r.colors,
                    count: r.count,
                    origin: r.origin,
                    leaves: r.leaves
                }, [
                    r.qpos.buffer,
                    r.colors.buffer,
                    r.leaves.buffer
                ]);
                return;
            }
            const l = [];
            for(let m = 0; m < t.length; m++){
                const x = t.length > 1 ? `Файл ${m + 1}/${t.length} · ` : "", b = await Ks(t[m], x);
                if (!b) throw new Error(`${t[m].name}: не удалось прочитать (LAS/LAZ/E57 или ASCII x y z [r g b])`);
                l.push(b);
            }
            const h = l.length === 1 ? l[0] : ta(l);
            rt.postMessage({
                type: "progress",
                p: 1,
                phase: "Подготовка отображения…"
            }), Mn(h.positions, h.colors, h.count);
            const o = An(h.positions, h.colors, h.count, (m)=>rt.postMessage({
                    type: "progress",
                    p: m,
                    phase: `Индексация… ${Math.round(m * 100)}%`
                })), c = pr(h.positions, o), d = c.slice(), f = o.slice(), y = h.colors.slice();
            Me = c.slice(), Ae = o.slice(), Se = h.count, rt.postMessage({
                type: "done",
                qpos: c,
                colors: h.colors,
                count: h.count,
                origin: h.origin ?? null,
                leaves: o
            }, [
                c.buffer,
                h.colors.buffer,
                o.buffer
            ]), Qs(i, {
                qpos: d,
                colors: y,
                leaves: f,
                count: h.count,
                origin: h.origin ?? null
            });
        } catch (i) {
            rt.postMessage({
                type: "error",
                message: i.message
            });
        }
    };
})();
