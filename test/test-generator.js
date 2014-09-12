'use strict';

var test = require('tape'),
    swaggerize = require('../bin/lib/swaggerize'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

function rm(dir) {
    var files = fs.readdirSync(dir);

    files && files.forEach(function (file) {
        var info = fs.statSync(file = path.join(dir, file));

        info.isFile() && fs.unlinkSync(file);
        info.isDirectory() && rm(file);
    });

    fs.rmdirSync(dir);
}

test('swaggerize command', function (t) {
    var tempDir = path.resolve('test/temp');

    fs.existsSync(tempDir) && rm(tempDir);

    mkdirp.sync(tempDir);

    t.on('end', function () {
        rm(tempDir);
    });

    t.test('no handlers or models', function (t) {
        t.plan(1);

        var code = swaggerize({
            api: 'test/fixtures/defs/pets.json'
        });

        t.strictEqual(code, 1, 'error code 1.');
    });

    t.test('tests but no handlers and models', function (t) {
        t.plan(1);

        var code = swaggerize({
            api: 'test/fixtures/defs/pets.json',
            tests: '/test/temp/tests'
        });

        t.strictEqual(code, 1, 'error code 1.');
    });

    t.test('invalid schema fails', function (t) {
        t.plan(1);

        var code = swaggerize({
            api: 'test/fixtures/defs/badapi.json',
            handlers: 'test/temp/handlers'
        });

        t.strictEqual(code, 1, 'error code 1.');
    });

    t.test('handlers', function (t) {
        t.plan(5);

        var code = swaggerize({
            api: 'test/fixtures/defs/pets.json',
            handlers: 'test/temp/handlers'
        });

        t.ok(!code, 'no error code.');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers')), 'handlers dir exists');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers/pets')), 'pets dir exists');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers/pets/{id}.js')), 'pets/{id}.js exists');
        t.ok(fs.existsSync(path.resolve('test/temp/handlers/pets.js')), 'pets.js exists');
    });

    t.test('models', function (t) {
        t.plan(4);

        var code = swaggerize({
            api: 'test/fixtures/defs/pets.json',
            models: 'test/temp/models'
        });

        t.ok(!code, 'no error code.');
        t.ok(fs.existsSync(path.resolve('test/temp/models')), 'models dir exists');
        t.ok(fs.existsSync(path.resolve('test/temp/models/Pet.js')), 'user.js exists');
        t.ok(fs.existsSync(path.resolve('test/temp/models/Error.js')), 'user.js exists');
    });

    t.test('tests', function (t) {
        t.plan(4);

        var code = swaggerize({
            api: 'test/fixtures/defs/pets.json',
            handlers: 'test/temp/handlers',
            models: 'test/temp/models',
            tests: 'test/temp/tests'
        });

        t.ok(!code, 'no error code.');
        t.ok(fs.existsSync(path.resolve('test/temp/tests')), 'tests dir exists');
        t.ok(fs.existsSync(path.resolve('test/temp/tests/test_pets_{id}.js')), 'test_goodbye_{subject}.js exists');
        t.ok(fs.existsSync(path.resolve('test/temp/tests/test_pets.js')), 'test_hello_{subject}.js exists');
    });

});
