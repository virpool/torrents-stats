'use strict';

var nconf   = require('nconf'),
    bunyan  = require('bunyan'),
    fs      = require('fs'),
    path    = require('path');

var options = {
    name: require(path.join(process.cwd(), 'package.json')).name
};

var logDir = nconf.get('logger:dir');
if (logDir.charAt(0) != '/') {
    logDir = path.join(process.cwd(), logDir);
}
if (fs.existsSync(logDir) === false) {
     try {
        fs.mkdirSync(logDir);
    } catch (e) {
        console.error('✗ Error with configuration: can not create log directory -', e);
        process.exit(1);
    }
}
options.streams = [
    {
        type:   'rotating-file',
        path:   path.join(logDir, options.name + '.log'),
        period: '1d',
        count:  10
    }
];
var logger = bunyan.createLogger(options);
logger.level(nconf.get('logger:level') || 'info');

process.on('SIGUSR2', function () {
    logger.reopenFileStreams();
});

module.exports = logger;
