'use strict';

var utils = require('./utils');

/**
 * Routes handlers to express router.
 * @param router
 * @param apis
 * @param options
 */
function route(router, handlers, options) {

    router.get(options.docs || '/api-docs', function (req, res) {
        res.json(options.api);
    });

    handlers.forEach(function (handler) {
        var args;

        //If a route exists, add it.
        if (handler.action) {
            args = [handler.path];
            args.push.apply(args, handler.validators);
            args.push(handler.action);

            router[handler.method].apply(router, args);
            return;
        }

        utils.debuglog('no matching handler for %s.', handler.path);
    });
}

module.exports = route;

