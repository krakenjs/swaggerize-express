'use strict';

var test = require('tape'),
    swaggerize = require('../lib'),
    express = require('express'),
    request = require('supertest');

test('swaggycat valid input/output', function (t) {

    var app = express();
    var swaggycat = swaggerize({
        api: require('./fixtures/api.json')
    });

    app.use(swaggycat);

    t.test('api', function (t) {
        t.plan(5);

        t.ok(swaggycat.hasOwnProperty('_api'), 'has _api property.');
        t.ok(swaggycat._api, '_api is an object.');

        t.ok(swaggycat.hasOwnProperty('setUrl'), 'has setUrl property.');
        t.strictEqual(typeof swaggycat.setUrl, 'function', 'setUrl is a function.');

        swaggycat.setUrl('http://localhost:8080');

        t.strictEqual(swaggycat._api.basePath, 'http://localhost:8080/greetings/v1');
    });

    t.test('docs', function (t) {
        t.plan(2);

        request(app).get('/greetings/v1/api-docs').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/greetings/v1/hello').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 400, '400 required param missing.');
        });
    });


    t.test('route', function (t) {
        t.plan(3);

        request(app).get('/greetings/v1/hello/doge').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.text, 'hello', 'body is correct.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/greetings/v1/sub/1').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/greetings/v1/sub/1/path').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

});

test('swaggycat invalid input/output', function (t) {

    var app = express();

    app.use(swaggerize({
        api: require('./fixtures/api.json'),
        handlers: {
            sub: {
                get: function (req, reply) {
                    reply('foobar');
                }
            },
            goodbye: {
                get: function (req, reply) {
                    reply('baz');
                }
            }
        }
    }));

    t.test('bad input', function (t) {
        t.plan(2);

        request(app).get('/greetings/v1/sub/asdf').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 400, '400 status.');
        });
    });

    t.test('bad output', function (t) {
        t.plan(2);

        request(app).get('/greetings/v1/sub/1').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 500, '500 status.');
        });
    });

    t.test('null input ok', function (t) {
        t.plan(2);

        request(app).get('/greetings/v1/goodbye/').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

});
