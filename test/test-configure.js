'use strict';

var test = require('tape'),
    configure = require('../lib/configure'),
    path = require('path');

test('configure', function (t) {
    
    t.test('fail no options', function (t) {
        t.plan(1);

        t.throws(function () {
            configure();
        }, 'throws exception.');
    });

    t.test('fail no api definition', function (t) {
        t.plan(1);
        
        t.throws(function () {
            configure({});
        }, 'throws exception.');
    });

});
