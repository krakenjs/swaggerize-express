'use strict';

var store = require('../lib/store');

module.exports = {
    get: function (req, res) {
        res.json(store.all());
    },
    post: function (req, res) {
        res.json(store.get(store.put(req.body)));
    }
};
