import { FraserInterpreter } from './fraser-interpreter.js';
// based on https://github.com/NeilFraser/JS-Interpreter/blob/master/interpreter.js
export default class Interpreter {
  constructor() {
    this.stateStack = [];
    this.globalScope = new Scope({});
  }
  
  // set up the global scope and initial state.
  // step function is then used to execute the program.
  interpret(esTreeNode) {
    this.interpreter = new FraserInterpreter(esTreeNode);
    // const initialState = new State(esTreeNode, this.globalScope);
    // this.stateStack.push(initialState);
  }
  
  step() {
    const currentState = this.interpreter.stateStack[this.interpreter.stateStack.length - 1];   
    // const currentState = this.stateStack[this.stateStack.length - 1];
    
    if (currentState.node.type === 'Program' && currentState.done) {
      return false;
    }
    currentState.node.visualRepresentation.appendChild(this.visualRepresentation);   

    // display the state of the interpreter when it was at the current node 
    const augmentedState = new AugmentedState(currentState);
    augmentedState.render();
    /*
    const nextState = currentState.node.execute(this.stateStack, currentState);

    if (nextState) {
      this.stateStack.push(nextState);
    }
    */
    
    return this.interpreter.step();
  }
 
  // the initial render of the interpreter
  render() {
    // get the first state and use the node
    const initialState = this.interpreter.stateStack[this.interpreter.stateStack.length - 1];
   
    // create the graphical representation and add it to the current node
    const interpreterElement = document.createElement('a-icosahedron');
    interpreterElement.setAttribute('color', 'green');
    interpreterElement.setAttribute('radius', .1);
    initialState.node.visualRepresentation.appendChild(interpreterElement);
    this.visualRepresentation = interpreterElement;
  }

}

export class AugmentedState {
  constructor(state) {
    Object.assign(this, state);
    
  }
  
  render() {
    const stateSelector = ':scope > .state-data';
    // if the current node already has state information use that
    // otherwise create a new text element for representing state data
    let stateElement = this.node.visualRepresentation.querySelector(stateSelector);
    if (!stateElement) {
      stateElement = document.createElement('a-text');
      stateElement.classList.add('state-data');
      this.node.visualRepresentation.appendChild(stateElement); 
    }
    
    stateElement.setAttribute('value', this.getDataAsText());
  }
  
  getDataAsText() {
    // get the keys that aren't the node or the scope
    const keysOfInterest = Object.keys(this).filter((key) => {
      return key !== 'node' && key !== 'scope' && key.slice(-1) !== '_';
    });
    const stateData = {};
    keysOfInterest.forEach((key) => {
      stateData[key] = this[key];
    });
    return JSON.stringify(stateData, null, 2); 
  }
}

export class Scope {
  constructor(bindings) {
    this.bindings = bindings;
  }
  
}