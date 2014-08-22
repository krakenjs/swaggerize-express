### 0.1.0-alpha.6

WARNING: Breaking changes!

* Removed output validation.
* Reverted to standard express handlers.
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
