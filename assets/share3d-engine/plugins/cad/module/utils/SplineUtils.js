class SplineUtils {
    static getSampleCount(basePointCount, options) {
        const multiplier = options?.multiplier ?? 20;
        const min = options?.min ?? 50;
        const max = options?.max ?? 1000;
        return Math.max(min, Math.min(max, basePointCount * multiplier));
    }
    static fitPointsToSpline(fitPoints, degree = 3, startTangent, endTangent, isClosed = false) {
        const n = fitPoints.length;
        if (n < 2) throw new Error('至少需要2个拟合点');
        degree = 3;
        if (2 === n) return {
            controlPoints: [
                ...fitPoints
            ],
            knots: [
                0,
                0,
                1,
                1
            ],
            degree: 1
        };
        const controlPoints = SplineUtils.catmullRomToControlPoints(fitPoints, startTangent, endTangent, isClosed);
        const knots = SplineUtils.generateKnots(controlPoints.length, degree, isClosed);
        return {
            controlPoints,
            knots,
            degree
        };
    }
    static catmullRomToControlPoints(fitPoints, startTangent, endTangent, isClosed = false) {
        const n = fitPoints.length;
        const controlPoints = [];
        const tangents = [];
        for(let i = 0; i < n; i++){
            let tangent;
            tangent = 0 === i ? startTangent ? startTangent : isClosed ? {
                x: (fitPoints[1].x - fitPoints[n - 1].x) * 0.5,
                y: (fitPoints[1].y - fitPoints[n - 1].y) * 0.5
            } : {
                x: fitPoints[1].x - fitPoints[0].x,
                y: fitPoints[1].y - fitPoints[0].y
            } : i === n - 1 ? endTangent ? endTangent : isClosed ? {
                x: (fitPoints[0].x - fitPoints[n - 2].x) * 0.5,
                y: (fitPoints[0].y - fitPoints[n - 2].y) * 0.5
            } : {
                x: fitPoints[n - 1].x - fitPoints[n - 2].x,
                y: fitPoints[n - 1].y - fitPoints[n - 2].y
            } : {
                x: (fitPoints[i + 1].x - fitPoints[i - 1].x) * 0.5,
                y: (fitPoints[i + 1].y - fitPoints[i - 1].y) * 0.5
            };
            tangents.push(tangent);
        }
        controlPoints.push({
            ...fitPoints[0]
        });
        for(let i = 0; i < n - 1; i++){
            const p0 = fitPoints[i];
            const p1 = fitPoints[i + 1];
            const t0 = tangents[i];
            const t1 = tangents[i + 1];
            const c1 = {
                x: p0.x + t0.x / 3,
                y: p0.y + t0.y / 3
            };
            const c2 = {
                x: p1.x - t1.x / 3,
                y: p1.y - t1.y / 3
            };
            if (0 === i || !SplineUtils.pointsEqual(controlPoints[controlPoints.length - 1], c1)) controlPoints.push(c1);
            controlPoints.push(c2);
            if (i < n - 2) controlPoints.push({
                ...p1
            });
        }
        controlPoints.push({
            ...fitPoints[n - 1]
        });
        return controlPoints;
    }
    static pointsEqual(p1, p2, epsilon = 1e-10) {
        return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
    }
    static generateKnots(numControlPoints, degree, isClosed = false) {
        const knots = [];
        const n = numControlPoints - 1;
        const m = n + degree + 1;
        if (isClosed) for(let i = 0; i <= m; i++)knots.push(i / (m - degree));
        else {
            for(let i = 0; i <= degree; i++)knots.push(0);
            const interior = n - degree + 1;
            for(let i = 1; i < interior; i++)knots.push(i / interior);
            for(let i = 0; i <= degree; i++)knots.push(1);
        }
        return knots;
    }
    static approximateFitPoints(controlPoints, knots, degree, numSamples = 20) {
        const fitPoints = [];
        for(let i = 0; i <= numSamples; i++){
            const u = i / numSamples;
            const point = SplineUtils.evaluateBSpline(u, controlPoints, knots, degree);
            fitPoints.push(point);
        }
        return fitPoints;
    }
    static evaluateBSpline(u, controlPoints, knots, degree) {
        const n = controlPoints.length;
        let x = 0;
        let y = 0;
        for(let i = 0; i < n; i++){
            const basis = SplineUtils.basisFunction(i, degree, u, knots);
            x += basis * controlPoints[i].x;
            y += basis * controlPoints[i].y;
        }
        return {
            x,
            y
        };
    }
    static basisFunction(i, p, u, knots) {
        if (0 === p) return u >= knots[i] && u < knots[i + 1] ? 1 : 0;
        const left = knots[i + p] - knots[i];
        const right = knots[i + p + 1] - knots[i + 1];
        let result = 0;
        if (left > 0) result += (u - knots[i]) / left * SplineUtils.basisFunction(i, p - 1, u, knots);
        if (right > 0) result += (knots[i + p + 1] - u) / right * SplineUtils.basisFunction(i + 1, p - 1, u, knots);
        return result;
    }
}
export { SplineUtils };
