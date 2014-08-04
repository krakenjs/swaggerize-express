#!/usr/bin/env node
'use strict';

var minimist = require('minimist'),
    fs = require('fs'),
    path = require('path'),
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
    var dir;

    if (!filePath) {
        return;
    }

    dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        console.error('Directory %s does not exist.', dir);
        process.exit(1);
        return;
    }
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }
});

modelsPath && create.models(api.models, modelsPath);
handlersPath && create.handlers(api.apis, handlersPath);
testsPath && create.tests(api, testsPath, apiPath, handlersPath);