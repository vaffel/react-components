'use strict';

var _ = require('lodash');
var moment = require('moment');
var ComponentsStore = require('app/stores/components-store');
var dateFormat = 'ddd, DD MMM YYYY HH:mm:ss [GMT]'; // "Sun, 31 Aug 2014 12:32:57 GMT"

module.exports = {
  
    componentsList: function(request, reply) {
        var summaries = ComponentsStore.getSummaries();
        var response = {
            keys: _.keys(summaries[0] || {}),
            items: _.map(summaries, _.values)
        };

        reply(response)
            .header('Last-Modified', new Date(ComponentsStore.getLastUpdated()).toGMTString());
    },

    componentInfo: function(request, reply) {
        var component = ComponentsStore.get(request.params.component);
        if (!component) {
            return reply('Component not found').code(404);
        }

        reply(_.omit(component, 'versions'))
            .header('Last-Modified', moment.utc(component.time.modified).format(dateFormat))
            .header('Cache-Control', 's-max-age=600, must-revalidate, public');
    }

};