'use strict';

var assert = require('assert'),
    express = require('express'),
    schema = require('./schema'),
    path = require('path'),
    fs = require('fs'),
    paramvalidator = require('./paramvalidator'),
    utils = require('./utils');

/**
 * Bootstrap api definition into routes.
 * @param options
 * @returns {Function}
 */
function mount(options) {
    var apis, mountpath;

    apis = [];

    //TODO:
    mountpath = path.join(options.api.resourcePath, options.api.apiVersion || '');

    options.api.apis.forEach(function (def) {
        apis.push(make(def));
    });

    return function onmount(parent) {
        parent._router.stack.pop();

        route(parent._router, apis, options);
    };
}

/**
 * Convert definition of api to something we can work with.
 * @param def
 * @returns {{path: *, description: *, operations: Array}}
 */
function make(def) {
    var api;

    api = {
        path: utils.convertPath(def.path),
        description: def.description,
        operations: []
    };

    def.operations.forEach(function (op) {
        var operation;

        operation = {
            method: op.method.toLowerCase(),
            validators: []
        };

        op.parameters.forEach(function (parameter) {
            if (parameter.paramType === 'path') {
                api.path = api.path.replace(':' + parameter.name, ':' + parameter.name + '?');
            }
            operation.validators.push(paramvalidator(parameter));
        });

        api.operations.push(operation);
    });

    return api;
}

/**
 * Routes apis to handlers.
 * @param router
 * @param apis
 * @param options
 */
function route(router, apis, options) {

    router.get(options.docs || '/api-docs', function (req, res) {
        res.json(options.api);
    });

    apis.forEach(function (api) {
        var pathnames, split, tree;

        pathnames = [];

        split = api.path.split('/');

        //Figure out the names from the params.
        split.forEach(function (element) {
            if (element && element.indexOf(':') < 0) {
                pathnames.push(element);
            }
        });

        //Part of the tree based on the first path element.
        tree = options.routes[split[0] || split[1]];

        //Build routes per operation.
        api.operations.forEach(function (operation) {
            var args, route;

            route = match(operation.method.toLowerCase(), pathnames, tree);

            //If a route exists, add it.
            if (route) {
                args = [api.path];
                args.push.apply(args, operation.validators);
                args.push(route);

                router[operation.method].apply(router, args);
            }
        });
    });
}

/**
 * Match a route handler to a given path name set.
 * @param method
 * @param pathnames
 * @param tree
 * @returns {*}
 */
function match(method, pathnames, tree) {
    if (pathnames.length > 1) {
        pathnames.shift();
        return match(method, pathnames, tree[pathnames[0]]);
    }

    return tree.index ? tree.index[method] : tree[method];
}

module.exports = mount;