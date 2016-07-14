'use strict';
var _ = require('lodash');

var algos = {
  'eddsa': 'eddsa',
  'curve25519': 'curve25519',
  'triplesec-v3': 'triplesec-v3',
  'scrypt': 'scrypt',
  'nacl easybox': 'nacl-easybox',
  'nacl secretbox': 'nacl-secretbox',
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
