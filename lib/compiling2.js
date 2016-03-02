function compiling(input, options) {
  // State of the compilation
  var state = {
    output: [],
    counter: 0,
  };

  var getCounter = function() {
    var c = state.counter;
    state.counter += 1;
    return c;
  };

  var pushOut = function(txt) {
    state.output.push(txt);
  };

  /********************** Compile children. ************************/

  function compile(node) {
    if (node.type === 'node') {
      return compileNode(node);
    }

    if (node.type === 'aggl') {
      return '"' + node.text + '"';
    }

    //throw 'Invalid node.type: "' + node.type + '"';
  }

  /** Can this be compiled into [..., ...] instead of var children = ...
   * The answer is yes as long as the children are not {% if %} or {% for %}
   * loops.
   **/
  var canOptimizeChildren = function(children) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.type === "%nodeif") return false;
    }
    return true;
  };

  function compileOptimizedChildren(children) {
    var out = [];
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var compiledChild = compile(child);
      out.push(compiledChild);
    }
    return out;
  }

  function compileChildren(arrName, children) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.type === "%nodeif") {
        pushOut("if (" + child.expr + ") {");

        compileChildren(arrName, child.children);

        pushOut("} else {");

        compileChildren(arrName, child.elseChildren);

        pushOut("}");
      }

      var compiledChild = compile(child);
      pushOut(arrName + '.push(' + compiledChild + ');');
    }
  }

  /********************** Compile attributes. ************************/

  function compileValue(value) {
    if (value.type === "string") {
      return value.text;
    } else {
      throw "Invalid value.type";
    }
  }

  function canOptimizeAttributes(children) {
    return true;
  }

  /** Remember to change class into className. **/
  function compileAttributeName(name) {
    if (name === "class") return "className";
    return name;
  }

  function compileAttributes(attrName, children) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.type === "attribute") {
        // Remember that React uses className for class.
        pushOut(attrName + "['" + compileAttributeName(prop) + "'] = " + compileValue(child.value));
      } else {
        throw "Invalid attribute type.";
      }
    }
  }

  function compileOptimizedAttributes(children) {
    var out = [];
    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.type === "attribute") {
        out.push("'" + compileAttributeName(child.prop) + "': " + compileValue(child.value));
      } else {
        throw "Invalid attribute type.";
      }
    }
    return out;
  }

  /********************** Compile nodes. *****************************/

  function compileNode(node) {
    if (node.type !== 'node') {
      throw "compileNode called on something that is not a node.";
    }

    /** Compile attributes. */
    var optAttributes = canOptimizeAttributes(node.attributes);
    var attrEntry;
    if (!optAttributes) {
      var attrName = 'attr' + getCounter();
      pushOut('var ' + attrName + ' = {};');
      compileAttributes(attrName, node.attributes);
      attrEntry = attrName;
    } else {
      attrEntry = '{' + compileOptimizedAttributes(node.attributes).join(', ') + '}';
    }

    /** Compile children. */
    var optChildren = canOptimizeChildren(node.children);
    var childrenEntry;
    if (!optChildren) {
      var childrenArrName = 'children' + getCounter();
      pushOut('var ' +  childrenArrName + ' = [];');
      compileChildren(childrenArrName, node.children);
      childrenEntry = childrenArrName;
    } else {
      childrenEntry = "[" + compileOptimizedChildren(node.children).join(', ') + "]";
    }

    if (optAttributes && optChildren) {
      return "React.createElement('" + node.element + "', " + attrEntry + ", " + childrenEntry + ")";
    } else {
      var nodeName = 'node' + getCounter();
      pushOut('var ' + nodeName + ' = React.createElement(');
      pushOut('"' + node.element + '", ');
      pushOut(attrEntry + ', ');
      pushOut(childrenEntry);
      pushOut(');');
      return nodeName;
    }
  }

  var compiledNode = compileNode(input.children[0]);
  var text = state.output.join('');
  return 'var render = function() { ' + text + ' return ' + compiledNode + '; }; render;';
}

module.exports = compiling;
