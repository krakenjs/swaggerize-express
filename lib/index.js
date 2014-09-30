'use strict';

var assert = require('assert'),
    express = require('express'),
    thing = require('core-util-is'),
    path = require('path'),
    caller = require('caller'),
    expressroutes = require('./expressroutes'),
    url = require('url'),
    builder = require('swaggerize-builder');

function swaggerize(options) {
    var app;

    assert.ok(thing.isObject(options), 'Expected options to be an object.');
    assert.ok(thing.isObject(options.api), 'Expected an api definition.');

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

module.exports = swaggerize;
