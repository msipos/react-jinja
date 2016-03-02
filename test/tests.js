var fs = require('fs');

var React = require('react');
var ReactDOMServer = require('react-dom/server');

var lexing = require('../lib/lexing.js');
var parsing = require('../lib/parsing.js');
var parsing2 = require('../lib/parsing2.js');
var compileTemplate = require("../lib/integrations.js");

var assert = require('assert');

var basicCompile = function(template, props) {
  var contents = fs.readFileSync(template).toString();
  var templateText = compileTemplate(contents);
  var rf = eval(templateText);
  var Basic = React.createClass({
    render: rf
  });
  var elem = React.createElement(Basic, props);
  return ReactDOMServer.renderToStaticMarkup(elem);
};

it('should compile basic.html', function() {
  var templateBasic = fs.readFileSync('test_templates/basic.html').toString();

  var tokens = lexing(templateBasic);
  assert.equal(tokens.length, 46, 'Lexed correct number of tokens.');

  var flatNode = parsing(tokens);
  assert.equal(flatNode.children.length, 21, 'Parsed into a flat node.');

  var treeNode = parsing2(flatNode);
  assert.equal(treeNode.children.length, 1, 'One node at the top.');
  assert.equal(treeNode.children[0].element, 'div', 'It is a div.');
});

it('should compile basic2.html', function() {
  var templateBasic = fs.readFileSync('test_templates/basic2.html').toString();

  var tokens = lexing(templateBasic);
  assert.equal(tokens.length, 34, 'Lexed correct number of tokens.');

  var flatNode = parsing(tokens);
  assert.equal(flatNode.children.length, 16, 'Parsed into a flat node');

  var treeNode = parsing2(flatNode);
  assert.equal(treeNode.children.length, 1, 'One node at the top.');
  assert.equal(treeNode.children[0].element, 'div', 'It is an div.');
});

it('should compile forloops.html', function() {
  var templateBasic = fs.readFileSync('test_templates/forloops.html').toString();

  var tokens = lexing(templateBasic);
  assert.equal(tokens.length, 22, 'Lexed correct number of tokens.');

  var flatNode = parsing(tokens);
  assert.equal(flatNode.children.length, 11, 'Parsed into a flat node.');
  console.log(JSON.stringify(flatNode, null, 2));

  var treeNode = parsing2(flatNode);
  assert.equal(treeNode.children.length, 1, 'One node at the top.');
  console.log(JSON.stringify(treeNode, null, 2));
  assert.equal(treeNode.children[0].element, 'ul', 'It is an ul.');
});

it ('should compile and render basic.html', function() {
  var expected = '<div> This is an example div. Here is an example span: <span class="foo">This is span text.</span>  <span class="bar">This should always show.</span>  </div>';

  assert.equal(expected, basicCompile("test_templates/basic.html"));
});

it ('should compile and render basic2.html', function() {
  var expected = '<div> This is an example div. Here is an example span: <span class="foo">This is span text.</span>  <span class="bar">This should print a property: FOO</span>  </div>';

  assert.equal(expected, basicCompile("test_templates/basic2.html", {myProp: "FOO"}));
});
