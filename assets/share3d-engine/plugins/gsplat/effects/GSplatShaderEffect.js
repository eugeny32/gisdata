class GSplatShaderEffect {
    constructor(options = {}){
        this.effectTime = 0;
        this._enabled = false;
        this._destroyed = false;
        this._shadersNeedApplication = false;
        this._activeConfig = null;
        this.id = options.id;
        this.material = options.material ?? null;
        this.uniforms = {
            ...options.uniforms ?? {}
        };
        this.defines = options.defines;
        this.scope = options.scope ?? 'material';
        this._enabled = options.enabled ?? true;
        this._shadersNeedApplication = this._enabled;
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        if (value) this.enable();
        else this.disable();
    }
    get destroyed() {
        return this._destroyed;
    }
    setMaterial(material) {
        if (this._destroyed || this.material === material) {
            if (this._enabled && this.material && this._shadersNeedApplication) return this.applyShaders();
            return false;
        }
        this.removeShaders();
        this.material = material;
        if (this._enabled) return this.applyShaders();
        return false;
    }
    enable(material) {
        if (this._destroyed) return false;
        const wasEnabled = this._enabled;
        let materialApplied = false;
        if (void 0 !== material) materialApplied = this.setMaterial(material);
        this._enabled = true;
        if (!wasEnabled) this.effectTime = 0;
        if (wasEnabled && materialApplied) return true;
        return this.applyShaders();
    }
    disable() {
        if (this._destroyed) return false;
        this._enabled = false;
        this._shadersNeedApplication = false;
        return this.removeShaders();
    }
    restart() {
        if (this._destroyed) return false;
        this.effectTime = 0;
        this._enabled = true;
        return this.applyShaders();
    }
    applyShaders(material) {
        if (this._destroyed) return false;
        if (void 0 !== material) {
            if (this.material !== material) {
                this.removeShaders();
                this.material = material;
            }
        }
        const materialRef = this.material;
        if (!materialRef) {
            this._shadersNeedApplication = true;
            return false;
        }
        const config = this.createShaderEffectConfig();
        this._activeConfig = config;
        materialRef.setShaderEffect(config);
        this._shadersNeedApplication = false;
        this.updateEffect(this.effectTime, 0);
        return true;
    }
    removeShaders() {
        if (!this.material) {
            this._activeConfig = null;
            return false;
        }
        if (this._activeConfig) this.material.clearShaderEffect(this._activeConfig);
        this._activeConfig = null;
        return true;
    }
    update(dt) {
        if (this._destroyed || !this._enabled) return;
        if (!this.material) {
            this._shadersNeedApplication = true;
            return;
        }
        if (this._shadersNeedApplication) {
            this.applyShaders();
            if (!this.material) return;
        }
        const delta = Number.isFinite(dt) ? Math.max(0, dt) : 0;
        if (delta > 0) this.effectTime += delta;
        this.updateEffect(this.effectTime, delta);
    }
    setElapsedTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) throw new Error('GSplat shader effect elapsed time must be a non-negative finite number.');
        if (this._destroyed) return;
        this.effectTime = seconds;
        this.syncUniforms();
    }
    syncUniforms() {
        if (this._destroyed || !this._enabled) return;
        if (!this.material) {
            this._shadersNeedApplication = true;
            return;
        }
        if (this._shadersNeedApplication) {
            this.applyShaders();
            return;
        }
        this.updateEffect(this.effectTime, 0);
    }
    setUniform(name, value) {
        const uniform = this.uniforms[name];
        if (uniform) uniform.value = value;
        else this.uniforms[name] = {
            value
        };
        return this.material?.setShaderEffectUniform(name, value) ?? false;
    }
    finishWithShadersAttached() {
        if (this._destroyed) return;
        if (this.material && this._activeConfig) this.material.deactivateShaderEffect(this._activeConfig);
        this._enabled = false;
        this._shadersNeedApplication = false;
    }
    destroy() {
        if (this._destroyed) return;
        this.disable();
        this._destroyed = true;
        this.onDestroy();
    }
    createShaderEffectConfig() {
        return {
            id: this.id,
            glsl: this.getShaderGLSL(),
            uniforms: this.uniforms,
            defines: this.defines,
            scope: this.scope
        };
    }
    getShaderWGSL() {
        return this.getShaderGLSL();
    }
    updateEffect(_effectTime, _dt) {}
    onDestroy() {}
}
export { GSplatShaderEffect };
