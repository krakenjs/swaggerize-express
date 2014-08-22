'use strict';

var thing = require('core-util-is'),
    schema = require('./schema'),
    utils = require('./utils');

/**
 * Creates validation middleware for a parameter.
 * @param parameter
 * @param model
 * @returns {validateInput}
 */
function inputValidator(parameter, model) {
    var coerce, validate, isPath;

    validate = model && map(model);

    isPath = parameter.paramType === 'path' || parameter.paramType === 'query';

    if (parameter.type !== 'string') {
        coerce = coercion(model);
    }

    return function validateInput(req, res, next) {
        var value = isPath ? req.param(parameter.name) : req.body;

        if (!value && parameter.required) {
            utils.debuglog('required parameter \'%s\' missing.', parameter.name);
            res.statusCode = 400;
            next(new Error('required parameter \'' + parameter.name + '\' missing.'));
            return;
        }

        if (validate) {
            coerce && (value = coerce(value));
            isPath && (req.params[parameter.name] = value);

            if (!value && !parameter.required) {
                next();
                return;
            }

            validate(value, function (error) {
                if (error) {
                    utils.debuglog('error validating model schema \'%s\' for \'%s\'.', model, parameter.name);
                    res.statusCode = 400;
                    next(new Error(error.message));
                    return;
                }

                next();
            });

            return;
        }

        next();
    };
}

/**
 * Create an output validator for the given model.
 * @param model
 * @returns {Function}
 */
function outputValidator(model) {
    var coerce, validate;

    validate = model && map(model);
    coerce = validate && coercion(model);

    return function validateOutput(data, callback) {
        var value;

        if (validate) {
            value = data && coerce ? coerce(data) : data;

            validate(value, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null);
            });
        }
    };
}

/**
 * Maps a type to a schema.
 * @param type
 * @returns {validate}
 */
function map(model) {
    if (thing.isString(model)) {
        model = {
            type: model
        };
    }

    return function validate(data, callback) {
        var value, result, error;

        value = !thing.isObject(data) && model.id ? {} : data || def(model.type);

        result = schema.validate(value, model);
        result.valid || (error = result.error);

        callback(error);
    };
}

/**
 * Default value for a null value of type.
 * @param type
 * @returns {*}
 */
function def(type) {
    if (!type) {
        return undefined;
    }

    switch (type) {
        case 'integer':
        case 'float':
        case 'long':
        case 'double':
        case 'byte':
            return 0;
        case 'string':
            return String();
        case 'boolean':
            return false;
        default:
            return undefined;
    }
}

/**
 * Returns a function that coerces a type.
 * Coercion of doubles and longs are not supported in Javascript and strings should be used instead for 64bit numbers.
 * @param type
 */
function coercion(type) {
    var fn;

    switch (type) {
        case 'integer':
        case 'float':
        case 'long':
        case 'double':
            fn = function (data) {
                if (isNaN(data)) {
                    return data;
                }
                return Number(data);
            };
            break;
        case 'string':
            fn = String;
            break;
        case 'byte':
            fn = function (data) {
                return isNaN(data) ? new Buffer(data)[0] : Number(data);
            };
            break;
        case 'boolean':
            fn = Boolean;
            break;
        case 'date':
        case 'dateTime':
            fn = Date.parse;
            break;
    }

    return fn;
}

module.exports.input = inputValidator;
module.exports.output = outputValidator;
