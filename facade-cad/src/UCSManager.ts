/**
 * UCSManager — dynamic User Coordinate System anchored to a wall.
 *
 * Basis construction (two clicks on the isolated wall):
 *   X — click-1 → click-2, projected onto the horizontal plane. The
 *       projection keeps the basis orthonormal with the global up vector
 *       (walls are plumb, so this matches the physical wall axis).
 *   Y — global up (0, 1, 0).
 *   Z — X × Y → the wall normal.
 *
 * Every CAD entity is parented to `group`, whose matrix IS the UCS matrix.
 * Entities therefore store pure LOCAL coordinates with z = 0 (guaranteed
 * flat → trivially exportable to 2D CAD/DXF) and reach world space only
 * through `matrixWorld` during rendering — exactly once, on the GPU path.
 */
import * as THREE from 'three';

export class UCSManager {
  defined = false;
  readonly matrix = new THREE.Matrix4();
  readonly inverse = new THREE.Matrix4();
  readonly origin = new THREE.Vector3();
  readonly xAxis = new THREE.Vector3(1, 0, 0);
  readonly yAxis = new THREE.Vector3(0, 1, 0);
  readonly zAxis = new THREE.Vector3(0, 0, 1);

  /** Parent of all CAD entities; its matrix is the UCS → world transform. */
  readonly group = new THREE.Group();

  /** Active drafting plane in WORLD space. Ground plane until a UCS is set,
   *  then the wall plane — mouse rays are intersected against it. */
  readonly plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  /** RGB triad rendered at the UCS origin once defined. */
  readonly axesHelper: THREE.LineSegments;

  constructor() {
    this.group.matrixAutoUpdate = false;
    this.axesHelper = buildAxesTriad();
    this.axesHelper.matrixAutoUpdate = false;
    this.axesHelper.visible = false;
  }

  setFromPoints(p1: THREE.Vector3, p2: THREE.Vector3): void {
    this.xAxis.subVectors(p2, p1);
    this.xAxis.y = 0; // plumb-wall projection, see header comment
    if (this.xAxis.lengthSq() < 1e-8) this.xAxis.set(1, 0, 0);
    this.xAxis.normalize();
    this.yAxis.set(0, 1, 0);
    this.zAxis.crossVectors(this.xAxis, this.yAxis).normalize();
    this.origin.copy(p1);
    this.matrix.makeBasis(this.xAxis, this.yAxis, this.zAxis).setPosition(this.origin);
    this.finalize();
  }

  /** Back to the undefined/world state (e.g. when a new cloud is loaded). */
  reset(): void {
    this.defined = false;
    this.matrix.identity();
    this.inverse.identity();
    this.plane.normal.set(0, 1, 0);
    this.plane.constant = 0;
    this.group.matrix.identity();
    this.group.matrixWorldNeedsUpdate = true;
    this.axesHelper.visible = false;
  }

  /** Activate a previously saved UCS (multi-UCS switching). */
  setFromMatrix(m: THREE.Matrix4): void {
    this.matrix.copy(m);
    this.matrix.extractBasis(this.xAxis, this.yAxis, this.zAxis);
    this.origin.setFromMatrixPosition(this.matrix);
    this.finalize();
  }

  private finalize(): void {
    this.inverse.copy(this.matrix).invert();
    this.plane.setFromNormalAndCoplanarPoint(this.zAxis, this.origin);

    // matrixAutoUpdate is off on these objects — flag the world matrices
    // dirty by hand or the renderer will keep the stale transform.
    this.group.matrix.copy(this.matrix);
    this.group.matrixWorldNeedsUpdate = true;
    this.axesHelper.matrix.copy(this.matrix);
    this.axesHelper.matrixWorldNeedsUpdate = true;
    this.axesHelper.visible = true;

    this.defined = true;
  }

  worldToLocal(p: THREE.Vector3, out: THREE.Vector3): THREE.Vector3 {
    return out.copy(p).applyMatrix4(this.inverse);
  }

  localToWorld(p: THREE.Vector3, out: THREE.Vector3): THREE.Vector3 {
    return out.copy(p).applyMatrix4(this.matrix);
  }
}

function buildAxesTriad(): THREE.LineSegments {
  // X 2 m red, Y 1.4 m green, Z 0.7 m blue — proportions read as an axis
  // gizmo without labels.
  const positions = new Float32Array([0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1.4, 0, 0, 0, 0, 0, 0, 0.7]);
  const colors = new Float32Array([1, 0.3, 0.3, 1, 0.3, 0.3, 0.3, 1, 0.45, 0.3, 1, 0.45, 0.35, 0.55, 1, 0.35, 0.55, 1]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.LineBasicMaterial({ vertexColors: true, depthTest: false });
  const lines = new THREE.LineSegments(geo, mat);
  lines.renderOrder = 3;
  lines.frustumCulled = false;
  return lines;
}
