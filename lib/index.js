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
    var app, config;

    assert.ok(thing.isObject(options), 'Expected options to be an object.');

    options.basedir = path.dirname(caller());

    config = builder(options);

    config.docspath = options.docspath || '/';

    app = express();

    app.once('mount', mount(config));

    Object.defineProperty(app, '_api', {
        enumerable: false,
        value: options.api
    });

    Object.defineProperty(app, 'setUrl', {
        enumerable: true,
        value: function (value) {
            var basePath = url.parse(config.api.basePath);

            value = url.parse(value);
            value.protocol && (basePath.protocol = value.protocol);
            value.host && (basePath.host = value.host);

            config.api.basePath = url.format(basePath);
        }
    });

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
        expressroutes(parent._router, options);
    };
}

module.exports = swaggerize;
