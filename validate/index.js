'use strict';

var tv4 = require('tv4');
var _ = require('lodash');
var path = require('path');
var validator = require('validator');
var recursiveReadSync = require('recursive-readdir-sync');

var formats = require('./formats');
var errors = require('../errors');

class Validate {
  constructor(schemaDir) {
    this.schemaDir = schemaDir;
    this.schemas = {};
    this.tv4 = tv4.freshApi();
    this.tv4.addFormat(formats);
    this.readSchemas();
  }

  /**
   * Add all schemas found in directory
   */
  readSchemas() {
    var self = this;

    var files = [];
    try {
      files = recursiveReadSync(self.schemaDir);
    } catch(e) {
    }

    // Only use .json files
    files = _.filter(files, function(file) {
      return path.extname(file) === '.json';
    });

    // Add all schema files and cache them
    files.forEach(function(schema) {
      var raw = self._requireSchema(schema);
      self.tv4.addSchema(raw);
    });
  }

  /**
   * Validate props based on schema path
   *
   * @param {string} schemaPath - Path to schema file
   * @param {object} props - Data to validate
   */
  schema(schemaPath, props) {
    return new Promise((resolve, reject) => {
      schemaPath = path.join(this.schemaDir, `${schemaPath}.json`);
      schemaPath = path.resolve(schemaPath);

      var schema = this._requireSchema(schemaPath);
      if (!schema) {
        return reject(new Error('invalid schema'));
      }

      var result = this.tv4.validateMultiple(props, schema);
      if (result.missing && result.missing.length > 0) {
        var nonEmpty = _.filter(result.missing, missing => !!missing.length);
        if (nonEmpty.length === 0) {
          return reject(new Error('invalid $refs, missing schemas'));
        }
        var missing = result.missing.join(',');
        return reject(new Error('missing schemas: ' + missing));
      }
      if (result.valid) {
        return resolve(props);
      }

      var message = Validate.extractErrors(result.errors);
      reject(new errors.BadRequest(message));
    });
  }

  /**
   * Read properties of a schema
   *
   * @param {string} schemaPath - Path to schema file
   * @param {string} name - Schema to grab properties from
   */
  readProperties(schemaPath) {
    schemaPath = path.join(this.schemaDir, `${schemaPath}.json`);
    var schema = this._requireSchema(schemaPath);
    return Object.keys(schema.properties);
  }

  /**
   * Read schema file
   *
   * @param {string} schemaPath
   */
  _requireSchema(schemaPath) {
    if (this.schemas[schemaPath]) {
      return this.schemas[schemaPath];
    }

    var self = this;
    try {
      self.schemas[schemaPath] = require(schemaPath);
    } catch(ignoreErr) {
      console.warn('could not read schema', ignoreErr);
    }
    return this.schemas[schemaPath];
  }

  /**
   * Identify validation errors
   *
   * @param {object} errs - TV4 errors object
   * @param {boolean} stopRecurse
   */
  static extractErrors(errs, stopRecurse) {
    var messages = [];
    var hasErrors = false;

    var extra = Validate.findPropsWithError(errs, 303);
    if (extra.length) {
      hasErrors = true;
      messages.push('extraneous properties: ' + extra.join(', '));
    }

    var missing = Validate.findPropsWithError(errs, 302);
    if (missing.length) {
      hasErrors = true;
      messages.push('missing properties: ' + missing.join(', '));
    }

    var invalid = Validate.findPropsWithError(errs, [0, 500, 202]);
    if (invalid.length) {
      hasErrors = true;
      messages.push('invalid property values: ' + invalid.join(', '));
    }

    var tooShort = Validate.findPropsWithError(errs, 200);
    if (tooShort.length) {
      hasErrors = true;
      messages.push('property too short: ' + tooShort.join(', '));
    }

    var tooLong = Validate.findPropsWithError(errs, 201);
    if (tooLong.length) {
      hasErrors = true;
      messages.push('property too long: ' + tooLong.join(', '));
    }

    var missingOne = Validate.findPropsWithError(errs, [10, 11, 12]);
    if (missingOne.length) {
      hasErrors = true;
      messages.push('missing object');
    }

    var badEnum = Validate.findPropsWithError(errs, [1]);
    if (badEnum.length) {
      hasErrors = true;
      messages.push('invalid property values: ' + badEnum.join(', '));
    }

    var subErrors = _.filter(_.map(errs, err => err.subErrors), obj => obj);
    if (errs && !hasErrors && !subErrors) {
      messages.push('unknown validation error');
    }
    if (subErrors && !stopRecurse) {
      messages = messages.concat(Validate.extractErrors(subErrors, true));
    }

    return messages;
  }

  /**
   * Identify specific keys failing due to a particular tv4 error code
   *
   * @param {object} result - TV4 errors object
   * @param {array|integer} code - Error code(s)
   */
  static findPropsWithError(result, code) {
    code = _.isArray(code)? code : [code];
    var errs = _.filter(result, function(err) {
      var hasKey = err.params && err.params.key;
      var path = err.dataPath && err.dataPath.substr(1);
      var invalidPath = !hasKey && path && path.length < 2;
      return code.indexOf(err.code) > -1 && !invalidPath;
    });

    return _.map(errs, function(obj) {
      var dataPath = obj.dataPath.substr(1).replace(/\//g, '.');
      var keys = dataPath.split('.');
      var lastKey = keys[keys.length - 1];

      var propertyPath = [];
      if (dataPath.length) {
        propertyPath.push(dataPath);
      }

      var key = obj.params.key;
      if (key && lastKey !== key && key.length) {
        propertyPath.push(key);
      }
      return propertyPath.join('.');
    });
  }

  /**
   * Middleware for applying props to request
   */
  static middleware(schemaPath) {
    return function(req, res, next) {
      var input = req.method === 'GET'? req.query : req.body;
      Validate.schema(schemaPath, input).then(function(props) {
        req.props = props;
        next();
      }).catch(errors.catch(res));
    };
  }

}

module.exports = Validate;
