'use strict';

var test = require('tape'),
    validation = require('../lib/validation');

test('validation', function (t) {
    var validator = validation.output({
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

    t.test('output pass', function (t) {
        t.plan(1);

        validator({
            id: 1,
            name: 'Joe'
        }, function (error) {
            t.ok(!error);
        });
    });

    t.test('output fail', function (t) {
        t.plan(1);

        validator({
            id: 'a',
            name: 'Joe'
        }, function (error) {
            t.ok(error);
        });
    });

});
