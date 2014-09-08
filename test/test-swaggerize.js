'use strict';

var test = require('tape'),
    swaggerize = require('../lib'),
    express = require('express'),
    bodyParser = require('body-parser'),
    request = require('supertest');

test.only('swagger valid input/output', function (t) {

    var app = express();
    var swagger = swaggerize({
        meta: require('./fixtures/api.json'),
        resources: [
            {
                api: require('./fixtures/resources/greetings.json')
            }
        ]
    });

    app.use(swagger);

    t.test('api', function (t) {
        t.plan(3);

        t.ok(swagger.hasOwnProperty('setUrl'), 'has setUrl property.');
        t.strictEqual(typeof swagger.setUrl, 'function', 'setUrl is a function.');

        swagger.setUrl('http://localhost:8080');

        t.strictEqual(swagger._api.basePath, 'http://localhost:8080/greetings');
    });

    t.test('docs', function (t) {
        t.plan(2);

        request(app).get('/greetings/').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/greetings/hello').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 404, '404 required param missing.');
        });
    });


    t.test('route', function (t) {
        t.plan(3);

        request(app).get('/greetings/hello/doge').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.text, 'hello', 'body is correct.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/greetings/sub/1').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('route', function (t) {
        t.plan(2);

        request(app).get('/greetings/sub/1/path').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

});

test('input validators', function (t) {

    var app = express();

    app.use(bodyParser());

    app.use(swaggerize({
        meta: require('./fixtures/api.json'),
        resources: [
            {
                api: require('./fixtures/resources/input.json'),
                handlers: {
                    sub: {
                        '{id}': {
                            $get: function (req, res) {
                                res.send('foobar');
                            }
                        }
                    },
                    goodbye: {
                        $get: function (req, res) {
                            res.send('baz');
                        }
                    },
                    test: {
                        '{id}': {
                            $get: function (req, res) {
                                res.send('get');
                            },
                            $post: function (req, res) {
                                res.send(typeof req.body);
                            },
                            $put: function (req, res) {
                                res.send(typeof req.body);
                            },
                            $delete: function (req, res) {
                                res.send(typeof req.body);
                            }
                        }
                    }
                }
            }
        ]
    }));

    t.test('bad input', function (t) {
        t.plan(2);

        request(app).get('/input/sub/asdf').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 400, '400 status.');
        });
    });

    t.test('null input not found', function (t) {
        t.plan(2);

        request(app).get('/input/goodbye').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 404, '404 status.');
        });
    });

    t.test('good query', function (t) {
        t.plan(2);

        request(app).get('/input/test/1?q1=foobar').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
        });
    });

    t.test('missing body', function (t) {
        t.plan(2);

        request(app).post('/input/test/1').send('').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 400, '400 status.');
        });
    });

    t.test('missing body with form', function (t) {
        t.plan(2);

        request(app).put('/input/test/1').send('').end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 400, '400 status.');
        });
    });

    t.test('coerce body', function (t) {
        t.plan(3);

        request(app).post('/input/test/1').send({hello: 'world'}).end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.text, 'string', 'coerced json to string.');
        });
    });

    t.test('coerce body with form', function (t) {
        t.plan(3);

        request(app).put('/input/test/1').send({param1: 'hello', param2: 'world'}).end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.text, 'string', 'coerced json to string.');
        });
    });

    t.test('body with form uses model', function (t) {
        t.plan(3);

        request(app).delete('/input/test/1').send({param1: 'hello', param2: 'world'}).end(function (error, response) {
            t.ok(!error, 'no error.');
            t.strictEqual(response.statusCode, 200, '200 status.');
            t.strictEqual(response.text, 'object', 'type came across as object.');
        });
    });

});
