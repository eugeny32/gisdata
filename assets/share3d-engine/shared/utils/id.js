function generateId() {
    if ('undefined' != typeof crypto && 'function' == typeof crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c)=>{
        const r = 16 * Math.random() | 0;
        const v = 'x' === c ? r : 0x3 & r | 0x8;
        return v.toString(16);
    });
}
export { generateId };
