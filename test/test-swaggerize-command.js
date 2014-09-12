'use strict';

var test = require('tape'),
    execFile = require('child_process').execFile,
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
    var cwd, writeStream, tempDir;

    cwd = process.cwd();

    tempDir = path.resolve('test/temp');

    fs.existsSync(tempDir) && rm(tempDir);

    mkdirp.sync(tempDir);

    process.chdir(tempDir);

    writeStream = fs.createWriteStream('package.json');

    writeStream.on('finish', function () {

        t.on('end', function () {
            process.chdir(cwd);
            rm(tempDir);
        });

        t.test('npm devDependencies', function (t) {
            t.plan(5);

            execFile('../../bin/swaggerize.js', ['--api', '../fixtures/defs/pets.json', '--handlers', 'handlers', '--models', 'models', '--tests', 'tests'], function (error, stdout, stderr) {
                var pkg;

                error && console.error(error);

                t.ok(!error, 'no error.');

                pkg = require(path.join(__dirname, 'temp/package.json'));

                t.ok(pkg.devDependencies, 'devDependencies exists.');
                t.ok(pkg.devDependencies.tape, 'tape exists.');
                t.ok(pkg.devDependencies['body-parser'], 'body-parser exists.');
                t.ok(pkg.devDependencies.supertest, 'supertest exists.');
            });
        });
    });

    fs.createReadStream('../fixtures/package.json').pipe(writeStream);
});
