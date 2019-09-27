import AugmentedNode from './augmented-node.js';
// import { State } from './interpreter.js';

export function getNodeClass(type) {
  const nodeClassMap = {
    Program: ProgramNode,
    VariableDeclaration: VariableDeclarationNode
  };
  
  if (type in nodeClassMap) {
    return nodeClassMap[type];
  } else {
    return AugmentedNode;
  }
};

class ProgramNode extends AugmentedNode {
  constructor(esTree, id, parent, keyInParent, index, rootPosition) {
    console.log('Making a program node');
    super(esTree, id, parent, keyInParent, index, rootPosition);
  }
  
  execute(stack, state) {
    console.log('executing program node');   
    const expression = this.body.shift();
    if (expression) {
      state.done = false;
      return new State(expression, state.scope);
    }
    state.done = true;
  }
}

class VariableDeclarationNode extends AugmentedNode {
  constructor(esTree, id, parent, keyInParent, index, rootPosition) {
    console.log('Making a program node');
    super(esTree, id, parent, keyInParent, index, rootPosition);
  }
  
  execute(stack, state) {
    console.log('executing variable declaration node');
    const declarations = this.declarations;
    const n = state.n_ || 0;
    const declarationNode = declarations[n];
    if (state.init_ && declarationNode) {
      this
    }
  }
}