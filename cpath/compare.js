'use strict';

/**
 * Implements a definitionsExp compareFunction for use in Array#sort. For use in
 * specificity checking.
 *
 * definitionsExp specificity is important in deciding which values we pull
 * from the hierarchy and provide to the user.
 *
 * Token Specificity Rules:
 *
 *  SLUG = 1
 *  SLUG_WILDCARD = 2
 *  OR_EXP = 3
 *  WILDCARD = 4
 *
 * Token Type[A] > Token Type[B] Return 1
 * Token Type[A] === Token Type[B] Return 0
 * Token Type[A] < Token Type[B] Return -1
 *
 * If the token types match, we continue iterating. Otherwise, we return the
 * value immediately.
 *
 * @param {String} a
 * @param {String} b
 * @return {Number}
 */

var cpath = require('./index');
var definitions = require('./definitions');

var PART_TYPE_SCORE = {
  'SLUG': 4,
  'SLUG_WILDCARD': 3,
  'OR': 2,
  'WILDCARD': 1
};

module.exports = function (a, b) {
  a = (a instanceof cpath.CPathExp) ? a : new cpath.CPathExp(a);
  b = (b instanceof cpath.CPathExp) ? b : new cpath.CPathExp(b);

  var typeA;
  var typeB;
  var scoreA;
  var scoreB;

  for (var i = 0; i < a.parts.length; ++i) {
    typeA = definitions.getPartType(a.parts[i]);
    typeB = definitions.getPartType(b.parts[i]);

    scoreA = PART_TYPE_SCORE[typeA];
    scoreB = PART_TYPE_SCORE[typeB];

    if (!scoreA || !scoreB) {
      throw new Error('Unknown score type: ' + typeA + ' or ' + typeB);
    }

    if (scoreA === scoreB) {
      continue;
    }

    if (scoreA > scoreB) {
      return 1;
    }

    if (scoreA < scoreB) {
      return -1;
    }
  }

  return 0;
};
