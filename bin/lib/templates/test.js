'use strict';

var test = require('tape'),
    path = require('path'),
    express = require('express'),
    swaggerize = require('swaggerize-express'),
    request = require('supertest');

test('api', function (t) {
    var app = express();
    
    <%_.forEach(operations, function (operation) { if (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put') { %>
    app.use(require('body-parser')());<%}});%>

    app.use(swaggerize({
        api: require('<%=apiPath%>'),
        handlers: path.join(__dirname, '<%=handlers%>')
    }));

    <%_.forEach(operations, function (operation) {%>
    t.test('test <%=operation.method%> <%=operation.path%>', function (t) {
        <%
        var path = operation.path;
        var body;
        if (operation.parameters && operation.parameters.length) {
            _.forEach(operation.parameters, function (param) {
                if (param.in === 'path') {
                    path = operation.path.replace(/{([^}]*)}*/, function (p1, p2) {
                        switch (param.type) {
                            case 'integer':
                            case 'float':
                            case 'long':
                            case 'double':
                            case 'byte':
                                return 1;
                            case 'string':
                                return 'test';
                            case 'boolean':
                                return true;
                            default:
                                return '{' + p2 + '}';
                        }
                    });
                }
                if (param.in === 'body') {
                    body = models[param.schema.$ref.slice(param.schema.$ref.lastIndexOf('/') + 1)];
                }
            });
        }%>t.plan(2);
        <%if (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put'){%>
        var body = {<%_.forEach(Object.keys(body), function (k, i) {%>
            '<%=k%>': <%=JSON.stringify(body[k])%><%if (i < Object.keys(body).length - 1) {%>, <%}%><%})%>
        };
        <%}%>

        request(app).<%=operation.method.toLowerCase()%>('<%=resourcePath%><%=path%>')
        .expect(200)<%if (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put'){%>.send(body)<%}%>
        .end(function (err, res) {
            t.ok(!err, '<%=operation.method.toLowerCase()%> <%=operation.path%> no error.');
            t.strictEqual(res.statusCode, 200, '<%=operation.method.toLowerCase()%> <%=operation.path%> 200 status.');
        });
    });
    <%});%>

});