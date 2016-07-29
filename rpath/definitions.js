'use strict';

var definitions = module.exports;

var SLUG = '[a-z0-9][a-z0-9\\-\\_]{0,63}';
var WILDCARD = '[\\*]';

// We only support `text*` and `*` for wildcarding in a slug
var SLUG_WILDCARD = SLUG + WILDCARD + '?';
var SLUG_OR_WILDCARD = '(?:' + SLUG_WILDCARD + '|' + WILDCARD + ')';

var OR_EXP = '\\[(?:(' + SLUG_WILDCARD + ')\\|)*(' + SLUG_WILDCARD + ')\\]';
var SLUG_WILDCARD_OR_EXP = '(?:' + SLUG_OR_WILDCARD + '|' + OR_EXP + ')';

var ACL_RESOURCE_REGEX_STR = new RegExp('^/' +
    '(' + SLUG + '/?){1}' + // org
    '(' + SLUG_WILDCARD_OR_EXP + '/){0,1}' + // project (no wildcard) or team (wildcard)
    '(' + SLUG_WILDCARD_OR_EXP + '/){0,1}' + // environment
    '(' + SLUG_WILDCARD_OR_EXP + '/){0,1}' + // service
    '(' + SLUG_WILDCARD_OR_EXP + '/){0,1}' + // identity
    '(' + SLUG_OR_WILDCARD + '){0,1}' + // instance
  '$'); // no trailing slash

var VAR = '(\\${)(' + SLUG + ')(\\})';

definitions.VAR_REGEX = new RegExp(VAR, 'g');

var PROJECT = 'project';
var ENVIRONMENT = 'environment';
var SERVICE = 'service';
var IDENTITY = 'identity';
var INSTANCE = 'instance';
var SECRET = 'secret';

var RESOURCES = [PROJECT, ENVIRONMENT, SERVICE, IDENTITY, INSTANCE, SECRET];

var OR_ELIGIBLE = {};

OR_ELIGIBLE[PROJECT] = true;
OR_ELIGIBLE[ENVIRONMENT] = true;
OR_ELIGIBLE[SERVICE] = true;
OR_ELIGIBLE[INSTANCE] = true;

definitions.PROJECT = PROJECT;
definitions.ENVIRONMENT = ENVIRONMENT;
definitions.SERVICE = SERVICE;
definitions.IDENTITY = IDENTITY;
definitions.INSTANCE = INSTANCE;
definitions.SECRET = SECRET;

definitions.RESOURCES = RESOURCES;

definitions.OR_ELIGIBLE = OR_ELIGIBLE;
