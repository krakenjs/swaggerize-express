'use strict';

var tv4 = require('tv4'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path');

var schemaPath, baseSchemaPath, baseSchema, subSchemas, modelSchema;

schemaPath = path.join(__dirname, 'swagger-spec/schemas/v1.2');
baseSchemaPath = path.join(schemaPath, 'apiDeclaration.json');
modelSchema = require(path.join(schemaPath, 'modelsObject'));

assert.ok(fs.existsSync(schemaPath));
assert.ok(fs.existsSync(baseSchemaPath));

baseSchema = require(baseSchemaPath);

subSchemas = fs.readdirSync(schemaPath);

subSchemas.forEach(function (file) {
    var subSchema;

    subSchema = require(path.join(schemaPath, file));

    tv4.addSchema(subSchema);
});

exports = module.exports = {
    /**
     * Validate the api definition.
     * @param api
     * @returns {*}
     */
    validate: function (api) {
        var results;

        results = tv4.validateResult(api, baseSchema);

        return results;
    },

    /**
     * Validate a model against a model schema.
     * @param model
     * @param schema
     * @returns {*}
     */
    validateModel: function (model, schema) {
        var results;

        results = tv4.validateResult(model, schema, true);

        return results;
    }
};
