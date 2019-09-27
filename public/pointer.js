/* 
 * A pointer which objects can react to.
*/
export default class Pointer {
  constructor() {
    this.active = false;
    this.parent = document.querySelector('#rightHand');
    this.toggle = this.toggle.bind(this);
  }

  render() {
    const raycasterElement = this.parent;// document.createElement('a-entity');
    raycasterElement.setAttribute('raycaster', 'showLine: false; enabled: false; objects: .pointable');
    // this.parent.appendChild(raycasterElement);
    this.parent.addEventListener('abuttondown', this.toggle)
    this.raycasterElement = raycasterElement;
  }

  toggle() {
    this.active = !this.active;
    this.raycasterElement.setAttribute('raycaster', 'showLine', this.active);
    this.raycasterElement.setAttribute('raycaster', 'enabled', this.active);
  }

}