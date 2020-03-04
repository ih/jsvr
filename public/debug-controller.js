/* global AFRAME */
/**
 * Keyboard bindings to control controller and create actions via events.
 * Position controllers in front of camera.
 * <a-scene debug-controller> ?debug in URL to toggle on.
 * https://gist.github.com/ngokevin/803e68351f70139da51fda48d3b484e3
 */
AFRAME.registerComponent("debug-controller", {
  schema: {
    enabled: { default: true }
  },

  init: function() {
    var primaryHand;
    var secondaryHand;

    if (!this.data.enabled && !AFRAME.utils.getUrlParameter("debug")) {
      return;
    }

    console.log("%c debug-controller enabled ", "background: #111; color: red");
    console.log("adding event listener");

    this.isPrimaryTriggerDown = false;
    this.isSecondaryTriggerDown = false;
    this.isPrimaryGripDown = false;
    this.isHandMode = false;

    primaryHand = document.getElementById("rightHand");
    secondaryHand = document.getElementById("leftHand");

    window.setTimeout(() => {
      console.log("model loaded");
      // for aframe v0.9+
      // primaryHand.object3D.visible = true;
      // secondaryHand.object3D.visible = true;
      primaryHand.getObject3D("mesh").visible = true;
      secondaryHand.getObject3D("mesh").visible = true;
    }, 9000);

    secondaryHand.setAttribute("position", { x: -0.2, y: 1.5, z: -0.5 });
    primaryHand.setAttribute("position", { x: 0.2, y: 1.5, z: -0.5 });
    secondaryHand.setAttribute("rotation", { x: 35, y: 0, z: 0 });
    primaryHand.setAttribute("rotation", { x: 35, y: 0, z: 0 });

    document.addEventListener("keydown", evt => {
      var primaryPosition;
      var primaryRotation;
      var secondaryPosition;
      var secondaryRotation;

      // <shift> + * for everything.
      if (evt.key === "Shift") {
        this.isHandMode = !this.isHandMode;
      }

      if (!this.isHandMode) {
        return;
      }

      // don't move body if in hand mode
      evt.preventDefault();
      evt.stopImmediatePropagation();

      // trigger.
      if (evt.key === "h") {
        if (this.isPrimaryTriggerDown) {
          primaryHand.emit("triggerup");
          this.isPrimaryTriggerDown = false;
        } else {
          primaryHand.emit("triggerdown");
          this.isPrimaryTriggerDown = true;
        }
        return;
      }

      if (evt.key === "f") {
        if (this.isSecondaryTriggerDown) {
          secondaryHand.emit("triggerup");
          this.isSecondaryTriggerDown = false;
        } else {
          secondaryHand.emit("triggerdown");
          this.isSecondaryTriggerDown = true;
        }
      }

      // menu
      if (evt.key === "r") {
        secondaryHand.emit("xbuttondown");
        secondaryHand.emit("xbuttonup");
      }

      // menu
      if (evt.key === "y") {
        primaryHand.emit("menudown");
        primaryHand.emit("menuup");
      }

      if (evt.key === "p") {
        if (this.isPrimaryGripDown) {
          primaryHand.emit("gripup");
          this.isPrimaryGripDown = false;
        } else {
          primaryHand.emit("gripdown");
          this.isPrimaryGripDown = true;
        }
      }

      if (evt.key === "Tab") {
        if (this.isSecondaryGripDown) {
          secondaryHand.emit("gripup");
          this.isSecondaryGripDown = false;
        } else {
          secondaryHand.emit("gripdown");
          this.isSecondaryGripDown = true;
        }
      }

      if (evt.key === ";") {
        primaryHand.emit("abuttondown");
        primaryHand.emit("abuttonup");
      }

      if (evt.key === "'") {
        primaryHand.emit("bbuttondown");
        primaryHand.emit("bbuttonup");
      }

      // Position bindings.
      const movementDelta = 0.05;
      const rotationDelta = 1;

      primaryPosition = primaryHand.getAttribute("position");
      if (evt.key === "j") {
        primaryPosition.x -= movementDelta;
      }
      if (evt.key === "k") {
        primaryPosition.y -= movementDelta;
      }
      if (evt.key === "i") {
        primaryPosition.y += movementDelta;
      }
      if (evt.key === "l") {
        primaryPosition.x += movementDelta;
      }
      if (evt.key === "u") {
        primaryPosition.z -= movementDelta;
      } // ;.
      if (evt.key === "o") {
        primaryPosition.z += movementDelta;
      } // ;.

      // Rotation bindings.
      primaryRotation = primaryHand.getAttribute("rotation");
      if (evt.key === "m") {
        primaryRotation.x -= rotationDelta;
      } // y.
      if (evt.key === ".") {
        primaryRotation.x += rotationDelta;
      } // o.

      secondaryPosition = secondaryHand.getAttribute("position");
      if (evt.key === "a") {
        secondaryPosition.x -= movementDelta;
      }
      if (evt.key === "s") {
        secondaryPosition.y -= movementDelta;
      }
      if (evt.key === "w") {
        secondaryPosition.y += movementDelta;
      }
      if (evt.key === "d") {
        secondaryPosition.x += movementDelta;
      }
      if (evt.key === "e") {
        secondaryPosition.z -= movementDelta;
      } // ;.
      if (evt.key === "q") {
        secondaryPosition.z += movementDelta;
      } // ;.

      // Rotation bindings.
      secondaryRotation = secondaryHand.getAttribute("rotation");
      if (evt.key === "c") {
        secondaryRotation.x -= rotationDelta;
      } // y.
      if (evt.key === "z") {
        secondaryRotation.x += rotationDelta;
      } // o.

      primaryHand.setAttribute("position", AFRAME.utils.clone(primaryPosition));
      primaryHand.setAttribute("rotation", AFRAME.utils.clone(primaryRotation));
      secondaryHand.setAttribute(
        "position",
        AFRAME.utils.clone(secondaryPosition)
      );
      secondaryHand.setAttribute(
        "rotation",
        AFRAME.utils.clone(secondaryRotation)
      );
    });
  }
});
