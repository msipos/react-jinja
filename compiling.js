function compiling(input) {
  var state = {
    output: '',
    childrenCounter: 0,
    attribCounter: 0
  };

  var indentOut = function(indent) {
    for (var i = 0; i < indent; i++) {
      state.output += ' ';
    }
  }

  // TODO: Collapse compileNode and compileNodeChildren

  var compileNode = function(node) {
    var subChildren = compileNodeChildren(node.children);

    var output = 'React.createElement(\n';
    output += '      "' + node.element + '",\n';
    output += '      {\n';
    output += '      },\n';
    output += '      ' + subChildren + '\n    )';
    return output;
  }

  var compileList = function(listName, nodeList, indent) {
    var pushChild = function(text) {
      indentOut(indent);
      state.output += listName + '.push(\n';
      indentOut(indent+2);
      state.output += text + '\n';
      indentOut(indent);
      state.output += ');\n';
    }

    for (var i = 0; i < nodeList.length; i++) {
      var child = nodeList[i];

      if (child.type === 'aggl') {
        pushChild('"' + child.text + '"');
        continue;
      }

      if (child.type === 'node') {
        var output = compileNode(child);
        pushChild(output);
        continue;
      }

      if (child.type === '%nodeif') {
        state.output += '  if (' + child.expr + ') {\n';
        compileList(listName, child.children, indent+2);
        state.output += '  }\n';
        if (child.elseChildren.length > 0) {
          state.ouput += '  else {\n';
          compileList(listName, child.children, indent+2);
          state.output += '  }\n';
        }
      }
    }
  }

  var compileNodeChildren = function(children) {
    var counter = state.childrenCounter;

    var pushChild = function(text) {
      state.output += '  children' + counter + '.push(\n    ' + text + '\n  );\n';
    }

    state.output += '  var children' + counter + ' = [];\n';
    state.childrenCounter++;

    compileList('children' + counter, children, 2);

    return 'children' + counter;
  }

  console.log(compileNodeChildren(input.children));
  console.log(state.output);
};

module.exports = compiling;