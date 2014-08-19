#!/usr/bin/env node
'use strict';

var minimist = require('minimist'),
    swaggerize = require('swaggerize-express/bin/lib/swaggerize');

var result = swaggerize(process.argv);

process.exit(result);
