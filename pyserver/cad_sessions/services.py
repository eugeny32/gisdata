"""
Shared EntityJSON <-> PostGIS geometry conversion for FACADE·CAD and
TOPO·CAD session APIs (Фаза 6). Port of api/facade_cad_session.php and
api/topo_cad_session.php's entity_to_geom_sql()/row_to_entity() -- the PHP
originals duplicate this logic verbatim under different function names
only because two independently-`require`d PHP files can't share private
functions without a name collision; that constraint doesn't exist in
Python, so both views/urls import this one module.

EntityJSON (facade-cad/src/Entities.ts), the common engine's per-object
shape:
  pl (polyline): {k:'pl', pts:[x0,y0,x1,y1,...], closed, l}
  ci (circle):   {k:'ci', c:[x,y], r, l}
  ar (arc):      {k:'ar', c:[x,y], r, a0, sw, l}
  el (ellipse):  {k:'el', c:[x,y], rx, ry, rot, l}
  tx (text):     {k:'tx', a:[x,y], t, h, rot, l}
  pt (point):    {k:'pt', a:[x,y], lbl?, dev?, l}

Coordinates are local UCS meters (post-rotation), not geodetic -- geom is
stored with SRID 0, matching the PHP original's plain `GEOMETRY` column
(no ST_SetSRID). Only polyline gets a real LINESTRING; every other kind's
"geometry" is just its anchor/center point, with every parametric field
(radius, angles, text, height, rotation, label) in `extra` (JSONB) since
PostGIS has no circle/ellipse primitive.
"""

from django.contrib.gis.geos import GEOSGeometry, LineString, Point


def entity_to_geom(e: dict) -> tuple[GEOSGeometry, dict] | None:
    """EntityJSON -> (geometry, extra dict), or None if e['k'] is unrecognized
    or malformed (caller skips that one entity, same as the PHP original)."""
    k = e.get("k")
    if k == "pl":
        pts = e.get("pts") or []
        if len(pts) < 4 or len(pts) % 2 != 0:
            return None
        coords = [(float(pts[i]), float(pts[i + 1])) for i in range(0, len(pts), 2)]
        return LineString(coords, srid=0), {"closed": bool(e.get("closed", False))}
    if k == "ci":
        c = e["c"]
        return Point(float(c[0]), float(c[1]), srid=0), {"r": e.get("r", 0)}
    if k == "ar":
        c = e["c"]
        return Point(float(c[0]), float(c[1]), srid=0), {
            "r": e.get("r", 0), "a0": e.get("a0", 0), "sw": e.get("sw", 0),
        }
    if k == "el":
        c = e["c"]
        return Point(float(c[0]), float(c[1]), srid=0), {
            "rx": e.get("rx", 0), "ry": e.get("ry", 0), "rot": e.get("rot", 0),
        }
    if k == "tx":
        a = e["a"]
        return Point(float(a[0]), float(a[1]), srid=0), {
            "t": e.get("t", ""), "h": e.get("h", 0), "rot": e.get("rot", 0),
        }
    if k == "pt":
        a = e["a"]
        return Point(float(a[0]), float(a[1]), srid=0), {"lbl": e.get("lbl"), "dev": e.get("dev")}
    return None


def entity_row_to_json(kind: str, layer: str, geom: GEOSGeometry, extra: dict) -> dict | None:
    """Inverse of entity_to_geom(), for GET -- DB row -> EntityJSON."""
    extra = extra or {}
    if kind == "pl":
        pts = []
        for x, y in geom.coords:
            pts.append(x)
            pts.append(y)
        return {"k": "pl", "pts": pts, "closed": bool(extra.get("closed", False)), "l": layer}
    if kind == "ci":
        return {"k": "ci", "c": list(geom.coords), "r": extra.get("r", 0), "l": layer}
    if kind == "ar":
        return {
            "k": "ar", "c": list(geom.coords), "r": extra.get("r", 0),
            "a0": extra.get("a0", 0), "sw": extra.get("sw", 0), "l": layer,
        }
    if kind == "el":
        return {
            "k": "el", "c": list(geom.coords), "rx": extra.get("rx", 0),
            "ry": extra.get("ry", 0), "rot": extra.get("rot", 0), "l": layer,
        }
    if kind == "tx":
        return {
            "k": "tx", "a": list(geom.coords), "t": extra.get("t", ""),
            "h": extra.get("h", 0), "rot": extra.get("rot", 0), "l": layer,
        }
    if kind == "pt":
        out = {"k": "pt", "a": list(geom.coords), "l": layer}
        if "lbl" in extra:
            out["lbl"] = extra["lbl"]
        if "dev" in extra:
            out["dev"] = extra["dev"]
        return out
    return None
