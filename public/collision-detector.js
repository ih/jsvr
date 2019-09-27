/* global THREE */

class CollisionDetector {
  constructor(element) {
    this.element = element;
    this.mesh = this.element.getObject3D('mesh');
    // this is reused by both the element for this collider
    // as well for any element it is being checked for collisions with
    this.selfBoundingBox = new THREE.Box3();
    this.otherBoundingBox = new THREE.Box3();
    this.elementMax = new THREE.Vector3();
    this.elementMin = new THREE.Vector3();
    this.updateBounds();
  }

  isIntersecting(otherElement) {
    let otherMesh = otherElement.getObject3D('mesh');
    this.otherBoundingBox.setFromObject(otherMesh);
    return this.selfBoundingBox.intersectsBox(this.otherBoundingBox);
  }

  updateBounds() {
    const mesh = this.element.getObject3D('mesh');
    if (!mesh) {
      return;
    }
    this.selfBoundingBox.setFromObject(mesh);
  }
}