var contents = '<div a="foo">blah  {% if foobar %} <bar/> {% endif %} </div>'
console.log(contents);

var lexing = require('./lexing.js');
var parsing = require('./parsing.js');
var parsing2 = require('./parsing2.js');
var compiling = require('./compiling.js');
var pretty = require('./pretty.js');

try {
  var tokens = lexing(contents);
  var nodes = parsing(tokens);
  console.log(nodes);

  var nodes2 = parsing2(nodes);
  console.log(JSON.stringify(nodes2, null, 2));

  var output = compiling(nodes2);
  console.log(output);

  console.log(pretty(output));
} catch(e) {
  console.log(e);
  throw e;
}