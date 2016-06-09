/**
 * CPathExp Regular Expression Builder
 *
 * Given an array of CPathExp components this module returns a Regular
 * Expression object for matching against CPath strings.
 */
'use strict';

var regex = exports;

var cpath = require('./index');

function SLUG_OR_WILDCARD_PART (part) {
  var star = part.indexOf('*');
  if (star === -1) {
    return part;
  }

  var preamble = part.slice(0,star);
  var N = 64 - preamble.length;
  return preamble+'[a-z0-9\-_]{0,' + N + '}';
}


function OR_PART (part) {
  // This function assumes that PART is a valid OR_EXP_REGEX
  var sections = part.slice(1, part.length - 1); // Remove [ and ]

  // Split by the separator and then map each section as a SLUG
  var contents = sections.split('|').map(SLUG_OR_WILDCARD_PART);
  return '(?:' + contents.join('|') + ')';
}

regex.builder = function (parts) {
  var part;
  var output = [];
  for (var i = 0; i < parts.length; ++i) {
    part = parts[i];
    if (cpath.OR_EXP_REGEX.test(part)) {
      output.push(OR_PART(part));
      continue;
    }

    if (cpath.SLUG_OR_WILDCARD_REGEX.test(part)) {
      output.push(SLUG_OR_WILDCARD_PART(part));
      continue;
    }

    output.push(part);
  }

  return new RegExp('^/' + output.join('/') + '$');
};
