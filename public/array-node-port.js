import AugmentedNode from "./augmented-node.js";
import AbstractNodePort from "./abstract-node-port.js";

export default class ArrayNodePort extends AbstractNodePort {
  constructor(node, childKey, arrayPort, index) {
    super(node, childKey);
    this.arrayPort = arrayPort;
    this.index = index;
  }

  setText() {}

  setPosition() {
    this.visualRepresentation.setAttribute("position", {
      y:
        (this.index - this.arrayPort.nodePorts.length / 2) *
        ArrayNodePort.PORT_SIZE *
        2
    });
  }

  setVisualParent() {
    this.arrayPort.visualRepresentation.appendChild(this.visualRepresentation);
  }

  getOccupant() {
    return this.node[this.childKey][this.index];
  }

  setOccupant(newValue) {
    this.node[this.childKey][this.index] = newValue;
  }
}
