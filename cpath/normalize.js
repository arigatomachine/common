/**
 * CPathExp Normalizer
 *
 * Normalizes a CPathExp and properly orders all components so CPathExp can be
 * string compared.
 *
 * Returns an array of normalized parts
 */
'use strict';

var normalize = exports;

var cpath = require('./index');

function OR_PART (part) {
  var content = part.slice(1,part.length - 1); // Remove start and end [ ]
  var sections = content.split('|').sort();

  return '[' + sections.join('|') + ']';
}

normalize.path = function (parts) {
  var part;
  var output = [];

  for (var i = 0; i < parts.length; ++i) {
    part = parts[i];

    if (cpath.OR_EXP_REGEX.test(part)) {
      output.push(OR_PART(part));
      continue;
    }

    // Ordering only matters for the sections of an OR expression since we only
    // allow * to be at the end of a slug.
    output.push(part);
  }

  return output;
};
