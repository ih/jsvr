import * as NodeClasses from "./node-classes.js";
import Grammar from "./grammar.js";
import { walk } from "https://cdn.jsdelivr.net/npm/estree-walker@0.6.0/src/estree-walker.js";
import { asyncForEach } from "./async-lib.js";

export default class ESTreeAugmenter {
  constructor() {
    // position setting related state
    this.childCounter = {};
    this.nodeCount = 0;
    this.levelDelta = -2;
    this.neighborDelta = 6;
    this.scaleFactor = 1;
    // a mapping of node type to the names/keys of its children nodes
    // a cache used for traversal, instead of computing the children each
    // time
    // see https://github.com/Rich-Harris/estree-walker/blob/master/src/estree-walker.js#L29
    this.childKeys = {};
  }

  generateId() {
    this.nodeCount += 1;
    return this.nodeCount;
  }

  setInitialPosition(node, parent) {
    if (parent === null) {
      node.position = {
        x: 0,
        y: 5,
        z: 0
      };
      node.scale = {
        x: 1,
        y: 1,
        z: 1
      };
      return;
    }
    node.position.y = this.levelDelta;
    node.position.x = (this.childCounter[parent.id] - 1) * this.neighborDelta;
    node.position.z = 0;
    node.scale.x = parent.scale.x * this.scaleFactor;
    node.scale.y = parent.scale.y * this.scaleFactor;
    node.scale.z = parent.scale.z * this.scaleFactor;
  }

  async augmentTree(
    esTreeNode,
    parentNode,
    keyInParent,
    indexInArray,
    rootPosition
  ) {
    if (esTreeNode === null) {
      return;
    }
    const NodeClass = NodeClasses.getNodeClass(esTreeNode.type);
    esTreeNode = new NodeClass(
      esTreeNode,
      this.generateId(),
      parentNode,
      keyInParent,
      indexInArray,
      rootPosition
    );
    await esTreeNode.render();
    console.log(
      `after render ${esTreeNode.type}: ${JSON.stringify(
        esTreeNode.visualRepresentation.getObject3D("mesh").getWorldPosition()
      )}`
    );
    const childNodes = [];
    // try for of? https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    await asyncForEach(
      Grammar.getChildKeys(esTreeNode.type),
      async childKey => {
        let child = esTreeNode[childKey];
        if (Array.isArray(child)) {
          await asyncForEach(child, async (childNode, index) => {
            const augmentedChild = await this.augmentTree(
              childNode,
              esTreeNode,
              childKey,
              index
            );
            esTreeNode.childIdToKey[augmentedChild.id] = childKey;
            childNodes.push(augmentedChild);
            esTreeNode[childKey][index] = augmentedChild;
          });
        } else if (child && child.type) {
          child = await this.augmentTree(child, esTreeNode, childKey);
          esTreeNode.childIdToKey[child.id] = childKey;
          childNodes.push(child);
          esTreeNode[childKey] = child;
        }
      }
    );

    return new Promise(resolve => {
      resolve(esTreeNode);
    });
  }

  initialRender(augmentedTree, startPosition) {
    augmentedTree.position = startPosition;
    walk(augmentedTree, {
      enter: (node, parent) => {
        if (parent !== null) {
          node.render(parent.visualRepresentation);
        } else {
          node.render();
        }
      }
    });
  }
}
