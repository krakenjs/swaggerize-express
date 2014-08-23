'use strict';

var assert = require('assert'),
    schema = require('./schema'),
    thing = require('core-util-is'),
    path = require('path'),
    caller = require('caller'),
    utils = require('./utils'),
    url = require('url'),
    buildroutes = require('./buildroutes');

function configure(options) {
    var app, validation, basePath, routes;

    assert.ok(thing.isObject(options), 'Expected options to be an object.');
    assert.ok(thing.isObject(options.api), 'Expected an api definition.');

    basePath = url.parse(options.api.basePath);
    options.api.resourcePath = utils.prefix(options.api.resourcePath || '/', '/');
    basePath.path = basePath.pathname = options.api.resourcePath;
    options.api.basePath = url.format(basePath);

    validation = schema.validate(options.api);

    assert.ifError(validation.error);

    options.docspath = options.docspath || '/';

    if (thing.isString(options.handlers) || !options.handlers) {
        options.handlers = options.handlers && path.resolve(options.handlers) || path.join(options.basedir || path.dirname(caller()), 'handlers');
    }

    routes = buildroutes(options);

    return {
        api: options.api,
        docspath: options.docspath,
        routes: routes
    };
}

module.exports = configure;
