'use strict';

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    schema = require('swaggerize-builder/lib/schema'),
    create = require('./create');

function usage() {
    console.error('swaggerize --api <swagger document> [[--models <models dir>] | [--handlers <handlers dir>] | [--tests <tests dir>]]');
    return 1;
}

function printValidationErrors(error) {
    console.error('%s (at %s)', error, error.dataPath || '/');
    if (error.subErrors) {
        error.subErrors.forEach(function (subError) {
            console.error('%s (at %s)', subError, subError.dataPath || '/');
        });
    }
}

module.exports = function (options) {
    var apiPath, modelsPath, handlersPath, testsPath, validation, api;

    apiPath = options.api;
    modelsPath = options.models;
    handlersPath = options.handlers;
    testsPath = options.tests;

    if (!apiPath || !(modelsPath || handlersPath || testsPath)) {
        return usage();
    }

    apiPath = path.resolve(apiPath);
    modelsPath && (modelsPath = path.resolve(modelsPath));
    handlersPath && (handlersPath = path.resolve(handlersPath));
    testsPath && (testsPath = path.resolve(testsPath));

    api = require(apiPath);

    validation = schema.validate(api);

    if (!validation.valid) {
        printValidationErrors(validation.error);
        return 1;
    }

    if (testsPath) {
        if (!handlersPath) {
            console.error('tests can not be generated without handlers path.');
            return usage();
        }
        if ((api.models && !modelsPath)) {
            console.error('api contains models, so tests can not be generated without handlers and models paths.');
            return usage();
        }
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

    return 0;
};
