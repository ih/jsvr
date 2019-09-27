/* global AFRAME, THREE */

AFRAME.registerComponent('button-collider', {
  init: function () {
    console.log('init for button collider');
    
    this.primaryHand = document.getElementById('rightHand');
    this.primaryHand.addEventListener('triggerdown', () => {
      if (this.primaryHand.collisionDetector.isIntersecting(this.el)) {
        console.log('clicking button');
        this.el.emit('click', {}, false);
      }
    });
  }
});