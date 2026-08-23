import * as __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__ from "../parseHelpers.js";
class MLeaderEntityParser {
    parseEntity(scanner, curr) {
        const entity = {
            type: curr.value,
            branches: []
        };
        let currentBranch = null;
        let inContextData = false;
        let inLeader = false;
        let inLeaderLine = false;
        const ensureCurrentBranch = ()=>{
            currentBranch ??= {};
            if (!entity.branches.includes(currentBranch)) entity.branches.push(currentBranch);
            return currentBranch;
        };
        const finishCurrentBranch = ()=>{
            if (!currentBranch || !currentBranch.leaderLinePoints?.length) return;
            const leaderLinePoints = currentBranch.leaderLinePoints;
            currentBranch.arrowPoint = leaderLinePoints[0];
            const vertices = leaderLinePoints.slice(1);
            if (currentBranch.lastLeaderLinePoint) {
                currentBranch.elbowPoint = currentBranch.lastLeaderLinePoint;
                vertices.push(currentBranch.lastLeaderLinePoint);
            }
            const doglegLength = Math.abs(currentBranch.doglegLength ?? 0);
            if ((entity.hasLanding ?? true) && currentBranch.doglegVector && doglegLength > 1e-6) {
                const landingEndPoint = {
                    x: (currentBranch.lastLeaderLinePoint?.x ?? currentBranch.arrowPoint.x) + currentBranch.doglegVector.x * doglegLength,
                    y: (currentBranch.lastLeaderLinePoint?.y ?? currentBranch.arrowPoint.y) + currentBranch.doglegVector.y * doglegLength,
                    z: currentBranch.lastLeaderLinePoint?.z ?? currentBranch.arrowPoint.z
                };
                currentBranch.landingEndPoint = landingEndPoint;
                vertices.push(landingEndPoint);
            }
            currentBranch.vertices = vertices;
        };
        curr = scanner.next();
        while(!scanner.isEOF()){
            if (0 === curr.code) break;
            switch(curr.code){
                case 300:
                    if ('CONTEXT_DATA{' === curr.value) inContextData = true;
                    break;
                case 301:
                    if ('}' === curr.value) inContextData = false;
                    break;
                case 302:
                    if ('LEADER{' === curr.value) {
                        currentBranch = {};
                        entity.branches.push(currentBranch);
                        inLeader = true;
                        inLeaderLine = false;
                    }
                    break;
                case 303:
                    if ('}' === curr.value) {
                        finishCurrentBranch();
                        currentBranch = null;
                        inLeader = false;
                        inLeaderLine = false;
                    }
                    break;
                case 10:
                    if (inLeaderLine) {
                        ensureCurrentBranch().leaderLinePoints ??= [];
                        currentBranch.leaderLinePoints.push(__WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner));
                    } else if (inLeader) ensureCurrentBranch().lastLeaderLinePoint = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    else if (inContextData || void 0 === entity.textPosition) entity.textPosition = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    else __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    break;
                case 40:
                    if (inLeader) ensureCurrentBranch().doglegLength = curr.value;
                    else if (void 0 === entity.textHeight) entity.textHeight = curr.value;
                    break;
                case 41:
                    if (inContextData && !inLeader) entity.textHeight = curr.value;
                    break;
                case 90:
                    break;
                case 91:
                    break;
                case 11:
                    if (inLeader) ensureCurrentBranch().doglegVector = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    else if (currentBranch && !inContextData) {
                        currentBranch.arrowPoint = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                        if (!entity.branches.includes(currentBranch)) entity.branches.push(currentBranch);
                    } else __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    break;
                case 12:
                    if (!currentBranch || inLeader || inContextData) {
                        if (inContextData) {
                            const textLocation = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                            entity.textPosition = {
                                ...textLocation,
                                y: textLocation.y - (entity.textHeight ?? 0) / 2
                            };
                        } else __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    } else {
                        currentBranch.elbowPoint = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                        if (!entity.branches.includes(currentBranch)) entity.branches.push(currentBranch);
                    }
                    break;
                case 13:
                    if (!currentBranch || inLeader || inContextData) __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    else {
                        currentBranch.landingEndPoint = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                        if (!entity.branches.includes(currentBranch)) entity.branches.push(currentBranch);
                    }
                    break;
                case 145:
                    entity.landingGap = curr.value;
                    break;
                case 290:
                    if (!inLeader) entity.hasLanding = 0 !== curr.value;
                    break;
                case 304:
                    if (inLeader && 'LEADER_LINE{' === curr.value) {
                        ensureCurrentBranch().leaderLinePoints ??= [];
                        inLeaderLine = true;
                    } else if (!inLeader) entity.contents = entity.contents ? `${entity.contents}${curr.value}` : curr.value;
                    break;
                case 305:
                    if ('}' === curr.value) {
                        inLeaderLine = false;
                        finishCurrentBranch();
                    }
                    break;
                default:
                    __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        entity.branches = entity.branches.filter(Boolean);
        return entity;
    }
    constructor(){
        this.ForEntityName = 'MLEADER';
    }
}
class MultiLeaderEntityParser extends MLeaderEntityParser {
    constructor(...args){
        super(...args), this.ForEntityName = 'MULTILEADER';
    }
}
export { MultiLeaderEntityParser, MLeaderEntityParser as default };
