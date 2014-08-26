'use strict';

var _ = require('lodash');
var util = require('util');
var xhr  = require('xhr');
var moment = require('moment');
var isBrowser = typeof window !== 'undefined';
var EventEmitter = require('events').EventEmitter;
var SearchFilter = require('app/search/filter');

function SearchIndex() {
    EventEmitter.call(this);

    _.bindAll(this);
    this.components = null;
    this.searchFilter = new SearchFilter();
    this.fetchComponents();
}

util.inherits(SearchIndex, EventEmitter);

SearchIndex.prototype.isAvailable = function() {
    return !!this.components;
};

SearchIndex.prototype.fetchComponents = function() {
    if (!isBrowser) {
        return;
    }

    xhr({
        url: '/api/components',
        json: true
    }, this.onComponentsFetched);
};

SearchIndex.prototype.parseComponent = function(component) {
    component.key = component.name;
    component.modified = moment(component.modified);

    return component;
};

SearchIndex.prototype.onComponentsFetched = function(err, res, body) {
    if (err) {
        return console.warn('Error fetching components: ', err);
    }

    var assignKey = _.partial(_.zipObject, body.keys);
    this.components = _.map(body.items, assignKey).map(this.parseComponent);
    this.searchFilter.setComponents(this.components);

    this.emit('components-available');
};

SearchIndex.prototype.filter = function(query) {
    return this.searchFilter.filter(query);
};

module.exports = new SearchIndex();