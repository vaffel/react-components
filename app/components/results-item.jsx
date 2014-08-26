/** @jsx React.DOM */
'use strict';

var React = require('react');

module.exports = React.createClass({
    displayName: 'SearchResultItem',

    getUrl: function() {
        return '/component/' + encodeURIComponent(this.props.name);
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <tr>
                <td>
                    <a className="component-name" href={this.getUrl()}>{this.props.name}</a>
                    <p className="description">{this.props.description}</p>
                </td>
                <td>{this.props.author}</td>
                <td>{this.props.stars || 0}</td>
                <td>{this.props.modified.fromNow()}</td>
            </tr>
        );
    }
});