/** @jsx React.DOM */
'use strict';

var React = require('react');

module.exports = React.createClass({
    displayName: 'ComponentLink',

    getUrl: function() {
        return '/component/' + encodeURIComponent(this.props.component.name);
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <a className="component-name" href={this.getUrl()}>
                {this.props.children ||  this.props.component.name}
            </a>
        );
    }
});