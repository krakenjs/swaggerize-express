'use strict';

var assert = require('assert'),
    express = require('express'),
    thing = require('core-util-is'),
    path = require('path'),
    caller = require('caller'),
    expressroutes = require('./expressroutes'),
    routes = require('swaggerize-routes');

function swaggerize(options) {
    var app;

    assert.ok(thing.isObject(options), 'Expected options to be an object.');
    assert.ok(options.api, 'Expected an api definition.');

    options.express = options.express || {};
    options.basedir = options.basedir || path.dirname(caller());

    assert.ok(!options.express || thing.isObject(options.express), 'Expected express options to be an object.');

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
        var routeBuilder = routes(Object.assign({ }, options));
        var error = parent.emit.bind(parent, 'error');
        var route = parent.emit.bind(parent, 'route');
        // Remove sacrificial express app
        parent._router.stack.pop();

        //Default express options.
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
        //User provided express options -  `options.express`.
        Object.keys(options.express).forEach(function (option) {
            parent.set(option, options.express[option]);
        });


        routeBuilder.then( routeObj => {
            let { api, routes } = routeObj;
            options.routes = routes;
            options.api = api;
            //If a mountpath was provided, override basePath in api.
            options.api.basePath = app.mountpath !== '/' ? app.mountpath : options.api.basePath;
            parent.mountpath = options.api.basePath;
            Object.defineProperty(parent, 'swagger', {
                value: {
                    api: options.api,
                    routes: options.routes
                }
            });
            expressroutes(parent._router, options);
            route();
        }).catch(error);

    };
}

module.exports = swaggerize;
