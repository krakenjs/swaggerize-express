# swaggycat

```
 __________________________
< EXPRESS GOT DAT SWAGGYCAT >
 --------------------------
      \
(_＼ヽ  \
 　 ＼＼ .Λ＿Λ.
 　　 ＼(　ˇωˇ)
 　　　 >　⌒ヽ
 　　　/ 　 へ＼
 　　 /　　/　＼＼
 　　 ﾚ　ノ　　 ヽ_つ
 　　/　/
 　 /　/|
 　(　(ヽ
 　|　|、＼
 　| 丿 ＼ ⌒)
 　| |　　) /
 `ノ ) 　 Lﾉ
 (_／
```

`swaggycat` is a "spec first" approach to building RESTful services with a [Swagger spec](https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md) 
and Express.

### Usage

```javascript
var swaggycat = require('swaggycat');

app.use(swaggycat({
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