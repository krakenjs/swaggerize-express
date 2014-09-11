'use strict';

var store = [];

module.exports = {
    put: function (data) {
        store.push(data);
        return store.length - 1;
    },
    get: function (id) {
        return store[id];
    },
    delete: function (id) {
        store.splice(id, 1);
    },
    all: function () {
        return store;
    }
};
