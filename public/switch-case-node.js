import AugmentedNode from './augmented-node.js';

export default class SwitchCaseNode extends AugmentedNode {
  getNextChild() {
    if (!this.lastStep) {
      // temporary value so this case is skipped 
      this.lastStep = this.test;
      this.consequentQueue = [...this.consequent];
      return this.test;
    } else if (this.test.getEvaluatedValue() ===  this.getParent().discriminant.getEvaluatedValue()) {
      return this.consequentQueue.shift();
    }
  }

  reset() {
    this.lastStep = undefined;
    this.consequentQueue = [];
  }
}