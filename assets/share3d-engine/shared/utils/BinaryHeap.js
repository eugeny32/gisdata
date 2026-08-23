class BinaryHeap {
    constructor(scoreFunction){
        this.content = [];
        this.scoreFunction = scoreFunction;
    }
    getSafeScore(score) {
        return Number.isFinite(score) ? score : Number.MAX_VALUE;
    }
    push(element) {
        this.content.push(element);
        this.bubbleUp(this.content.length - 1);
    }
    pop() {
        const result = this.content[0];
        const end = this.content.pop();
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }
    remove(node) {
        const length = this.content.length;
        for(let i = 0; i < length; i++){
            if (this.content[i] !== node) continue;
            const end = this.content.pop();
            if (i === length - 1) break;
            this.content[i] = end;
            this.bubbleUp(i);
            this.sinkDown(i);
            break;
        }
    }
    size() {
        return this.content.length;
    }
    *[Symbol.iterator]() {
        for (const item of this.content)yield item;
    }
    clear() {
        this.content = [];
    }
    removeAll(predicate) {
        const removed = [];
        for(let i = this.content.length - 1; i >= 0; i--)if (predicate(this.content[i])) {
            removed.push(this.content[i]);
            this.remove(this.content[i]);
        }
        return removed;
    }
    bubbleUp(n) {
        const element = this.content[n];
        const score = this.getSafeScore(this.scoreFunction(element));
        while(n > 0){
            const parentN = Math.floor((n + 1) / 2) - 1;
            const parent = this.content[parentN];
            if (score >= this.getSafeScore(this.scoreFunction(parent))) break;
            this.content[parentN] = element;
            this.content[n] = parent;
            n = parentN;
        }
    }
    sinkDown(n) {
        const length = this.content.length;
        const element = this.content[n];
        const elemScore = this.getSafeScore(this.scoreFunction(element));
        let child1Score = 0;
        while(true){
            const child2N = (n + 1) * 2;
            const child1N = child2N - 1;
            let swap = null;
            child1Score = 0;
            if (child1N < length) {
                const child1 = this.content[child1N];
                child1Score = this.getSafeScore(this.scoreFunction(child1));
                if (child1Score < elemScore) swap = child1N;
            }
            if (child2N < length) {
                const child2 = this.content[child2N];
                const child2Score = this.getSafeScore(this.scoreFunction(child2));
                if (child2Score < (null == swap ? elemScore : child1Score)) swap = child2N;
            }
            if (null == swap) break;
            this.content[n] = this.content[swap];
            this.content[swap] = element;
            n = swap;
        }
    }
}
export { BinaryHeap };
