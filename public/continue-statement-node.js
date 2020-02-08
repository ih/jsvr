import AugmentedNode from './augmented-node.js';

export default class ContinueStatementNode extends AugmentedNode {
  getNextChild(interpreterNodeStack) {
    // find the closest loop/switch node and remove all nodes from that
    // point in the stack 
    let indexOfIterableNode;
    for (let index = interpreterNodeStack.length - 1; index >= 0; index--) {
      const currentNode = interpreterNodeStack[index];
      if (this.isIterable(currentNode)) {
        indexOfIterableNode = index;
        break;
      }
    }
    if (indexOfIterableNode === undefined) {
      throw 'Tried to bcontinue but not in a binterable lock';
    }   
    // TODO rather than splice pop each node from the stack and reset
    while (indexOfIterableNode < interpreterNodeStack.length - 1) {
      const nodeAfterIterable = interpreterNodeStack.pop();
      nodeAfterIterable.resetTree();
    }
    return;
  }

  isIterable(node) {
    const iterableTypes = ['ForStatement', 'WhileStatement', 'DoWhileStatement'];
    return iterableTypes.includes(node.type);
  }

}