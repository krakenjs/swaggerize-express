### 2.0.0

* Enable multiple resources and a resource listing document (under `options.listing`) as per Swagger specification.
* `options.docspath` defaults to `/api-docs`
* __BREAKING CHANGE__: `options.api` and `options.handlers` should now be located under an array `options.resources`.
* __BREAKING CHANGE__: `app._api` property returns an object containing `listing` and `resources`.

See: (Swagger File Structure)[https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#42-file-structure].

### 1.0.0

* Fixed issue where generator failed with deeper `path`.
* Improved tests generation.
* __BREAKING CHANGE__: `options.docs` is `options.docspath` and defaults to `/`.
* Better schema validation error output.
* Fixed issue related to [#18](https://github.com/krakenjs/swaggerize-express/issues/18) and [expressjs/body-parser#44](https://github.com/expressjs/body-parser/issues/44).
