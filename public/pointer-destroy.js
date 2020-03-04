export default class PointerDestroy {
  constructor(element, type) {
    this.element = element;
    this.type = type;

    this.leftHand = document.getElementById('leftHand');
    this.rightHand = document.getElementById('rightHand');

    this.element.classList.add('pointable-destroy');

    // TODO create custom events for the different pointers
    // and listen to those
    this.element.addEventListener('click', event => {
      const pointer = event.detail.cursorEl.dataRepresentation;
      // only react if the pointer was in destruction mode
      if (pointer.getMode() !== 'destruction') {
        return;
      }

      console.log('selected a node');

      if (
        event.detail.intersection.object !==
        this.element.getObject3D('mesh')
      ) {
        return;
      }
      this.element.dataRepresentation.destroy();
    });

    // this.element.addEventListener("gripdown", event => {
    //   this.grabbingHand = event.detail.grabbingHand;
    //   this.gripping = true;
    //   this.deltaPosition = null;
    // });

    // this.element.addEventListener("gripup", () => {
    //   this.grabbingHand = null;
    //   this.gripping = false;
    //   this.deltaPosition = null;
    // });

    // TODO this can be optimized by only creating a setInterval
    // on gripdown instead of constantly polling
    // on gripup it can be destroyed/cleared
    const intervalId = setInterval(() => {
      // if (this.element === null) {
      //   clearInterval(intervalId);
      // }
      // if (!this.gripping) {
      //   return;
      // }
      // const rootElement =
      //   this.type === "" ? this.element : DOM.farthest(this.element, this.type);
      // if (this.deltaPosition === null) {
      //   this.deltaPosition = new THREE.Vector3().subVectors(
      //     rootElement.object3D.position,
      //     this.grabbingHand.object3D.position
      //   );
      // }
      // rootElement.object3D.position.addVectors(
      //   this.grabbingHand.object3D.position,
      //   this.deltaPosition
      // );
    }, 10);
  }
}
