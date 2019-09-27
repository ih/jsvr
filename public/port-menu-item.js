import NodePortMenuItem from './node-port-menu-item.js';

export default class PortMenuItem {
  static create(optionData, menu) {
    // TODO refactor these tests, maybe create a new class for option data
    if (PortMenuItem.isNodeData(optionData)) {
      return new NodePortMenuItem(optionData, menu);
    } else if (optionData.kind === 'literal') {
      return new LiteralPortMenuItem(optionData, menu);
    } else {
      console.error('Trying to create an unsupported port menu type');
    }
  }

  static isNodeData(optionData) {
    return optionData.type; 
  }
}