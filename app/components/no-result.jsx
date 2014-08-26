/** @jsx React.DOM */
'use strict';

var React = require('react');

module.exports = React.createClass({
    displayName: 'NoResult',

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <tr>
                <td colSpan="4" className="no-result">
                    Your search did not return any results, unfortunately.
                </td>
            </tr>
        );
    }
});