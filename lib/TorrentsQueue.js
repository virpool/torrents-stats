'use strict';

function TorrentsQueue(rows) {
    this.rows = rows;
    this.index = 0;
}

TorrentsQueue.prototype.shift = function () {
    if (this.index >= this.rows.length) return null;

    return this.rows[this.index++];
}

module.exports = TorrentsQueue;
