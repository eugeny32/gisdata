function createIdGenerator(prefix) {
    let counter = 0;
    return ()=>{
        counter++;
        return `${prefix}-${counter}-${Date.now()}`;
    };
}
export { createIdGenerator };
