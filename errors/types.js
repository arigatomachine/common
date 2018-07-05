'use strict';

var errorTypes = exports;

var util = require('util');

errorTypes.NotFound = function NotFound(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.statusCode = 404;
  this.type = 'not_found';
};
util.inherits(errorTypes.NotFound, Error);

errorTypes.InternalServer = function InternalServer(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || 'unknown server error';
  this.statusCode = 500;
  this.type = 'internal_server';
};
util.inherits(errorTypes.InternalServer, Error);

errorTypes.BadRequest = function BadRequest(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.type = 'bad_request';
  this.statusCode = 400;
};
util.inherits(errorTypes.BadRequest, Error);

errorTypes.Unauthorized = function Unauthorized(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.statusCode = 401;
  this.type = 'unauthorized';
};
util.inherits(errorTypes.Unauthorized, Error);

errorTypes.Forbidden = function Forbidden(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.statusCode = 403;
  this.type = 'forbidden';
};
util.inherits(errorTypes.Unauthorized, Error);

errorTypes.Usage = function Usage(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || 'Usage Error';
  this.type = 'usage';
};
util.inherits(errorTypes.Usage, Error);

errorTypes.Validation = function Validation(message, code) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || 'Validation Error';
  this.code = code || 'client_validation_error';
  this.type = 'validation';
};
util.inherits(errorTypes.Validation, Error);
