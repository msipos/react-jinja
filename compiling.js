function compiling(input) {
  var state = {
    output: [],
    childrenCounter: 0,
    attribCounter: 0
  };

  // TODO: Collapse compileNode and compileNodeChildren

  var compileNode = function(node) {
    var subChildren = compileNodeChildren(node.children);

    var output = [
      'React.createElement(',
      '"' + node.element + '",',
      '{',
      '},',
      subChildren,
      ');'
    ];
    return output;
  }

  var compileList = function(listName, nodeList) {
    var pushChild = function(text) {
      state.output.push(listName + '.push(');
      state.output.push(text);
      state.output.push(');');
    }

    for (var i = 0; i < nodeList.length; i++) {
      var child = nodeList[i];

      if (child.type === 'aggl') {
        pushChild('"' + child.text + '"');
        continue;
      }

      if (child.type === 'node') {
        var output = compileNode(child);
        state.output = state.output.concat(output);
        continue;
      }

      if (child.type === '%nodeif') {
        state.output.push('if (' + child.expr + ') {');
        compileList(listName, child.children);
        state.output.push('}');
        if (child.elseChildren.length > 0) {
          state.ouput.push('else {');
          compileList(listName, child.children);
          state.output.push('}');
        }
      }
    }
  }

  var compileNodeChildren = function(children) {
    var counter = state.childrenCounter;

    state.output.push('var children' + counter + ' = [];');
    state.childrenCounter++;

    compileList('children' + counter, children, 2);

    return 'children' + counter;
  }
  compileNodeChildren(input.children);
  return state.output;
};

module.exports = compiling;