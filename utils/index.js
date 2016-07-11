/**
 * All objects inside Arigato are represented by an 18 byte identifier. This
 * identifier is represented in base32 for passing in a non-binary format.
 *
 * Schema:
 *
 * [ Version (1 Byte) || Object Type (1 Byte) || ID Payload (16 Bytes) ]
 *
 * The payload varies depending on the type of object. If an object is mutable
 * then a random payload is assigned. Otherwise, the payload is the hash of the
 * object contents. For example:
 *
 *   obj.id = utils.id('public_key', blake2b(
 *    Buffer.concat(obj.body, obj.sig), hashsize=16bytes));
 *
 * This way all objects in Arigato have a similar id structure that can be used
 * for type hinting AND can evolve overtime as a first-class citizen.
 */
'use strict';

var utils = exports;

var crypto = require('crypto');
var base32 = require('base32');

var objects = require('../types/objects');

var PAYLOAD_BYTE_SIZE = utils.PAYLOAD_BYTE_SIZE = 16;
var ID_BYTE_SIZE = utils.ID_BYTE_SIZE = 18;
var ID_VERSION_HEX = utils.ID_VERSION_HEX = '01';

/**
 * Generates an object id for the given object type. Optionally accepts a
 * payload for immutable object types.
 *
 * @param {String} type
 * @param {Buffer} payload
 * @returns {String}
 */
utils.id = function(type, payload) {
  var defn = objects.defn[type];
  if (!defn) {
    throw new Error('unknown object type: ' + type);
  }
  if (payload &&  (!Buffer.isBuffer(payload) ||
                   payload.length !== PAYLOAD_BYTE_SIZE)) {
    throw new Error('Payload must be a buffer of 16 bytes');
  }
  if (payload && defn.mutable) {
    throw new Error('Mutable objects do not accept payloads');
  }
  if (!payload && !defn.mutable) {
    throw new Error(
      'A payload must be provided for an immutable object');
  }

  // Write the first byte to hold the id schema version (v1 == 0x01)
  // The second byte is the object type.
  var buf = new Buffer(2);
  buf.write(ID_VERSION_HEX, 0, 1, 'hex');
  buf.write(objects.value(type), 1, 1, 'hex');

  // Generate a random payload if no payload is provided
  payload = payload || crypto.randomBytes(PAYLOAD_BYTE_SIZE);

  var id = Buffer.concat([buf, payload]);
  return base32.encode(id);
};

/**
 * Validates that the given id matches the object id schema.
 *
 * Throws an error if the id is invalid.
 *
 * @throws {Error}
 * @returns Buffer
 */
utils.validate = function (id) {
  id = (!Buffer.isBuffer(id)) ? new Buffer(base32.decode(id), 'binary') : id;

  if (id.length !== ID_BYTE_SIZE) {
    throw new Error('An object id must be '+ID_BYTE_SIZE+' bytes');
  }

  var hex = id.toString('hex'); // 1 Byte = 2 Hex Characters
  if (hex.slice(0,2) !== ID_VERSION_HEX) {
    throw new Error('Invalid ID version provided: '+hex);
  }

  if (!objects.name(hex.slice(2,4))) {
    throw new Error('Unknown object id: '+ hex.slice(2,4));
  }

  return id;
};

/**
 * Returns the type of the object for the given id. If the id is not known it
 * throws an error.
 *
 * @throws {Error}
 * @returns type
 */
utils.type = function (id) {
  var buf = utils.validate(id);
  var type = buf.slice(1, 2).toString('hex');

  return objects.name(type);
};
