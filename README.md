swaggerize-express
==================

Lead Maintainer: [Trevor Livingston](https://github.com/tlivings/)  

[![Build Status](https://travis-ci.org/krakenjs/swaggerize-express.svg?branch=master)](https://travis-ci.org/krakenjs/swaggerize-express)  
[![NPM version](https://badge.fury.io/js/swaggerize-express.png)](http://badge.fury.io/js/swaggerize-express)  

`swaggerize-express` is a design-driven approach to building RESTful apis with [Swagger](http://swagger.io) and [Express](http://expressjs.com).

`swaggerize-express` provides the following features:

- API schema validation.
- Routes based on the Swagger document.
- API documentation route.
- Input validation.

See also:
- [swaggerize-routes](https://github.com/krakenjs/swaggerize-routes)
- [swaggerize-hapi](https://github.com/krakenjs/swaggerize-hapi)
- [generator-swaggerize](https://www.npmjs.org/package/generator-swaggerize)

### Why "Design Driven"

There are already a number of modules that help build RESTful APIs for node with swagger. However,
these modules tend to focus on building the documentation or specification as a side effect of writing
the application business logic.

`swaggerize-express` begins with the swagger document first. This facilitates writing APIs that are easier to design, review, and test.

### Quick Start with a Generator

This guide will let you go from an `api.json` to a service project in no time flat.

First install `generator-swaggerize` (and `yo` if you haven't already):

```bash
$ npm install -g yo
$ npm install -g generator-swaggerize
```

Now run the generator.

```bash
$ mkdir petstore && cd $_
$ yo swaggerize
```

Follow the prompts (note: make sure to choose `express` as your framework choice).

When asked for a swagger document, you can try this one:

```
https://raw.githubusercontent.com/wordnik/swagger-spec/master/examples/v2.0/json/petstore.json
```

You now have a working api and can use something like [Swagger UI](https://github.com/wordnik/swagger-ui) to explore it.

### Manual Usage

```javascript
var swaggerize = require('swaggerize-express');

app.use(swaggerize({
    api: require('./api.json'),
    docspath: '/api-docs',
    handlers: './handlers'
}));
```

Options:

- `api` - a valid Swagger 2.0 document.
- `docspath` - the path to expose api docs for swagger-ui, etc. Defaults to `/`.
- `handlers` - either a directory structure for route handlers or a premade object (see *Handlers Object* below).
- `express` - express settings overrides.

After using this middleware, a new property will be available on the `app` called `swagger`, containing the following properties:

- `api` - the api document.
- `routes` - the route definitions based on the api document.

Example:

```javascript
var http = require('http');
var express = require('express');
var swaggerize = require('swaggerize-express');

app = express();

var server = http.createServer(app);

app.use(swaggerize({
    api: require('./api.json'),
    docspath: '/api-docs',
    handlers: './handlers'
}));

server.listen(port, 'localhost', function () {
    app.swagger.api.host = server.address().address + ':' + server.address().port;
});
```

### Mount Path

Api `path` values will be prefixed with the swagger document's `basePath` value.

### Handlers Directory

The `options.handlers` option specifies a directory to scan for handlers. These handlers are bound to the api `paths` defined in the swagger document.

```
handlers
  |--foo
  |    |--bar.js
  |--foo.js
  |--baz.js
```

Will route as:

```
foo.js => /foo
foo/bar.js => /foo/bar
baz.js => /baz
```

### Path Parameters

The file and directory names in the handlers directory can also represent path parameters.

For example, to represent the path `/users/{id}`:

```shell
handlers
  |--users
  |    |--{id}.js
```

This works with directory names as well:

```shell
handlers
  |--users
  |    |--{id}.js
  |    |--{id}
  |        |--foo.js
```

To represent `/users/{id}/foo`.

### Handlers File

Each provided javascript file should export an object containing functions with HTTP verbs as keys.

Example:

```javascript
module.exports = {
    get: function (req, res) { ... },
    put: function (req, res) { ... },
    ...
}
```

### Handler Middleware

Handlers can also specify middleware chains by providing an array of handler functions under the verb:

```javascript
module.exports = {
    get: [
        function m1(req, res, next) { ... },
        function m2(req, res, next) { ... },
        function handler(req, res)  { ... }
    ],
    ...
}
```

### Handlers Object

The directory generation will yield this object, but it can be provided directly as `options.handlers`.

Note that if you are programatically constructing a handlers obj this way, you must namespace HTTP verbs with `$` to
avoid conflicts with path names. These keys should also be *lowercase*.

Example:

```javascript
{
    'foo': {
        '$get': function (req, res) { ... },
        'bar': {
            '$get': function (req, res) { ... },
            '$post': function (req, res) { ... }
        }
    }
    ...
}
```

Handler keys in files do *not* have to be namespaced in this way.

### Security Middleware

If a security definition exists for a path in the swagger document, and an appropriate authorize function exists (defined using
`x-authorize` in the `securityDefinitions` as per [swaggerize-routes](https://github.com/krakenjs/swaggerize-routes#security-object)),
then it will be used as middleware for that path.

In addition, a `requiredScopes` property will be injected onto the `request` object to check against.

For example:

```javascript
//x-authorize: auth_oauth.js
function authorize(req, res, next) {
    validate(req, function (error, availablescopes) {
        if (!error) {
            for (var i = 0; i < req.requiredScopes.length; i++) {
                if (availablescopes.indexOf(req.requiredScopes[i]) > -1) {
                    next();
                    return;
                }
            }

            error = new Error('Do not have the required scopes.');
            error.status = 403;

            next(error);
            return;
        }

        next(error);
    });
}
```
