'use strict';

var test = require('tape'),
    validation = require('../lib/validation');

test('validation', function (t) {
    var outputvalid, inputvalid;

    outputvalid = validation.output({
        "id": "User",
        "required": ["id", "name"],
        "properties": {
            "name": {
                "type": "string"
            },
            "id": {
                "type": "integer"
            }
        }
    });

    inputvalid = validation.input({
        paramType: 'query',
        name: 'id',
        required: true
    }, 'integer');

    t.test('input pass', function (t) {
        t.plan(1);

        inputvalid({
            param: function () {
                return this.params.id;
            },
            params: {
                id: 1
            },
        }, {}, function (error) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('input fail (not present)', function (t) {
        t.plan(1);

        inputvalid({
            param: function () {
                return undefined;
            },
            params: {
            },
        }, {}, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('input fail (wrong type)', function (t) {
        t.plan(1);

        inputvalid({
            param: function () {
                return this.params.id;
            },
            params: {
                id: 'a'
            },
        }, {}, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('output pass', function (t) {
        t.plan(1);

        outputvalid({
            id: 1,
            name: 'Joe'
        }, function (error) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('output fail', function (t) {
        t.plan(1);

        outputvalid({
            id: 'a',
            name: 'Joe'
        }, function (error) {
            t.ok(error, 'error.');
        });
    });

});
