export default class Menu {
  constructor(
    initialPosition = "0 0 0",
    initialRotation = "-90 0 0",
    width = 1,
    height = 1
  ) {
    this.position = initialPosition;
    this.rotation = initialRotation;
    this.width = 1;
    this.height = 1;
    this.initializePositions();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  render(parent) {
    const menuElement = document.createElement("a-plane");
    this.menuElement = menuElement;
    menuElement.setAttribute("rotation", this.rotation);
    menuElement.setAttribute("position", this.position);
    menuElement.setAttribute("width", this.width);
    menuElement.setAttribute("height", this.height);

    menuElement.menu = this;

    const closeButton = this.createCloseButton(menuElement);
    menuElement.appendChild(closeButton);

    parent.appendChild(menuElement);
    return new Promise((resolve, reject) => {
      resolve(menuElement);
    });
  }

  createCloseButton(menuElement) {
    // create the DOM element
    const closeButton = document.createElement("a-circle");
    closeButton.setAttribute("radius", ".1");
    closeButton.setAttribute("button-collider", true);
    closeButton.setAttribute(
      "position",
      `${this.width / 2} ${this.height / 2} .1`
    );
    closeButton.setAttribute("color", "red");

    // add event handler that deletes the menu
    // when the close element is "clicked"
    closeButton.addEventListener("click", () => {
      this.close();
    });

    return closeButton;
  }

  positionItem(item) {
    const marginX = 0.3;
    const marginY = 0.2;
    item.setAttribute("position", this.nextItemPosition);
    // increment last item position
    if (this.nextItemPosition.x + marginX < this.width / 2.0) {
      this.nextItemPosition.x += marginX;
    } else {
      this.nextItemPosition.x = this.initialX;
      this.nextItemPosition.y -= marginY;
    }
  }

  open() {
    this.render();
  }

  close() {
    this.menuElement.parentNode.removeChild(this.menuElement);
    this.menuElement = null;
    this.initializePositions();
  }

  isOpen() {
    return this.menuElement;
  }

  initializePositions() {
    this.initialX = (-1 * this.width) / 2.0;
    this.initialY = this.height / 2.0;
    this.nextItemPosition = {
      x: this.initialX,
      y: this.initialY,
      z: 0.1
    };
  }
}
