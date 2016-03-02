var fs = require('fs');

var React = require('react');
var ReactDOMServer = require('react-dom/server');

var lexing = require('./lib/lexing.js');
var parsing = require('./lib/parsing.js');
var parsing2 = require('./lib/parsing2.js');
var compileTemplate = require("./lib/integrations.js");


exports.testIntermediateBasic = function(test) {
  var templateBasic = fs.readFileSync('test_templates/basic.html').toString();

  var tokens = lexing(templateBasic);
  test.ok(tokens.length === 46, 'Lexed correct number of tokens.');

  var flatNode = parsing(tokens);
  test.ok(flatNode.children.length === 21, 'Parsed into a flat node with 21 children.');

  var treeNode = parsing2(flatNode);
  test.ok(treeNode.children.length === 1, 'One node at the top.');
  test.ok(treeNode.children[0].element === 'div', 'It is a div.');

  test.done();
};

exports.testIntermediateBasic = function(test) {
  var templateBasic = fs.readFileSync('test_templates/basic2.html').toString();

  var tokens = lexing(templateBasic);
  console.log(tokens);
  //test.ok(tokens.length === 46, 'Lexed correct number of tokens.');

  // var flatNode = parsing(tokens);
  // test.ok(flatNode.children.length === 21, 'Parsed into a flat node with 21 children.');
  //
  // var treeNode = parsing2(flatNode);
  // test.ok(treeNode.children.length === 1, 'One node at the top.');
  // test.ok(treeNode.children[0].element === 'div', 'It is a div.');
  //
  test.done();
};

exports.testFullBasic = function(test) {
  var contents = fs.readFileSync('test_templates/basic.html').toString();
  var rf = eval(compileTemplate(contents));
  var Basic = React.createClass({
    render: rf
  });
  var elem = React.createElement(Basic, {foo: 'bar'});
  var expected = '<div> This is an example div. Here is an example span: <span class="foo">This is span text.</span>  <span class="bar">This should always show.</span>  </div>';

  test.ok(expected === ReactDOMServer.renderToStaticMarkup(elem));

  test.done();
};
