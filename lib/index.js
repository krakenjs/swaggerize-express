const assert = require('assert');
const express = require('express');
const thing = require('core-util-is');
const path = require('path');
const caller = require('caller');
const routes = require('swaggerize-routes');
const yaml = require('js-yaml');
const fs = require('fs');
const expressroutes = require('./expressroutes');

function swaggerize(options) {
  assert.ok(thing.isObject(options), 'Expected options to be an object.');
  assert.ok(options.api, 'Expected an api definition.');

  if (thing.isString(options.api)) {
    // eslint-disable-next-line no-param-reassign, no-use-before-define
    options.api = loadApi(options.api);
  }

  // eslint-disable-next-line no-param-reassign
  options.express = options.express || {};
  // eslint-disable-next-line no-param-reassign
  options.basedir = options.basedir || path.dirname(caller());

  assert.ok(!options.express || thing.isObject(options.express), 'Expected express options to be an object.');
  assert.ok(thing.isObject(options.api), 'Api definition must resolve to an object.');

  // eslint-disable-next-line no-param-reassign
  options.routes = routes(options);

  const app = express();

  // eslint-disable-next-line no-use-before-define
  app.once('mount', mount(app, options));

  return app;
}

/**
 * Onmount handler.
 * @param options
 * @returns {onmount}
 */
function mount(app, options) {
  return function onmount(parent) {
    let settings;

    // eslint-disable-next-line no-underscore-dangle
    parent._router.stack.pop();

    // If a mountpath was provided, override basePath in api.
    // eslint-disable-next-line no-param-reassign
    options.api.basePath = app.mountpath !== '/' ? app.mountpath : options.api.basePath;

    Object.keys(settings = {
      'x-powered-by': false,
      'trust proxy': false,
      'jsonp callback name': null,
      'json replacer': null,
      'json spaces': 0,
      'case sensitive routing': false,
      'strict routing': false,
      views: null,
      'view cache': false,
      'view engine': false,
    }).forEach((option) => {
      parent.set(option, settings[option]);
    });

    Object.keys(options.express).forEach((option) => {
      parent.set(option, options.express[option]);
    });

    // eslint-disable-next-line no-param-reassign
    parent.mountpath = options.api.basePath;

    Object.defineProperty(parent, 'swagger', {
      value: {
        api: options.api,
        routes: options.routes,
      },
    });

    // eslint-disable-next-line no-underscore-dangle
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
  // eslint-disable-next-line global-require, import/no-dynamic-require
  return require(apiPath);
}

module.exports = swaggerize;
