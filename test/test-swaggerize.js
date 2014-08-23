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

        t.strictEqual(swaggycat._api.basePath, 'http://localhost:8080/v1/greetings');
    });

    t.test('docs', function (t) {
        t.plan(2);

        request(app).get('/v1/greetings/').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/v1/greetings/hello').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 404, '404 required param missing.');
        });
    });


    t.test('route', function (t) {
        t.plan(3);

        request(app).get('/v1/greetings/hello/doge').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.text, 'hello', 'body is correct.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/v1/greetings/sub/1').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/v1/greetings/sub/1/path').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

});

test('input validators', function (t) {

    var app = express();

    app.use(swaggerize({
        api: require('./fixtures/api.json'),
        handlers: {
            sub: {
                '{id}': {
                    $get: function (req, reply) {
                        reply('foobar');
                    }
                }
            },
            goodbye: {
                $get: function (req, reply) {
                    reply('baz');
                }
            }
        }
    }));

    t.test('bad input', function (t) {
        t.plan(2);

        request(app).get('/v1/greetings/sub/asdf').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 400, '400 status.');
        });
    });

    t.test('null input not found', function (t) {
        t.plan(2);

        request(app).get('/v1/greetings/goodbye').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 404, '404 status.');
        });
    });

});
