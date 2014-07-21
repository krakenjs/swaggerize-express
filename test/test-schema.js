'use strict';

var test = require('tape'),
    schema = require('../lib/schema'),
    apiDefinition = require('./fixtures/valid.json'),
    badApi = require('./fixtures/bad.json');

test('schema', function (t) {

    t.test('good api', function (t) {
        t.plan(1);

        var results = schema.validate(apiDefinition);

        t.ok(results.valid, 'no errors');
    });

    t.test('bad api', function (t) {
        t.plan(2);

        var results = schema.validate(badApi);

        t.ok(!results.valid, 'bad');
        t.ok(results.error, 'has error.');
    });

    t.test('good model', function (t) {
        t.plan(1);

        var modelSchema = {
            "id": "User",
            "required": ["id", "name"],
            "properties": {
                "name": {
                    "type": "string"
                },
                "id": {
                    "type": "integer",
                    "format": "int64"
                }
            }
        };

        var results = schema.validateModel({
            "id": 123,
            "name": "John Doe"
        }, modelSchema);

        t.ok(results.valid, 'no errors');
    });

    t.test('bad model', function (t) {
        t.plan(2);

        var modelSchema = {
            "id": "User",
            "required": ["id", "name"],
            "properties": {
                "name": {
                    "type": "string"
                },
                "id": {
                    "type": "integer",
                    "format": "int64"
                }
            }
        };

        var results = schema.validateModel({
            "id": "asdf",
            "name": "John Doe"
        }, modelSchema);

        t.ok(!results.valid, 'bad');
        t.ok(results.error, 'has error.');
    });

});
