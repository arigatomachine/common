'use strict';

var utils = exports;

var crypto = require('crypto');

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
  return utils.base64url.encode(id);
};

utils.base64url = require('./base64url');
