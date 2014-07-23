'use strict';

module.exports = {
    get: function getBar(req, reply) {
        reply({
            id: 0,
            name: 'Swaggycat'
        });
    }
};