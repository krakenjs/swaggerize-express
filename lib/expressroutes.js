'use strict';

var path = require('path'),
    utils = require('swaggerize-routes/lib/utils'),
    thing = require('core-util-is'),
    async = require('async');

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

    routes.forEach(function (route) {
        var args, path, before;

        path = route.path.replace(/{([^}]+)}/g, ':$1');
        args = [mountpath + utils.prefix(path, '/')];
        before = [];

        if (route.security) {
            before.push(authorizeFor(route.security));
        }

        route.validators.forEach(function (validator) {
            var parameter, validate;

            parameter = validator.parameter;
            validate = validator.validate;

            before.push(function validateInput(req, res, next) {
                var value, isPath, isBody;

                switch (parameter.in) {
                    case 'path':
                    case 'query':
                        isPath = true;
                        value = req.params[parameter.name];
                        break;
                    case 'header':
                        value = req.get(parameter.name);
                        break;
                    case 'body':
                    case 'formData':
                        isBody = true;
                        value = req.body;
                }

                validate(value, function (error, newvalue) {
                    if (error) {
                        res.statusCode = 400;
                        next(error);
                        return;
                    }

                    if (isPath) {
                        req.params[parameter.name] = newvalue;
                    }

                    if (isBody) {
                        req.body = newvalue;
                    }

                    next();
                });
            });
        });

        if (thing.isArray(route.handler)) {
            if (route.handler.length > 1) {
                Array.prototype.push.apply(before, route.handler.slice(0, route.handler.length - 1));
            }
            route.handler = route.handler[route.handler.length - 1];
        }

        Array.prototype.push.apply(args, before);
        args.push(route.handler);
        router[route.method].apply(router, args);
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
