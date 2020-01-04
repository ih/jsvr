import ArrayNodePort from "./array-node-port.js";
import ArrayPortAdder from "./array-port-adder.js";
import Port from "./port.js";
import TreeLayout from "./tree-layout.js";

export default class ArrayPort extends Port {
  constructor(node, childKey) {
    super();
    this.node = node;
    this.childKey = childKey;
    this.nodePorts = this.getOccupants().map((arrayNode, index) => {
      return new ArrayNodePort(node, childKey, this, index);
    });
    this.arrayPortAdder = new ArrayPortAdder(this);
  }

  render() {
    const arrayPortElement = document.createElement("a-cylinder");
    this.visualRepresentation = arrayPortElement;
    arrayPortElement.setAttribute("array-port", "");
    arrayPortElement.setAttribute(
      "height",
      ArrayNodePort.PORT_SIZE * this.nodePorts.length * 1.5 +
        ArrayNodePort.PORT_SIZE
    );
    arrayPortElement.setAttribute("radius", ArrayNodePort.PORT_SIZE);
    arrayPortElement.setAttribute("color", "blue");
    arrayPortElement.setAttribute("wireframe", true);

    this.setPosition();
    this.setText();
    this.nodePorts.forEach(nodePort => {
      nodePort.render(arrayPortElement);
    });

    this.node.visualRepresentation.appendChild(arrayPortElement);
    this.arrayPortAdder.render(arrayPortElement);
  }

  addNewPort() {
    const nodeArray = this.node[this.childKey];
    nodeArray.push(null);
    const newNodePort = new ArrayNodePort(
      this.node,
      this.childKey,
      this,
      nodeArray.length - 1
    );
    this.nodePorts.push(newNodePort);

    this.visualRepresentation.setAttribute(
      "height",
      ArrayNodePort.PORT_SIZE * this.nodePorts.length * 2 +
        ArrayNodePort.PORT_SIZE
    );
    newNodePort.render(this.visualRepresentation);

    // shift node ports down
    this.nodePorts.forEach(nodePort => {
      nodePort.setPosition();
      // TODO update child node positions by calling tree-layout setPosition
      if (nodePort.getOccupant()) {
        TreeLayout.setPosition(nodePort.getOccupant());
      }
    });
  }

  getOccupants() {
    return this.node[this.childKey];
  }
}
