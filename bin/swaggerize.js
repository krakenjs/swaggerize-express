#!/usr/bin/env node
'use strict';

var minimist = require('minimist'),
    swaggerize = require('./lib/swaggerize'),
    spawn = require('child_process').spawn;

var swaggerize, result, args, npm;

args = minimist(process.argv.slice(2));

result = swaggerize(args);

if (result === 0 && args.tests) {
    npm = spawn('npm', ['install', '--save-dev', 'tape', 'body-parser', 'supertest']);

    npm.stdout.pipe(process.stdout);
    npm.stderr.pipe(process.stdout);

    npm.on('close', function (code) {
        process.exit(code);
    });

    return;
}

process.exit(result);