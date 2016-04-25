'use strict';
var _ = require('lodash');

var algos = {
  'eddsa': '0x20',
  'curve25519': '0x21',
  'triplesec v3': '0x22',
  'scrypt': '0x23',
  'nacl easybox': '0x24',
  'nacl secretbox': '0x24',
};

algos.name = function(b) {
  b = ''+b; // coerce to string
  var found = _.findKey(algos, function(val, name) {
    return val === b.toLowerCase();
  })
  if (found) {
    return found;
  }

  throw new Error('unrecognized algo');
};

algos.value = function(key) {
  var algo = algos[key.toString().toLowerCase()];
  if (algo) {
    return algo;
  }

  throw new Error('unrecognized algo');
};

module.exports = algos;
