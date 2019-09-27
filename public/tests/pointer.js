import Pointer from '../pointer.js';
import * as Keyboard from './keyboard.js';
import { sleep } from '../async-lib.js';

async function runTest() {
  await setup();
  const rightHand = document.querySelector('#rightHand');
  // test toggling of pointer
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.ABUTTON, 2, 1000);
  // test pointing at reactive object
  rightHand.setAttribute('rotation', '2 0 0');
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.ABUTTON, 6, 500);
}

async function setup() {
  Keyboard.initialize(document);

  // wait for the hand to render
  await sleep(10000);
  // create the pointer
  const pointer = new Pointer();
  pointer.render();
  // create an object that will react to being pointed at  
  renderPointableObject()
}

function renderPointableObject() {
  const cube = document.createElement('a-box');
  cube.setAttribute('position', '0 1.3 -1.8');
  cube.setAttribute('color', 'blue');
  cube.classList.add('pointable');
  const scene = document.querySelector('a-scene');
  scene.appendChild(cube);

  cube.addEventListener('raycaster-intersected', () => {
    cube.setAttribute('color', generateRandomColor());
  });
}

function generateRandomColor() {
  return "#"+((1<<24)*Math.random()|0).toString(16);
}

runTest();