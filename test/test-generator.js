'use strict';

var test = require('tape'),
    swaggerize = require('../bin/lib/swaggerize'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

test('swaggerize command', function (t) {

    mkdirp.sync(path.resolve('test/temp'));

    t.on('end', function () {
        function rm(dir) {
            var files = fs.readdirSync(dir);

            files && files.forEach(function (file) {
                var info = fs.statSync(file = path.join(dir, file));

                info.isFile() && fs.unlinkSync(file);
                info.isDirectory() && rm(file);
            });

            fs.rmdirSync(dir);
        }

        rm(path.resolve('test/temp'));
    });

    t.test('no handlers or models', function (t) {
        t.plan(1);

        var code = swaggerize({
            api: 'test/fixtures/resources/greetings.json'
        });

        t.strictEqual(code, 1, 'error code 1.');
    });

    t.test('tests but no handlers and models', function (t) {
        t.plan(1);

        var code = swaggerize({
            api: 'test/fixtures/resources/greetings.json',
            tests: '/test/temp/tests'
        });

        t.strictEqual(code, 1, 'error code 1.');
    });

    t.test('invalid schema fails', function (t) {
        t.plan(1);

        var code = swaggerize({
            api: 'test/fixtures/badapi.json',
            handlers: 'test/temp/handlers'
        });

        t.strictEqual(code, 1, 'error code 1.');
    });

    t.test('handlers', function (t) {
        t.plan(9);

        var code = swaggerize({
            api: 'test/fixtures/resources/greetings.json',
            handlers: 'test/temp/handlers'
        });

        t.ok(!code, 'no error code.');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers')), 'handlers dir exists');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers/goodbye')), 'goodbye dir exists');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers/goodbye/{subject}.js')), 'goodbye/{subject}.js exists');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers/hello/{subject}.js')), 'hello/{subject}.js exists');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers/sub')), 'sub dir exists');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers/sub/{id}.js')), 'sub/{id}.js exists');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers/sub/{id}')), 'sub/{id} dir exists');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers/sub/{id}/path.js')), 'sub/{id}/path.js exists');
    });

    t.test('models', function (t) {
        t.plan(3);

        var code = swaggerize({
            api: 'test/fixtures/resources/greetings.json',
            models: 'test/temp/models'
        });

        t.ok(!code, 'no error code.');
        t.ok(fs.existsSync(path.resolve('test/temp/models')), 'models dir exists');
        t.ok(fs.existsSync(path.resolve('test/temp/models/user.js')), 'user.js exists');
    });

    t.test('tests', function (t) {
        t.plan(6);

        var code = swaggerize({
            api: 'test/fixtures/resources/greetings.json',
            handlers: 'test/temp/handlers',
            models: 'test/temp/models',
            tests: 'test/temp/tests'
        });

        t.ok(!code, 'no error code.');
        t.ok(fs.existsSync(path.resolve('test/temp/tests')), 'tests dir exists');
        t.ok(fs.existsSync(path.resolve('test/temp/tests/test_goodbye_{subject}.js')), 'test_goodbye_{subject}.js exists');
        t.ok(fs.existsSync(path.resolve('test/temp/tests/test_hello_{subject}.js')), 'test_hello_{subject}.js exists');
        t.ok(fs.existsSync(path.resolve('test/temp/tests/test_sub_{id}.js')), 'test_sub_{id}.js exists');
        t.ok(fs.existsSync(path.resolve('test/temp/tests/test_sub_{id}_path.js')), 'test_sub_{id}_path.js exists');
    });

});
