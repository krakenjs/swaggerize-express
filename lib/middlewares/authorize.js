const Thing = require('core-util-is');
const Async = require('async');

const authorizeFor = (security, securityDefinitions) => (req, res, next) => {
    let errors = [];
    let securityDefinition;

    const passed = (type, pass) => {
        if (Thing.isFunction(security[type].authorize)) {
            if (securityDefinitions) {
                securityDefinition = securityDefinitions[type];
            }
            req.requiredScopes = security[type].scopes;
            security[type].authorize.call(securityDefinition, req, res, function (error) {
                if (error) {
                    errors.push(error);
                    pass(false);
                    return;
                }
                pass(true);
            });
            return;
        }
        errors.push(new Error('Unauthorized.'));
        pass(false);
    };

    const done = (success) => {
        if (!success) {
            res.statusCode = 401;
            next(errors.shift());
            return;
        }
        next();
    };

    Async.some(Object.keys(security), passed, done);

};

module.exports = authorizeFor;
