/* global AFRAME */
AFRAME.registerComponent("debug-hand-controller", {
  init: function() {
    console.log("debug-hand");
    this.el.addEventListener("object3dset", () => {
      console.log("model loadedx");
      this.el.getObject3D("mesh").visible = true;
    });
  }
});
