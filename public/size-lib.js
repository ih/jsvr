// get the bounding size of the object and all its children
export function getBoundingSize(entity) {
  let object3D = getGeometryGroup(entity.object3D);
  let boundingBox = new THREE.Box3().setFromObject(object3D);
  let size = boundingBox.getSize();
  return Math.max(size.x, size.y, size.z);
}

export function scaleToSize(entity, newSize) {
  let size = getBoundingSize(entity);
  let newScale = newSize/size;
  entity.setAttribute('scale', `${newScale} ${newScale} ${newScale}`);
}

// useful if you want to place one object inside another and
// want it to be e.g. half the size of the containing object
export function scaleToContainer(entity, container, ratio) {
  let entitySize = getBoundingSize(entity);
  let containerSize = getBoundingSize(container);

  let scalingFactor = ratio/(entitySize/containerSize);

  entity.setAttribute('scale', `${scalingFactor} ${scalingFactor} ${scalingFactor}`);
  entity.object3D.scale.set(scalingFactor, scalingFactor, scalingFactor);
}

// extract only the nodes in object3D that have a geometry
// i.e. aren't a group
// TODO scale doesn't seem to be taken into account
// maybe try traversing the dom and adding mesh/object 3ds to create group
export function getGeometryGroup(object3D) {
  let geometryGroup = new THREE.Group();
  let queue = [object3D];
  while (queue.length > 0) {
    let node = queue.shift();
    // text geometry doesn't behave well with bounding boxes
    if (node.geometry && node.geometry.constructor.name !== 'TextGeometry') {
      geometryGroup.add(node.clone());
      // only get the top level object, should be removed once function is fixed
      // see above
      return geometryGroup;
    }
    queue = queue.concat(node.children);
  }
  return geometryGroup;
}

