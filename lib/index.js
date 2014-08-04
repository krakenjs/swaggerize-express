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
    url = require('url');

function swaggerize(options) {
    var app, validation, basePath;

    assert.ok(thing.isObject(options), 'Expected options to be an object.');
    assert.ok(thing.isObject(options.api), 'Expected an api definition.');

    basePath = url.parse(options.api.basePath);
    options.api.resourcePath = utils.prefix(options.api.resourcePath || '/', '/');
    basePath.path = basePath.pathname = options.api.resourcePath;
    options.api.basePath = url.format(basePath);

    validation = schema.validate(options.api);

    assert.ifError(validation.error);

    if (thing.isString(options.handlers) || !options.handlers) {
        options.handlers = options.handlers && path.resolve(options.handlers) || path.join(path.dirname(caller()), 'handlers');
    }

    options.docs = options.docs || '/api-docs';

    options.outputvalidation = !!options.outputvalidation;

    app = express();

    app.once('mount', mount(options));

    Object.defineProperty(app, '_api', {
        enumerable: false,
        value: options.api
    });

    Object.defineProperty(app, 'setUrl', {
        enumerable: true,
        value: function (value) {
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