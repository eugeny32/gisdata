import * as __WEBPACK_EXTERNAL_MODULE__constants_js_e283b470__ from "./constants.js";
class GSplatBudgetBalancer {
    initBuckets() {
        if (this.buckets) return;
        this.buckets = new Array(__WEBPACK_EXTERNAL_MODULE__constants_js_e283b470__.NUM_BUCKETS);
        for(let i = 0; i < __WEBPACK_EXTERNAL_MODULE__constants_js_e283b470__.NUM_BUCKETS; i++)this.buckets[i] = [];
    }
    balance(octreeInstances, budget) {
        this.initBuckets();
        const buckets = this.buckets;
        try {
            for(let i = 0; i < __WEBPACK_EXTERNAL_MODULE__constants_js_e283b470__.NUM_BUCKETS; i++)buckets[i].length = 0;
            let totalOptimalSplats = 0;
            for (const [, instance] of octreeInstances){
                const inst = instance;
                const nodes = inst.octree.nodes;
                const nodeInfos = inst.nodeInfos;
                for(let nodeIndex = 0, len = nodes.length; nodeIndex < len; nodeIndex++){
                    const nodeInfo = nodeInfos[nodeIndex];
                    const optimalLod = nodeInfo.optimalLod;
                    if (optimalLod < 0) continue;
                    const lods = nodes[nodeIndex].lods;
                    nodeInfo.lods = lods;
                    buckets[nodeInfo.budgetBucket].push(nodeInfo);
                    totalOptimalSplats += lods[optimalLod].count;
                }
            }
            let currentSplats = totalOptimalSplats;
            if (currentSplats === budget) return;
            const isOverBudget = currentSplats > budget;
            let done = false;
            while(!done && (isOverBudget ? currentSplats > budget : currentSplats < budget)){
                let modified = false;
                if (isOverBudget) for(let bucketIndex = __WEBPACK_EXTERNAL_MODULE__constants_js_e283b470__.NUM_BUCKETS - 1; bucketIndex >= 0 && !done; bucketIndex--){
                    const bucket = buckets[bucketIndex];
                    for(let i = 0, len = bucket.length; i < len; i++){
                        const nodeInfo = bucket[i];
                        if (nodeInfo.optimalLod < nodeInfo.inst.rangeMax) {
                            const lods = nodeInfo.lods;
                            const optimalLod = nodeInfo.optimalLod;
                            currentSplats -= lods[optimalLod].count - lods[optimalLod + 1].count;
                            nodeInfo.optimalLod = optimalLod + 1;
                            modified = true;
                            if (currentSplats <= budget) {
                                done = true;
                                break;
                            }
                        }
                    }
                }
                else for(let bucketIndex = 0; bucketIndex < __WEBPACK_EXTERNAL_MODULE__constants_js_e283b470__.NUM_BUCKETS && !done; bucketIndex++){
                    const bucket = buckets[bucketIndex];
                    for(let i = 0, len = bucket.length; i < len; i++){
                        const nodeInfo = bucket[i];
                        if (nodeInfo.optimalLod > nodeInfo.inst.rangeMin) {
                            const lods = nodeInfo.lods;
                            const optimalLod = nodeInfo.optimalLod;
                            const splatsAdded = lods[optimalLod - 1].count - lods[optimalLod].count;
                            if (currentSplats + splatsAdded <= budget) {
                                nodeInfo.optimalLod = optimalLod - 1;
                                currentSplats += splatsAdded;
                                modified = true;
                                if (currentSplats >= budget) {
                                    done = true;
                                    break;
                                }
                            } else {
                                done = true;
                                break;
                            }
                        }
                    }
                }
                if (!modified) break;
            }
        } finally{
            for(let i = 0; i < __WEBPACK_EXTERNAL_MODULE__constants_js_e283b470__.NUM_BUCKETS; i++)buckets[i].length = 0;
        }
    }
    constructor(){
        this.buckets = null;
    }
}
export { GSplatBudgetBalancer };
