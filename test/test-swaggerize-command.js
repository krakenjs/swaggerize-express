'use strict';

var test = require('tape'),
    execFile = require('child_process').execFile,
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

test('swaggerize command', function (t) {
    var cwd = process.cwd();

    mkdirp.sync(path.resolve('test/temp'));

    process.chdir(path.resolve('test/fixtures'));

    t.on('end', function () {
        process.chdir(cwd);

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

    t.test('npm devDependencies', function (t) {
        t.plan(5);

        execFile('../../bin/swaggerize.js', ['--api', 'api.json', '--handlers', '../temp/handlers', '--models', '../temp/models', '--tests', '../temp/tests'], function (error, stdout, stderr) {
            var pkg;

            stdout && console.log(stdout.toString());
            stderr && console.log(stderr.toString());
            error && console.error(error);

            t.ok(!error, 'no error.');

            pkg = require(path.join(__dirname, 'fixtures/package.json'));

            t.ok(pkg.devDependencies, 'devDependencies exists.');
            t.ok(pkg.devDependencies.tape, 'tape exists.');
            t.ok(pkg.devDependencies['body-parser'], 'body-parser exists.');
            t.ok(pkg.devDependencies.supertest, 'supertest exists.');
        });
    });

});
