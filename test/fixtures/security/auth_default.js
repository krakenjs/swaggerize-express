'use strict';

module.exports = function authorize(req, res, next) {
    validate(req, function (error, availablescopes) {
        if (!error) {
            for (var i = 0; i < req.requiredScopes.length; i++) {
                if (availablescopes.indexOf(req.requiredScopes[i]) > -1) {
                    next();
                    return;
                }
            }

            error = new Error('Do not have the required scopes.');
            error.status = 403;

            next(error);
            return;
        }
        next(error);
    });
}

function validate(req, callback) {
    var auth = req.headers['authorize'];

    if (!auth) {
        callback(null, []);
        return;
    }

    callback(null, [
        'user'
    ]);
}
