function lexing(input) {
  var state = {
    input: input,
    offset: 0,
    condition: 0,
    output: []
  };

  var LexingException = function(text) {
    this.text ='LexingException: "' + text + '"';
  }

  var pushOutput = function(text, type) {
    state.output.push({type: type, text: text});
  }

  var nextChar = function() {
    if (state.offset >= input.length) return null;
    return input[state.offset];
  }

  var nextNextChar = function() {
    if (state.offset+1 >= input.length) return null;
    return input[state.offset+1];
  }

  var AgglBuffer = function() {
    this.buffer = "";
  }

  AgglBuffer.prototype.optPush = function(type) {
    if (this.buffer.length > 0) {
      pushOutput(this.buffer, type);
      this.buffer = "";
    }
  }

  var matchRe2 = function(re, re2) {
    var flags = 'g';
    if (re.multiline) flags += "m";
    if (re.ignoreCase) flags += "i";
    re = new RegExp(re.source, flags);

    re.lastIndex = state.offset;

    var result = re.exec(state.input);
    var offset = state.offset;
    var start = state.offset;

    if (result && result.index == state.offset) {
      offset += result[0].length;
    } else {
      return null;
    }

    flags = 'g';
    if (re2.multiline) flags += "m";
    if (re2.ignoreCase) flags += "i";
    re2 = new RegExp(re2.source, flags);

    for (;;) {
      if (offset >= state.input.length) return null;

      re2.lastIndex = offset;

      result = re2.exec(state.input);
      if (result && result.index == offset) {
        offset += result[0].length;
        state.offset = offset;
        return [state.input.slice(start, offset)];
      }

      offset++;
    }
  }

  var matchRe = function(re) {
    var flags = 'g';
    if (re.multiline) flags += "m";
    if (re.ignoreCase) flags += "i";
    re = new RegExp(re.source, flags);

    re.lastIndex = state.offset;

    var result = re.exec(state.input);

    if (result && result.index == state.offset) {
      state.offset += result[0].length;
      return result;
    }

    return null;
  }

  /** Inside a block. */
  var stateBlock = function() {
    for (;;) {
      if (nextChar() === null) return;

      var match;

      match = matchRe(new RegExp("\\/>"));
      if (match) {
        pushOutput(match[0]);
        return;
      }

      match = matchRe(new RegExp(">"));
      if (match) {
        pushOutput(match[0]);
        return;
      }

      match = matchRe(new RegExp("\\s+"));
      if (match) {
        continue;
      }

      match = matchRe(new RegExp("\\w+"));
      if (match) {
        pushOutput(match[0], "id");
        continue;
      }

      match = matchRe(new RegExp("\"[^\"]*\""));
      if (match) {
        pushOutput(match[0], "string");
        continue;
      }

      match = matchRe(new RegExp("="));
      if (match) {
        pushOutput(match[0]);
        continue;
      }

      throw new LexingException('Invalid char: ' + nextChar());
    }
  }

  /** First (outer-most state).

  Agglomerate anything whatsoeever until you hit <, {{ or {%. */
  var stateFirst = function() {
    var agglBuffer = new AgglBuffer;

    for (;;) {
      // End of input
      if (nextChar() === null) {
        agglBuffer.optPush("aggl");
        return;
      }

      var match;

      match = matchRe(new RegExp("<\\/"));
      if (match) {
        agglBuffer.optPush("aggl");
        pushOutput(match[0]);
        stateBlock();
        continue;
      }

      match = matchRe(/</);
      if (match) {
        agglBuffer.optPush("aggl");
        pushOutput(match[0]);
        stateBlock();
        continue;
      }

      match = matchRe2(/{%/, /%}/);
      if (match) {
        agglBuffer.optPush("aggl");
        pushOutput(match[0], "%");
        continue;
      }

      // Nothing matches, agglomerate
      agglBuffer.buffer += nextChar();
      state.offset += 1;
    }
  };

  stateFirst();
  return state.output;
};

module.exports = lexing;