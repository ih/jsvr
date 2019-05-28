export default class Menu {
  constructor(initialParent, initialPosition = '0 0 0', initialRotation = '-90 0 0') {
    this.isOpen = false;
    this.parent = initialParent;
    this.position = initialPosition;
    this.rotation= initialRotation;
    this.render();
  }
  
  render() {
    const menuElement = document.createElement('a-plane');
    menuElement.setAttribute('rotation', this.rotation);
    menuElement.setAttribute('position', this.position);
    
    this.parent.appendChild(menuElement);
  }
  
  open(state) {
    this.isOpen = false;
    
  }
  
  close() {
    this.isOpen = true;
    
  }
}