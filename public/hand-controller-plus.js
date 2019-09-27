/* global AFRAME, CollisionDetector */
AFRAME.registerComponent('hand-controller-plus', {
  init: function () {
    console.log('adding functionality to hand controller');
    this.el.isGripping = false;
    
    this.el.addEventListener('gripdown', () => {
      // console.log('gripping');
      this.el.isGripping = true;
    });
    
    this.el.addEventListener('gripup', () => {
      // console.log('ungripping');
      this.el.isGripping = false;
    });
   
    this.el.addEventListener('xbuttondown', () => {
      console.log('creating interpreter');
    });

    this.el.collisionDetector = new CollisionDetector(this.el);

    this.el.addEventListener('triggerdown', () => {
      document.querySelectorAll('.triggerable').forEach((triggerableElement) => {
        if (this.el.collisionDetector.isIntersecting(triggerableElement)) {
          triggerableElement.emit('triggerdown', {}, false);
        }
      });
    });
 
  },
  
  tick: function (time, delta) {
    this.el.collisionDetector.updateBounds();
  }
});