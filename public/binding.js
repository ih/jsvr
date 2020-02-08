import { sleep } from './async-lib.js';
import * as SizeLib from './size-lib.js';

export default class Binding {
  // TODO consider passing the value node eventually
  // not doing it now to simplify assignment's like +=  
  constructor(idNode, value) {
    this.idNode = idNode;
    this.value = value;
    // ideally valueNode would be cloned otherwise it can get
    // reset during interpretation of certain node types like while loops 
    // the work around for now is to have a value as well as the valueNode
    // this.valueNode = valueNode;
    // this.value = this.valueNode && this.valueNode.getEvaluatedValue();
  }

  getValue() {
    return this.value;
    // return this.valueNode.getEvaluatedValue();
  }

  async updateValue(newValue) {
    this.value = newValue;
    // this.valueNode = newValueNode;
    // this.value = this.valueNode && this.valueNode.getEvaluatedValue();
    // remgrammarove then re-render the binding
    this.visualRepresentation.parentNode.removeChild(this.visualRepresentation);
    await this.render(this.parent);
  }

  async render(parent) {
    this.parent = parent;
    this.idNode.renderValue(this.value);
    // TODO: remove sleep, currently waits for value to be rendered into
    // idNode as well as the interpreter element being appended
    // to new location (otherwise the geometry has zero size bounding box) 
    await sleep(1000);
    const icon = this.idNode.visualRepresentation.object3D.clone();
    const iconElement = document.createElement('a-entity');
    this.visualRepresentation = iconElement;
    iconElement.object3D = icon;
    SizeLib.scaleToContainer(iconElement, parent, .4);
    parent.appendChild(iconElement);
  }
}