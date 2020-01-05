console.log("setting grammar");

export default class Grammar {
  // keys where the values are nodes i.e. the children
  static getChildKeys(type) {
    const nodeProperties = this.grammar[type].props;
    return Object.keys(nodeProperties).filter(key => {
      const property = nodeProperties[key];
      if (
        this.isPrimitive(property) ||
        (property.kind === "union" && property.types.every(this.isPrimitive)) ||
        key === "loc"
      ) {
        return false;
      }
      return true;
    });
  }

  // keys where the values are terminal i.e. not nodes
  static getPrimitiveKeys(type) {
    const nodeProperties = this.grammar[type].props;
    return Object.keys(nodeProperties).filter(key => {
      const property = nodeProperties[key];
      if (
        this.isPrimitive(property) ||
        (property.kind === "union" &&
          property.types.every(this.isPrimitive) &&
          key !== "loc")
      ) {
        return true;
      }
      return false;
    });
  }

  static isPrimitive(property) {
    if (property.kind === "reference") {
      return (
        property.name === "boolean" ||
        property.name === "number" ||
        property.name === "string" ||
        property.name === "RegExp" ||
        property.name.includes("Operator")
      );
    }
    return (
      property.kind === "literal" ||
      property.kind === "enum" ||
      property.kind === "object"
    );
  }

  static get grammar() {
    if (this.expanded) {
      return this.expanded;
    }
    this.expanded = this.expandGrammar();

    return this.expanded;
  }

  static expandGrammar() {
    const grammar = this.coreGrammar;
    Object.values(grammar).forEach(node => {
      if (!("base" in node)) {
        return;
      }
      node.base.forEach(base => {
        Object.assign(node.props, grammar[base].props);
      });
    });
    return grammar;
  }

  static getPropertyTypes(nodeType, propertyName) {
    const nodeData = Grammar.grammar[nodeType];
    let property = nodeData.props[propertyName];
    if (property.kind === "array") {
      property = property.base;
    }

    let types = [];
    if (property.kind === "union") {
      types = types.concat(property.types);
    } else if (property.kind === "reference" || property.kind === "literal") {
      types.push(property);
    } else {
      console.error("unhandled property type");
    }
    return types;
  }

  static getNodesWithAncestry(base) {
    // find the base node in the hierarchy
    let searchQueue = [this.hierarchy];
    let baseInHierarchy;
    while(searchQueue.length > 0) {
      const current = searchQueue.shift();
      if (current.name === base) {
        baseInHierarchy = current;
        break;
      }
      searchQueue = searchQueue.concat(current.children);
    }
    if (!baseInHierarchy) {
      throw 'Called getNodesWithAncestry with invalid base';
    }
    // then enumerate and return all the nodes in the tree
    // rooted at that node
    const nodesWithAncestry = [];
    let traversalQueue = [baseInHierarchy];// baseInHierarchy.children;
    while (traversalQueue.length > 0) {
      const current = traversalQueue.shift();
      const newNode = this.createNodeObject(current.name);
      nodesWithAncestry.push(newNode);
      traversalQueue = traversalQueue.concat(current.children);
    }
    return nodesWithAncestry;
  }

  static getNodesWithBase(base) {
    const nodeNames = Object.keys(this.grammar).filter(nodeName => {
      const nodeData = grammar[nodeName];
      return nodeData.base ? nodeData.base.includes(base) : false;
    });

    return nodeNames.map(nodeName => {
      return this.createNodeObject(nodeName);
    });
  }

  static createNodeObject(type) {
    const nodeMetaData = this.grammar[type];
    const newNode = {};
    Object.keys(nodeMetaData.props).forEach(property => {
      newNode[property] =
        nodeMetaData.props[property].kind === "array" ? [] : undefined;
    });
    newNode.type = type;
    return newNode;
  }

  static isEditable(node, key) {
    const nonEditableKeys = ["type", "computed", "sourceType"];
    return !nonEditableKeys.includes(key);
  }

  static get hierarchy() {
    if (this.computedHierarchy) {
      return this.computedHierarchy;
    }
    this.computedHierarchy = this.buildHierarchy();

    return this.computedHierarchy;
  }

  static buildHierarchy() {
    // start at Node and add any entries that have it as a base as 
    // children. Repeat for each child
    const hierarchy = {name: 'Node', children: []};
    const queue = [hierarchy];
    while (queue.length > 0) {
      let current = queue.shift();
      Object.entries(this.grammar).forEach(([nodeName, node]) => {
        if (node.base && node.base.includes(current.name)) {
          const newEntry = {name: nodeName, children: []};
          current.children.push(newEntry);
          queue.push(newEntry);
        }
      });
    }
    return hierarchy;
  }

  static get coreGrammar() {
    return {
      Node: {
        kind: "interface",
        props: {
          type: {
            kind: "reference",
            name: "string"
          },
          loc: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "SourceLocation"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          }
        },
        base: []
      },
      SourceLocation: {
        kind: "interface",
        props: {
          source: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "string"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          },
          start: {
            kind: "reference",
            name: "Position"
          },
          end: {
            kind: "reference",
            name: "Position"
          }
        },
        base: []
      },
      Position: {
        kind: "interface",
        props: {
          line: {
            kind: "reference",
            name: "number"
          },
          column: {
            kind: "reference",
            name: "number"
          }
        },
        base: []
      },
      Program: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "Program"
          },
          body: {
            kind: "array",
            base: {
              kind: "reference",
              name: "Statement"
            }
          },
          sourceType: {
            kind: "union",
            types: [
              {
                kind: "literal",
                value: "script"
              },
              {
                kind: "literal",
                value: "module"
              }
            ]
          }
        },
        base: ["Node"]
      },
      Function: {
        kind: "interface",
        props: {
          id: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Identifier"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          },
          params: {
            kind: "array",
            base: {
              kind: "reference",
              name: "Pattern"
            }
          },
          body: {
            kind: "reference",
            name: "BlockStatement"
          },
          generator: {
            kind: "reference",
            name: "boolean"
          }
        },
        base: ["Node"]
      },
      Statement: {
        kind: "interface",
        props: {},
        base: ["Node"]
      },
      EmptyStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "EmptyStatement"
          }
        },
        base: ["Statement"]
      },
      BlockStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "BlockStatement"
          },
          body: {
            kind: "array",
            base: {
              kind: "reference",
              name: "Statement"
            }
          }
        },
        base: ["Statement"]
      },
      ExpressionStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ExpressionStatement"
          },
          expression: {
            kind: "reference",
            name: "Expression"
          }
        },
        base: ["Statement"]
      },
      IfStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "IfStatement"
          },
          test: {
            kind: "reference",
            name: "Expression"
          },
          consequent: {
            kind: "reference",
            name: "Statement"
          },
          alternate: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Statement"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          }
        },
        base: ["Statement"]
      },
      LabeledStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "LabeledStatement"
          },
          label: {
            kind: "reference",
            name: "Identifier"
          },
          body: {
            kind: "reference",
            name: "Statement"
          }
        },
        base: ["Statement"]
      },
      BreakStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "BreakStatement"
          },
          label: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Identifier"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          }
        },
        base: ["Statement"]
      },
      ContinueStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ContinueStatement"
          },
          label: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Identifier"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          }
        },
        base: ["Statement"]
      },
      WithStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "WithStatement"
          },
          object: {
            kind: "reference",
            name: "Expression"
          },
          body: {
            kind: "reference",
            name: "Statement"
          }
        },
        base: ["Statement"]
      },
      SwitchStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "SwitchStatement"
          },
          discriminant: {
            kind: "reference",
            name: "Expression"
          },
          cases: {
            kind: "array",
            base: {
              kind: "reference",
              name: "SwitchCase"
            }
          },
          lexical: {
            kind: "literal",
            value: false
          }
        },
        base: ["Statement"]
      },
      ReturnStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ReturnStatement"
          },
          argument: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Expression"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          }
        },
        base: ["Statement"]
      },
      ThrowStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ThrowStatement"
          },
          argument: {
            kind: "reference",
            name: "Expression"
          }
        },
        base: ["Statement"]
      },
      TryStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "TryStatement"
          },
          block: {
            kind: "reference",
            name: "BlockStatement"
          },
          handler: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "CatchClause"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          },
          finalizer: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "BlockStatement"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          }
        },
        base: ["Statement"]
      },
      WhileStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "WhileStatement"
          },
          test: {
            kind: "reference",
            name: "Expression"
          },
          body: {
            kind: "reference",
            name: "Statement"
          }
        },
        base: ["Statement"]
      },
      DoWhileStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "DoWhileStatement"
          },
          body: {
            kind: "reference",
            name: "Statement"
          },
          test: {
            kind: "reference",
            name: "Expression"
          }
        },
        base: ["Statement"]
      },
      ForStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ForStatement"
          },
          init: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "VariableDeclaration"
              },
              {
                kind: "reference",
                name: "Expression"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          },
          test: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Expression"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          },
          update: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Expression"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          },
          body: {
            kind: "reference",
            name: "Statement"
          }
        },
        base: ["Statement"]
      },
      ForInStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ForInStatement"
          },
          left: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "VariableDeclaration"
              },
              {
                kind: "reference",
                name: "Expression"
              }
            ]
          },
          right: {
            kind: "reference",
            name: "Expression"
          },
          body: {
            kind: "reference",
            name: "Statement"
          }
        },
        base: ["Statement"]
      },
      DebuggerStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "DebuggerStatement"
          }
        },
        base: ["Statement"]
      },
      Declaration: {
        kind: "interface",
        props: {},
        base: ["Statement"]
      },
      FunctionDeclaration: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "FunctionDeclaration"
          },
          id: {
            kind: "reference",
            name: "Identifier"
          }
        },
        base: ["Function", "Declaration"]
      },
      VariableDeclaration: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "VariableDeclaration"
          },
          declarations: {
            kind: "array",
            base: {
              kind: "reference",
              name: "VariableDeclarator"
            }
          },
          kind: {
            kind: "union",
            types: [
              {
                kind: "literal",
                value: "var"
              },
              {
                kind: "literal",
                value: "let"
              },
              {
                kind: "literal",
                value: "const"
              }
            ]
          }
        },
        base: ["Declaration"]
      },
      VariableDeclarator: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "VariableDeclarator"
          },
          id: {
            kind: "reference",
            name: "Pattern"
          },
          init: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Expression"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          }
        },
        base: ["Node"]
      },
      Expression: {
        kind: "interface",
        props: {},
        base: ["Node"]
      },
      ThisExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ThisExpression"
          }
        },
        base: ["Expression"]
      },
      ArrayExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ArrayExpression"
          },
          elements: {
            kind: "array",
            base: {
              kind: "union",
              types: [
                {
                  kind: "reference",
                  name: "Expression"
                },
                {
                  kind: "reference",
                  name: "SpreadElement"
                },
                {
                  kind: "literal",
                  value: null
                }
              ]
            }
          }
        },
        base: ["Expression"]
      },
      ObjectExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ObjectExpression"
          },
          properties: {
            kind: "array",
            base: {
              kind: "reference",
              name: "Property"
            }
          }
        },
        base: ["Expression"]
      },
      Property: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "Property"
          },
          key: {
            kind: "reference",
            name: "Expression"
          },
          value: {
            kind: "reference",
            name: "Expression"
          },
          kind: {
            kind: "union",
            types: [
              {
                kind: "literal",
                value: "init"
              },
              {
                kind: "literal",
                value: "get"
              },
              {
                kind: "literal",
                value: "set"
              }
            ]
          },
          method: {
            kind: "reference",
            name: "boolean"
          },
          shorthand: {
            kind: "reference",
            name: "boolean"
          },
          computed: {
            kind: "reference",
            name: "boolean"
          }
        },
        base: ["Node"]
      },
      FunctionExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "FunctionExpression"
          }
        },
        base: ["Function", "Expression"]
      },
      SequenceExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "SequenceExpression"
          },
          expressions: {
            kind: "array",
            base: {
              kind: "reference",
              name: "Expression"
            }
          }
        },
        base: ["Expression"]
      },
      UnaryExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "UnaryExpression"
          },
          operator: {
            kind: "reference",
            name: "UnaryOperator"
          },
          prefix: {
            kind: "reference",
            name: "boolean"
          },
          argument: {
            kind: "reference",
            name: "Expression"
          }
        },
        base: ["Expression"]
      },
      BinaryExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "BinaryExpression"
          },
          operator: {
            kind: "reference",
            name: "BinaryOperator"
          },
          left: {
            kind: "reference",
            name: "Expression"
          },
          right: {
            kind: "reference",
            name: "Expression"
          }
        },
        base: ["Expression"]
      },
      AssignmentExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "AssignmentExpression"
          },
          operator: {
            kind: "reference",
            name: "AssignmentOperator"
          },
          left: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Pattern"
              },
              {
                kind: "reference",
                name: "MemberExpression"
              }
            ]
          },
          right: {
            kind: "reference",
            name: "Expression"
          }
        },
        base: ["Expression"]
      },
      UpdateExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "UpdateExpression"
          },
          operator: {
            kind: "reference",
            name: "UpdateOperator"
          },
          argument: {
            kind: "reference",
            name: "Expression"
          },
          prefix: {
            kind: "reference",
            name: "boolean"
          }
        },
        base: ["Expression"]
      },
      LogicalExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "LogicalExpression"
          },
          operator: {
            kind: "reference",
            name: "LogicalOperator"
          },
          left: {
            kind: "reference",
            name: "Expression"
          },
          right: {
            kind: "reference",
            name: "Expression"
          }
        },
        base: ["Expression"]
      },
      ConditionalExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ConditionalExpression"
          },
          test: {
            kind: "reference",
            name: "Expression"
          },
          alternate: {
            kind: "reference",
            name: "Expression"
          },
          consequent: {
            kind: "reference",
            name: "Expression"
          }
        },
        base: ["Expression"]
      },
      CallExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "CallExpression"
          },
          callee: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Expression"
              },
              {
                kind: "reference",
                name: "Super"
              }
            ]
          },
          arguments: {
            kind: "array",
            base: {
              kind: "union",
              types: [
                {
                  kind: "reference",
                  name: "Expression"
                },
                {
                  kind: "reference",
                  name: "SpreadElement"
                }
              ]
            }
          }
        },
        base: ["Expression"]
      },
      NewExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "NewExpression"
          }
        },
        base: ["CallExpression"]
      },
      MemberExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "MemberExpression"
          },
          object: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Expression"
              },
              {
                kind: "reference",
                name: "Super"
              }
            ]
          },
          property: {
            kind: "reference",
            name: "Expression"
          },
          computed: {
            kind: "reference",
            name: "boolean"
          }
        },
        base: ["Expression", "Pattern"]
      },
      Pattern: {
        kind: "interface",
        props: {},
        base: ["Node"]
      },
      SwitchCase: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "SwitchCase"
          },
          test: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Expression"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          },
          consequent: {
            kind: "array",
            base: {
              kind: "reference",
              name: "Statement"
            }
          }
        },
        base: ["Node"]
      },
      CatchClause: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "CatchClause"
          },
          param: {
            kind: "reference",
            name: "Pattern"
          },
          guard: {
            kind: "literal",
            value: null
          },
          body: {
            kind: "reference",
            name: "BlockStatement"
          }
        },
        base: ["Node"]
      },
      Identifier: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "Identifier"
          },
          name: {
            kind: "reference",
            name: "string"
          }
        },
        base: ["Node", "Expression", "Pattern"]
      },
      Literal: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "Literal"
          },
          value: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "string"
              },
              {
                kind: "reference",
                name: "boolean"
              },
              {
                kind: "literal",
                value: null
              },
              {
                kind: "reference",
                name: "number"
              },
              {
                kind: "reference",
                name: "RegExp"
              }
            ]
          }
        },
        base: ["Node", "Expression"]
      },
      RegexLiteral: {
        kind: "interface",
        props: {
          regex: {
            kind: "object",
            items: {
              pattern: {
                kind: "reference",
                name: "string"
              },
              flags: {
                kind: "reference",
                name: "string"
              }
            }
          }
        },
        base: ["Literal"]
      },
      UnaryOperator: {
        kind: "enum",
        values: ["-", "+", "!", "~", "typeof", "void", "delete"]
      },
      BinaryOperator: {
        kind: "enum",
        values: [
          "==",
          "!=",
          "===",
          "!==",
          "<",
          "<=",
          ">",
          ">=",
          "<<",
          ">>",
          ">>>",
          "+",
          "-",
          "*",
          "/",
          "%",
          "|",
          "^",
          "&",
          "in",
          "instanceof"
        ]
      },
      LogicalOperator: {
        kind: "enum",
        values: ["||", "&&"]
      },
      AssignmentOperator: {
        kind: "enum",
        values: [
          "=",
          "+=",
          "-=",
          "*=",
          "/=",
          "%=",
          "<<=",
          ">>=",
          ">>>=",
          "|=",
          "^=",
          "&="
        ]
      },
      UpdateOperator: {
        kind: "enum",
        values: ["++", "--"]
      },
      ForOfStatement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ForOfStatement"
          }
        },
        base: ["ForInStatement"]
      },
      Super: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "Super"
          }
        },
        base: ["Node"]
      },
      SpreadElement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "SpreadElement"
          },
          argument: {
            kind: "reference",
            name: "Expression"
          }
        },
        base: ["Node"]
      },
      ArrowFunctionExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ArrowFunctionExpression"
          },
          body: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "BlockStatement"
              },
              {
                kind: "reference",
                name: "Expression"
              }
            ]
          },
          expression: {
            kind: "reference",
            name: "boolean"
          }
        },
        base: ["Function", "Expression"]
      },
      YieldExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "YieldExpression"
          },
          argument: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Expression"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          }
        },
        base: ["Expression"]
      },
      TemplateLiteral: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "TemplateLiteral"
          },
          quasis: {
            kind: "array",
            base: {
              kind: "reference",
              name: "TemplateElement"
            }
          },
          expressions: {
            kind: "array",
            base: {
              kind: "reference",
              name: "Expression"
            }
          }
        },
        base: ["Expression"]
      },
      TaggedTemplateExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "TaggedTemplateExpression"
          },
          tag: {
            kind: "reference",
            name: "Expression"
          },
          quasi: {
            kind: "reference",
            name: "TemplateLiteral"
          }
        },
        base: ["Expression"]
      },
      TemplateElement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "TemplateElement"
          },
          tail: {
            kind: "reference",
            name: "boolean"
          },
          value: {
            kind: "object",
            items: {
              cooked: {
                kind: "reference",
                name: "string"
              },
              value: {
                kind: "reference",
                name: "string"
              }
            }
          }
        },
        base: ["Node"]
      },
      AssignmentProperty: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "Property"
          },
          value: {
            kind: "reference",
            name: "Pattern"
          },
          kind: {
            kind: "literal",
            value: "init"
          },
          method: {
            kind: "literal",
            value: false
          }
        },
        base: ["Property"]
      },
      ObjectPattern: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ObjectPattern"
          },
          properties: {
            kind: "array",
            base: {
              kind: "reference",
              name: "AssignmentProperty"
            }
          }
        },
        base: ["Pattern"]
      },
      ArrayPattern: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ArrayPattern"
          },
          elements: {
            kind: "array",
            base: {
              kind: "union",
              types: [
                {
                  kind: "reference",
                  name: "Pattern"
                },
                {
                  kind: "literal",
                  value: null
                }
              ]
            }
          }
        },
        base: ["Pattern"]
      },
      RestElement: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "RestElement"
          },
          argument: {
            kind: "reference",
            name: "Pattern"
          }
        },
        base: ["Pattern"]
      },
      AssignmentPattern: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "AssignmentPattern"
          },
          left: {
            kind: "reference",
            name: "Pattern"
          },
          right: {
            kind: "reference",
            name: "Expression"
          }
        },
        base: ["Pattern"]
      },
      Class: {
        kind: "interface",
        props: {
          id: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Identifier"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          },
          superClass: {
            kind: "reference",
            name: "Expression"
          },
          body: {
            kind: "reference",
            name: "ClassBody"
          }
        },
        base: ["Node"]
      },
      ClassBody: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ClassBody"
          },
          body: {
            kind: "array",
            base: {
              kind: "reference",
              name: "MethodDefinition"
            }
          }
        },
        base: ["Node"]
      },
      MethodDefinition: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "MethodDefinition"
          },
          key: {
            kind: "reference",
            name: "Identifier"
          },
          value: {
            kind: "reference",
            name: "FunctionExpression"
          },
          kind: {
            kind: "union",
            types: [
              {
                kind: "literal",
                value: "constructor"
              },
              {
                kind: "literal",
                value: "method"
              },
              {
                kind: "literal",
                value: "get"
              },
              {
                kind: "literal",
                value: "set"
              }
            ]
          },
          computed: {
            kind: "reference",
            name: "boolean"
          },
          static: {
            kind: "reference",
            name: "boolean"
          }
        },
        base: ["Node"]
      },
      ClassDeclaration: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ClassDeclaration"
          },
          id: {
            kind: "reference",
            name: "Identifier"
          }
        },
        base: ["Class", "Declaration"]
      },
      ClassExpression: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ClassExpression"
          }
        },
        base: ["Class", "Expression"]
      },
      MetaProperty: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "MetaProperty"
          },
          meta: {
            kind: "reference",
            name: "Identifier"
          },
          property: {
            kind: "reference",
            name: "Identifier"
          }
        },
        base: ["Expression"]
      },
      ImportDeclaration: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ImportDeclaration"
          },
          specifiers: {
            kind: "array",
            base: {
              kind: "union",
              types: [
                {
                  kind: "reference",
                  name: "ImportSpecifier"
                },
                {
                  kind: "reference",
                  name: "ImportDefaultSpecifier"
                },
                {
                  kind: "reference",
                  name: "ImportNamespaceSpecifier"
                }
              ]
            }
          },
          source: {
            kind: "reference",
            name: "Literal"
          }
        },
        base: ["Node"]
      },
      ImportSpecifier: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ImportSpecifier"
          },
          imported: {
            kind: "reference",
            name: "Identifier"
          },
          local: {
            kind: "reference",
            name: "Identifier"
          }
        },
        base: []
      },
      ImportDefaultSpecifier: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ImportDefaultSpecifier"
          },
          local: {
            kind: "reference",
            name: "Identifier"
          }
        },
        base: []
      },
      ImportNamespaceSpecifier: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ImportNamespaceSpecifier"
          },
          local: {
            kind: "reference",
            name: "Identifier"
          }
        },
        base: []
      },
      ExportNamedDeclaration: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ExportNamedDeclaration"
          },
          declaration: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Declaration"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          },
          specifiers: {
            kind: "array",
            base: {
              kind: "reference",
              name: "ExportSpecifier"
            }
          },
          source: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Literal"
              },
              {
                kind: "literal",
                value: null
              }
            ]
          }
        },
        base: ["Node"]
      },
      ExportSpecifier: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ExportSpecifier"
          },
          exported: {
            kind: "reference",
            name: "Identifier"
          },
          local: {
            kind: "reference",
            name: "Identifier"
          }
        },
        base: []
      },
      ExportDefaultDeclaration: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ExportDefaultDeclaration"
          },
          declaration: {
            kind: "union",
            types: [
              {
                kind: "reference",
                name: "Declaration"
              },
              {
                kind: "reference",
                name: "Expression"
              }
            ]
          }
        },
        base: ["Node"]
      },
      ExportAllDeclaration: {
        kind: "interface",
        props: {
          type: {
            kind: "literal",
            value: "ExportAllDeclaration"
          },
          source: {
            kind: "reference",
            name: "Literal"
          }
        },
        base: ["Node"]
      }
    };
  }
}
var grammar = {
  Node: {
    kind: "interface",
    props: {
      type: {
        kind: "reference",
        name: "string"
      },
      loc: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "SourceLocation"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      }
    },
    base: []
  },
  SourceLocation: {
    kind: "interface",
    props: {
      source: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "string"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      },
      start: {
        kind: "reference",
        name: "Position"
      },
      end: {
        kind: "reference",
        name: "Position"
      }
    },
    base: []
  },
  Position: {
    kind: "interface",
    props: {
      line: {
        kind: "reference",
        name: "number"
      },
      column: {
        kind: "reference",
        name: "number"
      }
    },
    base: []
  },
  Program: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "Program"
      },
      body: {
        kind: "array",
        base: {
          kind: "reference",
          name: "Statement"
        }
      },
      sourceType: {
        kind: "union",
        types: [
          {
            kind: "literal",
            value: "script"
          },
          {
            kind: "literal",
            value: "module"
          }
        ]
      }
    },
    base: ["Node"]
  },
  Function: {
    kind: "interface",
    props: {
      id: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Identifier"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      },
      params: {
        kind: "array",
        base: {
          kind: "reference",
          name: "Pattern"
        }
      },
      body: {
        kind: "reference",
        name: "BlockStatement"
      },
      generator: {
        kind: "reference",
        name: "boolean"
      }
    },
    base: ["Node"]
  },
  Statement: {
    kind: "interface",
    props: {},
    base: ["Node"]
  },
  EmptyStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "EmptyStatement"
      }
    },
    base: ["Statement"]
  },
  BlockStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "BlockStatement"
      },
      body: {
        kind: "array",
        base: {
          kind: "reference",
          name: "Statement"
        }
      }
    },
    base: ["Statement"]
  },
  ExpressionStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ExpressionStatement"
      },
      expression: {
        kind: "reference",
        name: "Expression"
      }
    },
    base: ["Statement"]
  },
  IfStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "IfStatement"
      },
      test: {
        kind: "reference",
        name: "Expression"
      },
      consequent: {
        kind: "reference",
        name: "Statement"
      },
      alternate: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Statement"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      }
    },
    base: ["Statement"]
  },
  LabeledStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "LabeledStatement"
      },
      label: {
        kind: "reference",
        name: "Identifier"
      },
      body: {
        kind: "reference",
        name: "Statement"
      }
    },
    base: ["Statement"]
  },
  BreakStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "BreakStatement"
      },
      label: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Identifier"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      }
    },
    base: ["Statement"]
  },
  ContinueStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ContinueStatement"
      },
      label: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Identifier"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      }
    },
    base: ["Statement"]
  },
  WithStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "WithStatement"
      },
      object: {
        kind: "reference",
        name: "Expression"
      },
      body: {
        kind: "reference",
        name: "Statement"
      }
    },
    base: ["Statement"]
  },
  SwitchStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "SwitchStatement"
      },
      discriminant: {
        kind: "reference",
        name: "Expression"
      },
      cases: {
        kind: "array",
        base: {
          kind: "reference",
          name: "SwitchCase"
        }
      },
      lexical: {
        kind: "literal",
        value: false
      }
    },
    base: ["Statement"]
  },
  ReturnStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ReturnStatement"
      },
      argument: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Expression"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      }
    },
    base: ["Statement"]
  },
  ThrowStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ThrowStatement"
      },
      argument: {
        kind: "reference",
        name: "Expression"
      }
    },
    base: ["Statement"]
  },
  TryStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "TryStatement"
      },
      block: {
        kind: "reference",
        name: "BlockStatement"
      },
      handler: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "CatchClause"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      },
      finalizer: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "BlockStatement"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      }
    },
    base: ["Statement"]
  },
  WhileStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "WhileStatement"
      },
      test: {
        kind: "reference",
        name: "Expression"
      },
      body: {
        kind: "reference",
        name: "Statement"
      }
    },
    base: ["Statement"]
  },
  DoWhileStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "DoWhileStatement"
      },
      body: {
        kind: "reference",
        name: "Statement"
      },
      test: {
        kind: "reference",
        name: "Expression"
      }
    },
    base: ["Statement"]
  },
  ForStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ForStatement"
      },
      init: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "VariableDeclaration"
          },
          {
            kind: "reference",
            name: "Expression"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      },
      test: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Expression"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      },
      update: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Expression"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      },
      body: {
        kind: "reference",
        name: "Statement"
      }
    },
    base: ["Statement"]
  },
  ForInStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ForInStatement"
      },
      left: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "VariableDeclaration"
          },
          {
            kind: "reference",
            name: "Expression"
          }
        ]
      },
      right: {
        kind: "reference",
        name: "Expression"
      },
      body: {
        kind: "reference",
        name: "Statement"
      }
    },
    base: ["Statement"]
  },
  DebuggerStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "DebuggerStatement"
      }
    },
    base: ["Statement"]
  },
  Declaration: {
    kind: "interface",
    props: {},
    base: ["Statement"]
  },
  FunctionDeclaration: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "FunctionDeclaration"
      },
      id: {
        kind: "reference",
        name: "Identifier"
      }
    },
    base: ["Function", "Declaration"]
  },
  VariableDeclaration: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "VariableDeclaration"
      },
      declarations: {
        kind: "array",
        base: {
          kind: "reference",
          name: "VariableDeclarator"
        }
      },
      kind: {
        kind: "union",
        types: [
          {
            kind: "literal",
            value: "var"
          },
          {
            kind: "literal",
            value: "let"
          },
          {
            kind: "literal",
            value: "const"
          }
        ]
      }
    },
    base: ["Declaration"]
  },
  VariableDeclarator: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "VariableDeclarator"
      },
      id: {
        kind: "reference",
        name: "Pattern"
      },
      init: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Expression"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      }
    },
    base: ["Node"]
  },
  Expression: {
    kind: "interface",
    props: {},
    base: ["Node"]
  },
  ThisExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ThisExpression"
      }
    },
    base: ["Expression"]
  },
  ArrayExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ArrayExpression"
      },
      elements: {
        kind: "array",
        base: {
          kind: "union",
          types: [
            {
              kind: "reference",
              name: "Expression"
            },
            {
              kind: "reference",
              name: "SpreadElement"
            },
            {
              kind: "literal",
              value: null
            }
          ]
        }
      }
    },
    base: ["Expression"]
  },
  ObjectExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ObjectExpression"
      },
      properties: {
        kind: "array",
        base: {
          kind: "reference",
          name: "Property"
        }
      }
    },
    base: ["Expression"]
  },
  Property: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "Property"
      },
      key: {
        kind: "reference",
        name: "Expression"
      },
      value: {
        kind: "reference",
        name: "Expression"
      },
      kind: {
        kind: "union",
        types: [
          {
            kind: "literal",
            value: "init"
          },
          {
            kind: "literal",
            value: "get"
          },
          {
            kind: "literal",
            value: "set"
          }
        ]
      },
      method: {
        kind: "reference",
        name: "boolean"
      },
      shorthand: {
        kind: "reference",
        name: "boolean"
      },
      computed: {
        kind: "reference",
        name: "boolean"
      }
    },
    base: ["Node"]
  },
  FunctionExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "FunctionExpression"
      }
    },
    base: ["Function", "Expression"]
  },
  SequenceExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "SequenceExpression"
      },
      expressions: {
        kind: "array",
        base: {
          kind: "reference",
          name: "Expression"
        }
      }
    },
    base: ["Expression"]
  },
  UnaryExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "UnaryExpression"
      },
      operator: {
        kind: "reference",
        name: "UnaryOperator"
      },
      prefix: {
        kind: "reference",
        name: "boolean"
      },
      argument: {
        kind: "reference",
        name: "Expression"
      }
    },
    base: ["Expression"]
  },
  BinaryExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "BinaryExpression"
      },
      operator: {
        kind: "reference",
        name: "BinaryOperator"
      },
      left: {
        kind: "reference",
        name: "Expression"
      },
      right: {
        kind: "reference",
        name: "Expression"
      }
    },
    base: ["Expression"]
  },
  AssignmentExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "AssignmentExpression"
      },
      operator: {
        kind: "reference",
        name: "AssignmentOperator"
      },
      left: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Pattern"
          },
          {
            kind: "reference",
            name: "MemberExpression"
          }
        ]
      },
      right: {
        kind: "reference",
        name: "Expression"
      }
    },
    base: ["Expression"]
  },
  UpdateExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "UpdateExpression"
      },
      operator: {
        kind: "reference",
        name: "UpdateOperator"
      },
      argument: {
        kind: "reference",
        name: "Expression"
      },
      prefix: {
        kind: "reference",
        name: "boolean"
      }
    },
    base: ["Expression"]
  },
  LogicalExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "LogicalExpression"
      },
      operator: {
        kind: "reference",
        name: "LogicalOperator"
      },
      left: {
        kind: "reference",
        name: "Expression"
      },
      right: {
        kind: "reference",
        name: "Expression"
      }
    },
    base: ["Expression"]
  },
  ConditionalExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ConditionalExpression"
      },
      test: {
        kind: "reference",
        name: "Expression"
      },
      alternate: {
        kind: "reference",
        name: "Expression"
      },
      consequent: {
        kind: "reference",
        name: "Expression"
      }
    },
    base: ["Expression"]
  },
  CallExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "CallExpression"
      },
      callee: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Expression"
          },
          {
            kind: "reference",
            name: "Super"
          }
        ]
      },
      arguments: {
        kind: "array",
        base: {
          kind: "union",
          types: [
            {
              kind: "reference",
              name: "Expression"
            },
            {
              kind: "reference",
              name: "SpreadElement"
            }
          ]
        }
      }
    },
    base: ["Expression"]
  },
  NewExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "NewExpression"
      }
    },
    base: ["CallExpression"]
  },
  MemberExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "MemberExpression"
      },
      object: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Expression"
          },
          {
            kind: "reference",
            name: "Super"
          }
        ]
      },
      property: {
        kind: "reference",
        name: "Expression"
      },
      computed: {
        kind: "reference",
        name: "boolean"
      }
    },
    base: ["Expression", "Pattern"]
  },
  Pattern: {
    kind: "interface",
    props: {},
    base: ["Node"]
  },
  SwitchCase: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "SwitchCase"
      },
      test: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Expression"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      },
      consequent: {
        kind: "array",
        base: {
          kind: "reference",
          name: "Statement"
        }
      }
    },
    base: ["Node"]
  },
  CatchClause: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "CatchClause"
      },
      param: {
        kind: "reference",
        name: "Pattern"
      },
      guard: {
        kind: "literal",
        value: null
      },
      body: {
        kind: "reference",
        name: "BlockStatement"
      }
    },
    base: ["Node"]
  },
  Identifier: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "Identifier"
      },
      name: {
        kind: "reference",
        name: "string"
      }
    },
    base: ["Node", "Expression", "Pattern"]
  },
  Literal: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "Literal"
      },
      value: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "string"
          },
          {
            kind: "reference",
            name: "boolean"
          },
          {
            kind: "literal",
            value: null
          },
          {
            kind: "reference",
            name: "number"
          },
          {
            kind: "reference",
            name: "RegExp"
          }
        ]
      }
    },
    base: ["Node", "Expression"]
  },
  RegexLiteral: {
    kind: "interface",
    props: {
      regex: {
        kind: "object",
        items: {
          pattern: {
            kind: "reference",
            name: "string"
          },
          flags: {
            kind: "reference",
            name: "string"
          }
        }
      }
    },
    base: ["Literal"]
  },
  UnaryOperator: {
    kind: "enum",
    values: ["-", "+", "!", "~", "typeof", "void", "delete"]
  },
  BinaryOperator: {
    kind: "enum",
    values: [
      "==",
      "!=",
      "===",
      "!==",
      "<",
      "<=",
      ">",
      ">=",
      "<<",
      ">>",
      ">>>",
      "+",
      "-",
      "*",
      "/",
      "%",
      "|",
      "^",
      "&",
      "in",
      "instanceof"
    ]
  },
  LogicalOperator: {
    kind: "enum",
    values: ["||", "&&"]
  },
  AssignmentOperator: {
    kind: "enum",
    values: [
      "=",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "<<=",
      ">>=",
      ">>>=",
      "|=",
      "^=",
      "&="
    ]
  },
  UpdateOperator: {
    kind: "enum",
    values: ["++", "--"]
  },
  ForOfStatement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ForOfStatement"
      }
    },
    base: ["ForInStatement"]
  },
  Super: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "Super"
      }
    },
    base: ["Node"]
  },
  SpreadElement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "SpreadElement"
      },
      argument: {
        kind: "reference",
        name: "Expression"
      }
    },
    base: ["Node"]
  },
  ArrowFunctionExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ArrowFunctionExpression"
      },
      body: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "BlockStatement"
          },
          {
            kind: "reference",
            name: "Expression"
          }
        ]
      },
      expression: {
        kind: "reference",
        name: "boolean"
      }
    },
    base: ["Function", "Expression"]
  },
  YieldExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "YieldExpression"
      },
      argument: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Expression"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      }
    },
    base: ["Expression"]
  },
  TemplateLiteral: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "TemplateLiteral"
      },
      quasis: {
        kind: "array",
        base: {
          kind: "reference",
          name: "TemplateElement"
        }
      },
      expressions: {
        kind: "array",
        base: {
          kind: "reference",
          name: "Expression"
        }
      }
    },
    base: ["Expression"]
  },
  TaggedTemplateExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "TaggedTemplateExpression"
      },
      tag: {
        kind: "reference",
        name: "Expression"
      },
      quasi: {
        kind: "reference",
        name: "TemplateLiteral"
      }
    },
    base: ["Expression"]
  },
  TemplateElement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "TemplateElement"
      },
      tail: {
        kind: "reference",
        name: "boolean"
      },
      value: {
        kind: "object",
        items: {
          cooked: {
            kind: "reference",
            name: "string"
          },
          value: {
            kind: "reference",
            name: "string"
          }
        }
      }
    },
    base: ["Node"]
  },
  AssignmentProperty: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "Property"
      },
      value: {
        kind: "reference",
        name: "Pattern"
      },
      kind: {
        kind: "literal",
        value: "init"
      },
      method: {
        kind: "literal",
        value: false
      }
    },
    base: ["Property"]
  },
  ObjectPattern: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ObjectPattern"
      },
      properties: {
        kind: "array",
        base: {
          kind: "reference",
          name: "AssignmentProperty"
        }
      }
    },
    base: ["Pattern"]
  },
  ArrayPattern: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ArrayPattern"
      },
      elements: {
        kind: "array",
        base: {
          kind: "union",
          types: [
            {
              kind: "reference",
              name: "Pattern"
            },
            {
              kind: "literal",
              value: null
            }
          ]
        }
      }
    },
    base: ["Pattern"]
  },
  RestElement: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "RestElement"
      },
      argument: {
        kind: "reference",
        name: "Pattern"
      }
    },
    base: ["Pattern"]
  },
  AssignmentPattern: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "AssignmentPattern"
      },
      left: {
        kind: "reference",
        name: "Pattern"
      },
      right: {
        kind: "reference",
        name: "Expression"
      }
    },
    base: ["Pattern"]
  },
  Class: {
    kind: "interface",
    props: {
      id: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Identifier"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      },
      superClass: {
        kind: "reference",
        name: "Expression"
      },
      body: {
        kind: "reference",
        name: "ClassBody"
      }
    },
    base: ["Node"]
  },
  ClassBody: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ClassBody"
      },
      body: {
        kind: "array",
        base: {
          kind: "reference",
          name: "MethodDefinition"
        }
      }
    },
    base: ["Node"]
  },
  MethodDefinition: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "MethodDefinition"
      },
      key: {
        kind: "reference",
        name: "Identifier"
      },
      value: {
        kind: "reference",
        name: "FunctionExpression"
      },
      kind: {
        kind: "union",
        types: [
          {
            kind: "literal",
            value: "constructor"
          },
          {
            kind: "literal",
            value: "method"
          },
          {
            kind: "literal",
            value: "get"
          },
          {
            kind: "literal",
            value: "set"
          }
        ]
      },
      computed: {
        kind: "reference",
        name: "boolean"
      },
      static: {
        kind: "reference",
        name: "boolean"
      }
    },
    base: ["Node"]
  },
  ClassDeclaration: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ClassDeclaration"
      },
      id: {
        kind: "reference",
        name: "Identifier"
      }
    },
    base: ["Class", "Declaration"]
  },
  ClassExpression: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ClassExpression"
      }
    },
    base: ["Class", "Expression"]
  },
  MetaProperty: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "MetaProperty"
      },
      meta: {
        kind: "reference",
        name: "Identifier"
      },
      property: {
        kind: "reference",
        name: "Identifier"
      }
    },
    base: ["Expression"]
  },
  ImportDeclaration: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ImportDeclaration"
      },
      specifiers: {
        kind: "array",
        base: {
          kind: "union",
          types: [
            {
              kind: "reference",
              name: "ImportSpecifier"
            },
            {
              kind: "reference",
              name: "ImportDefaultSpecifier"
            },
            {
              kind: "reference",
              name: "ImportNamespaceSpecifier"
            }
          ]
        }
      },
      source: {
        kind: "reference",
        name: "Literal"
      }
    },
    base: ["Node"]
  },
  ImportSpecifier: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ImportSpecifier"
      },
      imported: {
        kind: "reference",
        name: "Identifier"
      },
      local: {
        kind: "reference",
        name: "Identifier"
      }
    },
    base: []
  },
  ImportDefaultSpecifier: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ImportDefaultSpecifier"
      },
      local: {
        kind: "reference",
        name: "Identifier"
      }
    },
    base: []
  },
  ImportNamespaceSpecifier: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ImportNamespaceSpecifier"
      },
      local: {
        kind: "reference",
        name: "Identifier"
      }
    },
    base: []
  },
  ExportNamedDeclaration: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ExportNamedDeclaration"
      },
      declaration: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Declaration"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      },
      specifiers: {
        kind: "array",
        base: {
          kind: "reference",
          name: "ExportSpecifier"
        }
      },
      source: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Literal"
          },
          {
            kind: "literal",
            value: null
          }
        ]
      }
    },
    base: ["Node"]
  },
  ExportSpecifier: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ExportSpecifier"
      },
      exported: {
        kind: "reference",
        name: "Identifier"
      },
      local: {
        kind: "reference",
        name: "Identifier"
      }
    },
    base: []
  },
  ExportDefaultDeclaration: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ExportDefaultDeclaration"
      },
      declaration: {
        kind: "union",
        types: [
          {
            kind: "reference",
            name: "Declaration"
          },
          {
            kind: "reference",
            name: "Expression"
          }
        ]
      }
    },
    base: ["Node"]
  },
  ExportAllDeclaration: {
    kind: "interface",
    props: {
      type: {
        kind: "literal",
        value: "ExportAllDeclaration"
      },
      source: {
        kind: "reference",
        name: "Literal"
      }
    },
    base: ["Node"]
  }
};
