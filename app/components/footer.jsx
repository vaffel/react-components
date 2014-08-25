/** @jsx React.DOM */
'use strict';

var React = require('react');

module.exports = React.createClass({
    displayName: 'Footer',

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <footer>
                Made by <a href="http://vaffel.ninja/">VaffelNinja AS</a>. <a href="https://github.com/vaffel/react-components">Open-source</a>. 
            </footer>
        );
    }
});