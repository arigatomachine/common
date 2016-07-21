'use strict';

var user = exports;

var kdf = require('./kdf');
var utils = require('./utils');
var triplesec = require('./triplesec');

var algos = require('../types/algos');
var base64url = require('base64url');

var SALT_BYTES = 16;
var MASTER_KEY_BYTES = 256;
var SLICE_LENGTH_BYTES = 192;
var PASSWORD_BUFFER_LENGTH = 224;

/**
 * Generate both the password and master objects for user.body
 *
 * A 128bit salt is generated / used to encrypt the plaintext password
 * The encrypted password buffer is sliced [192] and encoded in base64
 * A 1024bit key is generated as used as the master key
 * The encrypted password buffer is sliced [0,192] / used to encrypt master key
 * The encrypted+encoded values are stored on the server
 *
 * @param {string} password - Plaintext password value
 */
user.encryptPasswordObject = function (password) {
  var data = {};

  // Generate 128 bit (16 byte) salt for password
  return utils.randomBytes(SALT_BYTES)
    // Construct the password object
    .then(function (passwordSalt) {
      data.password = {
        salt: base64url.encode(passwordSalt),
        alg: algos.value('scrypt')
      };

      // Create password buffer
      return kdf.generate(password, passwordSalt).then(function (buf) {
        if (buf.length !== PASSWORD_BUFFER_LENGTH) {
          throw new Error('invalid buffer length');
        }
        // Append the base64url value
        data.password.value = user.pwh(buf);
      });

    // Construct the master object from the password buffer
    }).then(function () {
      data.master = {
        alg: algos.value('triplesec-v3')
      };

      // Generate 1024 bit (256 byte) master key
      return utils.randomBytes(MASTER_KEY_BYTES).then(function (masterKeyBuf) {
        // Encrypt master key using the password
        return triplesec.encrypt({
          data: masterKeyBuf,
          key: new Buffer(password),
        }).then(function (buf) {
          // Base64 the master value for transmission
          data.master.value = base64url.encode(buf);
          return data;
        });
      });
    });
};

var BASE64_URL_REGEX = new RegExp('^[a-zA-Z0-9_\-]+$');
function isBase64url (str) {
  return BASE64_URL_REGEX.test(str);
}

/**
 * Derives the login_token_hmac given the users plain-text password, salt,
 * and login_token.
 *
 * @param {string} password in plain-text
 * @param {string} salt plain-text base64url encoded string
 * @param {string} loginToken plain-text base64url encoded string
 * @return {Promise} resolves with base64url encoded string
 */
user.deriveLoginHmac = function (password, salt, loginToken) {
  if (typeof password !== 'string') {
    throw new TypeError('password must be a string');
  }
  if (typeof salt !== 'string' || !isBase64url(salt)) {
    throw new TypeError('salt must be a valid base64url string');
  }
  if (typeof loginToken !== 'string') {
    throw new TypeError('loginToken must be a string');
  }

  salt = base64url.toBuffer(salt);

  // Perform password stretching to derive a higher entropy key
  return kdf.generate(password, salt).then(function (passwordBuf) {
    return user.pwh(passwordBuf); // get the part we use for the password hash
  }).then(function (pwh) {
    return utils.hmac(loginToken, pwh); // hmac the login token with the pwh
  }).then(function (hmac) {
    return base64url.encode(hmac); // encode the result and return it
  });
};

/**
 * Slice password and encode
 *
 * @param {buffer} passwordBuf
 */
user.pwh = function (passwordBuf) {
  // pwh is created from last 32 byte / 256 bit of password buffer
  var passwordBufSlice = passwordBuf.slice(SLICE_LENGTH_BYTES);
  return base64url.encode(passwordBufSlice);
};

/**
 * Decrypt the master key from user object using password
 *
 * @param {string} password - Plaintext password
 * @param {object} userObject - Full user object
 */
user.decryptMasterKey = function (password, userObject) {
  var value = base64url.toBuffer(userObject.body.master.value);
  // Returns masterKey buffer for use with encrypting
  return triplesec.decrypt({
    data: value,
    key: new Buffer(password),
  });
};
