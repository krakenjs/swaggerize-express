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
