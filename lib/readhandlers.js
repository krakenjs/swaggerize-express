'use strict';

var assert = require('assert'),
    thing = require('core-util-is'),
    path = require('path'),
    fs = require('fs');

/**
 * Reads the given path and requires all .js files.
 * @param path
 * @returns {{}}
 */
function read(dir) {
    var routes, obj;

    if (thing.isString(dir)) {
        assert.ok(fs.existsSync(dir), 'Specifed or default \'handlers\' directory does not exist.');

        routes = {};

        fs.readdirSync(dir).forEach(function (name) {
            var abspath, key, stat;

            abspath = path.join(dir, name);
            stat = fs.statSync(abspath);
            key = name.replace(/\.js/, '');

            if (stat.isFile()) {
                if (name.match(/^.*\.(js)$/)) {
                    obj = require(abspath);

                    if (!routes[key]) {
                        routes[key] = {};
                    }

                    Object.keys(obj).forEach(function (k) {
                        routes[key][isHttpMethod(k) ? '$' + k : k] = obj[k];
                    });
                }
            }
            if (stat.isDirectory()) {
                routes[key] = read(abspath);
            }
        });

        return routes;
    }
    return dir;
}

/**
 * Determines if the given method is a supported HTTP method.
 * @param method
 * @returns {boolean}
 */
function isHttpMethod(method) {
    return (typeof method === 'string') && {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE',
        HEAD: 'HEAD',
        OPTIONS: 'OPTIONS',
        TRACE: 'TRACE',
        CONNECT: 'CONNECT',
        PATCH: 'PATCH'
    }.hasOwnProperty(method.toUpperCase());
}

module.exports = read;