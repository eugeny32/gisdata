function syncTextureUploadVersion(renderer, texture) {
    const extRenderer = renderer;
    const properties = extRenderer.properties?.get(texture);
    if (properties) properties.__version = texture.version;
    const source = texture.source;
    const sourceProperties = extRenderer.properties?.get(source);
    if (sourceProperties) sourceProperties.__version = source.version;
}
export { syncTextureUploadVersion };
