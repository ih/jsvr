/* global cherow */
import AugmentedNode from '../augmented-node.js';
import ESTreeAugmenter from '../estree-augmenter.js';
import Pointer from '../pointer.js';
import TreeLayout from '../tree-layout.js';
import * as Keyboard from './keyboard.js';
import { sleep } from '../async-lib.js';

async function runTest() {
  const testProgram = `1;2;`;
  
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

  // document.querySelector('a-scene').setAttribute('avatar-replayer', 'src:https://jsvr.glitch.me/tests/data/node-port-array-add-port-open.json');

  // add a port then open the menu 
  // document.querySelector('a-scene').setAttribute('avatar-replayer', 'src:https://jsvr.glitch.me/tests/data/node-port-array-add-port-open-add.json');

  // add a node, then try to add a port
  // document.querySelector('a-scene').setAttribute('avatar-replayer', 'src:https://jsvr.glitch.me/tests/data/node-port-array-add-node-add-port.json');
 
  // add a port and node then try to release the node
  document.querySelector('a-scene').setAttribute('avatar-replayer', 'src:https://jsvr.glitch.me/tests/data/node-port-array-add-port-release-connection.json');

}
runTest();