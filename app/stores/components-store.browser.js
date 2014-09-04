'use strict';

var _ = require('lodash');
var moment = require('moment');
var Reflux = require('reflux');
var sharedMethods = require('app/stores/component-store.shared');
var ApiActions = require('app/actions/api');

var ComponentStore = Reflux.createStore(_.merge({}, sharedMethods, {
    init: function() {
        this.components = {};
        this.componentSummaries = [];

        this.listenTo(ApiActions.componentsFetched, this.populate);
        this.listenTo(ApiActions.componentFetched, this.addComponentInfo);
    },

    get: function(name) {
        if (this.components[name]) {
            return this.components[name];
        }

        ApiActions.fetchComponentInfo(name);
    },

    getMostRecentlyCreated: function(limit) {
        return (
            _.sortBy(this.componentSummaries, 'created')
            .reverse()
            .slice(0, limit || 10)
        );
    },

    getMostRecentlyUpdated: function(limit) {
        var mostRecent  = this.getMostRecentlyCreated();
        var lastUpdated = _.sortBy(this.componentSummaries, 'modified').reverse();

        return _.without.apply(null,
            [lastUpdated].concat(mostRecent)
        ).slice(0, limit || 10);
    },

    getMostStarred: function(limit) {
        return (
            _.sortBy(this.componentSummaries, 'stars')
            .reverse()
            .slice(0, limit || 10)
        );
    },

    populate: function(components) {
        components.map(this.addComponent);
        this.trigger('change');
    },

    parseComponent: function(component) {
        component.modified = moment.utc(component.modified);
        component.created  = moment.utc(component.created);

        return component;
    },

    addComponent: function(component) {
        component = this.parseComponent(component);

        this.componentSummaries.push(component);
    },

    addComponentInfo: function(component) {
        this.components[component.name] = component;
        this.trigger('change');
    }
}));

module.exports = _.bindAll(ComponentStore);