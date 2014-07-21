'use strict';

var test = require('tape'),
    utils = require('../lib/utils');

test('utils', function (t) {

    t.test('convertParam', function (t) {
        t.plan(1);

        var param = utils.convertParam('{id}');

        t.strictEqual(param, ':id?', 'is converted.');
    });

    t.test('convertPath', function (t) {
        t.plan(1);

        var path = utils.convertPath('/foo/{id}/{bar}/asdf');

        t.strictEqual(path, '/foo/:id?/:bar?/asdf', 'is converted.');
    });

});
