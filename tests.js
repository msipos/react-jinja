var fs = require('fs');
var lexing = require('./lexing.js');
var parsing = require('./parsing.js');
var parsing2 = require('./parsing2.js');

var templateBasic = fs.readFileSync('test_templates/basic.html').toString();

exports.testBasic = function(test) {
  var tokens = lexing(templateBasic);
  test.ok(tokens.length === 46, 'Lexed correct number of tokens.');

  var flatNode = parsing(tokens);
  test.ok(flatNode.children.length === 21, 'Parsed into a flat node with 21 children.');

  var treeNode = parsing2(flatNode);
  test.ok(treeNode.children.length === 1, 'One node at the top.');
  test.ok(treeNode.children[0].element === 'div', 'It is a div.');

  test.done();
}