#!/usr/bin/env node
'use strict';

var minimist = require('minimist'),
    swaggerize = require('swaggerize-express/bin/lib/swaggerize');


process.exit(swaggerize(process.argv));
