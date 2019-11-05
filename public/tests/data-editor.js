/* global cherow */
import ESTreeAugmenter from '../estree-augmenter.js';
import TreeLayout from '../tree-layout.js';
import { initializeTools } from '../toolbox.js';
import * as Keyboard from './keyboard.js';
import { sleep } from '../async-lib.js';

async function runTest() {
  const testProgram = `1;`;
  
  const testESTree = cherow.parse(testProgram);
  const initialPosition = { x:.15, y:.25, z:-.4 };
  const treeAugmenter = new ESTreeAugmenter(); 
  const augmentedTree = await treeAugmenter.augmentTree(testESTree, null, null, initialPosition);

  TreeLayout.setPositions(augmentedTree, initialPosition);
  initializeTools();

  await sleep(10000);
  Keyboard.initialize(document);

  // open editable field
  // document.querySelector('a-scene').setAttribute('avatar-replayer', 'src:https://jsvr.glitch.me/tests/data/data-editor-open.json');

  // open editable field set a value then re-open editable field
  // document.querySelector('a-scene').setAttribute('avatar-replayer', 'src:https://jsvr.glitch.me/tests/data/data-editor-open-set-open.json');
}
runTest();