class ManualFrameClock {
    constructor(options){
        validatePositiveFinite(options.fps, 'fps');
        validatePositiveFinite(options.width, 'width');
        validatePositiveFinite(options.height, 'height');
        validatePositiveFinite(options.pixelRatio ?? 1, 'pixelRatio');
        if (void 0 !== options.startTimeSeconds) validateNonNegativeFinite(options.startTimeSeconds, 'startTimeSeconds');
        this.fps = options.fps;
        this.width = options.width;
        this.height = options.height;
        this.pixelRatio = options.pixelRatio ?? 1;
        this.startTimeSeconds = options.startTimeSeconds ?? 0;
    }
    frameAt(frameNumber, overrides = {}) {
        validateFrameNumber(frameNumber);
        const timestampSeconds = this.startTimeSeconds + frameNumber / this.fps;
        const deltaSeconds = 0 === frameNumber ? 0 : 1 / this.fps;
        return {
            frameNumber,
            timestampSeconds,
            deltaSeconds,
            width: this.width,
            height: this.height,
            pixelRatio: this.pixelRatio,
            ...overrides
        };
    }
}
function createManualFrameClock(options) {
    return new ManualFrameClock(options);
}
function validateFrameNumber(value) {
    if (!Number.isInteger(value) || value < 0) throw new Error('ManualFrameClock frameNumber must be a non-negative integer.');
}
function validatePositiveFinite(value, name) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`ManualFrameClock ${name} must be a positive finite number.`);
}
function validateNonNegativeFinite(value, name) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`ManualFrameClock ${name} must be a non-negative finite number.`);
}
export { ManualFrameClock, createManualFrameClock };
