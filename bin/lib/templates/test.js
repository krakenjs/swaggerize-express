'use strict';

var express = require('express'),
    test = require('tape'),
    swaggerize = require('swaggerize-express'),
    request = require('supertest');

test('api', function (t) {
    var app = express();

    app.use(swaggerize({
        api: require('<%=apiPath%>'),
        handlers: '<%=handlers%>',
        outputvalidation: true
    }));

    <%_.forEach(api.operations, function (operation) {%>
    t.test('test <%=operation.method%> <%=api.path%>', function (t) {
        t.plan(2);

        request(app).<%=operation.method.toLowerCase()%>('<%=api.path%>')
        .expect(200)
        .end(function (err, res) {
            t.ok(!err, '<%=operation.method.toLowerCase()%> <%=api.path%> no error.');
            t.strictEqual(res.statusCode, 200, '<%=operation.method.toLowerCase()%> <%=api.path%> 200 status.');
        });
    });
    <%});%>

});