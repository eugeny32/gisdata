/**
 * TourViewerCompat - Compatibility layer for Share3DViewer
 * Provides the same API as the old TourViewer (from tour-viewer.js)
 * but uses Share3DViewer under the hood.
 * 
 * This allows existing tour_view.html JavaScript to work unchanged
 * while using the new share3d-engine under the hood.
 */

class TourViewerCompat {
    constructor() {
        this.viewer = null;
        this.initialized = false;
        this.loadedLayers = [];
        this.settings = {
            fov: 60,
            exposure: 1.0,
            nearClip: 0.1,
            farClip: 10000,
            projection: "perspective",
            navigationMode: "orbit",
            orbitSensitivity: 1.0,
            moveSpeed: 1.0,
            zoomSpeed: 1.0,
            pointSizePx: 1.0,
            colorMode: "rgb",
            pointBudget: 5000000,
            edlEnabled: true,
            showStats: false,
            clipEnabled: false,
            sectionEnabled: false,
            clipMin: [0, 0, 0],
            clipMax: [1, 1, 1],
            sectionNormal: [0, 0, 1],
            sectionD: 0,
        };
        this.annotations = new Map();
        this.layers = new Map();
        this.drawingTool = null;
        this.drawingPoints = [];
        this.selectedAnnotation = null;
    }

    async load(urls, modelType, copcUrls = [], sogUrls = [], collisionUrl = null) {
        if (!this.viewer) {
            await this._initViewer();
        }

        for (const url of urls) {
            if (url.endsWith('.copc.laz') || url.endsWith('.laz') || url.endsWith('.las')) {
                await this._loadPointCloud(url);
            } else if (url.endsWith('.splat') || url.endsWith('.ksplat')) {
                await this._load3DGS(url);
            }
        }

        for (const url of copcUrls) {
            await this._loadPointCloud(url);
        }

        for (const url of sogUrls) {
            await this._loadSOG(url);
        }

        this.viewer.fitToBounds();
    }

    async _initViewer() {
        if (window.Share3DViewer) {
            this.viewer = new window.Share3DViewer("#tourViewerContainer", {
                backgroundColor: 0x0b0d10,
                enableStats: this.settings.showStats,
            });
            await this.viewer.init();
        } else {
            await this._waitForShare3DViewer();
            this.viewer = new window.Share3DViewer("#tourViewerContainer", {
                backgroundColor: 0x0b0d10,
                enableStats: this.settings.showStats,
            });
            await this.viewer.init();
        }

        this.viewer.addMeasureTool();
        this.viewer.addAnnotationTool();
        this.viewer.addClipTool();
    }

    async _waitForShare3DViewer() {
        const maxWait = 10000;
        const start = Date.now();
        while (typeof window.Share3DViewer === "undefined") {
            if (Date.now() - start > 10000) {
                throw new Error("Share3DViewer not loaded within timeout");
            }
            await new Promise(r => setTimeout(r, 50));
        }
    }

    async _loadPointCloud(url) {
        if (!this.viewer) await this._initViewer();
        const layer = await this.viewer.loadCOPC(url);
        this.loadedLayers.push({ url, layer, type: 'pointcloud' });
    }

    async _load3DGS(url) {
        if (!this.viewer) await this._initViewer();
        const layer = await this.viewer.load3DGS(url);
        this.loadedLayers.push({ url, layer, type: '3dgs' });
    }

    async _loadSOG(url) {
        await this._loadPointCloud(url);
    }

    load(urls, modelType, copcUrls = [], sogUrls = [], collisionUrl = null) {
        return this.load(urls, modelType, copcUrls, sogUrls, null);
    }

    setSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this._applySettings();
    }

    _applySettings() {
        if (!this.viewer) return;
        const s = this.settings;

        if (this.viewer.viewer && this.viewer.viewer.camera) {
            if (s.fov !== undefined) this.viewer.viewer.camera.fov = s.fov;
            if (s.nearClip !== undefined) this.viewer.viewer.camera.near = s.nearClip;
            if (s.farClip !== undefined) this.viewer.viewer.camera.far = s.farClip;
            if (s.projection) {
                this.viewer.viewer.camera.projection = s.projection === "orthographic" ? "orthographic" : "perspective";
            }
        }
    }

    getSettings() {
        return { ...this.settings };
    }

    setSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this._applySettings();
    }

    recenter() {
        if (this.viewer) {
            this.viewer.fitToBounds();
        }
    }

    // Annotation API stubs
    pickAnnotationVertex(x, y) { return null; }
    pickPoint(x, y) { return null; }
    pickGroundPoint(x, y) { return null; }
    pickAnnotationVertex(x, y) { return null; }
    setDrawingPreview(points, color) { }
    setSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this._applySettings();
    }
    getSettings() { return { ...this.settings }; }
    recenter() { if (this.viewer) this.viewer.fitToBounds(); }
    load(urls, modelType, copcUrls = [], sogUrls = [], collisionUrl = null) {
        return this.load(urls, modelType, copcUrls, sogUrls, null);
    }
}

// Export for global access
window.TourViewer = new TourViewerCompat();

// Also expose Share3DViewer directly for new code
if (typeof window.Share3DViewer !== "undefined") {
    window.Share3DViewer = window.Share3DViewer;
}
