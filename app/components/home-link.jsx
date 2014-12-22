/** @jsx React.DOM */
'use strict';

var React  = require('react');
var config = require('app/config');
var router = require('app/router');

module.exports = React.createClass({
    displayName: 'HomeLink',

    goHome: function(e) {
        // If trying to open a new window, fall back
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 2 || e.button === 1) {
            return;
        }

        e.preventDefault();

        var pageTitle = config['page-title'];
        history.pushState({}, pageTitle, e.currentTarget.href);
        router.locationChanged();

        if (window.URL && window.ga) {
            var url = new URL(e.currentTarget.href);
            window.ga('send', {
                hitType: 'pageview',
                page:  url.pathname,
                title: pageTitle
            });
        }
    },

    /* jshint trailing:false, quotmark:false, newcap:false */
    render: function() {
        return (
            <a onClick={this.goHome} href="/">{this.props.children}</a>
        );
    }
});