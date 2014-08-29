/** @jsx React.DOM */
'use strict';

var React  = require('react');
var Layout = require('app/components/layout.jsx');
var ResultsTable = require('app/components/results-table.jsx');
var ComponentStore = require('app/stores/components-store');
var SearchFilter = require('app/search/filter');

module.exports = React.createClass({
    displayName: 'SearchPage',

    getSearchResults: function() {
        return SearchFilter.filter(this.props.route.query);
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        return (
            this.props.route.query !== nextProps.route.query 
        );
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <Layout className="search" query={this.props.route.query}>
                <ResultsTable results={this.getSearchResults()} />
            </Layout>
        );
    }
});