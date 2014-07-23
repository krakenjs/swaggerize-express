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
        var route, path, models;

        path = utils.convertPath(def.path);

        route = {
            name: undefined,
            path: path,
            method: undefined,
            validators: {
                input: [],
                output: []
            },
            handler: undefined
        };

        models = options.api.models;

        def.operations.forEach(function (operation) {
            var pathnames, split, model;

            route.method = operation.method.toLowerCase();

            model = models[operation.type] || operation.type;

            if (model) {
                route.validators.output.push(validation.output(model));
            }

            operation.parameters.forEach(function (parameter) {
                var model = models[parameter.type] || parameter.type;

                route.name = operation.nickname;

                route.validators.input.push(validation.input(parameter, model));
            });

            split = route.path.split('/');

            pathnames = [];

            //Figure out the names from the params.
            split.forEach(function (element) {
                if (element && element.indexOf(':') < 0) {
                    pathnames.push(element);
                }
            });

            route.handler = matchpath(operation.method.toLowerCase(), pathnames, handlers[pathnames[0]]);
        });

        routes.push(route);
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
