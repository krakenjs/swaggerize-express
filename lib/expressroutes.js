'use strict';

var async = require('async'),
    path = require('path'),
    thing = require('core-util-is'),
    utils = require('swaggerize-routes/lib/utils');


/**
 * Makes default accessor functions for a specific data location, e.g. query, params etc
 * @param dataLoc
 * @returns {{get: get, set: set}}
 */
function defaultAccessor(dataLoc) {
    return {
        get: function(req, key) {
            return req[dataLoc][key];
        },
        set: function(req, key, val) {
            req[dataLoc][key] = val;
        }
    };
}

function valueAccessor(param, consumes) {
    if (param.in === 'path') {
        return defaultAccessor('params');
    }
    if (param.in === 'query') {
        return defaultAccessor('query');
    }
    if (param.in === 'header') {
        return {
            get: function(req, key) {
                return req.header(key);
            },
            set: function(req, key) {
              // noop
            }
        };
    }
    if (param.in === 'body') {
        return {
            get: function(req) {
                return req.body;
            },
            set: function(req, key, val) {
                req.body = val;
            }
        };
    }
    if (param.in === 'formData') {
        return {
            get: function(req, key) {
                return req.body[key];
            },
            set: function(req, key, val) {
                req.body[key] = param.type === 'file' ? val.value : val;
            }
        };
    }
}


/**
 * Makes a validator function, to validate data input per the Swagger API spec.
 * @param {{}} validator
 * @returns {function}
 */
function makeValidator(validator, consumes) {
    var parameter, validate;

    parameter = validator.parameter;
    validate = validator.validate;

    function validateInput(req, res, next) {
        var accessor, value;

        accessor = valueAccessor(parameter, consumes);
        value = accessor.get(req, parameter.name);

        validate(value, function (error, newvalue) {
            if (error) {
                error.status = 400;
                next(error);
                return;
            }

            accessor.set(req, parameter.name, newvalue);
            next();
        });
    }

    return validateInput;
}


/**
 * Creates a new Express route and adds it to the router.
 * @param router
 * @param mountpath
 * @param routeSpec
 */
function makeExpressRoute(router, mountpath, route) {
    var path, args, before, validators;

    path = route.path.replace(/{([^}]+)}/g, ':$1');
    args = [mountpath + utils.prefix(path, '/')];
    before = [];

    if (route.security) {
        before.push(authorizeFor(route.security));
    }

    validators = [];

    for (var i = 0; i < route.validators.length; ++i) {
        validators.push(makeValidator(route.validators[i], route.consumes));
    }

    before = before.concat(validators);

    if (thing.isArray(route.handler)) {
        if (route.handler.length > 1) {
            Array.prototype.push.apply(before, route.handler.slice(0, route.handler.length - 1));
        }
        route.handler = route.handler[route.handler.length - 1];
    }

    Array.prototype.push.apply(args, before);
    args.push(route.handler);
    router[route.method].apply(router, args);
}


/**
 * Routes handlers to express router.
 * @param router
 * @param mountpath
 * @param options
 */
function expressroutes(router, options) {
    var routes, mountpath;

    routes = options.routes || [];
    options.docspath = utils.prefix(options.docspath || '/api-docs', '/');
    options.api.basePath = utils.prefix(options.api.basePath || '/', '/');
    mountpath = utils.unsuffix(options.api.basePath, '/');

    router.get(mountpath + options.docspath, function (req, res) {
        res.json(options.api);
    });

    routes.forEach(function(route) {
        makeExpressRoute(router, mountpath, route);
    });
}


function authorizeFor(security) {

    return function authorize(req, res, next) {
        var errors = [];

        function passed(type, pass) {
            if (thing.isFunction(security[type].authorize)) {
                req.requiredScopes = security[type].scopes;

                security[type].authorize(req, res, function (error) {
                    if (error) {
                        errors.push(error);
                        pass(false);
                        return;
                    }
                    pass(true);
                });

                return;
            }

            res.statusCode = 401;
            errors.push(new Error('Unauthorized.'));
            pass(false);
        }

        function done(success) {
            if (!success) {
                next(errors.shift());
                return;
            }
            next();
        }

        async.some(Object.keys(security), passed, done);
    };
}

module.exports = expressroutes;
