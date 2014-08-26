#!/usr/bin/env node
'use strict';

var swaggerize = require('swaggerize-express/bin/lib/swaggerize');

var result = swaggerize(process.argv);

process.exit(result);
