'use strict';

var test = require('tape'),
    schema = require('../lib/schema'),
    apiDefinition = require('./fixtures/valid.json'),
    badApi = require('./fixtures/bad.json');

test('schema', function (t) {

    t.test('good', function (t) {
        t.plan(1);

        var results = schema.validate(apiDefinition);

        t.ok(results.valid, 'no errors');
    });

    t.test('bad', function (t) {
        t.plan(2);

        var results = schema.validate(badApi);

        t.ok(!results.valid, 'bad');
        t.ok(results.error, 'has error.');
    });

});
