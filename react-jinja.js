//var Lexer = require("./lexer.js");
//
//var lexer = new Lexer;
//
////lexer.addRule(/[0-9]+(?:\.[0-9]+)?\b/, function (lexeme) {
//    //this.yytext = lexeme;
//    //return "NUMBER";
////});
//
//lexer.addRule(/\s+/, function() {
//  return "space";
//});
//
//lexer.addRule(/</, function() {
//  this.state = 1;
//  return "<";
//}, [0]);
//
//lexer.addRule(/>/, function() {
//  this.state = 0;
//  return ">";
//}, [1]);
//
//lexer.addRule(/div/, function() {
//  return "div";
//}, [1]);
//
//lexer.addRule(/div/, function() {
//  return "div2";
//}, [0]);
//
//lexer.addRule(/.+/, function(x) {
//  return "stuff(" + x + ")";
//});
//
//lexer.setInput("<div> foo bar baz </div> div");
//
//while (true) {
//  var l = lexer.lex()
//  console.log(l);
//  if (l == "EOF") break;
//  if (!l) break;
//}

contents = '<div a="foo">blah  {% if foobar %} <bar/> {% endif %} </div>'
console.log(contents);

var lexing = require('./lexing.js');
var parsing = require('./parsing.js');
var parsing2 = require('./parsing2.js');
var compiling = require('./compiling.js');

try {
  var tokens = lexing(contents);
  var nodes = parsing(tokens);
  console.log(nodes);

  var nodes2 = parsing2(nodes);
  console.log(JSON.stringify(nodes2, null, 2));

  var output = compiling(nodes2);
} catch(e) {
  console.log(e);
  throw e;
}