/**
 * Share3DViewer - Wrapper for @sharefe/share3d-engine
 * Provides a simple API for loading and viewing point clouds, 3DGS, and CAD data
 */

class Share3DViewer {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) throw new Error(Container not found: );
        this.options = { backgroundColor: options.backgroundColor || 0x1a1a2e, enableStats: options.enableStats || false, ...options };
        this.viewer = null;
        this.plugins = {};
        this.initialized = false;
        this.workerBaseUrl = options.workerBaseUrl || "/assets/share3d-engine/workers/";
    }

    async init() {
        if (this.initialized) return;
        await this._loadScripts();
        await this._waitForEngine();
        this.viewer = new share3dEngine.Viewer(this.container, {
            backgroundColor: this.options.backgroundColor, antialias: true, alpha: false, preserveDrawingBuffer: true
        });
        await this._addCorePlugins();
        if (this.options.enableStats) this._setupStats();
        this.initialized = true;
        return this;
    }

    async _loadScripts() {
        const scripts = [
            "/assets/share3d-engine/runtime.js", "/assets/share3d-engine/shared.js", "/assets/share3d-engine/core.js",
            "/assets/share3d-engine/viewer.js", "/assets/share3d-engine/plugins/pointCloud/index.js",
            "/assets/share3d-engine/plugins/gsplat/index.js", "/assets/share3d-engine/plugins/cad/index.js",
            "/assets/share3d-engine/plugins/tools/measure/index.js", "/assets/share3d-engine/plugins/tools/annotation/index.js",
            "/assets/share3d-engine/plugins/tools/clip/index.js", "/assets/share3d-engine/plugins/interaction/index.js",
            "/assets/share3d-engine/plugins/selection/index.js",
        ];
        for (const src of scripts) await this._loadScript(src);
    }

    _loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.type = "module"; script.src = src; script.onload = resolve; script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async _waitForEngine() {
        const maxWait = 5000, start = Date.now();
        while (typeof window.share3dEngine === "undefined") {
            if (Date.now() - start > maxWait) throw new Error("share3dEngine not loaded within timeout");
            await new Promise(r => setTimeout(r, 50));
        }
    }

    async _addCorePlugins() {
        const pointCloudPlugin = new share3dEngine.PointCloudPlugin({ workerBaseUrl: this.workerBaseUrl });
        this.viewer.addPlugin(pointCloudPlugin); this.plugins.pointCloud = pointCloudPlugin;
        try { const p = new share3dEngine.GsplatPlugin({ workerBaseUrl: this.workerBaseUrl }); this.viewer.addPlugin(p); this.plugins.gsplat = p; } catch (e) { console.warn("GsplatPlugin not available:", e); }
        try { const p = new share3dEngine.CadPlugin(); this.viewer.addPlugin(p); this.plugins.cad = p; } catch (e) { console.warn("CadPlugin not available:", e); }
        this.viewer.addPlugin(new share3dEngine.InteractionPlugin());
        this.viewer.addPlugin(new share3dEngine.SelectionPlugin());
        this.viewer.addPlugin(new share3dEngine.PickingPlugin());
        await this.viewer.start();
    }

    _setupStats() { if (typeof Stats !== "undefined") { this.stats = new Stats(); this.stats.showPanel(0); document.body.appendChild(this.stats.dom); this.viewer.on("render", () => this.stats.update()); } }

    async loadCOPC(url, options = {}) {
        if (!this.initialized) await this.init();
        const layer = await this.plugins.pointCloud.loadCOPC(url, { maxLevel: options.maxLevel || 8, pointSize: options.pointSize || 1.0, pointShape: options.pointShape || "circle", colorAttribute: options.colorAttribute || "rgb", ...options });
        if (layer.bounds) this.viewer.camera.fitBounds(layer.bounds, { padding: 50, duration: 1000 });
        return layer;
    }

    async loadLAZ(url, options = {}) { if (!this.initialized) await this.init(); return this.plugins.pointCloud.loadLAZ(url, options); }
    async load3DGS(url, options = {}) { if (!this.initialized) await this.init(); if (!this.plugins.gsplat) throw new Error("GsplatPlugin not available"); return this.plugins.gsplat.load(url, options); }
    async loadDXF(url, options = {}) { if (!this.initialized) await this.init(); if (!this.plugins.cad) throw new Error("CadPlugin not available"); return this.plugins.cad.loadDXF(url, options); }

    addMeasureTool() { if (!this.plugins.measure) { const t = new share3dEngine.MeasureTool(this.viewer); this.viewer.addPlugin(t); this.plugins.measure = t; } return this.plugins.measure; }
    addAnnotationTool() { if (!this.plugins.annotation) { const t = new share3dEngine.AnnotationTool(this.viewer); this.viewer.addPlugin(t); this.plugins.annotation = t; } return this.plugins.annotation; }
    addClipTool() { if (!this.plugins.clip) { const t = new share3dEngine.ClipTool(this.viewer); this.viewer.addPlugin(t); this.plugins.clip = t; } return this.plugins.clip; }

    setCamera(pos, target) { this.viewer.camera.setPosition(pos.x, pos.y, pos.z); if (target) this.viewer.camera.lookAt(target.x, target.y, target.z); }
    fitToBounds() { const b = this.viewer.getSceneBounds(); if (b) this.viewer.camera.fitBounds(b, { padding: 50 }); }
    screenshot(opts = {}) { return this.viewer.renderer.domElement.toDataURL("image/png", opts.quality || 0.9); }
    dispose() { if (this.viewer) { this.viewer.dispose(); this.viewer = null; } this.initialized = false; if (this.stats) { this.stats.dom.remove(); this.stats = null; } }

    if (typeof module !== "undefined" && module.exports) module.exports = Share3DViewer;
    else if (typeof window !== "undefined") window.Share3DViewer = Share3DViewer;
