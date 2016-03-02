var beautify = require('js-beautify').js_beautify;

var lexing = require('./lexing.js');
var compress_aggl = require('./compress_aggl.js');
var parsing = require('./parsing.js');
var parsing2 = require('./parsing2.js');
var compiling = require('./compiling.js');

function render(str, options) {
  var tokens = lexing(str);
  tokens = compress_aggl(tokens);
  var nodes = parsing(tokens);
  var nodes2 = parsing2(nodes);
  var compiled = compiling(nodes2, options);
  return beautify(compiled);
}

module.exports = render;
