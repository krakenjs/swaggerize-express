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

    //Make sure basePath properly reflects the resourcePath + apiVersion.
    basePath = url.parse(options.api.basePath);
    options.api.resourcePath && (options.api.resourcePath = utils.prefix(options.api.resourcePath, '/'));
    basePath.pathname = utils.suffix(options.api.resourcePath || '', '/') + options.api.apiVersion;
    options.api.basePath = basePath.href;

    validation = schema.validate(options.api);

    assert.ifError(validation.error);

    if (thing.isString(options.handlers) || !options.handlers) {
        options.handlers = options.handlers && path.resolve(options.handlers) || path.join(path.dirname(caller()), 'handlers');
    }

    options.docs = options.docs || '/api-docs';

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
        var mountpath;

        parent._router.stack.pop();

        mountpath = utils.suffix(options.api.resourcePath || '', '/') + options.api.apiVersion;

        expressroutes(parent._router, mountpath, options);
    };
}

module.exports = swaggerize;