var fs = require('fs'),
    path = require('path');

function CMUDict(cmuPath) {
  var possibles = ['cmudict', './cmudict'];
  if (!cmuPath)
    possibles.forEach(function(x) {
      try {
        cmuPath = require.resolve(x);
      } catch(e) { cmuPath = null; }
    });
  cmuPath = [path.dirname(cmuPath), "cmu", "cmudict.0.7a"].join(path.sep)
  if (!fs.existsSync(cmuPath)) {
    throw 'cmudict.js cannot find the dictionary file!';
  }
  CMUDict.cmuPath = cmuPath;
  return CMUDict;
}

CMUDict.findInDict = findInDict;
CMUDict.read = read;
CMUDict.lookup = lookup;
CMUDict.get = get;
// CMUDict.cache = {};
CMUDict.dictText = null;
CMUDict.cmuPath = null;

function findInDict(word) {
  word = word.toUpperCase();
  var re = RegExp('^' + word + '\\s+(.+)$', 'mi'),
      match = CMUDict.dictText.match(re),
      result = match === null ? null : match[1];
  // CMUDict.cache[word] = result;
  return result;
}

function lookup(words, cb) {
  if (typeof words.map !== 'function') { words = new Array(words); }
  var results;
  try {
    return process.nextTick( function returnLookup() {
      return cb(null, words.map(findInDict));
    });
  }
  catch (err) { return cb(err); }
}

function read(cmuPath, cb) {
  if (cmuPath instanceof Function) { cb = cmuPath; cmuPath = null; }
  cmuPath = cmuPath || CMUDict.cmuPath;
  fs.readFile(cmuPath, {"encoding": 'utf-8'}, function dictRead(err, res) {
    if (err) return cb(err);
    CMUDict.dictText = res;
    cb(null, res);
  });
}

function get(words, cb) {
  var results;
  if (cb === undefined) {
    cb = function genericCb(err, x) {if (err) { throw err; } console.log(x);}
  }
  
  read(function doLookup(err) {
    if (err) return cb(err);
    lookup(words, function getReturn(err, results) {
      if (err) return cb(err);
      CMUDict.dictText = null;
      return cb(null, results);
    })
  });
};

module.exports = CMUDict();
