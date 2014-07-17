'use strict';

var assert = require('assert'),
    schema = require('./schema'),
    express = require('express'),
    thing = require('core-util-is'),
    path = require('path'),
    fs = require('fs'),
    caller = require('caller'),
    mount = require('./mount'),
    utils = require('./utils');

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
 * Reads the given path and requires all .js files.
 * @param path
 * @returns {{}}
 */
function read(dir) {
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
            routes[key] = read(abspath);
        }
    });

    return routes;
}