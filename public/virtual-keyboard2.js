// basically a singleton
export default class VirtualKeyboard {
  constructor() {}

  render() {
    // input attached to the keyboard

    const keyboardElement = document.createElement("a-keyboard");
    keyboardElement.classList.add('pointable');
    // keyboardElement.setAttribute('is-open', true);

    document.querySelector("a-scene").appendChild(keyboardElement);


    this.visualRepresentation = keyboardElement;
  }

  getElement() {
    return this.visualRepresentation;
  }

  // TODO create an abstraction over usage of the DOM and assumptions
  // of target element having a value
  attach(targetElement, onEnter) {
    // place keyboard right in front of the user
    // TODO abstract over how to get the user's position/whether there is a single user
    this.visualRepresentation.setAttribute("is-open", true);
   
    const userPosition = document
      .querySelector("[look-controls]")
      .getAttribute("position");
    this.visualRepresentation.setAttribute("position", {
      x: userPosition.x - .3,
      y: userPosition.y -.5,
      z: userPosition.z - 1 
    });
    const inputElement = document.createElement('a-input');
    // for some reason an input element does not render correctly
    // if the keyboard starts as hidden and the input is a child
    // so render it here for now
    inputElement.setAttribute('position', {y: 1});
    inputElement.setAttribute('placeholder', 'hello');
    inputElement.setAttribute('color', 'black');
    inputElement.setAttribute('background-color', 'white');
    inputElement.setAttribute('width', 1);
    inputElement.classList.add('pointable');
    this.visualRepresentation.appendChild(inputElement);
    inputElement.focus();


    this.visualRepresentation.addEventListener('enter', onEnter, {once: true});
    this.visualRepresentation.addEventListener('enter', () => {
      inputElement.parentNode.removeChild(inputElement);
    }, {once: true});
  }

  getValue() {
    return this.visualRepresentation.querySelector('a-input').value;
  }

  hide() {
    this.visualRepresentation.setAttribute('is-open', false);
  }
}
