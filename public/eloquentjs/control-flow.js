import ESTreeAugmenter from '../estree-augmenter.js';
import TreeLayout from '../tree-layout.js';
import { initializeTools } from '../toolbox.js';
import Grammar from '../grammar.js';

async function runTest() {
  Grammar.buildHierarchy();
  const testProgram = `if (false) {1;} else if (true) {2;} else {true;}`;

  const testESTree = cherow.parse(testProgram);
  const initialPosition = { x:.15, y:.25, z:-.4 };
  const treeAugmenter = new ESTreeAugmenter(); 
  const augmentedTree = await treeAugmenter.augmentTree(testESTree, null, null, initialPosition);
  initializeTools();

  TreeLayout.setPositions(augmentedTree, initialPosition);

} 

runTest();