export default class VirtualConsole {
  constructor() {
    scene.systems.log.data.console = false;
    let original = console.log;
    console.log = (function(original) {
      return function(text) {
        AFRAME.log(text);
        original(text);
        // return text;
      };
    })(original);
  }

  render() {
    console.log("adding virtual console");
    const virtualConsole = document.createElement("a-entity");
    virtualConsole.setAttribute("log", "console:false");
    virtualConsole.setAttribute("position", "-1 2.076 -1.5");
    virtualConsole.setAttribute("geometry", "primitive", "plane");
    virtualConsole.setAttribute("material", "color", "#111");
    virtualConsole.setAttribute("text", "color", "lightgreen");

    document.querySelector("a-scene").appendChild(virtualConsole);
  }
}
