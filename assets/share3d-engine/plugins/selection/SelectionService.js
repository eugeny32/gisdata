class SelectionServiceImpl {
    constructor(eventBus){
        this.items = [];
        this.eventBus = eventBus;
    }
    get selected() {
        return this.snapshot();
    }
    get hasSelection() {
        return this.items.length > 0;
    }
    set(items) {
        const normalized = this.normalize(items);
        if (this.isSameSet(normalized)) return;
        const previous = this.snapshot();
        this.items = normalized;
        this.emitChanged(previous);
    }
    add(items) {
        const toAdd = this.normalize(items).filter((item)=>!this.items.some((s)=>s.assetId === item.assetId));
        if (0 === toAdd.length) return;
        const previous = this.snapshot();
        this.items = this.items.concat(toAdd);
        this.emitChanged(previous);
    }
    remove(predicate) {
        const filtered = this.items.filter((item)=>!predicate(item));
        if (filtered.length === this.items.length) return;
        const previous = this.snapshot();
        this.items = filtered;
        this.emitChanged(previous);
    }
    clear() {
        if (0 === this.items.length) return;
        const previous = this.snapshot();
        this.items = [];
        this.emitChanged(previous);
    }
    toggle(item) {
        const exists = this.items.some((selected)=>selected.assetId === item.assetId);
        const previous = this.snapshot();
        if (exists) this.items = this.items.filter((selected)=>selected.assetId !== item.assetId);
        else this.items = this.items.concat(item);
        this.emitChanged(previous);
    }
    dispose() {
        this.items = [];
    }
    snapshot() {
        return this.items.slice();
    }
    normalize(items) {
        const assetIds = new Set();
        return items.filter((item)=>{
            if (assetIds.has(item.assetId)) return false;
            assetIds.add(item.assetId);
            return true;
        });
    }
    emitChanged(previous) {
        this.eventBus.emit('selection.changed', {
            selected: this.items.slice(),
            previous
        });
    }
    isSameSet(items) {
        if (items.length !== this.items.length) return false;
        for(let i = 0; i < items.length; i++)if (items[i].assetId !== this.items[i].assetId) return false;
        return true;
    }
}
export { SelectionServiceImpl };
