# Quick Start Guide

This guide will let you go from an `api.json` to a service project in no time flat.

### 1.

```bash
$ mkdir helloworld && cd $_
```

### 2.

```bash
$ vim api.json
```

Paste the following:

```json
{
    "swaggerVersion": "1.2",
    "apiVersion": "1.0.0",
    "apis": [
        {
            "path": "/greetings",
            "description": "greetings operations"
        }
    ]
}
```

Next:

```bash
$ vim greetings.json
```

Paste the following:

```json
{
    "swaggerVersion": "1.2",
    "apiVersion": "1.0.0",
    "basePath": "http://localhost:8000/",
    "resourcePath": "/greetings",
    "apis": [
        {
            "path": "/hello/{name}",
            "operations": [
                {
                    "method": "GET",
                    "type": "string",
                    "nickname": "greetHello",
                    "parameters": [
                        {
                            "name": "name",
                            "required": true,
                            "type": "string",
                            "paramType": "path"
                        }
                    ]
                }
            ]
        }
    ]
}
```

### 3.

```bash
$ npm init
$ npm install --save express swaggerize-express
$ node_modules/.bin/swaggerize --api greetings.json --handlers handlers --models models --tests tests
```

### 4.

```bash
$ vim index.js
```

Paste the following:

```javascript
var http = require('http');
var express = require('express');
var swaggerize = require('swaggerize-express');

app = express();

var server = http.createServer(app);

var swagger = swaggerize({
    meta: require('./api.json'),
    resources: [
        {
            api: require('./greetings.json')
        }
    ]
});

app.use(swagger);

server.listen(8000, 'localhost', function () {
    swagger.setUrl('http://' + server.address().address + ':' + server.address().port);
});
```

### Done!

You now have working services and can use something like [Swagger UI](https://github.com/wordnik/swagger-ui) to explore your API.
