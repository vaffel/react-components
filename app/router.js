'use strict';

var queryParser = /(?:^|&)([^&=]*)=?([^&]*)/g;
var RoutingActions = require('app/actions/routing');
var map = {};

var Router = {
    setRoutes: function(routeMap) {
        map = routeMap;
    },

    match: function(url) {
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

        for (pattern in map) {
            params = matchPattern(pattern, path);

            if (params) {
                return {
                    route: params,
                    query: query,
                    page : map[pattern]
                };
            }
        }

        return null;
    },

    locationChanged: function() {
        RoutingActions.locationChange();
    }
};

module.exports = Router;

function matchPattern(pattern, url) {
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