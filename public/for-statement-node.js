import AugmentedNode from './augmented-node.js';

export default class ForStatementNode extends AugmentedNode {
  getNextChild() {
    if (!this.hasInitialized) {
      this.hasInitialized = true;
      return this.init;
    } 
    
    if (!this.lastStep) {
      this.lastStep = 'test';
      this.test.resetTree();
      return this.test;
    } else if (this.lastStep === 'test' && this.test.getEvaluatedValue()) {
      this.lastStep = 'update';
      this.update.resetTree();
      return this.update;
    } else if (this.lastStep === 'update' && this.test.getEvaluatedValue()) {
      this.lastStep = undefined;
      this.body.resetTree();
      return this.body;
    }
  }

  reset() {
    this.hasInitialized = undefined;
    this.lastStep = undefined;
  }
}