'use strict';

exports.fetchAll = function (pool, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            logger.error(err);
            process.exit(1);
        }
        connection.query('SELECT * from `the_torrents`', function (err, rows, fields) {
            connection.release();
            cb(err, rows);
        });
    });
}

exports.update = function (pool, torrent, stats, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            logger.error(err);
            process.exit(1);
        }
        connection.query('UPDATE `the_torrents` SET t_peers = ?, t_seeds = ? WHERE t_id = ?',
            [stats.peers, stats.seeds, torrent.t_id],
            function (err, result) {
                if (err) logger.error(err);

                connection.release();
                cb(err);
            });
    });
}
