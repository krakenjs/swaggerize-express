const async = require('async');
const thing = require('core-util-is');
const utils = require('swaggerize-routes/lib/utils');
const pathRegexp = require('path-to-regexp');

/**
 * Makes default accessor functions for a specific data location, e.g. query, params etc
 * @param dataLoc
 * @returns {{get: get, set: set}}
 */
function defaultAccessor(dataLoc) {
  return {
    get(req, key) {
      return req[dataLoc][key];
    },
    set(req, key, val) {
      req[dataLoc][key] = val;
    },
  };
}

// eslint-disable-next-line no-unused-vars, consistent-return
function valueAccessor(param, consumes) {
  if (param.in === 'path') {
    return defaultAccessor('params');
  }
  if (param.in === 'query') {
    return defaultAccessor('query');
  }
  if (param.in === 'header') {
    return {
      get(req, key) {
        return req.header(key);
      },
      // eslint-disable-next-line no-unused-vars
      set(req, key) {
        // noop
      },
    };
  }
  if (param.in === 'body') {
    return {
      get(req) {
        return req.body;
      },
      set(req, key, val) {
        req.body = val;
      },
    };
  }
  if (param.in === 'formData') {
    return {
      get(req, key) {
        // eslint-disable-next-line no-mixed-operators
        const file = req.file || Array.isArray(req.files) && req.files[0];
        if (param.type === 'file'
                    && !thing.isNullOrUndefined(file.fieldname)
                    && file.fieldname === key) {
          if (file.buffer) {
            // when using InMemory option you get back a raw Buffer
            // convert to binary string so that validator does not fail
            // based on type.
            return file.buffer.toString('binary');
          }
          return file.path;
        }
        return req.body[key];
      },
      set(req, key, val) {
        req.body[key] = param.type === 'file' ? val.value : val;
      },
    };
  }
}

/**
 * Makes a validator function, to validate data input per the Swagger API spec.
 * @param {{}} validator
 * @returns {function}
 */
function makeValidator(validator, consumes) {
  const { parameter } = validator;
  const { validate } = validator;

  function validateInput(req, res, next) {
    const accessor = valueAccessor(parameter, consumes);
    const value = accessor.get(req, parameter.name);

    validate(value, (error, newvalue) => {
      if (error) {
        // eslint-disable-next-line no-param-reassign
        error.status = 400;
        next(error);
        return;
      }

      accessor.set(req, parameter.name, newvalue);
      next();
    });
  }

  return validateInput;
}

/**
 * Builds a complete path for route usage from the mountpath and the path
 * @param mountpath
 * @param path
 * @return complete route path
 */
function buildRoutePath(mountpath, path) {
  return mountpath + utils.prefix(path.replace(/{([^}]+)}/g, ':$1'), '/');
}

/**
 * Creates a new Express route and adds it to the router.
 * @param router
 * @param mountpath
 * @param routeSpec
 */
function makeExpressRoute(router, mountpath, route, securityDefinitions) {
  const path = buildRoutePath(mountpath, route.path);
  const args = [path];
  let before = [];

  if (route.security) {
    // eslint-disable-next-line no-use-before-define
    before.push(authorizeFor(route.security, securityDefinitions));
  }

  if (thing.isArray(route.handler)) {
    if (route.handler.length > 1) {
      Array.prototype.push.apply(before, route.handler.slice(0, route.handler.length - 1));
    }
    // eslint-disable-next-line no-param-reassign
    route.handler = route.handler[route.handler.length - 1];
  }

  const validators = [];

  for (let i = 0; i < route.validators.length; i += 1) {
    validators.push(makeValidator(route.validators[i], route.consumes));
  }

  before = before.concat(validators);

  Array.prototype.push.apply(args, before);
  args.push(route.handler);
  // eslint-disable-next-line prefer-spread
  router[route.method].apply(router, args);
}

/**
 * Builds the middleware to manage not allowed calls that use wrong Method
 * @param methods - list of avalaible method for this request
 * @return {function}
 */
function buildNotAllowedMiddleware(methods) {
  return (req, res, next) => {
    if (methods.indexOf(req.method.toLowerCase()) === -1) {
      res.set('Allow', methods.join(', ').toUpperCase());
      res.sendStatus(405).end();
    }
    next();
  };
}

/**
 * Routes handlers to express router.
 * @param router
 * @param options
 */
function expressroutes(router, options) {
  let routePath;
  const routesMethod = {};

  const routes = options.routes || [];
  // eslint-disable-next-line no-param-reassign
  options.docspath = utils.prefix(options.docspath || '/api-docs', '/');
  // eslint-disable-next-line no-param-reassign
  options.api.basePath = utils.prefix(options.api.basePath || '/', '/');
  const mountpath = utils.unsuffix(options.api.basePath, '/');

  router.get(mountpath + options.docspath, (req, res) => {
    res.json(options.api);
  });

  routes.forEach((route) => {
    makeExpressRoute(router, mountpath, route, options.api.securityDefinitions);
    routePath = buildRoutePath(mountpath, route.path);
    routesMethod[routePath] = routesMethod[routePath] || [];
    routesMethod[routePath].push(route.method.toLowerCase());
  });

  Object.keys(routesMethod).forEach((routePathItem) => {
    router.use(pathRegexp(routePathItem), buildNotAllowedMiddleware(routesMethod[routePathItem]));
  });
}

function authorizeFor(security, securityDefinitions) {
  return function authorize(req, res, next) {
    const errors = [];
    let securityDefinition;

    function passed(type, pass) {
      if (thing.isFunction(security[type].authorize)) {
        if (securityDefinitions) {
          securityDefinition = securityDefinitions[type];
        }

        req.requiredScopes = security[type].scopes;

        security[type].authorize.call(securityDefinition, req, res, (error) => {
          if (error) {
            errors.push(error);
            pass(false);
            return;
          }
          pass(true);
        });

        return;
      }

      errors.push(new Error('Unauthorized.'));
      pass(false);
    }

    function done(success) {
      if (!success) {
        res.statusCode = 401;
        next(errors.shift());
        return;
      }
      next();
    }

    async.some(Object.keys(security), passed, done);
  };
}

module.exports = expressroutes;
