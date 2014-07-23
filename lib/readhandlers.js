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

                    if (routes[key]) {
                        Object.keys(obj).forEach(function (k) {
                            routes[key][k] = obj[k];
                        });
                    }
                    else {
                        routes[key] = obj;
                    }
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

module.exports = read;