'use strict';

var utils = require('./utils'),
    validation = require('./validation'),
    readhandlers = require('./readhandlers');

/**
 * Convert definition of api to something we can work with.
 * @param options
 * @returns {Array}
 */
function buildroutes(options) {
    var routes, handlers;

    handlers = readhandlers(options.handlers);

    routes = [];

    options.api.apis.forEach(function (def) {
        var path, models;

        path = def.path;

        models = options.api.models;

        def.operations.forEach(function (operation) {
            var route, pathnames, model;

            route = {
                name: operation.nickname,
                path: utils.convertPath(path),
                method: undefined,
                validators: [],
                handler: undefined
            };

            route.method = operation.method.toLowerCase();

            model = models && models[operation.type] || operation.type;

            operation.parameters && operation.parameters.forEach(function (parameter) {
                var model = models && models[parameter.type] || parameter.type;

                route.validators.push(validation.input(parameter, model));
            });

            pathnames = [];

            //Figure out the names from the params.
            path.split('/').forEach(function (element) {
                if (element) {
                    pathnames.push(element);
                }
            });

            route.handler = matchpath('$' + operation.method.toLowerCase(), pathnames, handlers[pathnames[0]]);

            routes.push(route);
        });
    });

    return routes;
}

/**
 * Match a route handler to a given path name set.
 * @param method
 * @param pathnames
 * @param handlers
 * @returns {*}
 */
function matchpath(method, pathnames, handlers) {
    if (!handlers) {
        return null;
    }
    if (pathnames.length > 1) {
        pathnames.shift();
        return matchpath(method, pathnames, handlers[pathnames[0]]);
    }

    return handlers[pathnames[0]] ? handlers[pathnames[0]] : handlers[method];
}

module.exports = buildroutes;
