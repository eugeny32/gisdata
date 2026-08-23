const backS = 1.70158;
function clamp01(value) {
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
}
function bounceOut(value) {
    if (value < 1 / 2.75) return 7.5625 * value * value;
    if (value < 2 / 2.75) {
        const next = value - 1.5 / 2.75;
        return 7.5625 * next * next + 0.75;
    }
    if (value < 2.5 / 2.75) {
        const next = value - 2.25 / 2.75;
        return 7.5625 * next * next + 0.9375;
    }
    const next = value - 2.625 / 2.75;
    return 7.5625 * next * next + 0.984375;
}
const ANIMATION_EASINGS = {
    linear: (v)=>v,
    linearIn: (v)=>v,
    linearOut: (v)=>v,
    linearInOut: (v)=>v,
    quadraticIn: (v)=>v * v,
    quadraticOut: (v)=>v * (2 - v),
    quadraticInOut: (v)=>{
        const t = 2 * v;
        return t < 1 ? 0.5 * t * t : -0.5 * ((t - 1) * (t - 3) - 1);
    },
    cubicIn: (v)=>v * v * v,
    cubicOut: (v)=>{
        const t = v - 1;
        return t * t * t + 1;
    },
    cubicInOut: (v)=>{
        const t = 2 * v;
        return t < 1 ? 0.5 * t * t * t : 0.5 * ((t - 2) * (t - 2) * (t - 2) + 2);
    },
    quarticIn: (v)=>v * v * v * v,
    quarticOut: (v)=>1 - (1 - v) ** 4,
    quarticInOut: (v)=>v < 0.5 ? 8 * v ** 4 : 1 - 8 * (1 - v) ** 4,
    quinticIn: (v)=>v ** 5,
    quinticOut: (v)=>1 + (v - 1) ** 5,
    quinticInOut: (v)=>v < 0.5 ? 16 * v ** 5 : 1 + 16 * (v - 1) ** 5,
    sineIn: (v)=>1 - Math.cos(v * Math.PI / 2),
    sineOut: (v)=>Math.sin(v * Math.PI / 2),
    sineInOut: (v)=>0.5 * (1 - Math.cos(Math.PI * v)),
    expoIn: (v)=>0 === v ? 0 : 2 ** (10 * (v - 1)),
    expoOut: (v)=>1 === v ? 1 : 1 - 2 ** (-10 * v),
    expoInOut: (v)=>{
        if (0 === v || 1 === v) return v;
        const t = 2 * v;
        return t < 1 ? 0.5 * 2 ** (10 * (t - 1)) : 0.5 * (2 - 2 ** (-10 * (t - 1)));
    },
    circIn: (v)=>1 - Math.sqrt(1 - v * v),
    circOut: (v)=>Math.sqrt(1 - (v - 1) * (v - 1)),
    circInOut: (v)=>{
        const t = 2 * v;
        return t < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t - 2) * (t - 2)) + 1);
    },
    elasticIn: (v)=>{
        if (0 === v || 1 === v) return v;
        return -(2 ** (10 * (v - 1))) * Math.sin((v - 1.1) * 5 * Math.PI);
    },
    elasticOut: (v)=>{
        if (0 === v || 1 === v) return v;
        return 2 ** (-10 * v) * Math.sin((v - 0.1) * 5 * Math.PI) + 1;
    },
    elasticInOut: (v)=>{
        if (0 === v || 1 === v) return v;
        const t = 2 * v;
        return t < 1 ? -0.5 * 2 ** (10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) : 0.5 * 2 ** (-10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) + 1;
    },
    backIn: (v)=>v * v * ((backS + 1) * v - backS),
    backOut: (v)=>{
        const t = v - 1;
        return t * t * ((backS + 1) * t + backS) + 1;
    },
    backInOut: (v)=>{
        const s = 1.525 * backS;
        const t = 2 * v;
        return t < 1 ? t * t * ((s + 1) * t - s) * 0.5 : 0.5 * ((t - 2) * (t - 2) * ((s + 1) * (t - 2) + s) + 2);
    },
    bounceIn: (v)=>1 - bounceOut(1 - v),
    bounceOut,
    bounceInOut: (v)=>v < 0.5 ? (1 - bounceOut(1 - 2 * v)) * 0.5 : 0.5 * bounceOut(2 * v - 1) + 0.5
};
function isAnimationEasing(value) {
    return 'string' == typeof value && value in ANIMATION_EASINGS;
}
function resolveAnimationEasing(easing) {
    return ANIMATION_EASINGS[easing ?? 'linear'];
}
function applyAnimationEasing(value, easing) {
    return resolveAnimationEasing(easing)(clamp01(value));
}
function generateAnimationPowEasing(power = 4) {
    const normalizedPower = Math.min(10000, Math.max(Number.EPSILON, power));
    return {
        In: (value)=>value ** normalizedPower,
        Out: (value)=>1 - (1 - value) ** normalizedPower,
        InOut: (value)=>value < 0.5 ? (2 * value) ** normalizedPower / 2 : (1 - (2 - 2 * value) ** normalizedPower) / 2 + 0.5
    };
}
export { ANIMATION_EASINGS, applyAnimationEasing, generateAnimationPowEasing, isAnimationEasing, resolveAnimationEasing };
