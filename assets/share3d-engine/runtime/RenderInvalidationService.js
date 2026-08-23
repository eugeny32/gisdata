import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__ from "../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().getLogger('runtime:invalidation');
class RenderInvalidationService {
    setFrameRequestCallback(callback) {
        this.frameRequestCallback = callback;
        if (callback && this.dirty && !this.frameScheduled) callback();
    }
    invalidate(reason, options) {
        if (this.disposed) return;
        this.dirty = true;
        this.pendingReasons.push({
            reason,
            viewId: options?.viewId,
            detail: options?.detail,
            timestamp: performance.now()
        });
        this.requestFrameIfNeeded();
    }
    requestNextFrame(reason, options) {
        this.invalidate(reason, options);
    }
    consumeDirty() {
        const consumed = this.pendingReasons;
        this.pendingReasons = [];
        this.dirty = false;
        return consumed;
    }
    isDirty() {
        return this.dirty;
    }
    setFrameScheduled(scheduled) {
        this.frameScheduled = scheduled;
    }
    isFrameScheduled() {
        return this.frameScheduled;
    }
    registerActivitySource(source) {
        if (this.disposed) return {
            dispose: ()=>{}
        };
        const existing = this.activitySources.get(source.id);
        if (existing && existing !== source) log.warn(`替换已存在的渲染活动源: ${source.id}`);
        this.activitySources.set(source.id, source);
        return {
            dispose: ()=>{
                if (this.activitySources.get(source.id) === source) this.activitySources.delete(source.id);
            }
        };
    }
    collectActivity(context) {
        const reasons = [];
        const activeActivities = [];
        for (const source of Array.from(this.activitySources.values()))try {
            const report = source.getRenderActivity(context);
            if (!report?.needsNextFrame) continue;
            const sourceReasons = report.reasons?.length ? report.reasons : [
                source.id
            ];
            reasons.push(...sourceReasons);
            activeActivities.push({
                sourceId: source.id,
                reasons: sourceReasons
            });
        } catch (err) {
            log.warn(`渲染活动源查询失败: ${source.id}, reason=${err instanceof Error ? err.message : String(err)}`);
        }
        this.activeActivities = activeActivities;
        return {
            needsNextFrame: reasons.length > 0,
            reasons
        };
    }
    getDiagnostics() {
        return {
            dirty: this.dirty,
            frameScheduled: this.frameScheduled,
            pendingReasons: [
                ...this.pendingReasons
            ],
            activeActivities: this.activeActivities.map((activity)=>({
                    sourceId: activity.sourceId,
                    reasons: [
                        ...activity.reasons
                    ]
                }))
        };
    }
    dispose() {
        this.disposed = true;
        this.dirty = false;
        this.frameScheduled = false;
        this.frameRequestCallback = null;
        this.pendingReasons = [];
        this.activitySources.clear();
        this.activeActivities = [];
    }
    requestFrameIfNeeded() {
        if (this.frameScheduled) return;
        this.frameRequestCallback?.();
    }
    constructor(){
        this.dirty = false;
        this.frameScheduled = false;
        this.disposed = false;
        this.frameRequestCallback = null;
        this.pendingReasons = [];
        this.activitySources = new Map();
        this.activeActivities = [];
    }
}
export { RenderInvalidationService };
