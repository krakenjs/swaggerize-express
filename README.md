# swaggerize-express

`swaggerize-express` is a "spec first" approach to building RESTful services with a [Swagger spec](https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md)
and Express.

`swaggerize-express` generates express routes with input and output model validation.

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

Each provides javascript file should follow the format of:

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
        'get': function (req, reply) { ... },
        'bar': {
            'get': function (req, reply) { ... },
            'post': function (req, reply) { ... }
        }
    }
    ...
}
```

### Handler Signature

The arguments passed to a handler function are:

- `req` - the `request` object.
- `repy` - an abstraction of the `res.send` in express with some additional behavior.

### Reply Function

The `reply` function is provided to allow for model validation and error handling. In addition to acting as a `res.send` method,
it also provides the following shortcut properties:

- `_raw` - the raw `response` object.
- `skip()` - acts as `next()`.
- `redirect(url)` - acts as `response.redirect`.
- `error(e)` - acts as `next(e)`.
