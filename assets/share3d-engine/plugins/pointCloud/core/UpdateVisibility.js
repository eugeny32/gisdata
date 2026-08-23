import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_BinaryHeap_js_95d19926__ from "../../../shared/utils/BinaryHeap.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_Box3Helper_js_4a2e1850__ from "../../../shared/utils/Box3Helper.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('pointcloud:visibility');
const VISIBILITY_DEBUG_LOG_INTERVAL_MS = 15000;
let lastVisibilityDebugLogTime = 0;
function createVisibilityDebugStats() {
    return {
        visited: 0,
        visibleCandidates: 0,
        rejectedFrustum: 0,
        rejectedGlobalBudget: 0,
        rejectedPointcloudBudget: 0,
        rejectedMaxLevel: 0,
        forcedLevelVisible: 0,
        budgetBreaks: 0,
        geometryCandidates: 0,
        loadedGeometryCandidates: 0,
        gpuUploads: 0,
        gpuLimitHits: 0,
        queuedForLoad: 0,
        parentNotTree: 0,
        loadedWaitingForParent: 0,
        queuedWaitingForParent: 0,
        permanentlyFailed: 0,
        loadBlockedLoaded: 0,
        loadBlockedLoading: 0,
        loadBlockedDisposed: 0,
        loadBlockedRetry: 0,
        loadBlockedConcurrency: 0,
        loadBlockedNoLoader: 0,
        loadBlockedUnknown: 0,
        treeVisible: 0,
        childrenQueued: 0,
        childrenSkippedMinSize: 0
    };
}
function recordLoadBlockedReason(node, stats) {
    if (node.loaded) {
        stats.loadBlockedLoaded++;
        return;
    }
    if (node.loading) {
        stats.loadBlockedLoading++;
        return;
    }
    const signal = node.octreeGeometry.loadSignal;
    if (node.disposed || node.octreeGeometry.disposed || signal?.aborted) {
        stats.loadBlockedDisposed++;
        return;
    }
    if (node.loadPermanentlyFailed) {
        stats.permanentlyFailed++;
        return;
    }
    if (node.loadFailed && (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().now() < node.retryAfter) {
        stats.loadBlockedRetry++;
        return;
    }
    if (node.Potree.numNodesLoading >= node.Potree.maxNodesLoading) {
        stats.loadBlockedConcurrency++;
        return;
    }
    if (!node.octreeGeometry.loader) {
        stats.loadBlockedNoLoader++;
        return;
    }
    stats.loadBlockedUnknown++;
}
function shouldLogVisibilityDebugStats(stats, loadsStarted, queueSize) {
    return loadsStarted > 0 || queueSize > 0 || stats.queuedForLoad > 0 || stats.gpuUploads > 0 || stats.gpuLimitHits > 0 || stats.loadBlockedDisposed > 0 || stats.loadBlockedRetry > 0 || stats.loadBlockedConcurrency > 0 || stats.loadBlockedNoLoader > 0 || stats.loadBlockedUnknown > 0 || stats.rejectedGlobalBudget > 0 || stats.rejectedPointcloudBudget > 0 || stats.budgetBreaks > 0 || stats.permanentlyFailed > 0;
}
function isOctreeGeometryNode(node) {
    return 'isGeometryNode' in node && node.isGeometryNode();
}
function isPointCloudOctreeNode(node) {
    return 'isTreeNode' in node && node.isTreeNode();
}
function hasDEMUpdater(pointcloud) {
    return pointcloud.generateDEM && null != pointcloud.dem && 'function' == typeof pointcloud.dem.update;
}
function startNodeLoads(unloadedGeometry, maxNodesLoading, debugStats) {
    let nodesLoadingStarted = 0;
    for(let i = 0; i < unloadedGeometry.length && nodesLoadingStarted < maxNodesLoading; i++)if (unloadedGeometry[i].load()) nodesLoadingStarted++;
    else if (debugStats) recordLoadBlockedReason(unloadedGeometry[i], debugStats);
    return nodesLoadingStarted;
}
const _pointcloudTransformVersion = new WeakMap();
function computeOrthographicPixelScale(objectToClip, domWidth, domHeight) {
    const origin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0).applyMatrix4(objectToClip);
    const axes = [
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0).applyMatrix4(objectToClip),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0).applyMatrix4(objectToClip),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1).applyMatrix4(objectToClip)
    ];
    let maxPixelScale = 0;
    for (const axis of axes){
        const dx = (axis.x - origin.x) * domWidth * 0.5;
        const dy = (axis.y - origin.y) * domHeight * 0.5;
        maxPixelScale = Math.max(maxPixelScale, Math.hypot(dx, dy));
    }
    return maxPixelScale;
}
function updatePointClouds(pointclouds, camera, renderer, lru, pointBudget, maxNodesLoading, viewportSize, progressContext) {
    for (const pointcloud of pointclouds){
        const start = performance.now();
        for (const profileRequest of pointcloud.profileRequests){
            profileRequest.update();
            const duration = performance.now() - start;
            if (duration > 5) break;
        }
    }
    const result = updateVisibility(pointclouds, camera, renderer, lru, pointBudget, maxNodesLoading, viewportSize, progressContext);
    for (const pointcloud of pointclouds){
        pointcloud.updateMaterial(pointcloud.material, pointcloud.visibleNodes, camera, renderer, viewportSize);
        pointcloud.updateVisibleBounds();
    }
    return result;
}
function updateVisibilityStructures(pointclouds, camera, renderer, viewportSize) {
    const frustums = [];
    const camObjPositions = [];
    const orthoPixelScales = [];
    const priorityQueue = new __WEBPACK_EXTERNAL_MODULE__shared_utils_BinaryHeap_js_95d19926__.BinaryHeap((x)=>1 / x.weight);
    const domWidth = Math.max(1, viewportSize?.width ?? renderer.domElement.clientWidth ?? 1);
    const domHeight = Math.max(1, viewportSize?.height ?? renderer.domElement.clientHeight ?? 1);
    for(let i = 0; i < pointclouds.length; i++){
        const pointcloud = pointclouds[i];
        if (!pointcloud.initialized()) continue;
        for (const visibleNode of pointcloud.visibleNodes)if (visibleNode.sceneNode) visibleNode.sceneNode.visible = false;
        pointcloud.numVisibleNodes = 0;
        pointcloud.numVisiblePoints = 0;
        pointcloud.deepestVisibleLevel = 0;
        pointcloud.visibleNodes = [];
        camera.updateMatrixWorld(true);
        pointcloud.updateMatrixWorld(true);
        const frustum = new __WEBPACK_EXTERNAL_MODULE_three__.Frustum();
        const viewI = camera.matrixWorldInverse;
        const world = pointcloud.matrixWorld;
        const frustumCam = camera.clone();
        frustumCam.near = Math.min(camera.near, 0.1);
        frustumCam.updateProjectionMatrix();
        const proj = frustumCam.projectionMatrix;
        const fm = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().multiply(proj).multiply(viewI).multiply(world);
        frustum.setFromProjectionMatrix(fm);
        frustums.push(frustum);
        orthoPixelScales.push(camera.isOrthographicCamera ? computeOrthographicPixelScale(fm, domWidth, domHeight) : 0);
        const view = camera.matrixWorld;
        const worldI = world.clone().invert();
        const camMatrixObject = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().multiply(worldI).multiply(view);
        const camObjPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().setFromMatrixPosition(camMatrixObject);
        camObjPositions.push(camObjPos);
        if (pointcloud.visible && null !== pointcloud.root) priorityQueue.push({
            pointcloud: i,
            node: pointcloud.root,
            weight: Number.MAX_VALUE
        });
        for(let j = 0; j < pointcloud.boundingBoxNodes.length; j++)pointcloud.boundingBoxNodes[j].visible = false;
    }
    return {
        frustums: frustums,
        camObjPositions: camObjPositions,
        orthoPixelScales: orthoPixelScales,
        priorityQueue: priorityQueue
    };
}
function updateVisibility(pointclouds, camera, renderer, lru, pointBudget, maxNodesLoading, viewportSize, progressContext) {
    let numVisiblePoints = 0;
    const numVisiblePointsInPointclouds = new Map(pointclouds.map((pc)=>[
            pc,
            0
        ]));
    const lodProgressInPointclouds = new Map(pointclouds.map((pointcloud)=>[
            pointcloud,
            {
                ready: 0,
                total: 0
            }
        ]));
    const visibleNodes = [];
    const unloadedGeometry = [];
    const requiredGeometryNodes = new Set();
    let lowestSpacing = 1 / 0;
    const s = updateVisibilityStructures(pointclouds, camera, renderer, viewportSize);
    const frustums = s.frustums;
    const camObjPositions = s.camObjPositions;
    const orthoPixelScales = s.orthoPixelScales;
    const priorityQueue = s.priorityQueue;
    const debugStats = createVisibilityDebugStats();
    let loadedToGPUThisFrame = 0;
    viewportSize?.width ?? renderer.domElement.clientWidth;
    const domHeight = Math.max(1, viewportSize?.height ?? renderer.domElement.clientHeight ?? 1);
    const pointcloudTransformVersion = _pointcloudTransformVersion;
    for (const pointcloud of pointclouds){
        if (!pointcloud.visible) continue;
        pointcloud.updateMatrixWorld(true);
        let version = pointcloudTransformVersion.get(pointcloud);
        if (version) {
            if (!version.transform.equals(pointcloud.matrixWorld)) {
                version.number++;
                version.transform.copy(pointcloud.matrixWorld);
                pointcloud.dispatchEvent({
                    type: 'transformation_changed',
                    target: pointcloud
                });
            }
        } else {
            version = {
                number: 0,
                transform: pointcloud.matrixWorld.clone()
            };
            pointcloudTransformVersion.set(pointcloud, version);
        }
    }
    while(priorityQueue.size() > 0){
        const element = priorityQueue.pop();
        if (!element) break;
        let node = element.node;
        const parent = element.parent;
        const pointcloud = pointclouds[element.pointcloud];
        debugStats.visited++;
        if (isOctreeGeometryNode(node)) {
            const renderNode = pointcloud.getRenderNode(node);
            if (renderNode?.isLoaded()) node = renderNode;
        }
        const box = node.getBoundingBox();
        const frustum = frustums[element.pointcloud];
        const camObjPos = camObjPositions[element.pointcloud];
        const insideFrustum = frustum.intersectsBox(box);
        const maxLevel = pointcloud.maxLevel || 1 / 0;
        const level = node.getLevel();
        const exceedsGlobalBudget = numVisiblePoints + node.getNumPoints() > pointBudget;
        const exceedsPointcloudBudget = numVisiblePointsInPointclouds.get(pointcloud) + node.getNumPoints() > pointcloud.pointBudget;
        const exceedsMaxLevel = level >= maxLevel;
        let visible = insideFrustum;
        visible = visible && !exceedsGlobalBudget;
        visible = visible && !exceedsPointcloudBudget;
        visible = visible && !exceedsMaxLevel;
        const visibleBeforeLevelForce = visible;
        visible = visible || level <= 2;
        if (!insideFrustum) debugStats.rejectedFrustum++;
        if (exceedsGlobalBudget) debugStats.rejectedGlobalBudget++;
        if (exceedsPointcloudBudget) debugStats.rejectedPointcloudBudget++;
        if (exceedsMaxLevel) debugStats.rejectedMaxLevel++;
        if (!visibleBeforeLevelForce && visible) debugStats.forcedLevelVisible++;
        const clipBoxes = pointcloud.material.clipBoxes;
        if (clipBoxes.length > 0) {
            let numIntersecting = 0;
            let numIntersectionVolumes = 0;
            for (const clipBox of clipBoxes){
                const pcWorldInverse = pointcloud.matrixWorld.clone().invert();
                const clipBoxMatrixWorld = clipBox.box?.matrixWorld ?? clipBox.inverse.clone().invert();
                const toPCObject = pcWorldInverse.multiply(clipBoxMatrixWorld);
                const px = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0.5, 0, 0).applyMatrix4(toPCObject);
                const nx = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-0.5, 0, 0).applyMatrix4(toPCObject);
                const py = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0.5, 0).applyMatrix4(toPCObject);
                const ny = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, -0.5, 0).applyMatrix4(toPCObject);
                const pz = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0.5).applyMatrix4(toPCObject);
                const nz = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, -0.5).applyMatrix4(toPCObject);
                const pxN = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(nx, px).normalize();
                const nxN = pxN.clone().multiplyScalar(-1);
                const pyN = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(ny, py).normalize();
                const nyN = pyN.clone().multiplyScalar(-1);
                const pzN = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(nz, pz).normalize();
                const nzN = pzN.clone().multiplyScalar(-1);
                const pxPlane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(pxN, px);
                const nxPlane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(nxN, nx);
                const pyPlane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(pyN, py);
                const nyPlane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(nyN, ny);
                const pzPlane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(pzN, pz);
                const nzPlane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(nzN, nz);
                const frustum = new __WEBPACK_EXTERNAL_MODULE_three__.Frustum(pxPlane, nxPlane, pyPlane, nyPlane, pzPlane, nzPlane);
                const intersects = frustum.intersectsBox(box);
                if (intersects) numIntersecting++;
                numIntersectionVolumes++;
            }
            const insideAny = numIntersecting > 0;
            const insideAll = numIntersecting === numIntersectionVolumes;
            if (pointcloud.material.clipTask === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.SHOW_INSIDE) pointcloud.material.clipMethod === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipMethod.INSIDE_ANY && insideAny || pointcloud.material.clipMethod === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipMethod.INSIDE_ALL && insideAll || (visible = false);
            else pointcloud.material.clipTask, __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.SHOW_OUTSIDE;
        }
        const clipPolygons = pointcloud.material.clipPolygons;
        let isPolygonBoundaryNode = false;
        if (visible && clipPolygons && clipPolygons.length > 0) {
            const nodeBoxWorld = box.clone().applyMatrix4(pointcloud.matrixWorld);
            const groupPolygons = new Map();
            const groupClipTasks = new Map();
            for (const polygon of clipPolygons){
                if (!polygon.initialized) continue;
                const groupId = polygon.groupId || 0;
                if (!groupPolygons.has(groupId)) {
                    groupPolygons.set(groupId, []);
                    groupClipTasks.set(groupId, polygon.clipTask);
                }
                groupPolygons.get(groupId).push(polygon);
            }
            for (const [groupId, polygons] of groupPolygons){
                const clipTask = groupClipTasks.get(groupId);
                let groupAABB = null;
                let groupProjViewMatrix = null;
                for (const polygon of polygons){
                    if (!groupProjViewMatrix && polygon.viewMatrix && polygon.projMatrix) groupProjViewMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().multiplyMatrices(polygon.projMatrix, polygon.viewMatrix);
                    if (groupAABB) {
                        groupAABB.min.x = Math.min(groupAABB.min.x, polygon.aabb.min.x);
                        groupAABB.min.y = Math.min(groupAABB.min.y, polygon.aabb.min.y);
                        groupAABB.max.x = Math.max(groupAABB.max.x, polygon.aabb.max.x);
                        groupAABB.max.y = Math.max(groupAABB.max.y, polygon.aabb.max.y);
                    } else groupAABB = {
                        min: {
                            x: polygon.aabb.min.x,
                            y: polygon.aabb.min.y
                        },
                        max: {
                            x: polygon.aabb.max.x,
                            y: polygon.aabb.max.y
                        }
                    };
                }
                if (!groupAABB || !groupProjViewMatrix) continue;
                const corners = [
                    new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(nodeBoxWorld.min.x, nodeBoxWorld.min.y, nodeBoxWorld.min.z),
                    new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(nodeBoxWorld.max.x, nodeBoxWorld.min.y, nodeBoxWorld.min.z),
                    new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(nodeBoxWorld.min.x, nodeBoxWorld.max.y, nodeBoxWorld.min.z),
                    new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(nodeBoxWorld.max.x, nodeBoxWorld.max.y, nodeBoxWorld.min.z),
                    new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(nodeBoxWorld.min.x, nodeBoxWorld.min.y, nodeBoxWorld.max.z),
                    new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(nodeBoxWorld.max.x, nodeBoxWorld.min.y, nodeBoxWorld.max.z),
                    new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(nodeBoxWorld.min.x, nodeBoxWorld.max.y, nodeBoxWorld.max.z),
                    new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(nodeBoxWorld.max.x, nodeBoxWorld.max.y, nodeBoxWorld.max.z)
                ];
                const nodeAABB = {
                    min: {
                        x: 1 / 0,
                        y: 1 / 0
                    },
                    max: {
                        x: -1 / 0,
                        y: -1 / 0
                    }
                };
                let hasValidProjection = true;
                for (const corner of corners){
                    corner.applyMatrix4(groupProjViewMatrix);
                    if (corner.z < -1 || corner.z > 1) {
                        hasValidProjection = false;
                        break;
                    }
                    nodeAABB.min.x = Math.min(nodeAABB.min.x, corner.x);
                    nodeAABB.min.y = Math.min(nodeAABB.min.y, corner.y);
                    nodeAABB.max.x = Math.max(nodeAABB.max.x, corner.x);
                    nodeAABB.max.y = Math.max(nodeAABB.max.y, corner.y);
                }
                if (!hasValidProjection) {
                    isPolygonBoundaryNode = true;
                    continue;
                }
                const intersects2D = !(nodeAABB.max.x < groupAABB.min.x || nodeAABB.min.x > groupAABB.max.x || nodeAABB.max.y < groupAABB.min.y || nodeAABB.min.y > groupAABB.max.y);
                nodeAABB.min.x >= groupAABB.min.x && nodeAABB.max.x <= groupAABB.max.x && nodeAABB.min.y >= groupAABB.min.y && (nodeAABB.max.y, groupAABB.max.y);
                const fullyOutside2D = !intersects2D;
                if (clipTask === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.SHOW_INSIDE) {
                    if (fullyOutside2D) {
                        visible = false;
                        break;
                    }
                    isPolygonBoundaryNode = true;
                } else if (clipTask === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.SHOW_OUTSIDE) {
                    if (fullyOutside2D) continue;
                    isPolygonBoundaryNode = true;
                }
            }
        }
        if (node.spacing) lowestSpacing = Math.min(lowestSpacing, node.spacing);
        else if (node.geometryNode?.spacing) lowestSpacing = Math.min(lowestSpacing, node.geometryNode.spacing);
        if (!visible) continue;
        debugStats.visibleCandidates++;
        const children = node.getChildren();
        if (numVisiblePoints + node.getNumPoints() > pointBudget) {
            debugStats.budgetBreaks++;
            break;
        }
        const requiredGeometryNode = isOctreeGeometryNode(node) ? node : node.geometryNode;
        if (requiredGeometryNode) requiredGeometryNodes.add(requiredGeometryNode);
        const lodProgress = lodProgressInPointclouds.get(pointcloud);
        if (!isOctreeGeometryNode(node) || !node.structural) lodProgress.total++;
        if (isOctreeGeometryNode(node) && node.structural) ;
        else if (isOctreeGeometryNode(node)) {
            debugStats.geometryCandidates++;
            if (node.isLoaded()) debugStats.loadedGeometryCandidates++;
            if (node.isLoaded() && loadedToGPUThisFrame < 4) {
                node = pointcloud.toTreeNode(node, parent);
                loadedToGPUThisFrame++;
                debugStats.gpuUploads++;
            } else if (node.loadPermanentlyFailed) debugStats.permanentlyFailed++;
            else {
                unloadedGeometry.push(node);
                if (node.isLoaded()) debugStats.gpuLimitHits++;
                else debugStats.queuedForLoad++;
            }
        }
        if (isPointCloudOctreeNode(node)) {
            if (!node.geometryNode || !node.sceneNode || !node.isLoaded()) continue;
            lru.touch(node.geometryNode);
            node.sceneNode.visible = true;
            node.sceneNode.material = pointcloud.material;
            visibleNodes.push(node);
            pointcloud.visibleNodes.push(node);
            lodProgress.ready++;
            debugStats.treeVisible++;
            numVisiblePoints += node.getNumPoints();
            const numVisiblePointsInPointcloud = numVisiblePointsInPointclouds.get(pointcloud);
            numVisiblePointsInPointclouds.set(pointcloud, numVisiblePointsInPointcloud + node.getNumPoints());
            pointcloud.numVisibleNodes++;
            pointcloud.numVisiblePoints += node.getNumPoints();
            if (void 0 === node._transformVersion) node._transformVersion = -1;
            const transformVersion = pointcloudTransformVersion.get(pointcloud);
            if (transformVersion && node._transformVersion !== transformVersion.number) {
                node.sceneNode.updateMatrix();
                node.sceneNode.matrixWorld.multiplyMatrices(pointcloud.matrixWorld, node.sceneNode.matrix);
                node._transformVersion = transformVersion.number;
            }
            if (pointcloud.showBoundingBox && !node.boundingBoxNode && node.getBoundingBox) {
                const boxHelper = new __WEBPACK_EXTERNAL_MODULE__shared_utils_Box3Helper_js_4a2e1850__.Box3Helper(node.getMinimumBoundingBox(), 0x0a65b9);
                boxHelper.matrixAutoUpdate = false;
                pointcloud.boundingBoxNodes.push(boxHelper);
                node.boundingBoxNode = boxHelper;
                node.boundingBoxNode.matrix.copy(pointcloud.matrixWorld);
            } else if (pointcloud.showBoundingBox) {
                node.boundingBoxNode.visible = true;
                node.boundingBoxNode.matrix.copy(pointcloud.matrixWorld);
            } else if (!pointcloud.showBoundingBox && node.boundingBoxNode) node.boundingBoxNode.visible = false;
        }
        for(let i = 0; i < children.length; i++){
            const child = children[i];
            let weight = 0;
            if (camera.isPerspectiveCamera) {
                const sphere = child.getBoundingSphere();
                const center = sphere.center;
                const dx = camObjPos.x - center.x;
                const dy = camObjPos.y - center.y;
                const dz = camObjPos.z - center.z;
                const dd = dx * dx + dy * dy + dz * dz;
                const distance = Math.sqrt(dd);
                const radius = sphere.radius;
                const fov = camera.fov * Math.PI / 180;
                const slope = Math.tan(fov / 2);
                const projFactor = 0.5 * domHeight / (slope * distance);
                const screenPixelRadius = radius * projFactor;
                if (screenPixelRadius < pointcloud.minimumNodePixelSize) {
                    debugStats.childrenSkippedMinSize++;
                    continue;
                }
                weight = screenPixelRadius;
                if (distance - radius < 0) weight = Number.MAX_VALUE;
                if (isPolygonBoundaryNode) weight = Math.max(2 * weight, weight + 1000);
            } else {
                const sphere = child.getBoundingSphere();
                const screenPixelRadius = sphere.radius * (orthoPixelScales[element.pointcloud] ?? 0);
                if (screenPixelRadius < pointcloud.minimumNodePixelSize) {
                    debugStats.childrenSkippedMinSize++;
                    continue;
                }
                weight = screenPixelRadius;
                if (isPolygonBoundaryNode) weight *= 2;
            }
            priorityQueue.push({
                pointcloud: element.pointcloud,
                node: child,
                parent: node,
                weight: weight
            });
            debugStats.childrenQueued++;
        }
    }
    {
        const maxDEMLevel = 4;
        const candidates = pointclouds.filter(hasDEMUpdater);
        for (const pointcloud of candidates){
            const updatingNodes = pointcloud.visibleNodes.filter((n)=>n.getLevel() <= maxDEMLevel);
            pointcloud.dem.update(updatingNodes);
        }
    }
    const loadsStarted = startNodeLoads(unloadedGeometry, maxNodesLoading, debugStats);
    if (log.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.LogLevel.DEBUG)) {
        const now = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().now();
        const queueSize = unloadedGeometry.length;
        if (shouldLogVisibilityDebugStats(debugStats, loadsStarted, queueSize) && now - lastVisibilityDebugLogTime >= VISIBILITY_DEBUG_LOG_INTERVAL_MS) {
            lastVisibilityDebugLogTime = now;
            log.debug(`LOD activity, assets=${pointclouds.length}, visiblePoints=${numVisiblePoints}, treeVisible=${debugStats.treeVisible}, queuedForLoad=${debugStats.queuedForLoad}, loadsStarted=${loadsStarted}, queueSize=${queueSize}, gpuUploads=${debugStats.gpuUploads}, gpuLimitHits=${debugStats.gpuLimitHits}, loadBlockedDisposed=${debugStats.loadBlockedDisposed}, loadBlockedRetry=${debugStats.loadBlockedRetry}, loadBlockedConcurrency=${debugStats.loadBlockedConcurrency}, loadBlockedNoLoader=${debugStats.loadBlockedNoLoader}, loadBlockedUnknown=${debugStats.loadBlockedUnknown}, rejectedBudget=${debugStats.rejectedGlobalBudget + debugStats.rejectedPointcloudBudget}, budgetBreaks=${debugStats.budgetBreaks}, permanentlyFailed=${debugStats.permanentlyFailed}, pointBudget=${pointBudget}`);
        }
    }
    for(let i = 0; i < pointclouds.length; i++){
        const pointcloud = pointclouds[i];
        const material = pointcloud.material;
        if (material.opacity < 1.0 && material.transparent) {
            const cameraPosition = camObjPositions[i];
            pointcloud.visibleNodes.sort((a, b)=>{
                const distA = a.getBoundingSphere().center.distanceTo(cameraPosition);
                const distB = b.getBoundingSphere().center.distanceTo(cameraPosition);
                return distB - distA;
            });
        }
    }
    for (const pointcloud of pointclouds){
        const lodProgress = lodProgressInPointclouds.get(pointcloud);
        pointcloud.updateViewLodProgress(lodProgress.ready, lodProgress.total, progressContext);
    }
    return {
        visibleNodes: visibleNodes,
        numVisiblePoints: numVisiblePoints,
        lowestSpacing: lowestSpacing,
        activity: {
            queuedForLoad: debugStats.queuedForLoad,
            loadsStarted,
            gpuUploads: debugStats.gpuUploads,
            gpuUploadBacklog: debugStats.gpuLimitHits + debugStats.loadedWaitingForParent,
            loadedWaitingForParent: debugStats.loadedWaitingForParent,
            queuedWaitingForParent: debugStats.queuedWaitingForParent,
            queueSize: unloadedGeometry.length
        },
        requiredGeometryNodes
    };
}
export { computeOrthographicPixelScale, startNodeLoads, updatePointClouds, updateVisibility, updateVisibilityStructures };
