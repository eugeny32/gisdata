function setLayerRecursive(root, layer) {
    root.traverse((object)=>{
        object.layers.set(layer);
    });
}
function setMaskRecursive(root, mask) {
    root.traverse((object)=>{
        object.layers.mask = mask;
    });
}
function enableLayerRecursive(root, layer) {
    root.traverse((object)=>{
        object.layers.enable(layer);
    });
}
export { enableLayerRecursive, setLayerRecursive, setMaskRecursive };
