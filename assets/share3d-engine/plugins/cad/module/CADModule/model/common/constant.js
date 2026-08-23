var constant_rslib_entry_EntityType = /*#__PURE__*/ function(EntityType) {
    EntityType["Arc"] = "arc";
    EntityType["Spline"] = "spline";
    EntityType["Circle"] = "circle";
    EntityType["Polyline"] = "polyline";
    EntityType["Ellipse"] = "ellipse";
    EntityType["Ray"] = "ray";
    EntityType["Hatch"] = "hatch";
    EntityType["Text"] = "text";
    EntityType["MText"] = "mText";
    EntityType["AlignDimension"] = "alignDimension";
    EntityType["MLeader"] = "mLeader";
    EntityType["AngularDimension"] = "angularDimension";
    return EntityType;
}({});
var constant_rslib_entry_LineType = /*#__PURE__*/ function(LineType) {
    LineType["Solid"] = "solid";
    LineType["Dash"] = "dash";
    LineType["DashDot"] = "dashDot";
    LineType["DoubleDash"] = "doubleDash";
    return LineType;
}({});
var constant_rslib_entry_ColorMethod = /*#__PURE__*/ function(ColorMethod) {
    ColorMethod[ColorMethod["BY_LAYER"] = 0] = "BY_LAYER";
    ColorMethod[ColorMethod["BY_BLOCK"] = 1] = "BY_BLOCK";
    ColorMethod[ColorMethod["INDEX"] = 2] = "INDEX";
    ColorMethod[ColorMethod["RGB"] = 3] = "RGB";
    return ColorMethod;
}({});
export { constant_rslib_entry_ColorMethod as ColorMethod, constant_rslib_entry_EntityType as EntityType, constant_rslib_entry_LineType as LineType };
