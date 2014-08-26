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

    t.test('input validation skip (not present, not required)', function (t) {
        t.plan(1);

        validation.input({
            paramType: 'query',
            name: 'id',
            required: false
        }, 'integer')({
            param: function () {
                return undefined;
            },
            params: {
            },
        }, {}, function (error) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('input coerce to float (pass)', function (t) {
        t.plan(1);

        validation.input({
            paramType: 'query',
            name: 'id',
            required: true
        }, 'float')({
            param: function () {
                return this.params.id;
            },
            params: {
                id: '1.0'
            },
        }, {}, function (error) {
            error && console.error(error);
            t.ok(!error, 'no error.');
        });
    });

    t.test('input coerce to byte (pass)', function (t) {
        t.plan(1);

        validation.input({
            paramType: 'query',
            name: 'id',
            required: true
        }, 'byte')({
            param: function () {
                return this.params.id;
            },
            params: {
                id: 'a'
            },
        }, {}, function (error) {
            error && console.error(error);
            t.ok(!error, 'no error.');
        });
    });

    t.test('input coerce to boolean (pass)', function (t) {
        t.plan(1);

        validation.input({
            paramType: 'query',
            name: 'id',
            required: true
        }, 'boolean')({
            param: function () {
                return this.params.id;
            },
            params: {
                id: 1
            },
        }, {}, function (error) {
            error && console.error(error);
            t.ok(!error, 'no error.');
        });
    });

    t.test('input coerce to string (pass)', function (t) {
        t.plan(1);

        validation.input({
            paramType: 'query',
            name: 'id',
            required: true
        }, 'string')({
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
            name: 'Test'
        }, function (error) {
            t.ok(!error, 'error.');
        });
    });

    t.test('output fail (schema fail)', function (t) {
        t.plan(3);

        outputvalid({
            id: 1,
            name: 2
        }, function (error) {
            t.ok(error, 'error.');
        });

        outputvalid({
            id: 'Test',
            name: 1
        }, function (error) {
            t.ok(error, 'error.');
        });

        outputvalid('Test', function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('output fail (missing required)', function (t) {
        t.plan(2);

        outputvalid({
            id: 1
        }, function (error) {
            t.ok(error, 'error.');
        });

        outputvalid({
            name: 'Test'
        }, function (error) {
            t.ok(error, 'error.');
        });
    });

});
