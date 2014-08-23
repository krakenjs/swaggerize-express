'use strict';

var assert = require('assert'),
    schema = require('./schema'),
    express = require('express'),
    thing = require('core-util-is'),
    path = require('path'),
    fs = require('fs'),
    caller = require('caller'),
    expressroutes = require('./expressroutes'),
    utils = require('./utils'),
    url = require('url'),
    configure = require('./configure');

function swaggerize(options) {
    var app;

    if (!options) {
        options = {};
    }

    options.baseDir = options.baseDir || path.dirname(caller());

    options = configure(options);

    app = express();

    app.once('mount', mount(options));

    Object.defineProperty(app, '_api', {
        enumerable: false,
        value: options.api
    });

    Object.defineProperty(app, 'setUrl', {
        enumerable: true,
        value: function (value) {
            var basePath = url.parse(options.api.basePath);
            value = url.parse(value);

            value.protocol && (basePath.protocol = value.protocol);
            value.host && (basePath.host = value.host);

            options.api.basePath = url.format(basePath);
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
