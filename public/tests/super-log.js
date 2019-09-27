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


  addLog();
  await sleep(10000);

  // document.querySelector('a-scene').setAttribute('avatar-replayer', 'src:https://jsvr.glitch.me/tests/data/test.json');

} 

function addLog() {
  console.log('adding log');
  const log = document.createElement('a-entity');
  log.setAttribute('log', true);
  log.setAttribute('position', '0 1.076 -0.5');
  log.setAttribute('geometry', 'primitive', 'plane');
  log.setAttribute('material', 'color', '#111');
  log.setAttribute('text', 'color', 'lightgreen');

  document.querySelector('a-scene').appendChild(log);

}

runTest();

