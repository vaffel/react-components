/** @jsx React.DOM */
'use strict';

var React = require('react');
var SearchResult = require('app/components/results-item.jsx');
var NoResult = require('app/components/no-result.jsx');

module.exports = React.createClass({
    displayName: 'SearchResultsTable',

    getSearchResults: function() {
        return this.props.results.map(SearchResult);
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <table className="pure-table pure-table-horizontal results-table">
                <thead>
                    <tr>
                        <th className="name"><a href="#">Name</a></th>
                        <th className="author"><a href="#">Author</a></th>
                        <th className="stars"><a href="#">Stars</a></th>
                        <th className="updated"><a href="#">Updated</a></th>
                    </tr>
                </thead>
                <tbody>
                    { this.props.results.length ?
                        this.getSearchResults() : 
                        <NoResult />
                    }
                </tbody>
            </table>
        );
    }
});