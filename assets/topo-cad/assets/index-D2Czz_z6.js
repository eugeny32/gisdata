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
const ya = "174", wn = { ROTATE: 0, DOLLY: 1, PAN: 2 }, Gi = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, ph = 0, Wa = 1, mh = 2, _c = 1, gh = 2, Sn = 3, Yn = 0, Fe = 1, $e = 2, Wn = 0, Yi = 1, Xa = 2, Ya = 3, qa = 4, _h = 5, li = 100, xh = 101, vh = 102, yh = 103, Mh = 104, Sh = 200, Eh = 201, bh = 202, Th = 203, Po = 204, Lo = 205, wh = 206, Ah = 207, Ch = 208, Rh = 209, Ph = 210, Lh = 211, Dh = 212, Uh = 213, Ih = 214, Do = 0, Uo = 1, Io = 2, ji = 3, No = 4, Fo = 5, Oo = 6, Bo = 7, xc = 0, Nh = 1, Fh = 2, Xn = 0, Oh = 1, Bh = 2, zh = 3, kh = 4, Hh = 5, Vh = 6, Gh = 7, vc = 300, Ki = 301, Zi = 302, zo = 303, ko = 304, Ir = 306, Ho = 1e3, hi = 1001, Vo = 1002, rn = 1003, Wh = 1004, Ns = 1005, dn = 1006, zr = 1007, ui = 1008, Rn = 1009, yc = 1010, Mc = 1011, ws = 1012, Ma = 1013, pi = 1014, bn = 1015, Cs = 1016, Sa = 1017, Ea = 1018, Ji = 1020, Sc = 35902, Ec = 1021, bc = 1022, sn = 1023, Tc = 1024, wc = 1025, qi = 1026, Qi = 1027, Ac = 1028, ba = 1029, Cc = 1030, Ta = 1031, wa = 1033, Mr = 33776, Sr = 33777, Er = 33778, br = 33779, Go = 35840, Wo = 35841, Xo = 35842, Yo = 35843, qo = 36196, $o = 37492, jo = 37496, Ko = 37808, Zo = 37809, Jo = 37810, Qo = 37811, ta = 37812, ea = 37813, na = 37814, ia = 37815, sa = 37816, ra = 37817, oa = 37818, aa = 37819, la = 37820, ca = 37821, Tr = 36492, ha = 36494, ua = 36495, Rc = 36283, da = 36284, fa = 36285, pa = 36286, Xh = 3200, Yh = 3201, qh = 0, $h = 1, Vn = "", Le = "srgb", ts = "srgb-linear", Cr = "linear", Qt = "srgb", Mi = 7680, $a = 519, jh = 512, Kh = 513, Zh = 514, Pc = 515, Jh = 516, Qh = 517, tu = 518, eu = 519, ma = 35044, ja = "300 es", Tn = 2e3, Rr = 2001;
class _i {
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
const be = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let Ka = 1234567;
const bs = Math.PI / 180, As = 180 / Math.PI;
function An() {
  const s = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (be[s & 255] + be[s >> 8 & 255] + be[s >> 16 & 255] + be[s >> 24 & 255] + "-" + be[t & 255] + be[t >> 8 & 255] + "-" + be[t >> 16 & 15 | 64] + be[t >> 24 & 255] + "-" + be[e & 63 | 128] + be[e >> 8 & 255] + "-" + be[e >> 16 & 255] + be[e >> 24 & 255] + be[n & 255] + be[n >> 8 & 255] + be[n >> 16 & 255] + be[n >> 24 & 255]).toLowerCase();
}
function Ft(s, t, e) {
  return Math.max(t, Math.min(e, s));
}
function Aa(s, t) {
  return (s % t + t) % t;
}
function nu(s, t, e, n, i) {
  return n + (s - t) * (i - n) / (e - t);
}
function iu(s, t, e) {
  return s !== t ? (e - s) / (t - s) : 0;
}
function Ts(s, t, e) {
  return (1 - e) * s + e * t;
}
function su(s, t, e, n) {
  return Ts(s, t, 1 - Math.exp(-e * n));
}
function ru(s, t = 1) {
  return t - Math.abs(Aa(s, t * 2) - t);
}
function ou(s, t, e) {
  return s <= t ? 0 : s >= e ? 1 : (s = (s - t) / (e - t), s * s * (3 - 2 * s));
}
function au(s, t, e) {
  return s <= t ? 0 : s >= e ? 1 : (s = (s - t) / (e - t), s * s * s * (s * (s * 6 - 15) + 10));
}
function lu(s, t) {
  return s + Math.floor(Math.random() * (t - s + 1));
}
function cu(s, t) {
  return s + Math.random() * (t - s);
}
function hu(s) {
  return s * (0.5 - Math.random());
}
function uu(s) {
  s !== void 0 && (Ka = s);
  let t = Ka += 1831565813;
  return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function du(s) {
  return s * bs;
}
function fu(s) {
  return s * As;
}
function pu(s) {
  return (s & s - 1) === 0 && s !== 0;
}
function mu(s) {
  return Math.pow(2, Math.ceil(Math.log(s) / Math.LN2));
}
function gu(s) {
  return Math.pow(2, Math.floor(Math.log(s) / Math.LN2));
}
function _u(s, t, e, n, i) {
  const r = Math.cos, o = Math.sin, a = r(e / 2), l = o(e / 2), c = r((t + n) / 2), h = o((t + n) / 2), u = r((t - n) / 2), d = o((t - n) / 2), p = r((n - t) / 2), g = o((n - t) / 2);
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
      s.set(a * h, l * g, l * p, a * c);
      break;
    case "YXY":
      s.set(l * p, a * h, l * g, a * c);
      break;
    case "ZYZ":
      s.set(l * g, l * p, a * h, a * c);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + i);
  }
}
function nn(s, t) {
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
function Jt(s, t) {
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
const es = { DEG2RAD: bs, RAD2DEG: As, generateUUID: An, clamp: Ft, euclideanModulo: Aa, mapLinear: nu, inverseLerp: iu, lerp: Ts, damp: su, pingpong: ru, smoothstep: ou, smootherstep: au, randInt: lu, randFloat: cu, randFloatSpread: hu, seededRandom: uu, degToRad: du, radToDeg: fu, isPowerOfTwo: pu, ceilPowerOfTwo: mu, floorPowerOfTwo: gu, setQuaternionFromProperEuler: _u, normalize: Jt, denormalize: nn };
class Et {
  constructor(t = 0, e = 0) {
    Et.prototype.isVector2 = true, this.x = t, this.y = e;
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
    return this.x = Ft(this.x, t.x, e.x), this.y = Ft(this.y, t.y, e.y), this;
  }
  clampScalar(t, e) {
    return this.x = Ft(this.x, t, e), this.y = Ft(this.y, t, e), this;
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ft(n, t, e));
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
    return Math.acos(Ft(n, -1, 1));
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
    const n = t.elements, i = e.elements, r = this.elements, o = n[0], a = n[3], l = n[6], c = n[1], h = n[4], u = n[7], d = n[2], p = n[5], g = n[8], _ = i[0], m = i[3], f = i[6], A = i[1], T = i[4], S = i[7], I = i[2], w = i[5], C = i[8];
    return r[0] = o * _ + a * A + l * I, r[3] = o * m + a * T + l * w, r[6] = o * f + a * S + l * C, r[1] = c * _ + h * A + u * I, r[4] = c * m + h * T + u * w, r[7] = c * f + h * S + u * C, r[2] = d * _ + p * A + g * I, r[5] = d * m + p * T + g * w, r[8] = d * f + p * S + g * C, this;
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
    const t = this.elements, e = t[0], n = t[1], i = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8], u = h * o - a * c, d = a * l - h * r, p = c * r - o * l, g = e * u + n * d + i * p;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const _ = 1 / g;
    return t[0] = u * _, t[1] = (i * c - h * n) * _, t[2] = (a * n - i * o) * _, t[3] = d * _, t[4] = (h * e - i * l) * _, t[5] = (i * r - a * e) * _, t[6] = p * _, t[7] = (n * l - c * e) * _, t[8] = (o * e - n * r) * _, this;
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
    return this.premultiply(kr.makeScale(t, e)), this;
  }
  rotate(t) {
    return this.premultiply(kr.makeRotation(-t)), this;
  }
  translate(t, e) {
    return this.premultiply(kr.makeTranslation(t, e)), this;
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
const kr = new Dt();
function Lc(s) {
  for (let t = s.length - 1; t >= 0; --t) if (s[t] >= 65535) return true;
  return false;
}
function Pr(s) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", s);
}
function xu() {
  const s = Pr("canvas");
  return s.style.display = "block", s;
}
const Za = {};
function oi(s) {
  s in Za || (Za[s] = true, console.warn(s));
}
function vu(s, t, e) {
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
function yu(s) {
  const t = s.elements;
  t[2] = 0.5 * t[2] + 0.5 * t[3], t[6] = 0.5 * t[6] + 0.5 * t[7], t[10] = 0.5 * t[10] + 0.5 * t[11], t[14] = 0.5 * t[14] + 0.5 * t[15];
}
function Mu(s) {
  const t = s.elements;
  t[11] === -1 ? (t[10] = -t[10] - 1, t[14] = -t[14]) : (t[10] = -t[10], t[14] = -t[14] + 1);
}
const Ja = new Dt().set(0.4123908, 0.3575843, 0.1804808, 0.212639, 0.7151687, 0.0721923, 0.0193308, 0.1191948, 0.9505322), Qa = new Dt().set(3.2409699, -1.5373832, -0.4986108, -0.9692436, 1.8759675, 0.0415551, 0.0556301, -0.203977, 1.0569715);
function Su() {
  const s = { enabled: true, workingColorSpace: ts, spaces: {}, convert: function(i, r, o) {
    return this.enabled === false || r === o || !r || !o || (this.spaces[r].transfer === Qt && (i.r = Cn(i.r), i.g = Cn(i.g), i.b = Cn(i.b)), this.spaces[r].primaries !== this.spaces[o].primaries && (i.applyMatrix3(this.spaces[r].toXYZ), i.applyMatrix3(this.spaces[o].fromXYZ)), this.spaces[o].transfer === Qt && (i.r = $i(i.r), i.g = $i(i.g), i.b = $i(i.b))), i;
  }, fromWorkingColorSpace: function(i, r) {
    return this.convert(i, this.workingColorSpace, r);
  }, toWorkingColorSpace: function(i, r) {
    return this.convert(i, r, this.workingColorSpace);
  }, getPrimaries: function(i) {
    return this.spaces[i].primaries;
  }, getTransfer: function(i) {
    return i === Vn ? Cr : this.spaces[i].transfer;
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
  return s.define({ [ts]: { primaries: t, whitePoint: n, transfer: Cr, toXYZ: Ja, fromXYZ: Qa, luminanceCoefficients: e, workingColorSpaceConfig: { unpackColorSpace: Le }, outputColorSpaceConfig: { drawingBufferColorSpace: Le } }, [Le]: { primaries: t, whitePoint: n, transfer: Qt, toXYZ: Ja, fromXYZ: Qa, luminanceCoefficients: e, outputColorSpaceConfig: { drawingBufferColorSpace: Le } } }), s;
}
const Yt = Su();
function Cn(s) {
  return s < 0.04045 ? s * 0.0773993808 : Math.pow(s * 0.9478672986 + 0.0521327014, 2.4);
}
function $i(s) {
  return s < 31308e-7 ? s * 12.92 : 1.055 * Math.pow(s, 0.41666) - 0.055;
}
let Si;
class Eu {
  static getDataURL(t) {
    if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u") return t.src;
    let e;
    if (t instanceof HTMLCanvasElement) e = t;
    else {
      Si === void 0 && (Si = Pr("canvas")), Si.width = t.width, Si.height = t.height;
      const n = Si.getContext("2d");
      t instanceof ImageData ? n.putImageData(t, 0, 0) : n.drawImage(t, 0, 0, t.width, t.height), e = Si;
    }
    return e.toDataURL("image/png");
  }
  static sRGBToLinear(t) {
    if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
      const e = Pr("canvas");
      e.width = t.width, e.height = t.height;
      const n = e.getContext("2d");
      n.drawImage(t, 0, 0, t.width, t.height);
      const i = n.getImageData(0, 0, t.width, t.height), r = i.data;
      for (let o = 0; o < r.length; o++) r[o] = Cn(r[o] / 255) * 255;
      return n.putImageData(i, 0, 0), e;
    } else if (t.data) {
      const e = t.data.slice(0);
      for (let n = 0; n < e.length; n++) e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(Cn(e[n] / 255) * 255) : e[n] = Cn(e[n]);
      return { data: e, width: t.width, height: t.height };
    } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
  }
}
let bu = 0;
class Ca {
  constructor(t = null) {
    this.isSource = true, Object.defineProperty(this, "id", { value: bu++ }), this.uuid = An(), this.data = t, this.dataReady = true, this.version = 0;
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
        for (let o = 0, a = i.length; o < a; o++) i[o].isDataTexture ? r.push(Hr(i[o].image)) : r.push(Hr(i[o]));
      } else r = Hr(i);
      n.url = r;
    }
    return e || (t.images[this.uuid] = n), n;
  }
}
function Hr(s) {
  return typeof HTMLImageElement < "u" && s instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && s instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && s instanceof ImageBitmap ? Eu.getDataURL(s) : s.data ? { data: Array.from(s.data), width: s.width, height: s.height, type: s.data.constructor.name } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let Tu = 0;
class De extends _i {
  constructor(t = De.DEFAULT_IMAGE, e = De.DEFAULT_MAPPING, n = hi, i = hi, r = dn, o = ui, a = sn, l = Rn, c = De.DEFAULT_ANISOTROPY, h = Vn) {
    super(), this.isTexture = true, Object.defineProperty(this, "id", { value: Tu++ }), this.uuid = An(), this.name = "", this.source = new Ca(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = i, this.magFilter = r, this.minFilter = o, this.anisotropy = c, this.format = a, this.internalFormat = null, this.type = l, this.offset = new Et(0, 0), this.repeat = new Et(1, 1), this.center = new Et(0, 0), this.rotation = 0, this.matrixAutoUpdate = true, this.matrix = new Dt(), this.generateMipmaps = true, this.premultiplyAlpha = false, this.flipY = true, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = false, this.pmremVersion = 0;
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
    if (this.mapping !== vc) return t;
    if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1) switch (this.wrapS) {
      case Ho:
        t.x = t.x - Math.floor(t.x);
        break;
      case hi:
        t.x = t.x < 0 ? 0 : 1;
        break;
      case Vo:
        Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
        break;
    }
    if (t.y < 0 || t.y > 1) switch (this.wrapT) {
      case Ho:
        t.y = t.y - Math.floor(t.y);
        break;
      case hi:
        t.y = t.y < 0 ? 0 : 1;
        break;
      case Vo:
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
De.DEFAULT_IMAGE = null;
De.DEFAULT_MAPPING = vc;
De.DEFAULT_ANISOTROPY = 1;
class ie {
  constructor(t = 0, e = 0, n = 0, i = 1) {
    ie.prototype.isVector4 = true, this.x = t, this.y = e, this.z = n, this.w = i;
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
    const l = t.elements, c = l[0], h = l[4], u = l[8], d = l[1], p = l[5], g = l[9], _ = l[2], m = l[6], f = l[10];
    if (Math.abs(h - d) < 0.01 && Math.abs(u - _) < 0.01 && Math.abs(g - m) < 0.01) {
      if (Math.abs(h + d) < 0.1 && Math.abs(u + _) < 0.1 && Math.abs(g + m) < 0.1 && Math.abs(c + p + f - 3) < 0.1) return this.set(1, 0, 0, 0), this;
      e = Math.PI;
      const T = (c + 1) / 2, S = (p + 1) / 2, I = (f + 1) / 2, w = (h + d) / 4, C = (u + _) / 4, N = (g + m) / 4;
      return T > S && T > I ? T < 0.01 ? (n = 0, i = 0.707106781, r = 0.707106781) : (n = Math.sqrt(T), i = w / n, r = C / n) : S > I ? S < 0.01 ? (n = 0.707106781, i = 0, r = 0.707106781) : (i = Math.sqrt(S), n = w / i, r = N / i) : I < 0.01 ? (n = 0.707106781, i = 0.707106781, r = 0) : (r = Math.sqrt(I), n = C / r, i = N / r), this.set(n, i, r, e), this;
    }
    let A = Math.sqrt((m - g) * (m - g) + (u - _) * (u - _) + (d - h) * (d - h));
    return Math.abs(A) < 1e-3 && (A = 1), this.x = (m - g) / A, this.y = (u - _) / A, this.z = (d - h) / A, this.w = Math.acos((c + p + f - 1) / 2), this;
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
    return this.x = Ft(this.x, t.x, e.x), this.y = Ft(this.y, t.y, e.y), this.z = Ft(this.z, t.z, e.z), this.w = Ft(this.w, t.w, e.w), this;
  }
  clampScalar(t, e) {
    return this.x = Ft(this.x, t, e), this.y = Ft(this.y, t, e), this.z = Ft(this.z, t, e), this.w = Ft(this.w, t, e), this;
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ft(n, t, e));
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
class wu extends _i {
  constructor(t = 1, e = 1, n = {}) {
    super(), this.isRenderTarget = true, this.width = t, this.height = e, this.depth = 1, this.scissor = new ie(0, 0, t, e), this.scissorTest = false, this.viewport = new ie(0, 0, t, e);
    const i = { width: t, height: e, depth: 1 };
    n = Object.assign({ generateMipmaps: false, internalFormat: null, minFilter: dn, depthBuffer: true, stencilBuffer: false, resolveDepthBuffer: true, resolveStencilBuffer: true, depthTexture: null, samples: 0, count: 1 }, n);
    const r = new De(i, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
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
      this.textures[e].source = new Ca(i);
    }
    return this.depthBuffer = t.depthBuffer, this.stencilBuffer = t.stencilBuffer, this.resolveDepthBuffer = t.resolveDepthBuffer, this.resolveStencilBuffer = t.resolveStencilBuffer, t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()), this.samples = t.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class mi extends wu {
  constructor(t = 1, e = 1, n = {}) {
    super(t, e, n), this.isWebGLRenderTarget = true;
  }
}
class Dc extends De {
  constructor(t = null, e = 1, n = 1, i = 1) {
    super(null), this.isDataArrayTexture = true, this.image = { data: t, width: e, height: n, depth: i }, this.magFilter = rn, this.minFilter = rn, this.wrapR = hi, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(t) {
    this.layerUpdates.add(t);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class Au extends De {
  constructor(t = null, e = 1, n = 1, i = 1) {
    super(null), this.isData3DTexture = true, this.image = { data: t, width: e, height: n, depth: i }, this.magFilter = rn, this.minFilter = rn, this.wrapR = hi, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1;
  }
}
class Pn {
  constructor(t = 0, e = 0, n = 0, i = 1) {
    this.isQuaternion = true, this._x = t, this._y = e, this._z = n, this._w = i;
  }
  static slerpFlat(t, e, n, i, r, o, a) {
    let l = n[i + 0], c = n[i + 1], h = n[i + 2], u = n[i + 3];
    const d = r[o + 0], p = r[o + 1], g = r[o + 2], _ = r[o + 3];
    if (a === 0) {
      t[e + 0] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = u;
      return;
    }
    if (a === 1) {
      t[e + 0] = d, t[e + 1] = p, t[e + 2] = g, t[e + 3] = _;
      return;
    }
    if (u !== _ || l !== d || c !== p || h !== g) {
      let m = 1 - a;
      const f = l * d + c * p + h * g + u * _, A = f >= 0 ? 1 : -1, T = 1 - f * f;
      if (T > Number.EPSILON) {
        const I = Math.sqrt(T), w = Math.atan2(I, f * A);
        m = Math.sin(m * w) / I, a = Math.sin(a * w) / I;
      }
      const S = a * A;
      if (l = l * m + d * S, c = c * m + p * S, h = h * m + g * S, u = u * m + _ * S, m === 1 - a) {
        const I = 1 / Math.sqrt(l * l + c * c + h * h + u * u);
        l *= I, c *= I, h *= I, u *= I;
      }
    }
    t[e] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = u;
  }
  static multiplyQuaternionsFlat(t, e, n, i, r, o) {
    const a = n[i], l = n[i + 1], c = n[i + 2], h = n[i + 3], u = r[o], d = r[o + 1], p = r[o + 2], g = r[o + 3];
    return t[e] = a * g + h * u + l * p - c * d, t[e + 1] = l * g + h * d + c * u - a * p, t[e + 2] = c * g + h * p + a * d - l * u, t[e + 3] = h * g - a * u - l * d - c * p, t;
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
    const n = t._x, i = t._y, r = t._z, o = t._order, a = Math.cos, l = Math.sin, c = a(n / 2), h = a(i / 2), u = a(r / 2), d = l(n / 2), p = l(i / 2), g = l(r / 2);
    switch (o) {
      case "XYZ":
        this._x = d * h * u + c * p * g, this._y = c * p * u - d * h * g, this._z = c * h * g + d * p * u, this._w = c * h * u - d * p * g;
        break;
      case "YXZ":
        this._x = d * h * u + c * p * g, this._y = c * p * u - d * h * g, this._z = c * h * g - d * p * u, this._w = c * h * u + d * p * g;
        break;
      case "ZXY":
        this._x = d * h * u - c * p * g, this._y = c * p * u + d * h * g, this._z = c * h * g + d * p * u, this._w = c * h * u - d * p * g;
        break;
      case "ZYX":
        this._x = d * h * u - c * p * g, this._y = c * p * u + d * h * g, this._z = c * h * g - d * p * u, this._w = c * h * u + d * p * g;
        break;
      case "YZX":
        this._x = d * h * u + c * p * g, this._y = c * p * u + d * h * g, this._z = c * h * g - d * p * u, this._w = c * h * u - d * p * g;
        break;
      case "XZY":
        this._x = d * h * u - c * p * g, this._y = c * p * u - d * h * g, this._z = c * h * g + d * p * u, this._w = c * h * u + d * p * g;
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
      const p = 0.5 / Math.sqrt(d + 1);
      this._w = 0.25 / p, this._x = (h - l) * p, this._y = (r - c) * p, this._z = (o - i) * p;
    } else if (n > a && n > u) {
      const p = 2 * Math.sqrt(1 + n - a - u);
      this._w = (h - l) / p, this._x = 0.25 * p, this._y = (i + o) / p, this._z = (r + c) / p;
    } else if (a > u) {
      const p = 2 * Math.sqrt(1 + a - n - u);
      this._w = (r - c) / p, this._x = (i + o) / p, this._y = 0.25 * p, this._z = (l + h) / p;
    } else {
      const p = 2 * Math.sqrt(1 + u - n - a);
      this._w = (o - i) / p, this._x = (r + c) / p, this._y = (l + h) / p, this._z = 0.25 * p;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(t, e) {
    let n = t.dot(e) + 1;
    return n < Number.EPSILON ? (n = 0, Math.abs(t.x) > Math.abs(t.z) ? (this._x = -t.y, this._y = t.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -t.z, this._z = t.y, this._w = n)) : (this._x = t.y * e.z - t.z * e.y, this._y = t.z * e.x - t.x * e.z, this._z = t.x * e.y - t.y * e.x, this._w = n), this.normalize();
  }
  angleTo(t) {
    return 2 * Math.acos(Math.abs(Ft(this.dot(t), -1, 1)));
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
      const p = 1 - e;
      return this._w = p * o + e * this._w, this._x = p * n + e * this._x, this._y = p * i + e * this._y, this._z = p * r + e * this._z, this.normalize(), this;
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
    return this.applyQuaternion(tl.setFromEuler(t));
  }
  applyAxisAngle(t, e) {
    return this.applyQuaternion(tl.setFromAxisAngle(t, e));
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
    return this.x = Ft(this.x, t.x, e.x), this.y = Ft(this.y, t.y, e.y), this.z = Ft(this.z, t.z, e.z), this;
  }
  clampScalar(t, e) {
    return this.x = Ft(this.x, t, e), this.y = Ft(this.y, t, e), this.z = Ft(this.z, t, e), this;
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ft(n, t, e));
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
    return Vr.copy(this).projectOnVector(t), this.sub(Vr);
  }
  reflect(t) {
    return this.sub(Vr.copy(t).multiplyScalar(2 * this.dot(t)));
  }
  angleTo(t) {
    const e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0) return Math.PI / 2;
    const n = this.dot(t) / e;
    return Math.acos(Ft(n, -1, 1));
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
const Vr = new b(), tl = new Pn();
class Un {
  constructor(t = new b(1 / 0, 1 / 0, 1 / 0), e = new b(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = true, this.min = t, this.max = e;
  }
  set(t, e) {
    return this.min.copy(t), this.max.copy(e), this;
  }
  setFromArray(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e += 3) this.expandByPoint(Qe.fromArray(t, e));
    return this;
  }
  setFromBufferAttribute(t) {
    this.makeEmpty();
    for (let e = 0, n = t.count; e < n; e++) this.expandByPoint(Qe.fromBufferAttribute(t, e));
    return this;
  }
  setFromPoints(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e++) this.expandByPoint(t[e]);
    return this;
  }
  setFromCenterAndSize(t, e) {
    const n = Qe.copy(e).multiplyScalar(0.5);
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
      if (e === true && r !== void 0 && t.isInstancedMesh !== true) for (let o = 0, a = r.count; o < a; o++) t.isMesh === true ? t.getVertexPosition(o, Qe) : Qe.fromBufferAttribute(r, o), Qe.applyMatrix4(t.matrixWorld), this.expandByPoint(Qe);
      else t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), Fs.copy(t.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Fs.copy(n.boundingBox)), Fs.applyMatrix4(t.matrixWorld), this.union(Fs);
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
    return this.clampPoint(t.center, Qe), Qe.distanceToSquared(t.center) <= t.radius * t.radius;
  }
  intersectsPlane(t) {
    let e, n;
    return t.normal.x > 0 ? (e = t.normal.x * this.min.x, n = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, n = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, n += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, n += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, n += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, n += t.normal.z * this.min.z), e <= -t.constant && n >= -t.constant;
  }
  intersectsTriangle(t) {
    if (this.isEmpty()) return false;
    this.getCenter(cs), Os.subVectors(this.max, cs), Ei.subVectors(t.a, cs), bi.subVectors(t.b, cs), Ti.subVectors(t.c, cs), In.subVectors(bi, Ei), Nn.subVectors(Ti, bi), Jn.subVectors(Ei, Ti);
    let e = [0, -In.z, In.y, 0, -Nn.z, Nn.y, 0, -Jn.z, Jn.y, In.z, 0, -In.x, Nn.z, 0, -Nn.x, Jn.z, 0, -Jn.x, -In.y, In.x, 0, -Nn.y, Nn.x, 0, -Jn.y, Jn.x, 0];
    return !Gr(e, Ei, bi, Ti, Os) || (e = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Gr(e, Ei, bi, Ti, Os)) ? false : (Bs.crossVectors(In, Nn), e = [Bs.x, Bs.y, Bs.z], Gr(e, Ei, bi, Ti, Os));
  }
  clampPoint(t, e) {
    return e.copy(t).clamp(this.min, this.max);
  }
  distanceToPoint(t) {
    return this.clampPoint(t, Qe).distanceTo(t);
  }
  getBoundingSphere(t) {
    return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(Qe).length() * 0.5), t;
  }
  intersect(t) {
    return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(t) {
    return this.min.min(t.min), this.max.max(t.max), this;
  }
  applyMatrix4(t) {
    return this.isEmpty() ? this : (gn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), gn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), gn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), gn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), gn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), gn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), gn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), gn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(gn), this);
  }
  translate(t) {
    return this.min.add(t), this.max.add(t), this;
  }
  equals(t) {
    return t.min.equals(this.min) && t.max.equals(this.max);
  }
}
const gn = [new b(), new b(), new b(), new b(), new b(), new b(), new b(), new b()], Qe = new b(), Fs = new Un(), Ei = new b(), bi = new b(), Ti = new b(), In = new b(), Nn = new b(), Jn = new b(), cs = new b(), Os = new b(), Bs = new b(), Qn = new b();
function Gr(s, t, e, n, i) {
  for (let r = 0, o = s.length - 3; r <= o; r += 3) {
    Qn.fromArray(s, r);
    const a = i.x * Math.abs(Qn.x) + i.y * Math.abs(Qn.y) + i.z * Math.abs(Qn.z), l = t.dot(Qn), c = e.dot(Qn), h = n.dot(Qn);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > a) return false;
  }
  return true;
}
const Cu = new Un(), hs = new b(), Wr = new b();
class qn {
  constructor(t = new b(), e = -1) {
    this.isSphere = true, this.center = t, this.radius = e;
  }
  set(t, e) {
    return this.center.copy(t), this.radius = e, this;
  }
  setFromPoints(t, e) {
    const n = this.center;
    e !== void 0 ? n.copy(e) : Cu.setFromPoints(t).getCenter(n);
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
    hs.subVectors(t, this.center);
    const e = hs.lengthSq();
    if (e > this.radius * this.radius) {
      const n = Math.sqrt(e), i = (n - this.radius) * 0.5;
      this.center.addScaledVector(hs, i / n), this.radius += i;
    }
    return this;
  }
  union(t) {
    return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === true ? this.radius = Math.max(this.radius, t.radius) : (Wr.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(hs.copy(t.center).add(Wr)), this.expandByPoint(hs.copy(t.center).sub(Wr))), this);
  }
  equals(t) {
    return t.center.equals(this.center) && t.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const _n = new b(), Xr = new b(), zs = new b(), Fn = new b(), Yr = new b(), ks = new b(), qr = new b();
class Rs {
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
    return this.origin.copy(this.at(t, _n)), this;
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
    const e = _n.subVectors(t, this.origin).dot(this.direction);
    return e < 0 ? this.origin.distanceToSquared(t) : (_n.copy(this.origin).addScaledVector(this.direction, e), _n.distanceToSquared(t));
  }
  distanceSqToSegment(t, e, n, i) {
    Xr.copy(t).add(e).multiplyScalar(0.5), zs.copy(e).sub(t).normalize(), Fn.copy(this.origin).sub(Xr);
    const r = t.distanceTo(e) * 0.5, o = -this.direction.dot(zs), a = Fn.dot(this.direction), l = -Fn.dot(zs), c = Fn.lengthSq(), h = Math.abs(1 - o * o);
    let u, d, p, g;
    if (h > 0) if (u = o * l - a, d = o * a - l, g = r * h, u >= 0) if (d >= -g) if (d <= g) {
      const _ = 1 / h;
      u *= _, d *= _, p = u * (u + o * d + 2 * a) + d * (o * u + d + 2 * l) + c;
    } else d = r, u = Math.max(0, -(o * d + a)), p = -u * u + d * (d + 2 * l) + c;
    else d = -r, u = Math.max(0, -(o * d + a)), p = -u * u + d * (d + 2 * l) + c;
    else d <= -g ? (u = Math.max(0, -(-o * r + a)), d = u > 0 ? -r : Math.min(Math.max(-r, -l), r), p = -u * u + d * (d + 2 * l) + c) : d <= g ? (u = 0, d = Math.min(Math.max(-r, -l), r), p = d * (d + 2 * l) + c) : (u = Math.max(0, -(o * r + a)), d = u > 0 ? r : Math.min(Math.max(-r, -l), r), p = -u * u + d * (d + 2 * l) + c);
    else d = o > 0 ? -r : r, u = Math.max(0, -(o * d + a)), p = -u * u + d * (d + 2 * l) + c;
    return n && n.copy(this.origin).addScaledVector(this.direction, u), i && i.copy(Xr).addScaledVector(zs, d), p;
  }
  intersectSphere(t, e) {
    _n.subVectors(t.center, this.origin);
    const n = _n.dot(this.direction), i = _n.dot(_n) - n * n, r = t.radius * t.radius;
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
    return this.intersectBox(t, _n) !== null;
  }
  intersectTriangle(t, e, n, i, r) {
    Yr.subVectors(e, t), ks.subVectors(n, t), qr.crossVectors(Yr, ks);
    let o = this.direction.dot(qr), a;
    if (o > 0) {
      if (i) return null;
      a = 1;
    } else if (o < 0) a = -1, o = -o;
    else return null;
    Fn.subVectors(this.origin, t);
    const l = a * this.direction.dot(ks.crossVectors(Fn, ks));
    if (l < 0) return null;
    const c = a * this.direction.dot(Yr.cross(Fn));
    if (c < 0 || l + c > o) return null;
    const h = -a * Fn.dot(qr);
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
class Kt {
  constructor(t, e, n, i, r, o, a, l, c, h, u, d, p, g, _, m) {
    Kt.prototype.isMatrix4 = true, this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], t !== void 0 && this.set(t, e, n, i, r, o, a, l, c, h, u, d, p, g, _, m);
  }
  set(t, e, n, i, r, o, a, l, c, h, u, d, p, g, _, m) {
    const f = this.elements;
    return f[0] = t, f[4] = e, f[8] = n, f[12] = i, f[1] = r, f[5] = o, f[9] = a, f[13] = l, f[2] = c, f[6] = h, f[10] = u, f[14] = d, f[3] = p, f[7] = g, f[11] = _, f[15] = m, this;
  }
  identity() {
    return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  clone() {
    return new Kt().fromArray(this.elements);
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
    const e = this.elements, n = t.elements, i = 1 / wi.setFromMatrixColumn(t, 0).length(), r = 1 / wi.setFromMatrixColumn(t, 1).length(), o = 1 / wi.setFromMatrixColumn(t, 2).length();
    return e[0] = n[0] * i, e[1] = n[1] * i, e[2] = n[2] * i, e[3] = 0, e[4] = n[4] * r, e[5] = n[5] * r, e[6] = n[6] * r, e[7] = 0, e[8] = n[8] * o, e[9] = n[9] * o, e[10] = n[10] * o, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  makeRotationFromEuler(t) {
    const e = this.elements, n = t.x, i = t.y, r = t.z, o = Math.cos(n), a = Math.sin(n), l = Math.cos(i), c = Math.sin(i), h = Math.cos(r), u = Math.sin(r);
    if (t.order === "XYZ") {
      const d = o * h, p = o * u, g = a * h, _ = a * u;
      e[0] = l * h, e[4] = -l * u, e[8] = c, e[1] = p + g * c, e[5] = d - _ * c, e[9] = -a * l, e[2] = _ - d * c, e[6] = g + p * c, e[10] = o * l;
    } else if (t.order === "YXZ") {
      const d = l * h, p = l * u, g = c * h, _ = c * u;
      e[0] = d + _ * a, e[4] = g * a - p, e[8] = o * c, e[1] = o * u, e[5] = o * h, e[9] = -a, e[2] = p * a - g, e[6] = _ + d * a, e[10] = o * l;
    } else if (t.order === "ZXY") {
      const d = l * h, p = l * u, g = c * h, _ = c * u;
      e[0] = d - _ * a, e[4] = -o * u, e[8] = g + p * a, e[1] = p + g * a, e[5] = o * h, e[9] = _ - d * a, e[2] = -o * c, e[6] = a, e[10] = o * l;
    } else if (t.order === "ZYX") {
      const d = o * h, p = o * u, g = a * h, _ = a * u;
      e[0] = l * h, e[4] = g * c - p, e[8] = d * c + _, e[1] = l * u, e[5] = _ * c + d, e[9] = p * c - g, e[2] = -c, e[6] = a * l, e[10] = o * l;
    } else if (t.order === "YZX") {
      const d = o * l, p = o * c, g = a * l, _ = a * c;
      e[0] = l * h, e[4] = _ - d * u, e[8] = g * u + p, e[1] = u, e[5] = o * h, e[9] = -a * h, e[2] = -c * h, e[6] = p * u + g, e[10] = d - _ * u;
    } else if (t.order === "XZY") {
      const d = o * l, p = o * c, g = a * l, _ = a * c;
      e[0] = l * h, e[4] = -u, e[8] = c * h, e[1] = d * u + _, e[5] = o * h, e[9] = p * u - g, e[2] = g * u - p, e[6] = a * h, e[10] = _ * u + d;
    }
    return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  makeRotationFromQuaternion(t) {
    return this.compose(Ru, t, Pu);
  }
  lookAt(t, e, n) {
    const i = this.elements;
    return ke.subVectors(t, e), ke.lengthSq() === 0 && (ke.z = 1), ke.normalize(), On.crossVectors(n, ke), On.lengthSq() === 0 && (Math.abs(n.z) === 1 ? ke.x += 1e-4 : ke.z += 1e-4, ke.normalize(), On.crossVectors(n, ke)), On.normalize(), Hs.crossVectors(ke, On), i[0] = On.x, i[4] = Hs.x, i[8] = ke.x, i[1] = On.y, i[5] = Hs.y, i[9] = ke.y, i[2] = On.z, i[6] = Hs.z, i[10] = ke.z, this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    const n = t.elements, i = e.elements, r = this.elements, o = n[0], a = n[4], l = n[8], c = n[12], h = n[1], u = n[5], d = n[9], p = n[13], g = n[2], _ = n[6], m = n[10], f = n[14], A = n[3], T = n[7], S = n[11], I = n[15], w = i[0], C = i[4], N = i[8], M = i[12], y = i[1], P = i[5], V = i[9], z = i[13], X = i[2], K = i[6], G = i[10], Q = i[14], H = i[3], rt = i[7], ut = i[11], vt = i[15];
    return r[0] = o * w + a * y + l * X + c * H, r[4] = o * C + a * P + l * K + c * rt, r[8] = o * N + a * V + l * G + c * ut, r[12] = o * M + a * z + l * Q + c * vt, r[1] = h * w + u * y + d * X + p * H, r[5] = h * C + u * P + d * K + p * rt, r[9] = h * N + u * V + d * G + p * ut, r[13] = h * M + u * z + d * Q + p * vt, r[2] = g * w + _ * y + m * X + f * H, r[6] = g * C + _ * P + m * K + f * rt, r[10] = g * N + _ * V + m * G + f * ut, r[14] = g * M + _ * z + m * Q + f * vt, r[3] = A * w + T * y + S * X + I * H, r[7] = A * C + T * P + S * K + I * rt, r[11] = A * N + T * V + S * G + I * ut, r[15] = A * M + T * z + S * Q + I * vt, this;
  }
  multiplyScalar(t) {
    const e = this.elements;
    return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this;
  }
  determinant() {
    const t = this.elements, e = t[0], n = t[4], i = t[8], r = t[12], o = t[1], a = t[5], l = t[9], c = t[13], h = t[2], u = t[6], d = t[10], p = t[14], g = t[3], _ = t[7], m = t[11], f = t[15];
    return g * (+r * l * u - i * c * u - r * a * d + n * c * d + i * a * p - n * l * p) + _ * (+e * l * p - e * c * d + r * o * d - i * o * p + i * c * h - r * l * h) + m * (+e * c * u - e * a * p - r * o * u + n * o * p + r * a * h - n * c * h) + f * (-i * a * h - e * l * u + e * a * d + i * o * u - n * o * d + n * l * h);
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
    const t = this.elements, e = t[0], n = t[1], i = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8], u = t[9], d = t[10], p = t[11], g = t[12], _ = t[13], m = t[14], f = t[15], A = u * m * c - _ * d * c + _ * l * p - a * m * p - u * l * f + a * d * f, T = g * d * c - h * m * c - g * l * p + o * m * p + h * l * f - o * d * f, S = h * _ * c - g * u * c + g * a * p - o * _ * p - h * a * f + o * u * f, I = g * u * l - h * _ * l - g * a * d + o * _ * d + h * a * m - o * u * m, w = e * A + n * T + i * S + r * I;
    if (w === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const C = 1 / w;
    return t[0] = A * C, t[1] = (_ * d * r - u * m * r - _ * i * p + n * m * p + u * i * f - n * d * f) * C, t[2] = (a * m * r - _ * l * r + _ * i * c - n * m * c - a * i * f + n * l * f) * C, t[3] = (u * l * r - a * d * r - u * i * c + n * d * c + a * i * p - n * l * p) * C, t[4] = T * C, t[5] = (h * m * r - g * d * r + g * i * p - e * m * p - h * i * f + e * d * f) * C, t[6] = (g * l * r - o * m * r - g * i * c + e * m * c + o * i * f - e * l * f) * C, t[7] = (o * d * r - h * l * r + h * i * c - e * d * c - o * i * p + e * l * p) * C, t[8] = S * C, t[9] = (g * u * r - h * _ * r - g * n * p + e * _ * p + h * n * f - e * u * f) * C, t[10] = (o * _ * r - g * a * r + g * n * c - e * _ * c - o * n * f + e * a * f) * C, t[11] = (h * a * r - o * u * r - h * n * c + e * u * c + o * n * p - e * a * p) * C, t[12] = I * C, t[13] = (h * _ * i - g * u * i + g * n * d - e * _ * d - h * n * m + e * u * m) * C, t[14] = (g * a * i - o * _ * i - g * n * l + e * _ * l + o * n * m - e * a * m) * C, t[15] = (o * u * i - h * a * i + h * n * l - e * u * l - o * n * d + e * a * d) * C, this;
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
    const i = this.elements, r = e._x, o = e._y, a = e._z, l = e._w, c = r + r, h = o + o, u = a + a, d = r * c, p = r * h, g = r * u, _ = o * h, m = o * u, f = a * u, A = l * c, T = l * h, S = l * u, I = n.x, w = n.y, C = n.z;
    return i[0] = (1 - (_ + f)) * I, i[1] = (p + S) * I, i[2] = (g - T) * I, i[3] = 0, i[4] = (p - S) * w, i[5] = (1 - (d + f)) * w, i[6] = (m + A) * w, i[7] = 0, i[8] = (g + T) * C, i[9] = (m - A) * C, i[10] = (1 - (d + _)) * C, i[11] = 0, i[12] = t.x, i[13] = t.y, i[14] = t.z, i[15] = 1, this;
  }
  decompose(t, e, n) {
    const i = this.elements;
    let r = wi.set(i[0], i[1], i[2]).length();
    const o = wi.set(i[4], i[5], i[6]).length(), a = wi.set(i[8], i[9], i[10]).length();
    this.determinant() < 0 && (r = -r), t.x = i[12], t.y = i[13], t.z = i[14], tn.copy(this);
    const c = 1 / r, h = 1 / o, u = 1 / a;
    return tn.elements[0] *= c, tn.elements[1] *= c, tn.elements[2] *= c, tn.elements[4] *= h, tn.elements[5] *= h, tn.elements[6] *= h, tn.elements[8] *= u, tn.elements[9] *= u, tn.elements[10] *= u, e.setFromRotationMatrix(tn), n.x = r, n.y = o, n.z = a, this;
  }
  makePerspective(t, e, n, i, r, o, a = Tn) {
    const l = this.elements, c = 2 * r / (e - t), h = 2 * r / (n - i), u = (e + t) / (e - t), d = (n + i) / (n - i);
    let p, g;
    if (a === Tn) p = -(o + r) / (o - r), g = -2 * o * r / (o - r);
    else if (a === Rr) p = -o / (o - r), g = -o * r / (o - r);
    else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + a);
    return l[0] = c, l[4] = 0, l[8] = u, l[12] = 0, l[1] = 0, l[5] = h, l[9] = d, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = p, l[14] = g, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
  }
  makeOrthographic(t, e, n, i, r, o, a = Tn) {
    const l = this.elements, c = 1 / (e - t), h = 1 / (n - i), u = 1 / (o - r), d = (e + t) * c, p = (n + i) * h;
    let g, _;
    if (a === Tn) g = (o + r) * u, _ = -2 * u;
    else if (a === Rr) g = r * u, _ = -1 * u;
    else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + a);
    return l[0] = 2 * c, l[4] = 0, l[8] = 0, l[12] = -d, l[1] = 0, l[5] = 2 * h, l[9] = 0, l[13] = -p, l[2] = 0, l[6] = 0, l[10] = _, l[14] = -g, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
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
const wi = new b(), tn = new Kt(), Ru = new b(0, 0, 0), Pu = new b(1, 1, 1), On = new b(), Hs = new b(), ke = new b(), el = new Kt(), nl = new Pn();
class Ln {
  constructor(t = 0, e = 0, n = 0, i = Ln.DEFAULT_ORDER) {
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
    const i = t.elements, r = i[0], o = i[4], a = i[8], l = i[1], c = i[5], h = i[9], u = i[2], d = i[6], p = i[10];
    switch (e) {
      case "XYZ":
        this._y = Math.asin(Ft(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(-h, p), this._z = Math.atan2(-o, r)) : (this._x = Math.atan2(d, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Ft(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(a, p), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-u, r), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Ft(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-u, p), this._z = Math.atan2(-o, c)) : (this._y = 0, this._z = Math.atan2(l, r));
        break;
      case "ZYX":
        this._y = Math.asin(-Ft(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._x = Math.atan2(d, p), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-o, c));
        break;
      case "YZX":
        this._z = Math.asin(Ft(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-u, r)) : (this._x = 0, this._y = Math.atan2(a, p));
        break;
      case "XZY":
        this._z = Math.asin(-Ft(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(a, r)) : (this._x = Math.atan2(-h, p), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + e);
    }
    return this._order = e, n === true && this._onChangeCallback(), this;
  }
  setFromQuaternion(t, e, n) {
    return el.makeRotationFromQuaternion(t), this.setFromRotationMatrix(el, e, n);
  }
  setFromVector3(t, e = this._order) {
    return this.set(t.x, t.y, t.z, e);
  }
  reorder(t) {
    return nl.setFromEuler(this), this.setFromQuaternion(nl, t);
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
Ln.DEFAULT_ORDER = "XYZ";
class Ra {
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
let Lu = 0;
const il = new b(), Ai = new Pn(), xn = new Kt(), Vs = new b(), us = new b(), Du = new b(), Uu = new Pn(), sl = new b(1, 0, 0), rl = new b(0, 1, 0), ol = new b(0, 0, 1), al = { type: "added" }, Iu = { type: "removed" }, Ci = { type: "childadded", child: null }, $r = { type: "childremoved", child: null };
class we extends _i {
  constructor() {
    super(), this.isObject3D = true, Object.defineProperty(this, "id", { value: Lu++ }), this.uuid = An(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = we.DEFAULT_UP.clone();
    const t = new b(), e = new Ln(), n = new Pn(), i = new b(1, 1, 1);
    function r() {
      n.setFromEuler(e, false);
    }
    function o() {
      e.setFromQuaternion(n, void 0, false);
    }
    e._onChange(r), n._onChange(o), Object.defineProperties(this, { position: { configurable: true, enumerable: true, value: t }, rotation: { configurable: true, enumerable: true, value: e }, quaternion: { configurable: true, enumerable: true, value: n }, scale: { configurable: true, enumerable: true, value: i }, modelViewMatrix: { value: new Kt() }, normalMatrix: { value: new Dt() } }), this.matrix = new Kt(), this.matrixWorld = new Kt(), this.matrixAutoUpdate = we.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = we.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = false, this.layers = new Ra(), this.visible = true, this.castShadow = false, this.receiveShadow = false, this.frustumCulled = true, this.renderOrder = 0, this.animations = [], this.userData = {};
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
    return Ai.setFromAxisAngle(t, e), this.quaternion.multiply(Ai), this;
  }
  rotateOnWorldAxis(t, e) {
    return Ai.setFromAxisAngle(t, e), this.quaternion.premultiply(Ai), this;
  }
  rotateX(t) {
    return this.rotateOnAxis(sl, t);
  }
  rotateY(t) {
    return this.rotateOnAxis(rl, t);
  }
  rotateZ(t) {
    return this.rotateOnAxis(ol, t);
  }
  translateOnAxis(t, e) {
    return il.copy(t).applyQuaternion(this.quaternion), this.position.add(il.multiplyScalar(e)), this;
  }
  translateX(t) {
    return this.translateOnAxis(sl, t);
  }
  translateY(t) {
    return this.translateOnAxis(rl, t);
  }
  translateZ(t) {
    return this.translateOnAxis(ol, t);
  }
  localToWorld(t) {
    return this.updateWorldMatrix(true, false), t.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(t) {
    return this.updateWorldMatrix(true, false), t.applyMatrix4(xn.copy(this.matrixWorld).invert());
  }
  lookAt(t, e, n) {
    t.isVector3 ? Vs.copy(t) : Vs.set(t, e, n);
    const i = this.parent;
    this.updateWorldMatrix(true, false), us.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? xn.lookAt(us, Vs, this.up) : xn.lookAt(Vs, us, this.up), this.quaternion.setFromRotationMatrix(xn), i && (xn.extractRotation(i.matrixWorld), Ai.setFromRotationMatrix(xn), this.quaternion.premultiply(Ai.invert()));
  }
  add(t) {
    if (arguments.length > 1) {
      for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
      return this;
    }
    return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(al), Ci.child = t, this.dispatchEvent(Ci), Ci.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
  }
  remove(t) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
      return this;
    }
    const e = this.children.indexOf(t);
    return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(Iu), $r.child = t, this.dispatchEvent($r), $r.child = null), this;
  }
  removeFromParent() {
    const t = this.parent;
    return t !== null && t.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(t) {
    return this.updateWorldMatrix(true, false), xn.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(true, false), xn.multiply(t.parent.matrixWorld)), t.applyMatrix4(xn), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(false, true), t.dispatchEvent(al), Ci.child = t, this.dispatchEvent(Ci), Ci.child = null, this;
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
    return this.updateWorldMatrix(true, false), this.matrixWorld.decompose(us, t, Du), t;
  }
  getWorldScale(t) {
    return this.updateWorldMatrix(true, false), this.matrixWorld.decompose(us, Uu, t), t;
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
      const a = o(t.geometries), l = o(t.materials), c = o(t.textures), h = o(t.images), u = o(t.shapes), d = o(t.skeletons), p = o(t.animations), g = o(t.nodes);
      a.length > 0 && (n.geometries = a), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), u.length > 0 && (n.shapes = u), d.length > 0 && (n.skeletons = d), p.length > 0 && (n.animations = p), g.length > 0 && (n.nodes = g);
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
we.DEFAULT_UP = new b(0, 1, 0);
we.DEFAULT_MATRIX_AUTO_UPDATE = true;
we.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;
const en = new b(), vn = new b(), jr = new b(), yn = new b(), Ri = new b(), Pi = new b(), ll = new b(), Kr = new b(), Zr = new b(), Jr = new b(), Qr = new ie(), to = new ie(), eo = new ie();
class je {
  constructor(t = new b(), e = new b(), n = new b()) {
    this.a = t, this.b = e, this.c = n;
  }
  static getNormal(t, e, n, i) {
    i.subVectors(n, e), en.subVectors(t, e), i.cross(en);
    const r = i.lengthSq();
    return r > 0 ? i.multiplyScalar(1 / Math.sqrt(r)) : i.set(0, 0, 0);
  }
  static getBarycoord(t, e, n, i, r) {
    en.subVectors(i, e), vn.subVectors(n, e), jr.subVectors(t, e);
    const o = en.dot(en), a = en.dot(vn), l = en.dot(jr), c = vn.dot(vn), h = vn.dot(jr), u = o * c - a * a;
    if (u === 0) return r.set(0, 0, 0), null;
    const d = 1 / u, p = (c * l - a * h) * d, g = (o * h - a * l) * d;
    return r.set(1 - p - g, g, p);
  }
  static containsPoint(t, e, n, i) {
    return this.getBarycoord(t, e, n, i, yn) === null ? false : yn.x >= 0 && yn.y >= 0 && yn.x + yn.y <= 1;
  }
  static getInterpolation(t, e, n, i, r, o, a, l) {
    return this.getBarycoord(t, e, n, i, yn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(r, yn.x), l.addScaledVector(o, yn.y), l.addScaledVector(a, yn.z), l);
  }
  static getInterpolatedAttribute(t, e, n, i, r, o) {
    return Qr.setScalar(0), to.setScalar(0), eo.setScalar(0), Qr.fromBufferAttribute(t, e), to.fromBufferAttribute(t, n), eo.fromBufferAttribute(t, i), o.setScalar(0), o.addScaledVector(Qr, r.x), o.addScaledVector(to, r.y), o.addScaledVector(eo, r.z), o;
  }
  static isFrontFacing(t, e, n, i) {
    return en.subVectors(n, e), vn.subVectors(t, e), en.cross(vn).dot(i) < 0;
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
    return en.subVectors(this.c, this.b), vn.subVectors(this.a, this.b), en.cross(vn).length() * 0.5;
  }
  getMidpoint(t) {
    return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(t) {
    return je.getNormal(this.a, this.b, this.c, t);
  }
  getPlane(t) {
    return t.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(t, e) {
    return je.getBarycoord(t, this.a, this.b, this.c, e);
  }
  getInterpolation(t, e, n, i, r) {
    return je.getInterpolation(t, this.a, this.b, this.c, e, n, i, r);
  }
  containsPoint(t) {
    return je.containsPoint(t, this.a, this.b, this.c);
  }
  isFrontFacing(t) {
    return je.isFrontFacing(this.a, this.b, this.c, t);
  }
  intersectsBox(t) {
    return t.intersectsTriangle(this);
  }
  closestPointToPoint(t, e) {
    const n = this.a, i = this.b, r = this.c;
    let o, a;
    Ri.subVectors(i, n), Pi.subVectors(r, n), Kr.subVectors(t, n);
    const l = Ri.dot(Kr), c = Pi.dot(Kr);
    if (l <= 0 && c <= 0) return e.copy(n);
    Zr.subVectors(t, i);
    const h = Ri.dot(Zr), u = Pi.dot(Zr);
    if (h >= 0 && u <= h) return e.copy(i);
    const d = l * u - h * c;
    if (d <= 0 && l >= 0 && h <= 0) return o = l / (l - h), e.copy(n).addScaledVector(Ri, o);
    Jr.subVectors(t, r);
    const p = Ri.dot(Jr), g = Pi.dot(Jr);
    if (g >= 0 && p <= g) return e.copy(r);
    const _ = p * c - l * g;
    if (_ <= 0 && c >= 0 && g <= 0) return a = c / (c - g), e.copy(n).addScaledVector(Pi, a);
    const m = h * g - p * u;
    if (m <= 0 && u - h >= 0 && p - g >= 0) return ll.subVectors(r, i), a = (u - h) / (u - h + (p - g)), e.copy(i).addScaledVector(ll, a);
    const f = 1 / (m + _ + d);
    return o = _ * f, a = d * f, e.copy(n).addScaledVector(Ri, o).addScaledVector(Pi, a);
  }
  equals(t) {
    return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
  }
}
const Uc = { aliceblue: 15792383, antiquewhite: 16444375, aqua: 65535, aquamarine: 8388564, azure: 15794175, beige: 16119260, bisque: 16770244, black: 0, blanchedalmond: 16772045, blue: 255, blueviolet: 9055202, brown: 10824234, burlywood: 14596231, cadetblue: 6266528, chartreuse: 8388352, chocolate: 13789470, coral: 16744272, cornflowerblue: 6591981, cornsilk: 16775388, crimson: 14423100, cyan: 65535, darkblue: 139, darkcyan: 35723, darkgoldenrod: 12092939, darkgray: 11119017, darkgreen: 25600, darkgrey: 11119017, darkkhaki: 12433259, darkmagenta: 9109643, darkolivegreen: 5597999, darkorange: 16747520, darkorchid: 10040012, darkred: 9109504, darksalmon: 15308410, darkseagreen: 9419919, darkslateblue: 4734347, darkslategray: 3100495, darkslategrey: 3100495, darkturquoise: 52945, darkviolet: 9699539, deeppink: 16716947, deepskyblue: 49151, dimgray: 6908265, dimgrey: 6908265, dodgerblue: 2003199, firebrick: 11674146, floralwhite: 16775920, forestgreen: 2263842, fuchsia: 16711935, gainsboro: 14474460, ghostwhite: 16316671, gold: 16766720, goldenrod: 14329120, gray: 8421504, green: 32768, greenyellow: 11403055, grey: 8421504, honeydew: 15794160, hotpink: 16738740, indianred: 13458524, indigo: 4915330, ivory: 16777200, khaki: 15787660, lavender: 15132410, lavenderblush: 16773365, lawngreen: 8190976, lemonchiffon: 16775885, lightblue: 11393254, lightcoral: 15761536, lightcyan: 14745599, lightgoldenrodyellow: 16448210, lightgray: 13882323, lightgreen: 9498256, lightgrey: 13882323, lightpink: 16758465, lightsalmon: 16752762, lightseagreen: 2142890, lightskyblue: 8900346, lightslategray: 7833753, lightslategrey: 7833753, lightsteelblue: 11584734, lightyellow: 16777184, lime: 65280, limegreen: 3329330, linen: 16445670, magenta: 16711935, maroon: 8388608, mediumaquamarine: 6737322, mediumblue: 205, mediumorchid: 12211667, mediumpurple: 9662683, mediumseagreen: 3978097, mediumslateblue: 8087790, mediumspringgreen: 64154, mediumturquoise: 4772300, mediumvioletred: 13047173, midnightblue: 1644912, mintcream: 16121850, mistyrose: 16770273, moccasin: 16770229, navajowhite: 16768685, navy: 128, oldlace: 16643558, olive: 8421376, olivedrab: 7048739, orange: 16753920, orangered: 16729344, orchid: 14315734, palegoldenrod: 15657130, palegreen: 10025880, paleturquoise: 11529966, palevioletred: 14381203, papayawhip: 16773077, peachpuff: 16767673, peru: 13468991, pink: 16761035, plum: 14524637, powderblue: 11591910, purple: 8388736, rebeccapurple: 6697881, red: 16711680, rosybrown: 12357519, royalblue: 4286945, saddlebrown: 9127187, salmon: 16416882, sandybrown: 16032864, seagreen: 3050327, seashell: 16774638, sienna: 10506797, silver: 12632256, skyblue: 8900331, slateblue: 6970061, slategray: 7372944, slategrey: 7372944, snow: 16775930, springgreen: 65407, steelblue: 4620980, tan: 13808780, teal: 32896, thistle: 14204888, tomato: 16737095, turquoise: 4251856, violet: 15631086, wheat: 16113331, white: 16777215, whitesmoke: 16119285, yellow: 16776960, yellowgreen: 10145074 }, Bn = { h: 0, s: 0, l: 0 }, Gs = { h: 0, s: 0, l: 0 };
function no(s, t, e) {
  return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? s + (t - s) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? s + (t - s) * 6 * (2 / 3 - e) : s;
}
class Wt {
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
  setHex(t, e = Le) {
    return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, Yt.toWorkingColorSpace(this, e), this;
  }
  setRGB(t, e, n, i = Yt.workingColorSpace) {
    return this.r = t, this.g = e, this.b = n, Yt.toWorkingColorSpace(this, i), this;
  }
  setHSL(t, e, n, i = Yt.workingColorSpace) {
    if (t = Aa(t, 1), e = Ft(e, 0, 1), n = Ft(n, 0, 1), e === 0) this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + e) : n + e - n * e, o = 2 * n - r;
      this.r = no(o, r, t + 1 / 3), this.g = no(o, r, t), this.b = no(o, r, t - 1 / 3);
    }
    return Yt.toWorkingColorSpace(this, i), this;
  }
  setStyle(t, e = Le) {
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
  setColorName(t, e = Le) {
    const n = Uc[t.toLowerCase()];
    return n !== void 0 ? this.setHex(n, e) : console.warn("THREE.Color: Unknown color " + t), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(t) {
    return this.r = t.r, this.g = t.g, this.b = t.b, this;
  }
  copySRGBToLinear(t) {
    return this.r = Cn(t.r), this.g = Cn(t.g), this.b = Cn(t.b), this;
  }
  copyLinearToSRGB(t) {
    return this.r = $i(t.r), this.g = $i(t.g), this.b = $i(t.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(t = Le) {
    return Yt.fromWorkingColorSpace(Te.copy(this), t), Math.round(Ft(Te.r * 255, 0, 255)) * 65536 + Math.round(Ft(Te.g * 255, 0, 255)) * 256 + Math.round(Ft(Te.b * 255, 0, 255));
  }
  getHexString(t = Le) {
    return ("000000" + this.getHex(t).toString(16)).slice(-6);
  }
  getHSL(t, e = Yt.workingColorSpace) {
    Yt.fromWorkingColorSpace(Te.copy(this), e);
    const n = Te.r, i = Te.g, r = Te.b, o = Math.max(n, i, r), a = Math.min(n, i, r);
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
  getRGB(t, e = Yt.workingColorSpace) {
    return Yt.fromWorkingColorSpace(Te.copy(this), e), t.r = Te.r, t.g = Te.g, t.b = Te.b, t;
  }
  getStyle(t = Le) {
    Yt.fromWorkingColorSpace(Te.copy(this), t);
    const e = Te.r, n = Te.g, i = Te.b;
    return t !== Le ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(e * 255)},${Math.round(n * 255)},${Math.round(i * 255)})`;
  }
  offsetHSL(t, e, n) {
    return this.getHSL(Bn), this.setHSL(Bn.h + t, Bn.s + e, Bn.l + n);
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
    this.getHSL(Bn), t.getHSL(Gs);
    const n = Ts(Bn.h, Gs.h, e), i = Ts(Bn.s, Gs.s, e), r = Ts(Bn.l, Gs.l, e);
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
const Te = new Wt();
Wt.NAMES = Uc;
let Nu = 0;
class xi extends _i {
  constructor() {
    super(), this.isMaterial = true, Object.defineProperty(this, "id", { value: Nu++ }), this.uuid = An(), this.name = "", this.type = "Material", this.blending = Yi, this.side = Yn, this.vertexColors = false, this.opacity = 1, this.transparent = false, this.alphaHash = false, this.blendSrc = Po, this.blendDst = Lo, this.blendEquation = li, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Wt(0, 0, 0), this.blendAlpha = 0, this.depthFunc = ji, this.depthTest = true, this.depthWrite = true, this.stencilWriteMask = 255, this.stencilFunc = $a, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Mi, this.stencilZFail = Mi, this.stencilZPass = Mi, this.stencilWrite = false, this.clippingPlanes = null, this.clipIntersection = false, this.clipShadows = false, this.shadowSide = null, this.colorWrite = true, this.precision = null, this.polygonOffset = false, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = false, this.alphaToCoverage = false, this.premultipliedAlpha = false, this.forceSinglePass = false, this.visible = true, this.toneMapped = true, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(t).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(t).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(t).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(t).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(t).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== Yi && (n.blending = this.blending), this.side !== Yn && (n.side = this.side), this.vertexColors === true && (n.vertexColors = true), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === true && (n.transparent = true), this.blendSrc !== Po && (n.blendSrc = this.blendSrc), this.blendDst !== Lo && (n.blendDst = this.blendDst), this.blendEquation !== li && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== ji && (n.depthFunc = this.depthFunc), this.depthTest === false && (n.depthTest = this.depthTest), this.depthWrite === false && (n.depthWrite = this.depthWrite), this.colorWrite === false && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== $a && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Mi && (n.stencilFail = this.stencilFail), this.stencilZFail !== Mi && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== Mi && (n.stencilZPass = this.stencilZPass), this.stencilWrite === true && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === true && (n.polygonOffset = true), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === true && (n.dithering = true), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === true && (n.alphaHash = true), this.alphaToCoverage === true && (n.alphaToCoverage = true), this.premultipliedAlpha === true && (n.premultipliedAlpha = true), this.forceSinglePass === true && (n.forceSinglePass = true), this.wireframe === true && (n.wireframe = true), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === true && (n.flatShading = true), this.visible === false && (n.visible = false), this.toneMapped === false && (n.toneMapped = false), this.fog === false && (n.fog = false), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
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
class Ps extends xi {
  constructor(t) {
    super(), this.isMeshBasicMaterial = true, this.type = "MeshBasicMaterial", this.color = new Wt(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Ln(), this.combine = xc, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = false, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this;
  }
}
const de = new b(), Ws = new Et();
let Fu = 0;
class oe {
  constructor(t, e, n = false) {
    if (Array.isArray(t)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = true, Object.defineProperty(this, "id", { value: Fu++ }), this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = ma, this.updateRanges = [], this.gpuType = bn, this.version = 0;
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
    if (this.itemSize === 2) for (let e = 0, n = this.count; e < n; e++) Ws.fromBufferAttribute(this, e), Ws.applyMatrix3(t), this.setXY(e, Ws.x, Ws.y);
    else if (this.itemSize === 3) for (let e = 0, n = this.count; e < n; e++) de.fromBufferAttribute(this, e), de.applyMatrix3(t), this.setXYZ(e, de.x, de.y, de.z);
    return this;
  }
  applyMatrix4(t) {
    for (let e = 0, n = this.count; e < n; e++) de.fromBufferAttribute(this, e), de.applyMatrix4(t), this.setXYZ(e, de.x, de.y, de.z);
    return this;
  }
  applyNormalMatrix(t) {
    for (let e = 0, n = this.count; e < n; e++) de.fromBufferAttribute(this, e), de.applyNormalMatrix(t), this.setXYZ(e, de.x, de.y, de.z);
    return this;
  }
  transformDirection(t) {
    for (let e = 0, n = this.count; e < n; e++) de.fromBufferAttribute(this, e), de.transformDirection(t), this.setXYZ(e, de.x, de.y, de.z);
    return this;
  }
  set(t, e = 0) {
    return this.array.set(t, e), this;
  }
  getComponent(t, e) {
    let n = this.array[t * this.itemSize + e];
    return this.normalized && (n = nn(n, this.array)), n;
  }
  setComponent(t, e, n) {
    return this.normalized && (n = Jt(n, this.array)), this.array[t * this.itemSize + e] = n, this;
  }
  getX(t) {
    let e = this.array[t * this.itemSize];
    return this.normalized && (e = nn(e, this.array)), e;
  }
  setX(t, e) {
    return this.normalized && (e = Jt(e, this.array)), this.array[t * this.itemSize] = e, this;
  }
  getY(t) {
    let e = this.array[t * this.itemSize + 1];
    return this.normalized && (e = nn(e, this.array)), e;
  }
  setY(t, e) {
    return this.normalized && (e = Jt(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
  }
  getZ(t) {
    let e = this.array[t * this.itemSize + 2];
    return this.normalized && (e = nn(e, this.array)), e;
  }
  setZ(t, e) {
    return this.normalized && (e = Jt(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
  }
  getW(t) {
    let e = this.array[t * this.itemSize + 3];
    return this.normalized && (e = nn(e, this.array)), e;
  }
  setW(t, e) {
    return this.normalized && (e = Jt(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
  }
  setXY(t, e, n) {
    return t *= this.itemSize, this.normalized && (e = Jt(e, this.array), n = Jt(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this;
  }
  setXYZ(t, e, n, i) {
    return t *= this.itemSize, this.normalized && (e = Jt(e, this.array), n = Jt(n, this.array), i = Jt(i, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = i, this;
  }
  setXYZW(t, e, n, i, r) {
    return t *= this.itemSize, this.normalized && (e = Jt(e, this.array), n = Jt(n, this.array), i = Jt(i, this.array), r = Jt(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = i, this.array[t + 3] = r, this;
  }
  onUpload(t) {
    return this.onUploadCallback = t, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const t = { itemSize: this.itemSize, type: this.array.constructor.name, array: Array.from(this.array), normalized: this.normalized };
    return this.name !== "" && (t.name = this.name), this.usage !== ma && (t.usage = this.usage), t;
  }
}
class Ic extends oe {
  constructor(t, e, n) {
    super(new Uint16Array(t), e, n);
  }
}
class Nc extends oe {
  constructor(t, e, n) {
    super(new Uint32Array(t), e, n);
  }
}
class Oe extends oe {
  constructor(t, e, n) {
    super(new Float32Array(t), e, n);
  }
}
let Ou = 0;
const Xe = new Kt(), io = new we(), Li = new b(), He = new Un(), ds = new Un(), xe = new b();
class me extends _i {
  constructor() {
    super(), this.isBufferGeometry = true, Object.defineProperty(this, "id", { value: Ou++ }), this.uuid = An(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = false, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(t) {
    return Array.isArray(t) ? this.index = new (Lc(t) ? Nc : Ic)(t, 1) : this.index = t, this;
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
    return Xe.makeRotationFromQuaternion(t), this.applyMatrix4(Xe), this;
  }
  rotateX(t) {
    return Xe.makeRotationX(t), this.applyMatrix4(Xe), this;
  }
  rotateY(t) {
    return Xe.makeRotationY(t), this.applyMatrix4(Xe), this;
  }
  rotateZ(t) {
    return Xe.makeRotationZ(t), this.applyMatrix4(Xe), this;
  }
  translate(t, e, n) {
    return Xe.makeTranslation(t, e, n), this.applyMatrix4(Xe), this;
  }
  scale(t, e, n) {
    return Xe.makeScale(t, e, n), this.applyMatrix4(Xe), this;
  }
  lookAt(t) {
    return io.lookAt(t), io.updateMatrix(), this.applyMatrix4(io.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Li).negate(), this.translate(Li.x, Li.y, Li.z), this;
  }
  setFromPoints(t) {
    const e = this.getAttribute("position");
    if (e === void 0) {
      const n = [];
      for (let i = 0, r = t.length; i < r; i++) {
        const o = t[i];
        n.push(o.x, o.y, o.z || 0);
      }
      this.setAttribute("position", new Oe(n, 3));
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
    this.boundingBox === null && (this.boundingBox = new Un());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new b(-1 / 0, -1 / 0, -1 / 0), new b(1 / 0, 1 / 0, 1 / 0));
      return;
    }
    if (t !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(t), e) for (let n = 0, i = e.length; n < i; n++) {
        const r = e[n];
        He.setFromBufferAttribute(r), this.morphTargetsRelative ? (xe.addVectors(this.boundingBox.min, He.min), this.boundingBox.expandByPoint(xe), xe.addVectors(this.boundingBox.max, He.max), this.boundingBox.expandByPoint(xe)) : (this.boundingBox.expandByPoint(He.min), this.boundingBox.expandByPoint(He.max));
      }
    } else this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new qn());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new b(), 1 / 0);
      return;
    }
    if (t) {
      const n = this.boundingSphere.center;
      if (He.setFromBufferAttribute(t), e) for (let r = 0, o = e.length; r < o; r++) {
        const a = e[r];
        ds.setFromBufferAttribute(a), this.morphTargetsRelative ? (xe.addVectors(He.min, ds.min), He.expandByPoint(xe), xe.addVectors(He.max, ds.max), He.expandByPoint(xe)) : (He.expandByPoint(ds.min), He.expandByPoint(ds.max));
      }
      He.getCenter(n);
      let i = 0;
      for (let r = 0, o = t.count; r < o; r++) xe.fromBufferAttribute(t, r), i = Math.max(i, n.distanceToSquared(xe));
      if (e) for (let r = 0, o = e.length; r < o; r++) {
        const a = e[r], l = this.morphTargetsRelative;
        for (let c = 0, h = a.count; c < h; c++) xe.fromBufferAttribute(a, c), l && (Li.fromBufferAttribute(t, c), xe.add(Li)), i = Math.max(i, n.distanceToSquared(xe));
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
    this.hasAttribute("tangent") === false && this.setAttribute("tangent", new oe(new Float32Array(4 * n.count), 4));
    const o = this.getAttribute("tangent"), a = [], l = [];
    for (let N = 0; N < n.count; N++) a[N] = new b(), l[N] = new b();
    const c = new b(), h = new b(), u = new b(), d = new Et(), p = new Et(), g = new Et(), _ = new b(), m = new b();
    function f(N, M, y) {
      c.fromBufferAttribute(n, N), h.fromBufferAttribute(n, M), u.fromBufferAttribute(n, y), d.fromBufferAttribute(r, N), p.fromBufferAttribute(r, M), g.fromBufferAttribute(r, y), h.sub(c), u.sub(c), p.sub(d), g.sub(d);
      const P = 1 / (p.x * g.y - g.x * p.y);
      isFinite(P) && (_.copy(h).multiplyScalar(g.y).addScaledVector(u, -p.y).multiplyScalar(P), m.copy(u).multiplyScalar(p.x).addScaledVector(h, -g.x).multiplyScalar(P), a[N].add(_), a[M].add(_), a[y].add(_), l[N].add(m), l[M].add(m), l[y].add(m));
    }
    let A = this.groups;
    A.length === 0 && (A = [{ start: 0, count: t.count }]);
    for (let N = 0, M = A.length; N < M; ++N) {
      const y = A[N], P = y.start, V = y.count;
      for (let z = P, X = P + V; z < X; z += 3) f(t.getX(z + 0), t.getX(z + 1), t.getX(z + 2));
    }
    const T = new b(), S = new b(), I = new b(), w = new b();
    function C(N) {
      I.fromBufferAttribute(i, N), w.copy(I);
      const M = a[N];
      T.copy(M), T.sub(I.multiplyScalar(I.dot(M))).normalize(), S.crossVectors(w, M);
      const P = S.dot(l[N]) < 0 ? -1 : 1;
      o.setXYZW(N, T.x, T.y, T.z, P);
    }
    for (let N = 0, M = A.length; N < M; ++N) {
      const y = A[N], P = y.start, V = y.count;
      for (let z = P, X = P + V; z < X; z += 3) C(t.getX(z + 0)), C(t.getX(z + 1)), C(t.getX(z + 2));
    }
  }
  computeVertexNormals() {
    const t = this.index, e = this.getAttribute("position");
    if (e !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0) n = new oe(new Float32Array(e.count * 3), 3), this.setAttribute("normal", n);
      else for (let d = 0, p = n.count; d < p; d++) n.setXYZ(d, 0, 0, 0);
      const i = new b(), r = new b(), o = new b(), a = new b(), l = new b(), c = new b(), h = new b(), u = new b();
      if (t) for (let d = 0, p = t.count; d < p; d += 3) {
        const g = t.getX(d + 0), _ = t.getX(d + 1), m = t.getX(d + 2);
        i.fromBufferAttribute(e, g), r.fromBufferAttribute(e, _), o.fromBufferAttribute(e, m), h.subVectors(o, r), u.subVectors(i, r), h.cross(u), a.fromBufferAttribute(n, g), l.fromBufferAttribute(n, _), c.fromBufferAttribute(n, m), a.add(h), l.add(h), c.add(h), n.setXYZ(g, a.x, a.y, a.z), n.setXYZ(_, l.x, l.y, l.z), n.setXYZ(m, c.x, c.y, c.z);
      }
      else for (let d = 0, p = e.count; d < p; d += 3) i.fromBufferAttribute(e, d + 0), r.fromBufferAttribute(e, d + 1), o.fromBufferAttribute(e, d + 2), h.subVectors(o, r), u.subVectors(i, r), h.cross(u), n.setXYZ(d + 0, h.x, h.y, h.z), n.setXYZ(d + 1, h.x, h.y, h.z), n.setXYZ(d + 2, h.x, h.y, h.z);
      this.normalizeNormals(), n.needsUpdate = true;
    }
  }
  normalizeNormals() {
    const t = this.attributes.normal;
    for (let e = 0, n = t.count; e < n; e++) xe.fromBufferAttribute(t, e), xe.normalize(), t.setXYZ(e, xe.x, xe.y, xe.z);
  }
  toNonIndexed() {
    function t(a, l) {
      const c = a.array, h = a.itemSize, u = a.normalized, d = new c.constructor(l.length * h);
      let p = 0, g = 0;
      for (let _ = 0, m = l.length; _ < m; _++) {
        a.isInterleavedBufferAttribute ? p = l[_] * a.data.stride + a.offset : p = l[_] * h;
        for (let f = 0; f < h; f++) d[g++] = c[p++];
      }
      return new oe(d, h, u);
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
        const d = c[h], p = t(d, n);
        l.push(p);
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
        const p = c[u];
        h.push(p.toJSON(t.data));
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
      for (let d = 0, p = u.length; d < p; d++) h.push(u[d].clone(e));
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
const cl = new Kt(), ti = new Rs(), Xs = new qn(), hl = new b(), Ys = new b(), qs = new b(), $s = new b(), so = new b(), js = new b(), ul = new b(), Ks = new b();
class Ke extends we {
  constructor(t = new me(), e = new Ps()) {
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
      js.set(0, 0, 0);
      for (let l = 0, c = r.length; l < c; l++) {
        const h = a[l], u = r[l];
        h !== 0 && (so.fromBufferAttribute(u, t), o ? js.addScaledVector(so, h) : js.addScaledVector(so.sub(e), h));
      }
      e.add(js);
    }
    return e;
  }
  raycast(t, e) {
    const n = this.geometry, i = this.material, r = this.matrixWorld;
    i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Xs.copy(n.boundingSphere), Xs.applyMatrix4(r), ti.copy(t.ray).recast(t.near), !(Xs.containsPoint(ti.origin) === false && (ti.intersectSphere(Xs, hl) === null || ti.origin.distanceToSquared(hl) > (t.far - t.near) ** 2)) && (cl.copy(r).invert(), ti.copy(t.ray).applyMatrix4(cl), !(n.boundingBox !== null && ti.intersectsBox(n.boundingBox) === false) && this._computeIntersections(t, e, ti)));
  }
  _computeIntersections(t, e, n) {
    let i;
    const r = this.geometry, o = this.material, a = r.index, l = r.attributes.position, c = r.attributes.uv, h = r.attributes.uv1, u = r.attributes.normal, d = r.groups, p = r.drawRange;
    if (a !== null) if (Array.isArray(o)) for (let g = 0, _ = d.length; g < _; g++) {
      const m = d[g], f = o[m.materialIndex], A = Math.max(m.start, p.start), T = Math.min(a.count, Math.min(m.start + m.count, p.start + p.count));
      for (let S = A, I = T; S < I; S += 3) {
        const w = a.getX(S), C = a.getX(S + 1), N = a.getX(S + 2);
        i = Zs(this, f, t, n, c, h, u, w, C, N), i && (i.faceIndex = Math.floor(S / 3), i.face.materialIndex = m.materialIndex, e.push(i));
      }
    }
    else {
      const g = Math.max(0, p.start), _ = Math.min(a.count, p.start + p.count);
      for (let m = g, f = _; m < f; m += 3) {
        const A = a.getX(m), T = a.getX(m + 1), S = a.getX(m + 2);
        i = Zs(this, o, t, n, c, h, u, A, T, S), i && (i.faceIndex = Math.floor(m / 3), e.push(i));
      }
    }
    else if (l !== void 0) if (Array.isArray(o)) for (let g = 0, _ = d.length; g < _; g++) {
      const m = d[g], f = o[m.materialIndex], A = Math.max(m.start, p.start), T = Math.min(l.count, Math.min(m.start + m.count, p.start + p.count));
      for (let S = A, I = T; S < I; S += 3) {
        const w = S, C = S + 1, N = S + 2;
        i = Zs(this, f, t, n, c, h, u, w, C, N), i && (i.faceIndex = Math.floor(S / 3), i.face.materialIndex = m.materialIndex, e.push(i));
      }
    }
    else {
      const g = Math.max(0, p.start), _ = Math.min(l.count, p.start + p.count);
      for (let m = g, f = _; m < f; m += 3) {
        const A = m, T = m + 1, S = m + 2;
        i = Zs(this, o, t, n, c, h, u, A, T, S), i && (i.faceIndex = Math.floor(m / 3), e.push(i));
      }
    }
  }
}
function Bu(s, t, e, n, i, r, o, a) {
  let l;
  if (t.side === Fe ? l = n.intersectTriangle(o, r, i, true, a) : l = n.intersectTriangle(i, r, o, t.side === Yn, a), l === null) return null;
  Ks.copy(a), Ks.applyMatrix4(s.matrixWorld);
  const c = e.ray.origin.distanceTo(Ks);
  return c < e.near || c > e.far ? null : { distance: c, point: Ks.clone(), object: s };
}
function Zs(s, t, e, n, i, r, o, a, l, c) {
  s.getVertexPosition(a, Ys), s.getVertexPosition(l, qs), s.getVertexPosition(c, $s);
  const h = Bu(s, t, e, n, Ys, qs, $s, ul);
  if (h) {
    const u = new b();
    je.getBarycoord(ul, Ys, qs, $s, u), i && (h.uv = je.getInterpolatedAttribute(i, a, l, c, u, new Et())), r && (h.uv1 = je.getInterpolatedAttribute(r, a, l, c, u, new Et())), o && (h.normal = je.getInterpolatedAttribute(o, a, l, c, u, new b()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const d = { a, b: l, c, normal: new b(), materialIndex: 0 };
    je.getNormal(Ys, qs, $s, d.normal), h.face = d, h.barycoord = u;
  }
  return h;
}
class Ls extends me {
  constructor(t = 1, e = 1, n = 1, i = 1, r = 1, o = 1) {
    super(), this.type = "BoxGeometry", this.parameters = { width: t, height: e, depth: n, widthSegments: i, heightSegments: r, depthSegments: o };
    const a = this;
    i = Math.floor(i), r = Math.floor(r), o = Math.floor(o);
    const l = [], c = [], h = [], u = [];
    let d = 0, p = 0;
    g("z", "y", "x", -1, -1, n, e, t, o, r, 0), g("z", "y", "x", 1, -1, n, e, -t, o, r, 1), g("x", "z", "y", 1, 1, t, n, e, i, o, 2), g("x", "z", "y", 1, -1, t, n, -e, i, o, 3), g("x", "y", "z", 1, -1, t, e, n, i, r, 4), g("x", "y", "z", -1, -1, t, e, -n, i, r, 5), this.setIndex(l), this.setAttribute("position", new Oe(c, 3)), this.setAttribute("normal", new Oe(h, 3)), this.setAttribute("uv", new Oe(u, 2));
    function g(_, m, f, A, T, S, I, w, C, N, M) {
      const y = S / C, P = I / N, V = S / 2, z = I / 2, X = w / 2, K = C + 1, G = N + 1;
      let Q = 0, H = 0;
      const rt = new b();
      for (let ut = 0; ut < G; ut++) {
        const vt = ut * P - z;
        for (let Ot = 0; Ot < K; Ot++) {
          const ee = Ot * y - V;
          rt[_] = ee * A, rt[m] = vt * T, rt[f] = X, c.push(rt.x, rt.y, rt.z), rt[_] = 0, rt[m] = 0, rt[f] = w > 0 ? 1 : -1, h.push(rt.x, rt.y, rt.z), u.push(Ot / C), u.push(1 - ut / N), Q += 1;
        }
      }
      for (let ut = 0; ut < N; ut++) for (let vt = 0; vt < C; vt++) {
        const Ot = d + vt + K * ut, ee = d + vt + K * (ut + 1), Y = d + (vt + 1) + K * (ut + 1), tt = d + (vt + 1) + K * ut;
        l.push(Ot, ee, tt), l.push(ee, Y, tt), H += 6;
      }
      a.addGroup(p, H, M), p += H, d += Q;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Ls(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
  }
}
function ns(s) {
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
function Pe(s) {
  const t = {};
  for (let e = 0; e < s.length; e++) {
    const n = ns(s[e]);
    for (const i in n) t[i] = n[i];
  }
  return t;
}
function zu(s) {
  const t = [];
  for (let e = 0; e < s.length; e++) t.push(s[e].clone());
  return t;
}
function Fc(s) {
  const t = s.getRenderTarget();
  return t === null ? s.outputColorSpace : t.isXRRenderTarget === true ? t.texture.colorSpace : Yt.workingColorSpace;
}
const Pa = { clone: ns, merge: Pe };
var ku = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Hu = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class pn extends xi {
  constructor(t) {
    super(), this.isShaderMaterial = true, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = ku, this.fragmentShader = Hu, this.linewidth = 1, this.wireframe = false, this.wireframeLinewidth = 1, this.fog = false, this.lights = false, this.clipping = false, this.forceSinglePass = true, this.extensions = { clipCullDistance: false, multiDraw: false }, this.defaultAttributeValues = { color: [1, 1, 1], uv: [0, 0], uv1: [0, 0] }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = false, this.glslVersion = null, t !== void 0 && this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = ns(t.uniforms), this.uniformsGroups = zu(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this;
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
class Oc extends we {
  constructor() {
    super(), this.isCamera = true, this.type = "Camera", this.matrixWorldInverse = new Kt(), this.projectionMatrix = new Kt(), this.projectionMatrixInverse = new Kt(), this.coordinateSystem = Tn;
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
const zn = new b(), dl = new Et(), fl = new Et();
class qe extends Oc {
  constructor(t = 50, e = 1, n = 0.1, i = 2e3) {
    super(), this.isPerspectiveCamera = true, this.type = "PerspectiveCamera", this.fov = t, this.zoom = 1, this.near = n, this.far = i, this.focus = 10, this.aspect = e, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(t, e) {
    return super.copy(t, e), this.fov = t.fov, this.zoom = t.zoom, this.near = t.near, this.far = t.far, this.focus = t.focus, this.aspect = t.aspect, this.view = t.view === null ? null : Object.assign({}, t.view), this.filmGauge = t.filmGauge, this.filmOffset = t.filmOffset, this;
  }
  setFocalLength(t) {
    const e = 0.5 * this.getFilmHeight() / t;
    this.fov = As * 2 * Math.atan(e), this.updateProjectionMatrix();
  }
  getFocalLength() {
    const t = Math.tan(bs * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / t;
  }
  getEffectiveFOV() {
    return As * 2 * Math.atan(Math.tan(bs * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  getViewBounds(t, e, n) {
    zn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), e.set(zn.x, zn.y).multiplyScalar(-t / zn.z), zn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(zn.x, zn.y).multiplyScalar(-t / zn.z);
  }
  getViewSize(t, e) {
    return this.getViewBounds(t, dl, fl), e.subVectors(fl, dl);
  }
  setViewOffset(t, e, n, i, r, o) {
    this.aspect = t / e, this.view === null && (this.view = { enabled: true, fullWidth: 1, fullHeight: 1, offsetX: 0, offsetY: 0, width: 1, height: 1 }), this.view.enabled = true, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = o, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = false), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const t = this.near;
    let e = t * Math.tan(bs * 0.5 * this.fov) / this.zoom, n = 2 * e, i = this.aspect * n, r = -0.5 * i;
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
const Di = -90, Ui = 1;
class Vu extends we {
  constructor(t, e, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const i = new qe(Di, Ui, t, e);
    i.layers = this.layers, this.add(i);
    const r = new qe(Di, Ui, t, e);
    r.layers = this.layers, this.add(r);
    const o = new qe(Di, Ui, t, e);
    o.layers = this.layers, this.add(o);
    const a = new qe(Di, Ui, t, e);
    a.layers = this.layers, this.add(a);
    const l = new qe(Di, Ui, t, e);
    l.layers = this.layers, this.add(l);
    const c = new qe(Di, Ui, t, e);
    c.layers = this.layers, this.add(c);
  }
  updateCoordinateSystem() {
    const t = this.coordinateSystem, e = this.children.concat(), [n, i, r, o, a, l] = e;
    for (const c of e) this.remove(c);
    if (t === Tn) n.up.set(0, 1, 0), n.lookAt(1, 0, 0), i.up.set(0, 1, 0), i.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), o.up.set(0, 0, 1), o.lookAt(0, -1, 0), a.up.set(0, 1, 0), a.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (t === Rr) n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), i.up.set(0, -1, 0), i.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), o.up.set(0, 0, -1), o.lookAt(0, -1, 0), a.up.set(0, -1, 0), a.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
    else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + t);
    for (const c of e) this.add(c), c.updateMatrixWorld();
  }
  update(t, e) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: i } = this;
    this.coordinateSystem !== t.coordinateSystem && (this.coordinateSystem = t.coordinateSystem, this.updateCoordinateSystem());
    const [r, o, a, l, c, h] = this.children, u = t.getRenderTarget(), d = t.getActiveCubeFace(), p = t.getActiveMipmapLevel(), g = t.xr.enabled;
    t.xr.enabled = false;
    const _ = n.texture.generateMipmaps;
    n.texture.generateMipmaps = false, t.setRenderTarget(n, 0, i), t.render(e, r), t.setRenderTarget(n, 1, i), t.render(e, o), t.setRenderTarget(n, 2, i), t.render(e, a), t.setRenderTarget(n, 3, i), t.render(e, l), t.setRenderTarget(n, 4, i), t.render(e, c), n.texture.generateMipmaps = _, t.setRenderTarget(n, 5, i), t.render(e, h), t.setRenderTarget(u, d, p), t.xr.enabled = g, n.texture.needsPMREMUpdate = true;
  }
}
class Bc extends De {
  constructor(t, e, n, i, r, o, a, l, c, h) {
    t = t !== void 0 ? t : [], e = e !== void 0 ? e : Ki, super(t, e, n, i, r, o, a, l, c, h), this.isCubeTexture = true, this.flipY = false;
  }
  get images() {
    return this.image;
  }
  set images(t) {
    this.image = t;
  }
}
class Gu extends mi {
  constructor(t = 1, e = {}) {
    super(t, t, e), this.isWebGLCubeRenderTarget = true;
    const n = { width: t, height: t, depth: 1 }, i = [n, n, n, n, n, n];
    this.texture = new Bc(i, e.mapping, e.wrapS, e.wrapT, e.magFilter, e.minFilter, e.format, e.type, e.anisotropy, e.colorSpace), this.texture.isRenderTargetTexture = true, this.texture.generateMipmaps = e.generateMipmaps !== void 0 ? e.generateMipmaps : false, this.texture.minFilter = e.minFilter !== void 0 ? e.minFilter : dn;
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
			` }, i = new Ls(5, 5, 5), r = new pn({ name: "CubemapFromEquirect", uniforms: ns(n.uniforms), vertexShader: n.vertexShader, fragmentShader: n.fragmentShader, side: Fe, blending: Wn });
    r.uniforms.tEquirect.value = e;
    const o = new Ke(i, r), a = e.minFilter;
    return e.minFilter === ui && (e.minFilter = dn), new Vu(1, 10, this).update(t, o), e.minFilter = a, o.geometry.dispose(), o.material.dispose(), this;
  }
  clear(t, e, n, i) {
    const r = t.getRenderTarget();
    for (let o = 0; o < 6; o++) t.setRenderTarget(this, o), t.clear(e, n, i);
    t.setRenderTarget(r);
  }
}
class di extends we {
  constructor() {
    super(), this.isGroup = true, this.type = "Group";
  }
}
const Wu = { type: "move" };
class ro {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new di(), this._hand.matrixAutoUpdate = false, this._hand.visible = false, this._hand.joints = {}, this._hand.inputState = { pinching: false }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new di(), this._targetRay.matrixAutoUpdate = false, this._targetRay.visible = false, this._targetRay.hasLinearVelocity = false, this._targetRay.linearVelocity = new b(), this._targetRay.hasAngularVelocity = false, this._targetRay.angularVelocity = new b()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new di(), this._grip.matrixAutoUpdate = false, this._grip.visible = false, this._grip.hasLinearVelocity = false, this._grip.linearVelocity = new b(), this._grip.hasAngularVelocity = false, this._grip.angularVelocity = new b()), this._grip;
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
          const m = e.getJointPose(_, n), f = this._getHandJoint(c, _);
          m !== null && (f.matrix.fromArray(m.transform.matrix), f.matrix.decompose(f.position, f.rotation, f.scale), f.matrixWorldNeedsUpdate = true, f.jointRadius = m.radius), f.visible = m !== null;
        }
        const h = c.joints["index-finger-tip"], u = c.joints["thumb-tip"], d = h.position.distanceTo(u.position), p = 0.02, g = 5e-3;
        c.inputState.pinching && d > p + g ? (c.inputState.pinching = false, this.dispatchEvent({ type: "pinchend", handedness: t.handedness, target: this })) : !c.inputState.pinching && d <= p - g && (c.inputState.pinching = true, this.dispatchEvent({ type: "pinchstart", handedness: t.handedness, target: this }));
      } else l !== null && t.gripSpace && (r = e.getPose(t.gripSpace, n), r !== null && (l.matrix.fromArray(r.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = true, r.linearVelocity ? (l.hasLinearVelocity = true, l.linearVelocity.copy(r.linearVelocity)) : l.hasLinearVelocity = false, r.angularVelocity ? (l.hasAngularVelocity = true, l.angularVelocity.copy(r.angularVelocity)) : l.hasAngularVelocity = false));
      a !== null && (i = e.getPose(t.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (a.matrix.fromArray(i.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), a.matrixWorldNeedsUpdate = true, i.linearVelocity ? (a.hasLinearVelocity = true, a.linearVelocity.copy(i.linearVelocity)) : a.hasLinearVelocity = false, i.angularVelocity ? (a.hasAngularVelocity = true, a.angularVelocity.copy(i.angularVelocity)) : a.hasAngularVelocity = false, this.dispatchEvent(Wu)));
    }
    return a !== null && (a.visible = i !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = o !== null), this;
  }
  _getHandJoint(t, e) {
    if (t.joints[e.jointName] === void 0) {
      const n = new di();
      n.matrixAutoUpdate = false, n.visible = false, t.joints[e.jointName] = n, t.add(n);
    }
    return t.joints[e.jointName];
  }
}
class Xu extends we {
  constructor() {
    super(), this.isScene = true, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Ln(), this.environmentIntensity = 1, this.environmentRotation = new Ln(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(t, e) {
    return super.copy(t, e), t.background !== null && (this.background = t.background.clone()), t.environment !== null && (this.environment = t.environment.clone()), t.fog !== null && (this.fog = t.fog.clone()), this.backgroundBlurriness = t.backgroundBlurriness, this.backgroundIntensity = t.backgroundIntensity, this.backgroundRotation.copy(t.backgroundRotation), this.environmentIntensity = t.environmentIntensity, this.environmentRotation.copy(t.environmentRotation), t.overrideMaterial !== null && (this.overrideMaterial = t.overrideMaterial.clone()), this.matrixAutoUpdate = t.matrixAutoUpdate, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.fog !== null && (e.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (e.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (e.object.backgroundIntensity = this.backgroundIntensity), e.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (e.object.environmentIntensity = this.environmentIntensity), e.object.environmentRotation = this.environmentRotation.toArray(), e;
  }
}
class zc {
  constructor(t, e) {
    this.isInterleavedBuffer = true, this.array = t, this.stride = e, this.count = t !== void 0 ? t.length / e : 0, this.usage = ma, this.updateRanges = [], this.version = 0, this.uuid = An();
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
    t.arrayBuffers === void 0 && (t.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = An()), t.arrayBuffers[this.array.buffer._uuid] === void 0 && (t.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
    const e = new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]), n = new this.constructor(e, this.stride);
    return n.setUsage(this.usage), n;
  }
  onUpload(t) {
    return this.onUploadCallback = t, this;
  }
  toJSON(t) {
    return t.arrayBuffers === void 0 && (t.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = An()), t.arrayBuffers[this.array.buffer._uuid] === void 0 && (t.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), { uuid: this.uuid, buffer: this.array.buffer._uuid, type: this.array.constructor.name, stride: this.stride };
  }
}
const Re = new b();
class fn {
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
    for (let e = 0, n = this.data.count; e < n; e++) Re.fromBufferAttribute(this, e), Re.applyMatrix4(t), this.setXYZ(e, Re.x, Re.y, Re.z);
    return this;
  }
  applyNormalMatrix(t) {
    for (let e = 0, n = this.count; e < n; e++) Re.fromBufferAttribute(this, e), Re.applyNormalMatrix(t), this.setXYZ(e, Re.x, Re.y, Re.z);
    return this;
  }
  transformDirection(t) {
    for (let e = 0, n = this.count; e < n; e++) Re.fromBufferAttribute(this, e), Re.transformDirection(t), this.setXYZ(e, Re.x, Re.y, Re.z);
    return this;
  }
  getComponent(t, e) {
    let n = this.array[t * this.data.stride + this.offset + e];
    return this.normalized && (n = nn(n, this.array)), n;
  }
  setComponent(t, e, n) {
    return this.normalized && (n = Jt(n, this.array)), this.data.array[t * this.data.stride + this.offset + e] = n, this;
  }
  setX(t, e) {
    return this.normalized && (e = Jt(e, this.array)), this.data.array[t * this.data.stride + this.offset] = e, this;
  }
  setY(t, e) {
    return this.normalized && (e = Jt(e, this.array)), this.data.array[t * this.data.stride + this.offset + 1] = e, this;
  }
  setZ(t, e) {
    return this.normalized && (e = Jt(e, this.array)), this.data.array[t * this.data.stride + this.offset + 2] = e, this;
  }
  setW(t, e) {
    return this.normalized && (e = Jt(e, this.array)), this.data.array[t * this.data.stride + this.offset + 3] = e, this;
  }
  getX(t) {
    let e = this.data.array[t * this.data.stride + this.offset];
    return this.normalized && (e = nn(e, this.array)), e;
  }
  getY(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 1];
    return this.normalized && (e = nn(e, this.array)), e;
  }
  getZ(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 2];
    return this.normalized && (e = nn(e, this.array)), e;
  }
  getW(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 3];
    return this.normalized && (e = nn(e, this.array)), e;
  }
  setXY(t, e, n) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = Jt(e, this.array), n = Jt(n, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = n, this;
  }
  setXYZ(t, e, n, i) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = Jt(e, this.array), n = Jt(n, this.array), i = Jt(i, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = n, this.data.array[t + 2] = i, this;
  }
  setXYZW(t, e, n, i, r) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = Jt(e, this.array), n = Jt(n, this.array), i = Jt(i, this.array), r = Jt(r, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = n, this.data.array[t + 2] = i, this.data.array[t + 3] = r, this;
  }
  clone(t) {
    if (t === void 0) {
      console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
      const e = [];
      for (let n = 0; n < this.count; n++) {
        const i = n * this.data.stride + this.offset;
        for (let r = 0; r < this.itemSize; r++) e.push(this.data.array[i + r]);
      }
      return new oe(new this.array.constructor(e), this.itemSize, this.normalized);
    } else return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.clone(t)), new fn(t.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
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
class kc extends xi {
  constructor(t) {
    super(), this.isSpriteMaterial = true, this.type = "SpriteMaterial", this.color = new Wt(16777215), this.map = null, this.alphaMap = null, this.rotation = 0, this.sizeAttenuation = true, this.transparent = true, this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.rotation = t.rotation, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
  }
}
let Ii;
const fs = new b(), Ni = new b(), Fi = new b(), Oi = new Et(), ps = new Et(), Hc = new Kt(), Js = new b(), ms = new b(), Qs = new b(), pl = new Et(), oo = new Et(), ml = new Et();
class Yu extends we {
  constructor(t = new kc()) {
    if (super(), this.isSprite = true, this.type = "Sprite", Ii === void 0) {
      Ii = new me();
      const e = new Float32Array([-0.5, -0.5, 0, 0, 0, 0.5, -0.5, 0, 1, 0, 0.5, 0.5, 0, 1, 1, -0.5, 0.5, 0, 0, 1]), n = new zc(e, 5);
      Ii.setIndex([0, 1, 2, 0, 2, 3]), Ii.setAttribute("position", new fn(n, 3, 0, false)), Ii.setAttribute("uv", new fn(n, 2, 3, false));
    }
    this.geometry = Ii, this.material = t, this.center = new Et(0.5, 0.5);
  }
  raycast(t, e) {
    t.camera === null && console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'), Ni.setFromMatrixScale(this.matrixWorld), Hc.copy(t.camera.matrixWorld), this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse, this.matrixWorld), Fi.setFromMatrixPosition(this.modelViewMatrix), t.camera.isPerspectiveCamera && this.material.sizeAttenuation === false && Ni.multiplyScalar(-Fi.z);
    const n = this.material.rotation;
    let i, r;
    n !== 0 && (r = Math.cos(n), i = Math.sin(n));
    const o = this.center;
    tr(Js.set(-0.5, -0.5, 0), Fi, o, Ni, i, r), tr(ms.set(0.5, -0.5, 0), Fi, o, Ni, i, r), tr(Qs.set(0.5, 0.5, 0), Fi, o, Ni, i, r), pl.set(0, 0), oo.set(1, 0), ml.set(1, 1);
    let a = t.ray.intersectTriangle(Js, ms, Qs, false, fs);
    if (a === null && (tr(ms.set(-0.5, 0.5, 0), Fi, o, Ni, i, r), oo.set(0, 1), a = t.ray.intersectTriangle(Js, Qs, ms, false, fs), a === null)) return;
    const l = t.ray.origin.distanceTo(fs);
    l < t.near || l > t.far || e.push({ distance: l, point: fs.clone(), uv: je.getInterpolation(fs, Js, ms, Qs, pl, oo, ml, new Et()), face: null, object: this });
  }
  copy(t, e) {
    return super.copy(t, e), t.center !== void 0 && this.center.copy(t.center), this.material = t.material, this;
  }
}
function tr(s, t, e, n, i, r) {
  Oi.subVectors(s, e).addScalar(0.5).multiply(n), i !== void 0 ? (ps.x = r * Oi.x - i * Oi.y, ps.y = i * Oi.x + r * Oi.y) : ps.copy(Oi), s.copy(t), s.x += ps.x, s.y += ps.y, s.applyMatrix4(Hc);
}
const ao = new b(), qu = new b(), $u = new Dt();
class En {
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
    const i = ao.subVectors(n, e).cross(qu.subVectors(t, e)).normalize();
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
    const n = t.delta(ao), i = this.normal.dot(n);
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
    const n = e || $u.getNormalMatrix(t), i = this.coplanarPoint(ao).applyMatrix4(t), r = this.normal.applyMatrix3(n).normalize();
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
const ei = new qn(), er = new b();
class Vc {
  constructor(t = new En(), e = new En(), n = new En(), i = new En(), r = new En(), o = new En()) {
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
  setFromProjectionMatrix(t, e = Tn) {
    const n = this.planes, i = t.elements, r = i[0], o = i[1], a = i[2], l = i[3], c = i[4], h = i[5], u = i[6], d = i[7], p = i[8], g = i[9], _ = i[10], m = i[11], f = i[12], A = i[13], T = i[14], S = i[15];
    if (n[0].setComponents(l - r, d - c, m - p, S - f).normalize(), n[1].setComponents(l + r, d + c, m + p, S + f).normalize(), n[2].setComponents(l + o, d + h, m + g, S + A).normalize(), n[3].setComponents(l - o, d - h, m - g, S - A).normalize(), n[4].setComponents(l - a, d - u, m - _, S - T).normalize(), e === Tn) n[5].setComponents(l + a, d + u, m + _, S + T).normalize();
    else if (e === Rr) n[5].setComponents(a, u, _, T).normalize();
    else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + e);
    return this;
  }
  intersectsObject(t) {
    if (t.boundingSphere !== void 0) t.boundingSphere === null && t.computeBoundingSphere(), ei.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
    else {
      const e = t.geometry;
      e.boundingSphere === null && e.computeBoundingSphere(), ei.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
    }
    return this.intersectsSphere(ei);
  }
  intersectsSprite(t) {
    return ei.center.set(0, 0, 0), ei.radius = 0.7071067811865476, ei.applyMatrix4(t.matrixWorld), this.intersectsSphere(ei);
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
      if (er.x = i.normal.x > 0 ? t.max.x : t.min.x, er.y = i.normal.y > 0 ? t.max.y : t.min.y, er.z = i.normal.z > 0 ? t.max.z : t.min.z, i.distanceToPoint(er) < 0) return false;
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
class is extends xi {
  constructor(t) {
    super(), this.isLineBasicMaterial = true, this.type = "LineBasicMaterial", this.color = new Wt(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
  }
}
const Lr = new b(), Dr = new b(), gl = new Kt(), gs = new Rs(), nr = new qn(), lo = new b(), _l = new b();
class Gc extends we {
  constructor(t = new me(), e = new is()) {
    super(), this.isLine = true, this.type = "Line", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  computeLineDistances() {
    const t = this.geometry;
    if (t.index === null) {
      const e = t.attributes.position, n = [0];
      for (let i = 1, r = e.count; i < r; i++) Lr.fromBufferAttribute(e, i - 1), Dr.fromBufferAttribute(e, i), n[i] = n[i - 1], n[i] += Lr.distanceTo(Dr);
      t.setAttribute("lineDistance", new Oe(n, 1));
    } else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(t, e) {
    const n = this.geometry, i = this.matrixWorld, r = t.params.Line.threshold, o = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), nr.copy(n.boundingSphere), nr.applyMatrix4(i), nr.radius += r, t.ray.intersectsSphere(nr) === false) return;
    gl.copy(i).invert(), gs.copy(t.ray).applyMatrix4(gl);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = a * a, c = this.isLineSegments ? 2 : 1, h = n.index, d = n.attributes.position;
    if (h !== null) {
      const p = Math.max(0, o.start), g = Math.min(h.count, o.start + o.count);
      for (let _ = p, m = g - 1; _ < m; _ += c) {
        const f = h.getX(_), A = h.getX(_ + 1), T = ir(this, t, gs, l, f, A, _);
        T && e.push(T);
      }
      if (this.isLineLoop) {
        const _ = h.getX(g - 1), m = h.getX(p), f = ir(this, t, gs, l, _, m, g - 1);
        f && e.push(f);
      }
    } else {
      const p = Math.max(0, o.start), g = Math.min(d.count, o.start + o.count);
      for (let _ = p, m = g - 1; _ < m; _ += c) {
        const f = ir(this, t, gs, l, _, _ + 1, _);
        f && e.push(f);
      }
      if (this.isLineLoop) {
        const _ = ir(this, t, gs, l, g - 1, p, g - 1);
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
function ir(s, t, e, n, i, r, o) {
  const a = s.geometry.attributes.position;
  if (Lr.fromBufferAttribute(a, i), Dr.fromBufferAttribute(a, r), e.distanceSqToSegment(Lr, Dr, lo, _l) > n) return;
  lo.applyMatrix4(s.matrixWorld);
  const c = t.ray.origin.distanceTo(lo);
  if (!(c < t.near || c > t.far)) return { distance: c, point: _l.clone().applyMatrix4(s.matrixWorld), index: o, face: null, faceIndex: null, barycoord: null, object: s };
}
const xl = new b(), vl = new b();
class La extends Gc {
  constructor(t, e) {
    super(t, e), this.isLineSegments = true, this.type = "LineSegments";
  }
  computeLineDistances() {
    const t = this.geometry;
    if (t.index === null) {
      const e = t.attributes.position, n = [];
      for (let i = 0, r = e.count; i < r; i += 2) xl.fromBufferAttribute(e, i), vl.fromBufferAttribute(e, i + 1), n[i] = i === 0 ? 0 : n[i - 1], n[i + 1] = n[i] + xl.distanceTo(vl);
      t.setAttribute("lineDistance", new Oe(n, 1));
    } else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class ju extends xi {
  constructor(t) {
    super(), this.isPointsMaterial = true, this.type = "PointsMaterial", this.color = new Wt(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = true, this.fog = true, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.size = t.size, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
  }
}
const yl = new Kt(), ga = new Rs(), sr = new qn(), rr = new b();
class Ku extends we {
  constructor(t = new me(), e = new ju()) {
    super(), this.isPoints = true, this.type = "Points", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  raycast(t, e) {
    const n = this.geometry, i = this.matrixWorld, r = t.params.Points.threshold, o = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), sr.copy(n.boundingSphere), sr.applyMatrix4(i), sr.radius += r, t.ray.intersectsSphere(sr) === false) return;
    yl.copy(i).invert(), ga.copy(t.ray).applyMatrix4(yl);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = a * a, c = n.index, u = n.attributes.position;
    if (c !== null) {
      const d = Math.max(0, o.start), p = Math.min(c.count, o.start + o.count);
      for (let g = d, _ = p; g < _; g++) {
        const m = c.getX(g);
        rr.fromBufferAttribute(u, m), Ml(rr, m, l, i, t, e, this);
      }
    } else {
      const d = Math.max(0, o.start), p = Math.min(u.count, o.start + o.count);
      for (let g = d, _ = p; g < _; g++) rr.fromBufferAttribute(u, g), Ml(rr, g, l, i, t, e, this);
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
function Ml(s, t, e, n, i, r, o) {
  const a = ga.distanceSqToPoint(s);
  if (a < e) {
    const l = new b();
    ga.closestPointToPoint(s, l), l.applyMatrix4(n);
    const c = i.ray.origin.distanceTo(l);
    if (c < i.near || c > i.far) return;
    r.push({ distance: c, distanceToRay: Math.sqrt(a), point: l, index: t, face: null, faceIndex: null, barycoord: null, object: o });
  }
}
class Da extends De {
  constructor(t, e, n, i, r, o, a, l, c) {
    super(t, e, n, i, r, o, a, l, c), this.isCanvasTexture = true, this.needsUpdate = true;
  }
}
class Wc extends De {
  constructor(t, e, n, i, r, o, a, l, c, h = qi) {
    if (h !== qi && h !== Qi) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    n === void 0 && h === qi && (n = pi), n === void 0 && h === Qi && (n = Ji), super(null, i, r, o, a, l, h, n, c), this.isDepthTexture = true, this.image = { width: t, height: e }, this.magFilter = a !== void 0 ? a : rn, this.minFilter = l !== void 0 ? l : rn, this.flipY = false, this.generateMipmaps = false, this.compareFunction = null;
  }
  copy(t) {
    return super.copy(t), this.source = new Ca(Object.assign({}, t.image)), this.compareFunction = t.compareFunction, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e;
  }
}
class ss extends me {
  constructor(t = 1, e = 1, n = 1, i = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = { width: t, height: e, widthSegments: n, heightSegments: i };
    const r = t / 2, o = e / 2, a = Math.floor(n), l = Math.floor(i), c = a + 1, h = l + 1, u = t / a, d = e / l, p = [], g = [], _ = [], m = [];
    for (let f = 0; f < h; f++) {
      const A = f * d - o;
      for (let T = 0; T < c; T++) {
        const S = T * u - r;
        g.push(S, -A, 0), _.push(0, 0, 1), m.push(T / a), m.push(1 - f / l);
      }
    }
    for (let f = 0; f < l; f++) for (let A = 0; A < a; A++) {
      const T = A + c * f, S = A + c * (f + 1), I = A + 1 + c * (f + 1), w = A + 1 + c * f;
      p.push(T, S, w), p.push(S, I, w);
    }
    this.setIndex(p), this.setAttribute("position", new Oe(g, 3)), this.setAttribute("normal", new Oe(_, 3)), this.setAttribute("uv", new Oe(m, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new ss(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}
class Zu extends me {
  constructor(t = null) {
    if (super(), this.type = "WireframeGeometry", this.parameters = { geometry: t }, t !== null) {
      const e = [], n = /* @__PURE__ */ new Set(), i = new b(), r = new b();
      if (t.index !== null) {
        const o = t.attributes.position, a = t.index;
        let l = t.groups;
        l.length === 0 && (l = [{ start: 0, count: a.count, materialIndex: 0 }]);
        for (let c = 0, h = l.length; c < h; ++c) {
          const u = l[c], d = u.start, p = u.count;
          for (let g = d, _ = d + p; g < _; g += 3) for (let m = 0; m < 3; m++) {
            const f = a.getX(g + m), A = a.getX(g + (m + 1) % 3);
            i.fromBufferAttribute(o, f), r.fromBufferAttribute(o, A), Sl(i, r, n) === true && (e.push(i.x, i.y, i.z), e.push(r.x, r.y, r.z));
          }
        }
      } else {
        const o = t.attributes.position;
        for (let a = 0, l = o.count / 3; a < l; a++) for (let c = 0; c < 3; c++) {
          const h = 3 * a + c, u = 3 * a + (c + 1) % 3;
          i.fromBufferAttribute(o, h), r.fromBufferAttribute(o, u), Sl(i, r, n) === true && (e.push(i.x, i.y, i.z), e.push(r.x, r.y, r.z));
        }
      }
      this.setAttribute("position", new Oe(e, 3));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
}
function Sl(s, t, e) {
  const n = `${s.x},${s.y},${s.z}-${t.x},${t.y},${t.z}`, i = `${t.x},${t.y},${t.z}-${s.x},${s.y},${s.z}`;
  return e.has(n) === true || e.has(i) === true ? false : (e.add(n), e.add(i), true);
}
class Ju extends xi {
  constructor(t) {
    super(), this.isMeshDepthMaterial = true, this.type = "MeshDepthMaterial", this.depthPacking = Xh, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = false, this.wireframeLinewidth = 1, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this;
  }
}
class Qu extends xi {
  constructor(t) {
    super(), this.isMeshDistanceMaterial = true, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this;
  }
}
class cn extends Oc {
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
class td extends me {
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
class ed extends qe {
  constructor(t = []) {
    super(), this.isArrayCamera = true, this.cameras = t, this.index = 0;
  }
}
class _a extends zc {
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
const El = new Kt();
class nd {
  constructor(t, e, n = 0, i = 1 / 0) {
    this.ray = new Rs(t, e), this.near = n, this.far = i, this.camera = null, this.layers = new Ra(), this.params = { Mesh: {}, Line: { threshold: 1 }, LOD: {}, Points: { threshold: 1 }, Sprite: {} };
  }
  set(t, e) {
    this.ray.set(t, e);
  }
  setFromCamera(t, e) {
    e.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(t.x, t.y, 0.5).unproject(e).sub(this.ray.origin).normalize(), this.camera = e) : e.isOrthographicCamera ? (this.ray.origin.set(t.x, t.y, (e.near + e.far) / (e.near - e.far)).unproject(e), this.ray.direction.set(0, 0, -1).transformDirection(e.matrixWorld), this.camera = e) : console.error("THREE.Raycaster: Unsupported camera type: " + e.type);
  }
  setFromXRController(t) {
    return El.identity().extractRotation(t.matrixWorld), this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(El), this;
  }
  intersectObject(t, e = true, n = []) {
    return xa(t, this, n, e), n.sort(bl), n;
  }
  intersectObjects(t, e = true, n = []) {
    for (let i = 0, r = t.length; i < r; i++) xa(t[i], this, n, e);
    return n.sort(bl), n;
  }
}
function bl(s, t) {
  return s.distance - t.distance;
}
function xa(s, t, e, n) {
  let i = true;
  if (s.layers.test(t.layers) && s.raycast(t, e) === false && (i = false), i === true && n === true) {
    const r = s.children;
    for (let o = 0, a = r.length; o < a; o++) xa(r[o], t, e, true);
  }
}
class Tl {
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
    return this.phi = Ft(this.phi, 1e-6, Math.PI - 1e-6), this;
  }
  setFromVector3(t) {
    return this.setFromCartesianCoords(t.x, t.y, t.z);
  }
  setFromCartesianCoords(t, e, n) {
    return this.radius = Math.sqrt(t * t + e * e + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(t, n), this.phi = Math.acos(Ft(e / this.radius, -1, 1))), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const wl = new b(), or = new b();
class id {
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
    wl.subVectors(t, this.start), or.subVectors(this.end, this.start);
    const n = or.dot(or);
    let r = or.dot(wl) / n;
    return e && (r = Ft(r, 0, 1)), r;
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
class sd extends La {
  constructor(t = 10, e = 10, n = 4473924, i = 8947848) {
    n = new Wt(n), i = new Wt(i);
    const r = e / 2, o = t / e, a = t / 2, l = [], c = [];
    for (let d = 0, p = 0, g = -a; d <= e; d++, g += o) {
      l.push(-a, 0, g, a, 0, g), l.push(g, 0, -a, g, 0, a);
      const _ = d === r ? n : i;
      _.toArray(c, p), p += 3, _.toArray(c, p), p += 3, _.toArray(c, p), p += 3, _.toArray(c, p), p += 3;
    }
    const h = new me();
    h.setAttribute("position", new Oe(l, 3)), h.setAttribute("color", new Oe(c, 3));
    const u = new is({ vertexColors: true, toneMapped: false });
    super(h, u), this.type = "GridHelper";
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
class rd extends _i {
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
function Al(s, t, e, n) {
  const i = od(n);
  switch (e) {
    case Ec:
      return s * t;
    case Tc:
      return s * t;
    case wc:
      return s * t * 2;
    case Ac:
      return s * t / i.components * i.byteLength;
    case ba:
      return s * t / i.components * i.byteLength;
    case Cc:
      return s * t * 2 / i.components * i.byteLength;
    case Ta:
      return s * t * 2 / i.components * i.byteLength;
    case bc:
      return s * t * 3 / i.components * i.byteLength;
    case sn:
      return s * t * 4 / i.components * i.byteLength;
    case wa:
      return s * t * 4 / i.components * i.byteLength;
    case Mr:
    case Sr:
      return Math.floor((s + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Er:
    case br:
      return Math.floor((s + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Wo:
    case Yo:
      return Math.max(s, 16) * Math.max(t, 8) / 4;
    case Go:
    case Xo:
      return Math.max(s, 8) * Math.max(t, 8) / 2;
    case qo:
    case $o:
      return Math.floor((s + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case jo:
      return Math.floor((s + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Ko:
      return Math.floor((s + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Zo:
      return Math.floor((s + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case Jo:
      return Math.floor((s + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case Qo:
      return Math.floor((s + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case ta:
      return Math.floor((s + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case ea:
      return Math.floor((s + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case na:
      return Math.floor((s + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case ia:
      return Math.floor((s + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case sa:
      return Math.floor((s + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case ra:
      return Math.floor((s + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case oa:
      return Math.floor((s + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case aa:
      return Math.floor((s + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case la:
      return Math.floor((s + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case ca:
      return Math.floor((s + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    case Tr:
    case ha:
    case ua:
      return Math.ceil(s / 4) * Math.ceil(t / 4) * 16;
    case Rc:
    case da:
      return Math.ceil(s / 4) * Math.ceil(t / 4) * 8;
    case fa:
    case pa:
      return Math.ceil(s / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(`Unable to determine texture byte length for ${e} format.`);
}
function od(s) {
  switch (s) {
    case Rn:
    case yc:
      return { byteLength: 1, components: 1 };
    case ws:
    case Mc:
    case Cs:
      return { byteLength: 2, components: 1 };
    case Sa:
    case Ea:
      return { byteLength: 2, components: 4 };
    case pi:
    case Ma:
    case bn:
      return { byteLength: 4, components: 1 };
    case Sc:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${s}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: { revision: ya } }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = ya);
/**
* @license
* Copyright 2010-2025 Three.js Authors
* SPDX-License-Identifier: MIT
*/
function Xc() {
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
function ad(s) {
  const t = /* @__PURE__ */ new WeakMap();
  function e(a, l) {
    const c = a.array, h = a.usage, u = c.byteLength, d = s.createBuffer();
    s.bindBuffer(l, d), s.bufferData(l, c, h), a.onUploadCallback();
    let p;
    if (c instanceof Float32Array) p = s.FLOAT;
    else if (c instanceof Uint16Array) a.isFloat16BufferAttribute ? p = s.HALF_FLOAT : p = s.UNSIGNED_SHORT;
    else if (c instanceof Int16Array) p = s.SHORT;
    else if (c instanceof Uint32Array) p = s.UNSIGNED_INT;
    else if (c instanceof Int32Array) p = s.INT;
    else if (c instanceof Int8Array) p = s.BYTE;
    else if (c instanceof Uint8Array) p = s.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray) p = s.UNSIGNED_BYTE;
    else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return { buffer: d, type: p, bytesPerElement: c.BYTES_PER_ELEMENT, version: a.version, size: u };
  }
  function n(a, l, c) {
    const h = l.array, u = l.updateRanges;
    if (s.bindBuffer(c, a), u.length === 0) s.bufferSubData(c, 0, h);
    else {
      u.sort((p, g) => p.start - g.start);
      let d = 0;
      for (let p = 1; p < u.length; p++) {
        const g = u[d], _ = u[p];
        _.start <= g.start + g.count + 1 ? g.count = Math.max(g.count, _.start + _.count - g.start) : (++d, u[d] = _);
      }
      u.length = d + 1;
      for (let p = 0, g = u.length; p < g; p++) {
        const _ = u[p];
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
var ld = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, cd = `#ifdef USE_ALPHAHASH
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
#endif`, hd = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, ud = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, dd = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, fd = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, pd = `#ifdef USE_AOMAP
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
#endif`, md = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, gd = `#ifdef USE_BATCHING
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
#endif`, _d = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, xd = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, vd = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, yd = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, Md = `#ifdef USE_IRIDESCENCE
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
#endif`, Sd = `#ifdef USE_BUMPMAP
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
#endif`, Ed = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, bd = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, Td = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, wd = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, Ad = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, Cd = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, Rd = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, Pd = `#if defined( USE_COLOR_ALPHA )
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
#endif`, Ld = `#define PI 3.141592653589793
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
} // validated`, Dd = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, Ud = `vec3 transformedNormal = objectNormal;
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
#endif`, Id = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, Nd = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, Fd = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, Od = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, Bd = "gl_FragColor = linearToOutputTexel( gl_FragColor );", zd = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, kd = `#ifdef USE_ENVMAP
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
#endif`, Hd = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Vd = `#ifdef USE_ENVMAP
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
#endif`, Gd = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Wd = `#ifdef USE_ENVMAP
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
#endif`, Xd = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, Yd = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, qd = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, $d = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, jd = `#ifdef USE_GRADIENTMAP
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
}`, Kd = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Zd = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Jd = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Qd = `uniform bool receiveShadow;
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
#endif`, tf = `#ifdef USE_ENVMAP
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
#endif`, ef = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, nf = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, sf = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, rf = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, of = `PhysicalMaterial material;
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
#endif`, af = `struct PhysicalMaterial {
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
}`, lf = `
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
#endif`, cf = `#if defined( RE_IndirectDiffuse )
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
#endif`, hf = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, uf = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, df = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, ff = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, pf = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, mf = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, gf = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, _f = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, xf = `#if defined( USE_POINTS_UV )
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
#endif`, vf = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, yf = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, Mf = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, Sf = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, Ef = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, bf = `#ifdef USE_MORPHTARGETS
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
#endif`, Tf = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, wf = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, Af = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, Cf = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Rf = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Pf = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, Lf = `#ifdef USE_NORMALMAP
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
#endif`, Df = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, Uf = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, If = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, Nf = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, Ff = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, Of = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, Bf = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, zf = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, kf = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, Hf = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, Vf = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Gf = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, Wf = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Xf = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Yf = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, qf = `float getShadowMask() {
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
}`, $f = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, jf = `#ifdef USE_SKINNING
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
#endif`, Kf = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, Zf = `#ifdef USE_SKINNING
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
#endif`, Jf = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Qf = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, tp = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, ep = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, np = `#ifdef USE_TRANSMISSION
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
#endif`, ip = `#ifdef USE_TRANSMISSION
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
#endif`, sp = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, rp = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, op = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, ap = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const lp = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, cp = `uniform sampler2D t2D;
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
}`, hp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, up = `#ifdef ENVMAP_TYPE_CUBE
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
}`, dp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, fp = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, pp = `#include <common>
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
}`, mp = `#if DEPTH_PACKING == 3200
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
}`, gp = `#define DISTANCE
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
}`, _p = `#define DISTANCE
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
}`, xp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, vp = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, yp = `uniform float scale;
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
}`, Mp = `uniform vec3 diffuse;
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
}`, Sp = `#include <common>
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
}`, Ep = `uniform vec3 diffuse;
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
}`, bp = `#define LAMBERT
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
}`, Tp = `#define LAMBERT
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
}`, wp = `#define MATCAP
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
}`, Ap = `#define MATCAP
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
}`, Cp = `#define NORMAL
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
}`, Rp = `#define NORMAL
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
}`, Pp = `#define PHONG
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
}`, Lp = `#define PHONG
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
}`, Dp = `#define STANDARD
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
}`, Up = `#define STANDARD
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
}`, Ip = `#define TOON
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
}`, Np = `#define TOON
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
}`, Fp = `uniform float size;
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
}`, Op = `uniform vec3 diffuse;
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
}`, Bp = `#include <common>
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
}`, zp = `uniform vec3 color;
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
}`, kp = `uniform float rotation;
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
}`, Hp = `uniform vec3 diffuse;
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
}`, Nt = { alphahash_fragment: ld, alphahash_pars_fragment: cd, alphamap_fragment: hd, alphamap_pars_fragment: ud, alphatest_fragment: dd, alphatest_pars_fragment: fd, aomap_fragment: pd, aomap_pars_fragment: md, batching_pars_vertex: gd, batching_vertex: _d, begin_vertex: xd, beginnormal_vertex: vd, bsdfs: yd, iridescence_fragment: Md, bumpmap_pars_fragment: Sd, clipping_planes_fragment: Ed, clipping_planes_pars_fragment: bd, clipping_planes_pars_vertex: Td, clipping_planes_vertex: wd, color_fragment: Ad, color_pars_fragment: Cd, color_pars_vertex: Rd, color_vertex: Pd, common: Ld, cube_uv_reflection_fragment: Dd, defaultnormal_vertex: Ud, displacementmap_pars_vertex: Id, displacementmap_vertex: Nd, emissivemap_fragment: Fd, emissivemap_pars_fragment: Od, colorspace_fragment: Bd, colorspace_pars_fragment: zd, envmap_fragment: kd, envmap_common_pars_fragment: Hd, envmap_pars_fragment: Vd, envmap_pars_vertex: Gd, envmap_physical_pars_fragment: tf, envmap_vertex: Wd, fog_vertex: Xd, fog_pars_vertex: Yd, fog_fragment: qd, fog_pars_fragment: $d, gradientmap_pars_fragment: jd, lightmap_pars_fragment: Kd, lights_lambert_fragment: Zd, lights_lambert_pars_fragment: Jd, lights_pars_begin: Qd, lights_toon_fragment: ef, lights_toon_pars_fragment: nf, lights_phong_fragment: sf, lights_phong_pars_fragment: rf, lights_physical_fragment: of, lights_physical_pars_fragment: af, lights_fragment_begin: lf, lights_fragment_maps: cf, lights_fragment_end: hf, logdepthbuf_fragment: uf, logdepthbuf_pars_fragment: df, logdepthbuf_pars_vertex: ff, logdepthbuf_vertex: pf, map_fragment: mf, map_pars_fragment: gf, map_particle_fragment: _f, map_particle_pars_fragment: xf, metalnessmap_fragment: vf, metalnessmap_pars_fragment: yf, morphinstance_vertex: Mf, morphcolor_vertex: Sf, morphnormal_vertex: Ef, morphtarget_pars_vertex: bf, morphtarget_vertex: Tf, normal_fragment_begin: wf, normal_fragment_maps: Af, normal_pars_fragment: Cf, normal_pars_vertex: Rf, normal_vertex: Pf, normalmap_pars_fragment: Lf, clearcoat_normal_fragment_begin: Df, clearcoat_normal_fragment_maps: Uf, clearcoat_pars_fragment: If, iridescence_pars_fragment: Nf, opaque_fragment: Ff, packing: Of, premultiplied_alpha_fragment: Bf, project_vertex: zf, dithering_fragment: kf, dithering_pars_fragment: Hf, roughnessmap_fragment: Vf, roughnessmap_pars_fragment: Gf, shadowmap_pars_fragment: Wf, shadowmap_pars_vertex: Xf, shadowmap_vertex: Yf, shadowmask_pars_fragment: qf, skinbase_vertex: $f, skinning_pars_vertex: jf, skinning_vertex: Kf, skinnormal_vertex: Zf, specularmap_fragment: Jf, specularmap_pars_fragment: Qf, tonemapping_fragment: tp, tonemapping_pars_fragment: ep, transmission_fragment: np, transmission_pars_fragment: ip, uv_pars_fragment: sp, uv_pars_vertex: rp, uv_vertex: op, worldpos_vertex: ap, background_vert: lp, background_frag: cp, backgroundCube_vert: hp, backgroundCube_frag: up, cube_vert: dp, cube_frag: fp, depth_vert: pp, depth_frag: mp, distanceRGBA_vert: gp, distanceRGBA_frag: _p, equirect_vert: xp, equirect_frag: vp, linedashed_vert: yp, linedashed_frag: Mp, meshbasic_vert: Sp, meshbasic_frag: Ep, meshlambert_vert: bp, meshlambert_frag: Tp, meshmatcap_vert: wp, meshmatcap_frag: Ap, meshnormal_vert: Cp, meshnormal_frag: Rp, meshphong_vert: Pp, meshphong_frag: Lp, meshphysical_vert: Dp, meshphysical_frag: Up, meshtoon_vert: Ip, meshtoon_frag: Np, points_vert: Fp, points_frag: Op, shadow_vert: Bp, shadow_frag: zp, sprite_vert: kp, sprite_frag: Hp }, et = { common: { diffuse: { value: new Wt(16777215) }, opacity: { value: 1 }, map: { value: null }, mapTransform: { value: new Dt() }, alphaMap: { value: null }, alphaMapTransform: { value: new Dt() }, alphaTest: { value: 0 } }, specularmap: { specularMap: { value: null }, specularMapTransform: { value: new Dt() } }, envmap: { envMap: { value: null }, envMapRotation: { value: new Dt() }, flipEnvMap: { value: -1 }, reflectivity: { value: 1 }, ior: { value: 1.5 }, refractionRatio: { value: 0.98 } }, aomap: { aoMap: { value: null }, aoMapIntensity: { value: 1 }, aoMapTransform: { value: new Dt() } }, lightmap: { lightMap: { value: null }, lightMapIntensity: { value: 1 }, lightMapTransform: { value: new Dt() } }, bumpmap: { bumpMap: { value: null }, bumpMapTransform: { value: new Dt() }, bumpScale: { value: 1 } }, normalmap: { normalMap: { value: null }, normalMapTransform: { value: new Dt() }, normalScale: { value: new Et(1, 1) } }, displacementmap: { displacementMap: { value: null }, displacementMapTransform: { value: new Dt() }, displacementScale: { value: 1 }, displacementBias: { value: 0 } }, emissivemap: { emissiveMap: { value: null }, emissiveMapTransform: { value: new Dt() } }, metalnessmap: { metalnessMap: { value: null }, metalnessMapTransform: { value: new Dt() } }, roughnessmap: { roughnessMap: { value: null }, roughnessMapTransform: { value: new Dt() } }, gradientmap: { gradientMap: { value: null } }, fog: { fogDensity: { value: 25e-5 }, fogNear: { value: 1 }, fogFar: { value: 2e3 }, fogColor: { value: new Wt(16777215) } }, lights: { ambientLightColor: { value: [] }, lightProbe: { value: [] }, directionalLights: { value: [], properties: { direction: {}, color: {} } }, directionalLightShadows: { value: [], properties: { shadowIntensity: 1, shadowBias: {}, shadowNormalBias: {}, shadowRadius: {}, shadowMapSize: {} } }, directionalShadowMap: { value: [] }, directionalShadowMatrix: { value: [] }, spotLights: { value: [], properties: { color: {}, position: {}, direction: {}, distance: {}, coneCos: {}, penumbraCos: {}, decay: {} } }, spotLightShadows: { value: [], properties: { shadowIntensity: 1, shadowBias: {}, shadowNormalBias: {}, shadowRadius: {}, shadowMapSize: {} } }, spotLightMap: { value: [] }, spotShadowMap: { value: [] }, spotLightMatrix: { value: [] }, pointLights: { value: [], properties: { color: {}, position: {}, decay: {}, distance: {} } }, pointLightShadows: { value: [], properties: { shadowIntensity: 1, shadowBias: {}, shadowNormalBias: {}, shadowRadius: {}, shadowMapSize: {}, shadowCameraNear: {}, shadowCameraFar: {} } }, pointShadowMap: { value: [] }, pointShadowMatrix: { value: [] }, hemisphereLights: { value: [], properties: { direction: {}, skyColor: {}, groundColor: {} } }, rectAreaLights: { value: [], properties: { color: {}, position: {}, width: {}, height: {} } }, ltc_1: { value: null }, ltc_2: { value: null } }, points: { diffuse: { value: new Wt(16777215) }, opacity: { value: 1 }, size: { value: 1 }, scale: { value: 1 }, map: { value: null }, alphaMap: { value: null }, alphaMapTransform: { value: new Dt() }, alphaTest: { value: 0 }, uvTransform: { value: new Dt() } }, sprite: { diffuse: { value: new Wt(16777215) }, opacity: { value: 1 }, center: { value: new Et(0.5, 0.5) }, rotation: { value: 0 }, map: { value: null }, mapTransform: { value: new Dt() }, alphaMap: { value: null }, alphaMapTransform: { value: new Dt() }, alphaTest: { value: 0 } } }, Ne = { basic: { uniforms: Pe([et.common, et.specularmap, et.envmap, et.aomap, et.lightmap, et.fog]), vertexShader: Nt.meshbasic_vert, fragmentShader: Nt.meshbasic_frag }, lambert: { uniforms: Pe([et.common, et.specularmap, et.envmap, et.aomap, et.lightmap, et.emissivemap, et.bumpmap, et.normalmap, et.displacementmap, et.fog, et.lights, { emissive: { value: new Wt(0) } }]), vertexShader: Nt.meshlambert_vert, fragmentShader: Nt.meshlambert_frag }, phong: { uniforms: Pe([et.common, et.specularmap, et.envmap, et.aomap, et.lightmap, et.emissivemap, et.bumpmap, et.normalmap, et.displacementmap, et.fog, et.lights, { emissive: { value: new Wt(0) }, specular: { value: new Wt(1118481) }, shininess: { value: 30 } }]), vertexShader: Nt.meshphong_vert, fragmentShader: Nt.meshphong_frag }, standard: { uniforms: Pe([et.common, et.envmap, et.aomap, et.lightmap, et.emissivemap, et.bumpmap, et.normalmap, et.displacementmap, et.roughnessmap, et.metalnessmap, et.fog, et.lights, { emissive: { value: new Wt(0) }, roughness: { value: 1 }, metalness: { value: 0 }, envMapIntensity: { value: 1 } }]), vertexShader: Nt.meshphysical_vert, fragmentShader: Nt.meshphysical_frag }, toon: { uniforms: Pe([et.common, et.aomap, et.lightmap, et.emissivemap, et.bumpmap, et.normalmap, et.displacementmap, et.gradientmap, et.fog, et.lights, { emissive: { value: new Wt(0) } }]), vertexShader: Nt.meshtoon_vert, fragmentShader: Nt.meshtoon_frag }, matcap: { uniforms: Pe([et.common, et.bumpmap, et.normalmap, et.displacementmap, et.fog, { matcap: { value: null } }]), vertexShader: Nt.meshmatcap_vert, fragmentShader: Nt.meshmatcap_frag }, points: { uniforms: Pe([et.points, et.fog]), vertexShader: Nt.points_vert, fragmentShader: Nt.points_frag }, dashed: { uniforms: Pe([et.common, et.fog, { scale: { value: 1 }, dashSize: { value: 1 }, totalSize: { value: 2 } }]), vertexShader: Nt.linedashed_vert, fragmentShader: Nt.linedashed_frag }, depth: { uniforms: Pe([et.common, et.displacementmap]), vertexShader: Nt.depth_vert, fragmentShader: Nt.depth_frag }, normal: { uniforms: Pe([et.common, et.bumpmap, et.normalmap, et.displacementmap, { opacity: { value: 1 } }]), vertexShader: Nt.meshnormal_vert, fragmentShader: Nt.meshnormal_frag }, sprite: { uniforms: Pe([et.sprite, et.fog]), vertexShader: Nt.sprite_vert, fragmentShader: Nt.sprite_frag }, background: { uniforms: { uvTransform: { value: new Dt() }, t2D: { value: null }, backgroundIntensity: { value: 1 } }, vertexShader: Nt.background_vert, fragmentShader: Nt.background_frag }, backgroundCube: { uniforms: { envMap: { value: null }, flipEnvMap: { value: -1 }, backgroundBlurriness: { value: 0 }, backgroundIntensity: { value: 1 }, backgroundRotation: { value: new Dt() } }, vertexShader: Nt.backgroundCube_vert, fragmentShader: Nt.backgroundCube_frag }, cube: { uniforms: { tCube: { value: null }, tFlip: { value: -1 }, opacity: { value: 1 } }, vertexShader: Nt.cube_vert, fragmentShader: Nt.cube_frag }, equirect: { uniforms: { tEquirect: { value: null } }, vertexShader: Nt.equirect_vert, fragmentShader: Nt.equirect_frag }, distanceRGBA: { uniforms: Pe([et.common, et.displacementmap, { referencePosition: { value: new b() }, nearDistance: { value: 1 }, farDistance: { value: 1e3 } }]), vertexShader: Nt.distanceRGBA_vert, fragmentShader: Nt.distanceRGBA_frag }, shadow: { uniforms: Pe([et.lights, et.fog, { color: { value: new Wt(0) }, opacity: { value: 1 } }]), vertexShader: Nt.shadow_vert, fragmentShader: Nt.shadow_frag } };
Ne.physical = { uniforms: Pe([Ne.standard.uniforms, { clearcoat: { value: 0 }, clearcoatMap: { value: null }, clearcoatMapTransform: { value: new Dt() }, clearcoatNormalMap: { value: null }, clearcoatNormalMapTransform: { value: new Dt() }, clearcoatNormalScale: { value: new Et(1, 1) }, clearcoatRoughness: { value: 0 }, clearcoatRoughnessMap: { value: null }, clearcoatRoughnessMapTransform: { value: new Dt() }, dispersion: { value: 0 }, iridescence: { value: 0 }, iridescenceMap: { value: null }, iridescenceMapTransform: { value: new Dt() }, iridescenceIOR: { value: 1.3 }, iridescenceThicknessMinimum: { value: 100 }, iridescenceThicknessMaximum: { value: 400 }, iridescenceThicknessMap: { value: null }, iridescenceThicknessMapTransform: { value: new Dt() }, sheen: { value: 0 }, sheenColor: { value: new Wt(0) }, sheenColorMap: { value: null }, sheenColorMapTransform: { value: new Dt() }, sheenRoughness: { value: 1 }, sheenRoughnessMap: { value: null }, sheenRoughnessMapTransform: { value: new Dt() }, transmission: { value: 0 }, transmissionMap: { value: null }, transmissionMapTransform: { value: new Dt() }, transmissionSamplerSize: { value: new Et() }, transmissionSamplerMap: { value: null }, thickness: { value: 0 }, thicknessMap: { value: null }, thicknessMapTransform: { value: new Dt() }, attenuationDistance: { value: 0 }, attenuationColor: { value: new Wt(0) }, specularColor: { value: new Wt(1, 1, 1) }, specularColorMap: { value: null }, specularColorMapTransform: { value: new Dt() }, specularIntensity: { value: 1 }, specularIntensityMap: { value: null }, specularIntensityMapTransform: { value: new Dt() }, anisotropyVector: { value: new Et() }, anisotropyMap: { value: null }, anisotropyMapTransform: { value: new Dt() } }]), vertexShader: Nt.meshphysical_vert, fragmentShader: Nt.meshphysical_frag };
const ar = { r: 0, b: 0, g: 0 }, ni = new Ln(), Vp = new Kt();
function Gp(s, t, e, n, i, r, o) {
  const a = new Wt(0);
  let l = r === true ? 0 : 1, c, h, u = null, d = 0, p = null;
  function g(T) {
    let S = T.isScene === true ? T.background : null;
    return S && S.isTexture && (S = (T.backgroundBlurriness > 0 ? e : t).get(S)), S;
  }
  function _(T) {
    let S = false;
    const I = g(T);
    I === null ? f(a, l) : I && I.isColor && (f(I, 1), S = true);
    const w = s.xr.getEnvironmentBlendMode();
    w === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, o) : w === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, o), (s.autoClear || S) && (n.buffers.depth.setTest(true), n.buffers.depth.setMask(true), n.buffers.color.setMask(true), s.clear(s.autoClearColor, s.autoClearDepth, s.autoClearStencil));
  }
  function m(T, S) {
    const I = g(S);
    I && (I.isCubeTexture || I.mapping === Ir) ? (h === void 0 && (h = new Ke(new Ls(1, 1, 1), new pn({ name: "BackgroundCubeMaterial", uniforms: ns(Ne.backgroundCube.uniforms), vertexShader: Ne.backgroundCube.vertexShader, fragmentShader: Ne.backgroundCube.fragmentShader, side: Fe, depthTest: false, depthWrite: false, fog: false })), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(w, C, N) {
      this.matrixWorld.copyPosition(N.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", { get: function() {
      return this.uniforms.envMap.value;
    } }), i.update(h)), ni.copy(S.backgroundRotation), ni.x *= -1, ni.y *= -1, ni.z *= -1, I.isCubeTexture && I.isRenderTargetTexture === false && (ni.y *= -1, ni.z *= -1), h.material.uniforms.envMap.value = I, h.material.uniforms.flipEnvMap.value = I.isCubeTexture && I.isRenderTargetTexture === false ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = S.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(Vp.makeRotationFromEuler(ni)), h.material.toneMapped = Yt.getTransfer(I.colorSpace) !== Qt, (u !== I || d !== I.version || p !== s.toneMapping) && (h.material.needsUpdate = true, u = I, d = I.version, p = s.toneMapping), h.layers.enableAll(), T.unshift(h, h.geometry, h.material, 0, 0, null)) : I && I.isTexture && (c === void 0 && (c = new Ke(new ss(2, 2), new pn({ name: "BackgroundMaterial", uniforms: ns(Ne.background.uniforms), vertexShader: Ne.background.vertexShader, fragmentShader: Ne.background.fragmentShader, side: Yn, depthTest: false, depthWrite: false, fog: false })), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", { get: function() {
      return this.uniforms.t2D.value;
    } }), i.update(c)), c.material.uniforms.t2D.value = I, c.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, c.material.toneMapped = Yt.getTransfer(I.colorSpace) !== Qt, I.matrixAutoUpdate === true && I.updateMatrix(), c.material.uniforms.uvTransform.value.copy(I.matrix), (u !== I || d !== I.version || p !== s.toneMapping) && (c.material.needsUpdate = true, u = I, d = I.version, p = s.toneMapping), c.layers.enableAll(), T.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function f(T, S) {
    T.getRGB(ar, Fc(s)), n.buffers.color.setClear(ar.r, ar.g, ar.b, S, o);
  }
  function A() {
    h !== void 0 && (h.geometry.dispose(), h.material.dispose(), h = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
  }
  return { getClearColor: function() {
    return a;
  }, setClearColor: function(T, S = 1) {
    a.set(T), l = S, f(a, l);
  }, getClearAlpha: function() {
    return l;
  }, setClearAlpha: function(T) {
    l = T, f(a, l);
  }, render: _, addToRenderList: m, dispose: A };
}
function Wp(s, t) {
  const e = s.getParameter(s.MAX_VERTEX_ATTRIBS), n = {}, i = d(null);
  let r = i, o = false;
  function a(y, P, V, z, X) {
    let K = false;
    const G = u(z, V, P);
    r !== G && (r = G, c(r.object)), K = p(y, z, V, X), K && g(y, z, V, X), X !== null && t.update(X, s.ELEMENT_ARRAY_BUFFER), (K || o) && (o = false, S(y, P, V, z), X !== null && s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, t.get(X).buffer));
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
  function u(y, P, V) {
    const z = V.wireframe === true;
    let X = n[y.id];
    X === void 0 && (X = {}, n[y.id] = X);
    let K = X[P.id];
    K === void 0 && (K = {}, X[P.id] = K);
    let G = K[z];
    return G === void 0 && (G = d(l()), K[z] = G), G;
  }
  function d(y) {
    const P = [], V = [], z = [];
    for (let X = 0; X < e; X++) P[X] = 0, V[X] = 0, z[X] = 0;
    return { geometry: null, program: null, wireframe: false, newAttributes: P, enabledAttributes: V, attributeDivisors: z, object: y, attributes: {}, index: null };
  }
  function p(y, P, V, z) {
    const X = r.attributes, K = P.attributes;
    let G = 0;
    const Q = V.getAttributes();
    for (const H in Q) if (Q[H].location >= 0) {
      const ut = X[H];
      let vt = K[H];
      if (vt === void 0 && (H === "instanceMatrix" && y.instanceMatrix && (vt = y.instanceMatrix), H === "instanceColor" && y.instanceColor && (vt = y.instanceColor)), ut === void 0 || ut.attribute !== vt || vt && ut.data !== vt.data) return true;
      G++;
    }
    return r.attributesNum !== G || r.index !== z;
  }
  function g(y, P, V, z) {
    const X = {}, K = P.attributes;
    let G = 0;
    const Q = V.getAttributes();
    for (const H in Q) if (Q[H].location >= 0) {
      let ut = K[H];
      ut === void 0 && (H === "instanceMatrix" && y.instanceMatrix && (ut = y.instanceMatrix), H === "instanceColor" && y.instanceColor && (ut = y.instanceColor));
      const vt = {};
      vt.attribute = ut, ut && ut.data && (vt.data = ut.data), X[H] = vt, G++;
    }
    r.attributes = X, r.attributesNum = G, r.index = z;
  }
  function _() {
    const y = r.newAttributes;
    for (let P = 0, V = y.length; P < V; P++) y[P] = 0;
  }
  function m(y) {
    f(y, 0);
  }
  function f(y, P) {
    const V = r.newAttributes, z = r.enabledAttributes, X = r.attributeDivisors;
    V[y] = 1, z[y] === 0 && (s.enableVertexAttribArray(y), z[y] = 1), X[y] !== P && (s.vertexAttribDivisor(y, P), X[y] = P);
  }
  function A() {
    const y = r.newAttributes, P = r.enabledAttributes;
    for (let V = 0, z = P.length; V < z; V++) P[V] !== y[V] && (s.disableVertexAttribArray(V), P[V] = 0);
  }
  function T(y, P, V, z, X, K, G) {
    G === true ? s.vertexAttribIPointer(y, P, V, X, K) : s.vertexAttribPointer(y, P, V, z, X, K);
  }
  function S(y, P, V, z) {
    _();
    const X = z.attributes, K = V.getAttributes(), G = P.defaultAttributeValues;
    for (const Q in K) {
      const H = K[Q];
      if (H.location >= 0) {
        let rt = X[Q];
        if (rt === void 0 && (Q === "instanceMatrix" && y.instanceMatrix && (rt = y.instanceMatrix), Q === "instanceColor" && y.instanceColor && (rt = y.instanceColor)), rt !== void 0) {
          const ut = rt.normalized, vt = rt.itemSize, Ot = t.get(rt);
          if (Ot === void 0) continue;
          const ee = Ot.buffer, Y = Ot.type, tt = Ot.bytesPerElement, gt = Y === s.INT || Y === s.UNSIGNED_INT || rt.gpuType === Ma;
          if (rt.isInterleavedBufferAttribute) {
            const ot = rt.data, bt = ot.stride, qt = rt.offset;
            if (ot.isInstancedInterleavedBuffer) {
              for (let wt = 0; wt < H.locationSize; wt++) f(H.location + wt, ot.meshPerAttribute);
              y.isInstancedMesh !== true && z._maxInstanceCount === void 0 && (z._maxInstanceCount = ot.meshPerAttribute * ot.count);
            } else for (let wt = 0; wt < H.locationSize; wt++) m(H.location + wt);
            s.bindBuffer(s.ARRAY_BUFFER, ee);
            for (let wt = 0; wt < H.locationSize; wt++) T(H.location + wt, vt / H.locationSize, Y, ut, bt * tt, (qt + vt / H.locationSize * wt) * tt, gt);
          } else {
            if (rt.isInstancedBufferAttribute) {
              for (let ot = 0; ot < H.locationSize; ot++) f(H.location + ot, rt.meshPerAttribute);
              y.isInstancedMesh !== true && z._maxInstanceCount === void 0 && (z._maxInstanceCount = rt.meshPerAttribute * rt.count);
            } else for (let ot = 0; ot < H.locationSize; ot++) m(H.location + ot);
            s.bindBuffer(s.ARRAY_BUFFER, ee);
            for (let ot = 0; ot < H.locationSize; ot++) T(H.location + ot, vt / H.locationSize, Y, ut, vt * tt, vt / H.locationSize * ot * tt, gt);
          }
        } else if (G !== void 0) {
          const ut = G[Q];
          if (ut !== void 0) switch (ut.length) {
            case 2:
              s.vertexAttrib2fv(H.location, ut);
              break;
            case 3:
              s.vertexAttrib3fv(H.location, ut);
              break;
            case 4:
              s.vertexAttrib4fv(H.location, ut);
              break;
            default:
              s.vertexAttrib1fv(H.location, ut);
          }
        }
      }
    }
    A();
  }
  function I() {
    N();
    for (const y in n) {
      const P = n[y];
      for (const V in P) {
        const z = P[V];
        for (const X in z) h(z[X].object), delete z[X];
        delete P[V];
      }
      delete n[y];
    }
  }
  function w(y) {
    if (n[y.id] === void 0) return;
    const P = n[y.id];
    for (const V in P) {
      const z = P[V];
      for (const X in z) h(z[X].object), delete z[X];
      delete P[V];
    }
    delete n[y.id];
  }
  function C(y) {
    for (const P in n) {
      const V = n[P];
      if (V[y.id] === void 0) continue;
      const z = V[y.id];
      for (const X in z) h(z[X].object), delete z[X];
      delete V[y.id];
    }
  }
  function N() {
    M(), o = true, r !== i && (r = i, c(r.object));
  }
  function M() {
    i.geometry = null, i.program = null, i.wireframe = false;
  }
  return { setup: a, reset: N, resetDefaultState: M, dispose: I, releaseStatesOfGeometry: w, releaseStatesOfProgram: C, initAttributes: _, enableAttribute: m, disableUnusedAttributes: A };
}
function Xp(s, t, e) {
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
    let p = 0;
    for (let g = 0; g < u; g++) p += h[g];
    e.update(p, n, 1);
  }
  function l(c, h, u, d) {
    if (u === 0) return;
    const p = t.get("WEBGL_multi_draw");
    if (p === null) for (let g = 0; g < c.length; g++) o(c[g], h[g], d[g]);
    else {
      p.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, d, 0, u);
      let g = 0;
      for (let _ = 0; _ < u; _++) g += h[_] * d[_];
      e.update(g, n, 1);
    }
  }
  this.setMode = i, this.render = r, this.renderInstances = o, this.renderMultiDraw = a, this.renderMultiDrawInstances = l;
}
function Yp(s, t, e, n) {
  let i;
  function r() {
    if (i !== void 0) return i;
    if (t.has("EXT_texture_filter_anisotropic") === true) {
      const C = t.get("EXT_texture_filter_anisotropic");
      i = s.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else i = 0;
    return i;
  }
  function o(C) {
    return !(C !== sn && n.convert(C) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function a(C) {
    const N = C === Cs && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(C !== Rn && n.convert(C) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE) && C !== bn && !N);
  }
  function l(C) {
    if (C === "highp") {
      if (s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.HIGH_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.HIGH_FLOAT).precision > 0) return "highp";
      C = "mediump";
    }
    return C === "mediump" && s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.MEDIUM_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = e.precision !== void 0 ? e.precision : "highp";
  const h = l(c);
  h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const u = e.logarithmicDepthBuffer === true, d = e.reverseDepthBuffer === true && t.has("EXT_clip_control"), p = s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS), g = s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = s.getParameter(s.MAX_TEXTURE_SIZE), m = s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE), f = s.getParameter(s.MAX_VERTEX_ATTRIBS), A = s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS), T = s.getParameter(s.MAX_VARYING_VECTORS), S = s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS), I = g > 0, w = s.getParameter(s.MAX_SAMPLES);
  return { isWebGL2: true, getMaxAnisotropy: r, getMaxPrecision: l, textureFormatReadable: o, textureTypeReadable: a, precision: c, logarithmicDepthBuffer: u, reverseDepthBuffer: d, maxTextures: p, maxVertexTextures: g, maxTextureSize: _, maxCubemapSize: m, maxAttributes: f, maxVertexUniforms: A, maxVaryings: T, maxFragmentUniforms: S, vertexTextures: I, maxSamples: w };
}
function qp(s) {
  const t = this;
  let e = null, n = 0, i = false, r = false;
  const o = new En(), a = new Dt(), l = { value: null, needsUpdate: false };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(u, d) {
    const p = u.length !== 0 || d || n !== 0 || i;
    return i = d, n = u.length, p;
  }, this.beginShadows = function() {
    r = true, h(null);
  }, this.endShadows = function() {
    r = false;
  }, this.setGlobalState = function(u, d) {
    e = h(u, d, 0);
  }, this.setState = function(u, d, p) {
    const g = u.clippingPlanes, _ = u.clipIntersection, m = u.clipShadows, f = s.get(u);
    if (!i || g === null || g.length === 0 || r && !m) r ? h(null) : c();
    else {
      const A = r ? 0 : n, T = A * 4;
      let S = f.clippingState || null;
      l.value = S, S = h(g, d, T, p);
      for (let I = 0; I !== T; ++I) S[I] = e[I];
      f.clippingState = S, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += A;
    }
  };
  function c() {
    l.value !== e && (l.value = e, l.needsUpdate = n > 0), t.numPlanes = n, t.numIntersection = 0;
  }
  function h(u, d, p, g) {
    const _ = u !== null ? u.length : 0;
    let m = null;
    if (_ !== 0) {
      if (m = l.value, g !== true || m === null) {
        const f = p + _ * 4, A = d.matrixWorldInverse;
        a.getNormalMatrix(A), (m === null || m.length < f) && (m = new Float32Array(f));
        for (let T = 0, S = p; T !== _; ++T, S += 4) o.copy(u[T]).applyMatrix4(A, a), o.normal.toArray(m, S), m[S + 3] = o.constant;
      }
      l.value = m, l.needsUpdate = true;
    }
    return t.numPlanes = _, t.numIntersection = 0, m;
  }
}
function $p(s) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(o, a) {
    return a === zo ? o.mapping = Ki : a === ko && (o.mapping = Zi), o;
  }
  function n(o) {
    if (o && o.isTexture) {
      const a = o.mapping;
      if (a === zo || a === ko) if (t.has(o)) {
        const l = t.get(o).texture;
        return e(l, o.mapping);
      } else {
        const l = o.image;
        if (l && l.height > 0) {
          const c = new Gu(l.height);
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
const Wi = 4, Cl = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], ci = 20, co = new cn(), Rl = new Wt();
let ho = null, uo = 0, fo = 0, po = false;
const ai = (1 + Math.sqrt(5)) / 2, Bi = 1 / ai, Pl = [new b(-ai, Bi, 0), new b(ai, Bi, 0), new b(-Bi, 0, ai), new b(Bi, 0, ai), new b(0, ai, -Bi), new b(0, ai, Bi), new b(-1, 1, -1), new b(1, 1, -1), new b(-1, 1, 1), new b(1, 1, 1)], jp = new b();
class Ll {
  constructor(t) {
    this._renderer = t, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  fromScene(t, e = 0, n = 0.1, i = 100, r = {}) {
    const { size: o = 256, position: a = jp } = r;
    ho = this._renderer.getRenderTarget(), uo = this._renderer.getActiveCubeFace(), fo = this._renderer.getActiveMipmapLevel(), po = this._renderer.xr.enabled, this._renderer.xr.enabled = false, this._setSize(o);
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
    this._cubemapMaterial === null && (this._cubemapMaterial = Il(), this._compileMaterial(this._cubemapMaterial));
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Ul(), this._compileMaterial(this._equirectMaterial));
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
    this._renderer.setRenderTarget(ho, uo, fo), this._renderer.xr.enabled = po, t.scissorTest = false, lr(t, 0, 0, t.width, t.height);
  }
  _fromTexture(t, e) {
    t.mapping === Ki || t.mapping === Zi ? this._setSize(t.image.length === 0 ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), ho = this._renderer.getRenderTarget(), uo = this._renderer.getActiveCubeFace(), fo = this._renderer.getActiveMipmapLevel(), po = this._renderer.xr.enabled, this._renderer.xr.enabled = false;
    const n = e || this._allocateTargets();
    return this._textureToCubeUV(t, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const t = 3 * Math.max(this._cubeSize, 112), e = 4 * this._cubeSize, n = { magFilter: dn, minFilter: dn, generateMipmaps: false, type: Cs, format: sn, colorSpace: ts, depthBuffer: false }, i = Dl(t, e, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Dl(t, e, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Kp(r)), this._blurMaterial = Zp(r, t, e);
    }
    return i;
  }
  _compileMaterial(t) {
    const e = new Ke(this._lodPlanes[0], t);
    this._renderer.compile(e, co);
  }
  _sceneToCubeUV(t, e, n, i, r) {
    const l = new qe(90, 1, e, n), c = [1, -1, 1, 1, 1, 1], h = [1, 1, 1, -1, -1, -1], u = this._renderer, d = u.autoClear, p = u.toneMapping;
    u.getClearColor(Rl), u.toneMapping = Xn, u.autoClear = false;
    const g = new Ps({ name: "PMREM.Background", side: Fe, depthWrite: false, depthTest: false }), _ = new Ke(new Ls(), g);
    let m = false;
    const f = t.background;
    f ? f.isColor && (g.color.copy(f), t.background = null, m = true) : (g.color.copy(Rl), m = true);
    for (let A = 0; A < 6; A++) {
      const T = A % 3;
      T === 0 ? (l.up.set(0, c[A], 0), l.position.set(r.x, r.y, r.z), l.lookAt(r.x + h[A], r.y, r.z)) : T === 1 ? (l.up.set(0, 0, c[A]), l.position.set(r.x, r.y, r.z), l.lookAt(r.x, r.y + h[A], r.z)) : (l.up.set(0, c[A], 0), l.position.set(r.x, r.y, r.z), l.lookAt(r.x, r.y, r.z + h[A]));
      const S = this._cubeSize;
      lr(i, T * S, A > 2 ? S : 0, S, S), u.setRenderTarget(i), m && u.render(_, l), u.render(t, l);
    }
    _.geometry.dispose(), _.material.dispose(), u.toneMapping = p, u.autoClear = d, t.background = f;
  }
  _textureToCubeUV(t, e) {
    const n = this._renderer, i = t.mapping === Ki || t.mapping === Zi;
    i ? (this._cubemapMaterial === null && (this._cubemapMaterial = Il()), this._cubemapMaterial.uniforms.flipEnvMap.value = t.isRenderTargetTexture === false ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Ul());
    const r = i ? this._cubemapMaterial : this._equirectMaterial, o = new Ke(this._lodPlanes[0], r), a = r.uniforms;
    a.envMap.value = t;
    const l = this._cubeSize;
    lr(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(o, co);
  }
  _applyPMREM(t) {
    const e = this._renderer, n = e.autoClear;
    e.autoClear = false;
    const i = this._lodPlanes.length;
    for (let r = 1; r < i; r++) {
      const o = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), a = Pl[(i - r - 1) % Pl.length];
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
    const h = 3, u = new Ke(this._lodPlanes[i], c), d = c.uniforms, p = this._sizeLods[n] - 1, g = isFinite(r) ? Math.PI / (2 * p) : 2 * Math.PI / (2 * ci - 1), _ = r / g, m = isFinite(r) ? 1 + Math.floor(h * _) : ci;
    m > ci && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ci}`);
    const f = [];
    let A = 0;
    for (let C = 0; C < ci; ++C) {
      const N = C / _, M = Math.exp(-N * N / 2);
      f.push(M), C === 0 ? A += M : C < m && (A += 2 * M);
    }
    for (let C = 0; C < f.length; C++) f[C] = f[C] / A;
    d.envMap.value = t.texture, d.samples.value = m, d.weights.value = f, d.latitudinal.value = o === "latitudinal", a && (d.poleAxis.value = a);
    const { _lodMax: T } = this;
    d.dTheta.value = g, d.mipInt.value = T - n;
    const S = this._sizeLods[i], I = 3 * S * (i > T - Wi ? i - T + Wi : 0), w = 4 * (this._cubeSize - S);
    lr(e, I, w, 3 * S, 2 * S), l.setRenderTarget(e), l.render(u, co);
  }
}
function Kp(s) {
  const t = [], e = [], n = [];
  let i = s;
  const r = s - Wi + 1 + Cl.length;
  for (let o = 0; o < r; o++) {
    const a = Math.pow(2, i);
    e.push(a);
    let l = 1 / a;
    o > s - Wi ? l = Cl[o - s + Wi - 1] : o === 0 && (l = 0), n.push(l);
    const c = 1 / (a - 2), h = -c, u = 1 + c, d = [h, h, u, h, u, u, h, h, u, u, h, u], p = 6, g = 6, _ = 3, m = 2, f = 1, A = new Float32Array(_ * g * p), T = new Float32Array(m * g * p), S = new Float32Array(f * g * p);
    for (let w = 0; w < p; w++) {
      const C = w % 3 * 2 / 3 - 1, N = w > 2 ? 0 : -1, M = [C, N, 0, C + 2 / 3, N, 0, C + 2 / 3, N + 1, 0, C, N, 0, C + 2 / 3, N + 1, 0, C, N + 1, 0];
      A.set(M, _ * g * w), T.set(d, m * g * w);
      const y = [w, w, w, w, w, w];
      S.set(y, f * g * w);
    }
    const I = new me();
    I.setAttribute("position", new oe(A, _)), I.setAttribute("uv", new oe(T, m)), I.setAttribute("faceIndex", new oe(S, f)), t.push(I), i > Wi && i--;
  }
  return { lodPlanes: t, sizeLods: e, sigmas: n };
}
function Dl(s, t, e) {
  const n = new mi(s, t, e);
  return n.texture.mapping = Ir, n.texture.name = "PMREM.cubeUv", n.scissorTest = true, n;
}
function lr(s, t, e, n, i) {
  s.viewport.set(t, e, n, i), s.scissor.set(t, e, n, i);
}
function Zp(s, t, e) {
  const n = new Float32Array(ci), i = new b(0, 1, 0);
  return new pn({ name: "SphericalGaussianBlur", defines: { n: ci, CUBEUV_TEXEL_WIDTH: 1 / t, CUBEUV_TEXEL_HEIGHT: 1 / e, CUBEUV_MAX_MIP: `${s}.0` }, uniforms: { envMap: { value: null }, samples: { value: 1 }, weights: { value: n }, latitudinal: { value: false }, dTheta: { value: 0 }, mipInt: { value: 0 }, poleAxis: { value: i } }, vertexShader: Ua(), fragmentShader: `

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
		`, blending: Wn, depthTest: false, depthWrite: false });
}
function Ul() {
  return new pn({ name: "EquirectangularToCubeUV", uniforms: { envMap: { value: null } }, vertexShader: Ua(), fragmentShader: `

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
		`, blending: Wn, depthTest: false, depthWrite: false });
}
function Il() {
  return new pn({ name: "CubemapToCubeUV", uniforms: { envMap: { value: null }, flipEnvMap: { value: -1 } }, vertexShader: Ua(), fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`, blending: Wn, depthTest: false, depthWrite: false });
}
function Ua() {
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
function Jp(s) {
  let t = /* @__PURE__ */ new WeakMap(), e = null;
  function n(a) {
    if (a && a.isTexture) {
      const l = a.mapping, c = l === zo || l === ko, h = l === Ki || l === Zi;
      if (c || h) {
        let u = t.get(a);
        const d = u !== void 0 ? u.texture.pmremVersion : 0;
        if (a.isRenderTargetTexture && a.pmremVersion !== d) return e === null && (e = new Ll(s)), u = c ? e.fromEquirectangular(a, u) : e.fromCubemap(a, u), u.texture.pmremVersion = a.pmremVersion, t.set(a, u), u.texture;
        if (u !== void 0) return u.texture;
        {
          const p = a.image;
          return c && p && p.height > 0 || h && p && i(p) ? (e === null && (e = new Ll(s)), u = c ? e.fromEquirectangular(a) : e.fromCubemap(a), u.texture.pmremVersion = a.pmremVersion, t.set(a, u), a.addEventListener("dispose", r), u.texture) : null;
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
function Qp(s) {
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
    return i === null && oi("THREE.WebGLRenderer: " + n + " extension not supported."), i;
  } };
}
function tm(s, t, e, n) {
  const i = {}, r = /* @__PURE__ */ new WeakMap();
  function o(u) {
    const d = u.target;
    d.index !== null && t.remove(d.index);
    for (const g in d.attributes) t.remove(d.attributes[g]);
    d.removeEventListener("dispose", o), delete i[d.id];
    const p = r.get(d);
    p && (t.remove(p), r.delete(d)), n.releaseStatesOfGeometry(d), d.isInstancedBufferGeometry === true && delete d._maxInstanceCount, e.memory.geometries--;
  }
  function a(u, d) {
    return i[d.id] === true || (d.addEventListener("dispose", o), i[d.id] = true, e.memory.geometries++), d;
  }
  function l(u) {
    const d = u.attributes;
    for (const p in d) t.update(d[p], s.ARRAY_BUFFER);
  }
  function c(u) {
    const d = [], p = u.index, g = u.attributes.position;
    let _ = 0;
    if (p !== null) {
      const A = p.array;
      _ = p.version;
      for (let T = 0, S = A.length; T < S; T += 3) {
        const I = A[T + 0], w = A[T + 1], C = A[T + 2];
        d.push(I, w, w, C, C, I);
      }
    } else if (g !== void 0) {
      const A = g.array;
      _ = g.version;
      for (let T = 0, S = A.length / 3 - 1; T < S; T += 3) {
        const I = T + 0, w = T + 1, C = T + 2;
        d.push(I, w, w, C, C, I);
      }
    } else return;
    const m = new (Lc(d) ? Nc : Ic)(d, 1);
    m.version = _;
    const f = r.get(u);
    f && t.remove(f), r.set(u, m);
  }
  function h(u) {
    const d = r.get(u);
    if (d) {
      const p = u.index;
      p !== null && d.version < p.version && c(u);
    } else c(u);
    return r.get(u);
  }
  return { get: a, update: l, getWireframeAttribute: h };
}
function em(s, t, e) {
  let n;
  function i(d) {
    n = d;
  }
  let r, o;
  function a(d) {
    r = d.type, o = d.bytesPerElement;
  }
  function l(d, p) {
    s.drawElements(n, p, r, d * o), e.update(p, n, 1);
  }
  function c(d, p, g) {
    g !== 0 && (s.drawElementsInstanced(n, p, r, d * o, g), e.update(p, n, g));
  }
  function h(d, p, g) {
    if (g === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, p, 0, r, d, 0, g);
    let m = 0;
    for (let f = 0; f < g; f++) m += p[f];
    e.update(m, n, 1);
  }
  function u(d, p, g, _) {
    if (g === 0) return;
    const m = t.get("WEBGL_multi_draw");
    if (m === null) for (let f = 0; f < d.length; f++) c(d[f] / o, p[f], _[f]);
    else {
      m.multiDrawElementsInstancedWEBGL(n, p, 0, r, d, 0, _, 0, g);
      let f = 0;
      for (let A = 0; A < g; A++) f += p[A] * _[A];
      e.update(f, n, 1);
    }
  }
  this.setMode = i, this.setIndex = a, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = u;
}
function nm(s) {
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
function im(s, t, e) {
  const n = /* @__PURE__ */ new WeakMap(), i = new ie();
  function r(o, a, l) {
    const c = o.morphTargetInfluences, h = a.morphAttributes.position || a.morphAttributes.normal || a.morphAttributes.color, u = h !== void 0 ? h.length : 0;
    let d = n.get(a);
    if (d === void 0 || d.count !== u) {
      let M = function() {
        C.dispose(), n.delete(a), a.removeEventListener("dispose", M);
      };
      d !== void 0 && d.texture.dispose();
      const p = a.morphAttributes.position !== void 0, g = a.morphAttributes.normal !== void 0, _ = a.morphAttributes.color !== void 0, m = a.morphAttributes.position || [], f = a.morphAttributes.normal || [], A = a.morphAttributes.color || [];
      let T = 0;
      p === true && (T = 1), g === true && (T = 2), _ === true && (T = 3);
      let S = a.attributes.position.count * T, I = 1;
      S > t.maxTextureSize && (I = Math.ceil(S / t.maxTextureSize), S = t.maxTextureSize);
      const w = new Float32Array(S * I * 4 * u), C = new Dc(w, S, I, u);
      C.type = bn, C.needsUpdate = true;
      const N = T * 4;
      for (let y = 0; y < u; y++) {
        const P = m[y], V = f[y], z = A[y], X = S * I * 4 * y;
        for (let K = 0; K < P.count; K++) {
          const G = K * N;
          p === true && (i.fromBufferAttribute(P, K), w[X + G + 0] = i.x, w[X + G + 1] = i.y, w[X + G + 2] = i.z, w[X + G + 3] = 0), g === true && (i.fromBufferAttribute(V, K), w[X + G + 4] = i.x, w[X + G + 5] = i.y, w[X + G + 6] = i.z, w[X + G + 7] = 0), _ === true && (i.fromBufferAttribute(z, K), w[X + G + 8] = i.x, w[X + G + 9] = i.y, w[X + G + 10] = i.z, w[X + G + 11] = z.itemSize === 4 ? i.w : 1);
        }
      }
      d = { count: u, texture: C, size: new Et(S, I) }, n.set(a, d), a.addEventListener("dispose", M);
    }
    if (o.isInstancedMesh === true && o.morphTexture !== null) l.getUniforms().setValue(s, "morphTexture", o.morphTexture, e);
    else {
      let p = 0;
      for (let _ = 0; _ < c.length; _++) p += c[_];
      const g = a.morphTargetsRelative ? 1 : 1 - p;
      l.getUniforms().setValue(s, "morphTargetBaseInfluence", g), l.getUniforms().setValue(s, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(s, "morphTargetsTexture", d.texture, e), l.getUniforms().setValue(s, "morphTargetsTextureSize", d.size);
  }
  return { update: r };
}
function sm(s, t, e, n) {
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
const Yc = new De(), Nl = new Wc(1, 1), qc = new Dc(), $c = new Au(), jc = new Bc(), Fl = [], Ol = [], Bl = new Float32Array(16), zl = new Float32Array(9), kl = new Float32Array(4);
function rs(s, t, e) {
  const n = s[0];
  if (n <= 0 || n > 0) return s;
  const i = t * e;
  let r = Fl[i];
  if (r === void 0 && (r = new Float32Array(i), Fl[i] = r), t !== 0) {
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
function Nr(s, t) {
  let e = Ol[t];
  e === void 0 && (e = new Int32Array(t), Ol[t] = e);
  for (let n = 0; n !== t; ++n) e[n] = s.allocateTextureUnit();
  return e;
}
function rm(s, t) {
  const e = this.cache;
  e[0] !== t && (s.uniform1f(this.addr, t), e[0] = t);
}
function om(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (s.uniform2f(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (ge(e, t)) return;
    s.uniform2fv(this.addr, t), _e(e, t);
  }
}
function am(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (s.uniform3f(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else if (t.r !== void 0) (e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) && (s.uniform3f(this.addr, t.r, t.g, t.b), e[0] = t.r, e[1] = t.g, e[2] = t.b);
  else {
    if (ge(e, t)) return;
    s.uniform3fv(this.addr, t), _e(e, t);
  }
}
function lm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (s.uniform4f(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (ge(e, t)) return;
    s.uniform4fv(this.addr, t), _e(e, t);
  }
}
function cm(s, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (ge(e, t)) return;
    s.uniformMatrix2fv(this.addr, false, t), _e(e, t);
  } else {
    if (ge(e, n)) return;
    kl.set(n), s.uniformMatrix2fv(this.addr, false, kl), _e(e, n);
  }
}
function hm(s, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (ge(e, t)) return;
    s.uniformMatrix3fv(this.addr, false, t), _e(e, t);
  } else {
    if (ge(e, n)) return;
    zl.set(n), s.uniformMatrix3fv(this.addr, false, zl), _e(e, n);
  }
}
function um(s, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (ge(e, t)) return;
    s.uniformMatrix4fv(this.addr, false, t), _e(e, t);
  } else {
    if (ge(e, n)) return;
    Bl.set(n), s.uniformMatrix4fv(this.addr, false, Bl), _e(e, n);
  }
}
function dm(s, t) {
  const e = this.cache;
  e[0] !== t && (s.uniform1i(this.addr, t), e[0] = t);
}
function fm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (s.uniform2i(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (ge(e, t)) return;
    s.uniform2iv(this.addr, t), _e(e, t);
  }
}
function pm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (s.uniform3i(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (ge(e, t)) return;
    s.uniform3iv(this.addr, t), _e(e, t);
  }
}
function mm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (s.uniform4i(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (ge(e, t)) return;
    s.uniform4iv(this.addr, t), _e(e, t);
  }
}
function gm(s, t) {
  const e = this.cache;
  e[0] !== t && (s.uniform1ui(this.addr, t), e[0] = t);
}
function _m(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (s.uniform2ui(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (ge(e, t)) return;
    s.uniform2uiv(this.addr, t), _e(e, t);
  }
}
function xm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (s.uniform3ui(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (ge(e, t)) return;
    s.uniform3uiv(this.addr, t), _e(e, t);
  }
}
function vm(s, t) {
  const e = this.cache;
  if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (s.uniform4ui(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (ge(e, t)) return;
    s.uniform4uiv(this.addr, t), _e(e, t);
  }
}
function ym(s, t, e) {
  const n = this.cache, i = e.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i);
  let r;
  this.type === s.SAMPLER_2D_SHADOW ? (Nl.compareFunction = Pc, r = Nl) : r = Yc, e.setTexture2D(t || r, i);
}
function Mm(s, t, e) {
  const n = this.cache, i = e.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), e.setTexture3D(t || $c, i);
}
function Sm(s, t, e) {
  const n = this.cache, i = e.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), e.setTextureCube(t || jc, i);
}
function Em(s, t, e) {
  const n = this.cache, i = e.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), e.setTexture2DArray(t || qc, i);
}
function bm(s) {
  switch (s) {
    case 5126:
      return rm;
    case 35664:
      return om;
    case 35665:
      return am;
    case 35666:
      return lm;
    case 35674:
      return cm;
    case 35675:
      return hm;
    case 35676:
      return um;
    case 5124:
    case 35670:
      return dm;
    case 35667:
    case 35671:
      return fm;
    case 35668:
    case 35672:
      return pm;
    case 35669:
    case 35673:
      return mm;
    case 5125:
      return gm;
    case 36294:
      return _m;
    case 36295:
      return xm;
    case 36296:
      return vm;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return ym;
    case 35679:
    case 36299:
    case 36307:
      return Mm;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Sm;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Em;
  }
}
function Tm(s, t) {
  s.uniform1fv(this.addr, t);
}
function wm(s, t) {
  const e = rs(t, this.size, 2);
  s.uniform2fv(this.addr, e);
}
function Am(s, t) {
  const e = rs(t, this.size, 3);
  s.uniform3fv(this.addr, e);
}
function Cm(s, t) {
  const e = rs(t, this.size, 4);
  s.uniform4fv(this.addr, e);
}
function Rm(s, t) {
  const e = rs(t, this.size, 4);
  s.uniformMatrix2fv(this.addr, false, e);
}
function Pm(s, t) {
  const e = rs(t, this.size, 9);
  s.uniformMatrix3fv(this.addr, false, e);
}
function Lm(s, t) {
  const e = rs(t, this.size, 16);
  s.uniformMatrix4fv(this.addr, false, e);
}
function Dm(s, t) {
  s.uniform1iv(this.addr, t);
}
function Um(s, t) {
  s.uniform2iv(this.addr, t);
}
function Im(s, t) {
  s.uniform3iv(this.addr, t);
}
function Nm(s, t) {
  s.uniform4iv(this.addr, t);
}
function Fm(s, t) {
  s.uniform1uiv(this.addr, t);
}
function Om(s, t) {
  s.uniform2uiv(this.addr, t);
}
function Bm(s, t) {
  s.uniform3uiv(this.addr, t);
}
function zm(s, t) {
  s.uniform4uiv(this.addr, t);
}
function km(s, t, e) {
  const n = this.cache, i = t.length, r = Nr(e, i);
  ge(n, r) || (s.uniform1iv(this.addr, r), _e(n, r));
  for (let o = 0; o !== i; ++o) e.setTexture2D(t[o] || Yc, r[o]);
}
function Hm(s, t, e) {
  const n = this.cache, i = t.length, r = Nr(e, i);
  ge(n, r) || (s.uniform1iv(this.addr, r), _e(n, r));
  for (let o = 0; o !== i; ++o) e.setTexture3D(t[o] || $c, r[o]);
}
function Vm(s, t, e) {
  const n = this.cache, i = t.length, r = Nr(e, i);
  ge(n, r) || (s.uniform1iv(this.addr, r), _e(n, r));
  for (let o = 0; o !== i; ++o) e.setTextureCube(t[o] || jc, r[o]);
}
function Gm(s, t, e) {
  const n = this.cache, i = t.length, r = Nr(e, i);
  ge(n, r) || (s.uniform1iv(this.addr, r), _e(n, r));
  for (let o = 0; o !== i; ++o) e.setTexture2DArray(t[o] || qc, r[o]);
}
function Wm(s) {
  switch (s) {
    case 5126:
      return Tm;
    case 35664:
      return wm;
    case 35665:
      return Am;
    case 35666:
      return Cm;
    case 35674:
      return Rm;
    case 35675:
      return Pm;
    case 35676:
      return Lm;
    case 5124:
    case 35670:
      return Dm;
    case 35667:
    case 35671:
      return Um;
    case 35668:
    case 35672:
      return Im;
    case 35669:
    case 35673:
      return Nm;
    case 5125:
      return Fm;
    case 36294:
      return Om;
    case 36295:
      return Bm;
    case 36296:
      return zm;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return km;
    case 35679:
    case 36299:
    case 36307:
      return Hm;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Vm;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Gm;
  }
}
class Xm {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.setValue = bm(e.type);
  }
}
class Ym {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.size = e.size, this.setValue = Wm(e.type);
  }
}
class qm {
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
const mo = /(\w+)(\])?(\[|\.)?/g;
function Hl(s, t) {
  s.seq.push(t), s.map[t.id] = t;
}
function $m(s, t, e) {
  const n = s.name, i = n.length;
  for (mo.lastIndex = 0; ; ) {
    const r = mo.exec(n), o = mo.lastIndex;
    let a = r[1];
    const l = r[2] === "]", c = r[3];
    if (l && (a = a | 0), c === void 0 || c === "[" && o + 2 === i) {
      Hl(e, c === void 0 ? new Xm(a, s, t) : new Ym(a, s, t));
      break;
    } else {
      let u = e.map[a];
      u === void 0 && (u = new qm(a), Hl(e, u)), e = u;
    }
  }
}
class wr {
  constructor(t, e) {
    this.seq = [], this.map = {};
    const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; ++i) {
      const r = t.getActiveUniform(e, i), o = t.getUniformLocation(e, r.name);
      $m(r, o, this);
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
function Vl(s, t, e) {
  const n = s.createShader(t);
  return s.shaderSource(n, e), s.compileShader(n), n;
}
const jm = 37297;
let Km = 0;
function Zm(s, t) {
  const e = s.split(`
`), n = [], i = Math.max(t - 6, 0), r = Math.min(t + 6, e.length);
  for (let o = i; o < r; o++) {
    const a = o + 1;
    n.push(`${a === t ? ">" : " "} ${a}: ${e[o]}`);
  }
  return n.join(`
`);
}
const Gl = new Dt();
function Jm(s) {
  Yt._getMatrix(Gl, Yt.workingColorSpace, s);
  const t = `mat3( ${Gl.elements.map((e) => e.toFixed(4))} )`;
  switch (Yt.getTransfer(s)) {
    case Cr:
      return [t, "LinearTransferOETF"];
    case Qt:
      return [t, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space: ", s), [t, "LinearTransferOETF"];
  }
}
function Wl(s, t, e) {
  const n = s.getShaderParameter(t, s.COMPILE_STATUS), i = s.getShaderInfoLog(t).trim();
  if (n && i === "") return "";
  const r = /ERROR: 0:(\d+)/.exec(i);
  if (r) {
    const o = parseInt(r[1]);
    return e.toUpperCase() + `

` + i + `

` + Zm(s.getShaderSource(t), o);
  } else return i;
}
function Qm(s, t) {
  const e = Jm(t);
  return [`vec4 ${s}( vec4 value ) {`, `	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`, "}"].join(`
`);
}
function tg(s, t) {
  let e;
  switch (t) {
    case Oh:
      e = "Linear";
      break;
    case Bh:
      e = "Reinhard";
      break;
    case zh:
      e = "Cineon";
      break;
    case kh:
      e = "ACESFilmic";
      break;
    case Vh:
      e = "AgX";
      break;
    case Gh:
      e = "Neutral";
      break;
    case Hh:
      e = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), e = "Linear";
  }
  return "vec3 " + s + "( vec3 color ) { return " + e + "ToneMapping( color ); }";
}
const cr = new b();
function eg() {
  Yt.getLuminanceCoefficients(cr);
  const s = cr.x.toFixed(4), t = cr.y.toFixed(4), e = cr.z.toFixed(4);
  return ["float luminance( const in vec3 rgb ) {", `	const vec3 weights = vec3( ${s}, ${t}, ${e} );`, "	return dot( weights, rgb );", "}"].join(`
`);
}
function ng(s) {
  return [s.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", s.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(Es).join(`
`);
}
function ig(s) {
  const t = [];
  for (const e in s) {
    const n = s[e];
    n !== false && t.push("#define " + e + " " + n);
  }
  return t.join(`
`);
}
function sg(s, t) {
  const e = {}, n = s.getProgramParameter(t, s.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < n; i++) {
    const r = s.getActiveAttrib(t, i), o = r.name;
    let a = 1;
    r.type === s.FLOAT_MAT2 && (a = 2), r.type === s.FLOAT_MAT3 && (a = 3), r.type === s.FLOAT_MAT4 && (a = 4), e[o] = { type: r.type, location: s.getAttribLocation(t, o), locationSize: a };
  }
  return e;
}
function Es(s) {
  return s !== "";
}
function Xl(s, t) {
  const e = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return s.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, e).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function Yl(s, t) {
  return s.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
const rg = /^[ \t]*#include +<([\w\d./]+)>/gm;
function va(s) {
  return s.replace(rg, ag);
}
const og = /* @__PURE__ */ new Map();
function ag(s, t) {
  let e = Nt[t];
  if (e === void 0) {
    const n = og.get(t);
    if (n !== void 0) e = Nt[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, n);
    else throw new Error("Can not resolve #include <" + t + ">");
  }
  return va(e);
}
const lg = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function ql(s) {
  return s.replace(lg, cg);
}
function cg(s, t, e, n) {
  let i = "";
  for (let r = parseInt(t); r < parseInt(e); r++) i += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
  return i;
}
function $l(s) {
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
function hg(s) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return s.shadowMapType === _c ? t = "SHADOWMAP_TYPE_PCF" : s.shadowMapType === gh ? t = "SHADOWMAP_TYPE_PCF_SOFT" : s.shadowMapType === Sn && (t = "SHADOWMAP_TYPE_VSM"), t;
}
function ug(s) {
  let t = "ENVMAP_TYPE_CUBE";
  if (s.envMap) switch (s.envMapMode) {
    case Ki:
    case Zi:
      t = "ENVMAP_TYPE_CUBE";
      break;
    case Ir:
      t = "ENVMAP_TYPE_CUBE_UV";
      break;
  }
  return t;
}
function dg(s) {
  let t = "ENVMAP_MODE_REFLECTION";
  if (s.envMap) switch (s.envMapMode) {
    case Zi:
      t = "ENVMAP_MODE_REFRACTION";
      break;
  }
  return t;
}
function fg(s) {
  let t = "ENVMAP_BLENDING_NONE";
  if (s.envMap) switch (s.combine) {
    case xc:
      t = "ENVMAP_BLENDING_MULTIPLY";
      break;
    case Nh:
      t = "ENVMAP_BLENDING_MIX";
      break;
    case Fh:
      t = "ENVMAP_BLENDING_ADD";
      break;
  }
  return t;
}
function pg(s) {
  const t = s.envMapCubeUVHeight;
  if (t === null) return null;
  const e = Math.log2(t) - 2, n = 1 / t;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 112)), texelHeight: n, maxMip: e };
}
function mg(s, t, e, n) {
  const i = s.getContext(), r = e.defines;
  let o = e.vertexShader, a = e.fragmentShader;
  const l = hg(e), c = ug(e), h = dg(e), u = fg(e), d = pg(e), p = ng(e), g = ig(r), _ = i.createProgram();
  let m, f, A = e.glslVersion ? "#version " + e.glslVersion + `
` : "";
  e.isRawShaderMaterial ? (m = ["#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, g].filter(Es).join(`
`), m.length > 0 && (m += `
`), f = ["#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, g].filter(Es).join(`
`), f.length > 0 && (f += `
`)) : (m = [$l(e), "#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, g, e.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "", e.batching ? "#define USE_BATCHING" : "", e.batchingColor ? "#define USE_BATCHING_COLOR" : "", e.instancing ? "#define USE_INSTANCING" : "", e.instancingColor ? "#define USE_INSTANCING_COLOR" : "", e.instancingMorph ? "#define USE_INSTANCING_MORPH" : "", e.useFog && e.fog ? "#define USE_FOG" : "", e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "", e.map ? "#define USE_MAP" : "", e.envMap ? "#define USE_ENVMAP" : "", e.envMap ? "#define " + h : "", e.lightMap ? "#define USE_LIGHTMAP" : "", e.aoMap ? "#define USE_AOMAP" : "", e.bumpMap ? "#define USE_BUMPMAP" : "", e.normalMap ? "#define USE_NORMALMAP" : "", e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", e.displacementMap ? "#define USE_DISPLACEMENTMAP" : "", e.emissiveMap ? "#define USE_EMISSIVEMAP" : "", e.anisotropy ? "#define USE_ANISOTROPY" : "", e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", e.specularMap ? "#define USE_SPECULARMAP" : "", e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", e.metalnessMap ? "#define USE_METALNESSMAP" : "", e.alphaMap ? "#define USE_ALPHAMAP" : "", e.alphaHash ? "#define USE_ALPHAHASH" : "", e.transmission ? "#define USE_TRANSMISSION" : "", e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", e.thicknessMap ? "#define USE_THICKNESSMAP" : "", e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", e.mapUv ? "#define MAP_UV " + e.mapUv : "", e.alphaMapUv ? "#define ALPHAMAP_UV " + e.alphaMapUv : "", e.lightMapUv ? "#define LIGHTMAP_UV " + e.lightMapUv : "", e.aoMapUv ? "#define AOMAP_UV " + e.aoMapUv : "", e.emissiveMapUv ? "#define EMISSIVEMAP_UV " + e.emissiveMapUv : "", e.bumpMapUv ? "#define BUMPMAP_UV " + e.bumpMapUv : "", e.normalMapUv ? "#define NORMALMAP_UV " + e.normalMapUv : "", e.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + e.displacementMapUv : "", e.metalnessMapUv ? "#define METALNESSMAP_UV " + e.metalnessMapUv : "", e.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + e.roughnessMapUv : "", e.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + e.anisotropyMapUv : "", e.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + e.clearcoatMapUv : "", e.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + e.clearcoatNormalMapUv : "", e.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + e.clearcoatRoughnessMapUv : "", e.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + e.iridescenceMapUv : "", e.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + e.iridescenceThicknessMapUv : "", e.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + e.sheenColorMapUv : "", e.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + e.sheenRoughnessMapUv : "", e.specularMapUv ? "#define SPECULARMAP_UV " + e.specularMapUv : "", e.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + e.specularColorMapUv : "", e.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + e.specularIntensityMapUv : "", e.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + e.transmissionMapUv : "", e.thicknessMapUv ? "#define THICKNESSMAP_UV " + e.thicknessMapUv : "", e.vertexTangents && e.flatShading === false ? "#define USE_TANGENT" : "", e.vertexColors ? "#define USE_COLOR" : "", e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", e.vertexUv1s ? "#define USE_UV1" : "", e.vertexUv2s ? "#define USE_UV2" : "", e.vertexUv3s ? "#define USE_UV3" : "", e.pointsUvs ? "#define USE_POINTS_UV" : "", e.flatShading ? "#define FLAT_SHADED" : "", e.skinning ? "#define USE_SKINNING" : "", e.morphTargets ? "#define USE_MORPHTARGETS" : "", e.morphNormals && e.flatShading === false ? "#define USE_MORPHNORMALS" : "", e.morphColors ? "#define USE_MORPHCOLORS" : "", e.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + e.morphTextureStride : "", e.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + e.morphTargetsCount : "", e.doubleSided ? "#define DOUBLE_SIDED" : "", e.flipSided ? "#define FLIP_SIDED" : "", e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", e.shadowMapEnabled ? "#define " + l : "", e.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", e.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", "#ifdef USE_INSTANCING", "	attribute mat4 instanceMatrix;", "#endif", "#ifdef USE_INSTANCING_COLOR", "	attribute vec3 instanceColor;", "#endif", "#ifdef USE_INSTANCING_MORPH", "	uniform sampler2D morphTexture;", "#endif", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_UV1", "	attribute vec2 uv1;", "#endif", "#ifdef USE_UV2", "	attribute vec2 uv2;", "#endif", "#ifdef USE_UV3", "	attribute vec2 uv3;", "#endif", "#ifdef USE_TANGENT", "	attribute vec4 tangent;", "#endif", "#if defined( USE_COLOR_ALPHA )", "	attribute vec4 color;", "#elif defined( USE_COLOR )", "	attribute vec3 color;", "#endif", "#ifdef USE_SKINNING", "	attribute vec4 skinIndex;", "	attribute vec4 skinWeight;", "#endif", `
`].filter(Es).join(`
`), f = [$l(e), "#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, g, e.useFog && e.fog ? "#define USE_FOG" : "", e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "", e.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "", e.map ? "#define USE_MAP" : "", e.matcap ? "#define USE_MATCAP" : "", e.envMap ? "#define USE_ENVMAP" : "", e.envMap ? "#define " + c : "", e.envMap ? "#define " + h : "", e.envMap ? "#define " + u : "", d ? "#define CUBEUV_TEXEL_WIDTH " + d.texelWidth : "", d ? "#define CUBEUV_TEXEL_HEIGHT " + d.texelHeight : "", d ? "#define CUBEUV_MAX_MIP " + d.maxMip + ".0" : "", e.lightMap ? "#define USE_LIGHTMAP" : "", e.aoMap ? "#define USE_AOMAP" : "", e.bumpMap ? "#define USE_BUMPMAP" : "", e.normalMap ? "#define USE_NORMALMAP" : "", e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", e.emissiveMap ? "#define USE_EMISSIVEMAP" : "", e.anisotropy ? "#define USE_ANISOTROPY" : "", e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", e.clearcoat ? "#define USE_CLEARCOAT" : "", e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", e.dispersion ? "#define USE_DISPERSION" : "", e.iridescence ? "#define USE_IRIDESCENCE" : "", e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", e.specularMap ? "#define USE_SPECULARMAP" : "", e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", e.metalnessMap ? "#define USE_METALNESSMAP" : "", e.alphaMap ? "#define USE_ALPHAMAP" : "", e.alphaTest ? "#define USE_ALPHATEST" : "", e.alphaHash ? "#define USE_ALPHAHASH" : "", e.sheen ? "#define USE_SHEEN" : "", e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", e.transmission ? "#define USE_TRANSMISSION" : "", e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", e.thicknessMap ? "#define USE_THICKNESSMAP" : "", e.vertexTangents && e.flatShading === false ? "#define USE_TANGENT" : "", e.vertexColors || e.instancingColor || e.batchingColor ? "#define USE_COLOR" : "", e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", e.vertexUv1s ? "#define USE_UV1" : "", e.vertexUv2s ? "#define USE_UV2" : "", e.vertexUv3s ? "#define USE_UV3" : "", e.pointsUvs ? "#define USE_POINTS_UV" : "", e.gradientMap ? "#define USE_GRADIENTMAP" : "", e.flatShading ? "#define FLAT_SHADED" : "", e.doubleSided ? "#define DOUBLE_SIDED" : "", e.flipSided ? "#define FLIP_SIDED" : "", e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", e.shadowMapEnabled ? "#define " + l : "", e.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", e.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "", e.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "", e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", e.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", e.toneMapping !== Xn ? "#define TONE_MAPPING" : "", e.toneMapping !== Xn ? Nt.tonemapping_pars_fragment : "", e.toneMapping !== Xn ? tg("toneMapping", e.toneMapping) : "", e.dithering ? "#define DITHERING" : "", e.opaque ? "#define OPAQUE" : "", Nt.colorspace_pars_fragment, Qm("linearToOutputTexel", e.outputColorSpace), eg(), e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "", `
`].filter(Es).join(`
`)), o = va(o), o = Xl(o, e), o = Yl(o, e), a = va(a), a = Xl(a, e), a = Yl(a, e), o = ql(o), a = ql(a), e.isRawShaderMaterial !== true && (A = `#version 300 es
`, m = [p, "#define attribute in", "#define varying out", "#define texture2D texture"].join(`
`) + `
` + m, f = ["#define varying in", e.glslVersion === ja ? "" : "layout(location = 0) out highp vec4 pc_fragColor;", e.glslVersion === ja ? "" : "#define gl_FragColor pc_fragColor", "#define gl_FragDepthEXT gl_FragDepth", "#define texture2D texture", "#define textureCube texture", "#define texture2DProj textureProj", "#define texture2DLodEXT textureLod", "#define texture2DProjLodEXT textureProjLod", "#define textureCubeLodEXT textureLod", "#define texture2DGradEXT textureGrad", "#define texture2DProjGradEXT textureProjGrad", "#define textureCubeGradEXT textureGrad"].join(`
`) + `
` + f);
  const T = A + m + o, S = A + f + a, I = Vl(i, i.VERTEX_SHADER, T), w = Vl(i, i.FRAGMENT_SHADER, S);
  i.attachShader(_, I), i.attachShader(_, w), e.index0AttributeName !== void 0 ? i.bindAttribLocation(_, 0, e.index0AttributeName) : e.morphTargets === true && i.bindAttribLocation(_, 0, "position"), i.linkProgram(_);
  function C(P) {
    if (s.debug.checkShaderErrors) {
      const V = i.getProgramInfoLog(_).trim(), z = i.getShaderInfoLog(I).trim(), X = i.getShaderInfoLog(w).trim();
      let K = true, G = true;
      if (i.getProgramParameter(_, i.LINK_STATUS) === false) if (K = false, typeof s.debug.onShaderError == "function") s.debug.onShaderError(i, _, I, w);
      else {
        const Q = Wl(i, I, "vertex"), H = Wl(i, w, "fragment");
        console.error("THREE.WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(_, i.VALIDATE_STATUS) + `

Material Name: ` + P.name + `
Material Type: ` + P.type + `

Program Info Log: ` + V + `
` + Q + `
` + H);
      }
      else V !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", V) : (z === "" || X === "") && (G = false);
      G && (P.diagnostics = { runnable: K, programLog: V, vertexShader: { log: z, prefix: m }, fragmentShader: { log: X, prefix: f } });
    }
    i.deleteShader(I), i.deleteShader(w), N = new wr(i, _), M = sg(i, _);
  }
  let N;
  this.getUniforms = function() {
    return N === void 0 && C(this), N;
  };
  let M;
  this.getAttributes = function() {
    return M === void 0 && C(this), M;
  };
  let y = e.rendererExtensionParallelShaderCompile === false;
  return this.isReady = function() {
    return y === false && (y = i.getProgramParameter(_, jm)), y;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), i.deleteProgram(_), this.program = void 0;
  }, this.type = e.shaderType, this.name = e.shaderName, this.id = Km++, this.cacheKey = t, this.usedTimes = 1, this.program = _, this.vertexShader = I, this.fragmentShader = w, this;
}
let gg = 0;
class _g {
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
    return n === void 0 && (n = new xg(t), e.set(t, n)), n;
  }
}
class xg {
  constructor(t) {
    this.id = gg++, this.code = t, this.usedTimes = 0;
  }
}
function vg(s, t, e, n, i, r, o) {
  const a = new Ra(), l = new _g(), c = /* @__PURE__ */ new Set(), h = [], u = i.logarithmicDepthBuffer, d = i.vertexTextures;
  let p = i.precision;
  const g = { MeshDepthMaterial: "depth", MeshDistanceMaterial: "distanceRGBA", MeshNormalMaterial: "normal", MeshBasicMaterial: "basic", MeshLambertMaterial: "lambert", MeshPhongMaterial: "phong", MeshToonMaterial: "toon", MeshStandardMaterial: "physical", MeshPhysicalMaterial: "physical", MeshMatcapMaterial: "matcap", LineBasicMaterial: "basic", LineDashedMaterial: "dashed", PointsMaterial: "points", ShadowMaterial: "shadow", SpriteMaterial: "sprite" };
  function _(M) {
    return c.add(M), M === 0 ? "uv" : `uv${M}`;
  }
  function m(M, y, P, V, z) {
    const X = V.fog, K = z.geometry, G = M.isMeshStandardMaterial ? V.environment : null, Q = (M.isMeshStandardMaterial ? e : t).get(M.envMap || G), H = Q && Q.mapping === Ir ? Q.image.height : null, rt = g[M.type];
    M.precision !== null && (p = i.getMaxPrecision(M.precision), p !== M.precision && console.warn("THREE.WebGLProgram.getParameters:", M.precision, "not supported, using", p, "instead."));
    const ut = K.morphAttributes.position || K.morphAttributes.normal || K.morphAttributes.color, vt = ut !== void 0 ? ut.length : 0;
    let Ot = 0;
    K.morphAttributes.position !== void 0 && (Ot = 1), K.morphAttributes.normal !== void 0 && (Ot = 2), K.morphAttributes.color !== void 0 && (Ot = 3);
    let ee, Y, tt, gt;
    if (rt) {
      const Zt = Ne[rt];
      ee = Zt.vertexShader, Y = Zt.fragmentShader;
    } else ee = M.vertexShader, Y = M.fragmentShader, l.update(M), tt = l.getVertexShaderID(M), gt = l.getFragmentShaderID(M);
    const ot = s.getRenderTarget(), bt = s.state.buffers.depth.getReversed(), qt = z.isInstancedMesh === true, wt = z.isBatchedMesh === true, he = !!M.map, ae = !!M.matcap, Bt = !!Q, R = !!M.aoMap, Ve = !!M.lightMap, zt = !!M.bumpMap, kt = !!M.normalMap, yt = !!M.displacementMap, se = !!M.emissiveMap, xt = !!M.metalnessMap, E = !!M.roughnessMap, x = M.anisotropy > 0, F = M.clearcoat > 0, q = M.dispersion > 0, j = M.iridescence > 0, W = M.sheen > 0, _t = M.transmission > 0, at = x && !!M.anisotropyMap, dt = F && !!M.clearcoatMap, Vt = F && !!M.clearcoatNormalMap, J = F && !!M.clearcoatRoughnessMap, ft = j && !!M.iridescenceMap, Tt = j && !!M.iridescenceThicknessMap, At = W && !!M.sheenColorMap, pt = W && !!M.sheenRoughnessMap, Ht = !!M.specularMap, It = !!M.specularColorMap, ne = !!M.specularIntensityMap, L = _t && !!M.transmissionMap, it = _t && !!M.thicknessMap, k = !!M.gradientMap, $ = !!M.alphaMap, ct = M.alphaTest > 0, lt = !!M.alphaHash, Lt = !!M.extensions;
    let le = Xn;
    M.toneMapped && (ot === null || ot.isXRRenderTarget === true) && (le = s.toneMapping);
    const Ee = { shaderID: rt, shaderType: M.type, shaderName: M.name, vertexShader: ee, fragmentShader: Y, defines: M.defines, customVertexShaderID: tt, customFragmentShaderID: gt, isRawShaderMaterial: M.isRawShaderMaterial === true, glslVersion: M.glslVersion, precision: p, batching: wt, batchingColor: wt && z._colorsTexture !== null, instancing: qt, instancingColor: qt && z.instanceColor !== null, instancingMorph: qt && z.morphTexture !== null, supportsVertexTextures: d, outputColorSpace: ot === null ? s.outputColorSpace : ot.isXRRenderTarget === true ? ot.texture.colorSpace : ts, alphaToCoverage: !!M.alphaToCoverage, map: he, matcap: ae, envMap: Bt, envMapMode: Bt && Q.mapping, envMapCubeUVHeight: H, aoMap: R, lightMap: Ve, bumpMap: zt, normalMap: kt, displacementMap: d && yt, emissiveMap: se, normalMapObjectSpace: kt && M.normalMapType === $h, normalMapTangentSpace: kt && M.normalMapType === qh, metalnessMap: xt, roughnessMap: E, anisotropy: x, anisotropyMap: at, clearcoat: F, clearcoatMap: dt, clearcoatNormalMap: Vt, clearcoatRoughnessMap: J, dispersion: q, iridescence: j, iridescenceMap: ft, iridescenceThicknessMap: Tt, sheen: W, sheenColorMap: At, sheenRoughnessMap: pt, specularMap: Ht, specularColorMap: It, specularIntensityMap: ne, transmission: _t, transmissionMap: L, thicknessMap: it, gradientMap: k, opaque: M.transparent === false && M.blending === Yi && M.alphaToCoverage === false, alphaMap: $, alphaTest: ct, alphaHash: lt, combine: M.combine, mapUv: he && _(M.map.channel), aoMapUv: R && _(M.aoMap.channel), lightMapUv: Ve && _(M.lightMap.channel), bumpMapUv: zt && _(M.bumpMap.channel), normalMapUv: kt && _(M.normalMap.channel), displacementMapUv: yt && _(M.displacementMap.channel), emissiveMapUv: se && _(M.emissiveMap.channel), metalnessMapUv: xt && _(M.metalnessMap.channel), roughnessMapUv: E && _(M.roughnessMap.channel), anisotropyMapUv: at && _(M.anisotropyMap.channel), clearcoatMapUv: dt && _(M.clearcoatMap.channel), clearcoatNormalMapUv: Vt && _(M.clearcoatNormalMap.channel), clearcoatRoughnessMapUv: J && _(M.clearcoatRoughnessMap.channel), iridescenceMapUv: ft && _(M.iridescenceMap.channel), iridescenceThicknessMapUv: Tt && _(M.iridescenceThicknessMap.channel), sheenColorMapUv: At && _(M.sheenColorMap.channel), sheenRoughnessMapUv: pt && _(M.sheenRoughnessMap.channel), specularMapUv: Ht && _(M.specularMap.channel), specularColorMapUv: It && _(M.specularColorMap.channel), specularIntensityMapUv: ne && _(M.specularIntensityMap.channel), transmissionMapUv: L && _(M.transmissionMap.channel), thicknessMapUv: it && _(M.thicknessMap.channel), alphaMapUv: $ && _(M.alphaMap.channel), vertexTangents: !!K.attributes.tangent && (kt || x), vertexColors: M.vertexColors, vertexAlphas: M.vertexColors === true && !!K.attributes.color && K.attributes.color.itemSize === 4, pointsUvs: z.isPoints === true && !!K.attributes.uv && (he || $), fog: !!X, useFog: M.fog === true, fogExp2: !!X && X.isFogExp2, flatShading: M.flatShading === true, sizeAttenuation: M.sizeAttenuation === true, logarithmicDepthBuffer: u, reverseDepthBuffer: bt, skinning: z.isSkinnedMesh === true, morphTargets: K.morphAttributes.position !== void 0, morphNormals: K.morphAttributes.normal !== void 0, morphColors: K.morphAttributes.color !== void 0, morphTargetsCount: vt, morphTextureStride: Ot, numDirLights: y.directional.length, numPointLights: y.point.length, numSpotLights: y.spot.length, numSpotLightMaps: y.spotLightMap.length, numRectAreaLights: y.rectArea.length, numHemiLights: y.hemi.length, numDirLightShadows: y.directionalShadowMap.length, numPointLightShadows: y.pointShadowMap.length, numSpotLightShadows: y.spotShadowMap.length, numSpotLightShadowsWithMaps: y.numSpotLightShadowsWithMaps, numLightProbes: y.numLightProbes, numClippingPlanes: o.numPlanes, numClipIntersection: o.numIntersection, dithering: M.dithering, shadowMapEnabled: s.shadowMap.enabled && P.length > 0, shadowMapType: s.shadowMap.type, toneMapping: le, decodeVideoTexture: he && M.map.isVideoTexture === true && Yt.getTransfer(M.map.colorSpace) === Qt, decodeVideoTextureEmissive: se && M.emissiveMap.isVideoTexture === true && Yt.getTransfer(M.emissiveMap.colorSpace) === Qt, premultipliedAlpha: M.premultipliedAlpha, doubleSided: M.side === $e, flipSided: M.side === Fe, useDepthPacking: M.depthPacking >= 0, depthPacking: M.depthPacking || 0, index0AttributeName: M.index0AttributeName, extensionClipCullDistance: Lt && M.extensions.clipCullDistance === true && n.has("WEBGL_clip_cull_distance"), extensionMultiDraw: (Lt && M.extensions.multiDraw === true || wt) && n.has("WEBGL_multi_draw"), rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"), customProgramCacheKey: M.customProgramCacheKey() };
    return Ee.vertexUv1s = c.has(1), Ee.vertexUv2s = c.has(2), Ee.vertexUv3s = c.has(3), c.clear(), Ee;
  }
  function f(M) {
    const y = [];
    if (M.shaderID ? y.push(M.shaderID) : (y.push(M.customVertexShaderID), y.push(M.customFragmentShaderID)), M.defines !== void 0) for (const P in M.defines) y.push(P), y.push(M.defines[P]);
    return M.isRawShaderMaterial === false && (A(y, M), T(y, M), y.push(s.outputColorSpace)), y.push(M.customProgramCacheKey), y.join();
  }
  function A(M, y) {
    M.push(y.precision), M.push(y.outputColorSpace), M.push(y.envMapMode), M.push(y.envMapCubeUVHeight), M.push(y.mapUv), M.push(y.alphaMapUv), M.push(y.lightMapUv), M.push(y.aoMapUv), M.push(y.bumpMapUv), M.push(y.normalMapUv), M.push(y.displacementMapUv), M.push(y.emissiveMapUv), M.push(y.metalnessMapUv), M.push(y.roughnessMapUv), M.push(y.anisotropyMapUv), M.push(y.clearcoatMapUv), M.push(y.clearcoatNormalMapUv), M.push(y.clearcoatRoughnessMapUv), M.push(y.iridescenceMapUv), M.push(y.iridescenceThicknessMapUv), M.push(y.sheenColorMapUv), M.push(y.sheenRoughnessMapUv), M.push(y.specularMapUv), M.push(y.specularColorMapUv), M.push(y.specularIntensityMapUv), M.push(y.transmissionMapUv), M.push(y.thicknessMapUv), M.push(y.combine), M.push(y.fogExp2), M.push(y.sizeAttenuation), M.push(y.morphTargetsCount), M.push(y.morphAttributeCount), M.push(y.numDirLights), M.push(y.numPointLights), M.push(y.numSpotLights), M.push(y.numSpotLightMaps), M.push(y.numHemiLights), M.push(y.numRectAreaLights), M.push(y.numDirLightShadows), M.push(y.numPointLightShadows), M.push(y.numSpotLightShadows), M.push(y.numSpotLightShadowsWithMaps), M.push(y.numLightProbes), M.push(y.shadowMapType), M.push(y.toneMapping), M.push(y.numClippingPlanes), M.push(y.numClipIntersection), M.push(y.depthPacking);
  }
  function T(M, y) {
    a.disableAll(), y.supportsVertexTextures && a.enable(0), y.instancing && a.enable(1), y.instancingColor && a.enable(2), y.instancingMorph && a.enable(3), y.matcap && a.enable(4), y.envMap && a.enable(5), y.normalMapObjectSpace && a.enable(6), y.normalMapTangentSpace && a.enable(7), y.clearcoat && a.enable(8), y.iridescence && a.enable(9), y.alphaTest && a.enable(10), y.vertexColors && a.enable(11), y.vertexAlphas && a.enable(12), y.vertexUv1s && a.enable(13), y.vertexUv2s && a.enable(14), y.vertexUv3s && a.enable(15), y.vertexTangents && a.enable(16), y.anisotropy && a.enable(17), y.alphaHash && a.enable(18), y.batching && a.enable(19), y.dispersion && a.enable(20), y.batchingColor && a.enable(21), M.push(a.mask), a.disableAll(), y.fog && a.enable(0), y.useFog && a.enable(1), y.flatShading && a.enable(2), y.logarithmicDepthBuffer && a.enable(3), y.reverseDepthBuffer && a.enable(4), y.skinning && a.enable(5), y.morphTargets && a.enable(6), y.morphNormals && a.enable(7), y.morphColors && a.enable(8), y.premultipliedAlpha && a.enable(9), y.shadowMapEnabled && a.enable(10), y.doubleSided && a.enable(11), y.flipSided && a.enable(12), y.useDepthPacking && a.enable(13), y.dithering && a.enable(14), y.transmission && a.enable(15), y.sheen && a.enable(16), y.opaque && a.enable(17), y.pointsUvs && a.enable(18), y.decodeVideoTexture && a.enable(19), y.decodeVideoTextureEmissive && a.enable(20), y.alphaToCoverage && a.enable(21), M.push(a.mask);
  }
  function S(M) {
    const y = g[M.type];
    let P;
    if (y) {
      const V = Ne[y];
      P = Pa.clone(V.uniforms);
    } else P = M.uniforms;
    return P;
  }
  function I(M, y) {
    let P;
    for (let V = 0, z = h.length; V < z; V++) {
      const X = h[V];
      if (X.cacheKey === y) {
        P = X, ++P.usedTimes;
        break;
      }
    }
    return P === void 0 && (P = new mg(s, y, M, r), h.push(P)), P;
  }
  function w(M) {
    if (--M.usedTimes === 0) {
      const y = h.indexOf(M);
      h[y] = h[h.length - 1], h.pop(), M.destroy();
    }
  }
  function C(M) {
    l.remove(M);
  }
  function N() {
    l.dispose();
  }
  return { getParameters: m, getProgramCacheKey: f, getUniforms: S, acquireProgram: I, releaseProgram: w, releaseShaderCache: C, programs: h, dispose: N };
}
function yg() {
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
function Mg(s, t) {
  return s.groupOrder !== t.groupOrder ? s.groupOrder - t.groupOrder : s.renderOrder !== t.renderOrder ? s.renderOrder - t.renderOrder : s.material.id !== t.material.id ? s.material.id - t.material.id : s.z !== t.z ? s.z - t.z : s.id - t.id;
}
function jl(s, t) {
  return s.groupOrder !== t.groupOrder ? s.groupOrder - t.groupOrder : s.renderOrder !== t.renderOrder ? s.renderOrder - t.renderOrder : s.z !== t.z ? t.z - s.z : s.id - t.id;
}
function Kl() {
  const s = [];
  let t = 0;
  const e = [], n = [], i = [];
  function r() {
    t = 0, e.length = 0, n.length = 0, i.length = 0;
  }
  function o(u, d, p, g, _, m) {
    let f = s[t];
    return f === void 0 ? (f = { id: u.id, object: u, geometry: d, material: p, groupOrder: g, renderOrder: u.renderOrder, z: _, group: m }, s[t] = f) : (f.id = u.id, f.object = u, f.geometry = d, f.material = p, f.groupOrder = g, f.renderOrder = u.renderOrder, f.z = _, f.group = m), t++, f;
  }
  function a(u, d, p, g, _, m) {
    const f = o(u, d, p, g, _, m);
    p.transmission > 0 ? n.push(f) : p.transparent === true ? i.push(f) : e.push(f);
  }
  function l(u, d, p, g, _, m) {
    const f = o(u, d, p, g, _, m);
    p.transmission > 0 ? n.unshift(f) : p.transparent === true ? i.unshift(f) : e.unshift(f);
  }
  function c(u, d) {
    e.length > 1 && e.sort(u || Mg), n.length > 1 && n.sort(d || jl), i.length > 1 && i.sort(d || jl);
  }
  function h() {
    for (let u = t, d = s.length; u < d; u++) {
      const p = s[u];
      if (p.id === null) break;
      p.id = null, p.object = null, p.geometry = null, p.material = null, p.group = null;
    }
  }
  return { opaque: e, transmissive: n, transparent: i, init: r, push: a, unshift: l, finish: h, sort: c };
}
function Sg() {
  let s = /* @__PURE__ */ new WeakMap();
  function t(n, i) {
    const r = s.get(n);
    let o;
    return r === void 0 ? (o = new Kl(), s.set(n, [o])) : i >= r.length ? (o = new Kl(), r.push(o)) : o = r[i], o;
  }
  function e() {
    s = /* @__PURE__ */ new WeakMap();
  }
  return { get: t, dispose: e };
}
function Eg() {
  const s = {};
  return { get: function(t) {
    if (s[t.id] !== void 0) return s[t.id];
    let e;
    switch (t.type) {
      case "DirectionalLight":
        e = { direction: new b(), color: new Wt() };
        break;
      case "SpotLight":
        e = { position: new b(), direction: new b(), color: new Wt(), distance: 0, coneCos: 0, penumbraCos: 0, decay: 0 };
        break;
      case "PointLight":
        e = { position: new b(), color: new Wt(), distance: 0, decay: 0 };
        break;
      case "HemisphereLight":
        e = { direction: new b(), skyColor: new Wt(), groundColor: new Wt() };
        break;
      case "RectAreaLight":
        e = { color: new Wt(), position: new b(), halfWidth: new b(), halfHeight: new b() };
        break;
    }
    return s[t.id] = e, e;
  } };
}
function bg() {
  const s = {};
  return { get: function(t) {
    if (s[t.id] !== void 0) return s[t.id];
    let e;
    switch (t.type) {
      case "DirectionalLight":
        e = { shadowIntensity: 1, shadowBias: 0, shadowNormalBias: 0, shadowRadius: 1, shadowMapSize: new Et() };
        break;
      case "SpotLight":
        e = { shadowIntensity: 1, shadowBias: 0, shadowNormalBias: 0, shadowRadius: 1, shadowMapSize: new Et() };
        break;
      case "PointLight":
        e = { shadowIntensity: 1, shadowBias: 0, shadowNormalBias: 0, shadowRadius: 1, shadowMapSize: new Et(), shadowCameraNear: 1, shadowCameraFar: 1e3 };
        break;
    }
    return s[t.id] = e, e;
  } };
}
let Tg = 0;
function wg(s, t) {
  return (t.castShadow ? 2 : 0) - (s.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (s.map ? 1 : 0);
}
function Ag(s) {
  const t = new Eg(), e = bg(), n = { version: 0, hash: { directionalLength: -1, pointLength: -1, spotLength: -1, rectAreaLength: -1, hemiLength: -1, numDirectionalShadows: -1, numPointShadows: -1, numSpotShadows: -1, numSpotMaps: -1, numLightProbes: -1 }, ambient: [0, 0, 0], probe: [], directional: [], directionalShadow: [], directionalShadowMap: [], directionalShadowMatrix: [], spot: [], spotLightMap: [], spotShadow: [], spotShadowMap: [], spotLightMatrix: [], rectArea: [], rectAreaLTC1: null, rectAreaLTC2: null, point: [], pointShadow: [], pointShadowMap: [], pointShadowMatrix: [], hemi: [], numSpotLightShadowsWithMaps: 0, numLightProbes: 0 };
  for (let c = 0; c < 9; c++) n.probe.push(new b());
  const i = new b(), r = new Kt(), o = new Kt();
  function a(c) {
    let h = 0, u = 0, d = 0;
    for (let M = 0; M < 9; M++) n.probe[M].set(0, 0, 0);
    let p = 0, g = 0, _ = 0, m = 0, f = 0, A = 0, T = 0, S = 0, I = 0, w = 0, C = 0;
    c.sort(wg);
    for (let M = 0, y = c.length; M < y; M++) {
      const P = c[M], V = P.color, z = P.intensity, X = P.distance, K = P.shadow && P.shadow.map ? P.shadow.map.texture : null;
      if (P.isAmbientLight) h += V.r * z, u += V.g * z, d += V.b * z;
      else if (P.isLightProbe) {
        for (let G = 0; G < 9; G++) n.probe[G].addScaledVector(P.sh.coefficients[G], z);
        C++;
      } else if (P.isDirectionalLight) {
        const G = t.get(P);
        if (G.color.copy(P.color).multiplyScalar(P.intensity), P.castShadow) {
          const Q = P.shadow, H = e.get(P);
          H.shadowIntensity = Q.intensity, H.shadowBias = Q.bias, H.shadowNormalBias = Q.normalBias, H.shadowRadius = Q.radius, H.shadowMapSize = Q.mapSize, n.directionalShadow[p] = H, n.directionalShadowMap[p] = K, n.directionalShadowMatrix[p] = P.shadow.matrix, A++;
        }
        n.directional[p] = G, p++;
      } else if (P.isSpotLight) {
        const G = t.get(P);
        G.position.setFromMatrixPosition(P.matrixWorld), G.color.copy(V).multiplyScalar(z), G.distance = X, G.coneCos = Math.cos(P.angle), G.penumbraCos = Math.cos(P.angle * (1 - P.penumbra)), G.decay = P.decay, n.spot[_] = G;
        const Q = P.shadow;
        if (P.map && (n.spotLightMap[I] = P.map, I++, Q.updateMatrices(P), P.castShadow && w++), n.spotLightMatrix[_] = Q.matrix, P.castShadow) {
          const H = e.get(P);
          H.shadowIntensity = Q.intensity, H.shadowBias = Q.bias, H.shadowNormalBias = Q.normalBias, H.shadowRadius = Q.radius, H.shadowMapSize = Q.mapSize, n.spotShadow[_] = H, n.spotShadowMap[_] = K, S++;
        }
        _++;
      } else if (P.isRectAreaLight) {
        const G = t.get(P);
        G.color.copy(V).multiplyScalar(z), G.halfWidth.set(P.width * 0.5, 0, 0), G.halfHeight.set(0, P.height * 0.5, 0), n.rectArea[m] = G, m++;
      } else if (P.isPointLight) {
        const G = t.get(P);
        if (G.color.copy(P.color).multiplyScalar(P.intensity), G.distance = P.distance, G.decay = P.decay, P.castShadow) {
          const Q = P.shadow, H = e.get(P);
          H.shadowIntensity = Q.intensity, H.shadowBias = Q.bias, H.shadowNormalBias = Q.normalBias, H.shadowRadius = Q.radius, H.shadowMapSize = Q.mapSize, H.shadowCameraNear = Q.camera.near, H.shadowCameraFar = Q.camera.far, n.pointShadow[g] = H, n.pointShadowMap[g] = K, n.pointShadowMatrix[g] = P.shadow.matrix, T++;
        }
        n.point[g] = G, g++;
      } else if (P.isHemisphereLight) {
        const G = t.get(P);
        G.skyColor.copy(P.color).multiplyScalar(z), G.groundColor.copy(P.groundColor).multiplyScalar(z), n.hemi[f] = G, f++;
      }
    }
    m > 0 && (s.has("OES_texture_float_linear") === true ? (n.rectAreaLTC1 = et.LTC_FLOAT_1, n.rectAreaLTC2 = et.LTC_FLOAT_2) : (n.rectAreaLTC1 = et.LTC_HALF_1, n.rectAreaLTC2 = et.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = u, n.ambient[2] = d;
    const N = n.hash;
    (N.directionalLength !== p || N.pointLength !== g || N.spotLength !== _ || N.rectAreaLength !== m || N.hemiLength !== f || N.numDirectionalShadows !== A || N.numPointShadows !== T || N.numSpotShadows !== S || N.numSpotMaps !== I || N.numLightProbes !== C) && (n.directional.length = p, n.spot.length = _, n.rectArea.length = m, n.point.length = g, n.hemi.length = f, n.directionalShadow.length = A, n.directionalShadowMap.length = A, n.pointShadow.length = T, n.pointShadowMap.length = T, n.spotShadow.length = S, n.spotShadowMap.length = S, n.directionalShadowMatrix.length = A, n.pointShadowMatrix.length = T, n.spotLightMatrix.length = S + I - w, n.spotLightMap.length = I, n.numSpotLightShadowsWithMaps = w, n.numLightProbes = C, N.directionalLength = p, N.pointLength = g, N.spotLength = _, N.rectAreaLength = m, N.hemiLength = f, N.numDirectionalShadows = A, N.numPointShadows = T, N.numSpotShadows = S, N.numSpotMaps = I, N.numLightProbes = C, n.version = Tg++);
  }
  function l(c, h) {
    let u = 0, d = 0, p = 0, g = 0, _ = 0;
    const m = h.matrixWorldInverse;
    for (let f = 0, A = c.length; f < A; f++) {
      const T = c[f];
      if (T.isDirectionalLight) {
        const S = n.directional[u];
        S.direction.setFromMatrixPosition(T.matrixWorld), i.setFromMatrixPosition(T.target.matrixWorld), S.direction.sub(i), S.direction.transformDirection(m), u++;
      } else if (T.isSpotLight) {
        const S = n.spot[p];
        S.position.setFromMatrixPosition(T.matrixWorld), S.position.applyMatrix4(m), S.direction.setFromMatrixPosition(T.matrixWorld), i.setFromMatrixPosition(T.target.matrixWorld), S.direction.sub(i), S.direction.transformDirection(m), p++;
      } else if (T.isRectAreaLight) {
        const S = n.rectArea[g];
        S.position.setFromMatrixPosition(T.matrixWorld), S.position.applyMatrix4(m), o.identity(), r.copy(T.matrixWorld), r.premultiply(m), o.extractRotation(r), S.halfWidth.set(T.width * 0.5, 0, 0), S.halfHeight.set(0, T.height * 0.5, 0), S.halfWidth.applyMatrix4(o), S.halfHeight.applyMatrix4(o), g++;
      } else if (T.isPointLight) {
        const S = n.point[d];
        S.position.setFromMatrixPosition(T.matrixWorld), S.position.applyMatrix4(m), d++;
      } else if (T.isHemisphereLight) {
        const S = n.hemi[_];
        S.direction.setFromMatrixPosition(T.matrixWorld), S.direction.transformDirection(m), _++;
      }
    }
  }
  return { setup: a, setupView: l, state: n };
}
function Zl(s) {
  const t = new Ag(s), e = [], n = [];
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
function Cg(s) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(i, r = 0) {
    const o = t.get(i);
    let a;
    return o === void 0 ? (a = new Zl(s), t.set(i, [a])) : r >= o.length ? (a = new Zl(s), o.push(a)) : a = o[r], a;
  }
  function n() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return { get: e, dispose: n };
}
const Rg = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, Pg = `uniform sampler2D shadow_pass;
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
function Lg(s, t, e) {
  let n = new Vc();
  const i = new Et(), r = new Et(), o = new ie(), a = new Ju({ depthPacking: Yh }), l = new Qu(), c = {}, h = e.maxTextureSize, u = { [Yn]: Fe, [Fe]: Yn, [$e]: $e }, d = new pn({ defines: { VSM_SAMPLES: 8 }, uniforms: { shadow_pass: { value: null }, resolution: { value: new Et() }, radius: { value: 4 } }, vertexShader: Rg, fragmentShader: Pg }), p = d.clone();
  p.defines.HORIZONTAL_PASS = 1;
  const g = new me();
  g.setAttribute("position", new oe(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3));
  const _ = new Ke(g, d), m = this;
  this.enabled = false, this.autoUpdate = true, this.needsUpdate = false, this.type = _c;
  let f = this.type;
  this.render = function(w, C, N) {
    if (m.enabled === false || m.autoUpdate === false && m.needsUpdate === false || w.length === 0) return;
    const M = s.getRenderTarget(), y = s.getActiveCubeFace(), P = s.getActiveMipmapLevel(), V = s.state;
    V.setBlending(Wn), V.buffers.color.setClear(1, 1, 1, 1), V.buffers.depth.setTest(true), V.setScissorTest(false);
    const z = f !== Sn && this.type === Sn, X = f === Sn && this.type !== Sn;
    for (let K = 0, G = w.length; K < G; K++) {
      const Q = w[K], H = Q.shadow;
      if (H === void 0) {
        console.warn("THREE.WebGLShadowMap:", Q, "has no shadow.");
        continue;
      }
      if (H.autoUpdate === false && H.needsUpdate === false) continue;
      i.copy(H.mapSize);
      const rt = H.getFrameExtents();
      if (i.multiply(rt), r.copy(H.mapSize), (i.x > h || i.y > h) && (i.x > h && (r.x = Math.floor(h / rt.x), i.x = r.x * rt.x, H.mapSize.x = r.x), i.y > h && (r.y = Math.floor(h / rt.y), i.y = r.y * rt.y, H.mapSize.y = r.y)), H.map === null || z === true || X === true) {
        const vt = this.type !== Sn ? { minFilter: rn, magFilter: rn } : {};
        H.map !== null && H.map.dispose(), H.map = new mi(i.x, i.y, vt), H.map.texture.name = Q.name + ".shadowMap", H.camera.updateProjectionMatrix();
      }
      s.setRenderTarget(H.map), s.clear();
      const ut = H.getViewportCount();
      for (let vt = 0; vt < ut; vt++) {
        const Ot = H.getViewport(vt);
        o.set(r.x * Ot.x, r.y * Ot.y, r.x * Ot.z, r.y * Ot.w), V.viewport(o), H.updateMatrices(Q, vt), n = H.getFrustum(), S(C, N, H.camera, Q, this.type);
      }
      H.isPointLightShadow !== true && this.type === Sn && A(H, N), H.needsUpdate = false;
    }
    f = this.type, m.needsUpdate = false, s.setRenderTarget(M, y, P);
  };
  function A(w, C) {
    const N = t.update(_);
    d.defines.VSM_SAMPLES !== w.blurSamples && (d.defines.VSM_SAMPLES = w.blurSamples, p.defines.VSM_SAMPLES = w.blurSamples, d.needsUpdate = true, p.needsUpdate = true), w.mapPass === null && (w.mapPass = new mi(i.x, i.y)), d.uniforms.shadow_pass.value = w.map.texture, d.uniforms.resolution.value = w.mapSize, d.uniforms.radius.value = w.radius, s.setRenderTarget(w.mapPass), s.clear(), s.renderBufferDirect(C, null, N, d, _, null), p.uniforms.shadow_pass.value = w.mapPass.texture, p.uniforms.resolution.value = w.mapSize, p.uniforms.radius.value = w.radius, s.setRenderTarget(w.map), s.clear(), s.renderBufferDirect(C, null, N, p, _, null);
  }
  function T(w, C, N, M) {
    let y = null;
    const P = N.isPointLight === true ? w.customDistanceMaterial : w.customDepthMaterial;
    if (P !== void 0) y = P;
    else if (y = N.isPointLight === true ? l : a, s.localClippingEnabled && C.clipShadows === true && Array.isArray(C.clippingPlanes) && C.clippingPlanes.length !== 0 || C.displacementMap && C.displacementScale !== 0 || C.alphaMap && C.alphaTest > 0 || C.map && C.alphaTest > 0) {
      const V = y.uuid, z = C.uuid;
      let X = c[V];
      X === void 0 && (X = {}, c[V] = X);
      let K = X[z];
      K === void 0 && (K = y.clone(), X[z] = K, C.addEventListener("dispose", I)), y = K;
    }
    if (y.visible = C.visible, y.wireframe = C.wireframe, M === Sn ? y.side = C.shadowSide !== null ? C.shadowSide : C.side : y.side = C.shadowSide !== null ? C.shadowSide : u[C.side], y.alphaMap = C.alphaMap, y.alphaTest = C.alphaTest, y.map = C.map, y.clipShadows = C.clipShadows, y.clippingPlanes = C.clippingPlanes, y.clipIntersection = C.clipIntersection, y.displacementMap = C.displacementMap, y.displacementScale = C.displacementScale, y.displacementBias = C.displacementBias, y.wireframeLinewidth = C.wireframeLinewidth, y.linewidth = C.linewidth, N.isPointLight === true && y.isMeshDistanceMaterial === true) {
      const V = s.properties.get(y);
      V.light = N;
    }
    return y;
  }
  function S(w, C, N, M, y) {
    if (w.visible === false) return;
    if (w.layers.test(C.layers) && (w.isMesh || w.isLine || w.isPoints) && (w.castShadow || w.receiveShadow && y === Sn) && (!w.frustumCulled || n.intersectsObject(w))) {
      w.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse, w.matrixWorld);
      const z = t.update(w), X = w.material;
      if (Array.isArray(X)) {
        const K = z.groups;
        for (let G = 0, Q = K.length; G < Q; G++) {
          const H = K[G], rt = X[H.materialIndex];
          if (rt && rt.visible) {
            const ut = T(w, rt, M, y);
            w.onBeforeShadow(s, w, C, N, z, ut, H), s.renderBufferDirect(N, null, z, ut, w, H), w.onAfterShadow(s, w, C, N, z, ut, H);
          }
        }
      } else if (X.visible) {
        const K = T(w, X, M, y);
        w.onBeforeShadow(s, w, C, N, z, K, null), s.renderBufferDirect(N, null, z, K, w, null), w.onAfterShadow(s, w, C, N, z, K, null);
      }
    }
    const V = w.children;
    for (let z = 0, X = V.length; z < X; z++) S(V[z], C, N, M, y);
  }
  function I(w) {
    w.target.removeEventListener("dispose", I);
    for (const N in c) {
      const M = c[N], y = w.target.uuid;
      y in M && (M[y].dispose(), delete M[y]);
    }
  }
}
const Dg = { [Do]: Uo, [Io]: Oo, [No]: Bo, [ji]: Fo, [Uo]: Do, [Oo]: Io, [Bo]: No, [Fo]: ji };
function Ug(s, t) {
  function e() {
    let L = false;
    const it = new ie();
    let k = null;
    const $ = new ie(0, 0, 0, 0);
    return { setMask: function(ct) {
      k !== ct && !L && (s.colorMask(ct, ct, ct, ct), k = ct);
    }, setLocked: function(ct) {
      L = ct;
    }, setClear: function(ct, lt, Lt, le, Ee) {
      Ee === true && (ct *= le, lt *= le, Lt *= le), it.set(ct, lt, Lt, le), $.equals(it) === false && (s.clearColor(ct, lt, Lt, le), $.copy(it));
    }, reset: function() {
      L = false, k = null, $.set(-1, 0, 0, 0);
    } };
  }
  function n() {
    let L = false, it = false, k = null, $ = null, ct = null;
    return { setReversed: function(lt) {
      if (it !== lt) {
        const Lt = t.get("EXT_clip_control");
        it ? Lt.clipControlEXT(Lt.LOWER_LEFT_EXT, Lt.ZERO_TO_ONE_EXT) : Lt.clipControlEXT(Lt.LOWER_LEFT_EXT, Lt.NEGATIVE_ONE_TO_ONE_EXT);
        const le = ct;
        ct = null, this.setClear(le);
      }
      it = lt;
    }, getReversed: function() {
      return it;
    }, setTest: function(lt) {
      lt ? ot(s.DEPTH_TEST) : bt(s.DEPTH_TEST);
    }, setMask: function(lt) {
      k !== lt && !L && (s.depthMask(lt), k = lt);
    }, setFunc: function(lt) {
      if (it && (lt = Dg[lt]), $ !== lt) {
        switch (lt) {
          case Do:
            s.depthFunc(s.NEVER);
            break;
          case Uo:
            s.depthFunc(s.ALWAYS);
            break;
          case Io:
            s.depthFunc(s.LESS);
            break;
          case ji:
            s.depthFunc(s.LEQUAL);
            break;
          case No:
            s.depthFunc(s.EQUAL);
            break;
          case Fo:
            s.depthFunc(s.GEQUAL);
            break;
          case Oo:
            s.depthFunc(s.GREATER);
            break;
          case Bo:
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
      ct !== lt && (it && (lt = 1 - lt), s.clearDepth(lt), ct = lt);
    }, reset: function() {
      L = false, k = null, $ = null, ct = null, it = false;
    } };
  }
  function i() {
    let L = false, it = null, k = null, $ = null, ct = null, lt = null, Lt = null, le = null, Ee = null;
    return { setTest: function(Zt) {
      L || (Zt ? ot(s.STENCIL_TEST) : bt(s.STENCIL_TEST));
    }, setMask: function(Zt) {
      it !== Zt && !L && (s.stencilMask(Zt), it = Zt);
    }, setFunc: function(Zt, Ze, mn) {
      (k !== Zt || $ !== Ze || ct !== mn) && (s.stencilFunc(Zt, Ze, mn), k = Zt, $ = Ze, ct = mn);
    }, setOp: function(Zt, Ze, mn) {
      (lt !== Zt || Lt !== Ze || le !== mn) && (s.stencilOp(Zt, Ze, mn), lt = Zt, Lt = Ze, le = mn);
    }, setLocked: function(Zt) {
      L = Zt;
    }, setClear: function(Zt) {
      Ee !== Zt && (s.clearStencil(Zt), Ee = Zt);
    }, reset: function() {
      L = false, it = null, k = null, $ = null, ct = null, lt = null, Lt = null, le = null, Ee = null;
    } };
  }
  const r = new e(), o = new n(), a = new i(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let h = {}, u = {}, d = /* @__PURE__ */ new WeakMap(), p = [], g = null, _ = false, m = null, f = null, A = null, T = null, S = null, I = null, w = null, C = new Wt(0, 0, 0), N = 0, M = false, y = null, P = null, V = null, z = null, X = null;
  const K = s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let G = false, Q = 0;
  const H = s.getParameter(s.VERSION);
  H.indexOf("WebGL") !== -1 ? (Q = parseFloat(/^WebGL (\d)/.exec(H)[1]), G = Q >= 1) : H.indexOf("OpenGL ES") !== -1 && (Q = parseFloat(/^OpenGL ES (\d)/.exec(H)[1]), G = Q >= 2);
  let rt = null, ut = {};
  const vt = s.getParameter(s.SCISSOR_BOX), Ot = s.getParameter(s.VIEWPORT), ee = new ie().fromArray(vt), Y = new ie().fromArray(Ot);
  function tt(L, it, k, $) {
    const ct = new Uint8Array(4), lt = s.createTexture();
    s.bindTexture(L, lt), s.texParameteri(L, s.TEXTURE_MIN_FILTER, s.NEAREST), s.texParameteri(L, s.TEXTURE_MAG_FILTER, s.NEAREST);
    for (let Lt = 0; Lt < k; Lt++) L === s.TEXTURE_3D || L === s.TEXTURE_2D_ARRAY ? s.texImage3D(it, 0, s.RGBA, 1, 1, $, 0, s.RGBA, s.UNSIGNED_BYTE, ct) : s.texImage2D(it + Lt, 0, s.RGBA, 1, 1, 0, s.RGBA, s.UNSIGNED_BYTE, ct);
    return lt;
  }
  const gt = {};
  gt[s.TEXTURE_2D] = tt(s.TEXTURE_2D, s.TEXTURE_2D, 1), gt[s.TEXTURE_CUBE_MAP] = tt(s.TEXTURE_CUBE_MAP, s.TEXTURE_CUBE_MAP_POSITIVE_X, 6), gt[s.TEXTURE_2D_ARRAY] = tt(s.TEXTURE_2D_ARRAY, s.TEXTURE_2D_ARRAY, 1, 1), gt[s.TEXTURE_3D] = tt(s.TEXTURE_3D, s.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), o.setClear(1), a.setClear(0), ot(s.DEPTH_TEST), o.setFunc(ji), zt(false), kt(Wa), ot(s.CULL_FACE), R(Wn);
  function ot(L) {
    h[L] !== true && (s.enable(L), h[L] = true);
  }
  function bt(L) {
    h[L] !== false && (s.disable(L), h[L] = false);
  }
  function qt(L, it) {
    return u[L] !== it ? (s.bindFramebuffer(L, it), u[L] = it, L === s.DRAW_FRAMEBUFFER && (u[s.FRAMEBUFFER] = it), L === s.FRAMEBUFFER && (u[s.DRAW_FRAMEBUFFER] = it), true) : false;
  }
  function wt(L, it) {
    let k = p, $ = false;
    if (L) {
      k = d.get(it), k === void 0 && (k = [], d.set(it, k));
      const ct = L.textures;
      if (k.length !== ct.length || k[0] !== s.COLOR_ATTACHMENT0) {
        for (let lt = 0, Lt = ct.length; lt < Lt; lt++) k[lt] = s.COLOR_ATTACHMENT0 + lt;
        k.length = ct.length, $ = true;
      }
    } else k[0] !== s.BACK && (k[0] = s.BACK, $ = true);
    $ && s.drawBuffers(k);
  }
  function he(L) {
    return g !== L ? (s.useProgram(L), g = L, true) : false;
  }
  const ae = { [li]: s.FUNC_ADD, [xh]: s.FUNC_SUBTRACT, [vh]: s.FUNC_REVERSE_SUBTRACT };
  ae[yh] = s.MIN, ae[Mh] = s.MAX;
  const Bt = { [Sh]: s.ZERO, [Eh]: s.ONE, [bh]: s.SRC_COLOR, [Po]: s.SRC_ALPHA, [Ph]: s.SRC_ALPHA_SATURATE, [Ch]: s.DST_COLOR, [wh]: s.DST_ALPHA, [Th]: s.ONE_MINUS_SRC_COLOR, [Lo]: s.ONE_MINUS_SRC_ALPHA, [Rh]: s.ONE_MINUS_DST_COLOR, [Ah]: s.ONE_MINUS_DST_ALPHA, [Lh]: s.CONSTANT_COLOR, [Dh]: s.ONE_MINUS_CONSTANT_COLOR, [Uh]: s.CONSTANT_ALPHA, [Ih]: s.ONE_MINUS_CONSTANT_ALPHA };
  function R(L, it, k, $, ct, lt, Lt, le, Ee, Zt) {
    if (L === Wn) {
      _ === true && (bt(s.BLEND), _ = false);
      return;
    }
    if (_ === false && (ot(s.BLEND), _ = true), L !== _h) {
      if (L !== m || Zt !== M) {
        if ((f !== li || S !== li) && (s.blendEquation(s.FUNC_ADD), f = li, S = li), Zt) switch (L) {
          case Yi:
            s.blendFuncSeparate(s.ONE, s.ONE_MINUS_SRC_ALPHA, s.ONE, s.ONE_MINUS_SRC_ALPHA);
            break;
          case Xa:
            s.blendFunc(s.ONE, s.ONE);
            break;
          case Ya:
            s.blendFuncSeparate(s.ZERO, s.ONE_MINUS_SRC_COLOR, s.ZERO, s.ONE);
            break;
          case qa:
            s.blendFuncSeparate(s.ZERO, s.SRC_COLOR, s.ZERO, s.SRC_ALPHA);
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", L);
            break;
        }
        else switch (L) {
          case Yi:
            s.blendFuncSeparate(s.SRC_ALPHA, s.ONE_MINUS_SRC_ALPHA, s.ONE, s.ONE_MINUS_SRC_ALPHA);
            break;
          case Xa:
            s.blendFunc(s.SRC_ALPHA, s.ONE);
            break;
          case Ya:
            s.blendFuncSeparate(s.ZERO, s.ONE_MINUS_SRC_COLOR, s.ZERO, s.ONE);
            break;
          case qa:
            s.blendFunc(s.ZERO, s.SRC_COLOR);
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", L);
            break;
        }
        A = null, T = null, I = null, w = null, C.set(0, 0, 0), N = 0, m = L, M = Zt;
      }
      return;
    }
    ct = ct || it, lt = lt || k, Lt = Lt || $, (it !== f || ct !== S) && (s.blendEquationSeparate(ae[it], ae[ct]), f = it, S = ct), (k !== A || $ !== T || lt !== I || Lt !== w) && (s.blendFuncSeparate(Bt[k], Bt[$], Bt[lt], Bt[Lt]), A = k, T = $, I = lt, w = Lt), (le.equals(C) === false || Ee !== N) && (s.blendColor(le.r, le.g, le.b, Ee), C.copy(le), N = Ee), m = L, M = false;
  }
  function Ve(L, it) {
    L.side === $e ? bt(s.CULL_FACE) : ot(s.CULL_FACE);
    let k = L.side === Fe;
    it && (k = !k), zt(k), L.blending === Yi && L.transparent === false ? R(Wn) : R(L.blending, L.blendEquation, L.blendSrc, L.blendDst, L.blendEquationAlpha, L.blendSrcAlpha, L.blendDstAlpha, L.blendColor, L.blendAlpha, L.premultipliedAlpha), o.setFunc(L.depthFunc), o.setTest(L.depthTest), o.setMask(L.depthWrite), r.setMask(L.colorWrite);
    const $ = L.stencilWrite;
    a.setTest($), $ && (a.setMask(L.stencilWriteMask), a.setFunc(L.stencilFunc, L.stencilRef, L.stencilFuncMask), a.setOp(L.stencilFail, L.stencilZFail, L.stencilZPass)), se(L.polygonOffset, L.polygonOffsetFactor, L.polygonOffsetUnits), L.alphaToCoverage === true ? ot(s.SAMPLE_ALPHA_TO_COVERAGE) : bt(s.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function zt(L) {
    y !== L && (L ? s.frontFace(s.CW) : s.frontFace(s.CCW), y = L);
  }
  function kt(L) {
    L !== ph ? (ot(s.CULL_FACE), L !== P && (L === Wa ? s.cullFace(s.BACK) : L === mh ? s.cullFace(s.FRONT) : s.cullFace(s.FRONT_AND_BACK))) : bt(s.CULL_FACE), P = L;
  }
  function yt(L) {
    L !== V && (G && s.lineWidth(L), V = L);
  }
  function se(L, it, k) {
    L ? (ot(s.POLYGON_OFFSET_FILL), (z !== it || X !== k) && (s.polygonOffset(it, k), z = it, X = k)) : bt(s.POLYGON_OFFSET_FILL);
  }
  function xt(L) {
    L ? ot(s.SCISSOR_TEST) : bt(s.SCISSOR_TEST);
  }
  function E(L) {
    L === void 0 && (L = s.TEXTURE0 + K - 1), rt !== L && (s.activeTexture(L), rt = L);
  }
  function x(L, it, k) {
    k === void 0 && (rt === null ? k = s.TEXTURE0 + K - 1 : k = rt);
    let $ = ut[k];
    $ === void 0 && ($ = { type: void 0, texture: void 0 }, ut[k] = $), ($.type !== L || $.texture !== it) && (rt !== k && (s.activeTexture(k), rt = k), s.bindTexture(L, it || gt[L]), $.type = L, $.texture = it);
  }
  function F() {
    const L = ut[rt];
    L !== void 0 && L.type !== void 0 && (s.bindTexture(L.type, null), L.type = void 0, L.texture = void 0);
  }
  function q() {
    try {
      s.compressedTexImage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function j() {
    try {
      s.compressedTexImage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function W() {
    try {
      s.texSubImage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function _t() {
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
  function dt() {
    try {
      s.compressedTexSubImage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function Vt() {
    try {
      s.texStorage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function J() {
    try {
      s.texStorage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function ft() {
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
    ee.equals(L) === false && (s.scissor(L.x, L.y, L.z, L.w), ee.copy(L));
  }
  function pt(L) {
    Y.equals(L) === false && (s.viewport(L.x, L.y, L.z, L.w), Y.copy(L));
  }
  function Ht(L, it) {
    let k = c.get(it);
    k === void 0 && (k = /* @__PURE__ */ new WeakMap(), c.set(it, k));
    let $ = k.get(L);
    $ === void 0 && ($ = s.getUniformBlockIndex(it, L.name), k.set(L, $));
  }
  function It(L, it) {
    const $ = c.get(it).get(L);
    l.get(it) !== $ && (s.uniformBlockBinding(it, $, L.__bindingPointIndex), l.set(it, $));
  }
  function ne() {
    s.disable(s.BLEND), s.disable(s.CULL_FACE), s.disable(s.DEPTH_TEST), s.disable(s.POLYGON_OFFSET_FILL), s.disable(s.SCISSOR_TEST), s.disable(s.STENCIL_TEST), s.disable(s.SAMPLE_ALPHA_TO_COVERAGE), s.blendEquation(s.FUNC_ADD), s.blendFunc(s.ONE, s.ZERO), s.blendFuncSeparate(s.ONE, s.ZERO, s.ONE, s.ZERO), s.blendColor(0, 0, 0, 0), s.colorMask(true, true, true, true), s.clearColor(0, 0, 0, 0), s.depthMask(true), s.depthFunc(s.LESS), o.setReversed(false), s.clearDepth(1), s.stencilMask(4294967295), s.stencilFunc(s.ALWAYS, 0, 4294967295), s.stencilOp(s.KEEP, s.KEEP, s.KEEP), s.clearStencil(0), s.cullFace(s.BACK), s.frontFace(s.CCW), s.polygonOffset(0, 0), s.activeTexture(s.TEXTURE0), s.bindFramebuffer(s.FRAMEBUFFER, null), s.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), s.bindFramebuffer(s.READ_FRAMEBUFFER, null), s.useProgram(null), s.lineWidth(1), s.scissor(0, 0, s.canvas.width, s.canvas.height), s.viewport(0, 0, s.canvas.width, s.canvas.height), h = {}, rt = null, ut = {}, u = {}, d = /* @__PURE__ */ new WeakMap(), p = [], g = null, _ = false, m = null, f = null, A = null, T = null, S = null, I = null, w = null, C = new Wt(0, 0, 0), N = 0, M = false, y = null, P = null, V = null, z = null, X = null, ee.set(0, 0, s.canvas.width, s.canvas.height), Y.set(0, 0, s.canvas.width, s.canvas.height), r.reset(), o.reset(), a.reset();
  }
  return { buffers: { color: r, depth: o, stencil: a }, enable: ot, disable: bt, bindFramebuffer: qt, drawBuffers: wt, useProgram: he, setBlending: R, setMaterial: Ve, setFlipSided: zt, setCullFace: kt, setLineWidth: yt, setPolygonOffset: se, setScissorTest: xt, activeTexture: E, bindTexture: x, unbindTexture: F, compressedTexImage2D: q, compressedTexImage3D: j, texImage2D: ft, texImage3D: Tt, updateUBOMapping: Ht, uniformBlockBinding: It, texStorage2D: Vt, texStorage3D: J, texSubImage2D: W, texSubImage3D: _t, compressedTexSubImage2D: at, compressedTexSubImage3D: dt, scissor: At, viewport: pt, reset: ne };
}
function Ig(s, t, e, n, i, r, o) {
  const a = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? false : /OculusBrowser/g.test(navigator.userAgent), c = new Et(), h = /* @__PURE__ */ new WeakMap();
  let u;
  const d = /* @__PURE__ */ new WeakMap();
  let p = false;
  try {
    p = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(E, x) {
    return p ? new OffscreenCanvas(E, x) : Pr("canvas");
  }
  function _(E, x, F) {
    let q = 1;
    const j = xt(E);
    if ((j.width > F || j.height > F) && (q = F / Math.max(j.width, j.height)), q < 1) if (typeof HTMLImageElement < "u" && E instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && E instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && E instanceof ImageBitmap || typeof VideoFrame < "u" && E instanceof VideoFrame) {
      const W = Math.floor(q * j.width), _t = Math.floor(q * j.height);
      u === void 0 && (u = g(W, _t));
      const at = x ? g(W, _t) : u;
      return at.width = W, at.height = _t, at.getContext("2d").drawImage(E, 0, 0, W, _t), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + j.width + "x" + j.height + ") to (" + W + "x" + _t + ")."), at;
    } else return "data" in E && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + j.width + "x" + j.height + ")."), E;
    return E;
  }
  function m(E) {
    return E.generateMipmaps;
  }
  function f(E) {
    s.generateMipmap(E);
  }
  function A(E) {
    return E.isWebGLCubeRenderTarget ? s.TEXTURE_CUBE_MAP : E.isWebGL3DRenderTarget ? s.TEXTURE_3D : E.isWebGLArrayRenderTarget || E.isCompressedArrayTexture ? s.TEXTURE_2D_ARRAY : s.TEXTURE_2D;
  }
  function T(E, x, F, q, j = false) {
    if (E !== null) {
      if (s[E] !== void 0) return s[E];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + E + "'");
    }
    let W = x;
    if (x === s.RED && (F === s.FLOAT && (W = s.R32F), F === s.HALF_FLOAT && (W = s.R16F), F === s.UNSIGNED_BYTE && (W = s.R8)), x === s.RED_INTEGER && (F === s.UNSIGNED_BYTE && (W = s.R8UI), F === s.UNSIGNED_SHORT && (W = s.R16UI), F === s.UNSIGNED_INT && (W = s.R32UI), F === s.BYTE && (W = s.R8I), F === s.SHORT && (W = s.R16I), F === s.INT && (W = s.R32I)), x === s.RG && (F === s.FLOAT && (W = s.RG32F), F === s.HALF_FLOAT && (W = s.RG16F), F === s.UNSIGNED_BYTE && (W = s.RG8)), x === s.RG_INTEGER && (F === s.UNSIGNED_BYTE && (W = s.RG8UI), F === s.UNSIGNED_SHORT && (W = s.RG16UI), F === s.UNSIGNED_INT && (W = s.RG32UI), F === s.BYTE && (W = s.RG8I), F === s.SHORT && (W = s.RG16I), F === s.INT && (W = s.RG32I)), x === s.RGB_INTEGER && (F === s.UNSIGNED_BYTE && (W = s.RGB8UI), F === s.UNSIGNED_SHORT && (W = s.RGB16UI), F === s.UNSIGNED_INT && (W = s.RGB32UI), F === s.BYTE && (W = s.RGB8I), F === s.SHORT && (W = s.RGB16I), F === s.INT && (W = s.RGB32I)), x === s.RGBA_INTEGER && (F === s.UNSIGNED_BYTE && (W = s.RGBA8UI), F === s.UNSIGNED_SHORT && (W = s.RGBA16UI), F === s.UNSIGNED_INT && (W = s.RGBA32UI), F === s.BYTE && (W = s.RGBA8I), F === s.SHORT && (W = s.RGBA16I), F === s.INT && (W = s.RGBA32I)), x === s.RGB && F === s.UNSIGNED_INT_5_9_9_9_REV && (W = s.RGB9_E5), x === s.RGBA) {
      const _t = j ? Cr : Yt.getTransfer(q);
      F === s.FLOAT && (W = s.RGBA32F), F === s.HALF_FLOAT && (W = s.RGBA16F), F === s.UNSIGNED_BYTE && (W = _t === Qt ? s.SRGB8_ALPHA8 : s.RGBA8), F === s.UNSIGNED_SHORT_4_4_4_4 && (W = s.RGBA4), F === s.UNSIGNED_SHORT_5_5_5_1 && (W = s.RGB5_A1);
    }
    return (W === s.R16F || W === s.R32F || W === s.RG16F || W === s.RG32F || W === s.RGBA16F || W === s.RGBA32F) && t.get("EXT_color_buffer_float"), W;
  }
  function S(E, x) {
    let F;
    return E ? x === null || x === pi || x === Ji ? F = s.DEPTH24_STENCIL8 : x === bn ? F = s.DEPTH32F_STENCIL8 : x === ws && (F = s.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : x === null || x === pi || x === Ji ? F = s.DEPTH_COMPONENT24 : x === bn ? F = s.DEPTH_COMPONENT32F : x === ws && (F = s.DEPTH_COMPONENT16), F;
  }
  function I(E, x) {
    return m(E) === true || E.isFramebufferTexture && E.minFilter !== rn && E.minFilter !== dn ? Math.log2(Math.max(x.width, x.height)) + 1 : E.mipmaps !== void 0 && E.mipmaps.length > 0 ? E.mipmaps.length : E.isCompressedTexture && Array.isArray(E.image) ? x.mipmaps.length : 1;
  }
  function w(E) {
    const x = E.target;
    x.removeEventListener("dispose", w), N(x), x.isVideoTexture && h.delete(x);
  }
  function C(E) {
    const x = E.target;
    x.removeEventListener("dispose", C), y(x);
  }
  function N(E) {
    const x = n.get(E);
    if (x.__webglInit === void 0) return;
    const F = E.source, q = d.get(F);
    if (q) {
      const j = q[x.__cacheKey];
      j.usedTimes--, j.usedTimes === 0 && M(E), Object.keys(q).length === 0 && d.delete(F);
    }
    n.remove(E);
  }
  function M(E) {
    const x = n.get(E);
    s.deleteTexture(x.__webglTexture);
    const F = E.source, q = d.get(F);
    delete q[x.__cacheKey], o.memory.textures--;
  }
  function y(E) {
    const x = n.get(E);
    if (E.depthTexture && (E.depthTexture.dispose(), n.remove(E.depthTexture)), E.isWebGLCubeRenderTarget) for (let q = 0; q < 6; q++) {
      if (Array.isArray(x.__webglFramebuffer[q])) for (let j = 0; j < x.__webglFramebuffer[q].length; j++) s.deleteFramebuffer(x.__webglFramebuffer[q][j]);
      else s.deleteFramebuffer(x.__webglFramebuffer[q]);
      x.__webglDepthbuffer && s.deleteRenderbuffer(x.__webglDepthbuffer[q]);
    }
    else {
      if (Array.isArray(x.__webglFramebuffer)) for (let q = 0; q < x.__webglFramebuffer.length; q++) s.deleteFramebuffer(x.__webglFramebuffer[q]);
      else s.deleteFramebuffer(x.__webglFramebuffer);
      if (x.__webglDepthbuffer && s.deleteRenderbuffer(x.__webglDepthbuffer), x.__webglMultisampledFramebuffer && s.deleteFramebuffer(x.__webglMultisampledFramebuffer), x.__webglColorRenderbuffer) for (let q = 0; q < x.__webglColorRenderbuffer.length; q++) x.__webglColorRenderbuffer[q] && s.deleteRenderbuffer(x.__webglColorRenderbuffer[q]);
      x.__webglDepthRenderbuffer && s.deleteRenderbuffer(x.__webglDepthRenderbuffer);
    }
    const F = E.textures;
    for (let q = 0, j = F.length; q < j; q++) {
      const W = n.get(F[q]);
      W.__webglTexture && (s.deleteTexture(W.__webglTexture), o.memory.textures--), n.remove(F[q]);
    }
    n.remove(E);
  }
  let P = 0;
  function V() {
    P = 0;
  }
  function z() {
    const E = P;
    return E >= i.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + E + " texture units while this GPU supports only " + i.maxTextures), P += 1, E;
  }
  function X(E) {
    const x = [];
    return x.push(E.wrapS), x.push(E.wrapT), x.push(E.wrapR || 0), x.push(E.magFilter), x.push(E.minFilter), x.push(E.anisotropy), x.push(E.internalFormat), x.push(E.format), x.push(E.type), x.push(E.generateMipmaps), x.push(E.premultiplyAlpha), x.push(E.flipY), x.push(E.unpackAlignment), x.push(E.colorSpace), x.join();
  }
  function K(E, x) {
    const F = n.get(E);
    if (E.isVideoTexture && yt(E), E.isRenderTargetTexture === false && E.version > 0 && F.__version !== E.version) {
      const q = E.image;
      if (q === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (q.complete === false) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        Y(F, E, x);
        return;
      }
    }
    e.bindTexture(s.TEXTURE_2D, F.__webglTexture, s.TEXTURE0 + x);
  }
  function G(E, x) {
    const F = n.get(E);
    if (E.version > 0 && F.__version !== E.version) {
      Y(F, E, x);
      return;
    }
    e.bindTexture(s.TEXTURE_2D_ARRAY, F.__webglTexture, s.TEXTURE0 + x);
  }
  function Q(E, x) {
    const F = n.get(E);
    if (E.version > 0 && F.__version !== E.version) {
      Y(F, E, x);
      return;
    }
    e.bindTexture(s.TEXTURE_3D, F.__webglTexture, s.TEXTURE0 + x);
  }
  function H(E, x) {
    const F = n.get(E);
    if (E.version > 0 && F.__version !== E.version) {
      tt(F, E, x);
      return;
    }
    e.bindTexture(s.TEXTURE_CUBE_MAP, F.__webglTexture, s.TEXTURE0 + x);
  }
  const rt = { [Ho]: s.REPEAT, [hi]: s.CLAMP_TO_EDGE, [Vo]: s.MIRRORED_REPEAT }, ut = { [rn]: s.NEAREST, [Wh]: s.NEAREST_MIPMAP_NEAREST, [Ns]: s.NEAREST_MIPMAP_LINEAR, [dn]: s.LINEAR, [zr]: s.LINEAR_MIPMAP_NEAREST, [ui]: s.LINEAR_MIPMAP_LINEAR }, vt = { [jh]: s.NEVER, [eu]: s.ALWAYS, [Kh]: s.LESS, [Pc]: s.LEQUAL, [Zh]: s.EQUAL, [tu]: s.GEQUAL, [Jh]: s.GREATER, [Qh]: s.NOTEQUAL };
  function Ot(E, x) {
    if (x.type === bn && t.has("OES_texture_float_linear") === false && (x.magFilter === dn || x.magFilter === zr || x.magFilter === Ns || x.magFilter === ui || x.minFilter === dn || x.minFilter === zr || x.minFilter === Ns || x.minFilter === ui) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), s.texParameteri(E, s.TEXTURE_WRAP_S, rt[x.wrapS]), s.texParameteri(E, s.TEXTURE_WRAP_T, rt[x.wrapT]), (E === s.TEXTURE_3D || E === s.TEXTURE_2D_ARRAY) && s.texParameteri(E, s.TEXTURE_WRAP_R, rt[x.wrapR]), s.texParameteri(E, s.TEXTURE_MAG_FILTER, ut[x.magFilter]), s.texParameteri(E, s.TEXTURE_MIN_FILTER, ut[x.minFilter]), x.compareFunction && (s.texParameteri(E, s.TEXTURE_COMPARE_MODE, s.COMPARE_REF_TO_TEXTURE), s.texParameteri(E, s.TEXTURE_COMPARE_FUNC, vt[x.compareFunction])), t.has("EXT_texture_filter_anisotropic") === true) {
      if (x.magFilter === rn || x.minFilter !== Ns && x.minFilter !== ui || x.type === bn && t.has("OES_texture_float_linear") === false) return;
      if (x.anisotropy > 1 || n.get(x).__currentAnisotropy) {
        const F = t.get("EXT_texture_filter_anisotropic");
        s.texParameterf(E, F.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(x.anisotropy, i.getMaxAnisotropy())), n.get(x).__currentAnisotropy = x.anisotropy;
      }
    }
  }
  function ee(E, x) {
    let F = false;
    E.__webglInit === void 0 && (E.__webglInit = true, x.addEventListener("dispose", w));
    const q = x.source;
    let j = d.get(q);
    j === void 0 && (j = {}, d.set(q, j));
    const W = X(x);
    if (W !== E.__cacheKey) {
      j[W] === void 0 && (j[W] = { texture: s.createTexture(), usedTimes: 0 }, o.memory.textures++, F = true), j[W].usedTimes++;
      const _t = j[E.__cacheKey];
      _t !== void 0 && (j[E.__cacheKey].usedTimes--, _t.usedTimes === 0 && M(x)), E.__cacheKey = W, E.__webglTexture = j[W].texture;
    }
    return F;
  }
  function Y(E, x, F) {
    let q = s.TEXTURE_2D;
    (x.isDataArrayTexture || x.isCompressedArrayTexture) && (q = s.TEXTURE_2D_ARRAY), x.isData3DTexture && (q = s.TEXTURE_3D);
    const j = ee(E, x), W = x.source;
    e.bindTexture(q, E.__webglTexture, s.TEXTURE0 + F);
    const _t = n.get(W);
    if (W.version !== _t.__version || j === true) {
      e.activeTexture(s.TEXTURE0 + F);
      const at = Yt.getPrimaries(Yt.workingColorSpace), dt = x.colorSpace === Vn ? null : Yt.getPrimaries(x.colorSpace), Vt = x.colorSpace === Vn || at === dt ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, x.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, x.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, x.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, Vt);
      let J = _(x.image, false, i.maxTextureSize);
      J = se(x, J);
      const ft = r.convert(x.format, x.colorSpace), Tt = r.convert(x.type);
      let At = T(x.internalFormat, ft, Tt, x.colorSpace, x.isVideoTexture);
      Ot(q, x);
      let pt;
      const Ht = x.mipmaps, It = x.isVideoTexture !== true, ne = _t.__version === void 0 || j === true, L = W.dataReady, it = I(x, J);
      if (x.isDepthTexture) At = S(x.format === Qi, x.type), ne && (It ? e.texStorage2D(s.TEXTURE_2D, 1, At, J.width, J.height) : e.texImage2D(s.TEXTURE_2D, 0, At, J.width, J.height, 0, ft, Tt, null));
      else if (x.isDataTexture) if (Ht.length > 0) {
        It && ne && e.texStorage2D(s.TEXTURE_2D, it, At, Ht[0].width, Ht[0].height);
        for (let k = 0, $ = Ht.length; k < $; k++) pt = Ht[k], It ? L && e.texSubImage2D(s.TEXTURE_2D, k, 0, 0, pt.width, pt.height, ft, Tt, pt.data) : e.texImage2D(s.TEXTURE_2D, k, At, pt.width, pt.height, 0, ft, Tt, pt.data);
        x.generateMipmaps = false;
      } else It ? (ne && e.texStorage2D(s.TEXTURE_2D, it, At, J.width, J.height), L && e.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, J.width, J.height, ft, Tt, J.data)) : e.texImage2D(s.TEXTURE_2D, 0, At, J.width, J.height, 0, ft, Tt, J.data);
      else if (x.isCompressedTexture) if (x.isCompressedArrayTexture) {
        It && ne && e.texStorage3D(s.TEXTURE_2D_ARRAY, it, At, Ht[0].width, Ht[0].height, J.depth);
        for (let k = 0, $ = Ht.length; k < $; k++) if (pt = Ht[k], x.format !== sn) if (ft !== null) if (It) {
          if (L) if (x.layerUpdates.size > 0) {
            const ct = Al(pt.width, pt.height, x.format, x.type);
            for (const lt of x.layerUpdates) {
              const Lt = pt.data.subarray(lt * ct / pt.data.BYTES_PER_ELEMENT, (lt + 1) * ct / pt.data.BYTES_PER_ELEMENT);
              e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, k, 0, 0, lt, pt.width, pt.height, 1, ft, Lt);
            }
            x.clearLayerUpdates();
          } else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, k, 0, 0, 0, pt.width, pt.height, J.depth, ft, pt.data);
        } else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY, k, At, pt.width, pt.height, J.depth, 0, pt.data, 0, 0);
        else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
        else It ? L && e.texSubImage3D(s.TEXTURE_2D_ARRAY, k, 0, 0, 0, pt.width, pt.height, J.depth, ft, Tt, pt.data) : e.texImage3D(s.TEXTURE_2D_ARRAY, k, At, pt.width, pt.height, J.depth, 0, ft, Tt, pt.data);
      } else {
        It && ne && e.texStorage2D(s.TEXTURE_2D, it, At, Ht[0].width, Ht[0].height);
        for (let k = 0, $ = Ht.length; k < $; k++) pt = Ht[k], x.format !== sn ? ft !== null ? It ? L && e.compressedTexSubImage2D(s.TEXTURE_2D, k, 0, 0, pt.width, pt.height, ft, pt.data) : e.compressedTexImage2D(s.TEXTURE_2D, k, At, pt.width, pt.height, 0, pt.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : It ? L && e.texSubImage2D(s.TEXTURE_2D, k, 0, 0, pt.width, pt.height, ft, Tt, pt.data) : e.texImage2D(s.TEXTURE_2D, k, At, pt.width, pt.height, 0, ft, Tt, pt.data);
      }
      else if (x.isDataArrayTexture) if (It) {
        if (ne && e.texStorage3D(s.TEXTURE_2D_ARRAY, it, At, J.width, J.height, J.depth), L) if (x.layerUpdates.size > 0) {
          const k = Al(J.width, J.height, x.format, x.type);
          for (const $ of x.layerUpdates) {
            const ct = J.data.subarray($ * k / J.data.BYTES_PER_ELEMENT, ($ + 1) * k / J.data.BYTES_PER_ELEMENT);
            e.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, $, J.width, J.height, 1, ft, Tt, ct);
          }
          x.clearLayerUpdates();
        } else e.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, 0, J.width, J.height, J.depth, ft, Tt, J.data);
      } else e.texImage3D(s.TEXTURE_2D_ARRAY, 0, At, J.width, J.height, J.depth, 0, ft, Tt, J.data);
      else if (x.isData3DTexture) It ? (ne && e.texStorage3D(s.TEXTURE_3D, it, At, J.width, J.height, J.depth), L && e.texSubImage3D(s.TEXTURE_3D, 0, 0, 0, 0, J.width, J.height, J.depth, ft, Tt, J.data)) : e.texImage3D(s.TEXTURE_3D, 0, At, J.width, J.height, J.depth, 0, ft, Tt, J.data);
      else if (x.isFramebufferTexture) {
        if (ne) if (It) e.texStorage2D(s.TEXTURE_2D, it, At, J.width, J.height);
        else {
          let k = J.width, $ = J.height;
          for (let ct = 0; ct < it; ct++) e.texImage2D(s.TEXTURE_2D, ct, At, k, $, 0, ft, Tt, null), k >>= 1, $ >>= 1;
        }
      } else if (Ht.length > 0) {
        if (It && ne) {
          const k = xt(Ht[0]);
          e.texStorage2D(s.TEXTURE_2D, it, At, k.width, k.height);
        }
        for (let k = 0, $ = Ht.length; k < $; k++) pt = Ht[k], It ? L && e.texSubImage2D(s.TEXTURE_2D, k, 0, 0, ft, Tt, pt) : e.texImage2D(s.TEXTURE_2D, k, At, ft, Tt, pt);
        x.generateMipmaps = false;
      } else if (It) {
        if (ne) {
          const k = xt(J);
          e.texStorage2D(s.TEXTURE_2D, it, At, k.width, k.height);
        }
        L && e.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, ft, Tt, J);
      } else e.texImage2D(s.TEXTURE_2D, 0, At, ft, Tt, J);
      m(x) && f(q), _t.__version = W.version, x.onUpdate && x.onUpdate(x);
    }
    E.__version = x.version;
  }
  function tt(E, x, F) {
    if (x.image.length !== 6) return;
    const q = ee(E, x), j = x.source;
    e.bindTexture(s.TEXTURE_CUBE_MAP, E.__webglTexture, s.TEXTURE0 + F);
    const W = n.get(j);
    if (j.version !== W.__version || q === true) {
      e.activeTexture(s.TEXTURE0 + F);
      const _t = Yt.getPrimaries(Yt.workingColorSpace), at = x.colorSpace === Vn ? null : Yt.getPrimaries(x.colorSpace), dt = x.colorSpace === Vn || _t === at ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, x.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, x.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, x.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, dt);
      const Vt = x.isCompressedTexture || x.image[0].isCompressedTexture, J = x.image[0] && x.image[0].isDataTexture, ft = [];
      for (let $ = 0; $ < 6; $++) !Vt && !J ? ft[$] = _(x.image[$], true, i.maxCubemapSize) : ft[$] = J ? x.image[$].image : x.image[$], ft[$] = se(x, ft[$]);
      const Tt = ft[0], At = r.convert(x.format, x.colorSpace), pt = r.convert(x.type), Ht = T(x.internalFormat, At, pt, x.colorSpace), It = x.isVideoTexture !== true, ne = W.__version === void 0 || q === true, L = j.dataReady;
      let it = I(x, Tt);
      Ot(s.TEXTURE_CUBE_MAP, x);
      let k;
      if (Vt) {
        It && ne && e.texStorage2D(s.TEXTURE_CUBE_MAP, it, Ht, Tt.width, Tt.height);
        for (let $ = 0; $ < 6; $++) {
          k = ft[$].mipmaps;
          for (let ct = 0; ct < k.length; ct++) {
            const lt = k[ct];
            x.format !== sn ? At !== null ? It ? L && e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct, 0, 0, lt.width, lt.height, At, lt.data) : e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct, Ht, lt.width, lt.height, 0, lt.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : It ? L && e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct, 0, 0, lt.width, lt.height, At, pt, lt.data) : e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct, Ht, lt.width, lt.height, 0, At, pt, lt.data);
          }
        }
      } else {
        if (k = x.mipmaps, It && ne) {
          k.length > 0 && it++;
          const $ = xt(ft[0]);
          e.texStorage2D(s.TEXTURE_CUBE_MAP, it, Ht, $.width, $.height);
        }
        for (let $ = 0; $ < 6; $++) if (J) {
          It ? L && e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, 0, 0, ft[$].width, ft[$].height, At, pt, ft[$].data) : e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, Ht, ft[$].width, ft[$].height, 0, At, pt, ft[$].data);
          for (let ct = 0; ct < k.length; ct++) {
            const Lt = k[ct].image[$].image;
            It ? L && e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct + 1, 0, 0, Lt.width, Lt.height, At, pt, Lt.data) : e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct + 1, Ht, Lt.width, Lt.height, 0, At, pt, Lt.data);
          }
        } else {
          It ? L && e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, 0, 0, At, pt, ft[$]) : e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, Ht, At, pt, ft[$]);
          for (let ct = 0; ct < k.length; ct++) {
            const lt = k[ct];
            It ? L && e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct + 1, 0, 0, At, pt, lt.image[$]) : e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ct + 1, Ht, At, pt, lt.image[$]);
          }
        }
      }
      m(x) && f(s.TEXTURE_CUBE_MAP), W.__version = j.version, x.onUpdate && x.onUpdate(x);
    }
    E.__version = x.version;
  }
  function gt(E, x, F, q, j, W) {
    const _t = r.convert(F.format, F.colorSpace), at = r.convert(F.type), dt = T(F.internalFormat, _t, at, F.colorSpace), Vt = n.get(x), J = n.get(F);
    if (J.__renderTarget = x, !Vt.__hasExternalTextures) {
      const ft = Math.max(1, x.width >> W), Tt = Math.max(1, x.height >> W);
      j === s.TEXTURE_3D || j === s.TEXTURE_2D_ARRAY ? e.texImage3D(j, W, dt, ft, Tt, x.depth, 0, _t, at, null) : e.texImage2D(j, W, dt, ft, Tt, 0, _t, at, null);
    }
    e.bindFramebuffer(s.FRAMEBUFFER, E), kt(x) ? a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, q, j, J.__webglTexture, 0, zt(x)) : (j === s.TEXTURE_2D || j >= s.TEXTURE_CUBE_MAP_POSITIVE_X && j <= s.TEXTURE_CUBE_MAP_NEGATIVE_Z) && s.framebufferTexture2D(s.FRAMEBUFFER, q, j, J.__webglTexture, W), e.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function ot(E, x, F) {
    if (s.bindRenderbuffer(s.RENDERBUFFER, E), x.depthBuffer) {
      const q = x.depthTexture, j = q && q.isDepthTexture ? q.type : null, W = S(x.stencilBuffer, j), _t = x.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, at = zt(x);
      kt(x) ? a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, at, W, x.width, x.height) : F ? s.renderbufferStorageMultisample(s.RENDERBUFFER, at, W, x.width, x.height) : s.renderbufferStorage(s.RENDERBUFFER, W, x.width, x.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, _t, s.RENDERBUFFER, E);
    } else {
      const q = x.textures;
      for (let j = 0; j < q.length; j++) {
        const W = q[j], _t = r.convert(W.format, W.colorSpace), at = r.convert(W.type), dt = T(W.internalFormat, _t, at, W.colorSpace), Vt = zt(x);
        F && kt(x) === false ? s.renderbufferStorageMultisample(s.RENDERBUFFER, Vt, dt, x.width, x.height) : kt(x) ? a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, Vt, dt, x.width, x.height) : s.renderbufferStorage(s.RENDERBUFFER, dt, x.width, x.height);
      }
    }
    s.bindRenderbuffer(s.RENDERBUFFER, null);
  }
  function bt(E, x) {
    if (x && x.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (e.bindFramebuffer(s.FRAMEBUFFER, E), !(x.depthTexture && x.depthTexture.isDepthTexture)) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    const q = n.get(x.depthTexture);
    q.__renderTarget = x, (!q.__webglTexture || x.depthTexture.image.width !== x.width || x.depthTexture.image.height !== x.height) && (x.depthTexture.image.width = x.width, x.depthTexture.image.height = x.height, x.depthTexture.needsUpdate = true), K(x.depthTexture, 0);
    const j = q.__webglTexture, W = zt(x);
    if (x.depthTexture.format === qi) kt(x) ? a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, j, 0, W) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, j, 0);
    else if (x.depthTexture.format === Qi) kt(x) ? a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, j, 0, W) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, j, 0);
    else throw new Error("Unknown depthTexture format");
  }
  function qt(E) {
    const x = n.get(E), F = E.isWebGLCubeRenderTarget === true;
    if (x.__boundDepthTexture !== E.depthTexture) {
      const q = E.depthTexture;
      if (x.__depthDisposeCallback && x.__depthDisposeCallback(), q) {
        const j = () => {
          delete x.__boundDepthTexture, delete x.__depthDisposeCallback, q.removeEventListener("dispose", j);
        };
        q.addEventListener("dispose", j), x.__depthDisposeCallback = j;
      }
      x.__boundDepthTexture = q;
    }
    if (E.depthTexture && !x.__autoAllocateDepthBuffer) {
      if (F) throw new Error("target.depthTexture not supported in Cube render targets");
      bt(x.__webglFramebuffer, E);
    } else if (F) {
      x.__webglDepthbuffer = [];
      for (let q = 0; q < 6; q++) if (e.bindFramebuffer(s.FRAMEBUFFER, x.__webglFramebuffer[q]), x.__webglDepthbuffer[q] === void 0) x.__webglDepthbuffer[q] = s.createRenderbuffer(), ot(x.__webglDepthbuffer[q], E, false);
      else {
        const j = E.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, W = x.__webglDepthbuffer[q];
        s.bindRenderbuffer(s.RENDERBUFFER, W), s.framebufferRenderbuffer(s.FRAMEBUFFER, j, s.RENDERBUFFER, W);
      }
    } else if (e.bindFramebuffer(s.FRAMEBUFFER, x.__webglFramebuffer), x.__webglDepthbuffer === void 0) x.__webglDepthbuffer = s.createRenderbuffer(), ot(x.__webglDepthbuffer, E, false);
    else {
      const q = E.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, j = x.__webglDepthbuffer;
      s.bindRenderbuffer(s.RENDERBUFFER, j), s.framebufferRenderbuffer(s.FRAMEBUFFER, q, s.RENDERBUFFER, j);
    }
    e.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function wt(E, x, F) {
    const q = n.get(E);
    x !== void 0 && gt(q.__webglFramebuffer, E, E.texture, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, 0), F !== void 0 && qt(E);
  }
  function he(E) {
    const x = E.texture, F = n.get(E), q = n.get(x);
    E.addEventListener("dispose", C);
    const j = E.textures, W = E.isWebGLCubeRenderTarget === true, _t = j.length > 1;
    if (_t || (q.__webglTexture === void 0 && (q.__webglTexture = s.createTexture()), q.__version = x.version, o.memory.textures++), W) {
      F.__webglFramebuffer = [];
      for (let at = 0; at < 6; at++) if (x.mipmaps && x.mipmaps.length > 0) {
        F.__webglFramebuffer[at] = [];
        for (let dt = 0; dt < x.mipmaps.length; dt++) F.__webglFramebuffer[at][dt] = s.createFramebuffer();
      } else F.__webglFramebuffer[at] = s.createFramebuffer();
    } else {
      if (x.mipmaps && x.mipmaps.length > 0) {
        F.__webglFramebuffer = [];
        for (let at = 0; at < x.mipmaps.length; at++) F.__webglFramebuffer[at] = s.createFramebuffer();
      } else F.__webglFramebuffer = s.createFramebuffer();
      if (_t) for (let at = 0, dt = j.length; at < dt; at++) {
        const Vt = n.get(j[at]);
        Vt.__webglTexture === void 0 && (Vt.__webglTexture = s.createTexture(), o.memory.textures++);
      }
      if (E.samples > 0 && kt(E) === false) {
        F.__webglMultisampledFramebuffer = s.createFramebuffer(), F.__webglColorRenderbuffer = [], e.bindFramebuffer(s.FRAMEBUFFER, F.__webglMultisampledFramebuffer);
        for (let at = 0; at < j.length; at++) {
          const dt = j[at];
          F.__webglColorRenderbuffer[at] = s.createRenderbuffer(), s.bindRenderbuffer(s.RENDERBUFFER, F.__webglColorRenderbuffer[at]);
          const Vt = r.convert(dt.format, dt.colorSpace), J = r.convert(dt.type), ft = T(dt.internalFormat, Vt, J, dt.colorSpace, E.isXRRenderTarget === true), Tt = zt(E);
          s.renderbufferStorageMultisample(s.RENDERBUFFER, Tt, ft, E.width, E.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + at, s.RENDERBUFFER, F.__webglColorRenderbuffer[at]);
        }
        s.bindRenderbuffer(s.RENDERBUFFER, null), E.depthBuffer && (F.__webglDepthRenderbuffer = s.createRenderbuffer(), ot(F.__webglDepthRenderbuffer, E, true)), e.bindFramebuffer(s.FRAMEBUFFER, null);
      }
    }
    if (W) {
      e.bindTexture(s.TEXTURE_CUBE_MAP, q.__webglTexture), Ot(s.TEXTURE_CUBE_MAP, x);
      for (let at = 0; at < 6; at++) if (x.mipmaps && x.mipmaps.length > 0) for (let dt = 0; dt < x.mipmaps.length; dt++) gt(F.__webglFramebuffer[at][dt], E, x, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + at, dt);
      else gt(F.__webglFramebuffer[at], E, x, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + at, 0);
      m(x) && f(s.TEXTURE_CUBE_MAP), e.unbindTexture();
    } else if (_t) {
      for (let at = 0, dt = j.length; at < dt; at++) {
        const Vt = j[at], J = n.get(Vt);
        e.bindTexture(s.TEXTURE_2D, J.__webglTexture), Ot(s.TEXTURE_2D, Vt), gt(F.__webglFramebuffer, E, Vt, s.COLOR_ATTACHMENT0 + at, s.TEXTURE_2D, 0), m(Vt) && f(s.TEXTURE_2D);
      }
      e.unbindTexture();
    } else {
      let at = s.TEXTURE_2D;
      if ((E.isWebGL3DRenderTarget || E.isWebGLArrayRenderTarget) && (at = E.isWebGL3DRenderTarget ? s.TEXTURE_3D : s.TEXTURE_2D_ARRAY), e.bindTexture(at, q.__webglTexture), Ot(at, x), x.mipmaps && x.mipmaps.length > 0) for (let dt = 0; dt < x.mipmaps.length; dt++) gt(F.__webglFramebuffer[dt], E, x, s.COLOR_ATTACHMENT0, at, dt);
      else gt(F.__webglFramebuffer, E, x, s.COLOR_ATTACHMENT0, at, 0);
      m(x) && f(at), e.unbindTexture();
    }
    E.depthBuffer && qt(E);
  }
  function ae(E) {
    const x = E.textures;
    for (let F = 0, q = x.length; F < q; F++) {
      const j = x[F];
      if (m(j)) {
        const W = A(E), _t = n.get(j).__webglTexture;
        e.bindTexture(W, _t), f(W), e.unbindTexture();
      }
    }
  }
  const Bt = [], R = [];
  function Ve(E) {
    if (E.samples > 0) {
      if (kt(E) === false) {
        const x = E.textures, F = E.width, q = E.height;
        let j = s.COLOR_BUFFER_BIT;
        const W = E.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, _t = n.get(E), at = x.length > 1;
        if (at) for (let dt = 0; dt < x.length; dt++) e.bindFramebuffer(s.FRAMEBUFFER, _t.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + dt, s.RENDERBUFFER, null), e.bindFramebuffer(s.FRAMEBUFFER, _t.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + dt, s.TEXTURE_2D, null, 0);
        e.bindFramebuffer(s.READ_FRAMEBUFFER, _t.__webglMultisampledFramebuffer), e.bindFramebuffer(s.DRAW_FRAMEBUFFER, _t.__webglFramebuffer);
        for (let dt = 0; dt < x.length; dt++) {
          if (E.resolveDepthBuffer && (E.depthBuffer && (j |= s.DEPTH_BUFFER_BIT), E.stencilBuffer && E.resolveStencilBuffer && (j |= s.STENCIL_BUFFER_BIT)), at) {
            s.framebufferRenderbuffer(s.READ_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.RENDERBUFFER, _t.__webglColorRenderbuffer[dt]);
            const Vt = n.get(x[dt]).__webglTexture;
            s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, Vt, 0);
          }
          s.blitFramebuffer(0, 0, F, q, 0, 0, F, q, j, s.NEAREST), l === true && (Bt.length = 0, R.length = 0, Bt.push(s.COLOR_ATTACHMENT0 + dt), E.depthBuffer && E.resolveDepthBuffer === false && (Bt.push(W), R.push(W), s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, R)), s.invalidateFramebuffer(s.READ_FRAMEBUFFER, Bt));
        }
        if (e.bindFramebuffer(s.READ_FRAMEBUFFER, null), e.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), at) for (let dt = 0; dt < x.length; dt++) {
          e.bindFramebuffer(s.FRAMEBUFFER, _t.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + dt, s.RENDERBUFFER, _t.__webglColorRenderbuffer[dt]);
          const Vt = n.get(x[dt]).__webglTexture;
          e.bindFramebuffer(s.FRAMEBUFFER, _t.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + dt, s.TEXTURE_2D, Vt, 0);
        }
        e.bindFramebuffer(s.DRAW_FRAMEBUFFER, _t.__webglMultisampledFramebuffer);
      } else if (E.depthBuffer && E.resolveDepthBuffer === false && l) {
        const x = E.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
        s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, [x]);
      }
    }
  }
  function zt(E) {
    return Math.min(i.maxSamples, E.samples);
  }
  function kt(E) {
    const x = n.get(E);
    return E.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === true && x.__useRenderToTexture !== false;
  }
  function yt(E) {
    const x = o.render.frame;
    h.get(E) !== x && (h.set(E, x), E.update());
  }
  function se(E, x) {
    const F = E.colorSpace, q = E.format, j = E.type;
    return E.isCompressedTexture === true || E.isVideoTexture === true || F !== ts && F !== Vn && (Yt.getTransfer(F) === Qt ? (q !== sn || j !== Rn) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", F)), x;
  }
  function xt(E) {
    return typeof HTMLImageElement < "u" && E instanceof HTMLImageElement ? (c.width = E.naturalWidth || E.width, c.height = E.naturalHeight || E.height) : typeof VideoFrame < "u" && E instanceof VideoFrame ? (c.width = E.displayWidth, c.height = E.displayHeight) : (c.width = E.width, c.height = E.height), c;
  }
  this.allocateTextureUnit = z, this.resetTextureUnits = V, this.setTexture2D = K, this.setTexture2DArray = G, this.setTexture3D = Q, this.setTextureCube = H, this.rebindTextures = wt, this.setupRenderTarget = he, this.updateRenderTargetMipmap = ae, this.updateMultisampleRenderTarget = Ve, this.setupDepthRenderbuffer = qt, this.setupFrameBufferTexture = gt, this.useMultisampledRTT = kt;
}
function Ng(s, t) {
  function e(n, i = Vn) {
    let r;
    const o = Yt.getTransfer(i);
    if (n === Rn) return s.UNSIGNED_BYTE;
    if (n === Sa) return s.UNSIGNED_SHORT_4_4_4_4;
    if (n === Ea) return s.UNSIGNED_SHORT_5_5_5_1;
    if (n === Sc) return s.UNSIGNED_INT_5_9_9_9_REV;
    if (n === yc) return s.BYTE;
    if (n === Mc) return s.SHORT;
    if (n === ws) return s.UNSIGNED_SHORT;
    if (n === Ma) return s.INT;
    if (n === pi) return s.UNSIGNED_INT;
    if (n === bn) return s.FLOAT;
    if (n === Cs) return s.HALF_FLOAT;
    if (n === Ec) return s.ALPHA;
    if (n === bc) return s.RGB;
    if (n === sn) return s.RGBA;
    if (n === Tc) return s.LUMINANCE;
    if (n === wc) return s.LUMINANCE_ALPHA;
    if (n === qi) return s.DEPTH_COMPONENT;
    if (n === Qi) return s.DEPTH_STENCIL;
    if (n === Ac) return s.RED;
    if (n === ba) return s.RED_INTEGER;
    if (n === Cc) return s.RG;
    if (n === Ta) return s.RG_INTEGER;
    if (n === wa) return s.RGBA_INTEGER;
    if (n === Mr || n === Sr || n === Er || n === br) if (o === Qt) if (r = t.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
      if (n === Mr) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
      if (n === Sr) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
      if (n === Er) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
      if (n === br) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
    } else return null;
    else if (r = t.get("WEBGL_compressed_texture_s3tc"), r !== null) {
      if (n === Mr) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
      if (n === Sr) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
      if (n === Er) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
      if (n === br) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    } else return null;
    if (n === Go || n === Wo || n === Xo || n === Yo) if (r = t.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
      if (n === Go) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
      if (n === Wo) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
      if (n === Xo) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
      if (n === Yo) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
    } else return null;
    if (n === qo || n === $o || n === jo) if (r = t.get("WEBGL_compressed_texture_etc"), r !== null) {
      if (n === qo || n === $o) return o === Qt ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
      if (n === jo) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
    } else return null;
    if (n === Ko || n === Zo || n === Jo || n === Qo || n === ta || n === ea || n === na || n === ia || n === sa || n === ra || n === oa || n === aa || n === la || n === ca) if (r = t.get("WEBGL_compressed_texture_astc"), r !== null) {
      if (n === Ko) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
      if (n === Zo) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
      if (n === Jo) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
      if (n === Qo) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
      if (n === ta) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
      if (n === ea) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
      if (n === na) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
      if (n === ia) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
      if (n === sa) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
      if (n === ra) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
      if (n === oa) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
      if (n === aa) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
      if (n === la) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
      if (n === ca) return o === Qt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
    } else return null;
    if (n === Tr || n === ha || n === ua) if (r = t.get("EXT_texture_compression_bptc"), r !== null) {
      if (n === Tr) return o === Qt ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
      if (n === ha) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
      if (n === ua) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
    } else return null;
    if (n === Rc || n === da || n === fa || n === pa) if (r = t.get("EXT_texture_compression_rgtc"), r !== null) {
      if (n === Tr) return r.COMPRESSED_RED_RGTC1_EXT;
      if (n === da) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
      if (n === fa) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
      if (n === pa) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
    } else return null;
    return n === Ji ? s.UNSIGNED_INT_24_8 : s[n] !== void 0 ? s[n] : null;
  }
  return { convert: e };
}
const Fg = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, Og = `
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
class Bg {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(t, e, n) {
    if (this.texture === null) {
      const i = new De(), r = t.properties.get(i);
      r.__webglTexture = e.texture, (e.depthNear !== n.depthNear || e.depthFar !== n.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = i;
    }
  }
  getMesh(t) {
    if (this.texture !== null && this.mesh === null) {
      const e = t.cameras[0].viewport, n = new pn({ vertexShader: Fg, fragmentShader: Og, uniforms: { depthColor: { value: this.texture }, depthWidth: { value: e.z }, depthHeight: { value: e.w } } });
      this.mesh = new Ke(new ss(20, 20), n);
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
class zg extends _i {
  constructor(t, e) {
    super();
    const n = this;
    let i = null, r = 1, o = null, a = "local-floor", l = 1, c = null, h = null, u = null, d = null, p = null, g = null;
    const _ = new Bg(), m = e.getContextAttributes();
    let f = null, A = null;
    const T = [], S = [], I = new Et();
    let w = null;
    const C = new qe();
    C.viewport = new ie();
    const N = new qe();
    N.viewport = new ie();
    const M = [C, N], y = new ed();
    let P = null, V = null;
    this.cameraAutoUpdate = true, this.enabled = false, this.isPresenting = false, this.getController = function(Y) {
      let tt = T[Y];
      return tt === void 0 && (tt = new ro(), T[Y] = tt), tt.getTargetRaySpace();
    }, this.getControllerGrip = function(Y) {
      let tt = T[Y];
      return tt === void 0 && (tt = new ro(), T[Y] = tt), tt.getGripSpace();
    }, this.getHand = function(Y) {
      let tt = T[Y];
      return tt === void 0 && (tt = new ro(), T[Y] = tt), tt.getHandSpace();
    };
    function z(Y) {
      const tt = S.indexOf(Y.inputSource);
      if (tt === -1) return;
      const gt = T[tt];
      gt !== void 0 && (gt.update(Y.inputSource, Y.frame, c || o), gt.dispatchEvent({ type: Y.type, data: Y.inputSource }));
    }
    function X() {
      i.removeEventListener("select", z), i.removeEventListener("selectstart", z), i.removeEventListener("selectend", z), i.removeEventListener("squeeze", z), i.removeEventListener("squeezestart", z), i.removeEventListener("squeezeend", z), i.removeEventListener("end", X), i.removeEventListener("inputsourceschange", K);
      for (let Y = 0; Y < T.length; Y++) {
        const tt = S[Y];
        tt !== null && (S[Y] = null, T[Y].disconnect(tt));
      }
      P = null, V = null, _.reset(), t.setRenderTarget(f), p = null, d = null, u = null, i = null, A = null, ee.stop(), n.isPresenting = false, t.setPixelRatio(w), t.setSize(I.width, I.height, false), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(Y) {
      r = Y, n.isPresenting === true && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(Y) {
      a = Y, n.isPresenting === true && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return c || o;
    }, this.setReferenceSpace = function(Y) {
      c = Y;
    }, this.getBaseLayer = function() {
      return d !== null ? d : p;
    }, this.getBinding = function() {
      return u;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return i;
    }, this.setSession = async function(Y) {
      if (i = Y, i !== null) {
        if (f = t.getRenderTarget(), i.addEventListener("select", z), i.addEventListener("selectstart", z), i.addEventListener("selectend", z), i.addEventListener("squeeze", z), i.addEventListener("squeezestart", z), i.addEventListener("squeezeend", z), i.addEventListener("end", X), i.addEventListener("inputsourceschange", K), m.xrCompatible !== true && await e.makeXRCompatible(), w = t.getPixelRatio(), t.getSize(I), typeof XRWebGLBinding < "u" && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let gt = null, ot = null, bt = null;
          m.depth && (bt = m.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, gt = m.stencil ? Qi : qi, ot = m.stencil ? Ji : pi);
          const qt = { colorFormat: e.RGBA8, depthFormat: bt, scaleFactor: r };
          u = new XRWebGLBinding(i, e), d = u.createProjectionLayer(qt), i.updateRenderState({ layers: [d] }), t.setPixelRatio(1), t.setSize(d.textureWidth, d.textureHeight, false), A = new mi(d.textureWidth, d.textureHeight, { format: sn, type: Rn, depthTexture: new Wc(d.textureWidth, d.textureHeight, ot, void 0, void 0, void 0, void 0, void 0, void 0, gt), stencilBuffer: m.stencil, colorSpace: t.outputColorSpace, samples: m.antialias ? 4 : 0, resolveDepthBuffer: d.ignoreDepthValues === false, resolveStencilBuffer: d.ignoreDepthValues === false });
        } else {
          const gt = { antialias: m.antialias, alpha: true, depth: m.depth, stencil: m.stencil, framebufferScaleFactor: r };
          p = new XRWebGLLayer(i, e, gt), i.updateRenderState({ baseLayer: p }), t.setPixelRatio(1), t.setSize(p.framebufferWidth, p.framebufferHeight, false), A = new mi(p.framebufferWidth, p.framebufferHeight, { format: sn, type: Rn, colorSpace: t.outputColorSpace, stencilBuffer: m.stencil, resolveDepthBuffer: p.ignoreDepthValues === false, resolveStencilBuffer: p.ignoreDepthValues === false });
        }
        A.isXRRenderTarget = true, this.setFoveation(l), c = null, o = await i.requestReferenceSpace(a), ee.setContext(i), ee.start(), n.isPresenting = true, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (i !== null) return i.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return _.getDepthTexture();
    };
    function K(Y) {
      for (let tt = 0; tt < Y.removed.length; tt++) {
        const gt = Y.removed[tt], ot = S.indexOf(gt);
        ot >= 0 && (S[ot] = null, T[ot].disconnect(gt));
      }
      for (let tt = 0; tt < Y.added.length; tt++) {
        const gt = Y.added[tt];
        let ot = S.indexOf(gt);
        if (ot === -1) {
          for (let qt = 0; qt < T.length; qt++) if (qt >= S.length) {
            S.push(gt), ot = qt;
            break;
          } else if (S[qt] === null) {
            S[qt] = gt, ot = qt;
            break;
          }
          if (ot === -1) break;
        }
        const bt = T[ot];
        bt && bt.connect(gt);
      }
    }
    const G = new b(), Q = new b();
    function H(Y, tt, gt) {
      G.setFromMatrixPosition(tt.matrixWorld), Q.setFromMatrixPosition(gt.matrixWorld);
      const ot = G.distanceTo(Q), bt = tt.projectionMatrix.elements, qt = gt.projectionMatrix.elements, wt = bt[14] / (bt[10] - 1), he = bt[14] / (bt[10] + 1), ae = (bt[9] + 1) / bt[5], Bt = (bt[9] - 1) / bt[5], R = (bt[8] - 1) / bt[0], Ve = (qt[8] + 1) / qt[0], zt = wt * R, kt = wt * Ve, yt = ot / (-R + Ve), se = yt * -R;
      if (tt.matrixWorld.decompose(Y.position, Y.quaternion, Y.scale), Y.translateX(se), Y.translateZ(yt), Y.matrixWorld.compose(Y.position, Y.quaternion, Y.scale), Y.matrixWorldInverse.copy(Y.matrixWorld).invert(), bt[10] === -1) Y.projectionMatrix.copy(tt.projectionMatrix), Y.projectionMatrixInverse.copy(tt.projectionMatrixInverse);
      else {
        const xt = wt + yt, E = he + yt, x = zt - se, F = kt + (ot - se), q = ae * he / E * xt, j = Bt * he / E * xt;
        Y.projectionMatrix.makePerspective(x, F, q, j, xt, E), Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert();
      }
    }
    function rt(Y, tt) {
      tt === null ? Y.matrixWorld.copy(Y.matrix) : Y.matrixWorld.multiplyMatrices(tt.matrixWorld, Y.matrix), Y.matrixWorldInverse.copy(Y.matrixWorld).invert();
    }
    this.updateCamera = function(Y) {
      if (i === null) return;
      let tt = Y.near, gt = Y.far;
      _.texture !== null && (_.depthNear > 0 && (tt = _.depthNear), _.depthFar > 0 && (gt = _.depthFar)), y.near = N.near = C.near = tt, y.far = N.far = C.far = gt, (P !== y.near || V !== y.far) && (i.updateRenderState({ depthNear: y.near, depthFar: y.far }), P = y.near, V = y.far), C.layers.mask = Y.layers.mask | 2, N.layers.mask = Y.layers.mask | 4, y.layers.mask = C.layers.mask | N.layers.mask;
      const ot = Y.parent, bt = y.cameras;
      rt(y, ot);
      for (let qt = 0; qt < bt.length; qt++) rt(bt[qt], ot);
      bt.length === 2 ? H(y, C, N) : y.projectionMatrix.copy(C.projectionMatrix), ut(Y, y, ot);
    };
    function ut(Y, tt, gt) {
      gt === null ? Y.matrix.copy(tt.matrixWorld) : (Y.matrix.copy(gt.matrixWorld), Y.matrix.invert(), Y.matrix.multiply(tt.matrixWorld)), Y.matrix.decompose(Y.position, Y.quaternion, Y.scale), Y.updateMatrixWorld(true), Y.projectionMatrix.copy(tt.projectionMatrix), Y.projectionMatrixInverse.copy(tt.projectionMatrixInverse), Y.isPerspectiveCamera && (Y.fov = As * 2 * Math.atan(1 / Y.projectionMatrix.elements[5]), Y.zoom = 1);
    }
    this.getCamera = function() {
      return y;
    }, this.getFoveation = function() {
      if (!(d === null && p === null)) return l;
    }, this.setFoveation = function(Y) {
      l = Y, d !== null && (d.fixedFoveation = Y), p !== null && p.fixedFoveation !== void 0 && (p.fixedFoveation = Y);
    }, this.hasDepthSensing = function() {
      return _.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return _.getMesh(y);
    };
    let vt = null;
    function Ot(Y, tt) {
      if (h = tt.getViewerPose(c || o), g = tt, h !== null) {
        const gt = h.views;
        p !== null && (t.setRenderTargetFramebuffer(A, p.framebuffer), t.setRenderTarget(A));
        let ot = false;
        gt.length !== y.cameras.length && (y.cameras.length = 0, ot = true);
        for (let wt = 0; wt < gt.length; wt++) {
          const he = gt[wt];
          let ae = null;
          if (p !== null) ae = p.getViewport(he);
          else {
            const R = u.getViewSubImage(d, he);
            ae = R.viewport, wt === 0 && (t.setRenderTargetTextures(A, R.colorTexture, d.ignoreDepthValues ? void 0 : R.depthStencilTexture), t.setRenderTarget(A));
          }
          let Bt = M[wt];
          Bt === void 0 && (Bt = new qe(), Bt.layers.enable(wt), Bt.viewport = new ie(), M[wt] = Bt), Bt.matrix.fromArray(he.transform.matrix), Bt.matrix.decompose(Bt.position, Bt.quaternion, Bt.scale), Bt.projectionMatrix.fromArray(he.projectionMatrix), Bt.projectionMatrixInverse.copy(Bt.projectionMatrix).invert(), Bt.viewport.set(ae.x, ae.y, ae.width, ae.height), wt === 0 && (y.matrix.copy(Bt.matrix), y.matrix.decompose(y.position, y.quaternion, y.scale)), ot === true && y.cameras.push(Bt);
        }
        const bt = i.enabledFeatures;
        if (bt && bt.includes("depth-sensing") && i.depthUsage == "gpu-optimized" && u) {
          const wt = u.getDepthInformation(gt[0]);
          wt && wt.isValid && wt.texture && _.init(t, wt, i.renderState);
        }
      }
      for (let gt = 0; gt < T.length; gt++) {
        const ot = S[gt], bt = T[gt];
        ot !== null && bt !== void 0 && bt.update(ot, tt, c || o);
      }
      vt && vt(Y, tt), tt.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: tt }), g = null;
    }
    const ee = new Xc();
    ee.setAnimationLoop(Ot), this.setAnimationLoop = function(Y) {
      vt = Y;
    }, this.dispose = function() {
    };
  }
}
const ii = new Ln(), kg = new Kt();
function Hg(s, t) {
  function e(m, f) {
    m.matrixAutoUpdate === true && m.updateMatrix(), f.value.copy(m.matrix);
  }
  function n(m, f) {
    f.color.getRGB(m.fogColor.value, Fc(s)), f.isFog ? (m.fogNear.value = f.near, m.fogFar.value = f.far) : f.isFogExp2 && (m.fogDensity.value = f.density);
  }
  function i(m, f, A, T, S) {
    f.isMeshBasicMaterial || f.isMeshLambertMaterial ? r(m, f) : f.isMeshToonMaterial ? (r(m, f), u(m, f)) : f.isMeshPhongMaterial ? (r(m, f), h(m, f)) : f.isMeshStandardMaterial ? (r(m, f), d(m, f), f.isMeshPhysicalMaterial && p(m, f, S)) : f.isMeshMatcapMaterial ? (r(m, f), g(m, f)) : f.isMeshDepthMaterial ? r(m, f) : f.isMeshDistanceMaterial ? (r(m, f), _(m, f)) : f.isMeshNormalMaterial ? r(m, f) : f.isLineBasicMaterial ? (o(m, f), f.isLineDashedMaterial && a(m, f)) : f.isPointsMaterial ? l(m, f, A, T) : f.isSpriteMaterial ? c(m, f) : f.isShadowMaterial ? (m.color.value.copy(f.color), m.opacity.value = f.opacity) : f.isShaderMaterial && (f.uniformsNeedUpdate = false);
  }
  function r(m, f) {
    m.opacity.value = f.opacity, f.color && m.diffuse.value.copy(f.color), f.emissive && m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity), f.map && (m.map.value = f.map, e(f.map, m.mapTransform)), f.alphaMap && (m.alphaMap.value = f.alphaMap, e(f.alphaMap, m.alphaMapTransform)), f.bumpMap && (m.bumpMap.value = f.bumpMap, e(f.bumpMap, m.bumpMapTransform), m.bumpScale.value = f.bumpScale, f.side === Fe && (m.bumpScale.value *= -1)), f.normalMap && (m.normalMap.value = f.normalMap, e(f.normalMap, m.normalMapTransform), m.normalScale.value.copy(f.normalScale), f.side === Fe && m.normalScale.value.negate()), f.displacementMap && (m.displacementMap.value = f.displacementMap, e(f.displacementMap, m.displacementMapTransform), m.displacementScale.value = f.displacementScale, m.displacementBias.value = f.displacementBias), f.emissiveMap && (m.emissiveMap.value = f.emissiveMap, e(f.emissiveMap, m.emissiveMapTransform)), f.specularMap && (m.specularMap.value = f.specularMap, e(f.specularMap, m.specularMapTransform)), f.alphaTest > 0 && (m.alphaTest.value = f.alphaTest);
    const A = t.get(f), T = A.envMap, S = A.envMapRotation;
    T && (m.envMap.value = T, ii.copy(S), ii.x *= -1, ii.y *= -1, ii.z *= -1, T.isCubeTexture && T.isRenderTargetTexture === false && (ii.y *= -1, ii.z *= -1), m.envMapRotation.value.setFromMatrix4(kg.makeRotationFromEuler(ii)), m.flipEnvMap.value = T.isCubeTexture && T.isRenderTargetTexture === false ? -1 : 1, m.reflectivity.value = f.reflectivity, m.ior.value = f.ior, m.refractionRatio.value = f.refractionRatio), f.lightMap && (m.lightMap.value = f.lightMap, m.lightMapIntensity.value = f.lightMapIntensity, e(f.lightMap, m.lightMapTransform)), f.aoMap && (m.aoMap.value = f.aoMap, m.aoMapIntensity.value = f.aoMapIntensity, e(f.aoMap, m.aoMapTransform));
  }
  function o(m, f) {
    m.diffuse.value.copy(f.color), m.opacity.value = f.opacity, f.map && (m.map.value = f.map, e(f.map, m.mapTransform));
  }
  function a(m, f) {
    m.dashSize.value = f.dashSize, m.totalSize.value = f.dashSize + f.gapSize, m.scale.value = f.scale;
  }
  function l(m, f, A, T) {
    m.diffuse.value.copy(f.color), m.opacity.value = f.opacity, m.size.value = f.size * A, m.scale.value = T * 0.5, f.map && (m.map.value = f.map, e(f.map, m.uvTransform)), f.alphaMap && (m.alphaMap.value = f.alphaMap, e(f.alphaMap, m.alphaMapTransform)), f.alphaTest > 0 && (m.alphaTest.value = f.alphaTest);
  }
  function c(m, f) {
    m.diffuse.value.copy(f.color), m.opacity.value = f.opacity, m.rotation.value = f.rotation, f.map && (m.map.value = f.map, e(f.map, m.mapTransform)), f.alphaMap && (m.alphaMap.value = f.alphaMap, e(f.alphaMap, m.alphaMapTransform)), f.alphaTest > 0 && (m.alphaTest.value = f.alphaTest);
  }
  function h(m, f) {
    m.specular.value.copy(f.specular), m.shininess.value = Math.max(f.shininess, 1e-4);
  }
  function u(m, f) {
    f.gradientMap && (m.gradientMap.value = f.gradientMap);
  }
  function d(m, f) {
    m.metalness.value = f.metalness, f.metalnessMap && (m.metalnessMap.value = f.metalnessMap, e(f.metalnessMap, m.metalnessMapTransform)), m.roughness.value = f.roughness, f.roughnessMap && (m.roughnessMap.value = f.roughnessMap, e(f.roughnessMap, m.roughnessMapTransform)), f.envMap && (m.envMapIntensity.value = f.envMapIntensity);
  }
  function p(m, f, A) {
    m.ior.value = f.ior, f.sheen > 0 && (m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen), m.sheenRoughness.value = f.sheenRoughness, f.sheenColorMap && (m.sheenColorMap.value = f.sheenColorMap, e(f.sheenColorMap, m.sheenColorMapTransform)), f.sheenRoughnessMap && (m.sheenRoughnessMap.value = f.sheenRoughnessMap, e(f.sheenRoughnessMap, m.sheenRoughnessMapTransform))), f.clearcoat > 0 && (m.clearcoat.value = f.clearcoat, m.clearcoatRoughness.value = f.clearcoatRoughness, f.clearcoatMap && (m.clearcoatMap.value = f.clearcoatMap, e(f.clearcoatMap, m.clearcoatMapTransform)), f.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = f.clearcoatRoughnessMap, e(f.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), f.clearcoatNormalMap && (m.clearcoatNormalMap.value = f.clearcoatNormalMap, e(f.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale), f.side === Fe && m.clearcoatNormalScale.value.negate())), f.dispersion > 0 && (m.dispersion.value = f.dispersion), f.iridescence > 0 && (m.iridescence.value = f.iridescence, m.iridescenceIOR.value = f.iridescenceIOR, m.iridescenceThicknessMinimum.value = f.iridescenceThicknessRange[0], m.iridescenceThicknessMaximum.value = f.iridescenceThicknessRange[1], f.iridescenceMap && (m.iridescenceMap.value = f.iridescenceMap, e(f.iridescenceMap, m.iridescenceMapTransform)), f.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = f.iridescenceThicknessMap, e(f.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), f.transmission > 0 && (m.transmission.value = f.transmission, m.transmissionSamplerMap.value = A.texture, m.transmissionSamplerSize.value.set(A.width, A.height), f.transmissionMap && (m.transmissionMap.value = f.transmissionMap, e(f.transmissionMap, m.transmissionMapTransform)), m.thickness.value = f.thickness, f.thicknessMap && (m.thicknessMap.value = f.thicknessMap, e(f.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = f.attenuationDistance, m.attenuationColor.value.copy(f.attenuationColor)), f.anisotropy > 0 && (m.anisotropyVector.value.set(f.anisotropy * Math.cos(f.anisotropyRotation), f.anisotropy * Math.sin(f.anisotropyRotation)), f.anisotropyMap && (m.anisotropyMap.value = f.anisotropyMap, e(f.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = f.specularIntensity, m.specularColor.value.copy(f.specularColor), f.specularColorMap && (m.specularColorMap.value = f.specularColorMap, e(f.specularColorMap, m.specularColorMapTransform)), f.specularIntensityMap && (m.specularIntensityMap.value = f.specularIntensityMap, e(f.specularIntensityMap, m.specularIntensityMapTransform));
  }
  function g(m, f) {
    f.matcap && (m.matcap.value = f.matcap);
  }
  function _(m, f) {
    const A = t.get(f).light;
    m.referencePosition.value.setFromMatrixPosition(A.matrixWorld), m.nearDistance.value = A.shadow.camera.near, m.farDistance.value = A.shadow.camera.far;
  }
  return { refreshFogUniforms: n, refreshMaterialUniforms: i };
}
function Vg(s, t, e, n) {
  let i = {}, r = {}, o = [];
  const a = s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(A, T) {
    const S = T.program;
    n.uniformBlockBinding(A, S);
  }
  function c(A, T) {
    let S = i[A.id];
    S === void 0 && (g(A), S = h(A), i[A.id] = S, A.addEventListener("dispose", m));
    const I = T.program;
    n.updateUBOMapping(A, I);
    const w = t.render.frame;
    r[A.id] !== w && (d(A), r[A.id] = w);
  }
  function h(A) {
    const T = u();
    A.__bindingPointIndex = T;
    const S = s.createBuffer(), I = A.__size, w = A.usage;
    return s.bindBuffer(s.UNIFORM_BUFFER, S), s.bufferData(s.UNIFORM_BUFFER, I, w), s.bindBuffer(s.UNIFORM_BUFFER, null), s.bindBufferBase(s.UNIFORM_BUFFER, T, S), S;
  }
  function u() {
    for (let A = 0; A < a; A++) if (o.indexOf(A) === -1) return o.push(A), A;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function d(A) {
    const T = i[A.id], S = A.uniforms, I = A.__cache;
    s.bindBuffer(s.UNIFORM_BUFFER, T);
    for (let w = 0, C = S.length; w < C; w++) {
      const N = Array.isArray(S[w]) ? S[w] : [S[w]];
      for (let M = 0, y = N.length; M < y; M++) {
        const P = N[M];
        if (p(P, w, M, I) === true) {
          const V = P.__offset, z = Array.isArray(P.value) ? P.value : [P.value];
          let X = 0;
          for (let K = 0; K < z.length; K++) {
            const G = z[K], Q = _(G);
            typeof G == "number" || typeof G == "boolean" ? (P.__data[0] = G, s.bufferSubData(s.UNIFORM_BUFFER, V + X, P.__data)) : G.isMatrix3 ? (P.__data[0] = G.elements[0], P.__data[1] = G.elements[1], P.__data[2] = G.elements[2], P.__data[3] = 0, P.__data[4] = G.elements[3], P.__data[5] = G.elements[4], P.__data[6] = G.elements[5], P.__data[7] = 0, P.__data[8] = G.elements[6], P.__data[9] = G.elements[7], P.__data[10] = G.elements[8], P.__data[11] = 0) : (G.toArray(P.__data, X), X += Q.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          s.bufferSubData(s.UNIFORM_BUFFER, V, P.__data);
        }
      }
    }
    s.bindBuffer(s.UNIFORM_BUFFER, null);
  }
  function p(A, T, S, I) {
    const w = A.value, C = T + "_" + S;
    if (I[C] === void 0) return typeof w == "number" || typeof w == "boolean" ? I[C] = w : I[C] = w.clone(), true;
    {
      const N = I[C];
      if (typeof w == "number" || typeof w == "boolean") {
        if (N !== w) return I[C] = w, true;
      } else if (N.equals(w) === false) return N.copy(w), true;
    }
    return false;
  }
  function g(A) {
    const T = A.uniforms;
    let S = 0;
    const I = 16;
    for (let C = 0, N = T.length; C < N; C++) {
      const M = Array.isArray(T[C]) ? T[C] : [T[C]];
      for (let y = 0, P = M.length; y < P; y++) {
        const V = M[y], z = Array.isArray(V.value) ? V.value : [V.value];
        for (let X = 0, K = z.length; X < K; X++) {
          const G = z[X], Q = _(G), H = S % I, rt = H % Q.boundary, ut = H + rt;
          S += rt, ut !== 0 && I - ut < Q.storage && (S += I - ut), V.__data = new Float32Array(Q.storage / Float32Array.BYTES_PER_ELEMENT), V.__offset = S, S += Q.storage;
        }
      }
    }
    const w = S % I;
    return w > 0 && (S += I - w), A.__size = S, A.__cache = {}, this;
  }
  function _(A) {
    const T = { boundary: 0, storage: 0 };
    return typeof A == "number" || typeof A == "boolean" ? (T.boundary = 4, T.storage = 4) : A.isVector2 ? (T.boundary = 8, T.storage = 8) : A.isVector3 || A.isColor ? (T.boundary = 16, T.storage = 12) : A.isVector4 ? (T.boundary = 16, T.storage = 16) : A.isMatrix3 ? (T.boundary = 48, T.storage = 48) : A.isMatrix4 ? (T.boundary = 64, T.storage = 64) : A.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", A), T;
  }
  function m(A) {
    const T = A.target;
    T.removeEventListener("dispose", m);
    const S = o.indexOf(T.__bindingPointIndex);
    o.splice(S, 1), s.deleteBuffer(i[T.id]), delete i[T.id], delete r[T.id];
  }
  function f() {
    for (const A in i) s.deleteBuffer(i[A]);
    o = [], i = {}, r = {};
  }
  return { bind: l, update: c, dispose: f };
}
class Gg {
  constructor(t = {}) {
    const { canvas: e = xu(), context: n = null, depth: i = true, stencil: r = false, alpha: o = false, antialias: a = false, premultipliedAlpha: l = true, preserveDrawingBuffer: c = false, powerPreference: h = "default", failIfMajorPerformanceCaveat: u = false, reverseDepthBuffer: d = false } = t;
    this.isWebGLRenderer = true;
    let p;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      p = n.getContextAttributes().alpha;
    } else p = o;
    const g = new Uint32Array(4), _ = new Int32Array(4);
    let m = null, f = null;
    const A = [], T = [];
    this.domElement = e, this.debug = { checkShaderErrors: true, onShaderError: null }, this.autoClear = true, this.autoClearColor = true, this.autoClearDepth = true, this.autoClearStencil = true, this.sortObjects = true, this.clippingPlanes = [], this.localClippingEnabled = false, this._outputColorSpace = Le, this.toneMapping = Xn, this.toneMappingExposure = 1;
    const S = this;
    let I = false, w = 0, C = 0, N = null, M = -1, y = null;
    const P = new ie(), V = new ie();
    let z = null;
    const X = new Wt(0);
    let K = 0, G = e.width, Q = e.height, H = 1, rt = null, ut = null;
    const vt = new ie(0, 0, G, Q), Ot = new ie(0, 0, G, Q);
    let ee = false;
    const Y = new Vc();
    let tt = false, gt = false;
    this.transmissionResolutionScale = 1;
    const ot = new Kt(), bt = new Kt(), qt = new b(), wt = new ie(), he = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: true };
    let ae = false;
    function Bt() {
      return N === null ? H : 1;
    }
    let R = n;
    function Ve(v, D) {
      return e.getContext(v, D);
    }
    try {
      const v = { alpha: true, depth: i, stencil: r, antialias: a, premultipliedAlpha: l, preserveDrawingBuffer: c, powerPreference: h, failIfMajorPerformanceCaveat: u };
      if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${ya}`), e.addEventListener("webglcontextlost", $, false), e.addEventListener("webglcontextrestored", ct, false), e.addEventListener("webglcontextcreationerror", lt, false), R === null) {
        const D = "webgl2";
        if (R = Ve(D, v), R === null) throw Ve(D) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (v) {
      throw console.error("THREE.WebGLRenderer: " + v.message), v;
    }
    let zt, kt, yt, se, xt, E, x, F, q, j, W, _t, at, dt, Vt, J, ft, Tt, At, pt, Ht, It, ne, L;
    function it() {
      zt = new Qp(R), zt.init(), It = new Ng(R, zt), kt = new Yp(R, zt, t, It), yt = new Ug(R, zt), kt.reverseDepthBuffer && d && yt.buffers.depth.setReversed(true), se = new nm(R), xt = new yg(), E = new Ig(R, zt, yt, xt, kt, It, se), x = new $p(S), F = new Jp(S), q = new ad(R), ne = new Wp(R, q), j = new tm(R, q, se, ne), W = new sm(R, j, q, se), At = new im(R, kt, E), J = new qp(xt), _t = new vg(S, x, F, zt, kt, ne, J), at = new Hg(S, xt), dt = new Sg(), Vt = new Cg(zt), Tt = new Gp(S, x, F, yt, W, p, l), ft = new Lg(S, W, kt), L = new Vg(R, se, kt, yt), pt = new Xp(R, zt, se), Ht = new em(R, zt, se), se.programs = _t.programs, S.capabilities = kt, S.extensions = zt, S.properties = xt, S.renderLists = dt, S.shadowMap = ft, S.state = yt, S.info = se;
    }
    it();
    const k = new zg(S, R);
    this.xr = k, this.getContext = function() {
      return R;
    }, this.getContextAttributes = function() {
      return R.getContextAttributes();
    }, this.forceContextLoss = function() {
      const v = zt.get("WEBGL_lose_context");
      v && v.loseContext();
    }, this.forceContextRestore = function() {
      const v = zt.get("WEBGL_lose_context");
      v && v.restoreContext();
    }, this.getPixelRatio = function() {
      return H;
    }, this.setPixelRatio = function(v) {
      v !== void 0 && (H = v, this.setSize(G, Q, false));
    }, this.getSize = function(v) {
      return v.set(G, Q);
    }, this.setSize = function(v, D, O = true) {
      if (k.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      G = v, Q = D, e.width = Math.floor(v * H), e.height = Math.floor(D * H), O === true && (e.style.width = v + "px", e.style.height = D + "px"), this.setViewport(0, 0, v, D);
    }, this.getDrawingBufferSize = function(v) {
      return v.set(G * H, Q * H).floor();
    }, this.setDrawingBufferSize = function(v, D, O) {
      G = v, Q = D, H = O, e.width = Math.floor(v * O), e.height = Math.floor(D * O), this.setViewport(0, 0, v, D);
    }, this.getCurrentViewport = function(v) {
      return v.copy(P);
    }, this.getViewport = function(v) {
      return v.copy(vt);
    }, this.setViewport = function(v, D, O, B) {
      v.isVector4 ? vt.set(v.x, v.y, v.z, v.w) : vt.set(v, D, O, B), yt.viewport(P.copy(vt).multiplyScalar(H).round());
    }, this.getScissor = function(v) {
      return v.copy(Ot);
    }, this.setScissor = function(v, D, O, B) {
      v.isVector4 ? Ot.set(v.x, v.y, v.z, v.w) : Ot.set(v, D, O, B), yt.scissor(V.copy(Ot).multiplyScalar(H).round());
    }, this.getScissorTest = function() {
      return ee;
    }, this.setScissorTest = function(v) {
      yt.setScissorTest(ee = v);
    }, this.setOpaqueSort = function(v) {
      rt = v;
    }, this.setTransparentSort = function(v) {
      ut = v;
    }, this.getClearColor = function(v) {
      return v.copy(Tt.getClearColor());
    }, this.setClearColor = function() {
      Tt.setClearColor(...arguments);
    }, this.getClearAlpha = function() {
      return Tt.getClearAlpha();
    }, this.setClearAlpha = function() {
      Tt.setClearAlpha(...arguments);
    }, this.clear = function(v = true, D = true, O = true) {
      let B = 0;
      if (v) {
        let U = false;
        if (N !== null) {
          const Z = N.texture.format;
          U = Z === wa || Z === Ta || Z === ba;
        }
        if (U) {
          const Z = N.texture.type, st = Z === Rn || Z === pi || Z === ws || Z === Ji || Z === Sa || Z === Ea, ht = Tt.getClearColor(), mt = Tt.getClearAlpha(), Ct = ht.r, Rt = ht.g, Mt = ht.b;
          st ? (g[0] = Ct, g[1] = Rt, g[2] = Mt, g[3] = mt, R.clearBufferuiv(R.COLOR, 0, g)) : (_[0] = Ct, _[1] = Rt, _[2] = Mt, _[3] = mt, R.clearBufferiv(R.COLOR, 0, _));
        } else B |= R.COLOR_BUFFER_BIT;
      }
      D && (B |= R.DEPTH_BUFFER_BIT), O && (B |= R.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), R.clear(B);
    }, this.clearColor = function() {
      this.clear(true, false, false);
    }, this.clearDepth = function() {
      this.clear(false, true, false);
    }, this.clearStencil = function() {
      this.clear(false, false, true);
    }, this.dispose = function() {
      e.removeEventListener("webglcontextlost", $, false), e.removeEventListener("webglcontextrestored", ct, false), e.removeEventListener("webglcontextcreationerror", lt, false), Tt.dispose(), dt.dispose(), Vt.dispose(), xt.dispose(), x.dispose(), F.dispose(), W.dispose(), ne.dispose(), L.dispose(), _t.dispose(), k.dispose(), k.removeEventListener("sessionstart", Oa), k.removeEventListener("sessionend", Ba), Kn.stop();
    };
    function $(v) {
      v.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), I = true;
    }
    function ct() {
      console.log("THREE.WebGLRenderer: Context Restored."), I = false;
      const v = se.autoReset, D = ft.enabled, O = ft.autoUpdate, B = ft.needsUpdate, U = ft.type;
      it(), se.autoReset = v, ft.enabled = D, ft.autoUpdate = O, ft.needsUpdate = B, ft.type = U;
    }
    function lt(v) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", v.statusMessage);
    }
    function Lt(v) {
      const D = v.target;
      D.removeEventListener("dispose", Lt), le(D);
    }
    function le(v) {
      Ee(v), xt.remove(v);
    }
    function Ee(v) {
      const D = xt.get(v).programs;
      D !== void 0 && (D.forEach(function(O) {
        _t.releaseProgram(O);
      }), v.isShaderMaterial && _t.releaseShaderCache(v));
    }
    this.renderBufferDirect = function(v, D, O, B, U, Z) {
      D === null && (D = he);
      const st = U.isMesh && U.matrixWorld.determinant() < 0, ht = lh(v, D, O, B, U);
      yt.setMaterial(B, st);
      let mt = O.index, Ct = 1;
      if (B.wireframe === true) {
        if (mt = j.getWireframeAttribute(O), mt === void 0) return;
        Ct = 2;
      }
      const Rt = O.drawRange, Mt = O.attributes.position;
      let Gt = Rt.start * Ct, $t = (Rt.start + Rt.count) * Ct;
      Z !== null && (Gt = Math.max(Gt, Z.start * Ct), $t = Math.min($t, (Z.start + Z.count) * Ct)), mt !== null ? (Gt = Math.max(Gt, 0), $t = Math.min($t, mt.count)) : Mt != null && (Gt = Math.max(Gt, 0), $t = Math.min($t, Mt.count));
      const ue = $t - Gt;
      if (ue < 0 || ue === 1 / 0) return;
      ne.setup(U, B, ht, O, mt);
      let ce, Xt = pt;
      if (mt !== null && (ce = q.get(mt), Xt = Ht, Xt.setIndex(ce)), U.isMesh) B.wireframe === true ? (yt.setLineWidth(B.wireframeLinewidth * Bt()), Xt.setMode(R.LINES)) : Xt.setMode(R.TRIANGLES);
      else if (U.isLine) {
        let St = B.linewidth;
        St === void 0 && (St = 1), yt.setLineWidth(St * Bt()), U.isLineSegments ? Xt.setMode(R.LINES) : U.isLineLoop ? Xt.setMode(R.LINE_LOOP) : Xt.setMode(R.LINE_STRIP);
      } else U.isPoints ? Xt.setMode(R.POINTS) : U.isSprite && Xt.setMode(R.TRIANGLES);
      if (U.isBatchedMesh) if (U._multiDrawInstances !== null) oi("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), Xt.renderMultiDrawInstances(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount, U._multiDrawInstances);
      else if (zt.get("WEBGL_multi_draw")) Xt.renderMultiDraw(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount);
      else {
        const St = U._multiDrawStarts, ve = U._multiDrawCounts, jt = U._multiDrawCount, Je = mt ? q.get(mt).bytesPerElement : 1, yi = xt.get(B).currentProgram.getUniforms();
        for (let ze = 0; ze < jt; ze++) yi.setValue(R, "_gl_DrawID", ze), Xt.render(St[ze] / Je, ve[ze]);
      }
      else if (U.isInstancedMesh) Xt.renderInstances(Gt, ue, U.count);
      else if (O.isInstancedBufferGeometry) {
        const St = O._maxInstanceCount !== void 0 ? O._maxInstanceCount : 1 / 0, ve = Math.min(O.instanceCount, St);
        Xt.renderInstances(Gt, ue, ve);
      } else Xt.render(Gt, ue);
    };
    function Zt(v, D, O) {
      v.transparent === true && v.side === $e && v.forceSinglePass === false ? (v.side = Fe, v.needsUpdate = true, Is(v, D, O), v.side = Yn, v.needsUpdate = true, Is(v, D, O), v.side = $e) : Is(v, D, O);
    }
    this.compile = function(v, D, O = null) {
      O === null && (O = v), f = Vt.get(O), f.init(D), T.push(f), O.traverseVisible(function(U) {
        U.isLight && U.layers.test(D.layers) && (f.pushLight(U), U.castShadow && f.pushShadow(U));
      }), v !== O && v.traverseVisible(function(U) {
        U.isLight && U.layers.test(D.layers) && (f.pushLight(U), U.castShadow && f.pushShadow(U));
      }), f.setupLights();
      const B = /* @__PURE__ */ new Set();
      return v.traverse(function(U) {
        if (!(U.isMesh || U.isPoints || U.isLine || U.isSprite)) return;
        const Z = U.material;
        if (Z) if (Array.isArray(Z)) for (let st = 0; st < Z.length; st++) {
          const ht = Z[st];
          Zt(ht, O, U), B.add(ht);
        }
        else Zt(Z, O, U), B.add(Z);
      }), f = T.pop(), B;
    }, this.compileAsync = function(v, D, O = null) {
      const B = this.compile(v, D, O);
      return new Promise((U) => {
        function Z() {
          if (B.forEach(function(st) {
            xt.get(st).currentProgram.isReady() && B.delete(st);
          }), B.size === 0) {
            U(v);
            return;
          }
          setTimeout(Z, 10);
        }
        zt.get("KHR_parallel_shader_compile") !== null ? Z() : setTimeout(Z, 10);
      });
    };
    let Ze = null;
    function mn(v) {
      Ze && Ze(v);
    }
    function Oa() {
      Kn.stop();
    }
    function Ba() {
      Kn.start();
    }
    const Kn = new Xc();
    Kn.setAnimationLoop(mn), typeof self < "u" && Kn.setContext(self), this.setAnimationLoop = function(v) {
      Ze = v, k.setAnimationLoop(v), v === null ? Kn.stop() : Kn.start();
    }, k.addEventListener("sessionstart", Oa), k.addEventListener("sessionend", Ba), this.render = function(v, D) {
      if (D !== void 0 && D.isCamera !== true) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (I === true) return;
      if (v.matrixWorldAutoUpdate === true && v.updateMatrixWorld(), D.parent === null && D.matrixWorldAutoUpdate === true && D.updateMatrixWorld(), k.enabled === true && k.isPresenting === true && (k.cameraAutoUpdate === true && k.updateCamera(D), D = k.getCamera()), v.isScene === true && v.onBeforeRender(S, v, D, N), f = Vt.get(v, T.length), f.init(D), T.push(f), bt.multiplyMatrices(D.projectionMatrix, D.matrixWorldInverse), Y.setFromProjectionMatrix(bt), gt = this.localClippingEnabled, tt = J.init(this.clippingPlanes, gt), m = dt.get(v, A.length), m.init(), A.push(m), k.enabled === true && k.isPresenting === true) {
        const Z = S.xr.getDepthSensingMesh();
        Z !== null && Or(Z, D, -1 / 0, S.sortObjects);
      }
      Or(v, D, 0, S.sortObjects), m.finish(), S.sortObjects === true && m.sort(rt, ut), ae = k.enabled === false || k.isPresenting === false || k.hasDepthSensing() === false, ae && Tt.addToRenderList(m, v), this.info.render.frame++, tt === true && J.beginShadows();
      const O = f.state.shadowsArray;
      ft.render(O, v, D), tt === true && J.endShadows(), this.info.autoReset === true && this.info.reset();
      const B = m.opaque, U = m.transmissive;
      if (f.setupLights(), D.isArrayCamera) {
        const Z = D.cameras;
        if (U.length > 0) for (let st = 0, ht = Z.length; st < ht; st++) {
          const mt = Z[st];
          ka(B, U, v, mt);
        }
        ae && Tt.render(v);
        for (let st = 0, ht = Z.length; st < ht; st++) {
          const mt = Z[st];
          za(m, v, mt, mt.viewport);
        }
      } else U.length > 0 && ka(B, U, v, D), ae && Tt.render(v), za(m, v, D);
      N !== null && C === 0 && (E.updateMultisampleRenderTarget(N), E.updateRenderTargetMipmap(N)), v.isScene === true && v.onAfterRender(S, v, D), ne.resetDefaultState(), M = -1, y = null, T.pop(), T.length > 0 ? (f = T[T.length - 1], tt === true && J.setGlobalState(S.clippingPlanes, f.state.camera)) : f = null, A.pop(), A.length > 0 ? m = A[A.length - 1] : m = null;
    };
    function Or(v, D, O, B) {
      if (v.visible === false) return;
      if (v.layers.test(D.layers)) {
        if (v.isGroup) O = v.renderOrder;
        else if (v.isLOD) v.autoUpdate === true && v.update(D);
        else if (v.isLight) f.pushLight(v), v.castShadow && f.pushShadow(v);
        else if (v.isSprite) {
          if (!v.frustumCulled || Y.intersectsSprite(v)) {
            B && wt.setFromMatrixPosition(v.matrixWorld).applyMatrix4(bt);
            const st = W.update(v), ht = v.material;
            ht.visible && m.push(v, st, ht, O, wt.z, null);
          }
        } else if ((v.isMesh || v.isLine || v.isPoints) && (!v.frustumCulled || Y.intersectsObject(v))) {
          const st = W.update(v), ht = v.material;
          if (B && (v.boundingSphere !== void 0 ? (v.boundingSphere === null && v.computeBoundingSphere(), wt.copy(v.boundingSphere.center)) : (st.boundingSphere === null && st.computeBoundingSphere(), wt.copy(st.boundingSphere.center)), wt.applyMatrix4(v.matrixWorld).applyMatrix4(bt)), Array.isArray(ht)) {
            const mt = st.groups;
            for (let Ct = 0, Rt = mt.length; Ct < Rt; Ct++) {
              const Mt = mt[Ct], Gt = ht[Mt.materialIndex];
              Gt && Gt.visible && m.push(v, st, Gt, O, wt.z, Mt);
            }
          } else ht.visible && m.push(v, st, ht, O, wt.z, null);
        }
      }
      const Z = v.children;
      for (let st = 0, ht = Z.length; st < ht; st++) Or(Z[st], D, O, B);
    }
    function za(v, D, O, B) {
      const U = v.opaque, Z = v.transmissive, st = v.transparent;
      f.setupLightsView(O), tt === true && J.setGlobalState(S.clippingPlanes, O), B && yt.viewport(P.copy(B)), U.length > 0 && Us(U, D, O), Z.length > 0 && Us(Z, D, O), st.length > 0 && Us(st, D, O), yt.buffers.depth.setTest(true), yt.buffers.depth.setMask(true), yt.buffers.color.setMask(true), yt.setPolygonOffset(false);
    }
    function ka(v, D, O, B) {
      if ((O.isScene === true ? O.overrideMaterial : null) !== null) return;
      f.state.transmissionRenderTarget[B.id] === void 0 && (f.state.transmissionRenderTarget[B.id] = new mi(1, 1, { generateMipmaps: true, type: zt.has("EXT_color_buffer_half_float") || zt.has("EXT_color_buffer_float") ? Cs : Rn, minFilter: ui, samples: 4, stencilBuffer: r, resolveDepthBuffer: false, resolveStencilBuffer: false, colorSpace: Yt.workingColorSpace }));
      const Z = f.state.transmissionRenderTarget[B.id], st = B.viewport || P;
      Z.setSize(st.z * S.transmissionResolutionScale, st.w * S.transmissionResolutionScale);
      const ht = S.getRenderTarget();
      S.setRenderTarget(Z), S.getClearColor(X), K = S.getClearAlpha(), K < 1 && S.setClearColor(16777215, 0.5), S.clear(), ae && Tt.render(O);
      const mt = S.toneMapping;
      S.toneMapping = Xn;
      const Ct = B.viewport;
      if (B.viewport !== void 0 && (B.viewport = void 0), f.setupLightsView(B), tt === true && J.setGlobalState(S.clippingPlanes, B), Us(v, O, B), E.updateMultisampleRenderTarget(Z), E.updateRenderTargetMipmap(Z), zt.has("WEBGL_multisampled_render_to_texture") === false) {
        let Rt = false;
        for (let Mt = 0, Gt = D.length; Mt < Gt; Mt++) {
          const $t = D[Mt], ue = $t.object, ce = $t.geometry, Xt = $t.material, St = $t.group;
          if (Xt.side === $e && ue.layers.test(B.layers)) {
            const ve = Xt.side;
            Xt.side = Fe, Xt.needsUpdate = true, Ha(ue, O, B, ce, Xt, St), Xt.side = ve, Xt.needsUpdate = true, Rt = true;
          }
        }
        Rt === true && (E.updateMultisampleRenderTarget(Z), E.updateRenderTargetMipmap(Z));
      }
      S.setRenderTarget(ht), S.setClearColor(X, K), Ct !== void 0 && (B.viewport = Ct), S.toneMapping = mt;
    }
    function Us(v, D, O) {
      const B = D.isScene === true ? D.overrideMaterial : null;
      for (let U = 0, Z = v.length; U < Z; U++) {
        const st = v[U], ht = st.object, mt = st.geometry, Ct = B === null ? st.material : B, Rt = st.group;
        ht.layers.test(O.layers) && Ha(ht, D, O, mt, Ct, Rt);
      }
    }
    function Ha(v, D, O, B, U, Z) {
      v.onBeforeRender(S, D, O, B, U, Z), v.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse, v.matrixWorld), v.normalMatrix.getNormalMatrix(v.modelViewMatrix), U.onBeforeRender(S, D, O, B, v, Z), U.transparent === true && U.side === $e && U.forceSinglePass === false ? (U.side = Fe, U.needsUpdate = true, S.renderBufferDirect(O, D, B, U, v, Z), U.side = Yn, U.needsUpdate = true, S.renderBufferDirect(O, D, B, U, v, Z), U.side = $e) : S.renderBufferDirect(O, D, B, U, v, Z), v.onAfterRender(S, D, O, B, U, Z);
    }
    function Is(v, D, O) {
      D.isScene !== true && (D = he);
      const B = xt.get(v), U = f.state.lights, Z = f.state.shadowsArray, st = U.state.version, ht = _t.getParameters(v, U.state, Z, D, O), mt = _t.getProgramCacheKey(ht);
      let Ct = B.programs;
      B.environment = v.isMeshStandardMaterial ? D.environment : null, B.fog = D.fog, B.envMap = (v.isMeshStandardMaterial ? F : x).get(v.envMap || B.environment), B.envMapRotation = B.environment !== null && v.envMap === null ? D.environmentRotation : v.envMapRotation, Ct === void 0 && (v.addEventListener("dispose", Lt), Ct = /* @__PURE__ */ new Map(), B.programs = Ct);
      let Rt = Ct.get(mt);
      if (Rt !== void 0) {
        if (B.currentProgram === Rt && B.lightsStateVersion === st) return Ga(v, ht), Rt;
      } else ht.uniforms = _t.getUniforms(v), v.onBeforeCompile(ht, S), Rt = _t.acquireProgram(ht, mt), Ct.set(mt, Rt), B.uniforms = ht.uniforms;
      const Mt = B.uniforms;
      return (!v.isShaderMaterial && !v.isRawShaderMaterial || v.clipping === true) && (Mt.clippingPlanes = J.uniform), Ga(v, ht), B.needsLights = hh(v), B.lightsStateVersion = st, B.needsLights && (Mt.ambientLightColor.value = U.state.ambient, Mt.lightProbe.value = U.state.probe, Mt.directionalLights.value = U.state.directional, Mt.directionalLightShadows.value = U.state.directionalShadow, Mt.spotLights.value = U.state.spot, Mt.spotLightShadows.value = U.state.spotShadow, Mt.rectAreaLights.value = U.state.rectArea, Mt.ltc_1.value = U.state.rectAreaLTC1, Mt.ltc_2.value = U.state.rectAreaLTC2, Mt.pointLights.value = U.state.point, Mt.pointLightShadows.value = U.state.pointShadow, Mt.hemisphereLights.value = U.state.hemi, Mt.directionalShadowMap.value = U.state.directionalShadowMap, Mt.directionalShadowMatrix.value = U.state.directionalShadowMatrix, Mt.spotShadowMap.value = U.state.spotShadowMap, Mt.spotLightMatrix.value = U.state.spotLightMatrix, Mt.spotLightMap.value = U.state.spotLightMap, Mt.pointShadowMap.value = U.state.pointShadowMap, Mt.pointShadowMatrix.value = U.state.pointShadowMatrix), B.currentProgram = Rt, B.uniformsList = null, Rt;
    }
    function Va(v) {
      if (v.uniformsList === null) {
        const D = v.currentProgram.getUniforms();
        v.uniformsList = wr.seqWithValue(D.seq, v.uniforms);
      }
      return v.uniformsList;
    }
    function Ga(v, D) {
      const O = xt.get(v);
      O.outputColorSpace = D.outputColorSpace, O.batching = D.batching, O.batchingColor = D.batchingColor, O.instancing = D.instancing, O.instancingColor = D.instancingColor, O.instancingMorph = D.instancingMorph, O.skinning = D.skinning, O.morphTargets = D.morphTargets, O.morphNormals = D.morphNormals, O.morphColors = D.morphColors, O.morphTargetsCount = D.morphTargetsCount, O.numClippingPlanes = D.numClippingPlanes, O.numIntersection = D.numClipIntersection, O.vertexAlphas = D.vertexAlphas, O.vertexTangents = D.vertexTangents, O.toneMapping = D.toneMapping;
    }
    function lh(v, D, O, B, U) {
      D.isScene !== true && (D = he), E.resetTextureUnits();
      const Z = D.fog, st = B.isMeshStandardMaterial ? D.environment : null, ht = N === null ? S.outputColorSpace : N.isXRRenderTarget === true ? N.texture.colorSpace : ts, mt = (B.isMeshStandardMaterial ? F : x).get(B.envMap || st), Ct = B.vertexColors === true && !!O.attributes.color && O.attributes.color.itemSize === 4, Rt = !!O.attributes.tangent && (!!B.normalMap || B.anisotropy > 0), Mt = !!O.morphAttributes.position, Gt = !!O.morphAttributes.normal, $t = !!O.morphAttributes.color;
      let ue = Xn;
      B.toneMapped && (N === null || N.isXRRenderTarget === true) && (ue = S.toneMapping);
      const ce = O.morphAttributes.position || O.morphAttributes.normal || O.morphAttributes.color, Xt = ce !== void 0 ? ce.length : 0, St = xt.get(B), ve = f.state.lights;
      if (tt === true && (gt === true || v !== y)) {
        const Ce = v === y && B.id === M;
        J.setState(B, v, Ce);
      }
      let jt = false;
      B.version === St.__version ? (St.needsLights && St.lightsStateVersion !== ve.state.version || St.outputColorSpace !== ht || U.isBatchedMesh && St.batching === false || !U.isBatchedMesh && St.batching === true || U.isBatchedMesh && St.batchingColor === true && U.colorTexture === null || U.isBatchedMesh && St.batchingColor === false && U.colorTexture !== null || U.isInstancedMesh && St.instancing === false || !U.isInstancedMesh && St.instancing === true || U.isSkinnedMesh && St.skinning === false || !U.isSkinnedMesh && St.skinning === true || U.isInstancedMesh && St.instancingColor === true && U.instanceColor === null || U.isInstancedMesh && St.instancingColor === false && U.instanceColor !== null || U.isInstancedMesh && St.instancingMorph === true && U.morphTexture === null || U.isInstancedMesh && St.instancingMorph === false && U.morphTexture !== null || St.envMap !== mt || B.fog === true && St.fog !== Z || St.numClippingPlanes !== void 0 && (St.numClippingPlanes !== J.numPlanes || St.numIntersection !== J.numIntersection) || St.vertexAlphas !== Ct || St.vertexTangents !== Rt || St.morphTargets !== Mt || St.morphNormals !== Gt || St.morphColors !== $t || St.toneMapping !== ue || St.morphTargetsCount !== Xt) && (jt = true) : (jt = true, St.__version = B.version);
      let Je = St.currentProgram;
      jt === true && (Je = Is(B, D, U));
      let yi = false, ze = false, ls = false;
      const re = Je.getUniforms(), Ge = St.uniforms;
      if (yt.useProgram(Je.program) && (yi = true, ze = true, ls = true), B.id !== M && (M = B.id, ze = true), yi || y !== v) {
        yt.buffers.depth.getReversed() ? (ot.copy(v.projectionMatrix), yu(ot), Mu(ot), re.setValue(R, "projectionMatrix", ot)) : re.setValue(R, "projectionMatrix", v.projectionMatrix), re.setValue(R, "viewMatrix", v.matrixWorldInverse);
        const Ue = re.map.cameraPosition;
        Ue !== void 0 && Ue.setValue(R, qt.setFromMatrixPosition(v.matrixWorld)), kt.logarithmicDepthBuffer && re.setValue(R, "logDepthBufFC", 2 / (Math.log(v.far + 1) / Math.LN2)), (B.isMeshPhongMaterial || B.isMeshToonMaterial || B.isMeshLambertMaterial || B.isMeshBasicMaterial || B.isMeshStandardMaterial || B.isShaderMaterial) && re.setValue(R, "isOrthographic", v.isOrthographicCamera === true), y !== v && (y = v, ze = true, ls = true);
      }
      if (U.isSkinnedMesh) {
        re.setOptional(R, U, "bindMatrix"), re.setOptional(R, U, "bindMatrixInverse");
        const Ce = U.skeleton;
        Ce && (Ce.boneTexture === null && Ce.computeBoneTexture(), re.setValue(R, "boneTexture", Ce.boneTexture, E));
      }
      U.isBatchedMesh && (re.setOptional(R, U, "batchingTexture"), re.setValue(R, "batchingTexture", U._matricesTexture, E), re.setOptional(R, U, "batchingIdTexture"), re.setValue(R, "batchingIdTexture", U._indirectTexture, E), re.setOptional(R, U, "batchingColorTexture"), U._colorsTexture !== null && re.setValue(R, "batchingColorTexture", U._colorsTexture, E));
      const We = O.morphAttributes;
      if ((We.position !== void 0 || We.normal !== void 0 || We.color !== void 0) && At.update(U, O, Je), (ze || St.receiveShadow !== U.receiveShadow) && (St.receiveShadow = U.receiveShadow, re.setValue(R, "receiveShadow", U.receiveShadow)), B.isMeshGouraudMaterial && B.envMap !== null && (Ge.envMap.value = mt, Ge.flipEnvMap.value = mt.isCubeTexture && mt.isRenderTargetTexture === false ? -1 : 1), B.isMeshStandardMaterial && B.envMap === null && D.environment !== null && (Ge.envMapIntensity.value = D.environmentIntensity), ze && (re.setValue(R, "toneMappingExposure", S.toneMappingExposure), St.needsLights && ch(Ge, ls), Z && B.fog === true && at.refreshFogUniforms(Ge, Z), at.refreshMaterialUniforms(Ge, B, H, Q, f.state.transmissionRenderTarget[v.id]), wr.upload(R, Va(St), Ge, E)), B.isShaderMaterial && B.uniformsNeedUpdate === true && (wr.upload(R, Va(St), Ge, E), B.uniformsNeedUpdate = false), B.isSpriteMaterial && re.setValue(R, "center", U.center), re.setValue(R, "modelViewMatrix", U.modelViewMatrix), re.setValue(R, "normalMatrix", U.normalMatrix), re.setValue(R, "modelMatrix", U.matrixWorld), B.isShaderMaterial || B.isRawShaderMaterial) {
        const Ce = B.uniformsGroups;
        for (let Ue = 0, Br = Ce.length; Ue < Br; Ue++) {
          const Zn = Ce[Ue];
          L.update(Zn, Je), L.bind(Zn, Je);
        }
      }
      return Je;
    }
    function ch(v, D) {
      v.ambientLightColor.needsUpdate = D, v.lightProbe.needsUpdate = D, v.directionalLights.needsUpdate = D, v.directionalLightShadows.needsUpdate = D, v.pointLights.needsUpdate = D, v.pointLightShadows.needsUpdate = D, v.spotLights.needsUpdate = D, v.spotLightShadows.needsUpdate = D, v.rectAreaLights.needsUpdate = D, v.hemisphereLights.needsUpdate = D;
    }
    function hh(v) {
      return v.isMeshLambertMaterial || v.isMeshToonMaterial || v.isMeshPhongMaterial || v.isMeshStandardMaterial || v.isShadowMaterial || v.isShaderMaterial && v.lights === true;
    }
    this.getActiveCubeFace = function() {
      return w;
    }, this.getActiveMipmapLevel = function() {
      return C;
    }, this.getRenderTarget = function() {
      return N;
    }, this.setRenderTargetTextures = function(v, D, O) {
      xt.get(v.texture).__webglTexture = D, xt.get(v.depthTexture).__webglTexture = O;
      const B = xt.get(v);
      B.__hasExternalTextures = true, B.__autoAllocateDepthBuffer = O === void 0, B.__autoAllocateDepthBuffer || zt.has("WEBGL_multisampled_render_to_texture") === true && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), B.__useRenderToTexture = false);
    }, this.setRenderTargetFramebuffer = function(v, D) {
      const O = xt.get(v);
      O.__webglFramebuffer = D, O.__useDefaultFramebuffer = D === void 0;
    };
    const uh = R.createFramebuffer();
    this.setRenderTarget = function(v, D = 0, O = 0) {
      N = v, w = D, C = O;
      let B = true, U = null, Z = false, st = false;
      if (v) {
        const mt = xt.get(v);
        if (mt.__useDefaultFramebuffer !== void 0) yt.bindFramebuffer(R.FRAMEBUFFER, null), B = false;
        else if (mt.__webglFramebuffer === void 0) E.setupRenderTarget(v);
        else if (mt.__hasExternalTextures) E.rebindTextures(v, xt.get(v.texture).__webglTexture, xt.get(v.depthTexture).__webglTexture);
        else if (v.depthBuffer) {
          const Mt = v.depthTexture;
          if (mt.__boundDepthTexture !== Mt) {
            if (Mt !== null && xt.has(Mt) && (v.width !== Mt.image.width || v.height !== Mt.image.height)) throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            E.setupDepthRenderbuffer(v);
          }
        }
        const Ct = v.texture;
        (Ct.isData3DTexture || Ct.isDataArrayTexture || Ct.isCompressedArrayTexture) && (st = true);
        const Rt = xt.get(v).__webglFramebuffer;
        v.isWebGLCubeRenderTarget ? (Array.isArray(Rt[D]) ? U = Rt[D][O] : U = Rt[D], Z = true) : v.samples > 0 && E.useMultisampledRTT(v) === false ? U = xt.get(v).__webglMultisampledFramebuffer : Array.isArray(Rt) ? U = Rt[O] : U = Rt, P.copy(v.viewport), V.copy(v.scissor), z = v.scissorTest;
      } else P.copy(vt).multiplyScalar(H).floor(), V.copy(Ot).multiplyScalar(H).floor(), z = ee;
      if (O !== 0 && (U = uh), yt.bindFramebuffer(R.FRAMEBUFFER, U) && B && yt.drawBuffers(v, U), yt.viewport(P), yt.scissor(V), yt.setScissorTest(z), Z) {
        const mt = xt.get(v.texture);
        R.framebufferTexture2D(R.FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_CUBE_MAP_POSITIVE_X + D, mt.__webglTexture, O);
      } else if (st) {
        const mt = xt.get(v.texture), Ct = D;
        R.framebufferTextureLayer(R.FRAMEBUFFER, R.COLOR_ATTACHMENT0, mt.__webglTexture, O, Ct);
      } else if (v !== null && O !== 0) {
        const mt = xt.get(v.texture);
        R.framebufferTexture2D(R.FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_2D, mt.__webglTexture, O);
      }
      M = -1;
    }, this.readRenderTargetPixels = function(v, D, O, B, U, Z, st) {
      if (!(v && v.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let ht = xt.get(v).__webglFramebuffer;
      if (v.isWebGLCubeRenderTarget && st !== void 0 && (ht = ht[st]), ht) {
        yt.bindFramebuffer(R.FRAMEBUFFER, ht);
        try {
          const mt = v.texture, Ct = mt.format, Rt = mt.type;
          if (!kt.textureFormatReadable(Ct)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!kt.textureTypeReadable(Rt)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          D >= 0 && D <= v.width - B && O >= 0 && O <= v.height - U && R.readPixels(D, O, B, U, It.convert(Ct), It.convert(Rt), Z);
        } finally {
          const mt = N !== null ? xt.get(N).__webglFramebuffer : null;
          yt.bindFramebuffer(R.FRAMEBUFFER, mt);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(v, D, O, B, U, Z, st) {
      if (!(v && v.isWebGLRenderTarget)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let ht = xt.get(v).__webglFramebuffer;
      if (v.isWebGLCubeRenderTarget && st !== void 0 && (ht = ht[st]), ht) {
        const mt = v.texture, Ct = mt.format, Rt = mt.type;
        if (!kt.textureFormatReadable(Ct)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!kt.textureTypeReadable(Rt)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        if (D >= 0 && D <= v.width - B && O >= 0 && O <= v.height - U) {
          yt.bindFramebuffer(R.FRAMEBUFFER, ht);
          const Mt = R.createBuffer();
          R.bindBuffer(R.PIXEL_PACK_BUFFER, Mt), R.bufferData(R.PIXEL_PACK_BUFFER, Z.byteLength, R.STREAM_READ), R.readPixels(D, O, B, U, It.convert(Ct), It.convert(Rt), 0);
          const Gt = N !== null ? xt.get(N).__webglFramebuffer : null;
          yt.bindFramebuffer(R.FRAMEBUFFER, Gt);
          const $t = R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return R.flush(), await vu(R, $t, 4), R.bindBuffer(R.PIXEL_PACK_BUFFER, Mt), R.getBufferSubData(R.PIXEL_PACK_BUFFER, 0, Z), R.deleteBuffer(Mt), R.deleteSync($t), Z;
        } else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
      }
    }, this.copyFramebufferToTexture = function(v, D = null, O = 0) {
      v.isTexture !== true && (oi("WebGLRenderer: copyFramebufferToTexture function signature has changed."), D = arguments[0] || null, v = arguments[1]);
      const B = Math.pow(2, -O), U = Math.floor(v.image.width * B), Z = Math.floor(v.image.height * B), st = D !== null ? D.x : 0, ht = D !== null ? D.y : 0;
      E.setTexture2D(v, 0), R.copyTexSubImage2D(R.TEXTURE_2D, O, 0, 0, st, ht, U, Z), yt.unbindTexture();
    };
    const dh = R.createFramebuffer(), fh = R.createFramebuffer();
    this.copyTextureToTexture = function(v, D, O = null, B = null, U = 0, Z = null) {
      v.isTexture !== true && (oi("WebGLRenderer: copyTextureToTexture function signature has changed."), B = arguments[0] || null, v = arguments[1], D = arguments[2], Z = arguments[3] || 0, O = null), Z === null && (U !== 0 ? (oi("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), Z = U, U = 0) : Z = 0);
      let st, ht, mt, Ct, Rt, Mt, Gt, $t, ue;
      const ce = v.isCompressedTexture ? v.mipmaps[Z] : v.image;
      if (O !== null) st = O.max.x - O.min.x, ht = O.max.y - O.min.y, mt = O.isBox3 ? O.max.z - O.min.z : 1, Ct = O.min.x, Rt = O.min.y, Mt = O.isBox3 ? O.min.z : 0;
      else {
        const We = Math.pow(2, -U);
        st = Math.floor(ce.width * We), ht = Math.floor(ce.height * We), v.isDataArrayTexture ? mt = ce.depth : v.isData3DTexture ? mt = Math.floor(ce.depth * We) : mt = 1, Ct = 0, Rt = 0, Mt = 0;
      }
      B !== null ? (Gt = B.x, $t = B.y, ue = B.z) : (Gt = 0, $t = 0, ue = 0);
      const Xt = It.convert(D.format), St = It.convert(D.type);
      let ve;
      D.isData3DTexture ? (E.setTexture3D(D, 0), ve = R.TEXTURE_3D) : D.isDataArrayTexture || D.isCompressedArrayTexture ? (E.setTexture2DArray(D, 0), ve = R.TEXTURE_2D_ARRAY) : (E.setTexture2D(D, 0), ve = R.TEXTURE_2D), R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL, D.flipY), R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL, D.premultiplyAlpha), R.pixelStorei(R.UNPACK_ALIGNMENT, D.unpackAlignment);
      const jt = R.getParameter(R.UNPACK_ROW_LENGTH), Je = R.getParameter(R.UNPACK_IMAGE_HEIGHT), yi = R.getParameter(R.UNPACK_SKIP_PIXELS), ze = R.getParameter(R.UNPACK_SKIP_ROWS), ls = R.getParameter(R.UNPACK_SKIP_IMAGES);
      R.pixelStorei(R.UNPACK_ROW_LENGTH, ce.width), R.pixelStorei(R.UNPACK_IMAGE_HEIGHT, ce.height), R.pixelStorei(R.UNPACK_SKIP_PIXELS, Ct), R.pixelStorei(R.UNPACK_SKIP_ROWS, Rt), R.pixelStorei(R.UNPACK_SKIP_IMAGES, Mt);
      const re = v.isDataArrayTexture || v.isData3DTexture, Ge = D.isDataArrayTexture || D.isData3DTexture;
      if (v.isDepthTexture) {
        const We = xt.get(v), Ce = xt.get(D), Ue = xt.get(We.__renderTarget), Br = xt.get(Ce.__renderTarget);
        yt.bindFramebuffer(R.READ_FRAMEBUFFER, Ue.__webglFramebuffer), yt.bindFramebuffer(R.DRAW_FRAMEBUFFER, Br.__webglFramebuffer);
        for (let Zn = 0; Zn < mt; Zn++) re && (R.framebufferTextureLayer(R.READ_FRAMEBUFFER, R.COLOR_ATTACHMENT0, xt.get(v).__webglTexture, U, Mt + Zn), R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER, R.COLOR_ATTACHMENT0, xt.get(D).__webglTexture, Z, ue + Zn)), R.blitFramebuffer(Ct, Rt, st, ht, Gt, $t, st, ht, R.DEPTH_BUFFER_BIT, R.NEAREST);
        yt.bindFramebuffer(R.READ_FRAMEBUFFER, null), yt.bindFramebuffer(R.DRAW_FRAMEBUFFER, null);
      } else if (U !== 0 || v.isRenderTargetTexture || xt.has(v)) {
        const We = xt.get(v), Ce = xt.get(D);
        yt.bindFramebuffer(R.READ_FRAMEBUFFER, dh), yt.bindFramebuffer(R.DRAW_FRAMEBUFFER, fh);
        for (let Ue = 0; Ue < mt; Ue++) re ? R.framebufferTextureLayer(R.READ_FRAMEBUFFER, R.COLOR_ATTACHMENT0, We.__webglTexture, U, Mt + Ue) : R.framebufferTexture2D(R.READ_FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_2D, We.__webglTexture, U), Ge ? R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER, R.COLOR_ATTACHMENT0, Ce.__webglTexture, Z, ue + Ue) : R.framebufferTexture2D(R.DRAW_FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_2D, Ce.__webglTexture, Z), U !== 0 ? R.blitFramebuffer(Ct, Rt, st, ht, Gt, $t, st, ht, R.COLOR_BUFFER_BIT, R.NEAREST) : Ge ? R.copyTexSubImage3D(ve, Z, Gt, $t, ue + Ue, Ct, Rt, st, ht) : R.copyTexSubImage2D(ve, Z, Gt, $t, Ct, Rt, st, ht);
        yt.bindFramebuffer(R.READ_FRAMEBUFFER, null), yt.bindFramebuffer(R.DRAW_FRAMEBUFFER, null);
      } else Ge ? v.isDataTexture || v.isData3DTexture ? R.texSubImage3D(ve, Z, Gt, $t, ue, st, ht, mt, Xt, St, ce.data) : D.isCompressedArrayTexture ? R.compressedTexSubImage3D(ve, Z, Gt, $t, ue, st, ht, mt, Xt, ce.data) : R.texSubImage3D(ve, Z, Gt, $t, ue, st, ht, mt, Xt, St, ce) : v.isDataTexture ? R.texSubImage2D(R.TEXTURE_2D, Z, Gt, $t, st, ht, Xt, St, ce.data) : v.isCompressedTexture ? R.compressedTexSubImage2D(R.TEXTURE_2D, Z, Gt, $t, ce.width, ce.height, Xt, ce.data) : R.texSubImage2D(R.TEXTURE_2D, Z, Gt, $t, st, ht, Xt, St, ce);
      R.pixelStorei(R.UNPACK_ROW_LENGTH, jt), R.pixelStorei(R.UNPACK_IMAGE_HEIGHT, Je), R.pixelStorei(R.UNPACK_SKIP_PIXELS, yi), R.pixelStorei(R.UNPACK_SKIP_ROWS, ze), R.pixelStorei(R.UNPACK_SKIP_IMAGES, ls), Z === 0 && D.generateMipmaps && R.generateMipmap(ve), yt.unbindTexture();
    }, this.copyTextureToTexture3D = function(v, D, O = null, B = null, U = 0) {
      return v.isTexture !== true && (oi("WebGLRenderer: copyTextureToTexture3D function signature has changed."), O = arguments[0] || null, B = arguments[1] || null, v = arguments[2], D = arguments[3], U = arguments[4] || 0), oi('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'), this.copyTextureToTexture(v, D, O, B, U);
    }, this.initRenderTarget = function(v) {
      xt.get(v).__webglFramebuffer === void 0 && E.setupRenderTarget(v);
    }, this.initTexture = function(v) {
      v.isCubeTexture ? E.setTextureCube(v, 0) : v.isData3DTexture ? E.setTexture3D(v, 0) : v.isDataArrayTexture || v.isCompressedArrayTexture ? E.setTexture2DArray(v, 0) : E.setTexture2D(v, 0), yt.unbindTexture();
    }, this.resetState = function() {
      w = 0, C = 0, N = null, yt.reset(), ne.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return Tn;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(t) {
    this._outputColorSpace = t;
    const e = this.getContext();
    e.drawingBufferColorspace = Yt._getDrawingBufferColorSpace(t), e.unpackColorSpace = Yt._getUnpackColorSpace();
  }
}
const Jl = { type: "change" }, Ia = { type: "start" }, Kc = { type: "end" }, hr = new Rs(), Ql = new En(), Wg = Math.cos(70 * es.DEG2RAD), pe = new b(), Ie = 2 * Math.PI, te = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_PAN: 4, TOUCH_DOLLY_PAN: 5, TOUCH_DOLLY_ROTATE: 6 }, go = 1e-6;
class Xg extends rd {
  constructor(t, e = null) {
    super(t, e), this.state = te.NONE, this.enabled = true, this.target = new b(), this.cursor = new b(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = false, this.dampingFactor = 0.05, this.enableZoom = true, this.zoomSpeed = 1, this.enableRotate = true, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = true, this.panSpeed = 1, this.screenSpacePanning = true, this.keyPanSpeed = 7, this.zoomToCursor = false, this.autoRotate = false, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: wn.ROTATE, MIDDLE: wn.DOLLY, RIGHT: wn.PAN }, this.touches = { ONE: Gi.ROTATE, TWO: Gi.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new b(), this._lastQuaternion = new Pn(), this._lastTargetPosition = new b(), this._quat = new Pn().setFromUnitVectors(t.up, new b(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new Tl(), this._sphericalDelta = new Tl(), this._scale = 1, this._panOffset = new b(), this._rotateStart = new Et(), this._rotateEnd = new Et(), this._rotateDelta = new Et(), this._panStart = new Et(), this._panEnd = new Et(), this._panDelta = new Et(), this._dollyStart = new Et(), this._dollyEnd = new Et(), this._dollyDelta = new Et(), this._dollyDirection = new b(), this._mouse = new Et(), this._performCursorZoom = false, this._pointers = [], this._pointerPositions = {}, this._controlActive = false, this._onPointerMove = qg.bind(this), this._onPointerDown = Yg.bind(this), this._onPointerUp = $g.bind(this), this._onContextMenu = e_.bind(this), this._onMouseWheel = Zg.bind(this), this._onKeyDown = Jg.bind(this), this._onTouchStart = Qg.bind(this), this._onTouchMove = t_.bind(this), this._onMouseDown = jg.bind(this), this._onMouseMove = Kg.bind(this), this._interceptControlDown = n_.bind(this), this._interceptControlUp = i_.bind(this), this.domElement !== null && this.connect(), this.update();
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
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(Jl), this.update(), this.state = te.NONE;
  }
  update(t = null) {
    const e = this.object.position;
    pe.copy(e).sub(this.target), pe.applyQuaternion(this._quat), this._spherical.setFromVector3(pe), this.autoRotate && this.state === te.NONE && this._rotateLeft(this._getAutoRotationAngle(t)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let n = this.minAzimuthAngle, i = this.maxAzimuthAngle;
    isFinite(n) && isFinite(i) && (n < -Math.PI ? n += Ie : n > Math.PI && (n -= Ie), i < -Math.PI ? i += Ie : i > Math.PI && (i -= Ie), n <= i ? this._spherical.theta = Math.max(n, Math.min(i, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + i) / 2 ? Math.max(n, this._spherical.theta) : Math.min(i, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === true ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
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
      o !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position) : (hr.origin.copy(this.object.position), hr.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(hr.direction)) < Wg ? this.object.lookAt(this.target) : (Ql.setFromNormalAndCoplanarPoint(this.object.up, this.target), hr.intersectPlane(Ql, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const o = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), o !== this.object.zoom && (this.object.updateProjectionMatrix(), r = true);
    }
    return this._scale = 1, this._performCursorZoom = false, r || this._lastPosition.distanceToSquared(this.object.position) > go || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > go || this._lastTargetPosition.distanceToSquared(this.target) > go ? (this.dispatchEvent(Jl), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), true) : false;
  }
  _getAutoRotationAngle(t) {
    return t !== null ? Ie / 60 * this.autoRotateSpeed * t : Ie / 60 / 60 * this.autoRotateSpeed;
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
    this._rotateLeft(Ie * this._rotateDelta.x / e.clientHeight), this._rotateUp(Ie * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
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
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(Ie * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), e = true;
        break;
      case this.keys.BOTTOM:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(-Ie * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), e = true;
        break;
      case this.keys.LEFT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(Ie * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), e = true;
        break;
      case this.keys.RIGHT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(-Ie * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), e = true;
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
    this._rotateLeft(Ie * this._rotateDelta.x / e.clientHeight), this._rotateUp(Ie * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd);
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
    e === void 0 && (e = new Et(), this._pointerPositions[t.pointerId] = e), e.set(t.pageX, t.pageY);
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
function Yg(s) {
  this.enabled !== false && (this._pointers.length === 0 && (this.domElement.setPointerCapture(s.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(s) && (this._addPointer(s), s.pointerType === "touch" ? this._onTouchStart(s) : this._onMouseDown(s)));
}
function qg(s) {
  this.enabled !== false && (s.pointerType === "touch" ? this._onTouchMove(s) : this._onMouseMove(s));
}
function $g(s) {
  switch (this._removePointer(s), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(s.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(Kc), this.state = te.NONE;
      break;
    case 1:
      const t = this._pointers[0], e = this._pointerPositions[t];
      this._onTouchStart({ pointerId: t, pageX: e.x, pageY: e.y });
      break;
  }
}
function jg(s) {
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
    case wn.DOLLY:
      if (this.enableZoom === false) return;
      this._handleMouseDownDolly(s), this.state = te.DOLLY;
      break;
    case wn.ROTATE:
      if (s.ctrlKey || s.metaKey || s.shiftKey) {
        if (this.enablePan === false) return;
        this._handleMouseDownPan(s), this.state = te.PAN;
      } else {
        if (this.enableRotate === false) return;
        this._handleMouseDownRotate(s), this.state = te.ROTATE;
      }
      break;
    case wn.PAN:
      if (s.ctrlKey || s.metaKey || s.shiftKey) {
        if (this.enableRotate === false) return;
        this._handleMouseDownRotate(s), this.state = te.ROTATE;
      } else {
        if (this.enablePan === false) return;
        this._handleMouseDownPan(s), this.state = te.PAN;
      }
      break;
    default:
      this.state = te.NONE;
  }
  this.state !== te.NONE && this.dispatchEvent(Ia);
}
function Kg(s) {
  switch (this.state) {
    case te.ROTATE:
      if (this.enableRotate === false) return;
      this._handleMouseMoveRotate(s);
      break;
    case te.DOLLY:
      if (this.enableZoom === false) return;
      this._handleMouseMoveDolly(s);
      break;
    case te.PAN:
      if (this.enablePan === false) return;
      this._handleMouseMovePan(s);
      break;
  }
}
function Zg(s) {
  this.enabled === false || this.enableZoom === false || this.state !== te.NONE || (s.preventDefault(), this.dispatchEvent(Ia), this._handleMouseWheel(this._customWheelEvent(s)), this.dispatchEvent(Kc));
}
function Jg(s) {
  this.enabled !== false && this._handleKeyDown(s);
}
function Qg(s) {
  switch (this._trackPointer(s), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case Gi.ROTATE:
          if (this.enableRotate === false) return;
          this._handleTouchStartRotate(s), this.state = te.TOUCH_ROTATE;
          break;
        case Gi.PAN:
          if (this.enablePan === false) return;
          this._handleTouchStartPan(s), this.state = te.TOUCH_PAN;
          break;
        default:
          this.state = te.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case Gi.DOLLY_PAN:
          if (this.enableZoom === false && this.enablePan === false) return;
          this._handleTouchStartDollyPan(s), this.state = te.TOUCH_DOLLY_PAN;
          break;
        case Gi.DOLLY_ROTATE:
          if (this.enableZoom === false && this.enableRotate === false) return;
          this._handleTouchStartDollyRotate(s), this.state = te.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = te.NONE;
      }
      break;
    default:
      this.state = te.NONE;
  }
  this.state !== te.NONE && this.dispatchEvent(Ia);
}
function t_(s) {
  switch (this._trackPointer(s), this.state) {
    case te.TOUCH_ROTATE:
      if (this.enableRotate === false) return;
      this._handleTouchMoveRotate(s), this.update();
      break;
    case te.TOUCH_PAN:
      if (this.enablePan === false) return;
      this._handleTouchMovePan(s), this.update();
      break;
    case te.TOUCH_DOLLY_PAN:
      if (this.enableZoom === false && this.enablePan === false) return;
      this._handleTouchMoveDollyPan(s), this.update();
      break;
    case te.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === false && this.enableRotate === false) return;
      this._handleTouchMoveDollyRotate(s), this.update();
      break;
    default:
      this.state = te.NONE;
  }
}
function e_(s) {
  this.enabled !== false && s.preventDefault();
}
function n_(s) {
  s.key === "Control" && (this._controlActive = true, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, { passive: true, capture: true }));
}
function i_(s) {
  s.key === "Control" && (this._controlActive = false, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, { passive: true, capture: true }));
}
const _s = 0.62, _o = 0.5, xs = new Et(), si = new b(), tc = new b(), ec = new b(), nc = new b(), ur = new b();
function zi() {
  return { x: 0, y: 0, w: 0, h: 0 };
}
class s_ {
  constructor(t, e, n) {
    this.renderer = t, this.scene = e, this.topOffset = 0, this.onBeforeViewport = null;
    const i = new cn(-1, 1, 1, -1, -4e3, 8e3), r = new cn(-1, 1, 1, -1, -4e3, 8e3), o = new qe(50, 1, 0.1, 12e3);
    i.layers.enable(1), o.layers.enable(2), i.layers.enable(3), r.layers.enable(3), o.layers.enable(3), i.layers.enable(4), r.layers.enable(4), o.layers.enable(4), r.layers.enable(5), o.layers.enable(5), this.main = { name: "main", camera: i, clearColor: 1512990, fx: 0, fy: 0, fw: _s, fh: 1, css: zi(), gl: zi(), frustumHeight: 60, vExag: 1 }, this.section = { name: "section", camera: r, clearColor: 1315353, fx: _s, fy: 0, fw: 1 - _s, fh: _o, css: zi(), gl: zi(), frustumHeight: 30, vExag: 1 }, this.iso = { name: "iso", camera: o, clearColor: 1118230, fx: _s, fy: _o, fw: 1 - _s, fh: 1 - _o, css: zi(), gl: zi(), frustumHeight: 30, vExag: 1 }, this.list = [this.main, this.section, this.iso], this.orbit = new Xg(o, n), this.orbit.enableDamping = true, this.orbit.dampingFactor = 0.08, this.orbit.mouseButtons.MIDDLE = wn.ROTATE, this.orbit.mouseButtons.RIGHT = wn.PAN, this.renderer.setScissorTest(true), window.addEventListener("resize", () => this.resize()), this.resize();
  }
  setTopOffset(t) {
    const e = Math.max(0, Math.round(t));
    e !== this.topOffset && (this.topOffset = e, this.resize());
  }
  resize() {
    const t = window.innerWidth, e = window.innerHeight, n = Math.min(this.topOffset, e - 40), i = e - n;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)), this.renderer.setSize(t, e, false);
    for (const r of this.list) r.css.x = r.fx * t, r.css.y = n + r.fy * i, r.css.w = r.fw * t, r.css.h = r.fh * i, r.gl.x = r.css.x, r.gl.w = r.css.w, r.gl.h = r.css.h, r.gl.y = e - (r.css.y + r.css.h), r.camera instanceof cn ? this.applyOrtho(r) : (r.camera.aspect = r.css.w / Math.max(1, r.css.h), r.camera.updateProjectionMatrix());
  }
  update() {
    this.orbit.update();
  }
  render() {
    const t = this.renderer;
    for (const e of this.list) t.setViewport(e.gl.x, e.gl.y, e.gl.w, e.gl.h), t.setScissor(e.gl.x, e.gl.y, e.gl.w, e.gl.h), t.setClearColor(e.clearColor, 1), this.onBeforeViewport && this.onBeforeViewport(e), t.render(this.scene, e.camera);
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
    return t.camera instanceof cn ? t.frustumHeight / Math.max(1, t.css.h) : 0.01;
  }
  projectToClient(t, e, n) {
    si.copy(e).project(t.camera), n.x = t.css.x + (si.x * 0.5 + 0.5) * t.css.w, n.y = t.css.y + (-si.y * 0.5 + 0.5) * t.css.h;
  }
  setOrthoView(t, e, n, i, r) {
    const o = t.camera;
    t.frustumHeight = r, o.up.copy(n), o.position.copy(i).addScaledVector(e, 600), o.lookAt(i), o.updateMatrixWorld(true), this.applyOrtho(t);
  }
  setTopView(t, e) {
    si.set(0, 1, 0), ur.set(0, 0, -1), this.setOrthoView(this.main, si, ur, t, e);
  }
  setIsoView(t, e) {
    const n = this.iso.camera;
    si.set(0.9, 0.7, 0.9).normalize().multiplyScalar(e * 2.1), n.position.copy(t).add(si), this.orbit.target.copy(t), this.orbit.update();
  }
  setExaggeration(t, e) {
    t.vExag = es.clamp(e, 1, 50), t.camera instanceof cn && this.applyOrtho(t);
  }
  zoomAt(t, e, n, i) {
    t.camera instanceof cn && (this.ndcInto(t, e, n, xs), tc.set(xs.x, xs.y, 0).unproject(t.camera), t.frustumHeight = es.clamp(t.frustumHeight * i, 0.05, 12e3), this.applyOrtho(t), ec.set(xs.x, xs.y, 0).unproject(t.camera), t.camera.position.add(tc.sub(ec)), t.camera.updateMatrixWorld(true));
  }
  pan(t, e, n) {
    if (!(t.camera instanceof cn)) return;
    const i = this.worldPerPixel(t), r = t.camera.matrixWorld.elements;
    nc.set(r[0], r[1], r[2]), ur.set(r[4], r[5], r[6]), t.camera.position.addScaledVector(nc, -e * i).addScaledVector(ur, n * i / t.vExag), t.camera.updateMatrixWorld(true);
  }
  applyOrtho(t) {
    const e = t.camera, n = t.css.w / Math.max(1, t.css.h);
    e.right = t.frustumHeight * n / 2, e.left = -e.right, e.top = t.frustumHeight / (2 * t.vExag), e.bottom = -e.top, e.updateProjectionMatrix();
  }
}
class r_ {
  constructor() {
    this.defined = false, this.matrix = new Kt(), this.inverse = new Kt(), this.origin = new b(), this.xAxis = new b(1, 0, 0), this.yAxis = new b(0, 1, 0), this.zAxis = new b(0, 0, 1), this.group = new di(), this.plane = new En(new b(0, 1, 0), 0), this.group.matrixAutoUpdate = false, this.axesHelper = o_(), this.axesHelper.matrixAutoUpdate = false, this.axesHelper.visible = false;
  }
  setFromPoints(t, e) {
    this.xAxis.subVectors(e, t), this.xAxis.y = 0, this.xAxis.lengthSq() < 1e-8 && this.xAxis.set(1, 0, 0), this.xAxis.normalize(), this.zAxis.set(0, 1, 0), this.yAxis.crossVectors(this.zAxis, this.xAxis).normalize(), this.origin.set(t.x, 0, t.z), this.matrix.makeBasis(this.xAxis, this.yAxis, this.zAxis).setPosition(this.origin), this.finalize();
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
function o_() {
  const s = new Float32Array([0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 3]), t = new Float32Array([1, 0.3, 0.3, 1, 0.3, 0.3, 0.3, 1, 0.45, 0.3, 1, 0.45, 0.35, 0.55, 1, 0.35, 0.55, 1]), e = new me();
  e.setAttribute("position", new oe(s, 3)), e.setAttribute("color", new oe(t, 3));
  const n = new is({ vertexColors: true, depthTest: false }), i = new La(e, n);
  return i.renderOrder = 3, i.frustumCulled = false, i;
}
const dr = new b(), ic = 0.35, xo = 2048;
class a_ {
  constructor() {
    this.cellStart = null, this.order = null, this.pts = null, this.cols = 1, this.rows = 1, this.ox = 0, this.oy = 0, this.cell = ic, this.localBounds = new Un(), this.ready = false;
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
      const d = (e ? e[u] : u) * 3, p = t[d], g = t[d + 1], _ = t[d + 2], m = o[0] * p + o[4] * g + o[8] * _ + o[12], f = o[1] * p + o[5] * g + o[9] * _ + o[13], A = o[2] * p + o[6] * g + o[10] * _ + o[14];
      r[u * 3] = m, r[u * 3 + 1] = f, r[u * 3 + 2] = A, m < a && (a = m), m > c && (c = m), f < l && (l = f), f > h && (h = f);
    }
    this.finishBuild(r, i, a, l, c, h);
  }
  finishBuild(t, e, n, i, r, o) {
    dr.set(n, i, 0), this.localBounds.expandByPoint(dr), dr.set(r, o, 0), this.localBounds.expandByPoint(dr), this.ox = n, this.oy = i, this.cell = Math.max(ic, Math.max(r - n, o - i) / xo), this.cols = Math.max(1, Math.min(xo, Math.ceil((r - n) / this.cell) + 1)), this.rows = Math.max(1, Math.min(xo, Math.ceil((o - i) / this.cell) + 1));
    const a = this.cols * this.rows, l = new Int32Array(a + 1), c = new Int32Array(e);
    for (let d = 0; d < e; d++) {
      const p = this.cellIndex(t[d * 3], t[d * 3 + 1]);
      c[d] = p, l[p + 1]++;
    }
    for (let d = 0; d < a; d++) l[d + 1] += l[d];
    const h = new Int32Array(e), u = Int32Array.from(l.subarray(0, a));
    for (let d = 0; d < e; d++) h[u[c[d]]++] = d;
    this.pts = t, this.cellStart = l, this.order = h, this.ready = true;
  }
  cellIndex(t, e) {
    const n = Math.min(this.cols - 1, Math.max(0, Math.floor((t - this.ox) / this.cell)));
    return Math.min(this.rows - 1, Math.max(0, Math.floor((e - this.oy) / this.cell))) * this.cols + n;
  }
  query(t, e, n, i, r = -1 / 0, o = 1 / 0) {
    const a = this.pts, l = this.cellStart, c = this.order;
    if (!this.ready || !a || !l || !c) return false;
    const h = Math.min(4, Math.ceil(n / this.cell)), u = Math.floor((t - this.ox) / this.cell), d = Math.floor((e - this.oy) / this.cell);
    let p = -1, g = n * n;
    const _ = Math.max(0, u - h), m = Math.min(this.cols - 1, u + h), f = Math.max(0, d - h), A = Math.min(this.rows - 1, d + h);
    for (let T = f; T <= A; T++) {
      const S = T * this.cols;
      for (let I = _; I <= m; I++) {
        const w = S + I;
        for (let C = l[w], N = l[w + 1]; C < N; C++) {
          const M = c[C] * 3, y = a[M + 2];
          if (y < r || y > o) continue;
          const P = a[M] - t, V = a[M + 1] - e, z = P * P + V * V;
          z < g && (g = z, p = M);
        }
      }
    }
    return p < 0 ? false : (i.set(a[p], a[p + 1], a[p + 2]), true);
  }
  clear() {
    this.cellStart = null, this.order = null, this.pts = null, this.ready = false, this.localBounds.makeEmpty();
  }
}
const sc = new Un(), fr = new b();
class Zc extends td {
  constructor() {
    super(), this.isLineSegmentsGeometry = true, this.type = "LineSegmentsGeometry";
    const t = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], e = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], n = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(n), this.setAttribute("position", new Oe(t, 3)), this.setAttribute("uv", new Oe(e, 2));
  }
  applyMatrix4(t) {
    const e = this.attributes.instanceStart, n = this.attributes.instanceEnd;
    return e !== void 0 && (e.applyMatrix4(t), n.applyMatrix4(t), e.needsUpdate = true), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(t) {
    let e;
    t instanceof Float32Array ? e = t : Array.isArray(t) && (e = new Float32Array(t));
    const n = new _a(e, 6, 1);
    return this.setAttribute("instanceStart", new fn(n, 3, 0)), this.setAttribute("instanceEnd", new fn(n, 3, 3)), this.instanceCount = this.attributes.instanceStart.count, this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(t) {
    let e;
    t instanceof Float32Array ? e = t : Array.isArray(t) && (e = new Float32Array(t));
    const n = new _a(e, 6, 1);
    return this.setAttribute("instanceColorStart", new fn(n, 3, 0)), this.setAttribute("instanceColorEnd", new fn(n, 3, 3)), this;
  }
  fromWireframeGeometry(t) {
    return this.setPositions(t.attributes.position.array), this;
  }
  fromEdgesGeometry(t) {
    return this.setPositions(t.attributes.position.array), this;
  }
  fromMesh(t) {
    return this.fromWireframeGeometry(new Zu(t.geometry)), this;
  }
  fromLineSegments(t) {
    const e = t.geometry;
    return this.setPositions(e.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new Un());
    const t = this.attributes.instanceStart, e = this.attributes.instanceEnd;
    t !== void 0 && e !== void 0 && (this.boundingBox.setFromBufferAttribute(t), sc.setFromBufferAttribute(e), this.boundingBox.union(sc));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new qn()), this.boundingBox === null && this.computeBoundingBox();
    const t = this.attributes.instanceStart, e = this.attributes.instanceEnd;
    if (t !== void 0 && e !== void 0) {
      const n = this.boundingSphere.center;
      this.boundingBox.getCenter(n);
      let i = 0;
      for (let r = 0, o = t.count; r < o; r++) fr.fromBufferAttribute(t, r), i = Math.max(i, n.distanceToSquared(fr)), fr.fromBufferAttribute(e, r), i = Math.max(i, n.distanceToSquared(fr));
      this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.", this);
    }
  }
  toJSON() {
  }
  applyMatrix(t) {
    return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."), this.applyMatrix4(t);
  }
}
et.line = { worldUnits: { value: 1 }, linewidth: { value: 1 }, resolution: { value: new Et(1, 1) }, dashOffset: { value: 0 }, dashScale: { value: 1 }, dashSize: { value: 1 }, gapSize: { value: 1 } };
Ne.line = { uniforms: Pa.merge([et.common, et.fog, et.line]), vertexShader: `
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
class gi extends pn {
  constructor(t) {
    super({ type: "LineMaterial", uniforms: Pa.clone(Ne.line.uniforms), vertexShader: Ne.line.vertexShader, fragmentShader: Ne.line.fragmentShader, clipping: true }), this.isLineMaterial = true, this.setValues(t);
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
const vo = new ie(), rc = new b(), oc = new b(), ye = new ie(), Me = new ie(), on = new ie(), yo = new b(), Mo = new Kt(), Se = new id(), ac = new b(), pr = new Un(), mr = new qn(), an = new ie();
let un, fi;
function lc(s, t, e) {
  return an.set(0, 0, -t, 1).applyMatrix4(s.projectionMatrix), an.multiplyScalar(1 / an.w), an.x = fi / e.width, an.y = fi / e.height, an.applyMatrix4(s.projectionMatrixInverse), an.multiplyScalar(1 / an.w), Math.abs(Math.max(an.x, an.y));
}
function l_(s, t) {
  const e = s.matrixWorld, n = s.geometry, i = n.attributes.instanceStart, r = n.attributes.instanceEnd, o = Math.min(n.instanceCount, i.count);
  for (let a = 0, l = o; a < l; a++) {
    Se.start.fromBufferAttribute(i, a), Se.end.fromBufferAttribute(r, a), Se.applyMatrix4(e);
    const c = new b(), h = new b();
    un.distanceSqToSegment(Se.start, Se.end, h, c), h.distanceTo(c) < fi * 0.5 && t.push({ point: h, pointOnLine: c, distance: un.origin.distanceTo(h), object: s, face: null, faceIndex: a, uv: null, uv1: null });
  }
}
function c_(s, t, e) {
  const n = t.projectionMatrix, r = s.material.resolution, o = s.matrixWorld, a = s.geometry, l = a.attributes.instanceStart, c = a.attributes.instanceEnd, h = Math.min(a.instanceCount, l.count), u = -t.near;
  un.at(1, on), on.w = 1, on.applyMatrix4(t.matrixWorldInverse), on.applyMatrix4(n), on.multiplyScalar(1 / on.w), on.x *= r.x / 2, on.y *= r.y / 2, on.z = 0, yo.copy(on), Mo.multiplyMatrices(t.matrixWorldInverse, o);
  for (let d = 0, p = h; d < p; d++) {
    if (ye.fromBufferAttribute(l, d), Me.fromBufferAttribute(c, d), ye.w = 1, Me.w = 1, ye.applyMatrix4(Mo), Me.applyMatrix4(Mo), ye.z > u && Me.z > u) continue;
    if (ye.z > u) {
      const T = ye.z - Me.z, S = (ye.z - u) / T;
      ye.lerp(Me, S);
    } else if (Me.z > u) {
      const T = Me.z - ye.z, S = (Me.z - u) / T;
      Me.lerp(ye, S);
    }
    ye.applyMatrix4(n), Me.applyMatrix4(n), ye.multiplyScalar(1 / ye.w), Me.multiplyScalar(1 / Me.w), ye.x *= r.x / 2, ye.y *= r.y / 2, Me.x *= r.x / 2, Me.y *= r.y / 2, Se.start.copy(ye), Se.start.z = 0, Se.end.copy(Me), Se.end.z = 0;
    const _ = Se.closestPointToPointParameter(yo, true);
    Se.at(_, ac);
    const m = es.lerp(ye.z, Me.z, _), f = m >= -1 && m <= 1, A = yo.distanceTo(ac) < fi * 0.5;
    if (f && A) {
      Se.start.fromBufferAttribute(l, d), Se.end.fromBufferAttribute(c, d), Se.start.applyMatrix4(o), Se.end.applyMatrix4(o);
      const T = new b(), S = new b();
      un.distanceSqToSegment(Se.start, Se.end, S, T), e.push({ point: S, pointOnLine: T, distance: un.origin.distanceTo(S), object: s, face: null, faceIndex: d, uv: null, uv1: null });
    }
  }
}
class h_ extends Ke {
  constructor(t = new Zc(), e = new gi({ color: Math.random() * 16777215 })) {
    super(t, e), this.isLineSegments2 = true, this.type = "LineSegments2";
  }
  computeLineDistances() {
    const t = this.geometry, e = t.attributes.instanceStart, n = t.attributes.instanceEnd, i = new Float32Array(2 * e.count);
    for (let o = 0, a = 0, l = e.count; o < l; o++, a += 2) rc.fromBufferAttribute(e, o), oc.fromBufferAttribute(n, o), i[a] = a === 0 ? 0 : i[a - 1], i[a + 1] = i[a] + rc.distanceTo(oc);
    const r = new _a(i, 2, 1);
    return t.setAttribute("instanceDistanceStart", new fn(r, 1, 0)), t.setAttribute("instanceDistanceEnd", new fn(r, 1, 1)), this;
  }
  raycast(t, e) {
    const n = this.material.worldUnits, i = t.camera;
    i === null && !n && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const r = t.params.Line2 !== void 0 && t.params.Line2.threshold || 0;
    un = t.ray;
    const o = this.matrixWorld, a = this.geometry, l = this.material;
    fi = l.linewidth + r, a.boundingSphere === null && a.computeBoundingSphere(), mr.copy(a.boundingSphere).applyMatrix4(o);
    let c;
    if (n) c = fi * 0.5;
    else {
      const u = Math.max(i.near, mr.distanceToPoint(un.origin));
      c = lc(i, u, l.resolution);
    }
    if (mr.radius += c, un.intersectsSphere(mr) === false) return;
    a.boundingBox === null && a.computeBoundingBox(), pr.copy(a.boundingBox).applyMatrix4(o);
    let h;
    if (n) h = fi * 0.5;
    else {
      const u = Math.max(i.near, pr.distanceToPoint(un.origin));
      h = lc(i, u, l.resolution);
    }
    pr.expandByScalar(h), un.intersectsBox(pr) !== false && (n ? l_(this, e) : c_(this, i, e));
  }
  onBeforeRender(t) {
    const e = this.material.uniforms;
    e && e.resolution && (t.getViewport(vo), this.material.uniforms.resolution.value.set(vo.z, vo.w));
  }
}
class Ur extends Zc {
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
class Jc extends h_ {
  constructor(t = new Ur(), e = new gi({ color: Math.random() * 16777215 })) {
    super(t, e), this.isLine2 = true, this.type = "Line2";
  }
}
let u_ = 1, Gn = null;
function d_(s) {
  Gn = s;
}
const f_ = new gi({ color: 14542591, linewidth: 1.6 }), p_ = new is({ color: 9149689, transparent: true, opacity: 0.4, depthTest: false }), Qc = new gi({ color: 9149689, transparent: true, opacity: 0.4, linewidth: 1.6, depthTest: false }), m_ = new Ps({ color: 9149689, transparent: true, opacity: 0.25, side: $e, depthWrite: false, depthTest: false }), Ut = { minx: 0, miny: 0, maxx: 0, maxy: 0 };
class th {
  constructor() {
    this.id = u_++, this.points = [], this.layer = Gn ? Gn.current : "0", this.selected = false;
  }
  setSelected(t) {
    this.selected !== t && (this.selected = t, this.refreshAppearance());
  }
  refreshAppearance() {
    if (!Gn) return;
    const t = Gn.get(this.layer);
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
    Ut.minx = 1 / 0, Ut.miny = 1 / 0, Ut.maxx = -1 / 0, Ut.maxy = -1 / 0;
    for (const t of this.points) Ut.minx = Math.min(Ut.minx, t.x), Ut.miny = Math.min(Ut.miny, t.y), Ut.maxx = Math.max(Ut.maxx, t.x), Ut.maxy = Math.max(Ut.maxy, t.y);
    return Ut;
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
class Ds extends th {
  constructor() {
    super(), this.samples = new Float32Array(0);
    const t = Gn ? Gn.get(Gn.current).mat : f_;
    this.object3D = new Jc(new Ur(), t), this.object3D.userData.entity = this, this.object3D.frustumCulled = false;
  }
  rebuild() {
    this.samples = this.fillSamples();
    const t = this.object3D.geometry, e = new Ur();
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
      let p = d > 0 ? ((t - o) * h + (e - a) * u) / d : 0;
      p = Math.max(0, Math.min(1, p));
      const g = o + h * p - t, _ = a + u * p - e, m = g * g + _ * _;
      m < i && (i = m);
    }
    return Math.sqrt(i);
  }
  boundsFromSamples() {
    const t = this.samples;
    Ut.minx = 1 / 0, Ut.miny = 1 / 0, Ut.maxx = -1 / 0, Ut.maxy = -1 / 0;
    for (let e = 0; e + 2 < t.length; e += 3) Ut.minx = Math.min(Ut.minx, t[e]), Ut.miny = Math.min(Ut.miny, t[e + 1]), Ut.maxx = Math.max(Ut.maxx, t[e]), Ut.maxy = Math.max(Ut.maxy, t[e + 1]);
    return Ut;
  }
  dispose() {
    this.object3D.geometry.dispose();
  }
}
class Be extends Ds {
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
    const e = new Be(this.points.map((n) => new b(n.x + t.x, n.y + t.y, 0)), this.closed);
    return e.layer = this.layer, e;
  }
  toJSON() {
    const t = [];
    for (const e of this.points) t.push(e.x, e.y);
    return { k: "pl", pts: t, closed: this.closed, l: this.layer };
  }
}
const So = 72;
class $n extends Ds {
  constructor(t, e) {
    super(), this.kind = "circle", this.points.push(new b(t.x, t.y, 0)), this.radius = Math.max(1e-4, e), this.rebuild();
  }
  fillSamples() {
    const t = this.points[0], e = new Float32Array((So + 1) * 3);
    for (let n = 0; n <= So; n++) {
      const i = n / So * Math.PI * 2;
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
    return Ut.minx = t.x - this.radius, Ut.miny = t.y - this.radius, Ut.maxx = t.x + this.radius, Ut.maxy = t.y + this.radius, Ut;
  }
  makeCopy(t) {
    const e = new $n(new b(this.points[0].x + t.x, this.points[0].y + t.y, 0), this.radius);
    return e.layer = this.layer, e;
  }
  toJSON() {
    return { k: "ci", c: [this.points[0].x, this.points[0].y], r: this.radius, l: this.layer };
  }
}
const Eo = 64;
class Dn extends Ds {
  constructor(t, e, n, i) {
    super(), this.kind = "arc", this.points.push(new b(t.x, t.y, 0)), this.radius = Math.max(1e-4, e), this.a0 = n, this.sweep = i, this.rebuild();
  }
  fillSamples() {
    const t = this.points[0], e = new Float32Array((Eo + 1) * 3);
    for (let n = 0; n <= Eo; n++) {
      const i = this.a0 + this.sweep * n / Eo;
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
    const e = new Dn(new b(this.points[0].x + t.x, this.points[0].y + t.y, 0), this.radius, this.a0, this.sweep);
    return e.layer = this.layer, e;
  }
  toJSON() {
    return { k: "ar", c: [this.points[0].x, this.points[0].y], r: this.radius, a0: this.a0, sw: this.sweep, l: this.layer };
  }
}
const bo = 72;
class os extends Ds {
  constructor(t, e, n, i = 0) {
    super(), this.kind = "ellipse", this.points.push(new b(t.x, t.y, 0)), this.rx = Math.max(1e-4, e), this.ry = Math.max(1e-4, n), this.rot = i, this.rebuild();
  }
  fillSamples() {
    const t = this.points[0], e = Math.cos(this.rot), n = Math.sin(this.rot), i = new Float32Array((bo + 1) * 3);
    for (let r = 0; r <= bo; r++) {
      const o = r / bo * Math.PI * 2, a = this.rx * Math.cos(o), l = this.ry * Math.sin(o);
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
    const e = new os(new b(this.points[0].x + t.x, this.points[0].y + t.y, 0), this.rx, this.ry, this.rot);
    return e.layer = this.layer, e;
  }
  toJSON() {
    return { k: "el", c: [this.points[0].x, this.points[0].y], rx: this.rx, ry: this.ry, rot: this.rot, l: this.layer };
  }
}
class as extends th {
  constructor(t, e, n = 0.35, i = 0) {
    super(), this.text = e, this.kind = "text", this.points.push(new b(t.x, t.y, 0)), this.height = n, this.baseHeight = n, this.rotation = i;
    const r = document.createElement("canvas"), o = '600 96px "Segoe UI", system-ui, sans-serif';
    let a = r.getContext("2d");
    a.font = o, r.width = Math.max(32, Math.ceil(a.measureText(e).width) + 16), r.height = 128, a = r.getContext("2d"), a.font = o, a.fillStyle = "#ffffff", a.textBaseline = "middle", a.fillText(e, 8, 64);
    const l = new Da(r);
    l.colorSpace = Le, l.anisotropy = 4, this.aspect = r.width / r.height;
    const c = this.baseHeight * this.aspect, h = new ss(c, this.baseHeight);
    h.translate(c / 2, this.baseHeight / 2, 0), this.material = new Ps({ map: l, transparent: true, side: $e, depthWrite: false, depthTest: false }), this.object3D = new Ke(h, this.material), this.object3D.userData.entity = this, this.object3D.renderOrder = 2, this.rebuild();
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
    this.material.color.set(this.selected ? "#f472b6" : t.color);
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
    return Ut.minx = t.x, Ut.miny = t.y, Ut.maxx = t.x + this.width, Ut.maxy = t.y + this.height, Ut;
  }
  makeCopy(t) {
    const e = new as(new b(this.points[0].x + t.x, this.points[0].y + t.y, 0), this.text, this.height, this.rotation);
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
const ln = 0.4, g_ = 0.9;
class vi extends Ds {
  constructor(t, e = "", n = null) {
    super(), this.kind = "point", this.labelMesh = null, this.labelMat = null, this.points.push(new b(t.x, t.y, 0)), this.label = e, this.deviation = n, this.rebuild(), e && this.buildLabel();
  }
  fillSamples() {
    const t = this.points[0];
    return new Float32Array([t.x - ln, t.y, 0, t.x, t.y + ln, 0, t.x + ln, t.y, 0, t.x, t.y - ln, 0, t.x - ln, t.y, 0]);
  }
  buildLabel() {
    const t = document.createElement("canvas"), e = '600 64px "Segoe UI", system-ui, sans-serif';
    let n = t.getContext("2d");
    n.font = e, t.width = Math.ceil(n.measureText(this.label).width) + 12, t.height = 80, n = t.getContext("2d"), n.font = e, n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(this.label, 6, 42);
    const i = new Da(t);
    i.colorSpace = Le, i.anisotropy = 4;
    const r = g_, o = r * t.width / t.height, a = new ss(o, r);
    a.translate(o / 2 + ln * 1.6, r / 2, 0), this.labelMat = new Ps({ map: i, transparent: true, side: $e, depthWrite: false, depthTest: false }), this.labelMesh = new Ke(a, this.labelMat), this.labelMesh.renderOrder = 2, this.labelMesh.layers.set(3), this.object3D.add(this.labelMesh), this.placeLabel();
  }
  placeLabel() {
    this.labelMesh && this.labelMesh.position.set(this.points[0].x, this.points[0].y, 2e-3);
  }
  rebuild() {
    super.rebuild(), this.placeLabel();
  }
  applyLayer(t) {
    var _a2;
    super.applyLayer(t), (_a2 = this.labelMat) == null ? void 0 : _a2.color.set(this.selected ? "#f472b6" : t.color);
  }
  getBounds() {
    const t = this.points[0];
    return Ut.minx = t.x - ln, Ut.miny = t.y - ln, Ut.maxx = t.x + ln, Ut.maxy = t.y + ln, Ut;
  }
  makeCopy(t) {
    const e = new vi(new b(this.points[0].x + t.x, this.points[0].y + t.y, 0), this.label, this.deviation);
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
const vs = new b();
function __(s) {
  let t = null;
  switch (s.k) {
    case "pl": {
      const e = [];
      for (let n = 0; n + 1 < s.pts.length; n += 2) e.push(new b(s.pts[n], s.pts[n + 1], 0));
      t = e.length >= 2 ? new Be(e, s.closed) : null;
      break;
    }
    case "ci":
      t = new $n(vs.set(s.c[0], s.c[1], 0), s.r);
      break;
    case "ar":
      t = new Dn(vs.set(s.c[0], s.c[1], 0), s.r, s.a0, s.sw);
      break;
    case "el":
      t = new os(vs.set(s.c[0], s.c[1], 0), s.rx, s.ry, s.rot);
      break;
    case "tx":
      t = new as(vs.set(s.a[0], s.a[1], 0), s.t, s.h, s.rot);
      break;
    case "pt":
      t = new vi(vs.set(s.a[0], s.a[1], 0), s.lbl ?? "", s.dev ?? null);
      break;
  }
  return t && (t.layer = s.l ?? "0"), t;
}
class x_ {
  constructor(t) {
    this.parent = t, this.entities = [], this.selection = /* @__PURE__ */ new Set(), this.pickables = [], this.onChange = null;
  }
  add(t) {
    var _a2;
    t.object3D.layers.set(3), t.object3D.renderOrder = 2, this.entities.push(t), this.pickables.push(t.object3D), this.parent.add(t.object3D), t.refreshAppearance(), (_a2 = this.onChange) == null ? void 0 : _a2.call(this);
  }
  remove(t) {
    var _a2;
    const e = this.entities.indexOf(t);
    e >= 0 && this.entities.splice(e, 1);
    const n = this.pickables.indexOf(t.object3D);
    n >= 0 && this.pickables.splice(n, 1), this.selection.delete(t), this.parent.remove(t.object3D), t.dispose(), (_a2 = this.onChange) == null ? void 0 : _a2.call(this);
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
  rebase(t, e) {
    for (const n of this.entities) {
      for (const i of n.points) i.applyMatrix4(t).applyMatrix4(e), i.z = 0;
      n.rebuild();
    }
  }
  serialize() {
    return JSON.stringify(this.entities.map((t) => t.toJSON()));
  }
  restore(t) {
    this.clearAll();
    const e = JSON.parse(t);
    for (const n of e) {
      const i = __(n);
      i && this.add(i);
    }
  }
  clearAll() {
    for (const t of [...this.entities]) this.remove(t);
  }
}
const v_ = "#f472b6", gr = 1.6, y_ = 3.2, cc = ["#dde6ff", "#f87171", "#fbbf24", "#4ade80", "#38bdf8", "#a78bfa", "#f472b6", "#fb923c"];
function M_(s) {
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
class S_ {
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
    const n = { name: e, color: cc[this.layers.length % cc.length], linetype: "solid", weight: 0.25, visible: true, mat: new gi({ linewidth: gr }), matSel: new gi({ linewidth: gr }) };
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
    const e = this.showWeight ? Math.max(gr, t.weight * y_) : gr, n = M_(t.linetype);
    for (const i of [t.mat, t.matSel]) i.depthTest = false, i.linewidth = e, i.dashed = t.linetype !== "solid", i.dashSize = n.dashSize, i.gapSize = n.gapSize, i.needsUpdate = true;
    t.mat.color.set(t.color), t.matSel.color.set(v_);
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
const eh = 64, E_ = `
  uniform float uSize;
  uniform float uIsPersp;
  uniform mat4  uUcsInv;
  uniform float uSectionEnabled;
  uniform vec3  uBoxMin;
  uniform vec3  uBoxMax;
  uniform float uSliceClip;
  uniform float uSliceMin;
  uniform float uSliceMax;
  uniform float uCurClip;
  uniform vec3  uCurPos;
  uniform float uCurHalf;
  uniform float uDensity;  // 0..1 \u2014 keep points whose key falls below it
  uniform float uMode;     // 0 = RGB, 1 = intensity (grayscale), 2 = height ramp
  uniform float uMinY;
  uniform float uYRangeInv;

  attribute vec3  aColor;
  attribute float aKey;    // stable per-point random in [0,1) \u2014 see Engine

  varying vec3  vColor;
  varying float vKill;

  void main() {
    // Thinning is a KEY test, not a buffer prefix: drawRange now carries the
    // spatial tile range, so decimation has to be order-independent.
    vKill = aKey < uDensity ? 0.0 : 1.0;

    vec4 wp = modelMatrix * vec4(position, 1.0);

    vec3 col = aColor;
    if (uMode > 1.5) {
      float t = clamp((wp.y - uMinY) * uYRangeInv, 0.0, 1.0);
      if (t < 0.5) col = mix(vec3(0.15, 0.35, 0.9), vec3(0.2, 0.85, 0.4), t * 2.0);
      else col = mix(vec3(0.2, 0.85, 0.4), vec3(0.95, 0.35, 0.2), t * 2.0 - 1.0);
    } else if (uMode > 0.5) {
      col = vec3(dot(aColor, vec3(0.299, 0.587, 0.114)));
    }
    vColor = col;


    if ((uSectionEnabled > 0.5 || uSliceClip > 0.5 || uCurClip > 0.5) && vKill < 0.5) {
      vec3 lp = (uUcsInv * wp).xyz;
      if (uSectionEnabled > 0.5 && (any(lessThan(lp, uBoxMin)) || any(greaterThan(lp, uBoxMax)))) vKill = 1.0;
      // Height slice in plan: keep only the slab at the chosen elevation \u2014
      // the ground shows through vegetation and snapping targets it.
      if (uSliceClip > 0.5 && (lp.z < uSliceMin || lp.z > uSliceMax)) vKill = 1.0;
      // Economical 3D view: show the cloud only in a box around the cursor.
      if (uCurClip > 0.5 && (abs(lp.x - uCurPos.x) > uCurHalf || abs(lp.y - uCurPos.y) > uCurHalf)) vKill = 1.0;
    }

    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;

    // Perspective: mild distance attenuation only (0.5\xD7..1.5\xD7), so the
    // per-viewport size slider stays in charge.
    float size = uSize;
    if (uIsPersp > 0.5) size *= clamp(120.0 / max(1.0, -mv.z), 0.5, 1.5);
    gl_PointSize = clamp(size, 0.5, 8.0);

    // Collapse culled points outside clip space: rejected before
    // rasterization, so per-frame clipping is effectively free.
    if (vKill > 0.5) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  }
`, b_ = `
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
function T_() {
  const s = { uSize: { value: 2 }, uIsPersp: { value: 0 }, uUcsInv: { value: new Kt() }, uSectionEnabled: { value: 0 }, uBoxMin: { value: new b(-1e6, -1e6, -1e6) }, uBoxMax: { value: new b(1e6, 1e6, 1e6) }, uSliceClip: { value: 0 }, uSliceMin: { value: -1e6 }, uSliceMax: { value: 1e6 }, uCurClip: { value: 0 }, uCurPos: { value: new b() }, uCurHalf: { value: 20 }, uOpacity: { value: 1 }, uDensity: { value: 1 }, uMode: { value: 0 }, uMinY: { value: 0 }, uYRangeInv: { value: 1 } };
  return { material: new pn({ uniforms: s, vertexShader: E_, fragmentShader: b_, transparent: true }), uniforms: s };
}
function w_(s, t, e, n, i) {
  let r = false;
  for (let o = 0, a = i - 1; o < i; a = o++) {
    const l = n[o], c = n[a];
    l > t != c > t && s < (e[a] - e[o]) * (t - l) / (c - l) + e[o] && (r = !r);
  }
  return r;
}
const A_ = 15;
class C_ {
  constructor() {
    this.world = new b(), this.local = new b(), this.rawLocal = new b(), this.snapLocal = new b(), this.snapped = false, this.clientX = 0, this.clientY = 0, this.valid = false;
  }
}
const R_ = { shiftKey: false, button: 0 }, To = 512;
class jn {
  constructor(t, e) {
    const n = new me();
    this.attr = new oe(new Float32Array(To * 3), 3), n.setAttribute("position", this.attr), n.setDrawRange(0, 0), this.line = new Gc(n, new is({ color: e, transparent: true, opacity: 0.9, depthTest: false })), this.line.frustumCulled = false, this.line.visible = false, this.line.renderOrder = 3, this.line.layers.set(3), t.add(this.line);
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
    for (let r = 0; r < t.length && i < To - 2; r++, i++) this.writeXYZ(i, t[r].x, t[r].y, t[r].z);
    e && i < To - 1 && this.writeXYZ(i++, e.x, e.y, e.z), n && i >= 3 && this.writeXYZ(i++, t[0].x, t[0].y, t[0].z), this.commit(i);
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
class Ae {
  constructor(t, e) {
    this.host = t, this.mgr = e, this.numericSuffix = "\u043C";
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
const _r = new Et(), hc = new b(), Xi = new b(), ys = new b(), Ms = new b(), Mn = new b(), ki = new b(), P_ = new b(), Ye = new b(), wo = new Et(), Ao = new Et(), uc = new Pn(), Co = new Pn(), Ss = [new b(), new b(), new b(), new b()], hn = { r: 0, a0: 0, sweep: 0 };
function L_(s, t, e, n) {
  const i = 2 * (s.x * (t.y - e.y) + t.x * (e.y - s.y) + e.x * (s.y - t.y));
  if (Math.abs(i) < 1e-9) return false;
  const r = s.x * s.x + s.y * s.y, o = t.x * t.x + t.y * t.y, a = e.x * e.x + e.y * e.y;
  return n.set((r * (t.y - e.y) + o * (e.y - s.y) + a * (s.y - t.y)) / i, (r * (e.x - t.x) + o * (s.x - e.x) + a * (t.x - s.x)) / i, 0), true;
}
function dc(s, t, e) {
  if (!L_(s, t, e, Ye)) return false;
  const n = Math.PI * 2;
  hn.r = Math.hypot(s.x - Ye.x, s.y - Ye.y);
  const i = Math.atan2(s.y - Ye.y, s.x - Ye.x), r = Math.atan2(t.y - Ye.y, t.x - Ye.x), a = ((Math.atan2(e.y - Ye.y, e.x - Ye.x) - i) % n + n) % n, l = ((r - i) % n + n) % n;
  return hn.a0 = i, hn.sweep = l <= a ? a : a - n, hn.r > 1e-4;
}
function nh(s, t) {
  const e = new di();
  for (const n of s) {
    const i = n.object3D.clone(true);
    i.traverse((r) => {
      const o = r;
      o.isLine2 ? o.material = Qc : o.isLine ? o.material = p_ : o.isMesh && (o.material = m_);
    }), e.add(i);
  }
  return t.add(e), e;
}
const _Na = class _Na {
  constructor(t) {
    this.host = t, this.pointer = new C_(), this.raycaster = new nd(), this.tools = /* @__PURE__ */ new Map(), this.sBest = 0, this.sFound = false, this.active = null, this.lastCommand = null, this.viewport = null, this.shiftHeld = false, this.numBuffer = "";
    const e = new Ur();
    e.setPositions([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0]), this.markerMat = new gi({ color: 2883486, linewidth: 2.6, depthTest: false, transparent: true }), this.marker = new Jc(e, this.markerMat), this.marker.renderOrder = 4, this.marker.frustumCulled = false, this.marker.visible = false, t.ucs.group.add(this.marker);
    const n = new me();
    n.setAttribute("position", new oe(new Float32Array([-1, 0, 0, 1, 0, 0, 0, -1, 0, 0, 1, 0]), 3)), this.cross = new La(n, new is({ color: 12571376, transparent: true, opacity: 0.95, depthTest: false })), this.cross.renderOrder = 4, this.cross.frustumCulled = false, this.cross.visible = false, this.cross.layers.set(5), t.ucs.group.add(this.cross);
    for (const i of [new D_(t, this), new U_(t, this), new W_(t, this), new ih(t, this), new X_(t, this), new Y_(t, this), new q_(t, this), new $_(t, this), new Q_(t, this), new tx(t, this), new I_(t, this), new N_(t, this), new F_(t, this), new O_(t, this), new B_(t, this), new z_(t, this), new k_(t, this), new H_(t, this), new V_(t, this), new G_(t, this)]) this.tools.set(i.id, i);
  }
  get ray() {
    return this.raycaster.ray;
  }
  get orthoActive() {
    return this.host.orthoOn !== this.shiftHeld;
  }
  activate(t) {
    var _a2;
    const e = this.tools.get(t);
    if (!(!e || e === this.active)) {
      if (_Na.DRAFT_IDS.has(t) && !this.host.canDraft()) {
        this.host.ui.setHint("\u0412 \u041C\u0421\u041A \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u0435 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u2014 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u041F\u0421\u041A \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u0441\u043F\u0440\u0430\u0432\u0430");
        return;
      }
      (_a2 = this.active) == null ? void 0 : _a2.deactivate(), this.clearNumBuffer(), this.active = e, e.activate(), t !== "select" && (this.lastCommand = t), this.host.ui.setActiveTool(t), this.host.ui.setHint(e.hint);
    }
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
      Mn.set(n.x + a, n.y + l, 0), this.synthClick(Mn);
      return;
    }
    const i = parseFloat(t);
    isFinite(i) && (e.onNumeric(i) || (ki.subVectors(this.pointer.local, n), ki.z = 0, ki.lengthSq() < 1e-12 && ki.set(1, 0, 0), ki.normalize(), Mn.copy(n).addScaledVector(ki, i), this.synthClick(Mn)));
  }
  synthClick(t) {
    var _a2;
    const e = this.pointer;
    e.local.copy(t), e.rawLocal.copy(t), e.snapped = false, e.valid = true, this.host.ucs.defined ? this.host.ucs.localToWorld(e.local, e.world) : e.world.copy(e.local), (_a2 = this.active) == null ? void 0 : _a2.onDown(e, R_);
  }
  computePointer(t, e) {
    const n = this.pointer, i = this.host.ucs;
    if (this.viewport = e, n.clientX = t.clientX, n.clientY = t.clientY, this.host.vpm.ndcInto(e, t.clientX, t.clientY, _r), this.raycaster.setFromCamera(_r, e.camera), n.valid = this.raycaster.ray.intersectPlane(i.plane, n.world) !== null, !n.valid) {
      this.marker.visible = false;
      return;
    }
    if (i.defined ? (i.worldToLocal(n.world, n.rawLocal), n.rawLocal.z = 0) : n.rawLocal.copy(n.world), n.local.copy(n.rawLocal), n.snapped = false, this.host.snapOn && i.defined && e.name === "main") {
      const o = A_ * this.host.vpm.worldPerPixel(e);
      let a = 1 / 0;
      if (this.host.snap.query(n.rawLocal.x, n.rawLocal.y, o, n.snapLocal, this.host.snapZMin, this.host.snapZMax)) {
        const c = n.snapLocal.x - n.rawLocal.x, h = n.snapLocal.y - n.rawLocal.y;
        a = c * c + h * h;
      }
      this.snapToEntities(n.rawLocal.x, n.rawLocal.y, o, Mn) && this.sBest < a ? (n.snapped = true, n.snapLocal.set(Mn.x, Mn.y, 0), n.local.set(Mn.x, Mn.y, 0)) : a < 1 / 0 && (n.snapped = true, n.local.set(n.snapLocal.x, n.snapLocal.y, 0));
    }
    const r = this.active ? this.active.getOrthoAnchor() : null;
    r && this.orthoActive && (Math.abs(n.local.x - r.x) >= Math.abs(n.local.y - r.y) ? n.local.y = r.y : n.local.x = r.x), i.defined && i.localToWorld(n.local, n.world), this.marker.visible = n.snapped, n.snapped && this.marker.position.copy(n.snapLocal), this.cross.visible = true, i.defined ? this.cross.position.set(n.local.x, n.local.y, 1e-3) : this.cross.position.set(n.local.x, 0.01, n.local.z), this.numBuffer && this.updateDynBox();
  }
  snapToEntities(t, e, n, i) {
    this.sBest = n * n, this.sFound = false;
    for (const r of this.host.store.entities) {
      if (!r.object3D.visible || !r.nearPoint(t, e, n)) continue;
      const o = r.points;
      if (r instanceof $n) {
        const a = o[0];
        this.testSnap(a.x, a.y, t, e, i), this.testSnap(a.x + r.radius, a.y, t, e, i), this.testSnap(a.x - r.radius, a.y, t, e, i), this.testSnap(a.x, a.y + r.radius, t, e, i), this.testSnap(a.x, a.y - r.radius, t, e, i);
      } else if (r instanceof Dn) {
        const a = o[0];
        this.testSnap(a.x, a.y, t, e, i), this.testSnap(a.x + Math.cos(r.a0) * r.radius, a.y + Math.sin(r.a0) * r.radius, t, e, i);
        const l = r.a0 + r.sweep;
        this.testSnap(a.x + Math.cos(l) * r.radius, a.y + Math.sin(l) * r.radius, t, e, i);
      } else if (r instanceof Be) for (let a = 0; a < o.length; a++) {
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
    const e = t.camera;
    this.host.ucs.group.getWorldQuaternion(uc).invert(), Co.copy(uc).multiply(e.quaternion), this.marker.quaternion.copy(Co), this.cross.quaternion.copy(Co);
    const n = this.host.vpm.worldPerPixel(t), i = t.vExag;
    this.marker.visible && this.marker.scale.set(8 * n, 8 * n / i, 8 * n), this.cross.visible && this.cross.scale.set(9 * n, 9 * n / i, 9 * n);
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
    return this.host.vpm.ndcInto(t, e, n, _r), this.raycaster.setFromCamera(_r, t.camera), this.raycaster.ray.intersectPlane(this.host.ucs.plane, i) ? (this.host.ucs.defined && (this.host.ucs.worldToLocal(i, i), i.z = 0), true) : false;
  }
};
_Na.DRAFT_IDS = /* @__PURE__ */ new Set(["line", "polyline", "rect", "circle", "arc", "ellipse", "text", "point", "refplane", "deviation", "move", "copy", "rotate", "scale", "mirror", "trim", "join"]);
let Na = _Na;
class D_ extends Ae {
  constructor(t, e) {
    super(t, e), this.id = "isolate", this.hint = "\u0428\u0410\u0413 1/3 \xB7 \u0423\u0427\u0410\u0421\u0422\u041E\u041A \u2014 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u043A\u043E\u043D\u0442\u0443\u0440\u043E\u043C \u043D\u0430 \u043F\u043B\u0430\u043D\u0435: \u041B\u041A\u041C \u0432\u0435\u0440\u0448\u0438\u043D\u044B \xB7 Enter/\u041F\u041A\u041C \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \xB7 Esc \u0441\u0431\u0440\u043E\u0441", this.pts = [], this.rb = new jn(t.scene, 16096779);
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
    this.pts.length < eh && this.pts.push(t.world.clone()), this.rb.setPath(this.pts, void 0, true);
  }
  onMove(t) {
    this.pts.length && this.rb.setPath(this.pts, t.world, true);
  }
  onFinish() {
    this.pts.length < 3 || (this.host.applyLasso(this.pts), this.reset(), this.mgr.activate("ucs"));
  }
  onKey(t) {
    return t.key === "Escape" ? (this.reset(), this.host.clearLasso(), true) : false;
  }
}
class U_ extends Ae {
  constructor(t, e) {
    super(t, e), this.id = "ucs", this.hint = "\u0428\u0410\u0413 2/3 \xB7 \u041E\u0421\u042C \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 2 \u0442\u043E\u0447\u043A\u0438 \u0432\u0434\u043E\u043B\u044C \u0442\u0440\u0430\u0441\u0441\u044B (\u043E\u0441\u044C X \u043F\u043E\u0439\u0434\u0451\u0442 \u043F\u043E \u043D\u0438\u043C, \u043F\u043E\u043F\u0435\u0440\u0435\u0447\u043D\u0438\u043A \u0432\u0441\u0442\u0430\u043D\u0435\u0442 \u043A \u043D\u0435\u0439 \u043F\u0435\u0440\u043F\u0435\u043D\u0434\u0438\u043A\u0443\u043B\u044F\u0440\u043D\u043E) \xB7 Esc \u0437\u0430\u043D\u043E\u0432\u043E", this.hasFirst = false, this.p1 = new b(), this.seg = [this.p1], this.rb = new jn(t.scene, 10980346);
  }
  activate() {
    this.host.enterTopView(), this.hasFirst = false;
  }
  deactivate() {
    this.hasFirst = false, this.rb.hide();
  }
  onDown(t) {
    const e = this.host.pickCloudPoint(this.mgr.ray, hc) ? hc : t.world;
    this.hasFirst ? (this.host.defineUcs(this.p1, e), this.hasFirst = false, this.rb.hide(), this.mgr.activate("polyline")) : (this.p1.copy(e), this.hasFirst = true);
  }
  onMove(t) {
    this.hasFirst && this.rb.setPath(this.seg, t.world);
  }
  onKey(t) {
    return t.key === "Escape" ? (this.hasFirst = false, this.rb.hide(), true) : false;
  }
}
class I_ extends Ae {
  constructor(t, e) {
    super(t, e), this.id = "line", this.hint = "\u041E\u0422\u0420\u0415\u0417\u041E\u041A \u2014 \u0434\u0432\u0435 \u0442\u043E\u0447\u043A\u0438; \u0434\u043B\u0438\u043D\u0443 \u043C\u043E\u0436\u043D\u043E \u0432\u0432\u0435\u0441\u0442\u0438 \u0446\u0438\u0444\u0440\u0430\u043C\u0438 (\u043C\u044B\u0448\u044C \u0437\u0430\u0434\u0430\u0451\u0442 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435) \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.hasA = false, this.a = new b(), this.seg = [this.a], this.rb = new jn(t.ucs.group, 9149689);
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
    this.host.snapshot(), this.host.store.add(new Be([this.a, t.local], false)), this.hasA = false, this.rb.hide(), this.mgr.activate("select");
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
class N_ extends Ae {
  constructor(t, e) {
    super(t, e), this.id = "polyline", this.hint = "\u041F\u041E\u041B\u0418\u041B\u0418\u041D\u0418\u042F \u2014 \u041B\u041A\u041C \u0442\u043E\u0447\u043A\u0438 \u043F\u043E \u043F\u043B\u0430\u043D\u0443 (\u0431\u0440\u043E\u0432\u043A\u0430, \u043A\u0440\u043E\u043C\u043A\u0430, \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C) \xB7 Enter/\u041F\u041A\u041C \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \xB7 C \u0437\u0430\u043C\u043A\u043D\u0443\u0442\u044C \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.pts = [], this.rb = new jn(t.ucs.group, 9149689);
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
    e && (this.host.snapshot(), this.host.store.add(new Be(this.pts, t))), this.reset(), e && this.mgr.activate("select");
  }
  onKey(t) {
    return t.key === "c" || t.key === "C" || t.key === "\u0441" || t.key === "\u0421" ? (this.commit(true), true) : t.key === "Escape" ? (this.reset(), true) : false;
  }
  getOrthoAnchor() {
    return this.pts.length ? this.pts[this.pts.length - 1] : null;
  }
}
class F_ extends Ae {
  constructor(t, e) {
    super(t, e), this.id = "rect", this.hint = "\u041F\u0420\u042F\u041C\u041E\u0423\u0413\u041E\u041B\u042C\u041D\u0418\u041A \u2014 \u0434\u0432\u0430 \u043A\u043B\u0438\u043A\u0430 \u043F\u043E \u0434\u0438\u0430\u0433\u043E\u043D\u0430\u043B\u0438; \u0440\u0430\u0437\u043C\u0435\u0440\u044B \u0446\u0438\u0444\u0440\u0430\u043C\u0438: \u0448\u0438\u0440\u0438\u043D\u0430,\u0432\u044B\u0441\u043E\u0442\u0430 \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.hasA = false, this.a = new b(), this.rb = new jn(t.ucs.group, 9149689);
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
    Ss[0].set(this.a.x, this.a.y, 0), Ss[1].set(t.local.x, this.a.y, 0), Ss[2].set(t.local.x, t.local.y, 0), Ss[3].set(this.a.x, t.local.y, 0), this.host.snapshot(), this.host.store.add(new Be(Ss, true)), this.hasA = false, this.rb.hide(), this.mgr.activate("select");
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
class O_ extends Ae {
  constructor(t, e) {
    super(t, e), this.id = "circle", this.hint = "\u041E\u041A\u0420\u0423\u0416\u041D\u041E\u0421\u0422\u042C \u2014 \u043A\u043B\u0438\u043A \u0446\u0435\u043D\u0442\u0440, \u0437\u0430\u0442\u0435\u043C \u0442\u043E\u0447\u043A\u0430 \u0440\u0430\u0434\u0438\u0443\u0441\u0430 (\u0438\u043B\u0438 \u0440\u0430\u0434\u0438\u0443\u0441 \u0446\u0438\u0444\u0440\u0430\u043C\u0438) \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.hasCenter = false, this.center = new b(), this.rb = new jn(t.ucs.group, 9149689);
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
    e && (this.host.snapshot(), this.host.store.add(new $n(this.center, t))), this.hasCenter = false, this.rb.hide(), e && this.mgr.activate("select");
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
class B_ extends Ae {
  constructor(t, e) {
    super(t, e), this.id = "arc", this.hint = "\u0414\u0423\u0413\u0410 \u2014 \u0442\u0440\u0438 \u0442\u043E\u0447\u043A\u0438: \u043D\u0430\u0447\u0430\u043B\u043E, \u0442\u043E\u0447\u043A\u0430 \u043D\u0430 \u0434\u0443\u0433\u0435, \u043A\u043E\u043D\u0435\u0446 \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.stage = 0, this.p1 = new b(), this.p2 = new b(), this.path = [this.p1, this.p2], this.seg1 = [this.p1], this.rb = new jn(t.ucs.group, 9149689);
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
      const e = dc(this.p1, this.p2, t.local);
      e && (this.host.snapshot(), this.host.store.add(new Dn(Ye, hn.r, hn.a0, hn.sweep))), this.reset(), e && this.mgr.activate("select");
    }
  }
  onMove(t) {
    this.stage === 1 ? this.rb.setPath(this.seg1, t.local) : this.stage === 2 && (dc(this.p1, this.p2, t.local) ? this.rb.setArc(Ye.x, Ye.y, hn.r, hn.a0, hn.sweep) : this.rb.setPath(this.path, t.local));
  }
  onKey(t) {
    return t.key === "Escape" ? (this.reset(), true) : false;
  }
  getOrthoAnchor() {
    return this.stage === 1 ? this.p1 : null;
  }
}
class z_ extends Ae {
  constructor(t, e) {
    super(t, e), this.id = "ellipse", this.hint = "\u042D\u041B\u041B\u0418\u041F\u0421 \u2014 \u043A\u043B\u0438\u043A \u0446\u0435\u043D\u0442\u0440, \u0437\u0430\u0442\u0435\u043C \u0443\u0433\u043B\u043E\u0432\u0430\u044F \u0442\u043E\u0447\u043A\u0430; \u043F\u043E\u043B\u0443\u043E\u0441\u0438 \u0446\u0438\u0444\u0440\u0430\u043C\u0438: rx,ry \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.hasCenter = false, this.center = new b(), this.rb = new jn(t.ucs.group, 9149689);
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
    i && (this.host.snapshot(), this.host.store.add(new os(this.center, e, n, 0))), this.hasCenter = false, this.rb.hide(), i && this.mgr.activate("select");
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
class k_ extends Ae {
  constructor() {
    super(...arguments), this.id = "text", this.hint = "\u0422\u0415\u041A\u0421\u0422 \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0442\u043E\u0447\u043A\u0443 \u0432\u0441\u0442\u0430\u0432\u043A\u0438 \u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0434\u043F\u0438\u0441\u044C";
  }
  activate() {
    this.host.enterDraftView();
  }
  onDown(t) {
    const e = window.prompt("\u0422\u0435\u043A\u0441\u0442 \u043D\u0430\u0434\u043F\u0438\u0441\u0438:");
    e && e.trim() && (this.host.snapshot(), this.host.store.add(new as(t.local, e.trim(), 1.2)), this.mgr.activate("select"));
  }
}
class H_ extends Ae {
  constructor() {
    super(...arguments), this.id = "point", this.hint = "\u0422\u041E\u0427\u041A\u0410 \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043C\u0435\u0441\u0442\u043E; \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043B\u043E\u0432\u0438\u0442 \u0442\u043E\u0447\u043A\u0443 \u0441\u043A\u0430\u043D\u0430 \xB7 Esc \u0432\u044B\u0445\u043E\u0434";
  }
  activate() {
    this.host.enterDraftView();
  }
  onDown(t) {
    this.host.snapshot(), this.host.store.add(new vi(t.local));
  }
}
class V_ extends Ae {
  constructor() {
    super(...arguments), this.id = "refplane", this.hint = "\u0413\u041E\u0420\u0418\u0417\u041E\u041D\u0422 \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0442\u043E\u0447\u043A\u0443 \u0437\u0435\u043C\u043B\u0438: \u0435\u0451 \u043E\u0442\u043C\u0435\u0442\u043A\u0430 \u0441\u0442\u0430\u043D\u0435\u0442 \u043D\u0443\u043B\u0451\u043C \u0434\u043B\u044F \u043F\u043E\u0434\u043F\u0438\u0441\u0435\u0439 \u043F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u0438\u0439";
  }
  onDown() {
    this.host.setDeviationRef(this.mgr.ray) && this.mgr.activate("deviation");
  }
}
class G_ extends Ae {
  constructor() {
    super(...arguments), this.id = "deviation", this.hint = "\u041E\u0422\u041C\u0415\u0422\u041A\u0410 \u2014 \u043A\u043B\u0438\u043A\u0430\u0439\u0442\u0435 \u0442\u043E\u0447\u043A\u0438 \u0437\u0435\u043C\u043B\u0438: \u0440\u044F\u0434\u043E\u043C \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u043F\u043E\u0434\u043F\u0438\u0441\u044C + \u0432\u044B\u0448\u0435 / \u2212 \u043D\u0438\u0436\u0435 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430 \xB7 Esc \u0432\u044B\u0445\u043E\u0434";
  }
  activate() {
    this.host.enterDraftView(), this.host.deviationRef === null && (this.host.ui.setHint("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442: \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0413\u041E\u0420\u0418\u0417\u041E\u041D\u0422, \u043A\u043B\u0438\u043A \u043F\u043E \u0437\u0435\u043C\u043B\u0435"), this.mgr.activate("refplane"));
  }
  onDown(t) {
    const e = this.host.deviationRef;
    if (e === null) return;
    if (!t.snapped) {
      this.host.ui.setHint("\u041D\u0435\u0442 \u0442\u043E\u0447\u043A\u0438 \u0441\u043A\u0430\u043D\u0430 \u043F\u043E\u0434 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C \u2014 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0443 (S) \u0438 \u0446\u0435\u043B\u044C\u0441\u044F \u0432 \u043E\u0431\u043B\u0430\u043A\u043E");
      return;
    }
    const n = t.snapLocal.z - e, i = (n >= 0 ? "+" : "\u2212") + Math.abs(n).toFixed(3);
    this.host.snapshot(), this.host.store.add(new vi(t.local, i, n));
  }
}
class W_ extends Ae {
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
    if (!n || !this.mgr.localAtScreen(n, this.downX, this.downY, ys)) return;
    Ms.copy(t.rawLocal);
    const i = t.clientX < this.downX;
    wo.set(Math.min(ys.x, Ms.x), Math.min(ys.y, Ms.y)), Ao.set(Math.max(ys.x, Ms.x), Math.max(ys.y, Ms.y)), !e.shiftKey && !e.ctrlKey && this.host.store.clearSelection();
    for (const r of this.host.store.entities) r.object3D.visible && (i ? r.intersectsRect(wo, Ao) : r.withinRect(wo, Ao)) && this.host.store.select(r, true);
  }
  onKey(t) {
    return t.key === "Delete" || t.key === "Backspace" ? (this.host.store.selection.size && (this.host.snapshot(), this.host.store.deleteSelected()), true) : t.key === "Escape" ? (this.host.store.clearSelection(), true) : false;
  }
}
class Fr extends Ae {
  activate() {
    this.host.enterDraftView();
  }
  ensureSelection(t) {
    if (this.host.store.selection.size) return true;
    const e = this.mgr.viewport ? this.mgr.pickEntity(this.mgr.viewport) : null;
    return e ? this.host.store.select(e, t.shiftKey) : this.host.ui.setHint("\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0432\u044B\u0431\u0440\u0430\u043D\u043E \u2014 \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442, \u0437\u0430\u0442\u0435\u043C \u0431\u0430\u0437\u043E\u0432\u0443\u044E \u0442\u043E\u0447\u043A\u0443"), false;
  }
}
class ih extends Fr {
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
    Xi.subVectors(t.local, this.base), this.host.snapshot();
    for (const e of this.host.store.selection) e.clearPreview(), e.translate(Xi);
    this.picking = false;
  }
  onMove(t) {
    this.picking && (Xi.subVectors(t.local, this.base), this.preview(Xi));
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
class X_ extends ih {
  constructor() {
    super(...arguments), this.id = "copy", this.hint = "\u041A\u041E\u041F\u0418\u042F \u2014 \u0431\u0430\u0437\u043E\u0432\u0430\u044F \u0442\u043E\u0447\u043A\u0430, \u0437\u0430\u0442\u0435\u043C \u043A\u0430\u0436\u0434\u044B\u0439 \u043A\u043B\u0438\u043A \u0441\u0442\u0430\u0432\u0438\u0442 \u043A\u043E\u043F\u0438\u044E \xB7 Esc \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C", this.ghost = null;
  }
  onArmed() {
    this.ghost = nh(this.host.store.selection, this.host.ucs.group);
  }
  place(t) {
    Xi.subVectors(t.local, this.base), this.host.snapshot();
    for (const e of this.host.store.selection) this.host.store.add(e.makeCopy(Xi));
  }
  preview(t) {
    this.ghost && this.ghost.position.set(t.x, t.y, 0);
  }
  cancel() {
    this.ghost && (this.host.ucs.group.remove(this.ghost), this.ghost = null), this.picking = false;
  }
}
class Y_ extends Fr {
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
class q_ extends Fr {
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
class $_ extends Fr {
  constructor() {
    super(...arguments), this.id = "mirror", this.hint = "\u0417\u0415\u0420\u041A\u0410\u041B\u041E \u2014 \u0434\u0432\u0435 \u0442\u043E\u0447\u043A\u0438 \u043E\u0441\u0438 \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u044F; \u0441\u043E\u0437\u0434\u0430\u0451\u0442\u0441\u044F \u0437\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F \xB7 Esc \u043E\u0442\u043C\u0435\u043D\u0430", this.hasP1 = false, this.p1 = new b(), this.ghost = null;
  }
  deactivate() {
    this.cancel();
  }
  onDown(t, e) {
    this.ensureSelection(e) && (this.hasP1 ? this.commit(Math.atan2(t.local.y - this.p1.y, t.local.x - this.p1.x)) : (this.p1.copy(t.local), this.hasP1 = true, this.ghost = nh(this.host.store.selection, this.host.ucs.group)));
  }
  onMove(t) {
    if (!this.hasP1 || !this.ghost) return;
    const e = Math.atan2(t.local.y - this.p1.y, t.local.x - this.p1.x), n = Math.cos(2 * e), i = Math.sin(2 * e);
    this.ghost.rotation.z = 2 * e, this.ghost.scale.set(1, -1, 1), this.ghost.position.set(this.p1.x - (n * this.p1.x + i * this.p1.y), this.p1.y - (i * this.p1.x - n * this.p1.y), 0);
  }
  commit(t) {
    this.host.snapshot();
    for (const e of this.host.store.selection) {
      const n = e.makeCopy(P_);
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
function sh(s, t, e, n) {
  let i = null;
  for (const r of s) {
    if (!(r instanceof Be) || !r.object3D.visible) continue;
    const o = r.points, a = r.closed ? o.length : o.length - 1;
    for (let l = 0; l < a; l++) {
      const c = o[l], h = o[(l + 1) % o.length], u = h.x - c.x, d = h.y - c.y, p = u * u + d * d;
      let g = p > 0 ? ((t - c.x) * u + (e - c.y) * d) / p : 0;
      g = Math.max(0, Math.min(1, g));
      const _ = c.x + u * g - t, m = c.y + d * g - e, f = _ * _ + m * m;
      f <= n * n && (!i || f < i.d2) && (i = { ent: r, u: l + g, d2: f });
    }
  }
  return i;
}
function j_(s, t, e, n, i, r, o, a) {
  const l = e - s, c = n - t, h = o - i, u = a - r, d = l * u - c * h;
  if (Math.abs(d) < 1e-12) return -1;
  const p = ((i - s) * u - (r - t) * h) / d, g = ((i - s) * c - (r - t) * l) / d;
  return p >= 0 && p <= 1 && g >= 0 && g <= 1 ? p : -1;
}
function K_(s, t, e, n, i, r, o, a) {
  const l = e - s, c = n - t, h = s - i, u = t - r, d = l * l + c * c, p = 2 * (h * l + u * c), g = h * h + u * u - o * o, _ = p * p - 4 * d * g;
  if (_ < 0 || d < 1e-12) return;
  const m = Math.sqrt(_), f = (-p - m) / (2 * d), A = (-p + m) / (2 * d);
  f >= 0 && f <= 1 && a.push(f), A >= 0 && A <= 1 && Math.abs(A - f) > 1e-9 && a.push(A);
}
function Z_(s, t, e) {
  const n = s.points[0];
  let i = Math.atan2(e - n.y, t - n.x) - s.a0;
  const r = Math.PI * 2;
  return i = (i % r + r) % r, s.sweep >= 0 ? i <= s.sweep + 1e-6 : i - r >= s.sweep - 1e-6;
}
function J_(s, t) {
  const e = [], n = [], i = s.points, r = s.closed ? i.length : i.length - 1;
  for (let o = 0; o < r; o++) {
    const a = i[o], l = i[(o + 1) % i.length];
    for (const c of t) if (c !== s) {
      if (c instanceof Be) {
        const h = c.points, u = c.closed ? h.length : h.length - 1;
        for (let d = 0; d < u; d++) {
          const p = j_(a.x, a.y, l.x, l.y, h[d].x, h[d].y, h[(d + 1) % h.length].x, h[(d + 1) % h.length].y);
          p >= 0 && e.push(o + p);
        }
      } else if (c instanceof $n || c instanceof Dn) {
        n.length = 0;
        const h = c.points[0];
        K_(a.x, a.y, l.x, l.y, h.x, h.y, c.radius, n);
        for (const u of n) c instanceof Dn && !Z_(c, a.x + (l.x - a.x) * u, a.y + (l.y - a.y) * u) || e.push(o + u);
      }
    }
  }
  return e.sort((o, a) => o - a), e;
}
function Ro(s, t, e) {
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
class Q_ extends Ae {
  constructor() {
    super(...arguments), this.id = "trim", this.hint = "\u041D\u041E\u0416\u041D\u0418\u0426\u042B \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u043B\u0438\u043D\u0438\u0438 \u043C\u0435\u0436\u0434\u0443 \u043F\u0435\u0440\u0435\u0441\u0435\u0447\u0435\u043D\u0438\u044F\u043C\u0438, \u043E\u043D \u0431\u0443\u0434\u0435\u0442 \u0432\u044B\u0440\u0435\u0437\u0430\u043D \xB7 Esc \u0432\u044B\u0445\u043E\u0434";
  }
  activate() {
    this.host.enterDraftView();
  }
  onDown(t) {
    const e = this.mgr.viewport;
    if (!e) return;
    const n = 8 * this.host.vpm.worldPerPixel(e), i = sh(this.host.store.entities, t.rawLocal.x, t.rawLocal.y, n);
    if (!i) return;
    const r = i.ent, o = r.points, a = r.closed ? o.length : o.length - 1, l = J_(r, this.host.store.entities).filter((u) => Math.abs(u - i.u) > 1e-6);
    let c = -1 / 0, h = 1 / 0;
    for (const u of l) u < i.u && u > c && (c = u), u > i.u && u < h && (h = u);
    if (this.host.snapshot(), r.closed) if (!l.length) this.host.store.remove(r);
    else {
      let u = c === -1 / 0 ? l[l.length - 1] : c;
      const d = h === 1 / 0 ? l[0] + a : h;
      u <= d && (u += a);
      const p = Ro(o, d, u), g = r.layer;
      if (this.host.store.remove(r), p.length >= 2) {
        const _ = new Be(p, false);
        _.layer = g, this.host.store.add(_);
      }
    }
    else {
      const u = c === -1 / 0 ? 0 : c, d = h === 1 / 0 ? a : h, p = u > 1e-9 ? Ro(o, 0, u) : null, g = d < a - 1e-9 ? Ro(o, d, a) : null, _ = r.layer;
      this.host.store.remove(r);
      for (const m of [p, g]) if (m && m.length >= 2) {
        const f = new Be(m, false);
        f.layer = _, this.host.store.add(f);
      }
    }
    this.host.ui.setHint("\u0412\u044B\u0440\u0435\u0437\u0430\u043D\u043E \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u0438\u043B\u0438 Esc");
  }
}
class tx extends Ae {
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
    const n = 8 * this.host.vpm.worldPerPixel(e), i = sh(this.host.store.entities, t.rawLocal.x, t.rawLocal.y, n);
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
    const p = new Be(h, u);
    p.layer = d, this.host.store.add(p), this.host.store.select(p, false), this.host.ui.setHint(u ? "\u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u043E \u0432 \u0437\u0430\u043C\u043A\u043D\u0443\u0442\u044B\u0439 \u043A\u043E\u043D\u0442\u0443\u0440" : "\u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u043E");
  }
  onKey(t) {
    return t.key === "Escape" ? (this.first = null, this.host.store.clearSelection(), true) : false;
  }
}
function ex() {
  const s = new me();
  return s.setAttribute("position", new oe(new Float32Array(0), 3)), s.setAttribute("aColor", new oe(new Float32Array(0), 3)), s.setAttribute("aKey", new oe(new Float32Array(0), 1)), { geometry: s, positions: new Float32Array(0), count: 0, center: new b(), radius: 10 };
}
const Pt = (s) => Math.abs(s) < 1e-9 ? "0" : s.toFixed(4), Ar = (s) => s * 180 / Math.PI, nx = [[255, 0, 0, 1], [255, 255, 0, 2], [0, 255, 0, 3], [0, 255, 255, 4], [0, 0, 255, 5], [255, 0, 255, 6], [255, 255, 255, 7], [128, 128, 128, 8], [192, 192, 192, 9]];
function ix(s) {
  const t = parseInt(s.slice(1, 3), 16), e = parseInt(s.slice(3, 5), 16), n = parseInt(s.slice(5, 7), 16);
  let i = 7, r = 1 / 0;
  for (const [o, a, l, c] of nx) {
    const h = (t - o) ** 2 + (e - a) ** 2 + (n - l) ** 2;
    h < r && (r = h, i = c);
  }
  return i;
}
function sx(s) {
  const t = s.points[0], e = Math.cos(s.rot), n = Math.sin(s.rot), i = [];
  for (let r = 0; r < 72; r++) {
    const o = r / 72 * Math.PI * 2, a = s.rx * Math.cos(o), l = s.ry * Math.sin(o);
    i.push({ x: t.x + a * e - l * n, y: t.y + a * n + l * e });
  }
  return i;
}
const xr = { solid: { name: "CONTINUOUS", desc: "Solid line", dashes: [] }, dashed: { name: "DASHED", desc: "__ __ __", dashes: [0.3, -0.15] }, dotted: { name: "DOT", desc: ". . . .", dashes: [0, -0.12] }, dashdot: { name: "DASHDOT", desc: "__ . __ .", dashes: [0.5, -0.15, 0, -0.15] } };
function rx(s, t) {
  const e = [];
  if (t && t.length) {
    e.push("0", "SECTION", "2", "TABLES");
    const i = [.../* @__PURE__ */ new Set(["solid", ...t.map((r) => r.linetype)])];
    e.push("0", "TABLE", "2", "LTYPE", "70", String(i.length));
    for (const r of i) {
      const o = xr[r] ?? xr.solid, a = o.dashes.reduce((l, c) => l + Math.abs(c), 0);
      e.push("0", "LTYPE", "2", o.name, "70", "64", "3", o.desc, "72", "65", "73", String(o.dashes.length), "40", Pt(a));
      for (const l of o.dashes) e.push("49", Pt(l));
    }
    e.push("0", "ENDTAB"), e.push("0", "TABLE", "2", "LAYER", "70", String(t.length));
    for (const r of t) {
      const o = xr[r.linetype] ?? xr.solid;
      e.push("0", "LAYER", "2", r.name, "70", "0", "62", String(ix(r.color)), "6", o.name);
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
    if (i instanceof $n) e.push("0", "CIRCLE", "8", o, "10", Pt(r.x), "20", Pt(r.y), "30", "0", "40", Pt(i.radius));
    else if (i instanceof Dn) {
      const a = i.sweep >= 0 ? i.a0 : i.a0 + i.sweep, l = i.sweep >= 0 ? i.a0 + i.sweep : i.a0;
      e.push("0", "ARC", "8", o, "10", Pt(r.x), "20", Pt(r.y), "30", "0", "40", Pt(i.radius), "50", Pt(Ar(a)), "51", Pt(Ar(l)));
    } else i instanceof os ? n(sx(i), true, o) : i instanceof vi ? (e.push("0", "POINT", "8", o, "10", Pt(r.x), "20", Pt(r.y), "30", "0"), i.label && e.push("0", "TEXT", "8", o, "10", Pt(r.x + 0.65), "20", Pt(r.y + 0.15), "30", "0", "40", "0.9", "1", i.label)) : i instanceof as ? e.push("0", "TEXT", "8", o, "10", Pt(r.x), "20", Pt(r.y), "30", "0", "40", Pt(i.height), "50", Pt(Ar(i.rotation)), "1", i.text) : i instanceof Be && n(i.points, i.closed, o);
  }
  return e.push("0", "ENDSEC", "0", "EOF"), e.join(`\r
`);
}
function ox(s) {
  let t = "";
  for (const e of s) {
    const n = e.points[0];
    if (e instanceof $n) t += `_.CIRCLE
${Pt(n.x)},${Pt(n.y)}
${Pt(e.radius)}
`;
    else if (e instanceof Dn) {
      const i = e.sweep >= 0 ? e.a0 : e.a0 + e.sweep, r = e.sweep >= 0 ? e.a0 + e.sweep : e.a0, o = n.x + Math.cos(i) * e.radius, a = n.y + Math.sin(i) * e.radius, l = n.x + Math.cos(r) * e.radius, c = n.y + Math.sin(r) * e.radius;
      t += `_.ARC
_C
${Pt(n.x)},${Pt(n.y)}
${Pt(o)},${Pt(a)}
${Pt(l)},${Pt(c)}
`;
    } else if (e instanceof os) {
      const i = n.x + e.rx * Math.cos(e.rot), r = n.y + e.rx * Math.sin(e.rot);
      t += `_.ELLIPSE
_C
${Pt(n.x)},${Pt(n.y)}
${Pt(i)},${Pt(r)}
${Pt(e.ry)}
`;
    } else if (e instanceof vi) t += `_.POINT
${Pt(n.x)},${Pt(n.y)}
`, e.label && (t += `_.-TEXT
${Pt(n.x + 0.65)},${Pt(n.y + 0.15)}
0.9
0
${e.label}
`);
    else if (e instanceof as) t += `_.-TEXT
${Pt(n.x)},${Pt(n.y)}
${Pt(e.height)}
${Pt(Ar(e.rotation))}
${e.text}
`;
    else if (e instanceof Be) {
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
function ax(s, t) {
  const e = URL.createObjectURL(new Blob([t], { type: "application/octet-stream" })), n = document.createElement("a");
  n.href = e, n.download = s, n.click(), URL.revokeObjectURL(e);
}
const lx = [{ id: "isolate", tool: "isolate", label: "\u0423\u0447\u0430\u0441\u0442\u043E\u043A", title: "\u0428\u0430\u0433 1: \u043E\u0431\u0432\u0435\u0441\u0442\u0438 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u043B\u0430\u0441\u0441\u043E \u043D\u0430 \u043F\u043B\u0430\u043D\u0435", icon: '<path d="M4.5 13.5 9 6l7.5-1.5 3.5 6.5-3 8-10 1.5z" stroke-dasharray="3 2.4" /><circle cx="4.5" cy="13.5" r="1.3" /><circle cx="9" cy="6" r="1.3" />' }, { id: "ucs", tool: "ucs", label: "\u041E\u0441\u044C", title: "\u0428\u0430\u0433 2: \u043E\u0441\u044C (\u041F\u0421\u041A) \u043F\u043E \u0434\u0432\u0443\u043C \u0442\u043E\u0447\u043A\u0430\u043C \u2014 \u0432\u0434\u043E\u043B\u044C \u0442\u0440\u0430\u0441\u0441\u044B \u0438\u043B\u0438 \u0440\u0430\u0437\u0431\u0438\u0432\u043A\u0438", icon: '<path d="M3 19 21 7" /><path d="M17.4 5.6 21 7l-1.2 3.7" /><path d="M6.2 18.2 7.4 20.6M10.4 15.4l1.2 2.4M14.6 12.6l1.2 2.4" />' }, { id: "line", tool: "line", label: "\u041E\u0442\u0440\u0435\u0437\u043E\u043A", title: "\u041E\u0442\u0440\u0435\u0437\u043E\u043A: \u0434\u0432\u0435 \u0442\u043E\u0447\u043A\u0438 \u0438\u043B\u0438 \u0434\u043B\u0438\u043D\u0430 \u0446\u0438\u0444\u0440\u0430\u043C\u0438", icon: '<path d="M5.5 18.5 18.5 5.5" /><circle cx="5.5" cy="18.5" r="1.6" /><circle cx="18.5" cy="5.5" r="1.6" />' }, { id: "polyline", tool: "polyline", label: "\u041F\u043B\u0438\u043D\u0438\u044F", title: "\u041F\u043E\u043B\u0438\u043B\u0438\u043D\u0438\u044F: \u0431\u0440\u043E\u0432\u043A\u0430, \u043A\u0440\u043E\u043C\u043A\u0430, \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C \u2014 Enter \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C, C \u0437\u0430\u043C\u043A\u043D\u0443\u0442\u044C", icon: '<path d="M3 17.5 8 9l4.5 4.5L16 6.5 21 11" /><circle cx="8" cy="9" r="1.2" /><circle cx="12.5" cy="13.5" r="1.2" /><circle cx="16" cy="6.5" r="1.2" />' }, { id: "rect", tool: "rect", label: "\u041F\u0440\u044F\u043C\u043E\u0443\u0433", title: "\u041F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A \u043F\u043E \u0434\u0432\u0443\u043C \u0443\u0433\u043B\u0430\u043C (\u0438\u043B\u0438 \u0448\u0438\u0440\u0438\u043D\u0430,\u0432\u044B\u0441\u043E\u0442\u0430)", icon: '<rect x="4.5" y="7" width="15" height="10.5" rx="1" />' }, { id: "circle", tool: "circle", label: "\u041A\u0440\u0443\u0433", title: "\u041E\u043A\u0440\u0443\u0436\u043D\u043E\u0441\u0442\u044C: \u0446\u0435\u043D\u0442\u0440 + \u0440\u0430\u0434\u0438\u0443\u0441 (\u0438\u043B\u0438 \u0440\u0430\u0434\u0438\u0443\u0441 \u0446\u0438\u0444\u0440\u0430\u043C\u0438)", icon: '<circle cx="12" cy="12" r="7.8" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />' }, { id: "arc", tool: "arc", label: "\u0414\u0443\u0433\u0430", title: "\u0414\u0443\u0433\u0430 \u043F\u043E \u0442\u0440\u0451\u043C \u0442\u043E\u0447\u043A\u0430\u043C", icon: '<path d="M4 17.5a8 8 0 0 1 16 0" /><circle cx="4" cy="17.5" r="1.3" /><circle cx="20" cy="17.5" r="1.3" />' }, { id: "ellipse", tool: "ellipse", label: "\u042D\u043B\u043B\u0438\u043F\u0441", title: "\u042D\u043B\u043B\u0438\u043F\u0441: \u0446\u0435\u043D\u0442\u0440 + \u0443\u0433\u043B\u043E\u0432\u0430\u044F \u0442\u043E\u0447\u043A\u0430 (\u0438\u043B\u0438 rx,ry)", icon: '<ellipse cx="12" cy="12" rx="8.5" ry="5.5" />' }, { id: "text", tool: "text", label: "\u0422\u0435\u043A\u0441\u0442", title: "\u0422\u0435\u043A\u0441\u0442\u043E\u0432\u0430\u044F \u043D\u0430\u0434\u043F\u0438\u0441\u044C", icon: '<path d="M5.5 6.5h13" /><path d="M12 6.5v12" /><path d="M9 18.5h6" />' }, { id: "point", tool: "point", label: "\u0422\u043E\u0447\u043A\u0430", title: "\u0421\u044A\u0451\u043C\u043E\u0447\u043D\u0430\u044F \u0442\u043E\u0447\u043A\u0430 \u043F\u043E \u043A\u043B\u0438\u043A\u0443 (\u0441 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u043E\u0439 \u043A \u0441\u043A\u0430\u043D\u0443)", icon: '<path d="M12 5.8 18.2 12 12 18.2 5.8 12z" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />' }, { id: "refplane", tool: "refplane", label: "\u0413\u043E\u0440\u0438\u0437\u043E\u043D\u0442", title: "\u041D\u0443\u043B\u0435\u0432\u043E\u0439 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442 \u0434\u043B\u044F \u043E\u0442\u043C\u0435\u0442\u043E\u043A: \u043A\u043B\u0438\u043A \u043F\u043E \u0442\u043E\u0447\u043A\u0435 \u0437\u0435\u043C\u043B\u0438", icon: '<path d="M2.5 15.5h19" stroke-dasharray="3 2.2" /><path d="M12 15.5 8.6 9.8h6.8z" fill="currentColor" stroke="none" /><path d="M12 15.5v4" /><path d="M4.5 19.5h4M15.5 19.5h4" opacity=".55" />' }, { id: "deviation", tool: "deviation", label: "\u041E\u0442\u043C\u0435\u0442\u043A\u0430", title: "\u041E\u0442\u043C\u0435\u0442\u043A\u0430 \u0442\u043E\u0447\u043A\u0438: \u043F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u0438\u0435 \u043D\u0430\u0434 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u043E\u043C, + \u0432\u044B\u0448\u0435 / \u2212 \u043D\u0438\u0436\u0435", icon: '<path d="M2.5 18.5h19" stroke-dasharray="3 2.2" /><path d="M7 18.5V6.5" /><path d="M4.4 9.1 7 6.5l2.6 2.6" /><path d="M12.5 9.5h8M12.5 13h5.5" />' }, { id: "select", tool: "select", label: "\u0412\u044B\u0431\u043E\u0440", title: "\u0412\u044B\u0431\u043E\u0440: \u043A\u043B\u0438\u043A \u043F\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u0443, Ctrl \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C, \u0440\u0430\u043C\u043A\u0430", icon: '<path d="M7 3.6 18.5 14.2l-5.6.4 2.9 5.4-2.4 1.2-2.8-5.5L7 19.4z" />' }, { id: "move", tool: "move", label: "\u041F\u0435\u0440\u0435\u043D\u043E\u0441", title: "\u041F\u0435\u0440\u0435\u043D\u043E\u0441: \u0431\u0430\u0437\u043E\u0432\u0430\u044F \u2192 \u0446\u0435\u043B\u0435\u0432\u0430\u044F (\u0438\u043B\u0438 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0446\u0438\u0444\u0440\u0430\u043C\u0438)", icon: '<path d="M12 3v18M3 12h18" /><path d="M9.6 5.4 12 3l2.4 2.4M9.6 18.6 12 21l2.4-2.4M5.4 9.6 3 12l2.4 2.4M18.6 9.6 21 12l-2.4 2.4" />' }, { id: "copy", tool: "copy", label: "\u041A\u043E\u043F\u0438\u044F", title: "\u041C\u0443\u043B\u044C\u0442\u0438\u043A\u043E\u043F\u0438\u044F \u0434\u043E Esc", icon: '<rect x="8.5" y="8.5" width="11" height="11" rx="1.5" /><path d="M15.5 5H5a.5.5 0 0 0-.5.5V16" />' }, { id: "rotate", tool: "rotate", label: "\u041F\u043E\u0432\u043E\u0440\u043E\u0442", title: "\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0432\u043E\u043A\u0440\u0443\u0433 \u0431\u0430\u0437\u043E\u0432\u043E\u0439 \u0442\u043E\u0447\u043A\u0438 (\u0443\u0433\u043E\u043B \u0446\u0438\u0444\u0440\u0430\u043C\u0438 \u0432 \xB0)", icon: '<path d="M19.5 12a7.5 7.5 0 1 1-7.5-7.5" /><path d="M9 2.2 12 4.5 9 6.8" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />' }, { id: "scale", tool: "scale", label: "\u041C\u0430\u0441\u0448\u0442\u0430\u0431", title: "\u041C\u0430\u0441\u0448\u0442\u0430\u0431 \u043E\u0442 \u0431\u0430\u0437\u043E\u0432\u043E\u0439 \u0442\u043E\u0447\u043A\u0438 (\u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442 \u0446\u0438\u0444\u0440\u0430\u043C\u0438)", icon: '<rect x="3.5" y="13" width="7.5" height="7.5" rx="1" /><path d="M11 13 20.5 3.5M14.5 3.5h6v6" />' }, { id: "mirror", tool: "mirror", label: "\u0417\u0435\u0440\u043A\u0430\u043B\u043E", title: "\u0417\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u043E\u0441\u0438 \u0438\u0437 \u0434\u0432\u0443\u0445 \u0442\u043E\u0447\u0435\u043A", icon: '<path d="M12 2.8v18.4" stroke-dasharray="3 2.4" /><path d="M8.6 7.5 4 15.5h4.6zM15.4 7.5 20 15.5h-4.6z" />' }, { id: "trim", tool: "trim", label: "\u041D\u043E\u0436\u043D\u0438\u0446\u044B", title: "\u041D\u043E\u0436\u043D\u0438\u0446\u044B: \u0432\u044B\u0440\u0435\u0437\u0430\u0442\u044C \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u0434\u043E \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0445 \u043F\u0435\u0440\u0435\u0441\u0435\u0447\u0435\u043D\u0438\u0439", icon: '<circle cx="6" cy="6.5" r="2.4" /><circle cx="6" cy="17.5" r="2.4" /><path d="M8.1 7.9 20.5 18M8.1 16.1 20.5 6" />' }, { id: "join", tool: "join", label: "\u0421\u043E\u0435\u0434\u0438\u043D", title: "\u0421\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C \u0434\u0432\u0435 \u043B\u0438\u043D\u0438\u0438 \u0441 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0449\u0438\u043C\u0438 \u043A\u043E\u043D\u0446\u0430\u043C\u0438", icon: '<path d="M9 12h6" /><path d="M3.5 12a4 4 0 0 1 4-4h2M3.5 12a4 4 0 0 0 4 4h2M20.5 12a4 4 0 0 0-4-4h-2M20.5 12a4 4 0 0 1-4 4h-2" />' }, { id: "erase", action: "erase", domId: "btn-erase", label: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0435 (Del)", icon: '<path d="M4.5 7h15M10 7V4.8h4V7M6.8 7l1 12.2h8.4L17.2 7" /><path d="M10.3 10.5v5.5M13.7 10.5v5.5" opacity=".6" />' }, { id: "layers", action: "layers", domId: "btn-layers", label: "\u0421\u043B\u043E\u0438", title: "\u0421\u043B\u043E\u0438: \u0446\u0432\u0435\u0442\u0430, \u0442\u0438\u043F\u044B \u043B\u0438\u043D\u0438\u0439, \u0442\u043E\u043B\u0449\u0438\u043D\u044B", icon: '<path d="m12 3.2 8.5 4.3-8.5 4.3-8.5-4.3z" /><path d="m3.5 12 8.5 4.3 8.5-4.3" /><path d="m3.5 16.3 8.5 4.3 8.5-4.3" />' }, { id: "help", action: "help", domId: "btn-help", label: "\u0421\u043F\u0440\u0430\u0432\u043A\u0430", title: "\u0420\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F (F1)", icon: '<circle cx="12" cy="12" r="9" /><path d="M9.3 9.2a2.8 2.8 0 1 1 3.2 3.3v1.6" /><circle cx="12.4" cy="17.2" r="1.05" fill="currentColor" stroke="none" />' }, { id: "undo", action: "undo", domId: "btn-undo", label: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C", title: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C (Ctrl+Z)", icon: '<path d="M4.5 9.5h10a4.8 4.8 0 0 1 0 9.6h-3.5" /><path d="M8 5.8 4.3 9.5 8 13.2" />' }, { id: "redo", action: "redo", domId: "btn-redo", label: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C", title: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C (Ctrl+Y)", icon: '<path d="M19.5 9.5h-10a4.8 4.8 0 0 0 0 9.6H13" /><path d="M16 5.8l3.7 3.7L16 13.2" />' }, { id: "import", action: "import", domId: "btn-import", label: "\u0418\u043C\u043F\u043E\u0440\u0442", title: "\u0418\u043C\u043F\u043E\u0440\u0442 \u043E\u0431\u043B\u0430\u043A\u0430: LAS, LAZ, E57 \u0438\u043B\u0438 ASCII (x y z [r g b])", icon: '<path d="M12 3.5v9.5" /><path d="M8.4 9.6 12 13.2l3.6-3.6" /><path d="M4 15.5v4h16v-4" /><circle cx="7" cy="6" r=".9" fill="currentColor" stroke="none" /><circle cx="17" cy="7.5" r=".9" fill="currentColor" stroke="none" />' }, { id: "dxf", action: "dxf", domId: "btn-dxf", label: "DXF", title: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0447\u0435\u0440\u0442\u0435\u0436\u0430 \u0432 DXF (\u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0435 \u0438\u043B\u0438 \u0432\u0441\u0451)", icon: '<path d="M6.5 3h7l4.5 4.5V21h-11.5z" /><path d="M13.5 3v4.5H18" /><path d="M8.8 12.5h1.6a2 2 0 0 1 0 4H8.8zM14 12.5v4M14 12.5h2.6M14 14.5h2" />' }, { id: "tocad", action: "tocad", domId: "btn-tocad", label: "ToCad", title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432 AutoCAD (\u0438\u043B\u0438 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u043A\u0440\u0438\u043F\u0442)", icon: '<path d="M3 12h10.5" /><path d="M10 8.5 13.5 12 10 15.5" /><path d="M16 4.5h4.5v15H16" />' }], rh = new Map(lx.map((s) => [s.id, s])), oh = [{ title: "\u041F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0430", buttons: ["isolate", "ucs"] }, { title: "\u0427\u0435\u0440\u0447\u0435\u043D\u0438\u0435", buttons: ["line", "polyline", "rect", "circle", "arc", "ellipse", "text", "point"] }, { title: "\u041E\u0442\u043C\u0435\u0442\u043A\u0438", buttons: ["refplane", "deviation"] }, { title: "\u041F\u0440\u0430\u0432\u043A\u0430", buttons: ["select", "move", "copy", "rotate", "scale", "mirror", "trim", "join", "erase"] }, { title: "\u041E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435", buttons: ["layers", "undo", "redo", "help"] }, { title: "\u041E\u0431\u043C\u0435\u043D", buttons: ["import", "dxf", "tocad"] }], Fa = "topocad.ribbon";
function ah() {
  return oh.map((s) => ({ title: s.title, buttons: [...s.buttons] }));
}
function cx() {
  let s = null;
  try {
    const e = localStorage.getItem(Fa);
    if (e) {
      const n = JSON.parse(e);
      Array.isArray(n) && n.length && (s = n.filter((i) => i && typeof i.title == "string" && Array.isArray(i.buttons)).map((i) => ({ title: i.title, buttons: i.buttons.filter((r) => rh.has(r)) })));
    }
  } catch {
  }
  if (!s || !s.length) return ah();
  const t = new Set(s.flatMap((e) => e.buttons));
  for (const e of oh) for (const n of e.buttons) {
    if (t.has(n)) continue;
    (s.find((r) => r.title === e.title) ?? s[s.length - 1]).buttons.push(n), t.add(n);
  }
  return s;
}
function hx(s) {
  try {
    localStorage.setItem(Fa, JSON.stringify(s));
  } catch {
  }
}
function ux() {
  try {
    localStorage.removeItem(Fa);
  } catch {
  }
  return ah();
}
const dx = `# TOPO\xB7CAD \u2014 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F\r
\r
\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0434\u043B\u044F \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u044F \u0442\u043E\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u0438 \u043F\u0440\u044F\u043C\u043E \u043F\u043E \u043E\u0431\u043B\u0430\u043A\u0443 \u0442\u043E\u0447\u0435\u043A. \u0412\u044B \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0435\r
\u0441\u043A\u0430\u043D \u043C\u0435\u0441\u0442\u043D\u043E\u0441\u0442\u0438, \u0432\u044B\u0434\u0435\u043B\u044F\u0435\u0442\u0435 \u043D\u0443\u0436\u043D\u044B\u0439 \u0443\u0447\u0430\u0441\u0442\u043E\u043A, \u0437\u0430\u0434\u0430\u0451\u0442\u0435 \u043E\u0441\u044C (\u0432\u0434\u043E\u043B\u044C \u0442\u0440\u0430\u0441\u0441\u044B,\r
\u0434\u043E\u0440\u043E\u0433\u0438, \u043B\u0438\u043D\u0438\u0438 \u0440\u0430\u0437\u0431\u0438\u0432\u043A\u0438) \u2014 \u0438 \u0447\u0435\u0440\u0442\u0438\u0442\u0435 \u043F\u043B\u0430\u043D \u043F\u0440\u0438\u0432\u044B\u0447\u043D\u044B\u043C\u0438 \u043A\u043E\u043C\u0430\u043D\u0434\u0430\u043C\u0438,\r
\u043F\u0440\u0438\u0432\u044F\u0437\u044B\u0432\u0430\u044F\u0441\u044C \u043A \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u043C \u0442\u043E\u0447\u043A\u0430\u043C \u0441\u043A\u0430\u043D\u0430. \u0420\u044F\u0434\u043E\u043C \u0432\u0441\u0451 \u0432\u0440\u0435\u043C\u044F \u0436\u0438\u0432\u0443\u0442 \u0434\u0432\u0430 \u0440\u0435\u0437\u0430:\r
**\u043F\u043E\u043F\u0435\u0440\u0435\u0447\u043D\u0438\u043A** \u0438 **\u043F\u0440\u043E\u0434\u043E\u043B\u044C\u043D\u0438\u043A**. \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0443\u0445\u043E\u0434\u0438\u0442 \u0432 AutoCAD \u0447\u0435\u0440\u0435\u0437 DXF\r
\u0438\u043B\u0438 \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u0441\u043A\u0440\u0438\u043F\u0442\u043E\u043C.\r
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
- **\u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0434\u0435\u043C\u043E-\u0440\u0435\u043B\u044C\u0435\u0444** \u2014 \u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u0441 \u0434\u043E\u0440\u043E\u0433\u043E\u0439 \u0432 \u043D\u0430\u0441\u044B\u043F\u0438 \u0438\r
  \u0432\u044B\u0435\u043C\u043A\u0435, \u0447\u0442\u043E\u0431\u044B \u043E\u0441\u0432\u043E\u0438\u0442\u044C\u0441\u044F \u0431\u0435\u0437 \u0441\u0432\u043E\u0435\u0433\u043E \u0444\u0430\u0439\u043B\u0430.\r
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
| **\u041F\u043B\u0430\u043D** | \u0441\u043B\u0435\u0432\u0430 | \u0412\u0438\u0434 \u0441\u0432\u0435\u0440\u0445\u0443: \u0434\u043E \u0437\u0430\u0434\u0430\u043D\u0438\u044F \u043E\u0441\u0438 \u2014 \u0432\u0435\u0441\u044C \u0441\u043A\u0430\u043D, \u0434\u0430\u043B\u044C\u0448\u0435 \u2014 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u0432 \u043E\u0441\u044F\u0445 \u0442\u0440\u0430\u0441\u0441\u044B. \u0417\u0434\u0435\u0441\u044C \u0447\u0435\u0440\u0442\u044F\u0442 |\r
| **\u0420\u0435\u0437** | \u0441\u043F\u0440\u0430\u0432\u0430 \u0441\u0432\u0435\u0440\u0445\u0443 | \u0412\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0437 \u0432 \u0442\u043E\u0447\u043A\u0435 \u043A\u0443\u0440\u0441\u043E\u0440\u0430: **\u043F\u043E\u043F\u0435\u0440\u0435\u0447\u043D\u0438\u043A** \u0438\u043B\u0438 **\u043F\u0440\u043E\u0434\u043E\u043B\u044C\u043D\u0438\u043A** \u2014 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F \u043A\u043D\u043E\u043F\u043A\u043E\u0439 \u0432 \u043F\u043E\u043B\u043E\u0441\u043A\u0435 \u043E\u043A\u043D\u0430 |\r
| **3D \xB7 \u041E\u0431\u0437\u043E\u0440** | \u0441\u043F\u0440\u0430\u0432\u0430 \u0441\u043D\u0438\u0437\u0443 | \u041E\u0431\u044A\u0451\u043C\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0438\u043D\u0430 \u0432\u043E\u043A\u0440\u0443\u0433 \u043A\u0443\u0440\u0441\u043E\u0440\u0430: \u043A\u0443\u0434\u0430 \u043B\u0435\u0433\u043B\u0430 \u0442\u043E\u0447\u043A\u0430 \u043D\u0430 \u0441\u0430\u043C\u043E\u043C \u0434\u0435\u043B\u0435 |\r
\r
\u0427\u0435\u0440\u0442\u0438\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0432 \u043F\u043B\u0430\u043D\u0435 (\u0438 \u0432 3D-\u043E\u043A\u043D\u0435, \u043A\u043E\u0433\u0434\u0430 \u043A\u043E\u043C\u0430\u043D\u0434\u0430 \u0443\u0436\u0435 \u043D\u0430\u0447\u0430\u0442\u0430), \u0430 \u0440\u0435\u0437\r
\u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0442\u043E \u0436\u0435 \u0441\u0430\u043C\u043E\u0435 \u043C\u0435\u0441\u0442\u043E \u0441\u0431\u043E\u043A\u0443 \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0432 \u0442\u043E\u043C \u0436\u0435 \u043A\u0430\u0434\u0440\u0435.\r
\r
**\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F** \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u0430 \u0432\u043E \u0432\u0441\u0435\u0445 \u043E\u043A\u043D\u0430\u0445:\r
\r
- **\u043A\u043E\u043B\u0435\u0441\u043E \u043C\u044B\u0448\u0438** \u2014 \u0437\u0443\u043C \u043A \u043F\u043E\u0437\u0438\u0446\u0438\u0438 \u043A\u0443\u0440\u0441\u043E\u0440\u0430;\r
- **\u0441\u0440\u0435\u0434\u043D\u044F\u044F \u043A\u043D\u043E\u043F\u043A\u0430 \u043C\u044B\u0448\u0438** \u2014 \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430;\r
- \u0432 3D-\u043E\u043A\u043D\u0435 **\u0441\u0440\u0435\u0434\u043D\u044F\u044F \u043A\u043D\u043E\u043F\u043A\u0430** \u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0432\u0438\u0434 (\u0430 \u043A\u043E\u0433\u0434\u0430 \u0430\u043A\u0442\u0438\u0432\u0435\u043D \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\r
  \xAB\u0412\u044B\u0431\u043E\u0440\xBB \u2014 \u0432\u0440\u0430\u0449\u0430\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0438 \u043B\u0435\u0432\u043E\u0439).\r
\r
### \u0421\u043B\u0435\u0436\u0435\u043D\u0438\u0435 \u0438 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F\r
\r
\u0420\u0435\u0437 \u0438 3D-\u043E\u043A\u043D\u043E \u0441\u0430\u043C\u0438 \u0435\u0434\u0443\u0442 \u0437\u0430 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C, \u043F\u043E\u043A\u0430 \u0432\u044B \u0447\u0435\u0440\u0442\u0438\u0442\u0435 \u0432 \u043F\u043B\u0430\u043D\u0435. \u041A\u0430\u043A \u0442\u043E\u043B\u044C\u043A\u043E\r
\u0432\u044B **\u0431\u0435\u0440\u0451\u0442\u0435 \u043E\u043A\u043D\u043E \u0432 \u0440\u0443\u043A\u0438** \u2014 \u043A\u043B\u0438\u043A, \u043A\u043E\u043B\u0435\u0441\u043E, \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430 \u0438\u043B\u0438 \u043A\u043B\u0430\u0432\u0438\u0448\u0430 **2** /\r
**3** \u2014 \u044D\u0442\u043E \u043E\u043A\u043D\u043E **\u0444\u0438\u043A\u0441\u0438\u0440\u0443\u0435\u0442\u0441\u044F**: \u0438 \u043A\u0430\u043C\u0435\u0440\u0430, \u0438 \u0441\u0430\u043C \u0441\u0440\u0435\u0437 \u0437\u0430\u043C\u0438\u0440\u0430\u044E\u0442 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435,\r
\u0438 \u043C\u044B\u0448\u044C \u0432 \u043F\u043B\u0430\u043D\u0435 \u0438\u0445 \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u0434\u0451\u0440\u0433\u0430\u0435\u0442. \u0412 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0435 \u043E\u043A\u043D\u0430 \u043F\u043E\u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043C\u0435\u0442\u043A\u0430\r
**\u0424\u0418\u041A\u0421**.\r
\r
\u041A\u043B\u0430\u0432\u0438\u0448\u0430 **1** (\u0430\u043A\u0442\u0438\u0432\u0435\u043D \u043F\u043B\u0430\u043D) \u0441\u043D\u0438\u043C\u0430\u0435\u0442 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044E \u0441 \u043E\u0431\u043E\u0438\u0445 \u043E\u043A\u043E\u043D, \u0438 \u043E\u043D\u0438 \u0441\u043D\u043E\u0432\u0430\r
\u0438\u0434\u0443\u0442 \u0437\u0430 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C.\r
\r
---\r
\r
## 3. \u0420\u0430\u0431\u043E\u0447\u0438\u0439 \u043F\u0440\u043E\u0446\u0435\u0441\u0441: \u0442\u0440\u0438 \u0448\u0430\u0433\u0430\r
\r
\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0432\u0435\u0434\u0451\u0442 \u0432\u0430\u0441 \u043F\u043E \u0448\u0430\u0433\u0430\u043C \u2014 \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430 \u0432\u043D\u0438\u0437\u0443 \u044D\u043A\u0440\u0430\u043D\u0430 \u0432\u0441\u0435\u0433\u0434\u0430 \u0433\u043E\u0432\u043E\u0440\u0438\u0442,\r
\u0447\u0442\u043E \u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441.\r
\r
### \u0428\u0430\u0433 1. \u0412\u044B\u0434\u0435\u043B\u0438\u0442\u044C \u0443\u0447\u0430\u0441\u0442\u043E\u043A\r
\r
\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 **\u0423\u0427\u0410\u0421\u0422\u041E\u041A**. \u041D\u0430 \u043F\u043B\u0430\u043D\u0435 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0443\u0436\u043D\u0443\u044E \u043F\u043E\u043B\u043E\u0441\u0443 \u043A\u043E\u043D\u0442\u0443\u0440\u043E\u043C:\r
\u043A\u043B\u0438\u043A\u0430\u0439\u0442\u0435 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u043B\u0435\u0432\u043E\u0439 \u043A\u043D\u043E\u043F\u043A\u043E\u0439, \u0437\u0430\u0442\u0435\u043C **Enter** \u0438\u043B\u0438 **\u043F\u0440\u0430\u0432\u0430\u044F \u043A\u043D\u043E\u043F\u043A\u0430** \u2014\r
\u043A\u043E\u043D\u0442\u0443\u0440 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u0441\u044F, \u0438 \u0432 \u0440\u0430\u0431\u043E\u0442\u0435 \u043E\u0441\u0442\u0430\u043D\u0443\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E\u0447\u043A\u0438 \u044D\u0442\u043E\u0433\u043E \u0443\u0447\u0430\u0441\u0442\u043A\u0430.\r
**Esc** \u2014 \u0441\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0438 \u043D\u0430\u0447\u0430\u0442\u044C \u043A\u043E\u043D\u0442\u0443\u0440 \u0437\u0430\u043D\u043E\u0432\u043E.\r
\r
### \u0428\u0430\u0433 2. \u0417\u0430\u0434\u0430\u0442\u044C \u043E\u0441\u044C\r
\r
\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 **\u041E\u0421\u042C** \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F \u0441\u0430\u043C. \u041A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 **\u0434\u0432\u0435 \u0442\u043E\u0447\u043A\u0438 \u0432\u0434\u043E\u043B\u044C \u0442\u0440\u0430\u0441\u0441\u044B** \u2014\r
\u043F\u043E \u043D\u0438\u043C \u043F\u043E\u0439\u0434\u0451\u0442 \u043E\u0441\u044C X (\u0441\u0442\u0430\u043D\u0446\u0438\u044F, \xAB\u043F\u0438\u043A\u0435\u0442\u0430\u0436\xBB), \u043F\u043E\u043F\u0435\u0440\u0451\u043A \u043D\u0435\u0451 \u0432\u0441\u0442\u0430\u043D\u0435\u0442 \u043E\u0441\u044C Y\r
(\u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0432\u043B\u0435\u0432\u043E \u043E\u0442 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0445\u043E\u0434\u0430), \u0432\u0432\u0435\u0440\u0445 \u2014 \u043E\u0442\u043C\u0435\u0442\u043A\u0430 H.\r
\r
\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0440\u0430\u0437\u0432\u0435\u0440\u043D\u0451\u0442 \u043F\u043B\u0430\u043D \u043F\u043E \u044D\u0442\u043E\u0439 \u043E\u0441\u0438, \u0430 \u043E\u0431\u0430 \u0440\u0435\u0437\u0430 \u0432\u0441\u0442\u0430\u043D\u0443\u0442 \u043F\u043E \u043D\u0435\u0439 \u0436\u0435:\r
\u043F\u043E\u043F\u0435\u0440\u0435\u0447\u043D\u0438\u043A \u2014 \u043F\u0435\u0440\u043F\u0435\u043D\u0434\u0438\u043A\u0443\u043B\u044F\u0440\u043D\u043E \u043E\u0441\u0438, \u043F\u0440\u043E\u0434\u043E\u043B\u044C\u043D\u0438\u043A \u2014 \u0432\u0434\u043E\u043B\u044C. \u041D\u043E\u043B\u044C \u043E\u0442\u043C\u0435\u0442\u043E\u043A\r
\u0431\u0435\u0440\u0451\u0442\u0441\u044F \u043E\u0442 \u043D\u0443\u043B\u044F \u043E\u0431\u043B\u0430\u043A\u0430 (\u0441\u0430\u043C\u043E\u0439 \u043D\u0438\u0437\u043A\u043E\u0439 \u0442\u043E\u0447\u043A\u0438 \u0441\u043A\u0430\u043D\u0430).\r
\r
\u041A\u0430\u0436\u0434\u0430\u044F \u0442\u0440\u0430\u0441\u0441\u0430 \u2014 \u0441\u0432\u043E\u044F \u043E\u0441\u044C. \u0412\u0441\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0435 \u043E\u0441\u0438 \u043B\u0435\u0436\u0430\u0442 \u0432 \u0432\u044B\u043F\u0430\u0434\u0430\u044E\u0449\u0435\u043C \u0441\u043F\u0438\u0441\u043A\u0435 \u0432\r
\u043F\u0440\u0430\u0432\u043E\u043C \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0443\u0433\u043B\u0443; **\u041C\u0421\u041A** \u0432 \u044D\u0442\u043E\u043C \u0441\u043F\u0438\u0441\u043A\u0435 \u2014 \u043E\u0431\u0449\u0438\u0439 \u043E\u0431\u0437\u043E\u0440 \u0432\u0441\u0435\u0433\u043E \u043E\u0431\u043B\u0430\u043A\u0430\r
(\u0432 \u043D\u0451\u043C \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u0435 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E, \u044D\u0442\u043E \u0440\u0435\u0436\u0438\u043C \u043E\u0441\u043C\u043E\u0442\u0440\u0430). \u041A\u043D\u043E\u043F\u043A\u0430 **\u270E** \u0440\u044F\u0434\u043E\u043C\r
\u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u044B\u0432\u0430\u0435\u0442 \u0442\u0435\u043A\u0443\u0449\u0443\u044E \u043E\u0441\u044C.\r
\r
### \u0428\u0430\u0433 3. \u0427\u0435\u0440\u0442\u0438\u0442\u044C\r
\r
\u0414\u0430\u043B\u044C\u0448\u0435 \u2014 \u043E\u0431\u044B\u0447\u043D\u043E\u0435 \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u0435 \u043F\u043E \u043F\u043B\u0430\u043D\u0443 \u0441 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u043E\u0439 \u043A \u0442\u043E\u0447\u043A\u0430\u043C \u0441\u043A\u0430\u043D\u0430: \u0431\u0440\u043E\u0432\u043A\u0438,\r
\u043A\u0440\u043E\u043C\u043A\u0438, \u0443\u0440\u0435\u0437\u044B, \u0433\u0440\u0430\u043D\u0438\u0446\u044B \u0443\u0433\u043E\u0434\u0438\u0439, \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u0438.\r
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
| **\u0422\u043E\u0447\u043A\u0430** | \u041E\u0434\u0438\u043D\u043E\u0447\u043D\u0430\u044F \u0442\u043E\u0447\u043A\u0430 \u0441 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u043E\u0439 \u043A \u0441\u043A\u0430\u043D\u0443 |\r
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
## 5. \u041E\u0442\u043C\u0435\u0442\u043A\u0438\r
\r
\u0414\u0432\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u044B \u0432 \u043F\u0430\u043D\u0435\u043B\u0438 **\u041E\u0422\u041C\u0415\u0422\u041A\u0418**:\r
\r
- **\u0413\u041E\u0420\u0418\u0417\u041E\u041D\u0422** \u2014 \u043A\u043B\u0438\u043A \u043F\u043E \u0442\u043E\u0447\u043A\u0435 \u0437\u0435\u043C\u043B\u0438 \u0434\u0435\u043B\u0430\u0435\u0442 \u0435\u0451 \u043E\u0442\u043C\u0435\u0442\u043A\u0443 \u043D\u0443\u043B\u0451\u043C \u043E\u0442\u0441\u0447\u0451\u0442\u0430.\r
  \u041F\u043E\u043A\u0430 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442 \u043D\u0435 \u0437\u0430\u0434\u0430\u043D, \u043D\u043E\u043B\u044C \u2014 \u044D\u0442\u043E \u043D\u043E\u043B\u044C \u043E\u0431\u043B\u0430\u043A\u0430.\r
- **\u041E\u0422\u041C\u0415\u0422\u041A\u0410** \u2014 \u043A\u0430\u0436\u0434\u044B\u0439 \u043A\u043B\u0438\u043A \u0441\u0442\u0430\u0432\u0438\u0442 \u0442\u043E\u0447\u043A\u0443 \u0441 \u043F\u043E\u0434\u043F\u0438\u0441\u044C\u044E \u043F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u0438\u044F \u043D\u0430\u0434\r
  \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u043E\u043C: **+** \u0432\u044B\u0448\u0435, **\u2212** \u043D\u0438\u0436\u0435. \u041F\u043E\u0434\u043F\u0438\u0441\u044C \u0431\u0435\u0440\u0451\u0442\u0441\u044F \u043E\u0442 **\u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0439\r
  \u0442\u043E\u0447\u043A\u0438 \u0441\u043A\u0430\u043D\u0430** \u043F\u043E\u0434 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 (**S**) \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C\r
  \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u2014 \u0431\u0435\u0437 \u0437\u0430\u0445\u0432\u0430\u0442\u0430 \u043F\u043E\u0434\u043F\u0438\u0441\u044B\u0432\u0430\u0442\u044C \u043D\u0435\u0447\u0435\u0433\u043E.\r
\r
\u0412\u043D\u0438\u0437\u0443 \u0441\u043B\u0435\u0432\u0430 \u043E\u0442 \u043F\u043B\u0430\u043D\u0430 \u0432\u0441\u0435\u0433\u0434\u0430 \u0432\u0438\u0434\u0435\u043D \u043E\u0442\u0441\u0447\u0451\u0442 **X \xB7 Y \xB7 H**: \u0441\u0442\u0430\u043D\u0446\u0438\u044F \u0432\u0434\u043E\u043B\u044C\r
\u043E\u0441\u0438, \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043E\u0442 \u043E\u0441\u0438 \u0438 \u043E\u0442\u043C\u0435\u0442\u043A\u0430 \u0437\u0435\u043C\u043B\u0438 \u043F\u043E\u0434 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C.\r
\r
---\r
\r
## 6. \u041F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u0438 \u043E\u0440\u0442\u043E\r
\r
- **\u041F\u0420\u0418\u0412\u042F\u0417\u041A\u0410** (\u043A\u043B\u0430\u0432\u0438\u0448\u0430 **S**) \u2014 \u043A\u0443\u0440\u0441\u043E\u0440 \u0446\u0435\u043F\u043B\u044F\u0435\u0442\u0441\u044F \u043A \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0439 \u0442\u043E\u0447\u043A\u0435 \u0441\u043A\u0430\u043D\u0430\r
  \u0438\u043B\u0438 \u043A \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u0435 \u0447\u0435\u0440\u0442\u0435\u0436\u0430: \u043A\u043E\u043D\u0446\u0430\u043C \u0438 \u0441\u0435\u0440\u0435\u0434\u0438\u043D\u0430\u043C \u043E\u0442\u0440\u0435\u0437\u043A\u043E\u0432, \u0446\u0435\u043D\u0442\u0440\u0430\u043C \u0438\r
  \u043A\u0432\u0430\u0434\u0440\u0430\u043D\u0442\u0430\u043C \u043E\u043A\u0440\u0443\u0436\u043D\u043E\u0441\u0442\u0435\u0439, \u043A\u043E\u043D\u0446\u0430\u043C \u0434\u0443\u0433. \u0417\u0430\u0445\u0432\u0430\u0442 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F **\u0437\u0435\u043B\u0451\u043D\u044B\u043C\r
  \u043A\u0432\u0430\u0434\u0440\u0430\u0442\u043E\u043C**; \u0438\u0449\u0435\u0442\u0441\u044F \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0430\u044F \u0446\u0435\u043B\u044C \u0432 \u0440\u0430\u0434\u0438\u0443\u0441\u0435 15 \u043F\u0438\u043A\u0441\u0435\u043B\u0435\u0439.\r
- **\u041E\u0420\u0422\u041E** (\u043A\u043B\u0430\u0432\u0438\u0448\u0430 **F8**) \u2014 \u043B\u0438\u043D\u0438\u0438 \u0438\u0434\u0443\u0442 \u0441\u0442\u0440\u043E\u0433\u043E \u0432\u0434\u043E\u043B\u044C \u0438\u043B\u0438 \u043F\u043E\u043F\u0435\u0440\u0451\u043A \u043E\u0441\u0438\r
  \u0442\u0440\u0430\u0441\u0441\u044B. \u0423\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u043D\u0438\u0435 **Shift** \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0440\u0435\u0436\u0438\u043C \u043D\u0430\r
  \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u043F\u043E\u043B\u043E\u0436\u043D\u044B\u0439.\r
\r
\u041E\u0431\u0435 \u043A\u043D\u043E\u043F\u043A\u0438-\u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u0430 \u043D\u0430\u0445\u043E\u0434\u044F\u0442\u0441\u044F \u0432 \u043F\u0440\u0430\u0432\u043E\u043C \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0443\u0433\u043B\u0443 \u0438 \u0437\u0430\u0433\u043E\u0440\u0430\u044E\u0442\u0441\u044F\r
\u0437\u0435\u043B\u0451\u043D\u044B\u043C, \u043A\u043E\u0433\u0434\u0430 \u0440\u0435\u0436\u0438\u043C \u0432\u043A\u043B\u044E\u0447\u0451\u043D.\r
\r
---\r
\r
## 7. \u0412\u044B\u0431\u043E\u0440 \u043E\u0431\u044A\u0435\u043A\u0442\u043E\u0432 \u0438 \u043F\u0440\u0430\u0432\u043A\u0430\r
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
## 8. \u0421\u043B\u043E\u0438\r
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
  \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0445 \u043E\u0431\u044A\u0435\u043A\u0442\u043E\u0432; \u0432\u044B\u0431\u043E\u0440 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0441\u043B\u043E\u044F **\u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0438\u0442 \u0438\u0445 \u0442\u0443\u0434\u0430**.\r
\r
\u041A\u043D\u043E\u043F\u043A\u0430 **\u0422\u041E\u041B\u0429** \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0438 \u0432\u044B\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0445 \u0442\u043E\u043B\u0449\u0438\u043D \u043B\u0438\u043D\u0438\u0439\r
(\u0430\u043D\u0430\u043B\u043E\u0433 LWDISPLAY \u0432 AutoCAD).\r
\r
---\r
\r
## 9. \u0420\u0435\u0437: \u043F\u043E\u043F\u0435\u0440\u0435\u0447\u043D\u0438\u043A \u0438 \u043F\u0440\u043E\u0434\u043E\u043B\u044C\u043D\u0438\u043A\r
\r
\u042D\u0442\u043E \u0442\u043E, \u0440\u0430\u0434\u0438 \u0447\u0435\u0433\u043E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0438 \u0434\u0435\u043B\u0430\u043B\u0430\u0441\u044C: \u043F\u043B\u0430\u043D \u2014 \u043F\u043B\u043E\u0441\u043A\u0438\u0439 \u0447\u0435\u0440\u0442\u0451\u0436, \u0430 \u0437\u0435\u043C\u043B\u044F\r
\u043E\u0431\u044A\u0451\u043C\u043D\u0430\u044F, \u0438 \u043D\u0430\u0434\u043E \u0432\u0438\u0434\u0435\u0442\u044C \u0440\u0435\u043B\u044C\u0435\u0444 \u0442\u0430\u043C, \u043A\u0443\u0434\u0430 \u0441\u0435\u0439\u0447\u0430\u0441 \u0441\u043C\u043E\u0442\u0440\u0438\u0442 \u043A\u0443\u0440\u0441\u043E\u0440.\r
\r
\u041F\u043E\u043B\u043E\u0441\u043A\u0430 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u0434\u0451\u0442 \u0432\u0434\u043E\u043B\u044C \u043D\u0438\u0436\u043D\u0435\u0433\u043E \u043A\u0440\u0430\u044F \u043E\u043A\u043D\u0430 \u0440\u0435\u0437\u0430:\r
\r
| \u042D\u043B\u0435\u043C\u0435\u043D\u0442 | \u0427\u0442\u043E \u0434\u0435\u043B\u0430\u0435\u0442 |\r
|---|---|\r
| **\u041F\u041E\u041F\u0415\u0420 / \u041F\u0420\u041E\u0414** | \u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0440\u0435\u0437\u0430 \u2014 \u043D\u0430\u0436\u0430\u0442\u0438\u0435 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0435\u0442. \u041A\u0430\u0436\u0434\u0430\u044F \u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u043F\u043E\u043C\u043D\u0438\u0442 \u0441\u0432\u043E\u0438 \u0442\u043E\u043B\u0449\u0438\u043D\u0443, \u043E\u0445\u0432\u0430\u0442 \u0438 \u043C\u0430\u0441\u0448\u0442\u0430\u0431 |\r
| **\u0422** | **\u0442\u043E\u043B\u0449\u0438\u043D\u0430 \u0440\u0435\u0437\u0430** \u2014 \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u0435\u0442\u0440\u043E\u0432 \u043F\u043E\u043F\u0430\u0434\u0430\u0435\u0442 \u0432 \u0441\u0440\u0435\u0437 \u043F\u043E\u043F\u0435\u0440\u0451\u043A \u0435\u0433\u043E \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u0438. \u0422\u043E\u043D\u043A\u0438\u0439 \u0440\u0435\u0437 (5\u201320 \u0441\u043C) \u0434\u0430\u0451\u0442 \u0447\u0438\u0441\u0442\u044B\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044C, \u0442\u043E\u043B\u0441\u0442\u044B\u0439 \u043D\u0430\u0431\u0438\u0440\u0430\u0435\u0442 \u0431\u043E\u043B\u044C\u0448\u0435 \u0442\u043E\u0447\u0435\u043A \u0438 \u0441\u0433\u043B\u0430\u0436\u0438\u0432\u0430\u0435\u0442 \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0438 |\r
| **\u041E** | **\u043E\u0445\u0432\u0430\u0442** \u2014 \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u0435\u0442\u0440\u043E\u0432 \u0437\u0435\u043C\u043B\u0438 \u0432\u0438\u0434\u043D\u043E \u0432 \u043E\u043A\u043D\u0435. \u041F\u043E\u043F\u0435\u0440\u0435\u0447\u043D\u0438\u043A \u043E\u0431\u044B\u0447\u043D\u043E 20\u201360 \u043C, \u043F\u0440\u043E\u0434\u043E\u043B\u044C\u043D\u0438\u043A 100\u2013500 \u043C |\r
| **\u0412** | **\u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0430\u0441\u0448\u0442\u0430\u0431** \u2014 \u0432\u043E \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0440\u0430\u0437 \u0440\u0430\u0441\u0442\u044F\u043D\u0443\u0442\u044B \u0432\u044B\u0441\u043E\u0442\u044B. \u0411\u0435\u0437 \u0440\u0430\u0441\u0442\u044F\u0436\u043A\u0438 \u0440\u0435\u043B\u044C\u0435\u0444 \u0432 3 \u043C \u043D\u0430 \u0434\u043B\u0438\u043D\u0435 300 \u043C \u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u043A\u0430\u043A \u043F\u0440\u044F\u043C\u0430\u044F \u043B\u0438\u043D\u0438\u044F; \xD75\u2026\xD710 \u0434\u0435\u043B\u0430\u0435\u0442 \u0435\u0433\u043E \u0432\u0438\u0434\u0438\u043C\u044B\u043C |\r
\r
\u0420\u0430\u0437\u043D\u0438\u0446\u0430 \u043C\u0435\u0436\u0434\u0443 \u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u044F\u043C\u0438:\r
\r
- **\u041F\u041E\u041F\u0415\u0420\u0415\u0427\u041D\u0418\u041A** \u2014 \u0440\u0435\u0436\u0435\u0442 **\u043F\u043E\u043F\u0435\u0440\u0451\u043A** \u043E\u0441\u0438 \u0432 \u0442\u043E\u0447\u043A\u0435 \u043A\u0443\u0440\u0441\u043E\u0440\u0430: \u0432\u0438\u0434\u043D\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044C\r
  \u0434\u043E\u0440\u043E\u0433\u0438, \u043A\u044E\u0432\u0435\u0442\u044B, \u043E\u0442\u043A\u043E\u0441\u044B, \u0431\u0440\u043E\u0432\u043A\u0438. \u0422\u043E\u043B\u0449\u0438\u043D\u0430 \xAB\u0422\xBB \u043E\u0442\u043C\u0435\u0440\u044F\u0435\u0442\u0441\u044F \u0432\u0434\u043E\u043B\u044C \u0442\u0440\u0430\u0441\u0441\u044B,\r
  \u043E\u0445\u0432\u0430\u0442 \xAB\u041E\xBB \u2014 \u043F\u043E\u043F\u0435\u0440\u0451\u043A.\r
- **\u041F\u0420\u041E\u0414\u041E\u041B\u042C\u041D\u0418\u041A** \u2014 \u0440\u0435\u0436\u0435\u0442 **\u0432\u0434\u043E\u043B\u044C** \u043E\u0441\u0438: \u0432\u0438\u0434\u043D\u043E, \u043A\u0430\u043A \u0437\u0435\u043C\u043B\u044F \u0438\u0434\u0451\u0442 \u043F\u043E \u0442\u0440\u0430\u0441\u0441\u0435,\r
  \u0433\u0434\u0435 \u043D\u0430\u0441\u044B\u043F\u044C, \u0433\u0434\u0435 \u0432\u044B\u0435\u043C\u043A\u0430. \u0422\u043E\u043B\u0449\u0438\u043D\u0430 \xAB\u0422\xBB \u043E\u0442\u043C\u0435\u0440\u044F\u0435\u0442\u0441\u044F \u043F\u043E\u043F\u0435\u0440\u0451\u043A \u0442\u0440\u0430\u0441\u0441\u044B, \u043E\u0445\u0432\u0430\u0442\r
  \xAB\u041E\xBB \u2014 \u0432\u0434\u043E\u043B\u044C.\r
\r
\u041E\u043A\u043D\u043E \u0441\u043B\u0435\u0434\u0443\u0435\u0442 \u0437\u0430 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C \u0438 \u0434\u0435\u0440\u0436\u0438\u0442\u0441\u044F \u043D\u0430 \u0443\u0440\u043E\u0432\u043D\u0435 \u0437\u0435\u043C\u043B\u0438 \u043F\u043E\u0434 \u043D\u0438\u043C, \u043F\u043E\u043A\u0430 \u0432\u044B \u043D\u0435\r
\u0437\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u0443\u0435\u0442\u0435 \u0435\u0433\u043E (\u0441\u043C. \u0440\u0430\u0437\u0434\u0435\u043B 2).\r
\r
### 3D-\u043E\u043A\u043D\u043E\r
\r
\u041F\u043E\u043B\u043E\u0441\u043A\u0430 **\u041E\u0411\u041B\u0410\u0421\u0422\u042C** \u0432\u043D\u0438\u0437\u0443 3D-\u043E\u043A\u043D\u0430 \u0437\u0430\u0434\u0430\u0451\u0442 \u0440\u0430\u0437\u043C\u0435\u0440 \u0432\u0438\u0434\u0438\u043C\u043E\u0433\u043E \u043A\u0443\u0441\u043A\u0430 \u043E\u0431\u043B\u0430\u043A\u0430\r
\u0432\u043E\u043A\u0440\u0443\u0433 \u043A\u0443\u0440\u0441\u043E\u0440\u0430 \u2014 \u043E\u0442 5 \u0434\u043E 600 \u043C. \u041C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E\r
\u043E\u043A\u0440\u0435\u0441\u0442\u043D\u043E\u0441\u0442\u044C \u043A\u0443\u0440\u0441\u043E\u0440\u0430 (\u0438 \u043A\u0430\u0434\u0440 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u043B\u0435\u0433\u0447\u0435), \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0432\u0435\u0441\u044C\r
\u0443\u0447\u0430\u0441\u0442\u043E\u043A.\r
\r
### \u0421\u0440\u0435\u0437 \u043F\u043B\u0430\u043D\u0430 \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435\r
\r
\u041F\u043E\u043B\u043E\u0441\u043A\u0430 **\u0421\u0420\u0415\u0417** \u0432 \u043B\u0435\u0432\u043E\u043C \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0443\u0433\u043B\u0443 \u043F\u043B\u0430\u043D\u0430. \u041A\u043D\u043E\u043F\u043A\u0430 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0440\u0435\u0436\u0438\u043C,\r
\u043F\u043E\u043B\u0437\u0443\u043D\u043E\u043A **H** \u0434\u0432\u0438\u0433\u0430\u0435\u0442 \u0441\u0440\u0435\u0437 \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435, \u043F\u043E\u043B\u0437\u0443\u043D\u043E\u043A **\u0422** \u0437\u0430\u0434\u0430\u0451\u0442 \u0442\u043E\u043B\u0449\u0438\u043D\u0443\r
\u0441\u043B\u043E\u044F.\r
\r
\u0412 \u0441\u0440\u0435\u0437\u0435 \u0432\u0438\u0434\u043D\u044B **\u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E\u0447\u043A\u0438 \u043D\u0443\u0436\u043D\u043E\u0433\u043E \u0441\u043B\u043E\u044F \u0432\u044B\u0441\u043E\u0442** \u2014 \u0442\u0430\u043A \u0437\u0435\u043C\u043B\u044F \u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F\r
\u0438\u0437-\u043F\u043E\u0434 \u0440\u0430\u0441\u0442\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438, \u0430 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C \u043C\u043E\u0436\u043D\u043E \u043E\u0431\u0432\u0435\u0441\u0442\u0438 \u043F\u043E \u0444\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u043C\u0443\r
\u0441\u043B\u043E\u044E. **\u041F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u0442\u043E\u0436\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E \u0432\u0438\u0434\u0438\u043C\u043E\u043C\u0443 \u0441\u0440\u0435\u0437\u0443**, \u043F\u043E\u044D\u0442\u043E\u043C\u0443\r
\u043A\u0443\u0440\u0441\u043E\u0440 \u043F\u043E\u0439\u043C\u0430\u0435\u0442 \u0437\u0435\u043C\u043B\u044E, \u0430 \u043D\u0435 \u043A\u0440\u043E\u043D\u0443 \u0434\u0435\u0440\u0435\u0432\u0430 \u043D\u0430\u0434 \u043D\u0435\u0439.\r
\r
---\r
\r
## 10. \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u043E\u043A\u043E\u043D\r
\r
\u0423 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043E\u043A\u043D\u0430 \u0435\u0441\u0442\u044C \u0442\u0440\u0438 \u043A\u0440\u0443\u0433\u043B\u044B\u0435 \u043A\u043D\u043E\u043F\u043A\u0438:\r
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
  **\u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435**. \u041F\u043B\u0430\u043D \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0440\u0430\u0441\u043A\u0440\u0430\u0448\u0435\u043D \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435 \u2014 \u044D\u0442\u043E\r
  \u0433\u0438\u043F\u0441\u043E\u043C\u0435\u0442\u0440\u0438\u044F \u0443\u0447\u0430\u0441\u0442\u043A\u0430.\r
\r
---\r
\r
## 11. \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u043B\u0435\u043D\u0442\u044B \u043F\u043E\u0434 \u0441\u0435\u0431\u044F\r
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
## 12. \u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\r
\r
- **DXF** \u2014 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442 \u0447\u0435\u0440\u0442\u0451\u0436 \u0444\u0430\u0439\u043B\u043E\u043C. \u0421\u043B\u043E\u0438 \u0443\u0445\u043E\u0434\u044F\u0442 \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u0438\u043C\u0435\u043D\u0430\u043C\u0438,\r
  \u0446\u0432\u0435\u0442\u0430\u043C\u0438 \u0438 \u0442\u0438\u043F\u0430\u043C\u0438 \u043B\u0438\u043D\u0438\u0439, \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B \u2014 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0439 \u043E\u0441\u0438.\r
  \u0412 \u0440\u0435\u0436\u0438\u043C\u0435 **\u041C\u0421\u041A** \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B \u0443\u0445\u043E\u0434\u044F\u0442 \u0432 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 \u0441\u043A\u0430\u043D\u0430\r
  (E \xB7 N \xB7 H).\r
- **ToCad** \u2014 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0447\u0435\u0440\u0442\u0451\u0436 \u043F\u0440\u044F\u043C\u043E \u0432 \u043E\u0442\u043A\u0440\u044B\u0442\u044B\u0439 AutoCAD. \u0415\u0441\u043B\u0438 \u0441\u0432\u044F\u0437\u044C\r
  \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430, \u0441\u043A\u0440\u0438\u043F\u0442 \u043A\u043B\u0430\u0434\u0451\u0442\u0441\u044F \u0432 \u0431\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430: \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u0435\u0441\u044C \u0432 AutoCAD \u0438\r
  \u043D\u0430\u0436\u043C\u0438\u0442\u0435 **Ctrl+V** \u0432 \u043A\u043E\u043C\u0430\u043D\u0434\u043D\u043E\u0439 \u0441\u0442\u0440\u043E\u043A\u0435.\r
\r
\u0415\u0441\u043B\u0438 \u0447\u0442\u043E-\u0442\u043E \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043E \u2014 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u043E\u0435, \u0438\u043D\u0430\u0447\u0435 \u0432\u0435\u0441\u044C\r
\u0447\u0435\u0440\u0442\u0451\u0436. \u0427\u0435\u0440\u0442\u0451\u0436 \u043F\u043B\u043E\u0441\u043A\u0438\u0439: \u043F\u043E\u0434\u043F\u0438\u0441\u0438 \u043E\u0442\u043C\u0435\u0442\u043E\u043A \u0443\u0445\u043E\u0434\u044F\u0442 \u0442\u0435\u043A\u0441\u0442\u043E\u043C \u0440\u044F\u0434\u043E\u043C \u0441 \u0442\u043E\u0447\u043A\u0430\u043C\u0438.\r
\r
---\r
\r
## 13. \u0413\u043E\u0440\u044F\u0447\u0438\u0435 \u043A\u043B\u0430\u0432\u0438\u0448\u0438\r
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
| **1 \xB7 2 \xB7 3** | \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0435 \u043E\u043A\u043D\u043E: \u043F\u043B\u0430\u043D \xB7 \u0440\u0435\u0437 \xB7 3D (2 \u0438 3 \u0444\u0438\u043A\u0441\u0438\u0440\u0443\u044E\u0442 \u043E\u043A\u043D\u043E) |\r
| **\u0446\u0438\u0444\u0440\u044B** | \u0442\u043E\u0447\u043D\u044B\u0439 \u0432\u0432\u043E\u0434 \u0434\u043B\u0438\u043D\u044B \u0438\u043B\u0438 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u044F |\r
| **\u0421\u041A\u041C** | \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430, \u0432 3D-\u043E\u043A\u043D\u0435 \u2014 \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 |\r
| **\u043A\u043E\u043B\u0435\u0441\u043E** | \u0437\u0443\u043C \u043A \u043A\u0443\u0440\u0441\u043E\u0440\u0443 |\r
| **F1** | \u0441\u043F\u0440\u0430\u0432\u043A\u0430 |\r
\r
---\r
\r
## 14. \u0415\u0441\u043B\u0438 \u0442\u043E\u0440\u043C\u043E\u0437\u0438\u0442\r
\r
\u0412 \u043F\u0440\u0430\u0432\u043E\u043C \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0443\u0433\u043B\u0443 \u0440\u044F\u0434\u043E\u043C \u0441 **FPS** \u0435\u0441\u0442\u044C \u0441\u0447\u0451\u0442\u0447\u0438\u043A **PTS** \u2014 \u0441\u043A\u043E\u043B\u044C\u043A\u043E\r
\u0442\u043E\u0447\u0435\u043A \u043E\u0431\u043B\u0430\u043A\u0430 \u043E\u0442\u0440\u0438\u0441\u043E\u0432\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0437\u0430 \u043A\u0430\u0434\u0440. \u041F\u043E \u043D\u0435\u043C\u0443 \u0441\u0440\u0430\u0437\u0443 \u0432\u0438\u0434\u043D\u043E, \u0447\u0442\u043E \u0433\u0440\u0443\u0437\u0438\u0442\r
\u0441\u0446\u0435\u043D\u0443.\r
\r
\u0427\u0442\u043E \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442:\r
\r
- **\u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u043E\u0441\u044C** \u2014 \u043F\u043E\u0441\u043B\u0435 \u044D\u0442\u043E\u0433\u043E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0440\u0438\u0441\u0443\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0438\u0434\u0438\u043C\u044B\u0439 \u0443\u0447\u0430\u0441\u0442\u043E\u043A\r
  \u0432\u0434\u043E\u043B\u044C \u043D\u0435\u0451, \u0438 \u0447\u0435\u043C \u0431\u043B\u0438\u0436\u0435 \u0432\u044B \u043F\u0440\u0438\u0431\u043B\u0438\u0436\u0430\u0435\u0442\u0435\u0441\u044C, \u0442\u0435\u043C \u043B\u0435\u0433\u0447\u0435 \u043A\u0430\u0434\u0440;\r
- **\u0443\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u0435 \u043E\u0445\u0432\u0430\u0442** \u043F\u0440\u043E\u0434\u043E\u043B\u044C\u043D\u0438\u043A\u0430 \u0438 **\u041E\u0411\u041B\u0410\u0421\u0422\u042C** \u0432 3D-\u043E\u043A\u043D\u0435 \u2014 \u044D\u0442\u043E \u0434\u0432\u0430 \u0441\u0430\u043C\u044B\u0445\r
  \u043F\u0440\u043E\u0436\u043E\u0440\u043B\u0438\u0432\u044B\u0445 \u0432\u0438\u0434\u0430;\r
- **\u0443\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u0435 \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C** \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u043E\u0431\u043B\u0430\u043A\u0430 (\u0448\u0435\u0441\u0442\u0435\u0440\u0451\u043D\u043A\u0430) \u2014 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E\r
  \u0447\u0435\u0440\u0442\u0435\u0436\u0430 \u043D\u0435 \u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F, \u0442\u043E\u0447\u0435\u043A \u043D\u0430 \u044D\u043A\u0440\u0430\u043D\u0435 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u043C\u0435\u043D\u044C\u0448\u0435;\r
- **\u0441\u043A\u0440\u043E\u0439\u0442\u0435 \u043E\u0431\u043B\u0430\u043A\u043E** \u0432 \u043E\u043A\u043D\u0430\u0445, \u0433\u0434\u0435 \u043E\u043D\u043E \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0435 \u043D\u0443\u0436\u043D\u043E (\u043A\u043D\u043E\u043F\u043A\u0430 \u0441 \u0442\u043E\u0447\u043A\u0430\u043C\u0438);\r
- \u0434\u043B\u044F \u043E\u0447\u0435\u043D\u044C \u0431\u043E\u043B\u044C\u0448\u0438\u0445 LAZ \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0444\u043E\u0440\u043C\u0430\u0442 **COPC** \u2014 \u043E\u043D \u043F\u043E\u0434\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044F\r
  \u0443\u0440\u043E\u0432\u043D\u044F\u043C\u0438 \u0438 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0431\u044B\u0441\u0442\u0440\u0435\u0435.\r
\r
---\r
\r
## 15. \u0427\u0442\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F, \u0430 \u0447\u0442\u043E \u043D\u0435\u0442\r
\r
| \u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u043C\u0435\u0436\u0434\u0443 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u043C\u0438 | \u0416\u0438\u0432\u0451\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u043C \u0441\u0435\u0430\u043D\u0441\u0435 |\r
|---|---|\r
| \u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u0441\u043B\u043E\u0451\u0432 (\u0446\u0432\u0435\u0442\u0430, \u0442\u0438\u043F\u044B \u043B\u0438\u043D\u0438\u0439, \u0442\u043E\u043B\u0449\u0438\u043D\u044B) | \u0421\u0430\u043C \u0447\u0435\u0440\u0442\u0451\u0436 |\r
| \u0420\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0430 \u043A\u043D\u043E\u043F\u043E\u043A \u0432 \u043B\u0435\u043D\u0442\u0435 | \u0421\u043F\u0438\u0441\u043E\u043A \u043E\u0441\u0435\u0439 |\r
| \u041F\u043E\u043A\u0430\u0437 \u0442\u043E\u043B\u0449\u0438\u043D \u043B\u0438\u043D\u0438\u0439 | \u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u043E\u0435 \u043E\u0431\u043B\u0430\u043A\u043E |\r
\r
\u0422\u043E \u0435\u0441\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E \u043C\u0435\u0441\u0442\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u043F\u043E\u043C\u043D\u0438\u0442, \u0430 \u0447\u0435\u0440\u0442\u0451\u0436 \u043F\u043E\u043A\u0430 \u043D\u0443\u0436\u043D\u043E\r
\u0432\u044B\u0433\u0440\u0443\u0436\u0430\u0442\u044C \u0432 DXF \u043F\u0435\u0440\u0435\u0434 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0435\u043C \u0432\u043A\u043B\u0430\u0434\u043A\u0438 \u2014 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0435\u043A\u0442\u0430 \u0432 \u0444\u0430\u0439\u043B \u043D\u0430\r
\u044D\u0442\u043E\u043C \u044D\u0442\u0430\u043F\u0435 \u043D\u0435\u0442.\r
`;
function fx(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function Hi(s) {
  return fx(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}
function fc(s) {
  return s.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((t) => t.trim());
}
function px(s) {
  const t = s.split(/\r?\n/), e = [];
  let n = null, i = [];
  const r = () => {
    n && (e.push(`</${n}>`), n = null);
  }, o = () => {
    i.length && (e.push(`<p>${Hi(i.join(" "))}</p>`), i = []);
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
      const p = h.match(/^#+/)[0].length;
      e.push(`<h${p}>${Hi(h.replace(/^#+\s*/, ""))}</h${p}>`);
      continue;
    }
    if (/^---+$/.test(h)) {
      a(), e.push("<hr />");
      continue;
    }
    if (h.startsWith("|") && (t[l + 1] ?? "").trim().startsWith("|-")) {
      a();
      const p = fc(h);
      for (e.push("<table><thead><tr>" + p.map((g) => `<th>${Hi(g)}</th>`).join("") + "</tr></thead><tbody>"), l += 2; l < t.length && t[l].trim().startsWith("|"); l++) e.push("<tr>" + fc(t[l]).map((g) => `<td>${Hi(g)}</td>`).join("") + "</tr>");
      l--, e.push("</tbody></table>");
      continue;
    }
    const u = h.match(/^[-*]\s+(.*)$/), d = h.match(/^\d+\.\s+(.*)$/);
    if (u || d) {
      o();
      const p = u ? "ul" : "ol";
      n !== p && (r(), e.push(`<${p}>`), n = p), e.push(`<li>${Hi((u ?? d)[1])}</li>`);
      continue;
    }
    if (n && /^\s{2,}\S/.test(c)) {
      const p = e.pop() ?? "";
      e.push(p.replace(/<\/li>$/, ` ${Hi(h)}</li>`));
      continue;
    }
    r(), i.push(h);
  }
  return a(), e.join(`
`);
}
const mx = px(dx), pc = ["main", "section", "iso"];
function nt(s) {
  const t = document.getElementById(s);
  if (!t) throw new Error(`UI: missing #${s}`);
  return t;
}
const gx = [["solid", "\u0421\u043F\u043B\u043E\u0448\u043D\u0430\u044F"], ["dashed", "\u0428\u0442\u0440\u0438\u0445\u043E\u0432\u0430\u044F"], ["dotted", "\u041F\u0443\u043D\u043A\u0442\u0438\u0440\u043D\u0430\u044F"], ["dashdot", "\u0428\u0442\u0440\u0438\u0445\u043F\u0443\u043D\u043A\u0442."]], _x = [0.13, 0.18, 0.25, 0.35, 0.5, 0.7, 1, 1.4, 2];
class xx {
  constructor(t) {
    this.handlers = t, this.hint = nt("hint"), this.coords = nt("coords"), this.fps = nt("fps"), this.ptsOut = nt("pts"), this.pillSnap = nt("pill-snap"), this.pillOrtho = nt("pill-ortho"), this.pillWeight = nt("pill-weight"), this.layersPanel = nt("layers-panel"), this.layersList = nt("layers-list"), this.marquee = nt("marquee"), this.ucsSelect = nt("ucs-select"), this.layerSelect = nt("layer-select"), this.dynInput = nt("dyn-input"), this.fileInput = nt("import-file"), this.toolButtons = [], this.ribbon = cx(), this.ribbonEdit = false, this.activeToolId = "", this.dragId = null, this.layersMoved = false, this.helpFilled = false, this.labelText = { main: "\u041F\u041B\u0410\u041D", section: "\u0420\u0415\u0417", iso: "3D \xB7 \u041E\u0411\u0417\u041E\u0420" }, this.labelFrozen = { main: false, section: false, iso: false }, this.cloudPanelFor = null, this.renderRibbon(), this.bindRibbon(), nt("btn-ribbon-edit").addEventListener("click", () => this.setRibbonEdit(!this.ribbonEdit)), this.pillSnap.addEventListener("click", () => t.onToggleSnap()), this.pillOrtho.addEventListener("click", () => t.onToggleOrtho()), nt("section-mode").addEventListener("click", () => t.onToggleSectionMode());
    const e = nt("sec-thick");
    e.addEventListener("input", () => t.onSectionThick(parseFloat(e.value)));
    const n = nt("sec-span");
    n.addEventListener("input", () => t.onSectionSpan(parseFloat(n.value)));
    const i = nt("sec-exag");
    i.addEventListener("input", () => t.onSectionExag(parseFloat(i.value)));
    const r = nt("cursor-area");
    r.addEventListener("input", () => {
      const c = parseFloat(r.value);
      nt("cursor-area-val").textContent = `${c.toFixed(0)} \u043C`, t.onCursorArea(c);
    }), nt("slice-pill").addEventListener("click", () => t.onToggleSlice());
    const o = nt("slice-z");
    o.addEventListener("input", () => t.onSliceZ(parseFloat(o.value)));
    const a = nt("slice-thick");
    a.addEventListener("input", () => t.onSliceThick(parseFloat(a.value))), this.ucsSelect.addEventListener("change", () => t.onUcsSelect(this.ucsSelect.selectedIndex)), this.layerSelect.addEventListener("change", () => t.onLayerCombo(this.layerSelect.value));
    for (const c of pc) nt(`eye-${c}`).addEventListener("click", () => t.onToggleLayer(c)), nt(`gear-${c}`).addEventListener("click", () => t.onOpenCloudPanel(c)), nt(`cloudeye-${c}`).addEventListener("click", () => t.onToggleCloud(c));
    this.fileInput.addEventListener("change", () => {
      const c = this.fileInput.files && this.fileInput.files[0];
      c && t.onImportFile(c), this.fileInput.value = "";
    }), nt("btn-ucs-rename").addEventListener("click", () => t.onRenameUcs());
    const l = (c, h) => {
      const u = nt(c);
      u.addEventListener("input", () => {
        this.cloudPanelFor && t.onCloudSetting(this.cloudPanelFor, h, parseFloat(u.value));
      });
    };
    l("cp-size", "size"), l("cp-opacity", "opacity"), l("cp-density", "density"), l("cp-mode", "mode"), nt("cloud-panel-close").addEventListener("click", () => this.closeCloudPanel()), nt("btn-start-import").addEventListener("click", () => this.fileInput.click()), nt("btn-start-demo").addEventListener("click", () => t.onDemoStart()), nt("layers-close").addEventListener("click", () => this.toggleLayersPanel(false)), this.bindLayersDrag(), nt("layer-swatch").addEventListener("click", () => this.toggleLayersPanel()), nt("btn-layer-add").addEventListener("click", () => t.onLayerAdd()), nt("btn-layer-assign").addEventListener("click", () => t.onAssignToLayer()), this.pillWeight.addEventListener("click", () => t.onToggleWeightDisplay()), nt("help-close").addEventListener("click", () => this.toggleHelp(false)), nt("btn-start-help").addEventListener("click", () => this.toggleHelp(true)), this.setUcsList([], -1);
  }
  renderRibbon() {
    const t = nt("ribbon-groups");
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
        const l = rh.get(a);
        if (!l) continue;
        const c = document.createElement("button");
        c.className = "tool-btn", c.dataset.btnId = l.id, l.tool && (c.dataset.tool = l.tool), l.action && (c.dataset.action = l.action), l.domId && (c.id = l.domId), c.title = l.title, c.draggable = this.ribbonEdit, c.innerHTML = `<svg viewBox="0 0 24 24">${l.icon}</svg><span>${l.label}</span>`, r.appendChild(c);
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
        this.ribbon = ux(), this.renderRibbon();
      }), n("\u0413\u043E\u0442\u043E\u0432\u043E", "\u0412\u044B\u0439\u0442\u0438 \u0438\u0437 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043B\u0435\u043D\u0442\u044B", () => this.setRibbonEdit(false)), t.appendChild(e);
    }
    nt("ribbon").dataset.edit = String(this.ribbonEdit), this.toolButtons = Array.from(document.querySelectorAll("[data-tool]")), this.setActiveTool(this.activeToolId), this.publishRibbonHeight();
  }
  publishRibbonHeight() {
    requestAnimationFrame(() => {
      const t = Math.round(nt("ribbon").getBoundingClientRect().height);
      document.documentElement.style.setProperty("--ribbon-h", `${t}px`), this.handlers.onRibbonHeight(t);
    });
  }
  ribbonLayoutChanged() {
    hx(this.ribbon), this.renderRibbon();
  }
  bindRibbon() {
    const t = nt("ribbon-groups");
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
    this.ribbonEdit = t, nt("btn-ribbon-edit").dataset.on = String(t), this.renderRibbon(), this.setHint(t ? "\u041D\u0410\u0421\u0422\u0420\u041E\u0419\u041A\u0410 \u041B\u0415\u041D\u0422\u042B \u2014 \u043F\u0435\u0440\u0435\u0442\u0430\u0441\u043A\u0438\u0432\u0430\u0439\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0438 \u043C\u0435\u0436\u0434\u0443 \u043F\u0430\u043D\u0435\u043B\u044F\u043C\u0438 \xB7 \u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043B\u0438\u043A \u043F\u043E \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044E \u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u0443\u0435\u0442 \u043F\u0430\u043D\u0435\u043B\u044C \xB7 \u2699 \u0438\u043B\u0438 \xAB\u0413\u043E\u0442\u043E\u0432\u043E\xBB \u0434\u043B\u044F \u0432\u044B\u0445\u043E\u0434\u0430" : "");
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
    const e = nt("help-panel"), n = t ?? e.classList.contains("hidden");
    n && !this.helpFilled && (nt("help-body").innerHTML = mx, this.helpFilled = true), e.classList.toggle("hidden", !n), e.classList.toggle("flex", n);
    const i = document.getElementById("btn-help");
    i && (i.dataset.active = String(n));
  }
  get helpOpen() {
    return !nt("help-panel").classList.contains("hidden");
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
    const t = nt("layers-header");
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
      for (const [d, p] of gx) {
        const g = document.createElement("option");
        g.value = d, g.textContent = p, g.selected = d === e.linetype, a.appendChild(g);
      }
      a.addEventListener("change", () => this.handlers.onLayerType(e.name, a.value)), n.appendChild(a);
      const l = document.createElement("select");
      l.className = "lr-select lr-weight", l.title = "\u0422\u043E\u043B\u0449\u0438\u043D\u0430 \u043B\u0438\u043D\u0438\u0438, \u043C\u043C";
      for (const d of _x) {
        const p = document.createElement("option");
        p.value = String(d), p.textContent = d.toFixed(2), p.selected = Math.abs(d - e.weight) < 1e-6, l.appendChild(p);
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
    this.layerSelect.value = e ?? "", this.layerSelect.dataset.selection = String(n), this.layerSelect.title = n ? "\u041F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B \u043D\u0430 \u0441\u043B\u043E\u0439 (\u0446\u0432\u0435\u0442 \u0438 \u0442\u0438\u043F \u043B\u0438\u043D\u0438\u0438 \u0432\u043E\u0437\u044C\u043C\u0443\u0442\u0441\u044F \u043E\u0442 \u0441\u043B\u043E\u044F)" : "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0441\u043B\u043E\u0439 \u2014 \u043D\u0430 \u043D\u0451\u043C \u043F\u043E\u044F\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u043D\u043E\u0432\u044B\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B", nt("layer-swatch").style.background = i;
  }
  showStart(t) {
    nt("start-overlay").classList.toggle("hidden", !t);
  }
  setProgress(t) {
    const e = nt("start-progress");
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
    this.cloudPanelFor = t, nt("cp-size").value = String(e.size), nt("cp-opacity").value = String(e.opacity), nt("cp-density").value = String(e.density), nt("cp-mode").value = String(e.mode);
    const n = { main: "\u041E\u0411\u041B\u0410\u041A\u041E \xB7 \u041F\u041B\u0410\u041D", section: "\u041E\u0411\u041B\u0410\u041A\u041E \xB7 \u0420\u0415\u0417", iso: "\u041E\u0411\u041B\u0410\u041A\u041E \xB7 3D" };
    nt("cloud-panel-title").textContent = n[t];
    const i = nt("cloud-panel");
    i.classList.remove("hidden"), i.classList.add("flex");
    const r = nt(`gear-${t}`).getBoundingClientRect();
    i.style.left = `${Math.max(8, Math.min(r.right, window.innerWidth - 8) - i.offsetWidth)}px`, i.style.top = t === "iso" ? `${Math.max(8, r.top - i.offsetHeight - 8)}px` : `${r.bottom + 8}px`;
  }
  closeCloudPanel() {
    this.cloudPanelFor = null;
    const t = nt("cloud-panel");
    t.classList.add("hidden"), t.classList.remove("flex");
  }
  setLayerVisible(t, e) {
    nt(`eye-${t}`).dataset.on = String(e);
  }
  setCloudVisible(t, e) {
    nt(`cloudeye-${t}`).dataset.on = String(e);
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
  setCoords(t, e, n, i) {
    const r = n === null ? "   \u2014  " : n.toFixed(3);
    this.coords.textContent = i ? `E ${t.toFixed(3)}  N ${e.toFixed(3)}  H ${r}` : `X ${t.toFixed(3)}  Y ${e.toFixed(3)}  H ${r}`;
  }
  setFps(t, e = -1) {
    this.fps.textContent = String(t), e >= 0 && (this.ptsOut.textContent = e >= 1e3 ? `${Math.round(e / 1e3)}k` : String(e));
  }
  setActivePane(t, e) {
    const n = nt("pane-focus");
    n.style.left = `${e.x + 1}px`, n.style.top = `${e.y + 1}px`, n.style.width = `${Math.max(0, e.w - 2)}px`, n.style.height = `${Math.max(0, e.h - 2)}px`, n.dataset.pane = t;
    for (const i of pc) {
      const r = document.getElementById(`lbl-${i}`);
      r && (r.dataset.active = String(i === t));
    }
  }
  setPaneLabel(t, e) {
    this.labelText[t] = e, this.renderLabel(t);
  }
  setPaneFrozen(t, e) {
    this.labelFrozen[t] !== e && (this.labelFrozen[t] = e, this.renderLabel(t));
  }
  renderLabel(t) {
    const e = document.getElementById(`lbl-${t}`);
    if (e && (e.textContent = this.labelText[t], e.dataset.frozen = String(this.labelFrozen[t]), this.labelFrozen[t])) {
      const n = document.createElement("span");
      n.className = "lbl-chip", n.textContent = "\u0424\u0418\u041A\u0421", n.title = "\u041E\u043A\u043D\u043E \u0437\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u2014 \u043A\u043B\u0430\u0432\u0438\u0448\u0430 1 \u0432\u0435\u0440\u043D\u0451\u0442 \u0441\u043B\u0435\u0436\u0435\u043D\u0438\u0435 \u0437\u0430 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C", e.appendChild(n);
    }
  }
  setSectionMode(t) {
    const e = nt("section-mode");
    e.textContent = t === "cross" ? "\u041F\u041E\u041F\u0415\u0420" : "\u041F\u0420\u041E\u0414", e.dataset.on = "true", e.title = t === "cross" ? "\u0420\u0435\u0437 \u043F\u043E\u043F\u0435\u0440\u0451\u043A \u043E\u0441\u0438 \u2014 \u043D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C\u0441\u044F \u043D\u0430 \u043F\u0440\u043E\u0434\u043E\u043B\u044C\u043D\u044B\u0439" : "\u0420\u0435\u0437 \u0432\u0434\u043E\u043B\u044C \u043E\u0441\u0438 \u2014 \u043D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C\u0441\u044F \u043D\u0430 \u043F\u043E\u043F\u0435\u0440\u0435\u0447\u043D\u044B\u0439";
    const n = nt("sec-span");
    n.min = t === "cross" ? "2" : "10", n.max = t === "cross" ? "300" : "2000", n.step = t === "cross" ? "1" : "5";
  }
  setSectionThick(t) {
    nt("sec-thick").value = String(t), nt("sec-thick-val").textContent = `${t.toFixed(2)} \u043C`;
  }
  setSectionSpan(t) {
    nt("sec-span").value = String(t), nt("sec-span-val").textContent = `${t.toFixed(t < 10 ? 1 : 0)} \u043C`;
  }
  setSectionExag(t) {
    nt("sec-exag").value = String(t), nt("sec-exag-val").textContent = `\xD7${t % 1 === 0 ? t.toFixed(0) : t.toFixed(1)}`;
  }
  setCursorArea(t) {
    nt("cursor-area").value = String(t), nt("cursor-area-val").textContent = `${t.toFixed(0)} \u043C`;
  }
  showSectionPanels(t) {
    for (const e of ["section-panel", "cursor-panel", "slice-panel"]) {
      const n = nt(e);
      n.classList.toggle("hidden", !t), n.classList.toggle("flex", t);
    }
  }
  setSliceRange(t, e) {
    const n = nt("slice-z"), i = Math.floor(t * 10) / 10, r = Math.ceil(e * 10) / 10;
    n.min = String(i), n.max = String(r), n.step = String(Math.max(0.01, (r - i) / 500));
  }
  setSlice(t, e, n) {
    nt("slice-pill").dataset.on = String(t), nt("slice-z").value = String(e), nt("slice-val").textContent = `${e.toFixed(2)} \u043C`, nt("slice-thick").value = String(n), nt("slice-thick-val").textContent = `${n.toFixed(2)} \u043C`;
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
const fe = new b(), kn = new b(), Hn = new b(), vr = new b(), Vi = new b(), mc = new b(), yr = new Kt(), vx = new b(), gc = new b(), yx = 50, Mx = 1, ri = { start: 0, count: 0 };
class Sx {
  constructor() {
    this.scene = new Xu(), this.ucs = new r_(), this.snap = new a_(), this.layers = new S_(), this.snapOn = true, this.orthoOn = false, this.isolated = null, this.sectionMode = "cross", this.sections = { cross: { thick: 0.6, span: 30, exag: 3 }, long: { thick: 0.6, span: 120, exag: 5 } }, this.sliceOn = false, this.sliceZ = 0, this.sliceThick = 0.5, this.zMin = 0, this.zMax = 10, this.deviationRef = 0, this.cloudOrigin = null, this.panning = null, this.panX = 0, this.panY = 0, this.frames = 0, this.fpsT = performance.now(), this.mainMode = "top", this.activePane = "main", this.cursorLocal = new b(), this.sectionAnchor = new b(), this.isoAnchor = new b(), this.sectionFollow = false, this.isoFollow = false, this.cloudSettings = { main: { size: 2, opacity: 1, density: 1, mode: 2 }, section: { size: 2, opacity: 1, density: 1, mode: 0 }, iso: { size: 2, opacity: 1, density: 0.6, mode: 2 } }, this.ucsList = [], this.activeUcs = -1, this.ucsLabels = new di(), this.importWorker = null, this.workerReady = false, this.pendingJob = null, this.pendingDemo = false, this.compactGeo = null, this.tileStart = null, this.tileMinX = 0, this.tileInv = 1, this.tileCount = 1, this.layerUiQueued = false, this.framePts = 0, this.framePtsShown = 0, this.renderCount = 0, this.undoStack = [], this.redoStack = [], this.sessionApiUrl = "/api/topo_cad_session.php", this.cloudName = null, this.dirty = false, this.saving = false;
    const t = document.getElementById("gl");
    this.renderer = new Gg({ canvas: t, antialias: true, powerPreference: "high-performance" }), d_(this.layers), this.cloud = ex();
    const { material: e, uniforms: n } = T_();
    this.cloudUniforms = n, this.attachKeys(this.cloud.geometry, this.cloud.count), this.cloudPoints = new Ku(this.cloud.geometry, e), this.cloudPoints.frustumCulled = false, this.cloudPoints.layers.set(4), this.scene.add(this.cloudPoints), this.renderCount = this.cloud.count, this.scene.add(this.ucsLabels);
    let i = 1 / 0, r = -1 / 0;
    const o = this.cloud.positions;
    for (let l = 1; l < o.length; l += 3) o[l] < i && (i = o[l]), o[l] > r && (r = o[l]);
    n.uMinY.value = isFinite(i) ? i : 0, n.uYRangeInv.value = 1 / Math.max(1e-3, r - i), this.scene.add(this.ucs.group), this.scene.add(this.ucs.axesHelper), this.store = new x_(this.ucs.group);
    const a = new sd(400, 80, 3814224, 2367280);
    a.material.transparent = true, a.material.opacity = 0.5, a.layers.set(2), this.scene.add(a), this.vpm = new s_(this.renderer, this.scene, document.getElementById("orbit-pad")), this.vpm.setIsoView(this.cloud.center, this.cloud.radius), this.vpm.onBeforeViewport = (l) => this.applyViewportUniforms(l), this.ui = new xx({ onRibbonHeight: (l) => {
      this.vpm.setTopOffset(l), this.ui.setActivePane(this.activePane, this.vpm[this.activePane].css);
    }, onTool: (l) => this.tools.activate(l), onErase: () => this.eraseSelection(), onUndo: () => this.undo(), onRedo: () => this.redo(), onToggleSnap: () => this.setSnap(!this.snapOn), onToggleOrtho: () => this.setOrtho(!this.orthoOn), onToggleSectionMode: () => {
      this.sectionMode = this.sectionMode === "cross" ? "long" : "cross", this.syncSectionUI(), this.applySectionView(), this.ui.setHint(this.sectionMode === "cross" ? "\u041E\u043A\u043D\u043E 2: \u041F\u041E\u041F\u0415\u0420\u0415\u0427\u041D\u0418\u041A \u2014 \u0440\u0435\u0437 \u043F\u043E\u043F\u0435\u0440\u0451\u043A \u043E\u0441\u0438 \u0432 \u0442\u043E\u0447\u043A\u0435 \u043A\u0443\u0440\u0441\u043E\u0440\u0430: \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0434\u043E\u0440\u043E\u0433\u0438, \u043A\u044E\u0432\u0435\u0442\u044B, \u043E\u0442\u043A\u043E\u0441\u044B" : "\u041E\u043A\u043D\u043E 2: \u041F\u0420\u041E\u0414\u041E\u041B\u042C\u041D\u0418\u041A \u2014 \u0440\u0435\u0437 \u0432\u0434\u043E\u043B\u044C \u043E\u0441\u0438: \u0445\u043E\u0434 \u0437\u0435\u043C\u043B\u0438 \u043F\u043E \u0442\u0440\u0430\u0441\u0441\u0435, \u043D\u0430\u0441\u044B\u043F\u0438 \u0438 \u0432\u044B\u0435\u043C\u043A\u0438");
    }, onSectionThick: (l) => {
      this.section.thick = l, this.ui.setSectionThick(l);
    }, onSectionSpan: (l) => {
      this.section.span = l, this.ui.setSectionSpan(l), this.applySectionView();
    }, onSectionExag: (l) => {
      this.section.exag = l, this.vpm.setExaggeration(this.vpm.section, l), this.ui.setSectionExag(l);
    }, onCursorArea: (l) => {
      this.cloudUniforms.uCurHalf.value = l / 2;
    }, onToggleSlice: () => {
      this.sliceOn = !this.sliceOn, this.ui.setSlice(this.sliceOn, this.sliceZ, this.sliceThick);
    }, onSliceZ: (l) => {
      this.sliceZ = l, this.sliceOn = true, this.ui.setSlice(true, l, this.sliceThick);
    }, onSliceThick: (l) => {
      this.sliceThick = l, this.ui.setSlice(this.sliceOn, this.sliceZ, l);
    }, onUcsSelect: (l) => this.onUcsSelect(l), onToggleLayer: (l) => this.toggleEntityLayer(l), onOpenCloudPanel: (l) => this.ui.openCloudPanel(l, this.cloudSettings[l]), onCloudSetting: (l, c, h) => {
      this.cloudSettings[l][c] = h;
    }, onToggleCloud: (l) => {
      const c = this.vpm[l].camera;
      c.layers.toggle(4), this.ui.setCloudVisible(l, c.layers.isEnabled(4));
    }, onImportFile: (l) => void this.importCloud(l), onExportDxf: () => this.exportDxf(), onToCad: () => void this.toCad(), onRenameUcs: () => this.renameUcs(), onDemoStart: () => this.requestDemo(), onLayerAdd: () => {
      const l = this.layers.add();
      this.layers.current = l.name, this.layersChanged();
    }, onLayerDelete: (l) => {
      this.layers.remove(l) && (this.store.reassignLayer(l, "0"), this.layersChanged());
    }, onLayerRename: (l) => {
      const c = window.prompt("\u0418\u043C\u044F \u0441\u043B\u043E\u044F:", l);
      if (!c || !c.trim() || c.trim() === l) return;
      const h = c.trim();
      if (!this.layers.rename(l, h)) {
        this.ui.setHint("\u0421\u043B\u043E\u0439 \u043D\u0435 \u043F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D: \u0438\u043C\u044F \u0437\u0430\u043D\u044F\u0442\u043E \u0438\u043B\u0438 \u044D\u0442\u043E \u0441\u043B\u043E\u0439 \xAB0\xBB");
        return;
      }
      this.store.renameLayerRefs(l, h), this.layersChanged();
    }, onLayerCurrent: (l) => {
      this.layers.current = l, this.layersChanged();
    }, onLayerColor: (l, c) => {
      this.layers.get(l).color = c, this.layersChanged();
    }, onLayerType: (l, c) => {
      this.layers.get(l).linetype = c, this.layersChanged();
    }, onLayerWeight: (l, c) => {
      this.layers.get(l).weight = c, this.layersChanged();
    }, onLayerToggleVisible: (l) => {
      const c = this.layers.get(l);
      c.visible = !c.visible, this.layersChanged();
    }, onAssignToLayer: () => this.assignSelectionTo(this.layers.current), onLayerCombo: (l) => {
      l && (this.store.selection.size ? this.assignSelectionTo(l) : (this.layers.current = l, this.layersChanged()));
    }, onToggleWeightDisplay: () => {
      this.layers.showWeight = !this.layers.showWeight, this.layersChanged();
    } }), this.tools = new Na(this), this.bindInput(t), this.ui.setSnap(this.snapOn), this.ui.setOrtho(false), this.syncSectionUI(), this.ui.setSlice(false, 0, this.sliceThick), this.store.onChange = () => this.queueLayerUI(), this.layersChanged(), window.addEventListener("resize", () => this.ui.setActivePane(this.activePane, this.vpm[this.activePane].css)), this.setActivePane("main"), this.loadUcsList(), this.refreshUcsUI(), this.rebuildUcsLabels(), this.enterTopView(), this.tools.activate("isolate"), this.ui.showStart(true), this.ensureWorker(), this.restoreSessionFromServer(), window.setInterval(() => this.flushDirtySave(), 8e3), window.addEventListener("beforeunload", () => this.flushDirtySave(true)), document.addEventListener("visibilitychange", () => {
      document.visibilityState === "hidden" && this.flushDirtySave(true);
    });
  }
  start() {
    this.renderer.setAnimationLoop(() => this.loop());
  }
  get section() {
    return this.sections[this.sectionMode];
  }
  loop() {
    this.ucs.defined && this.activeUcs >= 0 && (this.sectionFollow && (this.ucs.localToWorld(this.sectionAnchor, vr), this.sectionEye(Vi).multiplyScalar(600).add(vr), Hn.subVectors(Vi, this.vpm.section.camera.position), Hn.lengthSq() > 1e-6 && this.vpm.section.camera.position.addScaledVector(Hn, 0.2)), this.isoFollow && (this.ucs.localToWorld(this.isoAnchor, vr), Hn.subVectors(vr, this.vpm.orbit.target), Hn.lengthSq() > 1e-6 && (Hn.multiplyScalar(0.12), this.vpm.orbit.target.add(Hn), this.vpm.iso.camera.position.add(Hn))));
    const t = this.tools.active !== null && this.tools.active.id !== "select";
    this.vpm.orbit.mouseButtons.LEFT = t ? null : wn.ROTATE, this.vpm.update(), this.framePts = 0, this.vpm.render(), this.framePtsShown = this.framePts, this.tickFps();
  }
  applyViewportUniforms(t) {
    this.tools.applyViewportScale(t), this.layers.setResolution(t.gl.w, t.gl.h), Qc.resolution.set(t.gl.w, t.gl.h);
    const e = this.cloudUniforms, n = this.cloudSettings[t.name];
    e.uIsPersp.value = t.name === "iso" ? 1 : 0, e.uSize.value = n.size, e.uOpacity.value = n.opacity, e.uMode.value = n.mode, e.uDensity.value = n.density;
    const i = this.ucs.defined && this.activeUcs >= 0;
    if (e.uSliceClip.value = t.name === "main" && this.sliceOn && i ? 1 : 0, e.uSliceMin.value = this.sliceZ - this.sliceThick / 2, e.uSliceMax.value = this.sliceZ + this.sliceThick / 2, e.uSectionEnabled.value = t.name === "section" && i ? 1 : 0, e.uSectionEnabled.value === 1) {
      const r = this.sectionAnchor.x, o = this.sectionAnchor.y, a = this.section.thick / 2, l = this.section.span / 2;
      this.sectionMode === "cross" ? (e.uBoxMin.value.set(r - a, o - l, -1e6), e.uBoxMax.value.set(r + a, o + l, 1e6)) : (e.uBoxMin.value.set(r - l, o - a, -1e6), e.uBoxMax.value.set(r + l, o + a, 1e6));
    }
    e.uCurClip.value = t.name === "iso" && i ? 1 : 0, e.uCurPos.value.copy(this.isoAnchor), this.applyTileRange(t);
  }
  applyTileRange(t) {
    const e = this.cloudPoints.geometry;
    if (!this.tileStart || !this.ucs.defined || this.activeUcs < 0) {
      e.setDrawRange(0, this.renderCount), this.framePts += this.renderCount;
      return;
    }
    if (t.name === "section") {
      const n = this.sectionAnchor.x, i = (this.sectionMode === "cross" ? this.section.thick : this.section.span) / 2;
      this.rangeForX(n - i, n + i);
    } else if (t.name === "iso") {
      const n = this.cloudUniforms.uCurHalf.value;
      this.rangeForX(this.isoAnchor.x - n, this.isoAnchor.x + n);
    } else {
      this.ucs.worldToLocal(t.camera.position, fe);
      const n = t.frustumHeight * (t.css.w / Math.max(1, t.css.h)) / 2;
      this.rangeForX(fe.x - n, fe.x + n);
    }
    e.setDrawRange(ri.start, ri.count), this.framePts += ri.count;
  }
  tickFps() {
    this.frames++;
    const t = performance.now();
    t - this.fpsT >= 500 && (this.ui.setFps(Math.round(this.frames * 1e3 / (t - this.fpsT)), this.framePtsShown), this.frames = 0, this.fpsT = t);
  }
  snapshot() {
    this.undoStack.push(this.store.serialize()), this.undoStack.length > yx && this.undoStack.shift(), this.redoStack.length = 0, this.markDirty();
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
    const e = Math.min(t.length, eh), n = new Float32Array(e), i = new Float32Array(e);
    let r = 1 / 0, o = -1 / 0, a = 1 / 0, l = -1 / 0;
    for (let g = 0; g < e; g++) {
      const _ = t[g];
      n[g] = _.x, i[g] = _.z, _.x < r && (r = _.x), _.x > o && (o = _.x), _.z < a && (a = _.z), _.z > l && (l = _.z);
    }
    const c = this.cloud.positions, h = this.cloud.count, u = new Uint8Array(h);
    let d = 0;
    for (let g = 0; g < h; g++) {
      const _ = c[g * 3], m = c[g * 3 + 2];
      _ < r || _ > o || m < a || m > l || w_(_, m, n, i, e) && (u[g] = 1, d++);
    }
    const p = new Uint32Array(d);
    for (let g = 0, _ = 0; g < h; g++) u[g] && (p[_++] = g);
    this.isolated = p, this.buildCompact(), this.ui.setHint(`\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u043E ${d.toLocaleString("ru-RU")} \u0442\u043E\u0447\u0435\u043A \u2014 \u0428\u0410\u0413 2/3: \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u043E\u0441\u044C \u0434\u0432\u0443\u043C\u044F \u043A\u043B\u0438\u043A\u0430\u043C\u0438 (\u0432\u0434\u043E\u043B\u044C \u0442\u0440\u0430\u0441\u0441\u044B \u0438\u043B\u0438 \u0440\u0430\u0437\u0431\u0438\u0432\u043A\u0438)`);
  }
  clearLasso() {
    this.isolated = null, this.useCompact(false), this.compactGeo && (this.compactGeo.dispose(), this.compactGeo = null);
  }
  buildCompact() {
    if (this.compactGeo && this.compactGeo.dispose(), this.compactGeo = null, this.tileStart = null, !this.isolated || !this.isolated.length) return;
    const t = this.isolated.length, e = this.cloud.positions, n = this.cloud.geometry.getAttribute("aColor").array, i = this.ucs.defined, r = new Float32Array(t);
    let o = null, a = 0, l = 1, c = 1 / 0, h = -1 / 0;
    if (i) {
      const w = this.ucs.inverse.elements;
      o = new Float32Array(t * 3), a = 1 / 0, l = -1 / 0;
      for (let C = 0; C < t; C++) {
        const N = this.isolated[C] * 3, M = e[N], y = e[N + 1], P = e[N + 2], V = w[0] * M + w[4] * y + w[8] * P + w[12], z = w[2] * M + w[6] * y + w[10] * P + w[14];
        o[C * 3] = V, o[C * 3 + 1] = w[1] * M + w[5] * y + w[9] * P + w[13], o[C * 3 + 2] = z, r[C] = V, V < a && (a = V), V > l && (l = V), z < c && (c = z), z > h && (h = z);
      }
      this.zMin = c, this.zMax = h, this.sliceZ = es.clamp(this.sliceZ, c, h), this.ui.setSliceRange(c, h), this.ui.setSlice(this.sliceOn, this.sliceZ, this.sliceThick);
    }
    const u = Math.max(1e-6, l - a), d = i ? Math.max(1, Math.min(4096, Math.ceil(u / Mx))) : 1, p = d / (u * (1 + 1e-6)), g = new Int32Array(d + 1), _ = new Int32Array(t);
    for (let w = 0; w < t; w++) {
      const C = Math.min(d - 1, Math.max(0, Math.floor((r[w] - a) * p)));
      _[w] = C, g[C + 1]++;
    }
    for (let w = 0; w < d; w++) g[w + 1] += g[w];
    const m = new Float32Array(t * 3), f = new Float32Array(t * 3), A = new Float32Array(t), T = o ? new Float32Array(t * 3) : null, S = Int32Array.from(g.subarray(0, d));
    for (let w = 0; w < t; w++) {
      const C = S[_[w]]++, N = this.isolated[w] * 3;
      o && T && (T[C * 3] = o[w * 3], T[C * 3 + 1] = o[w * 3 + 1], T[C * 3 + 2] = o[w * 3 + 2]), m[C * 3] = e[N], m[C * 3 + 1] = e[N + 1], m[C * 3 + 2] = e[N + 2], f[C * 3] = n[N], f[C * 3 + 1] = n[N + 1], f[C * 3 + 2] = n[N + 2], A[C] = w / t;
    }
    const I = new me();
    I.setAttribute("position", new oe(m, 3)), I.setAttribute("aColor", new oe(f, 3)), I.setAttribute("aKey", new oe(A, 1)), I.boundingSphere = new qn(this.cloud.center.clone(), this.cloud.radius), this.compactGeo = I, this.tileStart = i ? g : null, this.tileMinX = a, this.tileInv = p, this.tileCount = d, T && this.snap.buildLocal(T, t), this.useCompact(true);
  }
  rangeForX(t, e) {
    const n = this.tileStart;
    if (!n) {
      ri.start = 0, ri.count = this.renderCount;
      return;
    }
    const i = Math.min(this.tileCount - 1, Math.max(0, Math.floor((t - this.tileMinX) * this.tileInv))), r = Math.min(this.tileCount - 1, Math.max(0, Math.floor((e - this.tileMinX) * this.tileInv)));
    ri.start = n[i], ri.count = Math.max(0, n[r + 1] - n[i]);
  }
  attachKeys(t, e) {
    const n = new Float32Array(e);
    for (let i = 0; i < e; i++) n[i] = i / e;
    t.setAttribute("aKey", new oe(n, 1));
  }
  useCompact(t) {
    t && this.compactGeo ? (this.cloudPoints.geometry = this.compactGeo, this.renderCount = this.isolated ? this.isolated.length : this.cloud.count) : (this.cloudPoints.geometry = this.cloud.geometry, this.renderCount = this.cloud.count);
  }
  pickCloudPoint(t, e) {
    const n = this.cloud.positions;
    let i = 1, r = -1;
    if (this.isolated) for (let o = 0; o < this.isolated.length; o++) {
      const a = this.isolated[o];
      fe.fromArray(n, a * 3);
      const l = t.distanceSqToPoint(fe);
      l < i && (i = l, r = a);
    }
    else for (let o = 0; o < this.cloud.count; o += 3) {
      fe.fromArray(n, o * 3);
      const a = t.distanceSqToPoint(fe);
      a < i && (i = a, r = o);
    }
    return r < 0 ? false : (e.fromArray(n, r * 3), true);
  }
  defineUcs(t, e) {
    const n = this.ucs.defined && this.store.entities.length > 0;
    n && yr.copy(this.ucs.matrix), this.ucs.setFromPoints(t, e), n && this.store.rebase(yr, this.ucs.inverse), this.ucsList.push({ name: `\u041E\u0441\u044C ${this.ucsList.length + 1}`, matrix: this.ucs.matrix.clone() }), this.activeUcs = this.ucsList.length - 1, this.afterUcsChange(), this.markDirty();
  }
  onUcsSelect(t) {
    t === 0 ? this.enterWorldMode() : this.activateUcs(t - 1);
  }
  activateUcs(t) {
    if (t === this.activeUcs || t < 0 || t >= this.ucsList.length) return;
    const e = this.ucs.defined && this.store.entities.length > 0;
    e && yr.copy(this.ucs.matrix), this.ucs.setFromMatrix(this.ucsList[t].matrix), e && this.store.rebase(yr, this.ucs.inverse), this.activeUcs = t, this.afterUcsChange(), this.markDirty();
  }
  enterWorldMode() {
    this.activeUcs = -1, this.ucs.plane.normal.set(0, 1, 0), this.ucs.plane.constant = 0, this.useCompact(false), this.ucsLabels.visible = true, this.ui.showSectionPanels(false), this.refreshUcsUI(), this.enterTopView(), this.vpm.setIsoView(this.cloud.center, this.cloud.radius), this.tools.activate("select"), this.ui.setHint("\u041C\u0421\u041A \u2014 \u043E\u0431\u0437\u043E\u0440 \u0432\u0441\u0435\u0433\u043E \u043E\u0431\u043B\u0430\u043A\u0430. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0441\u044C \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430, \u0447\u0442\u043E\u0431\u044B \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u044E"), this.markDirty();
  }
  afterUcsChange() {
    this.cloudUniforms.uUcsInv.value.copy(this.ucs.inverse), this.buildCompact(), this.ucsLabels.visible = false, this.refreshUcsUI(), this.rebuildUcsLabels(), this.ui.showSectionPanels(true), this.deviationRef = 0, this.enterDraftView(true);
  }
  refreshUcsUI() {
    this.ui.setUcsList(["\u041C\u0421\u041A", ...this.ucsList.map((t) => t.name)], this.activeUcs + 1);
  }
  renameUcs() {
    if (this.activeUcs < 0) return;
    const t = this.ucsList[this.activeUcs], e = window.prompt("\u0418\u043C\u044F \u043E\u0441\u0438 (\u041F\u0421\u041A):", t.name);
    e && e.trim() && (t.name = e.trim(), this.refreshUcsUI(), this.rebuildUcsLabels(), this.markDirty());
  }
  async importCloud(t) {
    this.ui.setProgress("\u0427\u0442\u0435\u043D\u0438\u0435 \u0444\u0430\u0439\u043B\u0430\u2026 0%"), this.cloudName = t.name, this.ensureWorker(), this.workerReady ? this.importWorker.postMessage({ name: t.name, file: t }) : this.pendingJob = { name: t.name, file: t };
  }
  requestDemo() {
    this.ui.setProgress("\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0434\u0435\u043C\u043E-\u0440\u0435\u043B\u044C\u0435\u0444\u0430\u2026"), this.ensureWorker(), this.workerReady ? this.importWorker.postMessage({ demo: true }) : this.pendingDemo = true;
  }
  ensureWorker() {
    this.importWorker || (this.importWorker = new Worker(new URL("" + new URL("cloud.worker-CzVGLLqt.js", import.meta.url).href, import.meta.url), { type: "module" }), this.importWorker.onmessage = (t) => this.onWorkerMessage(t.data), this.importWorker.onerror = (t) => {
      this.ui.setProgress(null), this.ui.setHint(`\u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043C\u043F\u043E\u0440\u0442\u0430: ${t.message || "\u0441\u0431\u043E\u0439 \u043F\u0430\u0440\u0441\u0435\u0440\u0430 (\u0441\u043C. \u043A\u043E\u043D\u0441\u043E\u043B\u044C)"}`);
    });
  }
  onWorkerMessage(t) {
    t.type === "ready" ? (this.workerReady = true, this.pendingJob ? (this.importWorker.postMessage(this.pendingJob), this.pendingJob = null) : this.pendingDemo && (this.pendingDemo = false, this.importWorker.postMessage({ demo: true }))) : t.type === "progress" ? this.ui.setProgress(t.phase ?? `\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026 ${Math.round((t.p ?? 0) * 100)}%`) : t.type === "error" ? (this.ui.setProgress(null), this.ui.setHint(`\u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043C\u043F\u043E\u0440\u0442\u0430: ${t.message}`)) : t.type === "done" && t.positions && t.colors && (this.ui.setProgress(null), this.ui.showStart(false), this.cloudOrigin = t.origin ?? null, this.applyCloud(t.positions, t.colors, t.count ?? t.positions.length / 3));
  }
  applyCloud(t, e, n) {
    const i = new me();
    i.setAttribute("position", new oe(t, 3)), i.setAttribute("aColor", new oe(e, 3)), this.attachKeys(i, n), i.computeBoundingSphere(), this.cloudPoints.geometry.dispose(), this.cloudPoints.geometry = i, this.cloud.geometry = i, this.cloud.positions = t, this.cloud.count = n, this.renderCount = n, this.store.clearSelection();
    for (const l of [...this.store.entities]) this.store.remove(l);
    this.undoStack.length = 0, this.redoStack.length = 0, this.ucsList.length = 0, this.activeUcs = -1, this.ucs.reset(), this.cloudUniforms.uUcsInv.value.identity(), this.refreshUcsUI(), this.rebuildUcsLabels(), this.ui.showSectionPanels(false), this.markDirty();
    const r = i.boundingSphere;
    this.cloud.center.copy(r.center), this.cloud.radius = r.radius;
    let o = 1 / 0, a = -1 / 0;
    for (let l = 1; l < t.length; l += 3) t[l] < o && (o = t[l]), t[l] > a && (a = t[l]);
    this.cloudUniforms.uMinY.value = o, this.cloudUniforms.uYRangeInv.value = 1 / Math.max(1e-3, a - o), this.zMin = o, this.zMax = a, this.clearLasso(), this.snap.clear(), this.sliceOn = false, this.sliceZ = (o + a) / 2, this.ui.setSliceRange(o, a), this.ui.setSlice(false, this.sliceZ, this.sliceThick), this.cloudUniforms.uCurHalf.value = Math.max(10, this.cloud.radius * 0.15), this.ui.setCursorArea(this.cloudUniforms.uCurHalf.value * 2), this.vpm.setIsoView(this.cloud.center, this.cloud.radius), this.enterTopView(), this.tools.activate("isolate"), this.ui.setHint(`\u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043E ${n.toLocaleString("ru-RU")} \u0442\u043E\u0447\u0435\u043A \u2014 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u043A\u043E\u043D\u0442\u0443\u0440\u043E\u043C`);
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
      const i = n.makeCopy(vx);
      for (const r of i.points) this.ucs.localToWorld(r, fe), this.worldToSource(fe, r);
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
    ax("topo.dxf", rx(e, this.layers.layers));
    for (const n of e) t.includes(n) || n.dispose();
    this.ui.setHint(`DXF \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D: ${t.length} \u043E\u0431., \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B ${this.exportInWorld ? "\u041C\u0421\u041A \u043E\u0431\u043B\u0430\u043A\u0430" : "\u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0439 \u041F\u0421\u041A (\u043E\u0441\u044C)"}`);
  }
  async toCad() {
    const t = this.exportList();
    if (!t.length) {
      this.ui.setHint("\u041D\u0435\u0447\u0435\u0433\u043E \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C \u2014 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0438\u043B\u0438 \u043D\u0430\u0447\u0435\u0440\u0442\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B");
      return;
    }
    const e = this.exportGeometry(t), n = ox(e);
    for (const i of e) t.includes(i) || i.dispose();
    try {
      if ((await fetch("/api/tocad", { method: "POST", body: n })).ok) {
        this.ui.setHint(`\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0432 AutoCAD: ${t.length} \u043E\u0431. \u0432 ${this.exportInWorld ? "\u041C\u0421\u041A \u043E\u0431\u043B\u0430\u043A\u0430" : "\u041F\u0421\u041A \u043E\u0441\u0438"}`);
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
      i.font = n, e.width = Math.ceil(i.measureText(t.name).width) + 24, e.height = 64, i = e.getContext("2d"), i.font = n, i.fillStyle = "rgba(22, 21, 28, 0.8)", i.fillRect(0, 0, e.width, e.height), i.fillStyle = "#f472b6", i.textBaseline = "middle", i.fillText(t.name, 12, 34);
      const r = new Da(e);
      r.colorSpace = Le;
      const o = new Yu(new kc({ map: r, transparent: true, depthTest: false })), a = 4;
      o.scale.set(a * e.width / e.height, a, 1), o.position.setFromMatrixPosition(t.matrix), o.position.y += 6, o.renderOrder = 5, this.ucsLabels.add(o);
    }
  }
  loadUcsList() {
    this.ucsLabels.visible = false;
    try {
      localStorage.removeItem("topocad.ucs"), localStorage.removeItem("topocad.layers");
      for (let t = localStorage.length - 1; t >= 0; t--) {
        const e = localStorage.key(t);
        e && e.startsWith("topocad.ucs:") && localStorage.removeItem(e);
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
      for (const n of e.list) !n.name || !Array.isArray(n.matrix) || n.matrix.length !== 16 || this.ucsList.push({ name: n.name, matrix: new Kt().fromArray(n.matrix) });
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
    return !this.ucs.defined || this.activeUcs < 0 ? (this.ui.setHint("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u043E\u0441\u044C \u2014 \u043E\u0442\u043C\u0435\u0442\u043A\u0438 \u0441\u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u0432 \u0435\u0451 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442"), false) : this.pickCloudPoint(t, fe) ? (this.ucs.worldToLocal(fe, Vi), this.deviationRef = Vi.z, this.ui.setHint(`\u0413\u043E\u0440\u0438\u0437\u043E\u043D\u0442 \u0437\u0430\u0434\u0430\u043D \u043D\u0430 \u043E\u0442\u043C\u0435\u0442\u043A\u0435 ${Vi.z.toFixed(3)} \u043C \u2014 \u043A\u043B\u0438\u043A\u0430\u0439\u0442\u0435 \u0442\u043E\u0447\u043A\u0438, \u043F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u0438\u044F \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043F\u043E\u0434\u043F\u0438\u0441\u044F\u043C\u0438`), true) : (this.ui.setHint("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0439\u043C\u0430\u0442\u044C \u0442\u043E\u0447\u043A\u0443 \u0441\u043A\u0430\u043D\u0430 \u2014 \u0446\u0435\u043B\u044C\u0441\u044F \u0432 \u043E\u0431\u043B\u0430\u043A\u043E"), false);
  }
  get snapZMin() {
    return this.sliceOn ? this.sliceZ - this.sliceThick / 2 : -1 / 0;
  }
  get snapZMax() {
    return this.sliceOn ? this.sliceZ + this.sliceThick / 2 : 1 / 0;
  }
  enterTopView() {
    kn.copy(this.cloud.center), kn.y = 0, this.vpm.setTopView(kn, this.cloud.radius * 1.7), this.mainMode = "top", this.ui.setPaneLabel("main", "\u041F\u041B\u0410\u041D \xB7 \u041C\u0421\u041A \xB7 \u0412\u0418\u0414 \u0421\u0412\u0415\u0420\u0425\u0423");
  }
  enterDraftView(t = false) {
    if (!this.ucs.defined || this.activeUcs < 0 || this.mainMode === "draft" && !t) return;
    const e = this.snap.localBounds, n = this.vpm.main, i = n.css.w / Math.max(1, n.css.h);
    let r = 60;
    this.snap.ready && !e.isEmpty() ? (e.getCenter(fe), fe.z = 0, this.ucs.localToWorld(fe, kn), r = es.clamp(Math.max((e.max.y - e.min.y) * 1.2, (e.max.x - e.min.x) * 1.2 / i), 5, 4e3), this.cursorLocal.set((e.min.x + e.max.x) / 2, (e.min.y + e.max.y) / 2, (this.zMin + this.zMax) / 2)) : (kn.copy(this.ucs.origin), this.cursorLocal.set(0, 0, (this.zMin + this.zMax) / 2)), this.sectionAnchor.copy(this.cursorLocal), this.isoAnchor.copy(this.cursorLocal), this.vpm.setOrthoView(n, this.ucs.zAxis, this.ucs.yAxis, kn, r), this.applySectionView(), this.ucs.localToWorld(this.isoAnchor, fe), this.vpm.setIsoView(fe, Math.max(8, this.cloudUniforms.uCurHalf.value * 1.6)), this.setFollow(true), this.mainMode = "draft", this.ui.setPaneLabel("main", "\u041F\u041B\u0410\u041D \xB7 \u0427\u0415\u0420\u0427\u0415\u041D\u0418\u0415 \u041F\u041E \u041E\u0421\u0418");
  }
  sectionEye(t) {
    return this.sectionMode === "cross" ? t.copy(this.ucs.xAxis).negate() : t.copy(this.ucs.yAxis).negate();
  }
  applySectionView() {
    if (!this.ucs.defined || this.activeUcs < 0) return;
    const t = this.vpm.section, e = this.section;
    this.ucs.localToWorld(this.sectionAnchor, kn), mc.copy(this.ucs.zAxis);
    const n = e.span * 1.05 / Math.max(0.2, t.css.w / Math.max(1, t.css.h));
    this.vpm.setOrthoView(t, this.sectionEye(Vi), mc, kn, n), this.vpm.setExaggeration(t, e.exag), this.ui.setPaneLabel("section", this.sectionMode === "cross" ? "\u041F\u041E\u041F\u0415\u0420\u0415\u0427\u041D\u0418\u041A \xB7 \u0420\u0415\u0417 \u041F\u041E\u041F\u0415\u0420\u0401\u041A \u041E\u0421\u0418" : "\u041F\u0420\u041E\u0414\u041E\u041B\u042C\u041D\u0418\u041A \xB7 \u0420\u0415\u0417 \u0412\u0414\u041E\u041B\u042C \u041E\u0421\u0418");
  }
  syncSectionUI() {
    const t = this.section;
    this.ui.setSectionMode(this.sectionMode), this.ui.setSectionThick(t.thick), this.ui.setSectionSpan(t.span), this.ui.setSectionExag(t.exag), this.vpm.setExaggeration(this.vpm.section, t.exag);
  }
  setSnap(t) {
    this.snapOn = t, this.ui.setSnap(t);
  }
  setOrtho(t) {
    this.orthoOn = t, this.refreshOrthoUI();
  }
  setFollow(t) {
    this.sectionFollow = t, this.isoFollow = t, this.ui.setPaneFrozen("section", !t), this.ui.setPaneFrozen("iso", !t);
  }
  setActivePane(t) {
    this.activePane = t, t === "main" ? this.setFollow(true) : t === "section" ? (this.sectionFollow = false, this.ui.setPaneFrozen("section", true)) : (this.isoFollow = false, this.ui.setPaneFrozen("iso", true)), this.ui.setActivePane(t, this.vpm[t].css);
  }
  refreshOrthoUI() {
    this.ui.setOrtho(this.tools.orthoActive);
  }
  bindInput(t) {
    t.addEventListener("pointerdown", (n) => {
      const i = this.vpm.viewportAt(n.clientX, n.clientY);
      if (i) {
        if (this.setActivePane(i.name), n.button === 1) {
          i.camera instanceof cn && (this.panning = i, this.panX = n.clientX, this.panY = n.clientY, t.setPointerCapture(n.pointerId)), n.preventDefault();
          return;
        }
        i.name === "main" && n.button === 0 && this.tools.pointerDown(n, i);
      }
    }), t.addEventListener("pointermove", (n) => {
      if (this.panning) {
        this.vpm.pan(this.panning, n.clientX - this.panX, n.clientY - this.panY), this.panX = n.clientX, this.panY = n.clientY;
        return;
      }
      const i = this.vpm.viewportAt(n.clientX, n.clientY);
      if (!i) return;
      const r = this.tools.active !== null && this.tools.active.id !== "select";
      if (t.style.cursor = i.name === "main" && r ? "crosshair" : "default", i.name !== "main") return;
      this.tools.pointerMove(n, i);
      const o = this.tools.pointer;
      if (o.valid) {
        const a = this.groundElevation(o.local.x, o.local.y);
        this.exportInWorld ? (this.worldToSource(o.world, fe), this.ui.setCoords(fe.x, fe.y, fe.z, true)) : this.ui.setCoords(o.local.x, o.local.y, a, false), this.cursorLocal.x = o.local.x, this.cursorLocal.y = o.local.y, a !== null && (this.cursorLocal.z += (a - this.cursorLocal.z) * 0.25), this.sectionFollow && this.sectionAnchor.copy(this.cursorLocal), this.isoFollow && this.isoAnchor.copy(this.cursorLocal);
      }
      this.refreshOrthoUI();
    });
    const e = document.getElementById("orbit-pad");
    e.addEventListener("pointerdown", (n) => {
      this.setActivePane("iso"), n.button === 0 && this.tools.active && this.tools.active.id !== "select" && this.tools.pointerDown(n, this.vpm.iso);
    }), e.addEventListener("pointermove", (n) => {
      const i = this.tools.active !== null && this.tools.active.id !== "select";
      if (e.style.cursor = i ? "crosshair" : "default", !i) return;
      this.tools.pointerMove(n, this.vpm.iso);
      const r = this.tools.pointer;
      r.valid && this.ui.setCoords(r.local.x, r.local.y, null, false);
    }), e.addEventListener("contextmenu", (n) => {
      n.preventDefault(), this.tools.finish();
    }), e.addEventListener("wheel", () => {
      this.setActivePane("iso");
    }, { passive: true }), t.addEventListener("pointerup", (n) => {
      if (this.panning && n.button === 1) {
        this.panning = null, t.releasePointerCapture(n.pointerId);
        return;
      }
      const i = this.vpm.viewportAt(n.clientX, n.clientY);
      i && i.name === "main" && n.button === 0 && this.tools.pointerUp(n, i);
    }), t.addEventListener("wheel", (n) => {
      const i = this.vpm.viewportAt(n.clientX, n.clientY);
      !i || !(i.camera instanceof cn) || (n.preventDefault(), i.name !== this.activePane && this.setActivePane(i.name), this.vpm.zoomAt(i, n.clientX, n.clientY, n.deltaY > 0 ? 1.15 : 1 / 1.15));
    }, { passive: false }), t.addEventListener("contextmenu", (n) => {
      n.preventDefault(), this.tools.finish();
    }), window.addEventListener("keydown", (n) => {
      var _a2;
      const i = n.target;
      if (i && (i.tagName === "INPUT" || i.tagName === "TEXTAREA" || i.tagName === "SELECT")) return;
      const r = this.tools.numBuffer !== "" || ((_a2 = this.tools.active) == null ? void 0 : _a2.getDynamicAnchor()) != null;
      if (!n.ctrlKey && !n.metaKey && !n.altKey && (n.key === "1" || n.key === "2" || n.key === "3") && !r) {
        n.preventDefault(), this.setActivePane(n.key === "1" ? "main" : n.key === "2" ? "section" : "iso"), this.ui.setHint(n.key === "1" ? "\u0410\u043A\u0442\u0438\u0432\u0435\u043D \u041F\u041B\u0410\u041D \u2014 \u0440\u0435\u0437 \u0438 3D \u0441\u043D\u043E\u0432\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0442 \u0437\u0430 \u043A\u0443\u0440\u0441\u043E\u0440\u043E\u043C" : `\u0410\u043A\u0442\u0438\u0432\u043D\u043E \u043E\u043A\u043D\u043E ${n.key === "2" ? "\xAB\u0420\u0415\u0417\xBB" : "\xAB3D\xBB"} \u2014 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0437\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043E, \u0432\u0435\u0434\u0438\u0442\u0435 \u0435\u0433\u043E \u043C\u044B\u0448\u044C\u044E. \u041A\u043B\u0430\u0432\u0438\u0448\u0430 1 \u0432\u0435\u0440\u043D\u0451\u0442 \u0441\u043B\u0435\u0436\u0435\u043D\u0438\u0435`);
        return;
      }
      if (n.key === "F1") {
        n.preventDefault(), this.ui.toggleHelp();
        return;
      }
      if (n.key === "Escape" && this.ui.helpOpen) {
        this.ui.toggleHelp(false);
        return;
      }
      if ((n.ctrlKey || n.metaKey) && (n.key === "z" || n.key === "Z" || n.key === "\u044F" || n.key === "\u042F")) {
        n.preventDefault(), n.shiftKey ? this.redo() : this.undo();
        return;
      }
      if ((n.ctrlKey || n.metaKey) && (n.key === "y" || n.key === "Y" || n.key === "\u043D" || n.key === "\u041D")) {
        n.preventDefault(), this.redo();
        return;
      }
      if (n.key === " ") {
        n.preventDefault(), this.tools.active && this.tools.active.id === "select" ? this.tools.repeatLast() : this.tools.finish();
        return;
      }
      if (n.key === "F8") {
        n.preventDefault(), this.setOrtho(!this.orthoOn);
        return;
      }
      if (n.key === "Shift" && (this.tools.shiftHeld = true, this.refreshOrthoUI()), this.tools.handleNumKey(n)) {
        n.preventDefault();
        return;
      }
      if ((n.key === "s" || n.key === "S" || n.key === "\u044B" || n.key === "\u042B") && !n.ctrlKey && !n.metaKey) {
        this.setSnap(!this.snapOn);
        return;
      }
      this.tools.key(n) || (n.key === "Delete" || n.key === "Backspace") && this.eraseSelection();
    }), window.addEventListener("keyup", (n) => {
      n.key === "Shift" && (this.tools.shiftHeld = false, this.refreshOrthoUI());
    });
  }
  groundElevation(t, e) {
    return !this.snap.ready || !this.snap.query(t, e, 2.5, gc) ? null : gc.z;
  }
}
new Sx().start();
