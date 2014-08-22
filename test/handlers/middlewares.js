'use strict';

module.exports = {
    get: [
        function m1(req, res, next) {
            req.m1 = true;
            next();
        },
        function handler(req, res) {
            res.status(200).end();
        }
    ]
};
