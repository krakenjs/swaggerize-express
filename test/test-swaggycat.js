'use strict';

var test = require('tape'),
    swaggycat = require('../lib'),
    express = require('express'),
    request = require('supertest');

test('swaggycat', function (t) {

    var app = express();

    app.use(swaggycat({
        api: require('./fixtures/valid.json')
    }));

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

        request(app).get('/greetings/v1/foo/1').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/greetings/v1/foo/1/bar').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

});
