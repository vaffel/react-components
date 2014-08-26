/** @jsx React.DOM */
'use strict';

var React  = require('react');
var Layout = require('app/components/layout.jsx');
var Loader = require('app/components/loader.jsx');
var ResultsTable = require('app/components/results-table.jsx');
var searchIndex = require('app/search/index');

module.exports = React.createClass({
    displayName: 'SearchPage',

    getInitialState: function() {
        return {
            isReady: searchIndex.isAvailable() 
        };
    },

    setReadyState: function() {
        this.setState({ isReady: true });
    },

    componentDidMount: function() {
        if (!this.state.isReady) {
            searchIndex.on('components-available', this.setReadyState);
        }
    },

    getSearchResults: function() {
        return searchIndex.filter(this.props.route.query);
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <Layout className="search" query={this.props.route.query}>
                { this.state.isReady ? 
                    <ResultsTable results={this.getSearchResults()} /> :
                    <Loader />
                }
            </Layout>
        );
    }
});