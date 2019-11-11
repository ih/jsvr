/* global AFRAME, CollisionDetector */
AFRAME.registerComponent('hand-controller-plus', {
  init: function () {
    console.log('adding functionality to hand controller');
    this.el.isGripping = false;
    
    this.el.addEventListener('gripdown', () => {
      this.el.isGripping = true;
      /* TODO finish this to get grabbing inside other grabbable objects working
      const grabbedElements = document.querySelectorAll('.grabbable').filter((grabbableElement) => {
        return this.el.collisionDetector.isIntersecting(grabbableElement);
      });
      // initialize a collection of inner most elements
      const innerMostElements = new Set();
      // iterate through the grabbed elements
      grabbedElements.forEach((grabbedElement) => {
        // iterate through the inner most elements
        innerMostElements.entries().forEach((innerMostElement) => {
          // if the current grabbed element contains the current inner most element throw it out
          if (contains(grabbedElement, innerMostElement)) {
            continue;
          }
          // if the current grabbed element is contained in the current inner most element replace it
          // otherwise move on
          // if the current grabbed element makes it through all the inner most elements add it as an inner most element
        });
      });
      */
      document.querySelectorAll('.grabbable').forEach((grabbableElement) => {
        if (this.el.collisionDetector.isIntersecting(grabbableElement)) {
          grabbableElement.emit('gripdown', {grabbingHand: this.el}, false);
        }
      });    
    });
    
    this.el.addEventListener('gripup', () => {
      this.el.isGripping = false;
      document.querySelectorAll('.grabbable').forEach((grabbableElement) => {
        if (this.el.collisionDetector.isIntersecting(grabbableElement)) {
          grabbableElement.emit('gripup', {grabbingHand: this.el}, false);
        }
      });
   });
   
    this.el.addEventListener('xbuttondown', () => {
      console.log('creating interpreter');
    });

    this.el.collisionDetector = new CollisionDetector(this.el);

    this.el.addEventListener('triggerdown', () => {
      document.querySelectorAll('.triggerable').forEach((triggerableElement) => {
        if (this.el.collisionDetector.isIntersecting(triggerableElement)) {
          triggerableElement.emit('triggerdown', {triggerHand: this.el}, false);
        }
      });
    });
 
  },
  
  tick: function (time, delta) {
    this.el.collisionDetector.updateBounds();
  }
});