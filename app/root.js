/** @jsx React.DOM */
'use strict';

var _ = require('lodash');
var React = require('react/addons');
var router = require('app/router');
var isBrowser = typeof window !== 'undefined';

var App = React.createClass({
    displayName: 'App',

    propTypes: {
        path: React.PropTypes.string.isRequired
    },

    getPage: function() {
        var match = router(this.props.path);

        if (!match) {
            console.error('Could not match URL (' + this.props.path + ')');
            return null;
        }

        return new match.page(_.merge({}, this.state, {
            query: match.query || {},
            route: match.route || {},
        }));
    },

    componentDidMount: function() {
        // @todo hook up pushstate
    },

    /* jshint trailing:false, quotmark:false, newcap:false */
    render: function() {
        return this.getPage();
    }
});

if (isBrowser) {
    React.renderComponent(new App({
        path: window.location.pathname + window.location.search
    }), document.getElementById('root'));
}

module.exports = App;