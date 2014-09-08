### 1.0.0-rc.5

* Enable multiple resources and a resource listing document (under `options.meta`) as per Swagger specification.
* __BREAKING CHANGE__: `options.api` and `options.handlers` should now be located under an array `options.resources`.
* __BREAKING CHANGE__: `app._api` property removed.

See: (Swagger File Structure)[https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#42-file-structure].

### 1.0.0-rc.4

* Fixed issue related to [#18](https://github.com/krakenjs/swaggerize-express/issues/18) and [expressjs/body-parser#44](https://github.com/expressjs/body-parser/issues/44).

### 1.0.0-rc.3

* Fixed issue where generator failed with deeper `path`.

### 1.0.0-rc.2

* Improved tests generation.

### 1.0.0-rc.1

* __BREAKING CHANGE__: `options.docs` is `options.docspath` and defaults to `/`.

### 0.1.0-alpha.6

* __BREAKING CHANGE__: Reverted to standard express handlers.
* Removed output validation.
* Middleware capability.

### 0.1.0-alpha.5

* Better tests generator.
* Bug fixes.

### 0.1.0-alpha.4

* Only one of `--handlers` or `--models` is necessary in generator, not both.
* Generator now has a `--tests` switch for generating tests.
* Output validation is opt-in via `outputValidation: true`.

### 0.1.0-alpha.3

* `resourcePath` in swagger document is base `mountpath` for routes.
* Added support for path variables in `handlers` directory names.
* Path parameters are always required if defined.
* Fixed trailing commas in handler definitions created by generator.

### 0.1.0-alpha.2

* Added generator for models and handlers stubs.
* Fixed a bug that was not allowing multiple operations under an API definition.
* Fixed bug caused by `res.send` deprecation.
