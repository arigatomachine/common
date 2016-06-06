'use strict';
var _ = require('lodash');

/**
 * Mutable signifies whether or not the `id` field is a hash of the underlying
 * object. If it's set to false then it is immutable, otherwise, it's id is
 * generated using random data.
 */
var objects = {
  user: {
    mutable: true,
    value: '01' // Value represented in hex
  },
  session: {
    mutable: true,
    value: '02'
  },
  service: {
    mutable: true,
    value: '03'
  },
  project: {
    mutable: true,
    value: '04',
  },
  env: {
    mutable: true,
    value: '05'
  },
  public_key: {
    mutable: false,
    value: '06'
  },
  private_key: {
    mutable: false,
    value: '07'
  },
  claim: {
    mutable: false,
    value: '08'
  },
  keyring: {
    mutable: true,
    value: '09'
  },
  keyring_member: {
    mutable: false,
    value: '0a' // Hex must be lowercase for matching
  },
  credential: {
    mutable: true,
    value: '0b'
  },
  verification_code: {
    mutable: true,
    value: '0C'
  },
  org: {
    mutable: true,
    value: '0D'
  },
  membership: {
    mutable: true,
    value: '0E'
  },
  team: {
    mutable: true,
    value: '0F'
  }
};

objects.name = function(b) {
  b = ''+b; // coerce to string
  b = b.toLowerCase(); // must always be lowercase

  return _.findKey(objects, function (val, name) {
    return val.value === b;
  });
};

objects.value = function(name) {
  return objects[name].value;
};

module.exports = objects;
