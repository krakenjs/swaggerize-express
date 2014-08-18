#!/usr/bin/env node
'use strict';

var minimist = require('minimist'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    schema = require('swaggerize-express/lib/schema'),
    create = require('swaggerize-express/bin/lib/create');

var argv, validation, api, apiPath, modelsPath, handlersPath, testsPath;

function usage() {
    console.error('swaggerize --api <swagger document> [[--models <models dir>] | [--handlers <handlers dir>] | [--tests <tests dir>]]');
    process.exit(1);
}

argv = minimist(process.argv.slice(2));

apiPath = argv.api;
modelsPath = argv.models;
handlersPath = argv.handlers;
testsPath = argv.tests;

if (!apiPath || !(modelsPath || handlersPath || testsPath)) {
    usage();
    return;
}

if (testsPath && !(handlersPath && modelsPath)) {
    console.error('tests can not be generated without handlers and models.');
    usage();
    return;
}

apiPath = path.resolve(apiPath);
modelsPath && (modelsPath = path.resolve(modelsPath));
handlersPath && (handlersPath = path.resolve(handlersPath));
testsPath && (testsPath = path.resolve(testsPath));

api = require(apiPath);

validation = schema.validate(api);

if (!validation.valid) {
    console.error(validation.error.message);
    process.exit(1);
    return;
}

[apiPath, modelsPath, handlersPath, testsPath].forEach(function (filePath) {
    if (!filePath) {
        return;
    }

    if (!fs.existsSync(filePath)) {
        mkdirp.sync(filePath);
    }
});

modelsPath && create.models(api.models, modelsPath);
handlersPath && create.handlers(api.apis, handlersPath);

testsPath && create.tests(api, testsPath, apiPath, handlersPath, modelsPath);

