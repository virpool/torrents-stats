'use strict';

var Client          = require('bittorrent-tracker'),
    parseTorrent    = require('parse-torrent');

var rlocal = /\.local\//i;

function Worker(id, pool, torrentsQueue, torrentsService) {
    this.id = id;
    this.pool = pool;
    this.torrentsQueue = torrentsQueue;
    this.torrentsService = torrentsService;
}

Worker.prototype.start = function (cb) {
    var self = this;

    logger.debug('Starting worker #', self.id);
    iterate();

    function iterate(err) {
        if (err) logger.error(err);

        var torrent = self.torrentsQueue.shift();
        if (torrent) {
            handleTorrent(self, torrent, iterate);
        } else {
            logger.debug('Stoping worker #', self.id);
            self = null;
            cb();
        }
    }
}

function handleTorrent(self, torrent, cb) {
    var torrentData = torrent.t_hash.length ? torrent.t_hash : torrent.t_magnet,
        announcesCountToProcess;

    var parsedTorrent = parseTorrent(torrentData);
    try {
        parsedTorrent.announce = JSON.parse(torrent.t_announce).map(function (list) { return list[0]; });
    } catch (e) {
        logger.error(e);
        return cb();
    }
    // filter all local announces like "retracker.local"
    parsedTorrent.announce = parsedTorrent.announce.filter(function (item) { return rlocal.test(item) === false; });
    announcesCountToProcess = parsedTorrent.announce.length;

    var client = new Client(new Buffer('01234567890123456789'), 6881 + self.id, parsedTorrent);
    client.on('error', function (err) {
        logger.error(err);
        next();
    });
    client.on('warning', function (err) {
        // a tracker was unavailable or sent bad data to the client. you can probably ignore it
        logger.warn(err.message);
        next();
    });
    client.on('scrape', function (data) {
        self.torrentsService.update(self.pool, torrent, data, next);
    });

    client.scrape();

    function next() {
        announcesCountToProcess -= 1;
        if (announcesCountToProcess == 0) {
            cb();
        }
    }
}

module.exports = Worker;
