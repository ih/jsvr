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
  const rightHand = document.querySelector('#rightHand');
  const pointer = new Pointer();
  pointer.render();

  TreeLayout.setPositions(augmentedTree, initialPosition);
  await sleep(10000);

  Keyboard.initialize(document);

  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.TRIGGER, 2);

  // delete everything after ExpressionStatement so we can rebuild by hand
  const callExpressionElement = Array.from(scene.querySelectorAll(':scope > a-box')).filter((nodeElement) => {return nodeElement.dataRepresentation.type === 'CallExpression'})[0];
  callExpressionElement.parentNode.removeChild(callExpressionElement);

  // create a CallExpression node
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.ABUTTON);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.LEFT); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.BACK, 4); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.ABUTTON);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.GRIP);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.DOWN, 6); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.GRIP);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.UP, 3);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.RIGHT, 7); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.FORWARD, 4); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.TRIGGER, 2, 1000);

  // create a callee node
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.LEFT, 4); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.UP, 11); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.GRIP);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.DOWN, 13); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.GRIP);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.UP, 6);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.BACK, 3);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.LEFT, 4);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.ABUTTON, 2);

  // create a member expression node
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.DOWN, 3);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.GRIP);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.DOWN, 8);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.GRIP);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.UP, 5);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.LEFT, 12);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.TRIGGER, 2, 1000);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.UP, 12);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.GRIP);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.DOWN, 13); 
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.GRIP);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.UP, 6);
  await Keyboard.handAction(Keyboard.RIGHT_HAND, Keyboard.ABUTTON, 1);
  rightHand.setAttribute('position', '-.47 1.5 -.35');


} 

runTest();
