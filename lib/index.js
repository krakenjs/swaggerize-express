const Assert = require('assert');
const Express = require('express');
const Thing = require('core-util-is');
const Path = require('path');
const Caller = require('caller');
const Expressroutes = require('./expressroutes');
const Routes = require('swaggerize-routes');
const Yaml = require('js-yaml');
const Fs = require('fs');


const swaggerize = options => {
    let App;

    Assert.ok(Thing.isObject(options), 'Expected options to be an object.');
    Assert.ok(options.api, 'Expected an api definition.');

    if (Thing.isString(options.api)) {
        options.api = loadApi(options.api);
    }

    options.express = options.express || {};
    options.basedir = options.basedir || Path.dirname(Caller());
    //`express` option is optional. however, it should be an object, if set.
    Assert.ok(!options.express || Thing.isObject(options.express), 'Expected express options to be an object.');

    options.routes = Routes(options);
    App = Express();

    App.once('mount', mount(App, options));

    return App;
};

/**
 * Onmount handler.
 * @param options
 * @returns {onmount}
 */
const mount = (app, options) => {

    return function onmount(parent) {
        let settings;
        // Remove sacrificial express app
        parent._router.stack.pop();

        //Default express options.
        Object.keys(settings = {
            'x-powered-by': false,
            'trust proxy': false,
            'jsonp callback name': null,
            'json replacer': null,
            'json spaces': 0,
            'case sensitive routing': false,
            'strict routing': false,
            'views': null,
            'view cache': false,
            'view engine': false
        }).forEach(option => parent.set(option, settings[option]));

        //User provided express options -  `options.express`.
        Object.keys(options.express).forEach(option => parent.set(option, options.express[option]));

        options.api.basePath = app.mountpath !== '/' ? app.mountpath : options.api.basePath;
        parent.mountpath = options.api.basePath;
        Object.defineProperty(parent, 'swagger', {
            value: {
                api: options.api,
                routes: options.routes
            }
        });
        Expressroutes(parent._router, options);
        
    };
};

/**
 * Loads the api from a path, with support for yaml..
 * @param apiPath
 * @returns {Object}
 */
const loadApi = apiPath => {
    if (apiPath.indexOf('.yaml') === apiPath.length - 5 || apiPath.indexOf('.yml') === apiPath.length - 4) {
        return Yaml.load(Fs.readFileSync(apiPath));
    }
    return require(apiPath);
};



module.exports = swaggerize;
