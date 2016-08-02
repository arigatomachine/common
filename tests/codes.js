'use strict';

var assert = require('assert');
var crypto = require('crypto');
var base32 = require('base32');

var codes = require('../utils/codes');
var types = require('../types/codes');

describe('codes', function () {

  describe('#generate', function () {
    it('constructs an alpha code', function () {
      var code = codes.generate('alpha');
      var buf = new Buffer(base32.decode(code), 'binary');

      assert.strictEqual(buf.slice(0,1).toString('hex'), types.defn.alpha);
    });

    it('errors if unknown type given', function () {
      assert.throws(function () {
        codes.generate('dsfsdf');
      }, /unknown code type:/);
    });
  });

  describe('#validate', function () {
    it('throws if byte length is incorrect', function () {
      assert.throws(function() {
        codes.validate(crypto.randomBytes(4));
      }, /A code must be 6 bytes/);
    });
    it('throws if code byte is unknown', function () {
      var code = Buffer.concat([
        new Buffer('23', 'hex'), crypto.randomBytes(5)]);

      assert.throws(function() {
        codes.validate(code);
      }, /unrecognized code type/);
    });
    it('returns buffer if valid code');
  });

  describe('#type', function () {
    it('returns the type as a string', function () {
      var code = codes.generate('org');
      assert.strictEqual(codes.type(code), 'org');
    });
  });
});
