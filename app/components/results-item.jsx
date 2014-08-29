/** @jsx React.DOM */
'use strict';

var React = require('react');
var ComponentLink = require('app/components/component-link.jsx');

module.exports = React.createClass({
    displayName: 'SearchResultItem',

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <tr>
                <td>
                    <ComponentLink component={this.props.component} />
                    <p className="description">{this.props.component.description}</p>
                </td>
                <td>{this.props.component.author}</td>
                <td>{this.props.component.stars || 0}</td>
                <td>{this.props.component.modified.fromNow()}</td>
            </tr>
        );
    }
});