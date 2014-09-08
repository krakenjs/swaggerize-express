'use strict';

var path = require('path'),
    utils = require('swaggerize-builder/lib/utils'),
    thing = require('core-util-is');

/**
 * Routes handlers to express router.
 * @param router
 * @param mountpath
 * @param options
 */
function expressroutes(router, options) {
    var docspath = utils.prefix(options.docspath, '/');

    router.get(docspath, function (req, res) {
        res.json(options.meta);
    });

    options.resources.forEach(function (resource) {
        var routes, mountpath;

        mountpath = utils.prefix(resource.api.resourcePath, '/');
        routes = options.routes[mountpath];

        routes && routes.forEach(function (route) {
            var args, path, before;

            router.get(docspath + mountpath, function (req, res) {
                res.json(resource.api);
            });

            path = route.path.replace(/{([^}]+)}/g, ':$1');
            args = [mountpath + utils.prefix(path, '/')];
            before = [];

            route.validators.forEach(function (validator) {
                var parameter, validate;

                parameter = validator.parameter;
                validate = validator.validate;

                before.push(function validateInput(req, res, next) {
                    var value, isPath;

                    switch (parameter.paramType) {
                        case 'path':
                        case 'query':
                            isPath = true;
                            value = req.param(parameter.name);
                            break;
                        case 'header':
                            value = req.header(parameter.name);
                            break;
                        case 'body':
                        case 'form':
                            value = req.body;
                            if (parameter.type === 'string') {
                                //If the type is string and we found an empty object, convert to empty string.
                                //This is a bug in express's body-parser: https://github.com/expressjs/body-parser/issues/44
                                if (thing.isObject(value) && !Object.keys(value).length) {
                                    req.body = value = '';
                                    break;
                                }
                                //Coerce to a string since that's the type we expect and Express magic's it for us.
                                req.body = value = JSON.stringify(value);
                            }
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
    });
}

module.exports = expressroutes;
