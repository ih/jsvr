import * as DOM from './dom-lib.js';

export default class Grab {
  constructor(element, type) {
    this.element = element;
    this.type = type;

    this.deltaPosition = null;
    this.element.addEventListener('gripdown', (event) => {
      this.grabbingHand = event.detail.grabbingHand;       
      this.gripping = true; 
      this.deltaPosition = null;
    });
    
    this.element.addEventListener('gripup', () => {
      this.grabbingHand = null;
      this.gripping = false;
      this.deltaPosition = null;
    });

    const intervalId = setInterval(() => {
      if (this.element === null) {
        clearInterval(intervalId);
      }
      if (!this.gripping) {
        return;
      }
      const rootElement = this.type === '' ? this.element : DOM.farthest(this.element, this.type);
      if (this.deltaPosition === null) {
        this.deltaPosition = new THREE.Vector3().subVectors(rootElement.object3D.position, this.grabbingHand.object3D.position);
      }
      rootElement.object3D.position.addVectors(this.grabbingHand.object3D.position, this.deltaPosition);
     
    }, 10);
  }
}