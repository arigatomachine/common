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

      // CPathExp normalizes the path before breaking it into parts.
      assert.strictEqual(obj.environment, '[ci|dev-*]');
      assert.strictEqual(obj.service, 'service');
      assert.strictEqual(obj.identity, 'ian');
      assert.strictEqual(obj.instance, '1');

      assert.strictEqual(obj.toString(),
                        '/org/proj/[ci|dev-*]/service/ian/1');
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

  describe('.splitExp', function() {
    it('splits an org exp into multiple paths', function() {
      var paths = cpath.splitExp('notmultiple');
      assert.deepEqual(paths, [
        'notmultiple'
      ]);
    });
    it('splits an org exp into multiple paths', function() {
      var paths = cpath.splitExp('[awesome|sauce]');
      assert.deepEqual(paths, [
        'awesome',
        'sauce'
      ]);
    });
  });

  describe('.isSlug', function() {
    it('identifies a slug', function() {
      assert.ok(cpath.isSlug('this-is-a-slug'));
    });
    it('rejects a not-slug', function() {
      [
        'not-*',
        '*',
        '!!!!!'
      ].forEach(function(slug) {
        assert.equal(false, cpath.isSlug(slug));
      });
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

    it('fails for more than one kleane star', function() {
      assert.strictEqual(
        cpath.validateExp('/sdf/sdf/[sdf|api]/**/sdf/sdf'), false);
    });

    it('fails for a non-terminal kleane star', function() {
      assert.strictEqual(
        cpath.validateExp('/sdf/sdf/s*fd/sdf/sfd/sdf'), false);
    });
  }); 

  describe('.normalizeExp', function() {
    it('normalizes an OR statement', function() {
      assert.strictEqual(cpath.normalizeExp('/org/proj/[b|a|c]/d/f/g'),
                         '/org/proj/[a|b|c]/d/f/g');
    });

    it('normalizes an OR with a wildcard', function() {
      assert.strictEqual(cpath.normalizeExp('/org/proj/[b|a|c-*]/d/f/g'),
                        '/org/proj/[a|b|c-*]/d/f/g'); 
    });
  });

  describe('.compare', function () {
    it('returns 0 if exact same', function () {
      assert.strictEqual(cpath.compare(
        '/org/proj/env/service/identity/instance',
        '/org/proj/env/service/identity/instance'
      ), 0);
    });
    
    it('returns 1 if A is greater than B', function () {
      assert.strictEqual(cpath.compare(
        '/org/proj/env/service/identity/instance',
        '/org/proj/*/service/identity/instance'
      ), 1);
    });

    it('returns -1 if B is greater than B', function () {
      assert.strictEqual(cpath.compare(
        '/org/proj/dev-*/service/identity/instance',
        '/org/proj/dev-username/service/identity/instance'
      ), -1);
    });
  });

  describe('CPathExp', function() {
    describe('#compare', function() {
      it('matches directly', function() {
        var obj = cpath.parseExp('/org/proj/dev-1/api/ian/1');
        assert.ok(obj.compare('/org/proj/dev-1/api/ian/1'));
      });

      it('matches with a wildcard instance', function() {
        var obj = cpath.parseExp('/org/proj/dev-1/api/ian/*');
        assert.ok(obj.compare('/org/proj/dev-1/api/ian/1'));
        assert.ok(obj.compare('/org/proj/dev-1/api/ian/2'));
        assert.strictEqual(obj.compare('/org/proj/dev-1/api2/ian/1'), false);
      });

      it('matches with an OR service', function() {
        var obj = cpath.parseExp('/org/proj/dev-1/[api|www]/ian/1');

        assert.ok(obj.compare('/org/proj/dev-1/api/ian/1'));
        assert.ok(obj.compare('/org/proj/dev-1/www/ian/1'));
        assert.strictEqual(obj.compare('/org/proj/dev-1/sdf/ian/1'), false);
      });

      it('matches with an OR with more than two parts', function() {
        var obj = cpath.parseExp('/org/proj/dev-1/[www|api|auth]/ian/*');

        assert.ok(obj.compare('/org/proj/dev-1/www/ian/1'));
        assert.ok(obj.compare('/org/proj/dev-1/api/ian/1'));
        assert.ok(obj.compare('/org/proj/dev-1/auth/ian/1'));

        assert.strictEqual(obj.compare('/org/proj/dev-1/sdfsd/ian/2'), false);
      });

      it('matches with an OR wildcard service', function() {
        var obj = cpath.parseExp('/org/proj/dev-1/[www|user*]/ian/*');

        assert.ok(obj.compare('/org/proj/dev-1/www/ian/1'));
        assert.ok(obj.compare('/org/proj/dev-1/user/ian/1'));
        assert.ok(obj.compare('/org/proj/dev-1/user/ian/2'));
        assert.ok(obj.compare('/org/proj/dev-1/users-api/ian/1'));

        assert.strictEqual(obj.compare('/org/proj/dev-1/sdfsf/ian/1'), false);
      });

      it('matches many wild card levels', function() {
        var obj = cpath.parseExp('/org/proj/dev-*/*/*/*');

        assert.ok(obj.compare('/org/proj/dev-1/api/ian/1'));
        assert.ok(obj.compare('/org/proj/dev-2/www/jeff/2'));
        assert.strictEqual(obj.compare('/org/proj/prod/api/api-1/1'), false);
        assert.strictEqual(obj.compare('/org/proj/ci/api/ci-1/1'), false);
      });
    });

    describe('#contains', function () {
      it('instance is wildcard', function () {
        var obj = cpath.parseExp('/org/proj/dev-1/api/*/*');

        assert.ok(obj.contains('/org/proj/dev-1/api/*/1'));
        assert.ok(!obj.contains('/org/proj/dev-1/[api|www]/*/*'));
      });

      it('env is wildcard', function () {
        var obj = cpath.parseExp('/org/proj/*/api/*/*');

        assert.ok(obj.contains('/org/proj/prod/api/[ian-*|jeff-*]/1'));
        assert.ok(obj.contains('/org/proj/dev-*/api/ian/*'));
        assert.ok(!obj.contains('/org/proj/*/*/*/*'));
        assert.ok(!obj.contains('/org/proj/prod/www/*/*'));
        assert.ok(!obj.contains('/org/proj/prod/[api|www]/*/*'));
        assert.ok(!obj.contains('/abc/proj/dfsf/sdfsf/*/*'));
      });

      it('a contains OR and B contains OR', function () {
        var obj = cpath.parseExp('/org/proj/*/[api|www|worker-*]/*/*');
        
        assert.ok(obj.contains('/org/proj/*/api/*/*'));
        assert.ok(obj.contains('/org/proj/*/www/*/*'));
        assert.ok(obj.contains('/org/proj/*/worker-1/*/*'));
        assert.ok(obj.contains('/org/proj/*/[api|www]/*/*'));
        assert.ok(obj.contains('/org/proj/*/worker-*/*/*'));
        assert.ok(!obj.contains('/org/proj/*/worker/*/*'));
        assert.ok(!obj.contains('/org/proj/*/*/*/*'));
      });
    });
  });
});
