'use strict';

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    enjoi = require('enjoi'),
    create = require('./create');

module.exports = function (options) {
    var apiPath, modelsPath, handlersPath, testsPath, api;

    function usage() {
        console.error('swaggerize --api <swagger document> [[--models <models dir>] | [--handlers <handlers dir>] | [--tests <tests dir>]]');
        return 1;
    }

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

    try {
        validate(api);
    }
    catch (e) {
        console.error('schema validation failed.');
        for (var i = 0; i < (e.details || []).length; i++) {
            console.error('%s (at %s).', e.details[i].message, e.details[i].path);
        }
        return 1;
    }



    if (testsPath) {
        if (!handlersPath) {
            console.error('tests can not be generated without handlers path.');
            return usage();
        }
        if ((api.definitions && !modelsPath)) {
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

    modelsPath && create.models(api.definitions, modelsPath);
    handlersPath && create.handlers(api.paths, handlersPath);

    testsPath && create.tests(api, testsPath, apiPath, handlersPath, modelsPath);

    return 0;
};

function validate(api, callback) {
    var schema;

    schema = enjoi(require('swaggerize-builder/lib/schema/swagger-spec/schemas/v2.0/schema.json'));

    schema.validate(api, function (error) {
        assert.ifError(error);
    });
}
