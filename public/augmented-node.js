/* global scene, grammar, THREE */

import Grammar from "./grammar.js";
import TreeLayout from "./tree-layout.js";
import NodePort from "./node-port.js";
import ArrayPort from "./array-port.js";
import DataEditor from "./data-editor.js";
import Interpreter from "./interpreter2.js";
import "./node-port.js";
// import './grab.js';
import Grab from "./grab2.js";

export default class AugmentedNode {
  static get HEIGHT() {
    return 0.5;
  }

  static get WIDTH() {
    return 0.5;
  }

  constructor(esTree, id, parent, keyInParent, index, rootPosition) {
    Grammar.expandedGrammar;
    this.id = id;
    Object.assign(this, esTree);

    this.scale = {
      x: null,
      y: null,
      z: null
    };
    this.height = 0.5;
    this.width = 0.5;
    this.depth = 0.5;
    this.maxPortSize = this.height * 0.1;
    // map of a particular child to the key
    // it exists under in the parent
    this.childIdToKey = {};
    this.visualRepresentation = null;
    this.parentData = {
      node: parent,
      key: keyInParent,
      index: index
    };
    // a reusable box for setting position
    this.boundingBox = new THREE.Box3();

    this.ports = this.createPorts();

    // Non-child attributes of the node that can be edited using the keyboard
    this.dataEditor = new DataEditor(this);
  }

  get position() {
    if (this.visualRepresentation) {
      return this.visualRepresentation.getAttribute("position");
    }
    return { x: 0, y: 0, z: 0 };
  }

  set position(newPosition) {
    if (this.visualRepresentation) {
      this.visualRepresentation.setAttribute("position", newPosition);
    }
  }

  render() {
    if (this.visualRepresentation) {
      this.visualRepresentation.remove();
    }
    const nodeElement = document.createElement("a-box");
    nodeElement.setAttribute("position", this.position);
    nodeElement.setAttribute("height", this.height);
    nodeElement.setAttribute("width", this.width);
    nodeElement.setAttribute("depth", this.depth);
    nodeElement.setAttribute("color", "brown");
    nodeElement.setAttribute("wireframe", true);
    const grab = new Grab(nodeElement, ".augmented-node");
    nodeElement.grab = grab;
    nodeElement.classList.add("augmented-node");
    nodeElement.classList.add("grabbable");
    nodeElement.classList.add("pointable-destroy");

    nodeElement.addEventListener("click", event => {
      // since intersection event bubbles make sure the element is the one being pointed to
      if (
        event.detail.intersection.object !==
        this.visualRepresentation.getObject3D("mesh")
      ) {
        return;
      }
      this.destroy();
    });

    this.visualRepresentation = nodeElement;
    nodeElement.dataRepresentation = this;

    this.renderPorts();
    this.dataEditor.render();

    let parent;
    if (this.parentData.node) {
      parent = this.parentData.node.visualRepresentation;
    } else {
      parent = scene;
    }

    const promise = new Promise((resolve, reject) => {
      nodeElement.addEventListener("object3dset", event => {
        // since object3dset bubbles check if the event was emitted on the nodeElement
        if (event.detail.type !== "mesh" || event.target !== nodeElement) {
          return;
        } else {
          resolve(nodeElement);
        }
      });
    });

    parent.appendChild(nodeElement);
    return promise;
  }

  renderPorts() {
    Object.values(this.ports).forEach((port, index) => {
      port.render(this.visualRepresentation, index);
    });
  }

  getPortElement(key, index) {
    let port = this.ports[key];
    if (port instanceof ArrayPort) {
      port = port.nodePorts[index];
    }
    return port.visualRepresentation;
  }

  createPorts() {
    const ports = {};
    // iterate over the children of this node object
    Grammar.getChildKeys(this.type).forEach((childKey, index) => {
      const childPropertyData = Grammar.grammar[this.type].props[childKey];
      let port;
      if (childPropertyData.kind === "array") {
        port = new ArrayPort(this, childKey);
      } else {
        port = new NodePort(this, childKey, index);
      }
      ports[childKey] = port;
    });

    return ports;
  }

  setChild(newNode, childKey, childIndex) {
    // update this node
    if (Number.isInteger(childIndex)) {
      this[childKey][childIndex] = newNode;
    } else {
      this[childKey] = newNode;
    }
    // update the newNode's parent data
    newNode.parentData.node = this;
    newNode.parentData.key = childKey;
    newNode.parentData.index = childIndex;
    // update the visuals
    this.visualRepresentation.appendChild(newNode.visualRepresentation);
    const portElement = this.getPortElement(childKey, childIndex);
    portElement.dataRepresentation = newNode;
    portElement.setAttribute("color", "red");
    TreeLayout.setPosition(newNode);
    // TODO remove setTimeout, end position is not properly set
    // maybe when appendChild happens object3d is not in right position
    // when addLink is called
    setTimeout(() => {
      TreeLayout.addLink(newNode);
    }, 10);
  }

  setParentData(parent, keyInParent, index) {
    this.parentData = {
      node: parent,
      key: keyInParent,
      index: index
    };
  }

  getDataAsText() {
    const nonChildKeys = Grammar.getPrimitiveKeys(this.type);
    const nonChildObject = {};
    nonChildKeys.forEach(key => {
      nonChildObject[key] = this[key];
    });
    return JSON.stringify(
      nonChildObject,
      function(k, v) {
        return v === undefined ? null : v;
      },
      2
    );
  }

  renderValue(value) {
    const valueSelector = ":scope > .interpreted-value";
    let valueElement = this.visualRepresentation.querySelector(valueSelector);
    if (!valueElement) {
      valueElement = document.createElement("a-text");
      valueElement.setAttribute("width", this.WIDTH * 2);
      valueElement.classList.add("interpreted-value");
      this.visualRepresentation.appendChild(valueElement);
    } 
    valueElement.setAttribute("value", value);
  }

  getPropertyType(propertyName) {
    const nodeData = Grammar.grammar[this.type];
    return nodeData.props[propertyName].name;
  }

  getChildren() {
    const nonEmptyChildKeys = Grammar.getChildKeys(this.type).filter(
      childKey => {
        return this[childKey] !== null;
      }
    );

    return nonEmptyChildKeys.map(key => {
      return this[key];
    });
  }

  destroy() {
    // release from parent if it exists
    if (this.parentData.node) {
      const parentPort = this.parentData.node.getPortElement(
        this.parentData.key,
        this.parentData.index
      );
      parentPort.dataRepresentation.releaseNode();
    }
    // delete node
    this.visualRepresentation.parentNode.removeChild(this.visualRepresentation);
    // need to remove all event listeners for GC to happen?
  }

  evaluate(environment) {
    try {
      const code = astring.generate(this);
      const value = Interpreter.eval(code, environment);
      this.renderValue(value);
      this.evaluatedValue = value;
      return environment;
    } catch (error) {
      return environment;
    }
  }

  getEvaluatedValue() {
    return this.evaluatedValue;
  }
}
