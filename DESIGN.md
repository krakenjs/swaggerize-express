# Design Notes

### Building Routes

Builds routes by joining the api specification to handlers in a directory structure similar to `enrouten`, specified by `options.handlers`.

The intermediate `routes` object created per `api` definition has the following properties:

- `name` - the `nickname` from the spec.
- `path` - the route path.
- `method` - the HTTP method.
- `validators` - an object consisting of arrays of `input` and `output` validation stacks.
- `handler` - the `express` style route handler.

### Route Handler

The `route.handler` is wrapped around the exported `handler` in the `options.handlers` directory.

This `handler` has the function signature of `function (req, reply)`.

### Reply Object

The `reply` argument of the `handler` function is wrapped around the express `response` and `next` function.

This is necessary in facilitating output validation.

This function also has the following properties:

- `_raw` - the raw `response` object.
- `skip()` - acts as `next()`.
- `error(e)` - acts as `next(e)`.