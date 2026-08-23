function buildWorkBufferCopySegments(options) {
    const textureWidth = Math.floor(options.textureWidth);
    const lineStart = Math.floor(options.lineStart);
    let remaining = Math.floor(options.activeSplats);
    let targetOffset = Math.floor(options.targetOffset ?? 0);
    let sourceBase = Math.floor(options.sourceBase ?? targetOffset);
    if (textureWidth <= 0 || remaining <= 0 || lineStart < 0 || targetOffset < 0) return [];
    if (options.includeTrailingPadding && 0 === targetOffset && 0 === sourceBase) {
        const fullRows = Math.floor(remaining / textureWidth);
        const tail = remaining % textureWidth;
        if (fullRows > 0 && tail > 0) return [
            {
                sourceBase,
                targetOffset,
                count: remaining,
                textureWidth,
                lineStart,
                x: 0,
                y: lineStart,
                width: textureWidth,
                height: fullRows + 1
            }
        ];
    }
    const segments = [];
    while(remaining > 0){
        const x = targetOffset % textureWidth;
        const localY = Math.floor(targetOffset / textureWidth);
        let count;
        let width;
        let height;
        if (0 === x && remaining >= textureWidth) {
            const fullRows = Math.floor(remaining / textureWidth);
            count = fullRows * textureWidth;
            width = textureWidth;
            height = fullRows;
        } else {
            count = Math.min(remaining, textureWidth - x);
            width = count;
            height = 1;
        }
        segments.push({
            sourceBase,
            targetOffset,
            count,
            textureWidth,
            lineStart,
            x,
            y: lineStart + localY,
            width,
            height
        });
        remaining -= count;
        targetOffset += count;
        sourceBase += count;
    }
    return segments;
}
function getWorkBufferCopyArea(segments) {
    let area = 0;
    for (const segment of segments)area += segment.width * segment.height;
    return area;
}
export { buildWorkBufferCopySegments, getWorkBufferCopyArea };
