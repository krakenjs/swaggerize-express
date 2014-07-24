# swaggerize-express

`swaggerize-express` is a "spec first" approach to building RESTful services with a [Swagger spec](https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md)
and Express.

`swaggerize-express` provides the following features:

- Express routes binding.
- API documentation route.
- Input model validation.
- Output model validation.

`swaggerize-express` is currently `pre-release` and as a result may change without warning.

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
    handlers: './handlers'
});

app.use(swagger);

server.listen(port, 'localhost', function () {
    swagger.setUrl('http://' + server.address().address + ':' + server.address().port);
});
```

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