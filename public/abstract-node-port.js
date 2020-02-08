/* global AFRAME, CollisionDetector, scene  */

import AugmentedNode from "./augmented-node.js";
import NodeMenu from "./node-menu.js";
import Port from "./port.js";
import * as DOM from "./dom-lib.js";

export default class NodePort extends Port {
  static get PORT_SIZE() {
    return AugmentedNode.HEIGHT * 0.1;
  }

  /**
   * Representation of a key-attribute pair in a node.
   *
   * @childKey - possibly a key in @node, used for displaying the port name when rendered (if not an array port)
   * @index - if the value that corresponds to @childKey is an array of nodes
   * then @index is the position of the port in it's parent (either an array or a node)
   * used for positioning within the parent
   * @childValue - the value that corresponds to @childKey in @node,
   * a child of @node in the tree structure.
   */
  constructor(node, childKey) {
    super();
    // the node the port belongs to
    this.node = node;
    this.childKey = childKey;
    this.nodeMenu = new NodeMenu(this);
  }

  render() {
    const portSize = this.node.height * 0.1;
    const portElement = document.createElement("a-sphere");
    this.visualRepresentation = portElement;
    portElement.setAttribute("radius", portSize / 2);
    portElement.setAttribute("wireframe", true);
    portElement.classList.add("pointable");
    portElement.classList.add("triggerable");
    this.setPosition();
    this.updateColor(portElement);
    portElement.dataRepresentation = this;

    // TODO currently used so it can be found/selected for the tree layout
    // refactor, can use the NodePort class/data representation in ports attribute
    portElement.classList.add(this.childKey);

    this.primaryHand = document.getElementById("rightHand");
    this.secondaryHand = document.getElementById("leftHand");

    this.visualRepresentation.addEventListener("triggerdown", event => {
      const grabbingHand = event.detail.triggerHand;
      if (
        grabbingHand.collisionDetector.isIntersecting(
          this.visualRepresentation
        ) &&
        this.getOccupant()
      ) {
        this.releaseNode();
      } else if (
        grabbingHand.collisionDetector.isIntersecting(
          this.visualRepresentation
        ) &&
        !this.getOccupant()
      ) {
        this.connectNode();
      }
    });

    this.visualRepresentation.addEventListener("raycaster-intersected", () => {
      if (this.getOccupant() || this.nodeMenu.isOpen()) {
        return;
      } else {
        this.nodeMenu.open();
      }
    });

    this.setText();
    this.setVisualParent();
  }

  setVisualParent() {}

  getOccupant() {}

  setOccupant() {}

  updateColor() {
    const occupant = this.getOccupant();
    const color = occupant ? "red" : "green";
    this.visualRepresentation.setAttribute("color", color);
  }

  releaseNode() {
    // remove visual link
    const lineElement = this.visualRepresentation.querySelector(
      ":scope > .line"
    );
    lineElement.parentNode.removeChild(lineElement);
    // update augmented node and child data
    const childNode = this.getOccupant();
    childNode.setParentData(null, null, null);
    this.setOccupant(null);
    // update the visual representation
    this.updateColor();

    // TODO do this through methods of AugmentedNode?
    const childPosition = childNode.visualRepresentation.object3D.getWorldPosition();
    childNode.position = {
      x: childPosition.x,
      y: childPosition.y,
      z: childPosition.z
    };
    scene.appendChild(childNode.visualRepresentation);
    // DOM.setParent(childNode.visualRepresentation, scene);
  }

  connectNode() {
    console.log("start connection");
    // add guideline component which starts at port center
    // and the end point is the hand
    const startId = "startPort";
    this.visualRepresentation.setAttribute("id", startId);
    const guideLine = document.createElement("a-entity");
    guideLine.setAttribute(
      "dynamic-line",
      `start: #rightHand; end: #${startId}`
    );
    scene.appendChild(guideLine);
    // when the user grabs again delete the guideline
    // if the user grabbed on another node set that node as the data of the port
    // otherwise the only result is the guideline gets deleted
    const releaseConnection = event => {
      this.visualRepresentation.setAttribute("id", "");
      guideLine.parentNode.removeChild(guideLine);
      this.primaryHand.removeEventListener("triggerup", releaseConnection);

      // get all the root nodes and do an intersection
      // check, connect the first one that passes
      const handCollisionDetector = new CollisionDetector(this.primaryHand);
      const rootNodeElements = scene.querySelectorAll(
        ":scope > .augmented-node"
      );
      for (let i = 0; i < rootNodeElements.length; i++) {
        const rootNodeElement = rootNodeElements[i];
        if (handCollisionDetector.isIntersecting(rootNodeElement)) {
          // update the connections between nodes
          const rootNode = rootNodeElement.dataRepresentation;
          this.node.setChild(rootNode, this.childKey, this.index);

          break;
        }
      }
    };
    this.primaryHand.addEventListener("triggerup", releaseConnection);
  }
}
