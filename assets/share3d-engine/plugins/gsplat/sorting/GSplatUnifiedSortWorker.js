function UnifiedSortWorker() {
    const centersMap = new Map();
    const boundsMap = new Map();
    const SORT_BOUNDS_STRIDE = 4;
    const SORT_BOUND_HAS_RADIUS = 1;
    const SORT_BOUND_HAS_OPACITY = 2;
    const SORT_BOUND_HAS_COVARIANCE = 4;
    const SORT_OPACITY_CLIP = 1 / 255;
    const SORT_OPACITY_CLIP_EPSILON = 1e-7;
    const SORT_COVARIANCE_RADIUS_SIGMA = 2;
    let centersData = null;
    let distances = null;
    let indexMap = null;
    let countBuffer = null;
    function getErrorMessage(error) {
        return error instanceof Error ? error.message : String(error);
    }
    const __LOG_NS = 'gsplat:sort';
    function __emitLog(level, message) {
        const now = 'undefined' != typeof self && self.performance && 'function' == typeof self.performance.now ? self.performance.now() : 0;
        self.postMessage({
            __log__: {
                level,
                namespace: __LOG_NS,
                message,
                timestamp: now
            }
        });
    }
    function postEmptySortResult(msgData, version, failed = false) {
        const totalActiveSplats = centersData?.totalActiveSplats ?? 0;
        const response = {
            order: msgData.order,
            count: 0,
            version,
            sortGeneration: msgData.sortGeneration,
            totalActiveSplats,
            culledSplats: totalActiveSplats,
            timeMs: 0,
            failed
        };
        self.postMessage(response, [
            msgData.order
        ]);
    }
    let _radialSort = false;
    const NUM_BINS = 32;
    const binBase = new Array(NUM_BINS + 1).fill(0);
    const binDivider = new Array(NUM_BINS + 1).fill(0);
    const weightTiers = [
        {
            maxDistance: 0,
            weight: 40.0
        },
        {
            maxDistance: 2,
            weight: 20.0
        },
        {
            maxDistance: 5,
            weight: 8.0
        },
        {
            maxDistance: 10,
            weight: 3.0
        },
        {
            maxDistance: 1 / 0,
            weight: 1.0
        }
    ];
    const weightByDistance = new Array(NUM_BINS);
    for(let dist = 0; dist < NUM_BINS; dist++){
        let weight = 1.0;
        for(let j = 0; j < weightTiers.length; j++)if (dist <= weightTiers[j].maxDistance) {
            weight = weightTiers[j].weight;
            break;
        }
        weightByDistance[dist] = weight;
    }
    function shouldKeepForVisibilityCompact(params, x, y, z, compact, bounds, boundsIndex) {
        if (!compact?.enabled) return true;
        const alphaUpper = getOpacityUpperBound(bounds, boundsIndex);
        if (null !== alphaUpper && alphaUpper <= SORT_OPACITY_CLIP + SORT_OPACITY_CLIP_EPSILON) return false;
        const localRadius = getLocalRadiusUpperBound(bounds, boundsIndex);
        const cx = params.transformedPosition.x;
        const cy = params.transformedPosition.y;
        const cz = params.transformedPosition.z;
        const dx = params.transformedDirection.x;
        const dy = params.transformedDirection.y;
        const dz = params.transformedDirection.z;
        const signedDepth = ((x - cx) * dx + (y - cy) * dy + (z - cz) * dz) * params.scale;
        const behindMargin = Number.isFinite(compact.behindMargin) ? Math.max(0, compact.behindMargin) : 0;
        const worldRadius = null !== localRadius && Number.isFinite(params.scale) ? localRadius * Math.abs(params.scale) : 0;
        if (signedDepth > behindMargin + worldRadius) return false;
        if (true !== compact.screenCompact) return true;
        const m = params.modelViewProjection;
        if (!m || m.length < 16) return true;
        if (null === localRadius) return true;
        const clipX = m[0] * x + m[4] * y + m[8] * z + m[12];
        const clipY = m[1] * x + m[5] * y + m[9] * z + m[13];
        const clipW = m[3] * x + m[7] * y + m[11] * z + m[15];
        if (!Number.isFinite(clipX) || !Number.isFinite(clipY) || !Number.isFinite(clipW) || clipW <= 1e-6) return true;
        const screenMargin = Number.isFinite(compact.screenMargin) ? Math.max(0, compact.screenMargin ?? 1) : 1;
        const ndcX = clipX / clipW;
        const ndcY = clipY / clipW;
        const projectedRadius = projectLocalRadiusToNdc(m, clipW, ndcX, ndcY, localRadius);
        if (!projectedRadius) return true;
        const ndcLimitX = 1 + screenMargin + projectedRadius.x;
        const ndcLimitY = 1 + screenMargin + projectedRadius.y;
        return Math.abs(ndcX) <= ndcLimitX && Math.abs(ndcY) <= ndcLimitY;
    }
    function getLocalRadiusUpperBound(bounds, index) {
        if (!bounds || void 0 === index) return null;
        const base = index * SORT_BOUNDS_STRIDE;
        if (base + SORT_BOUNDS_STRIDE > bounds.length) return null;
        const flags = bounds[base + 3] || 0;
        const radius = bounds[base];
        if ((flags & SORT_BOUND_HAS_RADIUS) !== 0 && Number.isFinite(radius) && radius > 0) return radius;
        const covarianceUpper = bounds[base + 2];
        if ((flags & SORT_BOUND_HAS_COVARIANCE) !== 0 && Number.isFinite(covarianceUpper) && covarianceUpper > 0) return Math.sqrt(covarianceUpper) * SORT_COVARIANCE_RADIUS_SIGMA;
        return null;
    }
    function getOpacityUpperBound(bounds, index) {
        if (!bounds || void 0 === index) return null;
        const base = index * SORT_BOUNDS_STRIDE;
        if (base + SORT_BOUNDS_STRIDE > bounds.length) return null;
        const flags = bounds[base + 3] || 0;
        const opacityUpper = bounds[base + 1];
        if ((flags & SORT_BOUND_HAS_OPACITY) === 0 || !Number.isFinite(opacityUpper)) return null;
        return opacityUpper;
    }
    function projectLocalRadiusToNdc(m, clipW, ndcX, ndcY, localRadius) {
        if (!Number.isFinite(localRadius) || localRadius <= 0) return null;
        const clipRadiusX = localRadius * Math.hypot(m[0], m[4], m[8]);
        const clipRadiusY = localRadius * Math.hypot(m[1], m[5], m[9]);
        const clipRadiusW = localRadius * Math.hypot(m[3], m[7], m[11]);
        const denominator = clipW - clipRadiusW;
        if (!Number.isFinite(denominator) || denominator <= 1e-6) return null;
        return {
            x: (clipRadiusX + Math.abs(ndcX) * clipRadiusW) / denominator,
            y: (clipRadiusY + Math.abs(ndcY) * clipRadiusW) / denominator
        };
    }
    function setupCameraRelativeBins(cameraBin, bucketCount) {
        const bitsPerBin = [];
        for(let i = 0; i < NUM_BINS; i++){
            const distFromCamera = Math.abs(i - cameraBin);
            bitsPerBin[i] = weightByDistance[distFromCamera];
        }
        const totalWeight = bitsPerBin.reduce((a, b)=>a + b, 0);
        let accumulated = 0;
        for(let i = 0; i < NUM_BINS; i++){
            binDivider[i] = Math.max(1, Math.floor(bitsPerBin[i] / totalWeight * bucketCount));
            binBase[i] = accumulated;
            accumulated += binDivider[i];
        }
        if (accumulated > bucketCount) {
            const excess = accumulated - bucketCount;
            binDivider[NUM_BINS - 1] = Math.max(1, binDivider[NUM_BINS - 1] - excess);
        }
        binBase[NUM_BINS] = binBase[NUM_BINS - 1] + binDivider[NUM_BINS - 1];
        binDivider[NUM_BINS] = 0;
    }
    function computeEffectiveDistanceRangeLinear(sortParams) {
        let minDist = 1 / 0;
        let maxDist = -1 / 0;
        for(let paramIdx = 0; paramIdx < sortParams.length; paramIdx++){
            const params = sortParams[paramIdx];
            const { transformedDirection, offset, scale, aabbMin, aabbMax } = params;
            const dx = transformedDirection.x;
            const dy = transformedDirection.y;
            const dz = transformedDirection.z;
            const pxMin = dx >= 0 ? aabbMin[0] : aabbMax[0];
            const pyMin = dy >= 0 ? aabbMin[1] : aabbMax[1];
            const pzMin = dz >= 0 ? aabbMin[2] : aabbMax[2];
            const pxMax = dx >= 0 ? aabbMax[0] : aabbMin[0];
            const pyMax = dy >= 0 ? aabbMax[1] : aabbMin[1];
            const pzMax = dz >= 0 ? aabbMax[2] : aabbMin[2];
            const dMin = pxMin * dx + pyMin * dy + pzMin * dz;
            const dMax = pxMax * dx + pyMax * dy + pzMax * dz;
            const eMin = dMin * scale + offset;
            const eMax = dMax * scale + offset;
            const localMin = Math.min(eMin, eMax);
            const localMax = Math.max(eMin, eMax);
            if (localMin < minDist) minDist = localMin;
            if (localMax > maxDist) maxDist = localMax;
        }
        if (minDist === 1 / 0) {
            minDist = 0;
            maxDist = 0;
        }
        return {
            minDist,
            maxDist
        };
    }
    function computeEffectiveDistanceRangeRadial(sortParams) {
        let maxDist = -1 / 0;
        for(let paramIdx = 0; paramIdx < sortParams.length; paramIdx++){
            const params = sortParams[paramIdx];
            const { transformedPosition, scale, aabbMin, aabbMax } = params;
            const cx = transformedPosition.x;
            const cy = transformedPosition.y;
            const cz = transformedPosition.z;
            for(let i = 0; i < 8; i++){
                const px = 1 & i ? aabbMax[0] : aabbMin[0];
                const py = 2 & i ? aabbMax[1] : aabbMin[1];
                const pz = 4 & i ? aabbMax[2] : aabbMin[2];
                const dx = px - cx;
                const dy = py - cy;
                const dz = pz - cz;
                const distSq = dx * dx + dy * dy + dz * dz;
                const dist = Math.sqrt(distSq) * scale;
                if (dist > maxDist) maxDist = dist;
            }
        }
        if (maxDist < 0) maxDist = 0;
        return {
            minDist: 0,
            maxDist
        };
    }
    function evaluateSortKeysLinear(sortParams, minDist, range, distances, indexMap, countBuffer, centersData, compact) {
        const { textureSize, intervals, lineStarts, ids } = centersData;
        const invBinRange = NUM_BINS / range;
        let writeIndex = 0;
        for(let paramIdx = 0; paramIdx < sortParams.length; paramIdx++){
            const params = sortParams[paramIdx];
            const id = ids[paramIdx];
            const centers = centersMap.get(id);
            if (!centers) {
                __emitLog(1, `No centers found for id ${id}`);
                continue;
            }
            const bounds = boundsMap.get(id);
            let workBufferIndex = lineStarts[paramIdx] * textureSize;
            const { transformedDirection, offset, scale } = params;
            const sdx = transformedDirection.x * scale;
            const sdy = transformedDirection.y * scale;
            const sdz = transformedDirection.z * scale;
            const add = offset - minDist;
            const intervalsArray = intervals[paramIdx].length > 0 ? intervals[paramIdx] : [
                0,
                centers.length / 3
            ];
            for(let i = 0; i < intervalsArray.length; i += 2){
                const intervalStart = 3 * intervalsArray[i];
                const intervalEnd = 3 * intervalsArray[i + 1];
                for(let srcIndex = intervalStart; srcIndex < intervalEnd; srcIndex += 3){
                    const x = centers[srcIndex];
                    const y = centers[srcIndex + 1];
                    const z = centers[srcIndex + 2];
                    const targetIndex = workBufferIndex++;
                    if (!shouldKeepForVisibilityCompact(params, x, y, z, compact, bounds, srcIndex / 3)) continue;
                    const dist = x * sdx + y * sdy + z * sdz + add;
                    const d = dist * invBinRange;
                    const bin = Math.max(0, Math.min(NUM_BINS, d >>> 0));
                    const rawSortKey = binBase[bin] + binDivider[bin] * (d - bin) >>> 0;
                    const sortKey = Math.min(countBuffer.length - 1, rawSortKey);
                    distances[writeIndex] = sortKey;
                    indexMap[writeIndex] = targetIndex;
                    writeIndex++;
                    countBuffer[sortKey]++;
                }
            }
        }
        return writeIndex;
    }
    function evaluateSortKeysRadial(sortParams, _minDist, range, distances, indexMap, countBuffer, centersData, compact) {
        const { textureSize, intervals, lineStarts, ids } = centersData;
        const invBinRange = NUM_BINS / range;
        let writeIndex = 0;
        for(let paramIdx = 0; paramIdx < sortParams.length; paramIdx++){
            const params = sortParams[paramIdx];
            const id = ids[paramIdx];
            const centers = centersMap.get(id);
            if (!centers) {
                __emitLog(1, `No centers found for id ${id}`);
                continue;
            }
            const bounds = boundsMap.get(id);
            let workBufferIndex = lineStarts[paramIdx] * textureSize;
            const cx = params.transformedPosition.x;
            const cy = params.transformedPosition.y;
            const cz = params.transformedPosition.z;
            const scale = params.scale;
            const intervalsArray = intervals[paramIdx].length > 0 ? intervals[paramIdx] : [
                0,
                centers.length / 3
            ];
            for(let i = 0; i < intervalsArray.length; i += 2){
                const intervalStart = 3 * intervalsArray[i];
                const intervalEnd = 3 * intervalsArray[i + 1];
                for(let srcIndex = intervalStart; srcIndex < intervalEnd; srcIndex += 3){
                    const x = centers[srcIndex];
                    const y = centers[srcIndex + 1];
                    const z = centers[srcIndex + 2];
                    const targetIndex = workBufferIndex++;
                    if (!shouldKeepForVisibilityCompact(params, x, y, z, compact, bounds, srcIndex / 3)) continue;
                    const dx = x - cx;
                    const dy = y - cy;
                    const dz = z - cz;
                    const distSq = dx * dx + dy * dy + dz * dz;
                    const dist = Math.sqrt(distSq) * scale;
                    const invertedDist = range - dist;
                    const d = invertedDist * invBinRange;
                    const bin = Math.max(0, Math.min(NUM_BINS, d >>> 0));
                    const rawSortKey = binBase[bin] + binDivider[bin] * (d - bin) >>> 0;
                    const sortKey = Math.min(countBuffer.length - 1, rawSortKey);
                    distances[writeIndex] = sortKey;
                    indexMap[writeIndex] = targetIndex;
                    writeIndex++;
                    countBuffer[sortKey]++;
                }
            }
        }
        return writeIndex;
    }
    function countingSort(bucketCount, countBuffer, numVertices, distances, indexMap, order) {
        for(let i = 1; i < bucketCount; i++)countBuffer[i] += countBuffer[i - 1];
        for(let i = 0; i < numVertices; i++){
            const distance = distances[i];
            const destIndex = --countBuffer[distance];
            order[destIndex] = indexMap[i];
        }
    }
    function sort(sortParams, order, centersData, sortGeneration, compact) {
        const startTime = Date.now();
        const numVertices = centersData.totalActiveSplats;
        if (numVertices <= 0) {
            const orderBuffer = order.buffer;
            const response = {
                order: orderBuffer,
                count: 0,
                version: centersData.version,
                sortGeneration,
                totalActiveSplats: 0,
                culledSplats: 0,
                timeMs: Date.now() - startTime
            };
            self.postMessage(response, [
                orderBuffer
            ]);
            return;
        }
        const { minDist, maxDist } = _radialSort ? computeEffectiveDistanceRangeRadial(sortParams) : computeEffectiveDistanceRangeLinear(sortParams);
        const compareBits = Math.max(10, Math.min(20, Math.round(Math.log2(numVertices / 4))));
        const bucketCount = 2 ** compareBits + 1;
        if (!distances || distances.length !== numVertices) distances = new Uint32Array(numVertices);
        if (!indexMap || indexMap.length !== numVertices) indexMap = new Uint32Array(numVertices);
        if (countBuffer && countBuffer.length === bucketCount) countBuffer.fill(0);
        else countBuffer = new Uint32Array(bucketCount);
        const range = Math.max(maxDist - minDist, 1e-6);
        let cameraBin;
        if (_radialSort) cameraBin = NUM_BINS - 1;
        else {
            const cameraOffsetFromRangeStart = 0 - minDist;
            const cameraBinFloat = cameraOffsetFromRangeStart / range * NUM_BINS;
            cameraBin = Math.max(0, Math.min(NUM_BINS - 1, Math.floor(cameraBinFloat)));
        }
        setupCameraRelativeBins(cameraBin, bucketCount);
        let count = 0;
        count = _radialSort ? evaluateSortKeysRadial(sortParams, minDist, range, distances, indexMap, countBuffer, centersData, compact) : evaluateSortKeysLinear(sortParams, minDist, range, distances, indexMap, countBuffer, centersData, compact);
        countingSort(bucketCount, countBuffer, count, distances, indexMap, order);
        const orderBuffer = order.buffer;
        const response = {
            order: orderBuffer,
            count,
            version: centersData.version,
            sortGeneration,
            totalActiveSplats: numVertices,
            culledSplats: numVertices - count,
            timeMs: Date.now() - startTime
        };
        self.postMessage(response, [
            orderBuffer
        ]);
    }
    self.addEventListener('message', (message)=>{
        const msgData = message.data;
        try {
            switch(msgData.command){
                case 'addCenters':
                    centersMap.set(msgData.id, new Float32Array(msgData.centers));
                    if (msgData.bounds) boundsMap.set(msgData.id, new Float32Array(msgData.bounds));
                    else boundsMap.delete(msgData.id);
                    break;
                case 'removeCenters':
                    centersMap.delete(msgData.id);
                    boundsMap.delete(msgData.id);
                    break;
                case 'sort':
                    {
                        _radialSort = msgData.radialSorting || false;
                        const order = new Uint32Array(msgData.order);
                        if (!centersData) {
                            __emitLog(1, 'sort called but centersData is null, aborting');
                            postEmptySortResult(msgData, 0, true);
                            break;
                        }
                        if (0 === msgData.sortParams.length) {
                            postEmptySortResult(msgData, centersData.version);
                            break;
                        }
                        sort(msgData.sortParams, order, centersData, msgData.sortGeneration, msgData.visibilityCompact);
                        break;
                    }
                case 'intervals':
                    centersData = {
                        textureSize: msgData.textureSize,
                        intervals: msgData.intervals,
                        lineStarts: msgData.lineStarts,
                        padding: msgData.padding,
                        version: msgData.version,
                        totalUsedPixels: msgData.totalUsedPixels,
                        totalActiveSplats: msgData.totalActiveSplats,
                        ids: msgData.ids
                    };
                    break;
            }
        } catch (error) {
            __emitLog(1, `Error processing ${msgData.command}: ${getErrorMessage(error)}`);
            if ('sort' === msgData.command) try {
                postEmptySortResult(msgData, centersData?.version ?? 0, true);
            } catch (postError) {
                __emitLog(1, `Error posting empty sort result: ${getErrorMessage(postError)}`);
            }
        }
    });
}
export { UnifiedSortWorker };
