export intersection(a, b) {
  return [...a].filter(x => b.has(x));
}