'use strict';
var _ = require('lodash');

var algos = {
  'eddsa': '20', // Value represented in hex
  'curve25519': '21',
  'triplesec v3': '22',
  'scrypt': '23',
  'nacl easybox': '24',
  'nacl secretbox': '24',
};

algos.name = function(b) {
  b = ''+b; // coerce to string
  var found = _.findKey(algos, function(val) {
    return val === b.toLowerCase();
  });
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
