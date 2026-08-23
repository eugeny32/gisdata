class Layer {
    static #_ = this.nextId = 0;
    constructor(name){
        this.enabled = true;
        this.gsplatPlacements = [];
        this.gsplatPlacementsSet = new Set();
        this.gsplatPlacementsDirty = false;
        this.name = name;
        this.id = Layer.nextId++;
    }
    addGSplatPlacement(placement) {
        if (!this.gsplatPlacementsSet.has(placement)) {
            this.gsplatPlacements.push(placement);
            this.gsplatPlacementsSet.add(placement);
            this.gsplatPlacementsDirty = true;
        }
    }
    removeGSplatPlacement(placement) {
        if (this.gsplatPlacementsSet.has(placement)) {
            const index = this.gsplatPlacements.indexOf(placement);
            if (-1 !== index) this.gsplatPlacements.splice(index, 1);
            this.gsplatPlacementsSet.delete(placement);
            this.gsplatPlacementsDirty = true;
        }
    }
    clearGSplatPlacements() {
        if (this.gsplatPlacements.length > 0) {
            this.gsplatPlacements.length = 0;
            this.gsplatPlacementsSet.clear();
            this.gsplatPlacementsDirty = true;
        }
    }
    hasGSplatPlacement(placement) {
        return this.gsplatPlacementsSet.has(placement);
    }
}
export { Layer };
