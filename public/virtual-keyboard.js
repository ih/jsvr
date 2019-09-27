// basically a singleton 
export default class VirtualKeyboard {

  constructor() {
  }

  render() {
    const keyboardElement = document.createElement('a-entity');
    keyboardElement.setAttribute('super-keyboard', 'imagePath', 'https://raw.githubusercontent.com/supermedium/aframe-super-keyboard/master/dist/');
    keyboardElement.setAttribute('super-keyboard', 'hand', '#rightHand');
    keyboardElement.setAttribute('super-keyboard', 'multipleInputs', true);
    keyboardElement.setAttribute('super-keyboard', 'show', false);
    keyboardElement.setAttribute('id', 'keyboard');
    keyboardElement.setAttribute('position', '0 1.076 -0.5');
    keyboardElement.setAttribute('rotation', '-30 0 0');
    document.querySelector('a-scene').appendChild(keyboardElement);
    this.visualRepresentation = keyboardElement;
  }

  getElement() {
    return this.visualRepresentation;
  }

  // TODO create an abstraction over usage of the DOM and assumptions
  // of target element having a value
  attach(targetElement) {
    // if the keyboard was opened and the user hasn't entered data don't do anything
    if (this.visualRepresentation.getAttribute('super-keyboard').show) {
      return;
    }
    // place keyboard right in front of the user
    // TODO abstract over how to get the user's position/whether there is a single user
    const userPosition = document.querySelector('[look-controls]').getAttribute('position');
    this.visualRepresentation.setAttribute('position', {
      x: userPosition.x,
      y: userPosition.y * .75,
      z: userPosition.z - .5
    });
    this.visualRepresentation.setAttribute('super-keyboard', 'show', true);
    /*
    this.visualRepresentation.addEventListener('superkeyboardinput', () => {
      console.log('setting a new value');
      targetElement.setAttribute('value', this.visualRepresentation.getAttribute('super-keyboard').value);
      this.visualRepresentation.setAttribute('super-keyboard', 'show', false);
      this.targetElement = null;

    }, {once: true});
    */
  }
}