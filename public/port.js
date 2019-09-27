import AugmentedNode from './augmented-node.js';
import Grammar from './grammar.js';

export default class Port {
  static get PORT_SIZE() {
    return AugmentedNode.HEIGHT * .1;
  }

  setPosition() {
    this.visualRepresentation.setAttribute('position', {
      x: AugmentedNode.WIDTH/(Grammar.getChildKeys(this.node.type).length) * (Grammar.getChildKeys(this.node.type).indexOf(this.childKey) - ((Grammar.getChildKeys(this.node.type).length / 2) - .5)),
      y: AugmentedNode.HEIGHT/2 + Port.PORT_SIZE/2
    });
  }

  setText() {
    const portTextElement = document.createElement('a-text');
    portTextElement.setAttribute('value', this.childKey);
    portTextElement.setAttribute('color', 'yellow');
    portTextElement.setAttribute('width', (AugmentedNode.WIDTH * 2)/(Grammar.getChildKeys(this.node.type).length));
    portTextElement.setAttribute('position', {x: Port.PORT_SIZE});
    this.visualRepresentation.appendChild(portTextElement);
  }
}