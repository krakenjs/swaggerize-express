'use strict';

var assert = require('assert'),
    express = require('express'),
    thing = require('core-util-is'),
    path = require('path'),
    caller = require('caller'),
    expressroutes = require('./expressroutes'),
    url = require('url'),
    builder = require('swaggerize-builder'),
    yaml = require('js-yaml'),
    fs = require('fs');

function swaggerize(options) {
    var app;

    assert.ok(thing.isObject(options), 'Expected options to be an object.');
    assert.ok(options.api, 'Expected an api definition.');

    if (thing.isString(options.api)) {
        options.api = loadApi(options.api);
    }

    assert.ok(thing.isObject(options.api), 'Api definition must resolve to an object.');

    options.basedir = path.dirname(caller());

    options.routes = builder(options);

    app = express();

    app.once('mount', mount(options));

    return app;
}

/**
 * Onmount handler.
 * @param options
 * @returns {onmount}
 */
function mount(options) {
    return function onmount(parent) {
        parent._router.stack.pop();

        Object.defineProperty(parent, 'api', {
            enumerable: false,
            value: options.api
        });

        Object.defineProperty(parent, 'setHost', {
            enumerable: true,
            value: function (value) {
                options.api.host = value;
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
