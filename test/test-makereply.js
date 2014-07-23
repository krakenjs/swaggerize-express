'use strict';

var test = require('tape'),
    makereply = require('../lib/makereply');

test('makereply', function (t) {

    t.test('make', function (t) {
        t.plan(5);

        var res = {
            send: function () {
                t.pass('called send.');
            },
            redirect: function () {
                t.pass('called redirect.');
            }
        };
        var next = function () {
            t.pass('called next.');
        };

        var reply = makereply(res, next, []);

        t.ok(reply, 'reply made');

        reply.skip();
        reply.error();
        reply.redirect();
        reply();
    });

});
