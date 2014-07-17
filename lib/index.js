'use strict';

var assert = require('assert'),
    schema = require('./schema'),
    express = require('express'),
    thing = require('core-util-is'),
    path = require('path'),
    fs = require('fs'),
    caller = require('caller'),
    utils = require('./utils');

//options.api
//options.docs
//options.routes
module.exports = function swaggerexpress(options) {
    var app, validation;

    assert.ok(thing.isObject(options), 'Expected options to be an object.');
    assert.ok(thing.isObject(options.api), 'Expected an api definition.');

    validation = schema.validate(options.api);

    assert.ok(validation.valid, 'Invalid specification: %s', validation.error && JSON.stringify(validation.error));

    if (thing.isString(options.routes) || !options.routes) {
        options.routes = options.routes || path.join(path.dirname(caller()), 'routes');
        assert.ok(fs.existsSync(options.routes), 'Specifed or default \'routes\' directory does not exist.');
        options.routes = read(options.routes);
    }

    assert.ok(thing.isObject(options.routes), 'Routes must be an object.');

    app = express();

    app.once('mount', mount(options));

    return app;
};

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
        var router = parent._router;

        router.stack.pop();

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

                    router[operation.method].apply(parent, args);
                }
            });
        });
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
            if (parameter.paramType === 'path' && !parameter.required) {
                api.path = api.path.replace(':' + parameter.name, ':' + parameter.name + '?');
            }
            operation.validators.push(validator(parameter));
        });

        api.operations.push(operation);
    });

    return api;
}

/**
 * Creates validation middleware for a parameter.
 * @param parameter
 * @returns {checkParameter}
 */
function validator(parameter) {
    //var model = def.models[parameter.paramType];

    return function checkParameter(req, res, next) {
        var param = req.param(parameter.name);

        if (!param && parameter.required) {
            next(new Error('Required parameter ' + parameter.name + ' missing.'));
            return;
        }

        //TODO model validation
        //if (model) {
        //    validateModel(param, model);
        //}

        next();
    };
}

/**
 * Reads the given path and requires all .js files.
 * @param path
 * @returns {{}}
 */
function read(dir) {

    function list(dir) {
        var routes = {};

        fs.readdirSync(dir).forEach(function (name) {
            var abspath, key, stat;

            abspath = path.join(dir, name);
            stat = fs.statSync(abspath);
            key = name.replace(/\.js/, '');

            if (stat.isFile()) {
                if (name.match(/^.*\.(js)$/)) {
                    routes[key] = require(abspath);
                }
            }
            if (stat.isDirectory()) {
                routes[key] = list(abspath);
            }
        });

        return routes;
    }

    return list(dir);
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