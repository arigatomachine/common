'use strict';

var utils = exports;

var crypto = require('crypto');
var base64url = require('base64url');

var objects = require('../types/objects');

utils.id = function(type, version) {
  if (!objects[type]) {
    throw new Error('unknown object type: ' + type);
  }

  version = version || '0x01';

  var buf = new Buffer(2);
  buf.write(version, 1, 1, 'hex');
  buf.write(objects.value(type), 1, 1, 'hex');

  var random = crypto.randomBytes(16);
  var id = Buffer.concat([buf, random]);
  return base64url.encode(id);
};
