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