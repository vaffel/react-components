/** @jsx React.DOM */
'use strict';

var React = require('react');

module.exports = React.createClass({
    displayName: 'Container',

    /* jshint trailing:false, quotmark:false, newcap:false */
    render: function() {
        return this.transferPropsTo(
            <div className="container">{this.props.children}</div>
        );
    }
});