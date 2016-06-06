'use strict';

var assert = require('assert');

var cpath = require('../cpath');

describe('cpath', function () {

  describe('CPath', function () {
    it('parses into parts properly and then stringifies', function () {
      var obj = new cpath.CPath('/org/proj/env/service/identity/instance');

      assert.strictEqual(obj.org, 'org');
      assert.strictEqual(obj.project, 'proj');
      assert.strictEqual(obj.environment, 'env');
      assert.strictEqual(obj.service, 'service');
      assert.strictEqual(obj.identity, 'identity');
      assert.strictEqual(obj.instance, 'instance');

      assert.strictEqual(obj.toString(),
                        '/org/proj/env/service/identity/instance');
    });

    it('throws error on bad path', function () {
      assert.throws(function () {
        /*jshint unused: false*/
        var obj = new cpath.CPath('/sdf/[a/sdf/sdf/sdf/sdf');
      }, /invalid cpath provided/);
    });
  });

  describe('CPathExp', function () {
    it('parses into parts properly and then stringifies', function () {
      var obj = new cpath.CPathExp('/org/proj/[dev-*|ci]/service/ian/1');

      assert.strictEqual(obj.org, 'org');
      assert.strictEqual(obj.project, 'proj');
      assert.strictEqual(obj.environment, '[dev-*|ci]');
      assert.strictEqual(obj.service, 'service');
      assert.strictEqual(obj.identity, 'ian');
      assert.strictEqual(obj.instance, '1');

      assert.strictEqual(obj.toString(),
                        '/org/proj/[dev-*|ci]/service/ian/1');
    });

    it('throws error on bad path', function () {
      var obj;
      var errored = false;

      try {
        obj = new cpath.CPathExp('/sdf/sdf[/sdf/sdf/sdf/sfd');
      } catch (err) {
        errored = true;
        assert.ok(err instanceof cpath.CPathError);
        assert.strictEqual(err.message, 'invalid cpathexp provided');
      }

      assert.ok(errored);
    });
  });

  describe('.validate', function () {
    it('passes for valid path - all lower case alpha', function () {
      assert.ok(cpath.validate('/org/proj/env/service/identity/instance'));
    });

    it('passes for valid path - one letter instance', function () {
      assert.ok(cpath.validate('/org/proj/env/service/identity/a')); 
    });

    it('passes for valid path - all lower case alpha w/ number', function () {
      assert.ok(cpath.validate('/org22/proj/env/service/identity/instance'));
    });

    it('passes for valid path - underscores and dashes', function () {
      assert.ok(cpath.validate('/org/proj_1/env_s/serv-ice/identity/instance'));
    });

    it('passes for trailing _', function () {
      assert.ok(cpath.validate('/org/proj_1/env_s/serv-ice/identity/instanc_'));
    });

    it('fails for invalid path - bad slug characters', function () {
      assert.strictEqual(
        cpath.validate('/org@@/proj/env/service/identity/instance'), false);
    });

    it('fails for invalid path - leading _', function () {
      assert.strictEqual(
        cpath.validate('/_ffsdf/sdfsdf/sdf/ssdf/sdfs/sdfsf'), false);
    });

    it('fails for leading -', function () {
      assert.strictEqual(
        cpath.validate('/-fsdf/sdfsdf/sdf/ssdf/sdfs/sdfs'), false);
    });

    it('fails for missing semgent', function () {
      assert.strictEqual(
        cpath.validate('/sdf/sdf/sdf/dfs/dfs'), false);
    });

    it('fails for trailing slash', function () {
      assert.strictEqual(
        cpath.validate('/sdf/sdf/sdf/dfs/sdf/dfs/'), false);
    });

    it('fails for a cpathexp', function () {
      assert.strictEqual(
        cpath.validate('/sdf/sdf/*/sdf/sdf/fds'), false);
    });
  });

  describe('.validateExp', function () {
    it('passes for absolute path', function () {
      assert.ok(cpath.validateExp('/org/proj/env/service/identity/instance'));
    });

    it('passes for wild cards in env and below', function () {
      assert.ok(cpath.validateExp('/org/proj/*/*/*/*'));
    });

    it('passes for an OR exp', function () {
      assert.ok(
        cpath.validateExp('/org/proj/[dev|ci]/service/identity/instance'));
    });

    it('passes for an OR exp w/ wildcard', function () {
      assert.ok(
        cpath.validateExp('/org/proj/[dev-*|ci]/*/*/*'));
    });

    it('handles crazy or and wildcards', function () {
      assert.ok(
        cpath.validateExp('/org/proj/[dev-*|ci]/[api|www]/*/*'));
    });

    it('fails for OR exp as an instance', function () {
      assert.strictEqual(
        cpath.validateExp('/org/project/sdf/sdf/sdf/[12|13]'), false);
    });

    it('fails for any EXP in org', function () {
      assert.strictEqual(
        cpath.validateExp('/[org|stuff]/sdf/sdf/sdf/sdf/sdf'), false);
    });

    it('fails for any EXP in project', function () {
      assert.strictEqual(
        cpath.validateExp('/org/[org|sd]/sdf/sdf/sdf/sdf'), false);
    });

    it('fails for an incomplete OR exp - missing component', function () {
      assert.strictEqual(
        cpath.validateExp('/org/sdf/[sdf|]/sfd/sdf/dsd'), false);
    });

    it('fails for an incomplete OR exp - missing trailing ]', function () {
      assert.strictEqual(
        cpath.validateExp('/sdf/sdf/[sdf|sdf-*/sdf/sdf/sdf'), false);
    });

    it('fails for an OR with a full wildcard component', function () {
      assert.strictEqual(
        cpath.validateExp('/sdf/sdf/[sdf|*]/sdf/sdf/sdf'), false);
    });
  });
});
