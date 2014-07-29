'use strict';

var test = require('tape'),
    utils = require('../lib/utils');

test('utils', function (t) {

    t.test('convertParam', function (t) {
        t.plan(1);

        var param = utils.convertParam('{id}');

        t.strictEqual(param, ':id', 'is converted.');
    });

    t.test('convertPath', function (t) {
        t.plan(1);

        var path = utils.convertPath('/foo/{id}/{bar}/asdf');

        t.strictEqual(path, '/foo/:id/:bar/asdf', 'is converted.');
    });

    t.test('prefix', function (t) {
        t.plan(3);

        var str = 'foobar';

        str = utils.prefix(str, 'foo');

        t.equal(str, 'foobar', 'string had prefix so is the same.');

        str = 'bar';

        str = utils.prefix(str, 'foo');

        t.equal(str, 'foobar', 'string did not have prefix so was changed.');

        t.equal(utils.prefix(undefined, 'foo'), 'foo', 'handled undefined.');
    });

    t.test('unprefix', function (t) {
        t.plan(3);

        var str = 'foobar';

        str = utils.unprefix(str, 'foo');

        t.equal(str, 'bar', 'string had prefix so is changed.');

        str = 'bar';

        str = utils.unprefix(str, 'foo');

        t.equal(str, 'bar', 'string did not have prefix so was not changed.');

        t.equal(utils.unprefix(undefined, 'foo'), '', 'handled undefined.');
    });

    t.test('suffix', function (t) {
        t.plan(3);

        var str = 'foobar';

        str = utils.suffix(str, 'bar');

        t.equal(str, 'foobar', 'string had suffix so is the same.');

        str = 'foo';

        str = utils.suffix(str, 'bar');

        t.equal(str, 'foobar', 'string did not have suffix so was changed.');

        t.equal(utils.suffix(undefined, 'foo'), 'foo', 'handled undefined.');
    });

    t.test('unsuffix', function (t) {
        t.plan(3);

        var str = 'foobar';

        str = utils.unsuffix(str, 'bar');

        t.equal(str, 'foo', 'string had suffix so is changed.');

        str = 'foo';

        str = utils.unsuffix(str, 'bar');

        t.equal(str, 'foo', 'string did not have suffix so was not changed.');

        t.equal(utils.unsuffix(undefined, 'foo'), '', 'handled undefined.');
    });

    t.test('ends with', function (t) {
        t.plan(2);
        t.ok(utils.endsWith('foobar', 'bar'), 'foobar ends with bar');
        t.ok(!utils.endsWith('foobar', 'x'), 'foobar doesn\'t end with x');
    });


});
