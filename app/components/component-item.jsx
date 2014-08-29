/** @jsx React.DOM */
'use strict';

var React = require('react');
var ComponentLink = require('app/components/component-link.jsx');

module.exports = React.createClass({
    displayName: 'ComponentItem',

    propTypes: {
        component: React.PropTypes.object.isRequired
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <li>
                <ComponentLink component={this.props.component} />
            </li>
        );
    }
});