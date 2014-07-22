'use strict';

var utils = require('./utils'),
    validation = require('./validation');

/**
 * Convert definition of api to something we can work with.
 * @param def
 * @returns {{path: *, description: *, operations: Array}}
 */
function buildroutes(def, options) {
    var route, models;

    route = {
        name: undefined,
        path: utils.convertPath(def.path),
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

        model = options.api.models[operation.type] || operation.type;

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

        route.handler = matchpath(operation.method.toLowerCase(), pathnames, options.handlers[pathnames[0]]);
    });

    return route;
}

/**
 * Match a route handler to a given path name set.
 * @param method
 * @param pathnames
 * @param tree
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
