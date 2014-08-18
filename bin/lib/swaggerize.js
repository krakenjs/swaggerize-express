'use strict';

var minimist = require('minimist'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    schema = require('../../lib/schema'),
    create = require('./create');

module.exports = function (argp) {
    var argv, apiPath, modelsPath, handlersPath, testsPath, validation, api;

    function usage() {
        console.error('swaggerize --api <swagger document> [[--models <models dir>] | [--handlers <handlers dir>] | [--tests <tests dir>]]');
        return 1;
    }

    argv = minimist(argp.slice(2));

    apiPath = argv.api;
    modelsPath = argv.models;
    handlersPath = argv.handlers;
    testsPath = argv.tests;

    if (!apiPath || !(modelsPath || handlersPath || testsPath)) {
        return usage();
    }

    if (testsPath && !(handlersPath && modelsPath)) {
        console.error('tests can not be generated without handlers and models.');
        return usage();
    }

    apiPath = path.resolve(apiPath);
    modelsPath && (modelsPath = path.resolve(modelsPath));
    handlersPath && (handlersPath = path.resolve(handlersPath));
    testsPath && (testsPath = path.resolve(testsPath));

    api = require(apiPath);

    validation = schema.validate(api);

    if (!validation.valid) {
        console.error(validation.error.message);
        return 1;
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
