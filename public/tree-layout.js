/* global THREE */

import Grammar from "./grammar.js";

export default class TreeLayout {
  static setPositions(rootNode, initialPosition, addLinks = true) {
    rootNode.position = initialPosition;

    const nodes = [rootNode];
    while (nodes.length > 0) {
      let current = nodes.shift();
      this.setPosition(current);
      if (addLinks) {
        this.addLink(current);
      }
      nodes.push(...this.getChildren(current));
    }
  }

  static addLink(node) {
    if (!node.parentData.node) {
      return;
    }
    const lineElement = document.createElement("a-line");
    lineElement.classList.add("line");
    const portElement = node.parentData.node.getPortElement(
      node.parentData.key,
      node.parentData.index
    );
    const nodeWorldPosition = node.visualRepresentation.object3D.getWorldPosition();
    portElement.object3D.worldToLocal(nodeWorldPosition);
    lineElement.setAttribute("start", "0 0 0");
    lineElement.setAttribute(
      "end",
      `${nodeWorldPosition.x} ${nodeWorldPosition.y} ${nodeWorldPosition.z}`
    );
    portElement.appendChild(lineElement);
  }

  static setPosition(node) {
    if (node.parentData.node === null) {
      return;
    }
    const yDelta = 0.5;
    const xDelta = 0.5;
    const zDelta = 0.5;
    // position depends on whether the previous child node is in an array or not
    // if it's an array node that isn't the first we want it's height to be based on the previous node
    // in the array using the height of the node and all it's children along with its y position.
    // otherwise it should be relative to the parent height using only the height of the parent node by itself

    node.position.y = node.parentData.node.height + yDelta;
    console.log("setting y");
    console.log(node.type);
    // if this is the first child we set the x position to be
    // based on the number of children of the parent so that the middle child
    // has about the same x position of the parent
    // if it isn't the first child we set the x based on the previous child's width
    const previousNode = this.getPreviousNode(node);
    if (previousNode === node.parentData.node) {
      const possibleChildCount = Grammar.getChildKeys(node.parentData.node.type)
        .length;
      node.position.x =
        ((-1 * (possibleChildCount - 1)) / 2) * (node.width + xDelta);
    } else {
      node.position.x = previousNode.position.x + previousNode.width + xDelta;
    }

    //TODO change this implemenation so z is dependent on the position of the port in the array
    if (this.isArrayChildNode(node)) {
      const arraySize = node.parentData.node[node.parentData.key].length;
      node.position.z =
        (node.parentData.index - (arraySize - 1) / 2) *
        (node.depth + zDelta) *
        -1;
      // we assume the current node is the last node in the array so far due to the
      // iteration order of tree augmentation
    } else {
      node.position.z = 0;
    }
  }

  static isArrayChildNode(node) {
    if (!node.parentData.node) {
      return false;
    }
    return Array.isArray(node.parentData.node[node.parentData.key]);
  }

  // a bounding box around the node and all its children
  computeFamilyBoundingBox(boundingBox) {
    boundingBox.makeEmpty();
    let queue = [this];
    let current;
    const temp = new THREE.Box3();
    while (queue.length > 0) {
      current = queue.shift();
      temp.setFromObject(current.visualRepresentation.getObject3D("mesh"));
      console.log(`TEMP ${JSON.stringify(temp.max)}`);
      console.log(
        `Inside bb ${current.type}: ${JSON.stringify(
          current.visualRepresentation.getObject3D("mesh").getWorldPosition()
        )}`
      );
      temp.makeEmpty();
      boundingBox.expandByObject(
        current.visualRepresentation.getObject3D("mesh")
      );
      queue.push(...current.getChildren());
    }
  }

  static getPreviousNode(node) {
    if (node.parentData.node === null) {
      return null;
    }
    const siblingKeys = Grammar.getChildKeys(node.parentData.node.type);
    let keyIndex = siblingKeys.indexOf(node.parentData.key);
    while (keyIndex > 0) {
      let previousPortContents =
        node.parentData.node[siblingKeys[keyIndex - 1]];
      if (Array.isArray(previousPortContents)) {
        previousPortContents = previousPortContents[0];
      }
      if (previousPortContents) {
        return previousPortContents;
      }
      keyIndex -= 1;
    }
    return node.parentData.node;
  }

  setChildPositions(children) {
    const levelDelta = 2;
    const neighborDelta = 3;
    let neighborIndex = (-1 * (children.length - 1)) / 2;

    children.forEach(child => {
      child.position.y = levelDelta;
      child.position.x = neighborIndex * neighborDelta;
      child.position.z = 0;
      neighborIndex += 1;
    });
  }

  static getChildren(node) {
    const childNodes = [];
    Grammar.getChildKeys(node.type).forEach(childKey => {
      let child = node[childKey];
      if (Array.isArray(child)) {
        child.forEach(childNode => {
          childNodes.push(childNode);
        });
      } else if (child && child.type) {
        childNodes.push(child);
      }
    });
    return childNodes;
  }
}
