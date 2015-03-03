'use strict';

module.exports = function authorize(req, res, next) {
    getScopesFor(req.headers['authorize'], function (error, availablescopes) {
        if (!error) {
            for (var i = 0; i < req.requiredScopes.length; i++) {
                if (availablescopes.indexOf(req.requiredScopes[i]) > -1) {
                    next();
                    return;
                }
            }
            res.statusCode = 403;
            next(new Error('Do not have the required scopes.'));
            return;
        }
        next(error);
    });
}

function getScopesFor(auth, callback) {
    if (!auth) {
        callback(null, []);
        return;
    }

    callback(null, [
        'user'
    ]);
}
