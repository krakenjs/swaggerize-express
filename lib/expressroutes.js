'use strict';

var path = require('path'),
    utils = require('./utils'),
    buildroutes = require('./buildroutes'),
    thing = require('core-util-is'),
    async = require('async');

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
            args.push(wrapAction(route.handler, route.validators.output));

            router[route.method].apply(router, args);
            return;
        }

        utils.debuglog('no matching handler for %s.', route.path);
    });
}

/**
 * Creates an express handler that injects to the given action.
 * @param action
 * @returns {Function}
 */
function wrapAction(action, validators) {
    return function (req, res, next) {
        action(req, makeReply(res, next, validators));
    };
}

/**
 * Wraps res and next so that checks can be made to conform to spec.
 * @param res
 * @param next
 * @returns {reply}
 */
function makeReply(res, next, validators) {
    function reply(status, data) {
        var args = Array.prototype.slice.call(arguments);

        if (isNaN(status)) {
            data = status;
            status = 200;
        }


        async.applyEachSeries(validators, data, function (error) {
            if (error) {
                error.code && (res.statusCode = error.code);
                next(error);
                return;
            }
            res.send.apply(res, args);
        });
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

    Object.defineProperty(reply, 'redirect', {
        enumerable: true,
        value: res.redirect
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

module.exports = expressroutes;
