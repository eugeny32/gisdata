const TAU = 2 * Math.PI;
const DEFAULT_MAX_SAGITTA = 0.002;
const MIN_SEGMENTS = 32;
const MAX_SEGMENTS = 1024;
class ArcUtils {
    static getDynamicSegments(radius, worldDistancePerPixel) {
        const visualRadius = radius / worldDistancePerPixel;
        const segments = Math.floor(TAU * visualRadius / 5);
        return Math.min(MAX_SEGMENTS, Math.max(MIN_SEGMENTS, segments));
    }
    static getSweepAngle(startAngle, endAngle, clockwise = false) {
        const rawSweep = clockwise ? startAngle - endAngle : endAngle - startAngle;
        let normalizedSweep = rawSweep % TAU;
        if (normalizedSweep < 0) normalizedSweep += TAU;
        if (normalizedSweep < Number.EPSILON && Math.abs(rawSweep) > Number.EPSILON) return TAU;
        return normalizedSweep;
    }
    static getStaticSegments(radius, sweepAngle, maxSagitta = DEFAULT_MAX_SAGITTA) {
        if (!Number.isFinite(radius) || radius <= 0) return MIN_SEGMENTS;
        const normalizedSweep = ArcUtils.normalizeSweepAngle(sweepAngle);
        if (normalizedSweep <= 0) return MIN_SEGMENTS;
        const effectiveSagitta = Math.min(Math.abs(maxSagitta), radius);
        if (effectiveSagitta <= 0) return MIN_SEGMENTS;
        const cosValue = 1 - effectiveSagitta / radius;
        const maxSegmentAngle = 2 * Math.acos(Math.min(1, Math.max(-1, cosValue)));
        if (!Number.isFinite(maxSegmentAngle) || maxSegmentAngle <= 0) return MAX_SEGMENTS;
        const segments = Math.ceil(normalizedSweep / maxSegmentAngle);
        return Math.min(MAX_SEGMENTS, Math.max(MIN_SEGMENTS, segments));
    }
    static normalizeSweepAngle(sweepAngle) {
        if (!Number.isFinite(sweepAngle)) return 0;
        const normalizedSweep = Math.abs(sweepAngle) % TAU;
        if (normalizedSweep < Number.EPSILON && Math.abs(sweepAngle) > Number.EPSILON) return TAU;
        return normalizedSweep;
    }
}
export { ArcUtils };
