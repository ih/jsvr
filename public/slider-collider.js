/* global AFRAME, THREE */

AFRAME.registerComponent('slider-collider', {
  init: function () {
    console.log('init for slider collider');
    // this.handle = this.el.getChildren().filter(child => child.children.length > 0)[0];
    this.primaryHand = document.getElementById('rightHand');
    this.primaryHand.addEventListener('gripdown', () => {
      if (this.primaryHand.collisionDetector.isIntersecting(this.el)) {
        // this.gripping = true;
        this.el.emit('click', {intersection: {point: this.primaryHand.getAttribute('position').clone()}});
      }
    });
  },
});