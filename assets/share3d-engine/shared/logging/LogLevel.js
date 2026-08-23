var LogLevel_rslib_entry_LogLevel = /*#__PURE__*/ function(LogLevel) {
    LogLevel[LogLevel["SILENT"] = 0] = "SILENT";
    LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG";
    return LogLevel;
}({});
const NAME_TO_LEVEL = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
};
const LEVEL_TO_NAME = {
    [0]: 'SILENT',
    [1]: 'ERROR',
    [2]: 'WARN',
    [3]: 'INFO',
    [4]: 'DEBUG'
};
function parseLogLevel(value, fallback = 2) {
    if ('number' == typeof value) return value;
    if ('string' == typeof value) {
        const level = NAME_TO_LEVEL[value.toLowerCase()];
        if (void 0 !== level) return level;
    }
    return fallback;
}
function logLevelName(level) {
    return LEVEL_TO_NAME[level] ?? String(level);
}
export { LogLevel_rslib_entry_LogLevel as LogLevel, logLevelName, parseLogLevel };
