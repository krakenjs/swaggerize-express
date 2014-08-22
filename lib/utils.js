'use strict';

var pkg = require('../package.json');

module.exports = {
    debuglog: require('debuglog')(pkg.name),

    convertPath: function (path) {
        return path.replace(/{([^}]+)}/g, ':$1');
    },

    endsWith: function (haystack, needle) {
        if (!haystack || !needle) {
            return false;
        }

        if (needle.length === 1) {
            return haystack[haystack.length - 1] === needle;
        }

        return haystack.slice(haystack.length - needle.length) === needle;
    },

    prefix: function (str, pre) {
        str = str || '';
        if (str.indexOf(pre) === 0) {
            return str;
        }

        str = pre + str;
        return str;
    },

    unprefix: function (str, pre) {
        str = str || '';
        if (str.indexOf(pre) === 0) {
            str = str.substr(pre.length);
            return str;
        }

        return str;
    },

    suffix: function (str, suff) {
        str = str || '';
        if (this.endsWith(str, suff)) {
            return str;
        }

        str = str + suff;
        return str;
    },

    unsuffix: function (str, suff) {
        str = str || '';
        if (this.endsWith(str, suff)) {
            str = str.substr(0, str.length - suff.length);
            return str;
        }

        return str;
    }
};
