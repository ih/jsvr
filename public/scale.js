import * as DOM from "./dom-lib.js";

export default class Scale {
  constructor(element, type) {
    this.element = element;
    this.type = type;
    this.leftHand = document.getElementById('leftHand');
    this.rightHand = document.getElementById('rightHand');

    this.element.addEventListener('triggerdown', event => {
      const handId = event.detail.triggerHand.getAttribute('id');
      if (handId === 'leftHand') {
        this.leftGrab = true;
        this.lastHandDistance = this.distanceBetweenHands();
        // this.initialHandDistance = this.distanceBetweenHands();
      }
      if (handId === 'rightHand') {
        this.rightGrab = true;
        this.lastHandDistance = this.distanceBetweenHands();
        // this.initialHandDistance = this.distanceBetweenHands();
      }
    });

    this.rightHand.addEventListener('triggerup', event => {
      this.rightGrab = false;
      // const handId = event.detail.triggerHand.getAttribute('id');
      // if (handId === 'leftHand') {
      //   this.leftGrab = false;
      // }
      // if (handId === 'rightHand') {
      //   this.rightGrab = false;
      // }
    });

    this.leftHand.addEventListener('triggerup', event => {
      this.leftGrab = false;
    });

    // this.deltaPosition = null;
    // this.element.addEventListener("gripdown", event => {
    //   this.grabbingHand = event.detail.grabbingHand;
    //   this.gripping = true;
    //   this.deltaPosition = null;
    // });

    // this.element.addEventListener("gripup", () => {
    //   this.grabbingHand = null;
    //   this.gripping = false;
    //   this.deltaPosition = null;
    // });

    // TODO if constantly running setInterval is resource intensive
    // consider triggering setInterval only after both hands are gripping
    const intervalId = setInterval(() => {
      if (this.element === null) {
        clearInterval(intervalId);
      }
      if (!this.leftGrab || !this.rightGrab) {
        return;
      }

      const rootElement = this.type === '' ? this.element : DOM.farthest(this.element, this.type);
      rootElement.object3D.scale.addScalar(this.distanceBetweenHands() - this.lastHandDistance);
      this.lastHandDistance = this.distanceBetweenHands();
      // const scaleMultiplier = (this.distanceBetweenHands() - this.initialHandDistance) * .01;
      // rootElement.object3D.scale.addScalar(scaleMultiplier); 

      // const rootElement =
      //   this.type === "" ? this.element : DOM.farthest(this.element, this.type);
      // if (this.deltaPosition === null) {
      //   this.deltaPosition = new THREE.Vector3().subVectors(
      //     rootElement.object3D.position,
      //     this.grabbingHand.object3D.position
      //   );
      // }
      // rootElement.object3D.position.addVectors(
      //   this.grabbingHand.object3D.position,
      //   this.deltaPosition
      // );
    }, 10);
  }

  distanceBetweenHands() {
    const leftHandPosition = this.leftHand.object3D.position;
    const rightHandPosition = this.rightHand.object3D.position;

    return  leftHandPosition.distanceTo(rightHandPosition);
  }
}
