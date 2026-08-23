class StreamBuf {
    constructor(reader, progressFunc){
        this.data = null;
        this.view = null;
        this.head = 0;
        this.tail = 0;
        this.reader = reader;
        this.progressFunc = progressFunc;
    }
    async read() {
        const { value, done } = await this.reader.read();
        if (done) throw new Error('Stream finished before end of data');
        this.push(value);
        this.progressFunc?.(value.byteLength);
    }
    push(data) {
        if (this.data) {
            const remaining = this.tail - this.head;
            const newSize = remaining + data.length;
            if (this.data.length >= newSize) {
                if (this.head > 0) {
                    this.data.copyWithin(0, this.head, this.tail);
                    this.data.set(data, remaining);
                    this.head = 0;
                    this.tail = newSize;
                } else {
                    this.data.set(data, this.tail);
                    this.tail += data.length;
                }
            } else {
                const tmp = new Uint8Array(newSize);
                if (this.head > 0 || this.tail < this.data.length) tmp.set(this.data.subarray(this.head, this.tail), 0);
                else tmp.set(this.data, 0);
                tmp.set(data, remaining);
                this.data = tmp;
                this.view = new DataView(this.data.buffer);
                this.head = 0;
                this.tail = newSize;
            }
        } else {
            this.data = data;
            this.view = new DataView(this.data.buffer);
            this.tail = data.length;
        }
    }
    compact() {
        if (this.head > 0 && this.data) {
            this.data.copyWithin(0, this.head, this.tail);
            this.tail -= this.head;
            this.head = 0;
        }
    }
    get remaining() {
        return this.tail - this.head;
    }
    getInt8() {
        if (!this.view) throw new Error('StreamBuf not initialized');
        const result = this.view.getInt8(this.head);
        this.head++;
        return result;
    }
    getUint8() {
        if (!this.view) throw new Error('StreamBuf not initialized');
        const result = this.view.getUint8(this.head);
        this.head++;
        return result;
    }
    getInt16() {
        if (!this.view) throw new Error('StreamBuf not initialized');
        const result = this.view.getInt16(this.head, true);
        this.head += 2;
        return result;
    }
    getUint16() {
        if (!this.view) throw new Error('StreamBuf not initialized');
        const result = this.view.getUint16(this.head, true);
        this.head += 2;
        return result;
    }
    getInt32() {
        if (!this.view) throw new Error('StreamBuf not initialized');
        const result = this.view.getInt32(this.head, true);
        this.head += 4;
        return result;
    }
    getUint32() {
        if (!this.view) throw new Error('StreamBuf not initialized');
        const result = this.view.getUint32(this.head, true);
        this.head += 4;
        return result;
    }
    getFloat32() {
        if (!this.view) throw new Error('StreamBuf not initialized');
        const result = this.view.getFloat32(this.head, true);
        this.head += 4;
        return result;
    }
    getFloat64() {
        if (!this.view) throw new Error('StreamBuf not initialized');
        const result = this.view.getFloat64(this.head, true);
        this.head += 8;
        return result;
    }
    get buffer() {
        return this.data;
    }
}
export { StreamBuf };
