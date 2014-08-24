'use strict';

var path = require('path'),
    utils = require('./utils'),
    buildroutes = require('./buildroutes'),
    thing = require('core-util-is');

/**
 * Routes handlers to express router.
 * @param router
 * @param mountpath
 * @param options
 */
function expressroutes(router, options) {
    var routes = options.routes || [];

    router.get(options.api.resourcePath + utils.prefix(options.docspath || '', '/'), function (req, res) {
        res.json(options.api);
    });

    routes.forEach(function (route) {
        var args, path;

        path = utils.convertPath(route.path);
        args = [options.api.resourcePath + utils.prefix(path, '/')];

        if (thing.isArray(route.handler)) {
            if (route.handler.length > 1) {
                Array.prototype.push.apply(route.before, route.handler.slice(0, route.handler.length - 1));
            }
            route.handler = route.handler[route.handler.length - 1];
        }

        Array.prototype.push.apply(args, route.before);
        args.push(route.handler);
        router[route.method].apply(router, args);
    });
}

module.exports = expressroutes;
