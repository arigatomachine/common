'use strict';

var triplesec = require('triplesec');
var Promise = require('es6-promise').Promise;

var kdf = exports;

// factor to control cpu/mem usage (2^15). triplesec script expects the
// exponent as its argument.
var SCRYPT_N = 15;
var SCRYPT_R = 8; // block size factor
var SCRYPT_P = 1; // parallelism factor
var SCRYPT_DKLEN = 224; // generate 224 byte key

kdf.generate = function (key, salt, opts) {
  return new Promise(function (resolve, reject) {
    opts = opts || {};
    key = (Buffer.isBuffer(key) ? key : new Buffer(key));
    salt = (Buffer.isBuffer(salt)) ? salt : new Buffer((salt));

    var params = {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
      dkLen: opts.dkLen || SCRYPT_DKLEN,
      key: triplesec.WordArray.alloc(key),
      salt: triplesec.WordArray.alloc(salt),
      progress_hook: opts.hook
    };

    triplesec.scrypt(params, function (res) {
      if (res instanceof Error) {
        return reject(res);
      }

      return resolve(res.to_buffer());
    });
  });
};
