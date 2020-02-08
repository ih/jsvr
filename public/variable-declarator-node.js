import AugmentedNode from './augmented-node.js';

export default class VariableDeclaratorNode extends AugmentedNode {
  evaluate(environment) {
    console.log('evaluating a variable declarator');
    // add a new binding to the environment where the
    // name is the identifier name of the id field and the value
    // is the value of the init field
    if (this.id.type !== 'Identifier') {
      throw 'Tried evaluating declarator where id is not an Identifier node.';
    }
    // const bindingName = this.id.name;
    // const bindingValue = this.init.getEvaluatedValue();
    // pass in the nodes rather than the name and value
    // so that environment can use the visual representations
    environment.addBinding(this.id, this.init);
    return environment;
  }
}