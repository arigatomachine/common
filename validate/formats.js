'use strict';

var formats = require('tv4-formats');

formats.base64 = function(data) {
  if (validator.isBase64(data)) {
    return null;
  }
  return 'must be base64 string';
};

module.exports = formats;
