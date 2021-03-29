/**
 * Makes default accessor functions for a specific data location, e.g. query, params etc
 * @param dataLoc
 * @returns {{get: get, set: set}}
 */
const defaultAccessor = (dataLoc) => ({
    get: (req, key) => req[dataLoc][key],
    set: (req, key, val) => req[dataLoc][key] = val
});

const valueAccessor = param => {
    if (param.in === 'path') {
        return defaultAccessor('params');
    }
    if (param.in === 'query') {
        return defaultAccessor('query');
    }
    if (param.in === 'header') {
        return {
            get: (req, key) => req.header(key),
            set: () => {
              // noop
            }
        };
    }
    if (param.in === 'body') {
        return {
            get: (req) => req.body,
            set: (req, key, val) => req.body = val
        };
    }
    if (param.in === 'formData') {
        return {
            get: (req, key) => req.body[key],
            set: (req, key, val) => req.body[key] = param.type === 'file' ? val.value : val
        };
    }
};


/**
 * Makes a validator function, to validate data input per the Swagger API spec.
 * @param {{}} validator
 * @returns {function}
 */
const makeValidator = (validator, consumes)=> {
    var parameter, validate;

    parameter = validator.parameter;
    validate = validator.validate;

    function validateInput(req, res, next) {
        var accessor, value;

        accessor = valueAccessor(parameter, consumes);
        value = accessor.get(req, parameter.name);

        validate(value, (error, newvalue) => {
            if (error) {
                error.status = 400;
                next(error);
                return;
            }

            accessor.set(req, parameter.name, newvalue);
            next();
        });
    }

    return validateInput;
};

module.exports = makeValidator;
