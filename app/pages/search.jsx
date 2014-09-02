/** @jsx React.DOM */
'use strict';

var _ = require('lodash');
var React  = require('react');
var Layout = require('app/components/layout.jsx');
var ResultsTable = require('app/components/results-table.jsx');
var SearchFilter = require('app/search/filter');

module.exports = React.createClass({
    displayName: 'SearchPage',

    getInitialState: function() {
        return {
            sortBy: 'score',
            sortOrder: 'asc'
        };
    },

    getSearchResults: function() {
        var results = SearchFilter.filter(this.props.route.query),
            sorted  = _.sortBy(results, this.state.sortBy);

        return this.state.sortOrder === 'desc' ? sorted : sorted.reverse();
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        return (
            this.props.route.query !== nextProps.route.query ||
            this.state.sortBy      !== nextState.sortBy      ||
            this.state.sortOrder   !== nextState.sortOrder
        );
    },

    onSortClicked: function(sortBy) {
        var state = { sortBy: sortBy };
        if (sortBy === this.state.sortBy) {
            state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
        }

        this.setState(state);
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <Layout className="search" query={this.props.route.query}>
                <ResultsTable onSortClicked={this.onSortClicked} results={this.getSearchResults()} />
            </Layout>
        );
    }
});