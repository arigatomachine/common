'use strict';

var definitions = module.exports;

var SLUG = '[a-z0-9][a-z0-9\\-\\_]{0,63}';
var WILDCARD = '[\\*]';

// We only support `text*` and `*` for wildcarding in a slug
var SLUG_WILDCARD = SLUG + WILDCARD + '?';
var SLUG_OR_WILDCARD = '(?:' + SLUG_WILDCARD + '|' + WILDCARD + ')';

var OR_EXP = '\\[(?:(' + SLUG_WILDCARD + ')\\|)*(' + SLUG_WILDCARD + ')\\]';
var SLUG_WILDCARD_OR_EXP = '(?:' + SLUG_OR_WILDCARD + '|' + OR_EXP + ')';
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

definitions.WILDCARD_REGEX = new RegExp('^' + WILDCARD + '$');
definitions.SLUG_REGEX = new RegExp('^' + SLUG + '$');
definitions.SLUG_WILDCARD_REGEX =  new RegExp('^' + SLUG_WILDCARD + '$');
definitions.OR_EXP_REGEX = new RegExp('^' + OR_EXP + '$');
definitions.SLUG_OR_WILDCARD_REGEX =  new RegExp('^' + SLUG_OR_WILDCARD + '$');
definitions.SLUG_WILDCARD_OR_EXP_REGEX = new RegExp(
  '^' + SLUG_WILDCARD_OR_EXP + '$');
definitions.CPATHEXP_REGEX = new RegExp(CPATHEXP_REGEX_STR);
definitions.CPATH_REGEX = new RegExp(CPATH_REGEX_STR);

var PART_TYPE_REGEX_MAP = definitions.PART_TYPE_REGEX_MAP = {
  'SLUG': definitions.SLUG_REGEX,
  'SLUG_WILDCARD': definitions.SLUG_WILDCARD_REGEX,
  'OR': definitions.OR_EXP_REGEX,
  'WILDCARD': definitions.WILDCARD_REGEX
};
var PART_TYPES = Object.keys(PART_TYPE_REGEX_MAP);

definitions.getPartType = function (part) {
  var type;
  for (var i = 0; i < PART_TYPES.length; ++i) {
    type = PART_TYPES[i];
    if (PART_TYPE_REGEX_MAP[type].test(part)) {
      return type;
    }
  }

  throw new Error('Part did not match a PART_TYPE: ' + part);
};
