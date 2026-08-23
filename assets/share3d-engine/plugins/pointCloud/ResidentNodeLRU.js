class ResidentNodeLRUItem {
    constructor(node){
        this.node = node;
        this.previous = null;
        this.next = null;
    }
}
class ResidentNodeLRU {
    get size() {
        return this.items.size;
    }
    add(node) {
        if (this.items.has(node)) return;
        const item = new ResidentNodeLRUItem(node);
        item.previous = this.last;
        if (this.last) this.last.next = item;
        else this.first = item;
        this.last = item;
        this.items.set(node, item);
    }
    touch(node) {
        const item = this.items.get(node);
        if (!item) {
            this.add(node);
            return;
        }
        if (item === this.last) return;
        if (item.previous) item.previous.next = item.next;
        else this.first = item.next;
        if (item.next) item.next.previous = item.previous;
        item.previous = this.last;
        item.next = null;
        this.last.next = item;
        this.last = item;
    }
    remove(node) {
        const item = this.items.get(node);
        if (!item) return;
        if (item.previous) item.previous.next = item.next;
        else this.first = item.next;
        if (item.next) item.next.previous = item.previous;
        else this.last = item.previous;
        this.items.delete(node);
    }
    createOldestFirstCursor() {
        let item = this.first;
        return {
            next: ()=>{
                if (!item) return null;
                const current = item;
                item = current.next;
                return current.node;
            }
        };
    }
    oldestFirst() {
        const nodes = [];
        let item = this.first;
        while(item){
            nodes.push(item.node);
            item = item.next;
        }
        return nodes;
    }
    clear() {
        this.items.clear();
        this.first = null;
        this.last = null;
    }
    constructor(){
        this.first = null;
        this.last = null;
        this.items = new Map();
    }
}
export { ResidentNodeLRU };
