'use strict';

var test = require('tape'),
    expressroutes = require('../lib/expressroutes'),
    express = require('express'),
    request = require('supertest');

test('express routes', function (t) {

    t.test('test api', function (t) {
        t.plan(3);

        var app = express(), child = express();

        child.once('mount', function (parent) {
            var stack;

            expressroutes(app, {
                api: require('./fixtures/api.json'),
                docspath: '/api-docs',
                routes: [
                    {
                        method: 'get',
                        path: '/hello/:subject',
                        validators: [],
                        handler: function (req, res) {}
                    }
                ]
            });

            stack = Array.prototype.slice.call(parent._router.stack, 3);

            t.strictEqual(stack.length, 2, '2 routes added.');
            t.strictEqual(stack[0].route.path, '/v1/greetings/api-docs', 'api-docs added.');
            t.strictEqual(stack[1].route.path, '/v1/greetings/hello/:subject', 'hello added.');
        });

        app.use(child);
    });

    t.test('test no handlers', function (t) {
        t.plan(2);

        var app = express(), child = express();

        child.once('mount', function (parent) {
            var stack;

            expressroutes(app, {
                api: require('./fixtures/api.json'),
                docspath: '/api-docs',
                validators: [],
                routes: []
            });

            stack = Array.prototype.slice.call(parent._router.stack, 3);

            t.strictEqual(stack.length, 1, 'only api-docs route added.');
            t.strictEqual(stack[0].route.path, '/v1/greetings/api-docs', 'api-docs added.');
        });

        app.use(child);
    });

    t.test('test middlewares in handler', function (t) {
        t.plan(4);

        var app = express(), child = express();

        child.once('mount', function (parent) {
            var stack;

            expressroutes(app, {
                api: require('./fixtures/collections.json'),
                docspath: '/api-docs',
                routes: [
                    {
                        method: 'get',
                        path: '/middlewares',
                        validators: [],
                        handler: [
                            function m1(req, res, next) {},
                            function (req, res) {}
                        ]
                    }
                ]
            });

            stack = Array.prototype.slice.call(parent._router.stack, 3);

            t.strictEqual(stack.length, 2, '2 routes added.');
            t.strictEqual(stack[1].route.path, '/v1/collections/middlewares', '/middlewares added.');
            t.strictEqual(stack[1].route.stack.length, 2, '/middlewares has middleware.');
            t.strictEqual(stack[1].route.stack[0].name, 'm1', '/middlewares has middleware named m1.');
        });

        app.use(child);
    });
});
