'use strict';

var thing = require('core-util-is'),
    schema = require('./schema'),
    utils = require('./utils');

/**
 * Creates validation middleware for a parameter.
 * @param parameter
 * @returns {checkParameter}
 */
function validator(parameter, model) {
    var validateModel = model && map(model);

    return function checkParameter(req, res, next) {
        var param = req.param(parameter.name);

        if (!param && parameter.required) {
            utils.debuglog('required parameter \'%s\' missing.', parameter.name);
            res.statusCode = 400;
            next(new Error('Required parameter \'' + parameter.name + '\' missing.'));
            return;
        }

        if (validateModel) {
            validateModel(param, function (error) {
                if (error) {
                    utils.debuglog('error validating model schema \'%s\' for \'%s\'.', model, parameter.name);
                    res.statusCode = 400;
                    next(error);
                    return;
                }
            });
        }

        next();
    };
}

function map(type) {

    if (thing.isObject(type)) {
        return function validateModel(model, cb) {
            var result = schema.validateModel(model, type);
            cb(result.valid ? null : result.error);
        };
    }

    //TODO:
    return function validateType(data, cb) {
        if (typeof data === type) {
            cb(null);
            return;
        }
        cb(new Error('Parameter type if wrong. Expected ' + type + '.'));
    };
}

module.exports = validator;