'use strict';
var _ = require('lodash');

var algos = {
  'EdDSA': '0x20',
  'Curve25519': '0x21',
  'TripleSec v3': '0x22',
  'Scrypt': '0x23',
  'NaCl Easybox': '0x24',
  'NaCl Secretbox': '0x24'
};

algos.name = function(b) {
  b = ''+b; // coerce to string
  return _.findKey(algos, (val, name) => {
    return val === b;
  });
}; 

algos.value = function(key) {
  return algos[key];
};

module.exports = algos;
