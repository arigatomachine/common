'use strict';
var _ = require('lodash');

var objects = {
  user: {
    mutable: true,
    value: '0x01'
  },
  session: {
    mutable: true,
    value: '0x02'
  },
  app: {
    mutable: true,
    value: '0x03'
  },
  collaborator: {
    mutable: true,
    value: '0x04'
  },
  env: {
    mutable: true,
    value: '0x05'
  },
  public_key: {
    mutable: false,
    value: '0x06'
  },
  private_key: {
    mutable: false,
    value: '0x07'
  },
  claim: {
    mutable: false,
    value: '0x08'
  },
  keyring: {
    mutable: true,
    value: '0x09'
  },
  keyring_member: {
    mutable: false,
    value: '0x0A'
  },
  credential: {
    mutable: false,
    value: '0x0B'
  },
};

objects.name = function(b) {
  b = ''+b; // coerce to string
  return _.findKey(objects, (val, name) => {
    return val.value === b;
  });
}; 

objects.value = function(name) {
  return objects[name].value;
};

module.exports = objects;
