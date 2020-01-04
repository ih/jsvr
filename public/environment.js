import * as SizeLib from './size-lib.js';
import { sleep } from './async-lib.js';
import Binding from './binding.js';

export default class Environment {
  constructor() {
    this.bindings = {};
  }

  reset() {
    Object.values(this.bindings).forEach((binding) => {
      const bindingElement = binding.visualRepresentation;
      bindingElement.parentNode.removeChild(bindingElement);
    });
    this.bindings = {};
}

  getVariableNames() {
    return Object.keys(this.bindings);  
  }

  getVariableValues() {
    return Object.values(this.bindings).map((binding) => {
      return binding.getValue();
    });
  }

  async addBinding(idNode, valueNode) {
    const name = idNode.name;
    // const value = valueNode.getEvaluatedValue();
    const binding = new Binding(idNode, valueNode);
    this.bindings[name] = binding;
    await binding.render(this.visualRepresentation);
    // this.renderBinding(idNode, valueNode);
    this.positionBindings();
  }

  async updateBinding(bindingName, bindingValue) {
    if (!(bindingName in this.bindings)) {
      // TODO update when handling objects etc for assignment
      throw 'trying to assign value to id that does not exist';
    }
    const currentBinding = this.bindings[bindingName];
    await currentBinding.updateValue(bindingValue);
    console.log('positing after update');
    this.positionBindings();
  }

  render(parent) {
    this.visualRepresentation = parent;
    // const environmentElement = document.createElement('a-box');
    // environmentElement.setAttribute('wireframe', true);
    // this.visualRepresentation = environmentElement;
    // // we first need to add the object to the scene otherwise
    // // the object3d will not be set, we don't add it directly
    // // to the parent b/c the size of the parent then includes the 
    // // environment which screws up the scale
    // scene.appendChild(environmentElement);
    // environmentElement.addEventListener('object3dset', event => {
    //   SizeLib.scaleToContainer(this.visualRepresentation, parent, .9);
    //   parent.appendChild(this.visualRepresentation);
    //   // this.renderBindings();
    // });
  }

  async renderBinding(idNode, valueNode) {
    const icon = idNode.visualRepresentation.object3D.clone();
    const iconElement = document.createElement('a-entity');
    iconElement.object3D = icon;
    // TODO: find a better solution (using events?)
    // problem is this code runs before interpreter object3d 
    // is finished initializing after interpreter element is appended
    // to new location (the geometry has zero size bounding box)
    await sleep(1000);

    SizeLib.scaleToContainer(iconElement, this.visualRepresentation, .2);
    this.visualRepresentation.appendChild(iconElement);
    // this.positionBindings();
  }

  positionBindings() {
    // position bindings in a grid where the grid width/height is the 
    // square root of the binding count

    // set the height and width assuming environment is an icosahedron
    const gridSize = this.visualRepresentation.getAttribute('radius') * 2;

    const bindingCount = Object.keys(this.bindings).length;
    const divisionCount = Math.ceil(Math.sqrt(bindingCount));

    const margin = gridSize/divisionCount;
   
    Object.values(this.bindings).forEach((binding, index) => {
      const row = Math.floor(index/divisionCount);
      const column = index % divisionCount;
      binding.visualRepresentation.setAttribute('position', {
        x: ((-1 * gridSize) / 2.0) + (column * margin) + margin/2,
        y: (gridSize / 2.0) - (row * margin) - margin/2
      });
    });
  }
}