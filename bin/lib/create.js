'use strict';

var fs = require('fs'),
    path = require('path'),
    lodash = require('lodash'),
    mkdirp = require('mkdirp'),
    utils = require('swaggerize-builder/lib/utils');

var modelTemplate, handlerTemplate, testTemplate;

modelTemplate = path.join(__dirname, './templates/model.js');
handlerTemplate = path.join(__dirname, './templates/handler.js');
testTemplate = path.join(__dirname, './templates/test.js');

function createModels(models, modelsPath) {
    var template = fs.readFileSync(modelTemplate);

    Object.keys(models).forEach(function (modelName) {
        var fileName, model;

        fileName = path.join(modelsPath, modelName.toLowerCase() + '.js');

        if (!fs.existsSync(fileName)) {
            model = models[modelName];
            mkdirp.sync(path.dirname(fileName));
            if (!model.id) {
                model.id = modelName;
            }
            fs.writeFileSync(fileName, lodash.template(template, model));
        }
        else {
            console.warn('%s already exists.', fileName);
        }
    });
}

function createHandlers(paths, handlersPath) {
    var routes, template;

    routes = {};
    template = fs.readFileSync(handlerTemplate);

    Object.keys(paths).forEach(function (path) {
        var pathnames, route;

        route = {
            path: path,
            pathname: undefined,
            methods: []
        };

        pathnames = [];

        path.split('/').forEach(function (element) {
            if (element) {
                pathnames.push(element);
            }
        });

        route.pathname = pathnames.join('/');

        utils.verbs.forEach(function (verb) {
            var operation = paths[path][verb];

            if (!operation) {
                return;
            }

            route.methods.push({
                method: verb,
                name: operation.operationId || '',
                description: operation.description || '',
                parameters: operation.parameters || [],
                produces: operation.produces || []
            });
        });

        if (routes[route.pathname]) {
            routes[route.pathname].methods.push.apply(routes[route.pathname].methods, route.methods);
            return;
        }

        routes[route.pathname] = route;
    });

    Object.keys(routes).forEach(function (routePath) {
        var pathnames, route, file;

        route = routes[routePath];
        pathnames = route.pathname.split('/');

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

        if (!fs.existsSync(file)) {
            mkdirp.sync(path.dirname(file));
            fs.writeFileSync(file, lodash.template(template, route));
            return;
        }

        console.warn('%s already exists.', file);
    });
}

function createTests(api, testsPath, apiPath, handlersPath, modelsPath) {
    var models, template, resourcePath;

    models = {};
    template = fs.readFileSync(testTemplate);

    apiPath = path.relative(testsPath, apiPath);
    handlersPath = path.relative(testsPath, handlersPath);

    if (api.definitions && modelsPath) {

        Object.keys(api.definitions).forEach(function (key) {
            var modelSchema, ModelCtor, options;

            options = {};
            modelSchema = api.definitions[key];
            ModelCtor = require(path.join(modelsPath, key.toLowerCase() + '.js'));

            Object.keys(modelSchema.properties).forEach(function (prop) {
                var defaultValue;

                switch (modelSchema.properties[prop].type) {
                    case 'integer':
                    case 'float':
                    case 'long':
                    case 'double':
                    case 'byte':
                        defaultValue = 1;
                        break;
                    case 'string':
                        defaultValue = 'helloworld';
                        break;
                    case 'boolean':
                        defaultValue = true;
                        break;
                    default:
                        break;
                }

                options[prop] = defaultValue;
            });

            models[key] = new ModelCtor(options);
        });

    }

    resourcePath = api.basePath;

    Object.keys(api.paths).forEach(function (opath) {
        var fileName, operations;

        operations = [];

        utils.verbs.forEach(function (verb) {
            var operation = {};

            if (!api.paths[opath][verb]) {
                return;
            }

            Object.keys(api.paths[opath][verb]).forEach(function (key) {
                operation[key] = api.paths[opath][verb][key];
            });

            operation.path = opath;
            operation.method = verb;

            operations.push(operation);
        });

        fileName = path.join(testsPath, 'test' + opath.replace(/\//g, '_') + '.js');

        if (!fs.existsSync(fileName)) {
            fs.writeFileSync(fileName, lodash.template(template, {
                apiPath: apiPath,
                handlers: handlersPath,
                resourcePath: resourcePath,
                operations: operations,
                models: models
            }));

            return;
        }

        console.warn('%s already exists.', fileName);
    });
}

module.exports = {
    handlers: createHandlers,
    models: createModels,
    tests: createTests
};
