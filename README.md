[![Build Status](https://travis-ci.org/krakenjs/swaggerize-express.png)](https://travis-ci.org/krakenjs/swaggerize-express) [![NPM version](https://badge.fury.io/js/swaggerize-express.png)](http://badge.fury.io/js/swaggerize-express)

# swaggerize-express

`swaggerize-express` is a "spec first" approach to building RESTful services with a [Swagger spec](https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md)
and Express.

`swaggerize-express` provides the following features:

- Schema validation.
- Express routes binding.
- API documentation route.
- Input model validation.
- Output model validation (optional).
- Models and handlers stubs generator command (`swaggerize`).

`swaggerize-express` is currently `pre-release` and as a result may change without warning.

### Why "Spec First"

There are already a number of modules that help build REST services with express and swagger. However, 
these modules tend to focus on building the documentation or specification as a side effect of writing 
the application business logic.

`swaggerize-express` begins with the service specification first. This facilitates writing services that 
are easier to design, review, and test.

### Usage

```javascript
var swaggerize = require('swaggerize-express');

app.use(swaggerize({
    api: require('./api.json'),
    docs: '/api-docs',
    handlers: './handlers'
));
```

Options:

- `api` - a valid Swagger 1.2 document.
- `docs` - the path to expose api docs for swagger-ui, etc. Defaults to `/api-docs`.
- `handlers` - either a directory structure for route handlers or a premade object (see *Handlers Object* below).
- `outputvalidation` - `true` to enable output validation for handlers; generally for dev/test.  

The base url for the api can also be updated via the `setUrl` function on the middleware.

Example:

```javascript
var http = require('http');
var express = require('express');
var swaggerize = require('swaggerize-express');

app = express();

var server = http.createServer(app);

var swagger = swaggerize({
    api: require('./api.json'),
    docs: '/api-docs',
    handlers: './handlers',
    outputvalidation: app.settings.env === 'development'
});

app.use(swagger);

server.listen(port, 'localhost', function () {
    swagger.setUrl('http://' + server.address().address + ':' + server.address().port);
});
```

### Mount Path

Api `path` values will be prefixed with the swagger document's `resourcePath` value.

### Handlers Directory

```
handlers
  |--foo
  |    |--bar.js
  |--foo.js
  |--baz.js
```

Matches:

- `foo.js : /foo`
- `foo/bar.js : /foo/bar`
- `baz.js : /baz`

### Path Parameters

The file and directory names in the handlers directory can represent path parameters.

For example, to represent the path `/users/{id}`:

```shell
handlers
  |--users
  |    |--{id}.js
```

This works with sub-resources as well:

```shell
handlers
  |--users
  |    |--{id}.js
  |    |--{id}
  |        |--foo.js
```

To represent `/users/{id}/foo`.

### Handlers File

Each provided javascript file should follow the format of:

```javascript
module.exports = {
    get: function (req, reply) { ... },
    put: function (req, reply) { ... },
    ...
}
```

Where each http method has a handler.

### Handlers Object

The directory generation will yield this object, but it can be provided directly as `options.handlers` as well:

```javascript
{
    'foo': {
        '$get': function (req, reply) { ... },
        'bar': {
            '$get': function (req, reply) { ... },
            '$post': function (req, reply) { ... }
        }
    }
    ...
}
```

Note that if you are programatically constructing a handlers obj, you must namespace *http methods* with `$` to 
avoid conflicts with path names. These keys should also be *lowercase*.

Handler keys in files do *not* have to be namespaced in this way.

### Generator

You can generate models and handlers stubs by running the following command:

```shell
swaggerize --api <swagger document> [--models <models dir> AND/OR--handlers <handlers dir>] [--tests <tests dir>]
```

Example:

```shell
swaggerize --api config/api.json --models resources/models --handlers resources/handlers --tests tests/
```

`--api` is required, but only one of `--models` or `--handlers` is required.

### Handler Signature

The arguments passed to a handler function are:

- `req` - the `request` object.
- `reply` - a wrapper of `res.send` in express that provides output model validation.

### Reply Function

The `reply` function is provided to allow for model validation and error handling without monkey patching `res.send` 
(or requiring `res.send` to be used vs `res.json`, etc). In addition to acting as a `res.send` method, it also provides 
the following convenience properties:

- `_raw` - the raw `response` object.
- `next()` - acts as `res.next()`.
- `redirect(url)` - acts as `res.redirect`.