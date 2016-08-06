'use strict';

/**
 * Compares two CPathExp together to determine if A contains B.
 *
 * If two segments are an exact match then they are contained.
 * If segment A is a wildcard then B is contained in A.
 * If segment A is a slug wildcard then all of B must contain A
 * If segment A is an OR then the segment is split and B must match *a* segment
 * of A.
 * If segment A is an OR and segment B is an OR then all of segment B's parts
 * must be contained in A.
 *
 * @module
 * @param {CPathExp} a
 * @param {CPathExp} b
 * @return {Boolean}
 */
var cpath = require('./index');
var definitions = require('./definitions');


function match (a, b) {
  var typeA = definitions.getPartType(a);
  var typeB = definitions.getPartType(b);

  // Type Combinations:
  //  SLUG*SLUG (exact match)
  //  SLUG*SLUG_WILDCARD (false)
  //  SLUG_WILDCARD*SLUG (a match b)
  //  SLUG_WILDCARD*SLUG_WILDCARD (a contained in b)
  if (typeA === 'SLUG' && typeB === 'SLUG') {
    return (a === b);
  }
  if (typeB === 'SLUG_WILDCARD' && typeA !== 'SLUG_WILDCARD') {
    return false;
  }

  // Not possible for A to be a SLUG_WILDCARD without B being a SLUG or
  // SLUG_WILDCARD since we're dealing with component level strings now and all
  // wildcards have been ruled out.
  if (typeA === 'SLUG_WILDCARD') {
    a = a.slice(0, a.length - 1); // remove the *
  }
  if (typeB === 'SLUG_WILDCARD') {
    b = b.slice(0, b.length - 1); // remove the *
  }

  return b.indexOf(a) > -1;
}

function explode (segment) {
  return segment.slice(1,segment.length - 1).split('|').sort();
}

function segment (a, b) {
  // if its an exact match; then we don't have to do anything
  if (a === b) {
    return true;
  }

  var typeA = definitions.getPartType(a);
  var typeB = definitions.getPartType(b);

  // if a is a wildcard; then we know it matches everything
  if (typeA === 'WILDCARD') {
    return true;
  }

  // if B is a wildcard and A is not then it's not going to match since B is
  // less specific than A
  if (typeB === 'WILDCARD') {
    return false;
  }

  // It's not possible for an OR to have a wildcard in it; so we don't have to
  // worry about it at all!
  var aComponents = (typeA === 'OR') ? explode(a) : [a];
  var bComponents = (typeB === 'OR') ? explode(b) : [b];

  // All components of B must match one component of A.
  var matched;
  for (var i = 0; i < bComponents.length; i++) {
    matched = false;
    for (var j = 0; j < aComponents.length; j++) {
      matched = match(aComponents[j], bComponents[i]);
      if (matched) {
        break;
      }
    }

    if (!matched) {
      return false;
    }
  }

  return true;
}

module.exports = function (a, b) {
  a = (a instanceof cpath.CPathExp) ? a : new cpath.CPathExp(a);
  b = (b instanceof cpath.CPathExp) ? b : new cpath.CPathExp(b);

  for (var i = 0; i < a.parts.length; ++i) {
    if (!segment(a.parts[i], b.parts[i])) {
      return false;
    }
  }

  return true;
};
