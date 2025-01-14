import Grab from "./grab2.js";

export default class Interpreter {
  constructor(environment) {
    this.nodeStack = [];
    this.visited = null;
    this.primaryHand = document.getElementById("rightHand");
    this.environment = environment;
  }

  interpret(root) {
    this.root = root;
    this.reset();
    // this.nodeStack = [];
    // this.nodeStack.push(root);
    // this.visited = new Set();
  }

  reset() {
    if (!this.root) {
      throw 'trying to reset interpreter without a root';
    }
    if (!this.visualRepresentation) {
      this.render();
    }
    this.visualRepresentation.setAttribute('color', 'green');
    this.root.visualRepresentation.appendChild(this.visualRepresentation);
    this.nodeStack = [this.root];
    this.visited = new Set();
    this.environment.reset();
  }

  isComplete() {
    return this.nodeStack.length === 0;
  }

  step() {
    if (this.isComplete()) {
      console.log("evaluation complete");
      this.visualRepresentation.setAttribute('color', 'red');
      return;
    }
    const current = this.nodeStack.pop();
    current.visualRepresentation.appendChild(this.visualRepresentation);

    const children = current.getChildren();
    if (this.visited.has(current) || children.length === 0) {
      this.environment = this.evaluate(current);
    } else {
      this.nodeStack.push(current);
      this.visited.add(current);
      // don't modify the original node
      [...children].reverse().forEach(child => {
        if (Array.isArray(child)) {
          [...child].reverse().forEach(arrayChild => {
            this.nodeStack.push(arrayChild);
          });
        } else {
          this.nodeStack.push(child);
        }
      });
    }
  }

  evaluate(node) {
    return node.evaluate(this.environment);
  }

  render() {
    const interpreterElement = document.createElement("a-icosahedron");
    interpreterElement.setAttribute("color", "green");
    interpreterElement.setAttribute('wireframe', true);
    interpreterElement.setAttribute("radius", 0.1);
    interpreterElement.classList.add("pointable");
    this.visualRepresentation = interpreterElement;
    this.root.visualRepresentation.appendChild(interpreterElement);
    const grab = new Grab(this.visualRepresentation, "");
    this.visualRepresentation.grab = grab;
    // code for moving the interpreter between nodes
    this.visualRepresentation.addEventListener(
      "raycaster-intersected",
      event => {
        if (!this.isContainedInNode()) {
          return;
        }
        this.detachFromNode();
      }
    );

    this.environment.render(this.visualRepresentation);
  }

  isContainedInNode() {
    return this.visualRepresentation.parentElement.classList.contains(
      "augmented-node"
    );
  }

  detachFromNode() {
    // move the interpreter to your hand
    const newPosition = this.primaryHand.getAttribute("position");
    this.visualRepresentation.setAttribute("position", newPosition);
    this.visualRepresentation.setAttribute('color', 'green');
    scene.appendChild(this.visualRepresentation);
    this.visualRepresentation.classList.add("grabbable");
    const nodeCollisionDetector = new CollisionDetector(
      this.visualRepresentation
    );
    this.visualRepresentation.addEventListener("gripup", () => {
      nodeCollisionDetector.updateBounds();
      document.querySelectorAll(".augmented-node").forEach(collidableObject => {
        if (nodeCollisionDetector.isIntersecting(collidableObject)) {
          console.log("released on a node");
          this.attachToNode(collidableObject);
        }
      });
    });
  }

  attachToNode(targetNode) {
    this.visualRepresentation.setAttribute("position", {
      x: 0,
      y: 0,
      z: 0
    });
    targetNode.appendChild(this.visualRepresentation);
    this.visualRepresentation.classList.remove("grabbable");
    this.interpret(targetNode.dataRepresentation);
  }

  // from https://stackoverflow.com/a/25859853 
  static eval(code, environment) {
    // use a function object to create the desired scope
    // and return the results
    // the alternative of using 'with' requires non-strict mode
    // which doesn't seem to be available
    let functionParameters = environment.getVariableNames();
    // we wrap the code in an eval and return statement otherwise
    // it's not clear we could get what the result of the code is
    // without parsing it and inserting a return in the right place
    code = `return eval('${code}');`;
    functionParameters.push(code);
    let codeWithEnvironment = new Function(...functionParameters);
    return codeWithEnvironment(...environment.getVariableValues());
  }
}
