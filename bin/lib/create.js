'use strict';

var fs = require('fs'),
    path = require('path'),
    lodash = require('lodash');

var modelTemplate, handlerTemplate;

modelTemplate = path.join(__dirname, './templates/model.js');
handlerTemplate = path.join(__dirname, './templates/handler.js');

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
    var routes, template;

    routes = {};
    template = fs.readFileSync(handlerTemplate);

    apis.forEach(function (api) {
        var pathnames, route, methods, file;

        route = {
            methods: []
        };
        pathnames = [];

        api.path.split('/').forEach(function (element) {
            if (element && element.indexOf('{') < 0) {
                pathnames.push(element);
            }
        });

        route.path = pathnames.join('/');

        api.operations.forEach(function (operation) {
            route.methods.push({
                method: operation.method.toLowerCase(),
                name: operation.nickname
            });
        });

        if (routes[route.path]) {
            routes[route.path].methods.push.apply(routes[route.path].methods, route.methods);
            return;
        }

        routes[route.path] = route;
    });

    Object.keys(routes).forEach(function (routePath) {
        var pathnames, route, file;

        route = routes[routePath];
        pathnames = route.path.split('/');

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

module.exports = {
    handlers: createHandlers,
    models: createModels
};