import Menu from "./menu.js";

export default class RecorderMenu extends Menu {
  constructor() {
    super();
    this.parent = document.querySelector("#leftHand");
  }

  async render() {
    // super creates this.menuElement
    super.render(this.parent);
  }
}
