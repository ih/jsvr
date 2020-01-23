import ESTreeAugmenter from "../estree-augmenter.js";
import TreeLayout from "../tree-layout.js";
import { initializeTools } from "../toolbox.js";
import Grammar from "../grammar.js";

async function runTest() {
  Grammar.buildHierarchy();
  const testProgram = `let counter = 2;
  do {
    counter -= 1;
  } while (counter > 0);`;

  const testESTree = cherow.parse(testProgram);
  const initialPosition = { x: 0.15, y: 0.25, z: -0.4 };
  const treeAugmenter = new ESTreeAugmenter();
  const augmentedTree = await treeAugmenter.augmentTree(
    testESTree,
    null,
    null,
    initialPosition
  );
  initializeTools();

  TreeLayout.setPositions(augmentedTree, initialPosition);
}

runTest();
