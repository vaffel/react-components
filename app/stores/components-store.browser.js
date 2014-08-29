'use strict';

var _ = require('lodash');
var moment = require('moment');
var Reflux = require('reflux');
var ApiActions = require('app/actions/api');

var ComponentStore = Reflux.createStore({
    init: function() {
        this.components = {};
        this.componentSummaries = [];

        this.listenTo(ApiActions.componentsFetched, this.populate);
    },

    get: function(name) {
        return this.components[name];
    },

    getAll: function() {
        return this.components;
    },

    getSummaries: function() {
        return this.componentSummaries;
    },

    getMostRecentlyCreated: function(limit) {
        return (
            _.sortBy(this.components, 'created')
            .reverse()
            .slice(0, limit || 10)
        );
    },

    getMostRecentlyUpdated: function(limit) {
        var mostRecent  = this.getMostRecentlyCreated();
        var lastUpdated = _.sortBy(this.components, 'modified').reverse();

        return _.without.apply(null, [lastUpdated].concat(mostRecent)).slice(0, limit || 10);
    },

    populate: function(components) {
        components.map(this.addComponent.bind(this));
        this.trigger('change');
    },

    parseComponent: function(component) {
        component.modified = moment(component.modified);
        component.created  = moment(component.created);

        return component;
    },

    addComponent: function(component) {
        component = this.parseComponent(component);
        
        this.components[component.name] = component;
        this.componentSummaries.push(component);
    }
});

module.exports = ComponentStore;