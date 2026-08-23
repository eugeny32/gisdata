class GSplatParams {
    get lodBehindPenalty() {
        return this._lodBehindPenalty;
    }
    set lodBehindPenalty(value) {
        if (this._lodBehindPenalty !== value) {
            this._lodBehindPenalty = value;
            this.dirty = true;
        }
    }
    get lodRangeMin() {
        return this._lodRangeMin;
    }
    set lodRangeMin(value) {
        if (this._lodRangeMin !== value) {
            this._lodRangeMin = value;
            this.dirty = true;
        }
    }
    get lodRangeMax() {
        return this._lodRangeMax;
    }
    set lodRangeMax(value) {
        if (this._lodRangeMax !== value) {
            this._lodRangeMax = value;
            this.dirty = true;
        }
    }
    get lodUnderfillLimit() {
        return this._lodUnderfillLimit;
    }
    set lodUnderfillLimit(value) {
        if (this._lodUnderfillLimit !== value) {
            this._lodUnderfillLimit = value;
            this.dirty = true;
        }
    }
    get sortVisibilityCompact() {
        return this._sortVisibilityCompact;
    }
    set sortVisibilityCompact(value) {
        if (this._sortVisibilityCompact !== value) {
            this._sortVisibilityCompact = value;
            this.dirty = true;
        }
    }
    get sortVisibilityScreenCompact() {
        return this._sortVisibilityScreenCompact;
    }
    set sortVisibilityScreenCompact(value) {
        if (this._sortVisibilityScreenCompact !== value) {
            this._sortVisibilityScreenCompact = value;
            this.dirty = true;
        }
    }
    get sortVisibilityScreenMargin() {
        return this._sortVisibilityScreenMargin;
    }
    set sortVisibilityScreenMargin(value) {
        const nextValue = Number.isFinite(value) ? Math.max(0, value) : 1;
        if (this._sortVisibilityScreenMargin !== nextValue) {
            this._sortVisibilityScreenMargin = nextValue;
            this.dirty = true;
        }
    }
    get sortVisibilityBehindMargin() {
        return this._sortVisibilityBehindMargin;
    }
    set sortVisibilityBehindMargin(value) {
        const nextValue = Number.isFinite(value) ? Math.max(0, value) : 0.75;
        if (this._sortVisibilityBehindMargin !== nextValue) {
            this._sortVisibilityBehindMargin = nextValue;
            this.dirty = true;
        }
    }
    get sortVisibilityRotationRefreshAngle() {
        return this._sortVisibilityRotationRefreshAngle;
    }
    set sortVisibilityRotationRefreshAngle(value) {
        const nextValue = Number.isFinite(value) ? Math.max(0, value) : 12;
        if (this._sortVisibilityRotationRefreshAngle !== nextValue) {
            this._sortVisibilityRotationRefreshAngle = nextValue;
            this.dirty = true;
        }
    }
    get colorizeLod() {
        return this._colorizeLod;
    }
    set colorizeLod(value) {
        if (this._colorizeLod !== value) {
            this._colorizeLod = value;
            this.dirty = true;
        }
    }
    get colorRamp() {
        return this._colorRamp;
    }
    set colorRamp(value) {
        if (this._colorRamp !== value) {
            this._colorRamp = value;
            this.dirty = true;
        }
    }
    frameEnd() {
        this.dirty = false;
    }
    constructor(){
        this.maxCachePoints = 0;
        this.lodUpdateDistance = 1;
        this.lodUpdateAngle = 0;
        this._lodBehindPenalty = 1;
        this._lodRangeMin = 0;
        this._lodRangeMax = 10;
        this._lodUnderfillLimit = 0;
        this.cooldownTicks = 100;
        this.maxLoadsPerFrame = 0;
        this.worldStateUpdateInterval = 0;
        this.radialSorting = true;
        this._sortVisibilityCompact = false;
        this._sortVisibilityScreenCompact = false;
        this._sortVisibilityScreenMargin = 1;
        this._sortVisibilityBehindMargin = 0.75;
        this._sortVisibilityRotationRefreshAngle = 12;
        this.colorizeColorUpdate = false;
        this.colorUpdateDistance = 0.2;
        this.colorUpdateAngle = 2;
        this.colorUpdateDistanceLodScale = 2;
        this.colorUpdateAngleLodScale = 2;
        this.highQualitySH = false;
        this.debugAabbs = false;
        this.debugNodeAabbs = false;
        this._colorizeLod = false;
        this._colorRamp = null;
        this.colorRampIntensity = 1;
        this.dirty = false;
    }
}
export { GSplatParams };
