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

    app.use(bodyParser.json());
    app.use(swagger);

    t.test('api', function (t) {
        t.plan(5);

        t.ok(app.hasOwnProperty('api'), 'has _api property.');
        t.ok(app.api, 'api is an object.');

        t.ok(app.hasOwnProperty('setHost'), 'has setHost property.');
        t.strictEqual(typeof app.setHost, 'function', 'setHost is a function.');

        app.setHost('localhost:8080');

        t.strictEqual(app.api.host, 'localhost:8080');
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

    app.use(bodyParser.json());

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

        request(app).post('/pets').send('').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 400, '400 status.');
        });
    });

});
