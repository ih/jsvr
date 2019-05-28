/* global scene, grammar, THREE */

import Grammar from './grammar.js';
import './node-port.js';

export default class AugmentedNode {
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
    }
    this.height = .5;
    this.width = .5;
    this.depth = .5;
    this.maxPortSize = this.height * .1;
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
    
    /*
    if (parent) {
      this.setPosition();
    }
    */ 
    // this.render();   
  }
 
  get position() {
    if (this.visualRepresentation) {
      return this.visualRepresentation.getAttribute('position');
    }
    return {x: 0, y: 0, z: 0};
  }
  
  set position(newPosition) {
    if (this.visualRepresentation) {
      this.visualRepresentation.setAttribute('position', newPosition);
    }
  }
  
  render() {
    if (this.visualRepresentation) {
      this.visualRepresentation.remove();
    }
    const nodeElement = document.createElement('a-box');
    nodeElement.setAttribute('position', this.position);
    // nodeElement.setAttribute('scale', this.scale);
    nodeElement.setAttribute('height', this.height);
    nodeElement.setAttribute('width', this.width);
    nodeElement.setAttribute('depth', this.depth);
    nodeElement.setAttribute('color', 'brown');
    nodeElement.setAttribute('wireframe', true);
    nodeElement.setAttribute('grab', ''); 
    nodeElement.setAttribute('class', 'augmented-node');
    const textElement = document.createElement('a-text');
    
    textElement.setAttribute('value', this.getDataAsText());
    textElement.setAttribute('color', 'green');
    nodeElement.appendChild(textElement);
   
    nodeElement.ports = {};
    this.portSize = Math.min(this.maxPortSize, this.width/(Grammar.getChildKeys(this.type).length + 2.0));  
    Grammar.getChildKeys(this.type).forEach((childKey, index) => {
      let portElement;
      const childPropertyData = Grammar.grammar[this.type].props[childKey]; 
      if (childPropertyData.kind === 'array') {
        portElement = this.createArrayPortElement(childKey, this[childKey], this);
        portElement.classList.add('array-port');
      } else {
        portElement = this.createNodePortElement(childKey, this[childKey], this);
      }
      portElement.classList.add('port');
      portElement.classList.add(childKey);
      const portTextElement = document.createElement('a-text');
      portTextElement.setAttribute('value', childKey);
      portTextElement.setAttribute('color', 'yellow');
      portElement.appendChild(portTextElement);
      portElement.setAttribute('position', {
        x: this.width/(Grammar.getChildKeys(this.type).length) * (index  - ((Grammar.getChildKeys(this.type).length / 2) - .5)),
        y: this.height/2 + this.portSize/2
      });

      nodeElement.appendChild(portElement);
      nodeElement.ports[childKey] = portElement;
    });
    
    this.visualRepresentation = nodeElement;
    nodeElement.dataRepresentation = this;

    if (this.parentData.node) {
      this.parentData.node.visualRepresentation.appendChild(nodeElement);
      /*
  
      */

    } else {
      scene.appendChild(nodeElement);
    }

    return new Promise((resolve, reject) => {
      nodeElement.addEventListener('loaded', (event) => {
        setTimeout(() => {
                  resolve();
        }, 50);

      });
    });
  }
  
  getPortElement(key, index) {
    const portElement = this.visualRepresentation.querySelector(`.${key}`);
    if (portElement.hasAttribute('array-port')) {
      return portElement.children[index];
    }
    return portElement;
  }
  
  createArrayPortElement(childKey, arrayChildren, parentRepresentation) {
    const portElement = document.createElement('a-cylinder');
    portElement.setAttribute('array-port', '');
    portElement.setAttribute('height', this.portSize * arrayChildren.length * 1.5 + this.portSize);
    portElement.setAttribute('radius', this.portSize);
    portElement.setAttribute('color', 'blue');
    portElement.setAttribute('wireframe', true);   
    arrayChildren.forEach((child, index) => {
     const arrayChildElement = this.createNodePortElement(childKey, child, parentRepresentation, index);
     arrayChildElement.setAttribute('position', {
       y: index * this.portSize * 1.5
     });

     portElement.appendChild(arrayChildElement);
    });
    
    return portElement;
  }
  
  createNodePortElement(childKey, child, parentRepresentation, index) {
    const portElement = document.createElement('a-sphere');
    portElement.setAttribute('node-port', '');
    portElement.setAttribute('radius', this.portSize/2);
    const color = child ? 'red' : 'green';
    portElement.setAttribute('color', color);
    portElement.setAttribute('wireframe', true);
    portElement.dataRepresentation = child;
    portElement.index = index;
    portElement.childKey = childKey;
    portElement.node = parentRepresentation;
    return portElement;
  }
  
  setChild(newNode, childKey, childIndex) {
    // update this node
    if (childIndex) {
      this[childKey][childIndex] = newNode;
    } else {
      this[childKey] = newNode
    }
    // update the newNode's parent data
    newNode.parentData.node = this;
    newNode.parentData.key = childKey;
    newNode.parentData.index = childIndex;
  }
  
  getDataAsText() {
    const nonChildKeys = Grammar.getPrimitiveKeys(this.type); 
    const nonChildObject = {};
    nonChildKeys.forEach((key) => {
      nonChildObject[key] = this[key];
    });
    return JSON.stringify(nonChildObject, null, 2);
  }

  
  
  evaluate() {
  }
}