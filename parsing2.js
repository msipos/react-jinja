function parsing2(input) {
  var state = {
    input: input.children,
    offset: 0
  };

  var consumeNode = function() {
    state.offset++;
  }

  var nextNode = function() {
    if (state.offset >= state.input.length) {
      return null;
    }
    return state.input[state.offset];
  }

  var ParsingException = function(text) {
    this.text ='ParsingException: "' + text;
    if (state.offset >= state.input.length) {
      this.text += '" at input end.';
    } else {
      var tok = state.input[state.offset];
      this.text += '" at token ' + tok.type + ' with text="' + tok.text + '"';
    }
  }

  var stateIf = function() {
    var node = {
      type: '%nodeif',
      expr: null,
      children: [],
      elseChildren: []
    }

    // Start node
    var nd = nextNode();
    if (nd === null || nd.type != '%') {
      throw new ParsingException('Invalid start of %if');
    }
    if (nd.percType != 'if') {
      throw new ParsingException('Invalid start of %if');
    }
    node.expr = nd.expr;
    consumeNode();

    var inElse = false;
    for (;;) {
      nd = nextNode();

      if (nd === null) {
        throw new ParsingException('Unterminated %if');
      }

      var destArray = node.children;
      if (inElse) destArray = node.elseChildren;

      if (nd.type === 'node') {
        destArray.push(stateFirst(true));
        continue;
      }

      if (nd.type === 'aggl') {
        destArray.push(nd);
        consumeNode();
        continue;
      }

      if (nd.type === '%') {
        if (nd.percType === 'else') {
          if (inElse) {
            throw new ParsingException('Two else statements');
          }
          consumeNode();
          inElse = true;
        } else if (nd.percType === 'endif') {
          consumeNode();
          return node;
        } else {
          destArray.push(stateStartPerct());
        }
      }
    }
  }

  var stateStartPerc = function() {
    var nd = nextNode();
    if (nd.type != '%') {
      throw new ParsingException('Not a % statement');
    }
    if (nd.percType === 'if') {
      return stateIf();
    } else {
      throw new ParsingException('Invalid % statement.');
    }
  }

  /* If inNode = true, then this is a node, otherwise it's top level. */
  var stateFirst = function(inNode) {
    var node = {
      type: 'node',
      element: null,
      attributes: [],
      children: []
    };

    var nd;

    if (inNode) {
      nd = nextNode();
      if (nd === null || nd.type != 'node') {
        throw new ParsingException('Invalid start of node.');
      }
      node.element = nd.element;
      node.attributes = nd.attributes;
      consumeNode();
      if (nd.nodeType === 'openclose') {
        return node;
      }

      if (nd.nodeType != 'open') {
        throw new ParsingException('Node close where I expected a start.');
      }
    }

    for (;;) {
      nd = nextNode();

      // Stop conditions:
      if (inNode && nd === null) throw new ParsingException('Stopped while in node.');
      if ((!inNode) && nd === null) return node;
      if (nd.type === 'node') {
        if ((!inNode) && nd.nodeType === 'close') throw new ParsingException('Invalid close.');
        if (inNode && nd.nodeType === 'close') {
          if (nd.element != node.element) {
            throw new ParsingException('Unmatched close node.');
          }
          if (nd.attributes.len > 0) {
            throw new ParsingException('Attributes in close node.');
          }
          consumeNode();
          return node;
        }
      }

      if (nd.type === 'node') {
        node.children.push(stateFirst(true));
        continue;
      }

      if (nd.type === 'aggl') {
        node.children.push(nd);
        consumeNode();
        continue;
      }

      if (nd.type === '%') {
        node.children.push(stateStartPerc());
        continue;
      }

      throw new ParsingException('Invalid node as child of node');
    }
  }

  return stateFirst(false);
};

module.exports = parsing2;