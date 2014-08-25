/** @jsx React.DOM */
'use strict';

var React = require('react');

module.exports = React.createClass({
    displayName: 'Loader',

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <div className="loader">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
            </div>
        );
    }
});