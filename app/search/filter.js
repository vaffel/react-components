'use strict';
var _ = require('lodash');
var lunr = require('lunr');
var ComponentStore = require('app/stores/components-store');
var index = getNewIndex();

function getNewIndex() {
    return lunr(function() {
        this.field('name', { boost: 10 });
        this.field('keywords', { boost: 5 });
        this.field('description');
    });
}

var SearchFilter = {
    listen: function() {
        ComponentStore.listen(this.onComponentsChanged);
    },

    onComponentsChanged: function() {
        var components = ComponentStore.getSummaries();

        // Reset search index
        index = getNewIndex();

        // Add components
        components.map(this.indexComponent);
    },

    indexComponent: function(mod, id) {
        index.add({
            id: id,
            name: mod.name,
            keywords: mod.keywords.join(' '),
            description: mod.description
        });
    },

    filter: function(query) {
        var summaries = ComponentStore.getSummaries();
        return index.search(query).map(function(match) {
            return _.merge(summaries[match.ref], match);
        });
    }
};

module.exports = _.bindAll(SearchFilter);