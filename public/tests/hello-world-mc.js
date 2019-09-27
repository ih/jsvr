import ESTreeAugmenter from '../estree-augmenter.js';
import TreeLayout from '../tree-layout.js';
import Pointer from '../pointer.js';
import * as Keyboard from './keyboard.js';
import { sleep } from '../async-lib.js';

async function runTest() {
  const testProgram = `console.log('hello world');`;

  const testESTree = cherow.parse(testProgram);
  const initialPosition = { x:.15, y:.25, z:-.4 };
  const treeAugmenter = new ESTreeAugmenter(); 
  const augmentedTree = await treeAugmenter.augmentTree(testESTree, null, null, initialPosition);
  const pointer = new Pointer();
  pointer.render();

  TreeLayout.setPositions(augmentedTree, initialPosition);
  await sleep(10000);

  // document.querySelector('a-scene').setAttribute('avatar-replayer', 'src:https://jsvr.glitch.me/tests/data/test.json');

} 

runTest();