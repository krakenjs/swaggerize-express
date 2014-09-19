# Quick Start Guide

This guide will let you go from an `api.json` to a service project in no time flat.

### 1.

```bash
$ mkdir helloworld && cd $_
```

### 2.

Grab the (Swagger Pet Store example)[https://github.com/wordnik/swagger-spec/blob/master/examples/v2.0/json/petstore.json].

### 3.

```bash
$ npm init
$ npm install --save express swaggerize-express
$ node_modules/.bin/swaggerize --api petstore.json --handlers handlers --models models --tests tests
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
    api: require('./petstore.json'),
    handlers: './handlers'
});

app.use(swagger);

server.listen(8000, 'localhost', function () {
    swagger.setHost(server.address().address + ':' + server.address().port);
});
```

### Done!

You now have working services and can use something like [Swagger UI](https://github.com/wordnik/swagger-ui) to explore your API.
