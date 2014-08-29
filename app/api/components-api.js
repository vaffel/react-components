'use strict';

var _  = require('lodash');
var Reflux = require('reflux');
var ApiActions = require('app/actions/api');
var request = require('xhr');
var isFetching = false;

var ComponentsApi = {
    fetchComponents: function() {
        isFetching = true;

        request({ url: '/api/components', json: true }, function(err, xhr, body) {
            if (err) {
                return ApiActions.fetchFailed(err);
            }

            var assignKey  = _.partial(_.zipObject, body.keys),
                components = _.map(body.items, assignKey);

            isFetching = false;
            ApiActions.componentsFetched(components);
        });
    },

    listen: function() {
        ApiActions.fetchComponents.shouldEmit = function() {
            return !isFetching;
        };

        ApiActions.fetchComponents.listen(ComponentsApi.fetchComponents);
    }
};

module.exports = ComponentsApi;