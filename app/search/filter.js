'use strict';

var lunr = require('lunr');

function SearchFilter(components) {
    this.components = components || [];
    this.index = null;
}

SearchFilter.prototype.setComponents = function(components) {
    this.index = lunr(function() {
        this.field('name', { boost: 10 });
        this.field('keywords', { boost: 5 });
        this.field('description');
    });

    this.components = components;
    components.map(this.indexComponent.bind(this));
};

SearchFilter.prototype.indexComponent = function(mod, id) {
    this.index.add({
        id: id,
        name: mod.name,
        keywords: mod.keywords.join(' '),
        description: mod.description
    });
};

SearchFilter.prototype.filter = function(query) {
    if (!this.index) {
        throw new Error('No components indexed! Can\'t filter yet.');
    }

    var components = this.components;
    return this.index.search(query).map(function(match) {
        return components[match.ref];
    });
};

module.exports = SearchFilter;