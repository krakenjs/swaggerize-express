'use strict';

var store = require('../../lib/store');


module.exports = {
    get: async (req, res) => {
        // pretend waiting for database
        await new Promise(res => setTimeout(res, 10));

        res.json(store.get(req.params['id']));
    },
    delete: function (req, res) {
        store.delete(req.params['id']);
        res.json(store.all());
    }
};