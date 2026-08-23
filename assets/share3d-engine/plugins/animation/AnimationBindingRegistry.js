class AnimationBindingRegistry {
    register(kind, resolver) {
        if (!kind) throw new Error('Animation binding kind is required');
        if (this.resolvers.has(kind)) throw new Error(`Animation binding kind "${kind}" has already been registered`);
        this.resolvers.set(kind, resolver);
        return {
            dispose: ()=>{
                if (this.resolvers.get(kind) === resolver) this.resolvers.delete(kind);
            }
        };
    }
    resolve(targetRef) {
        const resolver = this.resolvers.get(targetRef.kind);
        return resolver?.resolve(targetRef) ?? null;
    }
    clear() {
        this.resolvers.clear();
    }
    constructor(){
        this.resolvers = new Map();
    }
}
export { AnimationBindingRegistry };
