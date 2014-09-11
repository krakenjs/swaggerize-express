'use strict';

var test = require('tape'),
    swaggerize = require('../lib'),
    express = require('express'),
    bodyParser = require('body-parser'),
    request = require('supertest'),
    path = require('path');

test('swaggerize', function (t) {

    var app = express();

    var swagger = swaggerize({
        api: require('./fixtures/defs/pets.json'),
        handlers: path.join(__dirname, 'fixtures/handlers')
    });

    app.use(bodyParser());
    app.use(swagger);

    t.test('api', function (t) {
        t.plan(5);

        t.ok(swagger.hasOwnProperty('_api'), 'has _api property.');
        t.ok(swagger._api, '_api is an object.');

        t.ok(swagger.hasOwnProperty('setHost'), 'has setHost property.');
        t.strictEqual(typeof swagger.setHost, 'function', 'setHost is a function.');

        swagger.setHost('localhost:8080');

        t.strictEqual(swagger._api.host, 'localhost:8080');
    });

    t.test('docs', function (t) {
        t.plan(2);

        request(app).get('/api-docs').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('post /pets', function (t) {
        t.plan(3);

        request(app).post('/pets').send({id: 0, name: 'Cat'}).end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.body.name, 'Cat', 'body is correct.');
        });
    });

    t.test('get /pets', function (t) {
        t.plan(3);

        request(app).get('/pets').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.body.length, 1, 'body is correct.');
        });
    });

    t.test('get /pets/:id', function (t) {
        t.plan(3);

        request(app).get('/pets/0').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.body.name, 'Cat', 'body is correct.');
        });
    });

    t.test('delete /pets', function (t) {
        t.plan(3);

        request(app).delete('/pets/0').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.body.length, 0, 'body is correct.');
        });
    });

});

test('input validation', function (t) {

    var app = express();

    app.use(bodyParser());

    app.use(swaggerize({
        api: require('./fixtures/defs/pets.json'),
        handlers: {
            'pets': {
                '{id}': {
                    $get: function (req, res) {

                    },
                    $delete: function (req, res) {
                        res.send(typeof req.body);
                    }
                },
                $get: function (req, res) {
                    res.json({
                        id: 0,
                        name: 'Cat',
                        tags: req.param('tags')
                    });
                },
                $post: function (req, res) {
                    res.send(typeof req.body);
                }
            }
        }
    }));

    t.test('good query', function (t) {
        t.plan(3);

        request(app).get('/pets?tags=kitty,serious').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.body.tags.length, 2, 'query parsed.');
        });
    });

    t.test('missing body', function (t) {
        t.plan(2);

        request(app).post('/pets').send().end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 400, '400 status.');
        });
    });

    t.test('invalid body model', function (t) {
        t.plan(2);

        request(app).post('/pets').send({foo: 'bar'}).end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 400, '400 status.');
        });
    });

    //
    // t.test('coerce body', function (t) {
    //     t.plan(3);
    //
    //     request(app).post('/v1/test/1').send({hello: 'world'}).end(function (error, response) {
    //         t.ok(!error, 'no error.');
    //         t.strictEqual(response.statusCode, 200, '200 status.');
    //         t.strictEqual(response.text, 'string', 'coerced json to string.');
    //     });
    // });
    //
    // t.test('coerce body with form', function (t) {
    //     t.plan(3);
    //
    //     request(app).put('/v1/test/1').send({param1: 'hello', param2: 'world'}).end(function (error, response) {
    //         t.ok(!error, 'no error.');
    //         t.strictEqual(response.statusCode, 200, '200 status.');
    //         t.strictEqual(response.text, 'string', 'coerced json to string.');
    //     });
    // });
    //
    // t.test('body with form uses model', function (t) {
    //     t.plan(3);
    //
    //     request(app).delete('/v1/test/1').send({param1: 'hello', param2: 'world'}).end(function (error, response) {
    //         t.ok(!error, 'no error.');
    //         t.strictEqual(response.statusCode, 200, '200 status.');
    //         t.strictEqual(response.text, 'object', 'type came across as object.');
    //     });
    // });

});
