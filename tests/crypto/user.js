/* eslint-env mocha */

'use strict';

var base64url = require('base64url');
var sinon = require('sinon');
var assert = require('assert');
var Promise = require('es6-promise').Promise;
var base64url = require('base64url');

var kdf = require('../../crypto/kdf');
var user = require('../../crypto/user');
var utils = require('../../crypto/utils');
var triplesec = require('../../crypto/triplesec');

var PLAINTEXT = 'password';

describe('Crypto', function () {
  before(function () {
    this.sandbox = sinon.sandbox.create();
  });
  
  describe('users', function () {
   
    describe('#encryptPasswordObject', function () {
      var pwBytes;
      var mkBytes;
      var pwCipher;
      var mkCipher;

      beforeEach(function () {
        pwBytes = new Buffer(16);
        mkBytes = new Buffer(256);
        pwCipher = new Buffer(224);
        mkCipher = new Buffer('masterkey cipher');

        this.sandbox.stub(kdf, 'generate')
        .returns(Promise.resolve(pwCipher));

        this.sandbox.stub(utils, 'randomBytes')
        .onFirstCall()
        .returns(Promise.resolve(pwBytes))
        .onSecondCall()
        .returns(Promise.resolve(mkBytes));

        this.sandbox.stub(triplesec, 'encrypt')
        .returns(Promise.resolve(mkCipher));
      });

      afterEach(function () {
        this.sandbox.restore();
      });

      it('generates 16byte salt for password', function () {
        return user.encryptPasswordObject(PLAINTEXT).then(function () {
          sinon.assert.calledTwice(utils.randomBytes);
          var firstCall = utils.randomBytes.firstCall;
          assert.strictEqual(firstCall.args[0], 16);
        });
      });

      it('encrypts plaintext password with generated salt', function () {
        return user.encryptPasswordObject(PLAINTEXT).then(function () {
          sinon.assert.calledOnce(kdf.generate);
          var firstCall = kdf.generate.firstCall;
          assert.strictEqual(firstCall.args[0], PLAINTEXT);
          assert.strictEqual(firstCall.args[1], pwBytes);
        });
      });

      it('generates 256byte key for master key', function () {
        return user.encryptPasswordObject(PLAINTEXT).then(function () {
          sinon.assert.calledTwice(utils.randomBytes);
          var secondCall = utils.randomBytes.secondCall;
          assert.strictEqual(secondCall.args[0], 256);
        });
      });

      it('encrypts master key with password slice', function () {
        return user.encryptPasswordObject(PLAINTEXT).then(function () {
          sinon.assert.calledOnce(triplesec.encrypt);
          var firstCall = triplesec.encrypt.firstCall;
          assert.deepEqual(firstCall.args[0], {
            data: mkBytes,
            key: pwCipher.slice(0, 192)
          });
        });
      });

      it('returns password and master objects', function () {
        return user.encryptPasswordObject(PLAINTEXT).then(function (obj) {

          assert.deepEqual(obj, {
            password: {
              salt: base64url.encode(pwBytes),
              value: base64url.encode(pwCipher.slice(192)),
              alg: '23'
            },
            master: {
              alg: '22',
              value: base64url.encode(mkCipher)
            }
          });
        });
      });

      it('fails when byte length is incorrect', function (done) {
        kdf.generate.restore();
        this.sandbox.stub(kdf, 'generate')
          .returns(Promise.resolve(new Buffer(1)));
        user.encryptPasswordObject(PLAINTEXT).then(function () {
          done(new Error('should not call'));
        }).catch(function (err) {
          assert.equal(err.message, 'invalid buffer length');
          done();
        });
      });
    });

    describe('#deriveLoginHmac', function () {
      it('throws error if pw is not a string', function () {
        assert.throws(function () {
          user.deriveLoginHmac(false); 
        }, /password must be a string/);
      });

      it('throws error if salt is not a base64url string', function () {
        assert.throws(function () {
          user.deriveLoginHmac('hi', '223---$$#');
        }, /salt must be a valid base64url string/);
      });

      it('throws error if loginToken is not a base64url string', function () {
        assert.throws(function () {
          user.deriveLoginHmac('hi', 'hi', false);
        }, /loginToken must be a string/);
      });

      it('returns a valid hmac in base64url', function () {
        var pw = 'testing123456';
        var salt = 'OEssOyvePQ4AwRt8GPNwRg';
        var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiOWZkNDE5OGMtMWRmNC00YWNhLTkwY2UtZmFlNjI2OGEzZjRlIiwib3duZXJfaWQiOiJBUUhyTnJLY3k4SEdfN0pmQ2RDeThxRE4iLCJpYXQiOjE0NjcwNzYwNTYsImV4cCI6MTQ2NzA3NjM1Nn0.EbRXovJ0a4Uhhi_ASRd3__Y2G_jLlI3iaX8HhCw6fG0'; // jshint ignore:line

        return user.deriveLoginHmac(pw, salt, token).then(function (hmac) {
          assert.strictEqual(hmac, '-RaUZYPmVh3Hr7ZoTH115ANcPRWwK5BfRYB1A3RIaEKkwt8yGJaWp9ZSI1RssoNqCpOCq7x-O53fEgWqdHdxrg'); // jshint ignore:line
        }); 
      });
    });
  });
});
