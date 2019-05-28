/* global AFRAME, CollisionDetector */
AFRAME.registerComponent('hand-controller-plus', {
  init: function () {
    console.log('adding functionality to hand controller');
    this.el.isGripping = false;
    
    this.el.addEventListener('gripdown', () => {
      console.log('gripping');
      this.el.isGripping = true;
    });
    
    this.el.addEventListener('gripup', () => {
      console.log('ungripping');
      this.el.isGripping = false;
    });
   
    this.el.addEventListener('menudown', () => {
      console.log('creating interpreter');
    });
    
    this.el.collisionDetector = new CollisionDetector(this.el);
  },
  
  tick: function (time, delta) {
    this.el.collisionDetector.updateBounds();
  }
});