export function farthest(node, selector) {
  let current;
  do {
    current = node;
    if (node.parentEl) {
      node = node.parentEl.closest(selector);
    }
  } while (node && (node !== current));
  return current;
}

export function setParent(targetElement, newParent) {
  targetElement.flushToDOM(true);
  const targetCopy = targetElement.cloneNode(true);
  newParent.appendChild(targetCopy);
  targetElement.parentNode.removeChild(targetElement);
}