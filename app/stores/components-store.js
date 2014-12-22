'use strict';

var _ = require('lodash');
var moment = require('moment');
var Reflux = require('reflux');
var db = require('app/database');
var winston = require('winston');

var sharedMethods = require('app/stores/component-store.shared');

var ComponentStore = Reflux.createStore(_.merge({}, sharedMethods, {
    components: {},
    componentSummaries: [],
    lastUpdated: Date.now(),

    get: function(name) {
        return this.components[name];
    },

    getLastUpdated: function() {
        return this.lastUpdated;
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

    populateFromDatabase: function() {
        var addComponent = this.addComponent.bind(this);

        db.getModules(function(err, modules) {
            if (err || !modules || !modules.length) {
                return winston.error(
                    'Failed to fetch modules from DB: ' + 
                    (err || 'No modules returned') 
                );
            }

            modules.forEach(addComponent);

            this.trigger('change');
            this.lastUpdated = Date.now();
        }.bind(this));
    },

    parseAuthor: function(component) {
        var distTags = component['dist-tags'] || {},
            latest   = component.versions[distTags.latest] || {};

        return (latest._npmUser || component.author).name;
    },

    parseComponentSummary: function(component) {
        return {
            name: component.name,
            description: component.description,
            author: this.parseAuthor(component),
            modified: moment.utc(component.time.modified),
            created: moment.utc(component.time.created),
            keywords: component.keywords.filter(this.isUncommonKeyword),
            downloads: component.downloads || 0,
            stars: component.starCount
        };
    },

    parseComponent: function(component) {
        var distTags = component['dist-tags'] || {},
            versions = component.versions || {},
            latest   = versions[distTags.latest] || {};

        if (!component.time) {
            component.created  = '1980-01-01T00:00:00.000Z';
            component.modified = '1980-01-01T00:00:00.000Z';

            winston.warn(
                'Component with name "' + component.name + '" has no time settings'
            );
        } else {
            component.created  = component.time.created;
            component.modified = component.time.modified;
        }

        component.branch   = latest.gitHead || 'master';

        return component;
    },

    addComponent: function(component) {
        if (!component) {
            return;
        }

        this.components[component.name] = this.parseComponent(component);

        var existing = _.find(this.componentSummaries, { name: component.name });
        _.pull(this.componentSummaries, existing);

        this.componentSummaries.push(this.parseComponentSummary(component));
    }
}));

module.exports = ComponentStore;