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

exports.update = function (pool, torrent, data, cb) {
    console.log('got a scrape response from tracker: ' + data.announce);
    console.log('number of seeders in the swarm: ' + data.complete);
    console.log('number of leechers in the swarm: ' + data.incomplete);
    console.log('number of total downloads of this torrent: ' + data.incomplete);

    pool.getConnection(function (err, connection) {
        if (err) {
            logger.error(err);
            process.exit(1);
        }
        connection.query('UPDATE `the_torrents` SET t_peers = ?, t_seeds = ? WHERE t_id = ?',
            [data.incomplete, data.complete, torrent.t_id],
            function (err, result) {
                if (err) logger.error(err);

                connection.release();
                cb(err);
            });
    });
}
