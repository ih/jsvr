import AugmentedNode from './augmented-node.js';
import AbstractNodePort from './abstract-node-port.js';

// TODO Split into two classes one for a port in an array and one for not in array
export default class NodePort extends AbstractNodePort {

  static get PORT_SIZE() {
    return AugmentedNode.HEIGHT * .1; 
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
    super(node, childKey);
    // the node the port belongs to
    this.node = node;
    this.childKey = childKey;
  }

  setVisualParent() {
    this.node.visualRepresentation.appendChild(this.visualRepresentation);
  }

  getOccupant() {
    return this.node[this.childKey];
  }

  setOccupant(newValue) {
    this.node[this.childKey] = newValue;
  }
}