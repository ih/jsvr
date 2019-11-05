export default class Interpreter {
  constructor() {
    this.nodeStack = [];
    this.visited = null;
  }

  interpret(root) {
    this.root = root;
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
    this.visualRepresentation = interpreterElement;
    this.root.visualRepresentation.appendChild(interpreterElement);
  }
}