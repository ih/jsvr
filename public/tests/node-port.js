/* global cherow */
import ESTreeAugmenter from '../estree-augmenter.js';
import TreeLayout from '../tree-layout.js';
import * as Keyboard from './keyboard.js';
import { sleep } from '../async-lib.js';

async function runTest() {
  const testProgram = `1;`;
  
  const testESTree = cherow.parse(testProgram);
  const initialPosition = { x:.15, y:.25, z:-.4 };
  const treeAugmenter = new ESTreeAugmenter(); 
  const augmentedTree = await treeAugmenter.augmentTree(testESTree, null, null, initialPosition);

  TreeLayout.setPositions(augmentedTree, initialPosition);
  await sleep(10000);
  Keyboard.initialize(document);
 
  // test connecting nodes 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.TRIGGER, 2);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.UP, 2, 1000);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.BACK);

  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.TRIGGER); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.UP, 12);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.TRIGGER);  
}
runTest();