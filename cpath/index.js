/**
 * Credentials (Config) are leaf-nodes inside a credential hierarchy (tree).
 * Each path segment (vertex) is named (e.g. dev-1 for an environment). The
 * absolute path (string of path segments) is called the CPath (credential
 * path).
 *
 * A CPath has the following form:
 *
 *    /$ORG/$PROJECT/$ENVIRONMENT/$SERVICE/$IDENTITY/$INSTANCE_ID
 *
 * Example(s):
 *
 *    /arigato/www/production/api/api-1/1
 *    /arigato/www/ci/api/ci-1/1
 *    /arigato/www/dev-1/api/ianlivingstone/1
 *    /arigato/core/dev-1/api/ianlivingstone/1
 *
 * When a process is run through Arigato it's CPath is derived based on it's
 * operating context (which environment it's running in, it's identity, an
 * instance id, and the service). This CPath is used for finding all of the
 * relevant credential/config values.
 *
 * A CPathExp is a like a regular expression for matching many different forms
 * of a CPath. It's provided at the time in-which a config or credential value
 * is stored for future usage. It's a powerful concept enabling a single value
 * to be shared across many different instances, services, and identities.
 *
 * A CPathExp has the following form:
 *
 *    /SLUG/SLUG/OR_EXP/OR_EXP/OR_EXP/SLUG_WILDCARD
 *
 * Where each segment matches its corresponding component in a CPath.
 *
 * Example(s): (ignore the backslash.. escaping for comment grammar)
 *
 *    /arigato/www/[ci|dev-*]/*\/*\/* (all process in ci and dev-* env)
 *    /arigato/www/dev-*\/api/*\/*\/  (all api process in dev-* env)
 *    /arigato/www/dev-1/*\/*\/1 (first instance of any service in dev-1)
 *
 * The concept of a CPath and CPathExp are the ground-work of our credential
 * storage and retrieval system.
 */

'use strict';

var cpath = exports;

var util = require('util');

var SLUG = '[a-z0-9][a-z0-9\\-\\_]{0,63}';
var WILDCARD = '[\\*]';
var SLUG_WILDCARD = SLUG + WILDCARD + '?'; // doesnt support dev-*
var SLUG_OR_WILDCARD = '(' + SLUG_WILDCARD + '|' + WILDCARD + ')';
var OR_EXP = '\\[(' + SLUG_WILDCARD + '\\|)+(' + SLUG_WILDCARD + ')+\\]';
var SLUG_WILDCARD_OR_EXP = '(' + SLUG_OR_WILDCARD + '|' + OR_EXP + ')';
var CPATHEXP_REGEX_STR = '^/' +
                        SLUG + '/' + // org
                        SLUG + '/' + // project
                        SLUG_WILDCARD_OR_EXP + '/' + // environment
                        SLUG_WILDCARD_OR_EXP + '/' + // service
                        SLUG_WILDCARD_OR_EXP + '/' + // identity

                        // XXX: Is an instance always a number?
                        SLUG_OR_WILDCARD + // instance
                      '$'; // no trailing slash

var CPATH_REGEX_STR = '^/'+
                        SLUG + '/' + // org
                        SLUG + '/' + // project
                        SLUG + '/' + // environment
                        SLUG + '/' + // service
                        SLUG + '/' + // identity

                        // XXX: Is an instance always a number?
                        SLUG + // instance
                      '$'; // no trailing slash

var CPATHEXP_REGEX = new RegExp(CPATHEXP_REGEX_STR);
var CPATH_REGEX = new RegExp(CPATH_REGEX_STR);

cpath.parseExp = function (str) {
  return new CPathExp(str);
};

cpath.parse = function (str) {
  return new CPath(str);
};

cpath.validateExp = function (str) {
  return CPATHEXP_REGEX.test(str);
};

cpath.validate = function (str) {
  return CPATH_REGEX.test(str);
};

function CPathExp (str) {
  if (typeof str !== 'string') {
    throw new TypeError('cpathexp must be a string');
  }

  if (!cpath.validateExp(str)) {
    throw new CPathError('invalid cpathexp provided');
  }

  var parts = str.split('/').filter(function (part) {
    return (part.length > 0);
  });

  // XXX Think about defining properties on the object and parsing as they
  // are set to catch bugs further upstream then when toString is called.
  this.org = parts[0];
  this.project = parts[1];
  this.environment = parts[2];
  this.service = parts[3];
  this.identity = parts[4];
  this.instance = parts[5];
}
cpath.CPathExp = CPathExp;

CPathExp.prototype.toString = function () {
  var str = '/' + [
    this.org,
    this.project,
    this.environment,
    this.service,
    this.identity,
    this.instance
  ].join('/');

  if (!cpath.validateExp(str)) {
    throw new CPathError('Invalid CPathExp object properties');
  }

  return str;
};

function CPath (str) {
  if (typeof str !== 'string') {
    throw new TypeError('cpath must be a string');
  }

  if (!cpath.validate(str)) {
    throw new CPathError('invalid cpath provided');
  }

  var parts = str.split('/').filter(function (part) {
    return (part.length > 0);
  });

  // XXX Think about defining properties on the object and parsing as they
  // are set to catch bugs further upstream then when toString is called.
  this.org = parts[0];
  this.project = parts[1];
  this.environment = parts[2];
  this.service = parts[3];
  this.identity = parts[4];
  this.instance = parts[5];
}
cpath.CPath = CPath;

CPath.prototype.toString = function () {
  var str = '/' + [
    this.org,
    this.project,
    this.environment,
    this.service,
    this.identity,
    this.instance
  ].join('/');

  if (!cpath.validate(str)) {
    throw new CPathError('Invalid CPathExp object properties');
  }

  return str;
};

function CPathError (message, code) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || 'CPathError';
  this.code = code || 'invalid_path';
}
util.inherits(CPathError, Error);

cpath.CPathError = CPathError;
