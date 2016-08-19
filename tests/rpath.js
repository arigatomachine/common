'use strict';

var assert = require('assert');
var rpath = require('../rpath');

describe('rpath', function () {

  describe('#replaceVariable', function() {

    it ('substitutes ${username} with the value in context', function() {
      var resource = rpath.replaceVariable('dev-${username}', {
        username: 'skywalker'
      });

      assert(resource === 'dev-skywalker');
    });

  });

  describe('#isVariable', function() {

    it('returns true if the resource contains a variable', function() {
      var variableResource = rpath.isVariable('${org}');

      assert(variableResource);
    });

    it('returns false if the resource does not contain a variable', function() {
      var variableResource = rpath.isVariable('org');

      assert(!variableResource);
    });

  });

  describe('#parse/#validates', function() {

    it('validates a path containing variables: env-${username}', function() {
      var path = '/${org}/landing-page/env-${username}/service/identity/i';
      var resourceDescriptor = rpath.parse(path, 'secret');


      assert.strictEqual(resourceDescriptor.org, '${org}');
      assert.strictEqual(resourceDescriptor.project, 'landing-page');
      assert.strictEqual(resourceDescriptor.environment, 'env-${username}');
      assert.strictEqual(resourceDescriptor.service, 'service');
      assert.strictEqual(resourceDescriptor.identity, 'identity');
      assert.strictEqual(resourceDescriptor.instance, 'i');
      assert.strictEqual(resourceDescriptor.secret, 'secret');
    });

    it('validates a path containing variables: ${username}env', function() {
      var path = '/${org}/landing-page/${username}env/service/identity/i';
      var resourceDescriptor = rpath.parse(path, 'secret');


      assert.strictEqual(resourceDescriptor.org, '${org}');
      assert.strictEqual(resourceDescriptor.project, 'landing-page');
      assert.strictEqual(resourceDescriptor.environment, '${username}env');
      assert.strictEqual(resourceDescriptor.service, 'service');
      assert.strictEqual(resourceDescriptor.identity, 'identity');
      assert.strictEqual(resourceDescriptor.instance, 'i');
      assert.strictEqual(resourceDescriptor.secret, 'secret');
    });

    it('validates a path containing variables: ${username}-*', function() {
      var path = '/${org}/landing-page/${username}-*/service/identity/instance';
      var resourceDescriptor = rpath.parse(path, 'secret');


      assert.strictEqual(resourceDescriptor.org, '${org}');
      assert.strictEqual(resourceDescriptor.project, 'landing-page');
      assert.strictEqual(resourceDescriptor.environment, '${username}-*');
      assert.strictEqual(resourceDescriptor.service, 'service');
      assert.strictEqual(resourceDescriptor.identity, 'identity');
      assert.strictEqual(resourceDescriptor.instance, 'instance');
      assert.strictEqual(resourceDescriptor.secret, 'secret');
    });

    it('validates a partial path', function() {
      var path = '/knotty-buoy/landing-page/dev-*/service';
      var validPath = rpath.validate(path);

      assert(!(validPath instanceof Error));
    });

    it('validates a partial path containing variables', function() {
      var path = '/${org}/landing-page/${username}-*/service';
      var validPath = rpath.validate(path);

      assert(!(validPath instanceof Error));
    });

    it('validates the path and if provided a secret', function() {
      var path = '/${org}/landing-page/${username}-*/service/identity/instance';
      var validPath = rpath.validate(path, 'secret');

      assert(!(validPath instanceof Error));
    });

    it('validates the path and if provided a secret', function() {
      var path = '/${org}/landing-page/${username}-*/service/identity/instance';
      var validPath = rpath.validate(path, '$wat');

      assert(validPath instanceof Error);
    });

  });

  describe('#expand', function() {

    it('expands a path that contains no OR expressions', function() {
      var path = '/${org}/project/env-${username}/service/identity/instance';

      var resourceDescriptor = rpath.parse(path, 'secret');
      var resources = rpath.expand(resourceDescriptor);

      assert.deepEqual(resources, [
        '/${org}/project/env-${username}/service/identity/instance/secret'
      ]);
    });

    it('expands a path that contains an OR expression', function() {
      var path = '/knotty-buoy/landing-page/[dev|prod]/*/*/*';

      var resourceDescriptor = rpath.parse(path, 'secret');
      var resources = rpath.expand(resourceDescriptor);

      assert.deepEqual(resources, [
        '/knotty-buoy/landing-page/dev/*/*/*/secret',
        '/knotty-buoy/landing-page/prod/*/*/*/secret'
      ]);
    });

    it('expands a path that contains multiple OR expression', function() {
      var path = '/knotty-buoy/landing-page/[dev|prod]/[api|www]/*/*';

      var resourceDescriptor = rpath.parse(path, 'secret');
      var resources = rpath.expand(resourceDescriptor);

      assert.deepEqual(resources, [
        '/knotty-buoy/landing-page/dev/api/*/*/secret',
        '/knotty-buoy/landing-page/dev/www/*/*/secret',
        '/knotty-buoy/landing-page/prod/api/*/*/secret',
        '/knotty-buoy/landing-page/prod/www/*/*/secret'
      ]);
    });

  });

  describe('#explode', function() {

    it('explodes a path that contains no OR expressions', function() {
      var path = '/knotty-buoy/landing-page/dev/*/*/*';

      var resourceDescriptor = rpath.parse(path, 'secret');
      var resources = rpath.explode(resourceDescriptor);

      assert.deepEqual(resources, [
        '/knotty-buoy',
        '/knotty-buoy/landing-page',
        '/knotty-buoy/landing-page/dev',
        '/knotty-buoy/landing-page/dev/*',
        '/knotty-buoy/landing-page/dev/*/*',
        '/knotty-buoy/landing-page/dev/*/*/*',
        '/knotty-buoy/landing-page/dev/*/*/*/secret',
      ]);
    });

    it('explodes a path that contains a single OR expression', function() {
      var path = '/knotty-buoy/landing-page/[dev|prod]/*/*/*';

      var resourceDescriptor = rpath.parse(path, 'secret');
      var resources = rpath.explode(resourceDescriptor);

      assert.deepEqual(resources, [
        '/knotty-buoy',
        '/knotty-buoy/landing-page',
        '/knotty-buoy/landing-page/dev',
        '/knotty-buoy/landing-page/dev/*',
        '/knotty-buoy/landing-page/dev/*/*',
        '/knotty-buoy/landing-page/dev/*/*/*',
        '/knotty-buoy/landing-page/dev/*/*/*/secret',
        '/knotty-buoy/landing-page/prod',
        '/knotty-buoy/landing-page/prod/*',
        '/knotty-buoy/landing-page/prod/*/*',
        '/knotty-buoy/landing-page/prod/*/*/*',
        '/knotty-buoy/landing-page/prod/*/*/*/secret'
      ]);
    });

    it('explodes a path that contains multiple OR expressions', function() {
      var path = '/knotty-buoy/landing-page/[dev|prod]/[www|api]/*/*';

      var resourceDescriptor = rpath.parse(path, 'secret');
      var resources = rpath.explode(resourceDescriptor);

      assert.deepEqual(resources, [
        '/knotty-buoy',
        '/knotty-buoy/landing-page',
        '/knotty-buoy/landing-page/dev',
        '/knotty-buoy/landing-page/dev/api',
        '/knotty-buoy/landing-page/dev/api/*',
        '/knotty-buoy/landing-page/dev/api/*/*',
        '/knotty-buoy/landing-page/dev/api/*/*/secret',
        '/knotty-buoy/landing-page/dev/www',
        '/knotty-buoy/landing-page/dev/www/*',
        '/knotty-buoy/landing-page/dev/www/*/*',
        '/knotty-buoy/landing-page/dev/www/*/*/secret',
        '/knotty-buoy/landing-page/prod',
        '/knotty-buoy/landing-page/prod/api',
        '/knotty-buoy/landing-page/prod/api/*',
        '/knotty-buoy/landing-page/prod/api/*/*',
        '/knotty-buoy/landing-page/prod/api/*/*/secret',
        '/knotty-buoy/landing-page/prod/www',
        '/knotty-buoy/landing-page/prod/www/*',
        '/knotty-buoy/landing-page/prod/www/*/*',
        '/knotty-buoy/landing-page/prod/www/*/*/secret'
      ]);
    });

  });

});
