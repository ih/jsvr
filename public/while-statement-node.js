import AugmentedNode from './augmented-node.js';

export default class WhileStatementNode extends AugmentedNode {
  getNextChild() {
    if (!this.ranTest) {
      this.ranTest = true;
      this.test.resetTree();
      return this.test;
    } else if (this.ranTest && this.test.getEvaluatedValue()) {
      this.ranTest = false;
      this.body.resetTree();
      return this.body;
    }
  }

  reset() {
    this.ranTest = undefined;
  }
}