'use strict';

var config = require('app/config');
var npmApi = require('app/npm-api');

var components = {},
    componentSummaries = {};

var ComponentStore = {
    init: function() {
        ComponentStore.startPolling();
    },

    startPolling: function() {
        if (!Object.keys(components).length) {
            this.fetchComponentsFromApi();
        }

        ComponentStore.pollId = setInterval(
            this.fetchComponentsFromApi,
            config['poll-interval']
        );
    },

    stopPolling: function() {
        clearInterval(ComponentStore.pollId);
    },

    fetchComponentsFromApi: function() {
        npmApi.getModulesForKeyword(
            config['npm-keyword'],
            ComponentStore.onComponentsFetched
        );
    },

    onComponentsFetched: function(err, components) {
        if (err) {
            // @todo Log error properly
            return console.error(err);
        }

        components.map(ComponentStore.addComponent);
    },

    addComponent: function(component) {
        delete component.versions;
        components[component.name] = component;
        
        componentSummaries[component.name] = {
            name: component.name,
            description: component.description,
            author: (component.author || {}).name,
            modified: component.time.modified,
            keywords: component.keywords.filter(isUncommonKeyword)
        };
    },

    getComponent: function(name) {
        return components[name];
    },

    getAllComponents: function() {
        return components;
    },

    getComponentSummaries: function() {
        return componentSummaries;
    }
};

module.exports = ComponentStore;

function isUncommonKeyword(keyword) {
    return config['exclude-keywords'].indexOf(keyword) === -1;
}