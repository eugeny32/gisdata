let instance = null;
function readAs(buf, Type, offset, count) {
    count = void 0 === count || 0 === count ? 1 : count;
    let sub = buf.slice(offset, offset + Type.BYTES_PER_ELEMENT * count);
    let r = new Type(sub);
    if (void 0 === count || 1 === count) return r[0];
    let ret = [];
    for(let i = 0; i < count; i++)ret.push(r[i]);
    return ret;
}
function parseLASHeader(arraybuffer) {
    let o = {};
    o.pointsOffset = readAs(arraybuffer, Uint32Array, 96);
    o.pointsFormatId = readAs(arraybuffer, Uint8Array, 104);
    o.pointsStructSize = readAs(arraybuffer, Uint16Array, 105);
    o.pointsCount = readAs(arraybuffer, Uint32Array, 107);
    let start = 131;
    o.scale = readAs(arraybuffer, Float64Array, start, 3);
    start += 24;
    o.offset = readAs(arraybuffer, Float64Array, start, 3);
    start += 24;
    let bounds = readAs(arraybuffer, Float64Array, start, 6);
    start += 48;
    o.maxs = [
        bounds[0],
        bounds[2],
        bounds[4]
    ];
    o.mins = [
        bounds[1],
        bounds[3],
        bounds[5]
    ];
    return o;
}
function handleEvent(msg) {
    switch(msg.type){
        case 'open':
            try {
                instance = new Module.LASZip();
                let abInt = new Uint8Array(msg.arraybuffer);
                let buf = Module._malloc(msg.arraybuffer.byteLength);
                instance.arraybuffer = msg.arraybuffer;
                instance.buf = buf;
                Module.HEAPU8.set(abInt, buf);
                instance.open(buf, msg.arraybuffer.byteLength);
                instance.readOffset = 0;
                postMessage({
                    type: 'open',
                    status: 1
                });
            } catch (e) {
                postMessage({
                    type: 'open',
                    status: 0,
                    details: e
                });
            }
            break;
        case 'header':
            if (!instance) throw new Error('You need to open the file before trying to read header');
            let header = parseLASHeader(instance.arraybuffer);
            header.pointsFormatId &= 0x3f;
            instance.header = header;
            postMessage({
                type: 'header',
                status: 1,
                header: header
            });
            break;
        case 'read':
            if (!instance) throw new Error('You need to open the file before trying to read stuff');
            let count = msg.count;
            let skip = msg.skip;
            let o = instance;
            if (!o.header) throw new Error('You need to query header before reading, I maintain state that way, sorry :(');
            let pointsToRead = Math.min(count * skip, o.header.pointsCount - o.readOffset);
            let bufferSize = Math.ceil(pointsToRead / skip);
            let pointsRead = 0;
            let thisBuf = new Uint8Array(bufferSize * o.header.pointsStructSize);
            let bufRead = Module._malloc(o.header.pointsStructSize);
            for(let i = 0; i < pointsToRead; i++){
                o.getPoint(bufRead);
                if (i % skip === 0) {
                    let a = new Uint8Array(Module.HEAPU8.buffer, bufRead, o.header.pointsStructSize);
                    thisBuf.set(a, pointsRead * o.header.pointsStructSize, o.header.pointsStructSize);
                    pointsRead++;
                }
                o.readOffset++;
            }
            postMessage({
                type: 'header',
                status: 1,
                buffer: thisBuf.buffer,
                count: pointsRead,
                hasMoreData: o.readOffset < o.header.pointsCount
            });
            break;
        case 'close':
            if (null !== instance) {
                instance.delete();
                instance = null;
            }
            postMessage({
                type: 'close',
                status: 1
            });
            break;
    }
}
onmessage = function(event) {
    try {
        handleEvent(event.data);
    } catch (e) {
        postMessage({
            type: event.data.type,
            status: 0,
            details: e
        });
    }
};
