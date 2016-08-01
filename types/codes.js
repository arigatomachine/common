'use strict';

var _ = require('lodash');

var codes = exports;

var defn = codes.defn = {
  alpha: '01',
  org: '02'
};

codes.name = function (b) {
  b = ''+b;
  b = b.toLowerCase();

  var type = _.findKey(defn, function(v) {
    return v === b;
  });
  if (!type) {
    throw new Error('unrecognized code type');
  }

  return type;
};

codes.value = function (key) {
  var hex = defn[key.toString().toLowerCase()];
  if (!hex) {
    throw new Error('unrecognized code type');
  }

  return hex;
};
