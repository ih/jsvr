/*
 * A pointer which objects can react to.
 */
export default class Pointer {
  constructor() {
    this.active = false;
    this.parent = document.querySelector("#rightHand");
    this.toggle = this.toggle.bind(this);
    this.cycleMode = this.cycleMode.bind(this);

    // modes
    this.currentMode = 0;
  }

  render() {
    const creationRayCaster = this.createRayCaster(".pointable", "green");
    const destructionRayCaster = this.createRayCaster(
      ".pointable-destroy",
      "red"
    );

    this.parent.addEventListener("abuttondown", this.toggle);
    this.parent.addEventListener("bbuttondown", this.cycleMode);
    this.raycasterElements = [creationRayCaster, destructionRayCaster];
    // TODO remove w/ fix to raycasters
    this.raycasterColors = ["green", "red"];
  }

  createRayCaster(selector, color) {
    const raycasterElement = document.createElement("a-entity"); // this.parent;
    raycasterElement.setAttribute("laser-controls");
    raycasterElement.setAttribute(
      "raycaster",
      `showLine: false; enabled: false; objects: ${selector}`
    ); //
    raycasterElement.setAttribute(
      "cursor",
      "downEvents: triggerdown; upEvents: triggerup; fuse: false"
    );
    raycasterElement.setAttribute("line", `color:${color}`);
    this.parent.appendChild(raycasterElement);
    // since the raycaster isn't on the hand element, propagate trigger events so cursor will work
    this.parent.addEventListener("triggerdown", event => {
      raycasterElement.emit("triggerdown", event, false);
    });
    this.parent.addEventListener("triggerup", event => {
      raycasterElement.emit("triggerup", event, false);
    });

    return raycasterElement;
  }

  toggle() {
    this.active = !this.active;
    const currentRaycaster = this.raycasterElements[this.currentMode];
    currentRaycaster.setAttribute("raycaster", "showLine", this.active);
    currentRaycaster.setAttribute("raycaster", "enabled", this.active);
    // do this b/c bug with raycaster showLine/enabled?
    currentRaycaster.setAttribute(
      "line",
      "color",
      this.raycasterColors[this.currentMode]
    );
  }

  cycleMode() {
    console.log("cycling functionality");
    if (this.active) {
      this.toggle();
      this.currentMode = (this.currentMode + 1) % this.raycasterElements.length;
      this.toggle();
    } else {
      this.currentMode = (this.currentMode + 1) % this.raycasterElements.length;
    }
  }
}
