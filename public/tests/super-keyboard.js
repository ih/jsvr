import ESTreeAugmenter from '../estree-augmenter.js';
import TreeLayout from '../tree-layout.js';
import Pointer from '../pointer.js';
import * as Keyboard from './keyboard.js';
import { sleep } from '../async-lib.js';

async function runTest() {
  /*
  const testProgram = `console.log('hello world');`;

  const testESTree = cherow.parse(testProgram);
  const initialPosition = { x:.15, y:.25, z:-.4 };
  const treeAugmenter = new ESTreeAugmenter(); 
  const augmentedTree = await treeAugmenter.augmentTree(testESTree, null, null, initialPosition);
  TreeLayout.setPositions(augmentedTree, initialPosition);
  */
  const pointer = new Pointer();
  pointer.render();


  addKeyboard();
  await sleep(10000);

  // document.querySelector('a-scene').setAttribute('avatar-replayer', 'src:https://jsvr.glitch.me/tests/data/test.json');

} 

function addKeyboard() {
  console.log('adding keyboard');
  const keyboard = document.createElement('a-entity');
  keyboard.setAttribute('super-keyboard', 'hand: #rightHand; imagePath:https://raw.githubusercontent.com/supermedium/aframe-super-keyboard/master/dist/');
  keyboard.setAttribute('position', '0 1.076 -0.5');
  keyboard.setAttribute('rotation', '-30 0 0');
  keyboard.addEventListener('superkeyboardinput', () => {
    console.log(entery);
  });

  document.querySelector('a-scene').appendChild(keyboard);

}

runTest();

