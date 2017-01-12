const Assert = require('assert');
const Express = require('express');
const Thing = require('core-util-is');
const Path = require('path');
const Caller = require('caller');
const Expressroutes = require('./expressroutes');
const Routes = require('swaggerize-routes');

const swaggerize = options => {
    let App;

    Assert.ok(Thing.isObject(options), 'Expected options to be an object.');
    Assert.ok(options.api, 'Expected an api definition.');

    options.express = options.express || {};
    options.basedir = options.basedir || Path.dirname(Caller());
    //`express` option is optional. however, it should be an object, if set.
    Assert.ok(!options.express || Thing.isObject(options.express), 'Expected express options to be an object.');

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
        const routeBuilder = Routes(Object.assign({}, options));
        const errorEvnt = parent.emit.bind(parent, 'error');
        const routeEvnt = parent.emit.bind(parent, 'route');
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

        routeBuilder.then( routeObj => {
            let { api, routes } = routeObj;
            options.routes = routes;
            options.api = api;
            //If a mountpath was provided, override basePath in api.
            options.api.basePath = app.mountpath !== '/' ? app.mountpath : options.api.basePath;
            parent.mountpath = options.api.basePath;
            Object.defineProperty(parent, 'swagger', {
                value: {
                    api: options.api,
                    routes: options.routes
                }
            });
            Expressroutes(parent._router, options);
            routeEvnt();
        }).catch(errorEvnt);

    };
};

module.exports = swaggerize;
