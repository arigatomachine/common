'use strict';

var _ = require('lodash');
var normalize = require('../cpath/normalize');
var definitions = require('./definitions');
var OR_EXP = require('../cpath/definitions').OR_EXP_REGEX;
var SLUG_OR_WILDCARD = require('../cpath/definitions').SLUG_OR_WILDCARD_REGEX;
var RESOURCES = definitions.RESOURCES;
var OR_ELIGIBLE = definitions.OR_ELIGIBLE;
var VAR_REGEX = definitions.VAR_REGEX;
var RESOURCE_REGEX = definitions.RESOURCE_REGEX;
var PARTIAL_RESOURCE_REGEX = definitions.PARTIAL_RESOURCE_REGEX;

var rpath = exports;

rpath.definitions = definitions;

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

rpath.isVariable = function (thing) {
  return VAR_REGEX.test(thing);
};

rpath.replaceVariable = function (resource, context) {
  if (!_.isString(resource)) {
    throw new Error('replaceVariable expected a string');
  }

  if (!_.isPlainObject(context)) {
    throw new Error('replaceVariable expected a plain object');
  }

  return resource.replace(VAR_REGEX, function (match, p1, p2) {
    var newResource = context[p2];

    if (!newResource) {
      throw new Error('Context does not contain a valid replacement');
    }

    return newResource;
  });
};

/**
 * validate cpath + secret
 *
 * @param {string} cpath
 * @param {string} secret - secret resource key
 */
rpath.validate = function (path, secret) {
  // Is this a *special* resource path? teams:*
  if (PARTIAL_RESOURCE_REGEX.test(path)) {
    return true;
  }

  // replace ${username} w. username
  var cleanPath = path.replace(VAR_REGEX, function (match, p1, p2) {
    return p2;
  });

  if (!RESOURCE_REGEX.test(cleanPath)) {
    return new Error('Invalid path provided');
  }

  if (secret && !SLUG_OR_WILDCARD.test(secret)) {
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

  if (validOrError instanceof Error) {
    throw validOrError;
  }

  var normalizedPath = normalize.path(path.split('/'));
  var splitPath = _.takeRight(normalizedPath, 5);
  var resourceMap = _.zipObject(RESOURCES, splitPath);

  resourceMap.secret = secret;

  return resourceMap;
};
