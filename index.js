'use strict';

// Prepare configuration
var nconf = require('nconf');
nconf.argv()
    .env()
    .file({file: './config.hjson', format: require('hjson').rt});

// Initialize logger with specified configuration
global.logger = require('./lib/logger');

var Pool            = require('./lib/pool'),
    Worker          = require('./lib/Worker'),
    TorrentsQueue   = require('./lib/TorrentsQueue'),
    torrentsService = require('./lib/torrentsService');

logger.info('Starting up application');

nextIteration(); // start it

function nextIteration() {
    logger.debug('nextIteration');

    var workersCount = Number(nconf.get('app:workers')),
        workersBusyCount = workersCount,
        workers = [],
        startTime = Date.now();

    var pool = Pool.create(workersCount,
                        nconf.get('database:host'),
                        nconf.get('database:name'),
                        nconf.get('database:user'),
                        nconf.get('database:password'));

    torrentsService.fetchAll(pool, function (err, torrents) {
        if (err) {
            logger.error(err);
            process.exit(1);
        }

        var torrentsQueue = new TorrentsQueue(torrents);
        for (var i = 0, worker; i < workersCount; ++i) {
            worker = new Worker(i, pool, torrentsQueue, torrentsService);
            worker.start(workerOnDoneCallback);
            workers.push(worker);
        }
    });

    function workerOnDoneCallback() {
        workersBusyCount -= 1;
        if (workersBusyCount == 0) {
            next(); // that's all
        }
    }

    function next() {
        logger.debug('All workers are done');

        torrentsService.flushBuffer(pool, function () {
            pool.end(function (err) {
                if (err) logger.error(err);
                workers = pool = null;

                logger.debug('Iteration time:', Math.floor((Date.now() - startTime) / 1000), 'seconds');

                var sleepTime = Number(nconf.get('app:sleepTime'));
                if (sleepTime > 0) {
                    return setTimeout(nextIteration, sleepTime * 1000 * 60);
                }
                process.nextTick(nextIteration);
            });
        });
    }
}
