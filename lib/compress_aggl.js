function compressToken(obj) {
  if (obj.type == 'aggl') {
    obj.text = obj.text.replace(/\s+/g, ' ');
  }
  return obj;
}

function compressAllTokens(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = compressToken(arr[i]);
  }
  return arr;
}

module.exports = compressAllTokens;
