function pretty(input) {
  var out = '';

  var indent = function(n) {
    for (var i = 0; i < n; i++) {
      out += ' ';
    }
  }

  /* Count number of occurences of ch in str. */
  var count = function(str, ch) {
    var n = 0;
    for (var i = 0; i < str.length; i++) {
      if (str[i] == ch) {
        n++;
      }
    }
    return n;
  }

  var ci = 0;
  for (var i = 0; i < input.length; i++) {
    var line = input[i];

    var di = count(line, '(') + count(line, '{') - count(line, ')') - count(line, '}');

    if (di < 0) {
      ci += di;
    }
    indent(ci*2);
    out += line;
    out += '\n';

    if (di > 0) {
      ci += di;
    }
  }

  return out;
}

module.exports = pretty;