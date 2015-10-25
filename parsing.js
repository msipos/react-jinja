function parsing(input) {
  var state = {
    input: input,
    offset: 0
  };

  var consumeToken = function() {
    state.offset++;
  }

  var nextToken = function() {
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

  var parsePercent = function(text) {
    // Strip off {% and %}
    text = text.slice(2, -2);
    text = text.trim();

    if (text === '') {
      throw new ParsingException('Empty {% %}');
    }

    node = {
      type: '%',
      percType: null,
      expr: null
    }

    words = text.split(/\s/);
    if (words[0] === 'if') {
      node.percType = 'if';
    } else if (words[0] === 'endif') {
      node.percType = 'endif';
    } else {
      throw new ParsingException('Invalid keyword in {% %}: ' + words[0]);
    }

    if (words.length > 1) node.expr = text.slice(words[0].length);

    return node;
  }

  var stateAttributeValue = function() {
    var tok = nextToken();

    if (tok == null) {
      throw new ParsingException('Expected attribute value');
    }

    if (tok.type === 'string') {
      consumeToken();
      return {
        type: 'string',
        text: tok.text
      };
    }

    throw new ParsingError('Invalid attribute value');
  }

  var stateAttribute = function() {
    var node = {
      type: 'attribute',
      prop: null,
      value: null
    };

    // Property
    var tok = nextToken();
    if (tok == null || tok.type != 'id') {
      throw new ParsingException('Invalid attribute');
    }
    node.prop = tok.text;
    consumeToken();

    // = sign
    tok = nextToken();
    if (tok == null || tok.text != '=') {
      throw new ParsingException('Expected "="');
    }
    consumeToken();

    // Value
    node.value = stateAttributeValue();

    return node;
  }

  var stateNode = function() {
    var node = {
      type: 'node',
      nodeType: 'open',
      element: null,
      attributes: []
    };

    // Opening  < or </
    var tok = nextToken();
    if (tok == null || (tok.text != '</' && tok.text != '<')) {
      throw new ParsingException('Node must start with </ or <');
    }
    if (tok.text === '</') {
      node.nodeType = 'close';
    }
    consumeToken();

    // Node element
    tok = nextToken();
    if (tok == null || tok.type !== 'id') {
      throw new ParsingException('Node element needed.');
    }
    node.element = tok.text;
    consumeToken();

    for (;;) {
      tok = nextToken();

      if (tok == null) {
        throw new ParsingException('Input ended while in a DOM node.');
      }

      if (tok.text === '/>') {
        node.nodeType = 'openclose';
        consumeToken();
        return node;
      }

      if (tok.text === '>') {
        consumeToken();
        return node;
      }

      if (tok.type === 'id') {
        node.attributes.push(stateAttribute());
        continue;
      }


    }

  }

  var stateFirst = function() {
    var node = {
      type: 'first',
      children: []
    }

    for (;;) {
      var tok = nextToken();

      if (tok == null) {
        return node;
      }

      if (tok.text === '<' || tok.text === '</') {
        node.children.push(stateNode());
        continue;
      }

      if (tok.type === 'aggl') {
        node.children.push({
          type: 'aggl',
          text: tok.text
        });
        consumeToken();
        continue;
      }

      if (tok.type === '%') {
        node.children.push(parsePercent(tok.text));
        consumeToken();
        continue;
      }

      throw new ParsingException('Invalid token at top level');
    }
  }

  return stateFirst();
};

module.exports = parsing;