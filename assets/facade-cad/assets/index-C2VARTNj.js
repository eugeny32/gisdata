(function() {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) n(i);
  new MutationObserver((i) => {
    for (const r of i) if (r.type === "childList") for (const o of r.addedNodes) o.tagName === "LINK" && o.rel === "modulepreload" && n(o);
  }).observe(document, { childList: true, subtree: true });
  function e(i) {
    const r = {};
    return i.integrity && (r.integrity = i.integrity), i.referrerPolicy && (r.referrerPolicy = i.referrerPolicy), i.crossOrigin === "use-credentials" ? r.credentials = "include" : i.crossOrigin === "anonymous" ? r.credentials = "omit" : r.credentials = "same-origin", r;
  }
  function n(i) {
    if (i.ep) return;
    i.ep = true;
    const r = e(i);
    fetch(i.href, r);
  }
})();
/**
* @license
* Copyright 2010-2025 Three.js Authors
* SPDX-License-Identifier: MIT
*/
const Fa = "174", Un = { ROTATE: 0, DOLLY: 1, PAN: 2 }, Ji = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, Nh = 0, ol = 1, Oh = 2, Nc = 1, Bh = 2, Cn = 3, Qn = 0, Ve = 1, ze = 2, Kn = 0, es = 1, al = 2, ll = 3, cl = 4, zh = 5, gi = 100, kh = 101, Hh = 102, Vh = 103, Gh = 104, Wh = 200, Xh = 201, Yh = 202, qh = 203, Wo = 204, Xo = 205, $h = 206, jh = 207, Zh = 208, Kh = 209, Jh = 210, Qh = 211, tu = 212, eu = 213, nu = 214, Yo = 0, qo = 1, $o = 2, ss = 3, jo = 4, Zo = 5, Ko = 6, Jo = 7, Oc = 0, iu = 1, su = 2, Jn = 0, ru = 1, ou = 2, au = 3, lu = 4, cu = 5, hu = 6, uu = 7, Bc = 300, rs = 301, os = 302, Qo = 303, ta = 304, Yr = 306, ea = 1e3, vi = 1001, na = 1002, un = 1003, du = 1004, Vs = 1005, xn = 1006, Kr = 1007, xi = 1008, On = 1009, zc = 1010, kc = 1011, Fs = 1012, Na = 1013, Si = 1014, Pn = 1015, Os = 1016, Oa = 1017, Ba = 1018, as = 1020, Hc = 35902, Vc = 1021, Gc = 1022, cn = 1023, Wc = 1024, Xc = 1025, ns = 1026, ls = 1027, Yc = 1028, za = 1029, qc = 1030, ka = 1031, Ha = 1033, Lr = 33776, Dr = 33777, Ir = 33778, Ur = 33779, ia = 35840, sa = 35841, ra = 35842, oa = 35843, aa = 36196, la = 37492, ca = 37496, ha = 37808, ua = 37809, da = 37810, fa = 37811, pa = 37812, ma = 37813, ga = 37814, _a = 37815, va = 37816, xa = 37817, ya = 37818, Sa = 37819, Ma = 37820, Ea = 37821, Fr = 36492, ba = 36494, wa = 36495, $c = 36283, Ta = 36284, Aa = 36285, Ca = 36286, fu = 3200, pu = 3201, mu = 0, gu = 1, $n = "", De = "srgb", cs = "srgb-linear", Br = "linear", ee = "srgb", Ri = 7680, hl = 519, _u = 512, vu = 513, xu = 514, jc = 515, yu = 516, Su = 517, Mu = 518, Eu = 519, Ra = 35044, ul = "300 es", Ln = 2e3, zr = 2001;
class bi {
  addEventListener(t, e) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[t] === void 0 && (n[t] = []), n[t].indexOf(e) === -1 && n[t].push(e);
  }
  hasEventListener(t, e) {
    const n = this._listeners;
    return n === void 0 ? false : n[t] !== void 0 && n[t].indexOf(e) !== -1;
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
      for (let r = 0, o = i.length; r < o; r++) i[r].call(this, t);
      t.target = null;
    }
  }
}
const Te = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let dl = 1234567;
const Is = Math.PI / 180, Ns = 180 / Math.PI;
function Fn() {
  const s = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (Te[s & 255] + Te[s >> 8 & 255] + Te[s >> 16 & 255] + Te[s >> 24 & 255] + "-" + Te[t & 255] + Te[t >> 8 & 255] + "-" + Te[t >> 16 & 15 | 64] + Te[t >> 24 & 255] + "-" + Te[e & 63 | 128] + Te[e >> 8 & 255] + "-" + Te[e >> 16 & 255] + Te[e >> 24 & 255] + Te[n & 255] + Te[n >> 8 & 255] + Te[n >> 16 & 255] + Te[n >> 24 & 255]).toLowerCase();
}
function Ot(s, t, e) {
  return Math.max(t, Math.min(e, s));
}
function Va(s, t) {
  return (s % t + t) % t;
}
function bu(s, t, e, n, i) {
  return n + (s - t) * (i - n) / (e - t);
}
function wu(s, t, e) {
  return s !== t ? (e - s) / (t - s) : 0;
}
function Us(s, t, e) {
  return (1 - e) * s + e * t;
}
function Tu(s, t, e, n) {
  return Us(s, t, 1 - Math.exp(-e * n));
}
function Au(s, t = 1) {
  return t - Math.abs(Va(s, t * 2) - t);
}
function Cu(s, t, e) {
  return s <= t ? 0 : s >= e ? 1 : (s = (s - t) / (e - t), s * s * (3 - 2 * s));
}
function Ru(s, t, e) {
  return s <= t ? 0 : s >= e ? 1 : (s = (s - t) / (e - t), s * s * s * (s * (s * 6 - 15) + 10));
}
function Pu(s, t) {
  return s + Math.floor(Math.random() * (t - s + 1));
}
function Lu(s, t) {
  return s + Math.random() * (t - s);
}
function Du(s) {
  return s * (0.5 - Math.random());
}
function Iu(s) {
  s !== void 0 && (dl = s);
  let t = dl += 1831565813;
  return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function Uu(s) {
  return s * Is;
}
function Fu(s) {
  return s * Ns;
}
function Nu(s) {
  return (s & s - 1) === 0 && s !== 0;
}
function Ou(s) {
  return Math.pow(2, Math.ceil(Math.log(s) / Math.LN2));
}
function Bu(s) {
  return Math.pow(2, Math.floor(Math.log(s) / Math.LN2));
}
function zu(s, t, e, n, i) {
  const r = Math.cos, o = Math.sin, a = r(e / 2), l = o(e / 2), c = r((t + n) / 2), h = o((t + n) / 2), u = r((t - n) / 2), d = o((t - n) / 2), f = r((n - t) / 2), g = o((n - t) / 2);
  switch (i) {
    case "XYX":
      s.set(a * h, l * u, l * d, a * c);
      break;
    case "YZY":
      s.set(l * d, a * h, l * u, a * c);
      break;
    case "ZXZ":
      s.set(l * u, l * d, a * h, a * c);
      break;
    case "XZX":
      s.set(a * h, l * g, l * f, a * c);
      break;
    case "YXY":
      s.set(l * f, a * h, l * g, a * c);
      break;
    case "ZYZ":
      s.set(l * g, l * f, a * h, a * c);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + i);
  }
}
function ln(s, t) {
  switch (t.constructor) {
    case Float32Array:
      return s;
    case Uint32Array:
      return s / 4294967295;
    case Uint16Array:
      return s / 65535;
    case Uint8Array:
      return s / 255;
    case Int32Array:
      return Math.max(s / 2147483647, -1);
    case Int16Array:
      return Math.max(s / 32767, -1);
    case Int8Array:
      return Math.max(s / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function te(s, t) {
  switch (t.constructor) {
    case Float32Array:
      return s;
    case Uint32Array:
      return Math.round(s * 4294967295);
    case Uint16Array:
      return Math.round(s * 65535);
    case Uint8Array:
      return Math.round(s * 255);
    case Int32Array:
      return Math.round(s * 2147483647);
    case Int16Array:
      return Math.round(s * 32767);
    case Int8Array:
      return Math.round(s * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
const qe = { DEG2RAD: Is, RAD2DEG: Ns, generateUUID: Fn, clamp: Ot, euclideanModulo: Va, mapLinear: bu, inverseLerp: wu, lerp: Us, damp: Tu, pingpong: Au, smoothstep: Cu, smootherstep: Ru, randInt: Pu, randFloat: Lu, randFloatSpread: Du, seededRandom: Iu, degToRad: Uu, radToDeg: Fu, isPowerOfTwo: Nu, ceilPowerOfTwo: Ou, floorPowerOfTwo: Bu, setQuaternionFromProperEuler: zu, normalize: te, denormalize: ln };
class Mt {
  constructor(t = 0, e = 0) {
    Mt.prototype.isVector2 = true, this.x = t, this.y = e;
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
    switch (t) {
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
    switch (t) {
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
    return this.x = Ot(this.x, t.x, e.x), this.y = Ot(this.y, t.y, e.y), this;
  }
  clampScalar(t, e) {
    return this.x = Ot(this.x, t, e), this.y = Ot(this.y, t, e), this;
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ot(n, t, e));
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
    return Math.acos(Ot(n, -1, 1));
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
    const n = Math.cos(e), i = Math.sin(e), r = this.x - t.x, o = this.y - t.y;
    return this.x = r * n - o * i + t.x, this.y = r * i + o * n + t.y, this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
}
class Dt {
  constructor(t, e, n, i, r, o, a, l, c) {
    Dt.prototype.isMatrix3 = true, this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1], t !== void 0 && this.set(t, e, n, i, r, o, a, l, c);
  }
  set(t, e, n, i, r, o, a, l, c) {
    const h = this.elements;
    return h[0] = t, h[1] = i, h[2] = a, h[3] = e, h[4] = r, h[5] = l, h[6] = n, h[7] = o, h[8] = c, this;
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
    const n = t.elements, i = e.elements, r = this.elements, o = n[0], a = n[3], l = n[6], c = n[1], h = n[4], u = n[7], d = n[2], f = n[5], g = n[8], _ = i[0], m = i[3], p = i[6], T = i[1], w = i[4], S = i[7], U = i[2], C = i[5], R = i[8];
    return r[0] = o * _ + a * T + l * U, r[3] = o * m + a * w + l * C, r[6] = o * p + a * S + l * R, r[1] = c * _ + h * T + u * U, r[4] = c * m + h * w + u * C, r[7] = c * p + h * S + u * R, r[2] = d * _ + f * T + g * U, r[5] = d * m + f * w + g * C, r[8] = d * p + f * S + g * R, this;
  }
  multiplyScalar(t) {
    const e = this.elements;
    return e[0] *= t, e[3] *= t, e[6] *= t, e[1] *= t, e[4] *= t, e[7] *= t, e[2] *= t, e[5] *= t, e[8] *= t, this;
  }
  determinant() {
    const t = this.elements, e = t[0], n = t[1], i = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8];
    return e * o * h - e * a * c - n * r * h + n * a * l + i * r * c - i * o * l;
  }
  invert() {
    const t = this.elements, e = t[0], n = t[1], i = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8], u = h * o - a * c, d = a * l - h * r, f = c * r - o * l, g = e * u + n * d + i * f;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const _ = 1 / g;
    return t[0] = u * _, t[1] = (i * c - h * n) * _, t[2] = (a * n - i * o) * _, t[3] = d * _, t[4] = (h * e - i * l) * _, t[5] = (i * r - a * e) * _, t[6] = f * _, t[7] = (n * l - c * e) * _, t[8] = (o * e - n * r) * _, this;
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
  setUvTransform(t, e, n, i, r, o, a) {
    const l = Math.cos(r), c = Math.sin(r);
    return this.set(n * l, n * c, -n * (l * o + c * a) + o + t, -i * c, i * l, -i * (-c * o + l * a) + a + e, 0, 0, 1), this;
  }
  scale(t, e) {
    return this.premultiply(Jr.makeScale(t, e)), this;
  }
  rotate(t) {
    return this.premultiply(Jr.makeRotation(-t)), this;
  }
  translate(t, e) {
    return this.premultiply(Jr.makeTranslation(t, e)), this;
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
    for (let i = 0; i < 9; i++) if (e[i] !== n[i]) return false;
    return true;
  }
  fromArray(t, e = 0) {
    for (let n = 0; n < 9; n++) this.elements[n] = t[n + e];
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
const Jr = new Dt();
function Zc(s) {
  for (let t = s.length - 1; t >= 0; --t) if (s[t] >= 65535) return true;
  return false;
}
function kr(s) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", s);
}
function ku() {
  const s = kr("canvas");
  return s.style.display = "block", s;
}
const fl = {};
function fi(s) {
  s in fl || (fl[s] = true, console.warn(s));
}
function Hu(s, t, e) {
  return new Promise(function(n, i) {
    function r() {
      switch (s.clientWaitSync(t, s.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case s.WAIT_FAILED:
          i();
          break;
        case s.TIMEOUT_EXPIRED:
          setTimeout(r, e);
          break;
        default:
          n();
      }
    }
    setTimeout(r, e);
  });
}
function Vu(s) {
  const t = s.elements;
  t[2] = 0.5 * t[2] + 0.5 * t[3], t[6] = 0.5 * t[6] + 0.5 * t[7], t[10] = 0.5 * t[10] + 0.5 * t[11], t[14] = 0.5 * t[14] + 0.5 * t[15];
}
function Gu(s) {
  const t = s.elements;
  t[11] === -1 ? (t[10] = -t[10] - 1, t[14] = -t[14]) : (t[10] = -t[10], t[14] = -t[14] + 1);
}
const pl = new Dt().set(0.4123908, 0.3575843, 0.1804808, 0.212639, 0.7151687, 0.0721923, 0.0193308, 0.1191948, 0.9505322), ml = new Dt().set(3.2409699, -1.5373832, -0.4986108, -0.9692436, 1.8759675, 0.0415551, 0.0556301, -0.203977, 1.0569715);
function Wu() {
  const s = { enabled: true, workingColorSpace: cs, spaces: {}, convert: function(i, r, o) {
    return this.enabled === false || r === o || !r || !o || (this.spaces[r].transfer === ee && (i.r = Nn(i.r), i.g = Nn(i.g), i.b = Nn(i.b)), this.spaces[r].primaries !== this.spaces[o].primaries && (i.applyMatrix3(this.spaces[r].toXYZ), i.applyMatrix3(this.spaces[o].fromXYZ)), this.spaces[o].transfer === ee && (i.r = is(i.r), i.g = is(i.g), i.b = is(i.b))), i;
  }, fromWorkingColorSpace: function(i, r) {
    return this.convert(i, this.workingColorSpace, r);
  }, toWorkingColorSpace: function(i, r) {
    return this.convert(i, r, this.workingColorSpace);
  }, getPrimaries: function(i) {
    return this.spaces[i].primaries;
  }, getTransfer: function(i) {
    return i === $n ? Br : this.spaces[i].transfer;
  }, getLuminanceCoefficients: function(i, r = this.workingColorSpace) {
    return i.fromArray(this.spaces[r].luminanceCoefficients);
  }, define: function(i) {
    Object.assign(this.spaces, i);
  }, _getMatrix: function(i, r, o) {
    return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ);
  }, _getDrawingBufferColorSpace: function(i) {
    return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace;
  }, _getUnpackColorSpace: function(i = this.workingColorSpace) {
    return this.spaces[i].workingColorSpaceConfig.unpackColorSpace;
  } }, t = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06], e = [0.2126, 0.7152, 0.0722], n = [0.3127, 0.329];
  return s.define({ [cs]: { primaries: t, whitePoint: n, transfer: Br, toXYZ: pl, fromXYZ: ml, luminanceCoefficients: e, workingColorSpaceConfig: { unpackColorSpace: De }, outputColorSpaceConfig: { drawingBufferColorSpace: De } }, [De]: { primaries: t, whitePoint: n, transfer: ee, toXYZ: pl, fromXYZ: ml, luminanceCoefficients: e, outputColorSpaceConfig: { drawingBufferColorSpace: De } } }), s;
}
const $t = Wu();
function Nn(s) {
  return s < 0.04045 ? s * 0.0773993808 : Math.pow(s * 0.9478672986 + 0.0521327014, 2.4);
}
function is(s) {
  return s < 31308e-7 ? s * 12.92 : 1.055 * Math.pow(s, 0.41666) - 0.055;
}
let Pi;
class Xu {
  static getDataURL(t) {
    if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u") return t.src;
    let e;
    if (t instanceof HTMLCanvasElement) e = t;
    else {
      Pi === void 0 && (Pi = kr("canvas")), Pi.width = t.width, Pi.height = t.height;
      const n = Pi.getContext("2d");
      t instanceof ImageData ? n.putImageData(t, 0, 0) : n.drawImage(t, 0, 0, t.width, t.height), e = Pi;
    }
    return e.toDataURL("image/png");
  }
  static sRGBToLinear(t) {
    if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
      const e = kr("canvas");
      e.width = t.width, e.height = t.height;
      const n = e.getContext("2d");
      n.drawImage(t, 0, 0, t.width, t.height);
      const i = n.getImageData(0, 0, t.width, t.height), r = i.data;
      for (let o = 0; o < r.length; o++) r[o] = Nn(r[o] / 255) * 255;
      return n.putImageData(i, 0, 0), e;
    } else if (t.data) {
      const e = t.data.slice(0);
      for (let n = 0; n < e.length; n++) e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(Nn(e[n] / 255) * 255) : e[n] = Nn(e[n]);
      return { data: e, width: t.width, height: t.height };
    } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
  }
}
let Yu = 0;
class Ga {
  constructor(t = null) {
    this.isSource = true, Object.defineProperty(this, "id", { value: Yu++ }), this.uuid = Fn(), this.data = t, this.dataReady = true, this.version = 0;
  }
  set needsUpdate(t) {
    t === true && this.version++;
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    if (!e && t.images[this.uuid] !== void 0) return t.images[this.uuid];
    const n = { uuid: this.uuid, url: "" }, i = this.data;
    if (i !== null) {
      let r;
      if (Array.isArray(i)) {
        r = [];
        for (let o = 0, a = i.length; o < a; o++) i[o].isDataTexture ? r.push(Qr(i[o].image)) : r.push(Qr(i[o]));
      } else r = Qr(i);
      n.url = r;
    }
    return e || (t.images[this.uuid] = n), n;
  }
}
function Qr(s) {
  return typeof HTMLImageElement < "u" && s instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && s instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && s instanceof ImageBitmap ? Xu.getDataURL(s) : s.data ? { data: Array.from(s.data), width: s.width, height: s.height, type: s.data.constructor.name } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let qu = 0;
class Ie extends bi {
  constructor(t = Ie.DEFAULT_IMAGE, e = Ie.DEFAULT_MAPPING, n = vi, i = vi, r = xn, o = xi, a = cn, l = On, c = Ie.DEFAULT_ANISOTROPY, h = $n) {
    super(), this.isTexture = true, Object.defineProperty(this, "id", { value: qu++ }), this.uuid = Fn(), this.name = "", this.source = new Ga(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = i, this.magFilter = r, this.minFilter = o, this.anisotropy = c, this.format = a, this.internalFormat = null, this.type = l, this.offset = new Mt(0, 0), this.repeat = new Mt(1, 1), this.center = new Mt(0, 0), this.rotation = 0, this.matrixAutoUpdate = true, this.matrix = new Dt(), this.generateMipmaps = true, this.premultiplyAlpha = false, this.flipY = true, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = false, this.pmremVersion = 0;
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
    return this.name = t.name, this.source = t.source, this.mipmaps = t.mipmaps.slice(0), this.mapping = t.mapping, this.channel = t.channel, this.wrapS = t.wrapS, this.wrapT = t.wrapT, this.magFilter = t.magFilter, this.minFilter = t.minFilter, this.anisotropy = t.anisotropy, this.format = t.format, this.internalFormat = t.internalFormat, this.type = t.type, this.offset.copy(t.offset), this.repeat.copy(t.repeat), this.center.copy(t.center), this.rotation = t.rotation, this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrix.copy(t.matrix), this.generateMipmaps = t.generateMipmaps, this.premultiplyAlpha = t.premultiplyAlpha, this.flipY = t.flipY, this.unpackAlignment = t.unpackAlignment, this.colorSpace = t.colorSpace, this.renderTarget = t.renderTarget, this.isRenderTargetTexture = t.isRenderTargetTexture, this.userData = JSON.parse(JSON.stringify(t.userData)), this.needsUpdate = true, this;
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    if (!e && t.textures[this.uuid] !== void 0) return t.textures[this.uuid];
    const n = { metadata: { version: 4.6, type: "Texture", generator: "Texture.toJSON" }, uuid: this.uuid, name: this.name, image: this.source.toJSON(t).uuid, mapping: this.mapping, channel: this.channel, repeat: [this.repeat.x, this.repeat.y], offset: [this.offset.x, this.offset.y], center: [this.center.x, this.center.y], rotation: this.rotation, wrap: [this.wrapS, this.wrapT], format: this.format, internalFormat: this.internalFormat, type: this.type, colorSpace: this.colorSpace, minFilter: this.minFilter, magFilter: this.magFilter, anisotropy: this.anisotropy, flipY: this.flipY, generateMipmaps: this.generateMipmaps, premultiplyAlpha: this.premultiplyAlpha, unpackAlignment: this.unpackAlignment };
    return Object.keys(this.userData).length > 0 && (n.userData = this.userData), e || (t.textures[this.uuid] = n), n;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(t) {
    if (this.mapping !== Bc) return t;
    if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1) switch (this.wrapS) {
      case ea:
        t.x = t.x - Math.floor(t.x);
        break;
      case vi:
        t.x = t.x < 0 ? 0 : 1;
        break;
      case na:
        Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
        break;
    }
    if (t.y < 0 || t.y > 1) switch (this.wrapT) {
      case ea:
        t.y = t.y - Math.floor(t.y);
        break;
      case vi:
        t.y = t.y < 0 ? 0 : 1;
        break;
      case na:
        Math.abs(Math.floor(t.y) % 2) === 1 ? t.y = Math.ceil(t.y) - t.y : t.y = t.y - Math.floor(t.y);
        break;
    }
    return this.flipY && (t.y = 1 - t.y), t;
  }
  set needsUpdate(t) {
    t === true && (this.version++, this.source.needsUpdate = true);
  }
  set needsPMREMUpdate(t) {
    t === true && this.pmremVersion++;
  }
}
Ie.DEFAULT_IMAGE = null;
Ie.DEFAULT_MAPPING = Bc;
Ie.DEFAULT_ANISOTROPY = 1;
class re {
  constructor(t = 0, e = 0, n = 0, i = 1) {
    re.prototype.isVector4 = true, this.x = t, this.y = e, this.z = n, this.w = i;
  }
  get width() {
    return this.z;
  }
  set width(t) {
    this.z = t;
  }
  get height() {
    return this.w;
  }
  set height(t) {
    this.w = t;
  }
  set(t, e, n, i) {
    return this.x = t, this.y = e, this.z = n, this.w = i, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this.w = t, this;
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
  setW(t) {
    return this.w = t, this;
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      case 3:
        this.w = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this.w = t.w !== void 0 ? t.w : 1, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this.w += t.w, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this.w += t, this;
  }
  addVectors(t, e) {
    return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this.w = t.w + e.w, this;
  }
  addScaledVector(t, e) {
    return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this.w += t.w * e, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this.w -= t.w, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this.w -= t, this;
  }
  subVectors(t, e) {
    return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this.w = t.w - e.w, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this.w *= t.w, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this.w *= t, this;
  }
  applyMatrix4(t) {
    const e = this.x, n = this.y, i = this.z, r = this.w, o = t.elements;
    return this.x = o[0] * e + o[4] * n + o[8] * i + o[12] * r, this.y = o[1] * e + o[5] * n + o[9] * i + o[13] * r, this.z = o[2] * e + o[6] * n + o[10] * i + o[14] * r, this.w = o[3] * e + o[7] * n + o[11] * i + o[15] * r, this;
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this.z /= t.z, this.w /= t.w, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  setAxisAngleFromQuaternion(t) {
    this.w = 2 * Math.acos(t.w);
    const e = Math.sqrt(1 - t.w * t.w);
    return e < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = t.x / e, this.y = t.y / e, this.z = t.z / e), this;
  }
  setAxisAngleFromRotationMatrix(t) {
    let e, n, i, r;
    const l = t.elements, c = l[0], h = l[4], u = l[8], d = l[1], f = l[5], g = l[9], _ = l[2], m = l[6], p = l[10];
    if (Math.abs(h - d) < 0.01 && Math.abs(u - _) < 0.01 && Math.abs(g - m) < 0.01) {
      if (Math.abs(h + d) < 0.1 && Math.abs(u + _) < 0.1 && Math.abs(g + m) < 0.1 && Math.abs(c + f + p - 3) < 0.1) return this.set(1, 0, 0, 0), this;
      e = Math.PI;
      const w = (c + 1) / 2, S = (f + 1) / 2, U = (p + 1) / 2, C = (h + d) / 4, R = (u + _) / 4, F = (g + m) / 4;
      return w > S && w > U ? w < 0.01 ? (n = 0, i = 0.707106781, r = 0.707106781) : (n = Math.sqrt(w), i = C / n, r = R / n) : S > U ? S < 0.01 ? (n = 0.707106781, i = 0, r = 0.707106781) : (i = Math.sqrt(S), n = C / i, r = F / i) : U < 0.01 ? (n = 0.707106781, i = 0.707106781, r = 0) : (r = Math.sqrt(U), n = R / r, i = F / r), this.set(n, i, r, e), this;
    }
    let T = Math.sqrt((m - g) * (m - g) + (u - _) * (u - _) + (d - h) * (d - h));
    return Math.abs(T) < 1e-3 && (T = 1), this.x = (m - g) / T, this.y = (u - _) / T, this.z = (d - h) / T, this.w = Math.acos((c + f + p - 1) / 2), this;
  }
  setFromMatrixPosition(t) {
    const e = t.elements;
    return this.x = e[12], this.y = e[13], this.z = e[14], this.w = e[15], this;
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this.w = Math.min(this.w, t.w), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this.w = Math.max(this.w, t.w), this;
  }
  clamp(t, e) {
    return this.x = Ot(this.x, t.x, e.x), this.y = Ot(this.y, t.y, e.y), this.z = Ot(this.z, t.z, e.z), this.w = Ot(this.w, t.w, e.w), this;
  }
  clampScalar(t, e) {
    return this.x = Ot(this.x, t, e), this.y = Ot(this.y, t, e), this.z = Ot(this.z, t, e), this.w = Ot(this.w, t, e), this;
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ot(n, t, e));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this.w += (t.w - this.w) * e, this;
  }
  lerpVectors(t, e, n) {
    return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this.z = t.z + (e.z - t.z) * n, this.w = t.w + (e.w - t.w) * n, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w;
  }
  fromArray(t, e = 0) {
    return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this.w = t[e + 3], this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t[e + 3] = this.w, t;
  }
  fromBufferAttribute(t, e) {
    return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this.w = t.getW(e), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
}
class $u extends bi {
  constructor(t = 1, e = 1, n = {}) {
    super(), this.isRenderTarget = true, this.width = t, this.height = e, this.depth = 1, this.scissor = new re(0, 0, t, e), this.scissorTest = false, this.viewport = new re(0, 0, t, e);
    const i = { width: t, height: e, depth: 1 };
    n = Object.assign({ generateMipmaps: false, internalFormat: null, minFilter: xn, depthBuffer: true, stencilBuffer: false, resolveDepthBuffer: true, resolveStencilBuffer: true, depthTexture: null, samples: 0, count: 1 }, n);
    const r = new Ie(i, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
    r.flipY = false, r.generateMipmaps = n.generateMipmaps, r.internalFormat = n.internalFormat, this.textures = [];
    const o = n.count;
    for (let a = 0; a < o; a++) this.textures[a] = r.clone(), this.textures[a].isRenderTargetTexture = true, this.textures[a].renderTarget = this;
    this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples;
  }
  get texture() {
    return this.textures[0];
  }
  set texture(t) {
    this.textures[0] = t;
  }
  set depthTexture(t) {
    this._depthTexture !== null && (this._depthTexture.renderTarget = null), t !== null && (t.renderTarget = this), this._depthTexture = t;
  }
  get depthTexture() {
    return this._depthTexture;
  }
  setSize(t, e, n = 1) {
    if (this.width !== t || this.height !== e || this.depth !== n) {
      this.width = t, this.height = e, this.depth = n;
      for (let i = 0, r = this.textures.length; i < r; i++) this.textures[i].image.width = t, this.textures[i].image.height = e, this.textures[i].image.depth = n;
      this.dispose();
    }
    this.viewport.set(0, 0, t, e), this.scissor.set(0, 0, t, e);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    this.width = t.width, this.height = t.height, this.depth = t.depth, this.scissor.copy(t.scissor), this.scissorTest = t.scissorTest, this.viewport.copy(t.viewport), this.textures.length = 0;
    for (let e = 0, n = t.textures.length; e < n; e++) {
      this.textures[e] = t.textures[e].clone(), this.textures[e].isRenderTargetTexture = true, this.textures[e].renderTarget = this;
      const i = Object.assign({}, t.textures[e].image);
      this.textures[e].source = new Ga(i);
    }
    return this.depthBuffer = t.depthBuffer, this.stencilBuffer = t.stencilBuffer, this.resolveDepthBuffer = t.resolveDepthBuffer, this.resolveStencilBuffer = t.resolveStencilBuffer, t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()), this.samples = t.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class Mi extends $u {
  constructor(t = 1, e = 1, n = {}) {
    super(t, e, n), this.isWebGLRenderTarget = true;
  }
}
class Kc extends Ie {
  constructor(t = null, e = 1, n = 1, i = 1) {
    super(null), this.isDataArrayTexture = true, this.image = { data: t, width: e, height: n, depth: i }, this.magFilter = un, this.minFilter = un, this.wrapR = vi, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(t) {
    this.layerUpdates.add(t);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class ju extends Ie {
  constructor(t = null, e = 1, n = 1, i = 1) {
    super(null), this.isData3DTexture = true, this.image = { data: t, width: e, height: n, depth: i }, this.magFilter = un, this.minFilter = un, this.wrapR = vi, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1;
  }
}
class Bn {
  constructor(t = 0, e = 0, n = 0, i = 1) {
    this.isQuaternion = true, this._x = t, this._y = e, this._z = n, this._w = i;
  }
  static slerpFlat(t, e, n, i, r, o, a) {
    let l = n[i + 0], c = n[i + 1], h = n[i + 2], u = n[i + 3];
    const d = r[o + 0], f = r[o + 1], g = r[o + 2], _ = r[o + 3];
    if (a === 0) {
      t[e + 0] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = u;
      return;
    }
    if (a === 1) {
      t[e + 0] = d, t[e + 1] = f, t[e + 2] = g, t[e + 3] = _;
      return;
    }
    if (u !== _ || l !== d || c !== f || h !== g) {
      let m = 1 - a;
      const p = l * d + c * f + h * g + u * _, T = p >= 0 ? 1 : -1, w = 1 - p * p;
      if (w > Number.EPSILON) {
        const U = Math.sqrt(w), C = Math.atan2(U, p * T);
        m = Math.sin(m * C) / U, a = Math.sin(a * C) / U;
      }
      const S = a * T;
      if (l = l * m + d * S, c = c * m + f * S, h = h * m + g * S, u = u * m + _ * S, m === 1 - a) {
        const U = 1 / Math.sqrt(l * l + c * c + h * h + u * u);
        l *= U, c *= U, h *= U, u *= U;
      }
    }
    t[e] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = u;
  }
  static multiplyQuaternionsFlat(t, e, n, i, r, o) {
    const a = n[i], l = n[i + 1], c = n[i + 2], h = n[i + 3], u = r[o], d = r[o + 1], f = r[o + 2], g = r[o + 3];
    return t[e] = a * g + h * u + l * f - c * d, t[e + 1] = l * g + h * d + c * u - a * f, t[e + 2] = c * g + h * f + a * d - l * u, t[e + 3] = h * g - a * u - l * d - c * f, t;
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
  setFromEuler(t, e = true) {
    const n = t._x, i = t._y, r = t._z, o = t._order, a = Math.cos, l = Math.sin, c = a(n / 2), h = a(i / 2), u = a(r / 2), d = l(n / 2), f = l(i / 2), g = l(r / 2);
    switch (o) {
      case "XYZ":
        this._x = d * h * u + c * f * g, this._y = c * f * u - d * h * g, this._z = c * h * g + d * f * u, this._w = c * h * u - d * f * g;
        break;
      case "YXZ":
        this._x = d * h * u + c * f * g, this._y = c * f * u - d * h * g, this._z = c * h * g - d * f * u, this._w = c * h * u + d * f * g;
        break;
      case "ZXY":
        this._x = d * h * u - c * f * g, this._y = c * f * u + d * h * g, this._z = c * h * g + d * f * u, this._w = c * h * u - d * f * g;
        break;
      case "ZYX":
        this._x = d * h * u - c * f * g, this._y = c * f * u + d * h * g, this._z = c * h * g - d * f * u, this._w = c * h * u + d * f * g;
        break;
      case "YZX":
        this._x = d * h * u + c * f * g, this._y = c * f * u + d * h * g, this._z = c * h * g - d * f * u, this._w = c * h * u - d * f * g;
        break;
      case "XZY":
        this._x = d * h * u - c * f * g, this._y = c * f * u - d * h * g, this._z = c * h * g + d * f * u, this._w = c * h * u + d * f * g;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + o);
    }
    return e === true && this._onChangeCallback(), this;
  }
  setFromAxisAngle(t, e) {
    const n = e / 2, i = Math.sin(n);
    return this._x = t.x * i, this._y = t.y * i, this._z = t.z * i, this._w = Math.cos(n), this._onChangeCallback(), this;
  }
  setFromRotationMatrix(t) {
    const e = t.elements, n = e[0], i = e[4], r = e[8], o = e[1], a = e[5], l = e[9], c = e[2], h = e[6], u = e[10], d = n + a + u;
    if (d > 0) {
      const f = 0.5 / Math.sqrt(d + 1);
      this._w = 0.25 / f, this._x = (h - l) * f, this._y = (r - c) * f, this._z = (o - i) * f;
    } else if (n > a && n > u) {
      const f = 2 * Math.sqrt(1 + n - a - u);
      this._w = (h - l) / f, this._x = 0.25 * f, this._y = (i + o) / f, this._z = (r + c) / f;
    } else if (a > u) {
      const f = 2 * Math.sqrt(1 + a - n - u);
      this._w = (r - c) / f, this._x = (i + o) / f, this._y = 0.25 * f, this._z = (l + h) / f;
    } else {
      const f = 2 * Math.sqrt(1 + u - n - a);
      this._w = (o - i) / f, this._x = (r + c) / f, this._y = (l + h) / f, this._z = 0.25 * f;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(t, e) {
    let n = t.dot(e) + 1;
    return n < Number.EPSILON ? (n = 0, Math.abs(t.x) > Math.abs(t.z) ? (this._x = -t.y, this._y = t.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -t.z, this._z = t.y, this._w = n)) : (this._x = t.y * e.z - t.z * e.y, this._y = t.z * e.x - t.x * e.z, this._z = t.x * e.y - t.y * e.x, this._w = n), this.normalize();
  }
  angleTo(t) {
    return 2 * Math.acos(Math.abs(Ot(this.dot(t), -1, 1)));
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
    const n = t._x, i = t._y, r = t._z, o = t._w, a = e._x, l = e._y, c = e._z, h = e._w;
    return this._x = n * h + o * a + i * c - r * l, this._y = i * h + o * l + r * a - n * c, this._z = r * h + o * c + n * l - i * a, this._w = o * h - n * a - i * l - r * c, this._onChangeCallback(), this;
  }
  slerp(t, e) {
    if (e === 0) return this;
    if (e === 1) return this.copy(t);
    const n = this._x, i = this._y, r = this._z, o = this._w;
    let a = o * t._w + n * t._x + i * t._y + r * t._z;
    if (a < 0 ? (this._w = -t._w, this._x = -t._x, this._y = -t._y, this._z = -t._z, a = -a) : this.copy(t), a >= 1) return this._w = o, this._x = n, this._y = i, this._z = r, this;
    const l = 1 - a * a;
    if (l <= Number.EPSILON) {
      const f = 1 - e;
      return this._w = f * o + e * this._w, this._x = f * n + e * this._x, this._y = f * i + e * this._y, this._z = f * r + e * this._z, this.normalize(), this;
    }
    const c = Math.sqrt(l), h = Math.atan2(c, a), u = Math.sin((1 - e) * h) / c, d = Math.sin(e * h) / c;
    return this._w = o * u + this._w * d, this._x = n * u + this._x * d, this._y = i * u + this._y * d, this._z = r * u + this._z * d, this._onChangeCallback(), this;
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
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}
class b {
  constructor(t = 0, e = 0, n = 0) {
    b.prototype.isVector3 = true, this.x = t, this.y = e, this.z = n;
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
    switch (t) {
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
    switch (t) {
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
    return this.applyQuaternion(gl.setFromEuler(t));
  }
  applyAxisAngle(t, e) {
    return this.applyQuaternion(gl.setFromAxisAngle(t, e));
  }
  applyMatrix3(t) {
    const e = this.x, n = this.y, i = this.z, r = t.elements;
    return this.x = r[0] * e + r[3] * n + r[6] * i, this.y = r[1] * e + r[4] * n + r[7] * i, this.z = r[2] * e + r[5] * n + r[8] * i, this;
  }
  applyNormalMatrix(t) {
    return this.applyMatrix3(t).normalize();
  }
  applyMatrix4(t) {
    const e = this.x, n = this.y, i = this.z, r = t.elements, o = 1 / (r[3] * e + r[7] * n + r[11] * i + r[15]);
    return this.x = (r[0] * e + r[4] * n + r[8] * i + r[12]) * o, this.y = (r[1] * e + r[5] * n + r[9] * i + r[13]) * o, this.z = (r[2] * e + r[6] * n + r[10] * i + r[14]) * o, this;
  }
  applyQuaternion(t) {
    const e = this.x, n = this.y, i = this.z, r = t.x, o = t.y, a = t.z, l = t.w, c = 2 * (o * i - a * n), h = 2 * (a * e - r * i), u = 2 * (r * n - o * e);
    return this.x = e + l * c + o * u - a * h, this.y = n + l * h + a * c - r * u, this.z = i + l * u + r * h - o * c, this;
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
    return this.x = Ot(this.x, t.x, e.x), this.y = Ot(this.y, t.y, e.y), this.z = Ot(this.z, t.z, e.z), this;
  }
  clampScalar(t, e) {
    return this.x = Ot(this.x, t, e), this.y = Ot(this.y, t, e), this.z = Ot(this.z, t, e), this;
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ot(n, t, e));
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
    const n = t.x, i = t.y, r = t.z, o = e.x, a = e.y, l = e.z;
    return this.x = i * l - r * a, this.y = r * o - n * l, this.z = n * a - i * o, this;
  }
  projectOnVector(t) {
    const e = t.lengthSq();
    if (e === 0) return this.set(0, 0, 0);
    const n = t.dot(this) / e;
    return this.copy(t).multiplyScalar(n);
  }
  projectOnPlane(t) {
    return to.copy(this).projectOnVector(t), this.sub(to);
  }
  reflect(t) {
    return this.sub(to.copy(t).multiplyScalar(2 * this.dot(t)));
  }
  angleTo(t) {
    const e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0) return Math.PI / 2;
    const n = this.dot(t) / e;
    return Math.acos(Ot(n, -1, 1));
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
const to = new b(), gl = new Bn();
class ke {
  constructor(t = new b(1 / 0, 1 / 0, 1 / 0), e = new b(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = true, this.min = t, this.max = e;
  }
  set(t, e) {
    return this.min.copy(t), this.max.copy(e), this;
  }
  setFromArray(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e += 3) this.expandByPoint(sn.fromArray(t, e));
    return this;
  }
  setFromBufferAttribute(t) {
    this.makeEmpty();
    for (let e = 0, n = t.count; e < n; e++) this.expandByPoint(sn.fromBufferAttribute(t, e));
    return this;
  }
  setFromPoints(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e++) this.expandByPoint(t[e]);
    return this;
  }
  setFromCenterAndSize(t, e) {
    const n = sn.copy(e).multiplyScalar(0.5);
    return this.min.copy(t).sub(n), this.max.copy(t).add(n), this;
  }
  setFromObject(t, e = false) {
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
    return this.isEmpty() ? t.set(0, 0, 0) : t.addVectors(this.min, this.max).multiplyScalar(0.5);
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
  expandByObject(t, e = false) {
    t.updateWorldMatrix(false, false);
    const n = t.geometry;
    if (n !== void 0) {
      const r = n.getAttribute("position");
      if (e === true && r !== void 0 && t.isInstancedMesh !== true) for (let o = 0, a = r.count; o < a; o++) t.isMesh === true ? t.getVertexPosition(o, sn) : sn.fromBufferAttribute(r, o), sn.applyMatrix4(t.matrixWorld), this.expandByPoint(sn);
      else t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), Gs.copy(t.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Gs.copy(n.boundingBox)), Gs.applyMatrix4(t.matrixWorld), this.union(Gs);
    }
    const i = t.children;
    for (let r = 0, o = i.length; r < o; r++) this.expandByObject(i[r], e);
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
    return this.clampPoint(t.center, sn), sn.distanceToSquared(t.center) <= t.radius * t.radius;
  }
  intersectsPlane(t) {
    let e, n;
    return t.normal.x > 0 ? (e = t.normal.x * this.min.x, n = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, n = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, n += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, n += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, n += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, n += t.normal.z * this.min.z), e <= -t.constant && n >= -t.constant;
  }
  intersectsTriangle(t) {
    if (this.isEmpty()) return false;
    this.getCenter(_s), Ws.subVectors(this.max, _s), Li.subVectors(t.a, _s), Di.subVectors(t.b, _s), Ii.subVectors(t.c, _s), Hn.subVectors(Di, Li), Vn.subVectors(Ii, Di), si.subVectors(Li, Ii);
    let e = [0, -Hn.z, Hn.y, 0, -Vn.z, Vn.y, 0, -si.z, si.y, Hn.z, 0, -Hn.x, Vn.z, 0, -Vn.x, si.z, 0, -si.x, -Hn.y, Hn.x, 0, -Vn.y, Vn.x, 0, -si.y, si.x, 0];
    return !eo(e, Li, Di, Ii, Ws) || (e = [1, 0, 0, 0, 1, 0, 0, 0, 1], !eo(e, Li, Di, Ii, Ws)) ? false : (Xs.crossVectors(Hn, Vn), e = [Xs.x, Xs.y, Xs.z], eo(e, Li, Di, Ii, Ws));
  }
  clampPoint(t, e) {
    return e.copy(t).clamp(this.min, this.max);
  }
  distanceToPoint(t) {
    return this.clampPoint(t, sn).distanceTo(t);
  }
  getBoundingSphere(t) {
    return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(sn).length() * 0.5), t;
  }
  intersect(t) {
    return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(t) {
    return this.min.min(t.min), this.max.max(t.max), this;
  }
  applyMatrix4(t) {
    return this.isEmpty() ? this : (En[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), En[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), En[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), En[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), En[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), En[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), En[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), En[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(En), this);
  }
  translate(t) {
    return this.min.add(t), this.max.add(t), this;
  }
  equals(t) {
    return t.min.equals(this.min) && t.max.equals(this.max);
  }
}
const En = [new b(), new b(), new b(), new b(), new b(), new b(), new b(), new b()], sn = new b(), Gs = new ke(), Li = new b(), Di = new b(), Ii = new b(), Hn = new b(), Vn = new b(), si = new b(), _s = new b(), Ws = new b(), Xs = new b(), ri = new b();
function eo(s, t, e, n, i) {
  for (let r = 0, o = s.length - 3; r <= o; r += 3) {
    ri.fromArray(s, r);
    const a = i.x * Math.abs(ri.x) + i.y * Math.abs(ri.y) + i.z * Math.abs(ri.z), l = t.dot(ri), c = e.dot(ri), h = n.dot(ri);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > a) return false;
  }
  return true;
}
const Zu = new ke(), vs = new b(), no = new b();
class hn {
  constructor(t = new b(), e = -1) {
    this.isSphere = true, this.center = t, this.radius = e;
  }
  set(t, e) {
    return this.center.copy(t), this.radius = e, this;
  }
  setFromPoints(t, e) {
    const n = this.center;
    e !== void 0 ? n.copy(e) : Zu.setFromPoints(t).getCenter(n);
    let i = 0;
    for (let r = 0, o = t.length; r < o; r++) i = Math.max(i, n.distanceToSquared(t[r]));
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
    vs.subVectors(t, this.center);
    const e = vs.lengthSq();
    if (e > this.radius * this.radius) {
      const n = Math.sqrt(e), i = (n - this.radius) * 0.5;
      this.center.addScaledVector(vs, i / n), this.radius += i;
    }
    return this;
  }
  union(t) {
    return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === true ? this.radius = Math.max(this.radius, t.radius) : (no.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(vs.copy(t.center).add(no)), this.expandByPoint(vs.copy(t.center).sub(no))), this);
  }
  equals(t) {
    return t.center.equals(this.center) && t.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const bn = new b(), io = new b(), Ys = new b(), Gn = new b(), so = new b(), qs = new b(), ro = new b();
class Bs {
  constructor(t = new b(), e = new b(0, 0, -1)) {
    this.origin = t, this.direction = e;
  }
  set(t, e) {
    return this.origin.copy(t), this.direction.copy(e), this;
  }
  copy(t) {
    return this.origin.copy(t.origin), this.direction.copy(t.direction), this;
  }
  at(t, e) {
    return e.copy(this.origin).addScaledVector(this.direction, t);
  }
  lookAt(t) {
    return this.direction.copy(t).sub(this.origin).normalize(), this;
  }
  recast(t) {
    return this.origin.copy(this.at(t, bn)), this;
  }
  closestPointToPoint(t, e) {
    e.subVectors(t, this.origin);
    const n = e.dot(this.direction);
    return n < 0 ? e.copy(this.origin) : e.copy(this.origin).addScaledVector(this.direction, n);
  }
  distanceToPoint(t) {
    return Math.sqrt(this.distanceSqToPoint(t));
  }
  distanceSqToPoint(t) {
    const e = bn.subVectors(t, this.origin).dot(this.direction);
    return e < 0 ? this.origin.distanceToSquared(t) : (bn.copy(this.origin).addScaledVector(this.direction, e), bn.distanceToSquared(t));
  }
  distanceSqToSegment(t, e, n, i) {
    io.copy(t).add(e).multiplyScalar(0.5), Ys.copy(e).sub(t).normalize(), Gn.copy(this.origin).sub(io);
    const r = t.distanceTo(e) * 0.5, o = -this.direction.dot(Ys), a = Gn.dot(this.direction), l = -Gn.dot(Ys), c = Gn.lengthSq(), h = Math.abs(1 - o * o);
    let u, d, f, g;
    if (h > 0) if (u = o * l - a, d = o * a - l, g = r * h, u >= 0) if (d >= -g) if (d <= g) {
      const _ = 1 / h;
      u *= _, d *= _, f = u * (u + o * d + 2 * a) + d * (o * u + d + 2 * l) + c;
    } else d = r, u = Math.max(0, -(o * d + a)), f = -u * u + d * (d + 2 * l) + c;
    else d = -r, u = Math.max(0, -(o * d + a)), f = -u * u + d * (d + 2 * l) + c;
    else d <= -g ? (u = Math.max(0, -(-o * r + a)), d = u > 0 ? -r : Math.min(Math.max(-r, -l), r), f = -u * u + d * (d + 2 * l) + c) : d <= g ? (u = 0, d = Math.min(Math.max(-r, -l), r), f = d * (d + 2 * l) + c) : (u = Math.max(0, -(o * r + a)), d = u > 0 ? r : Math.min(Math.max(-r, -l), r), f = -u * u + d * (d + 2 * l) + c);
    else d = o > 0 ? -r : r, u = Math.max(0, -(o * d + a)), f = -u * u + d * (d + 2 * l) + c;
    return n && n.copy(this.origin).addScaledVector(this.direction, u), i && i.copy(io).addScaledVector(Ys, d), f;
  }
  intersectSphere(t, e) {
    bn.subVectors(t.center, this.origin);
    const n = bn.dot(this.direction), i = bn.dot(bn) - n * n, r = t.radius * t.radius;
    if (i > r) return null;
    const o = Math.sqrt(r - i), a = n - o, l = n + o;
    return l < 0 ? null : a < 0 ? this.at(l, e) : this.at(a, e);
  }
  intersectsSphere(t) {
    return this.distanceSqToPoint(t.center) <= t.radius * t.radius;
  }
  distanceToPlane(t) {
    const e = t.normal.dot(this.direction);
    if (e === 0) return t.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(t.normal) + t.constant) / e;
    return n >= 0 ? n : null;
  }
  intersectPlane(t, e) {
    const n = this.distanceToPlane(t);
    return n === null ? null : this.at(n, e);
  }
  intersectsPlane(t) {
    const e = t.distanceToPoint(this.origin);
    return e === 0 || t.normal.dot(this.direction) * e < 0;
  }
  intersectBox(t, e) {
    let n, i, r, o, a, l;
    const c = 1 / this.direction.x, h = 1 / this.direction.y, u = 1 / this.direction.z, d = this.origin;
    return c >= 0 ? (n = (t.min.x - d.x) * c, i = (t.max.x - d.x) * c) : (n = (t.max.x - d.x) * c, i = (t.min.x - d.x) * c), h >= 0 ? (r = (t.min.y - d.y) * h, o = (t.max.y - d.y) * h) : (r = (t.max.y - d.y) * h, o = (t.min.y - d.y) * h), n > o || r > i || ((r > n || isNaN(n)) && (n = r), (o < i || isNaN(i)) && (i = o), u >= 0 ? (a = (t.min.z - d.z) * u, l = (t.max.z - d.z) * u) : (a = (t.max.z - d.z) * u, l = (t.min.z - d.z) * u), n > l || a > i) || ((a > n || n !== n) && (n = a), (l < i || i !== i) && (i = l), i < 0) ? null : this.at(n >= 0 ? n : i, e);
  }
  intersectsBox(t) {
    return this.intersectBox(t, bn) !== null;
  }
  intersectTriangle(t, e, n, i, r) {
    so.subVectors(e, t), qs.subVectors(n, t), ro.crossVectors(so, qs);
    let o = this.direction.dot(ro), a;
    if (o > 0) {
      if (i) return null;
      a = 1;
    } else if (o < 0) a = -1, o = -o;
    else return null;
    Gn.subVectors(this.origin, t);
    const l = a * this.direction.dot(qs.crossVectors(Gn, qs));
    if (l < 0) return null;
    const c = a * this.direction.dot(so.cross(Gn));
    if (c < 0 || l + c > o) return null;
    const h = -a * Gn.dot(ro);
    return h < 0 ? null : this.at(h / o, r);
  }
  applyMatrix4(t) {
    return this.origin.applyMatrix4(t), this.direction.transformDirection(t), this;
  }
  equals(t) {
    return t.origin.equals(this.origin) && t.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class Jt {
  constructor(t, e, n, i, r, o, a, l, c, h, u, d, f, g, _, m) {
    Jt.prototype.isMatrix4 = true, this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], t !== void 0 && this.set(t, e, n, i, r, o, a, l, c, h, u, d, f, g, _, m);
  }
  set(t, e, n, i, r, o, a, l, c, h, u, d, f, g, _, m) {
    const p = this.elements;
    return p[0] = t, p[4] = e, p[8] = n, p[12] = i, p[1] = r, p[5] = o, p[9] = a, p[13] = l, p[2] = c, p[6] = h, p[10] = u, p[14] = d, p[3] = f, p[7] = g, p[11] = _, p[15] = m, this;
  }
  identity() {
    return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  clone() {
    return new Jt().fromArray(this.elements);
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
    const e = this.elements, n = t.elements, i = 1 / Ui.setFromMatrixColumn(t, 0).length(), r = 1 / Ui.setFromMatrixColumn(t, 1).length(), o = 1 / Ui.setFromMatrixColumn(t, 2).length();
    return e[0] = n[0] * i, e[1] = n[1] * i, e[2] = n[2] * i, e[3] = 0, e[4] = n[4] * r, e[5] = n[5] * r, e[6] = n[6] * r, e[7] = 0, e[8] = n[8] * o, e[9] = n[9] * o, e[10] = n[10] * o, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  makeRotationFromEuler(t) {
    const e = this.elements, n = t.x, i = t.y, r = t.z, o = Math.cos(n), a = Math.sin(n), l = Math.cos(i), c = Math.sin(i), h = Math.cos(r), u = Math.sin(r);
    if (t.order === "XYZ") {
      const d = o * h, f = o * u, g = a * h, _ = a * u;
      e[0] = l * h, e[4] = -l * u, e[8] = c, e[1] = f + g * c, e[5] = d - _ * c, e[9] = -a * l, e[2] = _ - d * c, e[6] = g + f * c, e[10] = o * l;
    } else if (t.order === "YXZ") {
      const d = l * h, f = l * u, g = c * h, _ = c * u;
      e[0] = d + _ * a, e[4] = g * a - f, e[8] = o * c, e[1] = o * u, e[5] = o * h, e[9] = -a, e[2] = f * a - g, e[6] = _ + d * a, e[10] = o * l;
    } else if (t.order === "ZXY") {
      const d = l * h, f = l * u, g = c * h, _ = c * u;
      e[0] = d - _ * a, e[4] = -o * u, e[8] = g + f * a, e[1] = f + g * a, e[5] = o * h, e[9] = _ - d * a, e[2] = -o * c, e[6] = a, e[10] = o * l;
    } else if (t.order === "ZYX") {
      const d = o * h, f = o * u, g = a * h, _ = a * u;
      e[0] = l * h, e[4] = g * c - f, e[8] = d * c + _, e[1] = l * u, e[5] = _ * c + d, e[9] = f * c - g, e[2] = -c, e[6] = a * l, e[10] = o * l;
    } else if (t.order === "YZX") {
      const d = o * l, f = o * c, g = a * l, _ = a * c;
      e[0] = l * h, e[4] = _ - d * u, e[8] = g * u + f, e[1] = u, e[5] = o * h, e[9] = -a * h, e[2] = -c * h, e[6] = f * u + g, e[10] = d - _ * u;
    } else if (t.order === "XZY") {
      const d = o * l, f = o * c, g = a * l, _ = a * c;
      e[0] = l * h, e[4] = -u, e[8] = c * h, e[1] = d * u + _, e[5] = o * h, e[9] = f * u - g, e[2] = g * u - f, e[6] = a * h, e[10] = _ * u + d;
    }
    return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  makeRotationFromQuaternion(t) {
    return this.compose(Ku, t, Ju);
  }
  lookAt(t, e, n) {
    const i = this.elements;
    return Xe.subVectors(t, e), Xe.lengthSq() === 0 && (Xe.z = 1), Xe.normalize(), Wn.crossVectors(n, Xe), Wn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Xe.x += 1e-4 : Xe.z += 1e-4, Xe.normalize(), Wn.crossVectors(n, Xe)), Wn.normalize(), $s.crossVectors(Xe, Wn), i[0] = Wn.x, i[4] = $s.x, i[8] = Xe.x, i[1] = Wn.y, i[5] = $s.y, i[9] = Xe.y, i[2] = Wn.z, i[6] = $s.z, i[10] = Xe.z, this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    const n = t.elements, i = e.elements, r = this.elements, o = n[0], a = n[4], l = n[8], c = n[12], h = n[1], u = n[5], d = n[9], f = n[13], g = n[2], _ = n[6], m = n[10], p = n[14], T = n[3], w = n[7], S = n[11], U = n[15], C = i[0], R = i[4], F = i[8], M = i[12], y = i[1], P = i[5], O = i[9], N = i[13], G = i[2], j = i[6], V = i[10], Z = i[14], W = i[3], it = i[7], ht = i[11], _t = i[15];
    return r[0] = o * C + a * y + l * G + c * W, r[4] = o * R + a * P + l * j + c * it, r[8] = o * F + a * O + l * V + c * ht, r[12] = o * M + a * N + l * Z + c * _t, r[1] = h * C + u * y + d * G + f * W, r[5] = h * R + u * P + d * j + f * it, r[9] = h * F + u * O + d * V + f * ht, r[13] = h * M + u * N + d * Z + f * _t, r[2] = g * C + _ * y + m * G + p * W, r[6] = g * R + _ * P + m * j + p * it, r[10] = g * F + _ * O + m * V + p * ht, r[14] = g * M + _ * N + m * Z + p * _t, r[3] = T * C + w * y + S * G + U * W, r[7] = T * R + w * P + S * j + U * it, r[11] = T * F + w * O + S * V + U * ht, r[15] = T * M + w * N + S * Z + U * _t, this;
  }
  multiplyScalar(t) {
    const e = this.elements;
    return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this;
  }
  determinant() {
    const t = this.elements, e = t[0], n = t[4], i = t[8], r = t[12], o = t[1], a = t[5], l = t[9], c = t[13], h = t[2], u = t[6], d = t[10], f = t[14], g = t[3], _ = t[7], m = t[11], p = t[15];
    return g * (+r * l * u - i * c * u - r * a * d + n * c * d + i * a * f - n * l * f) + _ * (+e * l * f - e * c * d + r * o * d - i * o * f + i * c * h - r * l * h) + m * (+e * c * u - e * a * f - r * o * u + n * o * f + r * a * h - n * c * h) + p * (-i * a * h - e * l * u + e * a * d + i * o * u - n * o * d + n * l * h);
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
    const t = this.elements, e = t[0], n = t[1], i = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8], u = t[9], d = t[10], f = t[11], g = t[12], _ = t[13], m = t[14], p = t[15], T = u * m * c - _ * d * c + _ * l * f - a * m * f - u * l * p + a * d * p, w = g * d * c - h * m * c - g * l * f + o * m * f + h * l * p - o * d * p, S = h * _ * c - g * u * c + g * a * f - o * _ * f - h * a * p + o * u * p, U = g * u * l - h * _ * l - g * a * d + o * _ * d + h * a * m - o * u * m, C = e * T + n * w + i * S + r * U;
    if (C === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const R = 1 / C;
    return t[0] = T * R, t[1] = (_ * d * r - u * m * r - _ * i * f + n * m * f + u * i * p - n * d * p) * R, t[2] = (a * m * r - _ * l * r + _ * i * c - n * m * c - a * i * p + n * l * p) * R, t[3] = (u * l * r - a * d * r - u * i * c + n * d * c + a * i * f - n * l * f) * R, t[4] = w * R, t[5] = (h * m * r - g * d * r + g * i * f - e * m * f - h * i * p + e * d * p) * R, t[6] = (g * l * r - o * m * r - g * i * c + e * m * c + o * i * p - e * l * p) * R, t[7] = (o * d * r - h * l * r + h * i * c - e * d * c - o * i * f + e * l * f) * R, t[8] = S * R, t[9] = (g * u * r - h * _ * r - g * n * f + e * _ * f + h * n * p - e * u * p) * R, t[10] = (o * _ * r - g * a * r + g * n * c - e * _ * c - o * n * p + e * a * p) * R, t[11] = (h * a * r - o * u * r - h * n * c + e * u * c + o * n * f - e * a * f) * R, t[12] = U * R, t[13] = (h * _ * i - g * u * i + g * n * d - e * _ * d - h * n * m + e * u * m) * R, t[14] = (g * a * i - o * _ * i - g * n * l + e * _ * l + o * n * m - e * a * m) * R, t[15] = (o * u * i - h * a * i + h * n * l - e * u * l - o * n * d + e * a * d) * R, this;
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
    const n = Math.cos(e), i = Math.sin(e), r = 1 - n, o = t.x, a = t.y, l = t.z, c = r * o, h = r * a;
    return this.set(c * o + n, c * a - i * l, c * l + i * a, 0, c * a + i * l, h * a + n, h * l - i * o, 0, c * l - i * a, h * l + i * o, r * l * l + n, 0, 0, 0, 0, 1), this;
  }
  makeScale(t, e, n) {
    return this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this;
  }
  makeShear(t, e, n, i, r, o) {
    return this.set(1, n, r, 0, t, 1, o, 0, e, i, 1, 0, 0, 0, 0, 1), this;
  }
  compose(t, e, n) {
    const i = this.elements, r = e._x, o = e._y, a = e._z, l = e._w, c = r + r, h = o + o, u = a + a, d = r * c, f = r * h, g = r * u, _ = o * h, m = o * u, p = a * u, T = l * c, w = l * h, S = l * u, U = n.x, C = n.y, R = n.z;
    return i[0] = (1 - (_ + p)) * U, i[1] = (f + S) * U, i[2] = (g - w) * U, i[3] = 0, i[4] = (f - S) * C, i[5] = (1 - (d + p)) * C, i[6] = (m + T) * C, i[7] = 0, i[8] = (g + w) * R, i[9] = (m - T) * R, i[10] = (1 - (d + _)) * R, i[11] = 0, i[12] = t.x, i[13] = t.y, i[14] = t.z, i[15] = 1, this;
  }
  decompose(t, e, n) {
    const i = this.elements;
    let r = Ui.set(i[0], i[1], i[2]).length();
    const o = Ui.set(i[4], i[5], i[6]).length(), a = Ui.set(i[8], i[9], i[10]).length();
    this.determinant() < 0 && (r = -r), t.x = i[12], t.y = i[13], t.z = i[14], rn.copy(this);
    const c = 1 / r, h = 1 / o, u = 1 / a;
    return rn.elements[0] *= c, rn.elements[1] *= c, rn.elements[2] *= c, rn.elements[4] *= h, rn.elements[5] *= h, rn.elements[6] *= h, rn.elements[8] *= u, rn.elements[9] *= u, rn.elements[10] *= u, e.setFromRotationMatrix(rn), n.x = r, n.y = o, n.z = a, this;
  }
  makePerspective(t, e, n, i, r, o, a = Ln) {
    const l = this.elements, c = 2 * r / (e - t), h = 2 * r / (n - i), u = (e + t) / (e - t), d = (n + i) / (n - i);
    let f, g;
    if (a === Ln) f = -(o + r) / (o - r), g = -2 * o * r / (o - r);
    else if (a === zr) f = -o / (o - r), g = -o * r / (o - r);
    else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + a);
    return l[0] = c, l[4] = 0, l[8] = u, l[12] = 0, l[1] = 0, l[5] = h, l[9] = d, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = f, l[14] = g, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
  }
  makeOrthographic(t, e, n, i, r, o, a = Ln) {
    const l = this.elements, c = 1 / (e - t), h = 1 / (n - i), u = 1 / (o - r), d = (e + t) * c, f = (n + i) * h;
    let g, _;
    if (a === Ln) g = (o + r) * u, _ = -2 * u;
    else if (a === zr) g = r * u, _ = -1 * u;
    else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + a);
    return l[0] = 2 * c, l[4] = 0, l[8] = 0, l[12] = -d, l[1] = 0, l[5] = 2 * h, l[9] = 0, l[13] = -f, l[2] = 0, l[6] = 0, l[10] = _, l[14] = -g, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
  }
  equals(t) {
    const e = this.elements, n = t.elements;
    for (let i = 0; i < 16; i++) if (e[i] !== n[i]) return false;
    return true;
  }
  fromArray(t, e = 0) {
    for (let n = 0; n < 16; n++) this.elements[n] = t[n + e];
    return this;
  }
  toArray(t = [], e = 0) {
    const n = this.elements;
    return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t[e + 9] = n[9], t[e + 10] = n[10], t[e + 11] = n[11], t[e + 12] = n[12], t[e + 13] = n[13], t[e + 14] = n[14], t[e + 15] = n[15], t;
  }
}
const Ui = new b(), rn = new Jt(), Ku = new b(0, 0, 0), Ju = new b(1, 1, 1), Wn = new b(), $s = new b(), Xe = new b(), _l = new Jt(), vl = new Bn();
class zn {
  constructor(t = 0, e = 0, n = 0, i = zn.DEFAULT_ORDER) {
    this.isEuler = true, this._x = t, this._y = e, this._z = n, this._order = i;
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
  setFromRotationMatrix(t, e = this._order, n = true) {
    const i = t.elements, r = i[0], o = i[4], a = i[8], l = i[1], c = i[5], h = i[9], u = i[2], d = i[6], f = i[10];
    switch (e) {
      case "XYZ":
        this._y = Math.asin(Ot(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(-h, f), this._z = Math.atan2(-o, r)) : (this._x = Math.atan2(d, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Ot(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(a, f), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-u, r), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Ot(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-o, c)) : (this._y = 0, this._z = Math.atan2(l, r));
        break;
      case "ZYX":
        this._y = Math.asin(-Ot(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-o, c));
        break;
      case "YZX":
        this._z = Math.asin(Ot(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-u, r)) : (this._x = 0, this._y = Math.atan2(a, f));
        break;
      case "XZY":
        this._z = Math.asin(-Ot(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(a, r)) : (this._x = Math.atan2(-h, f), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + e);
    }
    return this._order = e, n === true && this._onChangeCallback(), this;
  }
  setFromQuaternion(t, e, n) {
    return _l.makeRotationFromQuaternion(t), this.setFromRotationMatrix(_l, e, n);
  }
  setFromVector3(t, e = this._order) {
    return this.set(t.x, t.y, t.z, e);
  }
  reorder(t) {
    return vl.setFromEuler(this), this.setFromQuaternion(vl, t);
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
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
}
zn.DEFAULT_ORDER = "XYZ";
class Wa {
  constructor() {
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
let Qu = 0;
const xl = new b(), Fi = new Bn(), wn = new Jt(), js = new b(), xs = new b(), td = new b(), ed = new Bn(), yl = new b(1, 0, 0), Sl = new b(0, 1, 0), Ml = new b(0, 0, 1), El = { type: "added" }, nd = { type: "removed" }, Ni = { type: "childadded", child: null }, oo = { type: "childremoved", child: null };
class Ce extends bi {
  constructor() {
    super(), this.isObject3D = true, Object.defineProperty(this, "id", { value: Qu++ }), this.uuid = Fn(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = Ce.DEFAULT_UP.clone();
    const t = new b(), e = new zn(), n = new Bn(), i = new b(1, 1, 1);
    function r() {
      n.setFromEuler(e, false);
    }
    function o() {
      e.setFromQuaternion(n, void 0, false);
    }
    e._onChange(r), n._onChange(o), Object.defineProperties(this, { position: { configurable: true, enumerable: true, value: t }, rotation: { configurable: true, enumerable: true, value: e }, quaternion: { configurable: true, enumerable: true, value: n }, scale: { configurable: true, enumerable: true, value: i }, modelViewMatrix: { value: new Jt() }, normalMatrix: { value: new Dt() } }), this.matrix = new Jt(), this.matrixWorld = new Jt(), this.matrixAutoUpdate = Ce.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = Ce.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = false, this.layers = new Wa(), this.visible = true, this.castShadow = false, this.receiveShadow = false, this.frustumCulled = true, this.renderOrder = 0, this.animations = [], this.userData = {};
  }
  onBeforeShadow() {
  }
  onAfterShadow() {
  }
  onBeforeRender() {
  }
  onAfterRender() {
  }
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
    this.quaternion.setFromEuler(t, true);
  }
  setRotationFromMatrix(t) {
    this.quaternion.setFromRotationMatrix(t);
  }
  setRotationFromQuaternion(t) {
    this.quaternion.copy(t);
  }
  rotateOnAxis(t, e) {
    return Fi.setFromAxisAngle(t, e), this.quaternion.multiply(Fi), this;
  }
  rotateOnWorldAxis(t, e) {
    return Fi.setFromAxisAngle(t, e), this.quaternion.premultiply(Fi), this;
  }
  rotateX(t) {
    return this.rotateOnAxis(yl, t);
  }
  rotateY(t) {
    return this.rotateOnAxis(Sl, t);
  }
  rotateZ(t) {
    return this.rotateOnAxis(Ml, t);
  }
  translateOnAxis(t, e) {
    return xl.copy(t).applyQuaternion(this.quaternion), this.position.add(xl.multiplyScalar(e)), this;
  }
  translateX(t) {
    return this.translateOnAxis(yl, t);
  }
  translateY(t) {
    return this.translateOnAxis(Sl, t);
  }
  translateZ(t) {
    return this.translateOnAxis(Ml, t);
  }
  localToWorld(t) {
    return this.updateWorldMatrix(true, false), t.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(t) {
    return this.updateWorldMatrix(true, false), t.applyMatrix4(wn.copy(this.matrixWorld).invert());
  }
  lookAt(t, e, n) {
    t.isVector3 ? js.copy(t) : js.set(t, e, n);
    const i = this.parent;
    this.updateWorldMatrix(true, false), xs.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? wn.lookAt(xs, js, this.up) : wn.lookAt(js, xs, this.up), this.quaternion.setFromRotationMatrix(wn), i && (wn.extractRotation(i.matrixWorld), Fi.setFromRotationMatrix(wn), this.quaternion.premultiply(Fi.invert()));
  }
  add(t) {
    if (arguments.length > 1) {
      for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
      return this;
    }
    return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(El), Ni.child = t, this.dispatchEvent(Ni), Ni.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
  }
  remove(t) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
      return this;
    }
    const e = this.children.indexOf(t);
    return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(nd), oo.child = t, this.dispatchEvent(oo), oo.child = null), this;
  }
  removeFromParent() {
    const t = this.parent;
    return t !== null && t.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(t) {
    return this.updateWorldMatrix(true, false), wn.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(true, false), wn.multiply(t.parent.matrixWorld)), t.applyMatrix4(wn), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(false, true), t.dispatchEvent(El), Ni.child = t, this.dispatchEvent(Ni), Ni.child = null, this;
  }
  getObjectById(t) {
    return this.getObjectByProperty("id", t);
  }
  getObjectByName(t) {
    return this.getObjectByProperty("name", t);
  }
  getObjectByProperty(t, e) {
    if (this[t] === e) return this;
    for (let n = 0, i = this.children.length; n < i; n++) {
      const o = this.children[n].getObjectByProperty(t, e);
      if (o !== void 0) return o;
    }
  }
  getObjectsByProperty(t, e, n = []) {
    this[t] === e && n.push(this);
    const i = this.children;
    for (let r = 0, o = i.length; r < o; r++) i[r].getObjectsByProperty(t, e, n);
    return n;
  }
  getWorldPosition(t) {
    return this.updateWorldMatrix(true, false), t.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(t) {
    return this.updateWorldMatrix(true, false), this.matrixWorld.decompose(xs, t, td), t;
  }
  getWorldScale(t) {
    return this.updateWorldMatrix(true, false), this.matrixWorld.decompose(xs, ed, t), t;
  }
  getWorldDirection(t) {
    this.updateWorldMatrix(true, false);
    const e = this.matrixWorld.elements;
    return t.set(e[8], e[9], e[10]).normalize();
  }
  raycast() {
  }
  traverse(t) {
    t(this);
    const e = this.children;
    for (let n = 0, i = e.length; n < i; n++) e[n].traverse(t);
  }
  traverseVisible(t) {
    if (this.visible === false) return;
    t(this);
    const e = this.children;
    for (let n = 0, i = e.length; n < i; n++) e[n].traverseVisible(t);
  }
  traverseAncestors(t) {
    const e = this.parent;
    e !== null && (t(e), e.traverseAncestors(t));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = true;
  }
  updateMatrixWorld(t) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || t) && (this.matrixWorldAutoUpdate === true && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = false, t = true);
    const e = this.children;
    for (let n = 0, i = e.length; n < i; n++) e[n].updateMatrixWorld(t);
  }
  updateWorldMatrix(t, e) {
    const n = this.parent;
    if (t === true && n !== null && n.updateWorldMatrix(true, false), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === true && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), e === true) {
      const i = this.children;
      for (let r = 0, o = i.length; r < o; r++) i[r].updateWorldMatrix(false, true);
    }
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string", n = {};
    e && (t = { geometries: {}, materials: {}, textures: {}, images: {}, shapes: {}, skeletons: {}, animations: {}, nodes: {} }, n.metadata = { version: 4.6, type: "Object", generator: "Object3D.toJSON" });
    const i = {};
    i.uuid = this.uuid, i.type = this.type, this.name !== "" && (i.name = this.name), this.castShadow === true && (i.castShadow = true), this.receiveShadow === true && (i.receiveShadow = true), this.visible === false && (i.visible = false), this.frustumCulled === false && (i.frustumCulled = false), this.renderOrder !== 0 && (i.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (i.userData = this.userData), i.layers = this.layers.mask, i.matrix = this.matrix.toArray(), i.up = this.up.toArray(), this.matrixAutoUpdate === false && (i.matrixAutoUpdate = false), this.isInstancedMesh && (i.type = "InstancedMesh", i.count = this.count, i.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (i.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (i.type = "BatchedMesh", i.perObjectFrustumCulled = this.perObjectFrustumCulled, i.sortObjects = this.sortObjects, i.drawRanges = this._drawRanges, i.reservedRanges = this._reservedRanges, i.visibility = this._visibility, i.active = this._active, i.bounds = this._bounds.map((a) => ({ boxInitialized: a.boxInitialized, boxMin: a.box.min.toArray(), boxMax: a.box.max.toArray(), sphereInitialized: a.sphereInitialized, sphereRadius: a.sphere.radius, sphereCenter: a.sphere.center.toArray() })), i.maxInstanceCount = this._maxInstanceCount, i.maxVertexCount = this._maxVertexCount, i.maxIndexCount = this._maxIndexCount, i.geometryInitialized = this._geometryInitialized, i.geometryCount = this._geometryCount, i.matricesTexture = this._matricesTexture.toJSON(t), this._colorsTexture !== null && (i.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (i.boundingSphere = { center: i.boundingSphere.center.toArray(), radius: i.boundingSphere.radius }), this.boundingBox !== null && (i.boundingBox = { min: i.boundingBox.min.toArray(), max: i.boundingBox.max.toArray() }));
    function r(a, l) {
      return a[l.uuid] === void 0 && (a[l.uuid] = l.toJSON(t)), l.uuid;
    }
    if (this.isScene) this.background && (this.background.isColor ? i.background = this.background.toJSON() : this.background.isTexture && (i.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== true && (i.environment = this.environment.toJSON(t).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      i.geometry = r(t.geometries, this.geometry);
      const a = this.geometry.parameters;
      if (a !== void 0 && a.shapes !== void 0) {
        const l = a.shapes;
        if (Array.isArray(l)) for (let c = 0, h = l.length; c < h; c++) {
          const u = l[c];
          r(t.shapes, u);
        }
        else r(t.shapes, l);
      }
    }
    if (this.isSkinnedMesh && (i.bindMode = this.bindMode, i.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(t.skeletons, this.skeleton), i.skeleton = this.skeleton.uuid)), this.material !== void 0) if (Array.isArray(this.material)) {
      const a = [];
      for (let l = 0, c = this.material.length; l < c; l++) a.push(r(t.materials, this.material[l]));
      i.material = a;
    } else i.material = r(t.materials, this.material);
    if (this.children.length > 0) {
      i.children = [];
      for (let a = 0; a < this.children.length; a++) i.children.push(this.children[a].toJSON(t).object);
    }
    if (this.animations.length > 0) {
      i.animations = [];
      for (let a = 0; a < this.animations.length; a++) {
        const l = this.animations[a];
        i.animations.push(r(t.animations, l));
      }
    }
    if (e) {
      const a = o(t.geometries), l = o(t.materials), c = o(t.textures), h = o(t.images), u = o(t.shapes), d = o(t.skeletons), f = o(t.animations), g = o(t.nodes);
      a.length > 0 && (n.geometries = a), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), u.length > 0 && (n.shapes = u), d.length > 0 && (n.skeletons = d), f.length > 0 && (n.animations = f), g.length > 0 && (n.nodes = g);
    }
    return n.object = i, n;
    function o(a) {
      const l = [];
      for (const c in a) {
        const h = a[c];
        delete h.metadata, l.push(h);
      }
      return l;
    }
  }
  clone(t) {
    return new this.constructor().copy(this, t);
  }
  copy(t, e = true) {
    if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, this.animations = t.animations.slice(), this.userData = JSON.parse(JSON.stringify(t.userData)), e === true) for (let n = 0; n < t.children.length; n++) {
      const i = t.children[n];
      this.add(i.clone());
    }
    return this;
  }
}
Ce.DEFAULT_UP = new b(0, 1, 0);
Ce.DEFAULT_MATRIX_AUTO_UPDATE = true;
Ce.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;
const on = new b(), Tn = new b(), ao = new b(), An = new b(), Oi = new b(), Bi = new b(), bl = new b(), lo = new b(), co = new b(), ho = new b(), uo = new re(), fo = new re(), po = new re();
class tn {
  constructor(t = new b(), e = new b(), n = new b()) {
    this.a = t, this.b = e, this.c = n;
  }
  static getNormal(t, e, n, i) {
    i.subVectors(n, e), on.subVectors(t, e), i.cross(on);
    const r = i.lengthSq();
    return r > 0 ? i.multiplyScalar(1 / Math.sqrt(r)) : i.set(0, 0, 0);
  }
  static getBarycoord(t, e, n, i, r) {
    on.subVectors(i, e), Tn.subVectors(n, e), ao.subVectors(t, e);
    const o = on.dot(on), a = on.dot(Tn), l = on.dot(ao), c = Tn.dot(Tn), h = Tn.dot(ao), u = o * c - a * a;
    if (u === 0) return r.set(0, 0, 0), null;
    const d = 1 / u, f = (c * l - a * h) * d, g = (o * h - a * l) * d;
    return r.set(1 - f - g, g, f);
  }
  static containsPoint(t, e, n, i) {
    return this.getBarycoord(t, e, n, i, An) === null ? false : An.x >= 0 && An.y >= 0 && An.x + An.y <= 1;
  }
  static getInterpolation(t, e, n, i, r, o, a, l) {
    return this.getBarycoord(t, e, n, i, An) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(r, An.x), l.addScaledVector(o, An.y), l.addScaledVector(a, An.z), l);
  }
  static getInterpolatedAttribute(t, e, n, i, r, o) {
    return uo.setScalar(0), fo.setScalar(0), po.setScalar(0), uo.fromBufferAttribute(t, e), fo.fromBufferAttribute(t, n), po.fromBufferAttribute(t, i), o.setScalar(0), o.addScaledVector(uo, r.x), o.addScaledVector(fo, r.y), o.addScaledVector(po, r.z), o;
  }
  static isFrontFacing(t, e, n, i) {
    return on.subVectors(n, e), Tn.subVectors(t, e), on.cross(Tn).dot(i) < 0;
  }
  set(t, e, n) {
    return this.a.copy(t), this.b.copy(e), this.c.copy(n), this;
  }
  setFromPointsAndIndices(t, e, n, i) {
    return this.a.copy(t[e]), this.b.copy(t[n]), this.c.copy(t[i]), this;
  }
  setFromAttributeAndIndices(t, e, n, i) {
    return this.a.fromBufferAttribute(t, e), this.b.fromBufferAttribute(t, n), this.c.fromBufferAttribute(t, i), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this;
  }
  getArea() {
    return on.subVectors(this.c, this.b), Tn.subVectors(this.a, this.b), on.cross(Tn).length() * 0.5;
  }
  getMidpoint(t) {
    return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(t) {
    return tn.getNormal(this.a, this.b, this.c, t);
  }
  getPlane(t) {
    return t.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(t, e) {
    return tn.getBarycoord(t, this.a, this.b, this.c, e);
  }
  getInterpolation(t, e, n, i, r) {
    return tn.getInterpolation(t, this.a, this.b, this.c, e, n, i, r);
  }
  containsPoint(t) {
    return tn.containsPoint(t, this.a, this.b, this.c);
  }
  isFrontFacing(t) {
    return tn.isFrontFacing(this.a, this.b, this.c, t);
  }
  intersectsBox(t) {
    return t.intersectsTriangle(this);
  }
  closestPointToPoint(t, e) {
    const n = this.a, i = this.b, r = this.c;
    let o, a;
    Oi.subVectors(i, n), Bi.subVectors(r, n), lo.subVectors(t, n);
    const l = Oi.dot(lo), c = Bi.dot(lo);
    if (l <= 0 && c <= 0) return e.copy(n);
    co.subVectors(t, i);
    const h = Oi.dot(co), u = Bi.dot(co);
    if (h >= 0 && u <= h) return e.copy(i);
    const d = l * u - h * c;
    if (d <= 0 && l >= 0 && h <= 0) return o = l / (l - h), e.copy(n).addScaledVector(Oi, o);
    ho.subVectors(t, r);
    const f = Oi.dot(ho), g = Bi.dot(ho);
    if (g >= 0 && f <= g) return e.copy(r);
    const _ = f * c - l * g;
    if (_ <= 0 && c >= 0 && g <= 0) return a = c / (c - g), e.copy(n).addScaledVector(Bi, a);
    const m = h * g - f * u;
    if (m <= 0 && u - h >= 0 && f - g >= 0) return bl.subVectors(r, i), a = (u - h) / (u - h + (f - g)), e.copy(i).addScaledVector(bl, a);
    const p = 1 / (m + _ + d);
    return o = _ * p, a = d * p, e.copy(n).addScaledVector(Oi, o).addScaledVector(Bi, a);
  }
  equals(t) {
    return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
  }
}
const Jc = { aliceblue: 15792383, antiquewhite: 16444375, aqua: 65535, aquamarine: 8388564, azure: 15794175, beige: 16119260, bisque: 16770244, black: 0, blanchedalmond: 16772045, blue: 255, blueviolet: 9055202, brown: 10824234, burlywood: 14596231, cadetblue: 6266528, chartreuse: 8388352, chocolate: 13789470, coral: 16744272, cornflowerblue: 6591981, cornsilk: 16775388, crimson: 14423100, cyan: 65535, darkblue: 139, darkcyan: 35723, darkgoldenrod: 12092939, darkgray: 11119017, darkgreen: 25600, darkgrey: 11119017, darkkhaki: 12433259, darkmagenta: 9109643, darkolivegreen: 5597999, darkorange: 16747520, darkorchid: 10040012, darkred: 9109504, darksalmon: 15308410, darkseagreen: 9419919, darkslateblue: 4734347, darkslategray: 3100495, darkslategrey: 3100495, darkturquoise: 52945, darkviolet: 9699539, deeppink: 16716947, deepskyblue: 49151, dimgray: 6908265, dimgrey: 6908265, dodgerblue: 2003199, firebrick: 11674146, floralwhite: 16775920, forestgreen: 2263842, fuchsia: 16711935, gainsboro: 14474460, ghostwhite: 16316671, gold: 16766720, goldenrod: 14329120, gray: 8421504, green: 32768, greenyellow: 11403055, grey: 8421504, honeydew: 15794160, hotpink: 16738740, indianred: 13458524, indigo: 4915330, ivory: 16777200, khaki: 15787660, lavender: 15132410, lavenderblush: 16773365, lawngreen: 8190976, lemonchiffon: 16775885, lightblue: 11393254, lightcoral: 15761536, lightcyan: 14745599, lightgoldenrodyellow: 16448210, lightgray: 13882323, lightgreen: 9498256, lightgrey: 13882323, lightpink: 16758465, lightsalmon: 16752762, lightseagreen: 2142890, lightskyblue: 8900346, lightslategray: 7833753, lightslategrey: 7833753, lightsteelblue: 11584734, lightyellow: 16777184, lime: 65280, limegreen: 3329330, linen: 16445670, magenta: 16711935, maroon: 8388608, mediumaquamarine: 6737322, mediumblue: 205, mediumorchid: 12211667, mediumpurple: 9662683, mediumseagreen: 3978097, mediumslateblue: 8087790, mediumspringgreen: 64154, mediumturquoise: 4772300, mediumvioletred: 13047173, midnightblue: 1644912, mintcream: 16121850, mistyrose: 16770273, moccasin: 16770229, navajowhite: 16768685, navy: 128, oldlace: 16643558, olive: 8421376, olivedrab: 7048739, orange: 16753920, orangered: 16729344, orchid: 14315734, palegoldenrod: 15657130, palegreen: 10025880, paleturquoise: 11529966, palevioletred: 14381203, papayawhip: 16773077, peachpuff: 16767673, peru: 13468991, pink: 16761035, plum: 14524637, powderblue: 11591910, purple: 8388736, rebeccapurple: 6697881, red: 16711680, rosybrown: 12357519, royalblue: 4286945, saddlebrown: 9127187, salmon: 16416882, sandybrown: 16032864, seagreen: 3050327, seashell: 16774638, sienna: 10506797, silver: 12632256, skyblue: 8900331, slateblue: 6970061, slategray: 7372944, slategrey: 7372944, snow: 16775930, springgreen: 65407, steelblue: 4620980, tan: 13808780, teal: 32896, thistle: 14204888, tomato: 16737095, turquoise: 4251856, violet: 15631086, wheat: 16113331, white: 16777215, whitesmoke: 16119285, yellow: 16776960, yellowgreen: 10145074 }, Xn = { h: 0, s: 0, l: 0 }, Zs = { h: 0, s: 0, l: 0 };
function mo(s, t, e) {
  return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? s + (t - s) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? s + (t - s) * 6 * (2 / 3 - e) : s;
}
class zt {
  constructor(t, e, n) {
    return this.isColor = true, this.r = 1, this.g = 1, this.b = 1, this.set(t, e, n);
  }
  set(t, e, n) {
    if (e === void 0 && n === void 0) {
      const i = t;
      i && i.isColor ? this.copy(i) : typeof i == "number" ? this.setHex(i) : typeof i == "string" && this.setStyle(i);
    } else this.setRGB(t, e, n);
    return this;
  }
  setScalar(t) {
    return this.r = t, this.g = t, this.b = t, this;
  }
  setHex(t, e = De) {
    return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, $t.toWorkingColorSpace(this, e), this;
  }
  setRGB(t, e, n, i = $t.workingColorSpace) {
    return this.r = t, this.g = e, this.b = n, $t.toWorkingColorSpace(this, i), this;
  }
  setHSL(t, e, n, i = $t.workingColorSpace) {
    if (t = Va(t, 1), e = Ot(e, 0, 1), n = Ot(n, 0, 1), e === 0) this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + e) : n + e - n * e, o = 2 * n - r;
      this.r = mo(o, r, t + 1 / 3), this.g = mo(o, r, t), this.b = mo(o, r, t - 1 / 3);
    }
    return $t.toWorkingColorSpace(this, i), this;
  }
  setStyle(t, e = De) {
    function n(r) {
      r !== void 0 && parseFloat(r) < 1 && console.warn("THREE.Color: Alpha component of " + t + " will be ignored.");
    }
    let i;
    if (i = /^(\w+)\(([^\)]*)\)/.exec(t)) {
      let r;
      const o = i[1], a = i[2];
      switch (o) {
        case "rgb":
        case "rgba":
          if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)) return n(r[4]), this.setRGB(Math.min(255, parseInt(r[1], 10)) / 255, Math.min(255, parseInt(r[2], 10)) / 255, Math.min(255, parseInt(r[3], 10)) / 255, e);
          if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)) return n(r[4]), this.setRGB(Math.min(100, parseInt(r[1], 10)) / 100, Math.min(100, parseInt(r[2], 10)) / 100, Math.min(100, parseInt(r[3], 10)) / 100, e);
          break;
        case "hsl":
        case "hsla":
          if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)) return n(r[4]), this.setHSL(parseFloat(r[1]) / 360, parseFloat(r[2]) / 100, parseFloat(r[3]) / 100, e);
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + t);
      }
    } else if (i = /^\#([A-Fa-f\d]+)$/.exec(t)) {
      const r = i[1], o = r.length;
      if (o === 3) return this.setRGB(parseInt(r.charAt(0), 16) / 15, parseInt(r.charAt(1), 16) / 15, parseInt(r.charAt(2), 16) / 15, e);
      if (o === 6) return this.setHex(parseInt(r, 16), e);
      console.warn("THREE.Color: Invalid hex color " + t);
    } else if (t && t.length > 0) return this.setColorName(t, e);
    return this;
  }
  setColorName(t, e = De) {
    const n = Jc[t.toLowerCase()];
    return n !== void 0 ? this.setHex(n, e) : console.warn("THREE.Color: Unknown color " + t), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(t) {
    return this.r = t.r, this.g = t.g, this.b = t.b, this;
  }
  copySRGBToLinear(t) {
    return this.r = Nn(t.r), this.g = Nn(t.g), this.b = Nn(t.b), this;
  }
  copyLinearToSRGB(t) {
    return this.r = is(t.r), this.g = is(t.g), this.b = is(t.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(t = De) {
    return $t.fromWorkingColorSpace(Ae.copy(this), t), Math.round(Ot(Ae.r * 255, 0, 255)) * 65536 + Math.round(Ot(Ae.g * 255, 0, 255)) * 256 + Math.round(Ot(Ae.b * 255, 0, 255));
  }
  getHexString(t = De) {
    return ("000000" + this.getHex(t).toString(16)).slice(-6);
  }
  getHSL(t, e = $t.workingColorSpace) {
    $t.fromWorkingColorSpace(Ae.copy(this), e);
    const n = Ae.r, i = Ae.g, r = Ae.b, o = Math.max(n, i, r), a = Math.min(n, i, r);
    let l, c;
    const h = (a + o) / 2;
    if (a === o) l = 0, c = 0;
    else {
      const u = o - a;
      switch (c = h <= 0.5 ? u / (o + a) : u / (2 - o - a), o) {
        case n:
          l = (i - r) / u + (i < r ? 6 : 0);
          break;
        case i:
          l = (r - n) / u + 2;
          break;
        case r:
          l = (n - i) / u + 4;
          break;
      }
      l /= 6;
    }
    return t.h = l, t.s = c, t.l = h, t;
  }
  getRGB(t, e = $t.workingColorSpace) {
    return $t.fromWorkingColorSpace(Ae.copy(this), e), t.r = Ae.r, t.g = Ae.g, t.b = Ae.b, t;
  }
  getStyle(t = De) {
    $t.fromWorkingColorSpace(Ae.copy(this), t);
    const e = Ae.r, n = Ae.g, i = Ae.b;
    return t !== De ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(e * 255)},${Math.round(n * 255)},${Math.round(i * 255)})`;
  }
  offsetHSL(t, e, n) {
    return this.getHSL(Xn), this.setHSL(Xn.h + t, Xn.s + e, Xn.l + n);
  }
  add(t) {
    return this.r += t.r, this.g += t.g, this.b += t.b, this;
  }
  addColors(t, e) {
    return this.r = t.r + e.r, this.g = t.g + e.g, this.b = t.b + e.b, this;
  }
  addScalar(t) {
    return this.r += t, this.g += t, this.b += t, this;
  }
  sub(t) {
    return this.r = Math.max(0, this.r - t.r), this.g = Math.max(0, this.g - t.g), this.b = Math.max(0, this.b - t.b), this;
  }
  multiply(t) {
    return this.r *= t.r, this.g *= t.g, this.b *= t.b, this;
  }
  multiplyScalar(t) {
    return this.r *= t, this.g *= t, this.b *= t, this;
  }
  lerp(t, e) {
    return this.r += (t.r - this.r) * e, this.g += (t.g - this.g) * e, this.b += (t.b - this.b) * e, this;
  }
  lerpColors(t, e, n) {
    return this.r = t.r + (e.r - t.r) * n, this.g = t.g + (e.g - t.g) * n, this.b = t.b + (e.b - t.b) * n, this;
  }
  lerpHSL(t, e) {
    this.getHSL(Xn), t.getHSL(Zs);
    const n = Us(Xn.h, Zs.h, e), i = Us(Xn.s, Zs.s, e), r = Us(Xn.l, Zs.l, e);
    return this.setHSL(n, i, r), this;
  }
  setFromVector3(t) {
    return this.r = t.x, this.g = t.y, this.b = t.z, this;
  }
  applyMatrix3(t) {
    const e = this.r, n = this.g, i = this.b, r = t.elements;
    return this.r = r[0] * e + r[3] * n + r[6] * i, this.g = r[1] * e + r[4] * n + r[7] * i, this.b = r[2] * e + r[5] * n + r[8] * i, this;
  }
  equals(t) {
    return t.r === this.r && t.g === this.g && t.b === this.b;
  }
  fromArray(t, e = 0) {
    return this.r = t[e], this.g = t[e + 1], this.b = t[e + 2], this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this.r, t[e + 1] = this.g, t[e + 2] = this.b, t;
  }
  fromBufferAttribute(t, e) {
    return this.r = t.getX(e), this.g = t.getY(e), this.b = t.getZ(e), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
}
const Ae = new zt();
zt.NAMES = Jc;
let id = 0;
class wi extends bi {
  constructor() {
    super(), this.isMaterial = true, Object.defineProperty(this, "id", { value: id++ }), this.uuid = Fn(), this.name = "", this.type = "Material", this.blending = es, this.side = Qn, this.vertexColors = false, this.opacity = 1, this.transparent = false, this.alphaHash = false, this.blendSrc = Wo, this.blendDst = Xo, this.blendEquation = gi, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new zt(0, 0, 0), this.blendAlpha = 0, this.depthFunc = ss, this.depthTest = true, this.depthWrite = true, this.stencilWriteMask = 255, this.stencilFunc = hl, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Ri, this.stencilZFail = Ri, this.stencilZPass = Ri, this.stencilWrite = false, this.clippingPlanes = null, this.clipIntersection = false, this.clipShadows = false, this.shadowSide = null, this.colorWrite = true, this.precision = null, this.polygonOffset = false, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = false, this.alphaToCoverage = false, this.premultipliedAlpha = false, this.forceSinglePass = false, this.visible = true, this.toneMapped = true, this.userData = {}, this.version = 0, this._alphaTest = 0;
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(t) {
    this._alphaTest > 0 != t > 0 && this.version++, this._alphaTest = t;
  }
  onBeforeRender() {
  }
  onBeforeCompile() {
  }
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(t) {
    if (t !== void 0) for (const e in t) {
      const n = t[e];
      if (n === void 0) {
        console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);
        continue;
      }
      const i = this[e];
      if (i === void 0) {
        console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);
        continue;
      }
      i && i.isColor ? i.set(n) : i && i.isVector3 && n && n.isVector3 ? i.copy(n) : this[e] = n;
    }
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    e && (t = { textures: {}, images: {} });
    const n = { metadata: { version: 4.6, type: "Material", generator: "Material.toJSON" } };
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(t).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(t).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(t).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(t).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(t).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== es && (n.blending = this.blending), this.side !== Qn && (n.side = this.side), this.vertexColors === true && (n.vertexColors = true), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === true && (n.transparent = true), this.blendSrc !== Wo && (n.blendSrc = this.blendSrc), this.blendDst !== Xo && (n.blendDst = this.blendDst), this.blendEquation !== gi && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== ss && (n.depthFunc = this.depthFunc), this.depthTest === false && (n.depthTest = this.depthTest), this.depthWrite === false && (n.depthWrite = this.depthWrite), this.colorWrite === false && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== hl && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Ri && (n.stencilFail = this.stencilFail), this.stencilZFail !== Ri && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== Ri && (n.stencilZPass = this.stencilZPass), this.stencilWrite === true && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === true && (n.polygonOffset = true), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === true && (n.dithering = true), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === true && (n.alphaHash = true), this.alphaToCoverage === true && (n.alphaToCoverage = true), this.premultipliedAlpha === true && (n.premultipliedAlpha = true), this.forceSinglePass === true && (n.forceSinglePass = true), this.wireframe === true && (n.wireframe = true), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === true && (n.flatShading = true), this.visible === false && (n.visible = false), this.toneMapped === false && (n.toneMapped = false), this.fog === false && (n.fog = false), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function i(r) {
      const o = [];
      for (const a in r) {
        const l = r[a];
        delete l.metadata, o.push(l);
      }
      return o;
    }
    if (e) {
      const r = i(t.textures), o = i(t.images);
      r.length > 0 && (n.textures = r), o.length > 0 && (n.images = o);
    }
    return n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    this.name = t.name, this.blending = t.blending, this.side = t.side, this.vertexColors = t.vertexColors, this.opacity = t.opacity, this.transparent = t.transparent, this.blendSrc = t.blendSrc, this.blendDst = t.blendDst, this.blendEquation = t.blendEquation, this.blendSrcAlpha = t.blendSrcAlpha, this.blendDstAlpha = t.blendDstAlpha, this.blendEquationAlpha = t.blendEquationAlpha, this.blendColor.copy(t.blendColor), this.blendAlpha = t.blendAlpha, this.depthFunc = t.depthFunc, this.depthTest = t.depthTest, this.depthWrite = t.depthWrite, this.stencilWriteMask = t.stencilWriteMask, this.stencilFunc = t.stencilFunc, this.stencilRef = t.stencilRef, this.stencilFuncMask = t.stencilFuncMask, this.stencilFail = t.stencilFail, this.stencilZFail = t.stencilZFail, this.stencilZPass = t.stencilZPass, this.stencilWrite = t.stencilWrite;
    const e = t.clippingPlanes;
    let n = null;
    if (e !== null) {
      const i = e.length;
      n = new Array(i);
      for (let r = 0; r !== i; ++r) n[r] = e[r].clone();
    }
    return this.clippingPlanes = n, this.clipIntersection = t.clipIntersection, this.clipShadows = t.clipShadows, this.shadowSide = t.shadowSide, this.colorWrite = t.colorWrite, this.precision = t.precision, this.polygonOffset = t.polygonOffset, this.polygonOffsetFactor = t.polygonOffsetFactor, this.polygonOffsetUnits = t.polygonOffsetUnits, this.dithering = t.dithering, this.alphaTest = t.alphaTest, this.alphaHash = t.alphaHash, this.alphaToCoverage = t.alphaToCoverage, this.premultipliedAlpha = t.premultipliedAlpha, this.forceSinglePass = t.forceSinglePass, this.visible = t.visible, this.toneMapped = t.toneMapped, this.userData = JSON.parse(JSON.stringify(t.userData)), this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(t) {
    t === true && this.version++;
  }
  onBuild() {
    console.warn("Material: onBuild() has been removed.");
  }
}
class Ei extends wi {
  constructor(t) {
    super(), this.isMeshBasicMaterial = true, this.type = "MeshBasicMaterial", this.color = new zt(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new zn(), this.combine = Oc, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = false, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this;
  }
}
const fe = new b(), Ks = new Mt();
let sd = 0;
class ce {
  constructor(t, e, n = false) {
    if (Array.isArray(t)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = true, Object.defineProperty(this, "id", { value: sd++ }), this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = Ra, this.updateRanges = [], this.gpuType = Pn, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(t) {
    t === true && this.version++;
  }
  setUsage(t) {
    return this.usage = t, this;
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(t) {
    return this.name = t.name, this.array = new t.array.constructor(t.array), this.itemSize = t.itemSize, this.count = t.count, this.normalized = t.normalized, this.usage = t.usage, this.gpuType = t.gpuType, this;
  }
  copyAt(t, e, n) {
    t *= this.itemSize, n *= e.itemSize;
    for (let i = 0, r = this.itemSize; i < r; i++) this.array[t + i] = e.array[n + i];
    return this;
  }
  copyArray(t) {
    return this.array.set(t), this;
  }
  applyMatrix3(t) {
    if (this.itemSize === 2) for (let e = 0, n = this.count; e < n; e++) Ks.fromBufferAttribute(this, e), Ks.applyMatrix3(t), this.setXY(e, Ks.x, Ks.y);
    else if (this.itemSize === 3) for (let e = 0, n = this.count; e < n; e++) fe.fromBufferAttribute(this, e), fe.applyMatrix3(t), this.setXYZ(e, fe.x, fe.y, fe.z);
    return this;
  }
  applyMatrix4(t) {
    for (let e = 0, n = this.count; e < n; e++) fe.fromBufferAttribute(this, e), fe.applyMatrix4(t), this.setXYZ(e, fe.x, fe.y, fe.z);
    return this;
  }
  applyNormalMatrix(t) {
    for (let e = 0, n = this.count; e < n; e++) fe.fromBufferAttribute(this, e), fe.applyNormalMatrix(t), this.setXYZ(e, fe.x, fe.y, fe.z);
    return this;
  }
  transformDirection(t) {
    for (let e = 0, n = this.count; e < n; e++) fe.fromBufferAttribute(this, e), fe.transformDirection(t), this.setXYZ(e, fe.x, fe.y, fe.z);
    return this;
  }
  set(t, e = 0) {
    return this.array.set(t, e), this;
  }
  getComponent(t, e) {
    let n = this.array[t * this.itemSize + e];
    return this.normalized && (n = ln(n, this.array)), n;
  }
  setComponent(t, e, n) {
    return this.normalized && (n = te(n, this.array)), this.array[t * this.itemSize + e] = n, this;
  }
  getX(t) {
    let e = this.array[t * this.itemSize];
    return this.normalized && (e = ln(e, this.array)), e;
  }
  setX(t, e) {
    return this.normalized && (e = te(e, this.array)), this.array[t * this.itemSize] = e, this;
  }
  getY(t) {
    let e = this.array[t * this.itemSize + 1];
    return this.normalized && (e = ln(e, this.array)), e;
  }
  setY(t, e) {
    return this.normalized && (e = te(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
  }
  getZ(t) {
    let e = this.array[t * this.itemSize + 2];
    return this.normalized && (e = ln(e, this.array)), e;
  }
  setZ(t, e) {
    return this.normalized && (e = te(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
  }
  getW(t) {
    let e = this.array[t * this.itemSize + 3];
    return this.normalized && (e = ln(e, this.array)), e;
  }
  setW(t, e) {
    return this.normalized && (e = te(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
  }
  setXY(t, e, n) {
    return t *= this.itemSize, this.normalized && (e = te(e, this.array), n = te(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this;
  }
  setXYZ(t, e, n, i) {
    return t *= this.itemSize, this.normalized && (e = te(e, this.array), n = te(n, this.array), i = te(i, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = i, this;
  }
  setXYZW(t, e, n, i, r) {
    return t *= this.itemSize, this.normalized && (e = te(e, this.array), n = te(n, this.array), i = te(i, this.array), r = te(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = i, this.array[t + 3] = r, this;
  }
  onUpload(t) {
    return this.onUploadCallback = t, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const t = { itemSize: this.itemSize, type: this.array.constructor.name, array: Array.from(this.array), normalized: this.normalized };
    return this.name !== "" && (t.name = this.name), this.usage !== Ra && (t.usage = this.usage), t;
  }
}
class Qc extends ce {
  constructor(t, e, n) {
    super(new Uint16Array(t), e, n);
  }
}
class th extends ce {
  constructor(t, e, n) {
    super(new Uint32Array(t), e, n);
  }
}
class Ge extends ce {
  constructor(t, e, n) {
    super(new Float32Array(t), e, n);
  }
}
let rd = 0;
const Je = new Jt(), go = new Ce(), zi = new b(), Ye = new ke(), ys = new ke(), ve = new b();
class me extends bi {
  constructor() {
    super(), this.isBufferGeometry = true, Object.defineProperty(this, "id", { value: rd++ }), this.uuid = Fn(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = false, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(t) {
    return Array.isArray(t) ? this.index = new (Zc(t) ? th : Qc)(t, 1) : this.index = t, this;
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
    this.groups.push({ start: t, count: e, materialIndex: n });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(t, e) {
    this.drawRange.start = t, this.drawRange.count = e;
  }
  applyMatrix4(t) {
    const e = this.attributes.position;
    e !== void 0 && (e.applyMatrix4(t), e.needsUpdate = true);
    const n = this.attributes.normal;
    if (n !== void 0) {
      const r = new Dt().getNormalMatrix(t);
      n.applyNormalMatrix(r), n.needsUpdate = true;
    }
    const i = this.attributes.tangent;
    return i !== void 0 && (i.transformDirection(t), i.needsUpdate = true), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(t) {
    return Je.makeRotationFromQuaternion(t), this.applyMatrix4(Je), this;
  }
  rotateX(t) {
    return Je.makeRotationX(t), this.applyMatrix4(Je), this;
  }
  rotateY(t) {
    return Je.makeRotationY(t), this.applyMatrix4(Je), this;
  }
  rotateZ(t) {
    return Je.makeRotationZ(t), this.applyMatrix4(Je), this;
  }
  translate(t, e, n) {
    return Je.makeTranslation(t, e, n), this.applyMatrix4(Je), this;
  }
  scale(t, e, n) {
    return Je.makeScale(t, e, n), this.applyMatrix4(Je), this;
  }
  lookAt(t) {
    return go.lookAt(t), go.updateMatrix(), this.applyMatrix4(go.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(zi).negate(), this.translate(zi.x, zi.y, zi.z), this;
  }
  setFromPoints(t) {
    const e = this.getAttribute("position");
    if (e === void 0) {
      const n = [];
      for (let i = 0, r = t.length; i < r; i++) {
        const o = t[i];
        n.push(o.x, o.y, o.z || 0);
      }
      this.setAttribute("position", new Ge(n, 3));
    } else {
      const n = Math.min(t.length, e.count);
      for (let i = 0; i < n; i++) {
        const r = t[i];
        e.setXYZ(i, r.x, r.y, r.z || 0);
      }
      t.length > e.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), e.needsUpdate = true;
    }
    return this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new ke());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new b(-1 / 0, -1 / 0, -1 / 0), new b(1 / 0, 1 / 0, 1 / 0));
      return;
    }
    if (t !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(t), e) for (let n = 0, i = e.length; n < i; n++) {
        const r = e[n];
        Ye.setFromBufferAttribute(r), this.morphTargetsRelative ? (ve.addVectors(this.boundingBox.min, Ye.min), this.boundingBox.expandByPoint(ve), ve.addVectors(this.boundingBox.max, Ye.max), this.boundingBox.expandByPoint(ve)) : (this.boundingBox.expandByPoint(Ye.min), this.boundingBox.expandByPoint(Ye.max));
      }
    } else this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new hn());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new b(), 1 / 0);
      return;
    }
    if (t) {
      const n = this.boundingSphere.center;
      if (Ye.setFromBufferAttribute(t), e) for (let r = 0, o = e.length; r < o; r++) {
        const a = e[r];
        ys.setFromBufferAttribute(a), this.morphTargetsRelative ? (ve.addVectors(Ye.min, ys.min), Ye.expandByPoint(ve), ve.addVectors(Ye.max, ys.max), Ye.expandByPoint(ve)) : (Ye.expandByPoint(ys.min), Ye.expandByPoint(ys.max));
      }
      Ye.getCenter(n);
      let i = 0;
      for (let r = 0, o = t.count; r < o; r++) ve.fromBufferAttribute(t, r), i = Math.max(i, n.distanceToSquared(ve));
      if (e) for (let r = 0, o = e.length; r < o; r++) {
        const a = e[r], l = this.morphTargetsRelative;
        for (let c = 0, h = a.count; c < h; c++) ve.fromBufferAttribute(a, c), l && (zi.fromBufferAttribute(t, c), ve.add(zi)), i = Math.max(i, n.distanceToSquared(ve));
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
    this.hasAttribute("tangent") === false && this.setAttribute("tangent", new ce(new Float32Array(4 * n.count), 4));
    const o = this.getAttribute("tangent"), a = [], l = [];
    for (let F = 0; F < n.count; F++) a[F] = new b(), l[F] = new b();
    const c = new b(), h = new b(), u = new b(), d = new Mt(), f = new Mt(), g = new Mt(), _ = new b(), m = new b();
    function p(F, M, y) {
      c.fromBufferAttribute(n, F), h.fromBufferAttribute(n, M), u.fromBufferAttribute(n, y), d.fromBufferAttribute(r, F), f.fromBufferAttribute(r, M), g.fromBufferAttribute(r, y), h.sub(c), u.sub(c), f.sub(d), g.sub(d);
      const P = 1 / (f.x * g.y - g.x * f.y);
      isFinite(P) && (_.copy(h).multiplyScalar(g.y).addScaledVector(u, -f.y).multiplyScalar(P), m.copy(u).multiplyScalar(f.x).addScaledVector(h, -g.x).multiplyScalar(P), a[F].add(_), a[M].add(_), a[y].add(_), l[F].add(m), l[M].add(m), l[y].add(m));
    }
    let T = this.groups;
    T.length === 0 && (T = [{ start: 0, count: t.count }]);
    for (let F = 0, M = T.length; F < M; ++F) {
      const y = T[F], P = y.start, O = y.count;
      for (let N = P, G = P + O; N < G; N += 3) p(t.getX(N + 0), t.getX(N + 1), t.getX(N + 2));
    }
    const w = new b(), S = new b(), U = new b(), C = new b();
    function R(F) {
      U.fromBufferAttribute(i, F), C.copy(U);
      const M = a[F];
      w.copy(M), w.sub(U.multiplyScalar(U.dot(M))).normalize(), S.crossVectors(C, M);
      const P = S.dot(l[F]) < 0 ? -1 : 1;
      o.setXYZW(F, w.x, w.y, w.z, P);
    }
    for (let F = 0, M = T.length; F < M; ++F) {
      const y = T[F], P = y.start, O = y.count;
      for (let N = P, G = P + O; N < G; N += 3) R(t.getX(N + 0)), R(t.getX(N + 1)), R(t.getX(N + 2));
    }
  }
  computeVertexNormals() {
    const t = this.index, e = this.getAttribute("position");
    if (e !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0) n = new ce(new Float32Array(e.count * 3), 3), this.setAttribute("normal", n);
      else for (let d = 0, f = n.count; d < f; d++) n.setXYZ(d, 0, 0, 0);
      const i = new b(), r = new b(), o = new b(), a = new b(), l = new b(), c = new b(), h = new b(), u = new b();
      if (t) for (let d = 0, f = t.count; d < f; d += 3) {
        const g = t.getX(d + 0), _ = t.getX(d + 1), m = t.getX(d + 2);
        i.fromBufferAttribute(e, g), r.fromBufferAttribute(e, _), o.fromBufferAttribute(e, m), h.subVectors(o, r), u.subVectors(i, r), h.cross(u), a.fromBufferAttribute(n, g), l.fromBufferAttribute(n, _), c.fromBufferAttribute(n, m), a.add(h), l.add(h), c.add(h), n.setXYZ(g, a.x, a.y, a.z), n.setXYZ(_, l.x, l.y, l.z), n.setXYZ(m, c.x, c.y, c.z);
      }
      else for (let d = 0, f = e.count; d < f; d += 3) i.fromBufferAttribute(e, d + 0), r.fromBufferAttribute(e, d + 1), o.fromBufferAttribute(e, d + 2), h.subVectors(o, r), u.subVectors(i, r), h.cross(u), n.setXYZ(d + 0, h.x, h.y, h.z), n.setXYZ(d + 1, h.x, h.y, h.z), n.setXYZ(d + 2, h.x, h.y, h.z);
      this.normalizeNormals(), n.needsUpdate = true;
    }
  }
  normalizeNormals() {
    const t = this.attributes.normal;
    for (let e = 0, n = t.count; e < n; e++) ve.fromBufferAttribute(t, e), ve.normalize(), t.setXYZ(e, ve.x, ve.y, ve.z);
  }
  toNonIndexed() {
    function t(a, l) {
      const c = a.array, h = a.itemSize, u = a.normalized, d = new c.constructor(l.length * h);
      let f = 0, g = 0;
      for (let _ = 0, m = l.length; _ < m; _++) {
        a.isInterleavedBufferAttribute ? f = l[_] * a.data.stride + a.offset : f = l[_] * h;
        for (let p = 0; p < h; p++) d[g++] = c[f++];
      }
      return new ce(d, h, u);
    }
    if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const e = new me(), n = this.index.array, i = this.attributes;
    for (const a in i) {
      const l = i[a], c = t(l, n);
      e.setAttribute(a, c);
    }
    const r = this.morphAttributes;
    for (const a in r) {
      const l = [], c = r[a];
      for (let h = 0, u = c.length; h < u; h++) {
        const d = c[h], f = t(d, n);
        l.push(f);
      }
      e.morphAttributes[a] = l;
    }
    e.morphTargetsRelative = this.morphTargetsRelative;
    const o = this.groups;
    for (let a = 0, l = o.length; a < l; a++) {
      const c = o[a];
      e.addGroup(c.start, c.count, c.materialIndex);
    }
    return e;
  }
  toJSON() {
    const t = { metadata: { version: 4.6, type: "BufferGeometry", generator: "BufferGeometry.toJSON" } };
    if (t.uuid = this.uuid, t.type = this.type, this.name !== "" && (t.name = this.name), Object.keys(this.userData).length > 0 && (t.userData = this.userData), this.parameters !== void 0) {
      const l = this.parameters;
      for (const c in l) l[c] !== void 0 && (t[c] = l[c]);
      return t;
    }
    t.data = { attributes: {} };
    const e = this.index;
    e !== null && (t.data.index = { type: e.array.constructor.name, array: Array.prototype.slice.call(e.array) });
    const n = this.attributes;
    for (const l in n) {
      const c = n[l];
      t.data.attributes[l] = c.toJSON(t.data);
    }
    const i = {};
    let r = false;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l], h = [];
      for (let u = 0, d = c.length; u < d; u++) {
        const f = c[u];
        h.push(f.toJSON(t.data));
      }
      h.length > 0 && (i[l] = h, r = true);
    }
    r && (t.data.morphAttributes = i, t.data.morphTargetsRelative = this.morphTargetsRelative);
    const o = this.groups;
    o.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(o)));
    const a = this.boundingSphere;
    return a !== null && (t.data.boundingSphere = { center: a.center.toArray(), radius: a.radius }), t;
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
    for (const c in i) {
      const h = i[c];
      this.setAttribute(c, h.clone(e));
    }
    const r = t.morphAttributes;
    for (const c in r) {
      const h = [], u = r[c];
      for (let d = 0, f = u.length; d < f; d++) h.push(u[d].clone(e));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    const o = t.groups;
    for (let c = 0, h = o.length; c < h; c++) {
      const u = o[c];
      this.addGroup(u.start, u.count, u.materialIndex);
    }
    const a = t.boundingBox;
    a !== null && (this.boundingBox = a.clone());
    const l = t.boundingSphere;
    return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = t.drawRange.start, this.drawRange.count = t.drawRange.count, this.userData = t.userData, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
const wl = new Jt(), oi = new Bs(), Js = new hn(), Tl = new b(), Qs = new b(), tr = new b(), er = new b(), _o = new b(), nr = new b(), Al = new b(), ir = new b();
class He extends Ce {
  constructor(t = new me(), e = new Ei()) {
    super(), this.isMesh = true, this.type = "Mesh", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), t.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = t.morphTargetInfluences.slice()), t.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, t.morphTargetDictionary)), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, n = Object.keys(e);
    if (n.length > 0) {
      const i = e[n[0]];
      if (i !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, o = i.length; r < o; r++) {
          const a = i[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[a] = r;
        }
      }
    }
  }
  getVertexPosition(t, e) {
    const n = this.geometry, i = n.attributes.position, r = n.morphAttributes.position, o = n.morphTargetsRelative;
    e.fromBufferAttribute(i, t);
    const a = this.morphTargetInfluences;
    if (r && a) {
      nr.set(0, 0, 0);
      for (let l = 0, c = r.length; l < c; l++) {
        const h = a[l], u = r[l];
        h !== 0 && (_o.fromBufferAttribute(u, t), o ? nr.addScaledVector(_o, h) : nr.addScaledVector(_o.sub(e), h));
      }
      e.add(nr);
    }
    return e;
  }
  raycast(t, e) {
    const n = this.geometry, i = this.material, r = this.matrixWorld;
    i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Js.copy(n.boundingSphere), Js.applyMatrix4(r), oi.copy(t.ray).recast(t.near), !(Js.containsPoint(oi.origin) === false && (oi.intersectSphere(Js, Tl) === null || oi.origin.distanceToSquared(Tl) > (t.far - t.near) ** 2)) && (wl.copy(r).invert(), oi.copy(t.ray).applyMatrix4(wl), !(n.boundingBox !== null && oi.intersectsBox(n.boundingBox) === false) && this._computeIntersections(t, e, oi)));
  }
  _computeIntersections(t, e, n) {
    let i;
    const r = this.geometry, o = this.material, a = r.index, l = r.attributes.position, c = r.attributes.uv, h = r.attributes.uv1, u = r.attributes.normal, d = r.groups, f = r.drawRange;
    if (a !== null) if (Array.isArray(o)) for (let g = 0, _ = d.length; g < _; g++) {
      const m = d[g], p = o[m.materialIndex], T = Math.max(m.start, f.start), w = Math.min(a.count, Math.min(m.start + m.count, f.start + f.count));
      for (let S = T, U = w; S < U; S += 3) {
        const C = a.getX(S), R = a.getX(S + 1), F = a.getX(S + 2);
        i = sr(this, p, t, n, c, h, u, C, R, F), i && (i.faceIndex = Math.floor(S / 3), i.face.materialIndex = m.materialIndex, e.push(i));
      }
    }
    else {
      const g = Math.max(0, f.start), _ = Math.min(a.count, f.start + f.count);
      for (let m = g, p = _; m < p; m += 3) {
        const T = a.getX(m), w = a.getX(m + 1), S = a.getX(m + 2);
        i = sr(this, o, t, n, c, h, u, T, w, S), i && (i.faceIndex = Math.floor(m / 3), e.push(i));
      }
    }
    else if (l !== void 0) if (Array.isArray(o)) for (let g = 0, _ = d.length; g < _; g++) {
      const m = d[g], p = o[m.materialIndex], T = Math.max(m.start, f.start), w = Math.min(l.count, Math.min(m.start + m.count, f.start + f.count));
      for (let S = T, U = w; S < U; S += 3) {
        const C = S, R = S + 1, F = S + 2;
        i = sr(this, p, t, n, c, h, u, C, R, F), i && (i.faceIndex = Math.floor(S / 3), i.face.materialIndex = m.materialIndex, e.push(i));
      }
    }
    else {
      const g = Math.max(0, f.start), _ = Math.min(l.count, f.start + f.count);
      for (let m = g, p = _; m < p; m += 3) {
        const T = m, w = m + 1, S = m + 2;
        i = sr(this, o, t, n, c, h, u, T, w, S), i && (i.faceIndex = Math.floor(m / 3), e.push(i));
      }
    }
  }
}
function od(s, t, e, n, i, r, o, a) {
  let l;
  if (t.side === Ve ? l = n.intersectTriangle(o, r, i, true, a) : l = n.intersectTriangle(i, r, o, t.side === Qn, a), l === null) return null;
  ir.copy(a), ir.applyMatrix4(s.matrixWorld);
  const c = e.ray.origin.distanceTo(ir);
  return c < e.near || c > e.far ? null : { distance: c, point: ir.clone(), object: s };
}
function sr(s, t, e, n, i, r, o, a, l, c) {
  s.getVertexPosition(a, Qs), s.getVertexPosition(l, tr), s.getVertexPosition(c, er);
  const h = od(s, t, e, n, Qs, tr, er, Al);
  if (h) {
    const u = new b();
    tn.getBarycoord(Al, Qs, tr, er, u), i && (h.uv = tn.getInterpolatedAttribute(i, a, l, c, u, new Mt())), r && (h.uv1 = tn.getInterpolatedAttribute(r, a, l, c, u, new Mt())), o && (h.normal = tn.getInterpolatedAttribute(o, a, l, c, u, new b()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const d = { a, b: l, c, normal: new b(), materialIndex: 0 };
    tn.getNormal(Qs, tr, er, d.normal), h.face = d, h.barycoord = u;
  }
  return h;
}
class us extends me {
  constructor(t = 1, e = 1, n = 1, i = 1, r = 1, o = 1) {
    super(), this.type = "BoxGeometry", this.parameters = { width: t, height: e, depth: n, widthSegments: i, heightSegments: r, depthSegments: o };
    const a = this;
    i = Math.floor(i), r = Math.floor(r), o = Math.floor(o);
    const l = [], c = [], h = [], u = [];
    let d = 0, f = 0;
    g("z", "y", "x", -1, -1, n, e, t, o, r, 0), g("z", "y", "x", 1, -1, n, e, -t, o, r, 1), g("x", "z", "y", 1, 1, t, n, e, i, o, 2), g("x", "z", "y", 1, -1, t, n, -e, i, o, 3), g("x", "y", "z", 1, -1, t, e, n, i, r, 4), g("x", "y", "z", -1, -1, t, e, -n, i, r, 5), this.setIndex(l), this.setAttribute("position", new Ge(c, 3)), this.setAttribute("normal", new Ge(h, 3)), this.setAttribute("uv", new Ge(u, 2));
    function g(_, m, p, T, w, S, U, C, R, F, M) {
      const y = S / R, P = U / F, O = S / 2, N = U / 2, G = C / 2, j = R + 1, V = F + 1;
      let Z = 0, W = 0;
      const it = new b();
      for (let ht = 0; ht < V; ht++) {
        const _t = ht * P - N;
        for (let Ut = 0; Ut < j; Ut++) {
          const jt = Ut * y - O;
          it[_] = jt * T, it[m] = _t * w, it[p] = G, c.push(it.x, it.y, it.z), it[_] = 0, it[m] = 0, it[p] = C > 0 ? 1 : -1, h.push(it.x, it.y, it.z), u.push(Ut / R), u.push(1 - ht / F), Z += 1;
        }
      }
      for (let ht = 0; ht < F; ht++) for (let _t = 0; _t < R; _t++) {
        const Ut = d + _t + j * ht, jt = d + _t + j * (ht + 1), H = d + (_t + 1) + j * (ht + 1), J = d + (_t + 1) + j * ht;
        l.push(Ut, jt, J), l.push(jt, H, J), W += 6;
      }
      a.addGroup(f, W, M), f += W, d += Z;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new us(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
  }
}
function hs(s) {
  const t = {};
  for (const e in s) {
    t[e] = {};
    for (const n in s[e]) {
      const i = s[e][n];
      i && (i.isColor || i.isMatrix3 || i.isMatrix4 || i.isVector2 || i.isVector3 || i.isVector4 || i.isTexture || i.isQuaternion) ? i.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[e][n] = null) : t[e][n] = i.clone() : Array.isArray(i) ? t[e][n] = i.slice() : t[e][n] = i;
    }
  }
  return t;
}
function Le(s) {
  const t = {};
  for (let e = 0; e < s.length; e++) {
    const n = hs(s[e]);
    for (const i in n) t[i] = n[i];
  }
  return t;
}
function ad(s) {
  const t = [];
  for (let e = 0; e < s.length; e++) t.push(s[e].clone());
  return t;
}
function eh(s) {
  const t = s.getRenderTarget();
  return t === null ? s.outputColorSpace : t.isXRRenderTarget === true ? t.texture.colorSpace : $t.workingColorSpace;
}
const Xa = { clone: hs, merge: Le };
var ld = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, cd = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class dn extends wi {
  constructor(t) {
    super(), this.isShaderMaterial = true, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = ld, this.fragmentShader = cd, this.linewidth = 1, this.wireframe = false, this.wireframeLinewidth = 1, this.fog = false, this.lights = false, this.clipping = false, this.forceSinglePass = true, this.extensions = { clipCullDistance: false, multiDraw: false }, this.defaultAttributeValues = { color: [1, 1, 1], uv: [0, 0], uv1: [0, 0] }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = false, this.glslVersion = null, t !== void 0 && this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = hs(t.uniforms), this.uniformsGroups = ad(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    e.glslVersion = this.glslVersion, e.uniforms = {};
    for (const i in this.uniforms) {
      const o = this.uniforms[i].value;
      o && o.isTexture ? e.uniforms[i] = { type: "t", value: o.toJSON(t).uuid } : o && o.isColor ? e.uniforms[i] = { type: "c", value: o.getHex() } : o && o.isVector2 ? e.uniforms[i] = { type: "v2", value: o.toArray() } : o && o.isVector3 ? e.uniforms[i] = { type: "v3", value: o.toArray() } : o && o.isVector4 ? e.uniforms[i] = { type: "v4", value: o.toArray() } : o && o.isMatrix3 ? e.uniforms[i] = { type: "m3", value: o.toArray() } : o && o.isMatrix4 ? e.uniforms[i] = { type: "m4", value: o.toArray() } : e.uniforms[i] = { value: o };
    }
    Object.keys(this.defines).length > 0 && (e.defines = this.defines), e.vertexShader = this.vertexShader, e.fragmentShader = this.fragmentShader, e.lights = this.lights, e.clipping = this.clipping;
    const n = {};
    for (const i in this.extensions) this.extensions[i] === true && (n[i] = true);
    return Object.keys(n).length > 0 && (e.extensions = n), e;
  }
}
class nh extends Ce {
  constructor() {
    super(), this.isCamera = true, this.type = "Camera", this.matrixWorldInverse = new Jt(), this.projectionMatrix = new Jt(), this.projectionMatrixInverse = new Jt(), this.coordinateSystem = Ln;
  }
  copy(t, e) {
    return super.copy(t, e), this.matrixWorldInverse.copy(t.matrixWorldInverse), this.projectionMatrix.copy(t.projectionMatrix), this.projectionMatrixInverse.copy(t.projectionMatrixInverse), this.coordinateSystem = t.coordinateSystem, this;
  }
  getWorldDirection(t) {
    return super.getWorldDirection(t).negate();
  }
  updateMatrixWorld(t) {
    super.updateMatrixWorld(t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(t, e) {
    super.updateWorldMatrix(t, e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Yn = new b(), Cl = new Mt(), Rl = new Mt();
class $e extends nh {
  constructor(t = 50, e = 1, n = 0.1, i = 2e3) {
    super(), this.isPerspectiveCamera = true, this.type = "PerspectiveCamera", this.fov = t, this.zoom = 1, this.near = n, this.far = i, this.focus = 10, this.aspect = e, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(t, e) {
    return super.copy(t, e), this.fov = t.fov, this.zoom = t.zoom, this.near = t.near, this.far = t.far, this.focus = t.focus, this.aspect = t.aspect, this.view = t.view === null ? null : Object.assign({}, t.view), this.filmGauge = t.filmGauge, this.filmOffset = t.filmOffset, this;
  }
  setFocalLength(t) {
    const e = 0.5 * this.getFilmHeight() / t;
    this.fov = Ns * 2 * Math.atan(e), this.updateProjectionMatrix();
  }
  getFocalLength() {
    const t = Math.tan(Is * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / t;
  }
  getEffectiveFOV() {
    return Ns * 2 * Math.atan(Math.tan(Is * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  getViewBounds(t, e, n) {
    Yn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), e.set(Yn.x, Yn.y).multiplyScalar(-t / Yn.z), Yn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(Yn.x, Yn.y).multiplyScalar(-t / Yn.z);
  }
  getViewSize(t, e) {
    return this.getViewBounds(t, Cl, Rl), e.subVectors(Rl, Cl);
  }
  setViewOffset(t, e, n, i, r, o) {
    this.aspect = t / e, this.view === null && (this.view = { enabled: true, fullWidth: 1, fullHeight: 1, offsetX: 0, offsetY: 0, width: 1, height: 1 }), this.view.enabled = true, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = o, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = false), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const t = this.near;
    let e = t * Math.tan(Is * 0.5 * this.fov) / this.zoom, n = 2 * e, i = this.aspect * n, r = -0.5 * i;
    const o = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = o.fullWidth, c = o.fullHeight;
      r += o.offsetX * i / l, e -= o.offsetY * n / c, i *= o.width / l, n *= o.height / c;
    }
    const a = this.filmOffset;
    a !== 0 && (r += t * a / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + i, e, e - n, t, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.fov = this.fov, e.object.zoom = this.zoom, e.object.near = this.near, e.object.far = this.far, e.object.focus = this.focus, e.object.aspect = this.aspect, this.view !== null && (e.object.view = Object.assign({}, this.view)), e.object.filmGauge = this.filmGauge, e.object.filmOffset = this.filmOffset, e;
  }
}
const ki = -90, Hi = 1;
class hd extends Ce {
  constructor(t, e, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const i = new $e(ki, Hi, t, e);
    i.layers = this.layers, this.add(i);
    const r = new $e(ki, Hi, t, e);
    r.layers = this.layers, this.add(r);
    const o = new $e(ki, Hi, t, e);
    o.layers = this.layers, this.add(o);
    const a = new $e(ki, Hi, t, e);
    a.layers = this.layers, this.add(a);
    const l = new $e(ki, Hi, t, e);
    l.layers = this.layers, this.add(l);
    const c = new $e(ki, Hi, t, e);
    c.layers = this.layers, this.add(c);
  }
  updateCoordinateSystem() {
    const t = this.coordinateSystem, e = this.children.concat(), [n, i, r, o, a, l] = e;
    for (const c of e) this.remove(c);
    if (t === Ln) n.up.set(0, 1, 0), n.lookAt(1, 0, 0), i.up.set(0, 1, 0), i.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), o.up.set(0, 0, 1), o.lookAt(0, -1, 0), a.up.set(0, 1, 0), a.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (t === zr) n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), i.up.set(0, -1, 0), i.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), o.up.set(0, 0, -1), o.lookAt(0, -1, 0), a.up.set(0, -1, 0), a.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
    else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + t);
    for (const c of e) this.add(c), c.updateMatrixWorld();
  }
  update(t, e) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: i } = this;
    this.coordinateSystem !== t.coordinateSystem && (this.coordinateSystem = t.coordinateSystem, this.updateCoordinateSystem());
    const [r, o, a, l, c, h] = this.children, u = t.getRenderTarget(), d = t.getActiveCubeFace(), f = t.getActiveMipmapLevel(), g = t.xr.enabled;
    t.xr.enabled = false;
    const _ = n.texture.generateMipmaps;
    n.texture.generateMipmaps = false, t.setRenderTarget(n, 0, i), t.render(e, r), t.setRenderTarget(n, 1, i), t.render(e, o), t.setRenderTarget(n, 2, i), t.render(e, a), t.setRenderTarget(n, 3, i), t.render(e, l), t.setRenderTarget(n, 4, i), t.render(e, c), n.texture.generateMipmaps = _, t.setRenderTarget(n, 5, i), t.render(e, h), t.setRenderTarget(u, d, f), t.xr.enabled = g, n.texture.needsPMREMUpdate = true;
  }
}
class ih extends Ie {
  constructor(t, e, n, i, r, o, a, l, c, h) {
    t = t !== void 0 ? t : [], e = e !== void 0 ? e : rs, super(t, e, n, i, r, o, a, l, c, h), this.isCubeTexture = true, this.flipY = false;
  }
  get images() {
    return this.image;
  }
  set images(t) {
    this.image = t;
  }
}
class ud extends Mi {
  constructor(t = 1, e = {}) {
    super(t, t, e), this.isWebGLCubeRenderTarget = true;
    const n = { width: t, height: t, depth: 1 }, i = [n, n, n, n, n, n];
    this.texture = new ih(i, e.mapping, e.wrapS, e.wrapT, e.magFilter, e.minFilter, e.format, e.type, e.anisotropy, e.colorSpace), this.texture.isRenderTargetTexture = true, this.texture.generateMipmaps = e.generateMipmaps !== void 0 ? e.generateMipmaps : false, this.texture.minFilter = e.minFilter !== void 0 ? e.minFilter : xn;
  }
  fromEquirectangularTexture(t, e) {
    this.texture.type = e.type, this.texture.colorSpace = e.colorSpace, this.texture.generateMipmaps = e.generateMipmaps, this.texture.minFilter = e.minFilter, this.texture.magFilter = e.magFilter;
    const n = { uniforms: { tEquirect: { value: null } }, vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`, fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			` }, i = new us(5, 5, 5), r = new dn({ name: "CubemapFromEquirect", uniforms: hs(n.uniforms), vertexShader: n.vertexShader, fragmentShader: n.fragmentShader, side: Ve, blending: Kn });
    r.uniforms.tEquirect.value = e;
    const o = new He(i, r), a = e.minFilter;
    return e.minFilter === xi && (e.minFilter = xn), new hd(1, 10, this).update(t, o), e.minFilter = a, o.geometry.dispose(), o.material.dispose(), this;
  }
  clear(t, e, n, i) {
    const r = t.getRenderTarget();
    for (let o = 0; o < 6; o++) t.setRenderTarget(this, o), t.clear(e, n, i);
    t.setRenderTarget(r);
  }
}
class Dn extends Ce {
  constructor() {
    super(), this.isGroup = true, this.type = "Group";
  }
}
const dd = { type: "move" };
class vo {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new Dn(), this._hand.matrixAutoUpdate = false, this._hand.visible = false, this._hand.joints = {}, this._hand.inputState = { pinching: false }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Dn(), this._targetRay.matrixAutoUpdate = false, this._targetRay.visible = false, this._targetRay.hasLinearVelocity = false, this._targetRay.linearVelocity = new b(), this._targetRay.hasAngularVelocity = false, this._targetRay.angularVelocity = new b()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new Dn(), this._grip.matrixAutoUpdate = false, this._grip.visible = false, this._grip.hasLinearVelocity = false, this._grip.linearVelocity = new b(), this._grip.hasAngularVelocity = false, this._grip.angularVelocity = new b()), this._grip;
  }
  dispatchEvent(t) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(t), this._grip !== null && this._grip.dispatchEvent(t), this._hand !== null && this._hand.dispatchEvent(t), this;
  }
  connect(t) {
    if (t && t.hand) {
      const e = this._hand;
      if (e) for (const n of t.hand.values()) this._getHandJoint(e, n);
    }
    return this.dispatchEvent({ type: "connected", data: t }), this;
  }
  disconnect(t) {
    return this.dispatchEvent({ type: "disconnected", data: t }), this._targetRay !== null && (this._targetRay.visible = false), this._grip !== null && (this._grip.visible = false), this._hand !== null && (this._hand.visible = false), this;
  }
  update(t, e, n) {
    let i = null, r = null, o = null;
    const a = this._targetRay, l = this._grip, c = this._hand;
    if (t && e.session.visibilityState !== "visible-blurred") {
      if (c && t.hand) {
        o = true;
        for (const _ of t.hand.values()) {
          const m = e.getJointPose(_, n), p = this._getHandJoint(c, _);
          m !== null && (p.matrix.fromArray(m.transform.matrix), p.matrix.decompose(p.position, p.rotation, p.scale), p.matrixWorldNeedsUpdate = true, p.jointRadius = m.radius), p.visible = m !== null;
        }
        const h = c.joints["index-finger-tip"], u = c.joints["thumb-tip"], d = h.position.distanceTo(u.position), f = 0.02, g = 5e-3;
        c.inputState.pinching && d > f + g ? (c.inputState.pinching = false, this.dispatchEvent({ type: "pinchend", handedness: t.handedness, target: this })) : !c.inputState.pinching && d <= f - g && (c.inputState.pinching = true, this.dispatchEvent({ type: "pinchstart", handedness: t.handedness, target: this }));
      } else l !== null && t.gripSpace && (r = e.getPose(t.gripSpace, n), r !== null && (l.matrix.fromArray(r.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = true, r.linearVelocity ? (l.hasLinearVelocity = true, l.linearVelocity.copy(r.linearVelocity)) : l.hasLinearVelocity = false, r.angularVelocity ? (l.hasAngularVelocity = true, l.angularVelocity.copy(r.angularVelocity)) : l.hasAngularVelocity = false));
      a !== null && (i = e.getPose(t.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (a.matrix.fromArray(i.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), a.matrixWorldNeedsUpdate = true, i.linearVelocity ? (a.hasLinearVelocity = true, a.linearVelocity.copy(i.linearVelocity)) : a.hasLinearVelocity = false, i.angularVelocity ? (a.hasAngularVelocity = true, a.angularVelocity.copy(i.angularVelocity)) : a.hasAngularVelocity = false, this.dispatchEvent(dd)));
    }
    return a !== null && (a.visible = i !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = o !== null), this;
  }
  _getHandJoint(t, e) {
    if (t.joints[e.jointName] === void 0) {
      const n = new Dn();
      n.matrixAutoUpdate = false, n.visible = false, t.joints[e.jointName] = n, t.add(n);
    }
    return t.joints[e.jointName];
  }
}
class fd extends Ce {
  constructor() {
    super(), this.isScene = true, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new zn(), this.environmentIntensity = 1, this.environmentRotation = new zn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(t, e) {
    return super.copy(t, e), t.background !== null && (this.background = t.background.clone()), t.environment !== null && (this.environment = t.environment.clone()), t.fog !== null && (this.fog = t.fog.clone()), this.backgroundBlurriness = t.backgroundBlurriness, this.backgroundIntensity = t.backgroundIntensity, this.backgroundRotation.copy(t.backgroundRotation), this.environmentIntensity = t.environmentIntensity, this.environmentRotation.copy(t.environmentRotation), t.overrideMaterial !== null && (this.overrideMaterial = t.overrideMaterial.clone()), this.matrixAutoUpdate = t.matrixAutoUpdate, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.fog !== null && (e.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (e.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (e.object.backgroundIntensity = this.backgroundIntensity), e.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (e.object.environmentIntensity = this.environmentIntensity), e.object.environmentRotation = this.environmentRotation.toArray(), e;
  }
}
class sh {
  constructor(t, e) {
    this.isInterleavedBuffer = true, this.array = t, this.stride = e, this.count = t !== void 0 ? t.length / e : 0, this.usage = Ra, this.updateRanges = [], this.version = 0, this.uuid = Fn();
  }
  onUploadCallback() {
  }
  set needsUpdate(t) {
    t === true && this.version++;
  }
  setUsage(t) {
    return this.usage = t, this;
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(t) {
    return this.array = new t.array.constructor(t.array), this.count = t.count, this.stride = t.stride, this.usage = t.usage, this;
  }
  copyAt(t, e, n) {
    t *= this.stride, n *= e.stride;
    for (let i = 0, r = this.stride; i < r; i++) this.array[t + i] = e.array[n + i];
    return this;
  }
  set(t, e = 0) {
    return this.array.set(t, e), this;
  }
  clone(t) {
    t.arrayBuffers === void 0 && (t.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = Fn()), t.arrayBuffers[this.array.buffer._uuid] === void 0 && (t.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
    const e = new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]), n = new this.constructor(e, this.stride);
    return n.setUsage(this.usage), n;
  }
  onUpload(t) {
    return this.onUploadCallback = t, this;
  }
  toJSON(t) {
    return t.arrayBuffers === void 0 && (t.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = Fn()), t.arrayBuffers[this.array.buffer._uuid] === void 0 && (t.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), { uuid: this.uuid, buffer: this.array.buffer._uuid, type: this.array.constructor.name, stride: this.stride };
  }
}
const Pe = new b();
class yn {
  constructor(t, e, n, i = false) {
    this.isInterleavedBufferAttribute = true, this.name = "", this.data = t, this.itemSize = e, this.offset = n, this.normalized = i;
  }
  get count() {
    return this.data.count;
  }
  get array() {
    return this.data.array;
  }
  set needsUpdate(t) {
    this.data.needsUpdate = t;
  }
  applyMatrix4(t) {
    for (let e = 0, n = this.data.count; e < n; e++) Pe.fromBufferAttribute(this, e), Pe.applyMatrix4(t), this.setXYZ(e, Pe.x, Pe.y, Pe.z);
    return this;
  }
  applyNormalMatrix(t) {
    for (let e = 0, n = this.count; e < n; e++) Pe.fromBufferAttribute(this, e), Pe.applyNormalMatrix(t), this.setXYZ(e, Pe.x, Pe.y, Pe.z);
    return this;
  }
  transformDirection(t) {
    for (let e = 0, n = this.count; e < n; e++) Pe.fromBufferAttribute(this, e), Pe.transformDirection(t), this.setXYZ(e, Pe.x, Pe.y, Pe.z);
    return this;
  }
  getComponent(t, e) {
    let n = this.array[t * this.data.stride + this.offset + e];
    return this.normalized && (n = ln(n, this.array)), n;
  }
  setComponent(t, e, n) {
    return this.normalized && (n = te(n, this.array)), this.data.array[t * this.data.stride + this.offset + e] = n, this;
  }
  setX(t, e) {
    return this.normalized && (e = te(e, this.array)), this.data.array[t * this.data.stride + this.offset] = e, this;
  }
  setY(t, e) {
    return this.normalized && (e = te(e, this.array)), this.data.array[t * this.data.stride + this.offset + 1] = e, this;
  }
  setZ(t, e) {
    return this.normalized && (e = te(e, this.array)), this.data.array[t * this.data.stride + this.offset + 2] = e, this;
  }
  setW(t, e) {
    return this.normalized && (e = te(e, this.array)), this.data.array[t * this.data.stride + this.offset + 3] = e, this;
  }
  getX(t) {
    let e = this.data.array[t * this.data.stride + this.offset];
    return this.normalized && (e = ln(e, this.array)), e;
  }
  getY(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 1];
    return this.normalized && (e = ln(e, this.array)), e;
  }
  getZ(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 2];
    return this.normalized && (e = ln(e, this.array)), e;
  }
  getW(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 3];
    return this.normalized && (e = ln(e, this.array)), e;
  }
  setXY(t, e, n) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = te(e, this.array), n = te(n, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = n, this;
  }
  setXYZ(t, e, n, i) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = te(e, this.array), n = te(n, this.array), i = te(i, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = n, this.data.array[t + 2] = i, this;
  }
  setXYZW(t, e, n, i, r) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = te(e, this.array), n = te(n, this.array), i = te(i, this.array), r = te(r, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = n, this.data.array[t + 2] = i, this.data.array[t + 3] = r, this;
  }
  clone(t) {
    if (t === void 0) {
      console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
      const e = [];
      for (let n = 0; n < this.count; n++) {
        const i = n * this.data.stride + this.offset;
        for (let r = 0; r < this.itemSize; r++) e.push(this.data.array[i + r]);
      }
      return new ce(new this.array.constructor(e), this.itemSize, this.normalized);
    } else return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.clone(t)), new yn(t.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
  }
  toJSON(t) {
    if (t === void 0) {
      console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
      const e = [];
      for (let n = 0; n < this.count; n++) {
        const i = n * this.data.stride + this.offset;
        for (let r = 0; r < this.itemSize; r++) e.push(this.data.array[i + r]);
      }
      return { itemSize: this.itemSize, type: this.array.constructor.name, array: e, normalized: this.normalized };
    } else return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.toJSON(t)), { isInterleavedBufferAttribute: true, itemSize: this.itemSize, data: this.data.uuid, offset: this.offset, normalized: this.normalized };
  }
}
class rh extends wi {
  constructor(t) {
    super(), this.isSpriteMaterial = true, this.type = "SpriteMaterial", this.color = new zt(16777215), this.map = null, this.alphaMap = null, this.rotation = 0, this.sizeAttenuation = true, this.transparent = true, this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.rotation = t.rotation, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
  }
}
let Vi;
const Ss = new b(), Gi = new b(), Wi = new b(), Xi = new Mt(), Ms = new Mt(), oh = new Jt(), rr = new b(), Es = new b(), or = new b(), Pl = new Mt(), xo = new Mt(), Ll = new Mt();
class pd extends Ce {
  constructor(t = new rh()) {
    if (super(), this.isSprite = true, this.type = "Sprite", Vi === void 0) {
      Vi = new me();
      const e = new Float32Array([-0.5, -0.5, 0, 0, 0, 0.5, -0.5, 0, 1, 0, 0.5, 0.5, 0, 1, 1, -0.5, 0.5, 0, 0, 1]), n = new sh(e, 5);
      Vi.setIndex([0, 1, 2, 0, 2, 3]), Vi.setAttribute("position", new yn(n, 3, 0, false)), Vi.setAttribute("uv", new yn(n, 2, 3, false));
    }
    this.geometry = Vi, this.material = t, this.center = new Mt(0.5, 0.5);
  }
  raycast(t, e) {
    t.camera === null && console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'), Gi.setFromMatrixScale(this.matrixWorld), oh.copy(t.camera.matrixWorld), this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse, this.matrixWorld), Wi.setFromMatrixPosition(this.modelViewMatrix), t.camera.isPerspectiveCamera && this.material.sizeAttenuation === false && Gi.multiplyScalar(-Wi.z);
    const n = this.material.rotation;
    let i, r;
    n !== 0 && (r = Math.cos(n), i = Math.sin(n));
    const o = this.center;
    ar(rr.set(-0.5, -0.5, 0), Wi, o, Gi, i, r), ar(Es.set(0.5, -0.5, 0), Wi, o, Gi, i, r), ar(or.set(0.5, 0.5, 0), Wi, o, Gi, i, r), Pl.set(0, 0), xo.set(1, 0), Ll.set(1, 1);
    let a = t.ray.intersectTriangle(rr, Es, or, false, Ss);
    if (a === null && (ar(Es.set(-0.5, 0.5, 0), Wi, o, Gi, i, r), xo.set(0, 1), a = t.ray.intersectTriangle(rr, or, Es, false, Ss), a === null)) return;
    const l = t.ray.origin.distanceTo(Ss);
    l < t.near || l > t.far || e.push({ distance: l, point: Ss.clone(), uv: tn.getInterpolation(Ss, rr, Es, or, Pl, xo, Ll, new Mt()), face: null, object: this });
  }
  copy(t, e) {
    return super.copy(t, e), t.center !== void 0 && this.center.copy(t.center), this.material = t.material, this;
  }
}
function ar(s, t, e, n, i, r) {
  Xi.subVectors(s, e).addScalar(0.5).multiply(n), i !== void 0 ? (Ms.x = r * Xi.x - i * Xi.y, Ms.y = i * Xi.x + r * Xi.y) : Ms.copy(Xi), s.copy(t), s.x += Ms.x, s.y += Ms.y, s.applyMatrix4(oh);
}
const yo = new b(), md = new b(), gd = new Dt();
class Rn {
  constructor(t = new b(1, 0, 0), e = 0) {
    this.isPlane = true, this.normal = t, this.constant = e;
  }
  set(t, e) {
    return this.normal.copy(t), this.constant = e, this;
  }
  setComponents(t, e, n, i) {
    return this.normal.set(t, e, n), this.constant = i, this;
  }
  setFromNormalAndCoplanarPoint(t, e) {
    return this.normal.copy(t), this.constant = -e.dot(this.normal), this;
  }
  setFromCoplanarPoints(t, e, n) {
    const i = yo.subVectors(n, e).cross(md.subVectors(t, e)).normalize();
    return this.setFromNormalAndCoplanarPoint(i, t), this;
  }
  copy(t) {
    return this.normal.copy(t.normal), this.constant = t.constant, this;
  }
  normalize() {
    const t = 1 / this.normal.length();
    return this.normal.multiplyScalar(t), this.constant *= t, this;
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  distanceToPoint(t) {
    return this.normal.dot(t) + this.constant;
  }
  distanceToSphere(t) {
    return this.distanceToPoint(t.center) - t.radius;
  }
  projectPoint(t, e) {
    return e.copy(t).addScaledVector(this.normal, -this.distanceToPoint(t));
  }
  intersectLine(t, e) {
    const n = t.delta(yo), i = this.normal.dot(n);
    if (i === 0) return this.distanceToPoint(t.start) === 0 ? e.copy(t.start) : null;
    const r = -(t.start.dot(this.normal) + this.constant) / i;
    return r < 0 || r > 1 ? null : e.copy(t.start).addScaledVector(n, r);
  }
  intersectsLine(t) {
    const e = this.distanceToPoint(t.start), n = this.distanceToPoint(t.end);
    return e < 0 && n > 0 || n < 0 && e > 0;
  }
  intersectsBox(t) {
    return t.intersectsPlane(this);
  }
  intersectsSphere(t) {
    return t.intersectsPlane(this);
  }
  coplanarPoint(t) {
    return t.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(t, e) {
    const n = e || gd.getNormalMatrix(t), i = this.coplanarPoint(yo).applyMatrix4(t), r = this.normal.applyMatrix3(n).normalize();
    return this.constant = -i.dot(r), this;
  }
  translate(t) {
    return this.constant -= t.dot(this.normal), this;
  }
  equals(t) {
    return t.normal.equals(this.normal) && t.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const ai = new hn(), lr = new b();
class Ya {
  constructor(t = new Rn(), e = new Rn(), n = new Rn(), i = new Rn(), r = new Rn(), o = new Rn()) {
    this.planes = [t, e, n, i, r, o];
  }
  set(t, e, n, i, r, o) {
    const a = this.planes;
    return a[0].copy(t), a[1].copy(e), a[2].copy(n), a[3].copy(i), a[4].copy(r), a[5].copy(o), this;
  }
  copy(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) e[n].copy(t.planes[n]);
    return this;
  }
  setFromProjectionMatrix(t, e = Ln) {
    const n = this.planes, i = t.elements, r = i[0], o = i[1], a = i[2], l = i[3], c = i[4], h = i[5], u = i[6], d = i[7], f = i[8], g = i[9], _ = i[10], m = i[11], p = i[12], T = i[13], w = i[14], S = i[15];
    if (n[0].setComponents(l - r, d - c, m - f, S - p).normalize(), n[1].setComponents(l + r, d + c, m + f, S + p).normalize(), n[2].setComponents(l + o, d + h, m + g, S + T).normalize(), n[3].setComponents(l - o, d - h, m - g, S - T).normalize(), n[4].setComponents(l - a, d - u, m - _, S - w).normalize(), e === Ln) n[5].setComponents(l + a, d + u, m + _, S + w).normalize();
    else if (e === zr) n[5].setComponents(a, u, _, w).normalize();
    else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + e);
    return this;
  }
  intersectsObject(t) {
    if (t.boundingSphere !== void 0) t.boundingSphere === null && t.computeBoundingSphere(), ai.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
    else {
      const e = t.geometry;
      e.boundingSphere === null && e.computeBoundingSphere(), ai.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
    }
    return this.intersectsSphere(ai);
  }
  intersectsSprite(t) {
    return ai.center.set(0, 0, 0), ai.radius = 0.7071067811865476, ai.applyMatrix4(t.matrixWorld), this.intersectsSphere(ai);
  }
  intersectsSphere(t) {
    const e = this.planes, n = t.center, i = -t.radius;
    for (let r = 0; r < 6; r++) if (e[r].distanceToPoint(n) < i) return false;
    return true;
  }
  intersectsBox(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) {
      const i = e[n];
      if (lr.x = i.normal.x > 0 ? t.max.x : t.min.x, lr.y = i.normal.y > 0 ? t.max.y : t.min.y, lr.z = i.normal.z > 0 ? t.max.z : t.min.z, i.distanceToPoint(lr) < 0) return false;
    }
    return true;
  }
  containsPoint(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) if (e[n].distanceToPoint(t) < 0) return false;
    return true;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class ds extends wi {
  constructor(t) {
    super(), this.isLineBasicMaterial = true, this.type = "LineBasicMaterial", this.color = new zt(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
  }
}
const Hr = new b(), Vr = new b(), Dl = new Jt(), bs = new Bs(), cr = new hn(), So = new b(), Il = new b();
class ah extends Ce {
  constructor(t = new me(), e = new ds()) {
    super(), this.isLine = true, this.type = "Line", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  computeLineDistances() {
    const t = this.geometry;
    if (t.index === null) {
      const e = t.attributes.position, n = [0];
      for (let i = 1, r = e.count; i < r; i++) Hr.fromBufferAttribute(e, i - 1), Vr.fromBufferAttribute(e, i), n[i] = n[i - 1], n[i] += Hr.distanceTo(Vr);
      t.setAttribute("lineDistance", new Ge(n, 1));
    } else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(t, e) {
    const n = this.geometry, i = this.matrixWorld, r = t.params.Line.threshold, o = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), cr.copy(n.boundingSphere), cr.applyMatrix4(i), cr.radius += r, t.ray.intersectsSphere(cr) === false) return;
    Dl.copy(i).invert(), bs.copy(t.ray).applyMatrix4(Dl);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = a * a, c = this.isLineSegments ? 2 : 1, h = n.index, d = n.attributes.position;
    if (h !== null) {
      const f = Math.max(0, o.start), g = Math.min(h.count, o.start + o.count);
      for (let _ = f, m = g - 1; _ < m; _ += c) {
        const p = h.getX(_), T = h.getX(_ + 1), w = hr(this, t, bs, l, p, T, _);
        w && e.push(w);
      }
      if (this.isLineLoop) {
        const _ = h.getX(g - 1), m = h.getX(f), p = hr(this, t, bs, l, _, m, g - 1);
        p && e.push(p);
      }
    } else {
      const f = Math.max(0, o.start), g = Math.min(d.count, o.start + o.count);
      for (let _ = f, m = g - 1; _ < m; _ += c) {
        const p = hr(this, t, bs, l, _, _ + 1, _);
        p && e.push(p);
      }
      if (this.isLineLoop) {
        const _ = hr(this, t, bs, l, g - 1, f, g - 1);
        _ && e.push(_);
      }
    }
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, n = Object.keys(e);
    if (n.length > 0) {
      const i = e[n[0]];
      if (i !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, o = i.length; r < o; r++) {
          const a = i[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[a] = r;
        }
      }
    }
  }
}
function hr(s, t, e, n, i, r, o) {
  const a = s.geometry.attributes.position;
  if (Hr.fromBufferAttribute(a, i), Vr.fromBufferAttribute(a, r), e.distanceSqToSegment(Hr, Vr, So, Il) > n) return;
  So.applyMatrix4(s.matrixWorld);
  const c = t.ray.origin.distanceTo(So);
  if (!(c < t.near || c > t.far)) return { distance: c, point: Il.clone().applyMatrix4(s.matrixWorld), index: o, face: null, faceIndex: null, barycoord: null, object: s };
}
const Ul = new b(), Fl = new b();
class qa extends ah {
  constructor(t, e) {
    super(t, e), this.isLineSegments = true, this.type = "LineSegments";
  }
  computeLineDistances() {
    const t = this.geometry;
    if (t.index === null) {
      const e = t.attributes.position, n = [];
      for (let i = 0, r = e.count; i < r; i += 2) Ul.fromBufferAttribute(e, i), Fl.fromBufferAttribute(e, i + 1), n[i] = i === 0 ? 0 : n[i - 1], n[i + 1] = n[i] + Ul.distanceTo(Fl);
      t.setAttribute("lineDistance", new Ge(n, 1));
    } else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class _d extends wi {
  constructor(t) {
    super(), this.isPointsMaterial = true, this.type = "PointsMaterial", this.color = new zt(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = true, this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.size = t.size, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
  }
}
const Nl = new Jt(), Pa = new Bs(), ur = new hn(), dr = new b();
class Mo extends Ce {
  constructor(t = new me(), e = new _d()) {
    super(), this.isPoints = true, this.type = "Points", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  raycast(t, e) {
    const n = this.geometry, i = this.matrixWorld, r = t.params.Points.threshold, o = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), ur.copy(n.boundingSphere), ur.applyMatrix4(i), ur.radius += r, t.ray.intersectsSphere(ur) === false) return;
    Nl.copy(i).invert(), Pa.copy(t.ray).applyMatrix4(Nl);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = a * a, c = n.index, u = n.attributes.position;
    if (c !== null) {
      const d = Math.max(0, o.start), f = Math.min(c.count, o.start + o.count);
      for (let g = d, _ = f; g < _; g++) {
        const m = c.getX(g);
        dr.fromBufferAttribute(u, m), Ol(dr, m, l, i, t, e, this);
      }
    } else {
      const d = Math.max(0, o.start), f = Math.min(u.count, o.start + o.count);
      for (let g = d, _ = f; g < _; g++) dr.fromBufferAttribute(u, g), Ol(dr, g, l, i, t, e, this);
    }
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, n = Object.keys(e);
    if (n.length > 0) {
      const i = e[n[0]];
      if (i !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, o = i.length; r < o; r++) {
          const a = i[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[a] = r;
        }
      }
    }
  }
}
function Ol(s, t, e, n, i, r, o) {
  const a = Pa.distanceSqToPoint(s);
  if (a < e) {
    const l = new b();
    Pa.closestPointToPoint(s, l), l.applyMatrix4(n);
    const c = i.ray.origin.distanceTo(l);
    if (c < i.near || c > i.far) return;
    r.push({ distance: c, distanceToRay: Math.sqrt(a), point: l, index: t, face: null, faceIndex: null, barycoord: null, object: o });
  }
}
class $a extends Ie {
  constructor(t, e, n, i, r, o, a, l, c) {
    super(t, e, n, i, r, o, a, l, c), this.isCanvasTexture = true, this.needsUpdate = true;
  }
}
class lh extends Ie {
  constructor(t, e, n, i, r, o, a, l, c, h = ns) {
    if (h !== ns && h !== ls) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    n === void 0 && h === ns && (n = Si), n === void 0 && h === ls && (n = as), super(null, i, r, o, a, l, h, n, c), this.isDepthTexture = true, this.image = { width: t, height: e }, this.magFilter = a !== void 0 ? a : un, this.minFilter = l !== void 0 ? l : un, this.flipY = false, this.generateMipmaps = false, this.compareFunction = null;
  }
  copy(t) {
    return super.copy(t), this.source = new Ga(Object.assign({}, t.image)), this.compareFunction = t.compareFunction, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e;
  }
}
class Ti extends me {
  constructor(t = 1, e = 1, n = 1, i = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = { width: t, height: e, widthSegments: n, heightSegments: i };
    const r = t / 2, o = e / 2, a = Math.floor(n), l = Math.floor(i), c = a + 1, h = l + 1, u = t / a, d = e / l, f = [], g = [], _ = [], m = [];
    for (let p = 0; p < h; p++) {
      const T = p * d - o;
      for (let w = 0; w < c; w++) {
        const S = w * u - r;
        g.push(S, -T, 0), _.push(0, 0, 1), m.push(w / a), m.push(1 - p / l);
      }
    }
    for (let p = 0; p < l; p++) for (let T = 0; T < a; T++) {
      const w = T + c * p, S = T + c * (p + 1), U = T + 1 + c * (p + 1), C = T + 1 + c * p;
      f.push(w, S, C), f.push(S, U, C);
    }
    this.setIndex(f), this.setAttribute("position", new Ge(g, 3)), this.setAttribute("normal", new Ge(_, 3)), this.setAttribute("uv", new Ge(m, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Ti(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}
class vd extends me {
  constructor(t = null) {
    if (super(), this.type = "WireframeGeometry", this.parameters = { geometry: t }, t !== null) {
      const e = [], n = /* @__PURE__ */ new Set(), i = new b(), r = new b();
      if (t.index !== null) {
        const o = t.attributes.position, a = t.index;
        let l = t.groups;
        l.length === 0 && (l = [{ start: 0, count: a.count, materialIndex: 0 }]);
        for (let c = 0, h = l.length; c < h; ++c) {
          const u = l[c], d = u.start, f = u.count;
          for (let g = d, _ = d + f; g < _; g += 3) for (let m = 0; m < 3; m++) {
            const p = a.getX(g + m), T = a.getX(g + (m + 1) % 3);
            i.fromBufferAttribute(o, p), r.fromBufferAttribute(o, T), Bl(i, r, n) === true && (e.push(i.x, i.y, i.z), e.push(r.x, r.y, r.z));
          }
        }
      } else {
        const o = t.attributes.position;
        for (let a = 0, l = o.count / 3; a < l; a++) for (let c = 0; c < 3; c++) {
          const h = 3 * a + c, u = 3 * a + (c + 1) % 3;
          i.fromBufferAttribute(o, h), r.fromBufferAttribute(o, u), Bl(i, r, n) === true && (e.push(i.x, i.y, i.z), e.push(r.x, r.y, r.z));
        }
      }
      this.setAttribute("position", new Ge(e, 3));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
}
function Bl(s, t, e) {
  const n = `${s.x},${s.y},${s.z}-${t.x},${t.y},${t.z}`, i = `${t.x},${t.y},${t.z}-${s.x},${s.y},${s.z}`;
  return e.has(n) === true || e.has(i) === true ? false : (e.add(n), e.add(i), true);
}
class xd extends wi {
  constructor(t) {
    super(), this.isMeshDepthMaterial = true, this.type = "MeshDepthMaterial", this.depthPacking = fu, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = false, this.wireframeLinewidth = 1, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this;
  }
}
class yd extends wi {
  constructor(t) {
    super(), this.isMeshDistanceMaterial = true, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this;
  }
}
class an extends nh {
  constructor(t = -1, e = 1, n = 1, i = -1, r = 0.1, o = 2e3) {
    super(), this.isOrthographicCamera = true, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = t, this.right = e, this.top = n, this.bottom = i, this.near = r, this.far = o, this.updateProjectionMatrix();
  }
  copy(t, e) {
    return super.copy(t, e), this.left = t.left, this.right = t.right, this.top = t.top, this.bottom = t.bottom, this.near = t.near, this.far = t.far, this.zoom = t.zoom, this.view = t.view === null ? null : Object.assign({}, t.view), this;
  }
  setViewOffset(t, e, n, i, r, o) {
    this.view === null && (this.view = { enabled: true, fullWidth: 1, fullHeight: 1, offsetX: 0, offsetY: 0, width: 1, height: 1 }), this.view.enabled = true, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = o, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = false), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const t = (this.right - this.left) / (2 * this.zoom), e = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, i = (this.top + this.bottom) / 2;
    let r = n - t, o = n + t, a = i + e, l = i - e;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom, h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      r += c * this.view.offsetX, o = r + c * this.view.width, a -= h * this.view.offsetY, l = a - h * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(r, o, a, l, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.zoom = this.zoom, e.object.left = this.left, e.object.right = this.right, e.object.top = this.top, e.object.bottom = this.bottom, e.object.near = this.near, e.object.far = this.far, this.view !== null && (e.object.view = Object.assign({}, this.view)), e;
  }
}
class Sd extends me {
  constructor() {
    super(), this.isInstancedBufferGeometry = true, this.type = "InstancedBufferGeometry", this.instanceCount = 1 / 0;
  }
  copy(t) {
    return super.copy(t), this.instanceCount = t.instanceCount, this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.instanceCount = this.instanceCount, t.isInstancedBufferGeometry = true, t;
  }
}
class Md extends $e {
  constructor(t = []) {
    super(), this.isArrayCamera = true, this.cameras = t, this.index = 0;
  }
}
class La extends sh {
  constructor(t, e, n = 1) {
    super(t, e), this.isInstancedInterleavedBuffer = true, this.meshPerAttribute = n;
  }
  copy(t) {
    return super.copy(t), this.meshPerAttribute = t.meshPerAttribute, this;
  }
  clone(t) {
    const e = super.clone(t);
    return e.meshPerAttribute = this.meshPerAttribute, e;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.isInstancedInterleavedBuffer = true, e.meshPerAttribute = this.meshPerAttribute, e;
  }
}
const zl = new Jt();
class Ed {
  constructor(t, e, n = 0, i = 1 / 0) {
    this.ray = new Bs(t, e), this.near = n, this.far = i, this.camera = null, this.layers = new Wa(), this.params = { Mesh: {}, Line: { threshold: 1 }, LOD: {}, Points: { threshold: 1 }, Sprite: {} };
  }
  set(t, e) {
    this.ray.set(t, e);
  }
  setFromCamera(t, e) {
    e.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(t.x, t.y, 0.5).unproject(e).sub(this.ray.origin).normalize(), this.camera = e) : e.isOrthographicCamera ? (this.ray.origin.set(t.x, t.y, (e.near + e.far) / (e.near - e.far)).unproject(e), this.ray.direction.set(0, 0, -1).transformDirection(e.matrixWorld), this.camera = e) : console.error("THREE.Raycaster: Unsupported camera type: " + e.type);
  }
  setFromXRController(t) {
    return zl.identity().extractRotation(t.matrixWorld), this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(zl), this;
  }
  intersectObject(t, e = true, n = []) {
    return Da(t, this, n, e), n.sort(kl), n;
  }
  intersectObjects(t, e = true, n = []) {
    for (let i = 0, r = t.length; i < r; i++) Da(t[i], this, n, e);
    return n.sort(kl), n;
  }
}
function kl(s, t) {
  return s.distance - t.distance;
}
function Da(s, t, e, n) {
  let i = true;
  if (s.layers.test(t.layers) && s.raycast(t, e) === false && (i = false), i === true && n === true) {
    const r = s.children;
    for (let o = 0, a = r.length; o < a; o++) Da(r[o], t, e, true);
  }
}
class Hl {
  constructor(t = 1, e = 0, n = 0) {
    this.radius = t, this.phi = e, this.theta = n;
  }
  set(t, e, n) {
    return this.radius = t, this.phi = e, this.theta = n, this;
  }
  copy(t) {
    return this.radius = t.radius, this.phi = t.phi, this.theta = t.theta, this;
  }
  makeSafe() {
    return this.phi = Ot(this.phi, 1e-6, Math.PI - 1e-6), this;
  }
  setFromVector3(t) {
    return this.setFromCartesianCoords(t.x, t.y, t.z);
  }
  setFromCartesianCoords(t, e, n) {
    return this.radius = Math.sqrt(t * t + e * e + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(t, n), this.phi = Math.acos(Ot(e / this.radius, -1, 1))), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Vl = new b(), fr = new b();
class bd {
  constructor(t = new b(), e = new b()) {
    this.start = t, this.end = e;
  }
  set(t, e) {
    return this.start.copy(t), this.end.copy(e), this;
  }
  copy(t) {
    return this.start.copy(t.start), this.end.copy(t.end), this;
  }
  getCenter(t) {
    return t.addVectors(this.start, this.end).multiplyScalar(0.5);
  }
  delta(t) {
    return t.subVectors(this.end, this.start);
  }
  distanceSq() {
    return this.start.distanceToSquared(this.end);
  }
  distance() {
    return this.start.distanceTo(this.end);
  }
  at(t, e) {
    return this.delta(e).multiplyScalar(t).add(this.start);
  }
  closestPointToPointParameter(t, e) {
    Vl.subVectors(t, this.start), fr.subVectors(this.end, this.start);
    const n = fr.dot(fr);
    let r = fr.dot(Vl) / n;
    return e && (r = Ot(r, 0, 1)), r;
  }
  closestPointToPoint(t, e, n) {
    const i = this.closestPointToPointParameter(t, e);
    return this.delta(n).multiplyScalar(i).add(this.start);
  }
  applyMatrix4(t) {
    return this.start.applyMatrix4(t), this.end.applyMatrix4(t), this;
  }
  equals(t) {
    return t.start.equals(this.start) && t.end.equals(this.end);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class wd extends qa {
  constructor(t = 10, e = 10, n = 4473924, i = 8947848) {
    n = new zt(n), i = new zt(i);
    const r = e / 2, o = t / e, a = t / 2, l = [], c = [];
    for (let d = 0, f = 0, g = -a; d <= e; d++, g += o) {
      l.push(-a, 0, g, a, 0, g), l.push(g, 0, -a, g, 0, a);
      const _ = d === r ? n : i;
      _.toArray(c, f), f += 3, _.toArray(c, f), f += 3, _.toArray(c, f), f += 3, _.toArray(c, f), f += 3;
    }
    const h = new me();
    h.setAttribute("position", new Ge(l, 3)), h.setAttribute("color", new Ge(c, 3));
    const u = new ds({ vertexColors: true, toneMapped: false });
    super(h, u), this.type = "GridHelper";
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
class Td extends bi {
  constructor(t, e = null) {
    super(), this.object = t, this.domElement = e, this.enabled = true, this.state = -1, this.keys = {}, this.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: null }, this.touches = { ONE: null, TWO: null };
  }
  connect() {
  }
  disconnect() {
  }
  dispose() {
  }
  update() {
  }
}
function Gl(s, t, e, n) {
  const i = Ad(n);
  switch (e) {
    case Vc:
      return s * t;
    case Wc:
      return s * t;
    case Xc:
      return s * t * 2;
    case Yc:
      return s * t / i.components * i.byteLength;
    case za:
      return s * t / i.components * i.byteLength;
    case qc:
      return s * t * 2 / i.components * i.byteLength;
    case ka:
      return s * t * 2 / i.components * i.byteLength;
    case Gc:
      return s * t * 3 / i.components * i.byteLength;
    case cn:
      return s * t * 4 / i.components * i.byteLength;
    case Ha:
      return s * t * 4 / i.components * i.byteLength;
    case Lr:
    case Dr:
      return Math.floor((s + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Ir:
    case Ur:
      return Math.floor((s + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case sa:
    case oa:
      return Math.max(s, 16) * Math.max(t, 8) / 4;
    case ia:
    case ra:
      return Math.max(s, 8) * Math.max(t, 8) / 2;
    case aa:
    case la:
      return Math.floor((s + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case ca:
      return Math.floor((s + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case ha:
      return Math.floor((s + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case ua:
      return Math.floor((s + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case da:
      return Math.floor((s + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case fa:
      return Math.floor((s + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case pa:
      return Math.floor((s + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case ma:
      return Math.floor((s + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case ga:
      return Math.floor((s + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case _a:
      return Math.floor((s + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case va:
      return Math.floor((s + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case xa:
      return Math.floor((s + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case ya:
      return Math.floor((s + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case Sa:
      return Math.floor((s + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case Ma:
      return Math.floor((s + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case Ea:
      return Math.floor((s + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    case Fr:
    case ba:
    case wa:
      return Math.ceil(s / 4) * Math.ceil(t / 4) * 16;
    case $c:
    case Ta:
      return Math.ceil(s / 4) * Math.ceil(t / 4) * 8;
    case Aa:
    case Ca:
      return Math.ceil(s / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(`Unable to determine texture byte length for ${e} format.`);
}
function Ad(s) {
  switch (s) {
    case On:
    case zc:
      return { byteLength: 1, components: 1 };
    case Fs:
    case kc:
    case Os:
      return { byteLength: 2, components: 1 };
    case Oa:
    case Ba:
      return { byteLength: 2, components: 4 };
    case Si:
    case Na:
    case Pn:
      return { byteLength: 4, components: 1 };
    case Hc:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${s}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: { revision: Fa } }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = Fa);
/**
* @license
* Copyright 2010-2025 Three.js Authors
* SPDX-License-Identifier: MIT
*/
function ch() {
  let s = null, t = false, e = null, n = null;
  function i(r, o) {
    e(r, o), n = s.requestAnimationFrame(i);
  }
  return { start: function() {
    t !== true && e !== null && (n = s.requestAnimationFrame(i), t = true);
  }, stop: function() {
    s.cancelAnimationFrame(n), t = false;
  }, setAnimationLoop: function(r) {
    e = r;
  }, setContext: function(r) {
    s = r;
  } };
}
function Cd(s) {
  const t = /* @__PURE__ */ new WeakMap();
  function e(a, l) {
    const c = a.array, h = a.usage, u = c.byteLength, d = s.createBuffer();
    s.bindBuffer(l, d), s.bufferData(l, c, h), a.onUploadCallback();
    let f;
    if (c instanceof Float32Array) f = s.FLOAT;
    else if (c instanceof Uint16Array) a.isFloat16BufferAttribute ? f = s.HALF_FLOAT : f = s.UNSIGNED_SHORT;
    else if (c instanceof Int16Array) f = s.SHORT;
    else if (c instanceof Uint32Array) f = s.UNSIGNED_INT;
    else if (c instanceof Int32Array) f = s.INT;
    else if (c instanceof Int8Array) f = s.BYTE;
    else if (c instanceof Uint8Array) f = s.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray) f = s.UNSIGNED_BYTE;
    else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return { buffer: d, type: f, bytesPerElement: c.BYTES_PER_ELEMENT, version: a.version, size: u };
  }
  function n(a, l, c) {
    const h = l.array, u = l.updateRanges;
    if (s.bindBuffer(c, a), u.length === 0) s.bufferSubData(c, 0, h);
    else {
      u.sort((f, g) => f.start - g.start);
      let d = 0;
      for (let f = 1; f < u.length; f++) {
        const g = u[d], _ = u[f];
        _.start <= g.start + g.count + 1 ? g.count = Math.max(g.count, _.start + _.count - g.start) : (++d, u[d] = _);
      }
      u.length = d + 1;
      for (let f = 0, g = u.length; f < g; f++) {
        const _ = u[f];
        s.bufferSubData(c, _.start * h.BYTES_PER_ELEMENT, h, _.start, _.count);
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function i(a) {
    return a.isInterleavedBufferAttribute && (a = a.data), t.get(a);
  }
  function r(a) {
    a.isInterleavedBufferAttribute && (a = a.data);
    const l = t.get(a);
    l && (s.deleteBuffer(l.buffer), t.delete(a));
  }
  function o(a, l) {
    if (a.isInterleavedBufferAttribute && (a = a.data), a.isGLBufferAttribute) {
      const h = t.get(a);
      (!h || h.version < a.version) && t.set(a, { buffer: a.buffer, type: a.type, bytesPerElement: a.elementSize, version: a.version });
      return;
    }
    const c = t.get(a);
    if (c === void 0) t.set(a, e(a, l));
    else if (c.version < a.version) {
      if (c.size !== a.array.byteLength) throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      n(c.buffer, a, l), c.version = a.version;
    }
  }
  return { get: i, remove: r, update: o };
}
var Rd = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, Pd = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`, Ld = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, Dd = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Id = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, Ud = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, Fd = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`, Nd = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, Od = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`, Bd = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, zd = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, kd = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, Hd = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`, Vd = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`, Gd = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`, Wd = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`, Xd = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, Yd = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, qd = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, $d = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, jd = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, Zd = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, Kd = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`, Jd = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`, Qd = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`, tf = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`, ef = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, nf = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, sf = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, rf = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, of = "gl_FragColor = linearToOutputTexel( gl_FragColor );", af = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, lf = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`, cf = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, hf = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`, uf = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, df = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`, ff = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, pf = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, mf = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, gf = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, _f = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`, vf = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, xf = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, yf = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Sf = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`, Mf = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`, Ef = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, bf = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, wf = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, Tf = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, Af = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`, Cf = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`, Rf = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`, Pf = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`, Lf = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, Df = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, If = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Uf = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Ff = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, Nf = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, Of = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, Bf = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`, zf = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, kf = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, Hf = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, Vf = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, Gf = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, Wf = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, Xf = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`, Yf = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, qf = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`, $f = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`, jf = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Zf = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Kf = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, Jf = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`, Qf = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, tp = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, ep = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, np = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, ip = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, sp = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`, rp = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, op = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, ap = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, lp = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, cp = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, hp = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, up = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`, dp = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`, fp = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`, pp = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`, mp = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, gp = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`, _p = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, vp = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`, xp = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, yp = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, Sp = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Mp = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`, Ep = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`, bp = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`, wp = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, Tp = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, Ap = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`, Cp = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const Rp = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, Pp = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Lp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Dp = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Ip = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Up = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Fp = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`, Np = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`, Op = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`, Bp = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`, zp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, kp = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Hp = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, Vp = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, Gp = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`, Wp = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Xp = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Yp = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, qp = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`, $p = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, jp = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`, Zp = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`, Kp = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Jp = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Qp = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`, tm = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, em = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, nm = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, im = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`, sm = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, rm = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, om = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, am = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, lm = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Nt = { alphahash_fragment: Rd, alphahash_pars_fragment: Pd, alphamap_fragment: Ld, alphamap_pars_fragment: Dd, alphatest_fragment: Id, alphatest_pars_fragment: Ud, aomap_fragment: Fd, aomap_pars_fragment: Nd, batching_pars_vertex: Od, batching_vertex: Bd, begin_vertex: zd, beginnormal_vertex: kd, bsdfs: Hd, iridescence_fragment: Vd, bumpmap_pars_fragment: Gd, clipping_planes_fragment: Wd, clipping_planes_pars_fragment: Xd, clipping_planes_pars_vertex: Yd, clipping_planes_vertex: qd, color_fragment: $d, color_pars_fragment: jd, color_pars_vertex: Zd, color_vertex: Kd, common: Jd, cube_uv_reflection_fragment: Qd, defaultnormal_vertex: tf, displacementmap_pars_vertex: ef, displacementmap_vertex: nf, emissivemap_fragment: sf, emissivemap_pars_fragment: rf, colorspace_fragment: of, colorspace_pars_fragment: af, envmap_fragment: lf, envmap_common_pars_fragment: cf, envmap_pars_fragment: hf, envmap_pars_vertex: uf, envmap_physical_pars_fragment: Mf, envmap_vertex: df, fog_vertex: ff, fog_pars_vertex: pf, fog_fragment: mf, fog_pars_fragment: gf, gradientmap_pars_fragment: _f, lightmap_pars_fragment: vf, lights_lambert_fragment: xf, lights_lambert_pars_fragment: yf, lights_pars_begin: Sf, lights_toon_fragment: Ef, lights_toon_pars_fragment: bf, lights_phong_fragment: wf, lights_phong_pars_fragment: Tf, lights_physical_fragment: Af, lights_physical_pars_fragment: Cf, lights_fragment_begin: Rf, lights_fragment_maps: Pf, lights_fragment_end: Lf, logdepthbuf_fragment: Df, logdepthbuf_pars_fragment: If, logdepthbuf_pars_vertex: Uf, logdepthbuf_vertex: Ff, map_fragment: Nf, map_pars_fragment: Of, map_particle_fragment: Bf, map_particle_pars_fragment: zf, metalnessmap_fragment: kf, metalnessmap_pars_fragment: Hf, morphinstance_vertex: Vf, morphcolor_vertex: Gf, morphnormal_vertex: Wf, morphtarget_pars_vertex: Xf, morphtarget_vertex: Yf, normal_fragment_begin: qf, normal_fragment_maps: $f, normal_pars_fragment: jf, normal_pars_vertex: Zf, normal_vertex: Kf, normalmap_pars_fragment: Jf, clearcoat_normal_fragment_begin: Qf, clearcoat_normal_fragment_maps: tp, clearcoat_pars_fragment: ep, iridescence_pars_fragment: np, opaque_fragment: ip, packing: sp, premultiplied_alpha_fragment: rp, project_vertex: op, dithering_fragment: ap, dithering_pars_fragment: lp, roughnessmap_fragment: cp, roughnessmap_pars_fragment: hp, shadowmap_pars_fragment: up, shadowmap_pars_vertex: dp, shadowmap_vertex: fp, shadowmask_pars_fragment: pp, skinbase_vertex: mp, skinning_pars_vertex: gp, skinning_vertex: _p, skinnormal_vertex: vp, specularmap_fragment: xp, specularmap_pars_fragment: yp, tonemapping_fragment: Sp, tonemapping_pars_fragment: Mp, transmission_fragment: Ep, transmission_pars_fragment: bp, uv_pars_fragment: wp, uv_pars_vertex: Tp, uv_vertex: Ap, worldpos_vertex: Cp, background_vert: Rp, background_frag: Pp, backgroundCube_vert: Lp, backgroundCube_frag: Dp, cube_vert: Ip, cube_frag: Up, depth_vert: Fp, depth_frag: Np, distanceRGBA_vert: Op, distanceRGBA_frag: Bp, equirect_vert: zp, equirect_frag: kp, linedashed_vert: Hp, linedashed_frag: Vp, meshbasic_vert: Gp, meshbasic_frag: Wp, meshlambert_vert: Xp, meshlambert_frag: Yp, meshmatcap_vert: qp, meshmatcap_frag: $p, meshnormal_vert: jp, meshnormal_frag: Zp, meshphong_vert: Kp, meshphong_frag: Jp, meshphysical_vert: Qp, meshphysical_frag: tm, meshtoon_vert: em, meshtoon_frag: nm, points_vert: im, points_frag: sm, shadow_vert: rm, shadow_frag: om, sprite_vert: am, sprite_frag: lm }, nt = { common: { diffuse: { value: new zt(16777215) }, opacity: { value: 1 }, map: { value: null }, mapTransform: { value: new Dt() }, alphaMap: { value: null }, alphaMapTransform: { value: new Dt() }, alphaTest: { value: 0 } }, specularmap: { specularMap: { value: null }, specularMapTransform: { value: new Dt() } }, envmap: { envMap: { value: null }, envMapRotation: { value: new Dt() }, flipEnvMap: { value: -1 }, reflectivity: { value: 1 }, ior: { value: 1.5 }, refractionRatio: { value: 0.98 } }, aomap: { aoMap: { value: null }, aoMapIntensity: { value: 1 }, aoMapTransform: { value: new Dt() } }, lightmap: { lightMap: { value: null }, lightMapIntensity: { value: 1 }, lightMapTransform: { value: new Dt() } }, bumpmap: { bumpMap: { value: null }, bumpMapTransform: { value: new Dt() }, bumpScale: { value: 1 } }, normalmap: { normalMap: { value: null }, normalMapTransform: { value: new Dt() }, normalScale: { value: new Mt(1, 1) } }, displacementmap: { displacementMap: { value: null }, displacementMapTransform: { value: new Dt() }, displacementScale: { value: 1 }, displacementBias: { value: 0 } }, emissivemap: { emissiveMap: { value: null }, emissiveMapTransform: { value: new Dt() } }, metalnessmap: { metalnessMap: { value: null }, metalnessMapTransform: { value: new Dt() } }, roughnessmap: { roughnessMap: { value: null }, roughnessMapTransform: { value: new Dt() } }, gradientmap: { gradientMap: { value: null } }, fog: { fogDensity: { value: 25e-5 }, fogNear: { value: 1 }, fogFar: { value: 2e3 }, fogColor: { value: new zt(16777215) } }, lights: { ambientLightColor: { value: [] }, lightProbe: { value: [] }, directionalLights: { value: [], properties: { direction: {}, color: {} } }, directionalLightShadows: { value: [], properties: { shadowIntensity: 1, shadowBias: {}, shadowNormalBias: {}, shadowRadius: {}, shadowMapSize: {} } }, directionalShadowMap: { value: [] }, directionalShadowMatrix: { value: [] }, spotLights: { value: [], properties: { color: {}, position: {}, direction: {}, distance: {}, coneCos: {}, penumbraCos: {}, decay: {} } }, spotLightShadows: { value: [], properties: { shadowIntensity: 1, shadowBias: {}, shadowNormalBias: {}, shadowRadius: {}, shadowMapSize: {} } }, spotLightMap: { value: [] }, spotShadowMap: { value: [] }, spotLightMatrix: { value: [] }, pointLights: { value: [], properties: { color: {}, position: {}, decay: {}, distance: {} } }, pointLightShadows: { value: [], properties: { shadowIntensity: 1, shadowBias: {}, shadowNormalBias: {}, shadowRadius: {}, shadowMapSize: {}, shadowCameraNear: {}, shadowCameraFar: {} } }, pointShadowMap: { value: [] }, pointShadowMatrix: { value: [] }, hemisphereLights: { value: [], properties: { direction: {}, skyColor: {}, groundColor: {} } }, rectAreaLights: { value: [], properties: { color: {}, position: {}, width: {}, height: {} } }, ltc_1: { value: null }, ltc_2: { value: null } }, points: { diffuse: { value: new zt(16777215) }, opacity: { value: 1 }, size: { value: 1 }, scale: { value: 1 }, map: { value: null }, alphaMap: { value: null }, alphaMapTransform: { value: new Dt() }, alphaTest: { value: 0 }, uvTransform: { value: new Dt() } }, sprite: { diffuse: { value: new zt(16777215) }, opacity: { value: 1 }, center: { value: new Mt(0.5, 0.5) }, rotation: { value: 0 }, map: { value: null }, mapTransform: { value: new Dt() }, alphaMap: { value: null }, alphaMapTransform: { value: new Dt() }, alphaTest: { value: 0 } } }, Be = { basic: { uniforms: Le([nt.common, nt.specularmap, nt.envmap, nt.aomap, nt.lightmap, nt.fog]), vertexShader: Nt.meshbasic_vert, fragmentShader: Nt.meshbasic_frag }, lambert: { uniforms: Le([nt.common, nt.specularmap, nt.envmap, nt.aomap, nt.lightmap, nt.emissivemap, nt.bumpmap, nt.normalmap, nt.displacementmap, nt.fog, nt.lights, { emissive: { value: new zt(0) } }]), vertexShader: Nt.meshlambert_vert, fragmentShader: Nt.meshlambert_frag }, phong: { uniforms: Le([nt.common, nt.specularmap, nt.envmap, nt.aomap, nt.lightmap, nt.emissivemap, nt.bumpmap, nt.normalmap, nt.displacementmap, nt.fog, nt.lights, { emissive: { value: new zt(0) }, specular: { value: new zt(1118481) }, shininess: { value: 30 } }]), vertexShader: Nt.meshphong_vert, fragmentShader: Nt.meshphong_frag }, standard: { uniforms: Le([nt.common, nt.envmap, nt.aomap, nt.lightmap, nt.emissivemap, nt.bumpmap, nt.normalmap, nt.displacementmap, nt.roughnessmap, nt.metalnessmap, nt.fog, nt.lights, { emissive: { value: new zt(0) }, roughness: { value: 1 }, metalness: { value: 0 }, envMapIntensity: { value: 1 } }]), vertexShader: Nt.meshphysical_vert, fragmentShader: Nt.meshphysical_frag }, toon: { uniforms: Le([nt.common, nt.aomap, nt.lightmap, nt.emissivemap, nt.bumpmap, nt.normalmap, nt.displacementmap, nt.gradientmap, nt.fog, nt.lights, { emissive: { value: new zt(0) } }]), vertexShader: Nt.meshtoon_vert, fragmentShader: Nt.meshtoon_frag }, matcap: { uniforms: Le([nt.common, nt.bumpmap, nt.normalmap, nt.displacementmap, nt.fog, { matcap: { value: null } }]), vertexShader: Nt.meshmatcap_vert, fragmentShader: Nt.meshmatcap_frag }, points: { uniforms: Le([nt.points, nt.fog]), vertexShader: Nt.points_vert, fragmentShader: Nt.points_frag }, dashed: { uniforms: Le([nt.common, nt.fog, { scale: { value: 1 }, dashSize: { value: 1 }, totalSize: { value: 2 } }]), vertexShader: Nt.linedashed_vert, fragmentShader: Nt.linedashed_frag }, depth: { uniforms: Le([nt.common, nt.displacementmap]), vertexShader: Nt.depth_vert, fragmentShader: Nt.depth_frag }, normal: { uniforms: Le([nt.common, nt.bumpmap, nt.normalmap, nt.displacementmap, { opacity: { value: 1 } }]), vertexShader: Nt.meshnormal_vert, fragmentShader: Nt.meshnormal_frag }, sprite: { uniforms: Le([nt.sprite, nt.fog]), vertexShader: Nt.sprite_vert, fragmentShader: Nt.sprite_frag }, background: { uniforms: { uvTransform: { value: new Dt() }, t2D: { value: null }, backgroundIntensity: { value: 1 } }, vertexShader: Nt.background_vert, fragmentShader: Nt.background_frag }, backgroundCube: { uniforms: { envMap: { value: null }, flipEnvMap: { value: -1 }, backgroundBlurriness: { value: 0 }, backgroundIntensity: { value: 1 }, backgroundRotation: { value: new Dt() } }, vertexShader: Nt.backgroundCube_vert, fragmentShader: Nt.backgroundCube_frag }, cube: { uniforms: { tCube: { value: null }, tFlip: { value: -1 }, opacity: { value: 1 } }, vertexShader: Nt.cube_vert, fragmentShader: Nt.cube_frag }, equirect: { uniforms: { tEquirect: { value: null } }, vertexShader: Nt.equirect_vert, fragmentShader: Nt.equirect_frag }, distanceRGBA: { uniforms: Le([nt.common, nt.displacementmap, { referencePosition: { value: new b() }, nearDistance: { value: 1 }, farDistance: { value: 1e3 } }]), vertexShader: Nt.distanceRGBA_vert, fragmentShader: Nt.distanceRGBA_frag }, shadow: { uniforms: Le([nt.lights, nt.fog, { color: { value: new zt(0) }, opacity: { value: 1 } }]), vertexShader: Nt.shadow_vert, fragmentShader: Nt.shadow_frag } };
Be.physical = { uniforms: Le([Be.standard.uniforms, { clearcoat: { value: 0 }, clearcoatMap: { value: null }, clearcoatMapTransform: { value: new Dt() }, clearcoatNormalMap: { value: null }, clearcoatNormalMapTransform: { value: new Dt() }, clearcoatNormalScale: { value: new Mt(1, 1) }, clearcoatRoughness: { value: 0 }, clearcoatRoughnessMap: { value: null }, clearcoatRoughnessMapTransform: { value: new Dt() }, dispersion: { value: 0 }, iridescence: { value: 0 }, iridescenceMap: { value: null }, iridescenceMapTransform: { value: new Dt() }, iridescenceIOR: { value: 1.3 }, iridescenceThicknessMinimum: { value: 100 }, iridescenceThicknessMaximum: { value: 400 }, iridescenceThicknessMap: { value: null }, iridescenceThicknessMapTransform: { value: new Dt() }, sheen: { value: 0 }, sheenColor: { value: new zt(0) }, sheenColorMap: { value: null }, sheenColorMapTransform: { value: new Dt() }, sheenRoughness: { value: 1 }, sheenRoughnessMap: { value: null }, sheenRoughnessMapTransform: { value: new Dt() }, transmission: { value: 0 }, transmissionMap: { value: null }, transmissionMapTransform: { value: new Dt() }, transmissionSamplerSize: { value: new Mt() }, transmissionSamplerMap: { value: null }, thickness: { value: 0 }, thicknessMap: { value: null }, thicknessMapTransform: { value: new Dt() }, attenuationDistance: { value: 0 }, attenuationColor: { value: new zt(0) }, specularColor: { value: new zt(1, 1, 1) }, specularColorMap: { value: null }, specularColorMapTransform: { value: new Dt() }, specularIntensity: { value: 1 }, specularIntensityMap: { value: null }, specularIntensityMapTransform: { value: new Dt() }, anisotropyVector: { value: new Mt() }, anisotropyMap: { value: null }, anisotropyMapTransform: { value: new Dt() } }]), vertexShader: Nt.meshphysical_vert, fragmentShader: Nt.meshphysical_frag };
const pr = { r: 0, b: 0, g: 0 }, li = new zn(), cm = new Jt();
function hm(s, t, e, n, i, r, o) {
  const a = new zt(0);
  let l = r === true ? 0 : 1, c, h, u = null, d = 0, f = null;
  function g(w) {
    let S = w.isScene === true ? w.background : null;
    return S && S.isTexture && (S = (w.backgroundBlurriness > 0 ? e : t).get(S)), S;
  }
  function _(w) {
    let S = false;
    const U = g(w);
    U === null ? p(a, l) : U && U.isColor && (p(U, 1), S = true);
    const C = s.xr.getEnvironmentBlendMode();
    C === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, o) : C === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, o), (s.autoClear || S) && (n.buffers.depth.setTest(true), n.buffers.depth.setMask(true), n.buffers.color.setMask(true), s.clear(s.autoClearColor, s.autoClearDepth, s.autoClearStencil));
  }
  function m(w, S) {
    const U = g(S);
    U && (U.isCubeTexture || U.mapping === Yr) ? (h === void 0 && (h = new He(new us(1, 1, 1), new dn({ name: "BackgroundCubeMaterial", uniforms: hs(Be.backgroundCube.uniforms), vertexShader: Be.backgroundCube.vertexShader, fragmentShader: Be.backgroundCube.fragmentShader, side: Ve, depthTest: false, depthWrite: false, fog: false })), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(C, R, F) {
      this.matrixWorld.copyPosition(F.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", { get: function() {
      return this.uniforms.envMap.value;
    } }), i.update(h)), li.copy(S.backgroundRotation), li.x *= -1, li.y *= -1, li.z *= -1, U.isCubeTexture && U.isRenderTargetTexture === false && (li.y *= -1, li.z *= -1), h.material.uniforms.envMap.value = U, h.material.uniforms.flipEnvMap.value = U.isCubeTexture && U.isRenderTargetTexture === false ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = S.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(cm.makeRotationFromEuler(li)), h.material.toneMapped = $t.getTransfer(U.colorSpace) !== ee, (u !== U || d !== U.version || f !== s.toneMapping) && (h.material.needsUpdate = true, u = U, d = U.version, f = s.toneMapping), h.layers.enableAll(), w.unshift(h, h.geometry, h.material, 0, 0, null)) : U && U.isTexture && (c === void 0 && (c = new He(new Ti(2, 2), new dn({ name: "BackgroundMaterial", uniforms: hs(Be.background.uniforms), vertexShader: Be.background.vertexShader, fragmentShader: Be.background.fragmentShader, side: Qn, depthTest: false, depthWrite: false, fog: false })), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", { get: function() {
      return this.uniforms.t2D.value;
    } }), i.update(c)), c.material.uniforms.t2D.value = U, c.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, c.material.toneMapped = $t.getTransfer(U.colorSpace) !== ee, U.matrixAutoUpdate === true && U.updateMatrix(), c.material.uniforms.uvTransform.value.copy(U.matrix), (u !== U || d !== U.version || f !== s.toneMapping) && (c.material.needsUpdate = true, u = U, d = U.version, f = s.toneMapping), c.layers.enableAll(), w.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function p(w, S) {
    w.getRGB(pr, eh(s)), n.buffers.color.setClear(pr.r, pr.g, pr.b, S, o);
  }
  function T() {
    h !== void 0 && (h.geometry.dispose(), h.material.dispose(), h = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
  }
  return { getClearColor: function() {
    return a;
  }, setClearColor: function(w, S = 1) {
    a.set(w), l = S, p(a, l);
  }, getClearAlpha: function() {
    return l;
  }, setClearAlpha: function(w) {
    l = w, p(a, l);
  }, render: _, addToRenderList: m, dispose: T };
}
function um(s, t) {
  const e = s.getParameter(s.MAX_VERTEX_ATTRIBS), n = {}, i = d(null);
  let r = i, o = false;
  function a(y, P, O, N, G) {
    let j = false;
    const V = u(N, O, P);
    r !== V && (r = V, c(r.object)), j = f(y, N, O, G), j && g(y, N, O, G), G !== null && t.update(G, s.ELEMENT_ARRAY_BUFFER), (j || o) && (o = false, S(y, P, O, N), G !== null && s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, t.get(G).buffer));
  }
  function l() {
    return s.createVertexArray();
  }
  function c(y) {
    return s.bindVertexArray(y);
  }
  function h(y) {
    return s.deleteVertexArray(y);
  }
  function u(y, P, O) {
    const N = O.wireframe === true;
    let G = n[y.id];
    G === void 0 && (G = {}, n[y.id] = G);
    let j = G[P.id];
    j === void 0 && (j = {}, G[P.id] = j);
    let V = j[N];
    return V === void 0 && (V = d(l()), j[N] = V), V;
  }
  function d(y) {
    const P = [], O = [], N = [];
    for (let G = 0; G < e; G++) P[G] = 0, O[G] = 0, N[G] = 0;
    return { geometry: null, program: null, wireframe: false, newAttributes: P, enabledAttributes: O, attributeDivisors: N, object: y, attributes: {}, index: null };
  }
  function f(y, P, O, N) {
    const G = r.attributes, j = P.attributes;
    let V = 0;
    const Z = O.getAttributes();
    for (const W in Z) if (Z[W].location >= 0) {
      const ht = G[W];
      let _t = j[W];
      if (_t === void 0 && (W === "instanceMatrix" && y.instanceMatrix && (_t = y.instanceMatrix), W === "instanceColor" && y.instanceColor && (_t = y.instanceColor)), ht === void 0 || ht.attribute !== _t || _t && ht.data !== _t.data) return true;
      V++;
    }
    return r.attributesNum !== V || r.index !== N;
  }
  function g(y, P, O, N) {
    const G = {}, j = P.attributes;
    let V = 0;
    const Z = O.getAttributes();
    for (const W in Z) if (Z[W].location >= 0) {
      let ht = j[W];
      ht === void 0 && (W === "instanceMatrix" && y.instanceMatrix && (ht = y.instanceMatrix), W === "instanceColor" && y.instanceColor && (ht = y.instanceColor));
      const _t = {};
      _t.attribute = ht, ht && ht.data && (_t.data = ht.data), G[W] = _t, V++;
    }
    r.attributes = G, r.attributesNum = V, r.index = N;
  }
  function _() {
    const y = r.newAttributes;
    for (let P = 0, O = y.length; P < O; P++) y[P] = 0;
  }
  function m(y) {
    p(y, 0);
  }
  function p(y, P) {
    const O = r.newAttributes, N = r.enabledAttributes, G = r.attributeDivisors;
    O[y] = 1, N[y] === 0 && (s.enableVertexAttribArray(y), N[y] = 1), G[y] !== P && (s.vertexAttribDivisor(y, P), G[y] = P);
  }
  function T() {
    const y = r.newAttributes, P = r.enabledAttributes;
    for (let O = 0, N = P.length; O < N; O++) P[O] !== y[O] && (s.disableVertexAttribArray(O), P[O] = 0);
  }
  function w(y, P, O, N, G, j, V) {
    V === true ? s.vertexAttribIPointer(y, P, O, G, j) : s.vertexAttribPointer(y, P, O, N, G, j);
  }
  function S(y, P, O, N) {
    _();
    const G = N.attributes, j = O.getAttributes(), V = P.defaultAttributeValues;
    for (const Z in j) {
      const W = j[Z];
      if (W.location >= 0) {
        let it = G[Z];
        if (it === void 0 && (Z === "instanceMatrix" && y.instanceMatrix && (it = y.instanceMatrix), Z === "instanceColor" && y.instanceColor && (it = y.instanceColor)), it !== void 0) {
          const ht = it.normalized, _t = it.itemSize, Ut = t.get(it);
          if (Ut === void 0) continue;
          const jt = Ut.buffer, H = Ut.type, J = Ut.bytesPerElement, dt = H === s.INT || H === s.UNSIGNED_INT || it.gpuType === Na;
          if (it.isInterleavedBufferAttribute) {
            const st = it.data, Et = st.stride, kt = it.offset;
            if (st.isInstancedInterleavedBuffer) {
              for (let wt = 0; wt < W.locationSize; wt++) p(W.location + wt, st.meshPerAttribute);
              y.isInstancedMesh !== true && N._maxInstanceCount === void 0 && (N._maxInstanceCount = st.meshPerAttribute * st.count);
            } else for (let wt = 0; wt < W.locationSize; wt++) m(W.location + wt);
            s.bindBuffer(s.ARRAY_BUFFER, jt);
            for (let wt = 0; wt < W.locationSize; wt++) w(W.location + wt, _t / W.locationSize, H, ht, Et * J, (kt + _t / W.locationSize * wt) * J, dt);
          } else {
            if (it.isInstancedBufferAttribute) {
              for (let st = 0; st < W.locationSize; st++) p(W.location + st, it.meshPerAttribute);
              y.isInstancedMesh !== true && N._maxInstanceCount === void 0 && (N._maxInstanceCount = it.meshPerAttribute * it.count);
            } else for (let st = 0; st < W.locationSize; st++) m(W.location + st);
            s.bindBuffer(s.ARRAY_BUFFER, jt);
            for (let st = 0; st < W.locationSize; st++) w(W.location + st, _t / W.locationSize, H, ht, _t * J, _t / W.locationSize * st * J, dt);
          }
        } else if (V !== void 0) {
          const ht = V[Z];
          if (ht !== void 0) switch (ht.length) {
            case 2:
              s.vertexAttrib2fv(W.location, ht);
              break;
            case 3:
              s.vertexAttrib3fv(W.location, ht);
              break;
            case 4:
              s.vertexAttrib4fv(W.location, ht);
              break;
            default:
              s.vertexAttrib1fv(W.location, ht);
          }
        }
      }
    }
    T();
  }
  function U() {
    F();
    for (const y in n) {
      const P = n[y];
      for (const O in P) {
        const N = P[O];
        for (const G in N) h(N[G].object), delete N[G];
        delete P[O];
      }
      delete n[y];
    }
  }
  function C(y) {
    if (n[y.id] === void 0) return;
    const P = n[y.id];
    for (const O in P) {
      const N = P[O];
      for (const G in N) h(N[G].object), delete N[G];
      delete P[O];
    }
    delete n[y.id];
  }
  function R(y) {
    for (const P in n) {
      const O = n[P];
      if (O[y.id] === void 0) continue;
      const N = O[y.id];
      for (const G in N) h(N[G].object), delete N[G];
      delete O[y.id];
    }
  }
  function F() {
    M(), o = true, r !== i && (r = i, c(r.object));
  }
  function M() {
    i.geometry = null, i.program = null, i.wireframe = false;
  }
  return { setup: a, reset: F, resetDefaultState: M, dispose: U, releaseStatesOfGeometry: C, releaseStatesOfProgram: R, initAttributes: _, enableAttribute: m, disableUnusedAttributes: T };
}
function dm(s, t, e) {
  let n;
  function i(c) {
    n = c;
  }
  function r(c, h) {
    s.drawArrays(n, c, h), e.update(h, n, 1);
  }
  function o(c, h, u) {
    u !== 0 && (s.drawArraysInstanced(n, c, h, u), e.update(h, n, u));
  }
  function a(c, h, u) {
    if (u === 0) return;
    t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, h, 0, u);
    let f = 0;
    for (let g = 0; g < u; g++) f += h[g];
    e.update(f, n, 1);
  }
  function l(c, h, u, d) {
    if (u === 0) return;
    const f = t.get("WEBGL_multi_draw");
    if (f === null) for (let g = 0; g < c.length; g++) o(c[g], h[g], d[g]);
    else {
      f.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, d, 0, u);
      let g = 0;
      for (let _ = 0; _ < u; _++) g += h[_] * d[_];
      e.update(g, n, 1);
    }
  }
  this.setMode = i, this.render = r, this.renderInstances = o, this.renderMultiDraw = a, this.renderMultiDrawInstances = l;
}
function fm(s, t, e, n) {
  let i;
  function r() {
    if (i !== void 0) return i;
    if (t.has("EXT_texture_filter_anisotropic") === true) {
      const R = t.get("EXT_texture_filter_anisotropic");
      i = s.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else i = 0;
    return i;
  }
  function o(R) {
    return !(R !== cn && n.convert(R) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function a(R) {
    const F = R === Os && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(R !== On && n.convert(R) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE) && R !== Pn && !F);
  }
  function l(R) {
    if (R === "highp") {
      if (s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.HIGH_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.HIGH_FLOAT).precision > 0) return "highp";
      R = "mediump";
    }
    return R === "mediump" && s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.MEDIUM_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = e.precision !== void 0 ? e.precision : "highp";
  const h = l(c);
  h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const u = e.logarithmicDepthBuffer === true, d = e.reverseDepthBuffer === true && t.has("EXT_clip_control"), f = s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS), g = s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = s.getParameter(s.MAX_TEXTURE_SIZE), m = s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE), p = s.getParameter(s.MAX_VERTEX_ATTRIBS), T = s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS), w = s.getParameter(s.MAX_VARYING_VECTORS), S = s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS), U = g > 0, C = s.getParameter(s.MAX_SAMPLES);
  return { isWebGL2: true, getMaxAnisotropy: r, getMaxPrecision: l, textureFormatReadable: o, textureTypeReadable: a, precision: c, logarithmicDepthBuffer: u, reverseDepthBuffer: d, maxTextures: f, maxVertexTextures: g, maxTextureSize: _, maxCubemapSize: m, maxAttributes: p, maxVertexUniforms: T, maxVaryings: w, maxFragmentUniforms: S, vertexTextures: U, maxSamples: C };
}
function pm(s) {
  const t = this;
  let e = null, n = 0, i = false, r = false;
  const o = new Rn(), a = new Dt(), l = { value: null, needsUpdate: false };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(u, d) {
    const f = u.length !== 0 || d || n !== 0 || i;
    return i = d, n = u.length, f;
  }, this.beginShadows = function() {
    r = true, h(null);
  }, this.endShadows = function() {
    r = false;
  }, this.setGlobalState = function(u, d) {
    e = h(u, d, 0);
  }, this.setState = function(u, d, f) {
    const g = u.clippingPlanes, _ = u.clipIntersection, m = u.clipShadows, p = s.get(u);
    if (!i || g === null || g.length === 0 || r && !m) r ? h(null) : c();
    else {
      const T = r ? 0 : n, w = T * 4;
      let S = p.clippingState || null;
      l.value = S, S = h(g, d, w, f);
      for (let U = 0; U !== w; ++U) S[U] = e[U];
      p.clippingState = S, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += T;
    }
  };
  function c() {
    l.value !== e && (l.value = e, l.needsUpdate = n > 0), t.numPlanes = n, t.numIntersection = 0;
  }
  function h(u, d, f, g) {
    const _ = u !== null ? u.length : 0;
    let m = null;
    if (_ !== 0) {
      if (m = l.value, g !== true || m === null) {
        const p = f + _ * 4, T = d.matrixWorldInverse;
        a.getNormalMatrix(T), (m === null || m.length < p) && (m = new Float32Array(p));
        for (let w = 0, S = f; w !== _; ++w, S += 4) o.copy(u[w]).applyMatrix4(T, a), o.normal.toArray(m, S), m[S + 3] = o.constant;
      }
      l.value = m, l.needsUpdate = true;
    }
    return t.numPlanes = _, t.numIntersection = 0, m;
  }
}
function mm(s) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(o, a) {
    return a === Qo ? o.mapping = rs : a === ta && (o.mapping = os), o;
  }
  function n(o) {
    if (o && o.isTexture) {
      const a = o.mapping;
      if (a === Qo || a === ta) if (t.has(o)) {
        const l = t.get(o).texture;
        return e(l, o.mapping);
      } else {
        const l = o.image;
        if (l && l.height > 0) {
          const c = new ud(l.height);
          return c.fromEquirectangularTexture(s, o), t.set(o, c), o.addEventListener("dispose", i), e(c.texture, o.mapping);
        } else return null;
      }
    }
    return o;
  }
  function i(o) {
    const a = o.target;
    a.removeEventListener("dispose", i);
    const l = t.get(a);
    l !== void 0 && (t.delete(a), l.dispose());
  }
  function r() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return { get: n, dispose: r };
}
const Qi = 4, Wl = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], _i = 20, Eo = new an(), Xl = new zt();
let bo = null, wo = 0, To = 0, Ao = false;
const pi = (1 + Math.sqrt(5)) / 2, Yi = 1 / pi, Yl = [new b(-pi, Yi, 0), new b(pi, Yi, 0), new b(-Yi, 0, pi), new b(Yi, 0, pi), new b(0, pi, -Yi), new b(0, pi, Yi), new b(-1, 1, -1), new b(1, 1, -1), new b(-1, 1, 1), new b(1, 1, 1)], gm = new b();
class ql {
  constructor(t) {
    this._renderer = t, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  fromScene(t, e = 0, n = 0.1, i = 100, r = {}) {
    const { size: o = 256, position: a = gm } = r;
    bo = this._renderer.getRenderTarget(), wo = this._renderer.getActiveCubeFace(), To = this._renderer.getActiveMipmapLevel(), Ao = this._renderer.xr.enabled, this._renderer.xr.enabled = false, this._setSize(o);
    const l = this._allocateTargets();
    return l.depthBuffer = true, this._sceneToCubeUV(t, n, i, l, a), e > 0 && this._blur(l, 0, 0, e), this._applyPMREM(l), this._cleanup(l), l;
  }
  fromEquirectangular(t, e = null) {
    return this._fromTexture(t, e);
  }
  fromCubemap(t, e = null) {
    return this._fromTexture(t, e);
  }
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = Zl(), this._compileMaterial(this._cubemapMaterial));
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = jl(), this._compileMaterial(this._equirectMaterial));
  }
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  _setSize(t) {
    this._lodMax = Math.floor(Math.log2(t)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let t = 0; t < this._lodPlanes.length; t++) this._lodPlanes[t].dispose();
  }
  _cleanup(t) {
    this._renderer.setRenderTarget(bo, wo, To), this._renderer.xr.enabled = Ao, t.scissorTest = false, mr(t, 0, 0, t.width, t.height);
  }
  _fromTexture(t, e) {
    t.mapping === rs || t.mapping === os ? this._setSize(t.image.length === 0 ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), bo = this._renderer.getRenderTarget(), wo = this._renderer.getActiveCubeFace(), To = this._renderer.getActiveMipmapLevel(), Ao = this._renderer.xr.enabled, this._renderer.xr.enabled = false;
    const n = e || this._allocateTargets();
    return this._textureToCubeUV(t, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const t = 3 * Math.max(this._cubeSize, 112), e = 4 * this._cubeSize, n = { magFilter: xn, minFilter: xn, generateMipmaps: false, type: Os, format: cn, colorSpace: cs, depthBuffer: false }, i = $l(t, e, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = $l(t, e, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = _m(r)), this._blurMaterial = vm(r, t, e);
    }
    return i;
  }
  _compileMaterial(t) {
    const e = new He(this._lodPlanes[0], t);
    this._renderer.compile(e, Eo);
  }
  _sceneToCubeUV(t, e, n, i, r) {
    const l = new $e(90, 1, e, n), c = [1, -1, 1, 1, 1, 1], h = [1, 1, 1, -1, -1, -1], u = this._renderer, d = u.autoClear, f = u.toneMapping;
    u.getClearColor(Xl), u.toneMapping = Jn, u.autoClear = false;
    const g = new Ei({ name: "PMREM.Background", side: Ve, depthWrite: false, depthTest: false }), _ = new He(new us(), g);
    let m = false;
    const p = t.background;
    p ? p.isColor && (g.color.copy(p), t.background = null, m = true) : (g.color.copy(Xl), m = true);
    for (let T = 0; T < 6; T++) {
      const w = T % 3;
      w === 0 ? (l.up.set(0, c[T], 0), l.position.set(r.x, r.y, r.z), l.lookAt(r.x + h[T], r.y, r.z)) : w === 1 ? (l.up.set(0, 0, c[T]), l.position.set(r.x, r.y, r.z), l.lookAt(r.x, r.y + h[T], r.z)) : (l.up.set(0, c[T], 0), l.position.set(r.x, r.y, r.z), l.lookAt(r.x, r.y, r.z + h[T]));
      const S = this._cubeSize;
      mr(i, w * S, T > 2 ? S : 0, S, S), u.setRenderTarget(i), m && u.render(_, l), u.render(t, l);
    }
    _.geometry.dispose(), _.material.dispose(), u.toneMapping = f, u.autoClear = d, t.background = p;
  }
  _textureToCubeUV(t, e) {
    const n = this._renderer, i = t.mapping === rs || t.mapping === os;
    i ? (this._cubemapMaterial === null && (this._cubemapMaterial = Zl()), this._cubemapMaterial.uniforms.flipEnvMap.value = t.isRenderTargetTexture === false ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = jl());
    const r = i ? this._cubemapMaterial : this._equirectMaterial, o = new He(this._lodPlanes[0], r), a = r.uniforms;
    a.envMap.value = t;
    const l = this._cubeSize;
    mr(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(o, Eo);
  }
  _applyPMREM(t) {
    const e = this._renderer, n = e.autoClear;
    e.autoClear = false;
    const i = this._lodPlanes.length;
    for (let r = 1; r < i; r++) {
      const o = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), a = Yl[(i - r - 1) % Yl.length];
      this._blur(t, r - 1, r, o, a);
    }
    e.autoClear = n;
  }
  _blur(t, e, n, i, r) {
    const o = this._pingPongRenderTarget;
    this._halfBlur(t, o, e, n, i, "latitudinal", r), this._halfBlur(o, t, n, n, i, "longitudinal", r);
  }
  _halfBlur(t, e, n, i, r, o, a) {
    const l = this._renderer, c = this._blurMaterial;
    o !== "latitudinal" && o !== "longitudinal" && console.error("blur direction must be either latitudinal or longitudinal!");
    const h = 3, u = new He(this._lodPlanes[i], c), d = c.uniforms, f = this._sizeLods[n] - 1, g = isFinite(r) ? Math.PI / (2 * f) : 2 * Math.PI / (2 * _i - 1), _ = r / g, m = isFinite(r) ? 1 + Math.floor(h * _) : _i;
    m > _i && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${_i}`);
    const p = [];
    let T = 0;
    for (let R = 0; R < _i; ++R) {
      const F = R / _, M = Math.exp(-F * F / 2);
      p.push(M), R === 0 ? T += M : R < m && (T += 2 * M);
    }
    for (let R = 0; R < p.length; R++) p[R] = p[R] / T;
    d.envMap.value = t.texture, d.samples.value = m, d.weights.value = p, d.latitudinal.value = o === "latitudinal", a && (d.poleAxis.value = a);
    const { _lodMax: w } = this;
    d.dTheta.value = g, d.mipInt.value = w - n;
    const S = this._sizeLods[i], U = 3 * S * (i > w - Qi ? i - w + Qi : 0), C = 4 * (this._cubeSize - S);
    mr(e, U, C, 3 * S, 2 * S), l.setRenderTarget(e), l.render(u, Eo);
  }
}
function _m(s) {
  const t = [], e = [], n = [];
  let i = s;
  const r = s - Qi + 1 + Wl.length;
  for (let o = 0; o < r; o++) {
    const a = Math.pow(2, i);
    e.push(a);
    let l = 1 / a;
    o > s - Qi ? l = Wl[o - s + Qi - 1] : o === 0 && (l = 0), n.push(l);
    const c = 1 / (a - 2), h = -c, u = 1 + c, d = [h, h, u, h, u, u, h, h, u, u, h, u], f = 6, g = 6, _ = 3, m = 2, p = 1, T = new Float32Array(_ * g * f), w = new Float32Array(m * g * f), S = new Float32Array(p * g * f);
    for (let C = 0; C < f; C++) {
      const R = C % 3 * 2 / 3 - 1, F = C > 2 ? 0 : -1, M = [R, F, 0, R + 2 / 3, F, 0, R + 2 / 3, F + 1, 0, R, F, 0, R + 2 / 3, F + 1, 0, R, F + 1, 0];
      T.set(M, _ * g * C), w.set(d, m * g * C);
      const y = [C, C, C, C, C, C];
      S.set(y, p * g * C);
    }
    const U = new me();
    U.setAttribute("position", new ce(T, _)), U.setAttribute("uv", new ce(w, m)), U.setAttribute("faceIndex", new ce(S, p)), t.push(U), i > Qi && i--;
  }
  return { lodPlanes: t, sizeLods: e, sigmas: n };
}
function $l(s, t, e) {
  const n = new Mi(s, t, e);
  return n.texture.mapping = Yr, n.texture.name = "PMREM.cubeUv", n.scissorTest = true, n;
}
function mr(s, t, e, n, i) {
  s.viewport.set(t, e, n, i), s.scissor.set(t, e, n, i);
}
function vm(s, t, e) {
  const n = new Float32Array(_i), i = new b(0, 1, 0);
  return new dn({ name: "SphericalGaussianBlur", defines: { n: _i, CUBEUV_TEXEL_WIDTH: 1 / t, CUBEUV_TEXEL_HEIGHT: 1 / e, CUBEUV_MAX_MIP: `${s}.0` }, uniforms: { envMap: { value: null }, samples: { value: 1 }, weights: { value: n }, latitudinal: { value: false }, dTheta: { value: 0 }, mipInt: { value: 0 }, poleAxis: { value: i } }, vertexShader: ja(), fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`, blending: Kn, depthTest: false, depthWrite: false });
}
function jl() {
  return new dn({ name: "EquirectangularToCubeUV", uniforms: { envMap: { value: null } }, vertexShader: ja(), fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`, blending: Kn, depthTest: false, depthWrite: false });
}
function Zl() {
  return new dn({ name: "CubemapToCubeUV", uniforms: { envMap: { value: null }, flipEnvMap: { value: -1 } }, vertexShader: ja(), fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`, blending: Kn, depthTest: false, depthWrite: false });
}
function ja() {
  return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
}
function xm(s) {
  let t = /* @__PURE__ */ new WeakMap(), e = null;
  function n(a) {
    if (a && a.isTexture) {
      const l = a.mapping, c = l === Qo || l === ta, h = l === rs || l === os;
      if (c || h) {
        let u = t.get(a);
        const d = u !== void 0 ? u.texture.pmremVersion : 0;
        if (a.isRenderTargetTexture && a.pmremVersion !== d) return e === null && (e = new ql(s)), u = c ? e.fromEquirectangular(a, u) : e.fromCubemap(a, u), u.texture.pmremVersion = a.pmremVersion, t.set(a, u), u.texture;
        if (u !== void 0) return u.texture;
        {
          const f = a.image;
          return c && f && f.height > 0 || h && f && i(f) ? (e === null && (e = new ql(s)), u = c ? e.fromEquirectangular(a) : e.fromCubemap(a), u.texture.pmremVersion = a.pmremVersion, t.set(a, u), a.addEventListener("dispose", r), u.texture) : null;
        }
      }
    }
    return a;
  }
  function i(a) {
    let l = 0;
    const c = 6;
    for (let h = 0; h < c; h++) a[h] !== void 0 && l++;
    return l === c;
  }
  function r(a) {
    const l = a.target;
    l.removeEventListener("dispose", r);
    const c = t.get(l);
    c !== void 0 && (t.delete(l), c.dispose());
  }
  function o() {
    t = /* @__PURE__ */ new WeakMap(), e !== null && (e.dispose(), e = null);
  }
  return { get: n, dispose: o };
}
function ym(s) {
  const t = {};
  function e(n) {
    if (t[n] !== void 0) return t[n];
    let i;
    switch (n) {
      case "WEBGL_depth_texture":
        i = s.getExtension("WEBGL_depth_texture") || s.getExtension("MOZ_WEBGL_depth_texture") || s.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        i = s.getExtension("EXT_texture_filter_anisotropic") || s.getExtension("MOZ_EXT_texture_filter_anisotropic") || s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        i = s.getExtension("WEBGL_compressed_texture_s3tc") || s.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        i = s.getExtension("WEBGL_compressed_texture_pvrtc") || s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        i = s.getExtension(n);
    }
    return t[n] = i, i;
  }
  return { has: function(n) {
    return e(n) !== null;
  }, init: function() {
    e("EXT_color_buffer_float"), e("WEBGL_clip_cull_distance"), e("OES_texture_float_linear"), e("EXT_color_buffer_half_float"), e("WEBGL_multisampled_render_to_texture"), e("WEBGL_render_shared_exponent");
  }, get: function(n) {
    const i = e(n);
    return i === null && fi("THREE.WebGLRenderer: " + n + " extension not supported."), i;
  } };
}
function Sm(s, t, e, n) {
  const i = {}, r = /* @__PURE__ */ new WeakMap();
  function o(u) {
    const d = u.target;
    d.index !== null && t.remove(d.index);
    for (const g in d.attributes) t.remove(d.attributes[g]);
    d.removeEventListener("dispose", o), delete i[d.id];
    const f = r.get(d);
    f && (t.remove(f), r.delete(d)), n.releaseStatesOfGeometry(d), d.isInstancedBufferGeometry === true && delete d._maxInstanceCount, e.memory.geometries--;
  }
  function a(u, d) {
    return i[d.id] === true || (d.addEventListener("dispose", o), i[d.id] = true, e.memory.geometries++), d;
  }
  function l(u) {
    const d = u.attributes;
    for (const f in d) t.update(d[f], s.ARRAY_BUFFER);
  }
  function c(u) {
    const d = [], f = u.index, g = u.attributes.position;
    let _ = 0;
    if (f !== null) {
      const T = f.array;
      _ = f.version;
      for (let w = 0, S = T.length; w < S; w += 3) {
        const U = T[w + 0], C = T[w + 1], R = T[w + 2];
        d.push(U, C, C, R, R, U);
      }
    } else if (g !== void 0) {
      const T = g.array;
      _ = g.version;
      for (let w = 0, S = T.length / 3 - 1; w < S; w += 3) {
        const U = w + 0, C = w + 1, R = w + 2;
        d.push(U, C, C, R, R, U);
      }
    } else return;
    const m = new (Zc(d) ? th : Qc)(d, 1);
    m.version = _;
    const p = r.get(u);
    p && t.remove(p), r.set(u, m);
  }
  function h(u) {
    const d = r.get(u);
    if (d) {
      const f = u.index;
      f !== null && d.version < f.version && c(u);
    } else c(u);
    return r.get(u);
  }
  return { get: a, update: l, getWireframeAttribute: h };
}
function Mm(s, t, e) {
  let n;
  function i(d) {
    n = d;
  }
  let r, o;
  function a(d) {
    r = d.type, o = d.bytesPerElement;
  }
  function l(d, f) {
    s.drawElements(n, f, r, d * o), e.update(f, n, 1);
  }
  function c(d, f, g) {
    g !== 0 && (s.drawElementsInstanced(n, f, r, d * o, g), e.update(f, n, g));
  }
  function h(d, f, g) {
    if (g === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, f, 0, r, d, 0, g);
    let m = 0;
    for (let p = 0; p < g; p++) m += f[p];
    e.update(m, n, 1);
  }
  function u(d, f, g, _) {
    if (g === 0) return;
    const m = t.get("WEBGL_multi_draw");
    if (m === null) for (let p = 0; p < d.length; p++) c(d[p] / o, f[p], _[p]);
    else {
      m.multiDrawElementsInstancedWEBGL(n, f, 0, r, d, 0, _, 0, g);
      let p = 0;
      for (let T = 0; T < g; T++) p += f[T] * _[T];
      e.update(p, n, 1);
    }
  }
  this.setMode = i, this.setIndex = a, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = u;
}
function Em(s) {
  const t = { geometries: 0, textures: 0 }, e = { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 };
  function n(r, o, a) {
    switch (e.calls++, o) {
      case s.TRIANGLES:
        e.triangles += a * (r / 3);
        break;
      case s.LINES:
        e.lines += a * (r / 2);
        break;
      case s.LINE_STRIP:
        e.lines += a * (r - 1);
        break;
      case s.LINE_LOOP:
        e.lines += a * r;
        break;
      case s.POINTS:
        e.points += a * r;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", o);
        break;
    }
  }
  function i() {
    e.calls = 0, e.triangles = 0, e.points = 0, e.lines = 0;
  }
  return { memory: t, render: e, programs: null, autoReset: true, reset: i, update: n };
}
function bm(s, t, e) {
  const n = /* @__PURE__ */ new WeakMap(), i = new re();
  function r(o, a, l) {
    const c = o.morphTargetInfluences, h = a.morphAttributes.position || a.morphAttributes.normal || a.morphAttributes.color, u = h !== void 0 ? h.length : 0;
    let d = n.get(a);
    if (d === void 0 || d.count !== u) {
      let M = function() {
        R.dispose(), n.delete(a), a.removeEventListener("dispose", M);
      };
      d !== void 0 && d.texture.dispose();
      const f = a.morphAttributes.position !== void 0, g = a.morphAttributes.normal !== void 0, _ = a.morphAttributes.color !== void 0, m = a.morphAttributes.position || [], p = a.morphAttributes.normal || [], T = a.morphAttributes.color || [];
      let w = 0;
      f === true && (w = 1), g === true && (w = 2), _ === true && (w = 3);
      let S = a.attributes.position.count * w, U = 1;
      S > t.maxTextureSize && (U = Math.ceil(S / t.maxTextureSize), S = t.maxTextureSize);
      const C = new Float32Array(S * U * 4 * u), R = new Kc(C, S, U, u);
      R.type = Pn, R.needsUpdate = true;
      const F = w * 4;
      for (let y = 0; y < u; y++) {
        const P = m[y], O = p[y], N = T[y], G = S * U * 4 * y;
        for (let j = 0; j < P.count; j++) {
          const V = j * F;
          f === true && (i.fromBufferAttribute(P, j), C[G + V + 0] = i.x, C[G + V + 1] = i.y, C[G + V + 2] = i.z, C[G + V + 3] = 0), g === true && (i.fromBufferAttribute(O, j), C[G + V + 4] = i.x, C[G + V + 5] = i.y, C[G + V + 6] = i.z, C[G + V + 7] = 0), _ === true && (i.fromBufferAttribute(N, j), C[G + V + 8] = i.x, C[G + V + 9] = i.y, C[G + V + 10] = i.z, C[G + V + 11] = N.itemSize === 4 ? i.w : 1);
        }
      }
      d = { count: u, texture: R, size: new Mt(S, U) }, n.set(a, d), a.addEventListener("dispose", M);
    }
    if (o.isInstancedMesh === true && o.morphTexture !== null) l.getUniforms().setValue(s, "morphTexture", o.morphTexture, e);
    else {
      let f = 0;
      for (let _ = 0; _ < c.length; _++) f += c[_];
      const g = a.morphTargetsRelative ? 1 : 1 - f;
      l.getUniforms().setValue(s, "morphTargetBaseInfluence", g), l.getUniforms().setValue(s, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(s, "morphTargetsTexture", d.texture, e), l.getUniforms().setValue(s, "morphTargetsTextureSize", d.size);
  }
  return { update: r };
}
function wm(s, t, e, n) {
  let i = /* @__PURE__ */ new WeakMap();
  function r(l) {
    const c = n.render.frame, h = l.geometry, u = t.get(l, h);
    if (i.get(u) !== c && (t.update(u), i.set(u, c)), l.isInstancedMesh && (l.hasEventListener("dispose", a) === false && l.addEventListener("dispose", a), i.get(l) !== c && (e.update(l.instanceMatrix, s.ARRAY_BUFFER), l.instanceColor !== null && e.update(l.instanceColor, s.ARRAY_BUFFER), i.set(l, c))), l.isSkinnedMesh) {
      const d = l.skeleton;
      i.get(d) !== c && (d.update(), i.set(d, c));
    }
    return u;
  }
  function o() {
    i = /* @__PURE__ */ new WeakMap();
  }
  function a(l) {
    const c = l.target;
    c.removeEventListener("dispose", a), e.remove(c.instanceMatrix), c.instanceColor !== null && e.remove(c.instanceColor);
  }
  return { update: r, dispose: o };
}
const hh = new Ie(), Kl = new lh(1, 1), uh = new Kc(), dh = new ju(), fh = new ih(), Jl = [], Ql = [], tc = new Float32Array(16), ec = new Float32Array(9), nc = new Float32Array(4);
function fs(s, t, e) {
  const n = s[0];
  if (n <= 0 || n > 0) return s;
  const i = t * e;
  let r = Jl[i];
  if (r === void 0 && (r = new Float32Array(i), Jl[i] = r), t !== 0) {
    n.toArray(r, 0);
    for (let o = 1, a = 0; o !== t; ++o) a += e, s[o].toArray(r, a);
  }
  return r;
}
function ge(s, t) {
  if (s.length !== t.length) return false;
  for (let e = 0, n = s.length; e < n; e++) if (s[e] !== t[e]) return false;
  return true;
}
function _e(s, t) {
  for (let e = 0, n = t.length; e < n; e++) s[e] = t[e];
}
function qr(s, t) {
  let e = Ql[t];
  e === void 0 && (e = new Int32Array(t), Ql[t] = e);
  for (let n = 0; n !== t; ++n) e[n] = s.allocateTextureUnit();
  return e;
}
function Tm(s, t) {
  const e = this.cache;
  e[0] !== t && (s.uniform1f(this.addr, t), e[0] = t);
}
function Am(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (s.uniform2f(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (ge(e, t)) return;
    s.uniform2fv(this.addr, t), _e(e, t);
  }
}
function Cm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (s.uniform3f(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else if (t.r !== void 0) (e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) && (s.uniform3f(this.addr, t.r, t.g, t.b), e[0] = t.r, e[1] = t.g, e[2] = t.b);
  else {
    if (ge(e, t)) return;
    s.uniform3fv(this.addr, t), _e(e, t);
  }
}
function Rm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (s.uniform4f(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (ge(e, t)) return;
    s.uniform4fv(this.addr, t), _e(e, t);
  }
}
function Pm(s, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (ge(e, t)) return;
    s.uniformMatrix2fv(this.addr, false, t), _e(e, t);
  } else {
    if (ge(e, n)) return;
    nc.set(n), s.uniformMatrix2fv(this.addr, false, nc), _e(e, n);
  }
}
function Lm(s, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (ge(e, t)) return;
    s.uniformMatrix3fv(this.addr, false, t), _e(e, t);
  } else {
    if (ge(e, n)) return;
    ec.set(n), s.uniformMatrix3fv(this.addr, false, ec), _e(e, n);
  }
}
function Dm(s, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (ge(e, t)) return;
    s.uniformMatrix4fv(this.addr, false, t), _e(e, t);
  } else {
    if (ge(e, n)) return;
    tc.set(n), s.uniformMatrix4fv(this.addr, false, tc), _e(e, n);
  }
}
function Im(s, t) {
  const e = this.cache;
  e[0] !== t && (s.uniform1i(this.addr, t), e[0] = t);
}
function Um(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (s.uniform2i(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (ge(e, t)) return;
    s.uniform2iv(this.addr, t), _e(e, t);
  }
}
function Fm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (s.uniform3i(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (ge(e, t)) return;
    s.uniform3iv(this.addr, t), _e(e, t);
  }
}
function Nm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (s.uniform4i(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (ge(e, t)) return;
    s.uniform4iv(this.addr, t), _e(e, t);
  }
}
function Om(s, t) {
  const e = this.cache;
  e[0] !== t && (s.uniform1ui(this.addr, t), e[0] = t);
}
function Bm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (s.uniform2ui(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (ge(e, t)) return;
    s.uniform2uiv(this.addr, t), _e(e, t);
  }
}
function zm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (s.uniform3ui(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (ge(e, t)) return;
    s.uniform3uiv(this.addr, t), _e(e, t);
  }
}
function km(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (s.uniform4ui(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (ge(e, t)) return;
    s.uniform4uiv(this.addr, t), _e(e, t);
  }
}
function Hm(s, t, e) {
  const n = this.cache, i = e.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i);
  let r;
  this.type === s.SAMPLER_2D_SHADOW ? (Kl.compareFunction = jc, r = Kl) : r = hh, e.setTexture2D(t || r, i);
}
function Vm(s, t, e) {
  const n = this.cache, i = e.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), e.setTexture3D(t || dh, i);
}
function Gm(s, t, e) {
  const n = this.cache, i = e.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), e.setTextureCube(t || fh, i);
}
function Wm(s, t, e) {
  const n = this.cache, i = e.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), e.setTexture2DArray(t || uh, i);
}
function Xm(s) {
  switch (s) {
    case 5126:
      return Tm;
    case 35664:
      return Am;
    case 35665:
      return Cm;
    case 35666:
      return Rm;
    case 35674:
      return Pm;
    case 35675:
      return Lm;
    case 35676:
      return Dm;
    case 5124:
    case 35670:
      return Im;
    case 35667:
    case 35671:
      return Um;
    case 35668:
    case 35672:
      return Fm;
    case 35669:
    case 35673:
      return Nm;
    case 5125:
      return Om;
    case 36294:
      return Bm;
    case 36295:
      return zm;
    case 36296:
      return km;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Hm;
    case 35679:
    case 36299:
    case 36307:
      return Vm;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Gm;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Wm;
  }
}
function Ym(s, t) {
  s.uniform1fv(this.addr, t);
}
function qm(s, t) {
  const e = fs(t, this.size, 2);
  s.uniform2fv(this.addr, e);
}
function $m(s, t) {
  const e = fs(t, this.size, 3);
  s.uniform3fv(this.addr, e);
}
function jm(s, t) {
  const e = fs(t, this.size, 4);
  s.uniform4fv(this.addr, e);
}
function Zm(s, t) {
  const e = fs(t, this.size, 4);
  s.uniformMatrix2fv(this.addr, false, e);
}
function Km(s, t) {
  const e = fs(t, this.size, 9);
  s.uniformMatrix3fv(this.addr, false, e);
}
function Jm(s, t) {
  const e = fs(t, this.size, 16);
  s.uniformMatrix4fv(this.addr, false, e);
}
function Qm(s, t) {
  s.uniform1iv(this.addr, t);
}
function tg(s, t) {
  s.uniform2iv(this.addr, t);
}
function eg(s, t) {
  s.uniform3iv(this.addr, t);
}
function ng(s, t) {
  s.uniform4iv(this.addr, t);
}
function ig(s, t) {
  s.uniform1uiv(this.addr, t);
}
function sg(s, t) {
  s.uniform2uiv(this.addr, t);
}
function rg(s, t) {
  s.uniform3uiv(this.addr, t);
}
function og(s, t) {
  s.uniform4uiv(this.addr, t);
}
function ag(s, t, e) {
  const n = this.cache, i = t.length, r = qr(e, i);
  ge(n, r) || (s.uniform1iv(this.addr, r), _e(n, r));
  for (let o = 0; o !== i; ++o) e.setTexture2D(t[o] || hh, r[o]);
}
function lg(s, t, e) {
  const n = this.cache, i = t.length, r = qr(e, i);
  ge(n, r) || (s.uniform1iv(this.addr, r), _e(n, r));
  for (let o = 0; o !== i; ++o) e.setTexture3D(t[o] || dh, r[o]);
}
function cg(s, t, e) {
  const n = this.cache, i = t.length, r = qr(e, i);
  ge(n, r) || (s.uniform1iv(this.addr, r), _e(n, r));
  for (let o = 0; o !== i; ++o) e.setTextureCube(t[o] || fh, r[o]);
}
function hg(s, t, e) {
  const n = this.cache, i = t.length, r = qr(e, i);
  ge(n, r) || (s.uniform1iv(this.addr, r), _e(n, r));
  for (let o = 0; o !== i; ++o) e.setTexture2DArray(t[o] || uh, r[o]);
}
function ug(s) {
  switch (s) {
    case 5126:
      return Ym;
    case 35664:
      return qm;
    case 35665:
      return $m;
    case 35666:
      return jm;
    case 35674:
      return Zm;
    case 35675:
      return Km;
    case 35676:
      return Jm;
    case 5124:
    case 35670:
      return Qm;
    case 35667:
    case 35671:
      return tg;
    case 35668:
    case 35672:
      return eg;
    case 35669:
    case 35673:
      return ng;
    case 5125:
      return ig;
    case 36294:
      return sg;
    case 36295:
      return rg;
    case 36296:
      return og;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return ag;
    case 35679:
    case 36299:
    case 36307:
      return lg;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return cg;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return hg;
  }
}
class dg {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.setValue = Xm(e.type);
  }
}
class fg {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.size = e.size, this.setValue = ug(e.type);
  }
}
class pg {
  constructor(t) {
    this.id = t, this.seq = [], this.map = {};
  }
  setValue(t, e, n) {
    const i = this.seq;
    for (let r = 0, o = i.length; r !== o; ++r) {
      const a = i[r];
      a.setValue(t, e[a.id], n);
    }
  }
}
const Co = /(\w+)(\])?(\[|\.)?/g;
function ic(s, t) {
  s.seq.push(t), s.map[t.id] = t;
}
function mg(s, t, e) {
  const n = s.name, i = n.length;
  for (Co.lastIndex = 0; ; ) {
    const r = Co.exec(n), o = Co.lastIndex;
    let a = r[1];
    const l = r[2] === "]", c = r[3];
    if (l && (a = a | 0), c === void 0 || c === "[" && o + 2 === i) {
      ic(e, c === void 0 ? new dg(a, s, t) : new fg(a, s, t));
      break;
    } else {
      let u = e.map[a];
      u === void 0 && (u = new pg(a), ic(e, u)), e = u;
    }
  }
}
class Nr {
  constructor(t, e) {
    this.seq = [], this.map = {};
    const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; ++i) {
      const r = t.getActiveUniform(e, i), o = t.getUniformLocation(e, r.name);
      mg(r, o, this);
    }
  }
  setValue(t, e, n, i) {
    const r = this.map[e];
    r !== void 0 && r.setValue(t, n, i);
  }
  setOptional(t, e, n) {
    const i = e[n];
    i !== void 0 && this.setValue(t, n, i);
  }
  static upload(t, e, n, i) {
    for (let r = 0, o = e.length; r !== o; ++r) {
      const a = e[r], l = n[a.id];
      l.needsUpdate !== false && a.setValue(t, l.value, i);
    }
  }
  static seqWithValue(t, e) {
    const n = [];
    for (let i = 0, r = t.length; i !== r; ++i) {
      const o = t[i];
      o.id in e && n.push(o);
    }
    return n;
  }
}
function sc(s, t, e) {
  const n = s.createShader(t);
  return s.shaderSource(n, e), s.compileShader(n), n;
}
const gg = 37297;
let _g = 0;
function vg(s, t) {
  const e = s.split(`
`), n = [], i = Math.max(t - 6, 0), r = Math.min(t + 6, e.length);
  for (let o = i; o < r; o++) {
    const a = o + 1;
    n.push(`${a === t ? ">" : " "} ${a}: ${e[o]}`);
  }
  return n.join(`
`);
}
const rc = new Dt();
function xg(s) {
  $t._getMatrix(rc, $t.workingColorSpace, s);
  const t = `mat3( ${rc.elements.map((e) => e.toFixed(4))} )`;
  switch ($t.getTransfer(s)) {
    case Br:
      return [t, "LinearTransferOETF"];
    case ee:
      return [t, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space: ", s), [t, "LinearTransferOETF"];
  }
}
function oc(s, t, e) {
  const n = s.getShaderParameter(t, s.COMPILE_STATUS), i = s.getShaderInfoLog(t).trim();
  if (n && i === "") return "";
  const r = /ERROR: 0:(\d+)/.exec(i);
  if (r) {
    const o = parseInt(r[1]);
    return e.toUpperCase() + `

` + i + `

` + vg(s.getShaderSource(t), o);
  } else return i;
}
function yg(s, t) {
  const e = xg(t);
  return [`vec4 ${s}( vec4 value ) {`, `	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`, "}"].join(`
`);
}
function Sg(s, t) {
  let e;
  switch (t) {
    case ru:
      e = "Linear";
      break;
    case ou:
      e = "Reinhard";
      break;
    case au:
      e = "Cineon";
      break;
    case lu:
      e = "ACESFilmic";
      break;
    case hu:
      e = "AgX";
      break;
    case uu:
      e = "Neutral";
      break;
    case cu:
      e = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), e = "Linear";
  }
  return "vec3 " + s + "( vec3 color ) { return " + e + "ToneMapping( color ); }";
}
const gr = new b();
function Mg() {
  $t.getLuminanceCoefficients(gr);
  const s = gr.x.toFixed(4), t = gr.y.toFixed(4), e = gr.z.toFixed(4);
  return ["float luminance( const in vec3 rgb ) {", `	const vec3 weights = vec3( ${s}, ${t}, ${e} );`, "	return dot( weights, rgb );", "}"].join(`
`);
}
function Eg(s) {
  return [s.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", s.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(Ls).join(`
`);
}
function bg(s) {
  const t = [];
  for (const e in s) {
    const n = s[e];
    n !== false && t.push("#define " + e + " " + n);
  }
  return t.join(`
`);
}
function wg(s, t) {
  const e = {}, n = s.getProgramParameter(t, s.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < n; i++) {
    const r = s.getActiveAttrib(t, i), o = r.name;
    let a = 1;
    r.type === s.FLOAT_MAT2 && (a = 2), r.type === s.FLOAT_MAT3 && (a = 3), r.type === s.FLOAT_MAT4 && (a = 4), e[o] = { type: r.type, location: s.getAttribLocation(t, o), locationSize: a };
  }
  return e;
}
function Ls(s) {
  return s !== "";
}
function ac(s, t) {
  const e = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return s.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, e).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function lc(s, t) {
  return s.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
const Tg = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Ia(s) {
  return s.replace(Tg, Cg);
}
const Ag = /* @__PURE__ */ new Map();
function Cg(s, t) {
  let e = Nt[t];
  if (e === void 0) {
    const n = Ag.get(t);
    if (n !== void 0) e = Nt[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, n);
    else throw new Error("Can not resolve #include <" + t + ">");
  }
  return Ia(e);
}
const Rg = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function cc(s) {
  return s.replace(Rg, Pg);
}
function Pg(s, t, e, n) {
  let i = "";
  for (let r = parseInt(t); r < parseInt(e); r++) i += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
  return i;
}
function hc(s) {
  let t = `precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;
  return s.precision === "highp" ? t += `
#define HIGH_PRECISION` : s.precision === "mediump" ? t += `
#define MEDIUM_PRECISION` : s.precision === "lowp" && (t += `
#define LOW_PRECISION`), t;
}
function Lg(s) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return s.shadowMapType === Nc ? t = "SHADOWMAP_TYPE_PCF" : s.shadowMapType === Bh ? t = "SHADOWMAP_TYPE_PCF_SOFT" : s.shadowMapType === Cn && (t = "SHADOWMAP_TYPE_VSM"), t;
}
function Dg(s) {
  let t = "ENVMAP_TYPE_CUBE";
  if (s.envMap) switch (s.envMapMode) {
    case rs:
    case os:
      t = "ENVMAP_TYPE_CUBE";
      break;
    case Yr:
      t = "ENVMAP_TYPE_CUBE_UV";
      break;
  }
  return t;
}
function Ig(s) {
  let t = "ENVMAP_MODE_REFLECTION";
  if (s.envMap) switch (s.envMapMode) {
    case os:
      t = "ENVMAP_MODE_REFRACTION";
      break;
  }
  return t;
}
function Ug(s) {
  let t = "ENVMAP_BLENDING_NONE";
  if (s.envMap) switch (s.combine) {
    case Oc:
      t = "ENVMAP_BLENDING_MULTIPLY";
      break;
    case iu:
      t = "ENVMAP_BLENDING_MIX";
      break;
    case su:
      t = "ENVMAP_BLENDING_ADD";
      break;
  }
  return t;
}
function Fg(s) {
  const t = s.envMapCubeUVHeight;
  if (t === null) return null;
  const e = Math.log2(t) - 2, n = 1 / t;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 112)), texelHeight: n, maxMip: e };
}
function Ng(s, t, e, n) {
  const i = s.getContext(), r = e.defines;
  let o = e.vertexShader, a = e.fragmentShader;
  const l = Lg(e), c = Dg(e), h = Ig(e), u = Ug(e), d = Fg(e), f = Eg(e), g = bg(r), _ = i.createProgram();
  let m, p, T = e.glslVersion ? "#version " + e.glslVersion + `
` : "";
  e.isRawShaderMaterial ? (m = ["#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, g].filter(Ls).join(`
`), m.length > 0 && (m += `
`), p = ["#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, g].filter(Ls).join(`
`), p.length > 0 && (p += `
`)) : (m = [hc(e), "#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, g, e.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "", e.batching ? "#define USE_BATCHING" : "", e.batchingColor ? "#define USE_BATCHING_COLOR" : "", e.instancing ? "#define USE_INSTANCING" : "", e.instancingColor ? "#define USE_INSTANCING_COLOR" : "", e.instancingMorph ? "#define USE_INSTANCING_MORPH" : "", e.useFog && e.fog ? "#define USE_FOG" : "", e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "", e.map ? "#define USE_MAP" : "", e.envMap ? "#define USE_ENVMAP" : "", e.envMap ? "#define " + h : "", e.lightMap ? "#define USE_LIGHTMAP" : "", e.aoMap ? "#define USE_AOMAP" : "", e.bumpMap ? "#define USE_BUMPMAP" : "", e.normalMap ? "#define USE_NORMALMAP" : "", e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", e.displacementMap ? "#define USE_DISPLACEMENTMAP" : "", e.emissiveMap ? "#define USE_EMISSIVEMAP" : "", e.anisotropy ? "#define USE_ANISOTROPY" : "", e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", e.specularMap ? "#define USE_SPECULARMAP" : "", e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", e.metalnessMap ? "#define USE_METALNESSMAP" : "", e.alphaMap ? "#define USE_ALPHAMAP" : "", e.alphaHash ? "#define USE_ALPHAHASH" : "", e.transmission ? "#define USE_TRANSMISSION" : "", e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", e.thicknessMap ? "#define USE_THICKNESSMAP" : "", e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", e.mapUv ? "#define MAP_UV " + e.mapUv : "", e.alphaMapUv ? "#define ALPHAMAP_UV " + e.alphaMapUv : "", e.lightMapUv ? "#define LIGHTMAP_UV " + e.lightMapUv : "", e.aoMapUv ? "#define AOMAP_UV " + e.aoMapUv : "", e.emissiveMapUv ? "#define EMISSIVEMAP_UV " + e.emissiveMapUv : "", e.bumpMapUv ? "#define BUMPMAP_UV " + e.bumpMapUv : "", e.normalMapUv ? "#define NORMALMAP_UV " + e.normalMapUv : "", e.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + e.displacementMapUv : "", e.metalnessMapUv ? "#define METALNESSMAP_UV " + e.metalnessMapUv : "", e.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + e.roughnessMapUv : "", e.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + e.anisotropyMapUv : "", e.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + e.clearcoatMapUv : "", e.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + e.clearcoatNormalMapUv : "", e.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + e.clearcoatRoughnessMapUv : "", e.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + e.iridescenceMapUv : "", e.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + e.iridescenceThicknessMapUv : "", e.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + e.sheenColorMapUv : "", e.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + e.sheenRoughnessMapUv : "", e.specularMapUv ? "#define SPECULARMAP_UV " + e.specularMapUv : "", e.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + e.specularColorMapUv : "", e.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + e.specularIntensityMapUv : "", e.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + e.transmissionMapUv : "", e.thicknessMapUv ? "#define THICKNESSMAP_UV " + e.thicknessMapUv : "", e.vertexTangents && e.flatShading === false ? "#define USE_TANGENT" : "", e.vertexColors ? "#define USE_COLOR" : "", e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", e.vertexUv1s ? "#define USE_UV1" : "", e.vertexUv2s ? "#define USE_UV2" : "", e.vertexUv3s ? "#define USE_UV3" : "", e.pointsUvs ? "#define USE_POINTS_UV" : "", e.flatShading ? "#define FLAT_SHADED" : "", e.skinning ? "#define USE_SKINNING" : "", e.morphTargets ? "#define USE_MORPHTARGETS" : "", e.morphNormals && e.flatShading === false ? "#define USE_MORPHNORMALS" : "", e.morphColors ? "#define USE_MORPHCOLORS" : "", e.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + e.morphTextureStride : "", e.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + e.morphTargetsCount : "", e.doubleSided ? "#define DOUBLE_SIDED" : "", e.flipSided ? "#define FLIP_SIDED" : "", e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", e.shadowMapEnabled ? "#define " + l : "", e.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", e.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", "#ifdef USE_INSTANCING", "	attribute mat4 instanceMatrix;", "#endif", "#ifdef USE_INSTANCING_COLOR", "	attribute vec3 instanceColor;", "#endif", "#ifdef USE_INSTANCING_MORPH", "	uniform sampler2D morphTexture;", "#endif", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_UV1", "	attribute vec2 uv1;", "#endif", "#ifdef USE_UV2", "	attribute vec2 uv2;", "#endif", "#ifdef USE_UV3", "	attribute vec2 uv3;", "#endif", "#ifdef USE_TANGENT", "	attribute vec4 tangent;", "#endif", "#if defined( USE_COLOR_ALPHA )", "	attribute vec4 color;", "#elif defined( USE_COLOR )", "	attribute vec3 color;", "#endif", "#ifdef USE_SKINNING", "	attribute vec4 skinIndex;", "	attribute vec4 skinWeight;", "#endif", `
`].filter(Ls).join(`
`), p = [hc(e), "#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, g, e.useFog && e.fog ? "#define USE_FOG" : "", e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "", e.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "", e.map ? "#define USE_MAP" : "", e.matcap ? "#define USE_MATCAP" : "", e.envMap ? "#define USE_ENVMAP" : "", e.envMap ? "#define " + c : "", e.envMap ? "#define " + h : "", e.envMap ? "#define " + u : "", d ? "#define CUBEUV_TEXEL_WIDTH " + d.texelWidth : "", d ? "#define CUBEUV_TEXEL_HEIGHT " + d.texelHeight : "", d ? "#define CUBEUV_MAX_MIP " + d.maxMip + ".0" : "", e.lightMap ? "#define USE_LIGHTMAP" : "", e.aoMap ? "#define USE_AOMAP" : "", e.bumpMap ? "#define USE_BUMPMAP" : "", e.normalMap ? "#define USE_NORMALMAP" : "", e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", e.emissiveMap ? "#define USE_EMISSIVEMAP" : "", e.anisotropy ? "#define USE_ANISOTROPY" : "", e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", e.clearcoat ? "#define USE_CLEARCOAT" : "", e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", e.dispersion ? "#define USE_DISPERSION" : "", e.iridescence ? "#define USE_IRIDESCENCE" : "", e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", e.specularMap ? "#define USE_SPECULARMAP" : "", e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", e.metalnessMap ? "#define USE_METALNESSMAP" : "", e.alphaMap ? "#define USE_ALPHAMAP" : "", e.alphaTest ? "#define USE_ALPHATEST" : "", e.alphaHash ? "#define USE_ALPHAHASH" : "", e.sheen ? "#define USE_SHEEN" : "", e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", e.transmission ? "#define USE_TRANSMISSION" : "", e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", e.thicknessMap ? "#define USE_THICKNESSMAP" : "", e.vertexTangents && e.flatShading === false ? "#define USE_TANGENT" : "", e.vertexColors || e.instancingColor || e.batchingColor ? "#define USE_COLOR" : "", e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", e.vertexUv1s ? "#define USE_UV1" : "", e.vertexUv2s ? "#define USE_UV2" : "", e.vertexUv3s ? "#define USE_UV3" : "", e.pointsUvs ? "#define USE_POINTS_UV" : "", e.gradientMap ? "#define USE_GRADIENTMAP" : "", e.flatShading ? "#define FLAT_SHADED" : "", e.doubleSided ? "#define DOUBLE_SIDED" : "", e.flipSided ? "#define FLIP_SIDED" : "", e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", e.shadowMapEnabled ? "#define " + l : "", e.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", e.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "", e.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "", e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", e.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", e.toneMapping !== Jn ? "#define TONE_MAPPING" : "", e.toneMapping !== Jn ? Nt.tonemapping_pars_fragment : "", e.toneMapping !== Jn ? Sg("toneMapping", e.toneMapping) : "", e.dithering ? "#define DITHERING" : "", e.opaque ? "#define OPAQUE" : "", Nt.colorspace_pars_fragment, yg("linearToOutputTexel", e.outputColorSpace), Mg(), e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "", `
`].filter(Ls).join(`
`)), o = Ia(o), o = ac(o, e), o = lc(o, e), a = Ia(a), a = ac(a, e), a = lc(a, e), o = cc(o), a = cc(a), e.isRawShaderMaterial !== true && (T = `#version 300 es
`, m = [f, "#define attribute in", "#define varying out", "#define texture2D texture"].join(`
`) + `
` + m, p = ["#define varying in", e.glslVersion === ul ? "" : "layout(location = 0) out highp vec4 pc_fragColor;", e.glslVersion === ul ? "" : "#define gl_FragColor pc_fragColor", "#define gl_FragDepthEXT gl_FragDepth", "#define texture2D texture", "#define textureCube texture", "#define texture2DProj textureProj", "#define texture2DLodEXT textureLod", "#define texture2DProjLodEXT textureProjLod", "#define textureCubeLodEXT textureLod", "#define texture2DGradEXT textureGrad", "#define texture2DProjGradEXT textureProjGrad", "#define textureCubeGradEXT textureGrad"].join(`
`) + `
` + p);
  const w = T + m + o, S = T + p + a, U = sc(i, i.VERTEX_SHADER, w), C = sc(i, i.FRAGMENT_SHADER, S);
  i.attachShader(_, U), i.attachShader(_, C), e.index0AttributeName !== void 0 ? i.bindAttribLocation(_, 0, e.index0AttributeName) : e.morphTargets === true && i.bindAttribLocation(_, 0, "position"), i.linkProgram(_);
  function R(P) {
    if (s.debug.checkShaderErrors) {
      const O = i.getProgramInfoLog(_).trim(), N = i.getShaderInfoLog(U).trim(), G = i.getShaderInfoLog(C).trim();
      let j = true, V = true;
      if (i.getProgramParameter(_, i.LINK_STATUS) === false) if (j = false, typeof s.debug.onShaderError == "function") s.debug.onShaderError(i, _, U, C);
      else {
        const Z = oc(i, U, "vertex"), W = oc(i, C, "fragment");
        console.error("THREE.WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(_, i.VALIDATE_STATUS) + `

Material Name: ` + P.name + `
Material Type: ` + P.type + `

Program Info Log: ` + O + `
` + Z + `
` + W);
      }
      else O !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", O) : (N === "" || G === "") && (V = false);
      V && (P.diagnostics = { runnable: j, programLog: O, vertexShader: { log: N, prefix: m }, fragmentShader: { log: G, prefix: p } });
    }
    i.deleteShader(U), i.deleteShader(C), F = new Nr(i, _), M = wg(i, _);
  }
  let F;
  this.getUniforms = function() {
    return F === void 0 && R(this), F;
  };
  let M;
  this.getAttributes = function() {
    return M === void 0 && R(this), M;
  };
  let y = e.rendererExtensionParallelShaderCompile === false;
  return this.isReady = function() {
    return y === false && (y = i.getProgramParameter(_, gg)), y;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), i.deleteProgram(_), this.program = void 0;
  }, this.type = e.shaderType, this.name = e.shaderName, this.id = _g++, this.cacheKey = t, this.usedTimes = 1, this.program = _, this.vertexShader = U, this.fragmentShader = C, this;
}
let Og = 0;
class Bg {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(t) {
    const e = t.vertexShader, n = t.fragmentShader, i = this._getShaderStage(e), r = this._getShaderStage(n), o = this._getShaderCacheForMaterial(t);
    return o.has(i) === false && (o.add(i), i.usedTimes++), o.has(r) === false && (o.add(r), r.usedTimes++), this;
  }
  remove(t) {
    const e = this.materialCache.get(t);
    for (const n of e) n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(t), this;
  }
  getVertexShaderID(t) {
    return this._getShaderStage(t.vertexShader).id;
  }
  getFragmentShaderID(t) {
    return this._getShaderStage(t.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(t) {
    const e = this.materialCache;
    let n = e.get(t);
    return n === void 0 && (n = /* @__PURE__ */ new Set(), e.set(t, n)), n;
  }
  _getShaderStage(t) {
    const e = this.shaderCache;
    let n = e.get(t);
    return n === void 0 && (n = new zg(t), e.set(t, n)), n;
  }
}
class zg {
  constructor(t) {
    this.id = Og++, this.code = t, this.usedTimes = 0;
  }
}
function kg(s, t, e, n, i, r, o) {
  const a = new Wa(), l = new Bg(), c = /* @__PURE__ */ new Set(), h = [], u = i.logarithmicDepthBuffer, d = i.vertexTextures;
  let f = i.precision;
  const g = { MeshDepthMaterial: "depth", MeshDistanceMaterial: "distanceRGBA", MeshNormalMaterial: "normal", MeshBasicMaterial: "basic", MeshLambertMaterial: "lambert", MeshPhongMaterial: "phong", MeshToonMaterial: "toon", MeshStandardMaterial: "physical", MeshPhysicalMaterial: "physical", MeshMatcapMaterial: "matcap", LineBasicMaterial: "basic", LineDashedMaterial: "dashed", PointsMaterial: "points", ShadowMaterial: "shadow", SpriteMaterial: "sprite" };
  function _(M) {
    return c.add(M), M === 0 ? "uv" : `uv${M}`;
  }
  function m(M, y, P, O, N) {
    const G = O.fog, j = N.geometry, V = M.isMeshStandardMaterial ? O.environment : null, Z = (M.isMeshStandardMaterial ? e : t).get(M.envMap || V), W = Z && Z.mapping === Yr ? Z.image.height : null, it = g[M.type];
    M.precision !== null && (f = i.getMaxPrecision(M.precision), f !== M.precision && console.warn("THREE.WebGLProgram.getParameters:", M.precision, "not supported, using", f, "instead."));
    const ht = j.morphAttributes.position || j.morphAttributes.normal || j.morphAttributes.color, _t = ht !== void 0 ? ht.length : 0;
    let Ut = 0;
    j.morphAttributes.position !== void 0 && (Ut = 1), j.morphAttributes.normal !== void 0 && (Ut = 2), j.morphAttributes.color !== void 0 && (Ut = 3);
    let jt, H, J, dt;
    if (it) {
      const Qt = Be[it];
      jt = Qt.vertexShader, H = Qt.fragmentShader;
    } else jt = M.vertexShader, H = M.fragmentShader, l.update(M), J = l.getVertexShaderID(M), dt = l.getFragmentShaderID(M);
    const st = s.getRenderTarget(), Et = s.state.buffers.depth.getReversed(), kt = N.isInstancedMesh === true, wt = N.isBatchedMesh === true, ae = !!M.map, ie = !!M.matcap, Bt = !!Z, A = !!M.aoMap, je = !!M.lightMap, Vt = !!M.bumpMap, Gt = !!M.normalMap, yt = !!M.displacementMap, oe = !!M.emissiveMap, xt = !!M.metalnessMap, E = !!M.roughnessMap, v = M.anisotropy > 0, B = M.clearcoat > 0, q = M.dispersion > 0, K = M.iridescence > 0, Y = M.sheen > 0, vt = M.transmission > 0, at = v && !!M.anisotropyMap, ft = B && !!M.clearcoatMap, Xt = B && !!M.clearcoatNormalMap, et = B && !!M.clearcoatRoughnessMap, pt = K && !!M.iridescenceMap, Tt = K && !!M.iridescenceThicknessMap, At = Y && !!M.sheenColorMap, mt = Y && !!M.sheenRoughnessMap, Wt = !!M.specularMap, Ft = !!M.specularColorMap, se = !!M.specularIntensityMap, L = vt && !!M.transmissionMap, rt = vt && !!M.thicknessMap, X = !!M.gradientMap, $ = !!M.alphaMap, ct = M.alphaTest > 0, lt = !!M.alphaHash, Lt = !!M.extensions;
    let he = Jn;
    M.toneMapped && (st === null || st.isXRRenderTarget === true) && (he = s.toneMapping);
    const we = { shaderID: it, shaderType: M.type, shaderName: M.name, vertexShader: jt, fragmentShader: H, defines: M.defines, customVertexShaderID: J, customFragmentShaderID: dt, isRawShaderMaterial: M.isRawShaderMaterial === true, glslVersion: M.glslVersion, precision: f, batching: wt, batchingColor: wt && N._colorsTexture !== null, instancing: kt, instancingColor: kt && N.instanceColor !== null, instancingMorph: kt && N.morphTexture !== null, supportsVertexTextures: d, outputColorSpace: st === null ? s.outputColorSpace : st.isXRRenderTarget === true ? st.texture.colorSpace : cs, alphaToCoverage: !!M.alphaToCoverage, map: ae, matcap: ie, envMap: Bt, envMapMode: Bt && Z.mapping, envMapCubeUVHeight: W, aoMap: A, lightMap: je, bumpMap: Vt, normalMap: Gt, displacementMap: d && yt, emissiveMap: oe, normalMapObjectSpace: Gt && M.normalMapType === gu, normalMapTangentSpace: Gt && M.normalMapType === mu, metalnessMap: xt, roughnessMap: E, anisotropy: v, anisotropyMap: at, clearcoat: B, clearcoatMap: ft, clearcoatNormalMap: Xt, clearcoatRoughnessMap: et, dispersion: q, iridescence: K, iridescenceMap: pt, iridescenceThicknessMap: Tt, sheen: Y, sheenColorMap: At, sheenRoughnessMap: mt, specularMap: Wt, specularColorMap: Ft, specularIntensityMap: se, transmission: vt, transmissionMap: L, thicknessMap: rt, gradientMap: X, opaque: M.transparent === false && M.blending === es && M.alphaToCoverage === false, alphaMap: $, alphaTest: ct, alphaHash: lt, combine: M.combine, mapUv: ae && _(M.map.channel), aoMapUv: A && _(M.aoMap.channel), lightMapUv: je && _(M.lightMap.channel), bumpMapUv: Vt && _(M.bumpMap.channel), normalMapUv: Gt && _(M.normalMap.channel), displacementMapUv: yt && _(M.displacementMap.channel), emissiveMapUv: oe && _(M.emissiveMap.channel), metalnessMapUv: xt && _(M.metalnessMap.channel), roughnessMapUv: E && _(M.roughnessMap.channel), anisotropyMapUv: at && _(M.anisotropyMap.channel), clearcoatMapUv: ft && _(M.clearcoatMap.channel), clearcoatNormalMapUv: Xt && _(M.clearcoatNormalMap.channel), clearcoatRoughnessMapUv: et && _(M.clearcoatRoughnessMap.channel), iridescenceMapUv: pt && _(M.iridescenceMap.channel), iridescenceThicknessMapUv: Tt && _(M.iridescenceThicknessMap.channel), sheenColorMapUv: At && _(M.sheenColorMap.channel), sheenRoughnessMapUv: mt && _(M.sheenRoughnessMap.channel), specularMapUv: Wt && _(M.specularMap.channel), specularColorMapUv: Ft && _(M.specularColorMap.channel), specularIntensityMapUv: se && _(M.specularIntensityMap.channel), transmissionMapUv: L && _(M.transmissionMap.channel), thicknessMapUv: rt && _(M.thicknessMap.channel), alphaMapUv: $ && _(M.alphaMap.channel), vertexTangents: !!j.attributes.tangent && (Gt || v), vertexColors: M.vertexColors, vertexAlphas: M.vertexColors === true && !!j.attributes.color && j.attributes.color.itemSize === 4, pointsUvs: N.isPoints === true && !!j.attributes.uv && (ae || $), fog: !!G, useFog: M.fog === true, fogExp2: !!G && G.isFogExp2, flatShading: M.flatShading === true, sizeAttenuation: M.sizeAttenuation === true, logarithmicDepthBuffer: u, reverseDepthBuffer: Et, skinning: N.isSkinnedMesh === true, morphTargets: j.morphAttributes.position !== void 0, morphNormals: j.morphAttributes.normal !== void 0, morphColors: j.morphAttributes.color !== void 0, morphTargetsCount: _t, morphTextureStride: Ut, numDirLights: y.directional.length, numPointLights: y.point.length, numSpotLights: y.spot.length, numSpotLightMaps: y.spotLightMap.length, numRectAreaLights: y.rectArea.length, numHemiLights: y.hemi.length, numDirLightShadows: y.directionalShadowMap.length, numPointLightShadows: y.pointShadowMap.length, numSpotLightShadows: y.spotShadowMap.length, numSpotLightShadowsWithMaps: y.numSpotLightShadowsWithMaps, numLightProbes: y.numLightProbes, numClippingPlanes: o.numPlanes, numClipIntersection: o.numIntersection, dithering: M.dithering, shadowMapEnabled: s.shadowMap.enabled && P.length > 0, shadowMapType: s.shadowMap.type, toneMapping: he, decodeVideoTexture: ae && M.map.isVideoTexture === true && $t.getTransfer(M.map.colorSpace) === ee, decodeVideoTextureEmissive: oe && M.emissiveMap.isVideoTexture === true && $t.getTransfer(M.emissiveMap.colorSpace) === ee, premultipliedAlpha: M.premultipliedAlpha, doubleSided: M.side === ze, flipSided: M.side === Ve, useDepthPacking: M.depthPacking >= 0, depthPacking: M.depthPacking || 0, index0AttributeName: M.index0AttributeName, extensionClipCullDistance: Lt && M.extensions.clipCullDistance === true && n.has("WEBGL_clip_cull_distance"), extensionMultiDraw: (Lt && M.extensions.multiDraw === true || wt) && n.has("WEBGL_multi_draw"), rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"), customProgramCacheKey: M.customProgramCacheKey() };
    return we.vertexUv1s = c.has(1), we.vertexUv2s = c.has(2), we.vertexUv3s = c.has(3), c.clear(), we;
  }
  function p(M) {
    const y = [];
    if (M.shaderID ? y.push(M.shaderID) : (y.push(M.customVertexShaderID), y.push(M.customFragmentShaderID)), M.defines !== void 0) for (const P in M.defines) y.push(P), y.push(M.defines[P]);
    return M.isRawShaderMaterial === false && (T(y, M), w(y, M), y.push(s.outputColorSpace)), y.push(M.customProgramCacheKey), y.join();
  }
  function T(M, y) {
    M.push(y.precision), M.push(y.outputColorSpace), M.push(y.envMapMode), M.push(y.envMapCubeUVHeight), M.push(y.mapUv), M.push(y.alphaMapUv), M.push(y.lightMapUv), M.push(y.aoMapUv), M.push(y.bumpMapUv), M.push(y.normalMapUv), M.push(y.displacementMapUv), M.push(y.emissiveMapUv), M.push(y.metalnessMapUv), M.push(y.roughnessMapUv), M.push(y.anisotropyMapUv), M.push(y.clearcoatMapUv), M.push(y.clearcoatNormalMapUv), M.push(y.clearcoatRoughnessMapUv), M.push(y.iridescenceMapUv), M.push(y.iridescenceThicknessMapUv), M.push(y.sheenColorMapUv), M.push(y.sheenRoughnessMapUv), M.push(y.specularMapUv), M.push(y.specularColorMapUv), M.push(y.specularIntensityMapUv), M.push(y.transmissionMapUv), M.push(y.thicknessMapUv), M.push(y.combine), M.push(y.fogExp2), M.push(y.sizeAttenuation), M.push(y.morphTargetsCount), M.push(y.morphAttributeCount), M.push(y.numDirLights), M.push(y.numPointLights), M.push(y.numSpotLights), M.push(y.numSpotLightMaps), M.push(y.numHemiLights), M.push(y.numRectAreaLights), M.push(y.numDirLightShadows), M.push(y.numPointLightShadows), M.push(y.numSpotLightShadows), M.push(y.numSpotLightShadowsWithMaps), M.push(y.numLightProbes), M.push(y.shadowMapType), M.push(y.toneMapping), M.push(y.numClippingPlanes), M.push(y.numClipIntersection), M.push(y.depthPacking);
  }
  function w(M, y) {
    a.disableAll(), y.supportsVertexTextures && a.enable(0), y.instancing && a.enable(1), y.instancingColor && a.enable(2), y.instancingMorph && a.enable(3), y.matcap && a.enable(4), y.envMap && a.enable(5), y.normalMapObjectSpace && a.enable(6), y.normalMapTangentSpace && a.enable(7), y.clearcoat && a.enable(8), y.iridescence && a.enable(9), y.alphaTest && a.enable(10), y.vertexColors && a.enable(11), y.vertexAlphas && a.enable(12), y.vertexUv1s && a.enable(13), y.vertexUv2s && a.enable(14), y.vertexUv3s && a.enable(15), y.vertexTangents && a.enable(16), y.anisotropy && a.enable(17), y.alphaHash && a.enable(18), y.batching && a.enable(19), y.dispersion && a.enable(20), y.batchingColor && a.enable(21), M.push(a.mask), a.disableAll(), y.fog && a.enable(0), y.useFog && a.enable(1), y.flatShading && a.enable(2), y.logarithmicDepthBuffer && a.enable(3), y.reverseDepthBuffer && a.enable(4), y.skinning && a.enable(5), y.morphTargets && a.enable(6), y.morphNormals && a.enable(7), y.morphColors && a.enable(8), y.premultipliedAlpha && a.enable(9), y.shadowMapEnabled && a.enable(10), y.doubleSided && a.enable(11), y.flipSided && a.enable(12), y.useDepthPacking && a.enable(13), y.dithering && a.enable(14), y.transmission && a.enable(15), y.sheen && a.enable(16), y.opaque && a.enable(17), y.pointsUvs && a.enable(18), y.decodeVideoTexture && a.enable(19), y.decodeVideoTextureEmissive && a.enable(20), y.alphaToCoverage && a.enable(21), M.push(a.mask);
  }
  function S(M) {
    const y = g[M.type];
    let P;
    if (y) {
      const O = Be[y];
      P = Xa.clone(O.uniforms);
    } else P = M.uniforms;
    return P;
  }
  function U(M, y) {
    let P;
    for (let O = 0, N = h.length; O < N; O++) {
      const G = h[O];
      if (G.cacheKey === y) {
        P = G, ++P.usedTimes;
        break;
      }
    }
    return P === void 0 && (P = new Ng(s, y, M, r), h.push(P)), P;
  }
  function C(M) {
    if (--M.usedTimes === 0) {
      const y = h.indexOf(M);
      h[y] = h[h.length - 1], h.pop(), M.destroy();
    }
  }
  function R(M) {
    l.remove(M);
  }
  function F() {
    l.dispose();
  }
  return { getParameters: m, getProgramCacheKey: p, getUniforms: S, acquireProgram: U, releaseProgram: C, releaseShaderCache: R, programs: h, dispose: F };
}
function Hg() {
  let s = /* @__PURE__ */ new WeakMap();
  function t(o) {
    return s.has(o);
  }
  function e(o) {
    let a = s.get(o);
    return a === void 0 && (a = {}, s.set(o, a)), a;
  }
  function n(o) {
    s.delete(o);
  }
  function i(o, a, l) {
    s.get(o)[a] = l;
  }
  function r() {
    s = /* @__PURE__ */ new WeakMap();
  }
  return { has: t, get: e, remove: n, update: i, dispose: r };
}
function Vg(s, t) {
  return s.groupOrder !== t.groupOrder ? s.groupOrder - t.groupOrder : s.renderOrder !== t.renderOrder ? s.renderOrder - t.renderOrder : s.material.id !== t.material.id ? s.material.id - t.material.id : s.z !== t.z ? s.z - t.z : s.id - t.id;
}
function uc(s, t) {
  return s.groupOrder !== t.groupOrder ? s.groupOrder - t.groupOrder : s.renderOrder !== t.renderOrder ? s.renderOrder - t.renderOrder : s.z !== t.z ? t.z - s.z : s.id - t.id;
}
function dc() {
  const s = [];
  let t = 0;
  const e = [], n = [], i = [];
  function r() {
    t = 0, e.length = 0, n.length = 0, i.length = 0;
  }
  function o(u, d, f, g, _, m) {
    let p = s[t];
    return p === void 0 ? (p = { id: u.id, object: u, geometry: d, material: f, groupOrder: g, renderOrder: u.renderOrder, z: _, group: m }, s[t] = p) : (p.id = u.id, p.object = u, p.geometry = d, p.material = f, p.groupOrder = g, p.renderOrder = u.renderOrder, p.z = _, p.group = m), t++, p;
  }
  function a(u, d, f, g, _, m) {
    const p = o(u, d, f, g, _, m);
    f.transmission > 0 ? n.push(p) : f.transparent === true ? i.push(p) : e.push(p);
  }
  function l(u, d, f, g, _, m) {
    const p = o(u, d, f, g, _, m);
    f.transmission > 0 ? n.unshift(p) : f.transparent === true ? i.unshift(p) : e.unshift(p);
  }
  function c(u, d) {
    e.length > 1 && e.sort(u || Vg), n.length > 1 && n.sort(d || uc), i.length > 1 && i.sort(d || uc);
  }
  function h() {
    for (let u = t, d = s.length; u < d; u++) {
      const f = s[u];
      if (f.id === null) break;
      f.id = null, f.object = null, f.geometry = null, f.material = null, f.group = null;
    }
  }
  return { opaque: e, transmissive: n, transparent: i, init: r, push: a, unshift: l, finish: h, sort: c };
}
function Gg() {
  let s = /* @__PURE__ */ new WeakMap();
  function t(n, i) {
    const r = s.get(n);
    let o;
    return r === void 0 ? (o = new dc(), s.set(n, [o])) : i >= r.length ? (o = new dc(), r.push(o)) : o = r[i], o;
  }
  function e() {
    s = /* @__PURE__ */ new WeakMap();
  }
  return { get: t, dispose: e };
}
function Wg() {
  const s = {};
  return { get: function(t) {
    if (s[t.id] !== void 0) return s[t.id];
    let e;
    switch (t.type) {
      case "DirectionalLight":
        e = { direction: new b(), color: new zt() };
        break;
      case "SpotLight":
        e = { position: new b(), direction: new b(), color: new zt(), distance: 0, coneCos: 0, penumbraCos: 0, decay: 0 };
        break;
      case "PointLight":
        e = { position: new b(), color: new zt(), distance: 0, decay: 0 };
        break;
      case "HemisphereLight":
        e = { direction: new b(), skyColor: new zt(), groundColor: new zt() };
        break;
      case "RectAreaLight":
        e = { color: new zt(), position: new b(), halfWidth: new b(), halfHeight: new b() };
        break;
    }
    return s[t.id] = e, e;
  } };
}
function Xg() {
  const s = {};
  return { get: function(t) {
    if (s[t.id] !== void 0) return s[t.id];
    let e;
    switch (t.type) {
      case "DirectionalLight":
        e = { shadowIntensity: 1, shadowBias: 0, shadowNormalBias: 0, shadowRadius: 1, shadowMapSize: new Mt() };
        break;
      case "SpotLight":
        e = { shadowIntensity: 1, shadowBias: 0, shadowNormalBias: 0, shadowRadius: 1, shadowMapSize: new Mt() };
        break;
      case "PointLight":
        e = { shadowIntensity: 1, shadowBias: 0, shadowNormalBias: 0, shadowRadius: 1, shadowMapSize: new Mt(), shadowCameraNear: 1, shadowCameraFar: 1e3 };
        break;
    }
    return s[t.id] = e, e;
  } };
}
let Yg = 0;
function qg(s, t) {
  return (t.castShadow ? 2 : 0) - (s.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (s.map ? 1 : 0);
}
function $g(s) {
  const t = new Wg(), e = Xg(), n = { version: 0, hash: { directionalLength: -1, pointLength: -1, spotLength: -1, rectAreaLength: -1, hemiLength: -1, numDirectionalShadows: -1, numPointShadows: -1, numSpotShadows: -1, numSpotMaps: -1, numLightProbes: -1 }, ambient: [0, 0, 0], probe: [], directional: [], directionalShadow: [], directionalShadowMap: [], directionalShadowMatrix: [], spot: [], spotLightMap: [], spotShadow: [], spotShadowMap: [], spotLightMatrix: [], rectArea: [], rectAreaLTC1: null, rectAreaLTC2: null, point: [], pointShadow: [], pointShadowMap: [], pointShadowMatrix: [], hemi: [], numSpotLightShadowsWithMaps: 0, numLightProbes: 0 };
  for (let c = 0; c < 9; c++) n.probe.push(new b());
  const i = new b(), r = new Jt(), o = new Jt();
  function a(c) {
    let h = 0, u = 0, d = 0;
    for (let M = 0; M < 9; M++) n.probe[M].set(0, 0, 0);
    let f = 0, g = 0, _ = 0, m = 0, p = 0, T = 0, w = 0, S = 0, U = 0, C = 0, R = 0;
    c.sort(qg);
    for (let M = 0, y = c.length; M < y; M++) {
      const P = c[M], O = P.color, N = P.intensity, G = P.distance, j = P.shadow && P.shadow.map ? P.shadow.map.texture : null;
      if (P.isAmbientLight) h += O.r * N, u += O.g * N, d += O.b * N;
      else if (P.isLightProbe) {
        for (let V = 0; V < 9; V++) n.probe[V].addScaledVector(P.sh.coefficients[V], N);
        R++;
      } else if (P.isDirectionalLight) {
        const V = t.get(P);
        if (V.color.copy(P.color).multiplyScalar(P.intensity), P.castShadow) {
          const Z = P.shadow, W = e.get(P);
          W.shadowIntensity = Z.intensity, W.shadowBias = Z.bias, W.shadowNormalBias = Z.normalBias, W.shadowRadius = Z.radius, W.shadowMapSize = Z.mapSize, n.directionalShadow[f] = W, n.directionalShadowMap[f] = j, n.directionalShadowMatrix[f] = P.shadow.matrix, T++;
        }
        n.directional[f] = V, f++;
      } else if (P.isSpotLight) {
        const V = t.get(P);
        V.position.setFromMatrixPosition(P.matrixWorld), V.color.copy(O).multiplyScalar(N), V.distance = G, V.coneCos = Math.cos(P.angle), V.penumbraCos = Math.cos(P.angle * (1 - P.penumbra)), V.decay = P.decay, n.spot[_] = V;
        const Z = P.shadow;
        if (P.map && (n.spotLightMap[U] = P.map, U++, Z.updateMatrices(P), P.castShadow && C++), n.spotLightMatrix[_] = Z.matrix, P.castShadow) {
          const W = e.get(P);
          W.shadowIntensity = Z.intensity, W.shadowBias = Z.bias, W.shadowNormalBias = Z.normalBias, W.shadowRadius = Z.radius, W.shadowMapSize = Z.mapSize, n.spotShadow[_] = W, n.spotShadowMap[_] = j, S++;
        }
        _++;
      } else if (P.isRectAreaLight) {
        const V = t.get(P);
        V.color.copy(O).multiplyScalar(N), V.halfWidth.set(P.width * 0.5, 0, 0), V.halfHeight.set(0, P.height * 0.5, 0), n.rectArea[m] = V, m++;
      } else if (P.isPointLight) {
        const V = t.get(P);
        if (V.color.copy(P.color).multiplyScalar(P.intensity), V.distance = P.distance, V.decay = P.decay, P.castShadow) {
          const Z = P.shadow, W = e.get(P);
          W.shadowIntensity = Z.intensity, W.shadowBias = Z.bias, W.shadowNormalBias = Z.normalBias, W.shadowRadius = Z.radius, W.shadowMapSize = Z.mapSize, W.shadowCameraNear = Z.camera.near, W.shadowCameraFar = Z.camera.far, n.pointShadow[g] = W, n.pointShadowMap[g] = j, n.pointShadowMatrix[g] = P.shadow.matrix, w++;
        }
        n.point[g] = V, g++;
      } else if (P.isHemisphereLight) {
        const V = t.get(P);
        V.skyColor.copy(P.color).multiplyScalar(N), V.groundColor.copy(P.groundColor).multiplyScalar(N), n.hemi[p] = V, p++;
      }
    }
    m > 0 && (s.has("OES_texture_float_linear") === true ? (n.rectAreaLTC1 = nt.LTC_FLOAT_1, n.rectAreaLTC2 = nt.LTC_FLOAT_2) : (n.rectAreaLTC1 = nt.LTC_HALF_1, n.rectAreaLTC2 = nt.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = u, n.ambient[2] = d;
    const F = n.hash;
    (F.directionalLength !== f || F.pointLength !== g || F.spotLength !== _ || F.rectAreaLength !== m || F.hemiLength !== p || F.numDirectionalShadows !== T || F.numPointShadows !== w || F.numSpotShadows !== S || F.numSpotMaps !== U || F.numLightProbes !== R) && (n.directional.length = f, n.spot.length = _, n.rectArea.length = m, n.point.length = g, n.hemi.length = p, n.directionalShadow.length = T, n.directionalShadowMap.length = T, n.pointShadow.length = w, n.pointShadowMap.length = w, n.spotShadow.length = S, n.spotShadowMap.length = S, n.directionalShadowMatrix.length = T, n.pointShadowMatrix.length = w, n.spotLightMatrix.length = S + U - C, n.spotLightMap.length = U, n.numSpotLightShadowsWithMaps = C, n.numLightProbes = R, F.directionalLength = f, F.pointLength = g, F.spotLength = _, F.rectAreaLength = m, F.hemiLength = p, F.numDirectionalShadows = T, F.numPointShadows = w, F.numSpotShadows = S, F.numSpotMaps = U, F.numLightProbes = R, n.version = Yg++);
  }
  function l(c, h) {
    let u = 0, d = 0, f = 0, g = 0, _ = 0;
    const m = h.matrixWorldInverse;
    for (let p = 0, T = c.length; p < T; p++) {
      const w = c[p];
      if (w.isDirectionalLight) {
        const S = n.directional[u];
        S.direction.setFromMatrixPosition(w.matrixWorld), i.setFromMatrixPosition(w.target.matrixWorld), S.direction.sub(i), S.direction.transformDirection(m), u++;
      } else if (w.isSpotLight) {
        const S = n.spot[f];
        S.position.setFromMatrixPosition(w.matrixWorld), S.position.applyMatrix4(m), S.direction.setFromMatrixPosition(w.matrixWorld), i.setFromMatrixPosition(w.target.matrixWorld), S.direction.sub(i), S.direction.transformDirection(m), f++;
      } else if (w.isRectAreaLight) {
        const S = n.rectArea[g];
        S.position.setFromMatrixPosition(w.matrixWorld), S.position.applyMatrix4(m), o.identity(), r.copy(w.matrixWorld), r.premultiply(m), o.extractRotation(r), S.halfWidth.set(w.width * 0.5, 0, 0), S.halfHeight.set(0, w.height * 0.5, 0), S.halfWidth.applyMatrix4(o), S.halfHeight.applyMatrix4(o), g++;
      } else if (w.isPointLight) {
        const S = n.point[d];
        S.position.setFromMatrixPosition(w.matrixWorld), S.position.applyMatrix4(m), d++;
      } else if (w.isHemisphereLight) {
        const S = n.hemi[_];
        S.direction.setFromMatrixPosition(w.matrixWorld), S.direction.transformDirection(m), _++;
      }
    }
  }
  return { setup: a, setupView: l, state: n };
}
function fc(s) {
  const t = new $g(s), e = [], n = [];
  function i(h) {
    c.camera = h, e.length = 0, n.length = 0;
  }
  function r(h) {
    e.push(h);
  }
  function o(h) {
    n.push(h);
  }
  function a() {
    t.setup(e);
  }
  function l(h) {
    t.setupView(e, h);
  }
  const c = { lightsArray: e, shadowsArray: n, camera: null, lights: t, transmissionRenderTarget: {} };
  return { init: i, state: c, setupLights: a, setupLightsView: l, pushLight: r, pushShadow: o };
}
function jg(s) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(i, r = 0) {
    const o = t.get(i);
    let a;
    return o === void 0 ? (a = new fc(s), t.set(i, [a])) : r >= o.length ? (a = new fc(s), o.push(a)) : a = o[r], a;
  }
  function n() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return { get: e, dispose: n };
}
const Zg = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, Kg = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function Jg(s, t, e) {
  let n = new Ya();
  const i = new Mt(), r = new Mt(), o = new re(), a = new xd({ depthPacking: pu }), l = new yd(), c = {}, h = e.maxTextureSize, u = { [Qn]: Ve, [Ve]: Qn, [ze]: ze }, d = new dn({ defines: { VSM_SAMPLES: 8 }, uniforms: { shadow_pass: { value: null }, resolution: { value: new Mt() }, radius: { value: 4 } }, vertexShader: Zg, fragmentShader: Kg }), f = d.clone();
  f.defines.HORIZONTAL_PASS = 1;
  const g = new me();
  g.setAttribute("position", new ce(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3));
  const _ = new He(g, d), m = this;
  this.enabled = false, this.autoUpdate = true, this.needsUpdate = false, this.type = Nc;
  let p = this.type;
  this.render = function(C, R, F) {
    if (m.enabled === false || m.autoUpdate === false && m.needsUpdate === false || C.length === 0) return;
    const M = s.getRenderTarget(), y = s.getActiveCubeFace(), P = s.getActiveMipmapLevel(), O = s.state;
    O.setBlending(Kn), O.buffers.color.setClear(1, 1, 1, 1), O.buffers.depth.setTest(true), O.setScissorTest(false);
    const N = p !== Cn && this.type === Cn, G = p === Cn && this.type !== Cn;
    for (let j = 0, V = C.length; j < V; j++) {
      const Z = C[j], W = Z.shadow;
      if (W === void 0) {
        console.warn("THREE.WebGLShadowMap:", Z, "has no shadow.");
        continue;
      }
      if (W.autoUpdate === false && W.needsUpdate === false) continue;
      i.copy(W.mapSize);
      const it = W.getFrameExtents();
      if (i.multiply(it), r.copy(W.mapSize), (i.x > h || i.y > h) && (i.x > h && (r.x = Math.floor(h / it.x), i.x = r.x * it.x, W.mapSize.x = r.x), i.y > h && (r.y = Math.floor(h / it.y), i.y = r.y * it.y, W.mapSize.y = r.y)), W.map === null || N === true || G === true) {
        const _t = this.type !== Cn ? { minFilter: un, magFilter: un } : {};
        W.map !== null && W.map.dispose(), W.map = new Mi(i.x, i.y, _t), W.map.texture.name = Z.name + ".shadowMap", W.camera.updateProjectionMatrix();
      }
      s.setRenderTarget(W.map), s.clear();
      const ht = W.getViewportCount();
      for (let _t = 0; _t < ht; _t++) {
        const Ut = W.getViewport(_t);
        o.set(r.x * Ut.x, r.y * Ut.y, r.x * Ut.z, r.y * Ut.w), O.viewport(o), W.updateMatrices(Z, _t), n = W.getFrustum(), S(R, F, W.camera, Z, this.type);
      }
      W.isPointLightShadow !== true && this.type === Cn && T(W, F), W.needsUpdate = false;
    }
    p = this.type, m.needsUpdate = false, s.setRenderTarget(M, y, P);
  };
  function T(C, R) {
    const F = t.update(_);
    d.defines.VSM_SAMPLES !== C.blurSamples && (d.defines.VSM_SAMPLES = C.blurSamples, f.defines.VSM_SAMPLES = C.blurSamples, d.needsUpdate = true, f.needsUpdate = true), C.mapPass === null && (C.mapPass = new Mi(i.x, i.y)), d.uniforms.shadow_pass.value = C.map.texture, d.uniforms.resolution.value = C.mapSize, d.uniforms.radius.value = C.radius, s.setRenderTarget(C.mapPass), s.clear(), s.renderBufferDirect(R, null, F, d, _, null), f.uniforms.shadow_pass.value = C.mapPass.texture, f.uniforms.resolution.value = C.mapSize, f.uniforms.radius.value = C.radius, s.setRenderTarget(C.map), s.clear(), s.renderBufferDirect(R, null, F, f, _, null);
  }
  function w(C, R, F, M) {
    let y = null;
    const P = F.isPointLight === true ? C.customDistanceMaterial : C.customDepthMaterial;
    if (P !== void 0) y = P;
    else if (y = F.isPointLight === true ? l : a, s.localClippingEnabled && R.clipShadows === true && Array.isArray(R.clippingPlanes) && R.clippingPlanes.length !== 0 || R.displacementMap && R.displacementScale !== 0 || R.alphaMap && R.alphaTest > 0 || R.map && R.alphaTest > 0) {
      const O = y.uuid, N = R.uuid;
      let G = c[O];
      G === void 0 && (G = {}, c[O] = G);
      let j = G[N];
      j === void 0 && (j = y.clone(), G[N] = j, R.addEventListener("dispose", U)), y = j;
    }
    if (y.visible = R.visible, y.wireframe = R.wireframe, M === Cn ? y.side = R.shadowSide !== null ? R.shadowSide : R.side : y.side = R.shadowSide !== null ? R.shadowSide : u[R.side], y.alphaMap = R.alphaMap, y.alphaTest = R.alphaTest, y.map = R.map, y.clipShadows = R.clipShadows, y.clippingPlanes = R.clippingPlanes, y.clipIntersection = R.clipIntersection, y.displacementMap = R.displacementMap, y.displacementScale = R.displacementScale, y.displacementBias = R.displacementBias, y.wireframeLinewidth = R.wireframeLinewidth, y.linewidth = R.linewidth, F.isPointLight === true && y.isMeshDistanceMaterial === true) {
      const O = s.properties.get(y);
      O.light = F;
    }
    return y;
  }
  function S(C, R, F, M, y) {
    if (C.visible === false) return;
    if (C.layers.test(R.layers) && (C.isMesh || C.isLine || C.isPoints) && (C.castShadow || C.receiveShadow && y === Cn) && (!C.frustumCulled || n.intersectsObject(C))) {
      C.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse, C.matrixWorld);
      const N = t.update(C), G = C.material;
      if (Array.isArray(G)) {
        const j = N.groups;
        for (let V = 0, Z = j.length; V < Z; V++) {
          const W = j[V], it = G[W.materialIndex];
          if (it && it.visible) {
            const ht = w(C, it, M, y);
            C.onBeforeShadow(s, C, R, F, N, ht, W), s.renderBufferDirect(F, null, N, ht, C, W), C.onAfterShadow(s, C, R, F, N, ht, W);
          }
        }
      } else if (G.visible) {
        const j = w(C, G, M, y);
        C.onBeforeShadow(s, C, R, F, N, j, null), s.renderBufferDirect(F, null, N, j, C, null), C.onAfterShadow(s, C, R, F, N, j, null);
      }
    }
    const O = C.children;
    for (let N = 0, G = O.length; N < G; N++) S(O[N], R, F, M, y);
  }
  function U(C) {
    C.target.removeEventListener("dispose", U);
    for (const F in c) {
      const M = c[F], y = C.target.uuid;
      y in M && (M[y].dispose(), delete M[y]);
    }
  }
}
const Qg = { [Yo]: qo, [$o]: Ko, [jo]: Jo, [ss]: Zo, [qo]: Yo, [Ko]: $o, [Jo]: jo, [Zo]: ss };
function t_(s, t) {
  function e() {
    let L = false;
    const rt = new re();
    let X = null;
    const $ = new re(0, 0, 0, 0);
    return { setMask: function(ct) {
      X !== ct && !L && (s.colorMask(ct, ct, ct, ct), X = ct);
    }, setLocked: function(ct) {
      L = ct;
    }, setClear: function(ct, lt, Lt, he, we) {
      we === true && (ct *= he, lt *= he, Lt *= he), rt.set(ct, lt, Lt, he), $.equals(rt) === false && (s.clearColor(ct, lt, Lt, he), $.copy(rt));
    }, reset: function() {
      L = false, X = null, $.set(-1, 0, 0, 0);
    } };
  }
  function n() {
    let L = false, rt = false, X = null, $ = null, ct = null;
    return { setReversed: function(lt) {
      if (rt !== lt) {
        const Lt = t.get("EXT_clip_control");
        rt ? Lt.clipControlEXT(Lt.LOWER_LEFT_EXT, Lt.ZERO_TO_ONE_EXT) : Lt.clipControlEXT(Lt.LOWER_LEFT_EXT, Lt.NEGATIVE_ONE_TO_ONE_EXT);
        const he = ct;
        ct = null, this.setClear(he);
      }
      rt = lt;
    }, getReversed: function() {
      return rt;
    }, setTest: function(lt) {
      lt ? st(s.DEPTH_TEST) : Et(s.DEPTH_TEST);
    }, setMask: function(lt) {
      X !== lt && !L && (s.depthMask(lt), X = lt);
    }, setFunc: function(lt) {
      if (rt && (lt = Qg[lt]), $ !== lt) {
        switch (lt) {
          case Yo:
            s.depthFunc(s.NEVER);
            break;
          case qo:
            s.depthFunc(s.ALWAYS);
            break;
          case $o:
            s.depthFunc(s.LESS);
            break;
          case ss:
            s.depthFunc(s.LEQUAL);
            break;
          case jo:
            s.depthFunc(s.EQUAL);
            break;
          case Zo:
            s.depthFunc(s.GEQUAL);
            break;
          case Ko:
            s.depthFunc(s.GREATER);
            break;
          case Jo:
            s.depthFunc(s.NOTEQUAL);
            break;
          default:
            s.depthFunc(s.LEQUAL);
        }
        $ = lt;
      }
    }, setLocked: function(lt) {
      L = lt;
    }, setClear: function(lt) {
      ct !== lt && (rt && (lt = 1 - lt), s.clearDepth(lt), ct = lt);
    }, reset: function() {
      L = false, X = null, $ = null, ct = null, rt = false;
    } };
  }
  function i() {
    let L = false, rt = null, X = null, $ = null, ct = null, lt = null, Lt = null, he = null, we = null;
    return { setTest: function(Qt) {
      L || (Qt ? st(s.STENCIL_TEST) : Et(s.STENCIL_TEST));
    }, setMask: function(Qt) {
      rt !== Qt && !L && (s.stencilMask(Qt), rt = Qt);
    }, setFunc: function(Qt, en, Mn) {
      (X !== Qt || $ !== en || ct !== Mn) && (s.stencilFunc(Qt, en, Mn), X = Qt, $ = en, ct = Mn);
    }, setOp: function(Qt, en, Mn) {
      (lt !== Qt || Lt !== en || he !== Mn) && (s.stencilOp(Qt, en, Mn), lt = Qt, Lt = en, he = Mn);
    }, setLocked: function(Qt) {
      L = Qt;
    }, setClear: function(Qt) {
      we !== Qt && (s.clearStencil(Qt), we = Qt);
    }, reset: function() {
      L = false, rt = null, X = null, $ = null, ct = null, lt = null, Lt = null, he = null, we = null;
    } };
  }
  const r = new e(), o = new n(), a = new i(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let h = {}, u = {}, d = /* @__PURE__ */ new WeakMap(), f = [], g = null, _ = false, m = null, p = null, T = null, w = null, S = null, U = null, C = null, R = new zt(0, 0, 0), F = 0, M = false, y = null, P = null, O = null, N = null, G = null;
  const j = s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let V = false, Z = 0;
  const W = s.getParameter(s.VERSION);
  W.indexOf("WebGL") !== -1 ? (Z = parseFloat(/^WebGL (\d)/.exec(W)[1]), V = Z >= 1) : W.indexOf("OpenGL ES") !== -1 && (Z = parseFloat(/^OpenGL ES (\d)/.exec(W)[1]), V = Z >= 2);
  let it = null, ht = {};
  const _t = s.getParameter(s.SCISSOR_BOX), Ut = s.getParameter(s.VIEWPORT), jt = new re().fromArray(_t), H = new re().fromArray(Ut);
  function J(L, rt, X, $) {
    const ct = new Uint8Array(4), lt = s.createTexture();
    s.bindTexture(L, lt), s.texParameteri(L, s.TEXTURE_MIN_FILTER, s.NEAREST), s.texParameteri(L, s.TEXTURE_MAG_FILTER, s.NEAREST);
    for (let Lt = 0; Lt < X; Lt++) L === s.TEXTURE_3D || L === s.TEXTURE_2D_ARRAY ? s.texImage3D(rt, 0, s.RGBA, 1, 1, $, 0, s.RGBA, s.UNSIGNED_BYTE, ct) : s.texImage2D(rt + Lt, 0, s.RGBA, 1, 1, 0, s.RGBA, s.UNSIGNED_BYTE, ct);
    return lt;
  }
  const dt = {};
  dt[s.TEXTURE_2D] = J(s.TEXTURE_2D, s.TEXTURE_2D, 1), dt[s.TEXTURE_CUBE_MAP] = J(s.TEXTURE_CUBE_MAP, s.TEXTURE_CUBE_MAP_POSITIVE_X, 6), dt[s.TEXTURE_2D_ARRAY] = J(s.TEXTURE_2D_ARRAY, s.TEXTURE_2D_ARRAY, 1, 1), dt[s.TEXTURE_3D] = J(s.TEXTURE_3D, s.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), o.setClear(1), a.setClear(0), st(s.DEPTH_TEST), o.setFunc(ss), Vt(false), Gt(ol), st(s.CULL_FACE), A(Kn);
  function st(L) {
    h[L] !== true && (s.enable(L), h[L] = true);
  }
  function Et(L) {
    h[L] !== false && (s.disable(L), h[L] = false);
  }
  function kt(L, rt) {
    return u[L] !== rt ? (s.bindFramebuffer(L, rt), u[L] = rt, L === s.DRAW_FRAMEBUFFER && (u[s.FRAMEBUFFER] = rt), L === s.FRAMEBUFFER && (u[s.DRAW_FRAMEBUFFER] = rt), true) : false;
  }
  function wt(L, rt) {
    let X = f, $ = false;
    if (L) {
      X = d.get(rt), X === void 0 && (X = [], d.set(rt, X));
      const ct = L.textures;
      if (X.length !== ct.length || X[0] !== s.COLOR_ATTACHMENT0) {
        for (let lt = 0, Lt = ct.length; lt < Lt; lt++) X[lt] = s.COLOR_ATTACHMENT0 + lt;
        X.length = ct.length, $ = true;
      }
    } else X[0] !== s.BACK && (X[0] = s.BACK, $ = true);
    $ && s.drawBuffers(X);
  }
  function ae(L) {
    return g !== L ? (s.useProgram(L), g = L, true) : false;
  }
  const ie = { [gi]: s.FUNC_ADD, [kh]: s.FUNC_SUBTRACT, [Hh]: s.FUNC_REVERSE_SUBTRACT };
  ie[Vh] = s.MIN, ie[Gh] = s.MAX;
  const Bt = { [Wh]: s.ZERO, [Xh]: s.ONE, [Yh]: s.SRC_COLOR, [Wo]: s.SRC_ALPHA, [Jh]: s.SRC_ALPHA_SATURATE, [Zh]: s.DST_COLOR, [$h]: s.DST_ALPHA, [qh]: s.ONE_MINUS_SRC_COLOR, [Xo]: s.ONE_MINUS_SRC_ALPHA, [Kh]: s.ONE_MINUS_DST_COLOR, [jh]: s.ONE_MINUS_DST_ALPHA, [Qh]: s.CONSTANT_COLOR, [tu]: s.ONE_MINUS_CONSTANT_COLOR, [eu]: s.CONSTANT_ALPHA, [nu]: s.ONE_MINUS_CONSTANT_ALPHA };
  function A(L, rt, X, $, ct, lt, Lt, he, we, Qt) {
    if (L === Kn) {
      _ === true && (Et(s.BLEND), _ = false);
      return;
    }
    if (_ === false && (st(s.BLEND), _ = true), L !== zh) {
      if (L !== m || Qt !== M) {
        if ((p !== gi || S !== gi) && (s.blendEquation(s.FUNC_ADD), p = gi, S = gi), Qt) switch (L) {
          case es:
            s.blendFuncSeparate(s.ONE, s.ONE_MINUS_SRC_ALPHA, s.ONE, s.ONE_MINUS_SRC_ALPHA);
            break;
          case al:
            s.blendFunc(s.ONE, s.ONE);
            break;
          case ll:
            s.blendFuncSeparate(s.ZERO, s.ONE_MINUS_SRC_COLOR, s.ZERO, s.ONE);
            break;
          case cl:
            s.blendFuncSeparate(s.ZERO, s.SRC_COLOR, s.ZERO, s.SRC_ALPHA);
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", L);
            break;
        }
        else switch (L) {
          case es:
            s.blendFuncSeparate(s.SRC_ALPHA, s.ONE_MINUS_SRC_ALPHA, s.ONE, s.ONE_MINUS_SRC_ALPHA);
            break;
          case al:
            s.blendFunc(s.SRC_ALPHA, s.ONE);
            break;
          case ll:
            s.blendFuncSeparate(s.ZERO, s.ONE_MINUS_SRC_COLOR, s.ZERO, s.ONE);
            break;
          case cl:
            s.blendFunc(s.ZERO, s.SRC_COLOR);
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", L);
            break;
        }
        T = null, w = null, U = null, C = null, R.set(0, 0, 0), F = 0, m = L, M = Qt;
      }
      return;
    }
    ct = ct || rt, lt = lt || X, Lt = Lt || $, (rt !== p || ct !== S) && (s.blendEquationSeparate(ie[rt], ie[ct]), p = rt, S = ct), (X !== T || $ !== w || lt !== U || Lt !== C) && (s.blendFuncSeparate(Bt[X], Bt[$], Bt[lt], Bt[Lt]), T = X, w = $, U = lt, C = Lt), (he.equals(R) === false || we !== F) && (s.blendColor(he.r, he.g, he.b, we), R.copy(he), F = we), m = L, M = false;
  }
  function je(L, rt) {
    L.side === ze ? Et(s.CULL_FACE) : st(s.CULL_FACE);
    let X = L.side === Ve;
    rt && (X = !X), Vt(X), L.blending === es && L.transparent === false ? A(Kn) : A(L.blending, L.blendEquation, L.blendSrc, L.blendDst, L.blendEquationAlpha, L.blendSrcAlpha, L.blendDstAlpha, L.blendColor, L.blendAlpha, L.premultipliedAlpha), o.setFunc(L.depthFunc), o.setTest(L.depthTest), o.setMask(L.depthWrite), r.setMask(L.colorWrite);
    const $ = L.stencilWrite;
    a.setTest($), $ && (a.setMask(L.stencilWriteMask), a.setFunc(L.stencilFunc, L.stencilRef, L.stencilFuncMask), a.setOp(L.stencilFail, L.stencilZFail, L.stencilZPass)), oe(L.polygonOffset, L.polygonOffsetFactor, L.polygonOffsetUnits), L.alphaToCoverage === true ? st(s.SAMPLE_ALPHA_TO_COVERAGE) : Et(s.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Vt(L) {
    y !== L && (L ? s.frontFace(s.CW) : s.frontFace(s.CCW), y = L);
  }
  function Gt(L) {
    L !== Nh ? (st(s.CULL_FACE), L !== P && (L === ol ? s.cullFace(s.BACK) : L === Oh ? s.cullFace(s.FRONT) : s.cullFace(s.FRONT_AND_BACK))) : Et(s.CULL_FACE), P = L;
  }
  function yt(L) {
    L !== O && (V && s.lineWidth(L), O = L);
  }
  function oe(L, rt, X) {
    L ? (st(s.POLYGON_OFFSET_FILL), (N !== rt || G !== X) && (s.polygonOffset(rt, X), N = rt, G = X)) : Et(s.POLYGON_OFFSET_FILL);
  }
  function xt(L) {
    L ? st(s.SCISSOR_TEST) : Et(s.SCISSOR_TEST);
  }
  function E(L) {
    L === void 0 && (L = s.TEXTURE0 + j - 1), it !== L && (s.activeTexture(L), it = L);
  }
  function v(L, rt, X) {
    X === void 0 && (it === null ? X = s.TEXTURE0 + j - 1 : X = it);
    let $ = ht[X];
    $ === void 0 && ($ = { type: void 0, texture: void 0 }, ht[X] = $), ($.type !== L || $.texture !== rt) && (it !== X && (s.activeTexture(X), it = X), s.bindTexture(L, rt || dt[L]), $.type = L, $.texture = rt);
  }
  function B() {
    const L = ht[it];
    L !== void 0 && L.type !== void 0 && (s.bindTexture(L.type, null), L.type = void 0, L.texture = void 0);
  }
  function q() {
    try {
      s.compressedTexImage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function K() {
    try {
      s.compressedTexImage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function Y() {
    try {
      s.texSubImage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function vt() {
    try {
      s.texSubImage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function at() {
    try {
      s.compressedTexSubImage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function ft() {
    try {
      s.compressedTexSubImage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function Xt() {
    try {
      s.texStorage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function et() {
    try {
      s.texStorage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function pt() {
    try {
      s.texImage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function Tt() {
    try {
      s.texImage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function At(L) {
    jt.equals(L) === false && (s.scissor(L.x, L.y, L.z, L.w), jt.copy(L));
  }
  function mt(L) {
    H.equals(L) === false && (s.viewport(L.x, L.y, L.z, L.w), H.copy(L));
  }
  function Wt(L, rt) {
    let X = c.get(rt);
    X === void 0 && (X = /* @__PURE__ */ new WeakMap(), c.set(rt, X));
    let $ = X.get(L);
    $ === void 0 && ($ = s.getUniformBlockIndex(rt, L.name), X.set(L, $));
  }
  function Ft(L, rt) {
    const $ = c.get(rt).get(L);
    l.get(rt) !== $ && (s.uniformBlockBinding(rt, $, L.__bindingPointIndex), l.set(rt, $));
  }
  function se() {
    s.disable(s.BLEND), s.disable(s.CULL_FACE), s.disable(s.DEPTH_TEST), s.disable(s.POLYGON_OFFSET_FILL), s.disable(s.SCISSOR_TEST), s.disable(s.STENCIL_TEST), s.disable(s.SAMPLE_ALPHA_TO_COVERAGE), s.blendEquation(s.FUNC_ADD), s.blendFunc(s.ONE, s.ZERO), s.blendFuncSeparate(s.ONE, s.ZERO, s.ONE, s.ZERO), s.blendColor(0, 0, 0, 0), s.colorMask(true, true, true, true), s.clearColor(0, 0, 0, 0), s.depthMask(true), s.depthFunc(s.LESS), o.setReversed(false), s.clearDepth(1), s.stencilMask(4294967295), s.stencilFunc(s.ALWAYS, 0, 4294967295), s.stencilOp(s.KEEP, s.KEEP, s.KEEP), s.clearStencil(0), s.cullFace(s.BACK), s.frontFace(s.CCW), s.polygonOffset(0, 0), s.activeTexture(s.TEXTURE0), s.bindFramebuffer(s.FRAMEBUFFER, null), s.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), s.bindFramebuffer(s.READ_FRAMEBUFFER, null), s.useProgram(null), s.lineWidth(1), s.scissor(0, 0, s.canvas.width, s.canvas.height), s.viewport(0, 0, s.canvas.width, s.canvas.height), h = {}, it = null, ht = {}, u = {}, d = /* @__PURE__ */ new WeakMap(), f = [], g = null, _ = false, m = null, p = null, T = null, w = null, S = null, U = null, C = null, R = new zt(0, 0, 0), F = 0, M = false, y = null, P = null, O = null, N = null, G = null, jt.set(0, 0, s.canvas.width, s.canvas.height), H.set(0, 0, s.canvas.width, s.canvas.height), r.reset(), o.reset(), a.reset();
  }
  return { buffers: { color: r, depth: o, stencil: a }, enable: st, disable: Et, bindFramebuffer: kt, drawBuffers: wt, useProgram: ae, setBlending: A, setMaterial: je, setFlipSided: Vt, setCullFace: Gt, setLineWidth: yt, setPolygonOffset: oe, setScissorTest: xt, activeTexture: E, bindTexture: v, unbindTexture: B, compressedTexImage2D: q, compressedTexImage3D: K, texImage2D: pt, texImage3D: Tt, updateUBOMapping: Wt, uniformBlockBinding: Ft, texStorage2D: Xt, texStorage3D: et, texSubImage2D: Y, texSubImage3D: vt, compressedTexSubImage2D: at, compressedTexSubImage3D: ft, scissor: At, viewport: mt, reset: se };
}
function e_(s, t, e, n, i, r, o) {
  const a = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? false : /OculusBrowser/g.test(navigator.userAgent), c = new Mt(), h = /* @__PURE__ */ new WeakMap();
  let u;
  const d = /* @__PURE__ */ new WeakMap();
  let f = false;
  try {
    f = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(E, v) {
    return f ? new OffscreenCanvas(E, v) : kr("canvas");
  }
  function _(E, v, B) {
    let q = 1;
    const K = xt(E);
    if ((K.width > B || K.height > B) && (q = B / Math.max(K.width, K.height)), q < 1) if (typeof HTMLImageElement < "u" && E instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && E instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && E instanceof ImageBitmap || typeof VideoFrame < "u" && E instanceof VideoFrame) {
      const Y = Math.floor(q * K.width), vt = Math.floor(q * K.height);
      u === void 0 && (u = g(Y, vt));
      const at = v ? g(Y, vt) : u;
      return at.width = Y, at.height = vt, at.getContext("2d").drawImage(E, 0, 0, Y, vt), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + K.width + "x" + K.height + ") to (" + Y + "x" + vt + ")."), at;
    } else return "data" in E && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + K.width + "x" + K.height + ")."), E;
    return E;
  }
  function m(E) {
    return E.generateMipmaps;
  }
  function p(E) {
    s.generateMipmap(E);
  }
  function T(E) {
    return E.isWebGLCubeRenderTarget ? s.TEXTURE_CUBE_MAP : E.isWebGL3DRenderTarget ? s.TEXTURE_3D : E.isWebGLArrayRenderTarget || E.isCompressedArrayTexture ? s.TEXTURE_2D_ARRAY : s.TEXTURE_2D;
  }
  function w(E, v, B, q, K = false) {
    if (E !== null) {
      if (s[E] !== void 0) return s[E];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + E + "'");
    }
    let Y = v;
    if (v === s.RED && (B === s.FLOAT && (Y = s.R32F), B === s.HALF_FLOAT && (Y = s.R16F), B === s.UNSIGNED_BYTE && (Y = s.R8)), v === s.RED_INTEGER && (B === s.UNSIGNED_BYTE && (Y = s.R8UI), B === s.UNSIGNED_SHORT && (Y = s.R16UI), B === s.UNSIGNED_INT && (Y = s.R32UI), B === s.BYTE && (Y = s.R8I), B === s.SHORT && (Y = s.R16I), B === s.INT && (Y = s.R32I)), v === s.RG && (B === s.FLOAT && (Y = s.RG32F), B === s.HALF_FLOAT && (Y = s.RG16F), B === s.UNSIGNED_BYTE && (Y = s.RG8)), v === s.RG_INTEGER && (B === s.UNSIGNED_BYTE && (Y = s.RG8UI), B === s.UNSIGNED_SHORT && (Y = s.RG16UI), B === s.UNSIGNED_INT && (Y = s.RG32UI), B === s.BYTE && (Y = s.RG8I), B === s.SHORT && (Y = s.RG16I), B === s.INT && (Y = s.RG32I)), v === s.RGB_INTEGER && (B === s.UNSIGNED_BYTE && (Y = s.RGB8UI), B === s.UNSIGNED_SHORT && (Y = s.RGB16UI), B === s.UNSIGNED_INT && (Y = s.RGB32UI), B === s.BYTE && (Y = s.RGB8I), B === s.SHORT && (Y = s.RGB16I), B === s.INT && (Y = s.RGB32I)), v === s.RGBA_INTEGER && (B === s.UNSIGNED_BYTE && (Y = s.RGBA8UI), B === s.UNSIGNED_SHORT && (Y = s.RGBA16UI), B === s.UNSIGNED_INT && (Y = s.RGBA32UI), B === s.BYTE && (Y = s.RGBA8I), B === s.SHORT && (Y = s.RGBA16I), B === s.INT && (Y = s.RGBA32I)), v === s.RGB && B === s.UNSIGNED_INT_5_9_9_9_REV && (Y = s.RGB9_E5), v === s.RGBA) {
      const vt = K ? Br : $t.getTransfer(q);
      B === s.FLOAT && (Y = s.RGBA32F), B === s.HALF_FLOAT && (Y = s.RGBA16F), B === s.UNSIGNED_BYTE && (Y = vt === ee ? s.SRGB8_ALPHA8 : s.RGBA8), B === s.UNSIGNED_SHORT_4_4_4_4 && (Y = s.RGBA4), B === s.UNSIGNED_SHORT_5_5_5_1 && (Y = s.RGB5_A1);
    }
    return (Y === s.R16F || Y === s.R32F || Y === s.RG16F || Y === s.RG32F || Y === s.RGBA16F || Y === s.RGBA32F) && t.get("EXT_color_buffer_float"), Y;
  }
  function S(E, v) {
    let B;
    return E ? v === null || v === Si || v === as ? B = s.DEPTH24_STENCIL8 : v === Pn ? B = s.DEPTH32F_STENCIL8 : v === Fs && (B = s.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : v === null || v === Si || v === as ? B = s.DEPTH_COMPONENT24 : v === Pn ? B = s.DEPTH_COMPONENT32F : v === Fs && (B = s.DEPTH_COMPONENT16), B;
  }
  function U(E, v) {
    return m(E) === true || E.isFramebufferTexture && E.minFilter !== un && E.minFilter !== xn ? Math.log2(Math.max(v.width, v.height)) + 1 : E.mipmaps !== void 0 && E.mipmaps.length > 0 ? E.mipmaps.length : E.isCompressedTexture && Array.isArray(E.image) ? v.mipmaps.length : 1;
  }
  function C(E) {
    const v = E.target;
    v.removeEventListener("dispose", C), F(v), v.isVideoTexture && h.delete(v);
  }
  function R(E) {
    const v = E.target;
    v.removeEventListener("dispose", R), y(v);
  }
  function F(E) {
    const v = n.get(E);
    if (v.__webglInit === void 0) return;
    const B = E.source, q = d.get(B);
    if (q) {
      const K = q[v.__cacheKey];
      K.usedTimes--, K.usedTimes === 0 && M(E), Object.keys(q).length === 0 && d.delete(B);
    }
    n.remove(E);
  }
  function M(E) {
    const v = n.get(E);
    s.deleteTexture(v.__webglTexture);
    const B = E.source, q = d.get(B);
    delete q[v.__cacheKey], o.memory.textures--;
  }
  function y(E) {
    const v = n.get(E);
    if (E.depthTexture && (E.depthTexture.dispose(), n.remove(E.depthTexture)), E.isWebGLCubeRenderTarget) for (let q = 0; q < 6; q++) {
      if (Array.isArray(v.__webglFramebuffer[q])) for (let K = 0; K < v.__webglFramebuffer[q].length; K++) s.deleteFramebuffer(v.__webglFramebuffer[q][K]);
      else s.deleteFramebuffer(v.__webglFramebuffer[q]);
      v.__webglDepthbuffer && s.deleteRenderbuffer(v.__webglDepthbuffer[q]);
    }
    else {
      if (Array.isArray(v.__webglFramebuffer)) for (let q = 0; q < v.__webglFramebuffer.length; q++) s.deleteFramebuffer(v.__webglFramebuffer[q]);
      else s.deleteFramebuffer(v.__webglFramebuffer);
      if (v.__webglDepthbuffer && s.deleteRenderbuffer(v.__webglDepthbuffer), v.__webglMultisampledFramebuffer && s.deleteFramebuffer(v.__webglMultisampledFramebuffer), v.__webglColorRenderbuffer) for (let q = 0; q < v.__webglColorRenderbuffer.length; q++) v.__webglColorRenderbuffer[q] && s.deleteRenderbuffer(v.__webglColorRenderbuffer[q]);
      v.__webglDepthRenderbuffer && s.deleteRenderbuffer(v.__webglDepthRenderbuffer);
    }
    const B = E.textures;
    for (let q = 0, K = B.length; q < K; q++) {
      const Y = n.get(B[q]);
      Y.__webglTexture && (s.deleteTexture(Y.__webglTexture), o.memory.textures--), n.remove(B[q]);
    }
    n.remove(E);
  }
  let P = 0;
  function O() {
    P = 0;
  }
  function N() {
    const E = P;
    return E >= i.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + E + " texture units while this GPU supports only " + i.maxTextures), P += 1, E;
  }
  function G(E) {
    const v = [];
    return v.push(E.wrapS), v.push(E.wrapT), v.push(E.wrapR || 0), v.push(E.magFilter), v.push(E.minFilter), v.push(E.anisotropy), v.push(E.internalFormat), v.push(E.format), v.push(E.type), v.push(E.generateMipmaps), v.push(E.premultiplyAlpha), v.push(E.flipY), v.push(E.unpackAlignment), v.push(E.colorSpace), v.join();
  }
  function j(E, v) {
    const B = n.get(E);
    if (E.isVideoTexture && yt(E), E.isRenderTargetTexture === false && E.version > 0 && B.__version !== E.version) {
      const q = E.image;
      if (q === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (q.complete === false) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        H(B, E, v);
        return;
      }
    }
    e.bindTexture(s.TEXTURE_2D, B.__webglTexture, s.TEXTURE0 + v);
  }
  function V(E, v) {
    const B = n.get(E);
    if (E.version > 0 && B.__version !== E.version) {
      H(B, E, v);
      return;
    }
    e.bindTexture(s.TEXTURE_2D_ARRAY, B.__webglTexture, s.TEXTURE0 + v);
  }
  function Z(E, v) {
    const B = n.get(E);
    if (E.version > 0 && B.__version !== E.version) {
      H(B, E, v);
      return;
    }
    e.bindTexture(s.TEXTURE_3D, B.__webglTexture, s.TEXTURE0 + v);
  }
  function W(E, v) {
    const B = n.get(E);
    if (E.version > 0 && B.__version !== E.version) {
      J(B, E, v);
      return;
    }
    e.bindTexture(s.TEXTURE_CUBE_MAP, B.__webglTexture, s.TEXTURE0 + v);
  }
  const it = { [ea]: s.REPEAT, [vi]: s.CLAMP_TO_EDGE, [na]: s.MIRRORED_REPEAT }, ht = { [un]: s.NEAREST, [du]: s.NEAREST_MIPMAP_NEAREST, [Vs]: s.NEAREST_MIPMAP_LINEAR, [xn]: s.LINEAR, [Kr]: s.LINEAR_MIPMAP_NEAREST, [xi]: s.LINEAR_MIPMAP_LINEAR }, _t = { [_u]: s.NEVER, [Eu]: s.ALWAYS, [vu]: s.LESS, [jc]: s.LEQUAL, [xu]: s.EQUAL, [Mu]: s.GEQUAL, [yu]: s.GREATER, [Su]: s.NOTEQUAL };
  function Ut(E, v) {
    if (v.type === Pn && t.has("OES_texture_float_linear") === false && (v.magFilter === xn || v.magFilter === Kr || v.magFilter === Vs || v.magFilter === xi || v.minFilter === xn || v.minFilter === Kr || v.minFilter === Vs || v.minFilter === xi) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), s.texParameteri(E, s.TEXTURE_WRAP_S, it[v.wrapS]), s.texParameteri(E, s.TEXTURE_WRAP_T, it[v.wrapT]), (E === s.TEXTURE_3D || E === s.TEXTURE_2D_ARRAY) && s.texParameteri(E, s.TEXTURE_WRAP_R, it[v.wrapR]), s.texParameteri(E, s.TEXTURE_MAG_FILTER, ht[v.magFilter]), s.texParameteri(E, s.TEXTURE_MIN_FILTER, ht[v.minFilter]), v.compareFunction && (s.texParameteri(E, s.TEXTURE_COMPARE_MODE, s.COMPARE_REF_TO_TEXTURE), s.texParameteri(E, s.TEXTURE_COMPARE_FUNC, _t[v.compareFunction])), t.has("EXT_texture_filter_anisotropic") === true) {
      if (v.magFilter === un || v.minFilter !== Vs && v.minFilter !== xi || v.type === Pn && t.has("OES_texture_float_linear") === false) return;
      if (v.anisotropy > 1 || n.get(v).__currentAnisotropy) {
        const B = t.get("EXT_texture_filter_anisotropic");
        s.texParameterf(E, B.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(v.anisotropy, i.getMaxAnisotropy())), n.get(v).__currentAnisotropy = v.anisotropy;
      }
    }
  }
  function jt(E, v) {
    let B = false;
    E.__webglInit === void 0 && (E.__webglInit = true, v.addEventListener("dispose", C));
    const q = v.source;
    let K = d.get(q);
    K === void 0 && (K = {}, d.set(q, K));
    const Y = G(v);
    if (Y !== E.__cacheKey) {
      K[Y] === void 0 && (K[Y] = { texture: s.createTexture(), usedTimes: 0 }, o.memory.textures++, B = true), K[Y].usedTimes++;
      const vt = K[E.__cacheKey];
      vt !== void 0 && (K[E.__cacheKey].usedTimes--, vt.usedTimes === 0 && M(v)), E.__cacheKey = Y, E.__webglTexture = K[Y].texture;
    }
    return B;
  }
  function H(E, v, B) {
    let q = s.TEXTURE_2D;
    (v.isDataArrayTexture || v.isCompressedArrayTexture) && (q = s.TEXTURE_2D_ARRAY), v.isData3DTexture && (q = s.TEXTURE_3D);
    const K = jt(E, v), Y = v.source;
    e.bindTexture(q, E.__webglTexture, s.TEXTURE0 + B);
    const vt = n.get(Y);
    if (Y.version !== vt.__version || K === true) {
      e.activeTexture(s.TEXTURE0 + B);
      const at = $t.getPrimaries($t.workingColorSpace), ft = v.colorSpace === $n ? null : $t.getPrimaries(v.colorSpace), Xt = v.colorSpace === $n || at === ft ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, v.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, v.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, Xt);
      let et = _(v.image, false, i.maxTextureSize);
      et = oe(v, et);
      const pt = r.convert(v.format, v.colorSpace), Tt = r.convert(v.type);
      let At = w(v.internalFormat, pt, Tt, v.colorSpace, v.isVideoTexture);
      Ut(q, v);
      let mt;
      const Wt = v.mipmaps, Ft = v.isVideoTexture !== true, se = vt.__version === void 0 || K === true, L = Y.dataReady, rt = U(v, et);
      if (v.isDepthTexture) At = S(v.format === ls, v.type), se && (Ft ? e.texStorage2D(s.TEXTURE_2D, 1, At, et.width, et.height) : e.texImage2D(s.TEXTURE_2D, 0, At, et.width, et.height, 0, pt, Tt, null));
      else if (v.isDataTexture) if (Wt.length > 0) {
        Ft && se && e.texStorage2D(s.TEXTURE_2D, rt, At, Wt[0].width, Wt[0].height);
        for (let X = 0, $ = Wt.length; X < $; X++) mt = Wt[X], Ft ? L && e.texSubImage2D(s.TEXTURE_2D, X, 0, 0, mt.width, mt.height, pt, Tt, mt.data) : e.texImage2D(s.TEXTURE_2D, X, At, mt.width, mt.height, 0, pt, Tt, mt.data);
        v.generateMipmaps = false;
      } else Ft ? (se && e.texStorage2D(s.TEXTURE_2D, rt, At, et.width, et.height), L && e.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, et.width, et.height, pt, Tt, et.data)) : e.texImage2D(s.TEXTURE_2D, 0, At, et.width, et.height, 0, pt, Tt, et.data);
      else if (v.isCompressedTexture) if (v.isCompressedArrayTexture) {
        Ft && se && e.texStorage3D(s.TEXTURE_2D_ARRAY, rt, At, Wt[0].width, Wt[0].height, et.depth);
        for (let X = 0, $ = Wt.length; X < $; X++) if (mt = Wt[X], v.format !== cn) if (pt !== null) if (Ft) {
          if (L) if (v.layerUpdates.size > 0) {
            const ct = Gl(mt.width, mt.height, v.format, v.type);
            for (const lt of v.layerUpdates) {
              const Lt = mt.data.subarray(lt * ct / mt.data.BYTES_PER_ELEMENT, (lt + 1) * ct / mt.data.BYTES_PER_ELEMENT);
              e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, X, 0, 0, lt, mt.width, mt.height, 1, pt, Lt);
            }
            v.clearLayerUpdates();
          } else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, X, 0, 0, 0, mt.width, mt.height, et.depth, pt, mt.data);
        } else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY, X, At, mt.width, mt.height, et.depth, 0, mt.data, 0, 0);
        else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
        else Ft ? L && e.texSubImage3D(s.TEXTURE_2D_ARRAY, X, 0, 0, 0, mt.width, mt.height, et.depth, pt, Tt, mt.data) : e.texImage3D(s.TEXTURE_2D_ARRAY, X, At, mt.width, mt.height, et.depth, 0, pt, Tt, mt.data);
      } else {
        Ft && se && e.texStorage2D(s.TEXTURE_2D, rt, At, Wt[0].width, Wt[0].height);
        for (let X = 0, $ = Wt.length; X < $; X++) mt = Wt[X], v.format !== cn ? pt !== null ? Ft ? L && e.compressedTexSubImage2D(s.TEXTURE_2D, X, 0, 0, mt.width, mt.height, pt, mt.data) : e.compressedTexImage2D(s.TEXTURE_2D, X, At, mt.width, mt.height, 0, mt.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : Ft ? L && e.texSubImage2D(s.TEXTURE_2D, X, 0, 0, mt.width, mt.height, pt, Tt, mt.data) : e.texImage2D(s.TEXTURE_2D, X, At, mt.width, mt.height, 0, pt, Tt, mt.data);
      }
      else if (v.isDataArrayTexture) if (Ft) {
        if (se && e.texStorage3D(s.TEXTURE_2D_ARRAY, rt, At, et.width, et.height, et.depth), L) if (v.layerUpdates.size > 0) {
          const X = Gl(et.width, et.height, v.format, v.type);
          for (const $ of v.layerUpdates) {
            const ct = et.data.subarray($ * X / et.data.BYTES_PER_ELEMENT, ($ + 1) * X / et.data.BYTES_PER_ELEMENT);
            e.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, $, et.width, et.height, 1, pt, Tt, ct);
          }
          v.clearLayerUpdates();
        } else e.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, 0, et.width, et.height, et.depth, pt, Tt, et.data);
      } else e.texImage3D(s.TEXTURE_2D_ARRAY, 0, At, et.width, et.height, et.depth, 0, pt, Tt, et.data);
      else if (v.isData3DTexture) Ft ? (se && e.texStorage3D(s.TEXTURE_3D, rt, At, et.width, et.height, et.depth), L && e.texSubImage3D(s.TEXTURE_3D, 0, 0, 0, 0, et.width, et.height, et.depth, pt, Tt, et.data)) : e.texImage3D(s.TEXTURE_3D, 0, At, et.width, et.height, et.depth, 0, pt, Tt, et.data);
      else if (v.isFramebufferTexture) {
        if (se) if (Ft) e.texStorage2D(s.TEXTURE_2D, rt, At, et.width, et.height);
        else {
          let X = et.width, $ = et.height;
          for (let ct = 0; ct < rt; ct++) e.texImage2D(s.TEXTURE_2D, ct, At, X, $, 0, pt, Tt, null), X >>= 1, $ >>= 1;
        }
      } else if (Wt.length > 0) {
        if (Ft && se) {
          const X = xt(Wt[0]);
          e.texStorage2D(s.TEXTURE_2D, rt, At, X.width, X.height);
        }
        for (let X = 0, $ = Wt.length; X < $; X++) mt = Wt[X], Ft ? L && e.texSubImage2D(s.TEXTURE_2D, X, 0, 0, pt, Tt, mt) : e.texImage2D(s.TEXTURE_2D, X, At, pt, Tt, mt);
        v.generateMipmaps = false;
      } else if (Ft) {
        if (se) {
          const X = xt(et);
          e.texStorage2D(s.TEXTURE_2D, rt, At, X.width, X.height);
        }
        L && e.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, pt, Tt, et);
      } else e.texImage2D(s.TEXTURE_2D, 0, At, pt, Tt, et);
      m(v) && p(q), vt.__version = Y.version, v.onUpdate && v.onUpdate(v);
    }
    E.__version = v.version;
  }
  function J(E, v, B) {
    if (v.image.length !== 6) return;
    const q = jt(E, v), K = v.source;
    e.bindTexture(s.TEXTURE_CUBE_MAP, E.__webglTexture, s.TEXTURE0 + B);
    const Y = n.get(K);
    if (K.version !== Y.__version || q === true) {
      e.activeTexture(s.TEXTURE0 + B);
      const vt = $t.getPrimaries($t.workingColorSpace), at = v.colorSpace === $n ? null : $t.getPrimaries(v.colorSpace), ft = v.colorSpace === $n || vt === at ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, v.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, v.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, ft);
      const Xt = v.isCompressedTexture || v.image[0].isCompressedTexture, et = v.image[0] && v.image[0].isDataTexture, pt = [];
      for (let $ = 0; $ < 6; $++) !Xt && !et ? pt[$] = _(v.image[$], true, i.maxCubemapSize) : pt[$] = et ? v.image[$].image : v.image[$], pt[$] = oe(v, pt[$]);
      const Tt = pt[0], At = r.convert(v.format, v.colorSpace), mt = r.convert(v.type), Wt = w(v.internalFormat, At, mt, v.colorSpace), Ft = v.isVideoTexture !== true, se = Y.__version === void 0 || q === true, L = K.dataReady;
      let rt = U(v, Tt);
      Ut(s.TEXTURE_CUBE_MAP, v);
      let X;
      if (Xt) {
        Ft && se && e.texStorage2D(s.TEXTURE_CUBE_MAP, rt, Wt, Tt.width, Tt.height);
        for (let $ = 0; $ < 6; $++) {
          X = pt[$].mipmaps;
          for (let ct = 0; ct < X.length; ct++) {
            const lt = X[ct];
            v.format !== cn ? At !== null ? Ft ? L && e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct, 0, 0, lt.width, lt.height, At, lt.data) : e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct, Wt, lt.width, lt.height, 0, lt.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : Ft ? L && e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct, 0, 0, lt.width, lt.height, At, mt, lt.data) : e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct, Wt, lt.width, lt.height, 0, At, mt, lt.data);
          }
        }
      } else {
        if (X = v.mipmaps, Ft && se) {
          X.length > 0 && rt++;
          const $ = xt(pt[0]);
          e.texStorage2D(s.TEXTURE_CUBE_MAP, rt, Wt, $.width, $.height);
        }
        for (let $ = 0; $ < 6; $++) if (et) {
          Ft ? L && e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, 0, 0, pt[$].width, pt[$].height, At, mt, pt[$].data) : e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, Wt, pt[$].width, pt[$].height, 0, At, mt, pt[$].data);
          for (let ct = 0; ct < X.length; ct++) {
            const Lt = X[ct].image[$].image;
            Ft ? L && e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct + 1, 0, 0, Lt.width, Lt.height, At, mt, Lt.data) : e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct + 1, Wt, Lt.width, Lt.height, 0, At, mt, Lt.data);
          }
        } else {
          Ft ? L && e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, 0, 0, At, mt, pt[$]) : e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, Wt, At, mt, pt[$]);
          for (let ct = 0; ct < X.length; ct++) {
            const lt = X[ct];
            Ft ? L && e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct + 1, 0, 0, At, mt, lt.image[$]) : e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct + 1, Wt, At, mt, lt.image[$]);
          }
        }
      }
      m(v) && p(s.TEXTURE_CUBE_MAP), Y.__version = K.version, v.onUpdate && v.onUpdate(v);
    }
    E.__version = v.version;
  }
  function dt(E, v, B, q, K, Y) {
    const vt = r.convert(B.format, B.colorSpace), at = r.convert(B.type), ft = w(B.internalFormat, vt, at, B.colorSpace), Xt = n.get(v), et = n.get(B);
    if (et.__renderTarget = v, !Xt.__hasExternalTextures) {
      const pt = Math.max(1, v.width >> Y), Tt = Math.max(1, v.height >> Y);
      K === s.TEXTURE_3D || K === s.TEXTURE_2D_ARRAY ? e.texImage3D(K, Y, ft, pt, Tt, v.depth, 0, vt, at, null) : e.texImage2D(K, Y, ft, pt, Tt, 0, vt, at, null);
    }
    e.bindFramebuffer(s.FRAMEBUFFER, E), Gt(v) ? a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, q, K, et.__webglTexture, 0, Vt(v)) : (K === s.TEXTURE_2D || K >= s.TEXTURE_CUBE_MAP_POSITIVE_X && K <= s.TEXTURE_CUBE_MAP_NEGATIVE_Z) && s.framebufferTexture2D(s.FRAMEBUFFER, q, K, et.__webglTexture, Y), e.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function st(E, v, B) {
    if (s.bindRenderbuffer(s.RENDERBUFFER, E), v.depthBuffer) {
      const q = v.depthTexture, K = q && q.isDepthTexture ? q.type : null, Y = S(v.stencilBuffer, K), vt = v.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, at = Vt(v);
      Gt(v) ? a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, at, Y, v.width, v.height) : B ? s.renderbufferStorageMultisample(s.RENDERBUFFER, at, Y, v.width, v.height) : s.renderbufferStorage(s.RENDERBUFFER, Y, v.width, v.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, vt, s.RENDERBUFFER, E);
    } else {
      const q = v.textures;
      for (let K = 0; K < q.length; K++) {
        const Y = q[K], vt = r.convert(Y.format, Y.colorSpace), at = r.convert(Y.type), ft = w(Y.internalFormat, vt, at, Y.colorSpace), Xt = Vt(v);
        B && Gt(v) === false ? s.renderbufferStorageMultisample(s.RENDERBUFFER, Xt, ft, v.width, v.height) : Gt(v) ? a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, Xt, ft, v.width, v.height) : s.renderbufferStorage(s.RENDERBUFFER, ft, v.width, v.height);
      }
    }
    s.bindRenderbuffer(s.RENDERBUFFER, null);
  }
  function Et(E, v) {
    if (v && v.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (e.bindFramebuffer(s.FRAMEBUFFER, E), !(v.depthTexture && v.depthTexture.isDepthTexture)) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    const q = n.get(v.depthTexture);
    q.__renderTarget = v, (!q.__webglTexture || v.depthTexture.image.width !== v.width || v.depthTexture.image.height !== v.height) && (v.depthTexture.image.width = v.width, v.depthTexture.image.height = v.height, v.depthTexture.needsUpdate = true), j(v.depthTexture, 0);
    const K = q.__webglTexture, Y = Vt(v);
    if (v.depthTexture.format === ns) Gt(v) ? a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, K, 0, Y) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, K, 0);
    else if (v.depthTexture.format === ls) Gt(v) ? a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, K, 0, Y) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, K, 0);
    else throw new Error("Unknown depthTexture format");
  }
  function kt(E) {
    const v = n.get(E), B = E.isWebGLCubeRenderTarget === true;
    if (v.__boundDepthTexture !== E.depthTexture) {
      const q = E.depthTexture;
      if (v.__depthDisposeCallback && v.__depthDisposeCallback(), q) {
        const K = () => {
          delete v.__boundDepthTexture, delete v.__depthDisposeCallback, q.removeEventListener("dispose", K);
        };
        q.addEventListener("dispose", K), v.__depthDisposeCallback = K;
      }
      v.__boundDepthTexture = q;
    }
    if (E.depthTexture && !v.__autoAllocateDepthBuffer) {
      if (B) throw new Error("target.depthTexture not supported in Cube render targets");
      Et(v.__webglFramebuffer, E);
    } else if (B) {
      v.__webglDepthbuffer = [];
      for (let q = 0; q < 6; q++) if (e.bindFramebuffer(s.FRAMEBUFFER, v.__webglFramebuffer[q]), v.__webglDepthbuffer[q] === void 0) v.__webglDepthbuffer[q] = s.createRenderbuffer(), st(v.__webglDepthbuffer[q], E, false);
      else {
        const K = E.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, Y = v.__webglDepthbuffer[q];
        s.bindRenderbuffer(s.RENDERBUFFER, Y), s.framebufferRenderbuffer(s.FRAMEBUFFER, K, s.RENDERBUFFER, Y);
      }
    } else if (e.bindFramebuffer(s.FRAMEBUFFER, v.__webglFramebuffer), v.__webglDepthbuffer === void 0) v.__webglDepthbuffer = s.createRenderbuffer(), st(v.__webglDepthbuffer, E, false);
    else {
      const q = E.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, K = v.__webglDepthbuffer;
      s.bindRenderbuffer(s.RENDERBUFFER, K), s.framebufferRenderbuffer(s.FRAMEBUFFER, q, s.RENDERBUFFER, K);
    }
    e.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function wt(E, v, B) {
    const q = n.get(E);
    v !== void 0 && dt(q.__webglFramebuffer, E, E.texture, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, 0), B !== void 0 && kt(E);
  }
  function ae(E) {
    const v = E.texture, B = n.get(E), q = n.get(v);
    E.addEventListener("dispose", R);
    const K = E.textures, Y = E.isWebGLCubeRenderTarget === true, vt = K.length > 1;
    if (vt || (q.__webglTexture === void 0 && (q.__webglTexture = s.createTexture()), q.__version = v.version, o.memory.textures++), Y) {
      B.__webglFramebuffer = [];
      for (let at = 0; at < 6; at++) if (v.mipmaps && v.mipmaps.length > 0) {
        B.__webglFramebuffer[at] = [];
        for (let ft = 0; ft < v.mipmaps.length; ft++) B.__webglFramebuffer[at][ft] = s.createFramebuffer();
      } else B.__webglFramebuffer[at] = s.createFramebuffer();
    } else {
      if (v.mipmaps && v.mipmaps.length > 0) {
        B.__webglFramebuffer = [];
        for (let at = 0; at < v.mipmaps.length; at++) B.__webglFramebuffer[at] = s.createFramebuffer();
      } else B.__webglFramebuffer = s.createFramebuffer();
      if (vt) for (let at = 0, ft = K.length; at < ft; at++) {
        const Xt = n.get(K[at]);
        Xt.__webglTexture === void 0 && (Xt.__webglTexture = s.createTexture(), o.memory.textures++);
      }
      if (E.samples > 0 && Gt(E) === false) {
        B.__webglMultisampledFramebuffer = s.createFramebuffer(), B.__webglColorRenderbuffer = [], e.bindFramebuffer(s.FRAMEBUFFER, B.__webglMultisampledFramebuffer);
        for (let at = 0; at < K.length; at++) {
          const ft = K[at];
          B.__webglColorRenderbuffer[at] = s.createRenderbuffer(), s.bindRenderbuffer(s.RENDERBUFFER, B.__webglColorRenderbuffer[at]);
          const Xt = r.convert(ft.format, ft.colorSpace), et = r.convert(ft.type), pt = w(ft.internalFormat, Xt, et, ft.colorSpace, E.isXRRenderTarget === true), Tt = Vt(E);
          s.renderbufferStorageMultisample(s.RENDERBUFFER, Tt, pt, E.width, E.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + at, s.RENDERBUFFER, B.__webglColorRenderbuffer[at]);
        }
        s.bindRenderbuffer(s.RENDERBUFFER, null), E.depthBuffer && (B.__webglDepthRenderbuffer = s.createRenderbuffer(), st(B.__webglDepthRenderbuffer, E, true)), e.bindFramebuffer(s.FRAMEBUFFER, null);
      }
    }
    if (Y) {
      e.bindTexture(s.TEXTURE_CUBE_MAP, q.__webglTexture), Ut(s.TEXTURE_CUBE_MAP, v);
      for (let at = 0; at < 6; at++) if (v.mipmaps && v.mipmaps.length > 0) for (let ft = 0; ft < v.mipmaps.length; ft++) dt(B.__webglFramebuffer[at][ft], E, v, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + at, ft);
      else dt(B.__webglFramebuffer[at], E, v, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + at, 0);
      m(v) && p(s.TEXTURE_CUBE_MAP), e.unbindTexture();
    } else if (vt) {
      for (let at = 0, ft = K.length; at < ft; at++) {
        const Xt = K[at], et = n.get(Xt);
        e.bindTexture(s.TEXTURE_2D, et.__webglTexture), Ut(s.TEXTURE_2D, Xt), dt(B.__webglFramebuffer, E, Xt, s.COLOR_ATTACHMENT0 + at, s.TEXTURE_2D, 0), m(Xt) && p(s.TEXTURE_2D);
      }
      e.unbindTexture();
    } else {
      let at = s.TEXTURE_2D;
      if ((E.isWebGL3DRenderTarget || E.isWebGLArrayRenderTarget) && (at = E.isWebGL3DRenderTarget ? s.TEXTURE_3D : s.TEXTURE_2D_ARRAY), e.bindTexture(at, q.__webglTexture), Ut(at, v), v.mipmaps && v.mipmaps.length > 0) for (let ft = 0; ft < v.mipmaps.length; ft++) dt(B.__webglFramebuffer[ft], E, v, s.COLOR_ATTACHMENT0, at, ft);
      else dt(B.__webglFramebuffer, E, v, s.COLOR_ATTACHMENT0, at, 0);
      m(v) && p(at), e.unbindTexture();
    }
    E.depthBuffer && kt(E);
  }
  function ie(E) {
    const v = E.textures;
    for (let B = 0, q = v.length; B < q; B++) {
      const K = v[B];
      if (m(K)) {
        const Y = T(E), vt = n.get(K).__webglTexture;
        e.bindTexture(Y, vt), p(Y), e.unbindTexture();
      }
    }
  }
  const Bt = [], A = [];
  function je(E) {
    if (E.samples > 0) {
      if (Gt(E) === false) {
        const v = E.textures, B = E.width, q = E.height;
        let K = s.COLOR_BUFFER_BIT;
        const Y = E.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, vt = n.get(E), at = v.length > 1;
        if (at) for (let ft = 0; ft < v.length; ft++) e.bindFramebuffer(s.FRAMEBUFFER, vt.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ft, s.RENDERBUFFER, null), e.bindFramebuffer(s.FRAMEBUFFER, vt.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ft, s.TEXTURE_2D, null, 0);
        e.bindFramebuffer(s.READ_FRAMEBUFFER, vt.__webglMultisampledFramebuffer), e.bindFramebuffer(s.DRAW_FRAMEBUFFER, vt.__webglFramebuffer);
        for (let ft = 0; ft < v.length; ft++) {
          if (E.resolveDepthBuffer && (E.depthBuffer && (K |= s.DEPTH_BUFFER_BIT), E.stencilBuffer && E.resolveStencilBuffer && (K |= s.STENCIL_BUFFER_BIT)), at) {
            s.framebufferRenderbuffer(s.READ_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.RENDERBUFFER, vt.__webglColorRenderbuffer[ft]);
            const Xt = n.get(v[ft]).__webglTexture;
            s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, Xt, 0);
          }
          s.blitFramebuffer(0, 0, B, q, 0, 0, B, q, K, s.NEAREST), l === true && (Bt.length = 0, A.length = 0, Bt.push(s.COLOR_ATTACHMENT0 + ft), E.depthBuffer && E.resolveDepthBuffer === false && (Bt.push(Y), A.push(Y), s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, A)), s.invalidateFramebuffer(s.READ_FRAMEBUFFER, Bt));
        }
        if (e.bindFramebuffer(s.READ_FRAMEBUFFER, null), e.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), at) for (let ft = 0; ft < v.length; ft++) {
          e.bindFramebuffer(s.FRAMEBUFFER, vt.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ft, s.RENDERBUFFER, vt.__webglColorRenderbuffer[ft]);
          const Xt = n.get(v[ft]).__webglTexture;
          e.bindFramebuffer(s.FRAMEBUFFER, vt.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ft, s.TEXTURE_2D, Xt, 0);
        }
        e.bindFramebuffer(s.DRAW_FRAMEBUFFER, vt.__webglMultisampledFramebuffer);
      } else if (E.depthBuffer && E.resolveDepthBuffer === false && l) {
        const v = E.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
        s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, [v]);
      }
    }
  }
  function Vt(E) {
    return Math.min(i.maxSamples, E.samples);
  }
  function Gt(E) {
    const v = n.get(E);
    return E.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === true && v.__useRenderToTexture !== false;
  }
  function yt(E) {
    const v = o.render.frame;
    h.get(E) !== v && (h.set(E, v), E.update());
  }
  function oe(E, v) {
    const B = E.colorSpace, q = E.format, K = E.type;
    return E.isCompressedTexture === true || E.isVideoTexture === true || B !== cs && B !== $n && ($t.getTransfer(B) === ee ? (q !== cn || K !== On) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", B)), v;
  }
  function xt(E) {
    return typeof HTMLImageElement < "u" && E instanceof HTMLImageElement ? (c.width = E.naturalWidth || E.width, c.height = E.naturalHeight || E.height) : typeof VideoFrame < "u" && E instanceof VideoFrame ? (c.width = E.displayWidth, c.height = E.displayHeight) : (c.width = E.width, c.height = E.height), c;
  }
  this.allocateTextureUnit = N, this.resetTextureUnits = O, this.setTexture2D = j, this.setTexture2DArray = V, this.setTexture3D = Z, this.setTextureCube = W, this.rebindTextures = wt, this.setupRenderTarget = ae, this.updateRenderTargetMipmap = ie, this.updateMultisampleRenderTarget = je, this.setupDepthRenderbuffer = kt, this.setupFrameBufferTexture = dt, this.useMultisampledRTT = Gt;
}
function n_(s, t) {
  function e(n, i = $n) {
    let r;
    const o = $t.getTransfer(i);
    if (n === On) return s.UNSIGNED_BYTE;
    if (n === Oa) return s.UNSIGNED_SHORT_4_4_4_4;
    if (n === Ba) return s.UNSIGNED_SHORT_5_5_5_1;
    if (n === Hc) return s.UNSIGNED_INT_5_9_9_9_REV;
    if (n === zc) return s.BYTE;
    if (n === kc) return s.SHORT;
    if (n === Fs) return s.UNSIGNED_SHORT;
    if (n === Na) return s.INT;
    if (n === Si) return s.UNSIGNED_INT;
    if (n === Pn) return s.FLOAT;
    if (n === Os) return s.HALF_FLOAT;
    if (n === Vc) return s.ALPHA;
    if (n === Gc) return s.RGB;
    if (n === cn) return s.RGBA;
    if (n === Wc) return s.LUMINANCE;
    if (n === Xc) return s.LUMINANCE_ALPHA;
    if (n === ns) return s.DEPTH_COMPONENT;
    if (n === ls) return s.DEPTH_STENCIL;
    if (n === Yc) return s.RED;
    if (n === za) return s.RED_INTEGER;
    if (n === qc) return s.RG;
    if (n === ka) return s.RG_INTEGER;
    if (n === Ha) return s.RGBA_INTEGER;
    if (n === Lr || n === Dr || n === Ir || n === Ur) if (o === ee) if (r = t.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
      if (n === Lr) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
      if (n === Dr) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
      if (n === Ir) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
      if (n === Ur) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
    } else return null;
    else if (r = t.get("WEBGL_compressed_texture_s3tc"), r !== null) {
      if (n === Lr) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
      if (n === Dr) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
      if (n === Ir) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
      if (n === Ur) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    } else return null;
    if (n === ia || n === sa || n === ra || n === oa) if (r = t.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
      if (n === ia) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
      if (n === sa) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
      if (n === ra) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
      if (n === oa) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
    } else return null;
    if (n === aa || n === la || n === ca) if (r = t.get("WEBGL_compressed_texture_etc"), r !== null) {
      if (n === aa || n === la) return o === ee ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
      if (n === ca) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
    } else return null;
    if (n === ha || n === ua || n === da || n === fa || n === pa || n === ma || n === ga || n === _a || n === va || n === xa || n === ya || n === Sa || n === Ma || n === Ea) if (r = t.get("WEBGL_compressed_texture_astc"), r !== null) {
      if (n === ha) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
      if (n === ua) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
      if (n === da) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
      if (n === fa) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
      if (n === pa) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
      if (n === ma) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
      if (n === ga) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
      if (n === _a) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
      if (n === va) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
      if (n === xa) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
      if (n === ya) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
      if (n === Sa) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
      if (n === Ma) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
      if (n === Ea) return o === ee ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
    } else return null;
    if (n === Fr || n === ba || n === wa) if (r = t.get("EXT_texture_compression_bptc"), r !== null) {
      if (n === Fr) return o === ee ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
      if (n === ba) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
      if (n === wa) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
    } else return null;
    if (n === $c || n === Ta || n === Aa || n === Ca) if (r = t.get("EXT_texture_compression_rgtc"), r !== null) {
      if (n === Fr) return r.COMPRESSED_RED_RGTC1_EXT;
      if (n === Ta) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
      if (n === Aa) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
      if (n === Ca) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
    } else return null;
    return n === as ? s.UNSIGNED_INT_24_8 : s[n] !== void 0 ? s[n] : null;
  }
  return { convert: e };
}
const i_ = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, s_ = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class r_ {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(t, e, n) {
    if (this.texture === null) {
      const i = new Ie(), r = t.properties.get(i);
      r.__webglTexture = e.texture, (e.depthNear !== n.depthNear || e.depthFar !== n.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = i;
    }
  }
  getMesh(t) {
    if (this.texture !== null && this.mesh === null) {
      const e = t.cameras[0].viewport, n = new dn({ vertexShader: i_, fragmentShader: s_, uniforms: { depthColor: { value: this.texture }, depthWidth: { value: e.z }, depthHeight: { value: e.w } } });
      this.mesh = new He(new Ti(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
  getDepthTexture() {
    return this.texture;
  }
}
class o_ extends bi {
  constructor(t, e) {
    super();
    const n = this;
    let i = null, r = 1, o = null, a = "local-floor", l = 1, c = null, h = null, u = null, d = null, f = null, g = null;
    const _ = new r_(), m = e.getContextAttributes();
    let p = null, T = null;
    const w = [], S = [], U = new Mt();
    let C = null;
    const R = new $e();
    R.viewport = new re();
    const F = new $e();
    F.viewport = new re();
    const M = [R, F], y = new Md();
    let P = null, O = null;
    this.cameraAutoUpdate = true, this.enabled = false, this.isPresenting = false, this.getController = function(H) {
      let J = w[H];
      return J === void 0 && (J = new vo(), w[H] = J), J.getTargetRaySpace();
    }, this.getControllerGrip = function(H) {
      let J = w[H];
      return J === void 0 && (J = new vo(), w[H] = J), J.getGripSpace();
    }, this.getHand = function(H) {
      let J = w[H];
      return J === void 0 && (J = new vo(), w[H] = J), J.getHandSpace();
    };
    function N(H) {
      const J = S.indexOf(H.inputSource);
      if (J === -1) return;
      const dt = w[J];
      dt !== void 0 && (dt.update(H.inputSource, H.frame, c || o), dt.dispatchEvent({ type: H.type, data: H.inputSource }));
    }
    function G() {
      i.removeEventListener("select", N), i.removeEventListener("selectstart", N), i.removeEventListener("selectend", N), i.removeEventListener("squeeze", N), i.removeEventListener("squeezestart", N), i.removeEventListener("squeezeend", N), i.removeEventListener("end", G), i.removeEventListener("inputsourceschange", j);
      for (let H = 0; H < w.length; H++) {
        const J = S[H];
        J !== null && (S[H] = null, w[H].disconnect(J));
      }
      P = null, O = null, _.reset(), t.setRenderTarget(p), f = null, d = null, u = null, i = null, T = null, jt.stop(), n.isPresenting = false, t.setPixelRatio(C), t.setSize(U.width, U.height, false), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(H) {
      r = H, n.isPresenting === true && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(H) {
      a = H, n.isPresenting === true && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return c || o;
    }, this.setReferenceSpace = function(H) {
      c = H;
    }, this.getBaseLayer = function() {
      return d !== null ? d : f;
    }, this.getBinding = function() {
      return u;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return i;
    }, this.setSession = async function(H) {
      if (i = H, i !== null) {
        if (p = t.getRenderTarget(), i.addEventListener("select", N), i.addEventListener("selectstart", N), i.addEventListener("selectend", N), i.addEventListener("squeeze", N), i.addEventListener("squeezestart", N), i.addEventListener("squeezeend", N), i.addEventListener("end", G), i.addEventListener("inputsourceschange", j), m.xrCompatible !== true && await e.makeXRCompatible(), C = t.getPixelRatio(), t.getSize(U), typeof XRWebGLBinding < "u" && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let dt = null, st = null, Et = null;
          m.depth && (Et = m.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, dt = m.stencil ? ls : ns, st = m.stencil ? as : Si);
          const kt = { colorFormat: e.RGBA8, depthFormat: Et, scaleFactor: r };
          u = new XRWebGLBinding(i, e), d = u.createProjectionLayer(kt), i.updateRenderState({ layers: [d] }), t.setPixelRatio(1), t.setSize(d.textureWidth, d.textureHeight, false), T = new Mi(d.textureWidth, d.textureHeight, { format: cn, type: On, depthTexture: new lh(d.textureWidth, d.textureHeight, st, void 0, void 0, void 0, void 0, void 0, void 0, dt), stencilBuffer: m.stencil, colorSpace: t.outputColorSpace, samples: m.antialias ? 4 : 0, resolveDepthBuffer: d.ignoreDepthValues === false, resolveStencilBuffer: d.ignoreDepthValues === false });
        } else {
          const dt = { antialias: m.antialias, alpha: true, depth: m.depth, stencil: m.stencil, framebufferScaleFactor: r };
          f = new XRWebGLLayer(i, e, dt), i.updateRenderState({ baseLayer: f }), t.setPixelRatio(1), t.setSize(f.framebufferWidth, f.framebufferHeight, false), T = new Mi(f.framebufferWidth, f.framebufferHeight, { format: cn, type: On, colorSpace: t.outputColorSpace, stencilBuffer: m.stencil, resolveDepthBuffer: f.ignoreDepthValues === false, resolveStencilBuffer: f.ignoreDepthValues === false });
        }
        T.isXRRenderTarget = true, this.setFoveation(l), c = null, o = await i.requestReferenceSpace(a), jt.setContext(i), jt.start(), n.isPresenting = true, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (i !== null) return i.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return _.getDepthTexture();
    };
    function j(H) {
      for (let J = 0; J < H.removed.length; J++) {
        const dt = H.removed[J], st = S.indexOf(dt);
        st >= 0 && (S[st] = null, w[st].disconnect(dt));
      }
      for (let J = 0; J < H.added.length; J++) {
        const dt = H.added[J];
        let st = S.indexOf(dt);
        if (st === -1) {
          for (let kt = 0; kt < w.length; kt++) if (kt >= S.length) {
            S.push(dt), st = kt;
            break;
          } else if (S[kt] === null) {
            S[kt] = dt, st = kt;
            break;
          }
          if (st === -1) break;
        }
        const Et = w[st];
        Et && Et.connect(dt);
      }
    }
    const V = new b(), Z = new b();
    function W(H, J, dt) {
      V.setFromMatrixPosition(J.matrixWorld), Z.setFromMatrixPosition(dt.matrixWorld);
      const st = V.distanceTo(Z), Et = J.projectionMatrix.elements, kt = dt.projectionMatrix.elements, wt = Et[14] / (Et[10] - 1), ae = Et[14] / (Et[10] + 1), ie = (Et[9] + 1) / Et[5], Bt = (Et[9] - 1) / Et[5], A = (Et[8] - 1) / Et[0], je = (kt[8] + 1) / kt[0], Vt = wt * A, Gt = wt * je, yt = st / (-A + je), oe = yt * -A;
      if (J.matrixWorld.decompose(H.position, H.quaternion, H.scale), H.translateX(oe), H.translateZ(yt), H.matrixWorld.compose(H.position, H.quaternion, H.scale), H.matrixWorldInverse.copy(H.matrixWorld).invert(), Et[10] === -1) H.projectionMatrix.copy(J.projectionMatrix), H.projectionMatrixInverse.copy(J.projectionMatrixInverse);
      else {
        const xt = wt + yt, E = ae + yt, v = Vt - oe, B = Gt + (st - oe), q = ie * ae / E * xt, K = Bt * ae / E * xt;
        H.projectionMatrix.makePerspective(v, B, q, K, xt, E), H.projectionMatrixInverse.copy(H.projectionMatrix).invert();
      }
    }
    function it(H, J) {
      J === null ? H.matrixWorld.copy(H.matrix) : H.matrixWorld.multiplyMatrices(J.matrixWorld, H.matrix), H.matrixWorldInverse.copy(H.matrixWorld).invert();
    }
    this.updateCamera = function(H) {
      if (i === null) return;
      let J = H.near, dt = H.far;
      _.texture !== null && (_.depthNear > 0 && (J = _.depthNear), _.depthFar > 0 && (dt = _.depthFar)), y.near = F.near = R.near = J, y.far = F.far = R.far = dt, (P !== y.near || O !== y.far) && (i.updateRenderState({ depthNear: y.near, depthFar: y.far }), P = y.near, O = y.far), R.layers.mask = H.layers.mask | 2, F.layers.mask = H.layers.mask | 4, y.layers.mask = R.layers.mask | F.layers.mask;
      const st = H.parent, Et = y.cameras;
      it(y, st);
      for (let kt = 0; kt < Et.length; kt++) it(Et[kt], st);
      Et.length === 2 ? W(y, R, F) : y.projectionMatrix.copy(R.projectionMatrix), ht(H, y, st);
    };
    function ht(H, J, dt) {
      dt === null ? H.matrix.copy(J.matrixWorld) : (H.matrix.copy(dt.matrixWorld), H.matrix.invert(), H.matrix.multiply(J.matrixWorld)), H.matrix.decompose(H.position, H.quaternion, H.scale), H.updateMatrixWorld(true), H.projectionMatrix.copy(J.projectionMatrix), H.projectionMatrixInverse.copy(J.projectionMatrixInverse), H.isPerspectiveCamera && (H.fov = Ns * 2 * Math.atan(1 / H.projectionMatrix.elements[5]), H.zoom = 1);
    }
    this.getCamera = function() {
      return y;
    }, this.getFoveation = function() {
      if (!(d === null && f === null)) return l;
    }, this.setFoveation = function(H) {
      l = H, d !== null && (d.fixedFoveation = H), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = H);
    }, this.hasDepthSensing = function() {
      return _.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return _.getMesh(y);
    };
    let _t = null;
    function Ut(H, J) {
      if (h = J.getViewerPose(c || o), g = J, h !== null) {
        const dt = h.views;
        f !== null && (t.setRenderTargetFramebuffer(T, f.framebuffer), t.setRenderTarget(T));
        let st = false;
        dt.length !== y.cameras.length && (y.cameras.length = 0, st = true);
        for (let wt = 0; wt < dt.length; wt++) {
          const ae = dt[wt];
          let ie = null;
          if (f !== null) ie = f.getViewport(ae);
          else {
            const A = u.getViewSubImage(d, ae);
            ie = A.viewport, wt === 0 && (t.setRenderTargetTextures(T, A.colorTexture, d.ignoreDepthValues ? void 0 : A.depthStencilTexture), t.setRenderTarget(T));
          }
          let Bt = M[wt];
          Bt === void 0 && (Bt = new $e(), Bt.layers.enable(wt), Bt.viewport = new re(), M[wt] = Bt), Bt.matrix.fromArray(ae.transform.matrix), Bt.matrix.decompose(Bt.position, Bt.quaternion, Bt.scale), Bt.projectionMatrix.fromArray(ae.projectionMatrix), Bt.projectionMatrixInverse.copy(Bt.projectionMatrix).invert(), Bt.viewport.set(ie.x, ie.y, ie.width, ie.height), wt === 0 && (y.matrix.copy(Bt.matrix), y.matrix.decompose(y.position, y.quaternion, y.scale)), st === true && y.cameras.push(Bt);
        }
        const Et = i.enabledFeatures;
        if (Et && Et.includes("depth-sensing") && i.depthUsage == "gpu-optimized" && u) {
          const wt = u.getDepthInformation(dt[0]);
          wt && wt.isValid && wt.texture && _.init(t, wt, i.renderState);
        }
      }
      for (let dt = 0; dt < w.length; dt++) {
        const st = S[dt], Et = w[dt];
        st !== null && Et !== void 0 && Et.update(st, J, c || o);
      }
      _t && _t(H, J), J.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: J }), g = null;
    }
    const jt = new ch();
    jt.setAnimationLoop(Ut), this.setAnimationLoop = function(H) {
      _t = H;
    }, this.dispose = function() {
    };
  }
}
const ci = new zn(), a_ = new Jt();
function l_(s, t) {
  function e(m, p) {
    m.matrixAutoUpdate === true && m.updateMatrix(), p.value.copy(m.matrix);
  }
  function n(m, p) {
    p.color.getRGB(m.fogColor.value, eh(s)), p.isFog ? (m.fogNear.value = p.near, m.fogFar.value = p.far) : p.isFogExp2 && (m.fogDensity.value = p.density);
  }
  function i(m, p, T, w, S) {
    p.isMeshBasicMaterial || p.isMeshLambertMaterial ? r(m, p) : p.isMeshToonMaterial ? (r(m, p), u(m, p)) : p.isMeshPhongMaterial ? (r(m, p), h(m, p)) : p.isMeshStandardMaterial ? (r(m, p), d(m, p), p.isMeshPhysicalMaterial && f(m, p, S)) : p.isMeshMatcapMaterial ? (r(m, p), g(m, p)) : p.isMeshDepthMaterial ? r(m, p) : p.isMeshDistanceMaterial ? (r(m, p), _(m, p)) : p.isMeshNormalMaterial ? r(m, p) : p.isLineBasicMaterial ? (o(m, p), p.isLineDashedMaterial && a(m, p)) : p.isPointsMaterial ? l(m, p, T, w) : p.isSpriteMaterial ? c(m, p) : p.isShadowMaterial ? (m.color.value.copy(p.color), m.opacity.value = p.opacity) : p.isShaderMaterial && (p.uniformsNeedUpdate = false);
  }
  function r(m, p) {
    m.opacity.value = p.opacity, p.color && m.diffuse.value.copy(p.color), p.emissive && m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity), p.map && (m.map.value = p.map, e(p.map, m.mapTransform)), p.alphaMap && (m.alphaMap.value = p.alphaMap, e(p.alphaMap, m.alphaMapTransform)), p.bumpMap && (m.bumpMap.value = p.bumpMap, e(p.bumpMap, m.bumpMapTransform), m.bumpScale.value = p.bumpScale, p.side === Ve && (m.bumpScale.value *= -1)), p.normalMap && (m.normalMap.value = p.normalMap, e(p.normalMap, m.normalMapTransform), m.normalScale.value.copy(p.normalScale), p.side === Ve && m.normalScale.value.negate()), p.displacementMap && (m.displacementMap.value = p.displacementMap, e(p.displacementMap, m.displacementMapTransform), m.displacementScale.value = p.displacementScale, m.displacementBias.value = p.displacementBias), p.emissiveMap && (m.emissiveMap.value = p.emissiveMap, e(p.emissiveMap, m.emissiveMapTransform)), p.specularMap && (m.specularMap.value = p.specularMap, e(p.specularMap, m.specularMapTransform)), p.alphaTest > 0 && (m.alphaTest.value = p.alphaTest);
    const T = t.get(p), w = T.envMap, S = T.envMapRotation;
    w && (m.envMap.value = w, ci.copy(S), ci.x *= -1, ci.y *= -1, ci.z *= -1, w.isCubeTexture && w.isRenderTargetTexture === false && (ci.y *= -1, ci.z *= -1), m.envMapRotation.value.setFromMatrix4(a_.makeRotationFromEuler(ci)), m.flipEnvMap.value = w.isCubeTexture && w.isRenderTargetTexture === false ? -1 : 1, m.reflectivity.value = p.reflectivity, m.ior.value = p.ior, m.refractionRatio.value = p.refractionRatio), p.lightMap && (m.lightMap.value = p.lightMap, m.lightMapIntensity.value = p.lightMapIntensity, e(p.lightMap, m.lightMapTransform)), p.aoMap && (m.aoMap.value = p.aoMap, m.aoMapIntensity.value = p.aoMapIntensity, e(p.aoMap, m.aoMapTransform));
  }
  function o(m, p) {
    m.diffuse.value.copy(p.color), m.opacity.value = p.opacity, p.map && (m.map.value = p.map, e(p.map, m.mapTransform));
  }
  function a(m, p) {
    m.dashSize.value = p.dashSize, m.totalSize.value = p.dashSize + p.gapSize, m.scale.value = p.scale;
  }
  function l(m, p, T, w) {
    m.diffuse.value.copy(p.color), m.opacity.value = p.opacity, m.size.value = p.size * T, m.scale.value = w * 0.5, p.map && (m.map.value = p.map, e(p.map, m.uvTransform)), p.alphaMap && (m.alphaMap.value = p.alphaMap, e(p.alphaMap, m.alphaMapTransform)), p.alphaTest > 0 && (m.alphaTest.value = p.alphaTest);
  }
  function c(m, p) {
    m.diffuse.value.copy(p.color), m.opacity.value = p.opacity, m.rotation.value = p.rotation, p.map && (m.map.value = p.map, e(p.map, m.mapTransform)), p.alphaMap && (m.alphaMap.value = p.alphaMap, e(p.alphaMap, m.alphaMapTransform)), p.alphaTest > 0 && (m.alphaTest.value = p.alphaTest);
  }
  function h(m, p) {
    m.specular.value.copy(p.specular), m.shininess.value = Math.max(p.shininess, 1e-4);
  }
  function u(m, p) {
    p.gradientMap && (m.gradientMap.value = p.gradientMap);
  }
  function d(m, p) {
    m.metalness.value = p.metalness, p.metalnessMap && (m.metalnessMap.value = p.metalnessMap, e(p.metalnessMap, m.metalnessMapTransform)), m.roughness.value = p.roughness, p.roughnessMap && (m.roughnessMap.value = p.roughnessMap, e(p.roughnessMap, m.roughnessMapTransform)), p.envMap && (m.envMapIntensity.value = p.envMapIntensity);
  }
  function f(m, p, T) {
    m.ior.value = p.ior, p.sheen > 0 && (m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen), m.sheenRoughness.value = p.sheenRoughness, p.sheenColorMap && (m.sheenColorMap.value = p.sheenColorMap, e(p.sheenColorMap, m.sheenColorMapTransform)), p.sheenRoughnessMap && (m.sheenRoughnessMap.value = p.sheenRoughnessMap, e(p.sheenRoughnessMap, m.sheenRoughnessMapTransform))), p.clearcoat > 0 && (m.clearcoat.value = p.clearcoat, m.clearcoatRoughness.value = p.clearcoatRoughness, p.clearcoatMap && (m.clearcoatMap.value = p.clearcoatMap, e(p.clearcoatMap, m.clearcoatMapTransform)), p.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = p.clearcoatRoughnessMap, e(p.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), p.clearcoatNormalMap && (m.clearcoatNormalMap.value = p.clearcoatNormalMap, e(p.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale), p.side === Ve && m.clearcoatNormalScale.value.negate())), p.dispersion > 0 && (m.dispersion.value = p.dispersion), p.iridescence > 0 && (m.iridescence.value = p.iridescence, m.iridescenceIOR.value = p.iridescenceIOR, m.iridescenceThicknessMinimum.value = p.iridescenceThicknessRange[0], m.iridescenceThicknessMaximum.value = p.iridescenceThicknessRange[1], p.iridescenceMap && (m.iridescenceMap.value = p.iridescenceMap, e(p.iridescenceMap, m.iridescenceMapTransform)), p.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = p.iridescenceThicknessMap, e(p.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), p.transmission > 0 && (m.transmission.value = p.transmission, m.transmissionSamplerMap.value = T.texture, m.transmissionSamplerSize.value.set(T.width, T.height), p.transmissionMap && (m.transmissionMap.value = p.transmissionMap, e(p.transmissionMap, m.transmissionMapTransform)), m.thickness.value = p.thickness, p.thicknessMap && (m.thicknessMap.value = p.thicknessMap, e(p.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = p.attenuationDistance, m.attenuationColor.value.copy(p.attenuationColor)), p.anisotropy > 0 && (m.anisotropyVector.value.set(p.anisotropy * Math.cos(p.anisotropyRotation), p.anisotropy * Math.sin(p.anisotropyRotation)), p.anisotropyMap && (m.anisotropyMap.value = p.anisotropyMap, e(p.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = p.specularIntensity, m.specularColor.value.copy(p.specularColor), p.specularColorMap && (m.specularColorMap.value = p.specularColorMap, e(p.specularColorMap, m.specularColorMapTransform)), p.specularIntensityMap && (m.specularIntensityMap.value = p.specularIntensityMap, e(p.specularIntensityMap, m.specularIntensityMapTransform));
  }
  function g(m, p) {
    p.matcap && (m.matcap.value = p.matcap);
  }
  function _(m, p) {
    const T = t.get(p).light;
    m.referencePosition.value.setFromMatrixPosition(T.matrixWorld), m.nearDistance.value = T.shadow.camera.near, m.farDistance.value = T.shadow.camera.far;
  }
  return { refreshFogUniforms: n, refreshMaterialUniforms: i };
}
function c_(s, t, e, n) {
  let i = {}, r = {}, o = [];
  const a = s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(T, w) {
    const S = w.program;
    n.uniformBlockBinding(T, S);
  }
  function c(T, w) {
    let S = i[T.id];
    S === void 0 && (g(T), S = h(T), i[T.id] = S, T.addEventListener("dispose", m));
    const U = w.program;
    n.updateUBOMapping(T, U);
    const C = t.render.frame;
    r[T.id] !== C && (d(T), r[T.id] = C);
  }
  function h(T) {
    const w = u();
    T.__bindingPointIndex = w;
    const S = s.createBuffer(), U = T.__size, C = T.usage;
    return s.bindBuffer(s.UNIFORM_BUFFER, S), s.bufferData(s.UNIFORM_BUFFER, U, C), s.bindBuffer(s.UNIFORM_BUFFER, null), s.bindBufferBase(s.UNIFORM_BUFFER, w, S), S;
  }
  function u() {
    for (let T = 0; T < a; T++) if (o.indexOf(T) === -1) return o.push(T), T;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function d(T) {
    const w = i[T.id], S = T.uniforms, U = T.__cache;
    s.bindBuffer(s.UNIFORM_BUFFER, w);
    for (let C = 0, R = S.length; C < R; C++) {
      const F = Array.isArray(S[C]) ? S[C] : [S[C]];
      for (let M = 0, y = F.length; M < y; M++) {
        const P = F[M];
        if (f(P, C, M, U) === true) {
          const O = P.__offset, N = Array.isArray(P.value) ? P.value : [P.value];
          let G = 0;
          for (let j = 0; j < N.length; j++) {
            const V = N[j], Z = _(V);
            typeof V == "number" || typeof V == "boolean" ? (P.__data[0] = V, s.bufferSubData(s.UNIFORM_BUFFER, O + G, P.__data)) : V.isMatrix3 ? (P.__data[0] = V.elements[0], P.__data[1] = V.elements[1], P.__data[2] = V.elements[2], P.__data[3] = 0, P.__data[4] = V.elements[3], P.__data[5] = V.elements[4], P.__data[6] = V.elements[5], P.__data[7] = 0, P.__data[8] = V.elements[6], P.__data[9] = V.elements[7], P.__data[10] = V.elements[8], P.__data[11] = 0) : (V.toArray(P.__data, G), G += Z.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          s.bufferSubData(s.UNIFORM_BUFFER, O, P.__data);
        }
      }
    }
    s.bindBuffer(s.UNIFORM_BUFFER, null);
  }
  function f(T, w, S, U) {
    const C = T.value, R = w + "_" + S;
    if (U[R] === void 0) return typeof C == "number" || typeof C == "boolean" ? U[R] = C : U[R] = C.clone(), true;
    {
      const F = U[R];
      if (typeof C == "number" || typeof C == "boolean") {
        if (F !== C) return U[R] = C, true;
      } else if (F.equals(C) === false) return F.copy(C), true;
    }
    return false;
  }
  function g(T) {
    const w = T.uniforms;
    let S = 0;
    const U = 16;
    for (let R = 0, F = w.length; R < F; R++) {
      const M = Array.isArray(w[R]) ? w[R] : [w[R]];
      for (let y = 0, P = M.length; y < P; y++) {
        const O = M[y], N = Array.isArray(O.value) ? O.value : [O.value];
        for (let G = 0, j = N.length; G < j; G++) {
          const V = N[G], Z = _(V), W = S % U, it = W % Z.boundary, ht = W + it;
          S += it, ht !== 0 && U - ht < Z.storage && (S += U - ht), O.__data = new Float32Array(Z.storage / Float32Array.BYTES_PER_ELEMENT), O.__offset = S, S += Z.storage;
        }
      }
    }
    const C = S % U;
    return C > 0 && (S += U - C), T.__size = S, T.__cache = {}, this;
  }
  function _(T) {
    const w = { boundary: 0, storage: 0 };
    return typeof T == "number" || typeof T == "boolean" ? (w.boundary = 4, w.storage = 4) : T.isVector2 ? (w.boundary = 8, w.storage = 8) : T.isVector3 || T.isColor ? (w.boundary = 16, w.storage = 12) : T.isVector4 ? (w.boundary = 16, w.storage = 16) : T.isMatrix3 ? (w.boundary = 48, w.storage = 48) : T.isMatrix4 ? (w.boundary = 64, w.storage = 64) : T.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", T), w;
  }
  function m(T) {
    const w = T.target;
    w.removeEventListener("dispose", m);
    const S = o.indexOf(w.__bindingPointIndex);
    o.splice(S, 1), s.deleteBuffer(i[w.id]), delete i[w.id], delete r[w.id];
  }
  function p() {
    for (const T in i) s.deleteBuffer(i[T]);
    o = [], i = {}, r = {};
  }
  return { bind: l, update: c, dispose: p };
}
class h_ {
  constructor(t = {}) {
    const { canvas: e = ku(), context: n = null, depth: i = true, stencil: r = false, alpha: o = false, antialias: a = false, premultipliedAlpha: l = true, preserveDrawingBuffer: c = false, powerPreference: h = "default", failIfMajorPerformanceCaveat: u = false, reverseDepthBuffer: d = false } = t;
    this.isWebGLRenderer = true;
    let f;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      f = n.getContextAttributes().alpha;
    } else f = o;
    const g = new Uint32Array(4), _ = new Int32Array(4);
    let m = null, p = null;
    const T = [], w = [];
    this.domElement = e, this.debug = { checkShaderErrors: true, onShaderError: null }, this.autoClear = true, this.autoClearColor = true, this.autoClearDepth = true, this.autoClearStencil = true, this.sortObjects = true, this.clippingPlanes = [], this.localClippingEnabled = false, this._outputColorSpace = De, this.toneMapping = Jn, this.toneMappingExposure = 1;
    const S = this;
    let U = false, C = 0, R = 0, F = null, M = -1, y = null;
    const P = new re(), O = new re();
    let N = null;
    const G = new zt(0);
    let j = 0, V = e.width, Z = e.height, W = 1, it = null, ht = null;
    const _t = new re(0, 0, V, Z), Ut = new re(0, 0, V, Z);
    let jt = false;
    const H = new Ya();
    let J = false, dt = false;
    this.transmissionResolutionScale = 1;
    const st = new Jt(), Et = new Jt(), kt = new b(), wt = new re(), ae = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: true };
    let ie = false;
    function Bt() {
      return F === null ? W : 1;
    }
    let A = n;
    function je(x, D) {
      return e.getContext(x, D);
    }
    try {
      const x = { alpha: true, depth: i, stencil: r, antialias: a, premultipliedAlpha: l, preserveDrawingBuffer: c, powerPreference: h, failIfMajorPerformanceCaveat: u };
      if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${Fa}`), e.addEventListener("webglcontextlost", $, false), e.addEventListener("webglcontextrestored", ct, false), e.addEventListener("webglcontextcreationerror", lt, false), A === null) {
        const D = "webgl2";
        if (A = je(D, x), A === null) throw je(D) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (x) {
      throw console.error("THREE.WebGLRenderer: " + x.message), x;
    }
    let Vt, Gt, yt, oe, xt, E, v, B, q, K, Y, vt, at, ft, Xt, et, pt, Tt, At, mt, Wt, Ft, se, L;
    function rt() {
      Vt = new ym(A), Vt.init(), Ft = new n_(A, Vt), Gt = new fm(A, Vt, t, Ft), yt = new t_(A, Vt), Gt.reverseDepthBuffer && d && yt.buffers.depth.setReversed(true), oe = new Em(A), xt = new Hg(), E = new e_(A, Vt, yt, xt, Gt, Ft, oe), v = new mm(S), B = new xm(S), q = new Cd(A), se = new um(A, q), K = new Sm(A, q, oe, se), Y = new wm(A, K, q, oe), At = new bm(A, Gt, E), et = new pm(xt), vt = new kg(S, v, B, Vt, Gt, se, et), at = new l_(S, xt), ft = new Gg(), Xt = new jg(Vt), Tt = new hm(S, v, B, yt, Y, f, l), pt = new Jg(S, Y, Gt), L = new c_(A, oe, Gt, yt), mt = new dm(A, Vt, oe), Wt = new Mm(A, Vt, oe), oe.programs = vt.programs, S.capabilities = Gt, S.extensions = Vt, S.properties = xt, S.renderLists = ft, S.shadowMap = pt, S.state = yt, S.info = oe;
    }
    rt();
    const X = new o_(S, A);
    this.xr = X, this.getContext = function() {
      return A;
    }, this.getContextAttributes = function() {
      return A.getContextAttributes();
    }, this.forceContextLoss = function() {
      const x = Vt.get("WEBGL_lose_context");
      x && x.loseContext();
    }, this.forceContextRestore = function() {
      const x = Vt.get("WEBGL_lose_context");
      x && x.restoreContext();
    }, this.getPixelRatio = function() {
      return W;
    }, this.setPixelRatio = function(x) {
      x !== void 0 && (W = x, this.setSize(V, Z, false));
    }, this.getSize = function(x) {
      return x.set(V, Z);
    }, this.setSize = function(x, D, z = true) {
      if (X.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      V = x, Z = D, e.width = Math.floor(x * W), e.height = Math.floor(D * W), z === true && (e.style.width = x + "px", e.style.height = D + "px"), this.setViewport(0, 0, x, D);
    }, this.getDrawingBufferSize = function(x) {
      return x.set(V * W, Z * W).floor();
    }, this.setDrawingBufferSize = function(x, D, z) {
      V = x, Z = D, W = z, e.width = Math.floor(x * z), e.height = Math.floor(D * z), this.setViewport(0, 0, x, D);
    }, this.getCurrentViewport = function(x) {
      return x.copy(P);
    }, this.getViewport = function(x) {
      return x.copy(_t);
    }, this.setViewport = function(x, D, z, k) {
      x.isVector4 ? _t.set(x.x, x.y, x.z, x.w) : _t.set(x, D, z, k), yt.viewport(P.copy(_t).multiplyScalar(W).round());
    }, this.getScissor = function(x) {
      return x.copy(Ut);
    }, this.setScissor = function(x, D, z, k) {
      x.isVector4 ? Ut.set(x.x, x.y, x.z, x.w) : Ut.set(x, D, z, k), yt.scissor(O.copy(Ut).multiplyScalar(W).round());
    }, this.getScissorTest = function() {
      return jt;
    }, this.setScissorTest = function(x) {
      yt.setScissorTest(jt = x);
    }, this.setOpaqueSort = function(x) {
      it = x;
    }, this.setTransparentSort = function(x) {
      ht = x;
    }, this.getClearColor = function(x) {
      return x.copy(Tt.getClearColor());
    }, this.setClearColor = function() {
      Tt.setClearColor(...arguments);
    }, this.getClearAlpha = function() {
      return Tt.getClearAlpha();
    }, this.setClearAlpha = function() {
      Tt.setClearAlpha(...arguments);
    }, this.clear = function(x = true, D = true, z = true) {
      let k = 0;
      if (x) {
        let I = false;
        if (F !== null) {
          const tt = F.texture.format;
          I = tt === Ha || tt === ka || tt === za;
        }
        if (I) {
          const tt = F.texture.type, ot = tt === On || tt === Si || tt === Fs || tt === as || tt === Oa || tt === Ba, ut = Tt.getClearColor(), gt = Tt.getClearAlpha(), Ct = ut.r, Rt = ut.g, St = ut.b;
          ot ? (g[0] = Ct, g[1] = Rt, g[2] = St, g[3] = gt, A.clearBufferuiv(A.COLOR, 0, g)) : (_[0] = Ct, _[1] = Rt, _[2] = St, _[3] = gt, A.clearBufferiv(A.COLOR, 0, _));
        } else k |= A.COLOR_BUFFER_BIT;
      }
      D && (k |= A.DEPTH_BUFFER_BIT), z && (k |= A.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), A.clear(k);
    }, this.clearColor = function() {
      this.clear(true, false, false);
    }, this.clearDepth = function() {
      this.clear(false, true, false);
    }, this.clearStencil = function() {
      this.clear(false, false, true);
    }, this.dispose = function() {
      e.removeEventListener("webglcontextlost", $, false), e.removeEventListener("webglcontextrestored", ct, false), e.removeEventListener("webglcontextcreationerror", lt, false), Tt.dispose(), ft.dispose(), Xt.dispose(), xt.dispose(), v.dispose(), B.dispose(), Y.dispose(), se.dispose(), L.dispose(), vt.dispose(), X.dispose(), X.removeEventListener("sessionstart", Qa), X.removeEventListener("sessionend", tl), ni.stop();
    };
    function $(x) {
      x.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), U = true;
    }
    function ct() {
      console.log("THREE.WebGLRenderer: Context Restored."), U = false;
      const x = oe.autoReset, D = pt.enabled, z = pt.autoUpdate, k = pt.needsUpdate, I = pt.type;
      rt(), oe.autoReset = x, pt.enabled = D, pt.autoUpdate = z, pt.needsUpdate = k, pt.type = I;
    }
    function lt(x) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", x.statusMessage);
    }
    function Lt(x) {
      const D = x.target;
      D.removeEventListener("dispose", Lt), he(D);
    }
    function he(x) {
      we(x), xt.remove(x);
    }
    function we(x) {
      const D = xt.get(x).programs;
      D !== void 0 && (D.forEach(function(z) {
        vt.releaseProgram(z);
      }), x.isShaderMaterial && vt.releaseShaderCache(x));
    }
    this.renderBufferDirect = function(x, D, z, k, I, tt) {
      D === null && (D = ae);
      const ot = I.isMesh && I.matrixWorld.determinant() < 0, ut = Ph(x, D, z, k, I);
      yt.setMaterial(k, ot);
      let gt = z.index, Ct = 1;
      if (k.wireframe === true) {
        if (gt = K.getWireframeAttribute(z), gt === void 0) return;
        Ct = 2;
      }
      const Rt = z.drawRange, St = z.attributes.position;
      let Yt = Rt.start * Ct, Zt = (Rt.start + Rt.count) * Ct;
      tt !== null && (Yt = Math.max(Yt, tt.start * Ct), Zt = Math.min(Zt, (tt.start + tt.count) * Ct)), gt !== null ? (Yt = Math.max(Yt, 0), Zt = Math.min(Zt, gt.count)) : St != null && (Yt = Math.max(Yt, 0), Zt = Math.min(Zt, St.count));
      const de = Zt - Yt;
      if (de < 0 || de === 1 / 0) return;
      se.setup(I, k, ut, z, gt);
      let ue, qt = mt;
      if (gt !== null && (ue = q.get(gt), qt = Wt, qt.setIndex(ue)), I.isMesh) k.wireframe === true ? (yt.setLineWidth(k.wireframeLinewidth * Bt()), qt.setMode(A.LINES)) : qt.setMode(A.TRIANGLES);
      else if (I.isLine) {
        let bt = k.linewidth;
        bt === void 0 && (bt = 1), yt.setLineWidth(bt * Bt()), I.isLineSegments ? qt.setMode(A.LINES) : I.isLineLoop ? qt.setMode(A.LINE_LOOP) : qt.setMode(A.LINE_STRIP);
      } else I.isPoints ? qt.setMode(A.POINTS) : I.isSprite && qt.setMode(A.TRIANGLES);
      if (I.isBatchedMesh) if (I._multiDrawInstances !== null) fi("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), qt.renderMultiDrawInstances(I._multiDrawStarts, I._multiDrawCounts, I._multiDrawCount, I._multiDrawInstances);
      else if (Vt.get("WEBGL_multi_draw")) qt.renderMultiDraw(I._multiDrawStarts, I._multiDrawCounts, I._multiDrawCount);
      else {
        const bt = I._multiDrawStarts, Se = I._multiDrawCounts, Kt = I._multiDrawCount, nn = gt ? q.get(gt).bytesPerElement : 1, Ci = xt.get(k).currentProgram.getUniforms();
        for (let We = 0; We < Kt; We++) Ci.setValue(A, "_gl_DrawID", We), qt.render(bt[We] / nn, Se[We]);
      }
      else if (I.isInstancedMesh) qt.renderInstances(Yt, de, I.count);
      else if (z.isInstancedBufferGeometry) {
        const bt = z._maxInstanceCount !== void 0 ? z._maxInstanceCount : 1 / 0, Se = Math.min(z.instanceCount, bt);
        qt.renderInstances(Yt, de, Se);
      } else qt.render(Yt, de);
    };
    function Qt(x, D, z) {
      x.transparent === true && x.side === ze && x.forceSinglePass === false ? (x.side = Ve, x.needsUpdate = true, Hs(x, D, z), x.side = Qn, x.needsUpdate = true, Hs(x, D, z), x.side = ze) : Hs(x, D, z);
    }
    this.compile = function(x, D, z = null) {
      z === null && (z = x), p = Xt.get(z), p.init(D), w.push(p), z.traverseVisible(function(I) {
        I.isLight && I.layers.test(D.layers) && (p.pushLight(I), I.castShadow && p.pushShadow(I));
      }), x !== z && x.traverseVisible(function(I) {
        I.isLight && I.layers.test(D.layers) && (p.pushLight(I), I.castShadow && p.pushShadow(I));
      }), p.setupLights();
      const k = /* @__PURE__ */ new Set();
      return x.traverse(function(I) {
        if (!(I.isMesh || I.isPoints || I.isLine || I.isSprite)) return;
        const tt = I.material;
        if (tt) if (Array.isArray(tt)) for (let ot = 0; ot < tt.length; ot++) {
          const ut = tt[ot];
          Qt(ut, z, I), k.add(ut);
        }
        else Qt(tt, z, I), k.add(tt);
      }), p = w.pop(), k;
    }, this.compileAsync = function(x, D, z = null) {
      const k = this.compile(x, D, z);
      return new Promise((I) => {
        function tt() {
          if (k.forEach(function(ot) {
            xt.get(ot).currentProgram.isReady() && k.delete(ot);
          }), k.size === 0) {
            I(x);
            return;
          }
          setTimeout(tt, 10);
        }
        Vt.get("KHR_parallel_shader_compile") !== null ? tt() : setTimeout(tt, 10);
      });
    };
    let en = null;
    function Mn(x) {
      en && en(x);
    }
    function Qa() {
      ni.stop();
    }
    function tl() {
      ni.start();
    }
    const ni = new ch();
    ni.setAnimationLoop(Mn), typeof self < "u" && ni.setContext(self), this.setAnimationLoop = function(x) {
      en = x, X.setAnimationLoop(x), x === null ? ni.stop() : ni.start();
    }, X.addEventListener("sessionstart", Qa), X.addEventListener("sessionend", tl), this.render = function(x, D) {
      if (D !== void 0 && D.isCamera !== true) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (U === true) return;
      if (x.matrixWorldAutoUpdate === true && x.updateMatrixWorld(), D.parent === null && D.matrixWorldAutoUpdate === true && D.updateMatrixWorld(), X.enabled === true && X.isPresenting === true && (X.cameraAutoUpdate === true && X.updateCamera(D), D = X.getCamera()), x.isScene === true && x.onBeforeRender(S, x, D, F), p = Xt.get(x, w.length), p.init(D), w.push(p), Et.multiplyMatrices(D.projectionMatrix, D.matrixWorldInverse), H.setFromProjectionMatrix(Et), dt = this.localClippingEnabled, J = et.init(this.clippingPlanes, dt), m = ft.get(x, T.length), m.init(), T.push(m), X.enabled === true && X.isPresenting === true) {
        const tt = S.xr.getDepthSensingMesh();
        tt !== null && jr(tt, D, -1 / 0, S.sortObjects);
      }
      jr(x, D, 0, S.sortObjects), m.finish(), S.sortObjects === true && m.sort(it, ht), ie = X.enabled === false || X.isPresenting === false || X.hasDepthSensing() === false, ie && Tt.addToRenderList(m, x), this.info.render.frame++, J === true && et.beginShadows();
      const z = p.state.shadowsArray;
      pt.render(z, x, D), J === true && et.endShadows(), this.info.autoReset === true && this.info.reset();
      const k = m.opaque, I = m.transmissive;
      if (p.setupLights(), D.isArrayCamera) {
        const tt = D.cameras;
        if (I.length > 0) for (let ot = 0, ut = tt.length; ot < ut; ot++) {
          const gt = tt[ot];
          nl(k, I, x, gt);
        }
        ie && Tt.render(x);
        for (let ot = 0, ut = tt.length; ot < ut; ot++) {
          const gt = tt[ot];
          el(m, x, gt, gt.viewport);
        }
      } else I.length > 0 && nl(k, I, x, D), ie && Tt.render(x), el(m, x, D);
      F !== null && R === 0 && (E.updateMultisampleRenderTarget(F), E.updateRenderTargetMipmap(F)), x.isScene === true && x.onAfterRender(S, x, D), se.resetDefaultState(), M = -1, y = null, w.pop(), w.length > 0 ? (p = w[w.length - 1], J === true && et.setGlobalState(S.clippingPlanes, p.state.camera)) : p = null, T.pop(), T.length > 0 ? m = T[T.length - 1] : m = null;
    };
    function jr(x, D, z, k) {
      if (x.visible === false) return;
      if (x.layers.test(D.layers)) {
        if (x.isGroup) z = x.renderOrder;
        else if (x.isLOD) x.autoUpdate === true && x.update(D);
        else if (x.isLight) p.pushLight(x), x.castShadow && p.pushShadow(x);
        else if (x.isSprite) {
          if (!x.frustumCulled || H.intersectsSprite(x)) {
            k && wt.setFromMatrixPosition(x.matrixWorld).applyMatrix4(Et);
            const ot = Y.update(x), ut = x.material;
            ut.visible && m.push(x, ot, ut, z, wt.z, null);
          }
        } else if ((x.isMesh || x.isLine || x.isPoints) && (!x.frustumCulled || H.intersectsObject(x))) {
          const ot = Y.update(x), ut = x.material;
          if (k && (x.boundingSphere !== void 0 ? (x.boundingSphere === null && x.computeBoundingSphere(), wt.copy(x.boundingSphere.center)) : (ot.boundingSphere === null && ot.computeBoundingSphere(), wt.copy(ot.boundingSphere.center)), wt.applyMatrix4(x.matrixWorld).applyMatrix4(Et)), Array.isArray(ut)) {
            const gt = ot.groups;
            for (let Ct = 0, Rt = gt.length; Ct < Rt; Ct++) {
              const St = gt[Ct], Yt = ut[St.materialIndex];
              Yt && Yt.visible && m.push(x, ot, Yt, z, wt.z, St);
            }
          } else ut.visible && m.push(x, ot, ut, z, wt.z, null);
        }
      }
      const tt = x.children;
      for (let ot = 0, ut = tt.length; ot < ut; ot++) jr(tt[ot], D, z, k);
    }
    function el(x, D, z, k) {
      const I = x.opaque, tt = x.transmissive, ot = x.transparent;
      p.setupLightsView(z), J === true && et.setGlobalState(S.clippingPlanes, z), k && yt.viewport(P.copy(k)), I.length > 0 && ks(I, D, z), tt.length > 0 && ks(tt, D, z), ot.length > 0 && ks(ot, D, z), yt.buffers.depth.setTest(true), yt.buffers.depth.setMask(true), yt.buffers.color.setMask(true), yt.setPolygonOffset(false);
    }
    function nl(x, D, z, k) {
      if ((z.isScene === true ? z.overrideMaterial : null) !== null) return;
      p.state.transmissionRenderTarget[k.id] === void 0 && (p.state.transmissionRenderTarget[k.id] = new Mi(1, 1, { generateMipmaps: true, type: Vt.has("EXT_color_buffer_half_float") || Vt.has("EXT_color_buffer_float") ? Os : On, minFilter: xi, samples: 4, stencilBuffer: r, resolveDepthBuffer: false, resolveStencilBuffer: false, colorSpace: $t.workingColorSpace }));
      const tt = p.state.transmissionRenderTarget[k.id], ot = k.viewport || P;
      tt.setSize(ot.z * S.transmissionResolutionScale, ot.w * S.transmissionResolutionScale);
      const ut = S.getRenderTarget();
      S.setRenderTarget(tt), S.getClearColor(G), j = S.getClearAlpha(), j < 1 && S.setClearColor(16777215, 0.5), S.clear(), ie && Tt.render(z);
      const gt = S.toneMapping;
      S.toneMapping = Jn;
      const Ct = k.viewport;
      if (k.viewport !== void 0 && (k.viewport = void 0), p.setupLightsView(k), J === true && et.setGlobalState(S.clippingPlanes, k), ks(x, z, k), E.updateMultisampleRenderTarget(tt), E.updateRenderTargetMipmap(tt), Vt.has("WEBGL_multisampled_render_to_texture") === false) {
        let Rt = false;
        for (let St = 0, Yt = D.length; St < Yt; St++) {
          const Zt = D[St], de = Zt.object, ue = Zt.geometry, qt = Zt.material, bt = Zt.group;
          if (qt.side === ze && de.layers.test(k.layers)) {
            const Se = qt.side;
            qt.side = Ve, qt.needsUpdate = true, il(de, z, k, ue, qt, bt), qt.side = Se, qt.needsUpdate = true, Rt = true;
          }
        }
        Rt === true && (E.updateMultisampleRenderTarget(tt), E.updateRenderTargetMipmap(tt));
      }
      S.setRenderTarget(ut), S.setClearColor(G, j), Ct !== void 0 && (k.viewport = Ct), S.toneMapping = gt;
    }
    function ks(x, D, z) {
      const k = D.isScene === true ? D.overrideMaterial : null;
      for (let I = 0, tt = x.length; I < tt; I++) {
        const ot = x[I], ut = ot.object, gt = ot.geometry, Ct = k === null ? ot.material : k, Rt = ot.group;
        ut.layers.test(z.layers) && il(ut, D, z, gt, Ct, Rt);
      }
    }
    function il(x, D, z, k, I, tt) {
      x.onBeforeRender(S, D, z, k, I, tt), x.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse, x.matrixWorld), x.normalMatrix.getNormalMatrix(x.modelViewMatrix), I.onBeforeRender(S, D, z, k, x, tt), I.transparent === true && I.side === ze && I.forceSinglePass === false ? (I.side = Ve, I.needsUpdate = true, S.renderBufferDirect(z, D, k, I, x, tt), I.side = Qn, I.needsUpdate = true, S.renderBufferDirect(z, D, k, I, x, tt), I.side = ze) : S.renderBufferDirect(z, D, k, I, x, tt), x.onAfterRender(S, D, z, k, I, tt);
    }
    function Hs(x, D, z) {
      D.isScene !== true && (D = ae);
      const k = xt.get(x), I = p.state.lights, tt = p.state.shadowsArray, ot = I.state.version, ut = vt.getParameters(x, I.state, tt, D, z), gt = vt.getProgramCacheKey(ut);
      let Ct = k.programs;
      k.environment = x.isMeshStandardMaterial ? D.environment : null, k.fog = D.fog, k.envMap = (x.isMeshStandardMaterial ? B : v).get(x.envMap || k.environment), k.envMapRotation = k.environment !== null && x.envMap === null ? D.environmentRotation : x.envMapRotation, Ct === void 0 && (x.addEventListener("dispose", Lt), Ct = /* @__PURE__ */ new Map(), k.programs = Ct);
      let Rt = Ct.get(gt);
      if (Rt !== void 0) {
        if (k.currentProgram === Rt && k.lightsStateVersion === ot) return rl(x, ut), Rt;
      } else ut.uniforms = vt.getUniforms(x), x.onBeforeCompile(ut, S), Rt = vt.acquireProgram(ut, gt), Ct.set(gt, Rt), k.uniforms = ut.uniforms;
      const St = k.uniforms;
      return (!x.isShaderMaterial && !x.isRawShaderMaterial || x.clipping === true) && (St.clippingPlanes = et.uniform), rl(x, ut), k.needsLights = Dh(x), k.lightsStateVersion = ot, k.needsLights && (St.ambientLightColor.value = I.state.ambient, St.lightProbe.value = I.state.probe, St.directionalLights.value = I.state.directional, St.directionalLightShadows.value = I.state.directionalShadow, St.spotLights.value = I.state.spot, St.spotLightShadows.value = I.state.spotShadow, St.rectAreaLights.value = I.state.rectArea, St.ltc_1.value = I.state.rectAreaLTC1, St.ltc_2.value = I.state.rectAreaLTC2, St.pointLights.value = I.state.point, St.pointLightShadows.value = I.state.pointShadow, St.hemisphereLights.value = I.state.hemi, St.directionalShadowMap.value = I.state.directionalShadowMap, St.directionalShadowMatrix.value = I.state.directionalShadowMatrix, St.spotShadowMap.value = I.state.spotShadowMap, St.spotLightMatrix.value = I.state.spotLightMatrix, St.spotLightMap.value = I.state.spotLightMap, St.pointShadowMap.value = I.state.pointShadowMap, St.pointShadowMatrix.value = I.state.pointShadowMatrix), k.currentProgram = Rt, k.uniformsList = null, Rt;
    }
    function sl(x) {
      if (x.uniformsList === null) {
        const D = x.currentProgram.getUniforms();
        x.uniformsList = Nr.seqWithValue(D.seq, x.uniforms);
      }
      return x.uniformsList;
    }
    function rl(x, D) {
      const z = xt.get(x);
      z.outputColorSpace = D.outputColorSpace, z.batching = D.batching, z.batchingColor = D.batchingColor, z.instancing = D.instancing, z.instancingColor = D.instancingColor, z.instancingMorph = D.instancingMorph, z.skinning = D.skinning, z.morphTargets = D.morphTargets, z.morphNormals = D.morphNormals, z.morphColors = D.morphColors, z.morphTargetsCount = D.morphTargetsCount, z.numClippingPlanes = D.numClippingPlanes, z.numIntersection = D.numClipIntersection, z.vertexAlphas = D.vertexAlphas, z.vertexTangents = D.vertexTangents, z.toneMapping = D.toneMapping;
    }
    function Ph(x, D, z, k, I) {
      D.isScene !== true && (D = ae), E.resetTextureUnits();
      const tt = D.fog, ot = k.isMeshStandardMaterial ? D.environment : null, ut = F === null ? S.outputColorSpace : F.isXRRenderTarget === true ? F.texture.colorSpace : cs, gt = (k.isMeshStandardMaterial ? B : v).get(k.envMap || ot), Ct = k.vertexColors === true && !!z.attributes.color && z.attributes.color.itemSize === 4, Rt = !!z.attributes.tangent && (!!k.normalMap || k.anisotropy > 0), St = !!z.morphAttributes.position, Yt = !!z.morphAttributes.normal, Zt = !!z.morphAttributes.color;
      let de = Jn;
      k.toneMapped && (F === null || F.isXRRenderTarget === true) && (de = S.toneMapping);
      const ue = z.morphAttributes.position || z.morphAttributes.normal || z.morphAttributes.color, qt = ue !== void 0 ? ue.length : 0, bt = xt.get(k), Se = p.state.lights;
      if (J === true && (dt === true || x !== y)) {
        const Re = x === y && k.id === M;
        et.setState(k, x, Re);
      }
      let Kt = false;
      k.version === bt.__version ? (bt.needsLights && bt.lightsStateVersion !== Se.state.version || bt.outputColorSpace !== ut || I.isBatchedMesh && bt.batching === false || !I.isBatchedMesh && bt.batching === true || I.isBatchedMesh && bt.batchingColor === true && I.colorTexture === null || I.isBatchedMesh && bt.batchingColor === false && I.colorTexture !== null || I.isInstancedMesh && bt.instancing === false || !I.isInstancedMesh && bt.instancing === true || I.isSkinnedMesh && bt.skinning === false || !I.isSkinnedMesh && bt.skinning === true || I.isInstancedMesh && bt.instancingColor === true && I.instanceColor === null || I.isInstancedMesh && bt.instancingColor === false && I.instanceColor !== null || I.isInstancedMesh && bt.instancingMorph === true && I.morphTexture === null || I.isInstancedMesh && bt.instancingMorph === false && I.morphTexture !== null || bt.envMap !== gt || k.fog === true && bt.fog !== tt || bt.numClippingPlanes !== void 0 && (bt.numClippingPlanes !== et.numPlanes || bt.numIntersection !== et.numIntersection) || bt.vertexAlphas !== Ct || bt.vertexTangents !== Rt || bt.morphTargets !== St || bt.morphNormals !== Yt || bt.morphColors !== Zt || bt.toneMapping !== de || bt.morphTargetsCount !== qt) && (Kt = true) : (Kt = true, bt.__version = k.version);
      let nn = bt.currentProgram;
      Kt === true && (nn = Hs(k, D, I));
      let Ci = false, We = false, gs = false;
      const le = nn.getUniforms(), Ze = bt.uniforms;
      if (yt.useProgram(nn.program) && (Ci = true, We = true, gs = true), k.id !== M && (M = k.id, We = true), Ci || y !== x) {
        yt.buffers.depth.getReversed() ? (st.copy(x.projectionMatrix), Vu(st), Gu(st), le.setValue(A, "projectionMatrix", st)) : le.setValue(A, "projectionMatrix", x.projectionMatrix), le.setValue(A, "viewMatrix", x.matrixWorldInverse);
        const Fe = le.map.cameraPosition;
        Fe !== void 0 && Fe.setValue(A, kt.setFromMatrixPosition(x.matrixWorld)), Gt.logarithmicDepthBuffer && le.setValue(A, "logDepthBufFC", 2 / (Math.log(x.far + 1) / Math.LN2)), (k.isMeshPhongMaterial || k.isMeshToonMaterial || k.isMeshLambertMaterial || k.isMeshBasicMaterial || k.isMeshStandardMaterial || k.isShaderMaterial) && le.setValue(A, "isOrthographic", x.isOrthographicCamera === true), y !== x && (y = x, We = true, gs = true);
      }
      if (I.isSkinnedMesh) {
        le.setOptional(A, I, "bindMatrix"), le.setOptional(A, I, "bindMatrixInverse");
        const Re = I.skeleton;
        Re && (Re.boneTexture === null && Re.computeBoneTexture(), le.setValue(A, "boneTexture", Re.boneTexture, E));
      }
      I.isBatchedMesh && (le.setOptional(A, I, "batchingTexture"), le.setValue(A, "batchingTexture", I._matricesTexture, E), le.setOptional(A, I, "batchingIdTexture"), le.setValue(A, "batchingIdTexture", I._indirectTexture, E), le.setOptional(A, I, "batchingColorTexture"), I._colorsTexture !== null && le.setValue(A, "batchingColorTexture", I._colorsTexture, E));
      const Ke = z.morphAttributes;
      if ((Ke.position !== void 0 || Ke.normal !== void 0 || Ke.color !== void 0) && At.update(I, z, nn), (We || bt.receiveShadow !== I.receiveShadow) && (bt.receiveShadow = I.receiveShadow, le.setValue(A, "receiveShadow", I.receiveShadow)), k.isMeshGouraudMaterial && k.envMap !== null && (Ze.envMap.value = gt, Ze.flipEnvMap.value = gt.isCubeTexture && gt.isRenderTargetTexture === false ? -1 : 1), k.isMeshStandardMaterial && k.envMap === null && D.environment !== null && (Ze.envMapIntensity.value = D.environmentIntensity), We && (le.setValue(A, "toneMappingExposure", S.toneMappingExposure), bt.needsLights && Lh(Ze, gs), tt && k.fog === true && at.refreshFogUniforms(Ze, tt), at.refreshMaterialUniforms(Ze, k, W, Z, p.state.transmissionRenderTarget[x.id]), Nr.upload(A, sl(bt), Ze, E)), k.isShaderMaterial && k.uniformsNeedUpdate === true && (Nr.upload(A, sl(bt), Ze, E), k.uniformsNeedUpdate = false), k.isSpriteMaterial && le.setValue(A, "center", I.center), le.setValue(A, "modelViewMatrix", I.modelViewMatrix), le.setValue(A, "normalMatrix", I.normalMatrix), le.setValue(A, "modelMatrix", I.matrixWorld), k.isShaderMaterial || k.isRawShaderMaterial) {
        const Re = k.uniformsGroups;
        for (let Fe = 0, Zr = Re.length; Fe < Zr; Fe++) {
          const ii = Re[Fe];
          L.update(ii, nn), L.bind(ii, nn);
        }
      }
      return nn;
    }
    function Lh(x, D) {
      x.ambientLightColor.needsUpdate = D, x.lightProbe.needsUpdate = D, x.directionalLights.needsUpdate = D, x.directionalLightShadows.needsUpdate = D, x.pointLights.needsUpdate = D, x.pointLightShadows.needsUpdate = D, x.spotLights.needsUpdate = D, x.spotLightShadows.needsUpdate = D, x.rectAreaLights.needsUpdate = D, x.hemisphereLights.needsUpdate = D;
    }
    function Dh(x) {
      return x.isMeshLambertMaterial || x.isMeshToonMaterial || x.isMeshPhongMaterial || x.isMeshStandardMaterial || x.isShadowMaterial || x.isShaderMaterial && x.lights === true;
    }
    this.getActiveCubeFace = function() {
      return C;
    }, this.getActiveMipmapLevel = function() {
      return R;
    }, this.getRenderTarget = function() {
      return F;
    }, this.setRenderTargetTextures = function(x, D, z) {
      xt.get(x.texture).__webglTexture = D, xt.get(x.depthTexture).__webglTexture = z;
      const k = xt.get(x);
      k.__hasExternalTextures = true, k.__autoAllocateDepthBuffer = z === void 0, k.__autoAllocateDepthBuffer || Vt.has("WEBGL_multisampled_render_to_texture") === true && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), k.__useRenderToTexture = false);
    }, this.setRenderTargetFramebuffer = function(x, D) {
      const z = xt.get(x);
      z.__webglFramebuffer = D, z.__useDefaultFramebuffer = D === void 0;
    };
    const Ih = A.createFramebuffer();
    this.setRenderTarget = function(x, D = 0, z = 0) {
      F = x, C = D, R = z;
      let k = true, I = null, tt = false, ot = false;
      if (x) {
        const gt = xt.get(x);
        if (gt.__useDefaultFramebuffer !== void 0) yt.bindFramebuffer(A.FRAMEBUFFER, null), k = false;
        else if (gt.__webglFramebuffer === void 0) E.setupRenderTarget(x);
        else if (gt.__hasExternalTextures) E.rebindTextures(x, xt.get(x.texture).__webglTexture, xt.get(x.depthTexture).__webglTexture);
        else if (x.depthBuffer) {
          const St = x.depthTexture;
          if (gt.__boundDepthTexture !== St) {
            if (St !== null && xt.has(St) && (x.width !== St.image.width || x.height !== St.image.height)) throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            E.setupDepthRenderbuffer(x);
          }
        }
        const Ct = x.texture;
        (Ct.isData3DTexture || Ct.isDataArrayTexture || Ct.isCompressedArrayTexture) && (ot = true);
        const Rt = xt.get(x).__webglFramebuffer;
        x.isWebGLCubeRenderTarget ? (Array.isArray(Rt[D]) ? I = Rt[D][z] : I = Rt[D], tt = true) : x.samples > 0 && E.useMultisampledRTT(x) === false ? I = xt.get(x).__webglMultisampledFramebuffer : Array.isArray(Rt) ? I = Rt[z] : I = Rt, P.copy(x.viewport), O.copy(x.scissor), N = x.scissorTest;
      } else P.copy(_t).multiplyScalar(W).floor(), O.copy(Ut).multiplyScalar(W).floor(), N = jt;
      if (z !== 0 && (I = Ih), yt.bindFramebuffer(A.FRAMEBUFFER, I) && k && yt.drawBuffers(x, I), yt.viewport(P), yt.scissor(O), yt.setScissorTest(N), tt) {
        const gt = xt.get(x.texture);
        A.framebufferTexture2D(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_CUBE_MAP_POSITIVE_X + D, gt.__webglTexture, z);
      } else if (ot) {
        const gt = xt.get(x.texture), Ct = D;
        A.framebufferTextureLayer(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0, gt.__webglTexture, z, Ct);
      } else if (x !== null && z !== 0) {
        const gt = xt.get(x.texture);
        A.framebufferTexture2D(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_2D, gt.__webglTexture, z);
      }
      M = -1;
    }, this.readRenderTargetPixels = function(x, D, z, k, I, tt, ot) {
      if (!(x && x.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let ut = xt.get(x).__webglFramebuffer;
      if (x.isWebGLCubeRenderTarget && ot !== void 0 && (ut = ut[ot]), ut) {
        yt.bindFramebuffer(A.FRAMEBUFFER, ut);
        try {
          const gt = x.texture, Ct = gt.format, Rt = gt.type;
          if (!Gt.textureFormatReadable(Ct)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!Gt.textureTypeReadable(Rt)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          D >= 0 && D <= x.width - k && z >= 0 && z <= x.height - I && A.readPixels(D, z, k, I, Ft.convert(Ct), Ft.convert(Rt), tt);
        } finally {
          const gt = F !== null ? xt.get(F).__webglFramebuffer : null;
          yt.bindFramebuffer(A.FRAMEBUFFER, gt);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(x, D, z, k, I, tt, ot) {
      if (!(x && x.isWebGLRenderTarget)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let ut = xt.get(x).__webglFramebuffer;
      if (x.isWebGLCubeRenderTarget && ot !== void 0 && (ut = ut[ot]), ut) {
        const gt = x.texture, Ct = gt.format, Rt = gt.type;
        if (!Gt.textureFormatReadable(Ct)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!Gt.textureTypeReadable(Rt)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        if (D >= 0 && D <= x.width - k && z >= 0 && z <= x.height - I) {
          yt.bindFramebuffer(A.FRAMEBUFFER, ut);
          const St = A.createBuffer();
          A.bindBuffer(A.PIXEL_PACK_BUFFER, St), A.bufferData(A.PIXEL_PACK_BUFFER, tt.byteLength, A.STREAM_READ), A.readPixels(D, z, k, I, Ft.convert(Ct), Ft.convert(Rt), 0);
          const Yt = F !== null ? xt.get(F).__webglFramebuffer : null;
          yt.bindFramebuffer(A.FRAMEBUFFER, Yt);
          const Zt = A.fenceSync(A.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return A.flush(), await Hu(A, Zt, 4), A.bindBuffer(A.PIXEL_PACK_BUFFER, St), A.getBufferSubData(A.PIXEL_PACK_BUFFER, 0, tt), A.deleteBuffer(St), A.deleteSync(Zt), tt;
        } else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
      }
    }, this.copyFramebufferToTexture = function(x, D = null, z = 0) {
      x.isTexture !== true && (fi("WebGLRenderer: copyFramebufferToTexture function signature has changed."), D = arguments[0] || null, x = arguments[1]);
      const k = Math.pow(2, -z), I = Math.floor(x.image.width * k), tt = Math.floor(x.image.height * k), ot = D !== null ? D.x : 0, ut = D !== null ? D.y : 0;
      E.setTexture2D(x, 0), A.copyTexSubImage2D(A.TEXTURE_2D, z, 0, 0, ot, ut, I, tt), yt.unbindTexture();
    };
    const Uh = A.createFramebuffer(), Fh = A.createFramebuffer();
    this.copyTextureToTexture = function(x, D, z = null, k = null, I = 0, tt = null) {
      x.isTexture !== true && (fi("WebGLRenderer: copyTextureToTexture function signature has changed."), k = arguments[0] || null, x = arguments[1], D = arguments[2], tt = arguments[3] || 0, z = null), tt === null && (I !== 0 ? (fi("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), tt = I, I = 0) : tt = 0);
      let ot, ut, gt, Ct, Rt, St, Yt, Zt, de;
      const ue = x.isCompressedTexture ? x.mipmaps[tt] : x.image;
      if (z !== null) ot = z.max.x - z.min.x, ut = z.max.y - z.min.y, gt = z.isBox3 ? z.max.z - z.min.z : 1, Ct = z.min.x, Rt = z.min.y, St = z.isBox3 ? z.min.z : 0;
      else {
        const Ke = Math.pow(2, -I);
        ot = Math.floor(ue.width * Ke), ut = Math.floor(ue.height * Ke), x.isDataArrayTexture ? gt = ue.depth : x.isData3DTexture ? gt = Math.floor(ue.depth * Ke) : gt = 1, Ct = 0, Rt = 0, St = 0;
      }
      k !== null ? (Yt = k.x, Zt = k.y, de = k.z) : (Yt = 0, Zt = 0, de = 0);
      const qt = Ft.convert(D.format), bt = Ft.convert(D.type);
      let Se;
      D.isData3DTexture ? (E.setTexture3D(D, 0), Se = A.TEXTURE_3D) : D.isDataArrayTexture || D.isCompressedArrayTexture ? (E.setTexture2DArray(D, 0), Se = A.TEXTURE_2D_ARRAY) : (E.setTexture2D(D, 0), Se = A.TEXTURE_2D), A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL, D.flipY), A.pixelStorei(A.UNPACK_PREMULTIPLY_ALPHA_WEBGL, D.premultiplyAlpha), A.pixelStorei(A.UNPACK_ALIGNMENT, D.unpackAlignment);
      const Kt = A.getParameter(A.UNPACK_ROW_LENGTH), nn = A.getParameter(A.UNPACK_IMAGE_HEIGHT), Ci = A.getParameter(A.UNPACK_SKIP_PIXELS), We = A.getParameter(A.UNPACK_SKIP_ROWS), gs = A.getParameter(A.UNPACK_SKIP_IMAGES);
      A.pixelStorei(A.UNPACK_ROW_LENGTH, ue.width), A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, ue.height), A.pixelStorei(A.UNPACK_SKIP_PIXELS, Ct), A.pixelStorei(A.UNPACK_SKIP_ROWS, Rt), A.pixelStorei(A.UNPACK_SKIP_IMAGES, St);
      const le = x.isDataArrayTexture || x.isData3DTexture, Ze = D.isDataArrayTexture || D.isData3DTexture;
      if (x.isDepthTexture) {
        const Ke = xt.get(x), Re = xt.get(D), Fe = xt.get(Ke.__renderTarget), Zr = xt.get(Re.__renderTarget);
        yt.bindFramebuffer(A.READ_FRAMEBUFFER, Fe.__webglFramebuffer), yt.bindFramebuffer(A.DRAW_FRAMEBUFFER, Zr.__webglFramebuffer);
        for (let ii = 0; ii < gt; ii++) le && (A.framebufferTextureLayer(A.READ_FRAMEBUFFER, A.COLOR_ATTACHMENT0, xt.get(x).__webglTexture, I, St + ii), A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER, A.COLOR_ATTACHMENT0, xt.get(D).__webglTexture, tt, de + ii)), A.blitFramebuffer(Ct, Rt, ot, ut, Yt, Zt, ot, ut, A.DEPTH_BUFFER_BIT, A.NEAREST);
        yt.bindFramebuffer(A.READ_FRAMEBUFFER, null), yt.bindFramebuffer(A.DRAW_FRAMEBUFFER, null);
      } else if (I !== 0 || x.isRenderTargetTexture || xt.has(x)) {
        const Ke = xt.get(x), Re = xt.get(D);
        yt.bindFramebuffer(A.READ_FRAMEBUFFER, Uh), yt.bindFramebuffer(A.DRAW_FRAMEBUFFER, Fh);
        for (let Fe = 0; Fe < gt; Fe++) le ? A.framebufferTextureLayer(A.READ_FRAMEBUFFER, A.COLOR_ATTACHMENT0, Ke.__webglTexture, I, St + Fe) : A.framebufferTexture2D(A.READ_FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_2D, Ke.__webglTexture, I), Ze ? A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER, A.COLOR_ATTACHMENT0, Re.__webglTexture, tt, de + Fe) : A.framebufferTexture2D(A.DRAW_FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_2D, Re.__webglTexture, tt), I !== 0 ? A.blitFramebuffer(Ct, Rt, ot, ut, Yt, Zt, ot, ut, A.COLOR_BUFFER_BIT, A.NEAREST) : Ze ? A.copyTexSubImage3D(Se, tt, Yt, Zt, de + Fe, Ct, Rt, ot, ut) : A.copyTexSubImage2D(Se, tt, Yt, Zt, Ct, Rt, ot, ut);
        yt.bindFramebuffer(A.READ_FRAMEBUFFER, null), yt.bindFramebuffer(A.DRAW_FRAMEBUFFER, null);
      } else Ze ? x.isDataTexture || x.isData3DTexture ? A.texSubImage3D(Se, tt, Yt, Zt, de, ot, ut, gt, qt, bt, ue.data) : D.isCompressedArrayTexture ? A.compressedTexSubImage3D(Se, tt, Yt, Zt, de, ot, ut, gt, qt, ue.data) : A.texSubImage3D(Se, tt, Yt, Zt, de, ot, ut, gt, qt, bt, ue) : x.isDataTexture ? A.texSubImage2D(A.TEXTURE_2D, tt, Yt, Zt, ot, ut, qt, bt, ue.data) : x.isCompressedTexture ? A.compressedTexSubImage2D(A.TEXTURE_2D, tt, Yt, Zt, ue.width, ue.height, qt, ue.data) : A.texSubImage2D(A.TEXTURE_2D, tt, Yt, Zt, ot, ut, qt, bt, ue);
      A.pixelStorei(A.UNPACK_ROW_LENGTH, Kt), A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, nn), A.pixelStorei(A.UNPACK_SKIP_PIXELS, Ci), A.pixelStorei(A.UNPACK_SKIP_ROWS, We), A.pixelStorei(A.UNPACK_SKIP_IMAGES, gs), tt === 0 && D.generateMipmaps && A.generateMipmap(Se), yt.unbindTexture();
    }, this.copyTextureToTexture3D = function(x, D, z = null, k = null, I = 0) {
      return x.isTexture !== true && (fi("WebGLRenderer: copyTextureToTexture3D function signature has changed."), z = arguments[0] || null, k = arguments[1] || null, x = arguments[2], D = arguments[3], I = arguments[4] || 0), fi('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'), this.copyTextureToTexture(x, D, z, k, I);
    }, this.initRenderTarget = function(x) {
      xt.get(x).__webglFramebuffer === void 0 && E.setupRenderTarget(x);
    }, this.initTexture = function(x) {
      x.isCubeTexture ? E.setTextureCube(x, 0) : x.isData3DTexture ? E.setTexture3D(x, 0) : x.isDataArrayTexture || x.isCompressedArrayTexture ? E.setTexture2DArray(x, 0) : E.setTexture2D(x, 0), yt.unbindTexture();
    }, this.resetState = function() {
      C = 0, R = 0, F = null, yt.reset(), se.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return Ln;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(t) {
    this._outputColorSpace = t;
    const e = this.getContext();
    e.drawingBufferColorspace = $t._getDrawingBufferColorSpace(t), e.unpackColorSpace = $t._getUnpackColorSpace();
  }
}
nt.line = { worldUnits: { value: 1 }, linewidth: { value: 1 }, resolution: { value: new Mt(1, 1) }, dashOffset: { value: 0 }, dashScale: { value: 1 }, dashSize: { value: 1 }, gapSize: { value: 1 } };
Be.line = { uniforms: Xa.merge([nt.common, nt.fog, nt.line]), vertexShader: `
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`, fragmentShader: `
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		` };
class Sn extends dn {
  constructor(t) {
    super({ type: "LineMaterial", uniforms: Xa.clone(Be.line.uniforms), vertexShader: Be.line.vertexShader, fragmentShader: Be.line.fragmentShader, clipping: true }), this.isLineMaterial = true, this.setValues(t);
  }
  get color() {
    return this.uniforms.diffuse.value;
  }
  set color(t) {
    this.uniforms.diffuse.value = t;
  }
  get worldUnits() {
    return "WORLD_UNITS" in this.defines;
  }
  set worldUnits(t) {
    t === true ? this.defines.WORLD_UNITS = "" : delete this.defines.WORLD_UNITS;
  }
  get linewidth() {
    return this.uniforms.linewidth.value;
  }
  set linewidth(t) {
    this.uniforms.linewidth && (this.uniforms.linewidth.value = t);
  }
  get dashed() {
    return "USE_DASH" in this.defines;
  }
  set dashed(t) {
    t === true !== this.dashed && (this.needsUpdate = true), t === true ? this.defines.USE_DASH = "" : delete this.defines.USE_DASH;
  }
  get dashScale() {
    return this.uniforms.dashScale.value;
  }
  set dashScale(t) {
    this.uniforms.dashScale.value = t;
  }
  get dashSize() {
    return this.uniforms.dashSize.value;
  }
  set dashSize(t) {
    this.uniforms.dashSize.value = t;
  }
  get dashOffset() {
    return this.uniforms.dashOffset.value;
  }
  set dashOffset(t) {
    this.uniforms.dashOffset.value = t;
  }
  get gapSize() {
    return this.uniforms.gapSize.value;
  }
  set gapSize(t) {
    this.uniforms.gapSize.value = t;
  }
  get opacity() {
    return this.uniforms.opacity.value;
  }
  set opacity(t) {
    this.uniforms && (this.uniforms.opacity.value = t);
  }
  get resolution() {
    return this.uniforms.resolution.value;
  }
  set resolution(t) {
    this.uniforms.resolution.value.copy(t);
  }
  get alphaToCoverage() {
    return "USE_ALPHA_TO_COVERAGE" in this.defines;
  }
  set alphaToCoverage(t) {
    this.defines && (t === true !== this.alphaToCoverage && (this.needsUpdate = true), t === true ? this.defines.USE_ALPHA_TO_COVERAGE = "" : delete this.defines.USE_ALPHA_TO_COVERAGE);
  }
}
const pc = new ke(), _r = new b();
class jn extends Sd {
  constructor() {
    super(), this.isLineSegmentsGeometry = true, this.type = "LineSegmentsGeometry";
    const t = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], e = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], n = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(n), this.setAttribute("position", new Ge(t, 3)), this.setAttribute("uv", new Ge(e, 2));
  }
  applyMatrix4(t) {
    const e = this.attributes.instanceStart, n = this.attributes.instanceEnd;
    return e !== void 0 && (e.applyMatrix4(t), n.applyMatrix4(t), e.needsUpdate = true), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(t) {
    let e;
    t instanceof Float32Array ? e = t : Array.isArray(t) && (e = new Float32Array(t));
    const n = new La(e, 6, 1);
    return this.setAttribute("instanceStart", new yn(n, 3, 0)), this.setAttribute("instanceEnd", new yn(n, 3, 3)), this.instanceCount = this.attributes.instanceStart.count, this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(t) {
    let e;
    t instanceof Float32Array ? e = t : Array.isArray(t) && (e = new Float32Array(t));
    const n = new La(e, 6, 1);
    return this.setAttribute("instanceColorStart", new yn(n, 3, 0)), this.setAttribute("instanceColorEnd", new yn(n, 3, 3)), this;
  }
  fromWireframeGeometry(t) {
    return this.setPositions(t.attributes.position.array), this;
  }
  fromEdgesGeometry(t) {
    return this.setPositions(t.attributes.position.array), this;
  }
  fromMesh(t) {
    return this.fromWireframeGeometry(new vd(t.geometry)), this;
  }
  fromLineSegments(t) {
    const e = t.geometry;
    return this.setPositions(e.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new ke());
    const t = this.attributes.instanceStart, e = this.attributes.instanceEnd;
    t !== void 0 && e !== void 0 && (this.boundingBox.setFromBufferAttribute(t), pc.setFromBufferAttribute(e), this.boundingBox.union(pc));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new hn()), this.boundingBox === null && this.computeBoundingBox();
    const t = this.attributes.instanceStart, e = this.attributes.instanceEnd;
    if (t !== void 0 && e !== void 0) {
      const n = this.boundingSphere.center;
      this.boundingBox.getCenter(n);
      let i = 0;
      for (let r = 0, o = t.count; r < o; r++) _r.fromBufferAttribute(t, r), i = Math.max(i, n.distanceToSquared(_r)), _r.fromBufferAttribute(e, r), i = Math.max(i, n.distanceToSquared(_r));
      this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.", this);
    }
  }
  toJSON() {
  }
  applyMatrix(t) {
    return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."), this.applyMatrix4(t);
  }
}
const Ro = new re(), mc = new b(), gc = new b(), Me = new re(), Ee = new re(), fn = new re(), Po = new b(), Lo = new Jt(), be = new bd(), _c = new b(), vr = new ke(), xr = new hn(), pn = new re();
let vn, yi;
function vc(s, t, e) {
  return pn.set(0, 0, -t, 1).applyMatrix4(s.projectionMatrix), pn.multiplyScalar(1 / pn.w), pn.x = yi / e.width, pn.y = yi / e.height, pn.applyMatrix4(s.projectionMatrixInverse), pn.multiplyScalar(1 / pn.w), Math.abs(Math.max(pn.x, pn.y));
}
function u_(s, t) {
  const e = s.matrixWorld, n = s.geometry, i = n.attributes.instanceStart, r = n.attributes.instanceEnd, o = Math.min(n.instanceCount, i.count);
  for (let a = 0, l = o; a < l; a++) {
    be.start.fromBufferAttribute(i, a), be.end.fromBufferAttribute(r, a), be.applyMatrix4(e);
    const c = new b(), h = new b();
    vn.distanceSqToSegment(be.start, be.end, h, c), h.distanceTo(c) < yi * 0.5 && t.push({ point: h, pointOnLine: c, distance: vn.origin.distanceTo(h), object: s, face: null, faceIndex: a, uv: null, uv1: null });
  }
}
function d_(s, t, e) {
  const n = t.projectionMatrix, r = s.material.resolution, o = s.matrixWorld, a = s.geometry, l = a.attributes.instanceStart, c = a.attributes.instanceEnd, h = Math.min(a.instanceCount, l.count), u = -t.near;
  vn.at(1, fn), fn.w = 1, fn.applyMatrix4(t.matrixWorldInverse), fn.applyMatrix4(n), fn.multiplyScalar(1 / fn.w), fn.x *= r.x / 2, fn.y *= r.y / 2, fn.z = 0, Po.copy(fn), Lo.multiplyMatrices(t.matrixWorldInverse, o);
  for (let d = 0, f = h; d < f; d++) {
    if (Me.fromBufferAttribute(l, d), Ee.fromBufferAttribute(c, d), Me.w = 1, Ee.w = 1, Me.applyMatrix4(Lo), Ee.applyMatrix4(Lo), Me.z > u && Ee.z > u) continue;
    if (Me.z > u) {
      const w = Me.z - Ee.z, S = (Me.z - u) / w;
      Me.lerp(Ee, S);
    } else if (Ee.z > u) {
      const w = Ee.z - Me.z, S = (Ee.z - u) / w;
      Ee.lerp(Me, S);
    }
    Me.applyMatrix4(n), Ee.applyMatrix4(n), Me.multiplyScalar(1 / Me.w), Ee.multiplyScalar(1 / Ee.w), Me.x *= r.x / 2, Me.y *= r.y / 2, Ee.x *= r.x / 2, Ee.y *= r.y / 2, be.start.copy(Me), be.start.z = 0, be.end.copy(Ee), be.end.z = 0;
    const _ = be.closestPointToPointParameter(Po, true);
    be.at(_, _c);
    const m = qe.lerp(Me.z, Ee.z, _), p = m >= -1 && m <= 1, T = Po.distanceTo(_c) < yi * 0.5;
    if (p && T) {
      be.start.fromBufferAttribute(l, d), be.end.fromBufferAttribute(c, d), be.start.applyMatrix4(o), be.end.applyMatrix4(o);
      const w = new b(), S = new b();
      vn.distanceSqToSegment(be.start, be.end, S, w), e.push({ point: S, pointOnLine: w, distance: vn.origin.distanceTo(S), object: s, face: null, faceIndex: d, uv: null, uv1: null });
    }
  }
}
class Gr extends He {
  constructor(t = new jn(), e = new Sn({ color: Math.random() * 16777215 })) {
    super(t, e), this.isLineSegments2 = true, this.type = "LineSegments2";
  }
  computeLineDistances() {
    const t = this.geometry, e = t.attributes.instanceStart, n = t.attributes.instanceEnd, i = new Float32Array(2 * e.count);
    for (let o = 0, a = 0, l = e.count; o < l; o++, a += 2) mc.fromBufferAttribute(e, o), gc.fromBufferAttribute(n, o), i[a] = a === 0 ? 0 : i[a - 1], i[a + 1] = i[a] + mc.distanceTo(gc);
    const r = new La(i, 2, 1);
    return t.setAttribute("instanceDistanceStart", new yn(r, 1, 0)), t.setAttribute("instanceDistanceEnd", new yn(r, 1, 1)), this;
  }
  raycast(t, e) {
    const n = this.material.worldUnits, i = t.camera;
    i === null && !n && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const r = t.params.Line2 !== void 0 && t.params.Line2.threshold || 0;
    vn = t.ray;
    const o = this.matrixWorld, a = this.geometry, l = this.material;
    yi = l.linewidth + r, a.boundingSphere === null && a.computeBoundingSphere(), xr.copy(a.boundingSphere).applyMatrix4(o);
    let c;
    if (n) c = yi * 0.5;
    else {
      const u = Math.max(i.near, xr.distanceToPoint(vn.origin));
      c = vc(i, u, l.resolution);
    }
    if (xr.radius += c, vn.intersectsSphere(xr) === false) return;
    a.boundingBox === null && a.computeBoundingBox(), vr.copy(a.boundingBox).applyMatrix4(o);
    let h;
    if (n) h = yi * 0.5;
    else {
      const u = Math.max(i.near, vr.distanceToPoint(vn.origin));
      h = vc(i, u, l.resolution);
    }
    vr.expandByScalar(h), vn.intersectsBox(vr) !== false && (n ? u_(this, e) : d_(this, i, e));
  }
  onBeforeRender(t) {
    const e = this.material.uniforms;
    e && e.resolution && (t.getViewport(Ro), this.material.uniforms.resolution.value.set(Ro.z, Ro.w));
  }
}
const xc = { type: "change" }, Za = { type: "start" }, ph = { type: "end" }, yr = new Bs(), yc = new Rn(), f_ = Math.cos(70 * qe.DEG2RAD), pe = new b(), Ne = 2 * Math.PI, ne = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_PAN: 4, TOUCH_DOLLY_PAN: 5, TOUCH_DOLLY_ROTATE: 6 }, Do = 1e-6;
class p_ extends Td {
  constructor(t, e = null) {
    super(t, e), this.state = ne.NONE, this.enabled = true, this.target = new b(), this.cursor = new b(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = false, this.dampingFactor = 0.05, this.enableZoom = true, this.zoomSpeed = 1, this.enableRotate = true, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = true, this.panSpeed = 1, this.screenSpacePanning = true, this.keyPanSpeed = 7, this.zoomToCursor = false, this.autoRotate = false, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: Un.ROTATE, MIDDLE: Un.DOLLY, RIGHT: Un.PAN }, this.touches = { ONE: Ji.ROTATE, TWO: Ji.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new b(), this._lastQuaternion = new Bn(), this._lastTargetPosition = new b(), this._quat = new Bn().setFromUnitVectors(t.up, new b(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new Hl(), this._sphericalDelta = new Hl(), this._scale = 1, this._panOffset = new b(), this._rotateStart = new Mt(), this._rotateEnd = new Mt(), this._rotateDelta = new Mt(), this._panStart = new Mt(), this._panEnd = new Mt(), this._panDelta = new Mt(), this._dollyStart = new Mt(), this._dollyEnd = new Mt(), this._dollyDelta = new Mt(), this._dollyDirection = new b(), this._mouse = new Mt(), this._performCursorZoom = false, this._pointers = [], this._pointerPositions = {}, this._controlActive = false, this._onPointerMove = g_.bind(this), this._onPointerDown = m_.bind(this), this._onPointerUp = __.bind(this), this._onContextMenu = b_.bind(this), this._onMouseWheel = y_.bind(this), this._onKeyDown = S_.bind(this), this._onTouchStart = M_.bind(this), this._onTouchMove = E_.bind(this), this._onMouseDown = v_.bind(this), this._onMouseMove = x_.bind(this), this._interceptControlDown = w_.bind(this), this._interceptControlUp = T_.bind(this), this.domElement !== null && this.connect(), this.update();
  }
  connect() {
    this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: false }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, { passive: true, capture: true }), this.domElement.style.touchAction = "none";
  }
  disconnect() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerUp), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.stopListenToKeyEvents(), this.domElement.getRootNode().removeEventListener("keydown", this._interceptControlDown, { capture: true }), this.domElement.style.touchAction = "auto";
  }
  dispose() {
    this.disconnect();
  }
  getPolarAngle() {
    return this._spherical.phi;
  }
  getAzimuthalAngle() {
    return this._spherical.theta;
  }
  getDistance() {
    return this.object.position.distanceTo(this.target);
  }
  listenToKeyEvents(t) {
    t.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = t;
  }
  stopListenToKeyEvents() {
    this._domElementKeyEvents !== null && (this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null);
  }
  saveState() {
    this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom;
  }
  reset() {
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(xc), this.update(), this.state = ne.NONE;
  }
  update(t = null) {
    const e = this.object.position;
    pe.copy(e).sub(this.target), pe.applyQuaternion(this._quat), this._spherical.setFromVector3(pe), this.autoRotate && this.state === ne.NONE && this._rotateLeft(this._getAutoRotationAngle(t)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let n = this.minAzimuthAngle, i = this.maxAzimuthAngle;
    isFinite(n) && isFinite(i) && (n < -Math.PI ? n += Ne : n > Math.PI && (n -= Ne), i < -Math.PI ? i += Ne : i > Math.PI && (i -= Ne), n <= i ? this._spherical.theta = Math.max(n, Math.min(i, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + i) / 2 ? Math.max(n, this._spherical.theta) : Math.min(i, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === true ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
    let r = false;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const o = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), r = o != this._spherical.radius;
    }
    if (pe.setFromSpherical(this._spherical), pe.applyQuaternion(this._quatInverse), e.copy(this.target).add(pe), this.object.lookAt(this.target), this.enableDamping === true ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
      let o = null;
      if (this.object.isPerspectiveCamera) {
        const a = pe.length();
        o = this._clampDistance(a * this._scale);
        const l = a - o;
        this.object.position.addScaledVector(this._dollyDirection, l), this.object.updateMatrixWorld(), r = !!l;
      } else if (this.object.isOrthographicCamera) {
        const a = new b(this._mouse.x, this._mouse.y, 0);
        a.unproject(this.object);
        const l = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), r = l !== this.object.zoom;
        const c = new b(this._mouse.x, this._mouse.y, 0);
        c.unproject(this.object), this.object.position.sub(c).add(a), this.object.updateMatrixWorld(), o = pe.length();
      } else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = false;
      o !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position) : (yr.origin.copy(this.object.position), yr.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(yr.direction)) < f_ ? this.object.lookAt(this.target) : (yc.setFromNormalAndCoplanarPoint(this.object.up, this.target), yr.intersectPlane(yc, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const o = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), o !== this.object.zoom && (this.object.updateProjectionMatrix(), r = true);
    }
    return this._scale = 1, this._performCursorZoom = false, r || this._lastPosition.distanceToSquared(this.object.position) > Do || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Do || this._lastTargetPosition.distanceToSquared(this.target) > Do ? (this.dispatchEvent(xc), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), true) : false;
  }
  _getAutoRotationAngle(t) {
    return t !== null ? Ne / 60 * this.autoRotateSpeed * t : Ne / 60 / 60 * this.autoRotateSpeed;
  }
  _getZoomScale(t) {
    const e = Math.abs(t * 0.01);
    return Math.pow(0.95, this.zoomSpeed * e);
  }
  _rotateLeft(t) {
    this._sphericalDelta.theta -= t;
  }
  _rotateUp(t) {
    this._sphericalDelta.phi -= t;
  }
  _panLeft(t, e) {
    pe.setFromMatrixColumn(e, 0), pe.multiplyScalar(-t), this._panOffset.add(pe);
  }
  _panUp(t, e) {
    this.screenSpacePanning === true ? pe.setFromMatrixColumn(e, 1) : (pe.setFromMatrixColumn(e, 0), pe.crossVectors(this.object.up, pe)), pe.multiplyScalar(t), this._panOffset.add(pe);
  }
  _pan(t, e) {
    const n = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const i = this.object.position;
      pe.copy(i).sub(this.target);
      let r = pe.length();
      r *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * t * r / n.clientHeight, this.object.matrix), this._panUp(2 * e * r / n.clientHeight, this.object.matrix);
    } else this.object.isOrthographicCamera ? (this._panLeft(t * (this.object.right - this.object.left) / this.object.zoom / n.clientWidth, this.object.matrix), this._panUp(e * (this.object.top - this.object.bottom) / this.object.zoom / n.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = false);
  }
  _dollyOut(t) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = false);
  }
  _dollyIn(t) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = false);
  }
  _updateZoomParameters(t, e) {
    if (!this.zoomToCursor) return;
    this._performCursorZoom = true;
    const n = this.domElement.getBoundingClientRect(), i = t - n.left, r = e - n.top, o = n.width, a = n.height;
    this._mouse.x = i / o * 2 - 1, this._mouse.y = -(r / a) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }
  _clampDistance(t) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, t));
  }
  _handleMouseDownRotate(t) {
    this._rotateStart.set(t.clientX, t.clientY);
  }
  _handleMouseDownDolly(t) {
    this._updateZoomParameters(t.clientX, t.clientX), this._dollyStart.set(t.clientX, t.clientY);
  }
  _handleMouseDownPan(t) {
    this._panStart.set(t.clientX, t.clientY);
  }
  _handleMouseMoveRotate(t) {
    this._rotateEnd.set(t.clientX, t.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const e = this.domElement;
    this._rotateLeft(Ne * this._rotateDelta.x / e.clientHeight), this._rotateUp(Ne * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
  }
  _handleMouseMoveDolly(t) {
    this._dollyEnd.set(t.clientX, t.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update();
  }
  _handleMouseMovePan(t) {
    this._panEnd.set(t.clientX, t.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update();
  }
  _handleMouseWheel(t) {
    this._updateZoomParameters(t.clientX, t.clientY), t.deltaY < 0 ? this._dollyIn(this._getZoomScale(t.deltaY)) : t.deltaY > 0 && this._dollyOut(this._getZoomScale(t.deltaY)), this.update();
  }
  _handleKeyDown(t) {
    let e = false;
    switch (t.code) {
      case this.keys.UP:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(Ne * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), e = true;
        break;
      case this.keys.BOTTOM:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(-Ne * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), e = true;
        break;
      case this.keys.LEFT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(Ne * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), e = true;
        break;
      case this.keys.RIGHT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(-Ne * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), e = true;
        break;
    }
    e && (t.preventDefault(), this.update());
  }
  _handleTouchStartRotate(t) {
    if (this._pointers.length === 1) this._rotateStart.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), i = 0.5 * (t.pageY + e.y);
      this._rotateStart.set(n, i);
    }
  }
  _handleTouchStartPan(t) {
    if (this._pointers.length === 1) this._panStart.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), i = 0.5 * (t.pageY + e.y);
      this._panStart.set(n, i);
    }
  }
  _handleTouchStartDolly(t) {
    const e = this._getSecondPointerPosition(t), n = t.pageX - e.x, i = t.pageY - e.y, r = Math.sqrt(n * n + i * i);
    this._dollyStart.set(0, r);
  }
  _handleTouchStartDollyPan(t) {
    this.enableZoom && this._handleTouchStartDolly(t), this.enablePan && this._handleTouchStartPan(t);
  }
  _handleTouchStartDollyRotate(t) {
    this.enableZoom && this._handleTouchStartDolly(t), this.enableRotate && this._handleTouchStartRotate(t);
  }
  _handleTouchMoveRotate(t) {
    if (this._pointers.length == 1) this._rotateEnd.set(t.pageX, t.pageY);
    else {
      const n = this._getSecondPointerPosition(t), i = 0.5 * (t.pageX + n.x), r = 0.5 * (t.pageY + n.y);
      this._rotateEnd.set(i, r);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const e = this.domElement;
    this._rotateLeft(Ne * this._rotateDelta.x / e.clientHeight), this._rotateUp(Ne * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(t) {
    if (this._pointers.length === 1) this._panEnd.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), i = 0.5 * (t.pageY + e.y);
      this._panEnd.set(n, i);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(t) {
    const e = this._getSecondPointerPosition(t), n = t.pageX - e.x, i = t.pageY - e.y, r = Math.sqrt(n * n + i * i);
    this._dollyEnd.set(0, r), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
    const o = (t.pageX + e.x) * 0.5, a = (t.pageY + e.y) * 0.5;
    this._updateZoomParameters(o, a);
  }
  _handleTouchMoveDollyPan(t) {
    this.enableZoom && this._handleTouchMoveDolly(t), this.enablePan && this._handleTouchMovePan(t);
  }
  _handleTouchMoveDollyRotate(t) {
    this.enableZoom && this._handleTouchMoveDolly(t), this.enableRotate && this._handleTouchMoveRotate(t);
  }
  _addPointer(t) {
    this._pointers.push(t.pointerId);
  }
  _removePointer(t) {
    delete this._pointerPositions[t.pointerId];
    for (let e = 0; e < this._pointers.length; e++) if (this._pointers[e] == t.pointerId) {
      this._pointers.splice(e, 1);
      return;
    }
  }
  _isTrackingPointer(t) {
    for (let e = 0; e < this._pointers.length; e++) if (this._pointers[e] == t.pointerId) return true;
    return false;
  }
  _trackPointer(t) {
    let e = this._pointerPositions[t.pointerId];
    e === void 0 && (e = new Mt(), this._pointerPositions[t.pointerId] = e), e.set(t.pageX, t.pageY);
  }
  _getSecondPointerPosition(t) {
    const e = t.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[e];
  }
  _customWheelEvent(t) {
    const e = t.deltaMode, n = { clientX: t.clientX, clientY: t.clientY, deltaY: t.deltaY };
    switch (e) {
      case 1:
        n.deltaY *= 16;
        break;
      case 2:
        n.deltaY *= 100;
        break;
    }
    return t.ctrlKey && !this._controlActive && (n.deltaY *= 10), n;
  }
}
function m_(s) {
  this.enabled !== false && (this._pointers.length === 0 && (this.domElement.setPointerCapture(s.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(s) && (this._addPointer(s), s.pointerType === "touch" ? this._onTouchStart(s) : this._onMouseDown(s)));
}
function g_(s) {
  this.enabled !== false && (s.pointerType === "touch" ? this._onTouchMove(s) : this._onMouseMove(s));
}
function __(s) {
  switch (this._removePointer(s), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(s.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(ph), this.state = ne.NONE;
      break;
    case 1:
      const t = this._pointers[0], e = this._pointerPositions[t];
      this._onTouchStart({ pointerId: t, pageX: e.x, pageY: e.y });
      break;
  }
}
function v_(s) {
  let t;
  switch (s.button) {
    case 0:
      t = this.mouseButtons.LEFT;
      break;
    case 1:
      t = this.mouseButtons.MIDDLE;
      break;
    case 2:
      t = this.mouseButtons.RIGHT;
      break;
    default:
      t = -1;
  }
  switch (t) {
    case Un.DOLLY:
      if (this.enableZoom === false) return;
      this._handleMouseDownDolly(s), this.state = ne.DOLLY;
      break;
    case Un.ROTATE:
      if (s.ctrlKey || s.metaKey || s.shiftKey) {
        if (this.enablePan === false) return;
        this._handleMouseDownPan(s), this.state = ne.PAN;
      } else {
        if (this.enableRotate === false) return;
        this._handleMouseDownRotate(s), this.state = ne.ROTATE;
      }
      break;
    case Un.PAN:
      if (s.ctrlKey || s.metaKey || s.shiftKey) {
        if (this.enableRotate === false) return;
        this._handleMouseDownRotate(s), this.state = ne.ROTATE;
      } else {
        if (this.enablePan === false) return;
        this._handleMouseDownPan(s), this.state = ne.PAN;
      }
      break;
    default:
      this.state = ne.NONE;
  }
  this.state !== ne.NONE && this.dispatchEvent(Za);
}
function x_(s) {
  switch (this.state) {
    case ne.ROTATE:
      if (this.enableRotate === false) return;
      this._handleMouseMoveRotate(s);
      break;
    case ne.DOLLY:
      if (this.enableZoom === false) return;
      this._handleMouseMoveDolly(s);
      break;
    case ne.PAN:
      if (this.enablePan === false) return;
      this._handleMouseMovePan(s);
      break;
  }
}
function y_(s) {
  this.enabled === false || this.enableZoom === false || this.state !== ne.NONE || (s.preventDefault(), this.dispatchEvent(Za), this._handleMouseWheel(this._customWheelEvent(s)), this.dispatchEvent(ph));
}
function S_(s) {
  this.enabled !== false && this._handleKeyDown(s);
}
function M_(s) {
  switch (this._trackPointer(s), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case Ji.ROTATE:
          if (this.enableRotate === false) return;
          this._handleTouchStartRotate(s), this.state = ne.TOUCH_ROTATE;
          break;
        case Ji.PAN:
          if (this.enablePan === false) return;
          this._handleTouchStartPan(s), this.state = ne.TOUCH_PAN;
          break;
        default:
          this.state = ne.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case Ji.DOLLY_PAN:
          if (this.enableZoom === false && this.enablePan === false) return;
          this._handleTouchStartDollyPan(s), this.state = ne.TOUCH_DOLLY_PAN;
          break;
        case Ji.DOLLY_ROTATE:
          if (this.enableZoom === false && this.enableRotate === false) return;
          this._handleTouchStartDollyRotate(s), this.state = ne.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = ne.NONE;
      }
      break;
    default:
      this.state = ne.NONE;
  }
  this.state !== ne.NONE && this.dispatchEvent(Za);
}
function E_(s) {
  switch (this._trackPointer(s), this.state) {
    case ne.TOUCH_ROTATE:
      if (this.enableRotate === false) return;
      this._handleTouchMoveRotate(s), this.update();
      break;
    case ne.TOUCH_PAN:
      if (this.enablePan === false) return;
      this._handleTouchMovePan(s), this.update();
      break;
    case ne.TOUCH_DOLLY_PAN:
      if (this.enableZoom === false && this.enablePan === false) return;
      this._handleTouchMoveDollyPan(s), this.update();
      break;
    case ne.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === false && this.enableRotate === false) return;
      this._handleTouchMoveDollyRotate(s), this.update();
      break;
    default:
      this.state = ne.NONE;
  }
}
function b_(s) {
  this.enabled !== false && s.preventDefault();
}
function w_(s) {
  s.key === "Control" && (this._controlActive = true, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, { passive: true, capture: true }));
}
function T_(s) {
  s.key === "Control" && (this._controlActive = false, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, { passive: true, capture: true }));
}
const A_ = (s) => getComputedStyle(document.documentElement).getPropertyValue(s).trim();
function In(s, t) {
  const e = A_(s);
  if (!e) return t;
  if (e.startsWith("#")) {
    const i = e.slice(1), r = i.length === 3 ? [...i].map((a) => a + a).join("") : i, o = Number.parseInt(r, 16);
    return Number.isFinite(o) && r.length === 6 ? o : t;
  }
  const n = e.split(/[\s,/]+/).map(Number);
  return n.length >= 3 && n.slice(0, 3).every((i) => Number.isFinite(i)) ? (n[0] & 255) << 16 | (n[1] & 255) << 8 | n[2] & 255 : t;
}
function Wr(s, t) {
  const e = (n) => Math.max(0, Math.min(255, Math.round(t < 0 ? n * (1 + t) : n + (255 - n) * t)));
  return e(s >> 16 & 255) << 16 | e(s >> 8 & 255) << 8 | e(s & 255);
}
const mi = 0.62, Ds = 0.5, ws = new Mt(), hi = new b(), Sc = new b(), Mc = new b(), Ec = new b(), Sr = new b();
function qi() {
  return { x: 0, y: 0, w: 0, h: 0 };
}
class C_ {
  constructor(t, e, n) {
    this.renderer = t, this.scene = e, this.topOffset = 0, this.layoutState = { splitX: mi, splitY: Ds, hideProfile: false, hideIso: false }, this.onBeforeViewport = null;
    const i = new an(-1, 1, 1, -1, -2e3, 4e3), r = new an(-1, 1, 1, -1, -2e3, 4e3), o = new $e(50, 1, 0.1, 4e3);
    i.layers.enable(1), o.layers.enable(2), i.layers.enable(3), r.layers.enable(3), o.layers.enable(3), i.layers.enable(4), r.layers.enable(4), o.layers.enable(4), r.layers.enable(5), o.layers.enable(5), r.layers.enable(6);
    const a = In("--bg", 723981);
    this.main = { name: "main", camera: i, clearColor: a, fx: 0, fy: 0, fw: mi, fh: 1, css: qi(), gl: qi(), frustumHeight: 30 }, this.profile = { name: "profile", camera: r, clearColor: Wr(a, -0.3), fx: mi, fy: 0, fw: 1 - mi, fh: Ds, css: qi(), gl: qi(), frustumHeight: 30 }, this.iso = { name: "iso", camera: o, clearColor: Wr(a, -0.55), fx: mi, fy: Ds, fw: 1 - mi, fh: 1 - Ds, css: qi(), gl: qi(), frustumHeight: 30 }, this.list = [this.main, this.profile, this.iso], this.orbit = new p_(o, n), this.orbit.enableDamping = true, this.orbit.dampingFactor = 0.08, this.orbit.mouseButtons.MIDDLE = Un.ROTATE, this.orbit.mouseButtons.RIGHT = Un.PAN, this.renderer.setScissorTest(true), window.addEventListener("resize", () => this.resize()), this.resize();
  }
  setTopOffset(t) {
    const e = Math.max(0, Math.round(t));
    e !== this.topOffset && (this.topOffset = e, this.resize());
  }
  layout() {
    return { ...this.layoutState };
  }
  setLayout(t) {
    const e = this.layoutState;
    t.splitX !== void 0 && (e.splitX = qe.clamp(t.splitX, 0.2, 0.85)), t.splitY !== void 0 && (e.splitY = qe.clamp(t.splitY, 0.15, 0.85)), t.hideProfile !== void 0 && (e.hideProfile = t.hideProfile), t.hideIso !== void 0 && (e.hideIso = t.hideIso), this.applyFractions(), this.resize();
  }
  applyFractions() {
    const { splitX: t, splitY: e, hideProfile: n, hideIso: i } = this.layoutState, r = n && i ? 1 : t;
    this.main.fx = 0, this.main.fy = 0, this.main.fw = r, this.main.fh = 1, this.profile.fx = r, this.profile.fy = 0, this.profile.fw = n ? 0 : 1 - r, this.profile.fh = n ? 0 : i ? 1 : e, this.iso.fx = r, this.iso.fy = i || n ? 0 : e, this.iso.fw = i ? 0 : 1 - r, this.iso.fh = i ? 0 : n ? 1 : 1 - e, document.body.classList.toggle("no-profile", n), document.body.classList.toggle("no-iso", i), document.body.classList.toggle("no-right", n && i);
  }
  resize() {
    const t = window.innerWidth, e = window.innerHeight, n = Math.min(this.topOffset, e - 40), i = e - n;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)), this.renderer.setSize(t, e, false);
    for (const l of this.list) l.css.x = l.fx * t, l.css.y = n + l.fy * i, l.css.w = l.fw * t, l.css.h = l.fh * i, l.gl.x = l.css.x, l.gl.w = l.css.w, l.gl.h = l.css.h, l.gl.y = e - (l.css.y + l.css.h), l.camera instanceof an ? this.applyOrtho(l) : (l.camera.aspect = l.css.w / Math.max(1, l.css.h), l.camera.updateProjectionMatrix());
    const r = this.layoutState, o = r.hideIso ? r.hideProfile ? e : this.profile.css.y + this.profile.css.h : this.iso.css.y, a = document.documentElement.style;
    a.setProperty("--split-x", `${Math.round(this.main.css.w)}px`), a.setProperty("--split-y", `${Math.round(o)}px`), a.setProperty("--pane-h", `${Math.max(0, Math.round(e - o))}px`);
  }
  update() {
    this.orbit.update();
  }
  render() {
    const t = this.renderer;
    for (const e of this.list) e.css.w < 2 || e.css.h < 2 || (t.setViewport(e.gl.x, e.gl.y, e.gl.w, e.gl.h), t.setScissor(e.gl.x, e.gl.y, e.gl.w, e.gl.h), t.setClearColor(e.clearColor, 1), this.onBeforeViewport && this.onBeforeViewport(e), t.render(this.scene, e.camera));
  }
  viewportAt(t, e) {
    for (const n of this.list) {
      const i = n.css;
      if (t >= i.x && t < i.x + i.w && e >= i.y && e < i.y + i.h) return n;
    }
    return null;
  }
  ndcInto(t, e, n, i) {
    return i.x = (e - t.css.x) / t.css.w * 2 - 1, i.y = -((n - t.css.y) / t.css.h * 2 - 1), i;
  }
  worldPerPixel(t) {
    return t.camera instanceof an ? t.frustumHeight / t.css.h : 0.01;
  }
  projectToClient(t, e, n) {
    hi.copy(e).project(t.camera), n.x = t.css.x + (hi.x * 0.5 + 0.5) * t.css.w, n.y = t.css.y + (-hi.y * 0.5 + 0.5) * t.css.h;
  }
  setOrthoView(t, e, n, i, r) {
    const o = t.camera;
    t.frustumHeight = r, o.up.copy(n), o.position.copy(i).addScaledVector(e, 120), o.lookAt(i), o.updateMatrixWorld(true), this.applyOrtho(t);
  }
  setTopView(t, e) {
    hi.set(0, 1, 0), Sr.set(0, 0, -1), this.setOrthoView(this.main, hi, Sr, t, e);
  }
  setIsoView(t, e) {
    const n = this.iso.camera;
    hi.set(0.9, 0.7, 0.9).normalize().multiplyScalar(e * 2.1), n.position.copy(t).add(hi), this.orbit.target.copy(t), this.orbit.update();
  }
  zoomAt(t, e, n, i) {
    t.camera instanceof an && (this.ndcInto(t, e, n, ws), Sc.set(ws.x, ws.y, 0).unproject(t.camera), t.frustumHeight = qe.clamp(t.frustumHeight * i, 0.05, 4e3), this.applyOrtho(t), Mc.set(ws.x, ws.y, 0).unproject(t.camera), t.camera.position.add(Sc.sub(Mc)), t.camera.updateMatrixWorld(true));
  }
  pan(t, e, n) {
    if (!(t.camera instanceof an)) return;
    const i = this.worldPerPixel(t), r = t.camera.matrixWorld.elements;
    Ec.set(r[0], r[1], r[2]), Sr.set(r[4], r[5], r[6]), t.camera.position.addScaledVector(Ec, -e * i).addScaledVector(Sr, n * i), t.camera.updateMatrixWorld(true);
  }
  applyOrtho(t) {
    const e = t.camera, n = t.css.w / Math.max(1, t.css.h);
    e.top = t.frustumHeight / 2, e.bottom = -e.top, e.right = t.frustumHeight * n / 2, e.left = -e.right, e.updateProjectionMatrix();
  }
}
class R_ {
  constructor() {
    this.defined = false, this.matrix = new Jt(), this.inverse = new Jt(), this.origin = new b(), this.xAxis = new b(1, 0, 0), this.yAxis = new b(0, 1, 0), this.zAxis = new b(0, 0, 1), this.group = new Dn(), this.plane = new Rn(new b(0, 1, 0), 0), this.group.matrixAutoUpdate = false, this.axesHelper = P_(), this.axesHelper.matrixAutoUpdate = false, this.axesHelper.visible = false;
  }
  setFromPoints(t, e) {
    this.xAxis.subVectors(e, t), this.xAxis.y = 0, this.xAxis.lengthSq() < 1e-8 && this.xAxis.set(1, 0, 0), this.xAxis.normalize(), this.yAxis.set(0, 1, 0), this.zAxis.crossVectors(this.xAxis, this.yAxis).normalize(), this.origin.copy(t), this.matrix.makeBasis(this.xAxis, this.yAxis, this.zAxis).setPosition(this.origin), this.finalize();
  }
  reset() {
    this.defined = false, this.matrix.identity(), this.inverse.identity(), this.plane.normal.set(0, 1, 0), this.plane.constant = 0, this.group.matrix.identity(), this.group.matrixWorldNeedsUpdate = true, this.axesHelper.visible = false;
  }
  setFromMatrix(t) {
    this.matrix.copy(t), this.matrix.extractBasis(this.xAxis, this.yAxis, this.zAxis), this.origin.setFromMatrixPosition(this.matrix), this.finalize();
  }
  finalize() {
    this.inverse.copy(this.matrix).invert(), this.plane.setFromNormalAndCoplanarPoint(this.zAxis, this.origin), this.group.matrix.copy(this.matrix), this.group.matrixWorldNeedsUpdate = true, this.axesHelper.matrix.copy(this.matrix), this.axesHelper.matrixWorldNeedsUpdate = true, this.axesHelper.visible = true, this.defined = true;
  }
  worldToLocal(t, e) {
    return e.copy(t).applyMatrix4(this.inverse);
  }
  localToWorld(t, e) {
    return e.copy(t).applyMatrix4(this.matrix);
  }
}
function P_() {
  const s = new Float32Array([0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1.4, 0, 0, 0, 0, 0, 0, 0.7]), t = new Float32Array([1, 0.3, 0.3, 1, 0.3, 0.3, 0.3, 1, 0.45, 0.3, 1, 0.45, 0.35, 0.55, 1, 0.35, 0.55, 1]), e = new me();
  e.setAttribute("position", new ce(s, 3)), e.setAttribute("color", new ce(t, 3));
  const n = new ds({ vertexColors: true, depthTest: false }), i = new qa(e, n);
  return i.renderOrder = 3, i.frustumCulled = false, i;
}
const Mr = new b(), ui = 0.35, bc = 2048;
class L_ {
  constructor() {
    this.cellStart = null, this.order = null, this.pts = null, this.cols = 1, this.rows = 1, this.ox = 0, this.oy = 0, this.localBounds = new ke(), this.ready = false;
  }
  buildLocal(t, e) {
    if (!e) {
      this.clear();
      return;
    }
    this.localBounds.makeEmpty();
    let n = 1 / 0, i = 1 / 0, r = -1 / 0, o = -1 / 0;
    for (let a = 0; a < e; a++) {
      const l = t[a * 3], c = t[a * 3 + 1];
      l < n && (n = l), l > r && (r = l), c < i && (i = c), c > o && (o = c);
    }
    this.finishBuild(t, e, n, i, r, o);
  }
  build(t, e, n) {
    const i = e ? e.length : t.length / 3;
    if (!i) {
      this.clear();
      return;
    }
    const r = new Float32Array(i * 3);
    this.localBounds.makeEmpty();
    const o = n.elements;
    let a = 1 / 0, l = 1 / 0, c = -1 / 0, h = -1 / 0;
    for (let u = 0; u < i; u++) {
      const d = (e ? e[u] : u) * 3, f = t[d], g = t[d + 1], _ = t[d + 2], m = o[0] * f + o[4] * g + o[8] * _ + o[12], p = o[1] * f + o[5] * g + o[9] * _ + o[13], T = o[2] * f + o[6] * g + o[10] * _ + o[14];
      r[u * 3] = m, r[u * 3 + 1] = p, r[u * 3 + 2] = T, m < a && (a = m), m > c && (c = m), p < l && (l = p), p > h && (h = p);
    }
    this.finishBuild(r, i, a, l, c, h);
  }
  finishBuild(t, e, n, i, r, o) {
    Mr.set(n, i, 0), this.localBounds.expandByPoint(Mr), Mr.set(r, o, 0), this.localBounds.expandByPoint(Mr), this.ox = n, this.oy = i, this.cols = Math.max(1, Math.min(bc, Math.ceil((r - n) / ui) + 1)), this.rows = Math.max(1, Math.min(bc, Math.ceil((o - i) / ui) + 1));
    const a = this.cols * this.rows, l = new Int32Array(a + 1), c = new Int32Array(e);
    for (let d = 0; d < e; d++) {
      const f = this.cellIndex(t[d * 3], t[d * 3 + 1]);
      c[d] = f, l[f + 1]++;
    }
    for (let d = 0; d < a; d++) l[d + 1] += l[d];
    const h = new Int32Array(e), u = Int32Array.from(l.subarray(0, a));
    for (let d = 0; d < e; d++) h[u[c[d]]++] = d;
    this.pts = t, this.cellStart = l, this.order = h, this.ready = true;
  }
  cellIndex(t, e) {
    const n = Math.min(this.cols - 1, Math.max(0, Math.floor((t - this.ox) / ui)));
    return Math.min(this.rows - 1, Math.max(0, Math.floor((e - this.oy) / ui))) * this.cols + n;
  }
  query(t, e, n, i, r = -1 / 0, o = 1 / 0) {
    const a = this.pts, l = this.cellStart, c = this.order;
    if (!this.ready || !a || !l || !c) return false;
    const h = Math.min(4, Math.ceil(n / ui)), u = Math.floor((t - this.ox) / ui), d = Math.floor((e - this.oy) / ui);
    let f = -1, g = n * n;
    const _ = Math.max(0, u - h), m = Math.min(this.cols - 1, u + h), p = Math.max(0, d - h), T = Math.min(this.rows - 1, d + h);
    for (let w = p; w <= T; w++) {
      const S = w * this.cols;
      for (let U = _; U <= m; U++) {
        const C = S + U;
        for (let R = l[C], F = l[C + 1]; R < F; R++) {
          const M = c[R] * 3, y = a[M + 2];
          if (y < r || y > o) continue;
          const P = a[M] - t, O = a[M + 1] - e, N = P * P + O * O;
          N < g && (g = N, f = M);
        }
      }
    }
    return f < 0 ? false : (i.set(a[f], a[f + 1], a[f + 2]), true);
  }
  clear() {
    this.cellStart = null, this.order = null, this.pts = null, this.ready = false, this.localBounds.makeEmpty();
  }
}
class Xr extends jn {
  constructor() {
    super(), this.isLineGeometry = true, this.type = "LineGeometry";
  }
  setPositions(t) {
    const e = t.length - 3, n = new Float32Array(2 * e);
    for (let i = 0; i < e; i += 3) n[2 * i] = t[i], n[2 * i + 1] = t[i + 1], n[2 * i + 2] = t[i + 2], n[2 * i + 3] = t[i + 3], n[2 * i + 4] = t[i + 4], n[2 * i + 5] = t[i + 5];
    return super.setPositions(n), this;
  }
  setColors(t) {
    const e = t.length - 3, n = new Float32Array(2 * e);
    for (let i = 0; i < e; i += 3) n[2 * i] = t[i], n[2 * i + 1] = t[i + 1], n[2 * i + 2] = t[i + 2], n[2 * i + 3] = t[i + 3], n[2 * i + 4] = t[i + 4], n[2 * i + 5] = t[i + 5];
    return super.setColors(n), this;
  }
  setFromPoints(t) {
    const e = t.length - 1, n = new Float32Array(6 * e);
    for (let i = 0; i < e; i++) n[6 * i] = t[i].x, n[6 * i + 1] = t[i].y, n[6 * i + 2] = t[i].z || 0, n[6 * i + 3] = t[i + 1].x, n[6 * i + 4] = t[i + 1].y, n[6 * i + 5] = t[i + 1].z || 0;
    return super.setPositions(n), this;
  }
  fromLine(t) {
    const e = t.geometry;
    return this.setPositions(e.attributes.position.array), this;
  }
}
class mh extends Gr {
  constructor(t = new Xr(), e = new Sn({ color: Math.random() * 16777215 })) {
    super(t, e), this.isLine2 = true, this.type = "Line2";
  }
}
let D_ = 1, Zn = null;
function I_(s) {
  Zn = s;
}
const U_ = new Sn({ color: 14542591, linewidth: 1.6 }), F_ = new ds({ color: 9149689, transparent: true, opacity: 0.4 }), gh = new Sn({ color: 9149689, transparent: true, opacity: 0.4, linewidth: 1.6 }), N_ = new Ei({ color: 9149689, transparent: true, opacity: 0.25, side: ze, depthWrite: false }), It = { minx: 0, miny: 0, maxx: 0, maxy: 0 };
class _h {
  constructor() {
    this.id = D_++, this.points = [], this.layer = Zn ? Zn.current : "0", this.selected = false;
  }
  setSelected(t) {
    this.selected !== t && (this.selected = t, this.refreshAppearance());
  }
  refreshAppearance() {
    if (!Zn) return;
    const t = Zn.get(this.layer);
    this.applyLayer(t), this.object3D.visible = t.visible;
  }
  translate(t) {
    for (const e of this.points) e.add(t), e.z = 0;
    this.rebuild();
  }
  mapPoints(t, e, n, i, r, o) {
    for (const a of this.points) {
      const l = a.x - r, c = a.y - o;
      a.set(r + t * l + e * c, o + n * l + i * c, 0);
    }
  }
  rotateAround(t, e) {
    const n = Math.cos(e), i = Math.sin(e);
    this.mapPoints(n, -i, i, n, t.x, t.y), this.onRotated(e), this.rebuild();
  }
  scaleAround(t, e) {
    this.mapPoints(e, 0, 0, e, t.x, t.y), this.onScaled(e), this.rebuild();
  }
  mirrorAcross(t, e) {
    const n = Math.cos(2 * e), i = Math.sin(2 * e);
    this.mapPoints(n, i, i, -n, t.x, t.y), this.onMirrored(e), this.rebuild();
  }
  onRotated(t) {
  }
  onScaled(t) {
  }
  onMirrored(t) {
  }
  setPreviewOffset(t) {
    this.object3D.position.set(t.x, t.y, 0);
  }
  setPreviewTransform(t, e, n, i) {
    const r = Math.cos(t), o = Math.sin(t), a = r * e, l = -o * n, c = o * e, h = r * n;
    this.object3D.rotation.z = t, this.object3D.scale.set(e, n, 1), this.object3D.position.set(i.x - (a * i.x + l * i.y), i.y - (c * i.x + h * i.y), 0);
  }
  clearPreview() {
    this.object3D.position.set(0, 0, 0), this.object3D.rotation.z = 0, this.object3D.scale.set(1, 1, 1), this.rebuild();
  }
  getBounds() {
    It.minx = 1 / 0, It.miny = 1 / 0, It.maxx = -1 / 0, It.maxy = -1 / 0;
    for (const t of this.points) It.minx = Math.min(It.minx, t.x), It.miny = Math.min(It.miny, t.y), It.maxx = Math.max(It.maxx, t.x), It.maxy = Math.max(It.maxy, t.y);
    return It;
  }
  nearPoint(t, e, n) {
    const i = this.getBounds();
    return t >= i.minx - n && t <= i.maxx + n && e >= i.miny - n && e <= i.maxy + n;
  }
  withinRect(t, e) {
    const n = this.getBounds();
    return n.minx >= t.x && n.maxx <= e.x && n.miny >= t.y && n.maxy <= e.y;
  }
  intersectsRect(t, e) {
    const n = this.getBounds();
    return n.maxx >= t.x && n.minx <= e.x && n.maxy >= t.y && n.miny <= e.y;
  }
}
class zs extends _h {
  constructor() {
    super(), this.samples = new Float32Array(0);
    const t = Zn ? Zn.get(Zn.current).mat : U_;
    this.object3D = new mh(new Xr(), t), this.object3D.userData.entity = this, this.object3D.frustumCulled = false;
  }
  rebuild() {
    this.samples = this.fillSamples();
    const t = this.object3D.geometry, e = new Xr();
    e.setPositions(this.samples), this.object3D.geometry = e, t.dispose(), this.object3D.computeLineDistances();
  }
  applyLayer(t) {
    this.object3D.material = this.selected ? t.matSel : t.mat;
  }
  hitDistance(t, e) {
    const n = this.samples;
    let i = 1 / 0;
    for (let r = 0; r + 5 < n.length; r += 3) {
      const o = n[r], a = n[r + 1], l = n[r + 3], c = n[r + 4], h = l - o, u = c - a, d = h * h + u * u;
      let f = d > 0 ? ((t - o) * h + (e - a) * u) / d : 0;
      f = Math.max(0, Math.min(1, f));
      const g = o + h * f - t, _ = a + u * f - e, m = g * g + _ * _;
      m < i && (i = m);
    }
    return Math.sqrt(i);
  }
  boundsFromSamples() {
    const t = this.samples;
    It.minx = 1 / 0, It.miny = 1 / 0, It.maxx = -1 / 0, It.maxy = -1 / 0;
    for (let e = 0; e + 2 < t.length; e += 3) It.minx = Math.min(It.minx, t[e]), It.miny = Math.min(It.miny, t[e + 1]), It.maxx = Math.max(It.maxx, t[e]), It.maxy = Math.max(It.maxy, t[e + 1]);
    return It;
  }
  dispose() {
    this.object3D.geometry.dispose();
  }
}
class Ue extends zs {
  constructor(t, e) {
    super(), this.closed = e, this.kind = "polyline";
    for (const n of t) this.points.push(new b(n.x, n.y, 0));
    this.rebuild();
  }
  fillSamples() {
    const t = this.points.length + (this.closed ? 1 : 0), e = new Float32Array(t * 3);
    for (let n = 0; n < t; n++) {
      const i = this.points[n % this.points.length];
      e[n * 3] = i.x, e[n * 3 + 1] = i.y;
    }
    return e;
  }
  makeCopy(t) {
    const e = new Ue(this.points.map((n) => new b(n.x + t.x, n.y + t.y, 0)), this.closed);
    return e.layer = this.layer, e;
  }
  toJSON() {
    const t = [];
    for (const e of this.points) t.push(e.x, e.y);
    return { k: "pl", pts: t, closed: this.closed, l: this.layer };
  }
}
const Io = 72;
class ti extends zs {
  constructor(t, e) {
    super(), this.kind = "circle", this.points.push(new b(t.x, t.y, 0)), this.radius = Math.max(1e-4, e), this.rebuild();
  }
  fillSamples() {
    const t = this.points[0], e = new Float32Array((Io + 1) * 3);
    for (let n = 0; n <= Io; n++) {
      const i = n / Io * Math.PI * 2;
      e[n * 3] = t.x + Math.cos(i) * this.radius, e[n * 3 + 1] = t.y + Math.sin(i) * this.radius;
    }
    return e;
  }
  hitDistance(t, e) {
    const n = this.points[0];
    return Math.abs(Math.hypot(t - n.x, e - n.y) - this.radius);
  }
  onScaled(t) {
    this.radius *= Math.abs(t);
  }
  getBounds() {
    const t = this.points[0];
    return It.minx = t.x - this.radius, It.miny = t.y - this.radius, It.maxx = t.x + this.radius, It.maxy = t.y + this.radius, It;
  }
  makeCopy(t) {
    const e = new ti(new b(this.points[0].x + t.x, this.points[0].y + t.y, 0), this.radius);
    return e.layer = this.layer, e;
  }
  toJSON() {
    return { k: "ci", c: [this.points[0].x, this.points[0].y], r: this.radius, l: this.layer };
  }
}
const Uo = 64;
class kn extends zs {
  constructor(t, e, n, i) {
    super(), this.kind = "arc", this.points.push(new b(t.x, t.y, 0)), this.radius = Math.max(1e-4, e), this.a0 = n, this.sweep = i, this.rebuild();
  }
  fillSamples() {
    const t = this.points[0], e = new Float32Array((Uo + 1) * 3);
    for (let n = 0; n <= Uo; n++) {
      const i = this.a0 + this.sweep * n / Uo;
      e[n * 3] = t.x + Math.cos(i) * this.radius, e[n * 3 + 1] = t.y + Math.sin(i) * this.radius;
    }
    return e;
  }
  onRotated(t) {
    this.a0 += t;
  }
  onScaled(t) {
    this.radius *= Math.abs(t);
  }
  onMirrored(t) {
    this.a0 = 2 * t - this.a0, this.sweep = -this.sweep;
  }
  getBounds() {
    return this.boundsFromSamples();
  }
  makeCopy(t) {
    const e = new kn(new b(this.points[0].x + t.x, this.points[0].y + t.y, 0), this.radius, this.a0, this.sweep);
    return e.layer = this.layer, e;
  }
  toJSON() {
    return { k: "ar", c: [this.points[0].x, this.points[0].y], r: this.radius, a0: this.a0, sw: this.sweep, l: this.layer };
  }
}
const Fo = 72;
class ps extends zs {
  constructor(t, e, n, i = 0) {
    super(), this.kind = "ellipse", this.points.push(new b(t.x, t.y, 0)), this.rx = Math.max(1e-4, e), this.ry = Math.max(1e-4, n), this.rot = i, this.rebuild();
  }
  fillSamples() {
    const t = this.points[0], e = Math.cos(this.rot), n = Math.sin(this.rot), i = new Float32Array((Fo + 1) * 3);
    for (let r = 0; r <= Fo; r++) {
      const o = r / Fo * Math.PI * 2, a = this.rx * Math.cos(o), l = this.ry * Math.sin(o);
      i[r * 3] = t.x + a * e - l * n, i[r * 3 + 1] = t.y + a * n + l * e;
    }
    return i;
  }
  onRotated(t) {
    this.rot += t;
  }
  onScaled(t) {
    this.rx *= Math.abs(t), this.ry *= Math.abs(t);
  }
  onMirrored(t) {
    this.rot = 2 * t - this.rot;
  }
  getBounds() {
    return this.boundsFromSamples();
  }
  makeCopy(t) {
    const e = new ps(new b(this.points[0].x + t.x, this.points[0].y + t.y, 0), this.rx, this.ry, this.rot);
    return e.layer = this.layer, e;
  }
  toJSON() {
    return { k: "el", c: [this.points[0].x, this.points[0].y], rx: this.rx, ry: this.ry, rot: this.rot, l: this.layer };
  }
}
class ms extends _h {
  constructor(t, e, n = 0.35, i = 0) {
    super(), this.text = e, this.kind = "text", this.points.push(new b(t.x, t.y, 0)), this.height = n, this.baseHeight = n, this.rotation = i;
    const r = document.createElement("canvas"), o = '600 96px "Segoe UI", system-ui, sans-serif';
    let a = r.getContext("2d");
    a.font = o, r.width = Math.max(32, Math.ceil(a.measureText(e).width) + 16), r.height = 128, a = r.getContext("2d"), a.font = o, a.fillStyle = "#ffffff", a.textBaseline = "middle", a.fillText(e, 8, 64);
    const l = new $a(r);
    l.colorSpace = De, l.anisotropy = 4, this.aspect = r.width / r.height;
    const c = this.baseHeight * this.aspect, h = new Ti(c, this.baseHeight);
    h.translate(c / 2, this.baseHeight / 2, 0), this.material = new Ei({ map: l, transparent: true, side: ze, depthWrite: false }), this.object3D = new He(h, this.material), this.object3D.userData.entity = this, this.object3D.renderOrder = 2, this.rebuild();
  }
  get width() {
    return this.height * this.aspect;
  }
  rebuild() {
    const t = this.height / this.baseHeight;
    this.object3D.position.set(this.points[0].x, this.points[0].y, 2e-3), this.object3D.rotation.z = this.rotation, this.object3D.scale.set(t, t, 1);
  }
  setPreviewOffset(t) {
    this.object3D.position.set(this.points[0].x + t.x, this.points[0].y + t.y, 2e-3);
  }
  setPreviewTransform(t, e, n, i) {
    const r = Math.cos(t), o = Math.sin(t), a = this.points[0].x - i.x, l = this.points[0].y - i.y, c = this.height / this.baseHeight;
    this.object3D.rotation.z = t + this.rotation, this.object3D.scale.set(e * c, n * c, 1), this.object3D.position.set(i.x + r * e * a - o * n * l, i.y + o * e * a + r * n * l, 2e-3);
  }
  applyLayer(t) {
    this.material.color.set(this.selected ? "#38bdf8" : t.color);
  }
  hitDistance(t, e) {
    const n = this.getBounds(), i = Math.max(n.minx - t, 0, t - n.maxx), r = Math.max(n.miny - e, 0, e - n.maxy);
    return Math.hypot(i, r);
  }
  onRotated(t) {
    this.rotation += t;
  }
  onScaled(t) {
    this.height *= Math.abs(t);
  }
  onMirrored(t) {
    this.rotation = 2 * t - this.rotation;
  }
  getBounds() {
    const t = this.points[0];
    return It.minx = t.x, It.miny = t.y, It.maxx = t.x + this.width, It.maxy = t.y + this.height, It;
  }
  makeCopy(t) {
    const e = new ms(new b(this.points[0].x + t.x, this.points[0].y + t.y, 0), this.text, this.height, this.rotation);
    return e.layer = this.layer, e;
  }
  toJSON() {
    return { k: "tx", a: [this.points[0].x, this.points[0].y], t: this.text, h: this.height, rot: this.rotation, l: this.layer };
  }
  dispose() {
    var _a2;
    this.object3D.geometry.dispose(), (_a2 = this.material.map) == null ? void 0 : _a2.dispose(), this.material.dispose();
  }
}
const mn = 0.035;
class Ai extends zs {
  constructor(t, e = "", n = null) {
    super(), this.kind = "point", this.labelMesh = null, this.labelMat = null, this.points.push(new b(t.x, t.y, 0)), this.label = e, this.deviation = n, this.rebuild(), e && this.buildLabel();
  }
  fillSamples() {
    const t = this.points[0];
    return new Float32Array([t.x - mn, t.y, 0, t.x, t.y + mn, 0, t.x + mn, t.y, 0, t.x, t.y - mn, 0, t.x - mn, t.y, 0]);
  }
  buildLabel() {
    const t = document.createElement("canvas"), e = '600 64px "Segoe UI", system-ui, sans-serif';
    let n = t.getContext("2d");
    n.font = e, t.width = Math.ceil(n.measureText(this.label).width) + 12, t.height = 80, n = t.getContext("2d"), n.font = e, n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(this.label, 6, 42);
    const i = new $a(t);
    i.colorSpace = De, i.anisotropy = 4;
    const r = 0.11, o = r * t.width / t.height, a = new Ti(o, r);
    a.translate(o / 2 + mn * 1.6, r / 2, 0), this.labelMat = new Ei({ map: i, transparent: true, side: ze, depthWrite: false }), this.labelMesh = new He(a, this.labelMat), this.labelMesh.renderOrder = 2, this.labelMesh.layers.set(3), this.object3D.add(this.labelMesh), this.placeLabel();
  }
  placeLabel() {
    this.labelMesh && this.labelMesh.position.set(this.points[0].x, this.points[0].y, 2e-3);
  }
  rebuild() {
    super.rebuild(), this.placeLabel();
  }
  applyLayer(t) {
    var _a2;
    super.applyLayer(t), (_a2 = this.labelMat) == null ? void 0 : _a2.color.set(this.selected ? "#38bdf8" : t.color);
  }
  getBounds() {
    const t = this.points[0];
    return It.minx = t.x - mn, It.miny = t.y - mn, It.maxx = t.x + mn, It.maxy = t.y + mn, It;
  }
  makeCopy(t) {
    const e = new Ai(new b(this.points[0].x + t.x, this.points[0].y + t.y, 0), this.label, this.deviation);
    return e.layer = this.layer, e;
  }
  toJSON() {
    return { k: "pt", a: [this.points[0].x, this.points[0].y], lbl: this.label || void 0, dev: this.deviation ?? void 0, l: this.layer };
  }
  dispose() {
    var _a2, _b, _c2, _d2;
    super.dispose(), (_a2 = this.labelMesh) == null ? void 0 : _a2.geometry.dispose(), (_c2 = (_b = this.labelMat) == null ? void 0 : _b.map) == null ? void 0 : _c2.dispose(), (_d2 = this.labelMat) == null ? void 0 : _d2.dispose();
  }
}
const Ts = new b();
function O_(s) {
  let t = null;
  switch (s.k) {
    case "pl": {
      const e = [];
      for (let n = 0; n + 1 < s.pts.length; n += 2) e.push(new b(s.pts[n], s.pts[n + 1], 0));
      t = e.length >= 2 ? new Ue(e, s.closed) : null;
      break;
    }
    case "ci":
      t = new ti(Ts.set(s.c[0], s.c[1], 0), s.r);
      break;
    case "ar":
      t = new kn(Ts.set(s.c[0], s.c[1], 0), s.r, s.a0, s.sw);
      break;
    case "el":
      t = new ps(Ts.set(s.c[0], s.c[1], 0), s.rx, s.ry, s.rot);
      break;
    case "tx":
      t = new ms(Ts.set(s.a[0], s.a[1], 0), s.t, s.h, s.rot);
      break;
    case "pt":
      t = new Ai(Ts.set(s.a[0], s.a[1], 0), s.lbl ?? "", s.dev ?? null);
      break;
  }
  return t && (t.layer = s.l ?? "0"), t;
}
class B_ {
  constructor(t) {
    this.parent = t, this.entities = [], this.selection = /* @__PURE__ */ new Set(), this.pickables = [], this.onChange = null, this.activeUcsIndex = -1, this.homeUcs = /* @__PURE__ */ new Map();
  }
  add(t, e = this.activeUcsIndex) {
    var _a2;
    t.object3D.layers.set(3), this.entities.push(t), this.pickables.push(t.object3D), this.parent.add(t.object3D), this.homeUcs.set(t, e), t.object3D.visible = e === this.activeUcsIndex && e >= 0, t.object3D.visible && t.refreshAppearance(), (_a2 = this.onChange) == null ? void 0 : _a2.call(this);
  }
  remove(t) {
    var _a2;
    const e = this.entities.indexOf(t);
    e >= 0 && this.entities.splice(e, 1);
    const n = this.pickables.indexOf(t.object3D);
    n >= 0 && this.pickables.splice(n, 1), this.selection.delete(t), this.homeUcs.delete(t), this.parent.remove(t.object3D), t.dispose(), (_a2 = this.onChange) == null ? void 0 : _a2.call(this);
  }
  select(t, e) {
    var _a2;
    e || this.clearSelection(), t.setSelected(true), this.selection.add(t), (_a2 = this.onChange) == null ? void 0 : _a2.call(this);
  }
  toggle(t) {
    var _a2;
    t.selected ? (t.setSelected(false), this.selection.delete(t)) : (t.setSelected(true), this.selection.add(t)), (_a2 = this.onChange) == null ? void 0 : _a2.call(this);
  }
  clearSelection() {
    var _a2;
    for (const t of this.selection) t.setSelected(false);
    this.selection.clear(), (_a2 = this.onChange) == null ? void 0 : _a2.call(this);
  }
  deleteSelected() {
    const t = [...this.selection];
    for (const e of t) this.remove(e);
    return t.length;
  }
  selectionLayer() {
    let t = null;
    for (const e of this.selection) if (t === null) t = e.layer;
    else if (t !== e.layer) return null;
    return t;
  }
  countOnLayer(t) {
    let e = 0;
    for (const n of this.entities) n.layer === t && e++;
    return e;
  }
  refreshAll() {
    for (const t of this.entities) t.refreshAppearance();
  }
  reassignLayer(t, e) {
    for (const n of this.entities) n.layer === t && (n.layer = e);
    this.refreshAll();
  }
  renameLayerRefs(t, e) {
    for (const n of this.entities) n.layer === t && (n.layer = e);
  }
  refreshUcsVisibility(t) {
    this.activeUcsIndex = t;
    for (const e of this.entities) t >= 0 && this.homeUcs.get(e) === t ? e.refreshAppearance() : e.object3D.visible = false;
    for (const e of [...this.selection]) e.object3D.visible || this.toggle(e);
  }
  serialize() {
    return JSON.stringify(this.entities.map((t) => ({ u: this.homeUcs.get(t) ?? -1, j: t.toJSON() })));
  }
  restore(t) {
    this.clearAll();
    const e = JSON.parse(t);
    for (const n of e) {
      const i = O_(n.j);
      i && this.add(i, n.u);
    }
  }
  clearAll() {
    for (const t of [...this.entities]) this.remove(t);
  }
}
const z_ = "#38bdf8", Er = 1.6, k_ = 3.2, wc = ["#dde6ff", "#f87171", "#fbbf24", "#4ade80", "#38bdf8", "#a78bfa", "#f472b6", "#fb923c"];
function H_(s) {
  switch (s) {
    case "dashed":
      return { dashSize: 0.3, gapSize: 0.15 };
    case "dotted":
      return { dashSize: 0.04, gapSize: 0.12 };
    case "dashdot":
      return { dashSize: 0.65, gapSize: 0.3 };
    default:
      return { dashSize: 1, gapSize: 0 };
  }
}
class V_ {
  constructor() {
    this.layers = [], this.current = "0", this.showWeight = true, this.add("0");
  }
  get(t) {
    return this.layers.find((e) => e.name === t) ?? this.layers[0];
  }
  has(t) {
    return this.layers.some((e) => e.name === t);
  }
  get currentLayer() {
    return this.get(this.current);
  }
  add(t) {
    let e = t;
    if (!e) {
      let i = this.layers.length;
      do
        e = `\u0421\u043B\u043E\u0439 ${i++}`;
      while (this.has(e));
    }
    const n = { name: e, color: wc[this.layers.length % wc.length], linetype: "solid", weight: 0.25, visible: true, mat: new Sn({ linewidth: Er }), matSel: new Sn({ linewidth: Er }) };
    return this.layers.push(n), this.applyLayer(n), n;
  }
  remove(t) {
    if (t === "0") return false;
    const e = this.layers.findIndex((i) => i.name === t);
    if (e < 0) return false;
    const [n] = this.layers.splice(e, 1);
    return n.mat.dispose(), n.matSel.dispose(), this.current === t && (this.current = "0"), true;
  }
  rename(t, e) {
    if (t === "0" || !e || this.has(e)) return false;
    const n = this.layers.find((i) => i.name === t);
    return n ? (n.name = e, this.current === t && (this.current = e), true) : false;
  }
  applyMaterials() {
    for (const t of this.layers) this.applyLayer(t);
  }
  applyLayer(t) {
    const e = this.showWeight ? Math.max(Er, t.weight * k_) : Er, n = H_(t.linetype);
    for (const i of [t.mat, t.matSel]) i.linewidth = e, i.dashed = t.linetype !== "solid", i.dashSize = n.dashSize, i.gapSize = n.gapSize, i.needsUpdate = true;
    t.mat.color.set(t.color), t.matSel.color.set(z_);
  }
  setResolution(t, e) {
    for (const n of this.layers) n.mat.resolution.set(t, e), n.matSel.resolution.set(t, e);
  }
  serialize() {
    return JSON.stringify({ current: this.current, showWeight: this.showWeight, layers: this.layers.map(({ name: t, color: e, linetype: n, weight: i, visible: r }) => ({ name: t, color: e, linetype: n, weight: i, visible: r })) });
  }
  restore(t) {
    let e;
    try {
      e = JSON.parse(t);
    } catch {
      return false;
    }
    if (!e.layers || !e.layers.length) return false;
    for (const n of this.layers) n.mat.dispose(), n.matSel.dispose();
    this.layers.length = 0;
    for (const n of e.layers) {
      if (!n.name || this.has(n.name)) continue;
      const i = this.add(n.name);
      i.color = n.color ?? i.color, i.linetype = n.linetype ?? "solid", i.weight = typeof n.weight == "number" ? n.weight : 0.25, i.visible = n.visible !== false;
    }
    return this.has("0") || this.add("0"), this.current = e.current && this.has(e.current) ? e.current : "0", this.showWeight = e.showWeight !== false, this.applyMaterials(), true;
  }
}
const vh = 64, xh = `
  uniform float uSize;
  uniform float uIsPersp;
  uniform mat4  uUcsInv;
  uniform float uSectionEnabled;
  uniform vec3  uBoxMin;
  uniform vec3  uBoxMax;
  uniform float uFacadeClip;
  uniform float uFacadeMin;
  uniform float uFacadeMax;
  uniform float uRegionClip;
  uniform vec2  uRegionMin;
  uniform vec2  uRegionMax;
  uniform float uCurClip;
  uniform vec3  uCurPos;
  uniform float uCurHalf;
  uniform float uPlanClip;
  uniform float uPlanMin;
  uniform float uPlanMax;
  uniform float uDensity;  // 0..1 \u2014 keep points whose key falls below it
  uniform float uMode;     // 0 = RGB, 1 = intensity (grayscale), 2 = height ramp
  uniform float uMinY;
  uniform float uYRangeInv;

  attribute vec3  aColor;
  // The compact wall buffer decimates by KEY (drawRange is busy carrying the
  // spatial tile range there); the leaf chunks decimate by drawRange PREFIX
  // and skip the attribute entirely \u2014 one shader, two materials.
  #ifdef USE_AKEY
  attribute float aKey;    // stable per-point random in [0,1) \u2014 see Engine
  #endif
  #ifdef USE_QUANT
  // \u041B\u0438\u0441\u0442 \u0445\u0440\u0430\u043D\u0438\u0442 \u043F\u043E\u0437\u0438\u0446\u0438\u0438 \u0432 uint16 \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0421\u0412\u041E\u0415\u0419 \u043A\u043E\u0440\u043E\u0431\u043A\u0438: 6 \u0431\u0430\u0439\u0442 \u0432\u043C\u0435\u0441\u0442\u043E
  // 12 \u0438 \u0432 \u043A\u0443\u0447\u0435, \u0438 \u043D\u0430 GPU. \u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u2014 \u043E\u0434\u0438\u043D madd \u043D\u0430 \u0432\u0435\u0440\u0448\u0438\u043D\u0443; \u0448\u0430\u0433 \u0441\u0435\u0442\u043A\u0438
  // \u043D\u0430 30-\u043C\u0435\u0442\u0440\u043E\u0432\u043E\u043C \u043B\u0438\u0441\u0442\u0435 ~0.5 \u043C\u043C, \u0433\u043B\u0443\u0431\u0436\u0435 \u0448\u0443\u043C\u0430 \u0441\u0430\u043C\u043E\u0433\u043E \u0441\u043A\u0430\u043D\u0435\u0440\u0430.
  uniform vec3 uQMin;
  uniform vec3 uQScale;
  #endif

  varying vec3  vColor;
  varying float vKill;

  void main() {
    #ifdef USE_AKEY
    vKill = aKey < uDensity ? 0.0 : 1.0;
    #else
    vKill = 0.0;
    #endif

    #ifdef USE_QUANT
    vec4 wp = modelMatrix * vec4(uQMin + position * uQScale, 1.0);
    #else
    vec4 wp = modelMatrix * vec4(position, 1.0);
    #endif

    vec3 col = aColor;
    if (uMode > 1.5) {
      float t = clamp((wp.y - uMinY) * uYRangeInv, 0.0, 1.0);
      if (t < 0.5) col = mix(vec3(0.15, 0.35, 0.9), vec3(0.2, 0.85, 0.4), t * 2.0);
      else col = mix(vec3(0.2, 0.85, 0.4), vec3(0.95, 0.35, 0.2), t * 2.0 - 1.0);
    } else if (uMode > 0.5) {
      col = vec3(dot(aColor, vec3(0.299, 0.587, 0.114)));
    }
    vColor = col;


    // Plan slice runs in WORLD height: it is used before any UCS exists.
    if (uPlanClip > 0.5 && (wp.y < uPlanMin || wp.y > uPlanMax)) vKill = 1.0;

    if ((uSectionEnabled > 0.5 || uCurClip > 0.5 || uFacadeClip > 0.5 || uRegionClip > 0.5) && vKill < 0.5) {
      vec3 lp = (uUcsInv * wp).xyz;
      if (uSectionEnabled > 0.5 && (any(lessThan(lp, uBoxMin)) || any(greaterThan(lp, uBoxMax)))) vKill = 1.0;
      // Facade depth slice: keep only the slab at the chosen UCS depth, so
      // reveals/recesses read cleanly and snapping can target them.
      if (uFacadeClip > 0.5 && (lp.z < uFacadeMin || lp.z > uFacadeMax)) vKill = 1.0;
      // \u041E\u0431\u043B\u0430\u0441\u0442\u044C \u043F\u043E\u0438\u0441\u043A\u0430: \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u043C \u043F\u043E \u043A\u0443\u0441\u043A\u0443 \u2014 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u0444\u0430\u0441\u0430\u0434 \u043D\u0435 \u043E\u0442\u0432\u043B\u0435\u043A\u0430\u0435\u0442.
      if (uRegionClip > 0.5 && (any(lessThan(lp.xy, uRegionMin)) || any(greaterThan(lp.xy, uRegionMax)))) vKill = 1.0;
      // Economical iso view: show the cloud only in a box around the cursor.
      if (uCurClip > 0.5 && (abs(lp.x - uCurPos.x) > uCurHalf || abs(lp.y - uCurPos.y) > uCurHalf)) vKill = 1.0;
    }

    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;

    // Perspective: mild distance attenuation only (0.5\xD7..1.5\xD7), so the
    // per-viewport size slider stays in charge \u2014 the old hard clamp to
    // 4 px saturated at close range and the slider had no visible effect.
    float size = uSize;
    if (uIsPersp > 0.5) size *= clamp(60.0 / max(1.0, -mv.z), 0.5, 1.5);
    gl_PointSize = clamp(size, 0.5, 8.0);

    // Collapse culled points outside clip space: rejected before
    // rasterization, so per-frame clipping is effectively free.
    if (vKill > 0.5) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  }
`, yh = `
  precision highp float;

  uniform float uOpacity;

  varying vec3  vColor;
  varying float vKill;

  void main() {
    if (vKill > 0.5) discard;               // clip-box / lasso safety net
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;          // round sprites
    gl_FragColor = vec4(vColor, uOpacity);
  }
`;
function G_() {
  const s = { uSize: { value: 2 }, uIsPersp: { value: 0 }, uUcsInv: { value: new Jt() }, uSectionEnabled: { value: 0 }, uBoxMin: { value: new b(-1e6, -1e6, -0.2) }, uBoxMax: { value: new b(1e6, 1e6, 0.2) }, uFacadeClip: { value: 0 }, uFacadeMin: { value: -1e6 }, uFacadeMax: { value: 1e6 }, uRegionClip: { value: 0 }, uRegionMin: { value: new Mt(-1e6, -1e6) }, uRegionMax: { value: new Mt(1e6, 1e6) }, uCurClip: { value: 0 }, uCurPos: { value: new b() }, uCurHalf: { value: 25 }, uPlanClip: { value: 0 }, uPlanMin: { value: -1e6 }, uPlanMax: { value: 1e6 }, uOpacity: { value: 1 }, uDensity: { value: 1 }, uMode: { value: 0 }, uMinY: { value: 0 }, uYRangeInv: { value: 1 } };
  return { material: new dn({ uniforms: s, defines: { USE_AKEY: 1 }, vertexShader: xh, fragmentShader: yh, transparent: true }), uniforms: s };
}
function W_(s, t, e) {
  return new dn({ uniforms: { ...s, uQMin: { value: t }, uQScale: { value: e } }, defines: { USE_QUANT: 1 }, vertexShader: xh, fragmentShader: yh, transparent: true });
}
const X_ = 15;
class Y_ {
  constructor() {
    this.world = new b(), this.local = new b(), this.rawLocal = new b(), this.snapLocal = new b(), this.snapped = false, this.clientX = 0, this.clientY = 0, this.valid = false;
  }
}
const q_ = { shiftKey: false, button: 0 }, No = 512;
class ei {
  constructor(t, e) {
    const n = new me();
    this.attr = new ce(new Float32Array(No * 3), 3), n.setAttribute("position", this.attr), n.setDrawRange(0, 0), this.line = new ah(n, new ds({ color: e, transparent: true, opacity: 0.9 })), this.line.frustumCulled = false, this.line.visible = false, this.line.layers.set(3), t.add(this.line);
  }
  writeXYZ(t, e, n, i) {
    const r = this.attr.array;
    r[t * 3] = e, r[t * 3 + 1] = n, r[t * 3 + 2] = i;
  }
  commit(t) {
    this.attr.needsUpdate = true, this.line.geometry.setDrawRange(0, t), this.line.visible = t >= 2;
  }
  setPath(t, e, n = false) {
    let i = 0;
    for (let r = 0; r < t.length && i < No - 2; r++, i++) this.writeXYZ(i, t[r].x, t[r].y, t[r].z);
    e && i < No - 1 && this.writeXYZ(i++, e.x, e.y, e.z), n && i >= 3 && this.writeXYZ(i++, t[0].x, t[0].y, t[0].z), this.commit(i);
  }
  setCircle(t, e) {
    for (let i = 0; i <= 72; i++) {
      const r = i / 72 * Math.PI * 2;
      this.writeXYZ(i, t.x + Math.cos(r) * e, t.y + Math.sin(r) * e, 0);
    }
    this.commit(73);
  }
  setArc(t, e, n, i, r) {
    for (let a = 0; a <= 48; a++) {
      const l = i + r * a / 48;
      this.writeXYZ(a, t + Math.cos(l) * n, e + Math.sin(l) * n, 0);
    }
    this.commit(49);
  }
  setEllipse(t, e, n) {
    for (let r = 0; r <= 64; r++) {
      const o = r / 64 * Math.PI * 2;
      this.writeXYZ(r, t.x + Math.cos(o) * e, t.y + Math.sin(o) * n, 0);
    }
    this.commit(65);
  }
  setRect(t, e) {
    this.writeXYZ(0, t.x, t.y, 0), this.writeXYZ(1, e.x, t.y, 0), this.writeXYZ(2, e.x, e.y, 0), this.writeXYZ(3, t.x, e.y, 0), this.writeXYZ(4, t.x, t.y, 0), this.commit(5);
  }
  hide() {
    this.commit(0);
  }
}
class ye {
  constructor(t, e) {
    this.host = t, this.mgr = e, this.numericSuffix = "\u043C";
  }
  canArm() {
    return null;
  }
  activate() {
  }
  deactivate() {
  }
  onDown(t, e) {
  }
  onMove(t, e) {
  }
  onUp(t, e) {
  }
  onFinish() {
  }
  onKey(t) {
    return false;
  }
  getOrthoAnchor() {
    return null;
  }
  getDynamicAnchor() {
    return this.getOrthoAnchor();
  }
  onNumeric(t) {
    return false;
  }
}
const br = new Mt(), Tc = new b(), ts = new b(), As = new b(), Cs = new b(), gn = new b(), $i = new b(), $_ = new b(), Qe = new b(), Oo = new Mt(), Bo = new Mt(), Ac = new Bn(), zo = new Bn(), Rs = [new b(), new b(), new b(), new b()], _n = { r: 0, a0: 0, sweep: 0 };
function j_(s, t, e, n) {
  const i = 2 * (s.x * (t.y - e.y) + t.x * (e.y - s.y) + e.x * (s.y - t.y));
  if (Math.abs(i) < 1e-9) return false;
  const r = s.x * s.x + s.y * s.y, o = t.x * t.x + t.y * t.y, a = e.x * e.x + e.y * e.y;
  return n.set((r * (t.y - e.y) + o * (e.y - s.y) + a * (s.y - t.y)) / i, (r * (e.x - t.x) + o * (s.x - e.x) + a * (t.x - s.x)) / i, 0), true;
}
function Cc(s, t, e) {
  if (!j_(s, t, e, Qe)) return false;
  const n = Math.PI * 2;
  _n.r = Math.hypot(s.x - Qe.x, s.y - Qe.y);
  const i = Math.atan2(s.y - Qe.y, s.x - Qe.x), r = Math.atan2(t.y - Qe.y, t.x - Qe.x), a = ((Math.atan2(e.y - Qe.y, e.x - Qe.x) - i) % n + n) % n, l = ((r - i) % n + n) % n;
  return _n.a0 = i, _n.sweep = l <= a ? a : a - n, _n.r > 1e-4;
}
function Sh(s, t) {
  const e = new Dn();
  for (const n of s) {
    const i = n.object3D.clone(true);
    i.traverse((r) => {
      const o = r;
      o.isLine2 ? o.material = gh : o.isLine ? o.material = F_ : o.isMesh && (o.material = N_);
    }), e.add(i);
  }
  return t.add(e), e;
}
const _Ka = class _Ka {
  constructor(t) {
    this.host = t, this.pointer = new Y_(), this.raycaster = new Ed(), this.tools = /* @__PURE__ */ new Map(), this.sBest = 0, this.sFound = false, this.active = null, this.lastCommand = null, this.viewport = null, this.shiftHeld = false, this.numBuffer = "";
    const e = new Xr();
    e.setPositions([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0]), this.markerMat = new Sn({ color: 2883486, linewidth: 2.6, depthTest: false, transparent: true }), this.marker = new mh(e, this.markerMat), this.marker.renderOrder = 4, this.marker.frustumCulled = false, this.marker.visible = false, t.ucs.group.add(this.marker);
    const n = new me();
    n.setAttribute("position", new ce(new Float32Array([-1, 0, 0, 1, 0, 0, 0, -1, 0, 0, 1, 0]), 3)), this.cross = new qa(n, new ds({ color: 12571376, transparent: true, opacity: 0.95, depthTest: false })), this.cross.renderOrder = 4, this.cross.frustumCulled = false, this.cross.visible = false, this.cross.layers.set(5), t.ucs.group.add(this.cross);
    for (const i of [new Z_(t, this), new K_(t, this), new J_(t, this), new c0(t, this), new Mh(t, this), new h0(t, this), new u0(t, this), new d0(t, this), new f0(t, this), new v0(t, this), new x0(t, this), new Q_(t, this), new t0(t, this), new e0(t, this), new n0(t, this), new i0(t, this), new s0(t, this), new r0(t, this), new o0(t, this), new a0(t, this), new l0(t, this)]) this.tools.set(i.id, i);
  }
  get ray() {
    return this.raycaster.ray;
  }
  get orthoActive() {
    return this.host.orthoOn !== this.shiftHeld;
  }
  addTool(t) {
    this.tools.set(t.id, t);
  }
  activate(t) {
    var _a2;
    const e = this.tools.get(t);
    if (!e || e === this.active) return;
    if (_Ka.DRAFT_IDS.has(t) && !this.host.canDraft()) {
      this.host.ui.setHint("\u0412 \u041C\u0421\u041A \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u0435 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u2014 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u041F\u0421\u041A \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u0441\u043F\u0440\u0430\u0432\u0430");
      return;
    }
    const n = e.canArm();
    if (n) {
      this.host.ui.setHint(n);
      return;
    }
    (_a2 = this.active) == null ? void 0 : _a2.deactivate(), this.clearNumBuffer(), this.active = e, e.activate(), t !== "select" && (this.lastCommand = t), this.host.ui.setActiveTool(t), this.host.ui.setHint(e.hint);
  }
  repeatLast() {
    this.lastCommand && this.activate(this.lastCommand);
  }
  resetActive() {
    this.active && (this.active.deactivate(), this.clearNumBuffer(), this.active.activate());
  }
  pointerDown(t, e) {
    var _a2;
    this.shiftHeld = t.shiftKey, this.computePointer(t, e), this.pointer.valid && ((_a2 = this.active) == null ? void 0 : _a2.onDown(this.pointer, t));
  }
  pointerMove(t, e) {
    var _a2;
    this.shiftHeld = t.shiftKey, this.computePointer(t, e), this.pointer.valid && ((_a2 = this.active) == null ? void 0 : _a2.onMove(this.pointer, t));
  }
  pointerUp(t, e) {
    var _a2;
    this.computePointer(t, e), (_a2 = this.active) == null ? void 0 : _a2.onUp(this.pointer, t);
  }
  finish() {
    var _a2;
    (_a2 = this.active) == null ? void 0 : _a2.onFinish();
  }
  key(t) {
    var _a2, _b;
    return ((_a2 = this.active) == null ? void 0 : _a2.onKey(t)) ? true : t.key === "Enter" ? (this.active && this.active.id === "select" ? this.repeatLast() : (_b = this.active) == null ? void 0 : _b.onFinish(), true) : false;
  }
  handleNumKey(t) {
    var _a2;
    if (/^[0-9]$/.test(t.key) || t.key === "." || t.key === "," || t.key === "-") return ((_a2 = this.active) == null ? void 0 : _a2.getDynamicAnchor()) ? (this.numBuffer += t.key, this.updateDynBox(), true) : false;
    if (!this.numBuffer) return false;
    if (t.key === "Backspace") return this.numBuffer = this.numBuffer.slice(0, -1), this.updateDynBox(), true;
    if (t.key === "Enter") {
      const e = this.numBuffer;
      return this.clearNumBuffer(), this.applyNumeric(e), true;
    }
    return t.key === "Escape" ? (this.clearNumBuffer(), true) : false;
  }
  clearNumBuffer() {
    this.numBuffer = "", this.host.ui.hideDynInput();
  }
  updateDynBox() {
    var _a2;
    this.numBuffer ? this.host.ui.showDynInput(this.pointer.clientX + 18, this.pointer.clientY + 18, this.numBuffer, ((_a2 = this.active) == null ? void 0 : _a2.numericSuffix) ?? "") : this.host.ui.hideDynInput();
  }
  applyNumeric(t) {
    const e = this.active;
    if (!e) return;
    const n = e.getDynamicAnchor();
    if (!n) return;
    if (t.includes(",")) {
      const [r, o] = t.split(","), a = parseFloat(r), l = parseFloat(o);
      if (!isFinite(a) || !isFinite(l)) return;
      gn.set(n.x + a, n.y + l, 0), this.synthClick(gn);
      return;
    }
    const i = parseFloat(t);
    isFinite(i) && (e.onNumeric(i) || ($i.subVectors(this.pointer.local, n), $i.z = 0, $i.lengthSq() < 1e-12 && $i.set(1, 0, 0), $i.normalize(), gn.copy(n).addScaledVector($i, i), this.synthClick(gn)));
  }
  synthClick(t) {
    var _a2;
    const e = this.pointer;
    e.local.copy(t), e.rawLocal.copy(t), e.snapped = false, e.valid = true, this.host.ucs.defined ? this.host.ucs.localToWorld(e.local, e.world) : e.world.copy(e.local), (_a2 = this.active) == null ? void 0 : _a2.onDown(e, q_);
  }
  computePointer(t, e) {
    const n = this.pointer, i = this.host.ucs;
    if (this.viewport = e, n.clientX = t.clientX, n.clientY = t.clientY, this.host.vpm.ndcInto(e, t.clientX, t.clientY, br), this.raycaster.setFromCamera(br, e.camera), n.valid = this.raycaster.ray.intersectPlane(i.plane, n.world) !== null, !n.valid) {
      this.marker.visible = false;
      return;
    }
    const r = i.defined && this.host.canDraft();
    if (r ? (i.worldToLocal(n.world, n.rawLocal), n.rawLocal.z = 0) : n.rawLocal.copy(n.world), n.local.copy(n.rawLocal), n.snapped = false, this.host.snapOn && r && e.name !== "profile") {
      const a = X_ * this.host.vpm.worldPerPixel(e);
      let l = 1 / 0;
      if (this.host.snap.query(n.rawLocal.x, n.rawLocal.y, a, n.snapLocal, this.host.snapZMin, this.host.snapZMax)) {
        const h = n.snapLocal.x - n.rawLocal.x, u = n.snapLocal.y - n.rawLocal.y;
        l = h * h + u * u;
      }
      this.snapToEntities(n.rawLocal.x, n.rawLocal.y, a, gn) && this.sBest < l ? (n.snapped = true, n.snapLocal.set(gn.x, gn.y, 0), n.local.set(gn.x, gn.y, 0)) : l < 1 / 0 && (n.snapped = true, n.local.set(n.snapLocal.x, n.snapLocal.y, 0));
    }
    const o = this.active ? this.active.getOrthoAnchor() : null;
    o && this.orthoActive && (Math.abs(n.local.x - o.x) >= Math.abs(n.local.y - o.y) ? n.local.y = o.y : n.local.x = o.x), r && i.localToWorld(n.local, n.world), this.marker.visible = n.snapped, n.snapped && this.marker.position.copy(n.snapLocal), this.cross.visible = true, r ? this.cross.position.set(n.local.x, n.local.y, 1e-3) : this.cross.position.set(n.local.x, 0.01, n.local.z), this.numBuffer && this.updateDynBox();
  }
  snapToEntities(t, e, n, i) {
    this.sBest = n * n, this.sFound = false;
    for (const r of this.host.store.entities) {
      if (!r.object3D.visible || !r.nearPoint(t, e, n)) continue;
      const o = r.points;
      if (r instanceof ti) {
        const a = o[0];
        this.testSnap(a.x, a.y, t, e, i), this.testSnap(a.x + r.radius, a.y, t, e, i), this.testSnap(a.x - r.radius, a.y, t, e, i), this.testSnap(a.x, a.y + r.radius, t, e, i), this.testSnap(a.x, a.y - r.radius, t, e, i);
      } else if (r instanceof kn) {
        const a = o[0];
        this.testSnap(a.x, a.y, t, e, i), this.testSnap(a.x + Math.cos(r.a0) * r.radius, a.y + Math.sin(r.a0) * r.radius, t, e, i);
        const l = r.a0 + r.sweep;
        this.testSnap(a.x + Math.cos(l) * r.radius, a.y + Math.sin(l) * r.radius, t, e, i);
      } else if (r instanceof Ue) for (let a = 0; a < o.length; a++) {
        this.testSnap(o[a].x, o[a].y, t, e, i);
        const l = a + 1 < o.length ? a + 1 : r.closed ? 0 : -1;
        l >= 0 && this.testSnap((o[a].x + o[l].x) / 2, (o[a].y + o[l].y) / 2, t, e, i);
      }
      else this.testSnap(o[0].x, o[0].y, t, e, i);
    }
    return this.sFound;
  }
  testSnap(t, e, n, i, r) {
    const o = t - n, a = e - i, l = o * o + a * a;
    l < this.sBest && (this.sBest = l, this.sFound = true, r.set(t, e, 0));
  }
  applyViewportScale(t) {
    if (this.markerMat.resolution.set(t.gl.w, t.gl.h), !this.marker.visible && !this.cross.visible) return;
    let e;
    const n = t.camera;
    this.host.ucs.group.getWorldQuaternion(Ac).invert(), zo.copy(Ac).multiply(n.quaternion), this.marker.quaternion.copy(zo), this.cross.quaternion.copy(zo), n instanceof $e ? e = 2 * this.cross.getWorldPosition(gn).distanceTo(n.position) * Math.tan(n.fov * Math.PI / 360) / t.css.h : e = this.host.vpm.worldPerPixel(t), this.marker.visible && this.marker.scale.setScalar(8 * e), this.cross.visible && this.cross.scale.setScalar(9 * e);
  }
  pickEntity(t) {
    const e = this.pointer.rawLocal.x, n = this.pointer.rawLocal.y;
    let i = 8 * this.host.vpm.worldPerPixel(t), r = null;
    for (const o of this.host.store.entities) {
      if (!o.object3D.visible || !o.nearPoint(e, n, i)) continue;
      const a = o.hitDistance(e, n);
      a <= i && (i = a, r = o);
    }
    return r;
  }
  localAtScreen(t, e, n, i) {
    return this.host.vpm.ndcInto(t, e, n, br), this.raycaster.setFromCamera(br, t.camera), this.raycaster.ray.intersectPlane(this.host.ucs.plane, i) ? (this.host.ucs.defined && (this.host.ucs.worldToLocal(i, i), i.z = 0), true) : false;
  }
};
_Ka.DRAFT_IDS = /* @__PURE__ */ new Set(["line", "polyline", "rect", "circle", "arc", "ellipse", "text", "point", "refplane", "deviation", "move", "copy", "rotate", "scale", "mirror", "trim", "join", "openings"]);
let Ka = _Ka;
class Z_ extends ye {
  constructor(t, e) {
    super(t, e), this.id = "isolate", this.hint = "\u0428\u0410\u0413 1/4 \xB7 \u0421\u0422\u0415\u041D\u0410 \u2014 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0442\u0435\u043D\u0443 \u043A\u043E\u043D\u0442\u0443\u0440\u043E\u043C \u043D\u0430 \u0432\u0438\u0434\u0435 \u0441\u0432\u0435\u0440\u0445\u0443: \u041B\u041A\u041C \u0432\u0435\u0440\u0448\u0438\u043D\u044B \xB7 Enter/\u041F\u041A\u041C \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \xB7 Esc \u0441\u0431\u0440\u043E\u0441", this.pts = [], this.rb = new ei(t.scene, 16096779);
  }
  activate() {
    this.host.enterTopView();
  }
  deactivate() {
    this.reset();
  }
  reset() {
    this.pts.length = 0, this.rb.hide();
  }
  onDown(t) {
    this.pts.length < vh && this.pts.push(t.world.clone()), this.rb.setPath(this.pts, void 0, true);
  }
  onMove(t) {
    this.pts.length && this.rb.setPath(this.pts, t.world, true);
  }
  onFinish() {
    this.pts.length < 3 || (this.host.applyLasso(this.pts), this.reset());
  }
  onKey(t) {
    return t.key === "Escape" ? (this.reset(), this.host.clearLasso(), true) : false;
  }
}
class K_ extends ye {
  constructor() {
    super(...arguments), this.id = "level", this.hint = "\u0428\u0410\u0413 2/4 \xB7 \u0423\u0420\u041E\u0412\u0415\u041D\u042C \u0421\u0420\u0415\u0417\u0410 \u2014 \u0432\u0438\u0434 \u0441\u0431\u043E\u043A\u0443: \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435 (\u0438\u043B\u0438 \u043F\u043E\u043B\u0437\u0443\u043D\u043A\u0438 H \u0438 \u0422), \u0437\u0430\u0442\u0435\u043C \xAB\u041A \u041F\u041B\u0410\u041D\u0423\xBB / Enter";
  }
  activate() {
    this.host.enterLevelView();
  }
  onDown(t) {
    this.host.setPlanSliceLevel(t.world.y);
  }
  onFinish() {
    this.mgr.activate("ucs");
  }
  onKey(t) {
    return t.key === "Escape" ? (this.mgr.activate("isolate"), true) : false;
  }
}
class J_ extends ye {
  constructor(t, e) {
    super(t, e), this.id = "ucs", this.hint = "\u0428\u0410\u0413 3/4 \xB7 \u041F\u0421\u041A \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 2 \u0442\u043E\u0447\u043A\u0438 \u0432\u0434\u043E\u043B\u044C \u043B\u0438\u043D\u0438\u0438 \u0441\u0442\u0435\u043D\u044B \u0432 \u0441\u0440\u0435\u0437\u0435 (\u043E\u0441\u044C X \u043F\u043E\u0439\u0434\u0451\u0442 \u043F\u043E \u043D\u0438\u043C) \xB7 Esc \u0437\u0430\u043D\u043E\u0432\u043E", this.hasFirst = false, this.p1 = new b(), this.seg = [this.p1], this.rb = new ei(t.scene, 2282478);
  }
  activate() {
    this.host.enterTopView(), this.hasFirst = false;
  }
  deactivate() {
    this.hasFirst = false, this.rb.hide();
  }
  onDown(t) {
    const e = this.host.pickCloudPoint(this.mgr.ray, Tc) ? Tc : t.world;
    this.hasFirst ? (this.host.defineUcs(this.p1, e), this.hasFirst = false, this.rb.hide(), this.mgr.activate("polyline")) : (this.p1.copy(e), this.hasFirst = true);
  }
  onMove(t) {
    this.hasFirst && this.rb.setPath(this.seg, t.world);
  }
  onKey(t) {
    return t.key === "Escape" ? (this.hasFirst = false, this.rb.hide(), true) : false;
  }
}
class Q_ extends ye {
  constructor(t, e) {
    super(t, e), this.id = "line", this.hint = "\u041E\u0422\u0420\u0415\u0417\u041E\u041A \u2014 \u0434\u0432\u0435 \u0442\u043E\u0447\u043A\u0438; \u0434\u043B\u0438\u043D\u0443 \u043C\u043E\u0436\u043D\u043E \u0432\u0432\u0435\u0441\u0442\u0438 \u0446\u0438\u0444\u0440\u0430\u043C\u0438 (\u043C\u044B\u0448\u044C \u0437\u0430\u0434\u0430\u0451\u0442 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435) \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.hasA = false, this.a = new b(), this.seg = [this.a], this.rb = new ei(t.ucs.group, 9149689);
  }
  activate() {
    this.host.enterDraftView();
  }
  deactivate() {
    this.hasA = false, this.rb.hide();
  }
  onDown(t) {
    if (!this.hasA) {
      this.a.copy(t.local), this.hasA = true;
      return;
    }
    this.host.snapshot(), this.host.store.add(new Ue([this.a, t.local], false)), this.hasA = false, this.rb.hide(), this.mgr.activate("select");
  }
  onMove(t) {
    this.hasA && this.rb.setPath(this.seg, t.local);
  }
  onKey(t) {
    return t.key === "Escape" ? (this.hasA = false, this.rb.hide(), true) : false;
  }
  getOrthoAnchor() {
    return this.hasA ? this.a : null;
  }
}
class t0 extends ye {
  constructor(t, e) {
    super(t, e), this.id = "polyline", this.hint = "\u041F\u041E\u041B\u0418\u041B\u0418\u041D\u0418\u042F \u2014 \u041B\u041A\u041C \u0442\u043E\u0447\u043A\u0438 \u043F\u043E \u0444\u0430\u0441\u0430\u0434\u0443 \xB7 Enter/\u041F\u041A\u041C \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \xB7 C \u0437\u0430\u043C\u043A\u043D\u0443\u0442\u044C \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.pts = [], this.rb = new ei(t.ucs.group, 9149689);
  }
  activate() {
    this.host.enterDraftView();
  }
  deactivate() {
    this.reset();
  }
  reset() {
    this.pts.length = 0, this.rb.hide();
  }
  onDown(t) {
    this.pts.push(t.local.clone()), this.rb.setPath(this.pts, t.local);
  }
  onMove(t) {
    this.pts.length && this.rb.setPath(this.pts, t.local);
  }
  onFinish() {
    this.commit(false);
  }
  commit(t) {
    const e = this.pts.length >= (t ? 3 : 2);
    e && (this.host.snapshot(), this.host.store.add(new Ue(this.pts, t))), this.reset(), e && this.mgr.activate("select");
  }
  onKey(t) {
    return t.key === "c" || t.key === "C" || t.key === "\u0441" || t.key === "\u0421" ? (this.commit(true), true) : t.key === "Escape" ? (this.reset(), true) : false;
  }
  getOrthoAnchor() {
    return this.pts.length ? this.pts[this.pts.length - 1] : null;
  }
}
class e0 extends ye {
  constructor(t, e) {
    super(t, e), this.id = "rect", this.hint = "\u041F\u0420\u042F\u041C\u041E\u0423\u0413\u041E\u041B\u042C\u041D\u0418\u041A \u2014 \u0434\u0432\u0430 \u043A\u043B\u0438\u043A\u0430 \u043F\u043E \u0434\u0438\u0430\u0433\u043E\u043D\u0430\u043B\u0438; \u0440\u0430\u0437\u043C\u0435\u0440\u044B \u0446\u0438\u0444\u0440\u0430\u043C\u0438: \u0448\u0438\u0440\u0438\u043D\u0430,\u0432\u044B\u0441\u043E\u0442\u0430 \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.hasA = false, this.a = new b(), this.rb = new ei(t.ucs.group, 9149689);
  }
  activate() {
    this.host.enterDraftView();
  }
  deactivate() {
    this.hasA = false, this.rb.hide();
  }
  onDown(t) {
    if (!this.hasA) {
      this.a.copy(t.local), this.hasA = true;
      return;
    }
    Rs[0].set(this.a.x, this.a.y, 0), Rs[1].set(t.local.x, this.a.y, 0), Rs[2].set(t.local.x, t.local.y, 0), Rs[3].set(this.a.x, t.local.y, 0), this.host.snapshot(), this.host.store.add(new Ue(Rs, true)), this.hasA = false, this.rb.hide(), this.mgr.activate("select");
  }
  onMove(t) {
    this.hasA && this.rb.setRect(this.a, t.local);
  }
  onKey(t) {
    return t.key === "Escape" ? (this.hasA = false, this.rb.hide(), true) : false;
  }
  getDynamicAnchor() {
    return this.hasA ? this.a : null;
  }
}
class n0 extends ye {
  constructor(t, e) {
    super(t, e), this.id = "circle", this.hint = "\u041E\u041A\u0420\u0423\u0416\u041D\u041E\u0421\u0422\u042C \u2014 \u043A\u043B\u0438\u043A \u0446\u0435\u043D\u0442\u0440, \u0437\u0430\u0442\u0435\u043C \u0442\u043E\u0447\u043A\u0430 \u0440\u0430\u0434\u0438\u0443\u0441\u0430 (\u0438\u043B\u0438 \u0440\u0430\u0434\u0438\u0443\u0441 \u0446\u0438\u0444\u0440\u0430\u043C\u0438) \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.hasCenter = false, this.center = new b(), this.rb = new ei(t.ucs.group, 9149689);
  }
  activate() {
    this.host.enterDraftView();
  }
  deactivate() {
    this.hasCenter = false, this.rb.hide();
  }
  onDown(t) {
    if (!this.hasCenter) {
      this.center.copy(t.local), this.hasCenter = true;
      return;
    }
    this.commit(Math.hypot(t.local.x - this.center.x, t.local.y - this.center.y));
  }
  commit(t) {
    const e = t > 1e-4;
    e && (this.host.snapshot(), this.host.store.add(new ti(this.center, t))), this.hasCenter = false, this.rb.hide(), e && this.mgr.activate("select");
  }
  onNumeric(t) {
    return this.hasCenter ? (this.commit(Math.abs(t)), true) : false;
  }
  onMove(t) {
    this.hasCenter && this.rb.setCircle(this.center, Math.hypot(t.local.x - this.center.x, t.local.y - this.center.y));
  }
  onKey(t) {
    return t.key === "Escape" ? (this.hasCenter = false, this.rb.hide(), true) : false;
  }
  getOrthoAnchor() {
    return this.hasCenter ? this.center : null;
  }
}
class i0 extends ye {
  constructor(t, e) {
    super(t, e), this.id = "arc", this.hint = "\u0414\u0423\u0413\u0410 \u2014 \u0442\u0440\u0438 \u0442\u043E\u0447\u043A\u0438: \u043D\u0430\u0447\u0430\u043B\u043E, \u0442\u043E\u0447\u043A\u0430 \u043D\u0430 \u0434\u0443\u0433\u0435, \u043A\u043E\u043D\u0435\u0446 \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.stage = 0, this.p1 = new b(), this.p2 = new b(), this.path = [this.p1, this.p2], this.seg1 = [this.p1], this.rb = new ei(t.ucs.group, 9149689);
  }
  activate() {
    this.host.enterDraftView();
  }
  deactivate() {
    this.reset();
  }
  reset() {
    this.stage = 0, this.rb.hide();
  }
  onDown(t) {
    if (this.stage === 0) this.p1.copy(t.local), this.stage = 1;
    else if (this.stage === 1) this.p2.copy(t.local), this.stage = 2;
    else {
      const e = Cc(this.p1, this.p2, t.local);
      e && (this.host.snapshot(), this.host.store.add(new kn(Qe, _n.r, _n.a0, _n.sweep))), this.reset(), e && this.mgr.activate("select");
    }
  }
  onMove(t) {
    this.stage === 1 ? this.rb.setPath(this.seg1, t.local) : this.stage === 2 && (Cc(this.p1, this.p2, t.local) ? this.rb.setArc(Qe.x, Qe.y, _n.r, _n.a0, _n.sweep) : this.rb.setPath(this.path, t.local));
  }
  onKey(t) {
    return t.key === "Escape" ? (this.reset(), true) : false;
  }
  getOrthoAnchor() {
    return this.stage === 1 ? this.p1 : null;
  }
}
class s0 extends ye {
  constructor(t, e) {
    super(t, e), this.id = "ellipse", this.hint = "\u042D\u041B\u041B\u0418\u041F\u0421 \u2014 \u043A\u043B\u0438\u043A \u0446\u0435\u043D\u0442\u0440, \u0437\u0430\u0442\u0435\u043C \u0443\u0433\u043B\u043E\u0432\u0430\u044F \u0442\u043E\u0447\u043A\u0430; \u043F\u043E\u043B\u0443\u043E\u0441\u0438 \u0446\u0438\u0444\u0440\u0430\u043C\u0438: rx,ry \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.hasCenter = false, this.center = new b(), this.rb = new ei(t.ucs.group, 9149689);
  }
  activate() {
    this.host.enterDraftView();
  }
  deactivate() {
    this.hasCenter = false, this.rb.hide();
  }
  onDown(t) {
    if (!this.hasCenter) {
      this.center.copy(t.local), this.hasCenter = true;
      return;
    }
    const e = Math.abs(t.local.x - this.center.x), n = Math.abs(t.local.y - this.center.y), i = e > 1e-4 && n > 1e-4;
    i && (this.host.snapshot(), this.host.store.add(new ps(this.center, e, n, 0))), this.hasCenter = false, this.rb.hide(), i && this.mgr.activate("select");
  }
  onMove(t) {
    this.hasCenter && this.rb.setEllipse(this.center, Math.abs(t.local.x - this.center.x), Math.abs(t.local.y - this.center.y));
  }
  onKey(t) {
    return t.key === "Escape" ? (this.hasCenter = false, this.rb.hide(), true) : false;
  }
  getDynamicAnchor() {
    return this.hasCenter ? this.center : null;
  }
}
class r0 extends ye {
  constructor() {
    super(...arguments), this.id = "text", this.hint = "\u0422\u0415\u041A\u0421\u0422 \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0442\u043E\u0447\u043A\u0443 \u0432\u0441\u0442\u0430\u0432\u043A\u0438 \u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0434\u043F\u0438\u0441\u044C";
  }
  activate() {
    this.host.enterDraftView();
  }
  onDown(t) {
    const e = window.prompt("\u0422\u0435\u043A\u0441\u0442 \u043D\u0430\u0434\u043F\u0438\u0441\u0438:");
    e && e.trim() && (this.host.snapshot(), this.host.store.add(new ms(t.local, e.trim(), 0.35)), this.mgr.activate("select"));
  }
}
class o0 extends ye {
  constructor() {
    super(...arguments), this.id = "point", this.hint = "\u0422\u041E\u0427\u041A\u0410 \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043C\u0435\u0441\u0442\u043E; \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043B\u043E\u0432\u0438\u0442 \u0442\u043E\u0447\u043A\u0443 \u0441\u043A\u0430\u043D\u0430 \xB7 Esc \u0432\u044B\u0445\u043E\u0434";
  }
  activate() {
    this.host.enterDraftView();
  }
  onDown(t) {
    this.host.snapshot(), this.host.store.add(new Ai(t.local));
  }
}
class a0 extends ye {
  constructor() {
    super(...arguments), this.id = "refplane", this.hint = "\u041F\u041B\u041E\u0421\u041A\u041E\u0421\u0422\u042C \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0442\u043E\u0447\u043A\u0443 \u0444\u0430\u0441\u0430\u0434\u0430 (\u0443\u0434\u043E\u0431\u043D\u043E \u0432 3D-\u043E\u043A\u043D\u0435): \u043E\u043D\u0430 \u0441\u0442\u0430\u043D\u0435\u0442 \u043D\u0443\u043B\u0451\u043C \u0434\u043B\u044F \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u0439";
  }
  onDown() {
    this.host.setDeviationRef(this.mgr.ray) && this.mgr.activate("deviation");
  }
}
class l0 extends ye {
  constructor() {
    super(...arguments), this.id = "deviation", this.hint = "\u041E\u0422\u041A\u041B\u041E\u041D\u0415\u041D\u0418\u0415 \u2014 \u043A\u043B\u0438\u043A\u0430\u0439\u0442\u0435 \u0442\u043E\u0447\u043A\u0438 \u0444\u0430\u0441\u0430\u0434\u0430: \u0440\u044F\u0434\u043E\u043C \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u043F\u043E\u0434\u043F\u0438\u0441\u044C + \u043D\u0430\u0440\u0443\u0436\u0443 / \u2212 \u0432\u043D\u0443\u0442\u0440\u044C \xB7 Esc \u0432\u044B\u0445\u043E\u0434";
  }
  activate() {
    this.host.enterDraftView(), this.host.deviationRef === null && (this.host.ui.setHint("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u043D\u0443\u043B\u0435\u0432\u0443\u044E \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u044C: \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u041F\u041B\u041E\u0421\u041A\u041E\u0421\u0422\u042C, \u043A\u043B\u0438\u043A \u043F\u043E \u0444\u0430\u0441\u0430\u0434\u0443"), this.mgr.activate("refplane"));
  }
  onDown(t) {
    const e = this.host.deviationRef;
    if (e === null) return;
    if (!t.snapped) {
      this.host.ui.setHint("\u041D\u0435\u0442 \u0442\u043E\u0447\u043A\u0438 \u0441\u043A\u0430\u043D\u0430 \u043F\u043E\u0434 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C \u2014 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0443 (S) \u0438 \u0446\u0435\u043B\u044C\u0441\u044F \u0432 \u043E\u0431\u043B\u0430\u043A\u043E");
      return;
    }
    const n = t.snapLocal.z - e, i = (n >= 0 ? "+" : "\u2212") + Math.abs(n).toFixed(3);
    this.host.snapshot(), this.host.store.add(new Ai(t.local, i, n));
  }
}
class c0 extends ye {
  constructor() {
    super(...arguments), this.id = "select", this.hint = "\u0412\u042B\u0411\u041E\u0420 \u2014 \u043A\u043B\u0438\u043A \u043F\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u0443 \xB7 Ctrl/Shift+\u043A\u043B\u0438\u043A \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C/\u0443\u0431\u0440\u0430\u0442\u044C \xB7 \u0440\u0430\u043C\u043A\u0430 \u0441\u043B\u0435\u0432\u0430-\u043D\u0430\u043F\u0440\u0430\u0432\u043E \u0446\u0435\u043B\u0438\u043A\u043E\u043C, \u0441\u043F\u0440\u0430\u0432\u0430-\u043D\u0430\u043B\u0435\u0432\u043E \u0441\u0435\u043A\u0443\u0449\u0430\u044F \xB7 Del \u0443\u0434\u0430\u043B\u0438\u0442\u044C", this.down = false, this.dragged = false, this.downX = 0, this.downY = 0, this.hit = null;
  }
  activate() {
    this.host.enterDraftView();
  }
  deactivate() {
    this.down = false, this.host.ui.hideMarquee();
  }
  onDown(t, e) {
    this.down = true, this.dragged = false, this.downX = t.clientX, this.downY = t.clientY, this.hit = this.mgr.viewport ? this.mgr.pickEntity(this.mgr.viewport) : null, this.hit && (e.shiftKey || e.ctrlKey ? this.host.store.toggle(this.hit) : this.host.store.select(this.hit, false));
  }
  onMove(t) {
    if (!this.down || this.hit) return;
    const e = t.clientX - this.downX, n = t.clientY - this.downY;
    Math.abs(e) + Math.abs(n) > 4 && (this.dragged = true, this.host.ui.showMarquee(Math.min(this.downX, t.clientX), Math.min(this.downY, t.clientY), Math.abs(e), Math.abs(n), e < 0));
  }
  onUp(t, e) {
    if (!this.down) return;
    if (this.down = false, this.host.ui.hideMarquee(), this.hit) {
      this.hit = null;
      return;
    }
    if (!this.dragged) {
      !e.shiftKey && !e.ctrlKey && this.host.store.clearSelection();
      return;
    }
    const n = this.mgr.viewport;
    if (!n || !this.mgr.localAtScreen(n, this.downX, this.downY, As)) return;
    Cs.copy(t.rawLocal);
    const i = t.clientX < this.downX;
    Oo.set(Math.min(As.x, Cs.x), Math.min(As.y, Cs.y)), Bo.set(Math.max(As.x, Cs.x), Math.max(As.y, Cs.y)), !e.shiftKey && !e.ctrlKey && this.host.store.clearSelection();
    for (const r of this.host.store.entities) r.object3D.visible && (i ? r.intersectsRect(Oo, Bo) : r.withinRect(Oo, Bo)) && this.host.store.select(r, true);
  }
  onKey(t) {
    return t.key === "Delete" || t.key === "Backspace" ? (this.host.store.selection.size && (this.host.snapshot(), this.host.store.deleteSelected()), true) : t.key === "Escape" ? (this.host.store.clearSelection(), true) : false;
  }
}
class $r extends ye {
  activate() {
    this.host.enterDraftView();
  }
  ensureSelection(t) {
    if (this.host.store.selection.size) return true;
    const e = this.mgr.viewport ? this.mgr.pickEntity(this.mgr.viewport) : null;
    return e ? this.host.store.select(e, t.shiftKey) : this.host.ui.setHint("\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0432\u044B\u0431\u0440\u0430\u043D\u043E \u2014 \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442, \u0437\u0430\u0442\u0435\u043C \u0431\u0430\u0437\u043E\u0432\u0443\u044E \u0442\u043E\u0447\u043A\u0443"), false;
  }
}
class Mh extends $r {
  constructor() {
    super(...arguments), this.id = "move", this.hint = "\u041F\u0415\u0420\u0415\u041D\u041E\u0421 \u2014 \u043A\u043B\u0438\u043A \u0431\u0430\u0437\u043E\u0432\u0430\u044F \u0442\u043E\u0447\u043A\u0430, \u0437\u0430\u0442\u0435\u043C \u0446\u0435\u043B\u0435\u0432\u0430\u044F; \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043C\u043E\u0436\u043D\u043E \u0432\u0432\u0435\u0441\u0442\u0438 \u0446\u0438\u0444\u0440\u0430\u043C\u0438 \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.picking = false, this.base = new b();
  }
  deactivate() {
    this.cancel();
  }
  onDown(t, e) {
    this.ensureSelection(e) && (this.picking ? this.place(t) : (this.base.copy(t.local), this.picking = true, this.onArmed()));
  }
  onArmed() {
  }
  place(t) {
    ts.subVectors(t.local, this.base), this.host.snapshot();
    for (const e of this.host.store.selection) e.clearPreview(), e.translate(ts);
    this.picking = false;
  }
  onMove(t) {
    this.picking && (ts.subVectors(t.local, this.base), this.preview(ts));
  }
  preview(t) {
    for (const e of this.host.store.selection) e.setPreviewOffset(t);
  }
  cancel() {
    if (this.picking) for (const t of this.host.store.selection) t.clearPreview();
    this.picking = false;
  }
  onKey(t) {
    return t.key === "Escape" ? (this.cancel(), true) : false;
  }
  getOrthoAnchor() {
    return this.picking ? this.base : null;
  }
}
class h0 extends Mh {
  constructor() {
    super(...arguments), this.id = "copy", this.hint = "\u041A\u041E\u041F\u0418\u042F \u2014 \u0431\u0430\u0437\u043E\u0432\u0430\u044F \u0442\u043E\u0447\u043A\u0430, \u0437\u0430\u0442\u0435\u043C \u043A\u0430\u0436\u0434\u044B\u0439 \u043A\u043B\u0438\u043A \u0441\u0442\u0430\u0432\u0438\u0442 \u043A\u043E\u043F\u0438\u044E \xB7 Esc \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C", this.ghost = null;
  }
  onArmed() {
    this.ghost = Sh(this.host.store.selection, this.host.ucs.group);
  }
  place(t) {
    ts.subVectors(t.local, this.base), this.host.snapshot();
    for (const e of this.host.store.selection) this.host.store.add(e.makeCopy(ts));
  }
  preview(t) {
    this.ghost && this.ghost.position.set(t.x, t.y, 0);
  }
  cancel() {
    this.ghost && (this.host.ucs.group.remove(this.ghost), this.ghost = null), this.picking = false;
  }
}
class u0 extends $r {
  constructor() {
    super(...arguments), this.id = "rotate", this.hint = "\u041F\u041E\u0412\u041E\u0420\u041E\u0422 \u2014 \u043A\u043B\u0438\u043A \u0431\u0430\u0437\u043E\u0432\u0430\u044F \u0442\u043E\u0447\u043A\u0430, \u0437\u0430\u0442\u0435\u043C \u0443\u0433\u043E\u043B \u043C\u044B\u0448\u044C\u044E \u0438\u043B\u0438 \u0446\u0438\u0444\u0440\u0430\u043C\u0438 \u0432 \u0433\u0440\u0430\u0434\u0443\u0441\u0430\u0445 \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.numericSuffix = "\xB0", this.picking = false, this.pivot = new b();
  }
  deactivate() {
    this.cancel();
  }
  onDown(t, e) {
    this.ensureSelection(e) && (this.picking ? this.commit(Math.atan2(t.local.y - this.pivot.y, t.local.x - this.pivot.x)) : (this.pivot.copy(t.local), this.picking = true));
  }
  onMove(t) {
    if (!this.picking) return;
    const e = Math.atan2(t.local.y - this.pivot.y, t.local.x - this.pivot.x);
    for (const n of this.host.store.selection) n.setPreviewTransform(e, 1, 1, this.pivot);
  }
  onNumeric(t) {
    return this.picking ? (this.commit(t * Math.PI / 180), true) : false;
  }
  commit(t) {
    this.host.snapshot();
    for (const e of this.host.store.selection) e.clearPreview(), e.rotateAround(this.pivot, t);
    this.picking = false;
  }
  cancel() {
    if (this.picking) for (const t of this.host.store.selection) t.clearPreview();
    this.picking = false;
  }
  onKey(t) {
    return t.key === "Escape" ? (this.cancel(), true) : false;
  }
  getDynamicAnchor() {
    return this.picking ? this.pivot : null;
  }
}
class d0 extends $r {
  constructor() {
    super(...arguments), this.id = "scale", this.hint = "\u041C\u0410\u0421\u0428\u0422\u0410\u0411 \u2014 \u043A\u043B\u0438\u043A \u0431\u0430\u0437\u043E\u0432\u0430\u044F \u0442\u043E\u0447\u043A\u0430, \u0437\u0430\u0442\u0435\u043C \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442 \u043C\u044B\u0448\u044C\u044E (1 \u043C = \xD71) \u0438\u043B\u0438 \u0446\u0438\u0444\u0440\u0430\u043C\u0438 \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.numericSuffix = "\xD7", this.picking = false, this.pivot = new b();
  }
  deactivate() {
    this.cancel();
  }
  onDown(t, e) {
    this.ensureSelection(e) && (this.picking ? this.commit(Math.hypot(t.local.x - this.pivot.x, t.local.y - this.pivot.y)) : (this.pivot.copy(t.local), this.picking = true));
  }
  onMove(t) {
    if (!this.picking) return;
    const e = Math.hypot(t.local.x - this.pivot.x, t.local.y - this.pivot.y);
    if (e > 1e-4) for (const n of this.host.store.selection) n.setPreviewTransform(0, e, e, this.pivot);
  }
  onNumeric(t) {
    return this.picking ? (this.commit(Math.abs(t)), true) : false;
  }
  commit(t) {
    if (t > 1e-4) {
      this.host.snapshot();
      for (const e of this.host.store.selection) e.clearPreview(), e.scaleAround(this.pivot, t);
    } else this.cancel();
    this.picking = false;
  }
  cancel() {
    if (this.picking) for (const t of this.host.store.selection) t.clearPreview();
    this.picking = false;
  }
  onKey(t) {
    return t.key === "Escape" ? (this.cancel(), true) : false;
  }
  getDynamicAnchor() {
    return this.picking ? this.pivot : null;
  }
}
class f0 extends $r {
  constructor() {
    super(...arguments), this.id = "mirror", this.hint = "\u0417\u0415\u0420\u041A\u0410\u041B\u041E \u2014 \u0434\u0432\u0435 \u0442\u043E\u0447\u043A\u0438 \u043E\u0441\u0438 \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u044F; \u0441\u043E\u0437\u0434\u0430\u0451\u0442\u0441\u044F \u0437\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.hasP1 = false, this.p1 = new b(), this.ghost = null;
  }
  deactivate() {
    this.cancel();
  }
  onDown(t, e) {
    this.ensureSelection(e) && (this.hasP1 ? this.commit(Math.atan2(t.local.y - this.p1.y, t.local.x - this.p1.x)) : (this.p1.copy(t.local), this.hasP1 = true, this.ghost = Sh(this.host.store.selection, this.host.ucs.group)));
  }
  onMove(t) {
    if (!this.hasP1 || !this.ghost) return;
    const e = Math.atan2(t.local.y - this.p1.y, t.local.x - this.p1.x), n = Math.cos(2 * e), i = Math.sin(2 * e);
    this.ghost.rotation.z = 2 * e, this.ghost.scale.set(1, -1, 1), this.ghost.position.set(this.p1.x - (n * this.p1.x + i * this.p1.y), this.p1.y - (i * this.p1.x - n * this.p1.y), 0);
  }
  commit(t) {
    this.host.snapshot();
    for (const e of this.host.store.selection) {
      const n = e.makeCopy($_);
      n.mirrorAcross(this.p1, t), this.host.store.add(n);
    }
    this.cancel();
  }
  cancel() {
    this.ghost && (this.host.ucs.group.remove(this.ghost), this.ghost = null), this.hasP1 = false;
  }
  onKey(t) {
    return t.key === "Escape" ? (this.cancel(), true) : false;
  }
  getDynamicAnchor() {
    return this.hasP1 ? this.p1 : null;
  }
}
function Eh(s, t, e, n) {
  let i = null;
  for (const r of s) {
    if (!(r instanceof Ue) || !r.object3D.visible) continue;
    const o = r.points, a = r.closed ? o.length : o.length - 1;
    for (let l = 0; l < a; l++) {
      const c = o[l], h = o[(l + 1) % o.length], u = h.x - c.x, d = h.y - c.y, f = u * u + d * d;
      let g = f > 0 ? ((t - c.x) * u + (e - c.y) * d) / f : 0;
      g = Math.max(0, Math.min(1, g));
      const _ = c.x + u * g - t, m = c.y + d * g - e, p = _ * _ + m * m;
      p <= n * n && (!i || p < i.d2) && (i = { ent: r, u: l + g, d2: p });
    }
  }
  return i;
}
function p0(s, t, e, n, i, r, o, a) {
  const l = e - s, c = n - t, h = o - i, u = a - r, d = l * u - c * h;
  if (Math.abs(d) < 1e-12) return -1;
  const f = ((i - s) * u - (r - t) * h) / d, g = ((i - s) * c - (r - t) * l) / d;
  return f >= 0 && f <= 1 && g >= 0 && g <= 1 ? f : -1;
}
function m0(s, t, e, n, i, r, o, a) {
  const l = e - s, c = n - t, h = s - i, u = t - r, d = l * l + c * c, f = 2 * (h * l + u * c), g = h * h + u * u - o * o, _ = f * f - 4 * d * g;
  if (_ < 0 || d < 1e-12) return;
  const m = Math.sqrt(_), p = (-f - m) / (2 * d), T = (-f + m) / (2 * d);
  p >= 0 && p <= 1 && a.push(p), T >= 0 && T <= 1 && Math.abs(T - p) > 1e-9 && a.push(T);
}
function g0(s, t, e) {
  const n = s.points[0];
  let i = Math.atan2(e - n.y, t - n.x) - s.a0;
  const r = Math.PI * 2;
  return i = (i % r + r) % r, s.sweep >= 0 ? i <= s.sweep + 1e-6 : i - r >= s.sweep - 1e-6;
}
function _0(s, t) {
  const e = [], n = [], i = s.points, r = s.closed ? i.length : i.length - 1;
  for (let o = 0; o < r; o++) {
    const a = i[o], l = i[(o + 1) % i.length];
    for (const c of t) if (c !== s) {
      if (c instanceof Ue) {
        const h = c.points, u = c.closed ? h.length : h.length - 1;
        for (let d = 0; d < u; d++) {
          const f = p0(a.x, a.y, l.x, l.y, h[d].x, h[d].y, h[(d + 1) % h.length].x, h[(d + 1) % h.length].y);
          f >= 0 && e.push(o + f);
        }
      } else if (c instanceof ti || c instanceof kn) {
        n.length = 0;
        const h = c.points[0];
        m0(a.x, a.y, l.x, l.y, h.x, h.y, c.radius, n);
        for (const u of n) c instanceof kn && !g0(c, a.x + (l.x - a.x) * u, a.y + (l.y - a.y) * u) || e.push(o + u);
      }
    }
  }
  return e.sort((o, a) => o - a), e;
}
function ko(s, t, e) {
  const n = s.length, i = [], r = (a, l) => {
    const c = i[i.length - 1];
    (!c || (c.x - a) * (c.x - a) + (c.y - l) * (c.y - l) > 1e-12) && i.push(new b(a, l, 0));
  }, o = (a) => {
    const l = Math.floor(a), c = a - l, h = s[(l % n + n) % n], u = s[((l + 1) % n + n) % n];
    r(h.x + (u.x - h.x) * c, h.y + (u.y - h.y) * c);
  };
  o(t);
  for (let a = Math.floor(t) + 1; a < e - 1e-9; a++) {
    const l = s[(a % n + n) % n];
    r(l.x, l.y);
  }
  return o(e), i;
}
class v0 extends ye {
  constructor() {
    super(...arguments), this.id = "trim", this.hint = "\u041D\u041E\u0416\u041D\u0418\u0426\u042B \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u043B\u0438\u043D\u0438\u0438 \u043C\u0435\u0436\u0434\u0443 \u043F\u0435\u0440\u0435\u0441\u0435\u0447\u0435\u043D\u0438\u044F\u043C\u0438, \u043E\u043D \u0431\u0443\u0434\u0435\u0442 \u0432\u044B\u0440\u0435\u0437\u0430\u043D \xB7 Esc \u0432\u044B\u0445\u043E\u0434";
  }
  activate() {
    this.host.enterDraftView();
  }
  onDown(t) {
    const e = this.mgr.viewport;
    if (!e) return;
    const n = 8 * this.host.vpm.worldPerPixel(e), i = Eh(this.host.store.entities, t.rawLocal.x, t.rawLocal.y, n);
    if (!i) return;
    const r = i.ent, o = r.points, a = r.closed ? o.length : o.length - 1, l = _0(r, this.host.store.entities).filter((u) => Math.abs(u - i.u) > 1e-6);
    let c = -1 / 0, h = 1 / 0;
    for (const u of l) u < i.u && u > c && (c = u), u > i.u && u < h && (h = u);
    if (this.host.snapshot(), r.closed) if (!l.length) this.host.store.remove(r);
    else {
      let u = c === -1 / 0 ? l[l.length - 1] : c;
      const d = h === 1 / 0 ? l[0] + a : h;
      u <= d && (u += a);
      const f = ko(o, d, u), g = r.layer;
      if (this.host.store.remove(r), f.length >= 2) {
        const _ = new Ue(f, false);
        _.layer = g, this.host.store.add(_);
      }
    }
    else {
      const u = c === -1 / 0 ? 0 : c, d = h === 1 / 0 ? a : h, f = u > 1e-9 ? ko(o, 0, u) : null, g = d < a - 1e-9 ? ko(o, d, a) : null, _ = r.layer;
      this.host.store.remove(r);
      for (const m of [f, g]) if (m && m.length >= 2) {
        const p = new Ue(m, false);
        p.layer = _, this.host.store.add(p);
      }
    }
    this.host.ui.setHint("\u0412\u044B\u0440\u0435\u0437\u0430\u043D\u043E \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u0438\u043B\u0438 Esc");
  }
}
class x0 extends ye {
  constructor() {
    super(...arguments), this.id = "join", this.hint = "\u0421\u041E\u0415\u0414\u0418\u041D\u0418\u0422\u042C \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u0435\u0440\u0432\u0443\u044E \u043B\u0438\u043D\u0438\u044E, \u0437\u0430\u0442\u0435\u043C \u0432\u0442\u043E\u0440\u0443\u044E (\u0438\u0445 \u043A\u043E\u043D\u0446\u044B \u0434\u043E\u043B\u0436\u043D\u044B \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u0442\u044C)", this.first = null;
  }
  activate() {
    this.host.enterDraftView(), this.first = null;
  }
  deactivate() {
    this.first = null;
  }
  onDown(t) {
    const e = this.mgr.viewport;
    if (!e) return;
    const n = 8 * this.host.vpm.worldPerPixel(e), i = Eh(this.host.store.entities, t.rawLocal.x, t.rawLocal.y, n);
    if (i) {
      if (i.ent.closed) {
        this.host.ui.setHint("\u0417\u0430\u043C\u043A\u043D\u0443\u0442\u044B\u0439 \u043A\u043E\u043D\u0442\u0443\u0440 \u0441\u043E\u0435\u0434\u0438\u043D\u044F\u0442\u044C \u043D\u0435\u043B\u044C\u0437\u044F");
        return;
      }
      if (!this.first) {
        this.first = i.ent, this.host.store.select(i.ent, false);
        return;
      }
      i.ent !== this.first && (this.join(this.first, i.ent, 12 * this.host.vpm.worldPerPixel(e)), this.first = null);
    }
  }
  join(t, e, n) {
    const i = (g, _) => (g.x - _.x) * (g.x - _.x) + (g.y - _.y) * (g.y - _.y), r = t.points[0], o = t.points[t.points.length - 1], a = e.points[0], l = e.points[e.points.length - 1], c = [{ d: i(o, a), pts: () => [...t.points, ...e.points.slice(1)] }, { d: i(o, l), pts: () => [...t.points, ...[...e.points].reverse().slice(1)] }, { d: i(r, a), pts: () => [...[...t.points].reverse(), ...e.points.slice(1)] }, { d: i(r, l), pts: () => [...e.points, ...t.points.slice(1)] }];
    if (c.sort((g, _) => g.d - _.d), c[0].d > n * n) {
      this.host.ui.setHint("\u041A\u043E\u043D\u0446\u044B \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0442 \u2014 \u043B\u0438\u043D\u0438\u0438 \u043D\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u044B");
      return;
    }
    const h = c[0].pts();
    let u = false;
    h.length > 3 && i(h[0], h[h.length - 1]) <= n * n && (u = true, h.pop()), this.host.snapshot();
    const d = t.layer;
    this.host.store.remove(t), this.host.store.remove(e);
    const f = new Ue(h, u);
    f.layer = d, this.host.store.add(f), this.host.store.select(f, false), this.host.ui.setHint(u ? "\u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u043E \u0432 \u0437\u0430\u043C\u043A\u043D\u0443\u0442\u044B\u0439 \u043A\u043E\u043D\u0442\u0443\u0440" : "\u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u043E");
  }
  onKey(t) {
    return t.key === "Escape" ? (this.first = null, this.host.store.clearSelection(), true) : false;
  }
}
function y0() {
  const s = new me();
  return s.setAttribute("position", new ce(new Float32Array(0), 3)), s.setAttribute("aColor", new ce(new Uint8Array(0), 3, true)), s.setAttribute("aKey", new ce(new Float32Array(0), 1)), { geometry: s, positions: new Float32Array(0), count: 0, center: new b(), radius: 10 };
}
const wr = 8, Pt = (s) => Math.abs(s) < 1e-9 ? "0" : s.toFixed(4), Or = (s) => s * 180 / Math.PI, S0 = [[255, 0, 0, 1], [255, 255, 0, 2], [0, 255, 0, 3], [0, 255, 255, 4], [0, 0, 255, 5], [255, 0, 255, 6], [255, 255, 255, 7], [128, 128, 128, 8], [192, 192, 192, 9]];
function M0(s) {
  const t = parseInt(s.slice(1, 3), 16), e = parseInt(s.slice(3, 5), 16), n = parseInt(s.slice(5, 7), 16);
  let i = 7, r = 1 / 0;
  for (const [o, a, l, c] of S0) {
    const h = (t - o) ** 2 + (e - a) ** 2 + (n - l) ** 2;
    h < r && (r = h, i = c);
  }
  return i;
}
function E0(s) {
  const t = s.points[0], e = Math.cos(s.rot), n = Math.sin(s.rot), i = [];
  for (let r = 0; r < 72; r++) {
    const o = r / 72 * Math.PI * 2, a = s.rx * Math.cos(o), l = s.ry * Math.sin(o);
    i.push({ x: t.x + a * e - l * n, y: t.y + a * n + l * e });
  }
  return i;
}
const Tr = { solid: { name: "CONTINUOUS", desc: "Solid line", dashes: [] }, dashed: { name: "DASHED", desc: "__ __ __", dashes: [0.3, -0.15] }, dotted: { name: "DOT", desc: ". . . .", dashes: [0, -0.12] }, dashdot: { name: "DASHDOT", desc: "__ . __ .", dashes: [0.5, -0.15, 0, -0.15] } };
function b0(s, t) {
  const e = [];
  if (t && t.length) {
    e.push("0", "SECTION", "2", "TABLES");
    const i = [.../* @__PURE__ */ new Set(["solid", ...t.map((r) => r.linetype)])];
    e.push("0", "TABLE", "2", "LTYPE", "70", String(i.length));
    for (const r of i) {
      const o = Tr[r] ?? Tr.solid, a = o.dashes.reduce((l, c) => l + Math.abs(c), 0);
      e.push("0", "LTYPE", "2", o.name, "70", "64", "3", o.desc, "72", "65", "73", String(o.dashes.length), "40", Pt(a));
      for (const l of o.dashes) e.push("49", Pt(l));
    }
    e.push("0", "ENDTAB"), e.push("0", "TABLE", "2", "LAYER", "70", String(t.length));
    for (const r of t) {
      const o = Tr[r.linetype] ?? Tr.solid;
      e.push("0", "LAYER", "2", r.name, "70", "0", "62", String(M0(r.color)), "6", o.name);
    }
    e.push("0", "ENDTAB", "0", "ENDSEC");
  }
  e.push("0", "SECTION", "2", "ENTITIES");
  const n = (i, r, o) => {
    e.push("0", "POLYLINE", "8", o, "66", "1", "70", r ? "1" : "0");
    for (const a of i) e.push("0", "VERTEX", "8", o, "10", Pt(a.x), "20", Pt(a.y), "30", "0");
    e.push("0", "SEQEND");
  };
  for (const i of s) {
    const r = i.points[0], o = i.layer;
    if (i instanceof ti) e.push("0", "CIRCLE", "8", o, "10", Pt(r.x), "20", Pt(r.y), "30", "0", "40", Pt(i.radius));
    else if (i instanceof kn) {
      const a = i.sweep >= 0 ? i.a0 : i.a0 + i.sweep, l = i.sweep >= 0 ? i.a0 + i.sweep : i.a0;
      e.push("0", "ARC", "8", o, "10", Pt(r.x), "20", Pt(r.y), "30", "0", "40", Pt(i.radius), "50", Pt(Or(a)), "51", Pt(Or(l)));
    } else i instanceof ps ? n(E0(i), true, o) : i instanceof Ai ? (e.push("0", "POINT", "8", o, "10", Pt(r.x), "20", Pt(r.y), "30", "0"), i.label && e.push("0", "TEXT", "8", o, "10", Pt(r.x + 0.06), "20", Pt(r.y + 0.02), "30", "0", "40", "0.11", "1", i.label)) : i instanceof ms ? e.push("0", "TEXT", "8", o, "10", Pt(r.x), "20", Pt(r.y), "30", "0", "40", Pt(i.height), "50", Pt(Or(i.rotation)), "1", i.text) : i instanceof Ue && n(i.points, i.closed, o);
  }
  return e.push("0", "ENDSEC", "0", "EOF"), e.join(`\r
`);
}
function w0(s) {
  let t = "";
  for (const e of s) {
    const n = e.points[0];
    if (e instanceof ti) t += `_.CIRCLE
${Pt(n.x)},${Pt(n.y)}
${Pt(e.radius)}
`;
    else if (e instanceof kn) {
      const i = e.sweep >= 0 ? e.a0 : e.a0 + e.sweep, r = e.sweep >= 0 ? e.a0 + e.sweep : e.a0, o = n.x + Math.cos(i) * e.radius, a = n.y + Math.sin(i) * e.radius, l = n.x + Math.cos(r) * e.radius, c = n.y + Math.sin(r) * e.radius;
      t += `_.ARC
_C
${Pt(n.x)},${Pt(n.y)}
${Pt(o)},${Pt(a)}
${Pt(l)},${Pt(c)}
`;
    } else if (e instanceof ps) {
      const i = n.x + e.rx * Math.cos(e.rot), r = n.y + e.rx * Math.sin(e.rot);
      t += `_.ELLIPSE
_C
${Pt(n.x)},${Pt(n.y)}
${Pt(i)},${Pt(r)}
${Pt(e.ry)}
`;
    } else if (e instanceof Ai) t += `_.POINT
${Pt(n.x)},${Pt(n.y)}
`, e.label && (t += `_.-TEXT
${Pt(n.x + 0.06)},${Pt(n.y + 0.02)}
0.11
0
${e.label}
`);
    else if (e instanceof ms) t += `_.-TEXT
${Pt(n.x)},${Pt(n.y)}
${Pt(e.height)}
${Pt(Or(e.rotation))}
${e.text}
`;
    else if (e instanceof Ue) {
      t += `_.PLINE
`;
      for (const i of e.points) t += `${Pt(i.x)},${Pt(i.y)}
`;
      t += e.closed ? `_C
` : `
`;
    }
  }
  return t;
}
function T0(s, t) {
  const e = URL.createObjectURL(new Blob([t], { type: "application/octet-stream" })), n = document.createElement("a");
  n.href = e, n.download = s, n.click(), URL.revokeObjectURL(e);
}
const A0 = [{ id: "isolate", tool: "isolate", label: "\u0421\u0442\u0435\u043D\u0430", title: "\u0428\u0430\u0433 1: \u043E\u0431\u0432\u0435\u0441\u0442\u0438 \u0441\u0442\u0435\u043D\u0443 \u043B\u0430\u0441\u0441\u043E \u043D\u0430 \u0432\u0438\u0434\u0435 \u0441\u0432\u0435\u0440\u0445\u0443", icon: '<path d="M4 7 12 4l8 3v10l-8 3-8-3z" stroke-dasharray="3 2.4" /><path d="M7.5 10.5h9M7.5 14h9" opacity=".5" />' }, { id: "ucs", tool: "ucs", label: "\u041F\u0421\u041A", title: "\u0428\u0430\u0433 2: \u043D\u043E\u0432\u0430\u044F \u041F\u0421\u041A \u043F\u043E \u0434\u0432\u0443\u043C \u0442\u043E\u0447\u043A\u0430\u043C \u0432\u0434\u043E\u043B\u044C \u0441\u0442\u0435\u043D\u044B", icon: '<path d="M5 19.5V5M5 19.5h14.5" /><path d="M3.2 7 5 5l1.8 2M17.5 17.7l2 1.8-2 1.8" /><circle cx="5" cy="19.5" r="1.2" fill="currentColor" stroke="none" />' }, { id: "level", tool: "level", label: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C", title: "\u0428\u0430\u0433 2: \u0432\u0438\u0434 \u0441\u0431\u043E\u043A\u0443 \u2014 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0438 \u0442\u043E\u043B\u0449\u0438\u043D\u0430 \u0441\u0440\u0435\u0437\u0430 \u043F\u043B\u0430\u043D\u0430, \u043F\u043E \u043A\u043E\u0442\u043E\u0440\u043E\u043C\u0443 \u0441\u0442\u0430\u0432\u0438\u0442\u0441\u044F \u041F\u0421\u041A", icon: '<path d="M3 8.5h18M3 15.5h18" stroke-dasharray="3 2.2" /><path d="M3 12h18" /><path d="M6.5 12v7.5M17.5 12V4.5" opacity=".55" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />' }, { id: "line", tool: "line", label: "\u041E\u0442\u0440\u0435\u0437\u043E\u043A", title: "\u041E\u0442\u0440\u0435\u0437\u043E\u043A: \u0434\u0432\u0435 \u0442\u043E\u0447\u043A\u0438 \u0438\u043B\u0438 \u0434\u043B\u0438\u043D\u0430 \u0446\u0438\u0444\u0440\u0430\u043C\u0438", icon: '<path d="M5.5 18.5 18.5 5.5" /><circle cx="5.5" cy="18.5" r="1.6" /><circle cx="18.5" cy="5.5" r="1.6" />' }, { id: "polyline", tool: "polyline", label: "\u041F\u043B\u0438\u043D\u0438\u044F", title: "\u041F\u043E\u043B\u0438\u043B\u0438\u043D\u0438\u044F \u2014 Enter \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C, C \u0437\u0430\u043C\u043A\u043D\u0443\u0442\u044C", icon: '<path d="M3 17.5 8 9l4.5 4.5L16 6.5 21 11" /><circle cx="8" cy="9" r="1.2" /><circle cx="12.5" cy="13.5" r="1.2" /><circle cx="16" cy="6.5" r="1.2" />' }, { id: "rect", tool: "rect", label: "\u041F\u0440\u044F\u043C\u043E\u0443\u0433", title: "\u041F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A \u043F\u043E \u0434\u0432\u0443\u043C \u0443\u0433\u043B\u0430\u043C (\u0438\u043B\u0438 \u0448\u0438\u0440\u0438\u043D\u0430,\u0432\u044B\u0441\u043E\u0442\u0430)", icon: '<rect x="4.5" y="7" width="15" height="10.5" rx="1" />' }, { id: "circle", tool: "circle", label: "\u041A\u0440\u0443\u0433", title: "\u041E\u043A\u0440\u0443\u0436\u043D\u043E\u0441\u0442\u044C: \u0446\u0435\u043D\u0442\u0440 + \u0440\u0430\u0434\u0438\u0443\u0441 (\u0438\u043B\u0438 \u0440\u0430\u0434\u0438\u0443\u0441 \u0446\u0438\u0444\u0440\u0430\u043C\u0438)", icon: '<circle cx="12" cy="12" r="7.8" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />' }, { id: "arc", tool: "arc", label: "\u0414\u0443\u0433\u0430", title: "\u0414\u0443\u0433\u0430 \u043F\u043E \u0442\u0440\u0451\u043C \u0442\u043E\u0447\u043A\u0430\u043C", icon: '<path d="M4 17.5a8 8 0 0 1 16 0" /><circle cx="4" cy="17.5" r="1.3" /><circle cx="20" cy="17.5" r="1.3" />' }, { id: "ellipse", tool: "ellipse", label: "\u042D\u043B\u043B\u0438\u043F\u0441", title: "\u042D\u043B\u043B\u0438\u043F\u0441: \u0446\u0435\u043D\u0442\u0440 + \u0443\u0433\u043B\u043E\u0432\u0430\u044F \u0442\u043E\u0447\u043A\u0430 (\u0438\u043B\u0438 rx,ry)", icon: '<ellipse cx="12" cy="12" rx="8.5" ry="5.5" />' }, { id: "text", tool: "text", label: "\u0422\u0435\u043A\u0441\u0442", title: "\u0422\u0435\u043A\u0441\u0442\u043E\u0432\u0430\u044F \u043D\u0430\u0434\u043F\u0438\u0441\u044C", icon: '<path d="M5.5 6.5h13" /><path d="M12 6.5v12" /><path d="M9 18.5h6" />' }, { id: "point", tool: "point", label: "\u0422\u043E\u0447\u043A\u0430", title: "\u0422\u043E\u0447\u043A\u0430 \u043F\u043E \u043A\u043B\u0438\u043A\u0443 (\u0441 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u043E\u0439 \u043A \u0441\u043A\u0430\u043D\u0443)", icon: '<path d="M12 5.8 18.2 12 12 18.2 5.8 12z" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />' }, { id: "refplane", tool: "refplane", label: "\u041F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u044C", title: "\u041D\u0443\u043B\u0435\u0432\u0430\u044F \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u044C \u0434\u043B\u044F \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u0439: \u043A\u043B\u0438\u043A \u043F\u043E \u0442\u043E\u0447\u043A\u0435 \u0444\u0430\u0441\u0430\u0434\u0430", icon: '<path d="M2.5 14.5 12 9.6l9.5 4.9-9.5 4.9z" /><path d="M12 9.6V3.2" stroke-dasharray="2.4 2" /><circle cx="12" cy="2.8" r="1.2" fill="currentColor" stroke="none" />' }, { id: "openings", tool: "openings", label: "\u041F\u0440\u043E\u0451\u043C\u044B", title: "\u0410\u0432\u0442\u043E\u043F\u043E\u0438\u0441\u043A \u043E\u043A\u043E\u043D \u0438 \u0434\u0432\u0435\u0440\u0435\u0439 \u0432 \u0441\u0440\u0435\u0437\u0435 \u0441\u0442\u0435\u043D\u044B: \u0440\u0430\u043C\u043A\u0438 \u043F\u0440\u0435\u0434\u043B\u0430\u0433\u0430\u044E\u0442\u0441\u044F, \u0432\u044B \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u0442\u0435", icon: '<path d="M3 4.5h18v15H3z" stroke-dasharray="3 2.2" opacity=".5" /><rect x="7" y="8" width="10" height="8" /><path d="M12 8v8M7 12h10" opacity=".65" />' }, { id: "deviation", tool: "deviation", label: "\u041E\u0442\u043A\u043B\u043E\u043D", title: "\u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u0435 \u043E\u0442 \u043D\u0443\u043B\u0435\u0432\u043E\u0439 \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u0438: + \u043D\u0430\u0440\u0443\u0436\u0443, \u2212 \u0432\u043D\u0443\u0442\u0440\u044C", icon: '<path d="M2.5 13h19" stroke-dasharray="3 2.2" /><path d="M8 13V6.6M16 13v6.6" /><circle cx="8" cy="5" r="1.5" /><circle cx="16" cy="21" r="1.5" />' }, { id: "select", tool: "select", label: "\u0412\u044B\u0431\u043E\u0440", title: "\u0412\u044B\u0431\u043E\u0440: \u043A\u043B\u0438\u043A \u043F\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u0443, Ctrl \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C, \u0440\u0430\u043C\u043A\u0430", icon: '<path d="M7 3.6 18.5 14.2l-5.6.4 2.9 5.4-2.4 1.2-2.8-5.5L7 19.4z" />' }, { id: "move", tool: "move", label: "\u041F\u0435\u0440\u0435\u043D\u043E\u0441", title: "\u041F\u0435\u0440\u0435\u043D\u043E\u0441: \u0431\u0430\u0437\u043E\u0432\u0430\u044F \u2192 \u0446\u0435\u043B\u0435\u0432\u0430\u044F (\u0438\u043B\u0438 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0446\u0438\u0444\u0440\u0430\u043C\u0438)", icon: '<path d="M12 3v18M3 12h18" /><path d="M9.6 5.4 12 3l2.4 2.4M9.6 18.6 12 21l2.4-2.4M5.4 9.6 3 12l2.4 2.4M18.6 9.6 21 12l-2.4 2.4" />' }, { id: "copy", tool: "copy", label: "\u041A\u043E\u043F\u0438\u044F", title: "\u041C\u0443\u043B\u044C\u0442\u0438\u043A\u043E\u043F\u0438\u044F \u0434\u043E Esc", icon: '<rect x="8.5" y="8.5" width="11" height="11" rx="1.5" /><path d="M15.5 5H5a.5.5 0 0 0-.5.5V16" />' }, { id: "rotate", tool: "rotate", label: "\u041F\u043E\u0432\u043E\u0440\u043E\u0442", title: "\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0432\u043E\u043A\u0440\u0443\u0433 \u0431\u0430\u0437\u043E\u0432\u043E\u0439 \u0442\u043E\u0447\u043A\u0438 (\u0443\u0433\u043E\u043B \u0446\u0438\u0444\u0440\u0430\u043C\u0438 \u0432 \xB0)", icon: '<path d="M19.5 12a7.5 7.5 0 1 1-7.5-7.5" /><path d="M9 2.2 12 4.5 9 6.8" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />' }, { id: "scale", tool: "scale", label: "\u041C\u0430\u0441\u0448\u0442\u0430\u0431", title: "\u041C\u0430\u0441\u0448\u0442\u0430\u0431 \u043E\u0442 \u0431\u0430\u0437\u043E\u0432\u043E\u0439 \u0442\u043E\u0447\u043A\u0438 (\u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442 \u0446\u0438\u0444\u0440\u0430\u043C\u0438)", icon: '<rect x="3.5" y="13" width="7.5" height="7.5" rx="1" /><path d="M11 13 20.5 3.5M14.5 3.5h6v6" />' }, { id: "mirror", tool: "mirror", label: "\u0417\u0435\u0440\u043A\u0430\u043B\u043E", title: "\u0417\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u043E\u0441\u0438 \u0438\u0437 \u0434\u0432\u0443\u0445 \u0442\u043E\u0447\u0435\u043A", icon: '<path d="M12 2.8v18.4" stroke-dasharray="3 2.4" /><path d="M8.6 7.5 4 15.5h4.6zM15.4 7.5 20 15.5h-4.6z" />' }, { id: "trim", tool: "trim", label: "\u041D\u043E\u0436\u043D\u0438\u0446\u044B", title: "\u041D\u043E\u0436\u043D\u0438\u0446\u044B: \u0432\u044B\u0440\u0435\u0437\u0430\u0442\u044C \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u0434\u043E \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0445 \u043F\u0435\u0440\u0435\u0441\u0435\u0447\u0435\u043D\u0438\u0439", icon: '<circle cx="6" cy="6.5" r="2.4" /><circle cx="6" cy="17.5" r="2.4" /><path d="M8.1 7.9 20.5 18M8.1 16.1 20.5 6" />' }, { id: "join", tool: "join", label: "\u0421\u043E\u0435\u0434\u0438\u043D", title: "\u0421\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C \u0434\u0432\u0435 \u043B\u0438\u043D\u0438\u0438 \u0441 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0449\u0438\u043C\u0438 \u043A\u043E\u043D\u0446\u0430\u043C\u0438", icon: '<path d="M9 12h6" /><path d="M3.5 12a4 4 0 0 1 4-4h2M3.5 12a4 4 0 0 0 4 4h2M20.5 12a4 4 0 0 0-4-4h-2M20.5 12a4 4 0 0 1-4 4h-2" />' }, { id: "erase", action: "erase", domId: "btn-erase", label: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0435 (Del)", icon: '<path d="M4.5 7h15M10 7V4.8h4V7M6.8 7l1 12.2h8.4L17.2 7" /><path d="M10.3 10.5v5.5M13.7 10.5v5.5" opacity=".6" />' }, { id: "layers", action: "layers", domId: "btn-layers", label: "\u0421\u043B\u043E\u0438", title: "\u0421\u043B\u043E\u0438: \u0446\u0432\u0435\u0442\u0430, \u0442\u0438\u043F\u044B \u043B\u0438\u043D\u0438\u0439, \u0442\u043E\u043B\u0449\u0438\u043D\u044B", icon: '<path d="m12 3.2 8.5 4.3-8.5 4.3-8.5-4.3z" /><path d="m3.5 12 8.5 4.3 8.5-4.3" /><path d="m3.5 16.3 8.5 4.3 8.5-4.3" />' }, { id: "help", action: "help", domId: "btn-help", label: "\u0421\u043F\u0440\u0430\u0432\u043A\u0430", title: "\u0420\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F (F1)", icon: '<circle cx="12" cy="12" r="9" /><path d="M9.3 9.2a2.8 2.8 0 1 1 3.2 3.3v1.6" /><circle cx="12.4" cy="17.2" r="1.05" fill="currentColor" stroke="none" />' }, { id: "undo", action: "undo", domId: "btn-undo", label: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C", title: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C (Ctrl+Z)", icon: '<path d="M4.5 9.5h10a4.8 4.8 0 0 1 0 9.6h-3.5" /><path d="M8 5.8 4.3 9.5 8 13.2" />' }, { id: "redo", action: "redo", domId: "btn-redo", label: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C", title: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C (Ctrl+Y)", icon: '<path d="M19.5 9.5h-10a4.8 4.8 0 0 0 0 9.6H13" /><path d="M16 5.8l3.7 3.7L16 13.2" />' }, { id: "import", action: "import", domId: "btn-import", label: "\u0418\u043C\u043F\u043E\u0440\u0442", title: "\u0418\u043C\u043F\u043E\u0440\u0442 \u043E\u0431\u043B\u0430\u043A\u0430: LAS, LAZ, E57 \u0438\u043B\u0438 ASCII (x y z [r g b])", icon: '<path d="M12 3.5v9.5" /><path d="M8.4 9.6 12 13.2l3.6-3.6" /><path d="M4 15.5v4h16v-4" /><circle cx="7" cy="6" r=".9" fill="currentColor" stroke="none" /><circle cx="17" cy="7.5" r=".9" fill="currentColor" stroke="none" />' }, { id: "dxf", action: "dxf", domId: "btn-dxf", label: "DXF", title: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0447\u0435\u0440\u0442\u0435\u0436\u0430 \u0432 DXF (\u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0435 \u0438\u043B\u0438 \u0432\u0441\u0451)", icon: '<path d="M6.5 3h7l4.5 4.5V21h-11.5z" /><path d="M13.5 3v4.5H18" /><path d="M8.8 12.5h1.6a2 2 0 0 1 0 4H8.8zM14 12.5v4M14 12.5h2.6M14 14.5h2" />' }, { id: "tocad", action: "tocad", domId: "btn-tocad", label: "ToCad", title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432 AutoCAD (\u0438\u043B\u0438 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u043A\u0440\u0438\u043F\u0442)", icon: '<path d="M3 12h10.5" /><path d="M10 8.5 13.5 12 10 15.5" /><path d="M16 4.5h4.5v15H16" />' }], bh = new Map(A0.map((s) => [s.id, s])), wh = [{ title: "\u041F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0430", buttons: ["isolate", "level", "ucs"] }, { title: "\u0427\u0435\u0440\u0447\u0435\u043D\u0438\u0435", buttons: ["line", "polyline", "rect", "circle", "arc", "ellipse", "text", "point"] }, { title: "\u041E\u0431\u043C\u0435\u0440", buttons: ["openings", "refplane", "deviation"] }, { title: "\u041F\u0440\u0430\u0432\u043A\u0430", buttons: ["select", "move", "copy", "rotate", "scale", "mirror", "trim", "join", "erase"] }, { title: "\u041E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435", buttons: ["layers", "undo", "redo", "help"] }, { title: "\u041E\u0431\u043C\u0435\u043D", buttons: ["import", "dxf", "tocad"] }], Ja = "facadecad.ribbon";
function Th() {
  return wh.map((s) => ({ title: s.title, buttons: [...s.buttons] }));
}
function C0() {
  let s = null;
  try {
    const e = localStorage.getItem(Ja);
    if (e) {
      const n = JSON.parse(e);
      Array.isArray(n) && n.length && (s = n.filter((i) => i && typeof i.title == "string" && Array.isArray(i.buttons)).map((i) => ({ title: i.title, buttons: i.buttons.filter((r) => bh.has(r)) })));
    }
  } catch {
  }
  if (!s || !s.length) return Th();
  const t = new Set(s.flatMap((e) => e.buttons));
  for (const e of wh) for (const n of e.buttons) {
    if (t.has(n)) continue;
    (s.find((r) => r.title === e.title) ?? s[s.length - 1]).buttons.push(n), t.add(n);
  }
  return s;
}
function R0(s) {
  try {
    localStorage.setItem(Ja, JSON.stringify(s));
  } catch {
  }
}
function P0() {
  try {
    localStorage.removeItem(Ja);
  } catch {
  }
  return Th();
}
const L0 = `# FACADE\xB7CAD \u2014 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F\r
\r
\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0434\u043B\u044F \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u044F \u0444\u0430\u0441\u0430\u0434\u043E\u0432 \u043F\u0440\u044F\u043C\u043E \u043F\u043E \u043E\u0431\u043B\u0430\u043A\u0443 \u0442\u043E\u0447\u0435\u043A. \u0412\u044B \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0435 \u0441\u043A\u0430\u043D\r
\u0437\u0434\u0430\u043D\u0438\u044F, \u0432\u044B\u0434\u0435\u043B\u044F\u0435\u0442\u0435 \u043D\u0443\u0436\u043D\u0443\u044E \u0441\u0442\u0435\u043D\u0443, \u0437\u0430\u0434\u0430\u0451\u0442\u0435 \u0441\u0438\u0441\u0442\u0435\u043C\u0443 \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442 \u0432\u0434\u043E\u043B\u044C \u043D\u0435\u0451 \u2014 \u0438\r
\u0447\u0435\u0440\u0442\u0438\u0442\u0435 \u0444\u0430\u0441\u0430\u0434 \u043F\u0440\u0438\u0432\u044B\u0447\u043D\u044B\u043C\u0438 \u043A\u043E\u043C\u0430\u043D\u0434\u0430\u043C\u0438, \u043F\u0440\u0438\u0432\u044F\u0437\u044B\u0432\u0430\u044F\u0441\u044C \u043A \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u043C \u0442\u043E\u0447\u043A\u0430\u043C \u0441\u043A\u0430\u043D\u0430.\r
\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0443\u0445\u043E\u0434\u0438\u0442 \u0432 AutoCAD \u0447\u0435\u0440\u0435\u0437 DXF \u0438\u043B\u0438 \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u0441\u043A\u0440\u0438\u043F\u0442\u043E\u043C.\r
\r
---\r
\r
## 1. \u041D\u0430\u0447\u0430\u043B\u043E \u0440\u0430\u0431\u043E\u0442\u044B\r
\r
\u041F\u0440\u0438 \u0437\u0430\u043F\u0443\u0441\u043A\u0435 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0439 \u044D\u043A\u0440\u0430\u043D:\r
\r
- **\u0418\u041C\u041F\u041E\u0420\u0422\u0418\u0420\u041E\u0412\u0410\u0422\u042C \u041E\u0411\u041B\u0410\u041A\u041E** \u2014 \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u0444\u0430\u0439\u043B \u0441\u043A\u0430\u043D\u0430. \u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0442\u0441\u044F\r
  **LAS**, **LAZ** (\u0432 \u0442\u043E\u043C \u0447\u0438\u0441\u043B\u0435 COPC), **E57** \u0438 \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0435\r
  **XYZ / TXT / PTS / ASC / CSV** \u0444\u043E\u0440\u043C\u0430\u0442\u0430 \`x y z [r g b]\`.\r
  \u0421\u044A\u0451\u043C\u043A\u0430 \u0438\u0437 **\u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u0445 \u043A\u0443\u0441\u043A\u043E\u0432** (\u043F\u043E \u0444\u0430\u0439\u043B\u0443 \u043D\u0430 \u0441\u0442\u043E\u044F\u043D\u043A\u0443 \u0441\u043A\u0430\u043D\u0435\u0440\u0430) \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F\r
  \u0437\u0430 \u043E\u0434\u0438\u043D \u0440\u0430\u0437: \u0432\u044B\u0434\u0435\u043B\u0438\u0442\u0435 \u0432 \u0434\u0438\u0430\u043B\u043E\u0433\u0435 \u0432\u0441\u0435 \u0444\u0430\u0439\u043B\u044B \u0441\u0440\u0430\u0437\u0443 \u2014 \u043A\u0443\u0441\u043A\u0438 \u0441\u043A\u043B\u0435\u044F\u0442\u0441\u044F \u0432 \u043E\u0434\u043D\u043E\r
  \u043E\u0431\u043B\u0430\u043A\u043E \u043F\u043E \u0438\u0445 \u0433\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u0430\u043C. \u0424\u043E\u0440\u043C\u0430\u0442\u044B \u043C\u043E\u0436\u043D\u043E \u0441\u043C\u0435\u0448\u0438\u0432\u0430\u0442\u044C.\r
- **\u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0434\u0435\u043C\u043E-\u043E\u0431\u043B\u0430\u043A\u043E** \u2014 \u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0435 \u0437\u0434\u0430\u043D\u0438\u0435, \u0447\u0442\u043E\u0431\u044B \u043E\u0441\u0432\u043E\u0438\u0442\u044C\u0441\u044F \u0431\u0435\u0437\r
  \u0441\u0432\u043E\u0435\u0433\u043E \u0444\u0430\u0439\u043B\u0430.\r
\r
\u041A\u0440\u0443\u043F\u043D\u044B\u0435 \u0444\u0430\u0439\u043B\u044B \u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u0432 \u0444\u043E\u043D\u0435: \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u043D\u0435 \u0437\u0430\u043C\u0438\u0440\u0430\u0435\u0442, \u0430 \u0432 \u0446\u0435\u043D\u0442\u0440\u0435 \u044D\u043A\u0440\u0430\u043D\u0430\r
\u0438\u0434\u0451\u0442 \u0441\u0447\u0451\u0442\u0447\u0438\u043A \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u043E\u0432. LAZ \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 COPC \u043F\u043E\u0434\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044F \u043F\u043E \u0443\u0440\u043E\u0432\u043D\u044F\u043C\r
\u0434\u0435\u0442\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E LAZ.\r
\r
---\r
\r
## 2. \u0422\u0440\u0438 \u043E\u043A\u043D\u0430 \u043D\u0430 \u044D\u043A\u0440\u0430\u043D\u0435\r
\r
| \u041E\u043A\u043D\u043E | \u0413\u0434\u0435 | \u0427\u0442\u043E \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 |\r
|---|---|---|\r
| **\u0413\u043B\u0430\u0432\u043D\u043E\u0435** | \u0441\u043B\u0435\u0432\u0430 | \u041F\u043B\u0430\u043D (\u0432\u0438\u0434 \u0441\u0432\u0435\u0440\u0445\u0443) \u0434\u043E \u0437\u0430\u0434\u0430\u043D\u0438\u044F \u041F\u0421\u041A, \u0434\u0430\u043B\u044C\u0448\u0435 \u2014 \u0444\u0430\u0441\u0430\u0434, \u0432 \u043A\u043E\u0442\u043E\u0440\u043E\u043C \u0432\u044B \u0447\u0435\u0440\u0442\u0438\u0442\u0435 |\r
| **\u0421\u0435\u0447\u0435\u043D\u0438\u0435** | \u0441\u043F\u0440\u0430\u0432\u0430 \u0441\u0432\u0435\u0440\u0445\u0443 | \u0422\u043E\u043D\u043A\u0438\u0439 \u0440\u0430\u0437\u0440\u0435\u0437 \u0441\u0442\u0440\u043E\u0433\u043E \u0432 \u0442\u043E\u0447\u043A\u0435 \u043A\u0443\u0440\u0441\u043E\u0440\u0430 \u2014 \xAB\u043C\u0438\u043A\u0440\u043E\u0441\u043A\u043E\u043F\xBB \u043F\u043E \u0433\u043B\u0443\u0431\u0438\u043D\u0435 |\r
| **3D \xB7 \u041E\u0431\u0437\u043E\u0440** | \u0441\u043F\u0440\u0430\u0432\u0430 \u0441\u043D\u0438\u0437\u0443 | \u041E\u0431\u044A\u0451\u043C\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0438\u043D\u0430: \u043A\u0443\u0434\u0430 \u043B\u0435\u0433\u043B\u0430 \u0442\u043E\u0447\u043A\u0430 \u043D\u0430 \u0441\u0430\u043C\u043E\u043C \u0434\u0435\u043B\u0435 |\r
\r
\u0427\u0435\u0440\u0442\u0438\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0432 \u0433\u043B\u0430\u0432\u043D\u043E\u043C \u043E\u043A\u043D\u0435, \u0430 \u0434\u0432\u0430 \u0434\u0440\u0443\u0433\u0438\u0445 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u0442\u043E \u0436\u0435 \u0441\u0430\u043C\u043E\u0435 \u0441\r
\u0434\u0440\u0443\u0433\u0438\u0445 \u0441\u0442\u043E\u0440\u043E\u043D \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u043E.\r
\r
**\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F** \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u0430 \u0432\u043E \u0432\u0441\u0435\u0445 \u043E\u043A\u043D\u0430\u0445:\r
\r
- **\u043A\u043E\u043B\u0435\u0441\u043E \u043C\u044B\u0448\u0438** \u2014 \u0437\u0443\u043C \u043A \u043F\u043E\u0437\u0438\u0446\u0438\u0438 \u043A\u0443\u0440\u0441\u043E\u0440\u0430;\r
- **\u0441\u0440\u0435\u0434\u043D\u044F\u044F \u043A\u043D\u043E\u043F\u043A\u0430 \u043C\u044B\u0448\u0438** \u2014 \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430;\r
- \u0432 3D-\u043E\u043A\u043D\u0435 **\u0441\u0440\u0435\u0434\u043D\u044F\u044F \u043A\u043D\u043E\u043F\u043A\u0430** \u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0432\u0438\u0434 (\u0430 \u043A\u043E\u0433\u0434\u0430 \u0430\u043A\u0442\u0438\u0432\u0435\u043D \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\r
  \xAB\u0412\u044B\u0431\u043E\u0440\xBB \u2014 \u0432\u0440\u0430\u0449\u0430\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0438 \u043B\u0435\u0432\u043E\u0439).\r
\r
---\r
\r
## 3. \u0420\u0430\u0431\u043E\u0447\u0438\u0439 \u043F\u0440\u043E\u0446\u0435\u0441\u0441: \u0447\u0435\u0442\u044B\u0440\u0435 \u0448\u0430\u0433\u0430\r
\r
\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0432\u0435\u0434\u0451\u0442 \u0432\u0430\u0441 \u043F\u043E \u0448\u0430\u0433\u0430\u043C \u2014 \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430 \u0432\u043D\u0438\u0437\u0443 \u044D\u043A\u0440\u0430\u043D\u0430 \u0432\u0441\u0435\u0433\u0434\u0430 \u0433\u043E\u0432\u043E\u0440\u0438\u0442,\r
\u0447\u0442\u043E \u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441.\r
\r
### \u0428\u0430\u0433 1. \u0412\u044B\u0434\u0435\u043B\u0438\u0442\u044C \u0441\u0442\u0435\u043D\u0443\r
\r
\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 **\u0421\u0422\u0415\u041D\u0410**. \u041D\u0430 \u0432\u0438\u0434\u0435 \u0441\u0432\u0435\u0440\u0445\u0443 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0443\u0436\u043D\u0443\u044E \u0441\u0442\u0435\u043D\u0443 \u043A\u043E\u043D\u0442\u0443\u0440\u043E\u043C:\r
\u043A\u043B\u0438\u043A\u0430\u0439\u0442\u0435 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u043B\u0435\u0432\u043E\u0439 \u043A\u043D\u043E\u043F\u043A\u043E\u0439, \u0437\u0430\u0442\u0435\u043C **Enter** \u0438\u043B\u0438 **\u043F\u0440\u0430\u0432\u0430\u044F \u043A\u043D\u043E\u043F\u043A\u0430** \u2014\r
\u043A\u043E\u043D\u0442\u0443\u0440 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u0441\u044F, \u0438 \u0432 \u0440\u0430\u0431\u043E\u0442\u0435 \u043E\u0441\u0442\u0430\u043D\u0443\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E\u0447\u043A\u0438 \u044D\u0442\u043E\u0439 \u0441\u0442\u0435\u043D\u044B.\r
**Esc** \u2014 \u0441\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0438 \u043D\u0430\u0447\u0430\u0442\u044C \u043A\u043E\u043D\u0442\u0443\u0440 \u0437\u0430\u043D\u043E\u0432\u043E.\r
\r
### \u0428\u0430\u0433 2. \u0417\u0430\u0434\u0430\u0442\u044C \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0441\u0440\u0435\u0437\u0430 (\u0432\u0438\u0434 \u0441\u0431\u043E\u043A\u0443)\r
\r
\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 **\u0423\u0420\u041E\u0412\u0415\u041D\u042C** \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F \u0441\u0430\u043C, \u0438 \u0433\u043B\u0430\u0432\u043D\u043E\u0435 \u043E\u043A\u043D\u043E \u0440\u0430\u0437\u0432\u043E\u0440\u0430\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044F\r
**\u0441\u0431\u043E\u043A\u0443** \u2014 \u0432\u044B \u0432\u0438\u0434\u0438\u0442\u0435 \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u0443\u044E \u0441\u0442\u0435\u043D\u0443 \u0432 \u0444\u0430\u0441, \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435.\r
\r
\u0417\u0430\u0447\u0435\u043C \u044D\u0442\u043E \u043D\u0443\u0436\u043D\u043E: \u043D\u0430 \u043E\u0431\u044B\u0447\u043D\u043E\u043C \u0432\u0438\u0434\u0435 \u0441\u0432\u0435\u0440\u0445\u0443 \u0432 \u043E\u0434\u043D\u0443 \u043A\u0430\u0448\u0443 \u0441\u0432\u0430\u043B\u0438\u0432\u0430\u044E\u0442\u0441\u044F \u043A\u0440\u043E\u0432\u043B\u044F,\r
\u0437\u0435\u043C\u043B\u044F, \u043A\u0443\u0441\u0442\u044B \u0438 \u043A\u0430\u0440\u043D\u0438\u0437\u044B, \u0438 \u043B\u0438\u043D\u0438\u044E \u0441\u0442\u0435\u043D\u044B \u0432 \u043D\u0435\u0439 \u043D\u0435 \u043F\u043E\u0439\u043C\u0430\u0442\u044C. \u041F\u043E\u044D\u0442\u043E\u043C\u0443 \u0441\u043D\u0430\u0447\u0430\u043B\u0430\r
\u0431\u0435\u0440\u0451\u0442\u0441\u044F **\u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0440\u0435\u0437**:\r
\r
- \u0441\u043B\u0435\u0432\u0430 \u0438\u0434\u0451\u0442 **\u0448\u043A\u0430\u043B\u0430 \u043E\u0442\u043C\u0435\u0442\u043E\u043A** \u0432 \u043C\u0435\u0442\u0440\u0430\u0445, \u0430 \u0437\u0430 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C \u2014 \u043F\u0443\u043D\u043A\u0442\u0438\u0440\u043D\u0430\u044F \u043B\u0438\u043D\u0438\u044F\r
  \u0441 \u0435\u0433\u043E \u0432\u044B\u0441\u043E\u0442\u043E\u0439, \u0442\u0430\u043A \u0447\u0442\u043E \u0432\u0438\u0434\u043D\u043E, \u043D\u0430 \u043A\u0430\u043A\u043E\u0439 \u043E\u0442\u043C\u0435\u0442\u043A\u0435 \u0432\u044B \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0435\u0441\u044C;\r
- **\u043A\u043B\u0438\u043A \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435** \u043F\u0440\u044F\u043C\u043E \u0432 \u043E\u043A\u043D\u0435 \u0441\u0442\u0430\u0432\u0438\u0442 \u0441\u0440\u0435\u0437 \u0442\u0443\u0434\u0430;\r
- **\u041E\u0422\u041C** \u2014 \u043E\u0442\u043C\u0435\u0442\u043A\u0430 \u0441\u0440\u0435\u0437\u0430 (\u0441\u0435\u0440\u0435\u0434\u0438\u043D\u0430), **\u0413\u041B\u0423\u0411** \u2014 \u0435\u0433\u043E \u0433\u043B\u0443\u0431\u0438\u043D\u0430 \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435;\r
  \u043E\u0431\u0430 \u043C\u043E\u0436\u043D\u043E \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u044F\u043D\u0443\u0442\u044C \u043F\u043E\u043B\u0437\u0443\u043D\u043A\u043E\u043C, \u043D\u043E \u0438 **\u0432\u0432\u0435\u0441\u0442\u0438 \u0447\u0438\u0441\u043B\u043E\u043C** \u0432 \u043F\u043E\u043B\u0435\r
  \u0440\u044F\u0434\u043E\u043C (Enter \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u0435\u0442);\r
- \u0440\u044F\u0434\u043E\u043C \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u044B \u0433\u0440\u0430\u043D\u0438\u0446\u044B \u0441\u0440\u0435\u0437\u0430, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \`4.17\u20264.33\`;\r
- \u0437\u0435\u043B\u0451\u043D\u0430\u044F \u043F\u043E\u043B\u043E\u0441\u0430 \u043D\u0430 \u043E\u0431\u043B\u0430\u043A\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0447\u0442\u043E \u0438\u043C\u0435\u043D\u043D\u043E \u043F\u043E\u043F\u0430\u0434\u0451\u0442 \u0432 \u0441\u0440\u0435\u0437;\r
- **\u041A \u041F\u041B\u0410\u041D\u0423 \u2192** (\u0438\u043B\u0438 **Enter**) \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0432\u0438\u0434 \u0441\u0432\u0435\u0440\u0445\u0443.\r
\r
\u0412\u043D\u0438\u0437\u0443, \u0432 \u0441\u0442\u0440\u043E\u043A\u0435 \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442, \u0432\u0441\u0451 \u0432\u0440\u0435\u043C\u044F \u0432\u0438\u0434\u043D\u043E: **\u041E\u0422\u041C\u0415\u0422\u041A\u0410** \u043F\u043E\u0434 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C \u0438\r
\u0442\u0435\u043A\u0443\u0449\u0438\u0435 \u0433\u0440\u0430\u043D\u0438\u0446\u044B \u0441\u0440\u0435\u0437\u0430.\r
\r
\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0441\u0440\u0435\u0437 \u0432\u0441\u0442\u0430\u0451\u0442 \u043D\u0430 1.5 \u043C \u043D\u0430\u0434 \u043D\u0438\u0437\u043E\u043C \u0441\u0442\u0435\u043D\u044B \u2014 \u044D\u0442\u043E \u043F\u0440\u0438\u0432\u044B\u0447\u043D\u0430\u044F \u0432\u044B\u0441\u043E\u0442\u0430\r
\u043F\u043B\u0430\u043D\u0430. \u0413\u043B\u0443\u0431\u0438\u043D\u0430 10\u201330 \u0441\u043C \u043E\u0431\u044B\u0447\u043D\u043E \u0434\u0430\u0451\u0442 \u0441\u0430\u043C\u0443\u044E \u0447\u0438\u0441\u0442\u0443\u044E \u043B\u0438\u043D\u0438\u044E.\r
\r
### \u0428\u0430\u0433 3. \u0417\u0430\u0434\u0430\u0442\u044C \u041F\u0421\u041A (\u0441\u0438\u0441\u0442\u0435\u043C\u0443 \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442 \u0441\u0442\u0435\u043D\u044B)\r
\r
\u0412\u0438\u0434 \u0441\u0432\u0435\u0440\u0445\u0443 \u0442\u0435\u043F\u0435\u0440\u044C \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 **\u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E\u043D\u043A\u0438\u0439 \u0441\u0440\u0435\u0437** \u2014 \u0441\u0442\u0435\u043D\u0430 \u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u043A\u0430\u043A\r
\u043E\u0434\u043D\u0430 \u0447\u0438\u0441\u0442\u0430\u044F \u043B\u0438\u043D\u0438\u044F. \u041A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 **\u0434\u0432\u0435 \u0442\u043E\u0447\u043A\u0438 \u0432\u0434\u043E\u043B\u044C \u043D\u0435\u0451** \u2014 \u043F\u043E \u043D\u0438\u043C \u043F\u043E\u0439\u0434\u0451\u0442\r
\u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u0430\u044F \u043E\u0441\u044C X. \u041F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043F\u0440\u0438 \u044D\u0442\u043E\u043C \u043B\u043E\u0432\u0438\u0442 \u0442\u043E\u0447\u043A\u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u0438\u0437 \u0441\u0440\u0435\u0437\u0430, \u0442\u0430\u043A\r
\u0447\u0442\u043E \u041F\u0421\u041A \u0441\u0430\u0434\u0438\u0442\u0441\u044F \u0440\u043E\u0432\u043D\u043E \u043D\u0430 \u0441\u0442\u0435\u043D\u0443, \u0430 \u043D\u0435 \u043D\u0430 \u043A\u0443\u0441\u0442 \u043F\u0435\u0440\u0435\u0434 \u043D\u0435\u0439.\r
\r
\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0440\u0430\u0437\u0432\u0435\u0440\u043D\u0451\u0442 \u0433\u043B\u0430\u0432\u043D\u043E\u0435 \u043E\u043A\u043D\u043E \xAB\u043B\u0438\u0446\u043E\u043C\xBB \u043A \u0444\u0430\u0441\u0430\u0434\u0443, \u0438 \u0434\u0430\u043B\u044C\u0448\u0435 \u0432\u0441\u0435\r
\u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B \u0438 \u0440\u0430\u0437\u043C\u0435\u0440\u044B \u0441\u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 \u044D\u0442\u043E\u0439 \u0441\u0442\u0435\u043D\u044B.\r
\r
\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0441\u0440\u0435\u0437\u0430 \u043C\u043E\u0436\u043D\u043E \u043F\u043E\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432 \u043B\u044E\u0431\u043E\u0439 \u043C\u043E\u043C\u0435\u043D\u0442: \u043A\u043D\u043E\u043F\u043A\u0430 **\u0423\u0420\u041E\u0412\u0415\u041D\u042C** \u0432 \u043B\u0435\u043D\u0442\u0435\r
\u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0432\u0438\u0434 \u0441\u0431\u043E\u043A\u0443, **Enter** \u2014 \u043E\u0431\u0440\u0430\u0442\u043D\u043E \u043A \u043F\u043B\u0430\u043D\u0443.\r
\r
\u041A\u0430\u0436\u0434\u0430\u044F \u0441\u0442\u0435\u043D\u0430 \u2014 \u0441\u0432\u043E\u044F \u041F\u0421\u041A. \u0412\u0441\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0435 \u041F\u0421\u041A \u043B\u0435\u0436\u0430\u0442 \u0432 \u0432\u044B\u043F\u0430\u0434\u0430\u044E\u0449\u0435\u043C \u0441\u043F\u0438\u0441\u043A\u0435 \u0432\r
\u043F\u0440\u0430\u0432\u043E\u043C \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0443\u0433\u043B\u0443; \u043A\u043D\u043E\u043F\u043A\u0430 **\u270E** \u0440\u044F\u0434\u043E\u043C \u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u044B\u0432\u0430\u0435\u0442 \u0442\u0435\u043A\u0443\u0449\u0443\u044E.\r
\r
**\u041C\u0421\u041A** \u0432 \u044D\u0442\u043E\u043C \u0441\u043F\u0438\u0441\u043A\u0435 \u2014 \u043E\u0431\u0449\u0438\u0439 \u043E\u0431\u0437\u043E\u0440 \u0432\u0441\u0435\u0433\u043E \u043E\u0431\u043B\u0430\u043A\u0430 \u0438 \u043E\u0434\u043D\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u0441\u0442\u0430\u0440\u0442\r
\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0444\u0430\u0441\u0430\u0434\u0430: \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u0435\u0436\u043D\u0435\u0439 \u0441\u0442\u0435\u043D\u044B \u0441\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0435\u0442\u0441\u044F, \u043B\u0430\u0441\u0441\u043E \u0443\u0436\u0435 \u0432\r
\u0440\u0443\u043A\u0435 \u2014 \u043E\u0431\u0432\u043E\u0434\u0438\u0442\u0435 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u043A\u0443\u0441\u043E\u043A \u0438 \u0437\u0430\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u0435\u043C\u0443 \u041F\u0421\u041A. \u0427\u0435\u0440\u0442\u0451\u0436 \u043F\u0440\u0438 \u044D\u0442\u043E\u043C\r
\u043D\u0438\u043A\u0443\u0434\u0430 \u043D\u0435 \u0434\u0435\u0432\u0430\u0435\u0442\u0441\u044F; \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0433\u043E\u0442\u043E\u0432\u043E\u043C\u0443 \u0444\u0430\u0441\u0430\u0434\u0443 \u2014 \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u0435\u0433\u043E \u041F\u0421\u041A \u0438\u0437\r
\u0441\u043F\u0438\u0441\u043A\u0430.\r
\r
### \u0428\u0430\u0433 4. \u0427\u0435\u0440\u0442\u0438\u0442\u044C\r
\r
\u0414\u0430\u043B\u044C\u0448\u0435 \u2014 \u043E\u0431\u044B\u0447\u043D\u043E\u0435 \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u0435 \u043F\u043E \u0444\u0430\u0441\u0430\u0434\u0443 \u0441 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u043E\u0439 \u043A \u0442\u043E\u0447\u043A\u0430\u043C \u0441\u043A\u0430\u043D\u0430.\r
\r
---\r
\r
## 4. \u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u044F\r
\r
| \u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 | \u041A\u0430\u043A \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 |\r
|---|---|\r
| **\u041E\u0442\u0440\u0435\u0437\u043E\u043A** | \u0414\u0432\u0435 \u0442\u043E\u0447\u043A\u0438. \u0414\u043B\u0438\u043D\u0443 \u043C\u043E\u0436\u043D\u043E \u0432\u0432\u0435\u0441\u0442\u0438 \u0446\u0438\u0444\u0440\u0430\u043C\u0438 \u2014 \u043C\u044B\u0448\u044C \u0437\u0430\u0434\u0430\u0451\u0442 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 |\r
| **\u041F\u043E\u043B\u0438\u043B\u0438\u043D\u0438\u044F** | \u041A\u043B\u0438\u043A\u0430\u0439\u0442\u0435 \u0442\u043E\u0447\u043A\u0438 \u043F\u043E\u0434\u0440\u044F\u0434. **Enter/\u041F\u041A\u041C** \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C, **C** \u0437\u0430\u043C\u043A\u043D\u0443\u0442\u044C \u043A\u043E\u043D\u0442\u0443\u0440 |\r
| **\u041F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A** | \u0414\u0432\u0430 \u043A\u043B\u0438\u043A\u0430 \u043F\u043E \u0434\u0438\u0430\u0433\u043E\u043D\u0430\u043B\u0438. \u0418\u043B\u0438 \u0446\u0438\u0444\u0440\u0430\u043C\u0438: \`\u0448\u0438\u0440\u0438\u043D\u0430,\u0432\u044B\u0441\u043E\u0442\u0430\` |\r
| **\u041A\u0440\u0443\u0433** | \u0426\u0435\u043D\u0442\u0440, \u0437\u0430\u0442\u0435\u043C \u0442\u043E\u0447\u043A\u0430 \u0440\u0430\u0434\u0438\u0443\u0441\u0430. \u0418\u043B\u0438 \u0440\u0430\u0434\u0438\u0443\u0441 \u0446\u0438\u0444\u0440\u0430\u043C\u0438 |\r
| **\u0414\u0443\u0433\u0430** | \u0422\u0440\u0438 \u0442\u043E\u0447\u043A\u0438: \u043D\u0430\u0447\u0430\u043B\u043E, \u0442\u043E\u0447\u043A\u0430 \u043D\u0430 \u0434\u0443\u0433\u0435, \u043A\u043E\u043D\u0435\u0446 |\r
| **\u042D\u043B\u043B\u0438\u043F\u0441** | \u0426\u0435\u043D\u0442\u0440, \u0437\u0430\u0442\u0435\u043C \u0443\u0433\u043B\u043E\u0432\u0430\u044F \u0442\u043E\u0447\u043A\u0430. \u0418\u043B\u0438 \u0446\u0438\u0444\u0440\u0430\u043C\u0438: \`rx,ry\` |\r
| **\u0422\u0435\u043A\u0441\u0442** | \u041A\u043B\u0438\u043A \u0432 \u0442\u043E\u0447\u043A\u0443 \u0432\u0441\u0442\u0430\u0432\u043A\u0438, \u0437\u0430\u0442\u0435\u043C \u0432\u0432\u043E\u0434 \u043D\u0430\u0434\u043F\u0438\u0441\u0438 |\r
\r
\u041F\u043E\u0441\u043B\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u044F \u043A\u043E\u043C\u0430\u043D\u0434\u044B \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0441\u0430\u043C\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442\u0441\u044F \u0432 \u0440\u0435\u0436\u0438\u043C **\u0412\u044B\u0431\u043E\u0440**.\r
**\u041F\u0440\u043E\u0431\u0435\u043B** \u0438\u043B\u0438 **Enter** \u0432 \u0440\u0435\u0436\u0438\u043C\u0435 \u0432\u044B\u0431\u043E\u0440\u0430 \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u0435\u0442 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u044E\u044E \u043A\u043E\u043C\u0430\u043D\u0434\u0443 \u2014\r
\u043A\u0430\u043A \u0432 AutoCAD.\r
\r
### \u0422\u043E\u0447\u043D\u044B\u0439 \u0432\u0432\u043E\u0434 \u0446\u0438\u0444\u0440\u0430\u043C\u0438\r
\r
\u041A\u043E\u0433\u0434\u0430 \u043A\u043E\u043C\u0430\u043D\u0434\u0430 \u0436\u0434\u0451\u0442 \u0432\u0442\u043E\u0440\u0443\u044E \u0442\u043E\u0447\u043A\u0443, \u043F\u0440\u043E\u0441\u0442\u043E \u043D\u0430\u0431\u0438\u0440\u0430\u0439\u0442\u0435 \u0447\u0438\u0441\u043B\u043E \u2014 \u0440\u044F\u0434\u043E\u043C \u0441\r
\u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u043F\u043E\u043B\u0435 \u0432\u0432\u043E\u0434\u0430:\r
\r
- \`2.5\` + Enter \u2014 \u043E\u0442\u043B\u043E\u0436\u0438\u0442\u044C 2.5 \u043C \u0432 \u0441\u0442\u043E\u0440\u043E\u043D\u0443 \u043A\u0443\u0440\u0441\u043E\u0440\u0430;\r
- \`3,1.2\` + Enter \u2014 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043D\u0430 3 \u043C \u043F\u043E X \u0438 1.2 \u043C \u043F\u043E Y \u043E\u0442 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0439 \u0442\u043E\u0447\u043A\u0438;\r
- \u0434\u043B\u044F \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u0430 \u0447\u0438\u0441\u043B\u043E \u043E\u0437\u043D\u0430\u0447\u0430\u0435\u0442 **\u0433\u0440\u0430\u0434\u0443\u0441\u044B**, \u0434\u043B\u044F \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0430 \u2014 **\u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442**,\r
  \u0434\u043B\u044F \u043A\u0440\u0443\u0433\u0430 \u2014 **\u0440\u0430\u0434\u0438\u0443\u0441**.\r
\r
**Backspace** \u0441\u0442\u0438\u0440\u0430\u0435\u0442 \u0441\u0438\u043C\u0432\u043E\u043B, **Esc** \u043E\u0442\u043C\u0435\u043D\u044F\u0435\u0442 \u0432\u0432\u043E\u0434.\r
\r
---\r
\r
## 5. \u041F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u0438 \u043E\u0440\u0442\u043E\r
\r
- **\u041F\u0420\u0418\u0412\u042F\u0417\u041A\u0410** (\u043A\u043B\u0430\u0432\u0438\u0448\u0430 **S**) \u2014 \u043A\u0443\u0440\u0441\u043E\u0440 \u0446\u0435\u043F\u043B\u044F\u0435\u0442\u0441\u044F \u043A \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0439 \u0442\u043E\u0447\u043A\u0435 \u0441\u043A\u0430\u043D\u0430\r
  \u0438\u043B\u0438 \u043A \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u0435 \u0447\u0435\u0440\u0442\u0435\u0436\u0430: \u043A\u043E\u043D\u0446\u0430\u043C \u0438 \u0441\u0435\u0440\u0435\u0434\u0438\u043D\u0430\u043C \u043E\u0442\u0440\u0435\u0437\u043A\u043E\u0432, \u0446\u0435\u043D\u0442\u0440\u0430\u043C \u0438\r
  \u043A\u0432\u0430\u0434\u0440\u0430\u043D\u0442\u0430\u043C \u043E\u043A\u0440\u0443\u0436\u043D\u043E\u0441\u0442\u0435\u0439, \u043A\u043E\u043D\u0446\u0430\u043C \u0434\u0443\u0433. \u0417\u0430\u0445\u0432\u0430\u0442 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F **\u0437\u0435\u043B\u0451\u043D\u044B\u043C\r
  \u043A\u0432\u0430\u0434\u0440\u0430\u0442\u043E\u043C**; \u0438\u0449\u0435\u0442\u0441\u044F \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0430\u044F \u0446\u0435\u043B\u044C \u0432 \u0440\u0430\u0434\u0438\u0443\u0441\u0435 15 \u043F\u0438\u043A\u0441\u0435\u043B\u0435\u0439.\r
- **\u041E\u0420\u0422\u041E** (\u043A\u043B\u0430\u0432\u0438\u0448\u0430 **F8**) \u2014 \u043B\u0438\u043D\u0438\u0438 \u0438\u0434\u0443\u0442 \u0441\u0442\u0440\u043E\u0433\u043E \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u043E \u0438\u043B\u0438\r
  \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u043E \u0432 \u043E\u0441\u044F\u0445 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u0441\u0442\u0435\u043D\u044B. \u0423\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u043D\u0438\u0435 **Shift** \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\r
  \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0440\u0435\u0436\u0438\u043C \u043D\u0430 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u043F\u043E\u043B\u043E\u0436\u043D\u044B\u0439.\r
\r
\u041E\u0431\u0435 \u043A\u043D\u043E\u043F\u043A\u0438-\u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u0430 \u043D\u0430\u0445\u043E\u0434\u044F\u0442\u0441\u044F \u0432 \u043F\u0440\u0430\u0432\u043E\u043C \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0443\u0433\u043B\u0443 \u0438 \u0437\u0430\u0433\u043E\u0440\u0430\u044E\u0442\u0441\u044F\r
\u0437\u0435\u043B\u0451\u043D\u044B\u043C, \u043A\u043E\u0433\u0434\u0430 \u0440\u0435\u0436\u0438\u043C \u0432\u043A\u043B\u044E\u0447\u0451\u043D.\r
\r
---\r
\r
## 6. \u0412\u044B\u0431\u043E\u0440 \u043E\u0431\u044A\u0435\u043A\u0442\u043E\u0432 \u0438 \u043F\u0440\u0430\u0432\u043A\u0430\r
\r
**\u0412\u044B\u0431\u043E\u0440** \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043A\u0430\u043A \u0432 AutoCAD:\r
\r
- **\u043A\u043B\u0438\u043A** \u043F\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u0443 \u2014 \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u0435\u0433\u043E;\r
- **Ctrl+\u043A\u043B\u0438\u043A** \u0438\u043B\u0438 **Shift+\u043A\u043B\u0438\u043A** \u2014 \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043A \u0432\u044B\u0431\u043E\u0440\u0443 \u0438\u043B\u0438 \u0443\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u043D\u0435\u0433\u043E;\r
- **\u0440\u0430\u043C\u043A\u0430 \u0441\u043B\u0435\u0432\u0430 \u043D\u0430\u043F\u0440\u0430\u0432\u043E** \u2014 \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E, \u0447\u0442\u043E \u043F\u043E\u043F\u0430\u043B\u043E **\u0446\u0435\u043B\u0438\u043A\u043E\u043C**;\r
- **\u0440\u0430\u043C\u043A\u0430 \u0441\u043F\u0440\u0430\u0432\u0430 \u043D\u0430\u043B\u0435\u0432\u043E** \u2014 \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u0442 \u0432\u0441\u0451, \u0447\u0435\u0433\u043E \u0440\u0430\u043C\u043A\u0430 **\u043A\u043E\u0441\u043D\u0443\u043B\u0430\u0441\u044C**;\r
- **Esc** \u0441\u043D\u0438\u043C\u0430\u0435\u0442 \u0432\u044B\u0431\u043E\u0440, **Del** \u0443\u0434\u0430\u043B\u044F\u0435\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0435.\r
\r
\u041A\u043E\u043C\u0430\u043D\u0434\u044B \u043F\u0440\u0430\u0432\u043A\u0438: **\u041F\u0435\u0440\u0435\u043D\u043E\u0441**, **\u041A\u043E\u043F\u0438\u044F** (\u0441\u0442\u0430\u0432\u0438\u0442 \u043A\u043E\u043F\u0438\u0438 \u0434\u043E \u043D\u0430\u0436\u0430\u0442\u0438\u044F Esc),\r
**\u041F\u043E\u0432\u043E\u0440\u043E\u0442**, **\u041C\u0430\u0441\u0448\u0442\u0430\u0431**, **\u0417\u0435\u0440\u043A\u0430\u043B\u043E**, **\u041D\u043E\u0436\u043D\u0438\u0446\u044B** (\u0432\u044B\u0440\u0435\u0437\u0430\u044E\u0442 \u0443\u0447\u0430\u0441\u0442\u043E\u043A\r
\u043B\u0438\u043D\u0438\u0438 \u043C\u0435\u0436\u0434\u0443 \u043F\u0435\u0440\u0435\u0441\u0435\u0447\u0435\u043D\u0438\u044F\u043C\u0438), **\u0421\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C** (\u0441\u0440\u0430\u0449\u0438\u0432\u0430\u0435\u0442 \u0434\u0432\u0435 \u043B\u0438\u043D\u0438\u0438 \u0441\r
\u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0449\u0438\u043C\u0438 \u043A\u043E\u043D\u0446\u0430\u043C\u0438), **\u0423\u0434\u0430\u043B\u0438\u0442\u044C**.\r
\r
\u0415\u0441\u043B\u0438 \u043F\u0435\u0440\u0435\u0434 \u043A\u043E\u043C\u0430\u043D\u0434\u043E\u0439 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0432\u044B\u0431\u0440\u0430\u043D\u043E, \u043C\u043E\u0436\u043D\u043E \u043F\u0440\u043E\u0441\u0442\u043E \u043A\u043B\u0438\u043A\u043D\u0443\u0442\u044C \u043E\u0431\u044A\u0435\u043A\u0442 \u2014\r
\u043E\u043D \u0432\u044B\u0431\u0435\u0440\u0435\u0442\u0441\u044F \u043D\u0430 \u043C\u0435\u0441\u0442\u0435.\r
\r
**Ctrl+Z** \u043E\u0442\u043C\u0435\u043D\u044F\u0435\u0442 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435, **Ctrl+Y** \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442. \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0445\u0440\u0430\u043D\u0438\u0442\r
50 \u0448\u0430\u0433\u043E\u0432.\r
\r
---\r
\r
## 7. \u0421\u043B\u043E\u0438\r
\r
\u041A\u043D\u043E\u043F\u043A\u0430 **\u0421\u041B\u041E\u0418** \u0432 \u043B\u0435\u043D\u0442\u0435 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u043F\u0430\u043D\u0435\u043B\u044C. \u041F\u0430\u043D\u0435\u043B\u044C \u043C\u043E\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u044C \u0437\u0430\r
\u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0432 \u0443\u0434\u043E\u0431\u043D\u043E\u0435 \u043C\u0435\u0441\u0442\u043E.\r
\r
\u0412 \u043A\u0430\u0436\u0434\u043E\u0439 \u0441\u0442\u0440\u043E\u043A\u0435 \u0441\u043B\u043E\u044F, \u0441\u043B\u0435\u0432\u0430 \u043D\u0430\u043F\u0440\u0430\u0432\u043E:\r
\r
| \u042D\u043B\u0435\u043C\u0435\u043D\u0442 | \u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 |\r
|---|---|\r
| **\u043A\u0440\u0443\u0436\u043E\u043A** | \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u043B\u043E\u0439 \u0442\u0435\u043A\u0443\u0449\u0438\u043C \u2014 \u043D\u0430 \u043D\u0451\u043C \u043F\u043E\u044F\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u043D\u043E\u0432\u044B\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B |\r
| **\u043A\u0432\u0430\u0434\u0440\u0430\u0442 \u0446\u0432\u0435\u0442\u0430** | \u0446\u0432\u0435\u0442 \u0441\u043B\u043E\u044F (\u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u043F\u0430\u043B\u0438\u0442\u0440\u0443) |\r
| **\u0438\u043C\u044F** | \u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043B\u0438\u043A \u2014 \u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u0442\u044C |\r
| **\u0442\u0438\u043F \u043B\u0438\u043D\u0438\u0438** | \u0441\u043F\u043B\u043E\u0448\u043D\u0430\u044F, \u0448\u0442\u0440\u0438\u0445\u043E\u0432\u0430\u044F, \u043F\u0443\u043D\u043A\u0442\u0438\u0440\u043D\u0430\u044F, \u0448\u0442\u0440\u0438\u0445\u043F\u0443\u043D\u043A\u0442\u0438\u0440\u043D\u0430\u044F |\r
| **\u0442\u043E\u043B\u0449\u0438\u043D\u0430** | \u043E\u0442 0.13 \u0434\u043E 2.0 \u043C\u043C \u043F\u043E \u0413\u041E\u0421\u0422 |\r
| **\u0447\u0438\u0441\u043B\u043E** | \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u043E\u0432 \u043B\u0435\u0436\u0438\u0442 \u043D\u0430 \u0441\u043B\u043E\u0435 |\r
| **\u0433\u043B\u0430\u0437** | \u0441\u043A\u0440\u044B\u0442\u044C \u0441\u043B\u043E\u0439 (\u0441\u043A\u0440\u044B\u0442\u043E\u0435 \u043D\u0435 \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u0442\u0441\u044F \u0438 \u043D\u0435 \u043B\u043E\u0432\u0438\u0442 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0443) |\r
| **\u2715** | \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0441\u043B\u043E\u0439; \u0435\u0433\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u044B \u043F\u0435\u0440\u0435\u0435\u0434\u0443\u0442 \u043D\u0430 \u0441\u043B\u043E\u0439 \xAB0\xBB |\r
\r
\u0412\u043D\u0438\u0437\u0443 \u043F\u0430\u043D\u0435\u043B\u0438: **+ \u0421\u043B\u043E\u0439** \u0441\u043E\u0437\u0434\u0430\u0451\u0442 \u043D\u043E\u0432\u044B\u0439 \u0438 \u0434\u0435\u043B\u0430\u0435\u0442 \u0435\u0433\u043E \u0442\u0435\u043A\u0443\u0449\u0438\u043C,\r
**\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0435 \u2192 \u0441\u043B\u043E\u0439** \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0438\u0442 \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u044B\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B \u043D\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0441\u043B\u043E\u0439.\r
\r
**\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u043F\u0435\u0440\u0435\u043D\u043E\u0441 \u0438\u0437 \u0441\u0442\u0430\u0442\u0443\u0441-\u0431\u0430\u0440\u0430.** \u0420\u044F\u0434\u043E\u043C \u0441 \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u0430\u043C\u0438 \u0435\u0441\u0442\u044C \u0446\u0432\u0435\u0442\u043D\u043E\u0439\r
\u043A\u0432\u0430\u0434\u0440\u0430\u0442\u0438\u043A \u0438 \u0441\u043F\u0438\u0441\u043E\u043A \u0441\u043B\u043E\u0451\u0432:\r
\r
- \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0432\u044B\u0431\u0440\u0430\u043D\u043E \u2014 \u0441\u043F\u0438\u0441\u043E\u043A \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0441\u043B\u043E\u0439, \u0441\u043C\u0435\u043D\u0430 \u043C\u0435\u043D\u044F\u0435\u0442 \u0441\u043B\u043E\u0439\r
  \u0434\u043B\u044F \u043D\u043E\u0432\u044B\u0445 \u043E\u0431\u044A\u0435\u043A\u0442\u043E\u0432;\r
- \u0435\u0441\u0442\u044C \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u2014 \u0441\u043F\u0438\u0441\u043E\u043A \u043F\u043E\u0434\u0441\u0432\u0435\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u0433\u043E\u043B\u0443\u0431\u044B\u043C \u0438 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0441\u043B\u043E\u0439\r
  \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0445 \u043E\u0431\u044A\u0435\u043A\u0442\u043E\u0432; \u0432\u044B\u0431\u043E\u0440 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0441\u043B\u043E\u044F **\u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0438\u0442 \u0438\u0445 \u0442\u0443\u0434\u0430**, \u0446\u0432\u0435\u0442 \u0438\r
  \u0442\u0438\u043F \u043B\u0438\u043D\u0438\u0438 \u0441\u0440\u0430\u0437\u0443 \u0431\u0435\u0440\u0443\u0442\u0441\u044F \u043E\u0442 \u043D\u043E\u0432\u043E\u0433\u043E \u0441\u043B\u043E\u044F.\r
\r
\u041A\u043D\u043E\u043F\u043A\u0430 **\u0422\u041E\u041B\u0429** \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0438 \u0432\u044B\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0445 \u0442\u043E\u043B\u0449\u0438\u043D \u043B\u0438\u043D\u0438\u0439\r
(\u0430\u043D\u0430\u043B\u043E\u0433 LWDISPLAY \u0432 AutoCAD). \u0412\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u043E\u0439 \u0442\u043E\u043B\u0449\u0438\u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0442\u043E\u043D\u043A\u0430\u044F\r
\u043B\u0438\u043D\u0438\u044F \u2014 \u043D\u0430 \u0441\u0430\u043C\u043E\u043C \u0447\u0435\u0440\u0442\u0435\u0436\u0435 \u044D\u0442\u043E \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043C\u0435\u043D\u044F\u0435\u0442.\r
\r
---\r
\r
## 8. \u0420\u0430\u0431\u043E\u0442\u0430 \u0441 \u0433\u043B\u0443\u0431\u0438\u043D\u043E\u0439: \u0441\u0440\u0435\u0437 \u0438 \u0441\u0435\u0447\u0435\u043D\u0438\u0435\r
\r
\u042D\u0442\u043E \u0442\u043E, \u0440\u0430\u0434\u0438 \u0447\u0435\u0433\u043E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0438 \u0434\u0435\u043B\u0430\u043B\u0430\u0441\u044C: \u0444\u0430\u0441\u0430\u0434 \u2014 \u043F\u043B\u043E\u0441\u043A\u0438\u0439 \u0447\u0435\u0440\u0442\u0451\u0436, \u043D\u043E \u0441\u043A\u0430\u043D\r
\u043E\u0431\u044A\u0451\u043C\u043D\u044B\u0439, \u0438 \u043D\u0430\u0434\u043E \u043F\u043E\u043D\u0438\u043C\u0430\u0442\u044C, \u043A\u0443\u0434\u0430 \u0438\u043C\u0435\u043D\u043D\u043E \u043F\u043E \u0433\u043B\u0443\u0431\u0438\u043D\u0435 \u043F\u043E\u043F\u0430\u0434\u0430\u0435\u0442 \u0442\u043E\u0447\u043A\u0430.\r
\r
### \u0421\u0440\u0435\u0437 \u0444\u0430\u0441\u0430\u0434\u0430 (\u0433\u043B\u0430\u0432\u043D\u043E\u0435 \u043E\u043A\u043D\u043E)\r
\r
\u0421\u0440\u0435\u0437 \u0437\u0430\u0434\u0430\u0451\u0442\u0441\u044F **\u043F\u0440\u044F\u043C\u043E \u0432 \u043E\u043A\u043D\u0435 \u0441\u0435\u0447\u0435\u043D\u0438\u044F** \u2014 \u0442\u0430\u043C \u0433\u043B\u0443\u0431\u0438\u043D\u0430 \u0440\u0430\u0437\u043B\u043E\u0436\u0435\u043D\u0430 \u043F\u043E\r
\u044D\u043A\u0440\u0430\u043D\u0443 \u0438 \u0432\u0441\u0451 \u0432\u0438\u0434\u043D\u043E \u0433\u043B\u0430\u0437\u0430\u043C\u0438:\r
\r
- **\u043F\u0440\u043E\u0442\u044F\u043D\u0438\u0442\u0435 \u041B\u041A\u041C** \u043F\u043E \u043F\u0443\u0441\u0442\u043E\u043C\u0443 \u043C\u0435\u0441\u0442\u0443 \u2014 \u0437\u0430\u0434\u0430\u043D \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D \u0433\u043B\u0443\u0431\u0438\u043D\u044B, \u0432\r
  \u0433\u043B\u0430\u0432\u043D\u043E\u043C \u043E\u043A\u043D\u0435 \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u044D\u0442\u043E\u0442 \u0441\u043B\u043E\u0439;\r
- \u0441\u0440\u0435\u0437 \u043F\u043E\u0434\u0441\u0432\u0435\u0447\u0435\u043D \u0433\u043E\u043B\u0443\u0431\u043E\u0439 \u043F\u043E\u043B\u043E\u0441\u043E\u0439 \u0441 **\u043E\u0441\u044F\u043C\u0438-\u0433\u0440\u0430\u043D\u0438\u0446\u0430\u043C\u0438**: \u0442\u044F\u043D\u0438\u0442\u0435 \u043E\u0441\u044C \u2014\r
  \u0434\u0432\u0438\u0433\u0430\u0435\u0442\u0441\u044F \u044D\u0442\u0430 \u0433\u0440\u0430\u043D\u0438\u0446\u0430, \u0442\u044F\u043D\u0438\u0442\u0435 \u0441\u0435\u0440\u0435\u0434\u0438\u043D\u0443 \u043F\u043E\u043B\u043E\u0441\u044B \u2014 \u0432\u0435\u0441\u044C \u0441\u0440\u0435\u0437 \u0446\u0435\u043B\u0438\u043A\u043E\u043C;\r
- \u0432\u0434\u043E\u043B\u044C \u043E\u043A\u043D\u0430 \u0438\u0434\u0451\u0442 **\u043C\u0435\u0440\u043D\u0430\u044F \u0441\u0435\u0442\u043A\u0430** (\u043F\u043E\u0434\u043F\u0438\u0441\u0438 \u0432 \u043C\u043C \u043E\u0442 \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u0438 \u041F\u0421\u041A),\r
  \u043E\u0441\u0438 \u043F\u0440\u0438\u043B\u0438\u043F\u0430\u044E\u0442 \u043A \u043D\u0435\u0439 \u0441 \u0448\u0430\u0433\u043E\u043C 5 \u043C\u043C;\r
- \u0441\u043E\u043C\u043A\u043D\u0443\u043B\u0438 \u043E\u0441\u0438 \u0434\u0440\u0443\u0433 \u0432 \u0434\u0440\u0443\u0433\u0430 \u2014 \u0441\u0440\u0435\u0437 \u0432\u044B\u043A\u043B\u044E\u0447\u0438\u043B\u0441\u044F; \u0441\u043B\u0443\u0447\u0430\u0439\u043D\u044B\u0439 \u0449\u0435\u043B\u0447\u043E\u043A\r
  \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u0439 \u0441\u043B\u043E\u0439 \u043D\u0435 \u0441\u0431\u0438\u0432\u0430\u0435\u0442.\r
\r
\u041F\u043E\u043B\u043E\u0441\u043A\u0430 **\u0421\u0420\u0415\u0417** \u0432 \u0443\u0433\u043B\u0443 \u0433\u043B\u0430\u0432\u043D\u043E\u0433\u043E \u043E\u043A\u043D\u0430 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0442\u043E\u0447\u043D\u044B\u0435 \u0447\u0438\u0441\u043B\u0430: **\u041E\u0422**\r
\u0438 **\u0414\u041E** \u0432 \u043C\u043C (\u043C\u043E\u0436\u043D\u043E \u0432\u0432\u0435\u0441\u0442\u0438 \u0441 \u043A\u043B\u0430\u0432\u0438\u0430\u0442\u0443\u0440\u044B), \u0440\u044F\u0434\u043E\u043C \u0438\u0442\u043E\u0433\u043E\u0432\u0430\u044F \u0442\u043E\u043B\u0449\u0438\u043D\u0430.\r
\u041A\u043D\u043E\u043F\u043A\u0430-\u043F\u0438\u043B\u044E\u043B\u044F \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0438 \u0432\u044B\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0441\u0440\u0435\u0437. \u0422\u043E\u043D\u043A\u0438\u0439 \u0441\u0440\u0435\u0437 \u2014 \u0447\u0438\u0441\u0442\u044B\u0439 \u0441\u043B\u043E\u0439:\r
\u0432\u0438\u0434\u043D\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u044C \u0441\u0442\u0435\u043D\u044B \u0438\u043B\u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u044B\u0441\u0442\u0443\u043F \u043B\u0435\u043F\u043D\u0438\u043D\u044B.\r
\r
\u0412 \u0441\u0440\u0435\u0437\u0435 \u0432\u0438\u0434\u043D\u044B **\u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E\u0447\u043A\u0438 \u043D\u0443\u0436\u043D\u043E\u0433\u043E \u0441\u043B\u043E\u044F \u0433\u043B\u0443\u0431\u0438\u043D\u044B** \u2014 \u043D\u0438\u0448\u0438, \u043E\u0442\u043A\u043E\u0441\u044B \u0438\r
\u0443\u0433\u043B\u0443\u0431\u043B\u0435\u043D\u0438\u044F \u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u0447\u0438\u0441\u0442\u043E, \u0431\u0435\u0437 \xAB\u0448\u0443\u043C\u0430\xBB \u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0445 \u0442\u043E\u0447\u0435\u043A. **\u041F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u0442\u043E\u0436\u0435\r
\u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E \u0432\u0438\u0434\u0438\u043C\u043E\u043C\u0443 \u0441\u0440\u0435\u0437\u0443**, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u0436\u043D\u043E \u0442\u043E\u0447\u043D\u043E \u043F\u043E\u0439\u043C\u0430\u0442\u044C \u0443\u0433\u043E\u043B\r
\u043D\u0438\u0448\u0438, \u0430 \u043D\u0435 \u0442\u043E\u0447\u043A\u0443 \u043D\u0430 \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u0438 \u0444\u0430\u0441\u0430\u0434\u0430 \u043F\u0435\u0440\u0435\u0434 \u043D\u0435\u0439.\r
\r
### \u0410\u0432\u0442\u043E\u043F\u043E\u0438\u0441\u043A \u043F\u0440\u043E\u0451\u043C\u043E\u0432 \u0438 \u0440\u0435\u043B\u044C\u0435\u0444\u0430 (\u043B\u0435\u043D\u0442\u0430 \xAB\u041E\u0431\u043C\u0435\u0440\xBB \u2192 \xAB\u041F\u0440\u043E\u0451\u043C\u044B\xBB)\r
\r
\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0438\u0449\u0435\u0442 \u043F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0438 \u0432 \u0441\u0440\u0435\u0437\u0435 \u0441\u0442\u0435\u043D\u044B \u0438 \u043F\u0440\u0435\u0434\u043B\u0430\u0433\u0430\u0435\u0442 \u0438\u0445\r
\u0440\u0430\u043C\u043A\u0430\u043C\u0438-\u043A\u0430\u043D\u0434\u0438\u0434\u0430\u0442\u0430\u043C\u0438 \u2014 \u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0435\u0442\u0435 \u0438 \u043F\u0440\u0430\u0432\u0438\u0442\u0435 \u0432\u044B. \u0414\u0432\u0430 \u0440\u0435\u0436\u0438\u043C\u0430, \u043A\u043D\u043E\u043F\u043A\u0430 \u0432\r
\u043F\u0430\u043D\u0435\u043B\u0438 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0435\u0442:\r
\r
- **\u041F\u0420\u041E\u0401\u041C\u042B** \u2014 \u043F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u044B\u0435 **\u0434\u044B\u0440\u043A\u0438**: \u043E\u043A\u043D\u0430 \u0438 \u0434\u0432\u0435\u0440\u0438. \u0420\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0441\u0440\u0430\u0437\u0443 \u2014\r
  \u0441\u043B\u043E\u0439 \u0441\u0442\u0435\u043D\u044B \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438.\r
- **\u0420\u0415\u041B\u042C\u0415\u0424** \u2014 \u043F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u044B\u0435 **\u043F\u044F\u0442\u043D\u0430 \u0442\u043E\u0447\u0435\u043A**: \u043B\u0435\u043F\u043D\u0438\u043D\u0430, \u0440\u0443\u0441\u0442\u044B, \u0444\u0438\u043B\u0451\u043D\u043A\u0438.\r
  \u0417\u0430\u0434\u0430\u0439\u0442\u0435 \u0441\u0440\u0435\u0437 \u043F\u043E \u0441\u043B\u043E\u044E \u0432\u044B\u0441\u0442\u0443\u043F\u0430: \u0432 \u043E\u043A\u043D\u0435 2 \u043F\u0440\u043E\u0442\u044F\u043D\u0438\u0442\u0435 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D \u0433\u043B\u0443\u0431\u0438\u043D\u044B \u0438\r
  \u043F\u043E\u0434\u0442\u044F\u043D\u0438\u0442\u0435 \u0433\u043E\u043B\u0443\u0431\u044B\u0435 \u043E\u0441\u0438 \u043F\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044E, \u0447\u0442\u043E\u0431\u044B \u0432 \u0441\u043B\u043E\u0435 \u043E\u0441\u0442\u0430\u043B\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E\r
  \u0440\u0435\u043B\u044C\u0435\u0444. \u041F\u043E\u0438\u0441\u043A \u043E\u0431\u0432\u0435\u0434\u0451\u0442 \u043A\u0430\u0436\u0434\u044B\u0439 \u0432\u044B\u0441\u0442\u0443\u043F \u0440\u0430\u043C\u043A\u043E\u0439.\r
\r
\u0413\u0440\u0430\u043D\u0438\u0446\u044B \u0441\u0440\u0435\u0437\u0430 \u043F\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u044E\u0442 \u043F\u043E\u0438\u0441\u043A \u043D\u0430 \u043B\u0435\u0442\u0443: \u0434\u0432\u0438\u0433\u0430\u0439\u0442\u0435 \u043E\u0441\u0438 \u0432 \u043E\u043A\u043D\u0435 2 (\u0438\u043B\u0438\r
\u0447\u0438\u0441\u043B\u0430 \u041E\u0422/\u0414\u041E), \u043F\u043E\u043A\u0430 \u0440\u0430\u043C\u043A\u0438 \u043D\u0435 \u0441\u044F\u0434\u0443\u0442 \u043D\u0430 \u043D\u0443\u0436\u043D\u044B\u0439 \u0441\u043B\u043E\u0439.\r
\r
\u0421\u043B\u043E\u0439 \u043C\u043E\u0436\u043D\u043E \u043E\u0442\u0434\u0435\u043B\u044F\u0442\u044C \u0438 **\u043F\u043E \u0446\u0432\u0435\u0442\u0443** \u2014 \u0441\u0442\u0440\u043E\u043A\u0430 \xAB\u0426\u0412\u0415\u0422\xBB \u0432 \u043F\u0430\u043D\u0435\u043B\u0438:\r
\r
- **\u041F\u0418\u041F\u0415\u0422\u041A\u0410** \u2014 \u043A\u043B\u0438\u043A\u0430\u0439\u0442\u0435 \u043F\u043E \u0442\u043E\u0447\u043A\u0430\u043C-\u043E\u0431\u0440\u0430\u0437\u0446\u0430\u043C \u0432 \u0433\u043B\u0430\u0432\u043D\u043E\u043C \u043E\u043A\u043D\u0435 (\u043A\u0438\u0440\u043F\u0438\u0447 \u043D\u0430\r
  \u0441\u043E\u043B\u043D\u0446\u0435 \u0438 \u043A\u0438\u0440\u043F\u0438\u0447 \u0432 \u0442\u0435\u043D\u0438 \u2014 \u044D\u0442\u043E \u0434\u0432\u0430 \u043E\u0431\u0440\u0430\u0437\u0446\u0430), Esc \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u044C;\r
- **\u0433\u0430\u043B\u043E\u0447\u043A\u0430** \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0444\u0438\u043B\u044C\u0442\u0440: \u043F\u043E\u0438\u0441\u043A \u0432\u0438\u0434\u0438\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E\u0447\u043A\u0438, \u043F\u043E\u0445\u043E\u0436\u0438\u0435 \u043D\u0430\r
  \u043E\u0431\u0440\u0430\u0437\u0446\u044B; \u043F\u043E\u043B\u0437\u0443\u043D\u043E\u043A \u2014 \u0434\u043E\u043F\u0443\u0441\u043A \u043F\u043E\u0445\u043E\u0436\u0435\u0441\u0442\u0438;\r
- \u0446\u0432\u0435\u0442 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 **\u0432\u043C\u0435\u0441\u0442\u0435** \u0441\u043E \u0441\u0440\u0435\u0437\u043E\u043C \u043F\u043E \u0433\u043B\u0443\u0431\u0438\u043D\u0435: \u0441\u0440\u0435\u0437 \u0434\u0435\u0440\u0436\u0438\u0442\u0435 \u0449\u0435\u0434\u0440\u044B\u043C,\r
  \u0448\u0442\u0443\u043A\u0430\u0442\u0443\u0440\u043A\u0443 \u0442\u043E\u0439 \u0436\u0435 \u0433\u043B\u0443\u0431\u0438\u043D\u044B \u0443\u0431\u0435\u0440\u0451\u0442 \u0446\u0432\u0435\u0442. \u041D\u0430 \u0441\u043A\u0430\u043D\u0430\u0445 \u0431\u0435\u0437 \u0446\u0432\u0435\u0442\u0430 \u0444\u0438\u043B\u044C\u0442\u0440\r
  \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0435\u0442 \u0438\u043D\u0442\u0435\u043D\u0441\u0438\u0432\u043D\u043E\u0441\u0442\u044C;\r
- \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043E\u0442\u0442\u0435\u043D\u043E\u043A (\u0441\u0442\u0440\u043E\u0433\u043E) \u0438 \u044F\u0440\u043A\u043E\u0441\u0442\u044C (\u0449\u0435\u0434\u0440\u043E) \u2014 \u043A\u0438\u0440\u043F\u0438\u0447 \u0432 \u0442\u0435\u043D\u0438\r
  \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F \u043A\u0438\u0440\u043F\u0438\u0447\u043E\u043C. \u041A\u0432\u0430\u0434\u0440\u0430\u0442\u0438\u043A \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u043E\u0431\u0440\u0430\u0437\u0435\u0446, \u043A\u043B\u0438\u043A \u043F\u043E\r
  \u043D\u0435\u043C\u0443 \u0441\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0435\u0442 \u043D\u0430\u0431\u043E\u0440.\r
\r
- **\u041E\u0411\u041B\u0410\u0421\u0422\u042C** \u2014 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0438\u0442\u044C \u043F\u043E\u0438\u0441\u043A \u043A\u0443\u0441\u043A\u043E\u043C \u0444\u0430\u0441\u0430\u0434\u0430: \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u0438\r
  \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A \u043C\u044B\u0448\u044C\u044E. \u041A\u0430\u0434\u0440 \u043D\u0430\u0432\u0435\u0434\u0451\u0442\u0441\u044F \u043D\u0430 \u043A\u0443\u0441\u043E\u043A, \u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0435\r
  \u043E\u043A\u043D\u043E \u043F\u043E\u043A\u0430\u0436\u0435\u0442 **\u0442\u043E\u043B\u044C\u043A\u043E \u0435\u0433\u043E** \u2014 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u0444\u0430\u0441\u0430\u0434 \u0441\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F, \u0438 \u043F\u043E\u0438\u0441\u043A\r
  \u0438\u0434\u0451\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u043D\u0443\u0442\u0440\u0438. \u041F\u0440\u043E\u0451\u043C, \u0440\u0430\u0437\u0440\u0435\u0437\u0430\u043D\u043D\u044B\u0439 \u0433\u0440\u0430\u043D\u0438\u0446\u0435\u0439 \u043E\u0431\u043B\u0430\u0441\u0442\u0438, \u043D\u0435\r
  \u043C\u0435\u0440\u0438\u0442\u0441\u044F \u2014 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u0435\u0433\u043E \u0446\u0435\u043B\u0438\u043A\u043E\u043C. **\u0412\u0415\u0421\u042C \u0424\u0410\u0421\u0410\u0414** \u043E\u0434\u043D\u043E\u0439 \u043A\u043D\u043E\u043F\u043A\u043E\u0439\r
  \u0441\u043D\u0438\u043C\u0430\u0435\u0442 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435, \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0444\u0430\u0441\u0430\u0434 \u0438 \u043A\u0430\u0434\u0440 \u043D\u0430 \u043C\u0435\u0441\u0442\u043E.\r
- \u0426\u0432\u0435\u0442 \u0440\u0430\u043C\u043A\u0438 \u2014 \u0434\u043E\u0432\u0435\u0440\u0438\u0435 \u043A \u043E\u0431\u043C\u0435\u0440\u0443: **\u0437\u0435\u043B\u0451\u043D\u0430\u044F** \u2014 \u0440\u0430\u0437\u043C\u0435\u0440 \u0441\u043D\u044F\u0442 \u0441 \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u044C\u044E\r
  \u0441\u044A\u0451\u043C\u043A\u0438, **\u044F\u043D\u0442\u0430\u0440\u043D\u0430\u044F** \u2014 \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435, **\u043A\u0440\u0430\u0441\u043D\u0430\u044F** \u2014 \u0432\u0435\u0440\u043E\u044F\u0442\u043D\u043E, \u043D\u0435 \u043F\u0440\u043E\u0451\u043C, \u0430\r
  \u0442\u0435\u043D\u044C \u0438\u043B\u0438 \u043F\u0440\u043E\u043F\u0443\u0441\u043A \u0441\u043A\u0430\u043D\u0435\u0440\u0430.\r
- \u041A\u043B\u0438\u043A \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u0442 \u0440\u0430\u043C\u043A\u0443, \u0442\u044F\u043D\u0443\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0437\u0430 \u0441\u0442\u043E\u0440\u043E\u043D\u044B \u0438 \u0443\u0433\u043B\u044B; **N** \u2014 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F\r
  \u0441\u043E\u043C\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F, **T** \u2014 \u043F\u0440\u0438\u0432\u0435\u0441\u0442\u0438 \u043A \u0442\u0438\u043F\u043E\u0432\u044B\u043C, **Del** \u2014 \u0443\u0431\u0440\u0430\u0442\u044C, \u043A\u043B\u0438\u043A \u0432\r
  \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043D\u043E\u0435 \u043C\u0435\u0441\u0442\u043E \u2014 \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C, **Enter** \u2014 \u043E\u0431\u0432\u0435\u0441\u0442\u0438 \u0432\u0441\u0451 \u043F\u043E\u043B\u0438\u043B\u0438\u043D\u0438\u044F\u043C\u0438.\r
\r
### \u0421\u0435\u0447\u0435\u043D\u0438\u0435 (\u043F\u0440\u0430\u0432\u043E\u0435 \u0432\u0435\u0440\u0445\u043D\u0435\u0435 \u043E\u043A\u043D\u043E)\r
\r
\u041F\u043E\u043B\u043E\u0441\u043A\u0430 \u0432\u043D\u0438\u0437\u0443 \u044D\u0442\u043E\u0433\u043E \u043E\u043A\u043D\u0430:\r
\r
- **\u0412\u0415\u0420\u0422 / \u0413\u041E\u0420\u0418\u0417** \u2014 \u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0440\u0435\u0437\u0430:\r
  - **\u0412\u0415\u0420\u0422** \u2014 \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0437 \u043F\u043E\u043F\u0435\u0440\u0451\u043A \u0441\u0442\u0435\u043D\u044B: \u0432\u0438\u0434\u043D\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u043F\u043E\u0434\u043E\u043A\u043E\u043D\u043D\u0438\u043A\u0430,\r
    \u043E\u0442\u043A\u043E\u0441\u0430, \u043A\u0430\u0440\u043D\u0438\u0437\u0430;\r
  - **\u0413\u041E\u0420\u0418\u0417** \u2014 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0437: \u0432\u0438\u0434\u043D\u043E \u043F\u043B\u0430\u043D \u043F\u0440\u043E\u0451\u043C\u0430 \u0438 \u0433\u043B\u0443\u0431\u0438\u043D\u0443 \u043E\u0442\u043A\u043E\u0441\u043E\u0432\r
    \u043D\u0430 \u0443\u0440\u043E\u0432\u043D\u0435 \u043A\u0443\u0440\u0441\u043E\u0440\u0430;\r
- **\u0422** \u2014 \u0442\u043E\u043B\u0449\u0438\u043D\u0430 \u0440\u0435\u0437\u0430 (\u043E\u0442 2 \u0441\u043C);\r
- **\u041E** \u2014 \u043E\u0445\u0432\u0430\u0442: \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u0435\u043D\u044B \u0432\u043E\u043A\u0440\u0443\u0433 \u043A\u0443\u0440\u0441\u043E\u0440\u0430 \u043F\u043E\u043F\u0430\u0434\u0430\u0435\u0442 \u0432 \u043E\u043A\u043D\u043E. \u041F\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435\r
  0.4 \u043C \u2014 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u043B\u0443\u043F\u0443 \u043D\u0430 \u043F\u043E\u0434\u043E\u043A\u043E\u043D\u043D\u0438\u043A\u0435.\r
\r
\u041E\u043A\u043D\u043E \u0441\u043B\u0435\u0434\u0443\u0435\u0442 \u0437\u0430 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C \u0441\u0430\u043C\u043E. \u0415\u0441\u043B\u0438 \u0432\u044B \u0432\u0440\u0443\u0447\u043D\u0443\u044E \u0441\u0434\u0432\u0438\u043D\u0443\u043B\u0438 \u0438\u043B\u0438 \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u043B\u0438\r
\u0432\u0438\u0434 \u0432 \u044D\u0442\u043E\u043C \u043E\u043A\u043D\u0435, \u0441\u043B\u0435\u0436\u0435\u043D\u0438\u0435 \u043E\u0442\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F; \u043E\u043D\u043E \u0432\u0435\u0440\u043D\u0451\u0442\u0441\u044F, \u043A\u043E\u0433\u0434\u0430 \u0432\u044B \u0441\u043D\u043E\u0432\u0430\r
\u043F\u043E\u0432\u0435\u0434\u0451\u0442\u0435 \u043A\u0443\u0440\u0441\u043E\u0440 \u0432 \u0433\u043B\u0430\u0432\u043D\u043E\u043C \u043E\u043A\u043D\u0435.\r
\r
**\u041A\u043B\u0430\u0432\u0438\u0448\u0430 2** (\u0438\u043B\u0438 \u043A\u043B\u0438\u043A \u0432 \u043E\u043A\u043D\u0435 \u0441\u0435\u0447\u0435\u043D\u0438\u044F) \u0437\u0430\u043C\u043E\u0440\u0430\u0436\u0438\u0432\u0430\u0435\u0442 \u0440\u0435\u0437: \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0430\r
\u0441\u0442\u043E\u0438\u0442 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435, \u043F\u043E\u043A\u0430 \u0432\u044B \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442\u0435 \u0432 \u044D\u0442\u043E\u043C \u043E\u043A\u043D\u0435, \u0438 \u043C\u044B\u0448\u044C \u043F\u043E \u043F\u0443\u0442\u0438 \u0435\u0451 \u043D\u0435\r
\u0443\u0442\u0430\u0441\u043A\u0438\u0432\u0430\u0435\u0442. **\u041A\u043B\u0430\u0432\u0438\u0448\u0430 1** \u0438\u043B\u0438 \u043A\u043B\u0438\u043A \u0432 \u0433\u043B\u0430\u0432\u043D\u043E\u043C \u043E\u043A\u043D\u0435 \u0441\u043D\u043E\u0432\u0430 \u043F\u0443\u0441\u043A\u0430\u0435\u0442 \u0440\u0435\u0437 \u0437\u0430\r
\u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C \u2014 \u0442\u0430\u043A \u0436\u0435, \u043A\u0430\u043A \u0441\u043B\u0435\u0436\u0435\u043D\u0438\u0435 3-\u0433\u043E \u043E\u043A\u043D\u0430.\r
\r
### \u041E\u0431\u043B\u0430\u0441\u0442\u044C (3D-\u043E\u043A\u043D\u043E)\r
\r
\u041F\u043E\u043B\u043E\u0441\u043A\u0430 **\u041E\u0411\u041B\u0410\u0421\u0422\u042C** \u0432\u043D\u0438\u0437\u0443 3D-\u043E\u043A\u043D\u0430 \u0437\u0430\u0434\u0430\u0451\u0442 \u0440\u0430\u0437\u043C\u0435\u0440 \u0432\u0438\u0434\u0438\u043C\u043E\u0433\u043E \u043A\u0443\u0441\u043A\u0430 \u043E\u0431\u043B\u0430\u043A\u0430\r
\u0432\u043E\u043A\u0440\u0443\u0433 \u043A\u0443\u0440\u0441\u043E\u0440\u0430 \u2014 \u043E\u0442 0.5 \u0434\u043E 120 \u043C. \u041C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E\r
\u043E\u043A\u0440\u0435\u0441\u0442\u043D\u043E\u0441\u0442\u044C \u043A\u0443\u0440\u0441\u043E\u0440\u0430, \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0432\u0441\u0451 \u0437\u0434\u0430\u043D\u0438\u0435.\r
\r
---\r
\r
## 9. \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u043E\u043A\u043E\u043D\r
\r
**\u0420\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0430 \u043E\u043A\u043E\u043D \u043D\u0430\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043A\u0430\u043A \u0432 \u043B\u044E\u0431\u043E\u043C CAD.** \u0413\u0440\u0430\u043D\u0438\u0446\u044B \u043C\u0435\u0436\u0434\u0443 \u043E\u043A\u043D\u0430\u043C\u0438\r
\u2014 \u0436\u0438\u0432\u044B\u0435: \u043D\u0430\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430 \u0440\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C (\u043E\u043D \u043F\u043E\u0434\u0441\u0432\u0435\u0442\u0438\u0442\u0441\u044F), \u0437\u0430\u0436\u043C\u0438\u0442\u0435 \u0438 \u0442\u044F\u043D\u0438\u0442\u0435;\r
\u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043B\u0438\u043A \u043F\u043E \u0433\u0440\u0430\u043D\u0438\u0446\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0443 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E. \u041E\u043A\u043D\u0430 2\r
(\u0441\u0435\u0447\u0435\u043D\u0438\u0435) \u0438 3 (3D) \u043C\u043E\u0436\u043D\u043E **\u0443\u0431\u0440\u0430\u0442\u044C** \u043A\u0440\u0435\u0441\u0442\u0438\u043A\u043E\u043C \u2715 \u0432 \u0438\u0445 \u043F\u0440\u0430\u0432\u043E\u043C \u0432\u0435\u0440\u0445\u043D\u0435\u043C\r
\u0443\u0433\u043B\u0443 \u2014 \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0435 \u043E\u043A\u043D\u043E \u0437\u0430\u0439\u043C\u0451\u0442 \u0432\u0441\u044E \u043A\u043E\u043B\u043E\u043D\u043A\u0443, \u0430 \u0435\u0441\u043B\u0438 \u0443\u0431\u0440\u0430\u0442\u044C \u043E\u0431\u0430, \u043E\u043A\u043D\u043E 1\r
\u0440\u0430\u0441\u0442\u044F\u043D\u0435\u0442\u0441\u044F \u043D\u0430 \u0432\u0435\u0441\u044C \u044D\u043A\u0440\u0430\u043D. \u0412\u0435\u0440\u043D\u0443\u0442\u044C \u043E\u043A\u043D\u043E \u2014 \u0447\u0438\u043F\u044B \xAB+ \u0421\u0415\u0427\u0415\u041D\u0418\u0415\xBB / \xAB+ 3D\xBB \u0443\r
\u043F\u0440\u0430\u0432\u043E\u0433\u043E \u043A\u0440\u0430\u044F. \u0420\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0430 \u0437\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u043C\u0435\u0436\u0434\u0443 \u0441\u0435\u0430\u043D\u0441\u0430\u043C\u0438. \u041E\u043A\u043D\u043E 1 \u043D\u0435\r
\u043F\u0440\u044F\u0447\u0435\u0442\u0441\u044F \u2014 \u043E\u043D\u043E \u043A\u043E\u043C\u0430\u043D\u0434\u043D\u043E\u0435: \u0442\u0430\u043C \u0436\u0438\u0432\u0451\u0442 \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u0435.\r
\r
\u0423 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043E\u043A\u043D\u0430 \u0432 \u043F\u0440\u0430\u0432\u043E\u043C \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0443\u0433\u043B\u0443 \u0442\u0440\u0438 \u043A\u0440\u0443\u0433\u043B\u044B\u0435 \u043A\u043D\u043E\u043F\u043A\u0438:\r
\r
| \u041A\u043D\u043E\u043F\u043A\u0430 | \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435 |\r
|---|---|\r
| **\u0442\u043E\u0447\u043A\u0438** | \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C/\u0441\u043A\u0440\u044B\u0442\u044C \u043E\u0431\u043B\u0430\u043A\u043E \u0442\u043E\u0447\u0435\u043A \u0432 \u044D\u0442\u043E\u043C \u043E\u043A\u043D\u0435 |\r
| **\u0448\u0435\u0441\u0442\u0435\u0440\u0451\u043D\u043A\u0430** | \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043E\u0431\u043B\u0430\u043A\u0430 \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u043E\u043A\u043D\u0430 |\r
| **\u0433\u043B\u0430\u0437** | \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C/\u0441\u043A\u0440\u044B\u0442\u044C \u043D\u0430\u0447\u0435\u0440\u0447\u0435\u043D\u043D\u044B\u0435 \u043B\u0438\u043D\u0438\u0438 \u0432 \u044D\u0442\u043E\u043C \u043E\u043A\u043D\u0435 |\r
\r
\u0412 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u043E\u0431\u043B\u0430\u043A\u0430 (\u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043E\u043A\u043D\u0430 \u0441\u0432\u043E\u0438):\r
\r
- **\u0420\u0430\u0437\u043C\u0435\u0440 \u0442\u043E\u0447\u0435\u043A** \u2014 \u043E\u0442 0.5 \u0434\u043E 6;\r
- **\u041F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u043E\u0441\u0442\u044C**;\r
- **\u041F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C** \u2014 \u0434\u043E\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u043C\u044B\u0445 \u0442\u043E\u0447\u0435\u043A. \u0423\u043C\u0435\u043D\u044C\u0448\u0430\u0439\u0442\u0435, \u0435\u0441\u043B\u0438 \u0445\u043E\u0447\u0435\u0442\u0441\u044F\r
  \u0432\u0438\u0434\u0435\u0442\u044C \u0441\u0432\u043E\u0439 \u0447\u0435\u0440\u0442\u0451\u0436 \u0441\u043A\u0432\u043E\u0437\u044C \u043F\u043B\u043E\u0442\u043D\u044B\u0439 \u0441\u043A\u0430\u043D;\r
- **\u0426\u0432\u0435\u0442** \u2014 RGB \u0441\u043A\u0430\u043D\u0430, \u043E\u0442\u0442\u0435\u043D\u043A\u0438 \u0441\u0435\u0440\u043E\u0433\u043E \u043F\u043E \u0438\u043D\u0442\u0435\u043D\u0441\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0438\u043B\u0438 \u0440\u0430\u0441\u043A\u0440\u0430\u0441\u043A\u0430\r
  \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435.\r
\r
---\r
\r
## 10. \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u043B\u0435\u043D\u0442\u044B \u043F\u043E\u0434 \u0441\u0435\u0431\u044F\r
\r
\u041A\u043D\u043E\u043F\u043A\u0430 **\u2699** \u0432 \u043F\u0440\u0430\u0432\u043E\u043C \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0443\u0433\u043B\u0443 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0440\u0435\u0436\u0438\u043C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438:\r
\r
- \u043A\u043D\u043E\u043F\u043A\u0438 **\u043F\u0435\u0440\u0435\u0442\u0430\u0441\u043A\u0438\u0432\u0430\u044E\u0442\u0441\u044F \u043C\u044B\u0448\u044C\u044E** \u043C\u0435\u0436\u0434\u0443 \u043F\u0430\u043D\u0435\u043B\u044F\u043C\u0438 \u0438 \u0432\u043D\u0443\u0442\u0440\u0438 \u043F\u0430\u043D\u0435\u043B\u0438;\r
- **\u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043B\u0438\u043A \u043F\u043E \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044E \u043F\u0430\u043D\u0435\u043B\u0438** \u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u044B\u0432\u0430\u0435\u0442 \u0435\u0451;\r
- **+ \u041F\u0430\u043D\u0435\u043B\u044C** \u0441\u043E\u0437\u0434\u0430\u0451\u0442 \u043D\u043E\u0432\u0443\u044E, \u043F\u0443\u0441\u0442\u0443\u044E \u043F\u0430\u043D\u0435\u043B\u044C \u043C\u043E\u0436\u043D\u043E \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u043A\u0440\u0435\u0441\u0442\u0438\u043A\u043E\u043C;\r
- **\u0421\u0431\u0440\u043E\u0441** \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0443 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E;\r
- **\u0413\u043E\u0442\u043E\u0432\u043E** (\u0438\u043B\u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0435 \u043D\u0430\u0436\u0430\u0442\u0438\u0435 \u2699) \u0432\u044B\u0445\u043E\u0434\u0438\u0442 \u0438\u0437 \u0440\u0435\u0436\u0438\u043C\u0430.\r
\r
\u0420\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u0438 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u0438 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C \u0437\u0430\u043F\u0443\u0441\u043A\u0435.\r
\r
---\r
\r
## 11. \u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\r
\r
- **DXF** \u2014 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442 \u0447\u0435\u0440\u0442\u0451\u0436 \u0444\u0430\u0439\u043B\u043E\u043C. \u0421\u043B\u043E\u0438 \u0443\u0445\u043E\u0434\u044F\u0442 \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u0438\u043C\u0435\u043D\u0430\u043C\u0438,\r
  \u0446\u0432\u0435\u0442\u0430\u043C\u0438 \u0438 \u0442\u0438\u043F\u0430\u043C\u0438 \u043B\u0438\u043D\u0438\u0439, \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B \u2014 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0439 \u0441\u0442\u0435\u043D\u044B.\r
- **ToCad** \u2014 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0447\u0435\u0440\u0442\u0451\u0436 \u043F\u0440\u044F\u043C\u043E \u0432 \u043E\u0442\u043A\u0440\u044B\u0442\u044B\u0439 AutoCAD. \u0415\u0441\u043B\u0438 \u0441\u0432\u044F\u0437\u044C\r
  \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430, \u0441\u043A\u0440\u0438\u043F\u0442 \u043A\u043B\u0430\u0434\u0451\u0442\u0441\u044F \u0432 \u0431\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430: \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u0435\u0441\u044C \u0432 AutoCAD \u0438\r
  \u043D\u0430\u0436\u043C\u0438\u0442\u0435 **Ctrl+V** \u0432 \u043A\u043E\u043C\u0430\u043D\u0434\u043D\u043E\u0439 \u0441\u0442\u0440\u043E\u043A\u0435.\r
\r
\u0415\u0441\u043B\u0438 \u0447\u0442\u043E-\u0442\u043E \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043E \u2014 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u043E\u0435, \u0438\u043D\u0430\u0447\u0435 \u0432\u0435\u0441\u044C\r
\u0447\u0435\u0440\u0442\u0451\u0436.\r
\r
---\r
\r
## 12. \u0413\u043E\u0440\u044F\u0447\u0438\u0435 \u043A\u043B\u0430\u0432\u0438\u0448\u0438\r
\r
| \u041A\u043B\u0430\u0432\u0438\u0448\u0438 | \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435 |\r
|---|---|\r
| **\u041B\u041A\u041C** | \u043F\u043E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0442\u043E\u0447\u043A\u0443 / \u0432\u044B\u0431\u0440\u0430\u0442\u044C |\r
| **Ctrl+\u043A\u043B\u0438\u043A**, **Shift+\u043A\u043B\u0438\u043A** | \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043A \u0432\u044B\u0431\u043E\u0440\u0443 \u0438\u043B\u0438 \u0443\u0431\u0440\u0430\u0442\u044C |\r
| **\u041F\u041A\u041C**, **Enter** | \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u043A\u043E\u043C\u0430\u043D\u0434\u0443 (\u043A\u0430\u043A Enter \u0432 AutoCAD) |\r
| **\u041F\u0440\u043E\u0431\u0435\u043B** | \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u043A\u043E\u043C\u0430\u043D\u0434\u0443; \u0432 \u0440\u0435\u0436\u0438\u043C\u0435 \u0432\u044B\u0431\u043E\u0440\u0430 \u2014 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u044E\u044E |\r
| **Esc** | \u043E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0435\u0435 \u043F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435 / \u0441\u043D\u044F\u0442\u044C \u0432\u044B\u0431\u043E\u0440 |\r
| **Del**, **Backspace** | \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0435 |\r
| **C** | \u0437\u0430\u043C\u043A\u043D\u0443\u0442\u044C \u043F\u043E\u043B\u0438\u043B\u0438\u043D\u0438\u044E |\r
| **S** | \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u0432\u043A\u043B/\u0432\u044B\u043A\u043B |\r
| **F8** | \u043E\u0440\u0442\u043E \u0432\u043A\u043B/\u0432\u044B\u043A\u043B, **Shift** \u2014 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043D\u0430\u043E\u0431\u043E\u0440\u043E\u0442 |\r
| **Ctrl+Z** / **Ctrl+Y** | \u043E\u0442\u043C\u0435\u043D\u0438\u0442\u044C / \u0432\u0435\u0440\u043D\u0443\u0442\u044C |\r
| **\u0446\u0438\u0444\u0440\u044B** | \u0442\u043E\u0447\u043D\u044B\u0439 \u0432\u0432\u043E\u0434 \u0434\u043B\u0438\u043D\u044B \u0438\u043B\u0438 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u044F |\r
| **\u0421\u041A\u041C** | \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430, \u0432 3D-\u043E\u043A\u043D\u0435 \u2014 \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 |\r
| **\u043A\u043E\u043B\u0435\u0441\u043E** | \u0437\u0443\u043C \u043A \u043A\u0443\u0440\u0441\u043E\u0440\u0443 |\r
\r
---\r
\r
## 13. \u0415\u0441\u043B\u0438 \u0442\u043E\u0440\u043C\u043E\u0437\u0438\u0442\r
\r
\u0412 \u043F\u0440\u0430\u0432\u043E\u043C \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0443\u0433\u043B\u0443 \u0440\u044F\u0434\u043E\u043C \u0441 **FPS** \u0435\u0441\u0442\u044C \u0441\u0447\u0451\u0442\u0447\u0438\u043A **PTS** \u2014 \u0441\u043A\u043E\u043B\u044C\u043A\u043E\r
\u0442\u043E\u0447\u0435\u043A \u043E\u0431\u043B\u0430\u043A\u0430 \u043E\u0442\u0440\u0438\u0441\u043E\u0432\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0437\u0430 \u043A\u0430\u0434\u0440. \u041F\u043E \u043D\u0435\u043C\u0443 \u0441\u0440\u0430\u0437\u0443 \u0432\u0438\u0434\u043D\u043E, \u0447\u0442\u043E \u0433\u0440\u0443\u0437\u0438\u0442\r
\u0441\u0446\u0435\u043D\u0443.\r
\r
\u0427\u0442\u043E \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442:\r
\r
- **\u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u041F\u0421\u041A** \u2014 \u043F\u043E\u0441\u043B\u0435 \u044D\u0442\u043E\u0433\u043E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0440\u0438\u0441\u0443\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0438\u0434\u0438\u043C\u044B\u0439 \u0443\u0447\u0430\u0441\u0442\u043E\u043A\r
  \u0441\u0442\u0435\u043D\u044B, \u0438 \u0447\u0435\u043C \u0431\u043B\u0438\u0436\u0435 \u0432\u044B \u043F\u0440\u0438\u0431\u043B\u0438\u0436\u0430\u0435\u0442\u0435\u0441\u044C, \u0442\u0435\u043C \u043B\u0435\u0433\u0447\u0435 \u043A\u0430\u0434\u0440;\r
- **\u0443\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u0435 \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C** \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u043E\u0431\u043B\u0430\u043A\u0430 (\u0448\u0435\u0441\u0442\u0435\u0440\u0451\u043D\u043A\u0430) \u2014 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E\r
  \u0447\u0435\u0440\u0442\u0435\u0436\u0430 \u043D\u0435 \u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F, \u0442\u043E\u0447\u0435\u043A \u043D\u0430 \u044D\u043A\u0440\u0430\u043D\u0435 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u043C\u0435\u043D\u044C\u0448\u0435;\r
- **\u0443\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u0435 \xAB\u041E\u0431\u043B\u0430\u0441\u0442\u044C\xBB** \u0432 3D-\u043E\u043A\u043D\u0435;\r
- **\u0441\u043A\u0440\u043E\u0439\u0442\u0435 \u043E\u0431\u043B\u0430\u043A\u043E** \u0432 \u043E\u043A\u043D\u0430\u0445, \u0433\u0434\u0435 \u043E\u043D\u043E \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0435 \u043D\u0443\u0436\u043D\u043E (\u043A\u043D\u043E\u043F\u043A\u0430 \u0441 \u0442\u043E\u0447\u043A\u0430\u043C\u0438);\r
- \u0434\u043B\u044F \u043E\u0447\u0435\u043D\u044C \u0431\u043E\u043B\u044C\u0448\u0438\u0445 LAZ \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0444\u043E\u0440\u043C\u0430\u0442 **COPC** \u2014 \u043E\u043D \u043F\u043E\u0434\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044F\r
  \u0443\u0440\u043E\u0432\u043D\u044F\u043C\u0438 \u0438 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0431\u044B\u0441\u0442\u0440\u0435\u0435.\r
\r
---\r
\r
## 14. \u0427\u0442\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F, \u0430 \u0447\u0442\u043E \u043D\u0435\u0442\r
\r
| \u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u043C\u0435\u0436\u0434\u0443 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u043C\u0438 | \u0416\u0438\u0432\u0451\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u043C \u0441\u0435\u0430\u043D\u0441\u0435 |\r
|---|---|\r
| \u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u0441\u043B\u043E\u0451\u0432 (\u0446\u0432\u0435\u0442\u0430, \u0442\u0438\u043F\u044B \u043B\u0438\u043D\u0438\u0439, \u0442\u043E\u043B\u0449\u0438\u043D\u044B) | \u0421\u0430\u043C \u0447\u0435\u0440\u0442\u0451\u0436 |\r
| \u0420\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0430 \u043A\u043D\u043E\u043F\u043E\u043A \u0432 \u043B\u0435\u043D\u0442\u0435 | \u0421\u043F\u0438\u0441\u043E\u043A \u041F\u0421\u041A |\r
| \u041F\u043E\u043A\u0430\u0437 \u0442\u043E\u043B\u0449\u0438\u043D \u043B\u0438\u043D\u0438\u0439 | \u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u043E\u0435 \u043E\u0431\u043B\u0430\u043A\u043E |\r
\r
\u0422\u043E \u0435\u0441\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E \u043C\u0435\u0441\u0442\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u043F\u043E\u043C\u043D\u0438\u0442, \u0430 \u0447\u0435\u0440\u0442\u0451\u0436 \u043F\u043E\u043A\u0430 \u043D\u0443\u0436\u043D\u043E\r
\u0432\u044B\u0433\u0440\u0443\u0436\u0430\u0442\u044C \u0432 DXF \u043F\u0435\u0440\u0435\u0434 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0435\u043C \u0432\u043A\u043B\u0430\u0434\u043A\u0438 \u2014 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0435\u043A\u0442\u0430 \u0432 \u0444\u0430\u0439\u043B \u043D\u0430\r
\u044D\u0442\u043E\u043C \u044D\u0442\u0430\u043F\u0435 \u043D\u0435\u0442.\r
`;
function D0(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function ji(s) {
  return D0(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}
function Rc(s) {
  return s.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((t) => t.trim());
}
function I0(s) {
  const t = s.split(/\r?\n/), e = [];
  let n = null, i = [];
  const r = () => {
    n && (e.push(`</${n}>`), n = null);
  }, o = () => {
    i.length && (e.push(`<p>${ji(i.join(" "))}</p>`), i = []);
  }, a = () => {
    o(), r();
  };
  for (let l = 0; l < t.length; l++) {
    const c = t[l], h = c.trim();
    if (!h) {
      a();
      continue;
    }
    if (/^#{1,4}\s/.test(h)) {
      a();
      const f = h.match(/^#+/)[0].length;
      e.push(`<h${f}>${ji(h.replace(/^#+\s*/, ""))}</h${f}>`);
      continue;
    }
    if (/^---+$/.test(h)) {
      a(), e.push("<hr />");
      continue;
    }
    if (h.startsWith("|") && (t[l + 1] ?? "").trim().startsWith("|-")) {
      a();
      const f = Rc(h);
      for (e.push("<table><thead><tr>" + f.map((g) => `<th>${ji(g)}</th>`).join("") + "</tr></thead><tbody>"), l += 2; l < t.length && t[l].trim().startsWith("|"); l++) e.push("<tr>" + Rc(t[l]).map((g) => `<td>${ji(g)}</td>`).join("") + "</tr>");
      l--, e.push("</tbody></table>");
      continue;
    }
    const u = h.match(/^[-*]\s+(.*)$/), d = h.match(/^\d+\.\s+(.*)$/);
    if (u || d) {
      o();
      const f = u ? "ul" : "ol";
      n !== f && (r(), e.push(`<${f}>`), n = f), e.push(`<li>${ji((u ?? d)[1])}</li>`);
      continue;
    }
    if (n && /^\s{2,}\S/.test(c)) {
      const f = e.pop() ?? "";
      e.push(f.replace(/<\/li>$/, ` ${ji(h)}</li>`));
      continue;
    }
    r(), i.push(h);
  }
  return a(), e.join(`
`);
}
const U0 = I0(L0);
function Q(s) {
  const t = document.getElementById(s);
  if (!t) throw new Error(`UI: missing #${s}`);
  return t;
}
function F0() {
  var _a2, _b;
  const s = '.hud-strip input[type="range"], .op-row input[type="range"]';
  for (const t of document.querySelectorAll(s)) {
    if (t.dataset.stepped === "1") continue;
    t.dataset.stepped = "1";
    const e = (n, i) => {
      const r = document.createElement("button");
      r.type = "button", r.className = "hud-step", r.textContent = i, r.tabIndex = -1, r.title = n < 0 ? "\u041D\u0430 \u0448\u0430\u0433 \u043C\u0435\u043D\u044C\u0448\u0435" : "\u041D\u0430 \u0448\u0430\u0433 \u0431\u043E\u043B\u044C\u0448\u0435";
      const o = () => {
        const h = parseFloat(t.step) || 1, u = parseFloat(t.value) + n * h, d = t.min === "" ? -1 / 0 : parseFloat(t.min), f = t.max === "" ? 1 / 0 : parseFloat(t.max);
        t.value = String(Math.min(f, Math.max(d, u))), t.dispatchEvent(new Event("input", { bubbles: true }));
      };
      let a = 0, l = 0;
      r.addEventListener("pointerdown", (h) => {
        h.preventDefault(), o(), a = window.setTimeout(() => {
          l = window.setInterval(o, 70);
        }, 380);
      });
      const c = () => {
        clearTimeout(a), clearInterval(l);
      };
      return r.addEventListener("pointerup", c), r.addEventListener("pointerleave", c), r.addEventListener("pointercancel", c), r;
    };
    (_a2 = t.parentElement) == null ? void 0 : _a2.insertBefore(e(-1, "\u25C0"), t), (_b = t.parentElement) == null ? void 0 : _b.insertBefore(e(1, "\u25B6"), t.nextSibling);
  }
}
const N0 = [["solid", "\u0421\u043F\u043B\u043E\u0448\u043D\u0430\u044F"], ["dashed", "\u0428\u0442\u0440\u0438\u0445\u043E\u0432\u0430\u044F"], ["dotted", "\u041F\u0443\u043D\u043A\u0442\u0438\u0440\u043D\u0430\u044F"], ["dashdot", "\u0428\u0442\u0440\u0438\u0445\u043F\u0443\u043D\u043A\u0442."]], O0 = [0.13, 0.18, 0.25, 0.35, 0.5, 0.7, 1, 1.4, 2];
class B0 {
  constructor(t) {
    this.handlers = t, this.hint = Q("hint"), this.coords = Q("coords"), this.fps = Q("fps"), this.ptsOut = Q("pts"), this.pillSnap = Q("pill-snap"), this.pillOrtho = Q("pill-ortho"), this.pillWeight = Q("pill-weight"), this.layersPanel = Q("layers-panel"), this.layersList = Q("layers-list"), this.marquee = Q("marquee"), this.sectionPanel = Q("section-panel"), this.sectionVal = Q("section-val"), this.lblMain = Q("lbl-main"), this.ucsSelect = Q("ucs-select"), this.layerSelect = Q("layer-select"), this.dynInput = Q("dyn-input"), this.fileInput = Q("import-file"), this.toolButtons = [], this.ribbon = C0(), this.ribbonEdit = false, this.activeToolId = "", this.dragId = null, this.layersMoved = false, this.helpFilled = false, this.cloudPanelFor = null, this.renderRibbon(), this.bindRibbon(), F0(), Q("btn-ribbon-edit").addEventListener("click", () => this.setRibbonEdit(!this.ribbonEdit)), this.pillSnap.addEventListener("click", () => t.onToggleSnap()), this.pillOrtho.addEventListener("click", () => t.onToggleOrtho());
    const e = Q("section-depth");
    e.addEventListener("input", () => t.onSectionDepth(parseFloat(e.value))), Q("profile-mode").addEventListener("click", () => t.onToggleProfileMode());
    const n = Q("profile-window");
    n.addEventListener("input", () => t.onProfileWindow(parseFloat(n.value))), Q("plan-slice-pill").addEventListener("click", () => t.onPlanSliceToggle());
    const i = Q("plan-level");
    i.addEventListener("input", () => t.onPlanSliceLevel(parseFloat(i.value)));
    const r = Q("plan-thick");
    r.addEventListener("input", () => t.onPlanSliceThick(parseFloat(r.value)));
    const o = (d, f) => {
      const g = () => {
        const _ = parseFloat(d.value.replace(",", "."));
        isFinite(_) && f(_);
      };
      d.addEventListener("change", g), d.addEventListener("keydown", (_) => {
        _.key === "Enter" && (g(), d.blur());
      });
    };
    o(Q("plan-level-val"), (d) => t.onPlanSliceLevel(d)), o(Q("plan-thick-val"), (d) => t.onPlanSliceThick(d)), Q("slice-pill").addEventListener("click", () => t.onToggleFacadeSlice());
    const a = Q("slice-lo-val"), l = Q("slice-hi-val"), c = (d) => {
      let f = parseFloat(a.value.replace(",", ".")), g = parseFloat(l.value.replace(",", "."));
      !isFinite(f) || !isFinite(g) || (f > g && (d === "lo" ? g = f : f = g), t.onFacadeSliceRange(f / 1e3, g / 1e3));
    };
    o(a, () => c("lo")), o(l, () => c("hi")), Q("btn-plan-done").addEventListener("click", (d) => {
      d.currentTarget.blur(), t.onPlanSliceDone();
    });
    const h = Q("cursor-area");
    h.addEventListener("input", () => {
      const d = parseFloat(h.value);
      Q("cursor-area-val").textContent = `${d.toFixed(1)} \u043C`, t.onCursorArea(d);
    }), this.ucsSelect.addEventListener("change", () => t.onUcsSelect(this.ucsSelect.selectedIndex)), this.layerSelect.addEventListener("change", () => t.onLayerCombo(this.layerSelect.value));
    for (const d of ["main", "profile", "iso"]) Q(`eye-${d}`).addEventListener("click", () => t.onToggleLayer(d)), Q(`gear-${d}`).addEventListener("click", () => t.onOpenCloudPanel(d)), Q(`cloudeye-${d}`).addEventListener("click", () => t.onToggleCloud(d));
    this.fileInput.addEventListener("change", () => {
      const d = Array.from(this.fileInput.files ?? []);
      d.length && t.onImportFiles(d), this.fileInput.value = "";
    }), Q("btn-ucs-rename").addEventListener("click", () => t.onRenameUcs());
    const u = (d, f) => {
      const g = Q(d);
      g.addEventListener("input", () => {
        this.cloudPanelFor && t.onCloudSetting(this.cloudPanelFor, f, parseFloat(g.value));
      });
    };
    u("cp-size", "size"), u("cp-opacity", "opacity"), u("cp-density", "density"), u("cp-mode", "mode"), Q("cloud-panel-close").addEventListener("click", () => this.closeCloudPanel()), Q("btn-start-import").addEventListener("click", () => this.fileInput.click()), Q("btn-start-demo").addEventListener("click", () => t.onDemoStart()), Q("layers-close").addEventListener("click", () => this.toggleLayersPanel(false)), this.bindLayersDrag(), Q("layer-swatch").addEventListener("click", () => this.toggleLayersPanel()), Q("btn-layer-add").addEventListener("click", () => t.onLayerAdd()), Q("btn-layer-assign").addEventListener("click", () => t.onAssignToLayer()), this.pillWeight.addEventListener("click", () => t.onToggleWeightDisplay()), Q("help-close").addEventListener("click", () => this.toggleHelp(false)), Q("btn-start-help").addEventListener("click", () => this.toggleHelp(true)), this.setUcsList([], -1);
  }
  renderRibbon() {
    const t = Q("ribbon-groups");
    if (t.innerHTML = "", this.ribbon.forEach((e, n) => {
      if (n > 0) {
        const a = document.createElement("div");
        a.className = "rib-sep", t.appendChild(a);
      }
      const i = document.createElement("div");
      i.className = "rib-group", i.dataset.gi = String(n);
      const r = document.createElement("div");
      r.className = "rib-tools";
      for (const a of e.buttons) {
        const l = bh.get(a);
        if (!l) continue;
        const c = document.createElement("button");
        c.className = "tool-btn", c.dataset.btnId = l.id, l.tool && (c.dataset.tool = l.tool), l.action && (c.dataset.action = l.action), l.domId && (c.id = l.domId), c.title = l.label === l.title ? l.label : `${l.label} \u2014 ${l.title}`, c.draggable = this.ribbonEdit, c.innerHTML = `<span class="fx"></span><svg viewBox="0 0 24 24">${l.icon}</svg>`, r.appendChild(c);
      }
      i.appendChild(r);
      const o = document.createElement("div");
      if (o.className = "rib-title", o.textContent = e.title, this.ribbonEdit) {
        if (o.title = "\u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043B\u0438\u043A \u2014 \u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u0442\u044C \u043F\u0430\u043D\u0435\u043B\u044C", !e.buttons.length) {
          const a = document.createElement("span");
          a.className = "rib-del", a.textContent = " \u2715", a.title = "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u0443\u0441\u0442\u0443\u044E \u043F\u0430\u043D\u0435\u043B\u044C", a.addEventListener("click", () => {
            this.ribbon.splice(n, 1), this.ribbonLayoutChanged();
          }), o.appendChild(a);
        }
        o.addEventListener("dblclick", () => {
          const a = window.prompt("\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u0430\u043D\u0435\u043B\u0438:", e.title);
          a && a.trim() && (e.title = a.trim(), this.ribbonLayoutChanged());
        });
      }
      i.appendChild(o), t.appendChild(i);
    }), this.ribbonEdit) {
      const e = document.createElement("div");
      e.className = "rib-edit-controls";
      const n = (i, r, o) => {
        const a = document.createElement("button");
        a.className = "mini-btn", a.textContent = i, a.title = r, a.addEventListener("click", o), e.appendChild(a);
      };
      n("+ \u041F\u0430\u043D\u0435\u043B\u044C", "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0443\u0441\u0442\u0443\u044E \u043F\u0430\u043D\u0435\u043B\u044C", () => {
        const i = window.prompt("\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u0430\u043D\u0435\u043B\u0438:", `\u041F\u0430\u043D\u0435\u043B\u044C ${this.ribbon.length + 1}`);
        i && i.trim() && (this.ribbon.push({ title: i.trim(), buttons: [] }), this.ribbonLayoutChanged());
      }), n("\u0421\u0431\u0440\u043E\u0441", "\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0443 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E", () => {
        this.ribbon = P0(), this.renderRibbon();
      }), n("\u0413\u043E\u0442\u043E\u0432\u043E", "\u0412\u044B\u0439\u0442\u0438 \u0438\u0437 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043B\u0435\u043D\u0442\u044B", () => this.setRibbonEdit(false)), t.appendChild(e);
    }
    Q("ribbon").dataset.edit = String(this.ribbonEdit), this.toolButtons = Array.from(document.querySelectorAll("[data-tool]")), this.setActiveTool(this.activeToolId), this.publishRibbonHeight();
  }
  refreshRibbonHeight() {
    this.publishRibbonHeight();
  }
  publishRibbonHeight() {
    requestAnimationFrame(() => {
      const t = Math.round(Q("ribbon").getBoundingClientRect().height);
      document.documentElement.style.setProperty("--ribbon-h", `${t}px`), this.handlers.onRibbonHeight(t);
    });
  }
  ribbonLayoutChanged() {
    R0(this.ribbon), this.renderRibbon();
  }
  bindRibbon() {
    const t = Q("ribbon-groups");
    t.addEventListener("click", (e) => {
      if (this.ribbonEdit) return;
      const n = e.target.closest(".tool-btn");
      n && (n.blur(), n.dataset.tool ? this.handlers.onTool(n.dataset.tool) : n.dataset.action && this.runAction(n.dataset.action));
    }), t.addEventListener("dragstart", (e) => {
      var _a2;
      const n = e.target.closest(".tool-btn");
      !this.ribbonEdit || !n || (this.dragId = n.dataset.btnId ?? null, n.classList.add("dragging"), (_a2 = e.dataTransfer) == null ? void 0 : _a2.setData("text/plain", this.dragId ?? ""), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"));
    }), t.addEventListener("dragover", (e) => {
      if (!this.ribbonEdit || !this.dragId) return;
      const n = e.target.closest(".rib-group");
      if (n) {
        e.preventDefault();
        for (const i of t.querySelectorAll(".rib-group")) i.classList.toggle("drop-target", i === n);
      }
    }), t.addEventListener("drop", (e) => {
      var _a2;
      if (!this.ribbonEdit || !this.dragId) return;
      const n = e.target.closest(".rib-group");
      if (!n) return;
      e.preventDefault();
      const i = this.dragId;
      this.dragId = null;
      const r = Number(n.dataset.gi), o = this.ribbon.find((u) => u.buttons.includes(i)), a = this.ribbon[r];
      if (!o || !a) return;
      o.buttons.splice(o.buttons.indexOf(i), 1);
      const c = (_a2 = e.target.closest(".tool-btn")) == null ? void 0 : _a2.dataset.btnId, h = c && c !== i ? a.buttons.indexOf(c) : -1;
      h >= 0 ? a.buttons.splice(h, 0, i) : a.buttons.push(i), this.ribbonLayoutChanged();
    }), t.addEventListener("dragend", () => {
      this.dragId = null;
      for (const e of t.querySelectorAll(".rib-group")) e.classList.remove("drop-target");
      for (const e of t.querySelectorAll(".tool-btn.dragging")) e.classList.remove("dragging");
    });
  }
  setRibbonEdit(t) {
    this.ribbonEdit = t, Q("btn-ribbon-edit").dataset.on = String(t), this.renderRibbon(), this.setHint(t ? "\u041D\u0410\u0421\u0422\u0420\u041E\u0419\u041A\u0410 \u041B\u0415\u041D\u0422\u042B \u2014 \u043F\u0435\u0440\u0435\u0442\u0430\u0441\u043A\u0438\u0432\u0430\u0439\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0438 \u043C\u0435\u0436\u0434\u0443 \u043F\u0430\u043D\u0435\u043B\u044F\u043C\u0438 \xB7 \u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043B\u0438\u043A \u043F\u043E \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044E \u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u0443\u0435\u0442 \u043F\u0430\u043D\u0435\u043B\u044C \xB7 \u2699 \u0438\u043B\u0438 \xAB\u0413\u043E\u0442\u043E\u0432\u043E\xBB \u0434\u043B\u044F \u0432\u044B\u0445\u043E\u0434\u0430" : "");
  }
  runAction(t) {
    switch (t) {
      case "erase":
        this.handlers.onErase();
        break;
      case "undo":
        this.handlers.onUndo();
        break;
      case "redo":
        this.handlers.onRedo();
        break;
      case "layers":
        this.toggleLayersPanel();
        break;
      case "help":
        this.toggleHelp();
        break;
      case "import":
        this.fileInput.click();
        break;
      case "dxf":
        this.handlers.onExportDxf();
        break;
      case "tocad":
        this.handlers.onToCad();
        break;
    }
  }
  toggleHelp(t) {
    const e = Q("help-panel"), n = t ?? e.classList.contains("hidden");
    n && !this.helpFilled && (Q("help-body").innerHTML = U0, this.helpFilled = true), e.classList.toggle("hidden", !n), e.classList.toggle("flex", n);
    const i = document.getElementById("btn-help");
    i && (i.dataset.active = String(n));
  }
  get helpOpen() {
    return !Q("help-panel").classList.contains("hidden");
  }
  toggleLayersPanel(t) {
    const e = t ?? this.layersPanel.classList.contains("hidden");
    this.layersPanel.classList.toggle("hidden", !e), this.layersPanel.classList.toggle("flex", e);
    const n = document.getElementById("btn-layers");
    if (n && (n.dataset.active = String(e)), e && !this.layersMoved && n) {
      const i = n.getBoundingClientRect();
      this.layersPanel.style.left = `${Math.max(8, i.left - 40)}px`, this.layersPanel.style.right = "auto", this.layersPanel.style.top = `${i.bottom + 14}px`;
    }
  }
  bindLayersDrag() {
    const t = Q("layers-header");
    let e = 0, n = 0;
    const i = (o) => {
      this.layersPanel.style.left = `${Math.max(4, Math.min(window.innerWidth - 60, o.clientX - e))}px`, this.layersPanel.style.top = `${Math.max(4, Math.min(window.innerHeight - 40, o.clientY - n))}px`;
    }, r = () => {
      window.removeEventListener("pointermove", i), window.removeEventListener("pointerup", r);
    };
    t.addEventListener("pointerdown", (o) => {
      if (o.target.id === "layers-close") return;
      const a = this.layersPanel.getBoundingClientRect();
      e = o.clientX - a.left, n = o.clientY - a.top, this.layersPanel.style.right = "auto", this.layersMoved = true, window.addEventListener("pointermove", i), window.addEventListener("pointerup", r), o.preventDefault();
    });
  }
  renderLayers(t) {
    this.layersList.innerHTML = "";
    for (const e of t) {
      const n = document.createElement("div");
      n.className = "layer-row", n.dataset.current = String(e.current);
      const i = document.createElement("button");
      i.className = "lr-cur", i.title = "\u0421\u0434\u0435\u043B\u0430\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0438\u043C", i.addEventListener("click", () => this.handlers.onLayerCurrent(e.name)), n.appendChild(i);
      const r = document.createElement("input");
      r.type = "color", r.className = "lr-color", r.value = e.color, r.title = "\u0426\u0432\u0435\u0442 \u0441\u043B\u043E\u044F", r.addEventListener("input", () => this.handlers.onLayerColor(e.name, r.value)), n.appendChild(r);
      const o = document.createElement("span");
      o.className = "lr-name", o.textContent = e.name, o.title = "\u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043B\u0438\u043A \u2014 \u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u0442\u044C", o.addEventListener("dblclick", () => this.handlers.onLayerRename(e.name)), n.appendChild(o);
      const a = document.createElement("select");
      a.className = "lr-select", a.title = "\u0422\u0438\u043F \u043B\u0438\u043D\u0438\u0438";
      for (const [d, f] of N0) {
        const g = document.createElement("option");
        g.value = d, g.textContent = f, g.selected = d === e.linetype, a.appendChild(g);
      }
      a.addEventListener("change", () => this.handlers.onLayerType(e.name, a.value)), n.appendChild(a);
      const l = document.createElement("select");
      l.className = "lr-select lr-weight", l.title = "\u0422\u043E\u043B\u0449\u0438\u043D\u0430 \u043B\u0438\u043D\u0438\u0438, \u043C\u043C";
      for (const d of O0) {
        const f = document.createElement("option");
        f.value = String(d), f.textContent = d.toFixed(2), f.selected = Math.abs(d - e.weight) < 1e-6, l.appendChild(f);
      }
      l.addEventListener("change", () => this.handlers.onLayerWeight(e.name, parseFloat(l.value))), n.appendChild(l);
      const c = document.createElement("span");
      c.className = "lr-count", c.textContent = String(e.count), c.title = `\u041E\u0431\u044A\u0435\u043A\u0442\u043E\u0432 \u043D\u0430 \u0441\u043B\u043E\u0435: ${e.count}`, n.appendChild(c);
      const h = document.createElement("button");
      h.className = "lr-eye", h.dataset.on = String(e.visible), h.title = e.visible ? "\u0421\u043A\u0440\u044B\u0442\u044C \u0441\u043B\u043E\u0439" : "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0441\u043B\u043E\u0439", h.textContent = e.visible ? "\u{1F441}" : "\u2014", h.addEventListener("click", () => this.handlers.onLayerToggleVisible(e.name)), n.appendChild(h);
      const u = document.createElement("button");
      u.className = "lr-del", u.title = e.name === "0" ? "\u0421\u043B\u043E\u0439 \xAB0\xBB \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u043D\u0435\u043B\u044C\u0437\u044F" : "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0441\u043B\u043E\u0439 (\u043E\u0431\u044A\u0435\u043A\u0442\u044B \u0443\u0439\u0434\u0443\u0442 \u043D\u0430 \u0441\u043B\u043E\u0439 \xAB0\xBB)", u.textContent = "\u2715", u.disabled = e.name === "0", u.addEventListener("click", () => this.handlers.onLayerDelete(e.name)), n.appendChild(u), this.layersList.appendChild(n);
    }
  }
  setWeightPill(t) {
    this.pillWeight.dataset.on = String(t);
  }
  setLayerCombo(t, e, n, i) {
    if (this.layerSelect.innerHTML = "", n && e === null) {
      const r = document.createElement("option");
      r.value = "", r.textContent = "\u2014 \u0440\u0430\u0437\u043D\u044B\u0435 \u2014", this.layerSelect.appendChild(r);
    }
    for (const r of t) {
      const o = document.createElement("option");
      o.value = r, o.textContent = r, this.layerSelect.appendChild(o);
    }
    this.layerSelect.value = e ?? "", this.layerSelect.dataset.selection = String(n), this.layerSelect.title = n ? "\u041F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B \u043D\u0430 \u0441\u043B\u043E\u0439 (\u0446\u0432\u0435\u0442 \u0438 \u0442\u0438\u043F \u043B\u0438\u043D\u0438\u0438 \u0432\u043E\u0437\u044C\u043C\u0443\u0442\u0441\u044F \u043E\u0442 \u0441\u043B\u043E\u044F)" : "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0441\u043B\u043E\u0439 \u2014 \u043D\u0430 \u043D\u0451\u043C \u043F\u043E\u044F\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u043D\u043E\u0432\u044B\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B", Q("layer-swatch").style.background = i;
  }
  showStart(t) {
    Q("start-overlay").classList.toggle("hidden", !t);
  }
  setProgress(t) {
    const e = Q("start-progress");
    if (t === null) {
      e.classList.add("hidden");
      return;
    }
    e.textContent = t, e.classList.remove("hidden"), this.setHint(t);
  }
  openCloudPanel(t, e) {
    if (this.cloudPanelFor === t) {
      this.closeCloudPanel();
      return;
    }
    this.cloudPanelFor = t, Q("cp-size").value = String(e.size), Q("cp-opacity").value = String(e.opacity), Q("cp-density").value = String(e.density), Q("cp-mode").value = String(e.mode);
    const n = { main: "\u041E\u0411\u041B\u0410\u041A\u041E \xB7 \u0413\u041B\u0410\u0412\u041D\u041E\u0415", profile: "\u041E\u0411\u041B\u0410\u041A\u041E \xB7 \u041F\u0420\u041E\u0424\u0418\u041B\u042C", iso: "\u041E\u0411\u041B\u0410\u041A\u041E \xB7 3D" };
    Q("cloud-panel-title").textContent = n[t];
    const i = Q("cloud-panel");
    i.classList.remove("hidden"), i.classList.add("flex");
    const r = Q(`gear-${t}`).getBoundingClientRect();
    i.style.left = `${Math.max(8, Math.min(r.right, window.innerWidth - 8) - i.offsetWidth)}px`, i.style.top = t === "iso" ? `${r.top - i.offsetHeight - 8}px` : `${r.bottom + 8}px`;
  }
  closeCloudPanel() {
    this.cloudPanelFor = null;
    const t = Q("cloud-panel");
    t.classList.add("hidden"), t.classList.remove("flex");
  }
  setLayerVisible(t, e) {
    Q(`eye-${t}`).dataset.on = String(e);
  }
  setCloudVisible(t, e) {
    Q(`cloudeye-${t}`).dataset.on = String(e);
  }
  setActiveTool(t) {
    this.activeToolId = t;
    for (const e of this.toolButtons) e.dataset.active = String(e.dataset.tool === t);
  }
  setSnap(t) {
    this.pillSnap.dataset.on = String(t);
  }
  setOrtho(t) {
    this.pillOrtho.dataset.on = String(t);
  }
  setUcsList(t, e) {
    if (this.ucsSelect.innerHTML = "", !t.length) {
      const n = document.createElement("option");
      n.textContent = "\u041C\u0421\u041A", this.ucsSelect.appendChild(n), this.ucsSelect.disabled = true;
      return;
    }
    this.ucsSelect.disabled = false;
    for (const n of t) {
      const i = document.createElement("option");
      i.textContent = n, this.ucsSelect.appendChild(i);
    }
    this.ucsSelect.selectedIndex = Math.max(0, e);
  }
  setHint(t) {
    this.hint.textContent = t;
  }
  setCoords(t, e, n) {
    this.coords.textContent = n === void 0 ? `X ${t.toFixed(3)}  Y ${e.toFixed(3)}` : `E ${t.toFixed(3)}  N ${e.toFixed(3)}  H ${n.toFixed(3)}`;
  }
  setFps(t, e = -1) {
    this.fps.textContent = String(t), e >= 0 && (this.ptsOut.textContent = e >= 1e3 ? `${Math.round(e / 1e3)}k` : String(e));
  }
  setActivePane(t, e) {
    const n = Q("pane-focus");
    n.style.left = `${e.x + 1}px`, n.style.top = `${e.y + 1}px`, n.style.width = `${Math.max(0, e.w - 2)}px`, n.style.height = `${Math.max(0, e.h - 2)}px`, n.dataset.pane = t;
    const i = { main: "lbl-main", profile: "lbl-profile", iso: "lbl-iso" };
    for (const [r, o] of Object.entries(i)) {
      const a = document.getElementById(o);
      a && (a.dataset.active = String(r === t));
    }
  }
  setMainLabel(t) {
    this.lblMain.textContent = t;
  }
  setProfileLabel(t) {
    Q("lbl-profile").textContent = t;
  }
  setProfileMode(t) {
    const e = Q("profile-mode");
    e.textContent = t ? "\u0412\u0415\u0420\u0422" : "\u0413\u041E\u0420\u0418\u0417", e.dataset.on = "true";
  }
  setProfileWindow(t) {
    Q("profile-window").value = String(t), Q("profile-window-val").textContent = `${t.toFixed(1)} \u043C`;
  }
  showSectionPanel(t) {
    this.sectionPanel.classList.toggle("hidden", !t), this.sectionPanel.classList.toggle("flex", t);
    const e = Q("cursor-panel");
    e.classList.toggle("hidden", !t), e.classList.toggle("flex", t);
    const n = Q("slice-panel");
    n.classList.toggle("hidden", !t), n.classList.toggle("flex", t);
  }
  setPlanSliceRange(t, e) {
    const n = Q("plan-level"), i = Math.floor(t * 100) / 100, r = Math.ceil(e * 100) / 100;
    n.min = String(i), n.max = String(r), n.step = String(Math.max(0.01, (r - i) / 500));
  }
  setPlanSlice(t, e, n) {
    Q("plan-slice-pill").dataset.on = String(t), Q("plan-level").value = String(e), Q("plan-thick").value = String(n);
    const i = Q("plan-level-val");
    document.activeElement !== i && (i.value = e.toFixed(2));
    const r = Q("plan-thick-val");
    document.activeElement !== r && (r.value = n.toFixed(2)), Q("plan-range").textContent = `${(e - n / 2).toFixed(2)}\u2026${(e + n / 2).toFixed(2)}`;
  }
  showPlanSlicePanel(t) {
    const e = Q("plan-slice-panel");
    e.classList.toggle("hidden", !t), e.classList.toggle("flex", t);
  }
  showElevationAids(t) {
    Q("elev-scale").classList.toggle("hidden", !t), t || Q("elev-cursor").classList.add("hidden");
  }
  renderElevationScale(t) {
    const e = Q("elev-scale");
    e.innerHTML = "";
    for (const n of t) {
      const i = document.createElement("div");
      i.className = "elev-tick", i.dataset.major = String(n.major), i.style.top = `${n.y}px`;
      const r = document.createElement("span");
      r.textContent = n.label, i.appendChild(r), e.appendChild(i);
    }
  }
  setElevationCursor(t, e, n, i) {
    const r = Q("elev-cursor");
    if (t === null) {
      r.classList.add("hidden");
      return;
    }
    r.classList.remove("hidden"), r.style.top = `${t}px`, r.style.left = `${n}px`, r.style.width = `${i}px`, Q("elev-cursor-val").textContent = e;
  }
  setCoordsText(t) {
    this.coords.textContent = t;
  }
  setFacadeSlice(t, e, n) {
    Q("slice-pill").dataset.on = String(t);
    const i = Math.round(e * 1e3), r = Math.round(n * 1e3);
    Q("slice-lo-val").value = String(i), Q("slice-hi-val").value = String(r), Q("slice-val").textContent = `\u0422 ${Math.max(0, r - i)} \u043C\u043C`;
  }
  renderDepthRuler(t, e, n) {
    const i = Q("depth-ruler");
    i.classList.remove("hidden"), i.dataset.horizontal = String(e);
    const r = i.style;
    e ? (r.left = `${n.x}px`, r.top = `${n.y + n.h - 22}px`, r.width = `${n.w}px`, r.height = "22px") : (r.left = `${n.x + n.w - 46}px`, r.top = `${n.y}px`, r.width = "46px", r.height = `${n.h}px`), i.innerHTML = "";
    for (const o of t) {
      const a = document.createElement("div");
      a.className = "dr-tick", a.dataset.major = String(o.major), e ? a.style.left = `${o.p}px` : a.style.top = `${o.p}px`;
      const l = document.createElement("span");
      l.textContent = o.label, a.appendChild(l), i.appendChild(a);
    }
  }
  hideDepthRuler() {
    Q("depth-ruler").classList.add("hidden");
  }
  setSectionValue(t) {
    this.sectionVal.textContent = `${t.toFixed(2)} \u043C`;
  }
  showMarquee(t, e, n, i, r) {
    const o = this.marquee.style;
    o.left = `${t}px`, o.top = `${e}px`, o.width = `${n}px`, o.height = `${i}px`, this.marquee.dataset.crossing = String(r), this.marquee.classList.remove("hidden");
  }
  hideMarquee() {
    this.marquee.classList.add("hidden");
  }
  showDynInput(t, e, n, i) {
    this.dynInput.textContent = i ? `${n} ${i}` : n;
    const r = this.dynInput.style;
    r.left = `${t}px`, r.top = `${e}px`, this.dynInput.classList.remove("hidden");
  }
  hideDynInput() {
    this.dynInput.classList.add("hidden");
  }
}
const Zi = { cell: 0, minArea: 0.25, maxArea: 15, minSide: 0.35, minFill: 0.8 }, z0 = 4e6;
function k0(s, t, e, n = false) {
  if (t < 200) return null;
  let i = 1 / 0, r = 1 / 0, o = -1 / 0, a = -1 / 0;
  for (let O = 0; O < t; O++) {
    const N = s[O * 2], G = s[O * 2 + 1];
    N < i && (i = N), N > o && (o = N), G < r && (r = G), G > a && (a = G);
  }
  const l = o - i, c = a - r;
  if (!(l > 0) || !(c > 0)) return null;
  const h = Math.sqrt(l * c / t);
  let u = h;
  {
    const O = Math.min(0.5, Math.max(0.02, h * 3.5)), N = Math.max(1, Math.min(2048, Math.ceil(l / O))), G = Math.max(1, Math.min(2048, Math.ceil(c / O))), j = new Uint8Array(N * G);
    for (let Z = 0; Z < t; Z++) {
      const W = Math.min(N - 1, (s[Z * 2] - i) / (l / N) | 0), it = Math.min(G - 1, (s[Z * 2 + 1] - r) / (c / G) | 0);
      j[it * N + W] = 1;
    }
    let V = 0;
    for (let Z = 0; Z < j.length; Z++) V += j[Z];
    V > 0 && (u = Math.sqrt(l / N * (c / G) * V / t)), u = Math.max(u, h * 0.3);
  }
  const d = n ? 1.6 : 3.5, f = n ? 1.6 : 2.2;
  let g = e.cell > 0 ? e.cell : Math.min(0.25, Math.max(0.02, u * d));
  for (e.cell > 0 && (g = Math.max(e.cell, u * f)); (l / g + 2) * (c / g + 2) > z0; ) g *= 1.5;
  const _ = Math.ceil(l / g) + 2, m = Math.ceil(c / g) + 2, p = i - g, T = r - g, w = _ * m, S = new Int32Array(w), U = new Int32Array(t);
  for (let O = 0; O < t; O++) {
    const N = (s[O * 2] - p) / g | 0, G = (s[O * 2 + 1] - T) / g | 0, j = N >= 0 && G >= 0 && N < _ && G < m ? G * _ + N : -1;
    U[O] = j, j >= 0 && S[j]++;
  }
  const C = new Int32Array(w + 1);
  for (let O = 0; O < w; O++) C[O + 1] = C[O] + S[O];
  const R = new Int32Array(C[w]), F = new Int32Array(w);
  for (let O = 0; O < t; O++) {
    const N = U[O];
    N >= 0 && (R[C[N] + F[N]++] = O);
  }
  let M = new Uint8Array(w);
  if (n) {
    const O = new Int32Array(1024);
    let N = 0;
    for (let V = 0; V < w; V++) S[V] > 0 && (O[Math.min(1023, S[V])]++, N++);
    let G = 1;
    for (let V = 1, Z = 0; V < 1024; V++) if (Z += O[V], Z >= N / 2) {
      G = V;
      break;
    }
    const j = Math.max(1, Math.round(G * 0.3));
    for (let V = 0; V < w; V++) M[V] = S[V] >= j ? 1 : 0;
  } else for (let O = 0; O < w; O++) M[O] = S[O] > 0 ? 1 : 0;
  n ? H0(M, _, m) : M = V0(M, _, m);
  const y = n ? W0(M, _, m) : G0(M, _, m), P = X0(y, _);
  return { nx: _, ny: m, cell: g, minX: p, minY: T, spacing: u, islands: n, label: y, regions: P, start: C, items: R, xy: s, n: t };
}
function H0(s, t, e) {
  const n = s.slice();
  for (let i = 1; i < e - 1; i++) for (let r = 1; r < t - 1; r++) {
    const o = i * t + r;
    if (n[o]) continue;
    let a = 0;
    a += n[o - t - 1] + n[o - t] + n[o - t + 1], a += n[o - 1] + n[o + 1], a += n[o + t - 1] + n[o + t] + n[o + t + 1], a >= 7 && (s[o] = 1);
  }
}
function V0(s, t, e) {
  const n = new Uint8Array(s.length);
  for (let r = 0; r < e; r++) for (let o = 0; o < t; o++) {
    const a = r * t + o;
    if (s[a]) {
      n[a] = 1;
      continue;
    }
    let l = 0;
    for (let c = -1; c <= 1 && !l; c++) {
      const h = r + c;
      if (!(h < 0 || h >= e)) for (let u = -1; u <= 1; u++) {
        const d = o + u;
        if (!(d < 0 || d >= t) && s[h * t + d]) {
          l = 1;
          break;
        }
      }
    }
    n[a] = l;
  }
  const i = new Uint8Array(s.length);
  for (let r = 0; r < e; r++) for (let o = 0; o < t; o++) {
    const a = r * t + o;
    if (!n[a]) continue;
    let l = 1;
    for (let c = -1; c <= 1 && l; c++) {
      const h = r + c;
      if (!(h < 0 || h >= e)) for (let u = -1; u <= 1; u++) {
        const d = o + u;
        if (!(d < 0 || d >= t) && !n[h * t + d]) {
          l = 0;
          break;
        }
      }
    }
    i[a] = l;
  }
  return i;
}
function G0(s, t, e) {
  const n = new Int32Array(s.length), i = new Int32Array(s.length);
  let r = 0;
  const o = (l) => {
    s[l] === 0 && n[l] === 0 && (n[l] = 1, i[r++] = l);
  };
  for (let l = 0; l < t; l++) o(l), o((e - 1) * t + l);
  for (let l = 0; l < e; l++) o(l * t), o(l * t + t - 1);
  for (; r > 0; ) {
    const l = i[--r], c = l % t, h = l / t | 0;
    c > 0 && o(l - 1), c < t - 1 && o(l + 1), h > 0 && o(l - t), h < e - 1 && o(l + t);
  }
  let a = 2;
  for (let l = 0; l < n.length; l++) {
    if (s[l] !== 0 || n[l] !== 0) continue;
    const c = a++;
    for (n[l] = c, i[r++] = l; r > 0; ) {
      const h = i[--r], u = h % t, d = h / t | 0, f = (g) => {
        s[g] === 0 && n[g] === 0 && (n[g] = c, i[r++] = g);
      };
      u > 0 && f(h - 1), u < t - 1 && f(h + 1), d > 0 && f(h - t), d < e - 1 && f(h + t);
    }
  }
  return n;
}
function W0(s, t, e) {
  const n = new Int32Array(s.length), i = new Int32Array(s.length);
  let r = 0, o = 2;
  for (let a = 0; a < n.length; a++) {
    if (s[a] === 0 || n[a] !== 0) continue;
    const l = o++;
    for (n[a] = l, i[r++] = a; r > 0; ) {
      const c = i[--r], h = c % t, u = c / t | 0, d = (f) => {
        s[f] !== 0 && n[f] === 0 && (n[f] = l, i[r++] = f);
      };
      h > 0 && d(c - 1), h < t - 1 && d(c + 1), u > 0 && d(c - t), u < e - 1 && d(c + t);
    }
  }
  return n;
}
function X0(s, t, e) {
  const n = /* @__PURE__ */ new Map();
  for (let i = 0; i < s.length; i++) {
    const r = s[i];
    if (r < 2) continue;
    const o = i % t, a = i / t | 0, l = n.get(r);
    l ? (o < l.cx0 && (l.cx0 = o), o > l.cx1 && (l.cx1 = o), a < l.cy0 && (l.cy0 = a), a > l.cy1 && (l.cy1 = a), l.cells++) : n.set(r, { id: r, cx0: o, cy0: a, cx1: o, cy1: a, cells: 1 });
  }
  return [...n.values()];
}
function Ar(s, t, e, n, i, r, o) {
  const { xy: a, start: l, items: c, cell: h, nx: u, ny: d, minX: f, minY: g } = s, _ = o > 0 ? e - r : e, m = o > 0 ? e : e + r, p = t === 0 ? f : g, T = t === 0 ? g : f, w = t === 0 ? u : d, S = t === 0 ? d : u, U = Cr((Math.min(_, m) - p) / h | 0, 0, w - 1), C = Cr((Math.max(_, m) - p) / h | 0, 0, w - 1), R = Cr((n - T) / h | 0, 0, S - 1), F = Cr((i - T) / h | 0, 0, S - 1), M = /* @__PURE__ */ new Map();
  let y = 0;
  const P = s.spacing > 0 ? s.spacing : h;
  for (let H = R; H <= F; H++) for (let J = U; J <= C; J++) {
    const dt = t === 0 ? H * u + J : J * u + H;
    for (let st = l[dt]; st < l[dt + 1]; st++) {
      const Et = c[st], kt = a[Et * 2 + t], wt = a[Et * 2 + (t ^ 1)];
      if (wt < n || wt > i) continue;
      const ae = (kt - e) * o;
      if (ae > 0 || ae < -r) continue;
      y++;
      const ie = Math.floor(wt / P), Bt = M.get(ie);
      Bt ? Bt.push(kt) : M.set(ie, [kt]);
    }
  }
  if (y < 6) return { value: e, sigma: s.spacing };
  const O = [], N = [];
  for (const H of M.values()) {
    H.sort((J, dt) => J - dt), O.push(o > 0 ? H[H.length - 1] : H[0]);
    for (let J = 1; J < H.length; J++) N.push(H[J] - H[J - 1]);
  }
  N.sort((H, J) => H - J);
  const G = N.length ? N[N.length >> 1] : 0, j = G > 0 ? G * 3 : 1 / 0;
  let V = 0, Z = 0, W = 0;
  for (const H of N) H <= 0 || H > j || (V += H, Z += H * H, W++);
  const it = r * (i - n), ht = it > 0 ? Math.sqrt(it / y) : s.spacing, _t = W >= 4 ? Z / (2 * V) : ht * 0.5;
  if (O.sort((H, J) => H - J), O.length < 3) {
    const H = Math.min(2, Math.floor(O.length * 0.5));
    return { value: (o > 0 ? O[O.length - 1 - H] : O[H]) + o * _t, sigma: _t };
  }
  const Ut = O[O.length >> 1];
  let jt = 0;
  for (const H of O) jt += Math.abs(H - Ut);
  return jt /= O.length, { value: Ut + o * _t, sigma: Math.max(_t * 0.5, 1.25 * jt / Math.sqrt(O.length)) };
}
const Cr = (s, t, e) => s < t ? t : s > e ? e : s;
let Ua = 0;
function Y0(s, t) {
  const e = [];
  Ua = 0;
  for (const n of s.regions) {
    if (!Ah(s, n, t)) continue;
    const i = Ch(s, n, t, false);
    i ? e.push(i) : Ua++;
  }
  return e.sort((n, i) => i.fill - n.fill), e;
}
function q0(s, t, e, n) {
  const i = (t - s.minX) / s.cell | 0, r = (e - s.minY) / s.cell | 0;
  if (i < 0 || r < 0 || i >= s.nx || r >= s.ny) return null;
  let o = s.label[r * s.nx + i];
  if (o < 2) {
    let c = 1 / 0;
    for (let h = -4; h <= 4; h++) {
      const u = r + h;
      if (!(u < 0 || u >= s.ny)) for (let d = -4; d <= 4; d++) {
        const f = i + d;
        if (f < 0 || f >= s.nx) continue;
        const g = s.label[u * s.nx + f];
        if (g < 2) continue;
        const _ = d * d + h * h;
        _ < c && (c = _, o = g);
      }
    }
  }
  if (o < 2) return null;
  const a = s.regions.find((l) => l.id === o);
  return a ? Ch(s, a, n, true) : null;
}
function Ah(s, t, e) {
  const { cell: n } = s, i = (t.cx1 - t.cx0 + 1) * n, r = (t.cy1 - t.cy0 + 1) * n, o = t.cells / ((t.cx1 - t.cx0 + 1) * (t.cy1 - t.cy0 + 1)), a = t.cells * n * n;
  return a >= e.minArea && a <= e.maxArea && i >= e.minSide && r >= e.minSide && o >= e.minFill;
}
function Pc(s, t, e) {
  if (!s.length) return [];
  const n = [...s].sort((a, l) => a - l), i = [];
  let r = [n[0]];
  const o = () => {
    r.length >= e && i.push(r[r.length >> 1]);
  };
  for (let a = 1; a < n.length; a++) n[a] - n[a - 1] <= t ? r.push(n[a]) : (o(), r = [n[a]]);
  return o(), i;
}
const Lc = (s) => s.length ? [...s].sort((t, e) => t - e)[s.length >> 1] : 0;
function $0(s, t = 0.06) {
  const e = s.filter((l) => l.grade === "good"), n = e.length >= 2 ? e : s, i = [], r = [], o = [], a = [];
  for (const l of n) i.push(l.x0, l.x1), r.push(l.y0, l.y1), o.push(l.x1 - l.x0), a.push(l.y1 - l.y0);
  return { xs: Pc(i, t, 2), ys: Pc(r, t, 2), typW: n.length >= 3 ? Lc(o) : 0, typH: n.length >= 3 ? Lc(a) : 0 };
}
const Rr = (s, t, e) => {
  let n = null, i = e;
  for (const r of s) {
    const o = Math.abs(r - t);
    o <= i && (i = o, n = r);
  }
  return n;
};
function Dc(s, t, e) {
  const n = { ...s }, i = Rr(t.xs, s.x0, e), r = Rr(t.xs, s.x1, e), o = Rr(t.ys, s.y0, e), a = Rr(t.ys, s.y1, e);
  i !== null && (n.x0 = i), r !== null && (n.x1 = r), o !== null && (n.y0 = o), a !== null && (n.y1 = a);
  const l = (c, h, u, d, f) => {
    if (!f || u !== null && d !== null) return [c, h];
    if (Math.abs(h - c - f) > f * 0.33) return [c, h];
    if (u !== null) return [c, c + f];
    if (d !== null) return [h - f, h];
    const g = (c + h) / 2;
    return [g - f / 2, g + f / 2];
  };
  return [n.x0, n.x1] = l(n.x0, n.x1, i, r, t.typW), [n.y0, n.y1] = l(n.y0, n.y1, o, a, t.typH), n;
}
function Ch(s, t, e, n) {
  const { cell: i, minX: r, minY: o } = s, a = t.cells / ((t.cx1 - t.cx0 + 1) * (t.cy1 - t.cy0 + 1));
  if (!n && !Ah(s, t, e)) return null;
  let l = r + t.cx0 * i, c = r + (t.cx1 + 1) * i, h = o + t.cy0 * i, u = o + (t.cy1 + 1) * i;
  const d = i * 1.2, f = s.islands ? -1 : 1, g = s.islands ? 1 : -1;
  let _ = { value: l, sigma: i }, m = { value: c, sigma: i }, p = { value: h, sigma: i }, T = { value: u, sigma: i };
  for (let C = 0; C < 2; C++) {
    const R = (c - l) * 0.2, F = (u - h) * 0.2;
    if (_ = Ar(s, 0, l, h + F, u - F, d, f), l = _.value, m = Ar(s, 0, c, h + F, u - F, d, g), c = m.value, p = Ar(s, 1, h, l + R, c - R, d, f), h = p.value, T = Ar(s, 1, u, l + R, c - R, d, g), u = T.value, !(c > l) || !(u > h)) return null;
  }
  const w = (C, R) => Math.sqrt(C * C + R * R), S = w(_.sigma, m.sigma), U = w(p.sigma, T.sigma);
  if (!n) {
    const C = c - l, R = u - h;
    if (S > C * 0.1 && S > 0.03 || U > R * 0.1 && U > 0.03) return null;
  }
  return { x0: l, y0: h, x1: c, y1: u, fill: a, sigmaW: S, sigmaH: U, grade: j0(s, S, U, a) };
}
function j0(s, t, e, n) {
  const i = Math.max(t, e) / Math.max(s.spacing, 1e-4), r = i <= 0.7 ? "good" : i <= 1.4 ? "fair" : "poor", o = n >= 0.93 ? "good" : n >= 0.86 ? "fair" : "poor", a = { good: 0, fair: 1, poor: 2 };
  return a[r] >= a[o] ? r : o;
}
const Z0 = "openings-panel";
class K0 extends ye {
  constructor(t, e) {
    super(t, e), this.id = "openings", this.hint = "\u041F\u0420\u041E\u0401\u041C\u042B \u2014 \u043A\u043B\u0438\u043A \u043F\u043E \u0440\u0430\u043C\u043A\u0435 \u0443\u0431\u0438\u0440\u0430\u0435\u0442 \u043B\u0438\u0448\u043D\u0435\u0435, \u043A\u043B\u0438\u043A \u0432 \u043F\u0443\u0441\u0442\u043E\u0439 \u043F\u0440\u043E\u0451\u043C \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u0442 \u0435\u0433\u043E \xB7 \u043F\u043E\u043B\u0437\u0443\u043D\u043A\u0438 \u043F\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u044E\u0442 \xB7 Enter \u043E\u0431\u0432\u0435\u0441\u0442\u0438 \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.params = { ...Zi }, this.rects = [], this.sel = -1, this.grab = null, this.wall = null, this.grid = null, this.gridCell = -1, this.mode = "holes", this.region = null, this.regionArm = false, this.pipetteArm = false, this.regionDrag = null, this.regionPreview = null, this.cut = null, this.wallBounds = null, this.onSlider = () => this.readPanel(true), this.onModeBtn = () => this.toggleMode(), this.onRegionBtn = () => this.armRegion(), this.onRegionClearBtn = () => this.clearRegion(), this.onPickBtn = () => this.togglePipette(), this.onColorCtl = () => this.readColorPanel(), this.onChipClick = () => this.clearSamples(), this.gradeColor = { good: new zt(In("--ok", 3009420)), fair: new zt(In("--accent-2", 16756796)), poor: new zt(In("--bad", 16281969)) };
    const n = (i) => {
      const r = new Sn({ vertexColors: true, linewidth: i, transparent: true, opacity: 0.95, depthTest: false }), o = new Gr(new jn(), r);
      return o.renderOrder = 2, o.frustumCulled = false, o.layers.set(3), o.visible = false, t.ucs.group.add(o), [o, r];
    };
    [this.thin, this.thinMat] = n(1.8), [this.thick, this.thickMat] = n(3.4), this.regionMat = new Sn({ color: In("--accent", 6727935), linewidth: 2.2, transparent: true, opacity: 0.85, depthTest: false }), this.regionObj = new Gr(new jn(), this.regionMat), this.regionObj.renderOrder = 2, this.regionObj.frustumCulled = false, this.regionObj.layers.set(3), this.regionObj.visible = false, t.ucs.group.add(this.regionObj);
  }
  setResolution(t, e) {
    this.thinMat.resolution.set(t, e), this.thickMat.resolution.set(t, e), this.regionMat.resolution.set(t, e);
  }
  canArm() {
    return this.host.hasWall() ? null : "\u041F\u0440\u043E\u0451\u043C\u044B \u0438\u0449\u0443\u0442\u0441\u044F \u043F\u043E \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u043E\u0439 \u0441\u0442\u0435\u043D\u0435: \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0428\u0410\u0413 1 \u2014 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0442\u0435\u043D\u0443 \u043B\u0430\u0441\u0441\u043E \u0438 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u041F\u0421\u041A";
  }
  activate() {
    var _a2;
    if (this.wall = this.host.wallPointsXY(), !this.wall) {
      this.host.ui.setHint("\u0412 \u0441\u0440\u0435\u0437\u0435 \u043F\u043E \u0433\u043B\u0443\u0431\u0438\u043D\u0435 \u043D\u0435\u0442 \u0442\u043E\u0447\u0435\u043A \u2014 \u0440\u0430\u0441\u0448\u0438\u0440\u044C\u0442\u0435 \u0441\u0440\u0435\u0437 \u0438\u043B\u0438 \u0432\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0435\u0433\u043E");
      return;
    }
    this.computeWallBounds(), (_a2 = this.panel) == null ? void 0 : _a2.classList.remove("hidden"), this.host.ui.refreshRibbonHeight(), this.bindPanel(true), this.syncModeButton(), this.setRegionButtons(), this.syncColorUI(), this.readPanel(false), this.recompute();
  }
  deactivate() {
    var _a2;
    (_a2 = this.panel) == null ? void 0 : _a2.classList.add("hidden"), this.host.ui.refreshRibbonHeight(), this.bindPanel(false), this.thin.visible = false, this.thick.visible = false, this.rects = [], this.wall = null, this.grid = null, this.gridCell = -1, this.region = null, this.cut = null, this.wallBounds = null, this.regionArm = false, this.regionDrag = null, this.regionPreview = null, this.pipetteArm = false, this.host.setSearchRegion(null), this.drawRegion(null);
  }
  refreshWall() {
    if (!(!this.panel || this.panel.classList.contains("hidden"))) {
      if (this.wall = this.host.wallPointsXY(), this.cut = null, this.grid = null, this.gridCell = -1, !this.wall) {
        this.rects = [], this.sel = -1, this.redraw(), this.host.ui.setHint("\u0412 \u0441\u0440\u0435\u0437\u0435 \u043D\u0435 \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0442\u043E\u0447\u0435\u043A \u2014 \u0440\u0430\u0437\u0434\u0432\u0438\u043D\u044C\u0442\u0435 \u0433\u0440\u0430\u043D\u0438\u0446\u044B \u041E\u0422/\u0414\u041E \u0438\u043B\u0438 \u0432\u0435\u0440\u043D\u0438\u0442\u0435 \u0441\u0440\u0435\u0437 \u043A \u0441\u0442\u0435\u043D\u0435");
        return;
      }
      this.computeWallBounds(), this.recompute();
    }
  }
  onDown(t) {
    if (this.pipetteArm) {
      if (this.host.addColorSample(this.mgr.ray)) {
        this.syncColorUI();
        const r = this.host.colorFilter();
        this.host.ui.setHint(`\u041E\u0431\u0440\u0430\u0437\u0435\u0446 \u0432\u0437\u044F\u0442 (\u0432\u0441\u0435\u0433\u043E ${r.count}) \u2014 \u0435\u0449\u0451 \u043A\u043B\u0438\u043A \u0434\u043E\u0431\u0430\u0432\u0438\u0442, Esc \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u0442` + (r.on ? "" : " \xB7 \u043D\u0435 \u0437\u0430\u0431\u0443\u0434\u044C\u0442\u0435 \u0433\u0430\u043B\u043E\u0447\u043A\u0443 \u0426\u0412\u0415\u0422")), r.on && this.refreshWall();
      } else this.host.ui.setHint("\u0422\u043E\u0447\u043A\u0430 \u0441\u043A\u0430\u043D\u0430 \u043F\u043E\u0434 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C \u043D\u0435 \u043D\u0430\u0448\u043B\u0430\u0441\u044C \u2014 \u0446\u0435\u043B\u044C\u0442\u0435\u0441\u044C \u0432 \u043E\u0431\u043B\u0430\u043A\u043E");
      return;
    }
    if (this.regionArm) {
      this.regionDrag = { x: t.local.x, y: t.local.y }, this.regionPreview = null;
      return;
    }
    if (!this.grid) return;
    const e = this.pick(t.local.x, t.local.y);
    if (e >= 0) {
      this.sel = e, this.grab = this.grabPart(this.rects[e], t.local.x, t.local.y), this.redraw(), this.tellSelection();
      return;
    }
    const n = q0(this.grid, t.local.x, t.local.y, this.params);
    n ? (this.rects.push(n), this.sel = this.rects.length - 1, this.redraw(), this.tellSelection()) : (this.sel = -1, this.redraw(), this.host.ui.setHint("\u0417\u0434\u0435\u0441\u044C \u0441\u0442\u0435\u043D\u0430, \u0430 \u043D\u0435 \u043F\u0440\u043E\u0451\u043C \u2014 \u0442\u043A\u043D\u0438\u0442\u0435 \u0432\u043D\u0443\u0442\u0440\u044C \u043E\u043A\u043D\u0430 \u0438\u043B\u0438 \u043F\u043E\u0434\u0432\u0438\u043D\u044C\u0442\u0435 \xAB\u0421\u0415\u0422\u041A\u0410\xBB"));
  }
  onMove(t) {
    if (this.regionDrag) {
      const o = this.regionDrag;
      this.regionPreview = { x0: Math.min(o.x, t.local.x), y0: Math.min(o.y, t.local.y), x1: Math.max(o.x, t.local.x), y1: Math.max(o.y, t.local.y) }, this.drawRegion(this.regionPreview);
      return;
    }
    if (!this.grab || this.sel < 0) return;
    const e = { ...this.rects[this.sel] }, n = this.grab;
    if (n.part === "move") {
      const o = t.local.x - n.px, a = t.local.y - n.py;
      e.x0 = n.x0 + o, e.x1 = n.x1 + o, e.y0 = n.y0 + a, e.y1 = n.y1 + a;
    } else n.part.includes("l") && (e.x0 = t.local.x), n.part.includes("r") && (e.x1 = t.local.x), n.part.includes("b") && (e.y0 = t.local.y), n.part.includes("t") && (e.y1 = t.local.y), e.x1 < e.x0 && ([e.x0, e.x1] = [e.x1, e.x0]), e.y1 < e.y0 && ([e.y0, e.y1] = [e.y1, e.y0]);
    const i = this.consensus(), r = Dc(e, { ...i, typW: 0, typH: 0 }, 0.04);
    this.rects[this.sel] = { ...r, grade: "good" }, this.redraw(), this.tellSelection();
  }
  onUp() {
    if (this.regionDrag) {
      const t = this.regionPreview;
      if (this.regionDrag = null, this.regionArm = false, this.regionPreview = null, !t || t.x1 - t.x0 < 0.2 || t.y1 - t.y0 < 0.2) {
        this.drawRegion(this.region), this.setRegionButtons(), this.host.ui.setHint("\u041E\u0431\u043B\u0430\u0441\u0442\u044C \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u0430 \u2014 \u0437\u0430\u0436\u043C\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u043C\u044B\u0448\u0438 \u0438 \u043F\u0440\u043E\u0442\u044F\u043D\u0438\u0442\u0435 \u043F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A \u043F\u043E\u0431\u043E\u043B\u044C\u0448\u0435");
        return;
      }
      this.region = t, this.cut = null, this.grid = null, this.host.setSearchRegion(t), this.setRegionButtons(), this.drawRegion(t), this.recompute(), this.host.focusLocal((t.x0 + t.x1) / 2, (t.y0 + t.y1) / 2, t.x1 - t.x0, t.y1 - t.y0);
      return;
    }
    this.grab = null;
  }
  onFinish() {
    if (!this.rects.length) {
      this.mgr.activate("select");
      return;
    }
    this.host.snapshot();
    for (const t of this.rects) this.host.store.add(new Ue([new b(t.x0, t.y0, 0), new b(t.x1, t.y0, 0), new b(t.x1, t.y1, 0), new b(t.x0, t.y1, 0)], true));
    this.host.ui.setHint(`\u041E\u0431\u0432\u0435\u0434\u0435\u043D\u043E \u043F\u0440\u043E\u0451\u043C\u043E\u0432: ${this.rects.length}`), this.mgr.activate("select");
  }
  onKey(t) {
    if (t.key === "Escape") return this.pipetteArm ? (this.pipetteArm = false, this.syncColorUI(), this.tellSelection(), true) : this.regionArm || this.regionDrag ? (this.regionArm = false, this.regionDrag = null, this.regionPreview = null, this.drawRegion(this.region), this.setRegionButtons(), this.tellSelection(), true) : (this.mgr.activate("select"), true);
    if (t.key === "Delete" || t.key === "Backspace") return this.sel < 0 ? false : (this.rects.splice(this.sel, 1), this.sel = Math.min(this.sel, this.rects.length - 1), this.redraw(), this.tellSelection(), true);
    if (t.key === "n" || t.key === "\u0442" || t.key === "N" || t.key === "\u0422") {
      const e = this.rects.length;
      for (let n = 1; n <= e; n++) {
        const i = (this.sel + n + e) % e;
        if (this.rects[i].grade !== "good") return this.sel = i, this.focusSelected(), this.redraw(), this.tellSelection(), true;
      }
      return this.host.ui.setHint("\u0421\u043E\u043C\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0440\u0430\u043C\u043E\u043A \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435\u0442 \u2014 Enter \u043E\u0431\u0432\u0435\u0441\u0442\u0438"), true;
    }
    if (t.key === "t" || t.key === "\u0435" || t.key === "T" || t.key === "\u0415") {
      const e = this.consensus();
      if (!e.xs.length && !e.ys.length && !e.typW) return this.host.ui.setHint("\u0422\u0438\u043F\u043E\u0432\u044B\u0435 \u0440\u0430\u0437\u043C\u0435\u0440\u044B \u043D\u0435 \u0438\u0437 \u0447\u0435\u0433\u043E \u0432\u044B\u0432\u0435\u0441\u0442\u0438 \u2014 \u043D\u0443\u0436\u043D\u043E \u0445\u043E\u0442\u044F \u0431\u044B \u0442\u0440\u0438 \u043D\u0430\u0434\u0451\u0436\u043D\u044B\u0435 \u0440\u0430\u043C\u043A\u0438"), true;
      const n = (i) => {
        this.rects[i] = { ...Dc(this.rects[i], e, 0.12), grade: "good" };
      };
      if (this.sel >= 0) n(this.sel);
      else for (let i = 0; i < this.rects.length; i++) this.rects[i].grade !== "good" && n(i);
      return this.redraw(), this.tellSelection(), true;
    }
    return false;
  }
  pick(t, e) {
    let n = -1, i = 1 / 0;
    for (let r = 0; r < this.rects.length; r++) {
      const o = this.rects[r], a = Math.min(0.12, Math.min(o.x1 - o.x0, o.y1 - o.y0) * 0.25);
      if (t < o.x0 - a || t > o.x1 + a || e < o.y0 - a || e > o.y1 + a) continue;
      const l = (o.x1 - o.x0) * (o.y1 - o.y0);
      l < i && (i = l, n = r);
    }
    return n;
  }
  grabPart(t, e, n) {
    const i = t.x1 - t.x0, r = t.y1 - t.y0, o = Math.min(0.12, i * 0.25), a = Math.min(0.12, r * 0.25);
    let l = "";
    return Math.abs(e - t.x0) <= o ? l += "l" : Math.abs(e - t.x1) <= o && (l += "r"), Math.abs(n - t.y0) <= a ? l += "b" : Math.abs(n - t.y1) <= a && (l += "t"), { part: l || "move", px: e, py: n, x0: t.x0, y0: t.y0, x1: t.x1, y1: t.y1 };
  }
  consensus() {
    return $0(this.rects);
  }
  focusSelected() {
    const t = this.rects[this.sel];
    t && this.host.focusLocal((t.x0 + t.x1) / 2, (t.y0 + t.y1) / 2, t.x1 - t.x0, t.y1 - t.y0);
  }
  tellSelection() {
    if (this.sel < 0 || !this.rects[this.sel]) {
      this.host.ui.setHint(`\u041F\u0440\u043E\u0451\u043C\u043E\u0432: ${this.rects.length} \xB7 \u043A\u043B\u0438\u043A \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u0442, \u0442\u044F\u043D\u0438\u0442\u0435 \u0437\u0430 \u043A\u0440\u0430\u0439 \xB7 N \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u0441\u043E\u043C\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \xB7 T \u043F\u0440\u0438\u0432\u0435\u0441\u0442\u0438 \u043A \u0442\u0438\u043F\u043E\u0432\u044B\u043C \xB7 Del \u0443\u0431\u0440\u0430\u0442\u044C \xB7 Enter \u043E\u0431\u0432\u0435\u0441\u0442\u0438`);
      return;
    }
    const t = this.rects[this.sel], e = (t.x1 - t.x0) * 1e3 | 0, n = (t.y1 - t.y0) * 1e3 | 0, i = Math.round(Math.max(t.sigmaW, t.sigmaH) * 1e3);
    this.host.ui.setHint(`\u0420\u0430\u043C\u043A\u0430 ${e}\xD7${n} \u043C\u043C \xB1${i} \xB7 \u0442\u044F\u043D\u0438\u0442\u0435 \u0437\u0430 \u043A\u0440\u0430\u0439 \u0438\u043B\u0438 \u0443\u0433\u043E\u043B \xB7 T \u043F\u0440\u0438\u0432\u0435\u0441\u0442\u0438 \u043A \u0442\u0438\u043F\u043E\u0432\u044B\u043C \xB7 N \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u0441\u043E\u043C\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \xB7 Del \u0443\u0431\u0440\u0430\u0442\u044C \xB7 Enter \u043E\u0431\u0432\u0435\u0441\u0442\u0438 \u0432\u0441\u0451`);
  }
  togglePipette() {
    this.pipetteArm = !this.pipetteArm, this.syncColorUI(), this.pipetteArm ? this.host.ui.setHint("\u041F\u0418\u041F\u0415\u0422\u041A\u0410: \u043A\u043B\u0438\u043A\u0430\u0439\u0442\u0435 \u043F\u043E \u0442\u043E\u0447\u043A\u0430\u043C-\u043E\u0431\u0440\u0430\u0437\u0446\u0430\u043C (\u043A\u0438\u0440\u043F\u0438\u0447 \u043D\u0430 \u0441\u043E\u043B\u043D\u0446\u0435, \u043A\u0438\u0440\u043F\u0438\u0447 \u0432 \u0442\u0435\u043D\u0438\u2026) \xB7 Esc \u0438\u043B\u0438 \u041F\u0418\u041F\u0415\u0422\u041A\u0410 \u2014 \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u044C") : this.tellSelection();
  }
  readColorPanel() {
    var _a2;
    const t = ((_a2 = document.getElementById("op-color-on")) == null ? void 0 : _a2.checked) ?? false, e = document.getElementById("op-color-tol"), n = e ? Number(e.value) : 0.2;
    if (this.host.setColorFilter(t, Number.isFinite(n) ? n : 0.2), this.syncColorUI(), t && this.host.colorFilter().count === 0) {
      this.host.ui.setHint("\u0424\u0438\u043B\u044C\u0442\u0440 \u043F\u043E \u0446\u0432\u0435\u0442\u0443 \u0432\u043A\u043B\u044E\u0447\u0451\u043D, \u043D\u043E \u043E\u0431\u0440\u0430\u0437\u0446\u043E\u0432 \u043D\u0435\u0442 \u2014 \u0432\u043E\u0437\u044C\u043C\u0438\u0442\u0435 \u0446\u0432\u0435\u0442 \u041F\u0418\u041F\u0415\u0422\u041A\u041E\u0419 \u0441 \u043D\u0443\u0436\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u0438");
      return;
    }
    this.refreshWall();
  }
  clearSamples() {
    this.host.clearColorSamples(), this.syncColorUI(), this.refreshWall(), this.host.ui.setHint("\u041E\u0431\u0440\u0430\u0437\u0446\u044B \u0446\u0432\u0435\u0442\u0430 \u0441\u0431\u0440\u043E\u0448\u0435\u043D\u044B");
  }
  syncColorUI() {
    const t = this.host.colorFilter(), e = document.getElementById("op-color-on");
    e && (e.checked = t.on);
    const n = document.getElementById("op-color-tol");
    n && (n.value = String(t.tol));
    const i = document.getElementById("op-color-tol-val");
    i && (i.textContent = `${Math.round(t.tol * 100)} %`);
    const r = document.getElementById("op-pick");
    r && (r.dataset.on = String(this.pipetteArm));
    const o = document.getElementById("op-color-chip");
    o && (o.classList.toggle("hidden", t.css === null), t.css && (o.style.background = t.css, o.title = `\u041E\u0431\u0440\u0430\u0437\u0446\u043E\u0432: ${t.count} (\u043A\u043B\u0438\u043A \u2014 \u0441\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u0441\u0435)`));
  }
  toggleMode() {
    this.mode = this.mode === "holes" ? "islands" : "holes", this.syncModeButton();
    const t = document.getElementById("op-min");
    t && (t.value = this.mode === "islands" ? "0.05" : String(Zi.minArea)), this.params.minSide = this.mode === "islands" ? 0.12 : Zi.minSide, this.grid = null, this.readPanel(true), this.host.ui.setHint(this.mode === "islands" ? "\u0420\u0415\u041B\u042C\u0415\u0424: \u0438\u0449\u0443 \u043F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u044B\u0435 \u043F\u044F\u0442\u043D\u0430 \u0442\u043E\u0447\u0435\u043A. \u0417\u0430\u0434\u0430\u0439\u0442\u0435 \u0441\u0440\u0435\u0437 \u043F\u043E \u0441\u043B\u043E\u044E \u0432\u044B\u0441\u0442\u0443\u043F\u0430 \u2014 \u0432 \u043E\u043A\u043D\u0435 2 \u043F\u0440\u043E\u0442\u044F\u043D\u0438\u0442\u0435 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D \u0433\u043B\u0443\u0431\u0438\u043D\u044B \u0438 \u043F\u043E\u0434\u0442\u044F\u043D\u0438\u0442\u0435 \u0433\u043E\u043B\u0443\u0431\u044B\u0435 \u043E\u0441\u0438 \u043F\u0440\u044F\u043C\u043E \u043F\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044E" : "\u041F\u0420\u041E\u0401\u041C\u042B: \u0438\u0449\u0443 \u043F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u044B\u0435 \u0434\u044B\u0440\u043A\u0438 \u0432 \u0441\u0440\u0435\u0437\u0435 \u2014 \u043E\u043A\u043D\u0430 \u0438 \u0434\u0432\u0435\u0440\u0438");
  }
  syncModeButton() {
    const t = document.getElementById("op-mode");
    t && (t.textContent = this.mode === "holes" ? "\u041F\u0420\u041E\u0401\u041C\u042B" : "\u0420\u0415\u041B\u042C\u0415\u0424", t.dataset.on = String(this.mode === "islands"));
  }
  armRegion() {
    this.regionArm = true, this.regionDrag = null, this.setRegionButtons(), this.host.ui.setHint("\u041E\u0411\u041B\u0410\u0421\u0422\u042C: \u0437\u0430\u0436\u043C\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u043C\u044B\u0448\u0438 \u0438 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0443\u0441\u043E\u043A \u0444\u0430\u0441\u0430\u0434\u0430 \u2014 \u043F\u043E\u0438\u0441\u043A \u043F\u043E\u0439\u0434\u0451\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u043D\u0451\u043C \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430");
  }
  clearRegion() {
    const t = this.region !== null;
    if (this.region = null, this.cut = null, this.regionArm = false, this.regionDrag = null, this.regionPreview = null, this.host.setSearchRegion(null), this.drawRegion(null), this.setRegionButtons(), !t) return;
    this.grid = null, this.recompute();
    const e = this.wallBounds;
    e && this.host.focusLocal((e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2, e.x1 - e.x0, e.y1 - e.y0);
  }
  setRegionButtons() {
    var _a2;
    const t = document.getElementById("op-region");
    t && (t.dataset.on = String(this.regionArm)), (_a2 = document.getElementById("op-region-clear")) == null ? void 0 : _a2.classList.toggle("hidden", this.region === null);
  }
  drawRegion(t) {
    if (this.regionObj.visible = t !== null, !t) return;
    const e = new jn();
    e.setPositions([t.x0, t.y0, 0, t.x1, t.y0, 0, t.x1, t.y0, 0, t.x1, t.y1, 0, t.x1, t.y1, 0, t.x0, t.y1, 0, t.x0, t.y1, 0, t.x0, t.y0, 0]), this.regionObj.geometry.dispose(), this.regionObj.geometry = e, this.regionObj.computeLineDistances();
  }
  cutPoints() {
    if (!this.wall) return null;
    if (!this.region) return this.wall;
    if (this.cut) return this.cut;
    const { x0: t, y0: e, x1: n, y1: i } = this.region, r = this.wall.xy, o = new Float32Array(this.wall.n * 2);
    let a = 0;
    for (let l = 0; l < this.wall.n; l++) {
      const c = r[l * 2], h = r[l * 2 + 1];
      c < t || c > n || h < e || h > i || (o[a * 2] = c, o[a * 2 + 1] = h, a++);
    }
    return this.cut = { xy: o.slice(0, a * 2), n: a }, this.cut;
  }
  computeWallBounds() {
    if (!this.wall) {
      this.wallBounds = null;
      return;
    }
    let t = 1 / 0, e = 1 / 0, n = -1 / 0, i = -1 / 0;
    const r = this.wall.xy;
    for (let o = 0; o < this.wall.n; o++) {
      const a = r[o * 2], l = r[o * 2 + 1];
      a < t && (t = a), a > n && (n = a), l < e && (e = l), l > i && (i = l);
    }
    this.wallBounds = n > t && i > e ? { x0: t, y0: e, x1: n, y1: i } : null;
  }
  recompute() {
    if (!this.wall) return;
    const t = performance.now();
    if (!this.grid || this.gridCell !== this.params.cell) {
      const o = this.cutPoints();
      this.grid = o ? k0(o.xy, o.n, this.params, this.mode === "islands") : null, this.gridCell = this.params.cell;
    }
    if (!this.grid) {
      this.host.ui.setHint(this.region ? "\u0412 \u043E\u0431\u043B\u0430\u0441\u0442\u0438 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u043E \u0442\u043E\u0447\u0435\u043A \u2014 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0440\u0443\u043F\u043D\u0435\u0435 \u0438\u043B\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u0412\u0415\u0421\u042C \u0424\u0410\u0421\u0410\u0414\xBB" : "\u0412 \u0441\u0440\u0435\u0437\u0435 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u043E \u0442\u043E\u0447\u0435\u043A \u0434\u043B\u044F \u043F\u043E\u0438\u0441\u043A\u0430 \u2014 \u0440\u0430\u0441\u0448\u0438\u0440\u044C\u0442\u0435 \u0441\u0440\u0435\u0437 \u043F\u043E \u0433\u043B\u0443\u0431\u0438\u043D\u0435");
      return;
    }
    this.rects = Y0(this.grid, this.params), this.sel = -1, this.grab = null;
    const e = Math.round(performance.now() - t);
    this.redraw();
    let n = 0;
    for (const o of this.rects) n = Math.max(n, o.sigmaW, o.sigmaH);
    const i = Ua, r = this.host.colorFilter();
    this.host.ui.setHint(`${this.mode === "islands" ? "\u041F\u044F\u0442\u0435\u043D \u0440\u0435\u043B\u044C\u0435\u0444\u0430" : "\u041F\u0440\u043E\u0451\u043C\u043E\u0432"}: ${this.rects.length}` + (this.region ? " (\u0432 \u043E\u0431\u043B\u0430\u0441\u0442\u0438)" : "") + (r.on && r.count > 0 ? " (\u043F\u043E \u0446\u0432\u0435\u0442\u0443)" : "") + (n > 0 ? ` \xB7 \u0440\u0430\u0437\u043C\u0435\u0440 \xB1${Math.round(n * 1e3)} \u043C\u043C` : "") + (i > 0 ? ` \xB7 \u043E\u0442\u0431\u0440\u043E\u0448\u0435\u043D\u043E \u043F\u043E \u0440\u0432\u0430\u043D\u044B\u043C \u043A\u0440\u0430\u044F\u043C: ${i}` : "") + ` \xB7 \u0441\u0435\u0442\u043A\u0430 ${Math.round(this.grid.cell * 100)} \u0441\u043C, \u0448\u0430\u0433 \u0441\u044A\u0451\u043C\u043A\u0438 ${Math.round(this.grid.spacing * 1e3)} \u043C\u043C, ${e} \u043C\u0441 \xB7 \u043A\u043B\u0438\u043A \u043F\u043E \u0440\u0430\u043C\u043A\u0435 \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u0442, \u043A\u043B\u0438\u043A \u0432 \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043D\u043E\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u0442 \xB7 Enter \u043E\u0431\u0432\u0435\u0441\u0442\u0438`);
  }
  redraw() {
    const t = { thin: { pos: [], col: [] }, thick: { pos: [], col: [] } }, e = { good: 0, fair: 0, poor: 0 };
    for (let r = 0; r < this.rects.length; r++) {
      const o = this.rects[r];
      e[o.grade]++;
      const a = r === this.sel ? J0 : this.gradeColor[o.grade], l = t[o.grade === "good" ? "thin" : "thick"], c = (h, u, d, f) => {
        l.pos.push(h, u, 0, d, f, 0), l.col.push(a.r, a.g, a.b, a.r, a.g, a.b);
      };
      c(o.x0, o.y0, o.x1, o.y0), c(o.x1, o.y0, o.x1, o.y1), c(o.x1, o.y1, o.x0, o.y1), c(o.x0, o.y1, o.x0, o.y0);
    }
    const n = (r, o) => {
      if (r.visible = o.pos.length > 0, !r.visible) return;
      const a = new jn();
      a.setPositions(o.pos), a.setColors(o.col), r.geometry.dispose(), r.geometry = a, r.computeLineDistances();
    };
    n(this.thin, t.thin), n(this.thick, t.thick);
    const i = (r, o) => {
      const a = document.getElementById(r);
      a && (a.textContent = String(o));
    };
    i("op-good", e.good), i("op-fair", e.fair), i("op-poor", e.poor);
  }
  get panel() {
    return document.getElementById(Z0);
  }
  bindPanel(t) {
    for (const r of ["op-cell", "op-min", "op-fill"]) {
      const o = document.getElementById(r);
      o && (t ? o.addEventListener("input", this.onSlider) : o.removeEventListener("input", this.onSlider));
    }
    const e = [["op-mode", this.onModeBtn], ["op-region", this.onRegionBtn], ["op-region-clear", this.onRegionClearBtn], ["op-pick", this.onPickBtn], ["op-color-chip", this.onChipClick]];
    for (const [r, o] of e) {
      const a = document.getElementById(r);
      a && (t ? a.addEventListener("click", o) : a.removeEventListener("click", o));
    }
    const n = document.getElementById("op-color-on"), i = document.getElementById("op-color-tol");
    n && (t ? n.addEventListener("change", this.onColorCtl) : n.removeEventListener("change", this.onColorCtl)), i && (t ? i.addEventListener("input", this.onColorCtl) : i.removeEventListener("input", this.onColorCtl));
  }
  readPanel(t) {
    const e = (i, r) => {
      const o = document.getElementById(i), a = o ? Number(o.value) : NaN;
      return Number.isFinite(a) ? a : r;
    };
    this.params.cell = e("op-cell", Zi.cell), this.params.minArea = e("op-min", Zi.minArea), this.params.minFill = e("op-fill", Zi.minFill);
    const n = (i, r) => {
      const o = document.getElementById(i);
      o && (o.textContent = r);
    };
    n("op-cell-val", this.params.cell > 0 ? `${Math.round(this.params.cell * 100)} \u0441\u043C` : this.grid ? `\u0430\u0432\u0442\u043E ${Math.round(this.grid.cell * 100)} \u0441\u043C` : "\u0430\u0432\u0442\u043E"), n("op-min-val", `${this.params.minArea.toFixed(2)} \u043C\xB2`), n("op-fill-val", `${Math.round(this.params.minFill * 100)} %`), t && this.recompute();
  }
}
const J0 = new zt(16777215), Ht = new b(), xe = new b(), Oe = new b(), Ps = new b(), Q0 = new b(0, 1, 0), qn = new b(), Ic = new b(), Ki = new b(), tv = new b(), Pr = new ke(), ev = 50, Ho = [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50], Vo = [5e-3, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5], Go = (s) => Math.round(s / 5e-3) * 5e-3, nv = { main: 2e6, profile: 8e5, iso: 8e5 }, Uc = new Ya(), Fc = new Jt(), di = new b();
class iv {
  constructor() {
    this.scene = new fd(), this.ucs = new R_(), this.snap = new L_(), this.layers = new V_(), this.snapOn = true, this.orthoOn = false, this.isolated = null, this.sectionDepth = 0.4, this.facadeSliceOn = false, this.facadeSliceZ = 0, this.facadeSliceThick = 0.24, this.openingsTimer = 0, this.sliceGrab = null, this.sliceGrabZ0 = 0, this.sliceGrabPrev = null, this.depthRulerT = 0, this.depthRulerSig = "", this.colorOn = false, this.colorTol = 0.2, this.colorSamples = [], this.lastPickIndex = -1, this.searchRegion = null, this.planSliceOn = false, this.planSliceY = 0, this.planSliceThick = 0.3, this.isoBounds = new ke(), this.curFollow = new b(), this.deviationRef = null, this.cloudOrigin = null, this.panning = null, this.panX = 0, this.panY = 0, this.frames = 0, this.fpsT = performance.now(), this.lodScale = 1, this.fpsCeiling = 60, this.mainMode = "top", this.activePane = "main", this.followTarget = new b(), this.followActive = false, this.profileFollow = false, this.profileFreeze = new b(), this.profileFrozen = false, this.profileMode = "vert", this.profileWindow = 2, this.cloudSettings = { main: { size: 2, opacity: 1, density: 1, mode: 0 }, profile: { size: 2, opacity: 1, density: 1, mode: 0 }, iso: { size: 2, opacity: 1, density: 0.3, mode: 0 } }, this.ucsList = [], this.activeUcs = -1, this.ucsLabels = new Dn(), this.chunkGroup = new Dn(), this.leaves = [], this.cloudQ = new Uint16Array(0), this.cloudColors = new Uint8Array(0), this.compactOn = false, this.importWorker = null, this.workerReady = false, this.pendingJob = null, this.pendingDemo = false, this.wallGroup = new Dn(), this.wallLeaves = [], this.wallSrcP = null, this.lassoSeq = 0, this.layerUiQueued = false, this.framePts = 0, this.framePtsShown = 0, this.undoStack = [], this.redoStack = [], this.sessionApiUrl = "/api/facade_cad_session.php", this.cloudName = null, this.dirty = false, this.saving = false;
    const t = document.getElementById("gl");
    this.renderer = new h_({ canvas: t, antialias: true, powerPreference: "high-performance" }), I_(this.layers), this.cloud = y0();
    const { material: e, uniforms: n } = G_();
    this.cloudUniforms = n, this.compactMaterial = e, this.cloudPoints = new Mo(this.cloud.geometry, e), this.cloudPoints.visible = false, this.scene.add(this.cloudPoints), this.scene.add(this.chunkGroup), this.scene.add(this.wallGroup), this.wallGroup.visible = false, this.scene.add(this.ucsLabels), n.uMinY.value = 0, n.uYRangeInv.value = 1, this.scene.add(this.ucs.group), this.scene.add(this.ucs.axesHelper), this.store = new B_(this.ucs.group);
    const i = In("--bg", 723981), r = new wd(60, 60, Wr(i, 0.22), Wr(i, 0.1));
    r.material.transparent = true, r.material.opacity = 0.5, r.layers.set(2), this.scene.add(r), this.planSliceBand = new He(new Ti(1, 1), new Ei({ color: In("--accent", 6727935), transparent: true, opacity: 0.18, side: ze, depthTest: false, depthWrite: false })), this.planSliceBand.layers.set(1), this.planSliceBand.renderOrder = 1, this.planSliceBand.frustumCulled = false, this.planSliceBand.visible = false, this.scene.add(this.planSliceBand), this.facadeBand = new He(new us(1, 1, 1), new Ei({ color: In("--accent", 6727935), transparent: true, opacity: 0.14, side: ze, depthTest: false, depthWrite: false })), this.facadeBand.layers.set(6), this.facadeBand.renderOrder = 1, this.facadeBand.frustumCulled = false, this.facadeBand.visible = false, this.ucs.group.add(this.facadeBand), this.facadeEdgeMat = new Sn({ color: In("--accent", 6727935), linewidth: 2, transparent: true, opacity: 0.9, depthTest: false }), this.facadeEdges = new Gr(new jn(), this.facadeEdgeMat), this.facadeEdges.layers.set(6), this.facadeEdges.renderOrder = 2, this.facadeEdges.frustumCulled = false, this.facadeEdges.visible = false, this.ucs.group.add(this.facadeEdges), this.vpm = new C_(this.renderer, this.scene, document.getElementById("orbit-pad")), this.loadPaneLayout(), this.vpm.setIsoView(this.cloud.center, this.cloud.radius), this.vpm.onBeforeViewport = (o) => this.applyViewportUniforms(o), this.ui = new B0({ onRibbonHeight: (o) => {
      this.vpm.setTopOffset(o), this.ui.setActivePane(this.activePane, this.vpm[this.activePane].css);
    }, onTool: (o) => this.tools.activate(o), onErase: () => this.eraseSelection(), onUndo: () => this.undo(), onRedo: () => this.redo(), onToggleSnap: () => this.setSnap(!this.snapOn), onToggleOrtho: () => this.setOrtho(!this.orthoOn), onSectionDepth: (o) => this.setSectionDepth(o), onToggleProfileMode: () => {
      this.profileMode = this.profileMode === "vert" ? "horiz" : "vert", this.ui.setProfileMode(this.profileMode === "vert"), this.refreshProfileView(), this.ui.setHint(this.profileMode === "vert" ? "\u041E\u043A\u043D\u043E 2: \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0437 \u043F\u043E\u043F\u0435\u0440\u0451\u043A \u0441\u0442\u0435\u043D\u044B \u2014 \u0432\u0438\u0434\u043D\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u043F\u043E\u0434\u043E\u043A\u043E\u043D\u043D\u0438\u043A\u0430, \u043E\u0442\u043A\u043E\u0441\u0430, \u043A\u0430\u0440\u043D\u0438\u0437\u0430" : "\u041E\u043A\u043D\u043E 2: \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0437 \u2014 \u0432\u0438\u0434\u043D\u043E \u043F\u043B\u0430\u043D \u043F\u0440\u043E\u0451\u043C\u0430 \u0438 \u0433\u043B\u0443\u0431\u0438\u043D\u0443 \u043E\u0442\u043A\u043E\u0441\u043E\u0432 \u043D\u0430 \u0443\u0440\u043E\u0432\u043D\u0435 \u043A\u0443\u0440\u0441\u043E\u0440\u0430");
    }, onProfileWindow: (o) => {
      this.profileWindow = o, this.ui.setProfileWindow(o), this.refreshProfileView();
    }, onPlanSliceToggle: () => {
      this.planSliceOn = !this.planSliceOn, this.ui.setPlanSlice(this.planSliceOn, this.planSliceY, this.planSliceThick);
    }, onPlanSliceLevel: (o) => {
      this.planSliceY = o, this.planSliceOn = true, this.ui.setPlanSlice(true, o, this.planSliceThick), this.updatePlanBand();
    }, onPlanSliceThick: (o) => {
      this.planSliceThick = o, this.ui.setPlanSlice(this.planSliceOn, this.planSliceY, o), this.updatePlanBand();
    }, onPlanSliceDone: () => this.tools.activate("ucs"), onToggleFacadeSlice: () => {
      this.facadeSliceOn = !this.facadeSliceOn, this.syncSliceUI(), this.updateFacadeBand(), this.openingsLive();
    }, onFacadeSliceRange: (o, a) => this.setFacadeRange(o, a), onUcsSelect: (o) => this.onUcsSelect(o), onToggleLayer: (o) => this.toggleEntityLayer(o), onCursorArea: (o) => {
      this.cloudUniforms.uCurHalf.value = o / 2;
    }, onOpenCloudPanel: (o) => this.ui.openCloudPanel(o, this.cloudSettings[o]), onCloudSetting: (o, a, l) => {
      this.cloudSettings[o][a] = l;
    }, onToggleCloud: (o) => {
      const a = this.vpm[o].camera;
      a.layers.toggle(4), this.ui.setCloudVisible(o, a.layers.isEnabled(4));
    }, onImportFiles: (o) => void this.importCloud(o), onExportDxf: () => this.exportDxf(), onToCad: () => void this.toCad(), onRenameUcs: () => this.renameUcs(), onDemoStart: () => this.requestDemo(), onLayerAdd: () => {
      const o = this.layers.add();
      this.layers.current = o.name, this.layersChanged();
    }, onLayerDelete: (o) => {
      this.layers.remove(o) && (this.store.reassignLayer(o, "0"), this.layersChanged());
    }, onLayerRename: (o) => {
      const a = window.prompt("\u0418\u043C\u044F \u0441\u043B\u043E\u044F:", o);
      if (!a || !a.trim() || a.trim() === o) return;
      const l = a.trim();
      if (!this.layers.rename(o, l)) {
        this.ui.setHint("\u0421\u043B\u043E\u0439 \u043D\u0435 \u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D: \u0438\u043C\u044F \u0437\u0430\u043D\u044F\u0442\u043E \u0438\u043B\u0438 \u044D\u0442\u043E \u0441\u043B\u043E\u0439 \xAB0\xBB");
        return;
      }
      this.store.renameLayerRefs(o, l), this.layersChanged();
    }, onLayerCurrent: (o) => {
      this.layers.current = o, this.layersChanged();
    }, onLayerColor: (o, a) => {
      this.layers.get(o).color = a, this.layersChanged();
    }, onLayerType: (o, a) => {
      this.layers.get(o).linetype = a, this.layersChanged();
    }, onLayerWeight: (o, a) => {
      this.layers.get(o).weight = a, this.layersChanged();
    }, onLayerToggleVisible: (o) => {
      const a = this.layers.get(o);
      a.visible = !a.visible, this.layersChanged();
    }, onAssignToLayer: () => this.assignSelectionTo(this.layers.current), onLayerCombo: (o) => {
      o && (this.store.selection.size ? this.assignSelectionTo(o) : (this.layers.current = o, this.layersChanged()));
    }, onToggleWeightDisplay: () => {
      this.layers.showWeight = !this.layers.showWeight, this.layersChanged();
    } }), this.tools = new Ka(this), this.openings = new K0(this, this.tools), this.tools.addTool(this.openings), this.bindInput(t), this.ui.setSnap(this.snapOn), this.ui.setOrtho(false), this.ui.setProfileMode(true), this.ui.setProfileWindow(this.profileWindow), this.store.onChange = () => this.queueLayerUI(), this.layersChanged(), window.addEventListener("resize", () => this.ui.setActivePane(this.activePane, this.vpm[this.activePane].css)), this.setActivePane("main"), this.loadUcsList(), this.refreshUcsUI(), this.rebuildUcsLabels(), this.enterTopView(), this.tools.activate("isolate"), this.ui.showStart(true), this.ensureWorker(), this.restoreSessionFromServer(), window.setInterval(() => this.flushDirtySave(), 8e3), window.addEventListener("beforeunload", () => this.flushDirtySave(true)), document.addEventListener("visibilitychange", () => {
      document.visibilityState === "hidden" && this.flushDirtySave(true);
    });
  }
  start() {
    this.renderer.setAnimationLoop(() => this.loop());
  }
  loop() {
    this.followActive && (qn.subVectors(this.followTarget, this.vpm.orbit.target), qn.lengthSq() > 1e-6 && (qn.multiplyScalar(0.12), this.vpm.orbit.target.add(qn), this.vpm.iso.camera.position.add(qn))), this.profileFollow && this.ucs.defined && this.activeUcs >= 0 && (this.profileEye(Ic).multiplyScalar(120).add(this.followTarget), qn.subVectors(Ic, this.vpm.profile.camera.position), qn.lengthSq() > 1e-6 && this.vpm.profile.camera.position.addScaledVector(qn, 0.18)), this.refreshDepthRuler();
    const t = this.tools.active !== null && this.tools.active.id !== "select";
    this.vpm.orbit.mouseButtons.LEFT = t ? null : Un.ROTATE, this.vpm.update(), this.framePts = 0, this.vpm.render(), this.framePtsShown = this.framePts, this.tickFps();
  }
  applyViewportUniforms(t) {
    this.tools.applyViewportScale(t), this.layers.setResolution(t.gl.w, t.gl.h), gh.resolution.set(t.gl.w, t.gl.h), this.openings.setResolution(t.gl.w, t.gl.h), this.facadeEdgeMat.resolution.set(t.gl.w, t.gl.h);
    const e = this.cloudUniforms, n = this.cloudSettings[t.name];
    e.uIsPersp.value = t.name === "iso" ? 1 : 0, e.uSize.value = n.size, e.uOpacity.value = n.opacity, e.uMode.value = n.mode, e.uFacadeClip.value = t.name === "main" && this.facadeSliceOn && this.ucs.defined && this.activeUcs >= 0 ? 1 : 0, e.uFacadeMin.value = this.facadeSliceZ - this.facadeSliceThick / 2, e.uFacadeMax.value = this.facadeSliceZ + this.facadeSliceThick / 2;
    const i = this.searchRegion;
    if (e.uRegionClip.value = t.name === "main" && i && this.ucs.defined && this.activeUcs >= 0 ? 1 : 0, i && (e.uRegionMin.value.set(i.x0, i.y0), e.uRegionMax.value.set(i.x1, i.y1)), e.uSectionEnabled.value = t.name === "profile" && this.ucs.defined && this.activeUcs >= 0 ? 1 : 0, e.uSectionEnabled.value === 1) {
      const r = this.profileFrozen ? this.profileFreeze.x : this.tools.pointer.local.x, o = this.profileFrozen ? this.profileFreeze.y : this.tools.pointer.local.y, a = this.sectionDepth / 2, l = this.profileWindow / 2;
      this.profileMode === "vert" ? (e.uBoxMin.value.set(r - a, o - l, -1e6), e.uBoxMax.value.set(r + a, o + l, 1e6)) : (e.uBoxMin.value.set(r - l, o - a, -1e6), e.uBoxMax.value.set(r + l, o + a, 1e6));
    }
    e.uCurClip.value = t.name === "iso" && this.ucs.defined && this.activeUcs >= 0 ? 1 : 0, e.uCurPos.value.copy(this.curFollow), e.uPlanClip.value = t.name === "main" && this.planSliceOn && this.mainMode === "top" ? 1 : 0, e.uPlanMin.value = this.planSliceY - this.planSliceThick / 2, e.uPlanMax.value = this.planSliceY + this.planSliceThick / 2, this.applyChunkLod(t, this.compactOn ? this.wallLeaves : this.leaves);
  }
  applyChunkLod(t, e) {
    if (!e.length) return;
    const n = t.camera;
    Fc.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), Uc.setFromProjectionMatrix(Fc);
    const i = this.cloudSettings[t.name], r = n instanceof an, o = r ? 1.5 : 3, a = Math.min(t.gl.w * t.gl.h * o, nv[t.name]) * this.lodScale, l = r ? t.gl.h / Math.max(1e-3, t.frustumHeight) : 0, c = r ? 1 : Math.tan(qe.degToRad(n.fov / 2)), h = t.name === "main" && this.planSliceOn && this.mainMode === "top", u = this.planSliceY - this.planSliceThick / 2, d = this.planSliceY + this.planSliceThick / 2;
    this.cloudUniforms.uDensity.value = 1;
    let f = 0;
    for (const _ of e) {
      let m = 0;
      if (!(h && (_.box.max.y < u || _.box.min.y > d)) && Uc.intersectsBox(_.box)) {
        _.box.getSize(di);
        const p = Math.max(di.x * di.y, di.y * di.z, di.x * di.z, 1e-4), T = r ? l : t.gl.h * 0.5 / (Math.max(0.5, _.box.distanceToPoint(n.position)) * c);
        m = Math.min(_.count, p * T * T * o) * i.density;
      }
      _.want = m, f += m;
    }
    const g = f > a ? a / f : 1;
    for (const _ of e) {
      const m = Math.min(_.count, Math.ceil(_.want * g));
      m > 0 ? (_.points.visible = true, _.geo.setDrawRange(_.start, m), this.framePts += m) : _.points.visible = false;
    }
  }
  leafOf(t) {
    const e = this.leaves;
    let n = 0, i = e.length - 1;
    for (; n < i; ) {
      const r = n + i + 1 >> 1;
      e[r].start <= t ? n = r : i = r - 1;
    }
    return e[n];
  }
  dq(t, e) {
    const n = this.leafOf(t), i = this.cloudQ;
    return e.set(n.qmx + i[t * 3] * n.qsx, n.qmy + i[t * 3 + 1] * n.qsy, n.qmz + i[t * 3 + 2] * n.qsz);
  }
  tickFps() {
    this.mainMode === "level" && (this.frames & 7) === 0 && this.refreshElevationScale(), this.frames++;
    const t = performance.now();
    if (t - this.fpsT >= 500) {
      const e = Math.round(this.frames * 1e3 / (t - this.fpsT));
      this.ui.setFps(e, this.framePtsShown), this.frames = 0, this.fpsT = t, e > this.fpsCeiling && (this.fpsCeiling = e), e < 45 ? this.lodScale = Math.max(0.25, this.lodScale * 0.8) : e >= this.fpsCeiling * 0.92 && (this.lodScale = Math.min(1, this.lodScale * 1.06));
    }
  }
  snapshot() {
    this.undoStack.push(this.store.serialize()), this.undoStack.length > ev && this.undoStack.shift(), this.redoStack.length = 0, this.markDirty();
  }
  undo() {
    const t = this.undoStack.pop();
    t !== void 0 && (this.redoStack.push(this.store.serialize()), this.store.restore(t), this.tools.resetActive(), this.markDirty());
  }
  redo() {
    const t = this.redoStack.pop();
    t !== void 0 && (this.undoStack.push(this.store.serialize()), this.store.restore(t), this.tools.resetActive(), this.markDirty());
  }
  eraseSelection() {
    this.store.selection.size && (this.snapshot(), this.store.deleteSelected());
  }
  assignSelectionTo(t) {
    const e = this.store.selection.size;
    if (!e) {
      this.ui.setHint("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B, \u0437\u0430\u0442\u0435\u043C \u043D\u0430\u0437\u043D\u0430\u0447\u044C\u0442\u0435 \u0441\u043B\u043E\u0439");
      return;
    }
    this.snapshot();
    for (const n of this.store.selection) n.layer = t;
    this.store.refreshAll(), this.layersChanged(), this.ui.setHint(`\u041F\u0435\u0440\u0435\u043D\u0435\u0441\u0435\u043D\u043E \u043D\u0430 \u0441\u043B\u043E\u0439 \xAB${t}\xBB: ${e} \u043E\u0431. \u2014 \u0446\u0432\u0435\u0442 \u0438 \u0442\u0438\u043F \u043B\u0438\u043D\u0438\u0438 \u0442\u0435\u043F\u0435\u0440\u044C \u043F\u043E \u0441\u043B\u043E\u044E`);
  }
  queueLayerUI() {
    this.layerUiQueued || (this.layerUiQueued = true, requestAnimationFrame(() => {
      this.layerUiQueued = false, this.syncLayerUI();
    }));
  }
  syncLayerUI() {
    const t = this.layers.layers.map((i) => i.name), e = this.store.selection.size > 0, n = e ? this.store.selectionLayer() : this.layers.current;
    this.ui.setLayerCombo(t, n, e, this.layers.get(n ?? this.layers.current).color), this.ui.renderLayers(this.layers.layers.map((i) => ({ name: i.name, color: i.color, linetype: i.linetype, weight: i.weight, visible: i.visible, current: i.name === this.layers.current, count: this.store.countOnLayer(i.name) })));
  }
  layersChanged() {
    this.layers.applyMaterials(), this.store.refreshAll(), this.markDirty(), this.syncLayerUI(), this.ui.setWeightPill(this.layers.showWeight);
  }
  toggleEntityLayer(t) {
    const e = this.vpm[t].camera;
    e.layers.toggle(3), this.ui.setLayerVisible(t, e.layers.isEnabled(3));
  }
  applyLasso(t) {
    const e = Math.min(t.length, vh), n = new Float32Array(e), i = new Float32Array(e);
    for (let o = 0; o < e; o++) n[o] = t[o].x, i[o] = t[o].z;
    this.ensureWorker(), this.lassoSeq++, this.ui.setHint("\u0412\u044B\u0434\u0435\u043B\u044F\u044E \u0441\u0442\u0435\u043D\u0443\u2026");
    const r = this.ucs.defined && this.activeUcs >= 0 ? Array.from(this.ucs.inverse.elements) : null;
    this.importWorker.postMessage({ lasso: { px: n, pz: i, n: e, seq: this.lassoSeq, ucsInverse: r } }, [n.buffer, i.buffer]);
  }
  onLassoResult(t) {
    if (t.seq !== this.lassoSeq) return;
    if (!t.kept || !t.srcP || !t.wallLeaves || !t.idx || !t.bounds) {
      this.ui.setHint("\u0412 \u043A\u043E\u043D\u0442\u0443\u0440\u0435 \u043D\u0435\u0442 \u0442\u043E\u0447\u0435\u043A \u2014 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0442\u0435\u043D\u0443 \u0437\u0430\u043D\u043E\u0432\u043E");
      return;
    }
    this.isolated = t.idx, this.wallSrcP = t.srcP;
    const e = this.cloudColors, n = t.idx.length, i = new Uint8Array(n * 3);
    for (let c = 0; c < n; c++) {
      const h = t.idx[c] * 3;
      i[c * 3] = e[h], i[c * 3 + 1] = e[h + 1], i[c * 3 + 2] = e[h + 2];
    }
    this.buildWallLeaves(t.srcP, i, t.wallLeaves), this.useCompact(true), this.snap.clear();
    const r = t.localAll, o = this.lassoSeq;
    r && setTimeout(() => {
      o === this.lassoSeq && this.snap.buildLocal(r, n);
    }, 0), this.isoBounds.makeEmpty(), this.isoBounds.min.set(t.bounds[0], t.bounds[1], t.bounds[2]), this.isoBounds.max.set(t.bounds[3], t.bounds[4], t.bounds[5]);
    const a = this.isoBounds.min.y, l = this.isoBounds.max.y;
    this.planSliceY = qe.clamp(a + 1.5, a, l), this.planSliceThick = qe.clamp((l - a) * 0.04, 0.05, 1), this.planSliceOn = true, this.ui.setPlanSliceRange(a, l), this.ui.setPlanSlice(true, this.planSliceY, this.planSliceThick), this.tools.activate("level"), this.ui.setHint(`\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u043E ${t.kept.toLocaleString("ru-RU")} \u0442\u043E\u0447\u0435\u043A \u2014 \u0428\u0410\u0413 2/4: \u043D\u0430 \u0432\u0438\u0434\u0435 \u0441\u0431\u043E\u043A\u0443 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0438 \u0442\u043E\u043B\u0449\u0438\u043D\u0443 \u0441\u0440\u0435\u0437\u0430, \u0437\u0430\u0442\u0435\u043C \xAB\u041A \u041F\u041B\u0410\u041D\u0423\xBB`);
  }
  clearLasso() {
    this.isolated = null, this.wallSrcP = null, this.lassoSeq++, this.isoBounds.makeEmpty(), this.planSliceOn = false, this.planSliceBand.visible = false, this.ui.showPlanSlicePanel(false), this.useCompact(false), this.dropWallLeaves();
  }
  dropWallLeaves() {
    for (const t of this.wallLeaves) this.wallGroup.remove(t.points), t.geo.dispose();
    this.wallLeaves.length = 0;
  }
  buildWallLeaves(t, e, n) {
    this.dropWallLeaves();
    const i = t.length / 3, r = new ce(t, 3), o = new ce(e, 3, true), a = new ce(new Float32Array(i), 1);
    for (let l = 0; l + wr <= n.length; l += wr) {
      const c = new ke(new b(n[l + 2], n[l + 3], n[l + 4]), new b(n[l + 5], n[l + 6], n[l + 7])), h = new me();
      h.setAttribute("position", r), h.setAttribute("aColor", o), h.setAttribute("aKey", a), h.setDrawRange(n[l], n[l + 1]), h.boundingSphere = c.getBoundingSphere(new hn());
      const u = new Mo(h, this.compactMaterial);
      u.frustumCulled = false, u.layers.set(4), this.wallGroup.add(u), this.wallLeaves.push({ start: n[l], count: n[l + 1], box: c, geo: h, points: u, want: 0, qmx: 0, qmy: 0, qmz: 0, qsx: 0, qsy: 0, qsz: 0 });
    }
  }
  rebuildSnapGrid() {
    const t = this.wallSrcP;
    if (!t || !this.ucs.defined) return;
    const e = t.length / 3, n = this.ucs.inverse.elements, i = new Float32Array(t.length);
    for (let r = 0; r < e; r++) {
      const o = t[r * 3], a = t[r * 3 + 1], l = t[r * 3 + 2];
      i[r * 3] = n[0] * o + n[4] * a + n[8] * l + n[12], i[r * 3 + 1] = n[1] * o + n[5] * a + n[9] * l + n[13], i[r * 3 + 2] = n[2] * o + n[6] * a + n[10] * l + n[14];
    }
    this.snap.buildLocal(i, e);
  }
  useCompact(t) {
    this.compactOn = t && this.wallLeaves.length > 0, this.wallGroup.visible = this.compactOn, this.chunkGroup.visible = !this.compactOn;
  }
  pickCloudPoint(t, e) {
    this.lastPickIndex = -1;
    const n = this.cloudQ;
    let i = 1, r = null, o = -1;
    const a = this.planSliceOn && this.mainMode === "top", l = a ? this.planSliceY - this.planSliceThick / 2 : -1 / 0, c = a ? this.planSliceY + this.planSliceThick / 2 : 1 / 0;
    if (this.isolated) for (let h = 0; h < this.isolated.length; h++) {
      const u = this.isolated[h], d = this.leafOf(u), f = d.qmy + n[u * 3 + 1] * d.qsy;
      if (f < l || f > c) continue;
      Ht.set(d.qmx + n[u * 3] * d.qsx, f, d.qmz + n[u * 3 + 2] * d.qsz);
      const g = t.distanceSqToPoint(Ht);
      g < i && (i = g, r = d, o = u);
    }
    else for (const h of this.leaves) if (Pr.copy(h.box).expandByScalar(1), !!t.intersectsBox(Pr)) for (let u = h.start, d = h.start + h.count; u < d; u += 3) {
      const f = h.qmy + n[u * 3 + 1] * h.qsy;
      if (f < l || f > c) continue;
      Ht.set(h.qmx + n[u * 3] * h.qsx, f, h.qmz + n[u * 3 + 2] * h.qsz);
      const g = t.distanceSqToPoint(Ht);
      g < i && (i = g, r = h, o = u);
    }
    return !r || o < 0 ? false : (this.lastPickIndex = o, e.set(r.qmx + n[o * 3] * r.qsx, r.qmy + n[o * 3 + 1] * r.qsy, r.qmz + n[o * 3 + 2] * r.qsz), true);
  }
  colorFilter() {
    const t = this.colorSamples[this.colorSamples.length - 1];
    return { on: this.colorOn, tol: this.colorTol, count: this.colorSamples.length, css: t ? t.css : null };
  }
  setColorFilter(t, e) {
    this.colorOn = t, this.colorTol = e;
  }
  addColorSample(t) {
    if (!this.pickCloudPoint(t, Ht) || this.lastPickIndex < 0) return null;
    const e = this.lastPickIndex * 3, n = this.cloudColors[e], i = this.cloudColors[e + 1], r = this.cloudColors[e + 2], o = n + i + r + 3;
    return this.colorSamples.push({ cr: n / o, cg: i / o, br: o / 768, css: `rgb(${n} ${i} ${r})` }), this.colorSamples[this.colorSamples.length - 1].css;
  }
  clearColorSamples() {
    this.colorSamples.length = 0;
  }
  setSearchRegion(t) {
    this.searchRegion = t;
  }
  colorMatch(t) {
    const e = this.cloudColors, n = e[t * 3], i = e[t * 3 + 1], r = e[t * 3 + 2], o = n + i + r + 3, a = n / o, l = i / o, c = o / 768, h = this.colorTol * 0.3, u = this.colorTol * 1.2;
    for (const d of this.colorSamples) if (Math.abs(a - d.cr) <= h && Math.abs(l - d.cg) <= h && Math.abs(c - d.br) <= u) return true;
    return false;
  }
  noteFollow() {
    const t = this.tools.pointer;
    t.valid && (!this.isoBounds.isEmpty() && (Pr.copy(this.isoBounds).expandByScalar(1), !Pr.containsPoint(t.world)) || this.curFollow.copy(t.local));
  }
  focusLocal(t, e, n, i) {
    if (!this.ucs.defined) return;
    const r = this.vpm.main, o = r.camera;
    if (!(o instanceof an)) return;
    Ht.set(t, e, 0), this.ucs.localToWorld(Ht, Ht);
    const a = r.css.w / Math.max(1, r.css.h), l = qe.clamp(Math.max(i, n / Math.max(0.1, a)) * 2.5, 0.4, 4e3), c = r.frustumHeight, h = l > c * 0.98 || l < c * 0.35 ? l : c;
    o.getWorldDirection(Ki), Ps.copy(Ki).negate(), this.vpm.setOrthoView(r, Ps, o.up, Ht, h), this.curFollow.set(t, e, 0), this.followTarget.copy(Ht), this.followActive = true, this.profileFollow = true;
  }
  hasWall() {
    return !!this.isolated && this.isolated.length >= 500 && this.ucs.defined;
  }
  wallPointsXY() {
    const t = this.isolated;
    if (!t || t.length < 500) return null;
    let e = this.snapZMin, n = this.snapZMax;
    const i = this.colorOn && this.colorSamples.length > 0;
    if (!Number.isFinite(e) || !Number.isFinite(n)) {
      const a = Math.max(1, Math.floor(t.length / 2e4)), l = 240;
      let c = 1 / 0, h = -1 / 0;
      const u = [];
      for (let m = 0; m < t.length; m += a) i && !this.colorMatch(t[m]) || (this.dq(t[m], Ht).applyMatrix4(this.ucs.inverse), u.push(Ht.z), Ht.z < c && (c = Ht.z), Ht.z > h && (h = Ht.z));
      if (!(h > c)) return null;
      const d = (h - c) / l, f = new Int32Array(l);
      for (const m of u) f[Math.min(l - 1, (m - c) / d | 0)]++;
      let g = 0;
      for (let m = 1; m < l; m++) f[m] > f[g] && (g = m);
      const _ = c + (g + 0.5) * d;
      e = _ - 0.12, n = _ + 0.12;
    }
    const r = new Float32Array(t.length * 2);
    let o = 0;
    for (let a = 0; a < t.length; a++) i && !this.colorMatch(t[a]) || (this.dq(t[a], Ht).applyMatrix4(this.ucs.inverse), !(Ht.z < e || Ht.z > n) && (r[o * 2] = Ht.x, r[o * 2 + 1] = Ht.y, o++));
    return o >= 500 ? { xy: r, n: o } : null;
  }
  defineUcs(t, e) {
    this.ucs.setFromPoints(t, e), this.ucsList.push({ name: `\u041F\u0421\u041A ${this.ucsList.length + 1}`, matrix: this.ucs.matrix.clone() }), this.activeUcs = this.ucsList.length - 1, this.afterUcsChange(), this.markDirty();
  }
  onUcsSelect(t) {
    t === 0 ? this.enterWorldMode() : this.activateUcs(t - 1);
  }
  activateUcs(t) {
    t === this.activeUcs || t < 0 || t >= this.ucsList.length || (this.tools.activate("select"), this.ucs.setFromMatrix(this.ucsList[t].matrix), this.activeUcs = t, this.afterUcsChange(), this.markDirty());
  }
  enterWorldMode() {
    this.activeUcs = -1, this.updateFacadeBand(), this.ucs.plane.normal.set(0, 1, 0), this.ucs.plane.constant = 0, this.clearLasso(), this.snap.clear(), this.store.refreshUcsVisibility(-1), this.ucsLabels.visible = true, this.ui.showSectionPanel(false), this.refreshUcsUI(), this.enterTopView(), this.tools.activate("isolate"), this.ui.setHint("\u041C\u0421\u041A \u2014 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u0421\u041B\u0415\u0414\u0423\u042E\u0429\u0418\u0419 \u0444\u0430\u0441\u0430\u0434 \u043B\u0430\u0441\u0441\u043E, \u0438\u043B\u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0433\u043E\u0442\u043E\u0432\u0443\u044E \u041F\u0421\u041A \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430, \u0447\u0442\u043E\u0431\u044B \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u044E"), this.markDirty();
  }
  afterUcsChange() {
    this.cloudUniforms.uUcsInv.value.copy(this.ucs.inverse), this.store.refreshUcsVisibility(this.activeUcs), this.rebuildSnapGrid(), this.updateFacadeBand(), this.planSliceOn = false, this.planSliceBand.visible = false, this.ui.showPlanSlicePanel(false), this.ucsLabels.visible = false, this.refreshUcsUI(), this.rebuildUcsLabels(), this.ui.showSectionPanel(true), this.enterDraftView(true);
  }
  refreshUcsUI() {
    this.ui.setUcsList(["\u041C\u0421\u041A", ...this.ucsList.map((t) => t.name)], this.activeUcs + 1);
  }
  renameUcs() {
    if (this.activeUcs < 0) return;
    const t = this.ucsList[this.activeUcs], e = window.prompt("\u0418\u043C\u044F \u041F\u0421\u041A:", t.name);
    e && e.trim() && (t.name = e.trim(), this.refreshUcsUI(), this.rebuildUcsLabels(), this.markDirty());
  }
  async importCloud(t) {
    this.ui.setProgress("\u0427\u0442\u0435\u043D\u0438\u0435 \u0444\u0430\u0439\u043B\u0430\u2026 0%"), this.cloudName = t.length ? t[0].name + (t.length > 1 ? ` +${t.length - 1}` : "") : null, this.ensureWorker(), this.workerReady ? this.importWorker.postMessage({ files: t }) : this.pendingJob = { files: t };
  }
  requestDemo() {
    this.ui.setProgress("\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0434\u0435\u043C\u043E-\u043E\u0431\u043B\u0430\u043A\u0430\u2026"), this.ensureWorker(), this.workerReady ? this.importWorker.postMessage({ demo: true }) : this.pendingDemo = true;
  }
  ensureWorker() {
    this.importWorker || (this.importWorker = new Worker(new URL("" + new URL("cloud.worker-3T8DGCzC.js", import.meta.url).href, import.meta.url), { type: "module" }), this.importWorker.onmessage = (t) => this.onWorkerMessage(t.data), this.importWorker.onerror = (t) => {
      this.ui.setProgress(null), this.ui.setHint(`\u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043C\u043F\u043E\u0440\u0442\u0430: ${t.message || "\u0441\u0431\u043E\u0439 \u043F\u0430\u0440\u0441\u0435\u0440\u0430 (\u0441\u043C. \u043A\u043E\u043D\u0441\u043E\u043B\u044C)"}`);
    });
  }
  onWorkerMessage(t) {
    t.type === "ready" ? (this.workerReady = true, this.pendingJob ? (this.importWorker.postMessage(this.pendingJob), this.pendingJob = null) : this.pendingDemo && (this.pendingDemo = false, this.importWorker.postMessage({ demo: true }))) : t.type === "progress" ? this.ui.setProgress(t.phase ?? `\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026 ${Math.round((t.p ?? 0) * 100)}%`) : t.type === "error" ? (this.ui.setProgress(null), this.ui.setHint(`\u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043C\u043F\u043E\u0440\u0442\u0430: ${t.message}`)) : t.type === "lasso" ? this.onLassoResult(t) : t.type === "done" && t.qpos && t.colors && (this.ui.setProgress(null), this.ui.showStart(false), this.cloudOrigin = t.origin ?? null, this.applyCloud(t.qpos, t.colors, t.count ?? t.qpos.length / 3, t.leaves ?? new Float64Array(0)));
  }
  applyCloud(t, e, n, i) {
    for (const u of this.leaves) this.chunkGroup.remove(u.points), u.points.material.dispose(), u.geo.dispose();
    this.leaves.length = 0;
    const r = new ce(t, 3), o = new ce(e, 3, true), a = new ke();
    for (let u = 0; u + wr <= i.length; u += wr) {
      const d = new ke(new b(i[u + 2], i[u + 3], i[u + 4]), new b(i[u + 5], i[u + 6], i[u + 7]));
      a.union(d);
      const f = d.min.clone(), g = new b(Math.max(1e-9, d.max.x - d.min.x) / 65535, Math.max(1e-9, d.max.y - d.min.y) / 65535, Math.max(1e-9, d.max.z - d.min.z) / 65535), _ = new me();
      _.setAttribute("position", r), _.setAttribute("aColor", o), _.setDrawRange(i[u], i[u + 1]), _.boundingSphere = d.getBoundingSphere(new hn());
      const m = new Mo(_, W_(this.cloudUniforms, f, g));
      m.frustumCulled = false, m.layers.set(4), this.chunkGroup.add(m), this.leaves.push({ start: i[u], count: i[u + 1], box: d, geo: _, points: m, want: 0, qmx: f.x, qmy: f.y, qmz: f.z, qsx: g.x, qsy: g.y, qsz: g.z });
    }
    this.cloudQ = t, this.cloud.count = n, this.cloudColors = e, this.store.clearSelection();
    for (const u of [...this.store.entities]) this.store.remove(u);
    this.undoStack.length = 0, this.redoStack.length = 0, this.ucsList.length = 0, this.activeUcs = -1, this.ucs.reset(), this.cloudUniforms.uUcsInv.value.identity(), this.refreshUcsUI(), this.rebuildUcsLabels(), this.ui.showSectionPanel(false), this.markDirty();
    const l = a.isEmpty() ? new hn(new b(), 10) : a.getBoundingSphere(new hn());
    this.cloud.center.copy(l.center), this.cloud.radius = Math.max(1, l.radius);
    const c = a.isEmpty() ? 0 : a.min.y, h = a.isEmpty() ? 1 : a.max.y;
    this.cloudUniforms.uMinY.value = c, this.cloudUniforms.uYRangeInv.value = 1 / Math.max(1e-3, h - c), this.clearLasso(), this.snap.clear(), this.facadeSliceOn = false, this.facadeSliceZ = 0, this.facadeSliceThick = 0.24, this.sliceGrab = null, this.sliceGrabPrev = null, this.syncSliceUI(), this.updateFacadeBand(), this.planSliceY = c + 1.5, this.planSliceThick = 0.3, this.ui.setPlanSliceRange(c, h), this.ui.setPlanSlice(false, this.planSliceY, this.planSliceThick), this.vpm.setIsoView(this.cloud.center, this.cloud.radius), this.enterTopView(), this.tools.activate("isolate"), this.ui.setHint(`\u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043E ${n.toLocaleString("ru-RU")} \u0442\u043E\u0447\u0435\u043A \u2014 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0442\u0435\u043D\u0443 \u043A\u043E\u043D\u0442\u0443\u0440\u043E\u043C`);
  }
  worldToSource(t, e) {
    const n = this.cloudOrigin, i = t.x + (n ? n.x : 0), r = t.y + (n ? n.y : 0), o = t.z + (n ? n.z : 0);
    return e.set(i, -o, r), e;
  }
  get exportInWorld() {
    return this.activeUcs < 0 && this.ucs.defined;
  }
  exportGeometry(t) {
    if (!this.exportInWorld) return [...t];
    const e = [];
    for (const n of t) {
      const i = n.makeCopy(tv);
      for (const r of i.points) this.ucs.localToWorld(r, Ht), this.worldToSource(Ht, r);
      i.rebuild(), e.push(i);
    }
    return e;
  }
  exportList() {
    return this.store.selection.size ? [...this.store.selection] : [...this.store.entities];
  }
  exportDxf() {
    const t = this.exportList();
    if (!t.length) {
      this.ui.setHint("\u041D\u0435\u0447\u0435\u0433\u043E \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u2014 \u043D\u0430\u0447\u0435\u0440\u0442\u0438\u0442\u0435 \u0447\u0442\u043E-\u043D\u0438\u0431\u0443\u0434\u044C");
      return;
    }
    const e = this.exportGeometry(t);
    T0("facade.dxf", b0(e, this.layers.layers));
    for (const n of e) t.includes(n) || n.dispose();
    this.ui.setHint(`DXF \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D: ${t.length} \u043E\u0431., \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B ${this.exportInWorld ? "\u041C\u0421\u041A \u043E\u0431\u043B\u0430\u043A\u0430" : "\u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0439 \u041F\u0421\u041A"}`);
  }
  async toCad() {
    const t = this.exportList();
    if (!t.length) {
      this.ui.setHint("\u041D\u0435\u0447\u0435\u0433\u043E \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C \u2014 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0438\u043B\u0438 \u043D\u0430\u0447\u0435\u0440\u0442\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B");
      return;
    }
    const e = this.exportGeometry(t), n = w0(e);
    for (const i of e) t.includes(i) || i.dispose();
    try {
      if ((await fetch("/api/tocad", { method: "POST", body: n })).ok) {
        this.ui.setHint(`\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0432 AutoCAD: ${t.length} \u043E\u0431. \u0432 ${this.exportInWorld ? "\u041C\u0421\u041A \u043E\u0431\u043B\u0430\u043A\u0430" : "\u041F\u0421\u041A \u0441\u0442\u0435\u043D\u044B"}`);
        return;
      }
    } catch {
    }
    try {
      await navigator.clipboard.writeText(n), this.ui.setHint("AutoCAD \u043D\u0435 \u0437\u0430\u043F\u0443\u0449\u0435\u043D? \u0421\u043A\u0440\u0438\u043F\u0442 \u0432 \u0431\u0443\u0444\u0435\u0440\u0435 \u2014 Ctrl+V \u0432 \u043A\u043E\u043C\u0430\u043D\u0434\u043D\u0443\u044E \u0441\u0442\u0440\u043E\u043A\u0443 AutoCAD");
    } catch {
      this.ui.setHint("\u0411\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u2014 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u044D\u043A\u0441\u043F\u043E\u0440\u0442 DXF");
    }
  }
  rebuildUcsLabels() {
    var _a2;
    for (const t of [...this.ucsLabels.children]) {
      const e = t;
      (_a2 = e.material.map) == null ? void 0 : _a2.dispose(), e.material.dispose(), this.ucsLabels.remove(e);
    }
    for (const t of this.ucsList) {
      const e = document.createElement("canvas"), n = '600 44px "Segoe UI", system-ui, sans-serif';
      let i = e.getContext("2d");
      i.font = n, e.width = Math.ceil(i.measureText(t.name).width) + 24, e.height = 64, i = e.getContext("2d"), i.font = n, i.fillStyle = "rgba(22, 25, 27, 0.8)", i.fillRect(0, 0, e.width, e.height), i.fillStyle = "#86efac", i.textBaseline = "middle", i.fillText(t.name, 12, 34);
      const r = new $a(e);
      r.colorSpace = De;
      const o = new pd(new rh({ map: r, transparent: true, depthTest: false })), a = 1.2;
      o.scale.set(a * e.width / e.height, a, 1), o.position.setFromMatrixPosition(t.matrix), o.position.y += 2.5, o.renderOrder = 5, this.ucsLabels.add(o);
    }
  }
  loadUcsList() {
    this.ucsLabels.visible = false;
    try {
      localStorage.removeItem("facadecad.ucs"), localStorage.removeItem("facadecad.layers");
      for (let t = localStorage.length - 1; t >= 0; t--) {
        const e = localStorage.key(t);
        e && e.startsWith("facadecad.ucs:") && localStorage.removeItem(e);
      }
    } catch {
    }
  }
  serializeUcsList() {
    return JSON.stringify({ list: this.ucsList.map((t) => ({ name: t.name, matrix: t.matrix.toArray() })), active: this.activeUcs });
  }
  restoreUcsList(t) {
    let e;
    try {
      e = JSON.parse(t);
    } catch {
      return;
    }
    if (!(!e.list || !e.list.length)) {
      this.ucsList.length = 0;
      for (const n of e.list) !n.name || !Array.isArray(n.matrix) || n.matrix.length !== 16 || this.ucsList.push({ name: n.name, matrix: new Jt().fromArray(n.matrix) });
      this.refreshUcsUI(), this.rebuildUcsLabels(), typeof e.active == "number" && e.active >= 0 && e.active < this.ucsList.length && (this.ucs.setFromMatrix(this.ucsList[e.active].matrix), this.activeUcs = e.active, this.afterUcsChange());
    }
  }
  markDirty() {
    this.dirty = true;
  }
  flushDirtySave(t = false) {
    if (!this.dirty || this.saving) return;
    const e = JSON.stringify({ action: "save", layers: this.layers.serialize(), entities: JSON.parse(this.store.serialize()), ucs: this.serializeUcsList(), cloud_name: this.cloudName });
    if (this.dirty = false, t) {
      fetch(this.sessionApiUrl, { method: "POST", body: e, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {
      });
      return;
    }
    this.saving = true, fetch(this.sessionApiUrl, { method: "POST", body: e, headers: { "Content-Type": "application/json" } }).catch(() => {
      this.dirty = true;
    }).finally(() => {
      this.saving = false;
    });
  }
  async restoreSessionFromServer() {
    try {
      const t = await fetch(this.sessionApiUrl);
      if (!t.ok) return;
      const e = await t.json();
      e.layers && this.layers.restore(e.layers), this.layers.applyMaterials(), e.entities && e.entities.length && this.store.restore(JSON.stringify(e.entities)), e.ucs && this.restoreUcsList(e.ucs), e.cloud_name && (this.cloudName = e.cloud_name), this.syncLayerUI(), this.ui.setWeightPill(this.layers.showWeight);
    } catch {
    }
  }
  canDraft() {
    return !(this.ucs.defined && this.activeUcs < 0);
  }
  setDeviationRef(t) {
    return !this.ucs.defined || this.activeUcs < 0 ? (this.ui.setHint("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u041F\u0421\u041A \u0441\u0442\u0435\u043D\u044B \u2014 \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u044F \u0441\u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u043E\u0442 \u0435\u0451 \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u0438"), false) : this.pickCloudPoint(t, Ht) ? (this.ucs.worldToLocal(Ht, Ki), this.deviationRef = Ki.z, this.ui.setHint("\u041D\u0443\u043B\u0435\u0432\u0430\u044F \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u044C \u0437\u0430\u0434\u0430\u043D\u0430 (\u0433\u043B\u0443\u0431\u0438\u043D\u0430 " + Ki.z.toFixed(3) + " \u043C) \u2014 \u043A\u043B\u0438\u043A\u0430\u0439\u0442\u0435 \u0442\u043E\u0447\u043A\u0438, \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u044F \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043F\u043E\u0434\u043F\u0438\u0441\u044F\u043C\u0438"), true) : (this.ui.setHint("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0439\u043C\u0430\u0442\u044C \u0442\u043E\u0447\u043A\u0443 \u0441\u043A\u0430\u043D\u0430 \u2014 \u0446\u0435\u043B\u044C\u0441\u044F \u0432 \u043E\u0431\u043B\u0430\u043A\u043E"), false);
  }
  get snapZMin() {
    return this.facadeSliceOn ? this.facadeSliceZ - this.facadeSliceThick / 2 : -1 / 0;
  }
  get snapZMax() {
    return this.facadeSliceOn ? this.facadeSliceZ + this.facadeSliceThick / 2 : 1 / 0;
  }
  openingsLive() {
    this.tools.active === this.openings && (clearTimeout(this.openingsTimer), this.openingsTimer = window.setTimeout(() => {
      this.tools.active === this.openings && this.openings.refreshWall();
    }, 180));
  }
  setFacadeRange(t, e) {
    this.facadeSliceZ = (t + e) / 2, this.facadeSliceThick = Math.max(2e-3, e - t), this.facadeSliceOn = true, this.syncSliceUI(), this.updateFacadeBand(), this.openingsLive();
  }
  syncSliceUI() {
    this.ui.setFacadeSlice(this.facadeSliceOn, this.facadeSliceZ - this.facadeSliceThick / 2, this.facadeSliceZ + this.facadeSliceThick / 2);
  }
  updateFacadeBand() {
    const t = this.facadeSliceOn && this.ucs.defined && this.activeUcs >= 0, e = this.facadeBand;
    if (e.visible = t, this.facadeEdges.visible = t, !t) return;
    e.position.set(0, 0, this.facadeSliceZ), e.scale.set(4e3, 4e3, Math.max(2e-3, this.facadeSliceThick));
    const n = this.facadeSliceZ - this.facadeSliceThick / 2, i = this.facadeSliceZ + this.facadeSliceThick / 2, r = 2e3, o = new jn();
    o.setPositions([-r, 0, n, r, 0, n, 0, -r, n, 0, r, n, -r, 0, i, r, 0, i, 0, -r, i, 0, r, i]), this.facadeEdges.geometry.dispose(), this.facadeEdges.geometry = o, this.facadeEdges.computeLineDistances();
  }
  profileDepthTol(t, e) {
    const n = Math.abs(this.profileDepthAt(t + 4, e) - this.profileDepthAt(t - 4, e)) / 8, i = Math.abs(this.profileDepthAt(t, e + 4) - this.profileDepthAt(t, e - 4)) / 8;
    return Math.max(n, i) * 8;
  }
  refreshDepthRuler() {
    const t = performance.now();
    if (t - this.depthRulerT < 150) return;
    if (this.depthRulerT = t, !this.ucs.defined || this.activeUcs < 0 || this.vpm.profile.css.w < 2) {
      this.depthRulerSig && (this.depthRulerSig = "", this.ui.hideDepthRuler());
      return;
    }
    const e = this.vpm.profile, n = this.profileMode === "vert", i = e.css.x + e.css.w / 2, r = e.css.y + e.css.h / 2, o = n ? e.css.w : e.css.h, a = n ? this.profileDepthAt(e.css.x, r) : this.profileDepthAt(i, e.css.y), l = n ? this.profileDepthAt(e.css.x + e.css.w, r) : this.profileDepthAt(i, e.css.y + e.css.h);
    if (!isFinite(a) || !isFinite(l) || Math.abs(l - a) < 1e-9 || o < 40) return;
    const c = `${n}|${a.toFixed(4)}|${l.toFixed(4)}|${e.css.x}|${e.css.y}|${o}`;
    if (c === this.depthRulerSig) return;
    this.depthRulerSig = c;
    const h = (l - a) / o, u = Math.abs(h) * 56, d = Vo.find((m) => m >= u) ?? Vo[Vo.length - 1], f = Math.min(a, l), g = Math.max(a, l), _ = [];
    for (let m = Math.ceil(f / d); m * d <= g && _.length < 80; m++) {
      const p = m * d;
      _.push({ p: Math.round((p - a) / h), label: String(Math.round(p * 1e3)), major: m % 5 === 0 });
    }
    this.ui.renderDepthRuler(_, n, e.css);
  }
  loadPaneLayout() {
    try {
      const t = localStorage.getItem("facadecad.panes");
      t && this.vpm.setLayout(JSON.parse(t));
    } catch {
    }
    this.syncPaneChips();
  }
  savePaneLayout() {
    localStorage.setItem("facadecad.panes", JSON.stringify(this.vpm.layout()));
  }
  setPaneHidden(t, e) {
    this.vpm.setLayout(t === "profile" ? { hideProfile: e } : { hideIso: e }), this.syncPaneChips(), this.savePaneLayout(), e && this.activePane === t && this.setActivePane("main"), t === "profile" && e && this.ui.hideDepthRuler(), this.ui.setActivePane(this.activePane, this.vpm[this.activePane].css);
  }
  syncPaneChips() {
    var _a2, _b;
    const t = this.vpm.layout();
    (_a2 = document.getElementById("restore-profile")) == null ? void 0 : _a2.classList.toggle("hidden", !t.hideProfile), (_b = document.getElementById("restore-iso")) == null ? void 0 : _b.classList.toggle("hidden", !t.hideIso);
  }
  profileDepthAt(t, e) {
    const n = this.vpm.profile;
    return Ht.set((t - n.css.x) / n.css.w * 2 - 1, -((e - n.css.y) / n.css.h * 2 - 1), 0).unproject(n.camera), this.ucs.worldToLocal(Ht, Ht), Ht.z;
  }
  enterTopView() {
    if (this.ucs.plane.normal.set(0, 1, 0), this.ucs.plane.constant = 0, this.isoBounds.isEmpty()) xe.copy(this.cloud.center), xe.y = 0, this.vpm.setTopView(xe, this.cloud.radius * 1.7);
    else {
      this.isoBounds.getCenter(xe), this.isoBounds.getSize(Oe), xe.y = 0;
      const t = this.vpm.main.css.w / Math.max(1, this.vpm.main.css.h);
      this.vpm.setTopView(xe, qe.clamp(Math.max(Oe.z * 1.4, Oe.x * 1.4 / t), 2, 4e3));
    }
    this.mainMode = "top", this.planSliceBand.visible = false, this.ui.showElevationAids(false), this.ui.showPlanSlicePanel(this.isolated !== null), this.ui.setMainLabel(this.planSliceOn && this.isolated ? "\u041F\u041B\u0410\u041D \xB7 \u0421\u0420\u0415\u0417 \u041F\u041E \u0412\u042B\u0421\u041E\u0422\u0415" : "\u041F\u041B\u0410\u041D \xB7 \u0412\u0418\u0414 \u0421\u0412\u0415\u0420\u0425\u0423");
  }
  enterLevelView() {
    if (this.isoBounds.isEmpty()) {
      this.ui.setHint("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0442\u0435\u043D\u0443 \u043A\u043E\u043D\u0442\u0443\u0440\u043E\u043C \u043D\u0430 \u0432\u0438\u0434\u0435 \u0441\u0432\u0435\u0440\u0445\u0443"), this.tools.activate("isolate");
      return;
    }
    this.isoBounds.getCenter(xe), this.isoBounds.getSize(Oe);
    const t = Oe.x >= Oe.z;
    Ps.set(t ? 0 : 1, 0, t ? 1 : 0);
    const e = this.vpm.main, n = e.css.w / Math.max(1, e.css.h), i = t ? Oe.x : Oe.z;
    this.vpm.setOrthoView(e, Ps, Q0, xe, qe.clamp(Math.max(Oe.y * 1.3, i * 1.15 / n), 1, 2e3)), this.ucs.plane.setFromNormalAndCoplanarPoint(Ps, xe), this.mainMode = "level", this.ui.showPlanSlicePanel(true), this.ui.setPlanSlice(this.planSliceOn, this.planSliceY, this.planSliceThick), this.updatePlanBand(), this.ui.showElevationAids(true), this.refreshElevationScale(), this.ui.setMainLabel("\u0423\u0420\u041E\u0412\u0415\u041D\u042C \u0421\u0420\u0415\u0417\u0410 \xB7 \u0412\u0418\u0414 \u0421\u0411\u041E\u041A\u0423");
  }
  refreshElevationScale() {
    if (this.mainMode !== "level") return;
    const t = this.vpm.main, e = t.camera, n = t.frustumHeight, i = e.position.y - n / 2, r = e.position.y + n / 2, o = 46 / Math.max(1, t.css.h) * n, a = Ho.find((c) => c >= o) ?? Ho[Ho.length - 1], l = [];
    for (let c = Math.ceil(i / a); c * a <= r && l.length < 80; c++) {
      const h = c * a;
      l.push({ y: Math.round(t.css.y + t.css.h * (1 - (h - i) / n)), label: (Math.abs(h) < 1e-9 ? 0 : h).toFixed(a < 1 ? 2 : 1), major: c % 5 === 0 });
    }
    this.ui.renderElevationScale(l);
  }
  setPlanSliceLevel(t) {
    this.isoBounds.isEmpty() || (this.planSliceY = qe.clamp(t, this.isoBounds.min.y, this.isoBounds.max.y), this.planSliceOn = true, this.ui.setPlanSlice(true, this.planSliceY, this.planSliceThick), this.updatePlanBand());
  }
  updatePlanBand() {
    const t = this.planSliceBand;
    if (t.visible = this.mainMode === "level" && !this.isoBounds.isEmpty(), !t.visible) return;
    this.isoBounds.getCenter(xe), this.isoBounds.getSize(Oe);
    const e = Oe.x >= Oe.z;
    t.position.set(xe.x, this.planSliceY, xe.z), t.rotation.set(0, e ? 0 : Math.PI / 2, 0), t.scale.set((e ? Oe.x : Oe.z) * 1.08, Math.max(0.03, this.planSliceThick), 1);
  }
  enterDraftView(t = false) {
    if (!this.ucs.defined || this.activeUcs < 0 || this.mainMode === "draft" && !t) return;
    const e = this.snap.localBounds;
    let n = 20;
    this.snap.ready && !e.isEmpty() ? (e.getCenter(Ht), this.ucs.localToWorld(Ht, xe), n = qe.clamp((e.max.y - e.min.y) * 1.35, 4, 500)) : xe.copy(this.ucs.origin), this.vpm.setOrthoView(this.vpm.main, this.ucs.zAxis, this.ucs.yAxis, xe, n), this.applyProfileView(xe), this.mainMode = "draft", this.ui.showElevationAids(false), this.ui.setMainLabel("\u0424\u0410\u0421\u0410\u0414 \xB7 \u0427\u0415\u0420\u0427\u0415\u041D\u0418\u0415");
  }
  profileEye(t) {
    return this.profileMode === "vert" ? t.copy(this.ucs.xAxis) : t.copy(this.ucs.yAxis).negate();
  }
  applyProfileView(t) {
    const e = this.vpm.profile, n = this.profileMode === "vert" ? this.ucs.yAxis : this.ucs.zAxis, i = e.css.w / Math.max(1, e.css.h), r = this.profileMode === "vert" ? this.profileWindow * 1.15 : this.profileWindow * 1.15 / i;
    this.vpm.setOrthoView(e, this.profileEye(Ki), n, t, r);
  }
  refreshProfileView() {
    !this.ucs.defined || this.activeUcs < 0 || (xe.copy(this.tools.pointer.valid ? this.tools.pointer.world : this.ucs.origin), this.applyProfileView(xe), this.profileFollow = true, this.ui.setProfileLabel(this.profileMode === "vert" ? "\u0421\u0415\u0427\u0415\u041D\u0418\u0415 \xB7 \u0412\u0415\u0420\u0422\u0418\u041A\u0410\u041B\u042C\u041D\u041E\u0415" : "\u0421\u0415\u0427\u0415\u041D\u0418\u0415 \xB7 \u0413\u041E\u0420\u0418\u0417\u041E\u041D\u0422\u0410\u041B\u042C\u041D\u041E\u0415"));
  }
  setSnap(t) {
    this.snapOn = t, this.ui.setSnap(t);
  }
  setOrtho(t) {
    this.orthoOn = t, this.refreshOrthoUI();
  }
  setActivePane(t) {
    const e = this.vpm[t].css;
    e.w < 2 || e.h < 2 || (this.activePane = t, this.followActive = t === "main" && this.followActive, this.profileFollow = t === "main" && this.profileFollow, t === "profile" && !this.profileFrozen ? (this.profileFreeze.copy(this.tools.pointer.local), this.profileFrozen = true) : t === "main" && (this.profileFrozen = false), this.ui.setActivePane(t, this.vpm[t].css));
  }
  refreshOrthoUI() {
    this.ui.setOrtho(this.tools.orthoActive);
  }
  setSectionDepth(t) {
    this.sectionDepth = t, this.ui.setSectionValue(t);
  }
  bindInput(t) {
    var _a2, _b, _c2, _d2;
    t.addEventListener("pointerdown", (i) => {
      const r = this.vpm.viewportAt(i.clientX, i.clientY);
      if (r) {
        if (i.button === 1) {
          r.camera instanceof an && (this.panning = r, this.panX = i.clientX, this.panY = i.clientY, t.setPointerCapture(i.pointerId)), i.preventDefault();
          return;
        }
        if (i.button === 0 && this.setActivePane(r.name), i.button === 0 && r.name === "profile" && this.ucs.defined && this.activeUcs >= 0) {
          const o = this.profileDepthAt(i.clientX, i.clientY), a = this.profileDepthTol(i.clientX, i.clientY), l = this.facadeSliceZ - this.facadeSliceThick / 2, c = this.facadeSliceZ + this.facadeSliceThick / 2;
          this.sliceGrabPrev = { on: this.facadeSliceOn, z: this.facadeSliceZ, t: this.facadeSliceThick }, this.facadeSliceOn && Math.abs(o - l) <= a ? this.sliceGrab = "lo" : this.facadeSliceOn && Math.abs(o - c) <= a ? this.sliceGrab = "hi" : this.facadeSliceOn && o > l && o < c ? (this.sliceGrab = "move", this.sliceGrabZ0 = o - this.facadeSliceZ) : (this.sliceGrab = "new", this.sliceGrabZ0 = Go(o), this.setFacadeRange(this.sliceGrabZ0, this.sliceGrabZ0)), t.setPointerCapture(i.pointerId), i.preventDefault();
          return;
        }
        r.name === "main" && i.button === 0 && this.tools.pointerDown(i, r);
      }
    }), t.addEventListener("pointermove", (i) => {
      if (this.panning) {
        this.vpm.pan(this.panning, i.clientX - this.panX, i.clientY - this.panY), this.panX = i.clientX, this.panY = i.clientY;
        return;
      }
      if (this.sliceGrab) {
        const l = Go(this.profileDepthAt(i.clientX, i.clientY)), c = this.facadeSliceZ - this.facadeSliceThick / 2, h = this.facadeSliceZ + this.facadeSliceThick / 2;
        if (this.sliceGrab === "new") this.setFacadeRange(Math.min(this.sliceGrabZ0, l), Math.max(this.sliceGrabZ0, l));
        else if (this.sliceGrab === "lo") this.setFacadeRange(Math.min(l, h), h);
        else if (this.sliceGrab === "hi") this.setFacadeRange(c, Math.max(l, c));
        else {
          const u = Go(l - this.sliceGrabZ0), d = this.facadeSliceThick / 2;
          this.setFacadeRange(u - d, u + d);
        }
        return;
      }
      const r = this.vpm.viewportAt(i.clientX, i.clientY);
      if (!r) return;
      const o = this.tools.active !== null && this.tools.active.id !== "select";
      let a = r.name === "main" && o ? "crosshair" : "default";
      if (r.name === "profile" && this.ucs.defined && this.activeUcs >= 0 && (a = "crosshair", this.facadeSliceOn)) {
        const l = this.profileDepthAt(i.clientX, i.clientY), c = this.profileDepthTol(i.clientX, i.clientY), h = this.facadeSliceZ - this.facadeSliceThick / 2, u = this.facadeSliceZ + this.facadeSliceThick / 2;
        Math.abs(l - h) <= c || Math.abs(l - u) <= c ? a = this.profileMode === "vert" ? "ew-resize" : "ns-resize" : l > h && l < u && (a = "move");
      }
      if (t.style.cursor = a, r.name === "main") {
        this.tools.pointerMove(i, r);
        const l = this.tools.pointer;
        if (this.mainMode === "level") {
          const c = this.planSliceY - this.planSliceThick / 2, h = this.planSliceY + this.planSliceThick / 2;
          l.valid ? (this.ui.setElevationCursor(i.clientY, `${l.world.y.toFixed(2)} \u043C`, r.css.x, r.css.w), this.ui.setCoordsText(`\u041E\u0422\u041C\u0415\u0422\u041A\u0410 ${l.world.y.toFixed(3)}  \xB7  \u0421\u0420\u0415\u0417 ${c.toFixed(2)}\u2026${h.toFixed(2)} \u043C`)) : this.ui.setElevationCursor(null, "", 0, 0), this.refreshOrthoUI();
          return;
        }
        l.valid && (this.exportInWorld ? (this.worldToSource(l.world, Ht), this.ui.setCoords(Ht.x, Ht.y, Ht.z)) : this.ui.setCoords(l.local.x, l.local.y), this.noteFollow(), this.followTarget.copy(l.world), this.activePane === "main" && (this.followActive = true, this.profileFollow = true)), this.refreshOrthoUI();
      }
    });
    const e = document.getElementById("orbit-pad");
    e.addEventListener("pointerdown", () => this.setActivePane("iso")), e.addEventListener("pointerdown", (i) => {
      i.button === 0 && this.tools.active && this.tools.active.id !== "select" && this.tools.pointerDown(i, this.vpm.iso);
    }), e.addEventListener("pointermove", (i) => {
      const r = this.tools.active !== null && this.tools.active.id !== "select";
      if (e.style.cursor = r ? "crosshair" : "default", !r) return;
      this.tools.pointerMove(i, this.vpm.iso);
      const o = this.tools.pointer;
      o.valid && (this.ui.setCoords(o.local.x, o.local.y), this.noteFollow());
    }), e.addEventListener("contextmenu", (i) => {
      i.preventDefault(), this.tools.finish();
    }), t.addEventListener("pointerup", (i) => {
      if (this.panning && i.button === 1) {
        this.panning = null, t.releasePointerCapture(i.pointerId);
        return;
      }
      if (this.sliceGrab && i.button === 0) {
        const o = this.sliceGrab, a = this.sliceGrabPrev;
        if (this.sliceGrab = null, this.sliceGrabPrev = null, t.releasePointerCapture(i.pointerId), this.facadeSliceThick < 4e-3) {
          o === "new" && a && a.on ? (this.facadeSliceZ = a.z, this.facadeSliceThick = a.t, this.facadeSliceOn = true, this.ui.setHint("\u0429\u0435\u043B\u0447\u043A\u0430 \u043C\u0430\u043B\u043E \u2014 \u043F\u0440\u0435\u0436\u043D\u0438\u0439 \u0441\u0440\u0435\u0437 \u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D; \u0447\u0442\u043E\u0431\u044B \u0437\u0430\u0434\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0439, \u041F\u0420\u041E\u0422\u042F\u041D\u0418\u0422\u0415 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D")) : (this.facadeSliceOn = false, this.ui.setHint("\u0421\u0440\u0435\u0437 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D \u2014 \u043F\u0440\u043E\u0442\u044F\u043D\u0438\u0442\u0435 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D \u0433\u043B\u0443\u0431\u0438\u043D\u044B \u0432 \u043E\u043A\u043D\u0435 2, \u0447\u0442\u043E\u0431\u044B \u0437\u0430\u0434\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0439")), this.syncSliceUI(), this.updateFacadeBand(), this.openingsLive();
          return;
        }
        const l = Math.round((this.facadeSliceZ - this.facadeSliceThick / 2) * 1e3), c = Math.round((this.facadeSliceZ + this.facadeSliceThick / 2) * 1e3);
        this.ui.setHint(`\u0421\u0440\u0435\u0437 ${l}\u2026${c} \u043C\u043C \u2014 \u0442\u044F\u043D\u0438\u0442\u0435 \u0433\u043E\u043B\u0443\u0431\u044B\u0435 \u043E\u0441\u0438 \u0432 \u043E\u043A\u043D\u0435 2, \u0442\u043E\u0447\u043D\u044B\u0435 \u0447\u0438\u0441\u043B\u0430 \u0432 \u043F\u0430\u043D\u0435\u043B\u0438 \u0421\u0420\u0415\u0417`);
        return;
      }
      const r = this.vpm.viewportAt(i.clientX, i.clientY);
      r && r.name === "main" && i.button === 0 && this.tools.pointerUp(i, r);
    }), t.addEventListener("wheel", (i) => {
      const r = this.vpm.viewportAt(i.clientX, i.clientY);
      !r || !(r.camera instanceof an) || (i.preventDefault(), this.vpm.zoomAt(r, i.clientX, i.clientY, i.deltaY > 0 ? 1.15 : 1 / 1.15));
    }, { passive: false }), t.addEventListener("contextmenu", (i) => {
      i.preventDefault(), this.tools.finish();
    }), window.addEventListener("keydown", (i) => {
      var _a3;
      const r = i.target;
      if (r && (r.tagName === "INPUT" || r.tagName === "TEXTAREA" || r.tagName === "SELECT")) return;
      const o = this.tools.numBuffer !== "" || ((_a3 = this.tools.active) == null ? void 0 : _a3.getDynamicAnchor()) != null;
      if (!i.ctrlKey && !i.metaKey && !i.altKey && (i.key === "1" || i.key === "2" || i.key === "3") && !o) {
        i.preventDefault(), this.setActivePane(i.key === "1" ? "main" : i.key === "2" ? "profile" : "iso");
        return;
      }
      if (i.key === "F1") {
        i.preventDefault(), this.ui.toggleHelp();
        return;
      }
      if (i.key === "Escape" && this.ui.helpOpen) {
        this.ui.toggleHelp(false);
        return;
      }
      if ((i.ctrlKey || i.metaKey) && (i.key === "z" || i.key === "Z" || i.key === "\u044F" || i.key === "\u042F")) {
        i.preventDefault(), i.shiftKey ? this.redo() : this.undo();
        return;
      }
      if ((i.ctrlKey || i.metaKey) && (i.key === "y" || i.key === "Y" || i.key === "\u043D" || i.key === "\u041D")) {
        i.preventDefault(), this.redo();
        return;
      }
      if (i.key === " ") {
        i.preventDefault(), this.tools.active && this.tools.active.id === "select" ? this.tools.repeatLast() : this.tools.finish();
        return;
      }
      if (i.key === "F8") {
        i.preventDefault(), this.setOrtho(!this.orthoOn);
        return;
      }
      if (i.key === "Shift" && (this.tools.shiftHeld = true, this.refreshOrthoUI()), this.tools.handleNumKey(i)) {
        i.preventDefault();
        return;
      }
      if ((i.key === "s" || i.key === "S" || i.key === "\u044B" || i.key === "\u042B") && !i.ctrlKey && !i.metaKey) {
        this.setSnap(!this.snapOn);
        return;
      }
      this.tools.key(i) || (i.key === "Delete" || i.key === "Backspace") && this.eraseSelection();
    }), window.addEventListener("keyup", (i) => {
      i.key === "Shift" && (this.tools.shiftHeld = false, this.refreshOrthoUI());
    });
    const n = (i, r) => {
      const o = document.getElementById(i);
      o && (o.addEventListener("pointerdown", (a) => {
        a.preventDefault(), o.setPointerCapture(a.pointerId), o.dataset.drag = "true";
        const l = (h) => r(h), c = () => {
          o.removeEventListener("pointermove", l), o.removeEventListener("pointerup", c), o.dataset.drag = "false", this.savePaneLayout();
        };
        o.addEventListener("pointermove", l), o.addEventListener("pointerup", c);
      }), o.addEventListener("dblclick", () => {
        this.vpm.setLayout({ splitX: mi, splitY: Ds }), this.savePaneLayout();
      }));
    };
    n("split-v", (i) => this.vpm.setLayout({ splitX: i.clientX / Math.max(1, window.innerWidth) })), n("split-h", (i) => {
      const r = this.vpm.main.css.y;
      this.vpm.setLayout({ splitY: (i.clientY - r) / Math.max(1, window.innerHeight - r) });
    }), (_a2 = document.getElementById("close-profile")) == null ? void 0 : _a2.addEventListener("click", () => this.setPaneHidden("profile", true)), (_b = document.getElementById("close-iso")) == null ? void 0 : _b.addEventListener("click", () => this.setPaneHidden("iso", true)), (_c2 = document.getElementById("restore-profile")) == null ? void 0 : _c2.addEventListener("click", () => this.setPaneHidden("profile", false)), (_d2 = document.getElementById("restore-iso")) == null ? void 0 : _d2.addEventListener("click", () => this.setPaneHidden("iso", false));
  }
}
const Rh = new iv();
Rh.start();
window.__engine = Rh;
