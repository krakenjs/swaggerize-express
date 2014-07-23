'use strict';

var path = require('path'),
    utils = require('./utils'),
    buildroutes = require('./buildroutes'),
    thing = require('core-util-is'),
    makereply = require('./makereply');

/**
 * Routes handlers to express router.
 * @param router
 * @param mountpath
 * @param options
 */
function expressroutes(router, mountpath, options) {
    var routes;

    routes = buildroutes(options);

    router.get(mountpath + utils.prefix(options.docs || '/api-docs', '/'), function (req, res) {
        res.json(options.api);
    });

    routes.forEach(function (route) {
        var args;

        //If a handler exists, add it.
        if (route.handler) {
            args = [mountpath + utils.prefix(route.path, '/')];
            args.push.apply(args, route.validators.input);
            args.push(function handler(req, res, next) {
                route.handler(req, makereply(res, next, route.validators.output));
            });

            router[route.method].apply(router, args);
            return;
        }

        utils.debuglog('no matching handler for %s.', route.path);
    });
}

module.exports = expressroutes;
