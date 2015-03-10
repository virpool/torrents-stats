'use strict';

var TorrentClient   = require('bittorrent-tracker'),
    parseTorrent    = require('parse-torrent'),
    FastSet         = require('collections/fast-set');

var rlocal = /\.local\//i,
    rannounceUrl = /\(((udp:\/\/|tcp:\/\/|https?:\/\/).*?)\)/i,
    failedAnnounces = new FastSet();

// cleanup cache of failed announces every 1 hour
setInterval(function () {
    failedAnnounces.clear();
}, 1 * 60 * 60 * 1000);

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
        torrentStats = { peers: 0, seeds: 0 },
        announcesCountToProcess;

    var parsedTorrent = parseTorrent(torrentData);
    try {
        parsedTorrent.announce = JSON.parse(torrent.t_announce).map(function (list) { return list[0]; });
    } catch (e) {
        logger.error(e);
        return cb();
    }
    // filter all local announces like "retracker.local"
    parsedTorrent.announce = parsedTorrent.announce.filter(function (item) {
        return rlocal.test(item) === false && failedAnnounces.has(item) === false;
    });
    announcesCountToProcess = parsedTorrent.announce.length;

    var torrentClient = new TorrentClient(new Buffer('01234567890123456789'), 6881 + self.id, parsedTorrent);
    torrentClient.on('error', function (err) {
        logger.error(err);
        next();
    });
    torrentClient.on('warning', function (err) {
        // a tracker was unavailable or sent bad data to the client. you can probably ignore it
        var announceMatches = rannounceUrl.exec(err.message);
        if (announceMatches) {
            failedAnnounces.add(announceMatches[1]); // saving annouce's URL to cache
        }
        next();
    });
    torrentClient.on('scrape', function (data) {
        torrentStats.seeds += data.complete;
        torrentStats.peers += data.incomplete;
        next();
    });

    torrentClient.scrape();

    function next() {
        announcesCountToProcess -= 1;
        if (announcesCountToProcess == 0) {
            logger.debug('Update torrent:', torrent.name, 'stats:', torrentStats);
            self.torrentsService.update(self.pool, torrent, torrentStats, cb);
        }
    }
}

module.exports = Worker;
