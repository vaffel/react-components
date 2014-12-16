'use strict';

var _ = require('lodash');
var moment = require('moment');
var Reflux = require('reflux');
var level  = require('level');
var config = require('app/config');
var sublevel = require('level-sublevel');
var db = sublevel(level(config.leveldb.location, {
    valueEncoding: 'json'
}));

var componentDb = db.sublevel('components');
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
        componentDb.createReadStream()
            .on('data', function(row) {
                this.addComponent(row.value);
            }.bind(this))
            .on('end', function() {
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
            latest   = component.versions[distTags.latest] || {};

        component.created  = component.time.created;
        component.modified = component.time.modified;
        component.branch   = latest.gitHead || 'master';

        return component;
    },

    addComponent: function(component) {
        this.components[component.name] = this.parseComponent(component);

        var existing = _.find(this.componentSummaries, { name: component.name });
        _.pull(this.componentSummaries, existing);

        this.componentSummaries.push(this.parseComponentSummary(component));
    }
}));

module.exports = ComponentStore;