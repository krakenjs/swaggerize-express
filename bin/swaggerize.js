#!/usr/bin/env node
'use strict';

var minimist = require('minimist'),
    fs = require('fs'),
    path = require('path'),
    schema = require('../lib/schema'),
    lodash = require('lodash');

var argv, validation, api, apiPath, modelsPath, handlersPath, modelTemplate, handlerTemplate;

function usage() {
    console.error('Usage: swaggerize --api [api] --models [models dir] --handlers [handlers dir]');
    process.exit(1);
}

function createModels(models, modelsPath) {
    var template = fs.readFileSync(modelTemplate);

    Object.keys(models).forEach(function (modelName) {
        var fileName, model;

        fileName = path.join(modelsPath, modelName.toLowerCase() + '.js');

        if (!fs.existsSync(fileName)) {
            model = models[modelName];
            fs.writeFileSync(fileName, lodash.template(template, model));
        }
        else {
            console.warn('%s already exists.', fileName);
        }
    });
}

function createHandlers(apis, handlersPath) {
    var template = fs.readFileSync(handlerTemplate);

    apis.forEach(function (api) {
        var routepath, pathnames, route, methods, file;

        routepath = api.path;
        route = {
            methods: []
        };
        pathnames = [];

        routepath.split('/').forEach(function (element) {
            if (element && element.indexOf('{') < 0) {
                pathnames.push(element);
            }
        });

        api.operations.forEach(function (operation) {
            route.methods.push({
                method: operation.method.toLowerCase(),
                name: operation.nickname
            });
        });

        file = path.join(handlersPath, pathnames[pathnames.length - 1] + '.js');

        if (pathnames.length > 1) {
            file = path.join(handlersPath, pathnames.slice(0, pathnames.length - 1).join('/'));

            if (fs.existsSync(file)) {
                console.warn('%s already exists.', file);
            }
            else {
                fs.mkdirSync(file);
            }

            file = path.join(handlersPath, pathnames.join('/') + '.js');
        }

        if (fs.existsSync(file)) {
            console.warn('%s already exists.', file);
        }
        else {
            fs.writeFileSync(file, lodash.template(template, route));
        }
    });
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

modelTemplate = path.join(__dirname, './templates/model.js');
handlerTemplate = path.join(__dirname, './templates/handler.js');

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

createModels(api.models, modelsPath);
createHandlers(api.apis, handlersPath);