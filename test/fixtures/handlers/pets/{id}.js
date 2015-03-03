'use strict';

var store = require('../../lib/store');


module.exports = {
    get: function (req, res) {
        res.json(store.get(req.params['id']));
    },
    delete: function (req, res) {
        store.delete(req.params['id']);
        res.json(store.all());
    }
};