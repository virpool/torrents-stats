'use strict';

var colors = require('colors'),
    moment = require('moment');

var theme = {
    trace: 'cyan',
    info: 'green',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
};
colors.setTheme(theme);

function makeLevel(level) {
    return function () {
        console[level](
            [moment().format('YYYY-MM-DD HH:mm:ss.SSS')[level]]
                .concat(
                    Array.prototype.slice.call(arguments, 0)
                            .filter(function (e) { return e != null && e != undefined; })
                            .map(function (e) {
                                return (e.charAt ? e : (e instanceof Error ? errToString(e) : JSON.stringify(e)));
                            })
                )
                .join(' ')
        );
    }
}

function errToString(err) {
    return err + ' : ' + (err.stack || 'no stack trace');
}

var logger = {};
Object.keys(theme).forEach(function (lvl) {
    logger[lvl] = makeLevel(lvl);
});

// patch console object
console.debug = console.log;

module.exports = logger;
