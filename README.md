[![Build Status](https://travis-ci.org/krakenjs/swaggerize-express.png)](https://travis-ci.org/krakenjs/swaggerize-express) [![NPM version](https://badge.fury.io/js/swaggerize-express.png)](http://badge.fury.io/js/swaggerize-express)

# swaggerize-express

- **Stability:** `stable`
- **Changelog:** [https://github.com/krakenjs/swaggerize-express/blob/master/CHANGELOG.md](https://github.com/krakenjs/swaggerize-express/blob/master/CHANGELOG.md)

`swaggerize-express` is a "design first" approach to building RESTful services with a [Swagger spec](https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md)
and Express.

`swaggerize-express` provides the following features:

- Schema validation.
- Express routes binding.
- API documentation route.
- Input model validation.
- Models and handlers stubs generator command (`swaggerize`).

### Why "Design First"

There are already a number of modules that help build REST services with express and swagger. However,
these modules tend to focus on building the documentation or specification as a side effect of writing
the application business logic.

`swaggerize-express` begins with the service definition. This facilitates writing services that
are easier to design, review, and test.

### Installation

```
$ npm install swaggerize-express@^2.0.0
```

### Usage

```javascript
var swaggerize = require('swaggerize-express');

app.use(swaggerize({
    listing: require('./fixtures/api.json'),
    resources: [
        {
            api: require('./fixtures/resources/greetings.json'),
            handlers: path.join(__dirname, './handlers')
        }
    ],
    docspath: '/api-docs'
}));
```

Options:

- `listing` - a valid Swagger 1.2 resource listing document.
- `docspath` - the path to expose api docs for swagger-ui, etc. Defaults to `/api-docs`.

Resources:

- `api` - a valid Swagger 1.2 API document.
- `handlers` - either a directory structure for route handlers or a premade object (see *Handlers Object* below).
- `basedir` - the default directory to search for `handlers` (defaults to caller's `basedir`).

See (Swagger File Formats)[https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#42-file-structure].

The base url for the api can also be updated via the `setUrl` function on the middleware.

Example:

```javascript
var http = require('http');
var express = require('express');
var swaggerize = require('swaggerize-express');

app = express();

var server = http.createServer(app);

var swagger = swaggerize({
    listing: require('./fixtures/api.json'),
    resources: [
        {
            api: require('./fixtures/resources/greetings.json')
        }
    ],
    docspath: '/api-docs'
});

app.use(swagger);

server.listen(port, 'localhost', function () {
    swagger.setUrl('http://' + server.address().address + ':' + server.address().port);
});
```

Also checkout the [Quick Start Guide](https://github.com/krakenjs/swaggerize-express/blob/master/QUICKSTART.md).

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

Routes as:

```
foo.js => /foo
foo/bar.js => /foo/bar
baz.js => /baz
```

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
    get: function (req, res) { ... },
    put: function (req, res) { ... },
    ...
}
```

Where each http method has a handler.

Optionally, middleware can be used by providing an array:

```javascript
module.exports = {
    get: [
        function (req, res, next) { next(); },
        function (req, res) { ... }
    ],
}
```

### Handlers Object

The directory generation will yield this object, but it can be provided directly as `options.handlers` as well:

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

Note that if you are programatically constructing a handlers obj, you must namespace *http methods* with `$` to
avoid conflicts with path names. These keys should also be *lowercase*.

Handler keys in files do *not* have to be namespaced in this way.

### Generator

You can generate stubs by running the following command:

```shell
swaggerize --api <swagger api document> [[--models <models dir>] | [--handlers <handlers dir>] | [--tests <tests dir>]]
```

Example:

`--api` is required, but only one of `--models` or `--handlers` or `--tests` is required.
