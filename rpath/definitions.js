'use strict';

var definitions = module.exports;

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
