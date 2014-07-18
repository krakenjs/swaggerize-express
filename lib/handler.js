'use strict';

var utils = require('./utils'),
    validator = require('./validator');

/**
 * Convert definition of api to something we can work with.
 * @param def
 * @returns {{path: *, description: *, operations: Array}}
 */
function buildhandler(def, options) {
    var handler, models;

    handler = {
        path: utils.convertPath(def.path),
        method: undefined,
        validators: [],
        handler: undefined
    };

    models = options.api.models;

    def.operations.forEach(function (operation) {
        var pathnames, split;

        handler.method = operation.method.toLowerCase();

        operation.parameters.forEach(function (parameter) {
            var model = models[parameter.type] || parameter.type;

            if (parameter.paramType === 'path') {
                handler.path = handler.path.replace(':' + parameter.name, ':' + parameter.name + '?');
            }
            handler.validators.push(validator(parameter, model));
        });

        split = handler.path.split('/');

        pathnames = [];

        //Figure out the names from the params.
        split.forEach(function (element) {
            if (element && element.indexOf(':') < 0) {
                pathnames.push(element);
            }
        });

        handler.action = match(operation.method.toLowerCase(), pathnames, options.routes[pathnames[0]]);
    });

    return handler;
}

/**
 * Match a route handler to a given path name set.
 * @param method
 * @param pathnames
 * @param tree
 * @returns {*}
 */
function match(method, pathnames, routes) {
    if (!routes) {
        return null;
    }
    if (pathnames.length > 1) {
        pathnames.shift();
        return match(method, pathnames, routes[pathnames[0]]);
    }

    return routes.index ? routes.index[method] : routes[method];
}

module.exports = buildhandler;