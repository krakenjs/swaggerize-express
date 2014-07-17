'use strict';

var tv4 = require('tv4'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    debuglog = require('../utils').debuglog;

var schemaPath, baseSchemaPath, baseSchema, subSchemas;

schemaPath = path.join(__dirname, 'swagger-spec/schemas/v1.2');
baseSchemaPath = path.join(schemaPath, 'apiDeclaration.json');

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
    validate: function (api) {
        var results;

        debuglog('validating api definition:');

        results = tv4.validateResult(api, baseSchema);

        results.error && debuglog('%s %s.', results.error.property, results.error.message);

        results.valid || debuglog('passed.');

        return results;
    }
};
