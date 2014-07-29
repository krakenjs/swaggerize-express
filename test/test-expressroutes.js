'use strict';

var test = require('tape'),
    expressroutes = require('../lib/expressroutes'),
    express = require('express'),
    request = require('supertest');

test('express routes', function (t) {

    t.test('test api', function (t) {
        t.plan(6);

        var app = express(), child = express();

        child.once('mount', function (parent) {
            var stack;

            expressroutes(app, '/test', {
                api: require('./fixtures/api.json'),
                handlers: require('path').join(__dirname, 'handlers')
            });

            stack = Array.prototype.slice.call(parent._router.stack, 3);

            t.strictEqual(stack.length, 5, 'routes added.');
            t.strictEqual(stack[0].route.path, '/test/api-docs', 'api-docs added.');
            t.strictEqual(stack[1].route.path, '/test/hello/:subject?', 'hello added.');
            t.strictEqual(stack[2].route.path, '/test/sub/:id?', 'sub added.');
            t.strictEqual(stack[3].route.path, '/test/sub/:id?', 'sub added (head).');
            t.strictEqual(stack[4].route.path, '/test/sub/:id?/path', 'sub/path added.');
        });

        app.use(child);
    });

    t.test('test no handlers', function (t) {
        t.plan(2);

        var app = express(), child = express();

        child.once('mount', function (parent) {
            var stack;

            expressroutes(app, '/test', {
                api: require('./fixtures/api.json'),
                handlers: {

                }
            });

            stack = Array.prototype.slice.call(parent._router.stack, 3);

            t.strictEqual(stack.length, 1, 'only api-docs route added.');
            t.strictEqual(stack[0].route.path, '/test/api-docs', 'api-docs added.');;
        });

        app.use(child);
    });
});