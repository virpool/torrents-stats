'use strict';

var TorrentClient   = require('bittorrent-tracker'),
    parseTorrent    = require('parse-torrent'),
    FastSet         = require('collections/fast-set'),
    nconf           = require('nconf');

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
    var torrentStats = { peers: 0, seeds: 0, id: torrent.t_id },
        announcesCountToProcess,
        handledAnnounces = {};

    var parsedTorrent = parseTorrent(torrent.t_hash);
    try {
        parsedTorrent.announce = JSON.parse(torrent.t_announce).map(function (list) { return list[0]; });
    } catch (e) {
        parsedTorrent.announce = [];
    }
    // filter all local announces like "retracker.local"
    parsedTorrent.announce = parsedTorrent.announce.filter(function (item) {
        return rlocal.test(item) === false && failedAnnounces.has(item) === false;
    });
    if (parsedTorrent.announce.length == 0) {
        parsedTorrent.announce = [nconf.get('app:defaultAnnounce')];
    }
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
        } else {
            logger.warn(err.message);
        }
        next();
    });
    torrentClient.on('update', function (data) {
        if (handledAnnounces[data.announce]) return;
        handledAnnounces[data.announce] = true;

        torrentStats.seeds += data.complete;
        torrentStats.peers += data.incomplete;
        next();
    });

    torrentClient.update();

    function next() {
        announcesCountToProcess -= 1;
        if (announcesCountToProcess == 0) {
            logger.debug('Update torrent:', torrent.hash, 'stats:', torrentStats);
            self.torrentsService.update(self.pool, torrentStats, cb);
        }
    }
}

module.exports = Worker;
