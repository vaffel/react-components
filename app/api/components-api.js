'use strict';

var _  = require('lodash');
var ApiActions = require('app/actions/api');
var request = require('xhr');
var isFetchingList = false;

var ComponentsApi = {
    fetchComponents: function() {
        isFetchingList = true;

        request({ url: '/api/components', json: true }, function(err, xhr, body) {
            if (err) {
                return ApiActions.fetchFailed(err);
            }

            var assignKey  = _.partial(_.zipObject, body.keys),
                components = _.map(body.items, assignKey);

            isFetchingList = false;
            ApiActions.componentsFetched(components);
        });
    },

    fetchComponentInfo: function(name) {
        request({ url: '/api/components/' + encodeURIComponent(name), json: true }, function(err, xhr, body) {
            if (err) {
                return ApiActions.fetchComponentFailed(err);
            }

            ApiActions.componentFetched(body);
        });
    },

    listen: function() {
        ApiActions.fetchComponents.shouldEmit = function() {
            return !isFetchingList;
        };

        ApiActions.fetchComponents.listen(ComponentsApi.fetchComponents);
        ApiActions.fetchComponentInfo.listen(ComponentsApi.fetchComponentInfo);
    }
};

module.exports = ComponentsApi;