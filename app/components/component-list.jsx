/** @jsx React.DOM */
'use strict';

var React = require('react');
var ComponentItem = require('app/components/component-item.jsx');

module.exports = React.createClass({
    displayName: 'LatestComponents',

    propTypes: {
        components: React.PropTypes.array.isRequired,
        listName:   React.PropTypes.string.isRequired,
        className:  React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            className: 'component-list'
        };
    },

    getComponentItem: function(c) {
        return new ComponentItem({
            key: c.name,
            component: c
        });
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <section className={this.props.className}>
                <h2>{this.props.listName}</h2>

                <ul>
                    {this.props.components.map(this.getComponentItem)}
                </ul>
            </section>
        );
    }
});