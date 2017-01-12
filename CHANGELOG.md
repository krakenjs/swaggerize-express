### 5.0.0

* Use `swaggerize-routes^2`
    - Use [swagger-parser](https://github.com/BigstickCarpet/swagger-parser) to validate the Swagger spec.
    - The api is dereferenced (both remote and local $ref are dereferenced) using [swagger-parser](https://github.com/BigstickCarpet/swagger-parser) #40
    - Use [JSON schema validator](https://github.com/mafintosh/is-my-json-valid) as the default validator. #30.
    - Option to set `joischema` to `true` to use [Joi](https://github.com/hapijs/joi) schema validator. Uses [enjoi](https://github.com/tlivings/enjoi) - The json to joi schema converter - to build the validator functions.

* Start the server (or `listen` to port) only on `route` event emitted by the app. Route builder is an async api, now capable of parsing and validating remote $ref in swagger spec, so the app/server need to wait for the `route` event before processing requests.

* es6 changes

### 4.0.0

* Support for `swaggerize-routes` security.
* New `app.swagger` property.
* `app.api` is now accessed as `app.swagger.api`.
* `app.setHost` is removed (simply set `app.swagger.api.host`).

### 3.0.0

* Swagger 2.0 compatible.
* Generator has been removed. See the yeoman generator `generator-swaggerize` instead.
* `docspath` defaults to `/api-docs`.
* `setUrl` is now `setHost` and is used to set `host` and `port` in the `api`.
* `app._api` is `app.api`.
* `api` and `setHost` are now on the `parent`, not the middleware.

See `v1.0.0`, `v2.0.0` branches for addition changelogs.
