'use strict';

var _ = require('lodash');
var cpath = require('../cpath');

var RESOURCES = require('./definitions').RESOURCES;
var OR_ELIGIBLE = require('./definitions').OR_ELIGIBLE;
var OR_EXP = require('../cpath/definitions').OR_EXP_REGEX;
var SLUG_OR_WILDCARD = require('../cpath/definitions').SLUG_OR_WILDCARD_REGEX;

var rpath = exports;

/**
 * Recursively builds a list of resource permutations
 *
 * @param {object} map - Resource map
 * @param {boolean} explode - If true, will include the path to each resource
 * @returns {array} resourcePerms - Every permutation of the given resource path
 */
rpath.expand = function (map, explode) {
  explode = explode || false;

  var resourcePerms = []; // Container for resource permutations
  var path = []; // Current position in resource path
  var segments = _.clone(RESOURCES);

  expandResource(segments, path, map);

  function expandResource(s, p, m) {
    // Finish once path includes every segment/resource-type
    if (s.length === 0) {
      return;
    }

    var resource = _.take(s)[0]; // Current resource
    var value = m[resource];

    // Segment might include an OR expression ([a|b])
    if (OR_ELIGIBLE[resource] && OR_EXP.test(value)) {
      var values = _.chain(value)
        .trimStart('[')
        .trimEnd(']')
        .split('|')
        .value();

      // Fork, for each indepdent resource ([a])
      _.each(values, function (v) {
        var newSeg = _.clone(s);
        var newPath = _.clone(p);
        var newMap = _.clone(m);

        newMap[resource] = v;
        expandResource(newSeg, newPath, newMap);
      });
      return;
    }

    // Complete this segment of the resource path
    p.push(value);

    // Record partial path permutation
    if (explode) {
      resourcePerms.push('/' + p.join('/'));
    }

    // Record path permutation
    if (!explode && p.length === 6) {
      resourcePerms.push('/' + p.join('/'));
    }

    // Move to next Segment
    expandResource(_.slice(s, 1), p, m);
  }

  return resourcePerms;
};

/**
 * Recursively builds a list of resource permutations, including partials
 *
 * @param {object} map - Resource map
 * @returns {array} resourcePerms - Every permutation of the given resource path
 */
rpath.explode = function (map) {
  return rpath.expand(map, true);
};

/**
 * validate cpath + secret
 *
 * @param {string} cpath
 * @param {string} secret - secret resource key
 */
rpath.validate = function (path, secret) {
  if (!cpath.validateExp(path)) {
    return new Error('Invalid path provided');
  }

  if (!SLUG_OR_WILDCARD.test(secret)) {
    return new Error('Invalid secret provided');
  }

  return true;
};

/**
 * Create a resource map from a cpath and secret;
 *
 * @param {string} cpath
 * @param {string} secret - secret resource key
 */
rpath.parse = function (path, secret) {
  var validOrError = rpath.validate(path, secret);

  if (!validOrError) {
    throw validOrError;
  }

  var cpathObj = cpath.parseExp(path);
  var resourceMap = _.pick(cpathObj, RESOURCES);

  resourceMap.secret = secret;

  return resourceMap;
};
