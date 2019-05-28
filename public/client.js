/* global cherow, THREE */

import AugmentedNode from './augmented-node.js';
import ESTreeAugmenter from './estree-augmenter.js';
import TreeLayout from './tree-layout.js';
import Interpreter from './interpreter.js';
import { FraserInterpreter } from './fraser-interpreter.js';
import InterpreterController from './interpreter-controller.js';
import Menu from './menu.js';
import ESTreeBuilder from './estree-builder.js';

// TODO make this not global?
var scene = document.querySelector('a-scene'); 
var font;
const loader = new THREE.FontLoader();

THREE.Cache.enabled = true;

// client-side js

/*
class IdentifierNode extends AugmentedNode {
  render() {
    const nodeElement = document.createElement('a-sphere');
  }
}
*/

async function initialize() {
 
 const testProgram = `1;`;
  // const testProgram = `var x = 1; x; x + 3;`;
  /*
  const testProgram = `let total = 0, count = 1;
while (count <= 10) {
  total += count;
  count += 1;
}`;
*/
  /*
  const testProgram = `
  class ESTreeAugmenter {
    constructor(nodeProperties) {
      this.nodeProperties = nodeProperties;

      // position setting related state
      this.childCounter = {};
      this.nodeCount = 0;
      this.levelDelta = 2;
      this.neighborDelta = 6;
      // a mapping of node type to the names/keys of its children nodes
      // a cache used for traversal, instead of computing the children each
      // time
      // see https://github.com/Rich-Harris/estree-walker/blob/master/src/estree-walker.js#L29
      this.childKeys = {};
    }

    getProperties(type) {
       if (type in this.nodeProperties) {
         return this.nodeProperties[type];
       }
      return this.nodeProperties['default'];
    }

    generateId() {
      this.nodeCount += 1;
      return this.nodeCount;
    }

    setInitialPosition(node, parent) {
      if (parent === null) {
        node.position = {
          x: 0,
          y: 10,
          z: 0
        };     
        return;
      }
      node.position.y = parent.position.y + this.levelDelta;
      node.position.x = parent.position.x + ((this.childCounter[parent.id] - 1) * this.neighborDelta);
      node.position.z = 0;
    }

    getChildKeys(esTreeNode) {
      if (!(esTreeNode.type in this.childKeys)) {
        const childKeys = Object.keys(esTreeNode).filter((key) => {
          return typeof esTreeNode[key] === 'object';
        });
        this.childKeys[esTreeNode.type] = childKeys;
      }

      return this.childKeys[esTreeNode.type];
    }

    augmentTree(esTreeNode, initialPosition) {
      if (esTreeNode === null) {
        return;
      }
      esTreeNode = new AugmentedNode(esTreeNode);
      this.getChildKeys(esTreeNode).forEach((childKey) => {
        let child = esTreeNode[childKey];
        if (Array.isArray(child)) {
          child = child.map((childNode) => {
            return this.augmentTree(childNode);
          });
        }
        else if (child && child.type) {
          child = this.augmentTree(child); 
        }
        esTreeNode[childKey] = child;
      });
      return esTreeNode;


    }

    setTreeInitialPosition(augmentedTree) {
      walk(augmentedTree, {
        enter: (node, parent) => {
          node.id = this.generateId();
          this.childCounter[node.id] = 0;
          if (parent !== null) {
            this.childCounter[parent.id] += 1;
          }
          this.setInitialPosition(node, parent);
          node.render();       
        }
      });
    }
  }
  `;
  */
  const testESTree = cherow.parse(testProgram);
  console.log(testESTree);
  const initialPosition = { x:0, y:0, z:-3 };
  const treeAugmenter = new ESTreeAugmenter();
  var augmentedTree = await treeAugmenter.augmentTree(testESTree, null, null, initialPosition);
  console.log('augmented');
  console.log(augmentedTree);

  TreeLayout.setPositions(augmentedTree, initialPosition);

  loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
    font = loadedFont; 
    // treeAugmenter.initialRender(augmentedTree, { x:0, y:0, z:-2 });
  });

  console.log(treeAugmenter.nodeCount);

  
  const interpreterController = new InterpreterController();
  // const interpreter = new FraserInterpreter(augmentedTree);
  // interpreter.step();
  const menu = new Menu(scene);
  const esTreeBuilder = new ESTreeBuilder();
}

initialize();

//

// testESTree.render();
