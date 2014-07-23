'use strict';

var async = require('async'),
    thing = require('core-util-is');

/**
 * Wraps res and next so that checks can be made to conform to spec.
 * @param res
 * @param next
 * @returns {reply}
 */
function makereply(res, next, validators) {
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

module.exports = makereply;