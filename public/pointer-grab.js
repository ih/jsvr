import * as DOM from './dom-lib.js';
import Highlight from './highlight.js';

export default class PointerGrab {
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
    this.highlight = new Highlight(); 
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

    this.highlight.highlight(this.rootElement);

    this.leftHand.addEventListener('gripdown', this.grab);
    this.rightHand.addEventListener('gripdown', this.grab);

    // stop watching for grip if the element is unselected
    this.leftHand.addEventListener('triggerdown', this.deselect);
    this.rightHand.addEventListener('triggerdown', this.deselect);

    // move the object based on the difference in hand
    // position from when grabbing started
    const handDelta = new THREE.Vector3();
    this.intervalId = setInterval(() => {
      // TODO set isGrabbing to false if non-active hand grabs so
      // scaling action takes over
      if (!this.getActiveHand()) { 
        return;
      }
      // cancel grab action since scaling
      if (this.leftHand.isGripping && this.rightHand.isGripping) {
        this.deselect();
        return;
      }
      handDelta.subVectors(this.getActiveHand().object3D.position, this.initialHandPosition);
      handDelta.multiplyScalar(.1);
      this.rootElement.object3D.position.add(handDelta);
    });
  }

  deselect() {
    console.log('deselecting item');
    this.leftHand.removeEventListener('gripdown', this.grab);
    this.rightHand.removeEventListener('gripdown', this.grab);
   
    this.leftHand.removeEventListener('triggerdown', this.deselect);
    this.rightHand.removeEventListener('triggerdown', this.deselect);
    clearInterval(this.intervalId);
    this.highlight.unhighlight();
  } 

  grab(event) {
    console.log('pointer grabbing');
    this.initialHandPosition = this.getActiveHand().object3D.position.clone();
  }

  getActiveHand() {
    if (this.leftHand.isGripping) {
      return this.leftHand;
    } else if (this.rightHand.isGripping) {
      return this.rightHand;
    }
  }
}
