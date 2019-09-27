/* global cherow */
import AugmentedNode from '../augmented-node.js';
import ESTreeAugmenter from '../estree-augmenter.js';
import Pointer from '../pointer.js';
import TreeLayout from '../tree-layout.js';
import * as Keyboard from './keyboard.js';
import { sleep } from '../async-lib.js';

async function runTest() {
  const testProgram = `1;`;
  
  const testESTree = cherow.parse(testProgram);
  const initialPosition = { x:.15, y:.25, z:-.4 };
  const treeAugmenter = new ESTreeAugmenter(); 
  const augmentedTree = await treeAugmenter.augmentTree(testESTree, null, null, initialPosition);
  // const esTreeBuilder = new ESTreeBuilder();
  const rightHand = document.querySelector('#rightHand');
  const pointer = new Pointer();
  pointer.render();

  TreeLayout.setPositions(augmentedTree, initialPosition);
  await sleep(10000);

  Keyboard.initialize(document);

  // test menu not opening if node port is not free 
  /*
  rightHand.setAttribute('position', '.15 1.5 -.20');
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.ABUTTON);
  rightHand.setAttribute('rotation', '10 0 0');
  */
 
  // test opening the menu
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.TRIGGER, 2);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.ABUTTON);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.LEFT); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.BACK, 4); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.ABUTTON);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.GRIP);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.DOWN, 6); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.GRIP);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.UP, 3);

  // test node creation
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.RIGHT, 2, 1000);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.TRIGGER, 2, 1000);
  
  /*
  // test the close button
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.FORWARD, 12);  
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.RIGHT, 12);   
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.TRIGGER); 
  // test opening the menu twice
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.TRIGGER); 
  rightHand.setAttribute('position', '.143 1.190 .007')
  rightHand.setAttribute('rotation', '7 0 0')
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.ABUTTON, 1, 1000);
  */
}
runTest();