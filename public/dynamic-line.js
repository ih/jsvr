/* global AFRAME */
AFRAME.registerComponent('dynamic-line', {
  schema: {
    start: {type: 'selector'},
    end: {type: 'selector'}
  },
  init: function () {
    this.el.setAttribute('line', `start: 0 0 0; end: 0 0 0`);
  },
  
  tick: function(time, timeDelta) {
    const startPosition = this.data.start.object3D.getWorldPosition();
    const endPosition = this.data.end.object3D.getWorldPosition();
    this.el.setAttribute('line', `start:${startPosition.x} ${startPosition.y} ${startPosition.z}; end:${endPosition.x} ${endPosition.y} ${endPosition.z}`);
  }
});