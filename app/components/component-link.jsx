/** @jsx React.DOM */
'use strict';

var React  = require('react');
var config = require('app/config');
var router = require('app/router');

module.exports = React.createClass({
    displayName: 'ComponentLink',

    getUrl: function() {
        return '/component/' + encodeURIComponent(this.props.component.name);
    },

    onClick: function(e) {
        // If trying to open a new window, fall back
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
            return;
        }

        e.preventDefault();

        var pageTitle = this.props.component.name + ' - ' + config['page-title'];
        history.pushState({}, pageTitle, e.target.href);
        router.locationChanged();

        if (window.URL && window.ga) {
            var url = new URL(e.target.href);
            window.ga('send', {
                hitType: 'pageview',
                page:  url.pathname,
                title: pageTitle
            });
        }
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <a className="component-name" href={this.getUrl()} onClick={this.onClick}>
                {this.props.children ||  this.props.component.name}
            </a>
        );
    }
});
