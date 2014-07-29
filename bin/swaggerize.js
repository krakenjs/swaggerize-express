#!/usr/bin/env node
'use strict';

var minimist = require('minimist'),
    fs = require('fs'),
    path = require('path'),
    schema = require('swaggerize-express/lib/schema'),
    create = require('swaggerize-express/bin/lib/create');

var argv, validation, api, apiPath, modelsPath, handlersPath;

function usage() {
    console.error('Usage: swaggerize --api [api] --models [models dir] --handlers [handlers dir]');
    process.exit(1);
}

argv = minimist(process.argv.slice(2));

apiPath = argv.api;
modelsPath = argv.models;
handlersPath = argv.handlers;

if (!apiPath || !(modelsPath || handlersPath)) {
    usage();
    return;
}

apiPath = path.resolve(apiPath);
modelsPath && (modelsPath = path.resolve(modelsPath));
handlersPath && (handlersPath = path.resolve(handlersPath));

[apiPath, modelsPath, handlersPath].forEach(function (filePath) {
    var dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        console.error('Directory %s does not exist.', dir);
        process.exit(1);
        return;
    }
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }
});

api = require(apiPath);

validation = schema.validate(api);

if (!validation.valid) {
    console.error(validation.error.message);
    process.exit(1);
    return;
}

create.models(api.models, modelsPath);
create.handlers(api.apis, handlersPath);