# swaggerexpress

Provide swagger API specification based route handling to your express app.

### Usage

```javascript
var swaggerexpress = require('swaggerexpress');

app.use(swaggerexpress({
    api: require('./api.json'),
    docs: '/api-docs',
    routes: './routes'
));
```

Options:

- `api` - a valid Swagger 1.2 document.
- `docs` - the path to expose api docs for swagger-ui, etc.
- `routes` - either a directory structure for route handlers or an premade object.

### Routes Directory

```
routes
  |--foo
  |    |--bar.js
  |    |--index.js
  |--baz.js
```

Matches:

- `foo/index.js : /foo`
- `foo/bar.js : /foo/bar`
- `baz.js : /baz`

Each provides javascript file should follow the format of:

```javascript
module.exports = {
    get: function (req, res) { ... },
    put: function (req, res) { ... },
    ...
}
```

Where each http method has a handler.

### Routes Object

The directory generation will yield this object, but it can be provided directly as `options.routes` as well:

```javascript
{
    'foo': {
        'index': {
            'get': function (req, res) { ...}
            ...
        },
        'bar': {
            ...
        }
    }
    ...
}
```