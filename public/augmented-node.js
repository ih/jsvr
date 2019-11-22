/* global scene, grammar, THREE */

import Grammar from "./grammar.js";
import TreeLayout from "./tree-layout.js";
import NodePort from "./node-port.js";
import ArrayPort from "./array-port.js";
import DataEditor from "./data-editor.js";
import "./node-port.js";
// import './grab.js';
import Grab from './grab2.js';


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
    /*
    if (parent === null) {
      this.position = rootPosition;
    } else {
      this.position = {
        x: 0,
        y: 0,
        z: 0 
      }
    }
    */
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
    // nodeElement.setAttribute('scale', this.scale);
    nodeElement.setAttribute("height", this.height);
    nodeElement.setAttribute("width", this.width);
    nodeElement.setAttribute("depth", this.depth);
    nodeElement.setAttribute("color", "brown");
    nodeElement.setAttribute("wireframe", true);
    // nodeElement.setAttribute("grab", ".augmented-node");
    const grab = new Grab(nodeElement, '.augmented-node');
    nodeElement.grab = grab;
    nodeElement.classList.add("augmented-node");
    nodeElement.classList.add("grabbable");
    nodeElement.classList.add('pointable-destroy');

    nodeElement.addEventListener('click', (event) => {
      // since intersection event bubbles make sure the element is the one being pointed to
      if (event.detail.intersection.object !== this.visualRepresentation.getObject3D('mesh')) {
        return;
      }
      this.destroy();
    });

    /*
    const textElement = document.createElement('a-text');
   
    textElement.setAttribute('value', this.getDataAsText());
    textElement.setAttribute('color', 'green');
    textElement.setAttribute('width', AugmentedNode.WIDTH*2);
    textElement.setAttribute('position', {x: -1 * AugmentedNode.WIDTH/2});
    nodeElement.appendChild(textElement);
    */
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
      // nodeElement.addEventListener('object3dset', (event) => {
      //   if (event.detail.type !== 'mesh') {
      //     return;
      //   } else {
      //     resolve(nodeElement);

      //   }
      // });

      nodeElement.addEventListener("object3dset", event => {
        // since object3dset bubbles check if the event was emitted on the nodeElement
        if (
          event.detail.type !== "mesh" ||
          event.target !== nodeElement
        ) {
          return;
        } else {
          resolve(nodeElement);
        }
      });

      // let observer = new MutationObserver(mutations => {
      //   mutations.forEach(mutation => {
      //     if (Array.from(mutation.addedNodes).includes(nodeElement)) {
      //       nodeElement.addEventListener("object3dset", event => {
      //         // since object3dset bubbles check if the event was emitted on the nodeElement
      //         if (
      //           event.detail.type !== "mesh" ||
      //           event.target !== nodeElement
      //         ) {
      //           return;
      //         } else {
      //           resolve(nodeElement);
      //         }
      //       });

      //       // resolve(nodeElement);
      //       // observer.disconnect();
      //     }
      //   });
      // });
      // observer.observe(parent, { childList: true });

      //  setTimeout(() => {
      //           resolve(nodeElement);
      // }, 50);
      // nodeElement.addEventListener('loaded', (event) => {
      // a hack for waiting until the element has been added and is visible
      // since loaded doesn't actually tell if the element is ready
      // probably need to replace with mutation observers to do it "right"
      // setTimeout(() => {
      //                  resolve(nodeElement);
      //     }, 50);

      //  });
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
    /*
    const portElement = this.visualRepresentation.querySelector(`.${key}`);
    if (portElement.hasAttribute('array-port')) {
      return portElement.children[index];
    }
    return portElement;
    */
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
    // setTimeout(() => {
    //   portElement.setAttribute('color', 'red');
    //   TreeLayout.setPosition(newNode);
    //   TreeLayout.addLink(newNode);
    // }, 1000);
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
    const valueSelector = ':scope > .interpreted-value';
    let valueElement = this.visualRepresentation.querySelector(valueSelector);
    if (!valueElement) {
      valueElement = document.createElement('a-text');
      valueElement.setAttribute('width', this.WIDTH * 2);
      valueElement.classList.add('interpreted-value');
      this.visualRepresentation.appendChild(valueElement);
    }
    valueElement.setAttribute('value', value);
  }

  getPropertyType(propertyName) {
    const nodeData = Grammar.grammar[this.type];
    return nodeData.props[propertyName].name;
  }

  getChildren() {
    const nonEmptyChildKeys = Grammar.getChildKeys(this.type).filter((childKey) => {
      return this[childKey] !== null;
    });

    return nonEmptyChildKeys.map((key) => {
      return this[key];
    });
  }

  destroy() {
    // release from parent if it exists
    if (this.parentData.node) {
      const parentPort = this.parentData.node.getPortElement(this.parentData.key, this.parentData.index);
      parentPort.dataRepresentation.releaseNode();
    }
    // delete node 
    this.visualRepresentation.parentNode.removeChild(this.visualRepresentation);
    // need to remove all event listeners for GC to happen?
  }

  evaluate() {}
}
