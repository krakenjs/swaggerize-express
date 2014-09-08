'use strict';

var assert = require('assert'),
    express = require('express'),
    thing = require('core-util-is'),
    path = require('path'),
    caller = require('caller'),
    expressroutes = require('./expressroutes'),
    url = require('url'),
    builder = require('swaggerize-builder'),
    schema = require('swaggerize-builder/lib/schema'),
    utils = require('swaggerize-builder/lib/utils');

function swaggerize(options) {
    var app, routes;

    assert.ok(thing.isObject(options), 'Expected options to be an object.');
    assert.ok(thing.isObject(options.meta), 'Expected a resource listing definition (options.meta).');
    assert.ok(thing.isObject(options.resources) || thing.isArray(options.resources), 'Expected a resources(s) definition (options.resources).');
    assert.ifError(schema.validate(options.meta, 'resourceListing.json').error);

    options.basedir = path.dirname(caller());

    if (!thing.isArray(options.resources)) {
        options.resources = [options.resources];
    }

    routes = {};

    options.resources.forEach(function (resource) {
        var opts, mountpath;

        mountpath = utils.prefix(resource.api.resourcePath, '/');
        routes[mountpath] = [];
        opts = {
            api: resource.api,
            handlers: resource.handlers,
            basedir: options.basedir
        };

        Array.prototype.push.apply(routes[mountpath], builder(opts));
    });

    options.routes = routes;

    options.docspath = options.docspath || '/api-docs';

    app = express();

    app.once('mount', mount(options));

    Object.defineProperty(app, '_meta', {
        enumerable: true,
        value: options.meta
    });

    Object.defineProperty(app, '_resources', {
        enumerable: true,
        value: options.resources
    });

    Object.defineProperty(app, 'setUrl', {
        enumerable: true,
        value: function (value) {
            options.resources.forEach(function (resource) {
                var basePath = url.parse(resource.api.basePath);

                value = url.parse(value);
                value.protocol && (basePath.protocol = value.protocol);
                value.host && (basePath.host = value.host);

                resource.api.basePath = url.format(basePath);
            });
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
