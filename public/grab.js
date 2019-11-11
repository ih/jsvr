import { farthest } from './dom-lib.js';

/* global AFRAME, THREE, CollisionDetector */
/* TODO change this so the event listeners are on the object and not the hand
See triggerdown in hand controller plus for example
*/
AFRAME.registerComponent('grab', {

  schema: {type: 'string'},
  
  init: function () {
    this.deltaPosition = null;
    this.el.addEventListener('gripdown', (event) => {
      this.grabbingHand = event.detail.grabbingHand;       
      this.gripping = true; 
      this.deltaPosition = null;
    });
    
    this.el.addEventListener('gripup', () => {
      this.grabbingHand = null;
      this.gripping = false;
      this.deltaPosition = null;
    });
  },
  
  tick: function (time, delta) {
    if (!this.gripping) {
      return;
    }
    const rootElement = this.data === '' ? this.el : farthest(this.el, this.data);
    if (this.deltaPosition === null) {
      this.deltaPosition = new THREE.Vector3().subVectors(rootElement.object3D.position, this.grabbingHand.object3D.position);
    }
    rootElement.object3D.position.addVectors(this.grabbingHand.object3D.position, this.deltaPosition);
  }
  
});