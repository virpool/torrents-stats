'use strict';

/*
    Approach: http://stackoverflow.com/a/17284265 (https://gist.github.com/imankulov/5849790)
    e.g. hack with UPDATE .. CASE .. WHEN is faster then INSERT ... ON DUPLICATE KEY UPDATE
*/

var BUFFER_LIMIT_TO_EXECUTE = 10;

var statsBuffer = [];

exports.fetchAll = function (pool, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            logger.error(err);
            process.exit(1);
        }
        connection.query('SELECT `t_id`, `t_hash`, `t_magnet`, `t_announce` from `the_torrents`', function (err, rows, fields) {
            connection.release();
            cb(err, rows);
        });
    });
}

exports.update = function (pool, stats, cb) {
    statsBuffer.push(stats);

    if (statsBuffer.length > BUFFER_LIMIT_TO_EXECUTE) {
        // starting it async and don't wait for response, so we can make new immediate request to next announce
        (function (statsArray) {
            process.nextTick(function () {
                doUpdates(pool, statsArray);
            });
        })(statsBuffer);

        statsBuffer = [];
    }
    cb();
}

exports.flushBuffer = function (pool, cb) {
    if (statsBuffer.length) {
        doUpdates(pool, statsBuffer, cb);
        statsBuffer = [];
    } else {
        process.nextTick(cb);
    }
}

function doUpdates(pool, statsArray, cb) {
    var query = 'UPDATE `the_torrents` SET';

    // build query part for `t_peers`
    query += ' `t_peers` = CASE t_id';
    statsArray.forEach(function (stats) {
        query +=  ' WHEN ' + stats.id + ' THEN ' + stats.peers;
    });
    query += ' ELSE `t_peers` END, ';

    // build query part for `t_seeds`
    query += ' `t_seeds` = CASE t_id';
    statsArray.forEach(function (stats) {
        query +=  ' WHEN ' + stats.id + ' THEN ' + stats.seeds;
    });
    query += ' ELSE `t_seeds` END, ';

    query += ' `date` = "' + Math.floor(Date.now() / 1000) + '" ';

    // build query part for ID's list
    query += 'WHERE `t_id` IN (' + statsArray.map(function (s) { return s.id; }).join(',') + ');';

    pool.getConnection(function (err, connection) {
        if (err) {
            logger.error(err);
            process.exit(1);
        }
        connection.query(query, function (err, result) {
            if (err) logger.error(err);

            connection.release();
            if (cb) cb(err);
        });
    });
}
