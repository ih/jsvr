import Menu from './menu.js';
import PortMenuItem from './port-menu-item.js';
import Grammar from './grammar.js';
import AugmentedNode from './augmented-node.js';

export default class NodeMenu extends Menu {
  constructor(port) {
    super();
    this.port = port;
    this.node = port.node;
    this.active = false;
    this.parent = document.querySelector('#rightHand');
    
    // this.close = this.close.bind(this);
    // this.open = this.open.bind(this);
  }
  
  async render() {
    // super creates this.menuElement
    super.render(this.port.visualRepresentation);
    // create the actual nodes that can be chosen as children
    // these will be used to make icon representations
    const types = Grammar.getPropertyTypes(this.node.type, this.port.childKey);
    for (const type of types) {
      const menuOptions = this.getMenuOptions(type);
      for (const option of menuOptions) {
        const portMenuItem = PortMenuItem.create(option, this);
        const renderedPortMenuItem = await portMenuItem.render(this.menuElement);
        this.positionItem(renderedPortMenuItem);
      }
    }
  }

  getMenuOptions(type) {
    if (type.kind === 'reference') {
      return Grammar.getNodesWithBase(type.name);
    } else {
      console.error('type not supported when getting menu options');
      return [];
    }
  }

  
}