import AugmentedNode from "./augmented-node.js";

export default class DoWhileStatementNode extends AugmentedNode {
  getNextChild() {
    if (!this.ranBody) {
      this.ranBody = true;
      this.body.resetTree();
      this.lastRun = 'body';
      return this.body;
    } else if (this.lastRun === 'body') {
      this.lastRun = 'test';
      this.test.resetTree();
      return this.test;
    } else if (this.test.getEvaluatedValue()) {
      this.lastRun = 'body';
      this.body.resetTree();
      return this.body;     
    }
  }

  reset() {
    this.ranBody = undefined;
    this.lastRun = undefined;
  }
}
