/**
 * Invite codes inside the Arigato System are typed, giving us a mechanism for
 * tracking how an invite is suppose to be used and with which flows. All codes
 * are represented using 6 bytes in base32.
 *
 * Schema:
 *
 * [ Code Type (1 Byte) || Paylaod (5 Bytes) ]
 *
 * The payload is randomly generated data from a secure source.
 *
 * What's most important is that these codes are treated like passwords as they
 * give a user access to perform some type of special privilege.
 */
'use strict';

var codes = exports;

var crypto = require('crypto');
var base32 = require('base32'); 

var types = require('../types/codes');

var CODE_BYTE_SIZE = 6;
var PAYLOAD_BYTE_SIZE = codes.PAYLOAD_BYTE_SIZE = 5;

/**
 * Generates a 6 byte base32 encoded invitation code for the given code type. 
 *
 * @param {String} type
 * @returns {String}
 */
codes.generate = function (type) {
  var value = types.defn[type];
  if (!value) {
    throw new Error('unknown code type: ' + type);
  }

  var valueBuf = new Buffer(1);
  valueBuf.write(value, 0, 1, 'hex');
  
  var payloadBuf = crypto.randomBytes(PAYLOAD_BYTE_SIZE);
  return base32.encode(Buffer.concat([valueBuf, payloadBuf]));
};

/**
 * Validates that the given code matches the code id schema.
 *
 * Throws an error if the id is invalid.
 *
 * @throws {Error}
 * @returns Buffer
 */
codes.validate = function (code) {
  code = (!Buffer.isBuffer(code)) ? 
    new Buffer(base32.decode(code), 'binary') : code;

  if (code.length !== CODE_BYTE_SIZE) {
    throw new Error('A code must be ' + CODE_BYTE_SIZE + ' bytes');
  }

  var type = code.slice(0,1).toString('hex');
  if (!types.name(type)) {
    throw new Error('Unknown code type: ' + type); 
  }

  return code;
};

/**
 * Returns the type of the invite for the given value.
 *
 * @throws {Error}
 * @param {String|Buffer} code
 * @returns {String}
 */
codes.type = function (code) {
  var buf = codes.validate(code);
  var type = buf.slice(0,1).toString('hex');

  return types.name(type);
};
