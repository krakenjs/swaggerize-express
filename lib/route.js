'use strict';

var path = require('path'),
    utils = require('./utils'),
    thing = require('core-util-is');

/**
 * Routes handlers to express router.
 * @param router
 * @param apis
 * @param options
 */
function route(router, routes, options) {
    var mountpath = options.api.resourcePath ? path.join(options.api.resourcePath, options.api.apiVersion || '') : '/';

    router.get(mountpath + (options.docs || '/api-docs'), function (req, res) {
        res.json(options.api);
    });

    routes.forEach(function (route) {
        var args;

        //If a handler exists, add it.
        if (route.handler) {
            args = [mountpath + route.path];
            args.push.apply(args, route.validators);
            args.push(wrapAction(route.handler));

            router[route.method].apply(router, args);
            return;
        }

        utils.debuglog('no matching handler for %s.', handler.path);
    });
}

/**
 * Creates an express handler that injects to the given action.
 * @param action
 * @returns {Function}
 */
function wrapAction(action) {
    return function (req, res, next) {
        action(req, makeReply(res, next));
    };
}

/**
 * Wraps res and next so that checks can be made to conform to spec.
 * @param res
 * @param next
 * @returns {reply}
 */
function makeReply(res, next) {
    function reply(status, data) {
        if (arguments.length === 0) {
            status = 200;
        }

        res.send.apply(res, arguments);
    }

    Object.defineProperty(reply, '_raw', {
        enumerable: true,
        get: function () {
            return res;
        }
    });

    Object.defineProperty(reply, 'skip', {
        enumerable: true,
        value: next
    });

    Object.defineProperty(reply, 'error', {
        enumerable: true,
        value: function (e) {
            if (thing.isString(e)) {
                e = new Error(e);
            }
            next(e || new Error('Unknown'));
        }
    });

    return reply;
}

module.exports = route;
