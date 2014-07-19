'use strict';

var utils = require('./utils'),
    validator = require('./validator');

/**
 * Convert definition of api to something we can work with.
 * @param def
 * @returns {{path: *, description: *, operations: Array}}
 */
function build(def, options) {
    var route, models;

    route = {
        name: undefined,
        path: utils.convertPath(def.path),
        method: undefined,
        validators: [],
        handler: undefined
    };

    models = options.api.models;

    def.operations.forEach(function (operation) {
        var pathnames, split;

        route.method = operation.method.toLowerCase();

        operation.parameters.forEach(function (parameter) {
            var model = models[parameter.type] || parameter.type;

            route.name = operation.nickname;

            if (parameter.paramType === 'path') {
                route.path = route.path.replace(':' + parameter.name, ':' + parameter.name + '?');
            }
            route.validators.push(validator(parameter, model));
        });

        split = route.path.split('/');

        pathnames = [];

        //Figure out the names from the params.
        split.forEach(function (element) {
            if (element && element.indexOf(':') < 0) {
                pathnames.push(element);
            }
        });

        route.handler = match(operation.method.toLowerCase(), pathnames, options.handlers[pathnames[0]]);
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
function match(method, pathnames, handlers) {
    var subpath;

    if (!handlers) {
        return null;
    }
    if (pathnames.length > 1) {
        pathnames.shift();
        return match(method, pathnames, handlers[pathnames[0]]);
    }

    subpath = handlers[pathnames[0]] || handlers.index;

    return subpath ? subpath : handlers[method];
}

module.exports = build;
