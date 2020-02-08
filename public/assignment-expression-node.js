import AugmentedNode from './augmented-node.js';

export default class AssignmentExpressionNode extends AugmentedNode {
  evaluate(environment) {
    console.log('evaluating assignment expression');
    // TODO update this when we start to work with objects/arrays
    if (this.left.type !== 'Identifier') {
      throw 'Tried evaluating assignment where id is not an Identifier node. Eventually support this case when appropriate';
    }

    let newValue = this.right.getEvaluatedValue();
    if (this.operator !== '=') {
      const operator = this.operator.charAt(0);
      newValue = eval(`${environment.getValue(this.left.name)} ${operator} ${newValue}`);
    }
    environment.updateBinding(this.left.name, newValue);
    return environment;
  }
}