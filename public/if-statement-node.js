import AugmentedNode from './augmented-node.js';

export default class IfStatementNode extends AugmentedNode {
  getNextChild() {
    console.log('getting next child for if statement');
    if (!this.visitedCount) {
      this.visitedCount = 1;
      return this.test;
    } else if (this.visitedCount === 1) {
      this.visitedCount = 2;
      return this.test.getEvaluatedValue() ? this.consequent : this.alternate;
    }
  }

  reset() {
    this.visitedCount = undefined;
  }
}