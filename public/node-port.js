import TreeLayout from './tree-layout.js';
/* global AFRAME, CollisionDetector, scene  */
AFRAME.registerComponent('node-port', {
  init: function () {
    console.log(`node-port for ${this.el.node.type}`); 
    this.primaryHand = document.getElementById("rightHand");
    this.secondaryHand = document.getElementById("leftHand");   
    
    this.primaryHand.addEventListener('gripdown', (event) => {
      const grabbingHand = this.primaryHand;
      if (grabbingHand.collisionDetector.isIntersecting(this.el) && this.el.dataRepresentation) {
        this.releaseNode();
      }
      else if (grabbingHand.collisionDetector.isIntersecting(this.el) && !this.el.dataRepresentation) {
        this.connectNode();
      }
    });
  },
  
  connectNode: function () {
    console.log('start connection');
    // add guideline component which starts at port center 
    // and the end point is the hand
    const startId = 'startPort';
    this.el.setAttribute('id', startId);
    const guideLine = document.createElement('a-entity');
    guideLine.setAttribute('dynamic-line', `start: #rightHand; end: #${startId}`);
    scene.appendChild(guideLine);
    // when the user grabs again delete the guideline
    // if the user grabbed on another node set that node as the data of the port
    // otherwise the only result is the guideline gets deleted
    const releaseConnection = (event) => {
      this.el.setAttribute('id', '');
      guideLine.parentNode.removeChild(guideLine);
      this.primaryHand.removeEventListener('gripup', releaseConnection);
      
      // get all the root nodes and do an intersection
      // check, connect the first one that passes 
      const handCollisionDetector = new CollisionDetector(this.primaryHand);
      const rootNodeElements = scene.querySelectorAll(':scope > .augmented-node');
      for (let i=0; i<rootNodeElements.length; i++) {
        const rootNodeElement = rootNodeElements[i];
        if (handCollisionDetector.isIntersecting(rootNodeElement)) {
          this.el.node.visualRepresentation.appendChild(rootNodeElement);
          console.log('collision!');
          console.log(rootNodeElement);
          // update the connections between nodes
          const rootNode = rootNodeElement.dataRepresentation;
          if (this.el.index) {
            this.el.node.setChild(rootNode, this.el.childKey, this.el.index);
          } else {
            this.el.node.setChild(rootNode, this.el.childKey, null);
          }
          this.el.dataRepresentation = rootNode;
          
          setTimeout(() => {
                      // update the visuals
          this.el.setAttribute('color', 'red');
          // reset the positions
          TreeLayout.setPosition(rootNode);
          // add the line
          TreeLayout.addLink(rootNode);

          }, 1000);

          break;
        }          
      }
    };
    this.primaryHand.addEventListener('gripup', releaseConnection);
  },
  
  releaseNode: function () {
   // remove visual link
    const lineElement = this.el.querySelector(':scope > .line');
    lineElement.parentNode.removeChild(lineElement);
    // update augmented node and child data
    // if the port is an array node
    let childNode;
    if (this.el.index > -1) {
      childNode = this.el.node[this.el.childKey][this.el.index]; 
      this.el.node[this.el.childKey][this.el.index] = null;     
    } else {
      childNode = this.el.node[this.el.childKey];  
      this.el.node[this.el.childKey] = null;
    }
    childNode.parentData = {
      node: null,
      key: null,
      index: null
    };
    this.el.dataRepresentation = null;
    // update visual representation
    this.el.setAttribute('color', 'green');
    const childPosition = childNode.visualRepresentation.object3D.getWorldPosition();
    childNode.position = {
      x: childPosition.x,
      y: childPosition.y,
      z: childPosition.z
    };
    scene.appendChild(childNode.visualRepresentation);
    // update links between visual and data representations

    console.log('grabbed filled port');   
  }
});