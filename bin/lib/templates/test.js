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
        <%
        var path = api.path;
        var body;
        if (operation.parameters && operation.parameters.length) {
            operation.parameters.forEach(function (param) {
                if (param.paramType === 'path') {
                    path = api.path.replace(/{([^}]*)}*/, function (p1, p2) {
                        switch (param.type) {
                            case 'integer':
                            case 'float':
                            case 'long':
                            case 'double':
                            case 'byte':
                                return 1;
                            case 'string':
                                return 'helloworld';
                            case 'boolean':
                                return true;
                            default:
                                return '{' + p2 + '}';
                        }
                    });
                }
                if (param.paramType === 'body') {
                    body = models[param.type];
                }
            });
        }
        %><%if (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put'){%>var body = <%=JSON.stringify(body)%>;<%}%>
        t.plan(2);

        request(app).<%=operation.method.toLowerCase()%>('<%=path%>')
        .expect(200)<%if (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put'){%>.send(body)<%}%>
        .end(function (err, res) {
            t.ok(!err, '<%=operation.method.toLowerCase()%> <%=api.path%> no error.');
            t.strictEqual(res.statusCode, 200, '<%=operation.method.toLowerCase()%> <%=api.path%> 200 status.');
        });
    });
    <%});%>

});
