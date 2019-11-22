import { sleep } from './async-lib.js';
import Grammar from './grammar.js';
import AugmentedNode from './augmented-node.js';
import * as DOM from './dom-lib.js';

export default class NodePortMenuItem {
  constructor(nodeData, menu) {
    this.augmentedNode = new AugmentedNode(nodeData);
    this.menu = menu;
    this.port = menu.port;
  }
  
  makeIcon(nodeElement) {
    const SCALE_FACTOR = .1;
    // create a copy of the nodeElement mesh 
    const icon = nodeElement.object3D.clone();
    // shrink the copy 
    const iconElement = document.createElement('a-entity');
    // await sleep(3000);
    iconElement.object3D = icon;
    // set the mesh explicitly so that the collision detection works
    // we can't just set the mesh as the icon since it's only the box
    iconElement.setObject3D('mesh', nodeElement.getObject3D('mesh').clone());
    iconElement.setAttribute('scale', `${SCALE_FACTOR} ${SCALE_FACTOR} ${SCALE_FACTOR}`);   
    iconElement.classList.add('triggerable');
    iconElement.appendChild(nodeElement);
    if (this.augmentedNode.type === 'CallExpression') {
      console.log('adding event listener for CallExpression');
    }
    iconElement.addEventListener('triggerdown', (event) => {
      this.addNodeToAST();
    });
    return iconElement;
  }
  
  async render(parent) {
    // render the node, but make it invisible
    this.nodeElement = await this.augmentedNode.render();
    this.nodeElement.setAttribute('visible', false);
    // and copy the 3D representation to make an iconarent
    this.iconElement = this.makeIcon(this.nodeElement);   


    const promise = new Promise((resolve, reject) => {
      // resolve(this.iconElement);

      // this.iconElement.addEventListener('object3dset', (event) => {
      //   if (event.detail.type !== 'mesh' || event.target !== this.iconElement) { 
      //     return; 
      //   } else {
      //     resolve(this.iconElement);

      //   }
      // });

      // let observer = new MutationObserver((mutations) => {
      //   mutations.forEach((mutation) => {
      //     if (Array.from(mutation.addedNodes).includes(this.iconElement)) {
      //       resolve(this.iconElement);
      //       observer.disconnect();
      //     }
      //   });
      // });
      // observer.observe(parent, {childList: true});
      // TODO remove timeout...maybe by getting rid of AFRAME for managing objects
      setTimeout(() => {
        resolve(this.iconElement);
      }, 1);
    });
    // DOM.setParent(this.iconElement, parent);
    parent.appendChild(this.iconElement);
    return promise;
  }
  
  addNodeToAST() {
    this.nodeElement.setAttribute('visible', true);
    const childNode = this.augmentedNode;
    const parentNode = this.port.node;
    parentNode.setChild(childNode, this.port.childKey, this.port.index);

    // close the menu after the node has been created
    this.menu.close();    
    console.log('icon clicked');
  }
}