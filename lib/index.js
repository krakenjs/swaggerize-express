'use strict';

var assert = require('assert'),
    schema = require('./schema'),
    express = require('express'),
    thing = require('core-util-is'),
    path = require('path'),
    fs = require('fs'),
    caller = require('caller'),
    build = require('./build'),
    route = require('./route'),
    utils = require('./utils');

module.exports = function swaggycat(options) {
    var app, validation;

    assert.ok(thing.isObject(options), 'Expected options to be an object.');
    assert.ok(thing.isObject(options.api), 'Expected an api definition.');

    validation = schema.validate(options.api);

    assert.ifError(validation.error);

    if (thing.isString(options.handlers) || !options.routes) {
        options.handlers = options.handlers && path.resolve(options.handlers) || path.join(path.dirname(caller()), 'handlers');
        assert.ok(fs.existsSync(options.handlers), 'Specifed or default \'handlers\' directory does not exist.');
        options.handlers = read(options.handlers);
    }

    assert.ok(thing.isObject(options.handlers), 'Handlers must be an object.');

    app = express();

    app.once('mount', mount(app, options));

    return app;
};

function mount(app, options) {
    var routes;

    routes = [];

    options.api.apis.forEach(function (def) {
        routes.push(build(def, options));
    });

    return function onmount(parent) {
        parent._router.stack.pop();

        route(parent._router, routes, options);
    };
}


/**
 * Reads the given path and requires all .js files.
 * @param path
 * @returns {{}}
 */
function read(dir) {
    var routes, obj;

    routes = {};

    fs.readdirSync(dir).forEach(function (name) {
        var abspath, key, stat;

        abspath = path.join(dir, name);
        stat = fs.statSync(abspath);
        key = name.replace(/\.js/, '');

        if (stat.isFile()) {
            if (name.match(/^.*\.(js)$/)) {
                obj = require(abspath);
                if (routes[key]) {
                    Object.keys(obj).forEach(function (k) {
                        routes[key][k] = obj[k];
                    });
                }
                else {
                    routes[key] = obj;
                }
            }
        }
        if (stat.isDirectory()) {
            routes[key] = read(abspath);
        }
    });

    return routes;
}
