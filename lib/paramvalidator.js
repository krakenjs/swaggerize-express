'use strict';

/**
 * Creates validation middleware for a parameter.
 * @param parameter
 * @returns {checkParameter}
 */
function validator(parameter) {
    //var model = def.models[parameter.paramType];

    return function checkParameter(req, res, next) {
        var param = req.param(parameter.name);

        if (!param && parameter.required) {
            res.statusCode = 400;
            next(new Error('Required parameter \'' + parameter.name + '\' missing.'));
            return;
        }

        //TODO model validation
        //if (model) {
        //    validateModel(param, model);
        //}

        next();
    };
}

module.exports = validator;