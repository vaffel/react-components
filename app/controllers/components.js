'use strict';

var _ = require('lodash');
var ComponentsStore = require('app/stores/components-store');

module.exports = {
  
    componentsList: function(request, reply) {
        var summaries = ComponentsStore.getComponentSummaries();
        var response = {
            keys: _.keys(summaries[0] || {}),
            items: _.map(summaries, _.values)
        };

        reply(response);
    },

    componentInfo: function(request, reply) {
        var component = ComponentsStore.getComponent(request.params.component);
        if (!component) {
            return reply('Component not found').code(404);
        }

        reply(component)
            .header('Last-Modified: ' + component.time.modified);
    }

};