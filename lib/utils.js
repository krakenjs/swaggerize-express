'use strict';

var pkg = require('../package.json');

module.exports = {
    debuglog: require('debuglog')(pkg.name),

    convertPath: function (path) {
        var self = this;

        return path.split('/').map(function (element) {
            return self.convertParam(element);
        }).join('/');
    },

    convertParam: function (param) {
        return param.replace(/{([^}]*)}*/, function (p1, p2) {
            return ':' + p2 + '?';
        }) || param;
    }
};
