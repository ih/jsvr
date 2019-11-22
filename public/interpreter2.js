import Grab from './grab2.js';

export default class Interpreter {
  constructor() {
    this.nodeStack = [];
    this.visited = null;
    this.primaryHand = document.getElementById("rightHand");
  }

  interpret(root) {
    this.root = root;
    this.nodeStack = [];
    this.nodeStack.push(root)
    this.visited = new Set();
  }

  step() {
    if (this.nodeStack.length === 0) {
      console.log('evaluation complete');
      return;
    }
    const current = this.nodeStack.pop();
    current.visualRepresentation.appendChild(this.visualRepresentation);
    const children = current.getChildren();
    if (this.visited.has(current) || children.length === 0) {
      this.evaluate(current);
    } 
   else {

      this.nodeStack.push(current);
      this.visited.add(current);
      // don't modify the original node
      [...children].reverse().forEach((child) => {
        if (Array.isArray(child)) {
          [...child].reverse().forEach((arrayChild) => {
            this.nodeStack.push(arrayChild);
          });
        } else {
          this.nodeStack.push(child);
        }
      });    }
  }

  evaluate(node) {
    try {
      const code = astring.generate(node);
      const value = eval(code);
      node.renderValue(value);
    } catch(error) {

    }
  }

  render() {
    const interpreterElement = document.createElement('a-icosahedron');
    interpreterElement.setAttribute('color', 'green');
    interpreterElement.setAttribute('radius', .1);
    interpreterElement.classList.add('pointable');
    this.visualRepresentation = interpreterElement;
    this.root.visualRepresentation.appendChild(interpreterElement);
    const grab = new Grab(this.visualRepresentation, '');
    this.visualRepresentation.grab = grab;
    // code for moving the interpreter between nodes 
    this.visualRepresentation.addEventListener('raycaster-intersected', (event) => {
      if (!this.isContainedInNode()) {
        return;
      }
      this.detachFromNode();
    });
  }

  isContainedInNode() {
    return this.visualRepresentation.parentElement.classList.contains('augmented-node');
  }

  detachFromNode() {
    // move the interpreter to your hand 
    const newPosition = this.primaryHand.getAttribute('position');
    this.visualRepresentation.setAttribute('position', newPosition);
    scene.appendChild(this.visualRepresentation);
    this.visualRepresentation.classList.add('grabbable');
    const nodeCollisionDetector = new CollisionDetector(this.visualRepresentation);
    this.visualRepresentation.addEventListener('gripup', () => {
      nodeCollisionDetector.updateBounds();
      document.querySelectorAll('.augmented-node').forEach((collidableObject) => {
        if(nodeCollisionDetector.isIntersecting(collidableObject)) {
          console.log('released on a node');
          this.attachToNode(collidableObject);
        }
      });
    });
  }

  attachToNode(targetNode) {
    this.visualRepresentation.setAttribute('position', {
      x: 0,
      y: 0,
      z: 0
    });
    targetNode.appendChild(this.visualRepresentation);
    this.visualRepresentation.classList.remove('grabbable');
    this.interpret(targetNode.dataRepresentation);
  }
}