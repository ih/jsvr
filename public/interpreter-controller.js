/* global AFRAME */

import Interpreter from './interpreter.js';

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
  }
  
  render() {
    const leftHand = document.querySelector('#leftHand');
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
    
    const slider = document.createElement('a-gui-slider');
    slider.setAttribute('height', .25);
    slider.setAttribute('width', 2);
    slider.setAttribute('value', 'step');
    slider.setAttribute('slider-collider', true);

    const button = document.createElement('a-gui-button');
    button.setAttribute('height', .15);
    button.setAttribute('width', .5);
    button.setAttribute('value', 'step');
    button.setAttribute('font-size', '30px')
    button.classList.add('triggerable');
    this.toggle = this.toggle.bind(this);   
    button.addEventListener('triggerdown', () => {
      this.interpreter.step();
    });
    
    // menu.appendChild(slider);
    menu.appendChild(button);
    leftHand.appendChild(menu);
    leftHand.addEventListener('xbuttondown', this.toggle);
   
    this.menuElement = menu;
  }
  
  toggle() {
    this.showMenu = !this.showMenu;
    
    this.menuElement.setAttribute('visible', this.showMenu);
  }
}

