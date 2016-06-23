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

var WILDCARD_REGEX = definitions.WILDCARD_REGEX =
  new RegExp('^' + WILDCARD + '$');
var SLUG_REGEX = definitions.SLUG_REGEX =
  new RegExp('^' + SLUG + '$');
var SLUG_WILDCARD_REGEX = definitions.SLUG_WILDCARD_REGEX = 
  new RegExp('^' + SLUG_WILDCARD + '$');
var OR_EXP_REGEX = definitions.OR_EXP_REGEX =
  new RegExp('^' + OR_EXP + '$');
var SLUG_OR_WILDCARD_REGEX = definitions.SLUG_OR_WILDCARD_REGEX = 
  new RegExp('^' + SLUG_OR_WILDCARD + '$');
var CPATHEXP_REGEX = definitions.CPATHEXP_REGEX =
  new RegExp(CPATHEXP_REGEX_STR);
var CPATH_REGEX = definitions.CPATH_REGEX =
  new RegExp(CPATH_REGEX_STR);

