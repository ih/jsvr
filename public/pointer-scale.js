import * as DOM from "./dom-lib.js";

export default class PointerScale {
  constructor(element, type) {
    this.element = element;
    this.type = type;

    this.leftHand = document.getElementById('leftHand');
    this.rightHand = document.getElementById('rightHand');

    this.element.classList.add('pointable');

    this.select = this.select.bind(this);
    this.grab = this.grab.bind(this);
    this.deselect = this.deselect.bind(this);

    // TODO create custom events for the different pointers
    // and listen to those
    this.element.addEventListener('click', this.select); 
  }

  select(event) {
    const pointer = event.detail.cursorEl.dataRepresentation;
    // don't do anything if the pointer is in some other mode like
    // destroy
    if (pointer.getMode() !== 'creation') {
      return;
    }
    this.rootElement =
      this.type === "" ? this.element : DOM.farthest(this.element, this.type);

    this.highlightRootElement();


    // stop watching for grip if the element is unselected
    this.leftHand.addEventListener('gripdown', this.grab);
    this.rightHand.addEventListener('gripdown', this.grab);

    this.leftHand.addEventListener('triggerdown', this.deselect);
    this.rightHand.addEventListener('triggerdown', this.deselect);

    // move the object based on the difference in hand
    // position from when grabbing started
    this.intervalId = setInterval(() => {
      // TODO set isGrabbing to false if non-active hand grabs so
      // scaling action takes over
      if (!this.leftHand.isGripping || !this.rightHand.isGripping) {
        return;
      }
      const scaleMultiplier = (this.distanceBetweenHands() - this.initialHandDistance) * .01;
      this.rootElement.object3D.scale.addScalar(scaleMultiplier); 
    });
  }

  highlightRootElement() {
    console.log('visually indicate what is highlighted');
  }

  deselect() {
    console.log('deselecting item');
    this.leftHand.removeEventListener('gripdown', this.grab);
    this.rightHand.removeEventListener('gripdown', this.grab);

    this.leftHand.removeEventListener('triggerdown', this.deselect);
    this.rightHand.removeEventListener('triggerdown', this.deselect);

    clearInterval(this.intervalId);
  } 

  grab() {
    console.log('pointer grabbing');
    this.initialHandDistance = this.distanceBetweenHands();
  }

  // refactor into a hand library?
  distanceBetweenHands() {
    const leftHandPosition = this.leftHand.object3D.position;
    const rightHandPosition = this.rightHand.object3D.position;

    return  leftHandPosition.distanceTo(rightHandPosition);
  }

}
