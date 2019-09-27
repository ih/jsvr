/* global AFRAME, THREE, CollisionDetector */
/* TODO change this so the event listeners are on the object and not the hand
See triggerdown in hand controller plus for example
*/
AFRAME.registerComponent('grab', {
  
  init: function () {
    // console.log('grab start');
    this.primaryHand = document.getElementById("rightHand");
    this.secondaryHand = document.getElementById("leftHand");
    // this.collisionDetector = new CollisionDetector(this.el);
    this.deltaPosition = null;
    this.primaryHand.addEventListener('gripdown', () => {
      if (this.primaryHand.collisionDetector.isIntersecting(this.el)) {
        this.grabbingHand = this.primaryHand;       
        this.gripping = true; 
        this.deltaPosition = null;
      }
    });
    
    this.primaryHand.addEventListener('gripup', () => {
      this.grabbingHand = null;
      this.gripping = false;
      this.deltaPosition = null;
    });
    
    this.secondaryHand.addEventListener('gripdown', () => {
      if (this.secondaryHand.collisionDetector.isIntersecting(this.el)) {
        this.grabbingHand = this.secondaryHand;       
        this.gripping = true; 
        this.deltaPosition = null;
      }
    });
    
    this.secondaryHand.addEventListener('gripup', () => {
      this.grabbingHand = null;
      this.gripping = false;
      this.deltaPosition = null;
    });   
  },
  
  tick: function (time, delta) {
    if (!this.gripping) {
      return;
    }
    const rootElement = this.el.closest('a-scene > .augmented-node');
    if (this.deltaPosition === null) {
      this.deltaPosition = new THREE.Vector3().subVectors(rootElement.object3D.position, this.grabbingHand.object3D.position);
    }
    rootElement.object3D.position.addVectors(this.grabbingHand.object3D.position, this.deltaPosition);
  }
  
});