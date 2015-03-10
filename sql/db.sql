DROP TABLE IF EXISTS the_torrents;
CREATE TABLE IF NOT EXISTS the_torrents (
  t_id mediumint(8) NOT NULL AUTO_INCREMENT,
  news_id int(10) NOT NULL DEFAULT '0',
  `name` varchar(250) NOT NULL DEFAULT '',
  onserver varchar(250) NOT NULL DEFAULT '',
  t_trailer tinyint(1) NOT NULL DEFAULT '0',
  t_private tinyint(1) NOT NULL DEFAULT '0',
  t_resolution varchar(255) NOT NULL,
  t_hash varchar(40) NOT NULL,
  t_size_bytes int(15) NOT NULL,
  t_files text NOT NULL,
  t_peers int(7) NOT NULL,
  t_seeds int(7) NOT NULL,
  t_language varchar(255) NOT NULL,
  t_translate varchar(255) NOT NULL,
  t_announce text NOT NULL,
  t_magnet text NOT NULL,
  mov_quality varchar(255) NOT NULL,
  mov_size varchar(255) NOT NULL,
  mov_duration int(7) NOT NULL,
  author varchar(40) NOT NULL DEFAULT '',
  `date` varchar(15) NOT NULL DEFAULT '',
  dcount mediumint(8) NOT NULL DEFAULT '0',
  PRIMARY KEY (t_id),
  KEY news_id (news_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

INSERT INTO the_torrents VALUES(1, 329, 'Penguins_of_Madagascar.2014.720p.BluRay.x264-LE_24269.torrent', '2015-03/1425925843_24.torrent', 0, 0, '', 'f5b0f75fe1062262f715c040dfc7369db65cb0a7', 0, '{"Penguins of Madagascar.2014.720p.BluRay.x264-LEONARDO_[scarabey.org].mkv":3048901039}', 0, 0, '', '', '[["udp:\\/\\/bt.rutor.org:2710"],["http:\\/\\/bt.new-team.org:2710\\/000030abf8ccb5a67aeadd8c3dd26e68\\/announce"],["http:\\/\\/retracker.local\\/announce"],["udp:\\/\\/tracker.openbittorrent.com:80"],["udp:\\/\\/tracker.publicbt.com:80"],["udp:\\/\\/tracker.istole.it:80"],["udp:\\/\\/open.demonii.com:1337"]]', '', '720p', '3048901039', 0, 'vetal', '1425925751', 0);
INSERT INTO the_torrents VALUES(2, 329, 'Penguins.of.Madagascar.2014.720p.BluRay.DTS.x26_242612.torrent', '2015-03/1425926079_29.torrent', 0, 0, '', 'c055f89e097c316a9a21d356a7ad48a27355e302', 0, '{"Penguins.of.Madagascar.2014.720p.BluRay.DTS.x264.mkv":5587084387}', 0, 0, '', '', '[["udp:\\/\\/bt.rutor.org:2710"],["http:\\/\\/retracker.local\\/announce"],["udp:\\/\\/tracker.openbittorrent.com:80"],["udp:\\/\\/tracker.publicbt.com:80"],["udp:\\/\\/tracker.istole.it:80"],["udp:\\/\\/open.demonii.com:1337"]]', '', '720p', '5587084387', 0, 'vetal', '1425926007', 0);
INSERT INTO the_torrents VALUES(3, 329, 'Penguins.of.Madagascar.2014.1080p.BluRay.DTS.x2_242613.torrent', '2015-03/1425926083_30.torrent', 0, 0, '', '393c3288b28c287649f67c4186f640a184371626', 0, '{"Penguins.of.Madagascar.2014.1080p.BluRay.DTS.x264.mkv":10725950935}', 0, 0, '', '', '[["udp:\\/\\/bt.rutor.org:2710"],["http:\\/\\/retracker.local\\/announce"],["udp:\\/\\/tracker.openbittorrent.com:80"],["udp:\\/\\/tracker.publicbt.com:80"],["udp:\\/\\/tracker.istole.it:80"],["udp:\\/\\/open.demonii.com:1337"]]', '', '1080p', '10725950935', 0, 'vetal', '1425926007', 0);
INSERT INTO the_torrents VALUES(4, 473, 'interstellar.2014.d.dvdscr.1400mb..torrent', '2015-03/1425927140_31.torrent', 0, 0, '', '57d178f9aecd64c54158e96c3b79f7f787d56c05', 0, '{"Interstellar.2014.D.DVDScr.1400MB.avi":1467115520}', 0, 0, '', '', '[["http:\\/\\/freerutor.com:2710\\/announce"],["http:\\/\\/retracker.local\\/announce"],["udp:\\/\\/tracker.openbittorrent.com:80\\/announce"]]', '', 'DVDScr', '1467115520', 0, 'vetal', '1425927137', 0);
INSERT INTO the_torrents VALUES(5, 473, 'Interstellar.2014.D.DVDScr.avi_239511.torrent', '2015-03/1425927412_32.torrent', 0, 0, '', '6624210ff4da2b80d13a8c9bb9a0f8db347fd178', 0, '{"Interstellar.2014.D.DVDScr.avi":2338473984}', 0, 0, '', '', '[["udp:\\/\\/bt.rutor.org:2710"],["http:\\/\\/retracker.local\\/announce"],["udp:\\/\\/tracker.openbittorrent.com:80"],["udp:\\/\\/tracker.publicbt.com:80"],["udp:\\/\\/tracker.istole.it:80"],["udp:\\/\\/open.demonii.com:1337"]]', '', 'DVDScr', '2338473984', 0, 'vetal', '1425927319', 0);
