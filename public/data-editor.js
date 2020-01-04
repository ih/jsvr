import AugmentedNode from "./augmented-node.js";
import ArrayNodePort from "./array-node-port.js";
import Grammar from "./grammar.js";
import { getKeyboard } from "./toolbox.js";

export default class DataEditor {
  constructor(augmentedNode) {
    this.node = augmentedNode;
  }

  render() {
    const nonChildKeys = Grammar.getPrimitiveKeys(this.node.type);
    nonChildKeys.forEach((key, index) => {
      this.renderKey(key, index);

      const value = this.node[key];

      if (Grammar.isEditable(this.node, key)) {
        this.renderEditableValue(key, value, index);
      } else {
        this.renderStaticValue(value, index);
      }
    });
  }

  renderKey(key, index) {
    const yMargin = 0.1;
    const textElement = document.createElement("a-text");
    textElement.setAttribute("value", key + " :");
    textElement.setAttribute("color", "green");
    textElement.setAttribute("width", AugmentedNode.WIDTH * 2);
    textElement.setAttribute("position", {
      x: (-1 * AugmentedNode.WIDTH) / 2,
      y: index * yMargin
    });
    this.node.visualRepresentation.appendChild(textElement);
  }

  renderStaticValue(value, index) {
    const yMargin = 0.1;
    const textElement = document.createElement("a-text");
    textElement.setAttribute("value", value);
    textElement.setAttribute("color", "green");
    textElement.setAttribute("width", AugmentedNode.WIDTH * 2);
    textElement.setAttribute("position", { y: index * yMargin });
    this.node.visualRepresentation.appendChild(textElement);
  }

  // TODO pull this out into it's own class e.g. EditableTextField
  // assumes virtual keyboard has been created
  renderEditableValue(key, value, index) {
    const yMargin = 0.1;
    const textElement = document.createElement("a-text");
    textElement.setAttribute("value", value);
    textElement.setAttribute("color", "orange");
    textElement.setAttribute("width", AugmentedNode.WIDTH * 2);
    textElement.setAttribute("position", { y: index * yMargin });

    // Use a shape to trigger the keyboard since the text
    // cannot be used with the collision detector
    const editButton = document.createElement("a-ring");
    editButton.setAttribute("color", "yellow");
    editButton.setAttribute("radius-outer", ArrayNodePort.PORT_SIZE * 0.5);
    editButton.setAttribute("radius-inner", ArrayNodePort.PORT_SIZE * 0.25);
    editButton.setAttribute("position", {
      x: -1 * ArrayNodePort.PORT_SIZE * 0.5
    });
    editButton.classList.add("triggerable");
    editButton.addEventListener("triggerdown", () => {
      console.log("editing value");
      const keyboard = getKeyboard();
      keyboard.attach(textElement, () => {
        console.log("setting a new value");
        let newValue = keyboard.getValue();
        try {
          newValue = JSON.parse(newValue);
        } catch (error) {}

        textElement.setAttribute("value", newValue);
        keyboard.hide();
        this.node[key] = newValue;
      });
    });

    textElement.appendChild(editButton);
    this.node.visualRepresentation.appendChild(textElement);
  }
}
