'use strict';

var queryParser = /(?:^|&)([^&=]*)=?([^&]*)/g;
var util = require('util');
var EventEmitter  = require('events').EventEmitter;

function Router() {
    EventEmitter.call(this);
}

util.inherits(Router, EventEmitter);

Router.prototype.setRoutes = function(map) {
    this.map = map;
};

Router.prototype.match = function(url) {
    var parts = url.split('?'),
        qs    = parts[1] || '',
        path  = parts[0],
        query = {},
        pattern, params;

    qs.replace(queryParser, function ($0, $1, $2) {
        if ($1) {
            query[$1] = $2;
        }
    });

    for (pattern in this.map) {
        params = match(pattern, path);

        if (params) {
            return {
                route: params,
                query: query,
                page : this.map[pattern]
            };
        }
    }

    return null;
};

Router.prototype.locationChanged = function() {
    this.emit('location-change');
};

module.exports = new Router();

function match(pattern, url) {
    var vars = pattern.match(/(:[a-zA-Z0-9]+)/g),
        re = new RegExp('^' + pattern.replace(/(:[a-zA-Z0-9]+)/g, '(.*?)') + '$'),
        matches = url.match(re),
        params = {},
        varname;

    if (!matches) {
        return null;
    }

    for (var i = 1; i < matches.length; i++) {
        varname = vars[i - 1].substring(1);
        params[varname] = decodeURIComponent(matches[i]);
    }

    return params;
}