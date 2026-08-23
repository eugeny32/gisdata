class WorkerPool {
    constructor(maxWorkers = 4){
        this.createdCount = {};
        this.waitQueue = {};
        this.createChain = {};
        this.workers = {};
        this.maxWorkers = maxWorkers;
    }
    getDiagnostics() {
        const urls = new Set([
            ...Object.keys(this.workers),
            ...Object.keys(this.createdCount),
            ...Object.keys(this.waitQueue)
        ]);
        let created = 0;
        let idle = 0;
        let waiters = 0;
        for (const url of urls){
            created += this.createdCount[url] ?? 0;
            idle += this.workers[url]?.length ?? 0;
            waiters += this.waitQueue[url]?.length ?? 0;
        }
        return {
            urlCount: urls.size,
            created,
            idle,
            leasedOrCreating: Math.max(0, created - idle),
            waiters,
            maxWorkersPerUrl: this.maxWorkers
        };
    }
    async getWorker(url) {
        if (!this.workers[url]) {
            this.workers[url] = [];
            this.createdCount[url] = 0;
            this.waitQueue[url] = [];
            this.createChain[url] = Promise.resolve();
        }
        if (this.workers[url].length > 0) return this.workers[url].pop();
        if (this.createdCount[url] < this.maxWorkers) {
            this.createdCount[url]++;
            const workerCreation = this.createChain[url].then(()=>this._createAndWaitReady(url));
            this.createChain[url] = workerCreation.then(()=>void 0, ()=>void 0);
            return workerCreation;
        }
        return new Promise((resolve)=>{
            this.waitQueue[url].push(resolve);
        });
    }
    returnWorker(url, worker) {
        const waiter = this.waitQueue[url]?.shift();
        if (waiter) waiter(worker);
        else if (this.workers[url]) this.workers[url].push(worker);
        else worker.terminate();
    }
    discardWorker(url, worker) {
        worker.terminate();
        if (this.createdCount[url] > 0) this.createdCount[url]--;
        const waiter = this.waitQueue[url]?.shift();
        if (waiter) this.getWorker(url).then(waiter);
    }
    dispose() {
        for(const url in this.workers)for (const worker of this.workers[url])worker.terminate();
        this.workers = {};
        this.createdCount = {};
        this.waitQueue = {};
        this.createChain = {};
    }
    _createAndWaitReady(url) {
        return new Promise((resolve, reject)=>{
            const worker = new Worker(url, {
                type: 'module'
            });
            const cleanup = ()=>{
                worker.removeEventListener('message', onMessage);
                worker.removeEventListener('error', onError);
            };
            const onMessage = (e)=>{
                if (e.data?.type === 'ready') {
                    cleanup();
                    resolve(worker);
                }
            };
            const onError = (e)=>{
                cleanup();
                worker.terminate();
                this.createdCount[url]--;
                reject(new Error(`Worker 创建失败 (${url}): ${e.message}`));
            };
            worker.addEventListener('message', onMessage);
            worker.addEventListener('error', onError);
        });
    }
}
export { WorkerPool };
