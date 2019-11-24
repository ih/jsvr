/* global AFRAME */

// import Interpreter from './interpreter.js';
import Interpreter from './interpreter2.js';
import AugmentedNode from './augmented-node.js';
import Grammar from './grammar.js';

export default class InterpreterController {
  constructor() {
    console.log('creating interpreter controller');
    this.interpreter = new Interpreter();
    this.showMenu = false;
    
    // TODO don't hardcode this
    const programElement = document.querySelector('a-scene > .augmented-node');
    this.interpreter.interpret(programElement.dataRepresentation);
    this.interpreter.render();
    this.toggle = this.toggle.bind(this);
    this.rootElement = document.querySelector('#leftHand');

  }
  
  render() {
    const menu = document.createElement('a-gui-flex-container');
    menu.setAttribute('visible', this.showMenu);
    menu.setAttribute('height', .5);
    menu.setAttribute('width', 1);
    menu.setAttribute('opacity', .7);
    menu.setAttribute('rotation', '-90 0 0');
    menu.setAttribute('position', '0 0 0');
    menu.setAttribute('flex-direction', 'column');
    menu.setAttribute('component-padding', '1.75');
    menu.setAttribute('item-padding', 0);
    menu.setAttribute('justify-content', 'center');
    menu.setAttribute('align-items', 'normal');
   
    // create step button
    const stepButton = document.createElement('a-gui-button');
    stepButton.setAttribute('height', .15);
    stepButton.setAttribute('width', .5);
    stepButton.setAttribute('value', 'step');
    stepButton.setAttribute('font-size', '30px')
    stepButton.classList.add('triggerable');
    this.toggle = this.toggle.bind(this);   
    stepButton.addEventListener('triggerdown', () => {
      if (!this.showMenu) {
        return;
      }
      this.interpreter.step();
    });

    // new program button
    const newProgramButton = document.createElement('a-gui-button');
    newProgramButton.setAttribute('height', .15);
    newProgramButton.setAttribute('width', .5);
    newProgramButton.setAttribute('value', 'new program');
    newProgramButton.setAttribute('font-size', '30px')
    newProgramButton.classList.add('triggerable');
    this.toggle = this.toggle.bind(this);   
    newProgramButton.addEventListener('triggerdown', () => {
      if (!this.showMenu) {
        return;
      }
      console.log('making a new program');
      this.createProgram()
    });
   
    menu.appendChild(stepButton);
    menu.appendChild(newProgramButton);
    this.rootElement.appendChild(menu);
    this.rootElement.addEventListener('xbuttondown', this.toggle);
   
    this.menuElement = menu;
  }
  
  toggle() {
    this.showMenu = !this.showMenu;
    
    this.menuElement.setAttribute('visible', this.showMenu);
  }

  // TODO put this somewhere else? ProgramNode class that inherits from AugmentedNode?
  async createProgram() {
    const programNodeData = {type: 'Program', body: [], 'sourType': 'script'};
    const programNode = new AugmentedNode(programNodeData);

    const programElement = await programNode.render();
    const position = this.rootElement.getAttribute('position');
    programElement.setAttribute('position', {x: position.x, y: position.y, z: position.z - .5 });
    scene.appendChild(programElement);
  }
}

