import { initializePointer, initializeVirtualConsole } from '../toolbox.js';

console.log('material keyboard');
initializePointer();
initializeVirtualConsole();
console.log('tools initialized');
const keyboard = document.createElement('a-keyboard');
keyboard.setAttribute('is-open', true);
keyboard.classList.add('pointable');
scene.appendChild(keyboard);

keyboard.addEventListener('enter', () => {
  console.log('Enter pressed!');
});

const input = document.createElement('a-input');
input.setAttribute('position', {y: 1, z: -2});
input.setAttribute('width', 1);
input.setAttribute('placeholder', 'hello');
input.classList.add('pointable');
keyboard.appendChild(input);