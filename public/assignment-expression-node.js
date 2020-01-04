import AugmentedNode from './augmented-node.js';

export default class AssignmnetExpressionNode extends AugmentedNode {
  evaluate(environment) {
    console.log('evaluating assignment expression');
    // TODO update this when we start to work with objects/arrays
    if (this.left.type !== 'Identifier') {
      throw 'Tried evaluating assignment where id is not an Identifier node. Eventually support this case when appropriate';
    }
    environment.updateBinding(this.left.name, this.right);
    return environment;
  }
}