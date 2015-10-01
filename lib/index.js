'use strict';

var assert = require('assert'),
    express = require('express'),
    thing = require('core-util-is'),
    path = require('path'),
    caller = require('caller'),
    expressroutes = require('./expressroutes'),
    url = require('url'),
    routes = require('swaggerize-routes'),
    yaml = require('js-yaml'),
    fs = require('fs');

function swaggerize(options) {
    var app;

    assert.ok(thing.isObject(options), 'Expected options to be an object.');
    assert.ok(options.api, 'Expected an api definition.');

    if (thing.isString(options.api)) {
        options.api = loadApi(options.api);
    }

    options.express = options.express || {};
    options.basedir = options.basedir || path.dirname(caller());

    assert.ok(!options.express || thing.isObject(options.express), 'Expected express options to be an object.');
    assert.ok(thing.isObject(options.api), 'Api definition must resolve to an object.');

    options.routes = routes(options);

    app = express();

    app.once('mount', mount(app, options));

    return app;
}

/**
 * Onmount handler.
 * @param options
 * @returns {onmount}
 */
function mount(app, options) {

    return function onmount(parent) {
        var settings;

        parent._router.stack.pop();

        //If a mountpath was provided, override basePath in api.
        options.api.basePath = app.mountpath !== '/' ? app.mountpath : options.api.basePath;

        Object.keys(settings = {
            'x-powered-by': false,
            'trust proxy': false,
            'jsonp callback name': null,
            'json replacer': null,
            'json spaces': 0,
            'case sensitive routing': false,
            'strict routing': false,
            'views': null,
            'view cache': false,
            'view engine': false
        }).forEach(function (option) {
            parent.set(option, settings[option]);
        });

        Object.keys(options.express).forEach(function (option) {
            parent.set(option, options.express[option]);
        });

        parent.mountpath = options.api.basePath;

        Object.defineProperty(parent, 'swagger', {
            value: {
                api: options.api,
                routes: options.routes
            }
        });

        expressroutes(parent._router, options);
    };
}

/**
 * Loads the api from a path, with support for yaml..
 * @param apiPath
 * @returns {Object}
 */
function loadApi(apiPath) {
    if (apiPath.indexOf('.yaml') === apiPath.length - 5 || apiPath.indexOf('.yml') === apiPath.length - 4) {
        return yaml.load(fs.readFileSync(apiPath));
    }
    return require(apiPath);
}

module.exports = swaggerize;
