import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_BinaryHeap_js_f44f1668__ from "../../shared/utils/BinaryHeap.js";
class Points {
    constructor(){
        this.boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        this.numPoints = 0;
        this.data = {};
    }
    add(points) {
        const currentSize = this.numPoints;
        const additionalSize = points.numPoints;
        const newSize = currentSize + additionalSize;
        const thisAttributes = Object.keys(this.data);
        const otherAttributes = Object.keys(points.data);
        const attributes = new Set([
            ...thisAttributes,
            ...otherAttributes
        ]);
        for (const attribute of attributes)if (thisAttributes.includes(attribute) && otherAttributes.includes(attribute)) {
            const Type = this.data[attribute].constructor;
            const merged = new Type(this.data[attribute].length + points.data[attribute].length);
            merged.set(this.data[attribute], 0);
            merged.set(points.data[attribute], this.data[attribute].length);
            this.data[attribute] = merged;
        } else if (thisAttributes.includes(attribute) && !otherAttributes.includes(attribute)) {
            const elementsPerPoint = this.data[attribute].length / this.numPoints;
            const Type = this.data[attribute].constructor;
            const expanded = new Type(elementsPerPoint * newSize);
            expanded.set(this.data[attribute], 0);
            this.data[attribute] = expanded;
        } else if (!thisAttributes.includes(attribute) && otherAttributes.includes(attribute)) {
            const elementsPerPoint = points.data[attribute].length / points.numPoints;
            const Type = points.data[attribute].constructor;
            const expanded = new Type(elementsPerPoint * newSize);
            expanded.set(points.data[attribute], elementsPerPoint * currentSize);
            this.data[attribute] = expanded;
        }
        this.numPoints = newSize;
        this.boundingBox.union(points.boundingBox);
    }
}
class ProfileData {
    constructor(profile){
        this.profile = profile;
        this.segments = [];
        this.boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        for(let i = 0; i < profile.points.length - 1; i++){
            const start = profile.points[i];
            const end = profile.points[i + 1];
            const startGround = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(start.x, start.y, 0);
            const endGround = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(end.x, end.y, 0);
            const center = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().addVectors(endGround, startGround).multiplyScalar(0.5);
            const length = startGround.distanceTo(endGround);
            const side = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(endGround, startGround).normalize();
            const up = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
            const forward = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(side, up).normalize();
            const N = forward;
            const cutPlane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(N, startGround);
            const halfPlane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(side, center);
            const segment = {
                start: start,
                end: end,
                cutPlane: cutPlane,
                halfPlane: halfPlane,
                length: length,
                points: new Points()
            };
            this.segments.push(segment);
        }
    }
    size() {
        let size = 0;
        for (const segment of this.segments)size += segment.points.numPoints;
        return size;
    }
}
class ProfileRequest {
    constructor(pointcloud, profile, maxDepth, lru, callback){
        this.pointcloud = pointcloud;
        this.profile = profile;
        this.maxDepth = maxDepth || Number.MAX_VALUE;
        this.callback = callback;
        this.temporaryResult = new ProfileData(this.profile);
        this.pointsServed = 0;
        this.highestLevelServed = 0;
        this.lru = lru;
        this.priorityQueue = new __WEBPACK_EXTERNAL_MODULE__shared_utils_BinaryHeap_js_f44f1668__.BinaryHeap((x)=>1 / x.weight);
        this.initialize();
    }
    initialize() {
        this.priorityQueue.push({
            node: this.pointcloud.pcoGeometry.root,
            weight: 1 / 0
        });
    }
    traverse(node) {
        const stack = [];
        for(let i = 0; i < 8; i++){
            const child = node.children[i];
            if (child && this.pointcloud.nodeIntersectsProfile(child, this.profile)) stack.push(child);
        }
        while(stack.length > 0){
            const node = stack.pop();
            const weight = node.boundingSphere.radius;
            this.priorityQueue.push({
                node: node,
                weight: weight
            });
            if (node.level < this.maxDepth) for(let i = 0; i < 8; i++){
                const child = node.children[i];
                if (child && this.pointcloud.nodeIntersectsProfile(child, this.profile)) stack.push(child);
            }
        }
    }
    update() {
        if (!this.updateGeneratorInstance) this.updateGeneratorInstance = this.updateGenerator();
        const result = this.updateGeneratorInstance.next();
        if (result.done) this.updateGeneratorInstance = null;
    }
    *updateGenerator() {
        performance.now();
        const maxNodesPerUpdate = 1;
        const intersectedNodes = [];
        for(let i = 0; i < Math.min(maxNodesPerUpdate, this.priorityQueue.size()); i++){
            const element = this.priorityQueue.pop();
            const node = element.node;
            if (!(node.level > this.maxDepth)) {
                if (node.loaded) {
                    intersectedNodes.push(node);
                    this.lru.touch(node);
                    this.highestLevelServed = Math.max(node.getLevel(), this.highestLevelServed);
                    const geom = node.pcoGeometry;
                    const hierarchyStepSize = geom ? geom.hierarchyStepSize : 1;
                    const doTraverse = 0 === node.getLevel() || node.level % hierarchyStepSize === 0 && node.hasChildren;
                    if (doTraverse) this.traverse(node);
                } else {
                    node.load();
                    this.priorityQueue.push(element);
                }
            }
        }
        if (intersectedNodes.length > 0) {
            for (const done of this.getPointsInsideProfile(intersectedNodes, this.temporaryResult))if (!done) yield false;
            if (this.temporaryResult.size() > 100) {
                this.pointsServed += this.temporaryResult.size();
                this.callback.onProgress({
                    request: this,
                    points: this.temporaryResult
                });
                this.temporaryResult = new ProfileData(this.profile);
            }
        }
        if (0 === this.priorityQueue.size()) {
            if (this.temporaryResult.size() > 0) {
                this.pointsServed += this.temporaryResult.size();
                this.callback.onProgress({
                    request: this,
                    points: this.temporaryResult
                });
                this.temporaryResult = new ProfileData(this.profile);
            }
            this.callback.onFinish({
                request: this
            });
            const index = this.pointcloud.profileRequests.indexOf(this);
            if (index >= 0) this.pointcloud.profileRequests.splice(index, 1);
        }
        yield true;
    }
    *getAccepted(numPoints, node, matrix, segment, segmentDir, points, totalMileage) {
        let checkpoint = performance.now();
        let accepted = new Uint32Array(numPoints);
        let mileage = new Float64Array(numPoints);
        let acceptedPositions = new Float32Array(3 * numPoints);
        let numAccepted = 0;
        const pos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const svp = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const view = new Float32Array(node.geometry.attributes.position.array);
        for(let i = 0; i < numPoints; i++){
            pos.set(view[3 * i + 0], view[3 * i + 1], view[3 * i + 2]);
            pos.applyMatrix4(matrix);
            const distance = Math.abs(segment.cutPlane.distanceToPoint(pos));
            const centerDistance = Math.abs(segment.halfPlane.distanceToPoint(pos));
            if (distance < this.profile.width / 2 && centerDistance < segment.length / 2) {
                svp.subVectors(pos, segment.start);
                const localMileage = segmentDir.dot(svp);
                accepted[numAccepted] = i;
                mileage[numAccepted] = localMileage + totalMileage;
                points.boundingBox.expandByPoint(pos);
                pos.sub(this.pointcloud.position);
                acceptedPositions[3 * numAccepted + 0] = pos.x;
                acceptedPositions[3 * numAccepted + 1] = pos.y;
                acceptedPositions[3 * numAccepted + 2] = pos.z;
                numAccepted++;
            }
            if (i % 1000 === 0) {
                const duration = performance.now() - checkpoint;
                if (duration > 4) {
                    yield false;
                    checkpoint = performance.now();
                }
            }
        }
        accepted = accepted.subarray(0, numAccepted);
        mileage = mileage.subarray(0, numAccepted);
        acceptedPositions = acceptedPositions.subarray(0, 3 * numAccepted);
        yield [
            accepted,
            mileage,
            acceptedPositions
        ];
    }
    *getPointsInsideProfile(nodes, target) {
        let checkpoint = performance.now();
        let totalMileage = 0;
        for (const segment of target.segments){
            for (const node of nodes){
                const numPoints = node.numPoints;
                const geometry = node.geometry;
                if (!numPoints) continue;
                {
                    const bbWorld = node.boundingBox.clone().applyMatrix4(this.pointcloud.matrixWorld);
                    const bsWorld = bbWorld.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere());
                    const start = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(segment.start.x, segment.start.y, bsWorld.center.z);
                    const end = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(segment.end.x, segment.end.y, bsWorld.center.z);
                    const closest = new __WEBPACK_EXTERNAL_MODULE_three__.Line3(start, end).closestPointToPoint(bsWorld.center, true, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
                    const distance = closest.distanceTo(bsWorld.center);
                    const intersects = distance < bsWorld.radius + target.profile.width;
                    if (!intersects) continue;
                }
                const sv = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(segment.end, segment.start).setZ(0);
                const segmentDir = sv.clone().normalize();
                const points = new Points();
                const nodeMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().makeTranslation(...node.boundingBox.min.toArray());
                const matrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().multiplyMatrices(this.pointcloud.matrixWorld, nodeMatrix);
                let accepted = null;
                let mileage = null;
                let acceptedPositions = null;
                for (const result of this.getAccepted(numPoints, node, matrix, segment, segmentDir, points, totalMileage))if (result) [accepted, mileage, acceptedPositions] = result;
                else {
                    performance.now();
                    yield false;
                    checkpoint = performance.now();
                }
                const duration = performance.now() - checkpoint;
                if (duration > 4) {
                    yield false;
                    checkpoint = performance.now();
                }
                points.data.position = acceptedPositions;
                const relevantAttributes = Object.keys(geometry.attributes).filter((a)=>![
                        'position',
                        'indices'
                    ].includes(a));
                for (const attributeName of relevantAttributes){
                    const attribute = geometry.attributes[attributeName];
                    const numElements = attribute.array.length / numPoints;
                    parseInt(numElements, 10);
                    const Type = attribute.array.constructor;
                    const filteredBuffer = new Type(numElements * accepted.length);
                    const source = attribute.array;
                    const target = filteredBuffer;
                    for(let i = 0; i < accepted.length; i++){
                        const index = accepted[i];
                        const start = index * numElements;
                        const end = start + numElements;
                        const sub = source.subarray(start, end);
                        target.set(sub, i * numElements);
                    }
                    points.data[attributeName] = filteredBuffer;
                }
                points.data['mileage'] = mileage;
                points.numPoints = accepted.length;
                segment.points.add(points);
            }
            totalMileage += segment.length;
        }
        for (const segment of target.segments)target.boundingBox.union(segment.points.boundingBox);
        yield true;
    }
    finishLevelThenCancel() {
        if (this.cancelRequested) return;
        this.maxDepth = this.highestLevelServed;
        this.cancelRequested = true;
    }
    cancel() {
        this.callback.onCancel();
        this.priorityQueue = new __WEBPACK_EXTERNAL_MODULE__shared_utils_BinaryHeap_js_f44f1668__.BinaryHeap((x)=>1 / x.weight);
        const index = this.pointcloud.profileRequests.indexOf(this);
        if (index >= 0) this.pointcloud.profileRequests.splice(index, 1);
    }
}
export { ProfileData, ProfileRequest };
