import Pointer from './pointer.js';
import VirtualKeyboard from './virtual-keyboard.js';
import VirtualConsole from './virtual-console.js';
import InterpreterController from './interpreter-controller.js';

// basically just a way to initialize "singleton" tools
// e.g. keyboard, pointer, interpreter, etc
let keyboard;
let pointer;
let virtualConsole;
let interpreterController;
console.log('initializing tools');

export function initializeTools() {
  keyboard = new VirtualKeyboard();
  keyboard.render();

  pointer = new Pointer();
  pointer.render();

  virtualConsole = new VirtualConsole();
  virtualConsole.render();

  interpreterController = new InterpreterController();
  interpreterController.render();
}

export function getPointer() {
  if (pointer === undefined) {
    pointer = new Pointer();
    pointer.render();
  }
  return keyboard;
}

export function getKeyboard() {
  if (keyboard === undefined) {
    keyboard = new VirtualKeyboard();
    keyboard.render();
  }
  return keyboard;
}