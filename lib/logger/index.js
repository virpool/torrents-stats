'use strict';

var nconf = require('nconf');

module.exports = require(nconf.get('logger:dir') ? './bunyan' : './console');
