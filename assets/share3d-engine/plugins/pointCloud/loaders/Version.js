class Version {
    constructor(version){
        this.version = version;
        const vmLength = -1 === version.indexOf('.') ? version.length : version.indexOf('.');
        this.versionMajor = parseInt(version.substr(0, vmLength), 10);
        this.versionMinor = parseInt(version.substr(vmLength + 1), 10);
        if (0 === this.versionMinor.length) this.versionMinor = 0;
    }
    newerThan(version) {
        const v = new Version(version);
        if (this.versionMajor > v.versionMajor) return true;
        if (this.versionMajor === v.versionMajor && this.versionMinor > v.versionMinor) return true;
        return false;
    }
    equalOrHigher(version) {
        const v = new Version(version);
        if (this.versionMajor > v.versionMajor) return true;
        if (this.versionMajor === v.versionMajor && this.versionMinor >= v.versionMinor) return true;
        return false;
    }
    upTo(version) {
        return !this.newerThan(version);
    }
}
export { Version };
