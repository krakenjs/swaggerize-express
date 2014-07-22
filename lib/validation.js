'use strict';

var thing = require('core-util-is'),
    schema = require('./schema'),
    utils = require('./utils');

/**
 * Creates validation middleware for a parameter.
 * @param parameter
 * @returns {checkParameter}
 */
function inputValidator(parameter, model) {
    var coerce, validateModel;

    validateModel = model && map(model);

    if (parameter.paramType === 'path' || parameter.paramType === 'query' && parameter.type !== 'string') {
        coerce = coercion(model);
    }

    return function checkParameter(req, res, next) {
        var param = req.param(parameter.name);

        if (!param && parameter.required) {
            utils.debuglog('required parameter \'%s\' missing.', parameter.name);
            res.statusCode = 400;
            next(new Error('Required parameter \'' + parameter.name + '\' missing.'));
            return;
        }

        if (validateModel) {
            coerce && (param = coerce(param));

            validateModel(param, function (error) {
                if (error) {
                    utils.debuglog('error validating model schema \'%s\' for \'%s\'.', model, parameter.name);
                    res.statusCode = 400;
                    next(new Error(error.message));
                    return;
                }
                req.params[parameter.name] = param;
            });
        }

        next();
    };
}

/**
 * Maps a type to a schema.
 * @param type
 * @returns {validateModel}
 */
function map(type) {
    if (!thing.isObject(type)) {
        type = {
            "type": type
        };
    }

    return function validateModel(model, cb) {
        var result = schema.validateModel(model, type);
        cb(result.valid ? null : result.error);
    };
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
            fn = Number;
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
