/* global AFRAME */

// import Interpreter from './interpreter.js';
import Interpreter from './interpreter2.js';
import AugmentedNode from './augmented-node.js';
import Environment from './environment.js';
import Grammar from './grammar.js';

export default class InterpreterController {
  constructor() {
    console.log('creating interpreter controller');
    this.interpreter = new Interpreter(new Environment());
    this.showMenu = false;
    
    // TODO don't hardcode this
    const programElement = document.querySelector('a-scene > .augmented-node');
    this.interpreter.interpret(programElement.dataRepresentation);
    this.toggle = this.toggle.bind(this);
    this.rootElement = document.querySelector('#leftHand');

  }
  
  render() {
    const menu = document.createElement('a-gui-flex-container');
    menu.setAttribute('visible', this.showMenu);
    menu.setAttribute('height', .3);
    menu.setAttribute('width', 1);
    menu.setAttribute('opacity', .7);
    menu.setAttribute('rotation', '-90 0 0');
    menu.setAttribute('position', '0 0 0');

    menu.setAttribute('flex-direction', 'row');
    menu.setAttribute('component-padding', .3);
    menu.setAttribute('item-padding', .3);
    menu.setAttribute('justify-content', 'center');
    menu.setAttribute('align-items', 'normal');

    // create live code button
    const liveCodeButton = this.createButton('loop', this.liveCode.bind(this));

    // create step button
    const stepButton = this.createButton('step', this.interpreter.step.bind(this.interpreter));

    // new program button
    const newProgramButton = this.createButton('new', this.createProgram.bind(this));
 
    menu.appendChild(liveCodeButton);
    menu.appendChild(stepButton);
    menu.appendChild(newProgramButton);
    // newProgramButton.setAttribute('position', {x: 0, y: -.3, z: 0});
    this.rootElement.appendChild(menu);
    this.rootElement.addEventListener('xbuttondown', this.toggle);
   
    this.menuElement = menu;
  }

  createButton(label, action) {
    const button = document.createElement('a-gui-button');
    button.setAttribute('height', .15);
    button.setAttribute('width', .3);
    button.setAttribute('value', label);
    button.setAttribute('font-size', '30px')
    button.setAttribute('margin', '.01 .01 .01 .01');
    button.classList.add('triggerable');
    this.toggle = this.toggle.bind(this);   
    button.addEventListener('triggerdown', () => {
      if (!this.showMenu) {
        return;
      }
      action();
    });

    return button;
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

  liveCode() {
    this.liveCoding = !this.liveCoding;
    if (!this.liveCoding) {
      clearInterval(this.liveStepperId);
    } else {
      this.liveStepperId = setInterval(() => {
        if (this.interpreter.isComplete()) {
          this.interpreter.reset();
        } else {
          this.interpreter.step();
        }
      }, 2000);
    }

  }
}

