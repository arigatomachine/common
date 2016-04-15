'use strict';

var errors = exports;

var _ = require('lodash');

var types = require('./types');
_.extend(errors, types);

/**
 * Catch and reject with database error
 *
 * @param {function} reject
 */
errors.reject = function(reject) {
  var error;
  return function(err) {
    if (err && err.code === '23505') {
      error = new errors.BadRequest('resource exists');
      error.original = err;
      return reject(error);
    }
    if (err && err.code === '22P02') {
      error = new errors.BadRequest('improperly formatted params');
      error.original = err;
      return reject(error);
    }
    if (!err || !err.type) {
      error = new errors.InternalServer('server error');
      error.original = err;
      return reject(error);
    }

    reject(err);
  };
};
