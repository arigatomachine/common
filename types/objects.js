'use strict';
var _ = require('lodash');

var objects = exports;

/**
 * Mutable signifies whether or not the `id` field is a hash of the underlying
 * object. If it's set to false then it is immutable, otherwise, it's id is
 * generated using random data.
 */
var defn = objects.defn = {
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
    value: '0c'
  },
  org: {
    mutable: true,
    value: '0d'
  },
  membership: {
    mutable: true,
    value: '0e'
  },
  team: {
    mutable: true,
    value: '0f'
  },
  token: {
    mutable: true,
    value: '10'
  }
};

objects.name = function(b) {
  b = ''+b; // coerce to string
  b = b.toLowerCase(); // must always be lowercase

  return _.findKey(defn, function (val) {
    return val.value === b;
  });
};

objects.value = function(name) {
  if (!defn[name]) {
    throw new TypeError('Unknown object type: ' + name);
  }

  return defn[name].value.toLowerCase();
};

module.exports = objects;
