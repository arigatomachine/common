'use strict';

var assert = require('assert');
var rpath = require('../rpath');

describe('rpath', function () {

  it('expands a path that contains no OR expressions', function() {
    var path = '/knotty-buoy/landing-page/dev/*/*/*';

    var resourceDescriptor = rpath.parse(path, 'secret');
    var resources = rpath.expand(resourceDescriptor);

    assert.deepEqual(resources, [
      '/landing-page/dev/*/*/*/secret'
    ]);
  });

  it('expands a path that contains an OR expression', function() {
    var path = '/knotty-buoy/landing-page/[dev|prod]/*/*/*';

    var resourceDescriptor = rpath.parse(path, 'secret');
    var resources = rpath.expand(resourceDescriptor);

    assert.deepEqual(resources, [
      '/landing-page/dev/*/*/*/secret',
      '/landing-page/prod/*/*/*/secret'
    ]);
  });

  it('expands a path that contains multiple OR expression', function() {
    var path = '/knotty-buoy/landing-page/[dev|prod]/[api|www]/*/*';

    var resourceDescriptor = rpath.parse(path, 'secret');
    var resources = rpath.expand(resourceDescriptor);

    assert.deepEqual(resources, [
      '/landing-page/dev/api/*/*/secret',
      '/landing-page/dev/www/*/*/secret',
      '/landing-page/prod/api/*/*/secret',
      '/landing-page/prod/www/*/*/secret'
    ]);
  });

  it('explodes a path that contains no OR expressions', function() {
    var path = '/knotty-buoy/landing-page/dev/*/*/*';

    var resourceDescriptor = rpath.parse(path, 'secret');
    var resources = rpath.explode(resourceDescriptor);

    assert.deepEqual(resources, [
      '/landing-page',
      '/landing-page/dev',
      '/landing-page/dev/*',
      '/landing-page/dev/*/*',
      '/landing-page/dev/*/*/*',
      '/landing-page/dev/*/*/*/secret',
    ]);
  });

  it('explodes a path that contains a single OR expression', function() {
    var path = '/knotty-buoy/landing-page/[dev|prod]/*/*/*';

    var resourceDescriptor = rpath.parse(path, 'secret');
    var resources = rpath.explode(resourceDescriptor);

    assert.deepEqual(resources, [
      '/landing-page',
      '/landing-page/dev',
      '/landing-page/dev/*',
      '/landing-page/dev/*/*',
      '/landing-page/dev/*/*/*',
      '/landing-page/dev/*/*/*/secret',
      '/landing-page/prod',
      '/landing-page/prod/*',
      '/landing-page/prod/*/*',
      '/landing-page/prod/*/*/*',
      '/landing-page/prod/*/*/*/secret'
    ]);
  });

  it('explodes a path that contains multiple OR expressions', function() {
    var path = '/knotty-buoy/landing-page/[dev|prod]/[www|api]/*/*';

    var resourceDescriptor = rpath.parse(path, 'secret');
    var resources = rpath.explode(resourceDescriptor);

    assert.deepEqual(resources, [
      '/landing-page',
      '/landing-page/dev',
      '/landing-page/dev/api',
      '/landing-page/dev/api/*',
      '/landing-page/dev/api/*/*',
      '/landing-page/dev/api/*/*/secret',
      '/landing-page/dev/www',
      '/landing-page/dev/www/*',
      '/landing-page/dev/www/*/*',
      '/landing-page/dev/www/*/*/secret',
      '/landing-page/prod',
      '/landing-page/prod/api',
      '/landing-page/prod/api/*',
      '/landing-page/prod/api/*/*',
      '/landing-page/prod/api/*/*/secret',
      '/landing-page/prod/www',
      '/landing-page/prod/www/*',
      '/landing-page/prod/www/*/*',
      '/landing-page/prod/www/*/*/secret'
    ]);
  });
});
