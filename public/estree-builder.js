export default class ESTreeBuilder {
  constructor() {
    this.active = false;
    this.parent = document.querySelector('#rightHand');
    this.render();
  }
  
  render() {
    const raycaster = document.createElement('a-entity');
    raycaster.setAttribute('raycaster', 'showLine: true; objects: .array-port');
    raycaster.setAttribute('visible', false);
    
    this.parent.appendChild(raycaster);
   
    this.toggle = this.toggle.bind(this);
    this.parent.addEventListener('systemdown', this.toggle)
    this.raycaster = raycaster;
  }
  
  toggle() {
    this.active = !this.active;
    this.raycaster.setAttribute('visible', this.active);
  }
}