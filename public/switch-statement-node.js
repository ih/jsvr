import AugmentedNode from './augmented-node.js';

export default class SwitchStatementNode extends AugmentedNode {
  getNextChild() {
    if (!this.lastStep) {
      // temporary value so this case is skipped 
      this.lastStep = 'discriminant';
      this.casesQueue = [...this.cases];
      return this.discriminant;
    } else if ((this.lastStep === 'discriminant' || this.lastStep === 'cases') && this.casesQueue.length > 0) {
      this.lastStep = 'cases';
      return this.casesQueue.shift();
    }
  }

  reset() {
    this.lastStep = undefined;
    this.casesQueue = [];
  }
}