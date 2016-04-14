'use strict';

var base64url = exports;

base64url.encode = function(unencoded) {
  var encoded = unencoded;
  if (Buffer.isBuffer(unencoded)) {
    encoded = unencoded.toString('base64');
  }
  if (typeof encoded !== 'string') {
    throw new Error('invalid input');
  }
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

base64url.decode = function(encoded) {
  if (typeof encoded !== 'string') {
    throw new Error('invalid input');
  }

  encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (encoded.length % 4)
    encoded += '=';

  return new Buffer(encoded || '', 'base64').toString('utf-8');
};
