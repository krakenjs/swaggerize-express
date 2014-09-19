'use strict';

var store = require('../../lib/store');


module.exports = {
    get: function (req, res) {
        res.json(store.get(req.param('id')));
    },
    delete: function (req, res) {
        store.delete(req.param('id'));
        res.json(store.all());
    }
};