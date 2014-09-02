/** @jsx React.DOM */
'use strict';

var React = require('react');
var SearchResult = require('app/components/results-item.jsx');
var NoResult = require('app/components/no-result.jsx');

module.exports = React.createClass({
    displayName: 'SearchResultsTable',

    getComponentItem: function(item) {
        return new SearchResult({
            key: item.name,
            component: item
        });
    },

    getSearchResults: function() {
        return this.props.results.map(this.getComponentItem);
    },

    sortByName: function(e) {
        this.sortBy(e, 'name');
    },

    sortByAuthor: function(e) {
        this.sortBy(e, 'author');
    },

    sortByStars: function(e) {
        this.sortBy(e, 'stars');
    },

    sortByUpdated: function(e) {
        this.sortBy(e, 'modified');
    },

    sortBy: function(e, by) {
        e.preventDefault();
        this.props.onSortClicked(by);
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <table className="pure-table pure-table-horizontal results-table">
                <thead>
                    <tr>
                        <th className="name"><a href="#" tabIndex="-1" onClick={this.sortByName}>Name</a></th>
                        <th className="author"><a href="#" tabIndex="-1" onClick={this.sortByAuthor}>Author</a></th>
                        <th className="stars"><a href="#" tabIndex="-1" onClick={this.sortByStars}>Stars</a></th>
                        <th className="updated"><a href="#" tabIndex="-1" onClick={this.sortByUpdated}>Updated</a></th>
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