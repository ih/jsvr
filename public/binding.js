import { sleep } from './async-lib.js';
import * as SizeLib from './size-lib.js';

export default class Binding {
  constructor(idNode, valueNode) {
    this.idNode = idNode;
    this.valueNode = valueNode;
  }

  getValue() {
    return this.valueNode.getEvaluatedValue();
  }

  async updateValue(newValueNode) {
    this.valueNode = newValueNode;
    // remgrammarove then re-render the binding
    this.visualRepresentation.parentNode.removeChild(this.visualRepresentation);
    await this.render(this.parent);
  }

  async render(parent) {
    this.parent = parent;
    this.idNode.renderValue(this.valueNode.getEvaluatedValue());
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