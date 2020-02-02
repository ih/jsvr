import AugmentedNode from './augmented-node.js';

export default class BreakStatementNode extends AugmentedNode {
  getNextChild(interpreterNodeStack) {
    // find the closest loop/switch node and remove all nodes from that
    // point in the stack 
    let indexOfBreakableNode;
    for (let index = interpreterNodeStack.length - 1; index >= 0; index--) {
      const currentNode = interpreterNodeStack[index];
      if (this.isBreakable(currentNode)) {
        indexOfBreakableNode = index;
        break;
      }
    }
    if (indexOfBreakableNode === undefined) {
      throw 'Tried to break, but not in a breakable block';
    }    interpreterNodeStack.splice(indexOfBreakableNode);
    return;
  }

  isBreakable(node) {
    const breakableTypes = ['ForStatement', 'WhileStatement', 'DoWhileStatement', 'SwitchStatement'];
    return breakableTypes.includes(node.type);
  }

}