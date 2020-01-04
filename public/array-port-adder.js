import ArrayNodePort from "./array-node-port.js";

export default class ArrayPortAdder {
  constructor(arrayPort) {
    this.arrayPort = arrayPort;
  }

  render(arrayPortElement) {
    const arrayPortAdderElement = document.createElement("a-cone");
    this.visualRepresentation = arrayPortAdderElement;

    arrayPortAdderElement.setAttribute("height", ArrayNodePort.PORT_SIZE * 0.5);
    arrayPortAdderElement.setAttribute(
      "radius-bottom",
      ArrayNodePort.PORT_SIZE * 0.5
    );
    arrayPortAdderElement.setAttribute("radius-top", 0);

    arrayPortAdderElement.setAttribute("color", "yellow");

    arrayPortAdderElement.setAttribute("position", {
      x: arrayPortElement.getAttribute("radius"),
      y: arrayPortElement.getAttribute("height")
    });

    arrayPortAdderElement.classList.add("triggerable");
    arrayPortAdderElement.addEventListener("triggerdown", () => {
      this.arrayPort.addNewPort();
    });

    arrayPortElement.appendChild(arrayPortAdderElement);
  }
}
