'use strict';

var _ = require('lodash');
var config = require('app/config');

module.exports = {

    getSummary: function(name) {
        return _.find(this.componentSummaries, { name: name });
    },

    getAll: function() {
        return this.components;
    },

    getSummaries: function() {
        return this.componentSummaries;
    },

    isUncommonKeyword: function(keyword) {
        return config['exclude-keywords'].indexOf(keyword) === -1;
    }

};