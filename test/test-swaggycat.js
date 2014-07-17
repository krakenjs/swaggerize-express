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

        request(app).get('/api-docs').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/hello').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });


    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/hello/doge').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/foo/1').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/foo/1/bar').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

});
