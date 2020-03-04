import * as DOM from "./dom-lib.js";

export default class Grab {
  constructor(element, type) {
    this.element = element;
    this.type = type;

    this.deltaPosition = null;
    this.element.addEventListener("gripdown", event => {
      this.grabbingHand = event.detail.grabbingHand;
      this.gripping = true;
      this.deltaPosition = null;
    });

    this.element.addEventListener("gripup", () => {
      this.grabbingHand = null;
      this.gripping = false;
      this.deltaPosition = null;
    });

    // TODO this can be optimized by only creating a setInterval
    // on gripdown instead of constantly polling
    // on gripup it can be destroyed/cleared
    const intervalId = setInterval(() => {
      if (this.element === null) {
        clearInterval(intervalId);
      }
      if (!this.gripping) {
        return;
      }
      const rootElement =
        this.type === "" ? this.element : DOM.farthest(this.element, this.type);
      // TODO move setting deltaPosition into the grab event?
      if (this.deltaPosition === null) {
        this.deltaPosition = new THREE.Vector3().subVectors(
          rootElement.object3D.position,
          this.grabbingHand.object3D.position
        );
      }
      // set the element to be the same position of the hand
      // but offset by the difference between where the object was
      // grabbed and its center
      rootElement.object3D.position.addVectors(
        this.grabbingHand.object3D.position,
        this.deltaPosition
      );
    }, 10);
  }
}
