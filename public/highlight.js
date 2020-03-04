import * as SizeLib from './size-lib.js';

export default class Highlight {

  render() {
    const boundingSize = SizeLib.getBoundingSize(this.target);
    const highlightElement = document.createElement('a-box');
    highlightElement.setAttribute('wireframe', true);
    highlightElement.setAttribute('width', boundingSize);
    highlightElement.setAttribute('color', 'yellow');
    this.highlightElement = highlightElement;
  }

  highlight(target) {
    this.target = target;
    if (!this.highlightElement) {
      // re-render each time since highlights probably happen 
      // relatively infrequently 
      this.render();
    }

    this.target.appendChild(this.highlightElement);
  }

  unhighlight() {
    if (!this.highlightElement) {
      return;
    }
    this.highlightElement.parentNode.removeChild(this.highlightElement);
    this.highlightElement = null;
  }
}
