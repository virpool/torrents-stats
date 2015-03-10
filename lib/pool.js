'use strict';

var mysql = require('mysql');

exports.create = function (limit, host, database, user, password) {
    var pool = mysql.createPool({
        connectionLimit : limit,
        host            : host,
        database        : database,
        user            : user,
        password        : password
    });
    return pool;
}
