var fs = require('fs'),
    path = require('path');

function CMUDict() {
  this.dictText = null;
  var possibles = ['cmudict', './cmudict'];
  var cmuPath = null;
  possibles.forEach(function(x) {
    try {
      cmuPath = require.resolve(x);
    } catch(e) { }
  });
  if (cmuPath === null) {
    throw 'cmudict.js cannot find its lib directory.';
  }

  cmuPath = cmuPath.split(path.sep);
  this.cmuPath = cmuPath.slice(0, cmuPath.length-1).concat('cmu','cmudict.0.7a').join(path.sep);
  this.dictText = fs.readFileSync(this.cmuPath, {"encoding": 'utf-8'});
}

CMUDict.prototype.get = function(lookup, cb) {
  var re = RegExp('^' + lookup.toUpperCase() + '\\s+(.+)$', 'mi'),
      match = this.dictText.match(re);

  if (match !== null) {
    return match[1];
  }
  else {
    return null
  }

};

exports.CMUDict = CMUDict;
